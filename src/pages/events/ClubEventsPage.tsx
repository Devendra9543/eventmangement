
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import CollegeBanner from '@/components/common/CollegeBanner';
import BottomNavigation from '@/components/common/BottomNavigation';
import { useEvents } from '@/contexts/EventContext';
import { Loader2 } from 'lucide-react';

interface CategoryCount {
  id: string;
  name: string;
  eventCount: number;
}

const ClubEventsPage = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const { getEventsByClub, loadingEvents } = useEvents();
  const [categories, setCategories] = useState<CategoryCount[]>([]);
  
  // Get the actual club name based on the clubId
  const getClubName = (id: string | undefined) => {
    const clubs: Record<string, string> = {
      'CSI': 'CSI Club',
      'ISTE': 'ISTE Club',
      'DEBUGGERS': 'Debuggers Club',
      // Add more clubs as needed
    };
    
    return clubs[id as string] || id || 'Club';
  };
  
  const clubName = getClubName(clubId);
  
  useEffect(() => {
    if (!loadingEvents && clubId) {
      // Get events for this club
      const clubEvents = getEventsByClub(clubId as any);
      
      // Count events by category
      const categoryMap = new Map<string, number>();
      
      clubEvents.forEach(event => {
        const category = event.category;
        const currentCount = categoryMap.get(category) || 0;
        categoryMap.set(category, currentCount + 1);
      });
      
      // Convert map to array for rendering
      const categoryCountArray: CategoryCount[] = Array.from(categoryMap.entries()).map(([id, count]) => ({
        id,
        name: id, // Use category name as display name
        eventCount: count
      }));
      
      setCategories(categoryCountArray);
    }
  }, [clubId, getEventsByClub, loadingEvents]);
  
  if (loadingEvents) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-collegeBlue-500" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pb-16 bg-gray-50">
      <CollegeBanner />
      <PageHeader title={clubName} showBack={true} showNotifications={true} />
      
      <div className="p-4">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-1 text-collegeBlue-900">Event Categories</h2>
          <p className="text-gray-500 text-sm">Select a category to view events</p>
        </div>
        
        {categories.length > 0 ? (
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
        ) : (
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <p className="text-gray-500">No events found for this club</p>
          </div>
        )}
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default ClubEventsPage;
