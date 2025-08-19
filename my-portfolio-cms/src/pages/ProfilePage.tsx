import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Edit, Trash2, FileText, Plus, Calendar, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useUserContext } from '@/hooks/useUserContext';
import { useToast } from '@/contexts/ToastContext';
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
  experience?: Experience[];
  skills?: Skill[];
  education?: Education[];
  template?: 'classic' | 'modern' | 'creative';
}
 
// API functions
const fetchUserResumes = async (userEmail: string): Promise<Resume[]> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`/api/users/resumes?email=${userEmail}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch resumes');
  }
  
  return response.json();
};

const deleteResume = async (resumeId: string) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`/api/users/resumes/${resumeId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete resume');
  }
  
  return response.json();
};


const createNewResume = async (userEmail: string, nav: ReturnType<typeof useNavigate>) => {

  const token = localStorage.getItem('token');
  
  const response = await fetch('/api/users/resumes', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userEmail })
  });
  
  if (!response.ok) {
    throw new Error('Failed to create resume');
  }
  
  // Go to choose new template and then go to editing dashboard
  nav('/portfolio');
  return response.json();
};

export default function ProfilePage() {
  const { currentUser } = useUserContext();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch user's resumes
  const { 
    data: resumes = [], 
    isLoading: loadingResumes, 
    error: resumesError,
    refetch: refetchResumes 
  } = useQuery({
    queryKey: ['userResumes', currentUser?.email],
    queryFn: () => fetchUserResumes(currentUser?.email || ''),
    enabled: !!currentUser?.email,
    staleTime: 5 * 60 * 1000,
  });

  // Listen for resume-saved event to refetch resumes and ensure UI is always up to date
  useEffect(() => {
    const handler = () => {
      queryClient.invalidateQueries({ queryKey: ['userResumes'] });
      refetchResumes();
    };
    window.addEventListener('resume-saved', handler);
    return () => window.removeEventListener('resume-saved', handler);
  }, [refetchResumes, queryClient]);

  // Delete resume mutation
  const deleteResumeMutation = useMutation({
    mutationFn: deleteResume,
    onSuccess: () => {
      showToast('Resume deleted successfully!', 'success');
      queryClient.invalidateQueries({ queryKey: ['userResumes'] });
      refetchResumes();
    },
    onError: (error: Error) => {
      showToast(`Failed to delete resume: ${error.message}`, 'error');
    }
  });

  // Create new resume mutation
  const createResumeMutation = useMutation({
    mutationFn: () => createNewResume(currentUser?.email || '', navigate),
    onSuccess: () => {
      showToast('New resume created successfully!', 'success');
      queryClient.invalidateQueries({ queryKey: ['userResumes'] });
      refetchResumes();
      
      // Clear any existing resume data from localStorage to ensure clean start
      localStorage.removeItem('selectedResumeId');
      localStorage.removeItem('currentResumeId');
      localStorage.setItem('isNewResume', 'true'); // Flag for new resume
      
    },
    onError: (error: Error) => {
      showToast(`Failed to create resume: ${error.message}`, 'error');
    }
  });

  const handleEditResume = (resume: Resume) => {
    // Store the selected resume ID in localStorage so Dashboard can load it
    localStorage.setItem('selectedResumeId', resume._id);
    localStorage.removeItem('isNewResume'); // Ensure this is not a new resume
    //navigate to resume with previously selected template only
    navigate(`/dashboard?template=${resume.template || 'classic'}`);
  };

  const handlePreviewResume = (resume: Resume) => {
    // Navigate to the resume preview page
    navigate(`/resume/${resume._id}`);
  };

  const handleDeleteResume = (resumeId: string, resumeTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${resumeTitle}"? This action cannot be undone.`)) {
      deleteResumeMutation.mutate(resumeId);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">Please log in to view your profile.</p>
          <Button onClick={() => navigate('/login')}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your account and resumes</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* User Information Card */}
              <div className="lg:col-span-1">
                <Card className="p-6">
                  <div className="flex items-center mb-6">
                    <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                      <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-4">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Account Information</h2>
                    </div>
                  </div>

                  {/* Email Section */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                        <span className="text-gray-900 dark:text-white">
                          {currentUser.email}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Resumes List */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Resumes</h2>
                  <Button 
                    onClick={() => {
                      const hasDraft = resumes.some(r => r.status === 'draft');
                      if (hasDraft) {
                        showToast('You can have only one draft resume at a time. Please complete or delete your existing draft.', 'error');
                        return;
                      }
                      createResumeMutation.mutate();
                    }}
                    disabled={createResumeMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    {createResumeMutation.isPending ? 'Creating...' : 'New Resume'}
                  </Button>
                </div>

                {loadingResumes ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="animate-pulse">
                        <Card className="p-6">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                        </Card>
                      </div>
                    ))}
                  </div>
                ) : resumesError ? (
                  <Card className="p-6 text-center">
                    <div className="text-red-500 mb-4">
                      <FileText className="h-12 w-12 mx-auto mb-2" />
                      <p className="font-medium">Failed to load resumes</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {resumesError.message}
                      </p>
                    </div>
                    <Button onClick={() => refetchResumes()} variant="outline">
                      Try Again
                    </Button>
                  </Card>
                ) : resumes.length === 0 ? (
                  <Card className="p-8 text-center">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No resumes yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Create your first resume to get started with building your professional profile.
                    </p>
                    <Button 
                      onClick={() => createResumeMutation.mutate()}
                      disabled={createResumeMutation.isPending}
                      className="flex items-center gap-2 mx-auto"
                    >
                      <Plus className="h-4 w-4" />
                      {createResumeMutation.isPending ? 'Creating...' : 'Create Your First Resume'}
                    </Button>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resumes.map((resume) => (
                      <Card key={resume._id} className="p-6 hover:shadow-lg transition-shadow duration-200">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                              {resume.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(resume.updatedAt)}
                              </div>
                              {resume.downloadCount > 0 && (
                                <div className="flex items-center gap-1">
                                  <Download className="h-3 w-3" />
                                  {resume.downloadCount} downloads
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              resume.status === 'completed' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            }`}>
                              {resume.status}
                            </span>
                          </div>
                        </div>

                        {resume.basic && (
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            <p className="font-medium">{resume.basic.name || 'No name'}</p>
                            <p>{resume.basic.email}</p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleEditResume(resume)}
                            className="flex-1 flex items-center justify-center gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                          
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handlePreviewResume(resume)}
                            className="flex items-center justify-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            Preview
                          </Button>
                          
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDeleteResume(resume._id, resume.title)}
                            disabled={deleteResumeMutation.isPending}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
  );
}
