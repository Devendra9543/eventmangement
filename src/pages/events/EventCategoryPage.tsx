
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import BottomNavigation from '@/components/common/BottomNavigation';
import { useEvents } from '@/contexts/EventContext';
import { Event } from '@/contexts/EventContext';
import { Loader2 } from 'lucide-react';
import EventCard from '@/components/common/EventCard';

const EventCategoryPage = () => {
  const { clubId, categoryId } = useParams();
  const { events, loadingEvents } = useEvents();
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  
  useEffect(() => {
    if (!loadingEvents && clubId && categoryId) {
      // Filter events by club and category
      const filtered = events.filter(
        event => event.club === clubId && event.category === categoryId
      );
      
      // Sort by date, most recent first
      filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setFilteredEvents(filtered);
    }
  }, [clubId, categoryId, events, loadingEvents]);
  
  if (loadingEvents) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-collegeBlue-500" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pb-16 bg-gray-50">
      <PageHeader title={categoryId || 'Events'} showBack={true} showNotifications={true} />
      
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4 text-collegeBlue-900">
          {filteredEvents.length > 0 ? 'Upcoming Events' : 'No Events Found'}
        </h2>
        
        {filteredEvents.length > 0 ? (
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <p className="text-gray-500">No events found in this category</p>
          </div>
        )}
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default EventCategoryPage;
