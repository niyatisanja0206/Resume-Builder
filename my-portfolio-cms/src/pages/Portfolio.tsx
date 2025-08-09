import { useRef } from "react";
import PortfolioPreview from "@/components/PortfolioPreview";
import ResumePDF from "@/components/ResumePDF";
import { type Basic, type Project, type Experience, type Skill, type Education } from "@/types/portfolio";

type PortfolioProps = {
  basicInfo?: Basic;
  projects: Project[];
  experiences: Experience[];
  skills: Skill[];
  education?: Education[];
};

export default function Portfolio({
  basicInfo,
  projects,
  experiences,
  skills,
  education,
}: PortfolioProps) {
  const resumeRef = useRef<HTMLDivElement>(null);

  return (
    <>
      {/* Main Portfolio Section */}
      <section className="min-h-screen bg-background">
        <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <div ref={resumeRef} className="w-full">
            <PortfolioPreview
              basicInfo={basicInfo}
              projects={projects}
              experiences={experiences}
              skills={skills}
              education={education}
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
            <ResumePDF targetRef={resumeRef} />
          </div>
        </div>
      </section>
    </>
  );
}