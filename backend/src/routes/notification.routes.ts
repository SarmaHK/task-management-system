import { Router } from 'express';
import { authenticateUser } from '../middlewares/auth.middleware';
import { NotificationController } from '../controllers/notification.controller';

const router = Router();

router.use(authenticateUser as any);

router.get('/', NotificationController.getNotifications as any);
router.patch('/read-all', NotificationController.markAllAsRead as any);
router.get('/unread-count', NotificationController.getUnreadCount as any);
router.patch('/:id/read', NotificationController.markAsRead as any);
router.delete('/:id', NotificationController.deleteNotification as any);

export default router;
