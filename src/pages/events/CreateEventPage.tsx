
import React from 'react';
import PageHeader from '@/components/common/PageHeader';
import BottomNavigation from '@/components/common/BottomNavigation';
import { Calendar, Clock, MapPin, Tag, AlertCircle, CreditCard, Users } from 'lucide-react';

const CreateEventPage = () => {
  return (
    <div className="min-h-screen pb-16 bg-gray-50">
      <PageHeader title="Create Event" showBack={true} />
      
      <div className="p-4">
        <form className="space-y-4">
          {/* Event Title */}
          <div className="bg-white p-4 rounded-lg shadow">
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
            <input 
              type="text" 
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Enter event title"
            />
          </div>
          
          {/* Event Description */}
          <div className="bg-white p-4 rounded-lg shadow">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              className="w-full p-2 border border-gray-300 rounded"
              rows={4}
              placeholder="Describe your event"
            />
          </div>
          
          {/* Event Date and Time */}
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="mb-3">
              <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <Calendar size={16} className="mr-1" />
                Date
              </label>
              <input 
                type="date" 
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <Clock size={16} className="mr-1" />
                Time
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="time" 
                  className="p-2 border border-gray-300 rounded"
                  placeholder="Start Time"
                />
                <input 
                  type="time" 
                  className="p-2 border border-gray-300 rounded"
                  placeholder="End Time"
                />
              </div>
            </div>
          </div>
          
          {/* Location */}
          <div className="bg-white p-4 rounded-lg shadow">
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <MapPin size={16} className="mr-1" />
              Location
            </label>
            <input 
              type="text" 
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Enter event location"
            />
          </div>
          
          {/* Category */}
          <div className="bg-white p-4 rounded-lg shadow">
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <Tag size={16} className="mr-1" />
              Category
            </label>
            <select className="w-full p-2 border border-gray-300 rounded">
              <option value="">Select a category</option>
              <option value="technical">Technical</option>
              <option value="cultural">Cultural</option>
              <option value="sports">Sports</option>
              <option value="workshop">Workshop</option>
            </select>
          </div>
          
          {/* Capacity */}
          <div className="bg-white p-4 rounded-lg shadow">
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <Users size={16} className="mr-1" />
              Maximum Capacity
            </label>
            <input 
              type="number" 
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Enter max participants"
            />
          </div>
          
          {/* Price */}
          <div className="bg-white p-4 rounded-lg shadow">
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <CreditCard size={16} className="mr-1" />
              Registration Fee (₹)
            </label>
            <input 
              type="number" 
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="0 for free events"
            />
          </div>
          
          {/* Image Upload */}
          <div className="bg-white p-4 rounded-lg shadow">
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Banner Image</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <p className="text-gray-500">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-400">PNG, JPG (max. 2MB)</p>
            </div>
          </div>
          
          <div className="h-4"></div>
          
          <button type="submit" className="fixed bottom-20 left-4 right-4 bg-collegeBlue-500 text-white py-3 rounded-lg font-medium">
            Create Event
          </button>
        </form>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default CreateEventPage;
