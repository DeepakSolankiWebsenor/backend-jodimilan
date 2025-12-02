import { Router } from 'express';
import { NotificationController } from '../controllers/notification/notification.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

// All notification routes require authentication
router.use(authenticate);

// Notification settings
router.get('/notification_status/:status?', NotificationController.notificationSetting);

// Get notifications by type and page
router.get('/notification/:type?/:page?', NotificationController.getNotifications);

export default router;
