import ResumePreview from "@/components/ResumePreview";
import ResumeTemplateSelector from "@/components/ResumeTemplateSelector";
import { useBasic } from "@/hooks/useBasic";
import { useProject } from "@/hooks/useProject";
import { useExperience } from "@/hooks/useExperience";
import { useSkill } from "@/hooks/useSkills";
import { useEducation } from "@/hooks/useEducation";

export default function Portfolio() {
  // Fetch data using hooks
  const { basic } = useBasic();
  const userEmail = basic?.email || '';
  
  const { projects } = useProject(userEmail);
  const { experiences } = useExperience(userEmail);
  const { skills } = useSkill(userEmail);
  const { education } = useEducation(userEmail);

  return (
    <>
      {/* Main Resume Templates Preview Section */}
      <section className="min-h-screen bg-background">
        <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
            <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                />
              </svg>
              Portfolio Templates Preview
            </h3>
            <p className="text-muted-foreground mb-6 text-sm">
              Navigate through 4 different resume formats using the arrow buttons. All your portfolio information is displayed in each template.
            </p>
            
            <ResumePreview
              basicInfo={basic || undefined}
              projects={projects || []}
              experiences={experiences || []}
              skills={skills || []}
              education={education || []}
            />
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section className="bg-secondary/50 border-t border-border p-4 sm:p-6 lg:p-8">
        <div className="container max-w-7xl mx-auto">
          <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                />
              </svg>
              Download Portfolio as PDF
            </h3>
            <p className="text-muted-foreground mb-6 text-sm">
              Choose from 4 professional resume templates and download your portfolio as a PDF
            </p>
            <div className="container max-w-6xl mx-auto">
              <ResumeTemplateSelector 
                basicInfo={basic || null}
                projects={projects || []}
                experiences={experiences || []}
                skills={skills || []}
                education={education || []}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}