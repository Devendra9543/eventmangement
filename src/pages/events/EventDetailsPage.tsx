
import React from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import BottomNavigation from '@/components/common/BottomNavigation';
import { Calendar, MapPin, Clock, Users, Tag } from 'lucide-react';

const EventDetailsPage = () => {
  const { eventId } = useParams();

  // This is mock data, in a real app you would fetch event details from your API
  const event = {
    id: eventId,
    title: "Sample Event",
    description: "This is a sample event description. It provides details about what the event is about, what participants can expect, and any other relevant information.",
    date: "2023-12-15",
    time: "14:00 - 17:00",
    location: "College Auditorium",
    capacity: 100,
    registered: 45,
    price: 150,
    organizerName: "CSI Club",
    category: "Technical"
  };

  return (
    <div className="min-h-screen pb-16 bg-gray-50">
      <PageHeader title="Event Details" showBack={true} />
      
      <div className="p-4">
        <div className="mb-4">
          <div className="h-48 bg-gray-300 rounded-lg mb-4"></div>
          <h1 className="text-2xl font-bold text-collegeBlue-900">{event.title}</h1>
          <p className="text-sm text-collegePurple-500 mb-2">{event.organizerName}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <h2 className="text-lg font-semibold mb-3">Details</h2>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <Calendar size={18} className="text-gray-500 mr-3" />
              <span>{event.date}</span>
            </div>
            
            <div className="flex items-center">
              <Clock size={18} className="text-gray-500 mr-3" />
              <span>{event.time}</span>
            </div>
            
            <div className="flex items-center">
              <MapPin size={18} className="text-gray-500 mr-3" />
              <span>{event.location}</span>
            </div>
            
            <div className="flex items-center">
              <Users size={18} className="text-gray-500 mr-3" />
              <span>{event.registered} / {event.capacity} registered</span>
            </div>
            
            <div className="flex items-center">
              <Tag size={18} className="text-gray-500 mr-3" />
              <span>{event.category}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-2">About</h2>
          <p className="text-gray-700">{event.description}</p>
        </div>
        
        <div className="fixed bottom-20 left-4 right-4">
          <button className="w-full bg-collegeBlue-500 text-white py-3 rounded-lg font-medium text-center">
            Register Now - ₹{event.price}
          </button>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default EventDetailsPage;
