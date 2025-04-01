
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import CollegeBanner from '@/components/common/CollegeBanner';

const UserTypeSelection = () => {
  const navigate = useNavigate();
  const { setUserTypeBeforeAuth } = useAuth();

  const handleUserTypeSelection = (type: 'student' | 'organizer') => {
    setUserTypeBeforeAuth(type);
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-collegeBlue-50">
      <CollegeBanner />
      
      <div className="flex-1 flex flex-col justify-center items-center p-6 pt-20">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-center text-collegeBlue-900 mb-2">Welcome</h1>
          <p className="text-center text-gray-600 mb-8">Log in or sign up as</p>
          
          <div className="space-y-4">
            <Button 
              onClick={() => handleUserTypeSelection('student')}
              className="w-full flex items-center justify-between p-6 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 rounded-xl shadow-sm"
              variant="outline"
            >
              <div className="flex items-center">
                <GraduationCap size={24} className="text-collegeBlue-500 mr-3" />
                <span className="text-lg font-medium">Student</span>
              </div>
              <span className="text-gray-400">→</span>
            </Button>
            
            <Button 
              onClick={() => handleUserTypeSelection('organizer')}
              className="w-full flex items-center justify-between p-6 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 rounded-xl shadow-sm"
              variant="outline"
            >
              <div className="flex items-center">
                <Users size={24} className="text-collegePurple-500 mr-3" />
                <span className="text-lg font-medium">Organizer</span>
              </div>
              <span className="text-gray-400">→</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserTypeSelection;
