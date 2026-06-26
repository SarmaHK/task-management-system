import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';

import { Role } from '@prisma/client';

// Define custom request type extending Express request with user information
export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: Role;
    mustChangePassword?: boolean;
  };
}

/**
 * Middleware to authenticate user requests using JWT
 */
export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication token is missing or invalid', 401);
    }

    const token = authHeader.split(' ')[1];
    let decoded: any;

    try {
      decoded = verifyToken(token);
    } catch (err) {
      throw new AppError('Invalid or expired authentication token', 401);
    }

    if (!decoded || !decoded.userId) {
      throw new AppError('Invalid authentication token payload', 401);
    }

    // Fetch user and include their role details
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        mustChangePassword: true,
      },
    });

    if (!user) {
      throw new AppError('User belonging to this token no longer exists', 401);
    }

    if (user.status !== 'ACTIVE') {
      throw new AppError('User account is deactivated', 403);
    }

    // Attach user payload to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    };

    next();
  } catch (error) {
    next(error);
  }
};
