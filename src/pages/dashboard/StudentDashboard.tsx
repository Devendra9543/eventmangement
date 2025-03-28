
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useEvents } from '../../contexts/EventContext';
import { ExtendedUser } from '@/types/auth';
import PageHeader from '../../components/common/PageHeader';
import BottomNavigation from '../../components/common/BottomNavigation';
import { Card, CardContent } from '@/components/ui/card';
import EventCard from '../../components/common/EventCard';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { events, clubs } = useEvents();
  const extendedUser = user as ExtendedUser | null;
  
  // Get recent events
  const upcomingEvents = events
    .filter(event => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const handleClubClick = (club: string) => {
    navigate(`/clubs/${club}`);
  };

  return (
    <div className="min-h-screen pb-16 bg-gray-50">
      <PageHeader 
        title={`Hi, ${extendedUser?.fullName?.split(' ')[0] || 'Student'}`}
        showNotifications
      />
      
      <div className="p-4 space-y-6">
        {/* Clubs Section */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Clubs</h2>
          <div className="grid grid-cols-3 gap-3">
            {clubs.map(club => (
              <Card 
                key={club}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleClubClick(club)}
              >
                <CardContent className="p-4 text-center">
                  <p className="font-semibold text-collegeBlue-600">{club}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
        
        {/* Upcoming Events Section */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-gray-800">Upcoming Events</h2>
            <button 
              className="text-sm text-collegeBlue-500 font-medium"
              onClick={() => navigate('/clubs/all')}
            >
              View all
            </button>
          </div>
          
          <div className="space-y-4">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No upcoming events</p>
            )}
          </div>
        </section>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default StudentDashboard;
