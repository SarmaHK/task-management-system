import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database'; 
import bcrypt from 'bcryptjs';
import { io } from '../server';
import { SystemLogger } from '../utils/logger';
import { Role, UserStatus } from '@prisma/client';
import { SocketService } from '../services/socket.service';
import { UserService } from '../services/user.service';
import { createUserSchema } from '../validators/user.validator';
import { z } from 'zod';
import { EmailService } from '../services/email.service';
import { getActivationEmailTemplate } from '../templates/emails/activation.template';
import { getDeactivationEmailTemplate } from '../templates/emails/deactivation.template';

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

    // Remove user from all projects and task assignments
    await prisma.projectMember.deleteMany({
      where: { userId: updatedUser.id }
    });
    await prisma.taskAssignment.deleteMany({
      where: { userId: updatedUser.id }
    });

    // Log administrative action
    await SystemLogger.log('USER_DISABLED', `User ${updatedUser.name} (${updatedUser.email}) was deactivated by Administrator`);

    // Broadcast that this user was deactivated so the frontend can log them out
    SocketService.broadcast('userDeactivated', { userId: updatedUser.id });

    // Disconnect active socket connections for this user immediately
    SocketService.disconnectUser(updatedUser.id);

    await SocketService.sendNotification(userId, {
      message: 'Your account has been deactivated by an administrator. You will be logged out shortly.',
      type: 'ADMIN_UPDATE',

    });

    // Send deactivation email
    await EmailService.sendEmail({
      to: updatedUser.email,
      subject: 'Account Deactivated',
      text: `Hello ${updatedUser.name},\n\nYour account has been deactivated by an Administrator. If you believe this is a mistake, please contact support.`,
      html: getDeactivationEmailTemplate(updatedUser.name)
    }).catch(err => console.error('Failed to send deactivation email:', err));

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

// 1.5 Activate User
export const activateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status: UserStatus.ACTIVE }
    });

    await SystemLogger.log('USER_ENABLED', `User ${updatedUser.name} (${updatedUser.email}) was activated by Administrator`);

    io.emit('userActivated', { userId: updatedUser.id });

    await SocketService.sendNotification(updatedUser.id, {
      type: 'ADMIN_UPDATE',
      message: 'Your account has been activated by an Administrator.'
    });

    // Send activation email
    await EmailService.sendEmail({
      to: updatedUser.email,
      subject: 'Account Activated',
      text: `Hello ${updatedUser.name},\n\nYour account has been activated by an Administrator. You can use your previous password with your email to log in.`,
      html: getActivationEmailTemplate(updatedUser.name)
    }).catch(err => console.error('Failed to send activation email:', err));

    res.status(200).json({
      success: true,
      message: 'User activated successfully',
      data: { id: updatedUser.id, email: updatedUser.email, status: updatedUser.status }
    });
  } catch (error) {
    console.error('Error activating user:', error);
    res.status(500).json({ success: false, message: 'Failed to activate user' });
  }
};

// 1.6 Delete User
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  res.status(403).json({
    success: false,
    message: 'User deletion is disabled. Users can only be deactivated.'
  });
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
    SocketService.broadcast('userRoleUpdated', { userId: updatedUser.id, role: updatedUser.role });

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
        mustChangePassword: true,
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
      mustChangePassword: u.mustChangePassword,
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
        mustChangePassword: true,
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
      mustChangePassword: user.mustChangePassword,
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
export const createUserByAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedData = createUserSchema.parse(req.body);
    const result = await UserService.createUserByAdmin(validatedData.name, validatedData.email, validatedData.roleId);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: result
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: error.issues[0].message });
      return;
    }
    next(error);
  }
};

// 6. Get Searchable Users (Accessible by PROJECT_MANAGER/ADMIN)
export const getSearchableUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, limit, offset } = req.query;

    const searchTerm = String(search || '').trim();

    // Enforce constraints: search must be at least 2 characters if search exists, else return all
    // Update: Removed >=2 char requirement. We want to return all COLLABORATORS.


    const takeVal = Math.min(parseInt(String(limit || '20'), 10), 50);
    const skipVal = Math.max(parseInt(String(offset || '0'), 10), 0);

    const users = await prisma.user.findMany({
      where: {
        status: UserStatus.ACTIVE,
        role: Role.COLLABORATOR, // Only return collaborators
        ...(searchTerm ? {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } }
          ]
        } : {})
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      },
      orderBy: { name: 'asc' },
      take: takeVal,
      skip: skipVal
    });

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching searchable users:', error);
    res.status(500).json({ success: false, message: 'Failed to search users' });
  }
};