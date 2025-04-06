import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvents } from '@/contexts/EventContext';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/common/PageHeader';
import BottomNavigation from '@/components/common/BottomNavigation';
import { Calendar, MapPin, Clock, Users, Tag, AlertCircle, Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import FeedbackForm from '@/components/feedback/FeedbackForm';
import FeedbackDisplay from '@/components/feedback/FeedbackDisplay';

const EventDetailsPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { getEventById, registerForEvent, loadingEvents, getFeedbackByEvent, hasUserSubmittedFeedback } = useEvents();
  const { user, profile, isAuthenticated, userType } = useAuth();
  const { toast } = useToast();
  
  const [event, setEvent] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [userHasSubmittedFeedback, setUserHasSubmittedFeedback] = useState(false);

  useEffect(() => {
    if (eventId && !loadingEvents) {
      const eventData = getEventById(eventId);
      if (eventData) {
        setEvent(eventData);
      }
    }
  }, [eventId, getEventById, loadingEvents]);

  // Check if student is registered for this event
  useEffect(() => {
    if (event && user && userType === 'student') {
      // This would be a good place to check if user is already registered
      // For now, we'll use a placeholder and assume not registered
      setIsRegistered(false);
      
      // Check if user has submitted feedback for this event
      if (eventId && user.id) {
        setUserHasSubmittedFeedback(hasUserSubmittedFeedback(eventId, user.id));
      }
    }
  }, [event, user, userType, eventId, hasUserSubmittedFeedback]);

  const handleRegister = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to register for events",
      });
      navigate('/login');
      return;
    }

    if (userType !== 'student') {
      toast({
        title: "Registration Error",
        description: "Only students can register for events",
        variant: "destructive",
      });
      return;
    }

    if (!profile?.full_name) {
      toast({
        title: "Profile Incomplete",
        description: "Please complete your profile before registering",
        variant: "destructive",
      });
      navigate('/profile');
      return;
    }

    try {
      setRegistering(true);
      // Fixed registerForEvent call to match the updated method signature
      const success = await registerForEvent(event.id);

      if (success) {
        setIsRegistered(true);
        toast({
          title: "Registration Successful",
          description: `You are now registered for ${event.title}`,
        });
        
        // If the event has a price > 0, redirect to payment page
        if (event.price > 0) {
          toast({
            title: "Payment Required",
            description: `Redirecting to payment page for ₹${event.price}`,
          });
          
          // Redirect to payment page with event ID
          navigate(`/payment/${event.id}`);
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register for event",
        variant: "destructive",
      });
    } finally {
      setRegistering(false);
    }
  };

  // Function to check if event is in the past
  const isPastEvent = (eventDate: string) => {
    const today = new Date();
    const date = new Date(eventDate);
    return date < today;
  };

  const handleFeedbackSubmitted = () => {
    setShowFeedbackForm(false);
    setUserHasSubmittedFeedback(true);
    toast({
      title: "Feedback Submitted",
      description: "Thank you for your feedback!",
    });
  };

  if (loadingEvents) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-collegeBlue-500" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen pb-16 bg-gray-50">
        <PageHeader title="Event Details" showBack={true} />
        <div className="p-4">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-gray-500">Event not found</p>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  const isEventFull = event.currentAttendees >= event.maxAttendees;
  const isRegistrationClosed = event.dueDate ? new Date() > new Date(event.dueDate) : false;
  const canRegister = !isRegistered && !isEventFull && !isRegistrationClosed;
  const isEventPast = isPastEvent(event.date);
  const eventFeedback = eventId ? getFeedbackByEvent(eventId) : [];

  return (
    <div className="min-h-screen pb-16 bg-gray-50">
      <PageHeader title="Event Details" showBack={true} />
      
      <div className="p-4">
        <div className="mb-4">
          {event.imageUrl ? (
            <img 
              src={event.imageUrl} 
              alt={event.title} 
              className="h-48 w-full object-cover rounded-lg mb-4"
            />
          ) : (
            <div className="h-48 bg-gray-300 rounded-lg mb-4"></div>
          )}
          <h1 className="text-2xl font-bold text-collegeBlue-900">{event.title}</h1>
          <p className="text-sm text-collegePurple-500 mb-2">{event.club}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <h2 className="text-lg font-semibold mb-3">Details</h2>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <Calendar size={18} className="text-gray-500 mr-3" />
              <span>{formatDate(event.date)}</span>
            </div>
            
            <div className="flex items-center">
              <Clock size={18} className="text-gray-500 mr-3" />
              <span>{event.time}</span>
            </div>
            
            <div className="flex items-center">
              <MapPin size={18} className="text-gray-500 mr-3" />
              <span>{event.location}</span>
            </div>
            
            <div className="flex items-center">
              <Users size={18} className="text-gray-500 mr-3" />
              <span>{event.currentAttendees} / {event.maxAttendees} registered</span>
            </div>
            
            <div className="flex items-center">
              <Tag size={18} className="text-gray-500 mr-3" />
              <span>{event.category}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-2">About</h2>
          <p className="text-gray-700">{event.description}</p>
        </div>
        
        {isEventPast && (
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">Feedback</h2>
              
              {isAuthenticated && userType === 'student' && !userHasSubmittedFeedback && (
                <Dialog open={showFeedbackForm} onOpenChange={setShowFeedbackForm}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      Add Feedback
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Share Your Feedback</DialogTitle>
                    </DialogHeader>
                    <FeedbackForm 
                      eventId={event.id} 
                      userId={user?.id} 
                      onSuccess={handleFeedbackSubmitted} 
                    />
                  </DialogContent>
                </Dialog>
              )}
            </div>
            
            <FeedbackDisplay feedback={eventFeedback} />
          </div>
        )}
        
        {isRegistrationClosed && !isEventPast ? (
          <div className="bg-red-50 p-3 rounded-lg text-center mb-4">
            <AlertCircle className="h-5 w-5 text-red-500 mx-auto mb-1" />
            <p className="text-red-700 text-sm">Registration closed on {formatDate(event.dueDate)}</p>
          </div>
        ) : isEventFull && !isEventPast ? (
          <div className="bg-amber-50 p-3 rounded-lg text-center mb-4">
            <AlertCircle className="h-5 w-5 text-amber-500 mx-auto mb-1" />
            <p className="text-amber-700 text-sm">This event is fully booked</p>
          </div>
        ) : isEventPast ? (
          <div className="bg-gray-50 p-3 rounded-lg text-center mb-4">
            <Clock className="h-5 w-5 text-gray-500 mx-auto mb-1" />
            <p className="text-gray-700 text-sm">This event has already taken place</p>
          </div>
        ) : null}
        
        {!isEventPast && (
          <div className="fixed bottom-20 left-4 right-4">
            {isRegistered ? (
              <Button 
                className="w-full bg-green-500 text-white py-3 rounded-lg font-medium text-center"
                disabled
              >
                Already Registered
              </Button>
            ) : (
              <Button 
                onClick={handleRegister}
                className="w-full bg-collegeBlue-500 text-white py-3 rounded-lg font-medium text-center"
                disabled={!canRegister || registering}
              >
                {registering ? 'Registering...' : `Register Now - ₹${event.price}`}
              </Button>
            )}
          </div>
        )}
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default EventDetailsPage;
