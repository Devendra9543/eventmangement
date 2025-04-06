import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { ExtendedUser } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type ClubType = 'CSI' | 'ISTE' | 'DEBUGGERS';
export type CategoryType = 'Sports' | 'Technical' | 'Cultural';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  club: ClubType;
  category: CategoryType;
  price: number;
  organizerId: string;
  maxAttendees: number;
  currentAttendees: number;
  imageUrl?: string;
  dueDate: string;
}

interface Registration {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  registrationDate: string;
  paymentStatus: 'pending' | 'completed';
}

export interface Feedback {
  id: string;
  eventId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

interface EventContextType {
  events: Event[];
  registrations: Registration[];
  feedback: Feedback[];
  clubs: ClubType[];
  categories: CategoryType[];
  createEvent: (event: Omit<Event, 'id'>) => Promise<boolean>;
  updateEvent: (eventId: string, eventData: Partial<Event>) => Promise<boolean>;
  deleteEvent: (eventId: string) => Promise<boolean>;
  registerForEvent: (eventId: string, userId: string, userName: string) => Promise<boolean>;
  getEventsByClub: (club: ClubType) => Event[];
  getEventsByCategory: (category: CategoryType) => Event[];
  getRegistrationsByEvent: (eventId: string) => Registration[];
  getEventById: (eventId: string) => Event | undefined;
  submitFeedback: (eventId: string, userId: string, rating: number, comment?: string) => Promise<boolean>;
  getFeedbackByEvent: (eventId: string) => Feedback[];
  getFeedbackByUser: (userId: string) => Feedback[];
  hasUserSubmittedFeedback: (eventId: string, userId: string) => boolean;
  triggerEventNotification: (title: string, message: string, eventId?: string) => void;
  loadingEvents: boolean;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loadingEvents, setLoadingEvents] = useState<boolean>(true);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const clubs: ClubType[] = ['CSI', 'ISTE', 'DEBUGGERS'];
  const categories: CategoryType[] = ['Sports', 'Technical', 'Cultural'];

  // Event used to communicate with NotificationContext
  const [notificationEvent, setNotificationEvent] = useState<CustomEvent | null>(null);

  // Function to trigger notifications without direct dependency
  const triggerEventNotification = (title: string, message: string, eventId?: string) => {
    // Create a custom event that NotificationContext can listen for
    const event = new CustomEvent('event-notification', {
      detail: { title, message, eventId, userId: user?.id }
    });
    
    // Dispatch the event
    document.dispatchEvent(event);
  };

  // Effect to fetch events from Supabase
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoadingEvents(true);
        
        const { data, error } = await supabase
          .from('events')
          .select('*');
        
        if (error) {
          console.error('Error fetching events:', error);
          toast({
            title: 'Error',
            description: 'Failed to load events',
            variant: 'destructive',
          });
          return;
        }
        
