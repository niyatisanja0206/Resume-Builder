import type { Basic, Project, Experience, Skill, Education } from '@/types/portfolio';
import React, { useEffect } from 'react';

// --- STYLING & ANIMATION ---
// This CSS provides the basic A4 container structure and print-friendly styles.
const componentStyles = `
  /* A4 Container Styling for screen preview */
  .a4-container {
    width: 100%;
    max-width: 210mm;
    height: auto;
    min-height: 297mm;
    margin: 0 auto;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
    background-color: #f8f9fa;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    overflow: auto;
    padding: 20px;
  }

  .resume-template-wrapper {
    width: 100%;
    height: auto;
    min-height: 297mm;
    background-color: white;
    box-sizing: border-box;
    box-shadow: 0 2px 8px rgba(54, 52, 52, 0.1);
    position: relative;
    font-size: 16px;
    line-height: 1.5;
  }
  
  /* Font Loading */
  @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Open+Sans:wght@400;600;700&display=swap');

  /* Typography Classes */
  .font-merriweather {
    font-family: 'Merriweather', serif;
  }
  
  .font-opensans {
    font-family: 'Open Sans', sans-serif;
  }

  /* Scrollbar Styling */
  .resume-template-wrapper::-webkit-scrollbar {
    width: 8px;
  }
  .resume-template-wrapper::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  .resume-template-wrapper::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }
  .resume-template-wrapper::-webkit-scrollbar-thumb:hover {
    background: #a1a1a1;
  }

  /* Font size improvements for better visibility */
  .resume-template {
    font-size: 16px !important; /* Base font size */
  }
  
  /* Section headings */
  .resume-template h2 {
    font-size: 20px !important;
    font-weight: 600 !important;
  }
  
  /* Company and institution names */
  .resume-template h3 {
    font-size: 18px !important;
    font-weight: 600 !important;
    line-height: 1.3 !important;
  }
  
  /* Regular text */
  .resume-template p, .resume-template li {
    font-size: 16px !important;
    line-height: 1.4 !important;
  }
  
  /* Titles and headers */
  .resume-template h1 {
    font-size: 28px !important;
    font-weight: 700 !important;
    line-height: 1.3 !important;
  }

  /* Classic Template Styles */
  .classic-template h1 {
    font-size: 28px !important;
  }
  
  .classic-template h2 {
    font-size: 22px !important;
  }
  
  .classic-template h3 {
    font-size: 18px !important;
  }
  
  .classic-template p, .classic-template li {
    font-size: 16px !important;
  }

  /* Modern Template Styles */
  .modern-template h1 {
    font-size: 26px !important;
  }
  
  .modern-template h2 {
    font-size: 20px !important;
  }
  
  .modern-template h3 {
    font-size: 18px !important;
  }
  
  .modern-template p, .modern-template li {
    font-size: 16px !important;
  }

  /* Creative Template Styles */
  .creative-template h1 {
    font-size: 28px !important;
  }
  
  .creative-template h2 {
    font-size: 22px !important;
  }
  
  .creative-template h3 {
    font-size: 18px !important;
  }
  
  .creative-template p, .creative-template li {
    font-size: 16px !important;
  }

  /* Print-specific styles */
  @media print {
    * {
      -webkit-print-color-adjust: exact !important;
      color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    @page {
      size: A4;
      margin: 0;
    }
    body, .a4-container, .resume-template-wrapper {
      margin: 0 !important;
      padding: 0 !important;
      box-shadow: none !important;
      transform: scale(1) !important;
      width: 210mm !important;
      height: 297mm !important;
      overflow: hidden !important;
    }
    .no-print {
      display: none !important;
    }
  }
`;

// Inject styles into the document head
if (typeof document !== 'undefined') {
  const styleSheetId = 'resume-preview-styles';
  if (!document.getElementById(styleSheetId)) {
    const styleSheet = document.createElement('style');
    styleSheet.id = styleSheetId;
    styleSheet.type = 'text/css';
    styleSheet.innerText = componentStyles;
    document.head.appendChild(styleSheet);
  }
}

// --- HELPER FUNCTIONS & COMPONENTS ---

