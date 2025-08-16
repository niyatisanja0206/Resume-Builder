import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from 'axios';

const API_BASE_URL = "http://localhost:5000/api/auth";

interface UserStats {
    no_of_resumes: number;
    resume_downloaded: number;
}

// Fetch user statistics
const fetchUserStats = async (): Promise<UserStats> => {
    const token = localStorage.getItem('token');
    const { data } = await axios.get(`${API_BASE_URL}/user-stats`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return data;
};

// Increment resume count
const incrementResumeCount = async () => {
    const token = localStorage.getItem('token');
    const { data } = await axios.post(`${API_BASE_URL}/increment-resume-count`, {}, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return data;
};

// Increment download count
const incrementDownloadCount = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token found');
    }
    
    try {
        const { data } = await axios.post(`${API_BASE_URL}/increment-download-count`, {}, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return data;
    } catch (error) {
        console.error('Failed to increment download count:', error);
        throw error;
    }
};

export function useUserStats() {
    const queryClient = useQueryClient();
    
    // Check if user is authenticated
    const isAuthenticated = !!localStorage.getItem('token');

    // Fetch user stats
    const { data: stats, isLoading, error, refetch } = useQuery<UserStats>({
        queryKey: ["userStats"],
        queryFn: fetchUserStats,
        enabled: isAuthenticated,
        staleTime: 30 * 1000, // Cache for 30 seconds
        retry: 1, // Only retry once to avoid infinite loops
    });

    // Increment resume count mutation
    const incrementResumeMutation = useMutation({
        mutationFn: incrementResumeCount,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["userStats"] });
        },
        onError: (error) => {
            console.error('Resume count increment failed:', error);
        }
    });

    // Increment download count mutation
    const incrementDownloadMutation = useMutation({
        mutationFn: incrementDownloadCount,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["userStats"] });
        },
        onError: (error) => {
            console.error('Download count increment failed:', error);
        }
    });

    // Fallback functions for when user is not authenticated
    const fallbackIncrement = async () => {
        console.warn('User not authenticated, skipping stats increment');
        return Promise.resolve({});
    };

    return {
        stats: stats || { no_of_resumes: 0, resume_downloaded: 0 },
        isLoading,
        error,
        refetch,
        incrementResumeCount: isAuthenticated ? () => incrementResumeMutation.mutateAsync() : fallbackIncrement,
        incrementDownloadCount: isAuthenticated ? () => incrementDownloadMutation.mutateAsync() : fallbackIncrement,
        isIncrementingResume: incrementResumeMutation.isPending,
        isIncrementingDownload: incrementDownloadMutation.isPending,
    };
}
