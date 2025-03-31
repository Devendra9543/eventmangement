
import React from 'react';
import { useNavigate } from 'react-router-dom';
import CollegeBanner from '@/components/common/CollegeBanner';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-collegeBlue-50">
      <CollegeBanner />
      
      <div className="flex-1 flex flex-col justify-center items-center p-6">
        <div className="w-full max-w-md text-center">
          <h1 className="text-3xl font-bold mb-4 text-collegeBlue-900">Student Organizer Connect</h1>
          <p className="text-xl text-gray-600 mb-8">Connect with campus events and activities</p>
          
          <div className="space-y-4">
            <Button 
              onClick={() => navigate('/user-type-selection')}
              className="w-full bg-collegeBlue-500 hover:bg-collegeBlue-600 text-white py-3 rounded-lg"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
