
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEvents } from '@/contexts/EventContext';
import { Event } from '@/contexts/EventContext';
import PageHeader from '@/components/common/PageHeader';
import CollegeBanner from '@/components/common/CollegeBanner';
import BottomNavigation from '@/components/common/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const ManageEventsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { events, loadingEvents } = useEvents();
  const [organizerEvents, setOrganizerEvents] = useState<Event[]>([]);
  
  useEffect(() => {
    if (user && events.length > 0) {
      // Filter events created by this organizer
      const filteredEvents = events.filter(event => event.organizerId === user.id);
      // Sort events by date (newest first)
      filteredEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setOrganizerEvents(filteredEvents);
    }
  }, [user, events]);
  
  const handleViewRegistrations = (eventId: string) => {
    navigate(`/manage-registrations/${eventId}`);
  };
  
  const handleEditEvent = (eventId: string) => {
    navigate(`/edit-event/${eventId}`);
  };
  
  const getEventStatus = (event: Event) => {
    const eventDate = new Date(event.date);
    const today = new Date();
    
    if (eventDate < today) {
      return 'completed';
    } else {
      return 'upcoming';
    }
  };
  
  return (
    <div className="min-h-screen pb-16 bg-gray-50">
      <CollegeBanner />
      <PageHeader title="Manage Events" showBack={true} showNotifications={true} />
      
      <div className="p-4">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-collegeBlue-900">Your Events</h2>
          <Button
            onClick={() => navigate('/create-event')}
            size="sm"
            className="bg-collegeBlue-500 hover:bg-collegeBlue-600 text-white"
          >
            + New Event
          </Button>
        </div>
        
        {loadingEvents ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-collegeBlue-500" />
          </div>
        ) : organizerEvents.length > 0 ? (
          <div className="space-y-4">
            {organizerEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-lg shadow p-4"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">{event.title}</h3>
                  <span 
                    className={`text-xs px-2 py-1 rounded ${
                      getEventStatus(event) === 'upcoming' 
                        ? 'bg-collegeBlue-100 text-collegeBlue-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {getEventStatus(event)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Date: {formatDate(event.date)}</p>
                <p className="text-sm text-gray-500">Registrations: {event.currentAttendees}/{event.maxAttendees}</p>
                <div className="mt-3 flex gap-2">
                  <Button
                    onClick={() => handleViewRegistrations(event.id)}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    View Registrations
                  </Button>
                  <Button
                    onClick={() => handleEditEvent(event.id)}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    Edit Event
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-gray-500">No events created yet</p>
            <Button
              onClick={() => navigate('/create-event')}
              className="mt-2 bg-collegeBlue-500 hover:bg-collegeBlue-600 text-white"
            >
              Create Your First Event
            </Button>
          </div>
        )}
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default ManageEventsPage;
