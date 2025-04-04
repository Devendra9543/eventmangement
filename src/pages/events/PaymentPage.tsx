
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useEvents } from '@/contexts/EventContext';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/common/PageHeader';
import BottomNavigation from '@/components/common/BottomNavigation';
import { CreditCard, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';

const PaymentPage = () => {
  const { eventId } = useParams();
  const [searchParams] = useSearchParams();
  const amount = searchParams.get('amount');
  const navigate = useNavigate();
  const { getEventById, loadingEvents } = useEvents();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [event, setEvent] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to make payment",
      });
      navigate('/login');
      return;
    }
    
    if (eventId && !loadingEvents) {
      const eventData = getEventById(eventId);
      if (eventData) {
        setEvent(eventData);
      } else {
        toast({
          title: "Error",
          description: "Event not found",
          variant: "destructive",
        });
        navigate('/dashboard/student');
      }
    }
  }, [eventId, getEventById, loadingEvents, isAuthenticated, navigate, toast]);
  
  const handlePayment = async () => {
    if (!event || !user) return;
    
    setProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      // Simulate successful payment
      setPaymentStatus('success');
      setProcessing(false);
      
      toast({
        title: "Payment Successful",
        description: `You have successfully paid ₹${amount} for ${event.title}`,
      });
    }, 2000);
  };
  
  const handleReturn = () => {
    if (paymentStatus === 'success') {
      navigate('/dashboard/student');
    } else {
      navigate(`/event/${eventId}`);
    }
  };
  
  if (loadingEvents) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-collegeBlue-500" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pb-16 bg-gray-50">
      <PageHeader title="Payment" showBack={true} />
      
      <div className="p-4">
        {paymentStatus === 'success' ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your payment of ₹{amount}. Your registration for {event?.title} is confirmed.
            </p>
            <Button 
              onClick={handleReturn} 
              className="bg-collegeBlue-500 hover:bg-collegeBlue-600 text-white"
            >
              Return to Dashboard
            </Button>
          </div>
        ) : paymentStatus === 'failed' ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-600 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-6">
              We couldn't process your payment. Please try again or contact support.
            </p>
            <Button 
              onClick={handleReturn} 
              className="bg-collegeBlue-500 hover:bg-collegeBlue-600 text-white"
            >
              Back to Event
            </Button>
          </div>
        ) : (
          <>
            {event && (
              <div className="bg-white rounded-lg shadow mb-4 overflow-hidden">
                <div className="p-4 bg-collegeBlue-50">
                  <h2 className="text-lg font-semibold">{event.title}</h2>
                  <p className="text-sm text-gray-500">{formatDate(event.date)} • {event.time}</p>
                </div>
                
                <div className="p-4 border-t border-gray-100">
                  <div className="flex justify-between mb-2">
                    <span>Registration Fee</span>
                    <span>₹{amount}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t border-gray-100">
                    <span>Total Amount</span>
                    <span>₹{amount}</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <h3 className="font-semibold mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-collegeBlue-500" />
                Payment Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    maxLength={19}
                    // This is a mock implementation, no actual payment processing
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      maxLength={5}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      maxLength={3}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Card Holder Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
            
            <div className="fixed bottom-20 left-4 right-4">
              <Button 
                onClick={handlePayment}
                className="w-full bg-collegeBlue-500 hover:bg-collegeBlue-600 text-white py-3 rounded-lg font-medium text-center"
                disabled={processing}
              >
                {processing ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Processing...
                  </div>
                ) : (
                  `Pay ₹${amount}`
                )}
              </Button>
            </div>
          </>
        )}
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default PaymentPage;
