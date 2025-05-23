
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useEvents } from '@/contexts/EventContext';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/common/PageHeader';
import BottomNavigation from '@/components/common/BottomNavigation';
import { IndianRupee, CheckCircle, XCircle, Loader2 } from 'lucide-react';
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
  const [upiId, setUpiId] = useState('');
  
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
    if (!event || !user || !upiId.trim()) {
      toast({
        title: "Invalid UPI ID",
        description: "Please enter a valid UPI ID",
        variant: "destructive",
      });
      return;
    }
    
    setProcessing(true);
    
    // Prepare payment amount - use event price if amount param is not available
    const paymentAmount = amount || (event?.price?.toString() || '0');
    
    try {
      // Create a UPI deep link
      const upiPaymentLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent("College Events")}&am=${paymentAmount}&cu=INR&tn=${encodeURIComponent(`Payment for ${event.title}`)}`;
      
      console.log("UPI Payment link:", upiPaymentLink);
      
      // Create a hidden anchor element to trigger the deep link
      const linkElement = document.createElement('a');
      linkElement.href = upiPaymentLink;
      linkElement.style.display = 'none';
      document.body.appendChild(linkElement);
      
      // Click the link to open the UPI app
      linkElement.click();
      
      // Remove the link element
      document.body.removeChild(linkElement);
      
      // Simulate payment verification - in a real app, you would implement a callback
      // or check the payment status on your server
      setTimeout(() => {
        // Handle case where user might have canceled or payment failed
        // Prompt the user to confirm if payment was successful
        const confirmed = window.confirm("Did you complete the payment in your UPI app?");
        
        if (confirmed) {
          setPaymentStatus('success');
          toast({
            title: "Payment Successful",
            description: `You have successfully paid ₹${paymentAmount} for ${event.title}`,
          });
        } else {
          setPaymentStatus('failed');
          toast({
            title: "Payment Canceled",
            description: "You did not complete the payment",
            variant: "destructive",
          });
        }
        
        setProcessing(false);
      }, 5000); // Give user some time to complete payment in the UPI app
      
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentStatus('failed');
      setProcessing(false);
      
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment",
        variant: "destructive",
      });
    }
  };
  
  const handleReturn = () => {
    if (paymentStatus === 'success') {
      navigate('/dashboard/student');
    } else {
      navigate(`/event/${eventId}`);
    }
  };
  
  const isValidUpiId = (upiId: string) => {
    // Basic UPI ID validation (username@provider format)
    const upiRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+$/;
    return upiRegex.test(upiId);
  };
  
  // Get payment amount - use event price if amount param is not available
  const getPaymentAmount = () => {
    if (amount) return amount;
    return event?.price?.toString() || '0';
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
              Thank you for your payment of ₹{getPaymentAmount()}. Your registration for {event?.title} is confirmed.
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
                    <span>₹{getPaymentAmount()}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t border-gray-100">
                    <span>Total Amount</span>
                    <span>₹{getPaymentAmount()}</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <h3 className="font-semibold mb-4 flex items-center">
                <IndianRupee className="h-5 w-5 mr-2 text-collegeBlue-500" />
                UPI Payment
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Enter UPI ID</label>
                  <input
                    type="text"
                    placeholder="yourname@upi"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-collegeBlue-500"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Example: yourname@okhdfcbank, username@ybl
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2 justify-center">
                  {/* UPI App options */}
                  <div className="flex items-center justify-center bg-gray-50 p-2 rounded-md w-20 h-20 border border-gray-200">
                    <div className="text-center">
                      <div className="w-8 h-8 mx-auto bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">GPay</span>
                      </div>
                      <p className="text-xs mt-1">Google Pay</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center bg-gray-50 p-2 rounded-md w-20 h-20 border border-gray-200">
                    <div className="text-center">
                      <div className="w-8 h-8 mx-auto bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">PhPe</span>
                      </div>
                      <p className="text-xs mt-1">PhonePe</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center bg-gray-50 p-2 rounded-md w-20 h-20 border border-gray-200">
                    <div className="text-center">
                      <div className="w-8 h-8 mx-auto bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">PM</span>
                      </div>
                      <p className="text-xs mt-1">Paytm</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center bg-gray-50 p-2 rounded-md w-20 h-20 border border-gray-200">
                    <div className="text-center">
                      <div className="w-8 h-8 mx-auto bg-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">AM</span>
                      </div>
                      <p className="text-xs mt-1">Amazon Pay</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="fixed bottom-20 left-4 right-4">
              <Button 
                onClick={handlePayment}
                className="w-full bg-collegeBlue-500 hover:bg-collegeBlue-600 text-white py-3 rounded-lg font-medium text-center"
                disabled={processing || !isValidUpiId(upiId)}
              >
                {processing ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Processing...
                  </div>
                ) : (
                  "Pay"
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
