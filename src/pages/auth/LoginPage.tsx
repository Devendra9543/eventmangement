
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, userType, isAuthenticated, resendConfirmationEmail } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const redirectPath = userType === 'student' ? '/dashboard/student' : '/dashboard/organizer';
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, userType, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Please fill all fields',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await login(email, password, userType as any);
      
      if (!result.success && result.emailConfirmationNeeded) {
        setShowConfirmationDialog(true);
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    const success = await resendConfirmationEmail(email);
    if (success) {
      setShowConfirmationDialog(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-collegeBlue-50">
      <div className="p-4">
        <Button 
          onClick={() => navigate('/')} 
          variant="ghost"
          className="p-2"
        >
          <ArrowLeft size={20} />
        </Button>
      </div>
      
      <div className="flex-1 flex flex-col justify-center items-center p-6">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-center text-collegeBlue-900 mb-2">
            Login as {userType === 'student' ? 'Student' : 'Organizer'}
          </h1>
          <p className="text-center text-gray-600 mb-8">Enter your details to continue</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full p-3"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="password">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full p-3"
                required
              />
            </div>
            
            <Button
              type="submit"
              className="w-full bg-collegeBlue-500 hover:bg-collegeBlue-600 text-white py-3 rounded-lg"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
            
            <p className="text-center text-gray-600">
              Don't have an account?{' '}
              <Button
                variant="link"
                className="p-0 text-collegeBlue-600"
                onClick={() => navigate(userType === 'student' ? '/signup/student' : '/signup/organizer')}
              >
                Sign up
              </Button>
            </p>
          </form>
        </div>
      </div>

      {/* Email Confirmation Dialog */}
      <Dialog open={showConfirmationDialog} onOpenChange={setShowConfirmationDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Email Confirmation Required</DialogTitle>
            <DialogDescription>
              Your email hasn't been confirmed yet. Please check your inbox for the confirmation link.
              If you didn't receive it, you can request a new confirmation email.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between">
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmationDialog(false)}
              className="mb-2 sm:mb-0"
            >
              Close
            </Button>
            <Button 
              onClick={handleResendConfirmation}
              className="bg-collegeBlue-500 hover:bg-collegeBlue-600"
            >
              Resend Confirmation Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoginPage;
