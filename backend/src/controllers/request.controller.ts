import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { sendEmail } from '../utils/email';
import { SystemLogger } from '../utils/logger';
import bcrypt from 'bcryptjs';
import { Role, UserStatus } from '@prisma/client';

const mapRoleIdToEnum = (roleId: any): Role => {
  const rid = parseInt(roleId);
  if (rid === 1) return Role.ADMIN;
  if (rid === 2) return Role.PROJECT_MANAGER;
  return Role.COLLABORATOR;
};

/**
 * GET /api/admin/requests
 * Lists all access requests.
 */
export const getRegistrationRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const requests = await prisma.registrationRequest.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/requests/:id/approve
 * Approves a request, creates a new user, and emails credentials via Google SMTP.
 */
export const approveRegistrationRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const requestId = parseInt(req.params.id);
    const { roleId } = req.body;

    if (isNaN(requestId)) {
      throw new AppError('Invalid request ID', 400);
    }

    if (!roleId) {
      throw new AppError('Role ID is required for approval', 400);
    }

    // 1. Fetch the request
    const request = await prisma.registrationRequest.findUnique({
      where: { id: requestId }
    });

    if (!request) {
      throw new AppError('Access request not found', 404);
    }

    if (request.status !== 'PENDING') {
      throw new AppError(`Cannot approve a request with status: ${request.status}`, 400);
    }

    const roleEnum = mapRoleIdToEnum(roleId);

    // 2. Check duplicate user email in database
    const existingUser = await prisma.user.findUnique({
      where: { email: request.email }
    });

    if (existingUser) {
      throw new AppError('A user with this email address is already registered in the system', 409);
    }

    // 3. Generate temporary password matching complexity rules
    const randAlphaNum = Math.random().toString(36).substring(2, 10);
    const tempPassword = `@Temp${randAlphaNum}123`;

    // 4. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    // 5. Perform DB updates in transaction
    const newUser = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name: request.name,
          email: request.email,
          passwordHash: hashedPassword,
          role: roleEnum,
          status: UserStatus.ACTIVE,
          firstLogin: true,
        }
      });

      // Update request status
      await tx.registrationRequest.update({
        where: { id: requestId },
        data: { status: 'APPROVED' }
      });

      return user;
    });

    // 6. Log system activity
    await SystemLogger.log('USER_CREATED', `Access request for ${request.name} (${request.email}) approved as role: ${newUser.role}`);

    // 7. Send onboarding email via SMTP
    const subject = 'Welcome to TaskFlow - Account Approved!';
    const text = `Hello ${request.name},
 
Your request to join TaskFlow has been approved by the Administrator!
 
Your temporary credentials to sign in:
- Login Page: http://localhost:5173/login
- Username/Email: ${request.email}
- Temporary Password: ${tempPassword}
 
Note: On your first login, you will be required to reset this password.
 
Best regards,
TaskFlow Team`;

    const html = `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #4f46e5;">Welcome to TaskFlow!</h2>
      <p>Hello <strong>${request.name}</strong>,</p>
      <p>Your request to join the TaskFlow system has been approved by the Administrator.</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <p style="margin: 0 0 8px 0;"><strong>Your Temporary Credentials:</strong></p>
        <p style="margin: 0 0 5px 0;">🔑 <strong>Email:</strong> ${request.email}</p>
        <p style="margin: 0;">🔑 <strong>Temporary Password:</strong> <code style="background-color: #e5e7eb; padding: 2px 6px; border-radius: 4px; font-weight: bold; color: #4f46e5;">${tempPassword}</code></p>
      </div>
      <p>👉 <a href="http://localhost:5173/login" style="background-color: #4f46e5; color: white; padding: 10px 15px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Log In to TaskFlow</a></p>
      <p style="color: #6b7280; font-size: 13px; margin-top: 15px;">Note: You will be required to change your temporary password immediately upon your first login before you can access the dashboard.</p>
      <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
      <p style="font-size: 12px; color: #9ca3af;">This is an automated system notification.</p>
    </div>`;

    await sendEmail({
      to: request.email,
      subject,
      text,
      html
    });

    res.status(200).json({
      success: true,
      message: 'Access request approved and user created successfully.',
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        tempPassword
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/requests/:id/reject
 * Rejects a request and emails notification via Google SMTP.
 */
export const rejectRegistrationRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const requestId = parseInt(req.params.id);

    if (isNaN(requestId)) {
      throw new AppError('Invalid request ID', 400);
    }

    // 1. Fetch the request
    const request = await prisma.registrationRequest.findUnique({
      where: { id: requestId }
    });

    if (!request) {
      throw new AppError('Access request not found', 404);
    }

    if (request.status !== 'PENDING') {
      throw new AppError(`Cannot reject a request with status: ${request.status}`, 400);
    }

    // 2. Update status to REJECTED
    await prisma.registrationRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED' }
    });

    // 3. Log system activity
    await SystemLogger.log('USER_DISABLED', `Access request for ${request.name} (${request.email}) was rejected`);

    // 4. Send rejection email via SMTP
    const subject = 'TaskFlow Access Request Update';
    const text = `Hello ${request.name},
 
Thank you for your interest in TaskFlow.
 
We regret to inform you that your request for access to the TaskFlow workspace has been declined by the system administrator.
 
If you believe this was an error, please reach out to the administrator directly.
 
Best regards,
TaskFlow Administration`;

    const html = `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #dc2626;">TaskFlow Access Request Update</h2>
      <p>Hello <strong>${request.name}</strong>,</p>
      <p>Thank you for your interest in TaskFlow.</p>
      <p>We regret to inform you that your request for access to the TaskFlow workspace has been declined by the system administrator.</p>
      <p>If you believe this is an error, please contact the administrator directly.</p>
      <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
      <p style="font-size: 12px; color: #9ca3af;">This is an automated system notification.</p>
    </div>`;

    await sendEmail({
      to: request.email,
      subject,
      text,
      html
    });

    res.status(200).json({
      success: true,
      message: 'Access request rejected successfully.'
    });
  } catch (error) {
    next(error);
  }
};
