
import React from 'react';
import PageHeader from '@/components/common/PageHeader';
import CollegeBanner from '@/components/common/CollegeBanner';
import BottomNavigation from '@/components/common/BottomNavigation';

const OrganizerDashboard = () => {
  return (
    <div className="min-h-screen pb-16 bg-gray-50">
      <CollegeBanner />
      <PageHeader title="Organizer Dashboard" showNotifications={true} />
      
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4 text-collegeBlue-900">Welcome, Organizer!</h2>
        
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
              <button className="text-white bg-collegeBlue-500 px-4 py-2 rounded-md text-sm hover:bg-collegeBlue-600 transition-colors">
                Create New Event
              </button>
              <button className="text-collegeBlue-500 bg-collegeBlue-50 px-4 py-2 rounded-md text-sm hover:bg-collegeBlue-100 transition-colors">
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
