import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, FilePlus2, Trash2 } from 'lucide-react';
import { AxiosError } from 'axios';

// Import form components
import EnhancedExperienceForm from "@/components/EnhancedExperienceForm";
import ProjectForm from "@/components/ProjectForm";
import SkillForm from "@/components/SkillForm";
import BasicForm from "@/components/BasicForm";
import EnhancedEducationForm from "@/components/EnhancedEducationForm";

// Import preview components
import ResumePreview from '@/components/ResumePreview';
import ResumePDF from '@/components/ResumePDF';
import ErrorBoundary from '@/components/ErrorBoundary';

// Import utilities and context
import AuthGuard from "@/components/AuthGuard";
import { useUserContext } from "@/contexts/useUserContext";
import { useToast } from '@/contexts/ToastContext'; // Import the toast hook
import api from '@/utils/apiUtils'; // Import the configured axios instance

// Import data types
import type { Basic, Project, Experience, Skill, Education } from '@/types/portfolio';

// Helper function to fetch all resume data
const fetchAllResumeData = async (userEmail: string) => {
  if (!userEmail) throw new Error('No user email provided');
  
  // Using our authenticated api instance for requests
  const responses = await Promise.allSettled([
    api.get(`/basic/get?email=${userEmail}`).then(res => res.data),
    api.get(`/pro/getAll?email=${userEmail}`).then(res => res.data),
    api.get(`/exp/getAll?email=${userEmail}`).then(res => res.data),
    api.get(`/skill/getAll?email=${userEmail}`).then(res => res.data),
    api.get(`/edu/getAll?email=${userEmail}`).then(res => res.data)
  ]);

  // Process responses, handling potential nulls for failed requests
  const getData = (response: PromiseSettledResult<unknown>) => response.status === 'fulfilled' ? response.value : null;

  return {
    basicInfo: getData(responses[0]),
    projects: getData(responses[1]) || [],
    experiences: getData(responses[2]) || [],
    skills: getData(responses[3]) || [],
    education: getData(responses[4]) || []
  };
};


// Comprehensive type for all resume data
type FullResumeData = {
  basicInfo: Basic | null;
  projects: Project[];
  experiences: Experience[];
  skills: Skill[];
  education: Education[];
};

type TemplateId = 'classic' | 'modern' | 'creative';
const validTemplates: TemplateId[] = ['classic', 'modern', 'creative'];

