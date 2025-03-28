
import React from 'react';
import PageHeader from '@/components/common/PageHeader';
import BottomNavigation from '@/components/common/BottomNavigation';
import { Bell, Calendar, Clock, Info } from 'lucide-react';

const NotificationsPage = () => {
  // Mock data - in a real app you would fetch this from an API
  const notifications = [
    {
      id: "1",
      type: "event",
      title: "New Event: Web Development Workshop",
      message: "Register now for the Web Development Workshop happening on Dec 15.",
      time: "2 hours ago",
      read: false
    },
    {
      id: "2",
      type: "reminder",
      title: "Reminder: Hackathon Tomorrow",
      message: "Don't forget about the Hackathon starting tomorrow at 9 AM.",
      time: "1 day ago",
      read: true
    },
    {
      id: "3",
      type: "info",
      title: "Registration Confirmed",
      message: "Your registration for AI Basics Workshop has been confirmed.",
      time: "3 days ago",
      read: true
    }
  ];
  
  const getIcon = (type: string) => {
    switch(type) {
      case 'event':
        return <Calendar size={20} className="text-collegePurple-500" />;
      case 'reminder':
        return <Clock size={20} className="text-collegeBlue-500" />;
      case 'info':
        return <Info size={20} className="text-collegeTeal-500" />;
      default:
        return <Bell size={20} className="text-gray-500" />;
    }
  };
  
  return (
    <div className="min-h-screen pb-16 bg-gray-50">
      <PageHeader title="Notifications" showBack={true} />
      
      <div className="p-4">
        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`bg-white p-4 rounded-lg shadow flex gap-3 ${notification.read ? '' : 'border-l-4 border-collegeBlue-500'}`}
              >
                <div className="mt-1">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{notification.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                  <p className="text-gray-400 text-xs mt-2">{notification.time}</p>
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
