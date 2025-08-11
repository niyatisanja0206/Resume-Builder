import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Skill } from "@/types/portfolio";
import axios from 'axios';

const API_BASE_URL = "http://localhost:5000/api/skill";

// Function to fetch skills data from the backend
const fetchSkills = async (email: string): Promise<Skill[] | null> => {
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

// Function to add a new skill
const addSkill = async (skillData: { email: string; skill: Skill }): Promise<Skill> => {
    console.log('Adding skill with data:', skillData);
    const { data } = await axios.post(`${API_BASE_URL}/post`, {
        email: skillData.email,
        skill: skillData.skill
    });
    console.log('Skill add response:', data);
    return data.data;
};

// Function to remove a specific skill
const removeSkill = async (data: { email: string; id: string }) => {
    await axios.delete(`${API_BASE_URL}/delete`, {
        params: { email: data.email, id: data.id }
    });
};

// Function to remove all skills
const removeAllSkills = async (email: string) => {
    await axios.delete(`${API_BASE_URL}/deleteAll`, {
        params: { email }
    });
};

// Function to update a skill
const updateSkill = async (skillData: { email: string; id: string; skill: Skill }): Promise<Skill[]> => {
    console.log('Updating skill with data:', skillData);
    const { data } = await axios.put(`${API_BASE_URL}/update`, {
        email: skillData.email,
        id: skillData.id,
        skill: skillData.skill
    });
    console.log('Skill update response:', data);
    return data.data;
};

export function useSkill(email: string) {
    const queryClient = useQueryClient();

    // Fetch the data from the backend
    const { data: skills, isLoading, error, isError, refetch } = useQuery<Skill[] | null>({
        queryKey: ["skills", email],
        queryFn: () => fetchSkills(email),
        enabled: !!email, // Only run query if email is provided
        staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
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

    const removeAllSkillsMutation = useMutation({
        mutationFn: removeAllSkills,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["skills", email] });
        },
    });

    const updateSkillMutation = useMutation({
        mutationFn: updateSkill,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["skills", email] });
        },
    });

    return {
        skills: skills || [],
        isLoading,
        error,
        isError,
        refetch,
        addSkill: (skill: Skill) => addSkillMutation.mutateAsync({ email, skill }),
        addSkillLoading: addSkillMutation.isPending,
        addSkillError: addSkillMutation.error,
        updateSkill: (id: string, skill: Skill) => updateSkillMutation.mutateAsync({ email, id, skill }),
        updateSkillLoading: updateSkillMutation.isPending,
        updateSkillError: updateSkillMutation.error,
        removeSkill: (id: string) => removeSkillMutation.mutateAsync({ email, id }),
        removeSkillLoading: removeSkillMutation.isPending,
        removeSkillError: removeSkillMutation.error,
        removeAllSkills: () => removeAllSkillsMutation.mutateAsync(email),
        removeAllSkillsLoading: removeAllSkillsMutation.isPending,
        removeAllSkillsError: removeAllSkillsMutation.error,
    };
}
