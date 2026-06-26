import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { Role } from '@prisma/client';

export class SearchController {
  static async globalSearch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q } = req.query;
      const query = String(q || '').trim();
      const userRole = req.user?.role;
      const userId = req.user?.id;

      if (!query || query.length < 2) {
        res.status(200).json({ success: true, data: { tasks: [], projects: [], users: [] } });
        return;
      }

      if (!userId) {
        throw new AppError('Unauthorized access', 401);
      }

      const isAdmin = userRole === Role.ADMIN;

      // 1. Search Users (Admins and PMs can search users, or all can see basic matches)
      // We allow everyone to search users so they can assign them, but we only return basic info.
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
          isEmailVerified: true
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
        take: 5
      });

      // 2. Search Projects
      const projects = await prisma.project.findMany({
        where: {
          isDeleted: false,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
          ...(isAdmin ? {} : {
            members: { some: { userId } }
          })
        },
        select: {
          id: true,
          name: true,
          status: true,
        },
        take: 5
      });

      // 3. Search Tasks
      const tasks = await prisma.task.findMany({
        where: {
          project: {
            isDeleted: false,
          },
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
          ...(isAdmin ? {} : {
            project: { members: { some: { userId } } }
          })
        },
        select: {
          id: true,
          title: true,
          status: true,
          projectId: true,
          project: { select: { name: true } }
        },
        take: 5
      });

      res.status(200).json({
        success: true,
        data: {
          tasks,
          projects,
          users
        }
      });
    } catch (error) {
      console.error('Error in Global Search:', error);
      next(new AppError('Failed to execute search', 500));
    }
  }
}
