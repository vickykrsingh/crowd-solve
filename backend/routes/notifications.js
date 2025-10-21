import express from 'express';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getNotificationStats
} from '../controllers/notificationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user's notifications
router.get('/', authenticateToken, getUserNotifications);

// Get notification stats
router.get('/stats', authenticateToken, getNotificationStats);

// Mark notification as read
router.patch('/:id/read', authenticateToken, markNotificationAsRead);

// Mark all notifications as read
router.patch('/read-all', authenticateToken, markAllNotificationsAsRead);

// Delete notification
router.delete('/:id', authenticateToken, deleteNotification);

export default router;