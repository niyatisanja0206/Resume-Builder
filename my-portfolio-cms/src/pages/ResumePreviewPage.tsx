import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ResumePreview from '@/components/dashboard/ResumePreview';
import ResumePDFCore from '@/components/dashboard/ResumePDFtemplate';
import type { Basic, Project, Experience, Skill, Education } from '@/types/portfolio';

// Resume interface matching the backend model
interface Resume {
  _id: string;
  userEmail: string;
  title: string;
  status: 'draft' | 'completed';
  isDownloaded: boolean;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
  basic?: Basic;
  projects?: Project[];
  experiences?: Experience[];
  skills?: Skill[];
  education?: Education[];
  template?: 'classic' | 'modern' | 'creative';
}

// API function to fetch specific resume data by ID
const fetchResumeById = async (resumeId: string): Promise<Resume> => {
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

// Template validation
type TemplateId = 'classic' | 'modern' | 'creative';
const validTemplates: TemplateId[] = ['classic', 'modern', 'creative'];

export default function ResumePreviewPage() {
  const { resumeId } = useParams<{ resumeId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Fetch resume data
  const { 
    data: resume, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['resume', resumeId],
    queryFn: () => fetchResumeById(resumeId!),
    enabled: !!resumeId,
  });

  // Get template from URL params, fallback to resume template, then default to 'classic'
  const urlTemplate = searchParams.get('template');
  const selectedTemplate = urlTemplate && validTemplates.includes(urlTemplate as TemplateId)
    ? (urlTemplate as TemplateId)
    : (resume?.template && validTemplates.includes(resume.template as TemplateId) 
        ? (resume.template as TemplateId) 
        : 'classic');

  const handleGoBack = () => {
    navigate('/profile');
  };

  const handleEditResume = () => {
    if (resume) {
      localStorage.setItem('selectedResumeId', resume._id);
      navigate(`/dashboard?template=${selectedTemplate}`);
    }
  };

  // Transform resume data to match the format expected by components
  const currentResumeData = resume ? {
    basicInfo: resume.basic || null,
    projects: resume.projects || [],
    experiences: resume.experiences || [],
    skills: resume.skills || [],
    education: resume.education || []
  } : {
    basicInfo: null,
    projects: [],
    experiences: [],
    skills: [],
    education: []
  };

  const hasResumeContent = resume ? (
    (resume.basic?.name && resume.basic?.email) ||
    (resume.projects && resume.projects.length > 0) ||
    (resume.experiences && resume.experiences.length > 0) ||
    (resume.skills && resume.skills.length > 0) ||
    (resume.education && resume.education.length > 0)
  ) : false;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading resume...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[50vh]">
            <Card className="p-8 text-center max-w-md">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Resume Not Found
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                The resume you're looking for doesn't exist or you don't have permission to view it.
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={handleGoBack} variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Button>
                <Button onClick={() => refetch()}>
                  Try Again
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col lg:flex-row min-h-screen">
        
        {/* LEFT: Navigation and Actions */}
        <aside className="w-full lg:w-1/3 bg-card border-r border-border p-6 lg:p-8 flex flex-col">
          
          {/* Header Navigation */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button 
                onClick={handleGoBack}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Profile
              </Button>
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {resume.title}
              </h1>
              <p className="text-muted-foreground">
                Resume Preview • Template: <span className="font-medium text-primary capitalize">
                  {selectedTemplate}
                </span> • Status: <span className={`font-medium ${
                  resume.status === 'completed' 
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-yellow-600 dark:text-yellow-400'
                }`}>
                  {resume.status}
                </span>
              </p>
            </div>
          </div>

          {/* Resume Information */}
          <div className="flex-grow space-y-6">
            
            {/* Basic Info Summary */}
            {resume.basic && (
              <div className="border rounded-lg overflow-hidden bg-card shadow-sm">
                <div className="p-4">
                  <h3 className="text-lg font-medium mb-3">Basic Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Name:</span> {resume.basic.name || 'Not specified'}</p>
                    <p><span className="font-medium">Email:</span> {resume.basic.email || 'Not specified'}</p>
                    <p><span className="font-medium">Phone:</span> {resume.basic.contact_no || 'Not specified'}</p>
                    <p><span className="font-medium">Location:</span> {resume.basic.location || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Resume Stats */}
            <div className="border rounded-lg overflow-hidden bg-card shadow-sm">
              <div className="p-4">
                <h3 className="text-lg font-medium mb-3">Resume Details</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Sections:</span></p>
                  <ul className="ml-4 space-y-1">
                    <li>• Basic Info: {resume.basic ? '✓' : '✗'}</li>
                    <li>• Experience: {resume.experiences && resume.experiences.length > 0 ? `${resume.experiences.length} entries` : '✗'}</li>
                    <li>• Education: {resume.education && resume.education.length > 0 ? `${resume.education.length} entries` : '✗'}</li>
                    <li>• Projects: {resume.projects && resume.projects.length > 0 ? `${resume.projects.length} entries` : '✗'}</li>
                    <li>• Skills: {resume.skills && resume.skills.length > 0 ? `${resume.skills.length} entries` : '✗'}</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* PDF Download Component */}
            <div className="border rounded-lg overflow-hidden bg-card shadow-sm">
              <div className="p-4">
                <h3 className="text-lg font-medium mb-4">Download Resume</h3>
                <ResumePDFCore 
                  {...currentResumeData} 
                  templateType={selectedTemplate as 'classic' | 'modern' | 'creative'} 
                  canDownload={Boolean(hasResumeContent)} 
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 space-y-3">
            <Button 
              onClick={handleEditResume}
              className="w-full flex items-center justify-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Resume
            </Button>
          </div>

        </aside>

        {/* RIGHT: Resume Preview */}
        <main className="w-full lg:w-2/3 h-screen flex flex-col p-6 lg:p-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-foreground">Resume Preview - {selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1)} Template</h2>
          </div>

          <div className="flex-grow flex flex-col items-center justify-start overflow-auto bg-muted rounded-lg p-4">
            <div className="transform scale-[0.85] origin-top w-full mt-4 transition-transform duration-200">
              <ResumePreview {...currentResumeData} template={selectedTemplate} />
            </div>
          </div>
        </main>

      </div>
    </div>
  );
}
