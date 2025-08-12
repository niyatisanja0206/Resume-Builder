// src/hooks/useCurrentResume.tsx

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { type Basic, type Project, type Experience, type Skill, type Education } from '@/types/portfolio';

const API_BASE_URL = 'http://localhost:5000/api/resume';

interface Resume {
    _id: string;
    userEmail: string;
    title: string;
    status: 'draft' | 'completed';
    downloadCount: number;
    basic?: Basic;
    skills?: Skill[];
    education?: Education[];
    experience?: Experience[];
    projects?: Project[];
    createdAt: string;
    updatedAt: string;
}

interface SaveResumeData {
    resumeId?: string;
    basic?: Basic;
    skills?: Skill[];
    education?: Education[];
    experience?: Experience[];
    projects?: Project[];
}

// Get current user email
const getUserEmail = () => {
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

// Get current resume ID from localStorage
const getCurrentResumeId = () => {
    return localStorage.getItem('currentResumeId') || null;
};

// Fetch current resume data
const fetchCurrentResume = async (userEmail: string, resumeId?: string): Promise<Resume | null> => {
    if (!userEmail) return null;
    
    try {
        const params = resumeId ? { resumeId } : {};
        const { data } = await axios.get(`${API_BASE_URL}/data/${userEmail}`, { params });
        return data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            return null; // No resume data found
        }
        throw error;
    }
};

// Save resume data
const saveResumeData = async (resumeData: SaveResumeData): Promise<{ resumeId: string }> => {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    const { data } = await axios.post(`${API_BASE_URL}/save`, resumeData, { headers });
    return data;
};

// Create new resume
const createNewResume = async (): Promise<{ resumeId: string; resume: Resume }> => {
    const token = localStorage.getItem('token');
    const { data } = await axios.post(`${API_BASE_URL}/new`, {}, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};

// Hook for managing current resume
export function useCurrentResume() {
    const queryClient = useQueryClient();
    const userEmail = getUserEmail();
    const currentResumeId = getCurrentResumeId();

    // Fetch current resume data
    const { data: resume, isLoading, error, refetch } = useQuery<Resume | null>({
        queryKey: ['current-resume', userEmail, currentResumeId],
        queryFn: () => fetchCurrentResume(userEmail, currentResumeId || undefined),
        enabled: !!userEmail,
    });

    // Mutation for saving resume data
    const saveResume = useMutation({
        mutationFn: saveResumeData,
        onSuccess: (data, variables) => {
            // Update localStorage with the resume ID
            localStorage.setItem('currentResumeId', data.resumeId);
            
            // Update the cache
            queryClient.setQueryData(['current-resume', userEmail, data.resumeId], (oldData: Resume | null) => {
                if (!oldData) return null;
                return {
                    ...oldData,
                    basic: variables.basic || oldData.basic,
                    skills: variables.skills || oldData.skills,
                    education: variables.education || oldData.education,
                    experience: variables.experience || oldData.experience,
                    projects: variables.projects || oldData.projects,
                    updatedAt: new Date().toISOString()
                };
            });
            
            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: ['current-resume'] });
            queryClient.invalidateQueries({ queryKey: ['user-stats'] });
        },
    });

    // Mutation for creating new resume
    const createResume = useMutation({
        mutationFn: createNewResume,
        onSuccess: (data) => {
            // Update localStorage with the new resume ID
            localStorage.setItem('currentResumeId', data.resumeId);
            
            // Update cache with new resume
            queryClient.setQueryData(['current-resume', userEmail, data.resumeId], data.resume);
            
            // Invalidate queries to refresh UI
            queryClient.invalidateQueries({ queryKey: ['current-resume'] });
            queryClient.invalidateQueries({ queryKey: ['user-stats'] });
            queryClient.invalidateQueries({ queryKey: ['all-resumes'] });
        },
    });

    // Helper function to save specific section
    const saveSection = (
        sectionName: 'basic' | 'skills' | 'education' | 'experience' | 'projects', 
        data: Basic | Skill[] | Education[] | Experience[] | Project[]
    ) => {
        const resumeData: SaveResumeData = {
            resumeId: currentResumeId || resume?._id,
            [sectionName]: data
        };
        return saveResume.mutateAsync(resumeData);
    };

    return {
        resume,
        isLoading,
        error,
        saveResume,
        createResume,
        saveSection,
        refetch,
        currentResumeId
    };
}

// Hook for saving basic info to current resume
export function useBasicToResume() {
    const { saveSection, resume } = useCurrentResume();
    
    return {
        basic: resume?.basic,
        saveBasic: (basicData: Basic) => saveSection('basic', basicData),
        isLoading: false
    };
}

// Hook for saving skills to current resume
export function useSkillsToResume() {
    const { saveSection, resume } = useCurrentResume();
    
    return {
        skills: resume?.skills || [],
        saveSkills: (skillsData: Skill[]) => saveSection('skills', skillsData),
        isLoading: false
    };
}

// Hook for saving education to current resume
export function useEducationToResume() {
    const { saveSection, resume } = useCurrentResume();
    
    return {
        education: resume?.education || [],
        saveEducation: (educationData: Education[]) => saveSection('education', educationData),
        isLoading: false
    };
}

// Hook for saving experience to current resume
export function useExperienceToResume() {
    const { saveSection, resume } = useCurrentResume();
    
    return {
        experience: resume?.experience || [],
        saveExperience: (experienceData: Experience[]) => saveSection('experience', experienceData),
        isLoading: false
    };
}

// Hook for saving projects to current resume
export function useProjectsToResume() {
    const { saveSection, resume } = useCurrentResume();
    
    return {
        projects: resume?.projects || [],
        saveProjects: (projectsData: Project[]) => saveSection('projects', projectsData),
        isLoading: false
    };
}
