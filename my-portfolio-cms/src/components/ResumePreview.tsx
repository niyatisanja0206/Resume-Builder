import type { Basic, Project, Experience, Skill, Education } from '@/types/portfolio';
import React, { useEffect } from 'react';

// --- STYLING & ANIMATION ---
// This CSS provides the basic A4 container structure and print-friendly styles.
const componentStyles = `
  /* A4 Container Styling for screen preview */
  .a4-container {
    /* This is the grey background area that centers the page */
    width: 100%;
    min-height: 100vh;
    padding: 1.5rem;
    background-color: #f0f2f5;
    display: flex;
    justify-content: center;
    align-items: flex-start; /* Aligns the resume to the top */
    box-sizing: border-box;
  }

  .resume-template-wrapper {
    /* This is the white, A4-proportioned page */
    background-color: white;
    box-sizing: border-box;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    position: relative;
    
    /* --- A4 Sizing --- */
    /* 1. Set a base width for the page. */
    width: 816px;
    
    /* 2. Make it responsive: it won't exceed the viewport width. */
    max-width: 95%;
    
    /* 3. Set a minimum height based on A4 aspect ratio, but allow it to grow. */
    min-height: 1154px; /* Approx height for 816px width A4 */

    /* 4. Content will now expand the container, no scrollbar. */
    overflow: hidden;
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

  /* Scrollbar Styling (Hidden) */
  .resume-template-wrapper::-webkit-scrollbar {
    display: none;
  }

  /* Font size improvements for better visibility */
  .resume-template {
    font-size: 16px !important; /* Base font size */
    padding: 2rem; /* Add some padding inside the resume page */
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
  .classic-template {
    padding: 2.5rem;
  }
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
  .modern-template {
     padding: 3rem;
  }
  .modern-template h1 {
    font-size: 42px !important;
    color: #333;
  }
  
  .modern-template h2 {
    font-size: 18px !important;
    font-weight: 700 !important;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: #D95D8A;
  }
  
  .modern-template h3 {
    font-size: 18px !important;
    font-weight: bold;
  }
  
  .modern-template p, .modern-template li, .modern-template span {
    font-size: 15px !important;
  }

  /* Creative Template Styles */
  .creative-template {
      /* Creative template has its own padding defined by the columns */
      padding: 0;
  }
  .creative-template > aside, .creative-template > main {
      padding: 2.5rem;
  }
  .creative-template h1 {
    font-size: 28px !important;
  }
  
  .creative-template h2 {
    font-size: 22px !important;
    border-bottom-width: 2px;
    padding-bottom: 0.5rem;
    margin-bottom: 1rem;
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
    body, .a4-container {
      margin: 0 !important;
      padding: 0 !important;
      box-shadow: none !important;
      background-color: white !important;
    }
    .resume-template-wrapper {
      transform: scale(1) !important;
      width: 210mm !important;
      height: 297mm !important;
      box-shadow: none !important;
      overflow: hidden !important;
      padding: 0;
      margin: 0;
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
    if (isNaN(date.getTime())) {
      // Check if it's just a year
      if (/^\d{4}$/.test(dateInput.toString())) return dateInput.toString();
      return 'Present';
    }
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

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

// Classic Template
const ClassicTemplate: React.FC<Omit<ResumePreviewProps, 'templateType'>> = ({ basicInfo, projects, experiences, skills, education }) => {
    const Section: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
      <div className={`mb-6 ${className || ''}`}>
        <h2 className="font-bold uppercase border-b-2 border-gray-300 pb-1 mb-4 text-xl">{title}</h2>
        <div>{children}</div>
      </div>
    );

    return (
      <div className="resume-template classic-template bg-white font-opensans">
          <header className="text-center mb-8">
              <h1 className="font-bold tracking-wider mb-3 font-merriweather">{basicInfo?.name || 'Jacob McLaren'}</h1>
              <div className="text-gray-600 flex flex-wrap justify-center items-center gap-x-3 gap-y-1">
                  <span className="text-base">{basicInfo?.location || '54 Dunster St, Cambridge, MA 02138'}</span>
                  <span>•</span>
                  <span className="text-base">{basicInfo?.email || 'mclaren@gmail.com'}</span>
                  <span>•</span>
                  <span className="text-base">{basicInfo?.contact_no || '555-555-5555'}</span>
              </div>
          </header>

          <main>

              <Section title="Professional Summary">
                <p className="text-gray-700 leading-relaxed text-base whitespace-pre-line">{basicInfo?.about || 'A highly motivated and results-driven professional with over 5 years of experience in software development and project management.'}</p>
              </Section>
              
              {education && education.length > 0 && (
                  <Section title="Education">
                      {education.map((edu, index) => (
                          <div key={index} className="mb-4">
                              <div className="flex justify-between items-baseline">
                                  <h3 className="font-bold font-merriweather">{edu.institution || 'Harvard University, Extension School'}</h3>
                                  <span className="text-gray-600 text-base font-bold">{formatDate(edu.endDate)}</span>
                              </div>
                              <p className="italic text-base">{edu.degree || 'Master of Liberal Arts, Information Management Systems'}</p>
                          </div>
                      ))}
                  </Section>
              )}

              {experiences && experiences.length > 0 && (
                  <Section title="Professional Experience">
                      {experiences.map((exp, index) => (
                          <div key={index} className="mb-5">
                              <div className="flex justify-between items-baseline">
                                  <h3 className="font-bold font-merriweather">{exp.company || 'STATE STREET CORPORATION'}</h3>
                                  <span className="text-gray-600 text-base font-bold">{formatDate(exp.startDate)} - {formatDate(exp.endDate)}</span>
                              </div>
                              <p className="italic mb-2 text-base">{exp.position || 'Principal - Simulated Technology'}</p>
                              {exp.description && <p className="text-gray-700 leading-relaxed text-base whitespace-pre-line">{exp.description}</p>}
                          </div>
                      ))}
                  </Section>
              )}
              
              {projects && projects.length > 0 && (
                  <Section title="Projects">
                      {projects.map((project, index) => (
                          <div key={index} className="mb-3">
                              <h3 className="font-bold font-merriweather">{project.title}</h3>
                              <p className="text-gray-700 text-base">{project.description}</p>
                              {project.techStack && project.techStack.length > 0 && (
                                  <p className="text-gray-600 text-sm mt-1">Tech Stack: {project.techStack.join(', ')}</p>
                              )}
                          </div>
                      ))}
                  </Section>
              )}

              {skills && skills.length > 0 && (
                  <Section title="Technical Expertise">
                      <div className="flex flex-wrap gap-2">
                          {skills.map((skill, index) => (
                              <span key={index} className="bg-gray-200 text-gray-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded">
                                  {skill.name}
                              </span>
                          ))}
                      </div>
                  </Section>
              )}
          </main>
      </div>
    );
}


// --- MODERN TEMPLATE ---
const ModernTemplate: React.FC<Omit<ResumePreviewProps, 'templateType'>> = ({ basicInfo, projects, experiences, skills, education }) => {
    const Section: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
        <div className={`text-center mt-8 ${className || ''}`}>
            <div className="flex items-center justify-center mb-4">
                <div className="flex-grow border-t border-gray-300"></div>
                <h2 className="px-4 font-opensans">{title}</h2>
                <div className="flex-grow border-t border-gray-300"></div>
            </div>
            <div className="text-left">{children}</div>
        </div>
    );

    const SkillRating: React.FC<{ level: 'beginner' | 'intermediate' | 'advanced' }> = ({ level }) => {
        const levelMap = { 'beginner': 1, 'intermediate': 3, 'advanced': 5 };
        const rating = levelMap[level] || 0;
        return (
            <div className="flex items-center space-x-1.5 mt-1">
                {[...Array(5)].map((_, i) => (
                    <span key={i} className={`w-3 h-3 rounded-full ${i < rating ? 'bg-[#D95D8A]' : 'bg-gray-300'}`}></span>
                ))}
            </div>
        );
    };

    return (
        <div className="resume-template modern-template bg-white font-opensans text-gray-700">
            <header className="text-center pb-8 border-b-2 border-gray-100">
                <h1 className="font-merriweather">{basicInfo?.name || 'Catherine Bale'}</h1>
                <p className="text-[#D95D8A] text-xl mt-2 font-semibold">{(basicInfo?.about && basicInfo.about.split('.')[0]) || 'Marketing Assistant'}</p>
                <div className="mt-4 flex justify-center items-center space-x-6 text-sm text-gray-500">
                    <span className="flex items-center"><svg className="w-4 h-4 mr-2 text-[#D95D8A]" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path></svg> {basicInfo?.email || 'c.bale@bale.com'}</span>
                    <span className="flex items-center"><svg className="w-4 h-4 mr-2 text-[#D95D8A]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg> {basicInfo?.location || '22611 Pacific Coast Hwy, Malibu'}</span>
                    <span className="flex items-center"><svg className="w-4 h-4 mr-2 text-[#D95D8A]" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg> {basicInfo?.contact_no || '+1-541-754-3010'}</span>
                </div>
            </header>

            <main>
                {basicInfo?.about && (
                    <Section title="Profile">
                        <p className="text-center text-base leading-relaxed">{basicInfo.about.split('.').slice(1).join('.').trim() || "To obtain a challenging marketing position with a reputable company where I can utilize my marketing skills and experience to drive business growth."}</p>
                    </Section>
                )}

                <Section title="Professional Experience">
                    {experiences.map((exp, index) => (
                        <div key={index} className="mb-6">
                            <div className="flex justify-between items-baseline">
                                <h3 className="font-bold text-gray-800">{exp.position}</h3>
                                <p className="text-gray-500 text-sm font-semibold">{formatDate(exp.startDate)} - {formatDate(exp.endDate)}</p>
                            </div>
                            <p className="font-semibold text-base">{exp.company}</p>
                            <p className="mt-2 text-base leading-relaxed whitespace-pre-line">{exp.description}</p>
                        </div>
                    ))}
                </Section>
                
                 <Section title="Projects">
                    {projects.map((project, index) => (
                        <div key={index} className="mb-6">
                             <h3 className="font-bold text-gray-800">{project.title}</h3>
                             <p className="mt-2 text-base leading-relaxed">{project.description}</p>
                              {project.techStack && project.techStack.length > 0 && (
                                <p className="text-gray-600 text-sm mt-1">Tech Stack: {project.techStack.join(', ')}</p>
                              )}
                        </div>
                    ))}
                </Section>

                <Section title="Education">
                    {education.map((edu, index) => (
                        <div key={index} className="mb-4">
                            <div className="flex justify-between items-baseline">
                                <h3 className="font-bold text-gray-800">{edu.degree}</h3>
                                 <p className="text-gray-500 text-sm font-semibold">{formatDate(edu.startDate)} - {formatDate(edu.endDate)}</p>
                            </div>
                            <p className="font-semibold text-base">{edu.institution}</p>
                        </div>
                    ))}
                </Section>

                {skills && skills.length > 0 && (
                    <Section title="Skills">
                       <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                           {skills.map((skill, index) => (
                               <div key={index}>
                                   <p className="font-semibold">{skill.name}</p>
                                   <SkillRating level={skill.level} />
                               </div>
                           ))}
                       </div>
                    </Section>
                )}
            </main>
        </div>
    );
};


// --- CREATIVE TEMPLATE ---
const CreativeTemplate: React.FC<Omit<ResumePreviewProps, 'templateType'>> = ({ basicInfo, projects, experiences, skills, education }) => (
    <div className="resume-template creative-template flex font-opensans h-full">
        {/* Left Section */}
        <aside className="w-1/3 bg-[#1A4331] text-white flex flex-col">
            <header className="text-left mb-8">
                <h1 className="text-3xl font-bold mb-2">{basicInfo?.name || 'Brian T. Wayne'}</h1>
                <div className="space-y-4 mt-6">
                     <p className="flex items-start text-sm"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> {basicInfo?.email || 'brian@wayne.com'}</p>
                     <p className="flex items-start text-sm"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg> {basicInfo?.contact_no || '+1-541-754-3010'}</p>
                     <p className="flex items-start text-sm"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> {basicInfo?.location || '22611 Pacific Coast Hwy, Malibu, 9022, USA'}</p>
                </div>
            </header>
            
            {skills && skills.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold border-b border-gray-400">Skills</h2>
                    <ul className="mt-2 space-y-1 list-disc list-inside">
                        {skills.map((skill, index) => (
                            <li key={index} className="text-sm">{skill.name}</li>
                        ))}
                    </ul>
                </div>
            )}

            {education && education.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold border-b border-gray-400">Education</h2>
                    {education.map((edu, index) => (
                        <div key={index} className="mt-3">
                            <h3 className="font-bold text-base">{edu.degree}</h3>
                            <p className="text-sm">{edu.institution}</p>
                            <p className="text-sm text-gray-400">{formatDate(edu.startDate)} - {formatDate(edu.endDate)}</p>
                        </div>
                    ))}
                </div>
            )}
        </aside>

        {/* Right Section */}
        <main className="w-2/3 bg-white text-gray-800">
            {basicInfo?.about && (
                <div className="mb-8">
                    <h2 className="font-bold text-gray-800 border-b-2 border-gray-200">Professional Summary</h2>
                    <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line mt-3">{basicInfo.about}</p>
                </div>
            )}

            {projects && projects.length > 0 && (
                <div className="mb-8">
                    <h2 className="font-bold text-gray-800 border-b-2 border-gray-200">Projects</h2>
                    {projects.map((project, index) => (
                        <div key={index} className="mb-4 mt-3">
                            <h3 className="font-bold text-lg">{project.title}</h3>
                            <p className="text-sm text-gray-700 my-1">{project.description}</p>
                            {project.techStack && project.techStack.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {project.techStack.map((tech, i) => (
                                        <span key={i} className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded-full">{tech}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {experiences && experiences.length > 0 && (
                <div className="mb-8">
                    <h2 className="font-bold text-gray-800 border-b-2 border-gray-200">Professional Experience</h2>
                    {experiences.map((exp, index) => (
                        <div key={index} className="mb-6 mt-3">
                            <h3 className="text-lg font-bold">{exp.position}</h3>
                            <p className="text-base font-semibold text-gray-600 mb-2">{exp.company} | {formatDate(exp.startDate)} - {formatDate(exp.endDate)}</p>
                            {exp.description && <p className="text-sm leading-relaxed whitespace-pre-line">{exp.description}</p>}
                        </div>
                    ))}
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
    const container = document.querySelector('.resume-template-wrapper');
    if (container) {
      container.scrollTop = 0;
    }
  }, [props.templateType]); // Rerun if template changes to scroll to top

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
