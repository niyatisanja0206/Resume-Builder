import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Skill } from "@/types/portfolio";
import axios from 'axios';

const API_URL = "http://localhost:5000/api/skill";

// Function to fetch skills data for a specific user from the backend
const fetchSkills = async (email: string): Promise<Skill[] | null> => {
    try {
        const { data } = await axios.get(`${API_URL}?email=${email}`);
        return data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            return null; // No skills data found
        }
        throw error;
    }
};

// Function to add a new skill
const addSkill = async (skillData: { email: string; skill: Skill; }): Promise<Skill> => {
    const { data } = await axios.post(API_URL, skillData);
    return data.data;
};

// Function to remove a specific skill
const removeSkill = async (data: { email: string; id: string }) => {
    await axios.delete(`${API_URL}?email=${data.email}&id=${data.id}`);
};

export function useSkill(email: string) {
    const queryClient = useQueryClient();

    // Fetch the data from the backend using the user's email
    const { data: skills, isLoading, error } = useQuery<Skill[] | null>({
        queryKey: ["skills", email],
        queryFn: () => fetchSkills(email),
        enabled: !!email, // Only run the query if an email is provided
    });

    const addSkillMutation = useMutation({
        mutationFn: addSkill,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["skills", email] });
        },
    });

    const removeSkillMutation = useMutation({
        mutationFn: removeSkill,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["skills", email] });
        },
    });

    return {
        skills,
        isLoading,
        error,
        addSkill: addSkillMutation,
        removeSkill: removeSkillMutation,
    };
}
