
import React from 'react';
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

const AnalyticsPage = () => {
  // Mock data - would come from API in a real app
  const eventData = [
    { name: 'Tech Workshop', registrations: 45 },
    { name: 'Cultural Night', registrations: 78 },
    { name: 'Coding Competition', registrations: 62 },
    { name: 'Seminar', registrations: 25 }
  ];
  
  const monthlyData = [
    { month: 'Jan', events: 2, participants: 85 },
    { month: 'Feb', events: 3, participants: 120 },
    { month: 'Mar', events: 1, participants: 40 },
    { month: 'Apr', events: 4, participants: 180 },
    { month: 'May', events: 2, participants: 95 }
  ];
  
  const stats = {
    totalEvents: 12,
    totalRegistrations: 523,
    avgAttendance: 43.6,
    popularEvent: 'Cultural Night',
    maxRegistrations: 78
  };
  
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
            <h3 className="text-xs text-gray-500">Most Popular</h3>
            <p className="text-lg font-bold text-collegeBlue-700 truncate">{stats.popularEvent}</p>
          </div>
        </div>
        
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
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default AnalyticsPage;
