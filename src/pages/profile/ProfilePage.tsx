
import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/common/PageHeader';
import BottomNavigation from '@/components/common/BottomNavigation';
import { User, Mail, Phone, Book, LogOut, Edit, ChevronRight, Users, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const ProfilePage = () => {
  const { userType, logout, profile, isAuthenticated, updateUser } = useAuth();
  const navigate = useNavigate();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [notificationSettingsOpen, setNotificationSettingsOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!isAuthenticated) {
      console.log("User not authenticated, redirecting to login");
      navigate('/login');
    } else if (profile) {
      console.log("Profile data loaded:", profile);
      setIsLoading(false);
    } else {
      console.log("Waiting for profile data to load...");
      const timer = setTimeout(() => {
        if (!profile) {
          console.log("Profile data still not loaded after timeout");
          toast({
            title: "Error loading profile",
            description: "Please try refreshing the page",
            variant: "destructive",
          });
          setIsLoading(false);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [profile, isAuthenticated, navigate, toast]);

  // Define the form schema based on user type
  const formSchema = userType === 'student'
    ? z.object({
        full_name: z.string().min(2, { message: "Name must be at least 2 characters." }),
        mobile: z.string().min(10, { message: "Please enter a valid phone number." }),
        class_branch: z.string().min(2, { message: "Please enter a valid class/branch." })
      })
    : z.object({
        full_name: z.string().min(2, { message: "Name must be at least 2 characters." }),
        mobile: z.string().min(10, { message: "Please enter a valid phone number." }),
        club_name: z.string().min(2, { message: "Please enter a valid club name." }),
        club_role: z.string().min(2, { message: "Please enter a valid role." })
      });

  // Initialize the form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: profile?.full_name || "",
      mobile: profile?.mobile || "",
      class_branch: profile?.class_branch || "",
      club_name: profile?.club_name || "",
      club_role: profile?.club_role || ""
    }
  });

  // Update form values when profile data loads
  useEffect(() => {
    if (profile) {
      console.log("Updating form with profile data:", profile);
      form.reset({
        full_name: profile.full_name || "",
        mobile: profile.mobile || "",
        class_branch: profile.class_branch || "",
        club_name: profile.club_name || "",
        club_role: profile.club_role || ""
      });
    }
  }, [profile, form]);
  
  // Prepare user data object with defaults to prevent undefined values
  const userData = {
    name: profile?.full_name || "Unknown User",
    email: profile?.email || "No email provided",
    phone: profile?.mobile || "No phone number provided",
    department: userType === 'student' ? (profile?.class_branch || "No department") : null,
    clubName: userType === 'organizer' ? (profile?.club_name || "No club") : null,
    clubRole: userType === 'organizer' ? (profile?.club_role || "No role") : null
  };

  console.log("Current userData object:", userData);

  const handleEditProfile = async (data: any) => {
    try {
      console.log("Updating profile with data:", data);
      const updatedFields = userType === 'student' 
        ? {
            full_name: data.full_name,
            mobile: data.mobile,
            class_branch: data.class_branch
          }
        : {
            full_name: data.full_name,
            mobile: data.mobile,
            club_name: data.club_name,
            club_role: data.club_role
          };

      const success = await updateUser(updatedFields);
      
      if (success) {
        toast({
          title: "Profile Updated",
          description: "Your profile information has been updated successfully",
        });
        setEditProfileOpen(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleLogoutConfirm = async () => {
    await logout();
    navigate('/');
    setLogoutDialogOpen(false);
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Missing information",
        description: "Please fill all password fields",
        variant: "destructive"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "New password and confirmation don't match",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Password updated",
      description: "Your password has been changed successfully",
    });
    
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setChangePasswordOpen(false);
  };

  const toggleNotifications = (type: string, enabled: boolean) => {
    toast({
      title: `${type} notifications ${enabled ? 'enabled' : 'disabled'}`,
      description: `You will ${enabled ? 'now' : 'no longer'} receive ${type.toLowerCase()} notifications`,
    });
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
      <PageHeader title="Profile" showBack={true} />
      
      <div className="p-4">
        <div className="bg-white rounded-lg shadow overflow-hidden mb-4">
          <div className="bg-collegeBlue-500 p-6 flex items-center">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
                <User size={40} className="text-collegeBlue-500" />
              </div>
            </div>
            <div className="ml-4">
              <h2 className="text-white text-xl font-bold">{userData.name}</h2>
              <p className="text-collegeBlue-100">{userType === 'student' ? 'Student' : 'Organizer'}</p>
            </div>
            <button 
              className="ml-auto bg-white/20 p-2 rounded-full"
              onClick={() => setEditProfileOpen(true)}
            >
              <Edit size={16} className="text-white" />
            </button>
          </div>
          
          <div className="divide-y divide-gray-100">
            <div className="flex items-center py-3 px-4">
              <Mail size={18} className="text-gray-500 mr-3" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p>{userData.email}</p>
              </div>
            </div>
            
            <div className="flex items-center py-3 px-4">
              <Phone size={18} className="text-gray-500 mr-3" />
              <div>
                <p className="text-xs text-gray-500">Phone Number</p>
                <p>{userData.phone}</p>
              </div>
            </div>
            
            {userType === 'student' && (
              <div className="flex items-center py-3 px-4">
                <Book size={18} className="text-gray-500 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Department</p>
                  <p>{userData.department}</p>
                </div>
              </div>
            )}
            
            {userType === 'organizer' && userData.clubName && (
              <div className="flex items-center py-3 px-4">
                <Users size={18} className="text-gray-500 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Club</p>
                  <p>{userData.clubName}</p>
                </div>
              </div>
            )}
            
            {userType === 'organizer' && userData.clubRole && (
              <div className="flex items-center py-3 px-4">
                <Users size={18} className="text-gray-500 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Role</p>
                  <p>{userData.clubRole}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden mb-4">
          <div className="divide-y divide-gray-100">
            <button 
              onClick={() => setChangePasswordOpen(true)}
              className="w-full flex items-center justify-between py-3 px-4 text-left"
            >
              <span>Change Password</span>
              <ChevronRight size={18} className="text-gray-400" />
            </button>
            
            <button 
              onClick={() => setNotificationSettingsOpen(true)}
              className="w-full flex items-center justify-between py-3 px-4 text-left"
            >
              <span>Notification Settings</span>
              <ChevronRight size={18} className="text-gray-400" />
            </button>
          </div>
        </div>
        
        <button 
          onClick={() => setLogoutDialogOpen(true)}
          className="mt-4 flex items-center justify-center w-full py-3 text-red-500 bg-white rounded-lg shadow"
        >
          <LogOut size={18} className="mr-2" />
          <span>Logout</span>
        </button>
      </div>
      
      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and a new password below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="current-password" className="text-sm font-medium">Current Password</label>
              <Input 
                id="current-password" 
                type="password" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="new-password" className="text-sm font-medium">New Password</label>
              <Input 
                id="new-password" 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-sm font-medium">Confirm New Password</label>
              <Input 
                id="confirm-password" 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangePasswordOpen(false)}>Cancel</Button>
            <Button onClick={handleChangePassword}>Update Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditProfile)} className="space-y-4 py-2">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter your full name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter your phone number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {userType === 'student' && (
                <FormField
                  control={form.control}
                  name="class_branch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department/Branch</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter your department or branch" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {userType === 'organizer' && (
                <>
                  <FormField
                    control={form.control}
                    name="club_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Club Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter your club name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="club_role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter your role in the club" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setEditProfileOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={notificationSettingsOpen} onOpenChange={setNotificationSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notification Settings</DialogTitle>
            <DialogDescription>
              Manage your notification preferences
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={18} />
                <span>Event Reminders</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" onChange={(e) => toggleNotifications('Event', e.target.checked)} defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={18} />
                <span>Registration Updates</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" onChange={(e) => toggleNotifications('Registration', e.target.checked)} defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={18} />
                <span>System Notifications</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" onChange={(e) => toggleNotifications('System', e.target.checked)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setNotificationSettingsOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be logged out of your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogoutConfirm}>Logout</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <BottomNavigation />
    </div>
  );
};

export default ProfilePage;
