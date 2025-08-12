import ResumeTemplateSelector from "@/components/ResumeTemplateSelector";
import AuthGuard from "@/components/AuthGuard";
import { useBasic } from "../hooks/useBasic";
import { useProject } from "../hooks/useProject";
import { useExperience } from "../hooks/useExperience";
import { useSkill } from "../hooks/useSkills";
import { useEducation } from "../hooks/useEducation";

// This component is the main page that fetches all data and passes it down.
// It is the entry point to the resume builder functionality.
export default function Portfolio() {
  // A helper function to safely get the current user's email from localStorage.
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

  const currentEmail = getUserEmail();
  console.log('Portfolio - Current email:', currentEmail);

  // Fetch all the necessary data from custom hooks.
  const { basic, isLoading: basicLoading, error: basicError } = useBasic(currentEmail);
  const { projects, isLoading: projectsLoading, error: projectsError } = useProject(currentEmail);
  const { experiences, isLoading: experiencesLoading, error: experiencesError } = useExperience(currentEmail);
  const { skills, isLoading: skillsLoading, error: skillsError } = useSkill(currentEmail);
  const { education, isLoading: educationLoading, error: educationError } = useEducation(currentEmail);

  console.log('Portfolio - Data:', { basic, projects, experiences, skills, education });
  console.log('Portfolio - Loading states:', { basicLoading, projectsLoading, experiencesLoading, skillsLoading, educationLoading });
  console.log('Portfolio - Errors:', { basicError, projectsError, experiencesError, skillsError, educationError });

  // Display a loading state while data is being fetched.
  if (basicLoading || projectsLoading || experiencesLoading || skillsLoading || educationLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background">
          <div className="max-w-7xl mx-auto p-6">
            <div className="flex items-center justify-center min-h-[50vh]">
              <div className="text-lg">Loading your portfolio data...</div>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  // Display an error state if any data fetching fails.
  const hasErrors = basicError || projectsError || experiencesError || skillsError || educationError;
  if (hasErrors) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background">
          <div className="max-w-7xl mx-auto p-6">
            <div className="flex items-center justify-center min-h-[50vh]">
              <div className="text-center">
                <div className="text-lg text-red-600 mb-4">Error loading portfolio data</div>
                <div className="text-sm text-gray-600">
                  {basicError && <div>Basic info: {basicError.message}</div>}
                  {projectsError && <div>Projects: {projectsError.message}</div>}
                  {experiencesError && <div>Experiences: {experiencesError.message}</div>}
                  {skillsError && <div>Skills: {skillsError.message}</div>}
                  {educationError && <div>Education: {educationError.message}</div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  // If data is loaded successfully, render the main resume builder component.
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Resume Builder</h1>
            <p className="text-muted-foreground">
              Choose from different resume templates and download your professional resume as a PDF.
            </p>
          </div>

          {/* This is the main component that handles template selection and rendering */}
          <ResumeTemplateSelector
            basicInfo={basic || null}
            projects={projects || []}
            experiences={experiences || []}
            skills={skills || []}
            education={education || []}
          />
        </div>
      </div>
    </AuthGuard>
  );
}
