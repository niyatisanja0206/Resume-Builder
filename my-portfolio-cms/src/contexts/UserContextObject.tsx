import React from 'react';
import { type Basic } from '@/types/portfolio';

export interface UserContextType {
    currentUser: Basic | null;
    setCurrentUser: (user: Basic | null) => void;
    login?: (token: string) => void;
    logout?: () => void;
}

export const UserContext = React.createContext<UserContextType | undefined>(undefined);
