// src/hooks/useBasic.tsx

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { type Basic } from '@/types/portfolio';

const API_BASE_URL = 'http://localhost:5000/api/basic';

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
    const email = basicData.email;
    
    try {
        // First try to update if user exists
        const { data } = await axios.put(`${API_BASE_URL}/update`, {
            email: email,
            basicInfo: basicData
        });
        return data.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            // If user doesn't exist, create new one
            const { data } = await axios.post(`${API_BASE_URL}/post`, {
                ...basicData,
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
    const queryClient = useQueryClient();
    
    // If no email provided, try to get it from localStorage or cache
    let targetEmail = email;
    
    if (!targetEmail) {
        // First try localStorage
        targetEmail = localStorage.getItem('currentUserEmail') || undefined;
        console.log('useBasic - Got email from localStorage:', targetEmail);
        
        // If still no email, check cache
        if (!targetEmail) {
            const cachedBasicForm = queryClient.getQueryData<Basic>(['basic-form']);
            if (cachedBasicForm) {
                targetEmail = cachedBasicForm.email;
                console.log('useBasic - Got email from cache:', targetEmail);
            }
        }
    }
    
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

    // For BasicForm, we'll manage the data differently since it creates the email
    const { data: basic, isLoading, error, refetch } = useQuery<Basic | null>({
        queryKey: ['basic-form'],
        queryFn: () => null, // Start with no data
        enabled: false, // Don't auto-fetch
    });

    // Mutation for updating basic info
    const updateBasic = useMutation({
        mutationFn: saveBasic,
        onSuccess: (data) => {
            console.log('BasicForm - Save successful, data:', data);
            // Update the cache with the new data
            queryClient.setQueryData(['basic-form'], data);
            // Also set the cache for the specific email key that other forms will use
            queryClient.setQueryData(['basic', data.email], data);
            // Store the current user email in localStorage for other forms to use
            localStorage.setItem('currentUserEmail', data.email);
            console.log('BasicForm - Set localStorage currentUserEmail:', data.email);
            // Invalidate to ensure fresh data
            queryClient.invalidateQueries({ queryKey: ['basic', data.email] });
        },
    });

    // Mutation for deleting basic info  
    const removeBasicMutation = useMutation({
        mutationFn: (email: string) => removeBasic(email),
        onSuccess: () => {
            queryClient.setQueryData(['basic-form'], null);
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
