import { Request, Response } from 'express';
import { prisma } from '../config/database'; 
import bcrypt from 'bcryptjs';
import { io } from '../server';
import { SystemLogger } from '../utils/logger';
import { sendEmail } from '../utils/email';
import { Role, UserStatus } from '@prisma/client';

const mapRoleIdToEnum = (roleId: any): Role => {
  const rid = parseInt(roleId);
  if (rid === 1) return Role.ADMIN;
  if (rid === 2) return Role.PROJECT_MANAGER;
  return Role.COLLABORATOR;
};

// 1. Deactivate User
export const deactivateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status: UserStatus.INACTIVE }
    });

    // Log administrative action
    await SystemLogger.log('USER_DISABLED', `User ${updatedUser.name} (${updatedUser.email}) was deactivated by Administrator`);

    // Broadcast that this user was deactivated so the frontend can log them out
    io.emit('userDeactivated', { userId: updatedUser.id });

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully',
      data: { id: updatedUser.id, email: updatedUser.email, status: updatedUser.status }
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

    const roleEnum = mapRoleIdToEnum(roleId);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: roleEnum }
    });

    // Log administrative action
    await SystemLogger.log('ROLE_CHANGED', `User ${updatedUser.name} (${updatedUser.email}) role updated to: ${updatedUser.role}`);

    // Broadcast that this user's role changed
    io.emit('userRoleUpdated', { userId: updatedUser.id, role: updatedUser.role });

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: { id: updatedUser.id, role: updatedUser.role }
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
      where.status = isActive === 'true' ? UserStatus.ACTIVE : UserStatus.INACTIVE;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        firstLogin: true,
        createdAt: true,
        role: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Format response to resemble old relational layout for frontend compatibility if necessary
    const formattedUsers = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      isActive: u.status === UserStatus.ACTIVE,
      firstLogin: u.firstLogin,
      createdAt: u.createdAt,
      role: {
        id: u.role === Role.ADMIN ? 1 : u.role === Role.PROJECT_MANAGER ? 2 : 3,
        name: u.role
      }
    }));

    res.status(200).json({
      success: true,
      data: formattedUsers
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
        status: true,
        firstLogin: true,
        createdAt: true,
        role: true
      }
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const formattedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      isActive: user.status === UserStatus.ACTIVE,
      firstLogin: user.firstLogin,
      createdAt: user.createdAt,
      role: {
        id: user.role === Role.ADMIN ? 1 : user.role === Role.PROJECT_MANAGER ? 2 : 3,
        name: user.role
      }
    };

    res.status(200).json({
      success: true,
      data: formattedUser
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

    const roleEnum = mapRoleIdToEnum(roleId);

    // Generate temporary password matching complexity regex
    const randAlphaNum = Math.random().toString(36).substring(2, 10);
    const tempPassword = `@Temp${randAlphaNum}123`;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash: hashedPassword,
        role: roleEnum,
        status: UserStatus.ACTIVE,
        firstLogin: true
      }
    });

    // Log administrative action
    await SystemLogger.log('USER_CREATED', `Direct user created by Admin: ${name} (${email.toLowerCase()}) as role: ${newUser.role}`);

    // Send physical email via Google SMTP (or log simulation fallback)
    const subject = 'Welcome to TaskFlow - Account Created!';
    const text = `Hello ${name},
 
Your account has been successfully created by the Administrator!
 
Your credentials to sign in:
- Login Page: http://localhost:5173/login
- Username/Email: ${email}
- Temporary Password: ${tempPassword}
 
Note: On your first login, you will be required to reset this password.
 
Best regards,
TaskFlow Team`;

    const html = `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #4f46e5;">Welcome to TaskFlow!</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>Your account has been successfully created by the Administrator.</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <p style="margin: 0 0 8px 0;"><strong>Your Login Credentials:</strong></p>
        <p style="margin: 0 0 5px 0;">🔑 <strong>Email:</strong> ${email}</p>
        <p style="margin: 0;">🔑 <strong>Temporary Password:</strong> <code style="background-color: #e5e7eb; padding: 2px 6px; border-radius: 4px; font-weight: bold; color: #4f46e5;">${tempPassword}</code></p>
      </div>
      <p>👉 <a href="http://localhost:5173/login" style="background-color: #4f46e5; color: white; padding: 10px 15px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Log In to TaskFlow</a></p>
      <p style="color: #6b7280; font-size: 13px; margin-top: 15px;">Note: You will be required to change your temporary password immediately upon your first login.</p>
      <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
      <p style="font-size: 12px; color: #9ca3af;">This is an automated system notification.</p>
    </div>`;

    await sendEmail({
      to: email.toLowerCase(),
      subject,
      text,
      html
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        isActive: newUser.status === UserStatus.ACTIVE,
        firstLogin: newUser.firstLogin,
        role: newUser.role,
        tempPassword: tempPassword
      }
    });
  } catch (error) {
    console.error('Error creating user by admin:', error);
    res.status(500).json({ success: false, message: 'Failed to create user' });
  }
};