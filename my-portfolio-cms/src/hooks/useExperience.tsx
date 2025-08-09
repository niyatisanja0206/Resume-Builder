import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { type Experience } from "@/types/portfolio";

const API_URL = "http://localhost:5000/api/exp";

// Function to fetch experience data for a specific user from the backend
const fetchExperiences = async (email: string): Promise<Experience[] | null> => {
    try {
        const { data } = await axios.get(`${API_URL}?email=${email}`);
        return data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            return null;
        }
        throw error;
    }
};

// Function to save/add new experience data
const addExperience = async (experienceData: { email: string; experience: Experience; }): Promise<Experience> => {
    const { data } = await axios.post(API_URL, experienceData);
    return data.data;
};

// Function to remove a specific experience entry
const removeExperience = async (data: { email: string; id: string }) => {
    await axios.delete(`${API_URL}?email=${data.email}&id=${data.id}`);
};

export function useExperience(email: string) {
    const queryClient = useQueryClient();

    // Fetch the data from the backend
    const { data: experiences = [], isLoading, error } = useQuery<Experience[] | null>({
        queryKey: ["experiences", email],
        queryFn: () => fetchExperiences(email),
        enabled: !!email,
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

    return {
        experiences,
        isLoading,
        error,
        addExperience: addExperienceMutation,
        removeExperience: removeExperienceMutation,
    };
}
