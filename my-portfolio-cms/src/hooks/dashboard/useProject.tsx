import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Project } from "../../types/portfolio";
import axios from 'axios';

const API_BASE_URL = "/api/pro";

const fetchProject = async (email: string): Promise<Project[] | null> => {
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

const addProject = async (projectData: { email: string; project: Project }): Promise<Project> => {
    const { data } = await axios.post(`${API_BASE_URL}/post`, {
        email: projectData.email,
        project: projectData.project
    });
    return data.data;
};

const removeProject = async (data: { email: string; id: string }) => {
    console.log('removeProject called with:', data);
    try {
        const response = await axios.delete(`${API_BASE_URL}/delete`, {
            params: { email: data.email, id: data.id }
        });
        console.log('removeProject response:', response.data);
        return response.data;
    } catch (error) {
        console.error('removeProject error:', error);
        throw error;
    }
};

const removeAllProjects = async (email: string) => {
    console.log('removeAllProjects called with email:', email);
    try {
        const response = await axios.delete(`${API_BASE_URL}/deleteAll`, {
            params: { email }
        });
        console.log('removeAllProjects response:', response.data);
        return response.data;
    } catch (error) {
        console.error('removeAllProjects error:', error);
        throw error;
    }
};

const updateProject = async (data: { email: string; id: string; project: Project }): Promise<Project> => {
    console.log('UpdateProject called with:', data);
    const { data: response } = await axios.put(`${API_BASE_URL}/update`, {
        email: data.email,
        id: data.id,
        project: data.project
    });
    console.log('UpdateProject response:', response);
    return response.data;
};

export function useProject(email: string) {
    const queryClient = useQueryClient();

    const {data: projects, isLoading, error, isError, refetch} = useQuery<Project[] | null>({
        queryKey: ["projects", email],
        queryFn: () => fetchProject(email),
        enabled: !!email, // Only run query if email is provided
        staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
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

    const removeAllProjectsMutation = useMutation({
        mutationFn: removeAllProjects,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects", email] });
        },
    });

    const updateProjectMutation = useMutation({
        mutationFn: updateProject,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects", email] });
            // Force refetch to ensure UI updates
            queryClient.refetchQueries({ queryKey: ["projects", email] });
        },
    });

    return{
      projects: projects || [],
      isLoading,
      error,
      isError,
      refetch,
      addProject: (project: Project) => addProjectMutation.mutateAsync({ email, project }),
      addProjectLoading: addProjectMutation.isPending,
      addProjectError: addProjectMutation.error,
      updateProject: (id: string, project: Project) => updateProjectMutation.mutateAsync({ email, id, project }),
      updateProjectLoading: updateProjectMutation.isPending,
      updateProjectError: updateProjectMutation.error,
      removeProject: (id: string) => removeProjectMutation.mutateAsync({ email, id }),
      removeProjectLoading: removeProjectMutation.isPending,
      removeProjectError: removeProjectMutation.error,
      removeAllProjects: () => removeAllProjectsMutation.mutateAsync(email),
      removeAllProjectsLoading: removeAllProjectsMutation.isPending,
      removeAllProjectsError: removeAllProjectsMutation.error,
    }
}
