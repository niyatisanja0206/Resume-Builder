import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from 'axios';

const API_BASE_URL = "http://localhost:5000/api/auth";

interface UserStats {
    no_of_resumes: number;
    resume_downloaded: number;
}

// Fetch user statistics
const fetchUserStats = async (email: string): Promise<UserStats> => {
    const { data } = await axios.get(`${API_BASE_URL}/user-stats`, {
        params: { email }
    });
    return data;
};

// Increment resume count
const incrementResumeCount = async (email: string) => {
    const { data } = await axios.post(`${API_BASE_URL}/increment-resume-count`, {
        email
    });
    return data;
};

// Increment download count
const incrementDownloadCount = async (email: string) => {
    const { data } = await axios.post(`${API_BASE_URL}/increment-download-count`, {
        email
    });
    return data;
};

export function useUserStats(email?: string) {
    const queryClient = useQueryClient();
    
    // Get email from stored user data if not provided
    const getUserEmail = () => {
        if (email) return email;
        
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

    // Fetch user stats
    const { data: stats, isLoading, error, refetch } = useQuery<UserStats>({
        queryKey: ["userStats", currentEmail],
        queryFn: () => fetchUserStats(currentEmail),
        enabled: !!currentEmail,
        staleTime: 30 * 1000, // Cache for 30 seconds
    });

    // Increment resume count mutation
    const incrementResumeMutation = useMutation({
        mutationFn: () => incrementResumeCount(currentEmail),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["userStats", currentEmail] });
        },
    });

    // Increment download count mutation
    const incrementDownloadMutation = useMutation({
        mutationFn: () => incrementDownloadCount(currentEmail),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["userStats", currentEmail] });
        },
    });

    return {
        stats: stats || { no_of_resumes: 0, resume_downloaded: 0 },
        isLoading,
        error,
        refetch,
        incrementResumeCount: () => incrementResumeMutation.mutateAsync(),
        incrementDownloadCount: () => incrementDownloadMutation.mutateAsync(),
        isIncrementingResume: incrementResumeMutation.isPending,
        isIncrementingDownload: incrementDownloadMutation.isPending,
    };
}
