import { useState, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
// Import form components
import EnhancedExperienceForm from "@/components/dashboard/EnhancedExperienceForm";
import EnhancedProjectForm from "@/components/dashboard/EnhancedProjectForm";
import EnhancedBasicForm from "@/components/dashboard/EnhancedBasicForm";
import EnhancedEducationForm from "@/components/dashboard/EnhancedEducationForm";
import EnhancedSkillForm from "@/components/dashboard/EnhancedSkillForm";

// Import Toast Context
import { useToast } from "@/contexts/ToastContext";

// Import preview components
import ResumePreview from '@/components/dashboard/ResumePreview';
import ResumePDF from '@/components/dashboard/ResumePDF';

// Import utilities and context
import { useUserContext } from "@/hooks/useUserContext";

// Import data types
import type { Basic, Project, Experience, Skill, Education } from '@/types/portfolio';

// Helper function to fetch specific resume data by ID
const fetchResumeById = async (resumeId: string) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`/api/users/resumes/${resumeId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch resume');
  }
  
  return response.json();
};

// Helper function to get current draft resume ID
const getCurrentDraftResumeId = async (userEmail: string): Promise<string | null> => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/users/resumes?email=${userEmail}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      return null;
    }
    
    const resumes = await response.json();
    // Find the draft resume (status === 'draft' and isDownloaded === false)
    const draftResume = resumes.find((resume: { status: string; isDownloaded: boolean; _id: string }) => 
      resume.status === 'draft' && !resume.isDownloaded
    );
    return draftResume ? draftResume._id : null;
  } catch (error) {
    console.error('Error fetching draft resume ID:', error);
    return null;
  }
};

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
  const queryClient = useQueryClient();
  const { currentUser, setCurrentUser } = useUserContext();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const userEmail = currentUser?.email || '';
  const initialTemplate = searchParams.get('template');
  const selectedResumeId = localStorage.getItem('selectedResumeId');
  const isNewResumeFromUrl = searchParams.get('new') === 'true';
  const isNewResume = localStorage.getItem('isNewResume') === 'true' || isNewResumeFromUrl;

  const [isSaving, setIsSaving] = useState(false);
  const [showTitleDialog, setShowTitleDialog] = useState(false);
  const [resumeTitle, setResumeTitle] = useState('');
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);

  // Template selection logic: for saved resumes use template from resume data, for drafts use query param or fallback to classic
  const selectedTemplate: TemplateId = initialTemplate && validTemplates.includes(initialTemplate as TemplateId)
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
    education: false,
    experience: false,
    project: false,
    skill: false
  });

  // Query for specific resume (when editing)
  const { data: specificResumeData, isLoading: specificResumeLoading } = useQuery({
    queryKey: ['specificResume', selectedResumeId],
    queryFn: () => fetchResumeById(selectedResumeId!),
    enabled: !!selectedResumeId && !isNewResume,
  });

  // Query for draft resume data (when not editing specific resume and not new)
  const { data: serverData, isLoading, isError, error } = useQuery({
    queryKey: ['resumeData', userEmail],
    queryFn: () => fetchAllResumeData(userEmail),
    enabled: !!userEmail && !selectedResumeId && !isNewResume,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    // Scenario 1: New resume - start with empty data
    if (isNewResume) {
      console.log('Dashboard: Starting with empty data for new resume');
      localStorage.removeItem('isNewResume');
      // Clear URL parameters if present
      if (isNewResumeFromUrl) {
        navigate('/dashboard', { replace: true });
      }
      setLocalFormData({
        basicInfo: { name: '', contact_no: '', email: userEmail, location: '', about: '' },
        projects: [],
        experiences: [],
        skills: [],
        education: []
      });
      setCurrentDraftId(null); // No draft for new resume
      return;
    }

    // Scenario 2: Editing specific resume
    if (specificResumeData && !specificResumeLoading) {
      console.log('Dashboard: Loading specific resume data', specificResumeData);
      setLocalFormData({
        basicInfo: specificResumeData.basic || { name: '', contact_no: '', email: userEmail, location: '', about: '' },
        projects: specificResumeData.projects || [],
        experiences: specificResumeData.experience || [],
        skills: specificResumeData.skills || [],
        education: specificResumeData.education || []
      });
      // Don't clear selectedResumeId here - we need it for saving
      // Only set currentDraftId if this is actually a draft resume
      if (specificResumeData.status === 'draft') {
        setCurrentDraftId(specificResumeData._id || null);
      } else {
        setCurrentDraftId(null); // This is a completed resume, don't treat as draft
      }
      return;
    }

    // Scenario 3: Working with draft resume (existing behavior)
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
        if (isInitialLoad) {
          console.log('Dashboard: Initial load - updating local data from server', { prevData, newData });
          return newData;
        }
        
        console.log('Dashboard: Keeping local data (avoiding server override)', { prevData, serverData });
        return prevData;
      });
      
      // Fetch the current draft resume ID for updating
      if (userEmail) {
        getCurrentDraftResumeId(userEmail).then(draftId => {
          console.log('Dashboard: Found draft resume ID:', draftId);
          setCurrentDraftId(draftId);
          if (draftId) {
            localStorage.setItem('selectedResumeId', draftId);
          }
        });
      }
    }
  }, [serverData, isLoading, specificResumeData, specificResumeLoading, userEmail, isNewResume, isNewResumeFromUrl, navigate]);

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

    // Require at least basic info before saving (allow incomplete save)
    const basicInfo = localFormData.basicInfo;
    const hasBasic = basicInfo && basicInfo.name && basicInfo.email && basicInfo.contact_no && basicInfo.location && basicInfo.about;
    if (!hasBasic) {
      showToast('Please fill all basic information fields before saving.', 'error');
      return;
    }

    // Warn if incomplete, but allow save
    const validationErrors = validateResumeCompleteness(localFormData);
    const isIncomplete = validationErrors.length > 0;
    // If editing a previously saved resume (has id and data) and not changing from draft/incomplete to completed, save immediately
    if (
      selectedResumeId &&
      specificResumeData &&
      specificResumeData.title &&
      (
        isIncomplete ||
        // Not transitioning to completed
        !(specificResumeData.status === 'draft' || specificResumeData.status === 'incomplete') ||
        // Already completed
        (specificResumeData.status === 'completed' && resumeStatus === 'Complete')
      )
    ) {
      await performSave(specificResumeData.title, true); // skip duplicate check
      return;
    }
    if (isIncomplete) {
      showToast(`Resume is incomplete: ${validationErrors.join(', ')}`, 'info');
      // Save immediately with default title logic
      let defaultTitle = '';
      const userName = localFormData.basicInfo?.name || currentUser.name || '';
      defaultTitle = userName ? `${userName}'s Resume` : 'My Resume';
      await performSave(defaultTitle);
      return;
    }
    // If new or being completed for the first time, open dialog for user to confirm/change title
    let defaultTitle = '';
    const userName = localFormData.basicInfo?.name || currentUser.name || '';
    defaultTitle = userName ? `${userName}'s Resume` : 'My Resume';
    setResumeTitle(defaultTitle);
    setShowTitleDialog(true);
  };

  // Extracted save logic to be reused

  // skipDuplicateCheck: if true, do not check for duplicate title
  const performSave = async (titleToUse: string, skipDuplicateCheck = false) => {
    try {
      setIsSaving(true);
      showToast('Saving your resume...', 'info');

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      if (!skipDuplicateCheck) {
        // Fetch all user resumes to check for duplicate title
        const allResumesResp = await fetch(`/api/users/resumes?email=${currentUser!.email}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // Use Resume type for type safety
        type Resume = { _id: string; title: string };
        const allResumes: Resume[] = allResumesResp.ok ? await allResumesResp.json() : [];
        // Ignore current resume's own title for duplicate check
        const resumeIdToUpdate = localStorage.getItem('selectedResumeId') || currentDraftId;
        const duplicate = allResumes.some((r) => r.title.trim().toLowerCase() === titleToUse.trim().toLowerCase() && r._id !== resumeIdToUpdate);
        if (duplicate) {
          showToast('A resume with this name already exists. Please choose a different name.', 'error');
          setIsSaving(false);
          return;
        }
      }

      // Determine status based on completeness
      let status: 'completed' | 'incomplete' | 'draft' = 'draft';
      const basicInfo = localFormData.basicInfo;
      const hasBasic = basicInfo && basicInfo.name && basicInfo.email && basicInfo.contact_no && basicInfo.location && basicInfo.about;
      const hasEducation = localFormData.education && localFormData.education.length > 0;
      const hasExperience = localFormData.experiences && localFormData.experiences.length > 0;

      if (hasBasic && hasEducation && hasExperience) {
        status = 'completed';
      } else if (hasBasic) {
        status = 'incomplete';
      } else {
        status = 'draft';
      }

      const resumeData = {
        userEmail: currentUser!.email,
        title: titleToUse.trim(),
        status,
        basic: localFormData.basicInfo,
        education: localFormData.education,
        experience: localFormData.experiences,
        projects: localFormData.projects,
        skills: localFormData.skills,
        template: selectedTemplate
      };

      // Always use selectedResumeId from localStorage or currentDraftId for update
      const selectedResumeId = localStorage.getItem('selectedResumeId');
      const resumeIdToUpdate = selectedResumeId || currentDraftId;
      let url: string;
      let method: string;

      if (resumeIdToUpdate) {
        // Always update if a draft exists
        console.log('Dashboard: Updating existing resume:', resumeIdToUpdate);
        url = `/api/users/resumes/${resumeIdToUpdate}`;
        method = 'PUT';
      } else {
        // Only create if no draft exists
        console.log('Dashboard: Creating new resume');
        url = '/api/users/resumes';
        method = 'POST';
      }

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

      const result = await response.json();
      console.log('Dashboard: Resume saved successfully:', result);

      showToast('Resume saved successfully!', 'success');
      setShowTitleDialog(false);
      setResumeTitle('');
      setCurrentDraftId(null); // Clear draft ID since it's now completed

      // Clean up localStorage after successful save
      // Only remove selectedResumeId if status transitioned to completed for the first time
      if (
        resumeIdToUpdate &&
        ((specificResumeData && (specificResumeData.status === 'draft' || specificResumeData.status === 'incomplete')) && status === 'completed')
      ) {
        localStorage.removeItem('selectedResumeId');
      }
      localStorage.removeItem('isNewResume');

      // Invalidate userResumes query so ProfilePage updates instantly
      queryClient.invalidateQueries({ queryKey: ['userResumes'] });

      // Notify ProfilePage to refetch resumes (for legacy event-based listeners)
      window.dispatchEvent(new Event('resume-saved'));
      navigate('/profile');
    } catch (error) {
      console.error('Save error:', error);
      showToast(`Failed to save resume: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Function to validate resume completeness
  const validateResumeCompleteness = (data: FullResumeData): string[] => {
    const errors: string[] = [];

    // --- Basic Information (All fields are mandatory for incomplete/completed) ---
    const hasBasic = data.basicInfo && data.basicInfo.name?.trim() && data.basicInfo.contact_no?.trim() && data.basicInfo.email?.trim() && data.basicInfo.location?.trim() && data.basicInfo.about?.trim();
    const hasEducation = data.education && data.education.length > 0;
    const hasExperience = data.experiences && data.experiences.length > 0;

    // Only require all for completed
    if (hasBasic && hasEducation && hasExperience) {
      // Check for missing fields in education and experience for 'completed'
      data.education.forEach((edu, index) => {
        if (!edu.institution?.trim()) errors.push(`Education ${index + 1}: Institution name`);
        if (!edu.degree?.trim()) errors.push(`Education ${index + 1}: Degree`);
        if (!edu.startDate) errors.push(`Education ${index + 1}: Start date`);
        if (!edu.Grade?.trim()) errors.push(`Education ${index + 1}: Grade/GPA`);
      });
      data.experiences.forEach((exp, index) => {
        if (!exp.company?.trim()) errors.push(`Experience ${index + 1}: Company name`);
        if (!exp.position?.trim()) errors.push(`Experience ${index + 1}: Position`);
        if (!exp.startDate) errors.push(`Experience ${index + 1}: Start date`);
        if (!exp.skillsLearned || exp.skillsLearned.length === 0) {
          errors.push(`Experience ${index + 1}: Skills learned`);
        }
      });
      // Projects (optional, but if present, must be complete)
      if (data.projects && data.projects.length > 0) {
        data.projects.forEach((project, index) => {
          if (!project.title?.trim()) errors.push(`Project ${index + 1}: Title`);
          if (!project.description?.trim()) errors.push(`Project ${index + 1}: Description`);
          if (!project.techStack || project.techStack.length === 0) {
            errors.push(`Project ${index + 1}: Tech stack`);
          }
        });
      }
    } else if (hasBasic) {
      // Only require basic info for 'incomplete'
      // No further checks
    } else {
      // For 'draft', require nothing
      if (!data.basicInfo) errors.push('Basic information is missing');
    }

    // --- Skills (Optional, but if present, must be complete) ---
    if (data.skills && data.skills.length > 0) {
      data.skills.forEach((skill, index) => {
        if (!skill.name?.trim()) errors.push(`Skill ${index + 1}: Name`);
        if (!skill.level) errors.push(`Skill ${index + 1}: Level`);
      });
    }

    return errors;
  };

  const handleSaveWithTitle = async () => {
    if (!resumeTitle.trim()) {
      showToast('Please enter a title for your resume', 'error');
      return;
    }

    await performSave(resumeTitle.trim());
  };

  const handleCancelSave = () => {
    setShowTitleDialog(false);
    setResumeTitle('');
    setIsSaving(false);
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

  // Show 'Complete' only if all required sections are filled (status would be 'completed')
  const resumeStatus = useMemo(() => {
    const basicInfo = localFormData.basicInfo;
    const hasBasic = basicInfo && basicInfo.name && basicInfo.email && basicInfo.contact_no && basicInfo.location && basicInfo.about;
    const hasEducation = localFormData.education && localFormData.education.length > 0;
    const hasExperience = localFormData.experiences && localFormData.experiences.length > 0;
    if (hasBasic && hasEducation && hasExperience) return 'Complete';
    if (hasBasic) return 'Incomplete';
    return 'Draft';
  }, [localFormData]);

  // MAIN: Live updates from child forms (now without toast spam for Education typing)
  const handleLocalDataChange = <K extends keyof FullResumeData>(section: K, data: FullResumeData[K]) => {
    console.log('Dashboard: handleLocalDataChange called', { section, data });
    
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
      console.log('Dashboard: Updated localFormData', { section, safeData, prev, next });
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
    console.log('Dashboard: currentResumeData.education changed:', currentResumeData.education);
  }, [currentResumeData.education]);

  return (
    <>
      <div className="flex flex-col md:flex-row w-full min-height-screen bg-gray-100 dark:bg-gray-900">
          {/* LEFT: Forms */}
          <aside className="w-full md:w-1/2 lg:w-2/5 h-screen overflow-y-auto bg-white dark:bg-black p-6 lg:p-8 space-y-8">
            <Button className='mb-4'><Link to="/portfolio">Change template</Link></Button>
            {/* Basic */}
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

            {/* Education */}
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

            {/* Experience */}
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

            {/* Projects */}
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

            {/* Skills */}
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

            {/* PDF + Save/Clear */}
            <div className="flex-shrink-0 mt-6 space-y-6">
                <ResumePDF {...currentResumeData} templateType={selectedTemplate} canDownload={hasResumeContent} />
              
              {/* Resume Completion Status */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Resume Status</h3>
                  <span className={`text-sm font-medium ${resumeStatus === 'Complete' ? 'text-green-600' : resumeStatus === 'Incomplete' ? 'text-orange-600' : 'text-gray-500'}`}>
                    {resumeStatus}
                  </span>
                </div>
                {resumeStatus !== 'Complete' && (
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {resumeStatus === 'Incomplete' ? 'All sections must be filled before saving as complete.' : 'Please fill basic information to start your resume.'}
                  </div>
                )}
              </div>

              <div className="flex justify-between gap-4 mt-6">
                <Button onClick={handleClearResume} variant="destructive" className="flex items-center gap-2" disabled={isSaving}>
                  <Trash2 className="h-5 w-5" />
                  Clear Resume
                </Button>
                <Button 
                  onClick={handleSaveResume}
                  className="flex items-center gap-2"
                  disabled={isSaving || !currentUser}
                  title={
                    !currentUser
                      ? "Please log in to save"
                      : resumeStatus !== 'Complete'
                      ? "Resume will be saved as incomplete."
                      : "Save your resume"
                  }
                >
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
                  <ResumePreview {...currentResumeData} template={selectedTemplate} />
              </div>
            </div>
          </main>
        </div>

        {/* Fixed Title Dialog - Now shows for both new and existing resumes when needed */}
        {showTitleDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Save Resume
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Please enter a title for your resume:
              </p>
              <input
                type="text"
                value={resumeTitle}
                onChange={(e) => setResumeTitle(e.target.value)}
                placeholder="e.g., Software Developer Resume, Marketing Manager CV"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                disabled={isSaving}
                autoFocus
                onFocus={(e) => e.target.select()}
                onKeyDown={(e) => e.key === 'Enter' && !isSaving && resumeTitle.trim() && handleSaveWithTitle()}
              />
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={handleCancelSave}
                  disabled={isSaving}
                  className="px-4 py-2"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveWithTitle}
                  disabled={isSaving || !resumeTitle.trim()}
                  className="px-4 py-2 flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Resume
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
    </>
  );
}