const formatDate = (dateInput: Date | string | undefined): string => {
  if (!dateInput) return 'Present';
  try {
    const date = new Date(dateInput);
    return isNaN(date.getTime()) ? 'Present' : date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

// Section component for Classic Template
const Section: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
  <div className={`mb-6 ${className || ''}`}>
    <h2 className="font-bold uppercase border-b-2 border-gray-300 pb-1 mb-4 text-xl">{title}</h2>
    <div className="classic-section-content">
      {children}
    </div>
  </div>
);

// --- PROPS INTERFACE ---
interface ResumePreviewProps {
  basicInfo: Basic | null;
  projects: Project[];
  experiences: Experience[];
  skills: Skill[];
  education: Education[];
  templateType: 'classic' | 'modern' | 'creative';
}

// --- TEMPLATE COMPONENTS ---

// Classic Template (Ref: resume6.jpg)
const ClassicTemplate: React.FC<Omit<ResumePreviewProps, 'templateType'>> = ({ basicInfo, projects, experiences, skills, education }) => (
  <div className="resume-template classic-template bg-white p-6">
      <header className="text-center mb-6">
          <h1 className="font-bold tracking-wider mb-3">{basicInfo?.name || 'Jacob McLaren'}</h1>
          <div className="text-gray-600 flex flex-wrap justify-center items-center gap-2">
              <span className="text-base">{basicInfo?.location || '54 Dunster St, Cambridge, MA 02138'}</span>
              <span className="text-base">•</span>
              <span className="text-base">{basicInfo?.email || 'mclaren@gmail.com'}</span>
              <span className="text-base">•</span>
              <span className="text-base">{basicInfo?.contact_no || '555-555-5555'}</span>
          </div>
      </header>

      <main>
          {education && education.length > 0 && (
              <Section title="Education">
                  {education.map((edu, index) => (
                      <div key={index} className="mb-4">
                          <div className="flex justify-between items-baseline">
                              <h3 className="font-bold">{edu.institution || 'Harvard University, Extension School'}</h3>
                              <span className="text-gray-600 text-base">{formatDate(edu.endDate)}</span>
                          </div>
                          <p className="italic text-base">{edu.degree || 'Master of Liberal Arts, Information Management Systems'}</p>
                          {edu.Grade && <p className="text-gray-700 mt-1 text-base">{edu.Grade}</p>}
                      </div>
                  ))}
              </Section>
          )}

          {experiences && experiences.length > 0 && (
              <Section title="Professional Experience">
                  {experiences.map((exp, index) => (
                      <div key={index} className="mb-5">
                          <div className="flex justify-between items-baseline">
                              <h3 className="font-bold">{exp.company || 'STATE STREET CORPORATION'}</h3>
                              <span className="text-gray-600 text-base">{formatDate(exp.startDate)} - {formatDate(exp.endDate)}</span>
                          </div>
                          <p className="italic mb-2 text-base">{exp.position || 'Principal - Simulated Technology'}</p>
                          {exp.description && <p className="text-gray-700 leading-relaxed text-base">{exp.description}</p>}
                          {exp.skillsLearned && exp.skillsLearned.length > 0 && (
                            <ul className="ml-4 mt-2 space-y-1 list-disc">
                                {exp.skillsLearned.map((skill, i) => (
                                    <li key={i} className="text-gray-700 text-base">
                                        {skill}
                                    </li>
                                ))}
                            </ul>
                          )}
                      </div>
                  ))}
              </Section>
          )}

          {skills && skills.length > 0 && (
              <Section title="Technical Expertise">
                  <p className="text-gray-700 text-base">
                      {skills.map(skill => skill.name).join(', ')}
                  </p>
              </Section>
          )}

          {projects && projects.length > 0 && (
              <Section title="Additional">
                  {projects.map((project, index) => (
                      <div key={index} className="mb-3">
                          <p className="text-gray-700 text-base">{project.description}</p>
                      </div>
                  ))}
              </Section>
          )}
      </main>
  </div>
);


// --- MODERN TEMPLATE ---
const ModernTemplate: React.FC<Omit<ResumePreviewProps, 'templateType'>> = ({ basicInfo, projects, experiences, skills, education }) => {
    const SectionIcon = ({ children }: { children: React.ReactNode }) => <div className="w-6 h-6 mr-2">{children}</div>;
    const SectionTitle = ({ title }: { title: string }) => <h2 className="font-bold uppercase tracking-wider text-gray-700 text-xl">{title}</h2>;
    const SectionWrapper: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
        <div className="mb-6">
            <div className="flex items-center bg-gray-100 p-3 rounded-t-md">
                <SectionIcon>{icon}</SectionIcon>
                <SectionTitle title={title} />
            </div>
            <div className="p-4">{children}</div>
        </div>
    );

    return (
        <div className="resume-template modern-template bg-[#FEF6FA] p-4 font-opensans">
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <header className="text-center mb-6">
                    <h1 className="text-2xl font-bold">{basicInfo?.name || 'Catherine Bale'}</h1>
                    <p className="text-lg text-gray-600 mt-1">{(basicInfo?.about && basicInfo.about.split('.')[0]) || 'Marketing Assistant'}</p>
                    <div className="mt-3 flex justify-center items-center space-x-4 text-base text-gray-500">
                        <span className="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> {basicInfo?.email || 'c.bale@bale.com'}</span>
                        <span className="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> {basicInfo?.location || '22611 Pacific Coast Hwy, Malibu'}</span>
                        <span className="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg> {basicInfo?.contact_no || '+1-541-754-3010'}</span>
                    </div>
                </header>

                <main>
                    {basicInfo?.about && (
                        <SectionWrapper icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>} title="Profile">
                            <p className="text-gray-600 leading-relaxed text-base">{basicInfo.about}</p>
                        </SectionWrapper>
                    )}

                    {experiences && experiences.length > 0 && (
                        <SectionWrapper icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.07a2.25 2.25 0 01-2.25 2.25h-13.5a2.25 2.25 0 01-2.25-2.25v-4.07m18-4.22l-7.5-4.22m0 0l-7.5 4.22m7.5-4.22v10.5M4.5 9.75v10.5a2.25 2.25 0 002.25 2.25h13.5a2.25 2.25 0 002.25-2.25V9.75" /></svg>} title="Professional Experience">
                            {experiences.map((exp, index) => (
                                <div key={index} className="mb-5">
                                    <div className="flex justify-between items-baseline">
                                        <h3 className="font-bold text-gray-800 text-lg">{exp.position}</h3>
                                        <span className="text-gray-500 text-base">{formatDate(exp.startDate)} - {formatDate(exp.endDate)}</span>
                                    </div>
                                    <p className="font-semibold text-pink-600 text-base">{exp.company}</p>
                                    <p className="text-gray-600 mt-2 leading-relaxed text-base">{exp.description}</p>
                                </div>
                            ))}
                        </SectionWrapper>
                    )}
                    
                    {education && education.length > 0 && (
                       <SectionWrapper icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-5.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-5.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222 4 2.222V20M1 12l5.373 2.986M17.627 15L23 12M12 21v-7.5" /></svg>} title="Education">
                           {education.map((edu, index) => (
                               <div key={index} className="mb-4">
                                   <div className="flex justify-between items-baseline">
                                       <h3 className="font-bold text-gray-800 text-lg">{edu.institution}</h3>
                                       <span className="text-gray-500 text-base">{formatDate(edu.startDate)} - {formatDate(edu.endDate)}</span>
                                   </div>
                                   <p className="font-semibold text-pink-600 text-base">{edu.degree}</p>
                                   {edu.Grade && <p className="text-gray-600 mt-1 text-base">{edu.Grade}</p>}
                               </div>
                           ))}
                       </SectionWrapper>
                    )}

                    {projects && projects.length > 0 && (
                        <SectionWrapper icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" /></svg>} title="Projects">
                            <div className="flex flex-wrap gap-2">
                                {projects.map((proj, i) => (
                                    <div key={i} className="mb-3 w-full">
                                        <h3 className="font-bold text-gray-800 text-lg">{proj.title}</h3>
                                        <p className="text-gray-600 mt-1 text-base">{proj.description}</p>
                                    </div>
                                ))}
                            </div>
                        </SectionWrapper>
                    )}

                    {skills && skills.length > 0 && (
                        <SectionWrapper icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>} title="Skills">
                           <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                               {skills.map((skill, index) => (
                                   <div key={index}>
                                       <p className="text-base font-medium">{skill.name}</p>
                                       <div className="flex items-center space-x-1 mt-1">
                                           {[...Array(5)].map((_, i) => (
                                               <span key={i} className={`w-3 h-3 rounded-full ${i < (skill.level === 'advanced' ? 5 : skill.level === 'intermediate' ? 3 : 1) ? 'bg-pink-500' : 'bg-gray-300'}`}></span>
                                           ))}
                                       </div>
                                   </div>
                               ))}
                           </div>
                        </SectionWrapper>
                    )}
                </main>
            </div>
        </div>
    );
};

