import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { prisma } from '../config/database';

export class NotificationController {
  public static async getNotifications(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json(notifications);
    } catch (error) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  public static async markAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const id = Number(req.params.id);

      const notification = await prisma.notification.findFirst({
        where: { id, userId },
      });

      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      const updated = await prisma.notification.update({
        where: { id },
        data: { isRead: true },
      });

      return res.status(200).json(updated);
    } catch (error) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  public static async markAllAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
      return res.status(200).json({ message: 'All notifications marked as read' });
    } catch (error) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}
