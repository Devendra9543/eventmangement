
import React, { useEffect } from 'react';
import PageHeader from '@/components/common/PageHeader';
import BottomNavigation from '@/components/common/BottomNavigation';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Calendar, Clock, Info } from 'lucide-react';

const NotificationsPage = () => {
  const { notifications, markAsRead, getNotificationsForUser } = useNotifications();
  const { user } = useAuth();
  
  // Get user-specific notifications
  const userNotifications = user ? getNotificationsForUser(user.id) : [];
  
  // Mark notifications as read when viewed
  useEffect(() => {
    if (userNotifications.length > 0) {
      userNotifications.forEach(notification => {
        if (!notification.read) {
          markAsRead(notification.id);
        }
      });
    }
  }, [userNotifications]);
  
  const getIcon = (title: string) => {
    if (title.includes('Event') || title.includes('event')) {
      return <Calendar size={20} className="text-collegePurple-500" />;
    } else if (title.includes('Reminder') || title.includes('reminder') || title.includes('Deadline')) {
      return <Clock size={20} className="text-collegeBlue-500" />;
    } else if (title.includes('Registration') || title.includes('registration')) {
      return <Info size={20} className="text-collegeTeal-500" />;
    } else {
      return <Bell size={20} className="text-gray-500" />;
    }
  };
  
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };
  
  return (
    <div className="min-h-screen pb-16 bg-gray-50">
      <PageHeader title="Notifications" showBack={true} />
      
      <div className="p-4">
        {userNotifications.length > 0 ? (
          <div className="space-y-3">
            {userNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`bg-white p-4 rounded-lg shadow flex gap-3 ${notification.read ? '' : 'border-l-4 border-collegeBlue-500'}`}
              >
                <div className="mt-1">
                  {getIcon(notification.title)}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{notification.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                  <p className="text-gray-400 text-xs mt-2">{getTimeAgo(notification.date)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Bell size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No notifications yet</p>
          </div>
        )}
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default NotificationsPage;