export default function LiveDashboard() {
  const { currentUser } = useUserContext();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  
  const userEmail = currentUser?.email || '';
  const initialTemplate = searchParams.get('template');
  
  // Template selection state
  const templateFromUrl = initialTemplate && validTemplates.includes(initialTemplate as TemplateId) 
    ? initialTemplate as TemplateId 
    : 'classic';
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>(templateFromUrl);
  
  // Local form state - this is what drives the live preview
  const [localFormData, setLocalFormData] = useState<FullResumeData>({
    basicInfo: null,
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

  // Fetch initial data with React Query
  const { 
    data: serverData, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['resumeData', userEmail],
    queryFn: () => fetchAllResumeData(userEmail),
    enabled: !!userEmail,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Mutation for creating a new resume
  const { mutate: createNewResume, isPending: isCreating } = useMutation({
    mutationFn: () => api.post('/resume/create'),
    onSuccess: () => {
      showToast('New blank resume created!', 'success');
      // Reset local form data to a completely blank state
      const blankState = {
        basicInfo: { name: '', contact_no: '', email: userEmail, location: '', about: '' },
        projects: [],
        experiences: [],
        skills: [],
        education: []
      };
      setLocalFormData(blankState);
      // Invalidate and refetch to sync with the new server state
      queryClient.invalidateQueries({ queryKey: ['resumeData', userEmail] });
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      const errorMessage = err.response?.data?.message || err.message;
      showToast(`Error creating resume: ${errorMessage}`, 'error');
    }
  });

  // Mutation for clearing all resume data
  const { mutate: clearAllData, isPending: isClearing } = useMutation({
    mutationFn: async () => {
      if (!userEmail) throw new Error("User email is not available.");
      // Fire all delete requests concurrently
      const deletePromises = [
        api.delete(`/basic/delete?email=${userEmail}`),
        api.delete(`/edu/deleteAll?email=${userEmail}`),
        api.delete(`/exp/deleteAll?email=${userEmail}`),
        api.delete(`/pro/deleteAll?email=${userEmail}`),
        api.delete(`/skill/deleteAll?email=${userEmail}`),
      ];
      return Promise.allSettled(deletePromises);
    },
    onSuccess: (results) => {
        showToast('All resume data has been cleared.', 'success');
        const blankState = {
            basicInfo: { name: '', contact_no: '', email: userEmail, location: '', about: '' },
            projects: [],
            experiences: [],
            skills: [],
            education: []
        };
        setLocalFormData(blankState);
        queryClient.invalidateQueries({ queryKey: ['resumeData', userEmail] });

        results.forEach(result => {
            if (result.status === 'rejected') {
                console.error('A delete operation failed:', result.reason);
            }
        });
    },
    onError: (err: Error) => {
        showToast(`An error occurred while clearing data: ${err.message}`, 'error');
    }
  });


  // Handle URL template parameter changes
  useEffect(() => {
    const templateParam = searchParams.get('template');
    if (templateParam && validTemplates.includes(templateParam as TemplateId)) {
      const newTemplate = templateParam as TemplateId;
      if (newTemplate !== selectedTemplate) {
        setSelectedTemplate(newTemplate);
      }
    }
  }, [searchParams, selectedTemplate]);

  // Initialize local state with server data when it loads
  useEffect(() => {
    if (serverData && !isLoading) {
      setLocalFormData(prevData => {
        const newData: FullResumeData = {
          basicInfo: (serverData.basicInfo && typeof serverData.basicInfo === 'object' && 'name' in serverData.basicInfo) 
            ? serverData.basicInfo as Basic 
            : { name: '', contact_no: '', email: userEmail, location: '', about: '' },
          projects: (serverData.projects as Project[]) || [],
          experiences: (serverData.experiences as Experience[]) || [],
          skills: (serverData.skills as Skill[]) || [],
          education: (serverData.education as Education[]) || []
        };
        
        if (JSON.stringify(prevData) !== JSON.stringify(newData)) {
          return newData;
        }
        return prevData;
      });
    }
  }, [serverData, isLoading, userEmail]);

  // Toggle section visibility
  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };
  
  // Handle live updates to local form data
  const handleLocalDataChange = <K extends keyof FullResumeData>(section: K, data: FullResumeData[K]) => {
    setLocalFormData(prevData => ({ ...prevData, [section]: data }));
  };

  const currentResumeData = useMemo(() => localFormData, [localFormData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center p-6 max-w-md">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading Your Resume Editor...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center p-6 max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-red-600 mb-2">Failed to Load Resume Data</h2>
          <p className="text-gray-600 mb-4">{error?.message || 'An error occurred.'}</p>
          <button onClick={() => refetch()} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <ErrorBoundary fallback={<div>Something went wrong in the dashboard. Please refresh.</div>}>
        <div className="flex flex-col md:flex-row w-full min-h-screen bg-gray-100 dark:bg-gray-900">
          
          <aside className="w-full md:w-1/2 lg:w-2/5 h-screen overflow-y-auto bg-white dark:bg-black p-6 lg:p-8 space-y-8">
            <header className="mb-6">
              <h1 className="text-3xl font-bold text-foreground">Live Resume Editor</h1>
              <p className="text-muted-foreground">Your changes will appear live in the preview.</p>
              
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Template:</span>
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1)}
                    </span>
                  </div>
                  <Link to="/portfolio" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium">
                    Change Template
                  </Link>
                </div>
              </div>

              {/* NEW: Action Buttons */}
              <div className="mt-4 flex gap-4">
                <button
                  onClick={() => createNewResume()}
                  disabled={isCreating}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300"
                >
                  <FilePlus2 className="mr-2 h-4 w-4" />
                  {isCreating ? 'Creating...' : 'New Resume'}
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear all data for this resume? This cannot be undone.')) {
                      clearAllData();
                    }
                  }}
                  disabled={isClearing}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isClearing ? 'Clearing...' : 'Clear All Data'}
                </button>
              </div>
            </header>
            
            <div className="space-y-6">
              <ErrorBoundary>
                <div className={`border rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm ${openSections.basic ? 'ring-2 ring-primary/20' : ''}`}>
                  <button onClick={() => toggleSection('basic')} className={`w-full flex justify-between items-center p-4 text-left font-medium ${openSections.basic ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                    <span className="text-lg">Basic Information</span>
                    {openSections.basic ? <ChevronUp className="h-5 w-5 text-primary" /> : <ChevronDown className="h-5 w-5" />}
                  </button>
                  {openSections.basic && (
                    <div className="p-4 border-t">
                      <BasicForm initialData={currentResumeData.basicInfo} onDataChange={(newData) => handleLocalDataChange('basicInfo', newData)} />
                    </div>
                  )}
                </div>
              </ErrorBoundary>
              
              <ErrorBoundary>
                 <div className={`border rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm ${openSections.education ? 'ring-2 ring-primary/20' : ''}`}>
                    <button onClick={() => toggleSection('education')} className={`w-full flex justify-between items-center p-4 text-left font-medium ${openSections.education ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                        <span className="text-lg">Education</span>
                        {openSections.education ? <ChevronUp className="h-5 w-5 text-primary" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                    {openSections.education && (
                        <div className="p-4 border-t">
                        <EnhancedEducationForm initialData={currentResumeData.education} onDataChange={(newData) => handleLocalDataChange('education', newData)} />
                        </div>
                    )}
                 </div>
              </ErrorBoundary>
              
              <ErrorBoundary>
                <div className={`border rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm ${openSections.experience ? 'ring-2 ring-primary/20' : ''}`}>
                    <button onClick={() => toggleSection('experience')} className={`w-full flex justify-between items-center p-4 text-left font-medium ${openSections.experience ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                        <span className="text-lg">Experience</span>
                        {openSections.experience ? <ChevronUp className="h-5 w-5 text-primary" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                    {openSections.experience && (
                        <div className="p-4 border-t">
                        <EnhancedExperienceForm initialData={currentResumeData.experiences} onDataChange={(newData) => handleLocalDataChange('experiences', newData)} />
                        </div>
                    )}
                </div>
              </ErrorBoundary>
              
              <ErrorBoundary>
                <div className={`border rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm ${openSections.project ? 'ring-2 ring-primary/20' : ''}`}>
                    <button onClick={() => toggleSection('project')} className={`w-full flex justify-between items-center p-4 text-left font-medium ${openSections.project ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                        <span className="text-lg">Projects</span>
                        {openSections.project ? <ChevronUp className="h-5 w-5 text-primary" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                    {openSections.project && (
                        <div className="p-4 border-t">
                        <ProjectForm initialData={currentResumeData.projects} onDataChange={(newData) => handleLocalDataChange('projects', newData)} />
                        </div>
                    )}
                </div>
              </ErrorBoundary>
              
              <ErrorBoundary>
                <div className={`border rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm ${openSections.skill ? 'ring-2 ring-primary/20' : ''}`}>
                    <button onClick={() => toggleSection('skill')} className={`w-full flex justify-between items-center p-4 text-left font-medium ${openSections.skill ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                        <span className="text-lg">Skills</span>
                        {openSections.skill ? <ChevronUp className="h-5 w-5 text-primary" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                    {openSections.skill && (
                        <div className="p-4 border-t">
                        <SkillForm initialData={currentResumeData.skills} onDataChange={(newData) => handleLocalDataChange('skills', newData)} />
                        </div>
                    )}
                </div>
              </ErrorBoundary>
            </div>
            
            <div className="flex-shrink-0 mt-6 space-y-6">
              <ErrorBoundary>
                <ResumePDF {...currentResumeData} templateType={selectedTemplate} />
              </ErrorBoundary>
            </div>
          </aside>

          <main className="w-full md:w-1/2 lg:w-3/5 h-screen flex flex-col p-6 lg:p-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-foreground">Live Preview</h2>
            </div>
            
            <div className="flex-grow flex flex-col items-center justify-start overflow-auto bg-gray-200 dark:bg-gray-800 rounded-lg p-4">
              <div className="transform scale-[0.85] origin-top w-full mt-4">
                <ErrorBoundary>
                  <ResumePreview {...currentResumeData} template={selectedTemplate} />
                </ErrorBoundary>
              </div>
            </div>
          </main>
        </div>
      </ErrorBoundary>
    </AuthGuard>
  );
}
