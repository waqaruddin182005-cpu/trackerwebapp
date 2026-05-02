import { createContext, useState, useCallback, useContext, useEffect } from 'react';
import axios from 'axios';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async (user) => {
    if (!user) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const response = await axios.get('/api/notifications/notifications', config);
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, []);

  const fetchAlerts = useCallback(async (user) => {
    if (!user) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const response = await axios.get('/api/notifications/alerts', config);
      setAlerts(response.data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  }, []);

  const markNotificationAsRead = useCallback(async (notificationId, user) => {
    if (!user) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.patch(
        `/api/notifications/notifications/${notificationId}/read`,
        {},
        config
      );
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const markAllNotificationsAsRead = useCallback(async (user) => {
    if (!user) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.patch(
        '/api/notifications/notifications/read-all',
        {},
        config
      );
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, []);

  const markAlertAsRead = useCallback(async (alertId, user) => {
    if (!user) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.patch(
        `/api/notifications/alerts/${alertId}/read`,
        {},
        config
      );
      setAlerts(prev =>
        prev.map(a => a._id === alertId ? { ...a, isRead: true } : a)
      );
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  }, []);

  const deleteAlert = useCallback(async (alertId, user) => {
    if (!user) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`/api/notifications/alerts/${alertId}`, config);
      setAlerts(prev => prev.filter(a => a._id !== alertId));
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  }, []);

  const addNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  }, []);

  const removeNotification = useCallback((notificationId) => {
    setNotifications(prev => prev.filter(n => n._id !== notificationId));
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        alerts,
        unreadCount,
        fetchNotifications,
        fetchAlerts,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        markAlertAsRead,
        deleteAlert,
        addNotification,
        removeNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};
