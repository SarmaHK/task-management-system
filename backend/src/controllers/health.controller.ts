import { Request, Response } from 'express';

export const getHealthStatus = (req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
};
