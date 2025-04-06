
import React from 'react';
import { Star } from 'lucide-react';
import { Feedback } from '@/contexts/EventContext';

interface FeedbackDisplayProps {
  feedback: Feedback[];
  showUserInfo?: boolean;
}

const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({ 
  feedback,
  showUserInfo = false
}) => {
  // Calculate average rating
  const averageRating = feedback.length > 0
    ? feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length
    : 0;
    
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      {feedback.length > 0 ? (
        <>
          <div className="flex items-center space-x-2 mb-4">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= Math.round(averageRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium">
              {averageRating.toFixed(1)} / 5 ({feedback.length} {feedback.length === 1 ? 'review' : 'reviews'})
            </span>
          </div>

          <div className="space-y-4">
            {feedback.map((item) => (
              <div key={item.id} className="bg-white p-3 rounded-lg shadow">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= item.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(item.createdAt)}
                  </span>
                </div>
                
                {item.comment && (
                  <p className="text-sm text-gray-700 mt-1">{item.comment}</p>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-500">No feedback yet</p>
        </div>
      )}
    </div>
  );
};

export default FeedbackDisplay;
