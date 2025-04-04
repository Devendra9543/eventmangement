
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useEvents } from '../../contexts/EventContext';
import { ExtendedUser } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PageHeader from '@/components/common/PageHeader';
import BottomNavigation from '@/components/common/BottomNavigation';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Upload, ImageIcon, Loader2 } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

const CreateEventPage = () => {
  const navigate = useNavigate();
  const { user, userType, profile } = useAuth();
  const extendedUser = user as ExtendedUser | null;
  const { createEvent, categories } = useEvents();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: '',
    price: '',
    maxAttendees: '',
    dueDate: '', 
    imageUrl: '/assets/events/default.jpg', 
  });
  
  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create events",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    if (userType !== 'organizer') {
      toast({
        title: "Access Denied",
        description: "Only organizers can create events",
        variant: "destructive",
      });
      navigate('/dashboard/student');
      return;
    }

    if (profile) {
      console.log("Profile data in create event:", profile);
      setIsLoading(false);
    } else {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [user, userType, navigate, profile, toast]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'Image file size must be less than 5MB',
        variant: 'destructive',
      });
      return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'File must be an image',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setUploadingImage(true);
      
      // Generate a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `events/${fileName}`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('event-images')
        .upload(filePath, file);
      
      if (error) throw error;
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath);
      
      setFormData(prev => ({ 
        ...prev, 
        imageUrl: publicUrlData.publicUrl 
      }));
      
      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
      });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: error.message || 'Error uploading image',
        variant: 'destructive',
      });
    } finally {
      setUploadingImage(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || userType !== 'organizer') {
      toast({
        title: 'Error',
        description: 'You must be logged in as an organizer to create events',
        variant: 'destructive',
      });
      return;
    }

    if (!profile?.club_name) {
      toast({
        title: 'Warning',
        description: 'Your club name is not set. Please update your profile after creating this event.',
        variant: 'default',
      });
    }
    
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
      const clubName = profile?.club_name || 'Unnamed Club';
      
      const success = await createEvent({
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        club: clubName as any,
        category: formData.category as any,
        price: Number(formData.price),
        organizerId: user.id,
        maxAttendees: Number(formData.maxAttendees),
        currentAttendees: 0,
        imageUrl: formData.imageUrl,
        dueDate: formData.dueDate, 
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
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }
  
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

          <div>
            <label className="text-sm font-medium text-gray-700">Event Image</label>
            <div className="mt-1 flex items-center">
              <div className="w-full">
                {formData.imageUrl && formData.imageUrl !== '/assets/events/default.jpg' ? (
                  <div className="relative">
                    <img 
                      src={formData.imageUrl}
                      alt="Event preview"
                      className="h-40 w-full object-cover rounded-md"
                    />
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-40 bg-gray-100 rounded-md border-2 border-dashed border-gray-300">
                    <ImageIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                
                <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-md bg-collegeBlue-500 px-4 py-2 text-sm font-medium text-white hover:bg-collegeBlue-600">
                  {uploadingImage ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload Image
                    </>
                  )}
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                </label>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Recommended: JPG, PNG or GIF. Max size: 5MB
            </p>
          </div>
          
          <Button
            type="submit"
            className="w-full bg-collegeBlue-500 hover:bg-collegeBlue-600 text-white"
            disabled={isLoading || uploadingImage}
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
