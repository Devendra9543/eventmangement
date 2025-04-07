
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Event } from '../../contexts/EventContext';

interface EventCardProps {
  event: Event;
  isCompact?: boolean;
}

const EventCard = ({ event, isCompact = false }: EventCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/event/${event.id}`);
  };

  if (isCompact) {
    return (
      <div 
        className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={handleClick}
      >
        <div className="p-3">
          <h3 className="font-medium text-gray-900 line-clamp-1">{event.title}</h3>
          <div className="flex items-center text-xs text-gray-500 mt-1">
            <Calendar size={12} className="mr-1" />
            {new Date(event.date).toLocaleDateString()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleClick}
    >
      {event.imageUrl && (
        <div className="h-32 w-full bg-gray-200 overflow-hidden">
          <img 
            src={event.imageUrl} 
            alt={event.title} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg text-gray-900">{event.title}</h3>
          <span className="text-collegeTeal-500 font-semibold">₹{event.price}</span>
        </div>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{event.description}</p>
        
        <div className="mt-3 space-y-1">
          <div className="flex items-center text-sm text-gray-500">
            <Calendar size={16} className="mr-2" />
            {new Date(event.date).toLocaleDateString()} at {event.time}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <MapPin size={16} className="mr-2" />
            {event.location}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Users size={16} className="mr-2" />
            {event.currentAttendees}/{event.maxAttendees} Registered
          </div>
        </div>
        
        <div className="mt-3 flex justify-between items-center">
          <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-700">
            {event.club} • {event.category}
          </span>
          {event.currentAttendees >= event.maxAttendees ? (
            <span className="text-xs px-3 py-1 bg-red-100 text-red-800 rounded-full">
              Full
            </span>
          ) : (
            <span className="text-xs px-3 py-1 bg-green-100 text-green-800 rounded-full">
              Available
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
