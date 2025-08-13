import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';
import { handleApiError, configureAxios } from '@/utils/apiUtils';

// Configure axios defaults
configureAxios();

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

// Import all data hooks
import { useBasic } from "@/hooks/useBasic";
import { useProject } from "@/hooks/useProject";
import { useExperience } from "@/hooks/useExperience";
import { useSkill } from "@/hooks/useSkills";
import { useEducation } from "@/hooks/useEducation";

// Import all data types
import type { Basic, Project, Experience, Skill, Education } from '@/types/portfolio';
//import { Button } from '@/components/ui/button';

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

    // Section visibility state
    const [openSections, setOpenSections] = useState({
        basic: true,
        education: false,
        experience: false,
        project: false,
        skill: false
    });

    // Toggle a section's visibility
    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

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
            // Try to get basic data from localStorage first (in case of refresh during editing)
            let basicInfo = basic || null;
            try {
                const savedBasicData = localStorage.getItem('basicFormData');
                if (savedBasicData) {
                    const parsedData = JSON.parse(savedBasicData) as Basic;
                    // Use saved data if it has the required email field
                    if (parsedData && parsedData.email) {
                        console.log('Using basic data from localStorage:', parsedData);
                        basicInfo = parsedData;
                    }
                }
            } catch (error) {
                console.error('Error reading basic data from localStorage:', error);
            }
            
            // Only update if there's actual data (to prevent unnecessary blank state)
            const updatedData = {
                basicInfo: basicInfo || { name: '', contact_no: '', email: userEmail, location: '', about: '' },
                projects: projects || resumeData.projects || [],
                experiences: experiences || resumeData.experiences || [],
                skills: skills || resumeData.skills || [],
                education: education || resumeData.education || []
            };
            
            // Compare if there are actual changes before updating state
            if (JSON.stringify(updatedData) !== JSON.stringify(resumeData)) {
                console.log("Updating resume data with fresh data from API");
                setResumeData(updatedData);
            }
            
            setPageLoading(false);
        }
    }, [
        basic, projects, experiences, skills, education,
        basicLoading, projectsLoading, experiencesLoading, skillsLoading, educationLoading,
        userEmail, resumeData
    ]);

    // --- LIVE UPDATE HANDLER ---
    const handleDataChange = <K extends keyof FullResumeData>(section: K, data: FullResumeData[K]) => {
        // Log what's changing for debugging
        console.log(`Updating ${String(section)} with new data:`, data);
        
        // For basic info, ensure contact_no is properly handled
        if (section === 'basicInfo' && data) {
            const basicData = data as Basic;
            // Ensure contact_no is a string
            if (basicData.contact_no === undefined || basicData.contact_no === null) {
                basicData.contact_no = '';
            }
            
            // Also save to localStorage for recovery on refresh
            try {
                localStorage.setItem('basicFormData', JSON.stringify(basicData));
            } catch (error) {
                console.error('Failed to save basic data to localStorage:', error);
            }
        }
        
        // Prevent unnecessary state updates for identical data
        if (JSON.stringify(resumeData[section]) === JSON.stringify(data)) {
            console.log(`Data for ${String(section)} is identical, skipping update`);
            return;
        }

        // Immediately update resume data for real-time preview
        setResumeData(prevData => {
            const newData = { ...prevData, [section]: data };
            console.log(`New resume data state:`, newData);
            return newData;
        });

        // Make sure the section is visible in the preview
        if (!openSections[section as keyof typeof openSections]) {
            setOpenSections(prev => ({
                ...prev,
                [section as keyof typeof openSections]: true
            }));
        }
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
            
            // First make the API calls to clear all data
            try {
                // Clear all sections using the deleteAll endpoints in parallel
                const clearOperations = [
                    axios.put('/api/basic/update', {
                        email: userEmail,
                        basicInfo: { name: '', contact_no: '', email: userEmail, location: '', about: '' }
                    }),
                    axios.delete('/api/projects/deleteAll', { params: { email: userEmail } }),
                    axios.delete('/api/experiences/deleteAll', { params: { email: userEmail } }),
                    axios.delete('/api/skills/deleteAll', { params: { email: userEmail } }),
                    axios.delete('/api/education/deleteAll', { params: { email: userEmail } }),
                    // Also clear resume drafts via resume controller
                    axios.delete('/api/resume/clear-draft', { 
                        headers: { 'x-auth-token': localStorage.getItem('token') } 
                    })
                ];
                
                await Promise.all(clearOperations);
                console.log("All clear operations completed successfully");
                
                // Clear any stored form data
                localStorage.removeItem('basicFormData');
                
                // Then update the UI state with empty data
                const emptyResume: FullResumeData = {
                    basicInfo: { name: '', contact_no: '', email: userEmail, location: '', about: '' },
                    projects: [],
                    experiences: [],
                    skills: [],
                    education: []
                };
                
                setResumeData(emptyResume);
                setPageLoading(false);
                alert("Resume cleared successfully");
            } catch (apiError) {
                console.error("API error during clear operations:", apiError);
                const errorMessage = handleApiError(apiError, "Failed to clear resume data");
                alert(`Error: ${errorMessage}`);
                setPageLoading(false);
            }
        } catch (error) {
            console.error("Failed to clear resume:", error);
            const errorMessage = handleApiError(error, "Failed to clear resume");
            alert(`Error: ${errorMessage}`);
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
            
            // First clear the current resume data without refreshing the page
            try {
                // Clear all sections using the deleteAll endpoints in parallel
                const clearOperations = [
                    axios.put('/api/basic/update', {
                        email: userEmail,
                        basicInfo: { name: '', contact_no: '', email: userEmail, location: '', about: '' }
                    }),
                    axios.delete('/api/projects/deleteAll', { params: { email: userEmail } }),
                    axios.delete('/api/experiences/deleteAll', { params: { email: userEmail } }),
                    axios.delete('/api/skills/deleteAll', { params: { email: userEmail } }),
                    axios.delete('/api/education/deleteAll', { params: { email: userEmail } })
                ];
                
                await Promise.all(clearOperations);
                console.log("All clear operations completed successfully");
                
                // Clear any stored form data
                localStorage.removeItem('basicFormData');
            } catch (clearError) {
                console.error("Error clearing data before creating new resume:", clearError);
                const errorMessage = handleApiError(clearError, "Failed to clear existing data");
                alert(`Error: ${errorMessage}`);
                setPageLoading(false);
                return;
            }
            
            // Create a new resume through the resume controller
            const response = await axios.post('/api/resume/new', {}, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            
            console.log("New resume created:", response.data);
            
            // Update the UI with empty data
            const emptyResume: FullResumeData = {
                basicInfo: { name: '', contact_no: '', email: userEmail, location: '', about: '' },
                projects: [],
                experiences: [],
                skills: [],
                education: []
            };
            
            setResumeData(emptyResume);
            setPageLoading(false);
            alert("New resume created successfully");
        } catch (error) {
            console.error("Failed to create new resume:", error);
            const errorMessage = handleApiError(error, "Failed to create new resume");
            alert(`Error: ${errorMessage}`);
            setPageLoading(false);
        }
    };
    
    // --- RENDER LOGIC ---
    if (isPageLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="text-center p-6 max-w-md">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-lg text-muted-foreground">Loading Your Resume Editor...</p>
                    <p className="text-sm text-muted-foreground mt-2">Please wait while we set up your resume workspace.</p>
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
                                className={`px-4 py-2 ${isPageLoading ? 'bg-red-400' : 'bg-red-500 hover:bg-red-600'} text-white rounded-md transition-colors flex items-center justify-center shadow-sm`}
                                disabled={isPageLoading}
                            >
                                {isPageLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                ) : null}
                                Clear Resume
                            </button>
                            <button 
                                onClick={createNewResume}
                                className={`px-4 py-2 ${isPageLoading ? 'bg-green-400' : 'bg-green-500 hover:bg-green-600'} text-white rounded-md transition-colors flex items-center justify-center shadow-sm`}
                                disabled={isPageLoading}
                            >
                                {isPageLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                ) : null}
                                New Resume
                            </button>
                        </div>
                    </header>
                    
                    {/* Form Sections with Collapsible Panels */}
                    <div className="space-y-6">
                        {/* Basic Information Section - Always visible */}
                        <div className={`border rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm ${openSections.basic ? 'ring-2 ring-primary/20' : ''} transition-all duration-200`}>
                            <button 
                                onClick={() => toggleSection('basic')}
                                className={`w-full flex justify-between items-center p-4 text-left font-medium ${openSections.basic ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-gray-50 dark:hover:bg-gray-700'} transition-colors duration-200`}
                            >
                                <span className="text-lg">Basic Information</span>
                                <div className="flex items-center">
                                    <span className={`mr-2 text-sm ${openSections.basic ? 'text-primary' : 'text-gray-500'}`}>
                                        {openSections.basic ? 'Hide' : 'Show'}
                                    </span>
                                    {openSections.basic ? 
                                        <ChevronUp className={`h-5 w-5 ${openSections.basic ? 'text-primary' : ''}`} /> : 
                                        <ChevronDown className="h-5 w-5" />
                                    }
                                </div>
                            </button>
                            
                            {openSections.basic && (
                                <div className="p-4 border-t transition-all duration-300 ease-in-out animate-fadeIn">
                                    <BasicForm 
                                        initialData={resumeData.basicInfo} 
                                        onDataChange={(newData) => handleDataChange('basicInfo', newData)} 
                                    />
                                </div>
                            )}
                        </div>
                        
                        {/* Education Section */}
                        <div className={`border rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm ${openSections.education ? 'ring-2 ring-primary/20' : ''} transition-all duration-200`}>
                            <button 
                                onClick={() => toggleSection('education')}
                                className={`w-full flex justify-between items-center p-4 text-left font-medium ${openSections.education ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-gray-50 dark:hover:bg-gray-700'} transition-colors duration-200`}
                            >
                                <span className="text-lg">Education</span>
                                <div className="flex items-center">
                                    <span className={`mr-2 text-sm ${openSections.education ? 'text-primary' : 'text-gray-500'}`}>
                                        {openSections.education ? 'Hide' : 'Show'}
                                    </span>
                                    {openSections.education ? 
                                        <ChevronUp className={`h-5 w-5 ${openSections.education ? 'text-primary' : ''}`} /> : 
                                        <ChevronDown className="h-5 w-5" />
                                    }
                                </div>
                            </button>
                            
                            {openSections.education && (
                                <div className="p-4 border-t transition-all duration-300 ease-in-out animate-fadeIn">
                                    <EducationForm 
                                        initialData={resumeData.education} 
                                        onDataChange={(newData) => handleDataChange('education', newData)} 
                                    />
                                </div>
                            )}
                        </div>
                        
                        {/* Experience Section */}
                        <div className={`border rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm ${openSections.experience ? 'ring-2 ring-primary/20' : ''} transition-all duration-200`}>
                            <button 
                                onClick={() => toggleSection('experience')}
                                className={`w-full flex justify-between items-center p-4 text-left font-medium ${openSections.experience ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-gray-50 dark:hover:bg-gray-700'} transition-colors duration-200`}
                            >
                                <span className="text-lg">Experience</span>
                                <div className="flex items-center">
                                    <span className={`mr-2 text-sm ${openSections.experience ? 'text-primary' : 'text-gray-500'}`}>
                                        {openSections.experience ? 'Hide' : 'Show'}
                                    </span>
                                    {openSections.experience ? 
                                        <ChevronUp className={`h-5 w-5 ${openSections.experience ? 'text-primary' : ''}`} /> : 
                                        <ChevronDown className="h-5 w-5" />
                                    }
                                </div>
                            </button>
                            
                            {openSections.experience && (
                                <div className="p-4 border-t transition-all duration-300 ease-in-out animate-fadeIn">
                                    <ExperienceForm 
                                        initialData={resumeData.experiences} 
                                        onDataChange={(newData) => handleDataChange('experiences', newData)} 
                                    />
                                </div>
                            )}
                        </div>
                        
                        {/* Projects Section */}
                        <div className={`border rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm ${openSections.project ? 'ring-2 ring-primary/20' : ''} transition-all duration-200`}>
                            <button 
                                onClick={() => toggleSection('project')}
                                className={`w-full flex justify-between items-center p-4 text-left font-medium ${openSections.project ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-gray-50 dark:hover:bg-gray-700'} transition-colors duration-200`}
                            >
                                <span className="text-lg">Projects</span>
                                <div className="flex items-center">
                                    <span className={`mr-2 text-sm ${openSections.project ? 'text-primary' : 'text-gray-500'}`}>
                                        {openSections.project ? 'Hide' : 'Show'}
                                    </span>
                                    {openSections.project ? 
                                        <ChevronUp className={`h-5 w-5 ${openSections.project ? 'text-primary' : ''}`} /> : 
                                        <ChevronDown className="h-5 w-5" />
                                    }
                                </div>
                            </button>
                            
                            {openSections.project && (
                                <div className="p-4 border-t transition-all duration-300 ease-in-out animate-fadeIn">
                                    <ProjectForm 
                                        initialData={resumeData.projects} 
                                        onDataChange={(newData) => handleDataChange('projects', newData)} 
                                    />
                                </div>
                            )}
                        </div>
                        
                        {/* Skills Section */}
                        <div className={`border rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm ${openSections.skill ? 'ring-2 ring-primary/20' : ''} transition-all duration-200`}>
                            <button 
                                onClick={() => toggleSection('skill')}
                                className={`w-full flex justify-between items-center p-4 text-left font-medium ${openSections.skill ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-gray-50 dark:hover:bg-gray-700'} transition-colors duration-200`}
                            >
                                <span className="text-lg">Skills</span>
                                <div className="flex items-center">
                                    <span className={`mr-2 text-sm ${openSections.skill ? 'text-primary' : 'text-gray-500'}`}>
                                        {openSections.skill ? 'Hide' : 'Show'}
                                    </span>
                                    {openSections.skill ? 
                                        <ChevronUp className={`h-5 w-5 ${openSections.skill ? 'text-primary' : ''}`} /> : 
                                        <ChevronDown className="h-5 w-5" />
                                    }
                                </div>
                            </button>
                            
                            {openSections.skill && (
                                <div className="p-4 border-t transition-all duration-300 ease-in-out animate-fadeIn">
                                    <SkillForm 
                                        initialData={resumeData.skills} 
                                        onDataChange={(newData) => handleDataChange('skills', newData)} 
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex-shrink-0 mt-6 space-y-6">
                        {/* CORRECTED: Use spread operator now that prop names match */}
                        <ResumePDF {...resumeData} templateType={selectedTemplate} />
                    </div>
                </aside>

                <main className="w-full md:w-1/2 lg:w-3/5 h-screen flex flex-col p-6 lg:p-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-foreground">Live Preview</h2>
                        <div className="flex items-center text-sm bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-3 py-1 rounded-full">
                            <span className="relative flex h-2 w-2 mr-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            Real-time updates
                        </div>
                    </div>
                    <div className="flex-grow flex flex-col items-center justify-start overflow-auto bg-gray-200 dark:bg-gray-800 rounded-lg p-4">
                        <div className="transform scale-[0.85] origin-top w-full mt-4 transition-transform duration-200">
                             {/* CORRECTED: Use spread operator now that prop names match */}
                             <ResumePreview {...resumeData} templateType={selectedTemplate} />
                        </div>
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}
