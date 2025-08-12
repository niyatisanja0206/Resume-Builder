import ResumePreview from "@/components/ResumePreview";
import AuthGuard from "@/components/AuthGuard";
import { useBasic } from "@/hooks/useBasic";
import { useProject } from "@/hooks/useProject";
import { useExperience } from "@/hooks/useExperience";
import { useSkill } from "@/hooks/useSkills";
import { useEducation } from "@/hooks/useEducation";

export default function Portfolio() {
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

  const currentEmail = getUserEmail();

  // Fetch all data
  const { basic } = useBasic(currentEmail);
  const { projects } = useProject(currentEmail);
  const { experiences } = useExperience(currentEmail);
  const { skills } = useSkill(currentEmail);
  const { education } = useEducation(currentEmail);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Resume Preview</h1>
            <p className="text-muted-foreground">
              Preview your resume in different templates. Use the navigation to switch between styles.
            </p>
          </div>

          <ResumePreview
            basicInfo={basic || undefined}
            projects={projects}
            experiences={experiences}
            skills={skills}
            education={education}
          />
        </div>
      </div>
    </AuthGuard>
  );
}