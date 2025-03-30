
import React from 'react';
import PageHeader from '@/components/common/PageHeader';
import BottomNavigation from '@/components/common/BottomNavigation';
import { User, Mail, Phone, Book, LogOut, Edit, ChevronRight, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { userType, logout, profile } = useAuth();
  const navigate = useNavigate();
  
  // Use data directly from profile context
  const userData = {
    name: profile?.full_name || "Unknown User",
    email: profile?.email || "No email provided",
    phone: profile?.mobile || "No phone number provided",
    department: userType === 'student' ? (profile?.class_branch || "No department") : null,
    clubName: userType === 'organizer' ? (profile?.club_name || "No club") : null,
    clubRole: profile?.club_role || "No role"
  };
  
  const handleLogout = async () => {
    await logout();
    navigate('/');
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
              <h2 className="text-white text-xl font-bold">{userData.name}</h2>
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
                <p>{userData.email}</p>
              </div>
            </div>
            
            <div className="flex items-center py-3 px-4">
              <Phone size={18} className="text-gray-500 mr-3" />
              <div>
                <p className="text-xs text-gray-500">Phone Number</p>
                <p>{userData.phone}</p>
              </div>
            </div>
            
            {userType === 'student' && userData.department && (
              <div className="flex items-center py-3 px-4">
                <Book size={18} className="text-gray-500 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Department</p>
                  <p>{userData.department}</p>
                </div>
              </div>
            )}
            
            {userType === 'organizer' && userData.clubName && (
              <div className="flex items-center py-3 px-4">
                <Users size={18} className="text-gray-500 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Club</p>
                  <p>{userData.clubName}</p>
                </div>
              </div>
            )}
            
            {userType === 'organizer' && userData.clubRole && (
              <div className="flex items-center py-3 px-4">
                <Users size={18} className="text-gray-500 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Role</p>
                  <p>{userData.clubRole}</p>
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

