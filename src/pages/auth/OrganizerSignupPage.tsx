
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useEvents } from '../../contexts/EventContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const OrganizerSignupPage = () => {
  const navigate = useNavigate();
  const { signup, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { clubs } = useEvents();
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    mobile: '',
    club_name: '',
    club_role: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard/organizer', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClubChange = (value: string) => {
    setFormData(prev => ({ ...prev, club_name: value }));
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, club_role: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.full_name || !formData.email || !formData.mobile || 
        !formData.club_name || !formData.club_role || !formData.password) {
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
    setSignupEmail(formData.email);
    
    try {
      const success = await signup({
        full_name: formData.full_name,
        email: formData.email,
        mobile: formData.mobile,
        club_name: formData.club_name,
        club_role: formData.club_role,
        user_type: 'organizer'
      }, formData.password);
      
      if (success) {
        setShowSuccessDialog(true);
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

  // List of common roles in college clubs
  const clubRoles = [
    "President",
    "Secretary",
    "Treasurer",
    "Vice President",
    "Event Coordinator",
    "Technical Head",
    "Design Head",
    "Marketing Head",
    "Content Lead",
    "Member"
  ];

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
              <label className="text-sm font-medium text-gray-700" htmlFor="full_name">
                Full Name
              </label>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                value={formData.full_name}
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
              <label className="text-sm font-medium text-gray-700">
                Role in Club
              </label>
              <Select onValueChange={handleRoleChange}>
                <SelectTrigger className="w-full p-3">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  {clubRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
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

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Account Created Successfully!</DialogTitle>
            <DialogDescription>
              A confirmation email has been sent to <strong>{signupEmail}</strong>. 
              Please check your inbox and click the confirmation link to activate your account.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end mt-4">
            <Button 
              onClick={() => {
                setShowSuccessDialog(false);
                navigate('/login');
              }}
              className="bg-collegePurple-500 hover:bg-collegePurple-600"
            >
              Go to Login
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrganizerSignupPage;
