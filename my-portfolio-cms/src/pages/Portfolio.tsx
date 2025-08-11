import { useRef } from "react";
import PortfolioPreview from "@/components/PortfolioPreview";
import ResumePDF from "@/components/ResumePDF";
import { useBasic } from "@/hooks/useBasic";
import { useProject } from "@/hooks/useProject";
import { useExperience } from "@/hooks/useExperience";
import { useSkill } from "@/hooks/useSkills";
import { useEducation } from "@/hooks/useEducation";

export default function Portfolio() {
  const resumeRef = useRef<HTMLDivElement>(null);
  
  // Fetch data using hooks
  const { basic } = useBasic();
  const userEmail = basic?.email || '';
  
  const { projects } = useProject(userEmail);
  const { experiences } = useExperience(userEmail);
  const { skills } = useSkill(userEmail);
  const { education } = useEducation(userEmail);

  return (
    <>
      {/* Main Portfolio Section */}
      <section className="min-h-screen bg-background">
        <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <div ref={resumeRef} className="w-full">
            <PortfolioPreview
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
              Download Portfolio
            </h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Generate and download your portfolio as a PDF document
            </p>
                      <div className="container max-w-4xl mx-auto text-center">
            <ResumePDF targetRef={resumeRef as React.RefObject<HTMLDivElement>} />
          </div>
          </div>
        </div>
      </section>
    </>
  );
}