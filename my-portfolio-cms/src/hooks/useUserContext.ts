import { useContext } from 'react';
import { UserContext, type UserContextType } from '../contexts/UserContextDefinition';

// User Context Hook - separated to satisfy Fast Refresh requirements
export const useUserContext = (): UserContextType => {
    const context = useContext(UserContext);
    if (context === undefined) {
        console.error('useUserContext must be used within a UserProvider');
        // Return a dummy implementation to prevent app crashes
        return {
            currentUser: null,
            setCurrentUser: (user) => {
                console.warn('UserContext not available, setCurrentUser is a no-op');
                console.log('Would have set user to:', user);
            }
        };
    }
    return context;
};
