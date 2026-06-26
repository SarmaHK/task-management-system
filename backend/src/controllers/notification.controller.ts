import { Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export class NotificationController {
  
  // 1. View Notifications (GET /api/notifications)
  public static async getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const isRead = req.query.isRead === 'true' ? true : req.query.isRead === 'false' ? false : undefined;

      const notifications = await prisma.notification.findMany({
        where: { userId, ...(isRead !== undefined && { isRead }) },
        orderBy: { createdAt: 'desc' }
      });

      res.status(200).json({ success: true, data: notifications });
    } catch (error) {
      next(error);
    }
  }

  // 2. Mark Notification as Read (PATCH /api/notifications/:id/read)
  public static async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const notificationId = parseInt(req.params.id);

      const existing = await prisma.notification.findUnique({ where: { id: notificationId } });
      if (!existing) {
         res.status(404).json({ success: false, message: 'Notification not found' });
         return;
      }

      if (existing.userId !== req.user!.id) {
        res.status(403).json({ success: false, message: 'Access forbidden: This notification does not belong to you' });
        return;
      }

      await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true }
      });

      res.status(200).json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
      next(error);
    }
  }

  // 3. Mark All Notifications as Read (PATCH /api/notifications/read-all)
  public static async markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;

      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true }
      });

      res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
      next(error);
    }
  }

  // 4. Get Unread Count (GET /api/notifications/unread-count)
  public static async getUnreadCount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;

      const unreadCount = await prisma.notification.count({
        where: { userId, isRead: false }
      });

      res.status(200).json({ success: true, data: { unreadCount } });
    } catch (error) {
      next(error);
    }
  }

  // 5. Delete Notification (DELETE /api/notifications/:id)
  public static async deleteNotification(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const notificationId = parseInt(req.params.id);
      const existing = await prisma.notification.findUnique({ where: { id: notificationId } });
      if (!existing) {
         res.status(404).json({ success: false, message: 'Notification not found' });
         return;
      }

      if (existing.userId !== req.user!.id) {
        res.status(403).json({ success: false, message: 'Access forbidden: This notification does not belong to you' });
        return;
      }

      await prisma.notification.delete({
        where: { id: notificationId }
      });

      res.status(200).json({ success: true, message: 'Notification deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}