// --- CREATIVE TEMPLATE ---
const CreativeTemplate: React.FC<Omit<ResumePreviewProps, 'templateType'>> = ({ basicInfo, projects, experiences, skills, education }) => (
    <div className="resume-template creative-template flex font-opensans h-full">
        <aside className="w-1/3 bg-[#1A4331] text-white p-6 flex flex-col space-y-5">
            <header className="text-left">
                <h1 className="text-2xl font-bold mb-2">{basicInfo?.name || 'Brian T. Wayne'}</h1>
                <p className="text-lg">{(basicInfo?.about && basicInfo.about.split('.')[0]) || 'Business Development Consultant'}</p>
            </header>
            
            <div className="space-y-3">
                 <p className="flex items-center text-base"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> {basicInfo?.email || 'brian@wayne.com'}</p>
                 <p className="flex items-center text-base"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg> {basicInfo?.contact_no || '+1-541-754-3010'}</p>
                 <p className="flex items-center text-base"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> {basicInfo?.location || '22611 Pacific Coast Hwy, Malibu'}</p>
            </div>
            
            {basicInfo?.about && (
                <div>
                    <h2 className="text-xl font-semibold border-b border-gray-400 pb-1 mb-3">Profile</h2>
                    <p className="text-base leading-relaxed">{basicInfo.about}</p>
                </div>
            )}
            
            {education && education.length > 0 && (
                <div>
                    <h2 className="text-xl font-semibold border-b border-gray-400 pb-1 mb-3">Education</h2>
                    {education.map((edu, index) => (
                        <div key={index} className="mb-4">
                            <h3 className="font-bold text-lg">{edu.institution}</h3>
                            <p className="text-base">{edu.degree}</p>
                            <p className="text-base text-gray-300">{formatDate(edu.startDate)} - {formatDate(edu.endDate)}</p>
                        </div>
                    ))}
                </div>
            )}

            {projects && projects.length > 0 && (
                 <div>
                    <h2 className="text-xl font-semibold border-b border-gray-400 pb-1 mb-3">Projects</h2>
                    {projects.map((proj, i) => <p key={i} className="text-base mb-1">{proj.title}</p>)}
                </div>
            )}
        </aside>

        <main className="w-2/3 bg-white p-6 text-gray-700 space-y-5">
            {experiences && experiences.length > 0 && (
                <div>
                    <h2 className="text-xl font-bold text-gray-800 border-b-2 border-gray-200 pb-1 mb-4">Professional Experience</h2>
                    {experiences.map((exp, index) => (
                        <div key={index} className="mb-5">
                            <h3 className="text-lg font-bold">{exp.position}</h3>
                            <p className="text-base font-semibold text-gray-600 mb-2">{exp.company} | {formatDate(exp.startDate)} - {formatDate(exp.endDate)}</p>
                            {exp.description && <p className="text-base leading-relaxed">{exp.description}</p>}
                            {exp.skillsLearned && exp.skillsLearned.length > 0 && (
                                <ul className="ml-4 mt-2 space-y-1 list-disc">
                                    {exp.skillsLearned.map((skill, i) => (
                                        <li key={i} className="text-base">
                                            {skill}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {skills && skills.length > 0 && (
                <div>
                    <h2 className="text-xl font-bold text-gray-800 border-b-2 border-gray-200 pb-1 mb-3">Skills</h2>
                    <div className="flex flex-wrap gap-2">
                        {skills.map((skill, index) => (
                            <span key={index} className="px-3 py-1 bg-gray-100 rounded-md text-base">
                                {skill.name}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </main>
    </div>
);


// --- MAIN COMPONENT ---
const ResumePreview = (props: ResumePreviewProps) => {
  // Inject styles and scroll to top when component mounts
  useEffect(() => {
    const styleSheetId = 'resume-preview-styles';
    if (!document.getElementById(styleSheetId)) {
      const styleSheet = document.createElement('style');
      styleSheet.id = styleSheetId;
      styleSheet.type = 'text/css';
      styleSheet.innerText = componentStyles;
      document.head.appendChild(styleSheet);
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
    
    // Ensure the container itself is also scrolled to top
    const container = document.querySelector('.a4-container');
    if (container) {
      container.scrollTop = 0;
    }
  }, []);

  return (
    <div className="a4-container">
        <div className="resume-template-wrapper">
            {(() => {
                switch (props.templateType) {
                case 'modern':
                    return <ModernTemplate {...props} />;
                case 'creative':
                    return <CreativeTemplate {...props} />;
                case 'classic':
                default:
                    return <ClassicTemplate {...props} />;
                }
            })()}
        </div>
    </div>
  );
};

export default ResumePreview;
