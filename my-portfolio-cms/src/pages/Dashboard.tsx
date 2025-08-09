import ExperienceForm from "@/components/ExperienceForm";
import ProjectForm from "@/components/ProjectForm";
import SkillForm from "@/components/SkillForm";
import BasicForm from "@/components/BasicForm";
import EducationForm from "@/components/EducationForm";
import { Link } from "react-router-dom";

import { type Basic, type Project, type Experience, type Skill, type Education } from '@/types/portfolio';

type DashboardProps = {
  basicInfo?: Basic;
  setBasicInfo: (basic: Basic) => void;
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  experiences: Experience[];
  setExperiences: (experiences: Experience[]) => void;
  skills: Skill[];
  setSkills: (skills: Skill[]) => void;
  education: Education[];
  setEducation: (education: Education[]) => void;
};

export default function Dashboard({
  basicInfo,
  setBasicInfo,
  projects,
  setProjects,
  skills,
  setSkills,
  experiences,
  setExperiences,
  education,
  setEducation
}: DashboardProps) {
    return (
        <div className="min-h-screen bg-background">
            <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Dashboard Header */}
                <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    </div>
                    <div>
                    <h1 className="text-3xl font-bold text-foreground">Portfolio CMS</h1>
                    <p className="text-muted-foreground">Manage your professional portfolio content</p>
                    </div>
                </div>
                </div>
                
                {/* Main Content Sections */}
                <div className="space-y-8">
                
                {/* Basic Information Section */}
                <section className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent p-6 border-b border-border">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        </div>
                        <div>
                        <h2 className="text-xl font-semibold text-foreground">Basic Information</h2>
                        <p className="text-sm text-muted-foreground">Add your personal details and contact information</p>
                        </div>
                    </div>
                    </div>
                    <div className="p-6">
                    <BasicForm basicInfo={basicInfo} setBasicInfo={setBasicInfo} />
                    </div>
                </section>

                {/* Education Section */}
                <section className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-yellow-500/10 via-yellow-500/5 to-transparent p-6 border-b border-border">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        </div>
                        <div>
                        <h2 className="text-xl font-semibold text-foreground">Education</h2>
                        <p className="text-sm text-muted-foreground">Add your educational background to showcase your qualifications</p>
                        </div>
                    </div>
                    </div>
                    <div className="p-6">
                        <EducationForm education={education} setEducation={setEducation}/>
                    </div>
                </section>

                {/* Projects Section */}
                <section className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-green-500/10 via-green-500/5 to-transparent p-6 border-b border-border">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        </div>
                        <div>
                        <h2 className="text-xl font-semibold text-foreground">Projects</h2>
                        <p className="text-sm text-muted-foreground">Showcase your work and technical achievements</p>
                        </div>
                    </div>
                    </div>
                    <div className="p-6">
                    <ProjectForm projects={projects} setProjects={setProjects}/>
                    </div>
                </section>

                {/* Experience Section */}
                <section className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-transparent p-6 border-b border-border">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                        </svg>
                        </div>
                        <div>
                        <h2 className="text-xl font-semibold text-foreground">Experience</h2>
                        <p className="text-sm text-muted-foreground">Document your professional journey and achievements</p>
                        </div>
                    </div>
                    </div>
                    <div className="p-6">
                    <ExperienceForm experiences={experiences} setExperiences={setExperiences}/>
                    </div>
                </section>

                {/* Skills Section */}
                <section className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-500/10 via-orange-500/5 to-transparent p-6 border-b border-border">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        </div>
                        <div>
                        <h2 className="text-xl font-semibold text-foreground">Skills</h2>
                        <p className="text-sm text-muted-foreground">Highlight your technical and professional expertise</p>
                        </div>
                    </div>
                    </div>
                    <div className="p-6">
                    <SkillForm skills={skills} setSkills={setSkills}/>
                    </div>
                </section>

                </div>

                {/* Footer Actions */}
                <div className="mt-12 p-6 bg-card border border-border rounded-xl">
                <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                    <div>
                    <h3 className="text-lg font-semibold text-foreground">Ready to showcase your work?</h3>
                    <p className="text-sm text-muted-foreground">Preview and publish your portfolio when you're ready</p>
                    </div>
                    <div className="flex space-x-3">
                    <button className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors text-sm font-medium">
                        <Link to="/portfolio">
                            Preview Portfolio
                        </Link>
                    </button>
                    </div>
                </div>
                </div>

            </div>
        </div>
    );
}
