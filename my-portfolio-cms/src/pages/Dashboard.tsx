import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Import form components
import EnhancedExperienceForm from "@/components/EnhancedExperienceForm";
import EnhancedProjectForm from "@/components/EnhancedProjectForm";
import EnhancedBasicForm from "@/components/EnhancedBasicForm";
import EnhancedEducationForm from "@/components/EnhancedEducationForm";
import EnhancedSkillForm from "@/components/EnhancedSkillForm";

// Import Toast Context
import { useToast } from "@/contexts/ToastContext";

// Import preview components
import ResumePreview from '@/components/ResumePreview';
import ResumePDF from '@/components/ResumePDFSimple';
import ErrorBoundary from '@/components/ErrorBoundary';

// Import utilities and context
import AuthGuard from "@/components/AuthGuard";
import { useUserContext } from "@/contexts/useUserContext";

// Import data types
import type { Basic, Project, Experience, Skill, Education } from '@/types/portfolio';

// Helper function to fetch all resume data (unchanged)
const fetchAllResumeData = async (userEmail: string) => {
  if (!userEmail) throw new Error('No user email provided');

  const responses = await Promise.allSettled([
    fetch(`/api/basic/get?email=${userEmail}`).then(r => r.ok ? r.json() : null),
    fetch(`/api/pro/get?email=${userEmail}`).then(r => r.ok ? r.json() : []),
    fetch(`/api/exp/get?email=${userEmail}`).then(r => r.ok ? r.json() : []),
    fetch(`/api/skill/get?email=${userEmail}`).then(r => r.ok ? r.json() : []),
    fetch(`/api/edu/get?email=${userEmail}`).then(r => r.ok ? r.json() : [])
  ]);

  return {
    basicInfo: responses[0].status === 'fulfilled' ? responses[0].value : null,
    projects: responses[1].status === 'fulfilled' ? responses[1].value : [],
    experiences: responses[2].status === 'fulfilled' ? responses[2].value : [],
    skills: responses[3].status === 'fulfilled' ? responses[3].value : [],
    education: responses[4].status === 'fulfilled' ? responses[4].value : []
  };
};

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
  const { currentUser, setCurrentUser } = useUserContext();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  console.log('Dashboard: Component rendering with currentUser:', currentUser);

  const userEmail = currentUser?.email || '';
  const initialTemplate = searchParams.get('template');

  console.log('Dashboard: userEmail:', userEmail, 'initialTemplate:', initialTemplate);

  const [isSaving, setIsSaving] = useState(false);

  const selectedTemplate = initialTemplate && validTemplates.includes(initialTemplate as TemplateId)
    ? (initialTemplate as TemplateId)
    : 'classic';

  const [localFormData, setLocalFormData] = useState<FullResumeData>({
    basicInfo: null,
    projects: [],
    experiences: [],
    skills: [],
    education: []
  });

  const [openSections, setOpenSections] = useState({
    basic: true,
    education: true, // default open so users can type and see preview instantly
    experience: false,
    project: false,
    skill: false
  });

  const { data: serverData, isLoading, isError, error } = useQuery({
    queryKey: ['resumeData', userEmail],
    queryFn: () => fetchAllResumeData(userEmail),
    enabled: !!userEmail,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  console.log('Dashboard: Query state:', { serverData, isLoading, isError, error, userEmail });

  useEffect(() => {
    if (serverData && !isLoading) {
      setLocalFormData(prevData => {
        const newData = {
          basicInfo: serverData.basicInfo || {
            name: '', contact_no: '', email: userEmail, location: '', about: ''
          },
          projects: serverData.projects || [],
          experiences: serverData.experiences || [],
          skills: serverData.skills || [],
          education: serverData.education || []
        };
        
        // Check if this is the initial load (no existing data)
        const isInitialLoad = (
          (!prevData.basicInfo || !prevData.basicInfo.name) && 
          prevData.projects.length === 0 && 
          prevData.experiences.length === 0 && 
          prevData.skills.length === 0 && 
          prevData.education.length === 0
        );
        
        // Only update on initial load to avoid overriding local changes
        // For deletions and other updates, rely on local state management
        if (isInitialLoad) {
          console.log('📊 Dashboard: Initial load - updating local data from server', { prevData, newData });
          showToast('Resume data loaded successfully', 'success');
          return newData;
        }
        
        console.log('📊 Dashboard: Keeping local data (avoiding server override)', { prevData, serverData });
        return prevData;
      });
    }
  }, [serverData, isLoading, userEmail, showToast]);

  useEffect(() => {
    if (isError && error) {
      showToast(`Failed to load resume data: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  }, [isError, error, showToast]);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };


  const handleSaveResume = async () => {
    if (!currentUser || !currentUser.email) {
      showToast('You must be logged in to save a resume', 'error');
      return;
    }

    try {
      setIsSaving(true);
      showToast('Saving your resume...', 'info');

      const token = localStorage.getItem('token');
      const resumeData = {
        userEmail: currentUser.email,
        title: `Resume ${new Date().toLocaleDateString()}`,
        status: 'completed',
        basic: localFormData.basicInfo,
        education: localFormData.education,
        experience: localFormData.experiences,
        projects: localFormData.projects,
        skills: localFormData.skills,
        template: selectedTemplate
      };

      const url = '/api/users/resumes';
      const method = 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(resumeData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(`Failed to save resume: ${response.status} ${response.statusText}${errorData ? ' - ' + errorData.message : ''}`);
      }

      showToast('Resume saved successfully!', 'success');
      navigate('/profile');
    } catch (error) {
      showToast(`Failed to save resume: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearResume = () => {
    if (window.confirm('Are you sure you want to clear all resume data? This cannot be undone.')) {
      setLocalFormData({
        basicInfo: { name: '', contact_no: '', email: userEmail, location: '', about: '' },
        projects: [],
        experiences: [],
        skills: [],
        education: []
      });
      showToast('Resume data cleared', 'info');
    }
  };

  const hasResumeContent = useMemo(() => {
    return !!(
      (localFormData.basicInfo?.name && localFormData.basicInfo?.name.trim() !== '') ||
      localFormData.projects.length > 0 ||
      localFormData.experiences.length > 0 ||
      localFormData.skills.length > 0 ||
      localFormData.education.length > 0
    );
  }, [localFormData]);

  // MAIN: Live updates from child forms (now without toast spam for Education typing)
  const handleLocalDataChange = <K extends keyof FullResumeData>(section: K, data: FullResumeData[K]) => {
    console.log('📊 Dashboard: handleLocalDataChange called', { section, data });
    
    // Sync basic to user context
    if (section === 'basicInfo' && data && typeof data === 'object' && 'email' in data) {
      const basicData = data as Basic;
      if (basicData && basicData.email && typeof (setCurrentUser) === 'function') {
        setCurrentUser(basicData);
      }
    }

    setLocalFormData(prev => {
      const safeData: FullResumeData[K] = data || (section === 'basicInfo'
        ? { name: '', contact_no: '', email: currentUser?.email || '', location: '', about: '' }
        : []) as FullResumeData[K];
      const next = { ...prev, [section]: safeData } as FullResumeData;
      console.log('📊 Dashboard: Updated localFormData', { section, safeData, prev, next });
      return next;
    });

    // Avoid noisy toasts on every keystroke in the Education, Experience, and Project forms
    if (section !== 'basicInfo' && section !== 'education' && section !== 'experiences' && section !== 'projects') {
      showToast(`${formatSectionName(section as string)} updated`, 'success');
    }

    // Ensure section visible
    const map: Record<string, keyof typeof openSections> = {
      basicInfo: 'basic',
      education: 'education',
      experiences: 'experience',
      projects: 'project',
      skills: 'skill',
    };
    const sec = map[section as string];
    if (sec && !openSections[sec]) {
      setOpenSections(prev => ({ ...prev, [sec]: true }));
    }
  };

  const formatSectionName = (section: string): string => {
    switch (section) {
      case 'basicInfo': return 'Basic Information';
      case 'projects': return 'Projects';
      case 'experiences': return 'Experience';
      case 'skills': return 'Skills';
      case 'education': return 'Education';
      default: return section.charAt(0).toUpperCase() + section.slice(1);
    }
  };

  const currentResumeData = useMemo(() => localFormData, [localFormData]);

  // Debug current education data
  useEffect(() => {
    console.log('📊 Dashboard: currentResumeData.education changed:', currentResumeData.education);
  }, [currentResumeData.education]);

  return (
    <AuthGuard>
      <ErrorBoundary fallback={<div>Dashboard Error</div>}>
        <div className="flex flex-col md:flex-row w-full min-height-screen bg-gray-100 dark:bg-gray-900">
          {/* LEFT: Forms */}
          <aside className="w-full md:w-1/2 lg:w-2/5 h-screen overflow-y-auto bg-white dark:bg-black p-6 lg:p-8 space-y-8">
            {/* Basic */}
            <ErrorBoundary>
              <div className={`border rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm ${openSections.basic ? 'ring-2 ring-primary/20' : ''}`}>
                <button onClick={() => toggleSection('basic')} className={`w-full flex justify-between items-center p-4 text-left font-medium ${openSections.basic ? 'bg-primary/10 text-primary' : ''}`}>
                  <span className="text-lg">Basic Information</span>
                  {openSections.basic ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
                {openSections.basic && (
                  <div className="p-4 border-t">
                    <EnhancedBasicForm
                      initialData={currentResumeData.basicInfo}
                      onDataChange={(d) => handleLocalDataChange('basicInfo', d)}
                    />
                  </div>
                )}
              </div>
            </ErrorBoundary>

            {/* Education */}
            <ErrorBoundary>
              <div className={`border rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm ${openSections.education ? 'ring-2 ring-primary/20' : ''}`}>
                <button onClick={() => toggleSection('education')} className={`w-full flex justify-between items-center p-4 text-left font-medium ${openSections.education ? 'bg-primary/10 text-primary' : ''}`}>
                  <span className="text-lg">Education</span>
                  {openSections.education ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
                {openSections.education && (
                  <div className="p-4 border-t">
                    <EnhancedEducationForm
                      initialData={currentResumeData.education}
                      onDataChange={(d) => handleLocalDataChange('education', d)}
                    />
                  </div>
                )}
              </div>
            </ErrorBoundary>

            {/* Experience */}
            <ErrorBoundary>
              <div className={`border rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm ${openSections.experience ? 'ring-2 ring-primary/20' : ''}`}>
                <button onClick={() => toggleSection('experience')} className={`w-full flex justify-between items-center p-4 text-left font-medium ${openSections.experience ? 'bg-primary/10 text-primary' : ''}`}>
                  <span className="text-lg">Experience</span>
                  {openSections.experience ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
                {openSections.experience && (
                  <div className="p-4 border-t">
                    <EnhancedExperienceForm
                      initialData={currentResumeData.experiences}
                      onDataChange={(d) => handleLocalDataChange('experiences', d)}
                    />
                  </div>
                )}
              </div>
            </ErrorBoundary>

            {/* Projects */}
            <ErrorBoundary>
              <div className={`border rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm ${openSections.project ? 'ring-2 ring-primary/20' : ''}`}>
                <button onClick={() => toggleSection('project')} className={`w-full flex justify-between items-center p-4 text-left font-medium ${openSections.project ? 'bg-primary/10 text-primary' : ''}`}>
                  <span className="text-lg">Projects</span>
                  {openSections.project ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
                {openSections.project && (
                  <div className="p-4 border-t">
                    <EnhancedProjectForm
                      initialData={currentResumeData.projects}
                      onDataChange={(d) => handleLocalDataChange('projects', d)}
                    />
                  </div>
                )}
              </div>
            </ErrorBoundary>

            {/* Skills */}
            <ErrorBoundary>
              <div className={`border rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm ${openSections.skill ? 'ring-2 ring-primary/20' : ''}`}>
                <button onClick={() => toggleSection('skill')} className={`w-full flex justify-between items-center p-4 text-left font-medium ${openSections.skill ? 'bg-primary/10 text-primary' : ''}`}>
                  <span className="text-lg">Skills</span>
                  {openSections.skill ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
                {openSections.skill && (
                  <div className="p-4 border-t">
                    <EnhancedSkillForm
                      initialData={currentResumeData.skills}
                      onDataChange={(d) => handleLocalDataChange('skills', d)}
                    />
                  </div>
                )}
              </div>
            </ErrorBoundary>

            {/* PDF + Save/Clear */}
            <div className="flex-shrink-0 mt-6 space-y-6">
              <ErrorBoundary>
                <ResumePDF {...currentResumeData} templateType={selectedTemplate} canDownload={hasResumeContent} />
              </ErrorBoundary>

              <div className="flex justify-between gap-4 mt-6">
                <Button onClick={handleClearResume} variant="destructive" className="flex items-center gap-2" disabled={isSaving}>
                  <Trash2 className="h-5 w-5" />
                  Clear Resume
                </Button>
                <Button onClick={handleSaveResume} className="flex items-center gap-2" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      Save Resume
                    </>
                  )}
                </Button>
              </div>
            </div>
          </aside>

          {/* RIGHT: Live Preview */}
          <main className="w-full md:w-1/2 lg:w-3/5 h-screen flex flex-col p-6 lg:p-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-foreground">Live Preview - {selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1)} Template</h2>
              <div className="flex items-center text-sm bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-3 py-1 rounded-full">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
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
