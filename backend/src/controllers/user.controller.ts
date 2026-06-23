import { Request, Response } from 'express';
import { prisma } from '../config/database'; 
import bcrypt from 'bcryptjs';
import { io } from '../server';

// 1. Deactivate User
export const deactivateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive: false }
    });

    // 🟢 2. Broadcast that this user was deactivated so the frontend can log them out
    io.emit('userDeactivated', { userId: updatedUser.id });

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully',
      data: { id: updatedUser.id, email: updatedUser.email, isActive: updatedUser.isActive }
    });
  } catch (error) {
    console.error('Error deactivating user:', error);
    res.status(500).json({ success: false, message: 'Failed to deactivate user' });
  }
};

// 2. Update User Role
export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);
    const { roleId } = req.body;

    if (!roleId) {
      res.status(400).json({ success: false, message: 'New roleId is required' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { roleId: parseInt(roleId) },
      include: { role: true }
    });

    // 🟢 3. Broadcast that this user's role changed (e.g., Member -> Admin)
    io.emit('userRoleUpdated', { userId: updatedUser.id, role: updatedUser.role.name });

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: { id: updatedUser.id, role: updatedUser.role.name }
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ success: false, message: 'Failed to update user role' });
  }
};

// 3. Get Users List (with optional search and status filter)
export const getUsersList = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, isActive } = req.query;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { email: { contains: String(search), mode: 'insensitive' } }
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        firstLogin: true,
        createdAt: true,
        role: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users list' });
  }
};

// 4. Get User By ID
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        firstLogin: true,
        createdAt: true,
        role: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user details' });
  }
};

// 5. Create User By Admin
export const createUserByAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, roleId } = req.body;

    if (!name || !email || !roleId) {
      res.status(400).json({ success: false, message: 'Name, email, and roleId are required fields' });
      return;
    }

    // Check if email already registered
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existing) {
      res.status(409).json({ success: false, message: 'A user with this email is already registered' });
      return;
    }

    // Verify role exists
    const role = await prisma.role.findUnique({
      where: { id: parseInt(roleId) }
    });

    if (!role) {
      res.status(400).json({ success: false, message: 'Specified role ID does not exist' });
      return;
    }

    // Generate temporary password matching complexity regex
    // Complexity requirements: length >= 8, uppercase, lowercase, number, special char.
    const randAlphaNum = Math.random().toString(36).substring(2, 10);
    const tempPassword = `@Temp${randAlphaNum}123`;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        roleId: parseInt(roleId),
        firstLogin: true
      },
      include: {
        role: true
      }
    });

    // Output simulated onboarding email to backend console logs
    console.log(`
===========================================================================
[EMAIL ONBOARDING] Welcome ${name}!
---------------------------------------------------------------------------
Your task-management account has been successfully created by an Administrator.

Email Credentials:
  - Login Page: http://localhost:5173/login
  - Account Email: ${email}
  - Temporary Password: ${tempPassword}

Upon your first login, you will be required to update this password.
===========================================================================
    `);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        isActive: newUser.isActive,
        firstLogin: newUser.firstLogin,
        role: newUser.role.name,
        tempPassword: tempPassword
      }
    });
  } catch (error) {
    console.error('Error creating user by admin:', error);
    res.status(500).json({ success: false, message: 'Failed to create user' });
  }
};