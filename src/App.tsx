
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Contexts
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { EventProvider } from "./contexts/EventContext";

// Pages
import LoginPage from "./pages/auth/LoginPage";
import StudentSignupPage from "./pages/auth/StudentSignupPage";
import OrganizerSignupPage from "./pages/auth/OrganizerSignupPage";
import UserTypeSelection from "./pages/auth/UserTypeSelection";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import OrganizerDashboard from "./pages/dashboard/OrganizerDashboard";
import EventDetailsPage from "./pages/events/EventDetailsPage";
import CreateEventPage from "./pages/events/CreateEventPage";
import EditEventPage from "./pages/events/EditEventPage";
import ClubEventsPage from "./pages/events/ClubEventsPage";
import EventCategoryPage from "./pages/events/EventCategoryPage";
import PaymentPage from "./pages/events/PaymentPage";
import NotificationsPage from "./pages/notifications/NotificationsPage";
import ProfilePage from "./pages/profile/ProfilePage";
import ManageEventsPage from "./pages/organizer/ManageEventsPage";
import ManageRegistrationsPage from "./pages/organizer/ManageRegistrationsPage";
import AnalyticsPage from "./pages/organizer/AnalyticsPage";
import EventFeedbackPage from "./pages/organizer/EventFeedbackPage";
import NotFound from "./pages/NotFound";

// Create a new QueryClient instance outside the component
const queryClient = new QueryClient();

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <NotificationProvider>
            <EventProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Redirect root to user type selection */}
                  <Route path="/" element={<Navigate to="/user-type-selection" replace />} />
                  
                  {/* Auth Routes */}
                  <Route path="/user-type-selection" element={<UserTypeSelection />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup/student" element={<StudentSignupPage />} />
                  <Route path="/signup/organizer" element={<OrganizerSignupPage />} />
                  
                  {/* Student Routes */}
                  <Route path="/dashboard/student" element={<StudentDashboard />} />
                  <Route path="/clubs/:clubId" element={<ClubEventsPage />} />
                  <Route path="/category/:clubId/:categoryId" element={<EventCategoryPage />} />
                  <Route path="/event/:eventId" element={<EventDetailsPage />} />
                  <Route path="/payment/:eventId" element={<PaymentPage />} />
                  
                  {/* Organizer Routes */}
                  <Route path="/dashboard/organizer" element={<OrganizerDashboard />} />
                  <Route path="/create-event" element={<CreateEventPage />} />
                  <Route path="/edit-event/:eventId" element={<EditEventPage />} />
                  <Route path="/manage-events" element={<ManageEventsPage />} />
                  <Route path="/manage-registrations/:eventId" element={<ManageRegistrationsPage />} />
                  <Route path="/event-feedback/:eventId" element={<EventFeedbackPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  
                  {/* Common Routes */}
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  
                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </EventProvider>
          </NotificationProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;
