// src/hooks/useBasic.tsx

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { type Basic } from '@/types/portfolio';

const API_BASE_URL = 'http://localhost:5000/api/basic';

// For demo purposes, using a hardcoded email. In a real app, this would come from auth context
const DEMO_EMAIL = 'demo@example.com';

// Function to fetch basic data from the backend
const fetchBasic = async (): Promise<Basic | null> => {
    try {
        const { data } = await axios.get(`${API_BASE_URL}/get`, {
            params: { email: DEMO_EMAIL }
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
    try {
        // First try to update if user exists
        const { data } = await axios.put(`${API_BASE_URL}/update`, {
            email: DEMO_EMAIL,
            basicInfo: basicData
        });
        return data.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            // If user doesn't exist, create new one
            const { data } = await axios.post(`${API_BASE_URL}/post`, {
                ...basicData,
                email: DEMO_EMAIL
            });
            return data.data;
        }
        throw error;
    }
};

// Function to remove basic data
const removeBasic = async () => {
    await axios.delete(`${API_BASE_URL}/delete`, {
        params: { email: DEMO_EMAIL }
    });
};

export function useBasic() {
    const queryClient = useQueryClient();

    // Fetch the data from the backend
    const { data: basic, isLoading, error } = useQuery<Basic | null>({
        queryKey: ['basic'],
        queryFn: fetchBasic,
    });

    // Mutation for updating basic info
    const updateBasic = useMutation({
        mutationFn: saveBasic,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['basic'] });
        },
    });

    // Mutation for deleting basic info
    const removeBasicMutation = useMutation({
        mutationFn: removeBasic,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['basic'] });
        },
    });

    return {
        basic,
        isLoading,
        error,
        updateBasic,
        removeBasicMutation,
    };
}
