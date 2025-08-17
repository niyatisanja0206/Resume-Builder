import { useState, useEffect, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { UserContext } from './UserContextObject';
import { type Basic } from '@/types/portfolio';

// Define the shape of the decoded token (matches JWT payload)
interface DecodedToken {
  user: {
    id: string;
    email: string;
  };
  exp: number;
}

// Define the props for the provider component
interface UserProviderProps {
  children: ReactNode;
}

// Create the provider component
export function UserProvider({ children }: UserProviderProps) {
  const [currentUser, setCurrentUser] = useState<Basic | null>(null);

  // On initial load, check for an existing token in localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode<DecodedToken>(token);
        const currentTime = Date.now() / 1000;
        
        // Check if the token is expired
        if (decodedToken.exp < currentTime) {
          localStorage.removeItem('token');
          setCurrentUser(null);
        } else {
          // Convert JWT user to Basic type
          const basicUser: Basic = {
            id: decodedToken.user.id,
            email: decodedToken.user.email,
            name: '',
            contact_no: '',
            location: '',
            about: ''
          };
          setCurrentUser(basicUser);
        }
      } catch (error) {
        console.error("Failed to decode token on initial load:", error);
        localStorage.removeItem('token'); // Clear invalid token
        setCurrentUser(null);
      }
    }
  }, []);

  // Centralized login function
  const login = useCallback((token: string) => {
    try {
      localStorage.setItem('token', token);
      const decodedToken = jwtDecode<DecodedToken>(token);
      // Convert JWT user to Basic type
      const basicUser: Basic = {
        id: decodedToken.user.id,
        email: decodedToken.user.email,
        name: '',
        contact_no: '',
        location: '',
        about: ''
      };
      setCurrentUser(basicUser);
    } catch (error) {
      console.error("Failed to process token on login:", error);
      setCurrentUser(null);
    }
  }, []);

  // Centralized logout function
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    currentUser,
    setCurrentUser: (user: Basic | null) => {
      console.log('UserContext - Setting current user:', user);
      // Update the state
      setCurrentUser(user);
      
      // If user is provided, also update localStorage
      if (user && user.email) {
        localStorage.setItem('currentUserEmail', user.email);
        // Optionally update the full user object
        try {
          const userString = localStorage.getItem('user');
          if (userString) {
            const storedUser = JSON.parse(userString);
            const updatedUser = { ...storedUser, ...user };
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
        } catch (error) {
          console.error('Error updating user in localStorage:', error);
        }
      }
    },
    login,
    logout,
  }), [currentUser, login, logout]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
