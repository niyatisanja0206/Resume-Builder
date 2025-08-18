import React from 'react';
import { type Basic } from '@/types/portfolio';

// User Context Type Definition
export interface UserContextType {
    currentUser: Basic | null;
    setCurrentUser: (user: Basic | null) => void;
    login?: (token: string) => void;
    logout?: () => void;
}

// Create User Context
export const UserContext = React.createContext<UserContextType | undefined>(undefined);
