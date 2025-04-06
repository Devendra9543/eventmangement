import React, { createContext, useState, useEffect, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabaseClient';
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
  feedback: Feedback[];
  loadingEvents: boolean;
  loadingFeedback: boolean;
  fetchEvents: () => Promise<void>;
  fetchFeedback: () => Promise<void>;
  getEventById: (id: string) => Event | undefined;
  getFeedbackByEvent: (eventId: string) => Feedback[];
  createEvent: (event: Omit<Event, 'id' | 'currentAttendees'>) => Promise<void>;
  updateEvent: (id: string, updates: Partial<Omit<Event, 'id' | 'organizerId'>>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  registerForEvent: (eventId: string) => Promise<void>;
  cancelRegistration: (eventId: string) => Promise<void>;
  submitFeedback: (eventId: string, rating: number, comment: string) => Promise<void>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [clubs, setClubs] = useState<string[]>([]);
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
        setEvents(data as Event[]);
        // Extract clubs from events
        const clubsSet = new Set(data.map(event => event.club));
        setClubs(Array.from(clubsSet));
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

  const getFeedbackByEvent = (eventId: string): Feedback[] => {
    return feedback.filter(item => item.eventId === eventId);
  };

  const createEvent = async (event: Omit<Event, 'id' | 'currentAttendees'>) => {
    try {
      const { error } = await supabase
        .from('events')
        .insert([
          {
            id: uuidv4(),
            ...event,
            currentAttendees: 0
          }
        ]);

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
      const { error } = await supabase
        .from('events')
        .update(updates)
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

  const registerForEvent = async (eventId: string) => {
    if (!user) {
      console.error("User not authenticated.");
      return;
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
        .select('maxAttendees, currentAttendees')
        .eq('id', eventId)
        .single();

      if (eventError) {
        console.error("Error fetching event details:", eventError);
        // Revert the optimistic update
        fetchEvents();
        return;
      }

      if (eventData && eventData.currentAttendees >= eventData.maxAttendees) {
        console.log("Event is full. Registration cannot be completed.");
        // Revert the optimistic update
        fetchEvents();
        return;
      }

      const { error } = await supabase
        .from('event_registrations')
        .insert([{
          event_id: eventId,
          user_id: user.id,
          registered_at: new Date().toISOString()
        }]);

      if (error) {
        console.error("Error registering for event:", error);
        // Revert the optimistic update
        fetchEvents();
      } else {
        console.log("Successfully registered for event.");
        fetchEvents();
      }
    } catch (error) {
      console.error("Unexpected error registering for event:", error);
      // Revert the optimistic update
      fetchEvents();
    }
  };

  const cancelRegistration = async (eventId: string) => {
    if (!user) {
      console.error("User not authenticated.");
      return;
    }

    try {
      // Optimistically update the local state
      setEvents(currentEvents =>
        currentEvents.map(event =>
          event.id === eventId ? { ...event, currentAttendees: event.currentAttendees - 1 } : event
        )
      );

      const { error } = await supabase
        .from('event_registrations')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);

      if (error) {
        console.error("Error cancelling registration:", error);
        // Revert the optimistic update
        fetchEvents();
      } else {
        console.log("Successfully cancelled registration.");
        fetchEvents();
      }
    } catch (error) {
      console.error("Unexpected error cancelling registration:", error);
      // Revert the optimistic update
      fetchEvents();
    }
  };

  const submitFeedback = async (eventId: string, rating: number, comment: string) => {
    if (!user) {
      console.error("User not authenticated.");
      return;
    }

    const userId = user.id;

    try {
      const { data, error } = await supabase
        .from('event_feedback' as any)
        .insert({
          event_id: eventId,
          user_id: userId,
          rating,
          comment
        });

      if (error) {
        console.error("Error submitting feedback:", error);
      } else {
        console.log("Feedback submitted successfully.");
        fetchFeedback(); // Refresh feedback after submitting
      }
    } catch (error) {
      console.error("Unexpected error submitting feedback:", error);
    }
  };

  const value: EventContextType = {
    events,
    clubs,
    feedback,
    loadingEvents,
    loadingFeedback,
    fetchEvents,
    fetchFeedback,
    getEventById,
    getFeedbackByEvent,
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
