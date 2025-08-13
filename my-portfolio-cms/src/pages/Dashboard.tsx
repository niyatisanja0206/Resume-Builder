import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

// Import all form components
import ExperienceForm from "@/components/ExperienceForm";
import ProjectForm from "@/components/ProjectForm";
import SkillForm from "@/components/SkillForm";
import BasicForm from "@/components/BasicForm";
import EducationForm from "@/components/EducationForm";

// Import preview and PDF components
import ResumePreview from '@/components/ResumePreview';
import ResumePDF from '@/components/ResumePDF';

// Import utilities and context
import AuthGuard from "@/components/AuthGuard";
import { useUserContext } from "@/contexts/useUserContext";
import axios from 'axios';

// Import all data hooks
import { useBasic } from "@/hooks/useBasic";
import { useProject } from "@/hooks/useProject";
import { useExperience } from "@/hooks/useExperience";
import { useSkill } from "@/hooks/useSkills";
import { useEducation } from "@/hooks/useEducation";

// Import all data types
import type { Basic, Project, Experience, Skill, Education } from '@/types/portfolio';

// Define a single, comprehensive type for all resume data.
// CORRECTED: Renamed 'basic' to 'basicInfo' to match child component props.
type FullResumeData = {
  basicInfo: Basic | null;
  projects: Project[];
  experiences: Experience[];
  skills: Skill[];
  education: Education[];
};

type TemplateId = 'classic' | 'modern' | 'creative';
const validTemplates: TemplateId[] = ['classic', 'modern', 'creative'];

