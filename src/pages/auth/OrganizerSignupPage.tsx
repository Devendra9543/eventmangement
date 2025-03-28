
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useEvents } from '../../contexts/EventContext';

const OrganizerSignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { toast } = useToast();
  const { clubs } = useEvents();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    clubName: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClubChange = (value: string) => {
    setFormData(prev => ({ ...prev, clubName: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.fullName || !formData.email || !formData.mobile || 
        !formData.clubName || !formData.password) {
      toast({
        title: 'Error',
        description: 'Please fill all fields',
        variant: 'destructive',
      });
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await signup({
        fullName: formData.fullName,
        email: formData.email,
        mobile: formData.mobile,
        clubName: formData.clubName as any,
        userType: 'organizer'
      });
      
      if (success) {
        toast({
          title: 'Success',
          description: 'Account created successfully',
        });
        navigate('/dashboard/organizer');
      } else {
        toast({
          title: 'Error',
          description: 'Failed to create account',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-collegeBlue-50">
      <div className="p-4">
        <Button 
          onClick={() => navigate('/login')} 
          variant="ghost"
          className="p-2"
        >
          <ArrowLeft size={20} />
        </Button>
      </div>
      
      <div className="flex-1 flex flex-col justify-center items-center p-6">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-center text-collegeBlue-900 mb-2">
            Organizer Signup
          </h1>
          <p className="text-center text-gray-600 mb-8">Create your organizer account</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="fullName">
                Full Name
              </label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full p-3"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full p-3"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="mobile">
                Mobile Number
              </label>
              <Input
                id="mobile"
                name="mobile"
                type="tel"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="Enter your mobile number"
                className="w-full p-3"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Club Name
              </label>
              <Select onValueChange={handleClubChange}>
                <SelectTrigger className="w-full p-3">
                  <SelectValue placeholder="Select your club" />
                </SelectTrigger>
                <SelectContent>
                  {clubs.map((club) => (
                    <SelectItem key={club} value={club}>
                      {club}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="password">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                className="w-full p-3"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className="w-full p-3"
                required
              />
            </div>
            
            <Button
              type="submit"
              className="w-full bg-collegePurple-500 hover:bg-collegePurple-600 text-white py-3 rounded-lg mt-6"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
            
            <p className="text-center text-gray-600">
              Already have an account?{' '}
              <Button
                variant="link"
                className="p-0 text-collegeBlue-600"
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrganizerSignupPage;
