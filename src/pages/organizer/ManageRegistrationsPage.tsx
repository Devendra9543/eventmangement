
import React from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import BottomNavigation from '@/components/common/BottomNavigation';
import { Check, X } from 'lucide-react';

const ManageRegistrationsPage = () => {
  const { eventId } = useParams();
  
  // Mock data - in a real app this would come from API based on eventId
  const event = {
    id: eventId,
    title: 'Tech Workshop',
    date: '2023-08-15',
    registrationsCount: 24,
  };
  
  const registrations = [
    {
      id: '1',
      studentName: 'Alice Smith',
      email: 'alice@example.com',
      regDate: '2023-07-01',
      status: 'approved'
    },
    {
      id: '2',
      studentName: 'Bob Johnson',
      email: 'bob@example.com',
      regDate: '2023-07-02',
      status: 'pending'
    },
    {
      id: '3',
      studentName: 'Charlie Brown',
      email: 'charlie@example.com',
      regDate: '2023-07-03',
      status: 'pending'
    }
  ];
  
  return (
    <div className="min-h-screen pb-16 bg-gray-50">
      <PageHeader title="Manage Registrations" showBack={true} />
      
      <div className="p-4">
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h2 className="font-semibold text-lg">{event.title}</h2>
          <p className="text-sm text-gray-500">Date: {event.date}</p>
          <p className="text-sm font-medium mt-2">Total Registrations: {event.registrationsCount}</p>
        </div>
        
        <h3 className="font-medium mb-2 text-collegeBlue-900">Registration List</h3>
        
        <div className="space-y-3">
          {registrations.map((reg) => (
            <div
              key={reg.id}
              className="bg-white rounded-lg shadow p-4"
            >
              <div className="flex justify-between">
                <div>
                  <h4 className="font-medium">{reg.studentName}</h4>
                  <p className="text-sm text-gray-500">{reg.email}</p>
                  <p className="text-xs text-gray-400">Registered on: {reg.regDate}</p>
                </div>
                <div className="flex items-start">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      reg.status === 'approved' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {reg.status}
                  </span>
                </div>
              </div>
              
              {reg.status === 'pending' && (
                <div className="mt-3 flex gap-2 justify-end">
                  <button
                    className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-3 py-1 rounded"
                  >
                    <Check size={14} /> Approve
                  </button>
                  <button
                    className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-3 py-1 rounded"
                  >
                    <X size={14} /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default ManageRegistrationsPage;
