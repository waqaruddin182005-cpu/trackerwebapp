const express = require('express');
const router = express.Router();
const {
  getAlerts,
  getNotifications,
  markAlertAsRead,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteAlert,
  getUnreadCount
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/alerts', protect, getAlerts);
router.get('/notifications', protect, getNotifications);
router.get('/unread-count', protect, getUnreadCount);

router.patch('/alerts/:alertId/read', protect, markAlertAsRead);
router.delete('/alerts/:alertId', protect, deleteAlert);

router.patch('/notifications/:notificationId/read', protect, markNotificationAsRead);
router.patch('/notifications/read-all', protect, markAllNotificationsAsRead);

module.exports = router;
