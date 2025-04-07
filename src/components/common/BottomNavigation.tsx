
import { Home, Calendar, User, BarChart } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userType } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  // Different navigation items for student and organizer
  const studentNavItems = [
    { name: 'Home', path: '/dashboard/student', icon: Home },
    { name: 'Profile', path: '/profile', icon: User }
  ];

  const organizerNavItems = [
    { name: 'Home', path: '/dashboard/organizer', icon: Home },
    { name: 'Events', path: '/manage-events', icon: Calendar },
    { name: 'Analytics', path: '/analytics', icon: BarChart },
    { name: 'Profile', path: '/profile', icon: User }
  ];

  const navItems = userType === 'student' ? studentNavItems : organizerNavItems;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 z-10">
      {navItems.map((item) => (
        <button
          key={item.path}
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive(item.path)
              ? 'text-collegeBlue-500'
              : 'text-gray-500'
          }`}
          onClick={() => navigate(item.path)}
        >
          <item.icon size={24} />
          <span className="text-xs mt-1">{item.name}</span>
        </button>
      ))}
    </div>
  );
};

export default BottomNavigation;
