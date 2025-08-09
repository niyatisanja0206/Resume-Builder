// src/hooks/useBasic.tsx

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { type Basic } from '@/types/portfolio';

const API_URL = 'http://localhost:5000/api/basic';

// Function to fetch basic data from the backend
const fetchBasic = async (): Promise<Basic | null> => {
    try {
        const { data } = await axios.get(API_URL);
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
    const { data } = await axios.post(API_URL, basicData);
    return data.data;
};

// Function to remove basic data
const removeBasic = async () => {
    await axios.delete(API_URL);
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
