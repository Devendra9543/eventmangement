
import React from 'react';
import PageHeader from '@/components/common/PageHeader';
import BottomNavigation from '@/components/common/BottomNavigation';
import { User, Mail, Phone, Book, LogOut, Edit, ChevronRight, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const ProfilePage = () => {
  const { userType, logout, profile } = useAuth();
  
  // Use data from profile context instead of mock data
  const user = {
    name: profile?.full_name || (userType === 'student' ? 'John Doe' : 'Club Admin'),
    email: profile?.email || 'user@example.com',
    phone: profile?.mobile || '+91 9876543210',
    department: userType === 'student' ? (profile?.class_branch || 'Computer Science') : null,
    clubName: userType === 'organizer' ? (profile?.club_name || 'Unknown Club') : null,
    clubRole: profile?.club_role || null
  };
  
  const handleLogout = () => {
    logout();
    // Navigate to the home page or login page
    window.location.href = '/';
  };
  
  return (
    <div className="min-h-screen pb-16 bg-gray-50">
      <PageHeader title="Profile" showBack={true} />
      
      <div className="p-4">
        <div className="bg-white rounded-lg shadow overflow-hidden mb-4">
          <div className="bg-collegeBlue-500 p-6 flex items-center">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
                <User size={40} className="text-collegeBlue-500" />
              </div>
            </div>
            <div className="ml-4">
              <h2 className="text-white text-xl font-bold">{user.name}</h2>
              <p className="text-collegeBlue-100">{userType === 'student' ? 'Student' : 'Organizer'}</p>
            </div>
            <button className="ml-auto bg-white/20 p-2 rounded-full">
              <Edit size={16} className="text-white" />
            </button>
          </div>
          
          <div className="divide-y divide-gray-100">
            <div className="flex items-center py-3 px-4">
              <Mail size={18} className="text-gray-500 mr-3" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p>{user.email}</p>
              </div>
            </div>
            
            <div className="flex items-center py-3 px-4">
              <Phone size={18} className="text-gray-500 mr-3" />
              <div>
                <p className="text-xs text-gray-500">Phone Number</p>
                <p>{user.phone}</p>
              </div>
            </div>
            
            {userType === 'student' && user.department && (
              <div className="flex items-center py-3 px-4">
                <Book size={18} className="text-gray-500 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Department</p>
                  <p>{user.department}</p>
                </div>
              </div>
            )}
            
            {userType === 'organizer' && user.clubName && (
              <div className="flex items-center py-3 px-4">
                <Users size={18} className="text-gray-500 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Club</p>
                  <p>{user.clubName}</p>
                </div>
              </div>
            )}
            
            {userType === 'organizer' && user.clubRole && (
              <div className="flex items-center py-3 px-4">
                <Users size={18} className="text-gray-500 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Role</p>
                  <p>{user.clubRole}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Additional settings or links */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-4">
          <div className="divide-y divide-gray-100">
            <button className="w-full flex items-center justify-between py-3 px-4 text-left">
              <span>Change Password</span>
              <ChevronRight size={18} className="text-gray-400" />
            </button>
            
            <button className="w-full flex items-center justify-between py-3 px-4 text-left">
              <span>Notification Settings</span>
              <ChevronRight size={18} className="text-gray-400" />
            </button>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="mt-4 flex items-center justify-center w-full py-3 text-red-500 bg-white rounded-lg shadow"
        >
          <LogOut size={18} className="mr-2" />
          <span>Logout</span>
        </button>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default ProfilePage;
