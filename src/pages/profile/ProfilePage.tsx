
import React, { useState } from 'react';
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

const ProfilePage = () => {
  const { userType, logout, profile } = useAuth();
  const navigate = useNavigate();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [notificationSettingsOpen, setNotificationSettingsOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { toast } = useToast();
  
  // Use data directly from profile context
  const userData = {
    name: profile?.full_name || "Unknown User",
    email: profile?.email || "No email provided",
    phone: profile?.mobile || "No phone number provided",
    department: userType === 'student' ? (profile?.class_branch || "No department") : null,
    clubName: userType === 'organizer' ? (profile?.club_name || "No club") : null,
    clubRole: profile?.club_role || "No role"
  };
  
  const handleLogoutConfirm = async () => {
    await logout();
    navigate('/');
    setLogoutDialogOpen(false);
  };

  const handleChangePassword = () => {
    // Validation
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

    // Here you would implement the actual password change logic using Supabase
    // For now, we'll simulate success
    toast({
      title: "Password updated",
      description: "Your password has been changed successfully",
    });
    
    // Reset fields and close dialog
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
            <button className="ml-auto bg-white/20 p-2 rounded-full">
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
            
            {userType === 'student' && userData.department && (
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
        
        {/* Settings links */}
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
      
      {/* Change Password Dialog */}
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

      {/* Notification Settings Dialog */}
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
      
      {/* Logout Confirmation Dialog */}
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
