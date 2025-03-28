
import React, { createContext, useState, useContext, ReactNode } from 'react';

export type UserType = 'student' | 'organizer' | null;

interface User {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  userType: UserType;
  clubName?: string;  // Only for organizers
  classBranch?: string;  // Only for students
}

interface AuthContextType {
  user: User | null;
  userType: UserType;
  isAuthenticated: boolean;
  login: (email: string, password: string, userType: UserType) => Promise<boolean>;
  signup: (userData: Omit<User, 'id'>) => Promise<boolean>;
  logout: () => void;
  setUserTypeBeforeAuth: (type: UserType) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<UserType>(null);

  const setUserTypeBeforeAuth = (type: UserType) => {
    setUserType(type);
  };

  // Mock login function - would connect to backend in real app
  const login = async (email: string, password: string, type: UserType): Promise<boolean> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login
      if (email && password) {
        if (type === 'student') {
          setUser({
            id: '1',
            fullName: 'John Student',
            email,
            mobile: '9876543210',
            userType: 'student',
            classBranch: 'Computer Science - 3rd Year'
          });
        } else {
          setUser({
            id: '2',
            fullName: 'Jane Organizer',
            email,
            mobile: '8765432109',
            userType: 'organizer',
            clubName: 'CSI'
          });
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // Mock signup function - would connect to backend in real app
  const signup = async (userData: Omit<User, 'id'>): Promise<boolean> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful signup
      setUser({
        ...userData,
        id: Math.random().toString(36).substring(7), // Generate random ID
      });
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
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
        setUserTypeBeforeAuth
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
