
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

export type UserType = 'student' | 'organizer' | null;

interface Profile {
  id: string;
  full_name: string;
  email: string;
  mobile: string;
  user_type: UserType;
  club_name?: string;  // Only for organizers
  class_branch?: string;  // Only for students
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  userType: UserType;
  isAuthenticated: boolean;
  login: (email: string, password: string, userType: UserType) => Promise<boolean>;
  signup: (userData: Omit<Profile, 'id' | 'created_at'>, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setUserTypeBeforeAuth: (type: UserType) => void;
  updateUser: (userData: Partial<Profile>) => Promise<boolean>;
  session: Session | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userType, setUserType] = useState<UserType>(null);
  const [session, setSession] = useState<Session | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Fetch profile if user is logged in
        if (currentSession?.user) {
          await fetchUserProfile(currentSession.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      // Fetch profile if user is logged in
      if (currentSession?.user) {
        fetchUserProfile(currentSession.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }
      
      if (data) {
        setProfile(data as Profile);
        setUserType(data.user_type);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const setUserTypeBeforeAuth = (type: UserType) => {
    setUserType(type);
  };

  const login = async (email: string, password: string, type: UserType): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        toast({
          title: "Error",
          description: error.message || "Invalid credentials",
          variant: "destructive",
        });
        return false;
      }
      
      if (data.user) {
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        if (profileError || !profileData) {
          toast({
            title: "Error",
            description: "Unable to fetch user profile",
            variant: "destructive",
          });
          return false;
        }
        
        // Check if user type matches
        if (profileData.user_type !== type) {
          toast({
            title: "Error",
            description: `This account is registered as a ${profileData.user_type}, not as a ${type}`,
            variant: "destructive",
          });
          
          // Sign out since user type doesn't match
          await supabase.auth.signOut();
          return false;
        }
        
        setProfile(profileData as Profile);
        
        toast({
          title: "Success",
          description: "Logged in successfully",
        });
        
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: error.message || "Login failed. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const signup = async (userData: Omit<Profile, 'id' | 'created_at'>, password: string): Promise<boolean> => {
    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: password,
        options: {
          data: {
            full_name: userData.full_name,
            user_type: userData.user_type,
          },
        }
      });
      
      if (authError) {
        toast({
          title: "Error",
          description: authError.message || "Signup failed",
          variant: "destructive",
        });
        return false;
      }
      
      if (!authData.user) {
        toast({
          title: "Error",
          description: "Failed to create account",
          variant: "destructive",
        });
        return false;
      }
      
      // Update additional profile fields since the trigger will create the basic profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          mobile: userData.mobile,
          club_name: userData.club_name,
          class_branch: userData.class_branch,
        })
        .eq('id', authData.user.id);
      
      if (updateError) {
        console.error('Error updating profile:', updateError);
        // Don't return false here, as the user is created, just the additional fields failed to update
      }
      
      toast({
        title: "Success",
        description: "Account created successfully",
      });
      
      return true;
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Error",
        description: error.message || "Signup failed. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateUser = async (userData: Partial<Profile>): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(userData)
        .eq('id', user.id);
      
      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to update profile",
          variant: "destructive",
        });
        return false;
      }
      
      // Update local state
      if (profile) {
        setProfile({ ...profile, ...userData });
      }
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      
      return true;
    } catch (error: any) {
      console.error('Update user error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
    
    toast({
      title: "Success",
      description: "Logged out successfully",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        userType,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        setUserTypeBeforeAuth,
        updateUser,
        session
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
