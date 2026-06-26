import { prisma } from '../config/database';
import { Role, UserStatus } from '@prisma/client';
import { PasswordService } from './password.service';
import { EmailService } from './email.service';
import { SystemLogger } from '../utils/logger';
import { AppError } from '../utils/AppError';
import { SocketService } from './socket.service';

export class UserService {
  private static mapRoleIdToEnum(roleId: any): Role {
    const rid = parseInt(roleId);
    if (rid === 1) return Role.ADMIN;
    if (rid === 2) return Role.PROJECT_MANAGER;
    return Role.COLLABORATOR;
  }

  public static async createUserByAdmin(name: string, email: string, roleId: number) {
    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already registered
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existing) {
      throw new AppError('A user with this email is already registered', 409);
    }

    const roleEnum = this.mapRoleIdToEnum(roleId);
    
    // Generate secure temporary password
    const tempPassword = PasswordService.generateTemporaryPassword();
    const hashedPassword = await PasswordService.hashPassword(tempPassword);

    // Create user in DB
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash: hashedPassword,
        role: roleEnum,
        status: UserStatus.ACTIVE,
        mustChangePassword: true,
        isEmailVerified: false
      }
    });

    // Log administrative action
    await SystemLogger.log('USER_CREATED', `Direct user created by Admin: ${name} (${normalizedEmail}) as role: ${newUser.role}`);

    // Send the onboarding email using Nodemailer Service
    // We intentionally do not await this to avoid blocking the API response if email takes a few seconds
    EmailService.sendOnboardingEmail(
      newUser.name,
      newUser.email,
      newUser.role,
      tempPassword
    ).catch(err => {
      console.error('[EMAIL ERROR] Failed to send async onboarding email:', err);
    });

    // Send a welcome notification via sockets
    SocketService.sendNotification(newUser.id, {
      type: 'ADMIN_UPDATE',
      message: 'Welcome to TaskFlow! Your account has been created successfully. Welcome aboard!'
    }).catch(err => console.error('[SOCKET ERROR] Failed to send welcome notification:', err));

    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      isActive: newUser.status === UserStatus.ACTIVE,
      mustChangePassword: newUser.mustChangePassword,
      isEmailVerified: newUser.isEmailVerified,
      role: newUser.role,
      tempPassword: tempPassword
    };
  }
}
