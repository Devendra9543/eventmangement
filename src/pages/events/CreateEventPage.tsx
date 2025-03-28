
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useEvents } from '../../contexts/EventContext';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/common/PageHeader';
import BottomNavigation from '@/components/common/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

const CreateEventPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createEvent, categories } = useEvents();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: '',
    price: '',
    maxAttendees: '',
    dueDate: '', // Added due date field
    imageUrl: '/assets/events/default.jpg', // Default image
  });
  
  const [isLoading, setIsLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || user.userType !== 'organizer' || !user.clubName) {
      toast({
        title: 'Error',
        description: 'You must be logged in as an organizer to create events',
        variant: 'destructive',
      });
      return;
    }
    
    // Validate all fields
    if (!formData.title || !formData.description || !formData.date || 
        !formData.time || !formData.location || !formData.category || 
        !formData.price || !formData.maxAttendees || !formData.dueDate) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    // Validate dates
    const eventDate = new Date(formData.date);
    const dueDate = new Date(formData.dueDate);
    const today = new Date();
    
    if (dueDate < today) {
      toast({
        title: 'Error',
        description: 'Due date cannot be in the past',
        variant: 'destructive',
      });
      return;
    }
    
    if (eventDate <= dueDate) {
      toast({
        title: 'Error',
        description: 'Due date must be before the event date',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await createEvent({
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        club: user.clubName as any,
        category: formData.category as any,
        price: Number(formData.price),
        organizerId: user.id,
        maxAttendees: Number(formData.maxAttendees),
        currentAttendees: 0,
        imageUrl: formData.imageUrl,
        dueDate: formData.dueDate, // Added due date
      });
      
      if (success) {
        toast({
          title: 'Success',
          description: 'Event created successfully',
        });
        navigate('/manage-events');
      } else {
        toast({
          title: 'Error',
          description: 'Failed to create event',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen pb-16 bg-gray-50">
      <PageHeader title="Create Event" showBack={true} />
      
      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Event Title</label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter event title"
              required
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">Description</label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter event description"
              rows={4}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Event Date</label>
              <Input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Event Time</label>
              <Input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">Due Date for Registration</label>
            <Input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              required
            />
            <p className="text-xs text-gray-500 mt-1">Registration will close on this date</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">Location</label>
            <Input
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter event location"
              required
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">Category</label>
            <Select 
              onValueChange={(value) => handleSelectChange('category', value)} 
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Price (₹)</label>
              <Input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                placeholder="0"
                required
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Max Attendees</label>
              <Input
                type="number"
                name="maxAttendees"
                value={formData.maxAttendees}
                onChange={handleChange}
                min="1"
                placeholder="50"
                required
              />
            </div>
          </div>
          
          <Button
            type="submit"
            className="w-full bg-collegeBlue-500 hover:bg-collegeBlue-600 text-white"
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Event'}
          </Button>
        </form>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default CreateEventPage;
