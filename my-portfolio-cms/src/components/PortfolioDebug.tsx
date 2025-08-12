// Simple diagnostic component to test Portfolio page loading
import { useBasic } from "@/hooks/useBasic";
import { useProject } from "@/hooks/useProject";
import { useExperience } from "@/hooks/useExperience";
import { useSkill } from "@/hooks/useSkills";
import { useEducation } from "@/hooks/useEducation";

export default function PortfolioDebug() {
  // Get email from stored user data  
  const getUserEmail = () => {
    try {
      const userString = localStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        return user.email || '';
      }
      return '';
    } catch (error) {
      console.error('Error parsing user data:', error);
      return '';
    }
  };
  
  const currentEmail = getUserEmail();
  console.log('Portfolio Debug - Current email:', currentEmail);
  
  // Test each hook individually
  const { basic, isLoading: basicLoading, error: basicError } = useBasic(currentEmail);
  const { projects, isLoading: projectsLoading, error: projectsError } = useProject(currentEmail);
  const { experiences, isLoading: expLoading, error: expError } = useExperience(currentEmail);
  const { skills, isLoading: skillsLoading, error: skillsError } = useSkill(currentEmail);
  const { education, isLoading: eduLoading, error: eduError } = useEducation(currentEmail);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Portfolio Debug Page</h1>
      <div className="space-y-4">
        <div>
          <strong>Current Email:</strong> {currentEmail || 'No email found'}
        </div>
        
        <div>
          <strong>Basic Info:</strong> 
          {basicLoading ? ' Loading...' : basicError ? ` Error: ${basicError.message}` : basic ? ' Loaded' : ' No data'}
          {basic && <div className="text-sm">Name: {basic.name}</div>}
        </div>
        
        <div>
          <strong>Projects:</strong> 
          {projectsLoading ? ' Loading...' : projectsError ? ` Error: ${projectsError.message}` : ` Loaded (${projects?.length || 0})`}
        </div>
        
        <div>
          <strong>Experience:</strong> 
          {expLoading ? ' Loading...' : expError ? ` Error: ${expError.message}` : ` Loaded (${experiences?.length || 0})`}
        </div>
        
        <div>
          <strong>Skills:</strong> 
          {skillsLoading ? ' Loading...' : skillsError ? ` Error: ${skillsError.message}` : ` Loaded (${skills?.length || 0})`}
        </div>
        
        <div>
          <strong>Education:</strong> 
          {eduLoading ? ' Loading...' : eduError ? ` Error: ${eduError.message}` : ` Loaded (${education?.length || 0})`}
        </div>
      </div>
    </div>
  );
}
