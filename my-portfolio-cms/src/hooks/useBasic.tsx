// src/hooks/useBasic.tsx

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { type Basic } from '@/types/portfolio';

const API_BASE_URL = '/api/basic';

// Function to fetch basic data from the backend
const fetchBasic = async (email?: string): Promise<Basic | null> => {
    if (!email) return null;
    
    try {
        const { data } = await axios.get(`${API_BASE_URL}/get`, {
            params: { email }
        });
        return data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            return null; // No user data found
        }
        throw error;
    }
};

// Function to save/update basic data
const saveBasic = async (basicData: Basic): Promise<Basic> => {
    console.log('saveBasic called with data:', basicData);
    const email = basicData.email;
    
    // Ensure all fields are valid strings
    const sanitizedData: Basic = {
        name: basicData.name || '',
        contact_no: basicData.contact_no || '',
        email: basicData.email || '',
        location: basicData.location || '',
        about: basicData.about || '',
    };
    
    if (basicData.id) {
        sanitizedData.id = basicData.id;
    }
    
    console.log('Sanitized data for API:', sanitizedData);
    
    try {
        // First try to update if user exists
        const { data } = await axios.put(`${API_BASE_URL}/update`, {
            email: email,
            basicInfo: sanitizedData
        });
        return data.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            // If user doesn't exist, create new one
            const { data } = await axios.post(`${API_BASE_URL}/post`, {
                ...sanitizedData,
                email: email
            });
            return data.data;
        }
        throw error;
    }
};

// Function to remove basic data
const removeBasic = async (email: string) => {
    await axios.delete(`${API_BASE_URL}/delete`, {
        params: { email }
    });
};

// Hook for other forms that need basic info
export function useBasic(email?: string) {
    // Get email with same logic as useBasicForm
    const getUserEmail = () => {
        try {
            const userString = localStorage.getItem('user');
            if (userString) {
                const user = JSON.parse(userString);
                return user.email || '';
            }
            return localStorage.getItem('currentUserEmail') || '';
        } catch (error) {
            console.error('Error parsing user data:', error);
            return '';
        }
    };
    
    // If no email provided, try to get it from localStorage or cache
    const targetEmail = email || getUserEmail();
    
    console.log('useBasic - Final targetEmail:', targetEmail);
    
    // Fetch the data from the backend
    const { data: basic, isLoading, error } = useQuery<Basic | null>({
        queryKey: ['basic', targetEmail || 'no-email'],
        queryFn: () => fetchBasic(targetEmail),
        enabled: !!targetEmail, // Only run query if email is provided
    });

    console.log('useBasic - Returning basic data:', basic);

    return {
        basic,
        isLoading,
        error,
    };
}

// Hook specifically for BasicForm that handles its own state
export function useBasicForm() {
    const queryClient = useQueryClient();

    // Get current user email from localStorage or auth context
    const getUserEmail = () => {
        try {
            const userString = localStorage.getItem('user');
            if (userString) {
                const user = JSON.parse(userString);
                return user.email || '';
            }
            return localStorage.getItem('currentUserEmail') || '';
        } catch (error) {
            console.error('Error parsing user data:', error);
            return '';
        }
    };
    
    const currentEmail = getUserEmail();

    console.log('useBasicForm - Current email:', currentEmail);

    // Fetch existing basic data if user exists
    const { data: basic, isLoading, error, refetch } = useQuery<Basic | null>({
        queryKey: ['basic-form', currentEmail || 'no-email'],
        queryFn: () => fetchBasic(currentEmail),
        enabled: !!currentEmail, // Only fetch if we have an email
    });

    console.log('useBasicForm - Fetched basic data:', basic);

    // Mutation for updating basic info
    const updateBasic = useMutation({
        mutationFn: saveBasic,
        // Update cache optimistically for immediate UI updates
        onMutate: async (newBasicData) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['basic'] });
            await queryClient.cancelQueries({ queryKey: ['basic-form'] });
            await queryClient.cancelQueries({ queryKey: ['current-resume'] });
            
            // Snapshot the previous value
            const previousBasicData = queryClient.getQueryData(['basic-form', newBasicData.email]);
            
            // Optimistically update to the new value
            queryClient.setQueryData(['basic-form', newBasicData.email], newBasicData);
            queryClient.setQueryData(['basic', newBasicData.email], newBasicData);
            
            // Update localStorage immediately
            localStorage.setItem('currentUserEmail', newBasicData.email);
            
            // Return a context object with the snapshotted value
            return { previousBasicData };
        },
        onSuccess: (data) => {
            console.log('BasicForm - Save successful, data:', data);
            // Update all related cache entries
            queryClient.setQueryData(['basic-form', data.email], data);
            queryClient.setQueryData(['basic', data.email], data);
            
            // Also update user context data in localStorage
            localStorage.setItem('currentUserEmail', data.email);
            
            // Try to update any user data in localStorage
            try {
                const userString = localStorage.getItem('user');
                if (userString) {
                    const user = JSON.parse(userString);
                    user.email = data.email;
                    localStorage.setItem('user', JSON.stringify(user));
                }
            } catch (error) {
                console.error('Error updating user in localStorage:', error);
            }
            
            console.log('BasicForm - Set localStorage currentUserEmail:', data.email);
            
            // Invalidate queries to ensure fresh data
            queryClient.invalidateQueries({ queryKey: ['basic'] });
            queryClient.invalidateQueries({ queryKey: ['basic-form'] });
            queryClient.invalidateQueries({ queryKey: ['current-resume'] });
        },
        // If the mutation fails, use the context returned from onMutate to roll back
        onError: (err, newBasicData, context: any) => {
            console.error('Error updating basic info:', err);
            if (context?.previousBasicData) {
                queryClient.setQueryData(
                    ['basic-form', newBasicData.email], 
                    context.previousBasicData
                );
                queryClient.setQueryData(
                    ['basic', newBasicData.email], 
                    context.previousBasicData
                );
            }
        },
        // Always refetch after error or success
        onSettled: (data) => {
            if (data) {
                queryClient.invalidateQueries({ queryKey: ['basic', data.email] });
                queryClient.invalidateQueries({ queryKey: ['basic-form', data.email] });
            }
        },
    });

    // Mutation for deleting basic info  
    const removeBasicMutation = useMutation({
        mutationFn: (email: string) => removeBasic(email),
        onSuccess: () => {
            queryClient.setQueryData(['basic-form', currentEmail], null);
            // Clear the current user email from localStorage
            localStorage.removeItem('currentUserEmail');
            queryClient.invalidateQueries({ queryKey: ['basic'] });
        },
    });

    return {
        basic: basic || updateBasic.data,
        isLoading,
        error,
        updateBasic,
        removeBasicMutation,
        refetch,
    };
}
