
import React, { useState } from 'react';
import { Star, StarHalf } from 'lucide-react';
import { useEvents } from '../../contexts/EventContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { toast } from '../../hooks/use-toast';

interface FeedbackFormProps {
  eventId: string;
  onSubmit: () => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ eventId, onSubmit }) => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const { submitFeedback } = useEvents();
  const { user } = useAuth();

  const handleRatingClick = (value: number) => {
    setRating(value);
  };

  const renderStars = () => {
    return Array(5).fill(0).map((_, index) => (
      <button
        key={index}
        type="button"
        onClick={() => handleRatingClick(index + 1)}
        className="focus:outline-none"
      >
        {index + 1 <= rating ? (
          <Star className="w-8 h-8 text-amber-400 fill-amber-400" />
        ) : (
          <Star className="w-8 h-8 text-gray-300" />
        )}
      </button>
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit feedback",
        variant: "destructive"
      });
      return;
    }
    
    if (rating === 0) {
      toast({
        title: "Error",
        description: "Please select a rating",
        variant: "destructive"
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      await submitFeedback(eventId, rating, comment);
      toast({
        title: "Success",
        description: "Your feedback has been submitted",
        variant: "default"
      });
      onSubmit();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-lg p-4 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Rate Your Experience</h3>
      
      <div className="flex space-x-1 justify-center">
        {renderStars()}
      </div>
      
      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
          Comments (Optional)
        </label>
        <Textarea
          id="comment"
          placeholder="Share your thoughts about the event..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="min-h-[100px]"
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full gradient-bg hover:opacity-90 text-white"
        disabled={submitting || rating === 0}
      >
        {submitting ? 'Submitting...' : 'Submit Feedback'}
      </Button>
    </form>
  );
};

export default FeedbackForm;
