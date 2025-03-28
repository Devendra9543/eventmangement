
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export type UserType = 'student' | 'organizer' | null;

interface User {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  userType: UserType;
  clubName?: string;  // Only for organizers
  classBranch?: string;  // Only for students
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  userType: UserType;
  isAuthenticated: boolean;
  login: (email: string, password: string, userType: UserType) => Promise<boolean>;
  signup: (userData: Omit<User, 'id' | 'createdAt'>) => Promise<boolean>;
  logout: () => void;
  setUserTypeBeforeAuth: (type: UserType) => void;
  updateUser: (userData: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simulate a backend API service
const authService = {
  // In a real app, these would be actual API calls
  login: async (email: string, password: string, userType: UserType): Promise<User | null> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Check local storage for users (simulating a database)
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const user = storedUsers.find((u: User) => 
      u.email === email && u.userType === userType
    );
    
    if (user) {
      // In a real app, we would verify the password properly here
      return user;
    }
    
    return null;
  },
  
  signup: async (userData: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generate an ID and created timestamp
    const newUser: User = {
      ...userData,
      id: Math.random().toString(36).substring(7),
      createdAt: new Date().toISOString()
    };
    
    // Store in local storage (simulating a database)
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    localStorage.setItem('users', JSON.stringify([...storedUsers, newUser]));
    
    return newUser;
  },
  
  updateUser: async (userId: string, userData: Partial<User>): Promise<boolean> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Update user in local storage
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = storedUsers.map((user: User) => 
      user.id === userId ? { ...user, ...userData } : user
    );
    
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    return true;
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<UserType>(null);
  const { toast } = useToast();

  // Check for existing session on startup
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setUserType(parsedUser.userType);
    }
  }, []);

  const setUserTypeBeforeAuth = (type: UserType) => {
    setUserType(type);
  };

  const login = async (email: string, password: string, type: UserType): Promise<boolean> => {
    try {
      const loggedInUser = await authService.login(email, password, type);
      
      if (loggedInUser) {
        setUser(loggedInUser);
        // Store the current user in localStorage
        localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
        
        toast({
          title: "Success",
          description: "Logged in successfully",
        });
        
        return true;
      }
      
      toast({
        title: "Error",
        description: "Invalid credentials",
        variant: "destructive",
      });
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "Login failed. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const signup = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<boolean> => {
    try {
      // Check if user with that email already exists
      const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const existingUser = storedUsers.find((u: User) => u.email === userData.email);
      
      if (existingUser) {
        toast({
          title: "Error",
          description: "A user with this email already exists",
          variant: "destructive",
        });
        return false;
      }
      
      const newUser = await authService.signup(userData);
      setUser(newUser);
      
      // Store the current user in localStorage
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      
      toast({
        title: "Success",
        description: "Account created successfully",
      });
      
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: "Error",
        description: "Signup failed. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateUser = async (userData: Partial<User>): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const success = await authService.updateUser(user.id, userData);
      
      if (success) {
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        
        // Update in localStorage
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Update user error:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    // Remove from localStorage
    localStorage.removeItem('currentUser');
    
    toast({
      title: "Success",
      description: "Logged out successfully",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userType,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        setUserTypeBeforeAuth,
        updateUser
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