export default function Dashboard() {
    const { currentUser } = useUserContext();
    const userEmail = currentUser?.email || '';

    const [searchParams] = useSearchParams();
    const initialTemplate = searchParams.get('template');

    // --- STATE MANAGEMENT ---
    const [resumeData, setResumeData] = useState<FullResumeData>({
        basicInfo: null, // CORRECTED: Renamed from 'basic'
        projects: [],
        experiences: [],
        skills: [],
        education: []
    });

    // Validate the template from URL before setting state
    const templateFromUrl = initialTemplate && validTemplates.includes(initialTemplate as TemplateId) 
        ? initialTemplate as TemplateId 
        : 'classic';
    
    // Use template directly as a constant instead of state since we don't need to change it
    const selectedTemplate: TemplateId = templateFromUrl;
    
    const [isPageLoading, setPageLoading] = useState(true);

    // --- DATA FETCHING ---
    const { basic, isLoading: basicLoading } = useBasic(userEmail);
    const { projects, isLoading: projectsLoading } = useProject(userEmail);
    const { experiences, isLoading: experiencesLoading } = useExperience(userEmail);
    const { skills, isLoading: skillsLoading } = useSkill(userEmail);
    const { education, isLoading: educationLoading } = useEducation(userEmail);

    // --- DATA SYNCHRONIZATION ---
    useEffect(() => {
        const allDataLoaded = !basicLoading && !projectsLoading && !experiencesLoading && !skillsLoading && !educationLoading;
        
        if (allDataLoaded) {
            setResumeData({
                basicInfo: basic || null, // CORRECTED: Renamed from 'basic'
                projects: projects || [],
                experiences: experiences || [],
                skills: skills || [],
                education: education || []
            });
            setPageLoading(false);
        }
    }, [
        basic, projects, experiences, skills, education,
        basicLoading, projectsLoading, experiencesLoading, skillsLoading, educationLoading
    ]);

    // --- LIVE UPDATE HANDLER ---
    const handleDataChange = <K extends keyof FullResumeData>(section: K, data: FullResumeData[K]) => {
        setResumeData(prevData => ({
            ...prevData,
            [section]: data,
        }));
    };
    
    // --- RESUME OPERATIONS ---
    const clearResume = async () => {
        if (!userEmail) {
            alert("You must be logged in to clear your resume");
            return;
        }

        try {
            // Show loading state
            setPageLoading(true);
            
            // First set UI state to empty immediately for responsive feedback
            const emptyResume: FullResumeData = {
                basicInfo: { name: '', contact_no: '', email: userEmail, location: '', about: '' },
                projects: [],
                experiences: [],
                skills: [],
                education: []
            };
            
            setResumeData(emptyResume);
            
            // Update basic info with empty fields but keep the email
            if (emptyResume.basicInfo) {
                await axios.put('/api/basic/update', {
                    email: userEmail,
                    basicInfo: emptyResume.basicInfo
                });
            }

            // Clear all sections using the deleteAll endpoints
            await axios.delete('/api/projects/deleteAll', { params: { email: userEmail } });
            await axios.delete('/api/experiences/deleteAll', { params: { email: userEmail } });
            await axios.delete('/api/skills/deleteAll', { params: { email: userEmail } });
            await axios.delete('/api/education/deleteAll', { params: { email: userEmail } });
            
            // Also clear resume drafts via resume controller
            await axios.delete('/api/resume/clear-draft', { 
                headers: { 'x-auth-token': localStorage.getItem('token') } 
            });
            
            // Reset loading state and refresh the page to reload all data
            setPageLoading(false);
            
            // Force reload to get fresh data
            window.location.reload();
            
            alert("Resume cleared successfully");
        } catch (error) {
            console.error("Failed to clear resume:", error);
            alert("Failed to clear resume. Please try again.");
            setPageLoading(false);
        }
    };
    
    const createNewResume = async () => {
        if (!userEmail) {
            alert("You must be logged in to create a new resume");
            return;
        }
        
        try {
            setPageLoading(true);
            
            // First clear the current resume
            await clearResume();
            
            // Create a new resume through the resume controller
            const response = await axios.post('/api/resume/new', {}, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            
            console.log("New resume created:", response.data);
            
            // Reset loading state
            setPageLoading(false);
            
            // Force reload to get fresh data
            window.location.reload();
            
            alert("New resume created successfully");
        } catch (error) {
            console.error("Failed to create new resume:", error);
            alert("Failed to create new resume. Please try again.");
            setPageLoading(false);
        }
    };
    
    // --- RENDER LOGIC ---
    if (isPageLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-lg text-muted-foreground">Loading Your Resume Editor...</p>
                </div>
            </div>
        );
    }

    return (
        <AuthGuard>
            <div className="flex flex-col md:flex-row w-full min-h-screen bg-gray-100 dark:bg-gray-900">
                
                <aside className="w-full md:w-1/2 lg:w-2/5 h-screen overflow-y-auto bg-white dark:bg-black p-6 lg:p-8 space-y-8">
                    <header className="mb-6">
                        <h1 className="text-3xl font-bold text-foreground">Live Resume Editor</h1>
                        <p className="text-muted-foreground">Your changes will appear live in the preview.</p>
                        
                        {/* Resume Action Buttons */}
                        <div className="flex space-x-4 mt-4">
                            <button 
                                onClick={clearResume}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors flex items-center justify-center"
                                disabled={isPageLoading}
                            >
                                {isPageLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                ) : null}
                                Clear Resume
                            </button>
                            <button 
                                onClick={createNewResume}
                                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors flex items-center justify-center"
                                disabled={isPageLoading}
                            >
                                {isPageLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                ) : null}
                                New Resume
                            </button>
                        </div>
                    </header>
                    
                    {/* CORRECTED: Pass 'basicInfo' to the form and the handler */}
                    <BasicForm initialData={resumeData.basicInfo} onDataChange={(newData) => handleDataChange('basicInfo', newData)} />
                    <EducationForm initialData={resumeData.education} onDataChange={(newData) => handleDataChange('education', newData)} />
                    <ExperienceForm initialData={resumeData.experiences} onDataChange={(newData) => handleDataChange('experiences', newData)} />
                    <ProjectForm initialData={resumeData.projects} onDataChange={(newData) => handleDataChange('projects', newData)} />
                    <SkillForm initialData={resumeData.skills} onDataChange={(newData) => handleDataChange('skills', newData)} />
                    
                    <div className="flex-shrink-0 mt-6 space-y-6">
                        {/* CORRECTED: Use spread operator now that prop names match */}
                        <ResumePDF {...resumeData} templateType={selectedTemplate} />
                    </div>
                </aside>

                <main className="w-full md:w-1/2 lg:w-3/5 h-screen flex flex-col p-6 lg:p-8">
                    <div className="flex-grow flex items-center justify-center overflow-auto">
                        <div className="transform scale-[0.8] origin-top">
                             {/* CORRECTED: Use spread operator now that prop names match */}
                             <ResumePreview {...resumeData} templateType={selectedTemplate} />
                        </div>
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}
