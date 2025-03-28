
import React from 'react';
import PageHeader from '@/components/common/PageHeader';
import BottomNavigation from '@/components/common/BottomNavigation';

const ManageEventsPage = () => {
  // Mock data - in a real app this would come from API
  const events = [
    {
      id: '1',
      title: 'Tech Workshop',
      date: '2023-08-15',
      status: 'upcoming'
    },
    {
      id: '2',
      title: 'Coding Competition',
      date: '2023-09-01',
      status: 'upcoming'
    }
  ];
  
  return (
    <div className="min-h-screen pb-16 bg-gray-50">
      <PageHeader title="Manage Events" showBack={true} showNotifications={true} />
      
      <div className="p-4">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-collegeBlue-900">Your Events</h2>
          <a
            href="/create-event"
            className="bg-collegeBlue-500 text-white px-3 py-1 rounded-md text-sm"
          >
            + New Event
          </a>
        </div>
        
        {events.length > 0 ? (
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-lg shadow p-4"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">{event.title}</h3>
                  <span className="text-xs bg-collegeBlue-100 text-collegeBlue-700 px-2 py-1 rounded">
                    {event.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Date: {event.date}</p>
                <div className="mt-3 flex gap-2">
                  <a
                    href={`/manage-registrations/${event.id}`}
                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                  >
                    View Registrations
                  </a>
                  <button
                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                  >
                    Edit Event
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-gray-500">No events created yet</p>
            <a
              href="/create-event"
              className="mt-2 inline-block bg-collegeBlue-500 text-white px-4 py-2 rounded-md text-sm"
            >
              Create Your First Event
            </a>
          </div>
        )}
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default ManageEventsPage;
