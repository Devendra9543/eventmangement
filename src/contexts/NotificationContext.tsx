
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { PushNotifications } from '@capacitor/push-notifications';

interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  userId?: string;
  eventId?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'date' | 'read'>) => void;
  getNotificationsForUser: (userId: string) => Notification[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Helper function to check if the app is in standalone mode (PWA) or running through Capacitor
const isInStandaloneMode = () => 
  window.matchMedia('(display-mode: standalone)').matches || 
  (window.navigator as any).standalone === true || 
  window.location.href.includes('capacitor://');

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();
  
  // Load notifications from localStorage on startup
  useEffect(() => {
    const storedNotifications = localStorage.getItem('notifications');
    if (storedNotifications) {
      setNotifications(JSON.parse(storedNotifications));
    }
  }, []);
  
  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);
  
  const unreadCount = notifications.filter(n => !n.read && (!n.userId || n.userId === user?.id)).length;

  // Set up Push Notification Listeners
  useEffect(() => {
    // Only setup listeners on actual devices (not in browser)
    if (!isInStandaloneMode()) {
      return;
    }

    const setupPushListeners = async () => {
      // On registration success
      PushNotifications.addListener('registration', (token) => {
        console.log('Push registration success, token: ' + token.value);
        // Here you would typically send this token to your server
      });

      // On registration error
      PushNotifications.addListener('registrationError', (error) => {
        console.error('Error on registration: ' + JSON.stringify(error));
      });

      // On push notification received
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push notification received: ' + JSON.stringify(notification));
        // Add to our local notifications
        addNotification({
          title: notification.title || 'New Notification',
          message: notification.body || '',
          userId: user?.id
        });
      });

      // On push notification action
      PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
        console.log('Push notification action performed: ' + JSON.stringify(action));
        // Handle notification actions (e.g., navigate to a specific page)
      });
    };

    setupPushListeners();

    // Cleanup listeners when component unmounts
    return () => {
      PushNotifications.removeAllListeners();
    };
  }, [user]);

  // Listen for notifications from the EventContext
  useEffect(() => {
    const handleEventNotification = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { title, message, eventId, userId } = customEvent.detail;
      
      addNotification({
        title,
        message,
        eventId,
        userId
      });
    };
    
    // Add event listener
    document.addEventListener('event-notification', handleEventNotification);
    
    // Clean up
    return () => {
      document.removeEventListener('event-notification', handleEventNotification);
    };
  }, [user]);

  // Generate automatic notifications for events
  useEffect(() => {
    if (!user) return;

    // This will be handled by listening to the custom events from EventContext
    // We'll keep this function for any automatic notifications not tied to specific events
  }, [user]);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => 
        !notification.userId || notification.userId === user?.id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const addNotification = (notificationData: Omit<Notification, 'id' | 'date' | 'read'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Math.random().toString(36).substring(7),
      date: new Date().toISOString(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };

  const getNotificationsForUser = (userId: string): Notification[] => {
    return notifications.filter(n => !n.userId || n.userId === userId);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        addNotification,
        getNotificationsForUser
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
