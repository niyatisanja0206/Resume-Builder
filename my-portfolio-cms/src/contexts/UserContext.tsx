import React, { useState, useEffect } from 'react';
import { type Basic } from '@/types/portfolio';
import { UserContext } from './UserContextObject';

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<Basic | null>(null);

    // Load user from auth context and localStorage on mount
    useEffect(() => {
        const authData = localStorage.getItem('user');
        if (authData) {
            try {
                const parsedAuthUser = JSON.parse(authData);
                // Create a Basic user object from auth data
                const basicUser: Basic = {
                    email: parsedAuthUser.email,
                    name: '',
                    contact_no: '',
                    about: '',
                    location: ''
                };
                setCurrentUser(basicUser);
                console.log('UserContext - Synced with auth data:', parsedAuthUser.email);
            } catch (error) {
                console.error('UserContext - Error parsing auth data:', error);
            }
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
