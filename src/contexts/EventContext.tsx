
import React, { createContext, useState, useEffect, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from './AuthContext';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  imageUrl: string;
  price: number;
  category: string;
  club: string;
  maxAttendees: number;
  currentAttendees: number;
  organizerId: string;
  dueDate?: string; // Added dueDate field
}

export interface Feedback {
  id: string;
  eventId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface EventContextType {
  events: Event[];
  clubs: string[];
  categories: string[]; // Added categories array
  feedback: Feedback[];
  loadingEvents: boolean;
  loadingFeedback: boolean;
  fetchEvents: () => Promise<void>;
  fetchFeedback: () => Promise<void>;
  getEventById: (id: string) => Event | undefined;
  getEventsByClub: (clubId: string) => Event[]; // Added getEventsByClub method
  getRegistrationsByEvent: (eventId: string) => any[]; // Added getRegistrationsByEvent method
  getFeedbackByEvent: (eventId: string) => Feedback[];
  hasUserSubmittedFeedback: (eventId: string, userId: string) => boolean; // Added hasUserSubmittedFeedback method
  createEvent: (event: Omit<Event, 'id' | 'currentAttendees'>) => Promise<void>;
  updateEvent: (id: string, updates: Partial<Omit<Event, 'id' | 'organizerId'>>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  registerForEvent: (eventId: string) => Promise<boolean>; // Changed return type to boolean
  cancelRegistration: (eventId: string) => Promise<boolean>; // Changed return type to boolean
  submitFeedback: (eventId: string, rating: number, comment: string) => Promise<boolean>; // Changed return type to boolean
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [clubs, setClubs] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]); // Added categories state
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loadingEvents, setLoadingEvents] = useState<boolean>(true);
  const [loadingFeedback, setLoadingFeedback] = useState<boolean>(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchEvents();
    fetchFeedback();
  }, []);

  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*');

      if (error) {
        console.error("Error fetching events:", error);
      }

      if (data) {
        // Map database fields to our Event interface
        const formattedEvents: Event[] = data.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          date: item.date,
          time: item.time,
          location: item.location,
          imageUrl: item.image_url || '',
          price: item.price,
          category: item.category,
          club: item.club,
          maxAttendees: item.max_attendees,
          currentAttendees: item.current_attendees,
          organizerId: item.organizer_id,
          dueDate: item.due_date
        }));
        
        setEvents(formattedEvents);
        
        // Extract clubs from events
        const clubsSet = new Set(data.map(event => event.club));
        setClubs(Array.from(clubsSet));
        
        // Extract categories from events
        const categoriesSet = new Set(data.map(event => event.category));
        setCategories(Array.from(categoriesSet));
      }
    } finally {
      setLoadingEvents(false);
    }
  };

  const fetchFeedback = async () => {
    setLoadingFeedback(true);
    try {
      const { data, error } = await supabase
        .from('event_feedback')
        .select('*');

      if (error) {
        console.error("Error fetching feedback:", error);
      }

      if (data) {
        const formattedFeedback: Feedback[] = Array.isArray(data) ? data.map((item: any) => ({
          id: item.id,
          eventId: item.event_id,
          userId: item.user_id,
          rating: item.rating,
          comment: item.comment,
          createdAt: item.created_at
        })) : [];
        setFeedback(formattedFeedback);
      }
    } finally {
      setLoadingFeedback(false);
    }
  };

  const getEventById = (id: string): Event | undefined => {
    return events.find(event => event.id === id);
  };

  const getEventsByClub = (clubId: string): Event[] => {
    return events.filter(event => event.club === clubId);
  };

  const getFeedbackByEvent = (eventId: string): Feedback[] => {
    return feedback.filter(item => item.eventId === eventId);
  };

  const hasUserSubmittedFeedback = (eventId: string, userId: string): boolean => {
    return feedback.some(item => item.eventId === eventId && item.userId === userId);
  };

  const getRegistrationsByEvent = async (eventId: string) => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('event_id', eventId);
        
      if (error) {
        console.error("Error fetching registrations:", error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error("Unexpected error fetching registrations:", error);
      return [];
    }
  };

  const createEvent = async (event: Omit<Event, 'id' | 'currentAttendees'>) => {
    try {
      // Map our Event interface to database fields
      const dbEvent = {
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        location: event.location,
        image_url: event.imageUrl,
        price: event.price,
        category: event.category,
        club: event.club,
        max_attendees: event.maxAttendees,
        organizer_id: event.organizerId,
        due_date: event.dueDate || event.date, // Use dueDate or fallback to event date
        current_attendees: 0
      };
      
      const { error } = await supabase
        .from('events')
        .insert([{
          id: uuidv4(),
          ...dbEvent
        }]);

      if (error) {
        console.error("Error creating event:", error);
      } else {
        fetchEvents(); // Refresh events after creating a new one
      }
    } catch (error) {
      console.error("Unexpected error creating event:", error);
    }
  };

  const updateEvent = async (id: string, updates: Partial<Omit<Event, 'id' | 'organizerId'>>) => {
    try {
      // Map our Event interface updates to database fields
      const dbUpdates: any = {};
      
      if (updates.title) dbUpdates.title = updates.title;
      if (updates.description) dbUpdates.description = updates.description;
      if (updates.date) dbUpdates.date = updates.date;
      if (updates.time) dbUpdates.time = updates.time;
      if (updates.location) dbUpdates.location = updates.location;
      if (updates.imageUrl) dbUpdates.image_url = updates.imageUrl;
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.category) dbUpdates.category = updates.category;
      if (updates.club) dbUpdates.club = updates.club;
      if (updates.maxAttendees !== undefined) dbUpdates.max_attendees = updates.maxAttendees;
      if (updates.currentAttendees !== undefined) dbUpdates.current_attendees = updates.currentAttendees;
      if (updates.dueDate) dbUpdates.due_date = updates.dueDate;
      
      const { error } = await supabase
        .from('events')
        .update(dbUpdates)
        .eq('id', id);

      if (error) {
        console.error("Error updating event:", error);
      } else {
        fetchEvents(); // Refresh events after updating
      }
    } catch (error) {
      console.error("Unexpected error updating event:", error);
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Error deleting event:", error);
      } else {
        fetchEvents(); // Refresh events after deleting
      }
    } catch (error) {
      console.error("Unexpected error deleting event:", error);
    }
  };

  const registerForEvent = async (eventId: string): Promise<boolean> => {
    if (!user) {
      console.error("User not authenticated.");
      return false;
    }

    try {
      // Optimistically update the local state
      setEvents(currentEvents =>
        currentEvents.map(event =>
          event.id === eventId ? { ...event, currentAttendees: event.currentAttendees + 1 } : event
        )
      );

      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('max_attendees, current_attendees')
        .eq('id', eventId)
        .single();

      if (eventError) {
        console.error("Error fetching event details:", eventError);
        // Revert the optimistic update
        fetchEvents();
        return false;
      }

      if (eventData && eventData.current_attendees >= eventData.max_attendees) {
        console.log("Event is full. Registration cannot be completed.");
        // Revert the optimistic update
        fetchEvents();
        return false;
      }

      const { error } = await supabase
        .from('registrations')
        .insert([{
          event_id: eventId,
          user_id: user.id,
          registration_date: new Date().toISOString()
        }]);

      if (error) {
        console.error("Error registering for event:", error);
        // Revert the optimistic update
        fetchEvents();
        return false;
      } else {
        console.log("Successfully registered for event.");
        fetchEvents();
        return true;
      }
    } catch (error) {
      console.error("Unexpected error registering for event:", error);
      // Revert the optimistic update
      fetchEvents();
      return false;
    }
  };

  const cancelRegistration = async (eventId: string): Promise<boolean> => {
    if (!user) {
      console.error("User not authenticated.");
      return false;
    }

    try {
      // Optimistically update the local state
      setEvents(currentEvents =>
        currentEvents.map(event =>
          event.id === eventId ? { ...event, currentAttendees: event.currentAttendees - 1 } : event
        )
      );

      const { error } = await supabase
        .from('registrations')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);

      if (error) {
        console.error("Error cancelling registration:", error);
        // Revert the optimistic update
        fetchEvents();
        return false;
      } else {
        console.log("Successfully cancelled registration.");
        fetchEvents();
        return true;
      }
    } catch (error) {
      console.error("Unexpected error cancelling registration:", error);
      // Revert the optimistic update
      fetchEvents();
      return false;
    }
  };

  const submitFeedback = async (eventId: string, rating: number, comment: string): Promise<boolean> => {
    if (!user) {
      console.error("User not authenticated.");
      return false;
    }

    const userId = user.id;

    try {
      const { error } = await supabase
        .from('event_feedback')
        .insert({
          event_id: eventId,
          user_id: userId,
          rating,
          comment
        });

      if (error) {
        console.error("Error submitting feedback:", error);
        return false;
      } else {
        console.log("Feedback submitted successfully.");
        fetchFeedback(); // Refresh feedback after submitting
        return true;
      }
    } catch (error) {
      console.error("Unexpected error submitting feedback:", error);
      return false;
    }
  };

  const value: EventContextType = {
    events,
    clubs,
    categories,
    feedback,
    loadingEvents,
    loadingFeedback,
    fetchEvents,
    fetchFeedback,
    getEventById,
    getEventsByClub,
    getRegistrationsByEvent,
    getFeedbackByEvent,
    hasUserSubmittedFeedback,
    createEvent,
    updateEvent,
    deleteEvent,
    registerForEvent,
    cancelRegistration,
    submitFeedback,
  };

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error("useEvents must be used within an EventProvider");
  }
  return context;
};
