import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { type Education } from "@/types/portfolio";

const API_URL = "http://localhost:5000/api/edu";

// Function to fetch education data for a specific user from the backend
const fetchEducation = async (email: string): Promise<Education[] | null> => {
    try {
        const { data } = await axios.get(`${API_URL}?email=${email}`);
        return data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            return null; // No education data found
        }
        throw error;
    }
};

// Function to save/update education data
const saveEducation = async (educationData: { email: string; education: Education; }): Promise<Education> => {
    const { data } = await axios.post(API_URL, educationData);
    return data.data; 
};

// Function to remove a specific education entry
const removeEducation = async (data: { email: string; id: string }) => {
    await axios.delete(`${API_URL}?email=${data.email}&id=${data.id}`);
};

export function useEducation(email: string) {
    const queryClient = useQueryClient();

    // Fetch the data from the backend
    const { data: education, isLoading, error } = useQuery<Education[] | null>({
        queryKey: ["education", email],
        queryFn: () => fetchEducation(email),
        enabled: !!email, // Only run the query if an email is provided
    });

    // Mutation for updating education info
    const updateEducation = useMutation({
        mutationFn: saveEducation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["education", email] });
        },
    });

    // Mutation for deleting education info
    const removeEducationMutation = useMutation({
        mutationFn: removeEducation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["education", email] });
        },
    });

    return {
        education,
        isLoading,
        error,
        updateEducation,
        removeEducationMutation,
    };
}
