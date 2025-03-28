
import React from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import BottomNavigation from '@/components/common/BottomNavigation';

const EventCategoryPage = () => {
  const { clubId, categoryId } = useParams();
  
  // Mock data - in a real app you would fetch this from an API
  const category = {
    id: categoryId,
    name: categoryId === 'tech' ? 'Technical' : categoryId === 'cultural' ? 'Cultural' : 'Workshop'
  };
  
  const events = [
    {
      id: "1",
      title: "Web Development Workshop",
      date: "Dec 15, 2023",
      time: "2:00 PM",
      location: "Room 301",
      organizerName: "CSI Club"
    },
    {
      id: "2",
      title: "Hackathon 2023",
      date: "Dec 20, 2023",
      time: "9:00 AM",
      location: "Computer Lab",
      organizerName: "CSI Club"
    },
    {
      id: "3",
      title: "AI Basics Workshop",
      date: "Jan 5, 2024",
      time: "11:00 AM",
      location: "Seminar Hall",
      organizerName: "CSI Club"
    }
  ];
  
  return (
    <div className="min-h-screen pb-16 bg-gray-50">
      <PageHeader title={category.name} showBack={true} showNotifications={true} />
      
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4 text-collegeBlue-900">Upcoming Events</h2>
        
        <div className="space-y-4">
          {events.map((event) => (
            <a 
              key={event.id} 
              href={`/event/${event.id}`}
              className="block bg-white p-4 rounded-lg shadow"
            >
              <div className="mb-2 h-32 bg-gray-200 rounded"></div>
              <h3 className="font-medium text-collegeBlue-900">{event.title}</h3>
              <p className="text-sm text-gray-500 mb-2">{event.organizerName}</p>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{event.date}, {event.time}</span>
                <span>{event.location}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default EventCategoryPage;
