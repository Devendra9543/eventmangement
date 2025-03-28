
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useEvents, Event } from './EventContext';
import { useAuth } from './AuthContext';

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

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { events } = useEvents();
  const { user } = useAuth();
  
  const unreadCount = notifications.filter(n => !n.read && (!n.userId || n.userId === user?.id)).length;

  // Generate event notifications when events are coming up
  useEffect(() => {
    if (!user) return;

    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);

    // Check for upcoming events
    events.forEach(event => {
      const eventDate = new Date(event.date);
      
      // If event is within 3 days and we don't have a notification for it
      if (eventDate > today && eventDate <= threeDaysFromNow) {
        const existingNotification = notifications.find(
          n => n.eventId === event.id && n.title.includes('Upcoming Event')
        );
        
        if (!existingNotification) {
          addNotification({
            title: 'Upcoming Event',
            message: `The event "${event.title}" is happening in ${Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))} days.`,
            userId: user.id,
            eventId: event.id
          });
        }
      }
    });
  }, [events, user]);

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
