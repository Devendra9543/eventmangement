
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useEvents } from '@/contexts/EventContext';
import { Event } from '@/contexts/EventContext';
import PageHeader from '@/components/common/PageHeader';
import BottomNavigation from '@/components/common/BottomNavigation';
import { Check, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

interface Registration {
  id: string;
  studentName: string;
  email: string;
  regDate: string;
  status: 'approved' | 'pending' | 'rejected';
  userId: string;
}

const ManageRegistrationsPage = () => {
  const { eventId } = useParams();
  const { events, getRegistrationsByEvent } = useEvents();
  const { toast } = useToast();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!eventId) return;
      
      setLoading(true);
      
      // Find the event
      const eventData = events.find(e => e.id === eventId);
      if (eventData) {
        setEvent(eventData);
      }
      
      // Fetch registrations for this event from Supabase
      const { data, error } = await supabase
        .from('registrations')
        .select('id, user_id, user_name, registration_date, payment_status')
        .eq('event_id', eventId);
      
      if (error) {
        console.error('Error fetching registrations:', error);
        toast({
          title: 'Error',
          description: 'Failed to load registrations',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }
      
      // Get user emails from profiles table
      const userIds = data.map(reg => reg.user_id);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', userIds);
      
      if (profileError) {
        console.error('Error fetching user profiles:', profileError);
      }
      
      // Map to our Registration type
      const formattedRegistrations: Registration[] = data.map(reg => {
        const userProfile = profileData?.find(p => p.id === reg.user_id);
        return {
          id: reg.id,
          studentName: reg.user_name,
          email: userProfile?.email || 'No email available',
          regDate: formatDate(reg.registration_date),
          status: reg.payment_status as 'approved' | 'pending' | 'rejected',
          userId: reg.user_id,
        };
      });
      
      setRegistrations(formattedRegistrations);
      setLoading(false);
    };
    
    fetchData();
  }, [eventId, events, toast]);
  
  const handleUpdateStatus = async (registrationId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('registrations')
        .update({ payment_status: status })
        .eq('id', registrationId);
      
      if (error) {
        toast({
          title: 'Error',
          description: `Failed to ${status} registration`,
          variant: 'destructive',
        });
        return;
      }
      
      // Update local state
      setRegistrations(prev => 
        prev.map(reg => 
          reg.id === registrationId ? { ...reg, status } : reg
        )
      );
      
      toast({
        title: 'Success',
        description: `Registration ${status} successfully`,
      });
    } catch (error) {
      console.error('Error updating registration status:', error);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen pb-16 bg-gray-50">
        <PageHeader title="Manage Registrations" showBack={true} />
        <div className="flex justify-center items-center h-60">
          <Loader2 className="h-8 w-8 animate-spin text-collegeBlue-500" />
        </div>
        <BottomNavigation />
      </div>
    );
  }
  
  if (!event) {
    return (
      <div className="min-h-screen pb-16 bg-gray-50">
        <PageHeader title="Manage Registrations" showBack={true} />
        <div className="p-4">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-gray-500">Event not found</p>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pb-16 bg-gray-50">
      <PageHeader title="Manage Registrations" showBack={true} />
      
      <div className="p-4">
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h2 className="font-semibold text-lg">{event.title}</h2>
          <p className="text-sm text-gray-500">Date: {formatDate(event.date)}</p>
          <p className="text-sm font-medium mt-2">Total Registrations: {event.currentAttendees}</p>
        </div>
        
        <h3 className="font-medium mb-2 text-collegeBlue-900">Registration List</h3>
        
        {registrations.length > 0 ? (
          <div className="space-y-3">
            {registrations.map((reg) => (
              <div
                key={reg.id}
                className="bg-white rounded-lg shadow p-4"
              >
                <div className="flex justify-between">
                  <div>
                    <h4 className="font-medium">{reg.studentName}</h4>
                    <p className="text-sm text-gray-500">{reg.email}</p>
                    <p className="text-xs text-gray-400">Registered on: {reg.regDate}</p>
                  </div>
                  <div className="flex items-start">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        reg.status === 'approved' 
                          ? 'bg-green-100 text-green-700' 
                          : reg.status === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {reg.status}
                    </span>
                  </div>
                </div>
                
                {reg.status === 'pending' && (
                  <div className="mt-3 flex gap-2 justify-end">
                    <Button
                      onClick={() => handleUpdateStatus(reg.id, 'approved')}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800"
                    >
                      <Check size={14} /> Approve
                    </Button>
                    <Button
                      onClick={() => handleUpdateStatus(reg.id, 'rejected')}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800"
                    >
                      <X size={14} /> Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-gray-500">No registrations yet</p>
          </div>
        )}
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default ManageRegistrationsPage;
