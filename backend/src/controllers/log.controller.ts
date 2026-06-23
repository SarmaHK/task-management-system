import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';

/**
 * GET /api/admin/logs
 * Fetches the 10 most recent system logs.
 */
export const getSystemLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const logs = await prisma.systemLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/logs/stats
 * Fetches total user count, pending request count, and log count.
 */
export const getAdminStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const totalUsers = await prisma.user.count();
    const pendingRequests = await prisma.registrationRequest.count({
      where: { status: 'PENDING' }
    });
    const totalLogs = await prisma.systemLog.count();

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        pendingRequests,
        totalLogs,
      }
    });
  } catch (error) {
    next(error);
  }
};
