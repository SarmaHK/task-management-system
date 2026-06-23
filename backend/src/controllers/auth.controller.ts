import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { AppError } from '../utils/AppError';
import { prisma } from '../config/database';
import { SystemLogger } from '../utils/logger';

/**
 * Controller class to handle all authentication HTTP request routing actions
 */
export class AuthController {
  /**
   * Registers a new user access request
   */
  public static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email } = req.body;

      if (!name || !name.trim() || !email || !email.trim()) {
        throw new AppError('Name and email are required fields', 400);
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new AppError('Please enter a valid email address', 400);
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Check if email already registered as a user
      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existingUser) {
        throw new AppError('A user with this email address already exists', 409);
      }

      // Check if access request exists
      const existingRequest = await prisma.registrationRequest.findUnique({
        where: { email: normalizedEmail },
      });

      if (existingRequest) {
        if (existingRequest.status === 'PENDING') {
          throw new AppError('Your access request is already pending review.', 400);
        } else if (existingRequest.status === 'APPROVED') {
          throw new AppError('Your access request has already been approved. Please sign in.', 400);
        } else {
          // If previously rejected, allow them to re-apply by updating status back to PENDING
          await prisma.registrationRequest.update({
            where: { email: normalizedEmail },
            data: {
              name: name.trim(),
              status: 'PENDING',
              createdAt: new Date(),
            },
          });
        }
      } else {
        // Create new request
        await prisma.registrationRequest.create({
          data: {
            name: name.trim(),
            email: normalizedEmail,
            status: 'PENDING',
          },
        });
      }

      // Log system activity
      await SystemLogger.log('REQUEST_SUBMITTED', `Access request submitted by ${name.trim()} (${normalizedEmail})`);

      res.status(201).json({
        success: true,
        message: 'Access request submitted successfully. The system administrator will review your request.',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logs in an existing user
   */
  public static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      const result = await AuthService.loginUser({
        email,
        password,
      });

      const { user, token, refreshToken } = result;

      if (refreshToken) {
        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
      }

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user,
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logs out the user by clearing the refresh token cookie
   */
  public static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
      res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieves profile details of the current logged-in user (Protected Route)
   */
  public static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUser = req.user;

      res.status(200).json({
        success: true,
        data: {
          user: currentUser,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Changes the password of an authenticated user
   */
  public static async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('Unauthorized access', 401);
      }

      await AuthService.changePassword({
        userId,
        currentPassword,
        newPassword,
      });

      res.status(200).json({
        success: true,
        message: 'Password updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Forgot password flow — generates a reset token
   */
  public static async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      const token = await AuthService.forgotPassword(email);

      res.status(200).json({
        success: true,
        message: 'Password reset instructions sent successfully',
        // In development mode, expose the token in the API response for ease of testing
        ...(process.env.NODE_ENV !== 'production' ? { devResetToken: token } : {}),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset password flow using a valid token
   */
  public static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, newPassword } = req.body;

      await AuthService.resetPassword({
        token,
        newPassword,
      });

      res.status(200).json({
        success: true,
        message: 'Password reset successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Completes the first login reset flow
   */
  public static async firstLoginReset(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { temporaryPassword, newPassword } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('Unauthorized access', 401);
      }

      await AuthService.firstLoginReset({
        userId,
        temporaryPassword,
        newPassword,
      });

      res.status(200).json({
        success: true,
        message: 'Password setup completed successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Silent session token refresh handler
   */
  public static async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cookieHeader = req.headers.cookie;
      let token: string | undefined;

      if (cookieHeader) {
        const cookies = cookieHeader.split(';').map(c => c.trim());
        const target = cookies.find(c => c.startsWith('refreshToken='));
        if (target) {
          token = target.split('=')[1];
        }
      }

      if (!token) {
        throw new AppError('Refresh token is missing or invalid', 401);
      }

      const accessToken = await AuthService.refreshSession(token);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          token: accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
