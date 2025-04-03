
import React, { useEffect, useState } from 'react';
import PageHeader from '@/components/common/PageHeader';
import CollegeBanner from '@/components/common/CollegeBanner';
import BottomNavigation from '@/components/common/BottomNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEvents } from '@/contexts/EventContext';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { AlertCircle, Calendar, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import EventCard from '@/components/common/EventCard';

const OrganizerDashboard = () => {
  const { profile, isAuthenticated, userType } = useAuth();
  const { events } = useEvents();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [organizerEvents, setOrganizerEvents] = useState([]);

  useEffect(() => {
    // Check if user is authenticated and is an organizer
    if (!isAuthenticated) {
      console.log("User not authenticated, redirecting to login");
      navigate('/login');
      return;
    }

    if (userType !== 'organizer') {
      console.log("User is not an organizer, redirecting to student dashboard");
      navigate('/dashboard/student');
      return;
    }

    // Set loading to false once profile is loaded
    if (profile) {
      console.log("Profile data in organizer dashboard:", profile);
      
      // Filter events created by this organizer
      if (events.length > 0) {
        const filteredEvents = events.filter(event => event.organizerId === profile.id);
        // Get the three most recent events
        const recentEvents = [...filteredEvents]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 3);
        setOrganizerEvents(recentEvents);
      }
      
      setIsLoading(false);
    } else {
      console.log("Waiting for profile data to load in organizer dashboard...");
      // Set a timeout to stop showing loading state after some time
      const timer = setTimeout(() => {
        if (!profile) {
          console.log("Profile data still not loaded after timeout in organizer dashboard");
          setIsLoading(false);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, navigate, profile, userType, events]);

  const isProfileIncomplete = !profile?.club_name || !profile?.club_role || !profile?.mobile;

  const handleUpdateProfile = () => {
    navigate('/profile');
    toast({
      title: "Profile Update",
      description: "Please update your profile details",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16 bg-gray-50">
      <CollegeBanner />
      <PageHeader title="Organizer Dashboard" showNotifications={true} />
      
      <div className="p-4">
        <div className="bg-white p-5 rounded-lg shadow mb-4">
          <h2 className="text-xl font-semibold mb-4 text-collegeBlue-900">
            Welcome, {profile?.full_name || 'Organizer'}!
          </h2>
          
          {isProfileIncomplete && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-start">
              <AlertCircle className="text-yellow-500 mr-2 flex-shrink-0" size={18} />
              <div className="flex-1">
                <p className="text-sm text-yellow-700">Your profile is incomplete. Please update your details to get the most out of the platform.</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                  onClick={handleUpdateProfile}
                >
                  Update Profile
                </Button>
              </div>
            </div>
          )}
          
          <div className="space-y-2 mb-4">
            <p className="text-gray-600">
              <span className="font-medium">Club:</span> 
              {profile?.club_name ? (
                <span className="ml-1">{profile.club_name}</span>
              ) : (
                <span className="ml-1 text-gray-400 italic">Not set (update your profile)</span>
              )}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Role:</span> 
              {profile?.club_role ? (
                <span className="ml-1">{profile.club_role}</span>
              ) : (
                <span className="ml-1 text-gray-400 italic">Not set (update your profile)</span>
              )}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Email:</span> 
              <span className="ml-1">{profile?.email || 'N/A'}</span>
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Phone:</span> 
              {profile?.mobile ? (
                <span className="ml-1">{profile.mobile}</span>
              ) : (
                <span className="ml-1 text-gray-400 italic">Not set (update your profile)</span>
              )}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white p-5 rounded-lg shadow">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-lg">Your Events</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/manage-events')}
                className="text-collegeBlue-500 hover:text-collegeBlue-700"
              >
                View all
              </Button>
            </div>
            
            {organizerEvents.length > 0 ? (
              <div className="space-y-3">
                {organizerEvents.map(event => (
                  <div key={event.id} className="border border-gray-100 rounded-md p-3 hover:bg-gray-50">
                    <div className="flex justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{event.title}</h4>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Calendar size={12} className="mr-1" /> 
                          {new Date(event.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <FileText size={12} className="mr-1" />
                        {event.currentAttendees}/{event.maxAttendees}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">You have no upcoming events. Create a new event to get started.</p>
            )}
          </div>
          
          <div className="bg-white p-5 rounded-lg shadow">
            <h3 className="font-medium text-lg mb-2">Quick Actions</h3>
            <div className="flex flex-col gap-2 mt-3">
              <button 
                onClick={() => navigate('/create-event')}
                className="text-white bg-collegeBlue-500 px-4 py-2 rounded-md text-sm hover:bg-collegeBlue-600 transition-colors"
              >
                Create New Event
              </button>
              <button 
                onClick={() => navigate('/manage-events')}
                className="text-collegeBlue-500 bg-collegeBlue-50 px-4 py-2 rounded-md text-sm hover:bg-collegeBlue-100 transition-colors"
              >
                Manage Events
              </button>
              {organizerEvents.length > 0 && (
                <button 
                  onClick={() => navigate(`/manage-registrations/${organizerEvents[0].id}`)}
                  className="text-collegeBlue-500 bg-collegeBlue-50 px-4 py-2 rounded-md text-sm hover:bg-collegeBlue-100 transition-colors"
                >
                  Manage Registrations
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default OrganizerDashboard;
