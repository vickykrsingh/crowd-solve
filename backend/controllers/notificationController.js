import Notification from '../models/Notification.js';
import { successResponse, errorResponse } from '../utils/response.js';

// Get user's notifications
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const showUnreadOnly = req.query.unread === 'true';

    const filter = {
      recipient: userId,
      isActive: true
    };

    if (showUnreadOnly) {
      filter.isRead = false;
    }

    const notifications = await Notification.find(filter)
      .populate('sender', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalNotifications = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
      isActive: true
    });

    successResponse(res, {
      notifications,
      unreadCount,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalNotifications / limit),
        totalNotifications,
        hasNext: page < Math.ceil(totalNotifications / limit),
        hasPrev: page > 1
      }
    }, 'Notifications retrieved successfully');

  } catch (error) {
    console.error('Get notifications error:', error);
    errorResponse(res, 'Failed to retrieve notifications', 500);
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOne({
      _id: id,
      recipient: userId
    });

    if (!notification) {
      return errorResponse(res, 'Notification not found', 404);
    }

    notification.isRead = true;
    await notification.save();

    // Emit real-time update
    const io = req.app.get('socketio');
    if (io) {
      const unreadCount = await Notification.countDocuments({
        recipient: userId,
        isRead: false,
        isActive: true
      });

      io.to(`user-${userId}`).emit('notification-read', {
        notificationId: id,
        unreadCount
      });
    }

    successResponse(res, { unreadCount: notification.unreadCount }, 'Notification marked as read');

  } catch (error) {
    console.error('Mark notification as read error:', error);
    errorResponse(res, 'Failed to mark notification as read', 500);
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );

    // Emit real-time update
    const io = req.app.get('socketio');
    if (io) {
      io.to(`user-${userId}`).emit('all-notifications-read', {
        unreadCount: 0
      });
    }

    successResponse(res, { unreadCount: 0 }, 'All notifications marked as read');

  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    errorResponse(res, 'Failed to mark all notifications as read', 500);
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOne({
      _id: id,
      recipient: userId
    });

    if (!notification) {
      return errorResponse(res, 'Notification not found', 404);
    }

    notification.isActive = false;
    await notification.save();

    successResponse(res, null, 'Notification deleted successfully');

  } catch (error) {
    console.error('Delete notification error:', error);
    errorResponse(res, 'Failed to delete notification', 500);
  }
};

// Get notification stats
export const getNotificationStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Notification.aggregate([
      { $match: { recipient: userId, isActive: true } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: { $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] } },
          byType: {
            $push: {
              type: '$type',
              isRead: '$isRead'
            }
          }
        }
      }
    ]);

    const result = stats[0] || { total: 0, unread: 0, byType: [] };

    // Count by type
    const typeStats = {};
    result.byType.forEach(item => {
      if (!typeStats[item.type]) {
        typeStats[item.type] = { total: 0, unread: 0 };
      }
      typeStats[item.type].total++;
      if (!item.isRead) {
        typeStats[item.type].unread++;
      }
    });

    successResponse(res, {
      total: result.total,
      unread: result.unread,
      byType: typeStats
    }, 'Notification stats retrieved successfully');

  } catch (error) {
    console.error('Get notification stats error:', error);
    errorResponse(res, 'Failed to retrieve notification stats', 500);
  }
};