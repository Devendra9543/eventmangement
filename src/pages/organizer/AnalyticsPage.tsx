
import React, { useEffect, useState } from 'react';
import PageHeader from '@/components/common/PageHeader';
import BottomNavigation from '@/components/common/BottomNavigation';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { useEvents } from '@/contexts/EventContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { supabase } from '@/integrations/supabase/client';
import { Event, Feedback } from '@/contexts/EventContext';

interface AnalyticsStats {
  totalEvents: number;
  totalRegistrations: number;
  avgAttendance: number;
  popularEvent: string;
  maxRegistrations: number;
  avgFeedbackRating: number;
  totalFeedback: number;
}

interface EventRegistration {
  name: string;
  registrations: number;
}

interface MonthlyData {
  month: string;
  events: number;
  participants: number;
}

interface FeedbackData {
  name: string;
  rating: number;
  reviews: number;
}

const AnalyticsPage = () => {
  const { profile } = useAuth();
  const { events, feedback } = useEvents();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<AnalyticsStats>({
    totalEvents: 0,
    totalRegistrations: 0,
    avgAttendance: 0,
    popularEvent: "",
    maxRegistrations: 0,
    avgFeedbackRating: 0,
    totalFeedback: 0
  });
  const [eventData, setEventData] = useState<EventRegistration[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [feedbackData, setFeedbackData] = useState<FeedbackData[]>([]);
  
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!profile) return;
      
      try {
        setIsLoading(true);
        
        // Filter events by the organizer
        const organizerEvents = events.filter(event => event.organizerId === profile.id);
        
        if (organizerEvents.length === 0) {
          setIsLoading(false);
          return;
        }
        
        // Fetch registrations for organizer's events
        const eventIds = organizerEvents.map(event => event.id);
        const { data: registrations, error } = await supabase
          .from('registrations')
          .select('*')
          .in('event_id', eventIds);
          
        if (error) {
          console.error('Error fetching registrations:', error);
          setIsLoading(false);
          return;
        }
        
        // Process event registration data
        const eventsWithRegistrations = organizerEvents.map(event => ({
          id: event.id,
          name: event.title,
          registrations: registrations?.filter(reg => reg.event_id === event.id).length || 0
        }));
        
        // Sort by registrations for chart display (show top 4)
        const sortedEvents = [...eventsWithRegistrations]
          .sort((a, b) => b.registrations - a.registrations)
          .slice(0, 4);
          
        // Find most popular event
        const mostPopular = eventsWithRegistrations.reduce(
          (prev, current) => (current.registrations > prev.registrations) ? current : prev, 
          { id: '', name: 'None', registrations: 0 }
        );
        
        // Calculate total registrations
        const totalRegs = eventsWithRegistrations.reduce(
          (sum, event) => sum + event.registrations, 0
        );
        
        // Calculate average attendance
        const avgAttendance = organizerEvents.length > 0 
          ? (totalRegs / organizerEvents.length).toFixed(1)
          : '0';
          
        // Generate monthly data
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentDate = new Date();
        const monthlyStats: MonthlyData[] = [];
        
        // Get data for the last 5 months
        for (let i = 4; i >= 0; i--) {
          const monthIndex = (currentDate.getMonth() - i + 12) % 12;
          const month = months[monthIndex];
          const year = i > currentDate.getMonth() 
            ? currentDate.getFullYear() - 1 
            : currentDate.getFullYear();
            
          // Count events in this month
          const eventsInMonth = organizerEvents.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.getMonth() === monthIndex && eventDate.getFullYear() === year;
          });
          
          // Count participants in this month
          const participantsInMonth = eventsInMonth.reduce(
            (sum, event) => sum + event.currentAttendees, 0
          );
          
          monthlyStats.push({
            month,
            events: eventsInMonth.length,
            participants: participantsInMonth
          });
        }
        
        // Process feedback data
        const organizerFeedback = feedback.filter(f => 
          eventIds.includes(f.eventId)
        );
        
        // Calculate average feedback rating
        const avgRating = organizerFeedback.length > 0
          ? organizerFeedback.reduce((sum, f) => sum + f.rating, 0) / organizerFeedback.length
          : 0;
          
        // Process feedback by event (top 4 events with most feedback)
        const feedbackByEvent = eventIds.map(eventId => {
          const event = organizerEvents.find(e => e.id === eventId);
          const eventFeedback = organizerFeedback.filter(f => f.eventId === eventId);
          const avgEventRating = eventFeedback.length > 0
            ? eventFeedback.reduce((sum, f) => sum + f.rating, 0) / eventFeedback.length
            : 0;
            
          return {
            name: event?.title || 'Unknown',
            rating: parseFloat(avgEventRating.toFixed(1)),
            reviews: eventFeedback.length
          };
        })
        .filter(f => f.reviews > 0)
        .sort((a, b) => b.reviews - a.reviews)
        .slice(0, 4);
        
        // Update state with analytics data
        setStats({
          totalEvents: organizerEvents.length,
          totalRegistrations: totalRegs,
          avgAttendance: parseFloat(avgAttendance),
          popularEvent: mostPopular.name,
          maxRegistrations: mostPopular.registrations,
          avgFeedbackRating: parseFloat(avgRating.toFixed(1)),
          totalFeedback: organizerFeedback.length
        });
        
        setEventData(sortedEvents);
        setMonthlyData(monthlyStats);
        setFeedbackData(feedbackByEvent);
      } catch (error) {
        console.error('Error generating analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, [profile, events, feedback]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pb-16 bg-gray-50">
      <PageHeader title="Analytics" showNotifications={true} />
      
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-lg shadow p-3">
            <h3 className="text-xs text-gray-500">Total Events</h3>
            <p className="text-2xl font-bold text-collegeBlue-700">{stats.totalEvents}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-3">
            <h3 className="text-xs text-gray-500">Total Registrations</h3>
            <p className="text-2xl font-bold text-collegeBlue-700">{stats.totalRegistrations}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-3">
            <h3 className="text-xs text-gray-500">Average Attendance</h3>
            <p className="text-2xl font-bold text-collegeBlue-700">{stats.avgAttendance}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-3">
            <h3 className="text-xs text-gray-500">Avg. Feedback Rating</h3>
            <p className="text-2xl font-bold text-collegeBlue-700">{stats.avgFeedbackRating || 'N/A'}</p>
          </div>
        </div>
        
        {eventData.length > 0 ? (
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h3 className="font-medium mb-2">Event Registrations</h3>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={eventData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="registrations" fill="#4338ca" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-4 mb-6 text-center">
            <h3 className="font-medium mb-2">Event Registrations</h3>
            <p className="text-gray-500">No event registration data available</p>
          </div>
        )}
        
        {feedbackData.length > 0 ? (
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h3 className="font-medium mb-2">Event Feedback Ratings</h3>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={feedbackData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} domain={[0, 5]} />
                  <Tooltip />
                  <Bar dataKey="rating" fill="#06b6d4" name="Avg. Rating" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-4 mb-6 text-center">
            <h3 className="font-medium mb-2">Event Feedback Ratings</h3>
            <p className="text-gray-500">No feedback data available</p>
          </div>
        )}
        
        {monthlyData.length > 0 ? (
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h3 className="font-medium mb-2">Monthly Trends</h3>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="events" fill="#4338ca" name="Events" />
                  <Bar dataKey="participants" fill="#06b6d4" name="Participants" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-4 mb-6 text-center">
            <h3 className="font-medium mb-2">Monthly Trends</h3>
            <p className="text-gray-500">No monthly trend data available</p>
          </div>
        )}
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default AnalyticsPage;
