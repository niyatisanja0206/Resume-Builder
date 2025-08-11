import { useUserContext } from '@/contexts/useUserContext';

export function useCurrentUser() {
    const { currentUser } = useUserContext();
    return {
        currentUser,
        userEmail: currentUser?.email || '',
        isLoggedIn: !!currentUser?.email,
    };
}
