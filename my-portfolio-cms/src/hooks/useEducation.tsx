import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { type Education } from "@/types/portfolio";

const API_BASE_URL = "/api/edu";

// Function to fetch education data for a specific user from the backend
const fetchEducation = async (email: string): Promise<Education[] | null> => {
    try {
        const { data } = await axios.get(`${API_BASE_URL}/get`, {
            params: { email }
        });
        return data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            return []; // Return empty array if no education data found
        }
        throw error;
    }
};

// Function to save/add education data
const saveEducation = async (educationData: { email: string; education: Education }): Promise<Education> => {
    const { data } = await axios.post(`${API_BASE_URL}/post`, {
        email: educationData.email,
        education: educationData.education
    });
    return data.data;
};

// Function to remove a specific education entry
const removeEducation = async (data: { email: string; id: string }) => {
    await axios.delete(`${API_BASE_URL}/delete`, {
        params: { email: data.email, id: data.id }
    });
};

// Function to remove all education entries
const removeAllEducation = async (email: string) => {
    await axios.delete(`${API_BASE_URL}/deleteAll`, {
        params: { email }
    });
};

// Function to update an education entry
const updateEducation = async (educationData: { email: string; id: string; education: Education }): Promise<Education[]> => {
    console.log('Updating education with data:', educationData);
    const { data } = await axios.put(`${API_BASE_URL}/update`, {
        email: educationData.email,
        id: educationData.id,
        education: educationData.education
    });
    console.log('Education update response:', data);
    return data.data;
};

export function useEducation(email: string) {
    const queryClient = useQueryClient();

    // Fetch the data from the backend
    const { data: education, isLoading, error, isError, refetch } = useQuery<Education[] | null>({
        queryKey: ["education", email],
        queryFn: () => fetchEducation(email),
        enabled: !!email, // Only run query if email is provided
        staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    });

    // Mutation for adding education info
    const addEducation = useMutation({
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

    // Mutation for deleting all education info
    const removeAllEducationMutation = useMutation({
        mutationFn: removeAllEducation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["education", email] });
        },
    });

    const updateEducationMutation = useMutation({
        mutationFn: updateEducation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["education", email] });
        },
    });

    return {
        education: education || [],
        isLoading,
        error,
        isError,
        refetch,
        addEducation: (education: Education) => addEducation.mutateAsync({ email, education }),
        addEducationLoading: addEducation.isPending,
        addEducationError: addEducation.error,
        updateEducation: (id: string, education: Education) => updateEducationMutation.mutateAsync({ email, id, education }),
        updateEducationLoading: updateEducationMutation.isPending,
        updateEducationError: updateEducationMutation.error,
        removeEducation: (id: string) => removeEducationMutation.mutateAsync({ email, id }),
        removeEducationLoading: removeEducationMutation.isPending,
        removeEducationError: removeEducationMutation.error,
        removeAllEducation: () => removeAllEducationMutation.mutateAsync(email),
        removeAllEducationLoading: removeAllEducationMutation.isPending,
        removeAllEducationError: removeAllEducationMutation.error,
    };
}
