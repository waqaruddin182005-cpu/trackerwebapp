const Alert = require('../models/Alert');
const Notification = require('../models/Notification');
const Budget = require('../models/Budget');
const Expense = require('../models/Expense');

// Get all alerts for a user
exports.getAlerts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { unreadOnly = false } = req.query;

    let query = { user: userId };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const alerts = await Alert.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching alerts', error: error.message });
  }
};

// Get all notifications for a user
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { unreadOnly = false, limit = 20 } = req.query;

    let query = { user: userId };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const unreadCount = await Notification.countDocuments({
      user: userId,
      isRead: false
    });

    res.json({
      notifications,
      unreadCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
};

// Mark alert as read
exports.markAlertAsRead = async (req, res) => {
  try {
    const { alertId } = req.params;
    const userId = req.user.id;

    const alert = await Alert.findByIdAndUpdate(
      { _id: alertId, user: userId },
      { isRead: true },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    res.json(alert);
  } catch (error) {
    res.status(500).json({ message: 'Error updating alert', error: error.message });
  }
};

// Mark notification as read
exports.markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findByIdAndUpdate(
      { _id: notificationId, user: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Error updating notification', error: error.message });
  }
};

// Mark all notifications as read
exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notifications', error: error.message });
  }
};

// Create a notification (helper function)
exports.createNotification = async (userId, type, title, message, options = {}) => {
  try {
    const notification = new Notification({
      user: userId,
      type,
      title,
      message,
      ...options
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// Check budget and create alert if needed
exports.checkBudgetAlerts = async (userId, category, currentMonthSpending) => {
  try {
    const now = new Date();
    const budget = await Budget.findOne({
      user: userId,
      category,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      isActive: true
    });

    if (!budget) return;

    const percentageUsed = (currentMonthSpending / budget.monthlyLimit) * 100;

    // Check if alert already exists for this month
    const existingAlert = await Alert.findOne({
      user: userId,
      category,
      month: now.getMonth() + 1,
      year: now.getFullYear()
    });

    if (percentageUsed >= 100 && !existingAlert) {
      // Critical alert
      const alert = new Alert({
        user: userId,
        type: 'budget_critical',
        title: `Critical: Budget Exceeded for ${category}`,
        message: `You have exceeded your ${category} budget limit of ₹${budget.monthlyLimit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}. Current spending: ₹${currentMonthSpending.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        category,
        amount: budget.monthlyLimit
      });
      await alert.save();

      // Create notification
      await this.createNotification(
        userId,
        'error',
        `Budget Exceeded - ${category}`,
        `You have exceeded your ${category} budget limit.`
      );
    } else if (percentageUsed >= budget.alertThreshold && !existingAlert) {
      // Warning alert
      const alert = new Alert({
        user: userId,
        type: 'budget_warning',
        title: `Warning: ${category} Budget at ${percentageUsed.toFixed(0)}%`,
        message: `You have used ${percentageUsed.toFixed(0)}% of your ${category} budget. Limit: ₹${budget.monthlyLimit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}, Spent: ₹${currentMonthSpending.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        category,
        amount: budget.monthlyLimit
      });
      await alert.save();

      // Create notification
      await this.createNotification(
        userId,
        'warning',
        `Budget Warning - ${category}`,
        `You have used ${percentageUsed.toFixed(0)}% of your ${category} budget.`
      );
    }
  } catch (error) {
    console.error('Error checking budget alerts:', error);
  }
};

// Delete alert
exports.deleteAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const userId = req.user.id;

    const alert = await Alert.findByIdAndDelete({
      _id: alertId,
      user: userId
    });

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    res.json({ message: 'Alert deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting alert', error: error.message });
  }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const alertCount = await Alert.countDocuments({
      user: userId,
      isRead: false
    });

    const notificationCount = await Notification.countDocuments({
      user: userId,
      isRead: false
    });

    res.json({
      alerts: alertCount,
      notifications: notificationCount,
      total: alertCount + notificationCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Error getting unread count', error: error.message });
  }
};
