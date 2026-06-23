import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { Role } from '@prisma/client';

export const checkRole = (allowedRoles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    
    // 1. Check if user exists 
    if (!req.user) {
      res.status(401).json({ 
        success: false, 
        message: 'Unauthorized: Please log in to access this resource' 
      });
      return;
    }

    // 2. Extract the role
    const userRole = req.user.role;

    // 3. Check if the user's role exists inside the allowedRoles array
    if (!userRole || !allowedRoles.includes(userRole)) {
      res.status(403).json({ 
        success: false, 
        message: 'Forbidden: You do not have the required permissions' 
      });
      return;
    }

    // 4. Pass control to the controller
    next();
  };
};