        // Convert the data to match our Event interface
        const formattedEvents: Event[] = data.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          date: item.date,
          time: item.time,
          location: item.location,
          club: item.club as ClubType,
          category: item.category as CategoryType,
          price: item.price,
          organizerId: item.organizer_id,
          maxAttendees: item.max_attendees,
          currentAttendees: item.current_attendees,
          imageUrl: item.image_url || undefined,
          dueDate: item.due_date
        }));
        
        setEvents(formattedEvents);
      } catch (error) {
        console.error('Error in fetchEvents:', error);
      } finally {
        setLoadingEvents(false);
      }
    };
    
    fetchEvents();
  }, [toast]);

  // Effect to fetch registrations for logged-in user
  useEffect(() => {
    const fetchRegistrations = async () => {
      if (!user) return;
      
      try {
        let query = supabase.from('registrations').select('*');
        
        // If user is a student, only fetch their registrations
        const extendedUser = user as ExtendedUser;
        if (extendedUser.userType === 'student') {
          query = query.eq('user_id', user.id);
        } 
        // If user is an organizer, fetch registrations for their events
        else if (extendedUser.userType === 'organizer') {
          const { data: organizerEvents } = await supabase
            .from('events')
            .select('id')
            .eq('organizer_id', user.id);
          
          if (organizerEvents && organizerEvents.length > 0) {
            const eventIds = organizerEvents.map(event => event.id);
            query = query.in('event_id', eventIds);
          } else {
            setRegistrations([]);
            return;
          }
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching registrations:', error);
          return;
        }
        
        // Convert the data to match our Registration interface
        const formattedRegistrations: Registration[] = data.map(item => ({
          id: item.id,
          eventId: item.event_id,
          userId: item.user_id,
          userName: item.user_name,
          registrationDate: new Date(item.registration_date).toISOString().split('T')[0],
          paymentStatus: item.payment_status as 'pending' | 'completed'
        }));
        
        setRegistrations(formattedRegistrations);
      } catch (error) {
        console.error('Error in fetchRegistrations:', error);
      }
    };
    
    fetchRegistrations();
  }, [user]);

  // Effect to fetch feedback
  useEffect(() => {
    const fetchFeedback = async () => {
      if (!user) return;
      
      try {
        const extendedUser = user as ExtendedUser;
        let query = supabase.from('event_feedback').select('*');
        
        // If user is a student, only fetch their feedback
        if (extendedUser.userType === 'student') {
          query = query.eq('user_id', user.id);
        } 
        // If user is an organizer, fetch feedback for their events
        else if (extendedUser.userType === 'organizer') {
          const { data: organizerEvents } = await supabase
            .from('events')
            .select('id')
            .eq('organizer_id', user.id);
          
          if (organizerEvents && organizerEvents.length > 0) {
            const eventIds = organizerEvents.map(event => event.id);
            query = query.in('event_id', eventIds);
          } else {
            setFeedback([]);
            return;
          }
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching feedback:', error);
          return;
        }
        
        // Convert the data to match our Feedback interface
        const formattedFeedback: Feedback[] = data.map(item => ({
          id: item.id,
          eventId: item.event_id,
          userId: item.user_id,
          rating: item.rating,
          comment: item.comment || undefined,
          createdAt: new Date(item.created_at).toISOString()
        }));
        
        setFeedback(formattedFeedback);
      } catch (error) {
        console.error('Error in fetchFeedback:', error);
      }
    };
    
    fetchFeedback();
  }, [user]);

  const createEvent = async (eventData: Omit<Event, 'id'>): Promise<boolean> => {
    try {
      // Format the event data for Supabase
      const supabaseEventData = {
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        time: eventData.time,
        location: eventData.location,
        club: eventData.club,
        category: eventData.category,
        price: eventData.price,
        organizer_id: eventData.organizerId,
        max_attendees: eventData.maxAttendees,
        current_attendees: 0,
        image_url: eventData.imageUrl || null,
        due_date: eventData.dueDate
      };
      
      const { data, error } = await supabase
        .from('events')
        .insert(supabaseEventData)
        .select()
        .single();
      
      if (error) {
        console.error('Create event error:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to create event',
          variant: 'destructive',
        });
        return false;
      }
      
      // Add the new event to our local state
      const newEvent: Event = {
        id: data.id,
        title: data.title,
        description: data.description,
        date: data.date,
        time: data.time,
        location: data.location,
        club: data.club as ClubType,
        category: data.category as CategoryType,
        price: data.price,
        organizerId: data.organizer_id,
        maxAttendees: data.max_attendees,
        currentAttendees: data.current_attendees,
        imageUrl: data.image_url || undefined,
        dueDate: data.due_date
      };
      
      setEvents(prevEvents => [...prevEvents, newEvent]);
      
      // Notify all students about the new event
      const extendedUser = user as ExtendedUser | null;
      if (extendedUser?.userType === 'organizer') {
        // Use the notification method
        triggerEventNotification(
          `New Event: ${newEvent.title}`,
          `${extendedUser.clubName} just posted a new event: ${newEvent.title}. Registration closes on ${newEvent.dueDate}.`,
          newEvent.id
        );
      }
      
      return true;
    } catch (error) {
      console.error('Create event error:', error);
      return false;
    }
  };

  const updateEvent = async (eventId: string, eventData: Partial<Event>): Promise<boolean> => {
    try {
      // Format the event data for Supabase
      const supabaseEventData: Record<string, any> = {};
      
      // Convert camelCase to snake_case for Supabase
      if (eventData.title) supabaseEventData.title = eventData.title;
      if (eventData.description) supabaseEventData.description = eventData.description;
      if (eventData.date) supabaseEventData.date = eventData.date;
      if (eventData.time) supabaseEventData.time = eventData.time;
      if (eventData.location) supabaseEventData.location = eventData.location;
      if (eventData.club) supabaseEventData.club = eventData.club;
      if (eventData.category) supabaseEventData.category = eventData.category;
      if (eventData.price !== undefined) supabaseEventData.price = eventData.price;
      if (eventData.maxAttendees !== undefined) supabaseEventData.max_attendees = eventData.maxAttendees;
      if (eventData.currentAttendees !== undefined) supabaseEventData.current_attendees = eventData.currentAttendees;
      if ('imageUrl' in eventData) supabaseEventData.image_url = eventData.imageUrl;
      if (eventData.dueDate) supabaseEventData.due_date = eventData.dueDate;
      
      const { error } = await supabase
        .from('events')
        .update(supabaseEventData)
        .eq('id', eventId);
      
      if (error) {
        console.error('Update event error:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to update event',
          variant: 'destructive',
        });
        return false;
      }
      
      // Update the event in our local state
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === eventId ? { ...event, ...eventData } : event
        )
      );
      
      return true;
    } catch (error) {
      console.error('Update event error:', error);
      return false;
    }
  };

  const deleteEvent = async (eventId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);
      
      if (error) {
        console.error('Delete event error:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to delete event',
          variant: 'destructive',
        });
        return false;
      }
      
      // Remove the event from our local state
      setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
      
      return true;
    } catch (error) {
      console.error('Delete event error:', error);
      return false;
    }
  };

  const registerForEvent = async (eventId: string, userId: string, userName: string): Promise<boolean> => {
    try {
      const event = events.find(e => e.id === eventId);
      
      if (!event) {
        throw new Error("Event not found");
      }
      
      // Check if due date has passed
      const currentDate = new Date();
      const dueDateObj = new Date(event.dueDate);
      
      if (currentDate > dueDateObj) {
        throw new Error("Registration deadline has passed");
      }
      
      // Check if the user has already registered for this event
      const existingRegistration = registrations.find(
        reg => reg.eventId === eventId && reg.userId === userId
      );
      
      if (existingRegistration) {
        toast({
          title: "Already Registered",
          description: "You've already registered for this event",
          variant: "default",
        });
        return true; // Return true to allow payment page redirect for already registered users
      }
      
      // Insert registration into Supabase
      const { data, error } = await supabase
        .from('registrations')
        .insert({
          event_id: eventId,
          user_id: userId,
          user_name: userName,
          payment_status: 'pending'
        })
        .select()
        .single();
      
      if (error) {
        console.error('Register for event error:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to register for event',
          variant: 'destructive',
        });
        return false;
      }
      
      // Update current attendees in events table
      await supabase
        .from('events')
        .update({ current_attendees: event.currentAttendees + 1 })
        .eq('id', eventId);
      
      // Add registration to local state
      const newRegistration: Registration = {
        id: data.id,
        eventId: data.event_id,
        userId: data.user_id,
        userName: data.user_name,
        registrationDate: new Date().toISOString().split('T')[0],
        paymentStatus: 'pending'
      };
      
      setRegistrations(prev => [...prev, newRegistration]);
      
      // Update event attendee count in local state
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === eventId 
            ? { ...event, currentAttendees: event.currentAttendees + 1 } 
            : event
        )
      );
      
      // Notify user of successful registration
      triggerEventNotification(
        "Registration Confirmed",
        `You have successfully registered for ${event.title}`,
        eventId
      );
      
      return true;
    } catch (error: any) {
      console.error('Register for event error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to register for event',
        variant: 'destructive',
      });
      return false;
    }
  };

  const submitFeedback = async (
    eventId: string, 
    userId: string, 
    rating: number, 
    comment?: string
  ): Promise<boolean> => {
    try {
      // Check if user has already submitted feedback for this event
      const existingFeedback = feedback.find(
        f => f.eventId === eventId && f.userId === userId
      );
      
      if (existingFeedback) {
        toast({
          title: "Feedback Already Submitted",
          description: "You've already provided feedback for this event",
          variant: "default",
        });
        return false;
      }
      
      // Insert feedback into Supabase
      const { data, error } = await supabase
        .from('event_feedback')
        .insert({
          event_id: eventId,
          user_id: userId,
          rating: rating,
          comment: comment || null
        })
        .select()
        .single();
      
      if (error) {
        console.error('Submit feedback error:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to submit feedback',
          variant: 'destructive',
        });
        return false;
      }
      
      // Add feedback to local state
      const newFeedback: Feedback = {
        id: data.id,
        eventId: data.event_id,
        userId: data.user_id,
        rating: data.rating,
        comment: data.comment || undefined,
        createdAt: new Date(data.created_at).toISOString()
      };
      
      setFeedback(prev => [...prev, newFeedback]);
      
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback!",
        variant: "default",
      });
      
      return true;
    } catch (error: any) {
      console.error('Submit feedback error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit feedback',
        variant: 'destructive',
      });
      return false;
    }
  };

  const getFeedbackByEvent = (eventId: string): Feedback[] => {
    return feedback.filter(f => f.eventId === eventId);
  };

  const getFeedbackByUser = (userId: string): Feedback[] => {
    return feedback.filter(f => f.userId === userId);
  };

  const hasUserSubmittedFeedback = (eventId: string, userId: string): boolean => {
    return feedback.some(f => f.eventId === eventId && f.userId === userId);
  };

  const getEventsByClub = (club: ClubType): Event[] => {
    return events.filter(event => event.club === club);
  };

  const getEventsByCategory = (category: CategoryType): Event[] => {
    return events.filter(event => event.category === category);
  };

  const getRegistrationsByEvent = (eventId: string): Registration[] => {
    return registrations.filter(reg => reg.eventId === eventId);
  };

  const getEventById = (eventId: string): Event | undefined => {
    return events.find(event => event.id === eventId);
  };

  return (
    <EventContext.Provider
      value={{
        events,
        registrations,
        feedback,
        clubs,
        categories,
        createEvent,
        updateEvent,
        deleteEvent,
        registerForEvent,
        getEventsByClub,
        getEventsByCategory,
        getRegistrationsByEvent,
        getEventById,
        submitFeedback,
        getFeedbackByEvent,
        getFeedbackByUser,
        hasUserSubmittedFeedback,
        triggerEventNotification,
        loadingEvents
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = () => {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};
