
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';

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
  dueDate: string; // Added due date field
}

interface Registration {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  registrationDate: string;
  paymentStatus: 'pending' | 'completed';
}

interface EventContextType {
  events: Event[];
  registrations: Registration[];
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
  triggerEventNotification: (title: string, message: string, eventId?: string) => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

// Sample mock data
const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Code Marathon',
    description: 'A 24-hour coding competition',
    date: '2023-05-15',
    time: '10:00 AM',
    location: 'Computer Lab 1',
    club: 'CSI',
    category: 'Technical',
    price: 200,
    organizerId: '2',
    maxAttendees: 50,
    currentAttendees: 30,
    imageUrl: '/assets/events/coding.jpg',
    dueDate: '2023-05-10' // Added due date
  },
  {
    id: '2',
    title: 'Cricket Tournament',
    description: 'Annual inter-college cricket tournament',
    date: '2023-06-10',
    time: '09:00 AM',
    location: 'College Ground',
    club: 'ISTE',
    category: 'Sports',
    price: 500,
    organizerId: '2',
    maxAttendees: 100,
    currentAttendees: 75,
    imageUrl: '/assets/events/cricket.jpg',
    dueDate: '2023-06-05' // Added due date
  },
  {
    id: '3',
    title: 'Dance Competition',
    description: 'Showcase your dance skills',
    date: '2023-07-05',
    time: '05:00 PM',
    location: 'College Auditorium',
    club: 'DEBUGGERS',
    category: 'Cultural',
    price: 100,
    organizerId: '2',
    maxAttendees: 30,
    currentAttendees: 12,
    imageUrl: '/assets/events/dance.jpg',
    dueDate: '2023-07-01' // Added due date
  },
];

const mockRegistrations: Registration[] = [
  {
    id: '1',
    eventId: '1',
    userId: '1',
    userName: 'John Student',
    registrationDate: '2023-05-01',
    paymentStatus: 'completed'
  },
  {
    id: '2',
    eventId: '2',
    userId: '1',
    userName: 'John Student',
    registrationDate: '2023-05-02',
    paymentStatus: 'pending'
  }
];

export const EventProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [registrations, setRegistrations] = useState<Registration[]>(mockRegistrations);
  const { user } = useAuth();
  
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

  // Effect to sync with backend (in a real app)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, this would fetch data from the backend
        console.log("Fetching events and registrations from backend...");
        
        // For now we'll use our mock data
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    
    if (user) {
      fetchData();
    }
  }, [user]);

  const createEvent = async (eventData: Omit<Event, 'id'>): Promise<boolean> => {
    try {
      const newEvent: Event = {
        ...eventData,
        id: Math.random().toString(36).substring(7), // Generate random ID
      };
      
      setEvents(prevEvents => [...prevEvents, newEvent]);
      
      // Notify all students about the new event
      if (user?.userType === 'organizer') {
        // Use the new notification method
        triggerEventNotification(
          `New Event: ${newEvent.title}`,
          `${user.clubName} just posted a new event: ${newEvent.title}. Registration closes on ${newEvent.dueDate}.`,
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
      
      const newRegistration: Registration = {
        id: Math.random().toString(36).substring(7),
        eventId,
        userId,
        userName,
        registrationDate: new Date().toISOString().split('T')[0],
        paymentStatus: 'pending'
      };
      
      setRegistrations(prev => [...prev, newRegistration]);
      
      // Update event attendee count
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
    } catch (error) {
      console.error('Register for event error:', error);
      return false;
    }
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
        triggerEventNotification
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
