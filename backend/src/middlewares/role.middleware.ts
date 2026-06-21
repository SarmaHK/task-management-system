import { Response, NextFunction } from 'express';
// Importing directly from the file right next to it in the middlewares folder!
import { AuthenticatedRequest } from './auth.middleware';

export const checkRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    
    // 1. Check if user exists 
    if (!req.user) {
      res.status(401).json({ 
        success: false, 
        message: 'Unauthorized: Please log in to access this resource' 
      });
      return;
    }

    // 2. Extract the nested role name
    const userRole = req.user.role?.name;

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