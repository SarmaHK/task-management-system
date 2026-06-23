import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticateUser } from '../middlewares/auth.middleware'; // Adjust import path if needed

const router = Router();

// Apply auth middleware to all notification routes
router.use(authenticateUser);

router.get('/notifications', NotificationController.getNotifications);
router.patch('/notifications/read-all', NotificationController.markAllAsRead);
router.get('/notifications/unread-count', NotificationController.getUnreadCount);
router.patch('/notifications/:id/read', NotificationController.markAsRead);
router.delete('/notifications/:id', NotificationController.deleteNotification);

export default router;