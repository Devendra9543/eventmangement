
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvents } from '@/contexts/EventContext';
import PageHeader from '@/components/common/PageHeader';
import BottomNavigation from '@/components/common/BottomNavigation';
import FeedbackDisplay from '@/components/feedback/FeedbackDisplay';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { Event } from '@/contexts/EventContext';

const EventFeedbackPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { getEventById, getFeedbackByEvent, loadingEvents } = useEvents();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (eventId && !loadingEvents) {
      const eventData = getEventById(eventId);
      if (eventData) {
        setEvent(eventData);
      }
      setLoading(false);
    }
  }, [eventId, getEventById, loadingEvents]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-collegeBlue-500" />
      </div>
    );
  }
  
  if (!event) {
    return (
      <div className="min-h-screen pb-16 bg-gray-50">
        <PageHeader title="Event Feedback" showBack={true} />
        <div className="p-4">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-gray-500">Event not found</p>
            <Button 
              onClick={() => navigate('/manage-events')}
              variant="outline" 
              className="mt-2"
            >
              Back to Events
            </Button>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }
  
  const feedback = getFeedbackByEvent(event.id);
  
  return (
    <div className="min-h-screen pb-16 bg-gray-50">
      <PageHeader title="Event Feedback" showBack={true} />
      
      <div className="p-4">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-collegeBlue-900">{event.title}</h1>
          <p className="text-sm text-gray-500">Feedback and ratings from participants</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <FeedbackDisplay feedback={feedback} showUserInfo={true} />
        </div>
        
        <Button
          onClick={() => navigate('/manage-events')}
          variant="outline"
          className="w-full"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default EventFeedbackPage;
