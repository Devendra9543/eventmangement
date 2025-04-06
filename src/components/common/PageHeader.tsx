
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Bell } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { Badge } from '../ui/badge';

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  showNotifications?: boolean;
}

const PageHeader = ({ 
  title, 
  showBack = false,
  showNotifications = false 
}: PageHeaderProps) => {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  
  return (
    <div className="flex items-center justify-between p-4 gradient-bg text-white sticky top-0 z-10 shadow-md">
      <div className="flex items-center">
        {showBack && (
          <button 
            onClick={() => navigate(-1)}
            className="mr-3 p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
        )}
        <h1 className="font-bold text-xl">{title}</h1>
      </div>
      
      {showNotifications && (
        <button 
          onClick={() => navigate('/notifications')}
          className="p-2 relative rounded-full hover:bg-white/10 transition-colors"
        >
          <Bell size={24} />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 bg-accent px-1.5 min-w-[20px] h-5 flex items-center justify-center">
              {unreadCount}
            </Badge>
          )}
        </button>
      )}
    </div>
  );
};

export default PageHeader;
