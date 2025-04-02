
import React, { useEffect, useState } from 'react';
import PageHeader from '@/components/common/PageHeader';
import CollegeBanner from '@/components/common/CollegeBanner';
import BottomNavigation from '@/components/common/BottomNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const OrganizerDashboard = () => {
  const { profile, isAuthenticated, userType } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated and is an organizer
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (userType !== 'organizer') {
      navigate('/dashboard/student');
      return;
    }

    // Set loading to false once profile is loaded
    if (profile) {
      setIsLoading(false);
    } else {
      // Set a timeout to stop showing loading state after some time
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, navigate, profile, userType]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16 bg-gray-50">
      <CollegeBanner />
      <PageHeader title="Organizer Dashboard" showNotifications={true} />
      
      <div className="p-4">
        <div className="bg-white p-5 rounded-lg shadow mb-4">
          <h2 className="text-xl font-semibold mb-4 text-collegeBlue-900">
            Welcome, {profile?.full_name || 'Organizer'}!
          </h2>
          
          <div className="space-y-2 mb-4">
            <p className="text-gray-600"><span className="font-medium">Club:</span> {profile?.club_name || 'N/A'}</p>
            <p className="text-gray-600"><span className="font-medium">Role:</span> {profile?.club_role || 'N/A'}</p>
            <p className="text-gray-600"><span className="font-medium">Email:</span> {profile?.email || 'N/A'}</p>
            <p className="text-gray-600"><span className="font-medium">Phone:</span> {profile?.mobile || 'N/A'}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white p-5 rounded-lg shadow">
            <h3 className="font-medium text-lg mb-2">Upcoming Events</h3>
            <p className="text-gray-500">You have no upcoming events. Create a new event to get started.</p>
          </div>
          
          <div className="bg-white p-5 rounded-lg shadow">
            <h3 className="font-medium text-lg mb-2">Recent Registrations</h3>
            <p className="text-gray-500">No recent registrations to display.</p>
          </div>
          
          <div className="bg-white p-5 rounded-lg shadow">
            <h3 className="font-medium text-lg mb-2">Quick Actions</h3>
            <div className="flex flex-col gap-2 mt-3">
              <button 
                onClick={() => navigate('/create-event')}
                className="text-white bg-collegeBlue-500 px-4 py-2 rounded-md text-sm hover:bg-collegeBlue-600 transition-colors"
              >
                Create New Event
              </button>
              <button 
                onClick={() => navigate('/manage-events')}
                className="text-collegeBlue-500 bg-collegeBlue-50 px-4 py-2 rounded-md text-sm hover:bg-collegeBlue-100 transition-colors"
              >
                Manage Events
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default OrganizerDashboard;
