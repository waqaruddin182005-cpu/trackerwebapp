import { useContext, useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { NotificationContext } from '../context/NotificationContext';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDate } from '../utils/helpers';

export const NotificationBell = () => {
  const { user } = useContext(AuthContext);
  const { notifications, unreadCount, fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead } = useContext(NotificationContext);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications(user);
      // Refresh notifications every 30 seconds
      const interval = setInterval(() => fetchNotifications(user), 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkAsRead = (notificationId) => {
    markNotificationAsRead(notificationId, user);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      default:
        return 'ℹ';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg relative transition-colors"
        title="Notifications"
      >
        <Bell className="h-6 w-6 text-slate-700 dark:text-slate-300" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-xl z-50 border border-slate-200 dark:border-slate-700"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllNotificationsAsRead(user)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications && notifications.length > 0 ? (
                <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                  {notifications.slice(0, 10).map((notification) => (
                    <motion.li
                      key={notification._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors ${
                        notification.isRead ? 'opacity-60' : ''
                      }`}
                      onClick={() => handleMarkAsRead(notification._id)}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`text-lg mt-0.5 ${getTypeColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 dark:text-white truncate">
                            {notification.title}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                            {notification.message}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                            {formatDate(notification.createdAt, 'time')}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <div className="h-2 w-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-slate-500 dark:text-slate-400">No notifications yet</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications && notifications.length > 0 && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-700 text-center">
                <a
                  href="/notifications"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  View all notifications
                </a>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
