import React, { useState, useEffect } from 'react';
import { type Basic } from '@/types/portfolio';
import { UserContext } from './UserContextObject';

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<Basic | null>(null);

    // Load user from localStorage on mount
    useEffect(() => {
        const storedEmail = localStorage.getItem('currentUserEmail');
        if (storedEmail) {
            // We'll fetch the user data when needed
            console.log('UserContext - Found stored email:', storedEmail);
        }
    }, []);

    // Save user email to localStorage when user changes
    useEffect(() => {
        if (currentUser?.email) {
            localStorage.setItem('currentUserEmail', currentUser.email);
            console.log('UserContext - Saved email to localStorage:', currentUser.email);
        } else {
            localStorage.removeItem('currentUserEmail');
            console.log('UserContext - Removed email from localStorage');
        }
    }, [currentUser]);

    return (
        <UserContext.Provider value={{ currentUser, setCurrentUser }}>
            {children}
        </UserContext.Provider>
    );
}
