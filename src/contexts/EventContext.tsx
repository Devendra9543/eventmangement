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
  dueDate?: string;
}

export interface Feedback {
  id: string;
  eventId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  registrationDate: string;
  paymentStatus: string;
}

const EVENT_CATEGORIES = [
  'Workshop',
  'Competition',
  'Conference',
  'Seminar',
  'Cultural',
  'Technical',
  'Sports',
  'Other'
];

interface EventContextType {
  events: Event[];
  clubs: string[];
  feedback: Feedback[];
  categories: string[];
  loadingEvents: boolean;
  loadingFeedback: boolean;
  fetchEvents: () => Promise<void>;
  fetchFeedback: () => Promise<void>;
  getEventById: (id: string) => Event | undefined;
  getFeedbackByEvent: (eventId: string) => Feedback[];
  getEventsByClub: (clubId: string) => Event[];
  getRegistrationsByEvent: (eventId: string) => Promise<EventRegistration[]>;
  hasUserSubmittedFeedback: (eventId: string, userId: string) => boolean;
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
        const mappedEvents: Event[] = data.map(event => ({
          id: event.id,
          title: event.title,
          description: event.description,
          date: event.date,
          time: event.time,
          location: event.location,
          imageUrl: event.image_url || '',
          price: event.price,
          category: event.category,
          club: event.club,
          maxAttendees: event.max_attendees,
          currentAttendees: event.current_attendees,
          organizerId: event.organizer_id,
          dueDate: event.due_date
        }));
        
        setEvents(mappedEvents);
        const clubsSet = new Set(data.map(event => event.club));
        setClubs(Array.from(clubsSet) as string[]);
      }
    } finally {
      setLoadingEvents(false);
    }
  };

  const fetchFeedback = async () => {
    setLoadingFeedback(true);
    try {
      const { data, error } = await supabase
        .from('event_feedback' as any)
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

  const getEventsByClub = (clubId: string): Event[] => {
    return events.filter(event => event.club === clubId);
  };

  const getRegistrationsByEvent = async (eventId: string): Promise<EventRegistration[]> => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('event_id', eventId);

      if (error) {
        console.error("Error fetching registrations:", error);
        return [];
      }

      if (data) {
        return data.map((item: any) => ({
          id: item.id,
          eventId: item.event_id,
          userId: item.user_id,
          userName: item.user_name,
          registrationDate: item.registration_date,
          paymentStatus: item.payment_status
        }));
      }
      return [];
    } catch (error) {
      console.error("Unexpected error fetching registrations:", error);
      return [];
    }
  };

  const hasUserSubmittedFeedback = (eventId: string, userId: string): boolean => {
    return feedback.some(item => item.eventId === eventId && item.userId === userId);
  };

  const createEvent = async (event: Omit<Event, 'id' | 'currentAttendees'>) => {
    try {
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
        due_date: event.dueDate,
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
        fetchEvents();
      }
    } catch (error) {
      console.error("Unexpected error creating event:", error);
    }
  };

  const updateEvent = async (id: string, updates: Partial<Omit<Event, 'id' | 'organizerId'>>) => {
    try {
      const dbUpdates: any = {};
      
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.date !== undefined) dbUpdates.date = updates.date;
      if (updates.time !== undefined) dbUpdates.time = updates.time;
      if (updates.location !== undefined) dbUpdates.location = updates.location;
      if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.club !== undefined) dbUpdates.club = updates.club;
      if (updates.maxAttendees !== undefined) dbUpdates.max_attendees = updates.maxAttendees;
      if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
      
      const { error } = await supabase
        .from('events')
        .update(dbUpdates)
        .eq('id', id);

      if (error) {
        console.error("Error updating event:", error);
      } else {
        fetchEvents();
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
        fetchEvents();
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
        fetchEvents();
        return;
      }

      if (eventData && eventData.current_attendees >= eventData.max_attendees) {
        console.log("Event is full. Registration cannot be completed.");
        fetchEvents();
        return;
      }

      const { error } = await supabase
        .from('registrations')
        .insert([{
          event_id: eventId,
          user_id: user.id,
          registration_date: new Date().toISOString(),
          user_name: 'Unknown User',
          payment_status: 'pending'
        }]);

      if (error) {
        console.error("Error registering for event:", error);
        fetchEvents();
      } else {
        console.log("Successfully registered for event.");
        fetchEvents();
      }
    } catch (error) {
      console.error("Unexpected error registering for event:", error);
      fetchEvents();
    }
  };

  const cancelRegistration = async (eventId: string) => {
    if (!user) {
      console.error("User not authenticated.");
      return;
    }

    try {
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
        fetchEvents();
      } else {
        console.log("Successfully cancelled registration.");
        fetchEvents();
      }
    } catch (error) {
      console.error("Unexpected error cancelling registration:", error);
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
      const { error } = await supabase
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
        fetchFeedback();
      }
    } catch (error) {
      console.error("Unexpected error submitting feedback:", error);
    }
  };

  const value: EventContextType = {
    events,
    clubs,
    feedback,
    categories: EVENT_CATEGORIES,
    loadingEvents,
    loadingFeedback,
    fetchEvents,
    fetchFeedback,
    getEventById,
    getFeedbackByEvent,
    getEventsByClub,
    getRegistrationsByEvent,
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
