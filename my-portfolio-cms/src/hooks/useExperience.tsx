import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { type Experience } from "@/types/portfolio";

const API_BASE_URL = "http://localhost:5000/api/exp";

// Function to fetch experience data from the backend
const fetchExperiences = async (email: string): Promise<Experience[] | null> => {
    try {
        const { data } = await axios.get(`${API_BASE_URL}/get`, {
            params: { email }
        });
        return data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            return [];
        }
        throw error;
    }
};

// Function to save/add new experience data
const addExperience = async (experienceData: { email: string; experience: Experience }): Promise<Experience> => {
    const { data } = await axios.post(`${API_BASE_URL}/post`, {
        email: experienceData.email,
        experience: experienceData.experience
    });
    return data.data;
};

// Function to remove a specific experience entry
const removeExperience = async (data: { email: string; id: string }) => {
    await axios.delete(`${API_BASE_URL}/delete`, {
        params: { email: data.email, id: data.id }
    });
};

// Function to remove all experiences
const removeAllExperiences = async (email: string) => {
    await axios.delete(`${API_BASE_URL}/deleteAll`, {
        params: { email }
    });
};

// Function to update an experience entry
const updateExperience = async (experienceData: { email: string; id: string; experience: Experience }): Promise<Experience[]> => {
    console.log('Updating experience with data:', experienceData);
    const { data } = await axios.put(`${API_BASE_URL}/update`, {
        email: experienceData.email,
        id: experienceData.id,
        experience: experienceData.experience
    });
    console.log('Experience update response:', data);
    return data.data;
};

export function useExperience(email: string) {
    const queryClient = useQueryClient();

    // Fetch the data from the backend
    const { data: experiences, isLoading, error, isError, refetch } = useQuery<Experience[] | null>({
        queryKey: ["experiences", email],
        queryFn: () => fetchExperiences(email),
        enabled: !!email, // Only run query if email is provided
        staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    });

    const addExperienceMutation = useMutation({
        mutationFn: addExperience,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["experiences", email] });
        },
    });

    const removeExperienceMutation = useMutation({
        mutationFn: removeExperience,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["experiences", email] });
        },
    });

    const removeAllExperiencesMutation = useMutation({
        mutationFn: removeAllExperiences,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["experiences", email] });
        },
    });

    const updateExperienceMutation = useMutation({
        mutationFn: updateExperience,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["experiences", email] });
        },
    });

    return {
        experiences: experiences || [],
        isLoading,
        error,
        isError,
        refetch,
        addExperience: (experience: Experience) => addExperienceMutation.mutateAsync({ email, experience }),
        addExperienceLoading: addExperienceMutation.isPending,
        addExperienceError: addExperienceMutation.error,
        updateExperience: (id: string, experience: Experience) => updateExperienceMutation.mutateAsync({ email, id, experience }),
        updateExperienceLoading: updateExperienceMutation.isPending,
        updateExperienceError: updateExperienceMutation.error,
        removeExperience: (id: string) => removeExperienceMutation.mutateAsync({ email, id }),
        removeExperienceLoading: removeExperienceMutation.isPending,
        removeExperienceError: removeExperienceMutation.error,
        removeAllExperiences: () => removeAllExperiencesMutation.mutateAsync(email),
        removeAllExperiencesLoading: removeAllExperiencesMutation.isPending,
        removeAllExperiencesError: removeAllExperiencesMutation.error,
    };
}
