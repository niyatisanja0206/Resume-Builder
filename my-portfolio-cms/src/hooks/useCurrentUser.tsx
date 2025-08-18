import { useUserContext } from '@/hooks/useUserContext';

export function useCurrentUser() {
    const { currentUser } = useUserContext();
    return {
        currentUser,
        userEmail: currentUser?.email || '',
        isLoggedIn: !!currentUser?.email,
    };
}
