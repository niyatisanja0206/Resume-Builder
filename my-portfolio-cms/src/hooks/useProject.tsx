import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Project } from "../types/portfolio";
import axios from 'axios';

const API_URL = "http://localhost:5000/api/pro";

const fetchProject = async (email: string): Promise<Project[] | null> => {
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

const addProject = async (projectData: { email: string; project: Project; }): Promise<Project> => {
    const { data } = await axios.post(API_URL, projectData);
    return data.data;
};

const removeProject = async (data: {email: string; id: string}) => {
    await axios.delete(`${API_URL}?email=${data.email}&id=${data.id}`);
};

export function useProject(email: string) {
    const queryClient = useQueryClient();

    const {data: projects = [], isLoading, error} = useQuery<Project[] | null>({
        queryKey: ["projects", email],
        queryFn: () => fetchProject(email),
        enabled: !!email,
    });

    const addProjectMutation = useMutation({
        mutationFn: addProject,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects", email] });
        },
    });

    const removeProjectMutation = useMutation({
        mutationFn: removeProject,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects", email] });
        },
    });

    return{
      projects,
      isLoading,
      error,
      addProject: addProjectMutation,
      removeProject: removeProjectMutation,
    }
}
