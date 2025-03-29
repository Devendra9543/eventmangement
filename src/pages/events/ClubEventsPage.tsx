
import React from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import CollegeBanner from '@/components/common/CollegeBanner';
import BottomNavigation from '@/components/common/BottomNavigation';

const ClubEventsPage = () => {
  const { clubId } = useParams();
  
  // Mock data - in a real app you would fetch this from an API
  const club = {
    id: clubId,
    name: "CSI Club",
    description: "Computer Society of India college chapter"
  };
  
  const categories = [
    { id: "tech", name: "Technical", eventCount: 4 },
    { id: "cultural", name: "Cultural", eventCount: 2 },
    { id: "workshop", name: "Workshop", eventCount: 3 }
  ];
  
  return (
    <div className="min-h-screen pb-16 bg-gray-50">
      <CollegeBanner />
      <PageHeader title={club.name} showBack={true} showNotifications={true} />
      
      <div className="p-4">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-1 text-collegeBlue-900">Event Categories</h2>
          <p className="text-gray-500 text-sm">Select a category to view events</p>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {categories.map((category) => (
            <a 
              key={category.id} 
              href={`/category/${clubId}/${category.id}`}
              className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
            >
              <div>
                <h3 className="font-medium">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.eventCount} events</p>
              </div>
              <span className="text-gray-400">→</span>
            </a>
          ))}
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default ClubEventsPage;
