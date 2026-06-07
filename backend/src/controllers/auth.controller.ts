import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { AppError } from '../utils/AppError';

/**
 * Controller class to handle all authentication HTTP request routing actions
 */
export class AuthController {
  /**
   * Registers a new user
   */
  public static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password, roleName } = req.body;

      const result = await AuthService.registerUser({
        name,
        email,
        password,
        roleName,
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

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
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
