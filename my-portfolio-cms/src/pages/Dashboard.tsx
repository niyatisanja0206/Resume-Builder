import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Import form components
import EnhancedExperienceForm from "@/components/EnhancedExperienceForm";
import ProjectForm from "@/components/ProjectForm";
import SkillForm from "@/components/SkillForm";
import BasicForm from "@/components/BasicForm";
import EnhancedEducationForm from "@/components/EnhancedEducationForm";

// Import preview components
import ResumePreview from '@/components/ResumePreview';
import ResumePDF from '@/components/ResumePDFSimple';
import ErrorBoundary from '@/components/ErrorBoundary';

// Import utilities and context
import AuthGuard from "@/components/AuthGuard";
import { useUserContext } from "@/contexts/useUserContext";

// Import data types
import type { Basic, Project, Experience, Skill, Education } from '@/types/portfolio';

// Helper function to fetch all resume data
const fetchAllResumeData = async (userEmail: string) => {
  if (!userEmail) throw new Error('No user email provided');
  
  const responses = await Promise.allSettled([
    fetch(`/api/basic/get?email=${userEmail}`).then(r => r.ok ? r.json() : null),
    fetch(`/api/projects/getAll?email=${userEmail}`).then(r => r.ok ? r.json() : []),
    fetch(`/api/experiences/getAll?email=${userEmail}`).then(r => r.ok ? r.json() : []),
    fetch(`/api/skills/getAll?email=${userEmail}`).then(r => r.ok ? r.json() : []),
    fetch(`/api/education/getAll?email=${userEmail}`).then(r => r.ok ? r.json() : [])
  ]);

  return {
    basicInfo: responses[0].status === 'fulfilled' ? responses[0].value : null,
    projects: responses[1].status === 'fulfilled' ? responses[1].value : [],
    experiences: responses[2].status === 'fulfilled' ? responses[2].value : [],
    skills: responses[3].status === 'fulfilled' ? responses[3].value : [],
    education: responses[4].status === 'fulfilled' ? responses[4].value : []
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

export default function Dashboard() {
  const { currentUser } = useUserContext();
  const [searchParams, setSearchParams] = useSearchParams();
  
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

  // Initialize local state with server data when it loads
  useEffect(() => {
    if (serverData && !isLoading) {
      setLocalFormData(prevData => {
        // Only update if the data is actually different to prevent unnecessary re-renders
        const newData = {
          basicInfo: serverData.basicInfo || { 
            name: '', 
            contact_no: '', 
            email: userEmail, 
            location: '', 
            about: '' 
          },
          projects: serverData.projects || [],
          experiences: serverData.experiences || [],
          skills: serverData.skills || [],
          education: serverData.education || []
        };
        
        if (JSON.stringify(prevData) !== JSON.stringify(newData)) {
          console.log('Initializing local form data with server data:', newData);
          return newData;
        }
        return prevData;
      });
    }
  }, [serverData, isLoading, userEmail]);

  // Handle template changes and update URL
  const handleTemplateChange = (template: TemplateId) => {
    setSelectedTemplate(template);
    setSearchParams({ template });
  };

  // Toggle section visibility
  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Check if sections have content
  const hasContent = (section: keyof FullResumeData): boolean => {
    switch (section) {
      case 'basicInfo':
        return !!(localFormData.basicInfo?.name || localFormData.basicInfo?.email);
      case 'projects':
        return localFormData.projects.length > 0;
      case 'experiences':
        return localFormData.experiences.length > 0;
      case 'skills':
        return localFormData.skills.length > 0;
      case 'education':
        return localFormData.education.length > 0;
      default:
        return false;
    }
  };

  // Handle live updates to local form data
  const handleLocalDataChange = <K extends keyof FullResumeData>(
    section: K, 
    data: FullResumeData[K]
  ) => {
    console.log(`🔄 Live Update: ${String(section)} changing to:`, data);
    
    setLocalFormData(prevData => {
      // Prevent unnecessary updates for identical data
      if (JSON.stringify(prevData[section]) === JSON.stringify(data)) {
        console.log(`⚡ Data for ${String(section)} is identical, skipping update`);
        return prevData;
      }

      const newData = { ...prevData, [section]: data };
      console.log(`✅ Live Preview Updated: ${String(section)}`, newData);
      return newData;
    });

    // Ensure the section is visible in the preview
    if (!openSections[section as keyof typeof openSections]) {
      setOpenSections(prev => ({
        ...prev,
        [section as keyof typeof openSections]: true
      }));
    }
  };

  // Memoize the current data to prevent unnecessary re-renders
  const currentResumeData = useMemo(() => localFormData, [localFormData]);

  // Loading state
  if (isLoading) {
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

  // Error state
  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center p-6 max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-red-600 mb-2">Failed to Load Resume Data</h2>
          <p className="text-gray-600 mb-4">
            {error?.message || 'An error occurred while loading your resume data.'}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <ErrorBoundary fallback={
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="text-center p-6 max-w-md">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Dashboard Error</h2>
            <p className="text-gray-600 mb-4">
              The dashboard encountered an error. Please refresh the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Refresh Page
            </button>
          </div>
        </div>
      }>
        <div className="flex flex-col md:flex-row w-full min-h-screen bg-gray-100 dark:bg-gray-900">
          
          {/* LEFT SECTION - Forms */}
          <aside className="w-full md:w-1/2 lg:w-2/5 h-screen overflow-y-auto bg-white dark:bg-black p-6 lg:p-8 space-y-8">
            <header className="mb-6">
              <h1 className="text-3xl font-bold text-foreground">Live Resume Editor</h1>
              <p className="text-muted-foreground">Your changes will appear live in the preview.</p>
              
              {/* Template Selector */}
              <div className="mt-4 mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Choose Template:
                </label>
                <select 
                  value={selectedTemplate} 
                  onChange={(e) => handleTemplateChange(e.target.value as TemplateId)}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="classic">Classic</option>
                  <option value="modern">Modern</option>
                  <option value="creative">Creative</option>
                </select>
              </div>
            </header>
            
            {/* Form Sections */}
            <div className="space-y-6">
              
              {/* Basic Information Section */}
              <ErrorBoundary>
                <div className={`border rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm ${openSections.basic ? 'ring-2 ring-primary/20' : ''} transition-all duration-200`}>
                  <button 
                    onClick={() => toggleSection('basic')}
                    className={`w-full flex justify-between items-center p-4 text-left font-medium ${openSections.basic ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-gray-50 dark:hover:bg-gray-700'} transition-colors duration-200`}
                  >
                    <div className="flex items-center">
                      <span className="text-lg">Basic Information</span>
                      {hasContent('basicInfo') && (
                        <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                      )}
                    </div>
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
                        initialData={currentResumeData.basicInfo} 
                        onDataChange={(newData) => handleLocalDataChange('basicInfo', newData)}
                      />
                    </div>
                  )}
                </div>
              </ErrorBoundary>
              
              {/* Education Section */}
              <ErrorBoundary>
                <div className={`border rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm ${openSections.education ? 'ring-2 ring-primary/20' : ''} transition-all duration-200`}>
                  <button 
                    onClick={() => toggleSection('education')}
                    className={`w-full flex justify-between items-center p-4 text-left font-medium ${openSections.education ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-gray-50 dark:hover:bg-gray-700'} transition-colors duration-200`}
                  >
                    <div className="flex items-center">
                      <span className="text-lg">Education</span>
                      {hasContent('education') && (
                        <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                      )}
                    </div>
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
                      <EnhancedEducationForm 
                        initialData={currentResumeData.education} 
                        onDataChange={(newData) => handleLocalDataChange('education', newData)}
                      />
                    </div>
                  )}
                </div>
              </ErrorBoundary>
              
              {/* Experience Section */}
              <ErrorBoundary>
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
                      <EnhancedExperienceForm 
                        initialData={currentResumeData.experiences} 
                        onDataChange={(newData) => handleLocalDataChange('experiences', newData)}
                      />
                    </div>
                  )}
                </div>
              </ErrorBoundary>
              
              {/* Projects Section */}
              <ErrorBoundary>
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
                        initialData={currentResumeData.projects} 
                        onDataChange={(newData) => handleLocalDataChange('projects', newData)}
                      />
                    </div>
                  )}
                </div>
              </ErrorBoundary>
              
              {/* Skills Section */}
              <ErrorBoundary>
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
                        initialData={currentResumeData.skills} 
                        onDataChange={(newData) => handleLocalDataChange('skills', newData)}
                      />
                    </div>
                  )}
                </div>
              </ErrorBoundary>
            </div>
            
            {/* PDF Export Section */}
            <div className="flex-shrink-0 mt-6 space-y-6">
              <ErrorBoundary>
                <ResumePDF {...currentResumeData} templateType={selectedTemplate} />
              </ErrorBoundary>
            </div>
          </aside>

          {/* RIGHT SECTION - Live Preview */}
          <main className="w-full md:w-1/2 lg:w-3/5 h-screen flex flex-col p-6 lg:p-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-foreground">
                Live Preview - {selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1)} Template
              </h2>
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
