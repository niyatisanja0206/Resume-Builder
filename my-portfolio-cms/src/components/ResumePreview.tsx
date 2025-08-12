import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Basic, Project, Experience, Skill, Education } from '@/types/portfolio';

interface ResumePreviewProps {
  basicInfo?: Basic;
  projects?: Project[];
  experiences?: Experience[];
  skills?: Skill[];
  education?: Education[];
}

// Classic Template Preview
const ClassicTemplate = ({ basicInfo, projects, experiences, skills, education }: ResumePreviewProps) => (
  <div className="min-h-screen bg-white py-8 px-8 font-serif max-w-4xl mx-auto border border-gray-200 shadow-lg">
    {/* Header Section */}
    <div className="text-center mb-8 pb-6 border-b-2 border-gray-800">
      <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-wide">
        {basicInfo?.name || 'Your Name'}
      </h1>
      <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-gray-700">
        <span>{basicInfo?.email || 'email@example.com'}</span>
        <span>•</span>
        <span>{basicInfo?.contact_no || 'Phone Number'}</span>
        <span>•</span>
        <span>{basicInfo?.location || 'Location'}</span>
      </div>
    </div>

    {/* Summary */}
    {basicInfo?.about && (
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3 pb-1 border-b border-gray-800 tracking-wider">
          SUMMARY
        </h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          {basicInfo.about}
        </p>
      </div>
    )}

    {/* Experience */}
    {experiences && experiences.length > 0 && (
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3 pb-1 border-b border-gray-800 tracking-wider">
          WORK EXPERIENCE
        </h2>
        <div className="space-y-4">
          {experiences.map((exp, idx) => (
            <div key={idx}>
              <div className="flex justify-between items-start mb-1">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">{exp.position}</h3>
                  <p className="text-sm text-gray-700 font-medium">{exp.company}</p>
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - 
                  {exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : " Present"}
                </div>
              </div>
              {exp.description && (
                <p className="text-sm text-gray-700 mb-2">{exp.description}</p>
              )}
              {exp.skillsLearned && exp.skillsLearned.length > 0 && (
                <p className="text-sm text-gray-600">Skills: {exp.skillsLearned.join(', ')}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Education */}
    {education && education.length > 0 && (
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3 pb-1 border-b border-gray-800 tracking-wider">
          EDUCATION
        </h2>
        <div className="space-y-3">
          {education.map((edu, index) => (
            <div key={edu.id ?? index} className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-semibold text-gray-900">{edu.degree}</h3>
                <p className="text-sm text-gray-700">{edu.institution}</p>
              </div>
              <div className="text-sm text-gray-600 text-right">
                <p>{new Date(edu.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - 
                   {edu.endDate ? new Date(edu.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : " Present"}</p>
                {edu.Grade && <p>{edu.Grade}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Projects */}
    {projects && projects.length > 0 && (
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3 pb-1 border-b border-gray-800 tracking-wider">
          PROJECTS
        </h2>
        <div className="space-y-4">
          {projects.map((project, idx) => (
            <div key={idx}>
              <h3 className="text-base font-semibold text-gray-900 mb-1">{project.title}</h3>
              <p className="text-sm text-gray-700 mb-2">{project.description}</p>
              {project.techStack && project.techStack.length > 0 && (
                <p className="text-sm text-gray-600">Technologies: {project.techStack.join(', ')}</p>
              )}
              {project.link && (
                <p className="text-sm text-blue-600">Link: {project.link}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Skills */}
    {skills && skills.length > 0 && (
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3 pb-1 border-b border-gray-800 tracking-wider">
          SKILLS
        </h2>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, idx) => (
            <span key={idx} className="bg-gray-100 px-3 py-1 text-sm text-gray-800 border border-gray-300">
              {skill.name} ({skill.level})
            </span>
          ))}
        </div>
      </div>
    )}
  </div>
);

// Modern Template Preview
const ModernTemplate = ({ basicInfo, projects, experiences, skills, education }: ResumePreviewProps) => (
  <div className="min-h-screen bg-white py-8 px-8 font-sans max-w-4xl mx-auto border border-gray-200 shadow-lg">
    {/* Header Section */}
    <div className="mb-8 pb-6 border-b-2 border-blue-500">
      <h1 className="text-4xl font-bold text-blue-700 mb-3">
        {basicInfo?.name || 'Your Name'}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
        <span className="flex items-center">
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
          {basicInfo?.email || 'email@example.com'}
        </span>
        <span className="flex items-center">
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
          {basicInfo?.contact_no || 'Phone Number'}
        </span>
        <span className="flex items-center">
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
          {basicInfo?.location || 'Location'}
        </span>
      </div>
    </div>

    {/* Summary */}
    {basicInfo?.about && (
      <div className="mb-8">
        <h2 className="text-xl font-bold text-blue-700 mb-4 uppercase tracking-wide">
          Professional Summary
        </h2>
        <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded">
          {basicInfo.about}
        </p>
      </div>
    )}

    {/* Experience */}
    {experiences && experiences.length > 0 && (
      <div className="mb-8">
        <h2 className="text-xl font-bold text-blue-700 mb-4 uppercase tracking-wide">
          Work Experience
        </h2>
        <div className="space-y-6">
          {experiences.map((exp, idx) => (
            <div key={idx} className="border-l-4 border-blue-300 pl-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{exp.position}</h3>
                  <p className="text-base text-blue-600 font-medium">{exp.company}</p>
                </div>
                <div className="text-sm text-gray-500 bg-blue-50 px-3 py-1 rounded">
                  {new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - 
                  {exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : " Present"}
                </div>
              </div>
              {exp.description && (
                <p className="text-sm text-gray-700 mb-3">{exp.description}</p>
              )}
              {exp.skillsLearned && exp.skillsLearned.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {exp.skillsLearned.map((skill, skillIdx) => (
                    <Badge key={skillIdx} className="bg-blue-100 text-blue-800 text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Education */}
    {education && education.length > 0 && (
      <div className="mb-8">
        <h2 className="text-xl font-bold text-blue-700 mb-4 uppercase tracking-wide">
          Education
        </h2>
        <div className="space-y-4">
          {education.map((edu, index) => (
            <div key={edu.id ?? index} className="bg-gray-50 p-4 rounded">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">{edu.degree}</h3>
                  <p className="text-sm text-blue-600">{edu.institution}</p>
                </div>
                <div className="text-sm text-gray-600 text-right">
                  <p>{new Date(edu.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - 
                     {edu.endDate ? new Date(edu.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : " Present"}</p>
                  {edu.Grade && <p className="font-medium">{edu.Grade}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Projects */}
    {projects && projects.length > 0 && (
      <div className="mb-8">
        <h2 className="text-xl font-bold text-blue-700 mb-4 uppercase tracking-wide">
          Projects
        </h2>
        <div className="space-y-4">
          {projects.map((project, idx) => (
            <div key={idx} className="border border-blue-200 p-4 rounded">
              <h3 className="text-base font-semibold text-gray-900 mb-2">{project.title}</h3>
              <p className="text-sm text-gray-700 mb-3">{project.description}</p>
              {project.techStack && project.techStack.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {project.techStack.map((tech, techIdx) => (
                    <Badge key={techIdx} variant="outline" className="text-xs border-blue-300 text-blue-700">
                      {tech}
                    </Badge>
                  ))}
                </div>
              )}
              {project.link && (
                <p className="text-sm text-blue-600 underline">{project.link}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Skills */}
    {skills && skills.length > 0 && (
      <div className="mb-8">
        <h2 className="text-xl font-bold text-blue-700 mb-4 uppercase tracking-wide">
          Technical Skills
        </h2>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, idx) => (
            <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-2 text-sm font-medium rounded-full">
              {skill.name}
            </span>
          ))}
        </div>
      </div>
    )}
  </div>
);

// Creative Template Preview (Two-column)
const CreativeTemplate = ({ basicInfo, projects, experiences, skills, education }: ResumePreviewProps) => (
  <div className="min-h-screen bg-white font-sans max-w-5xl mx-auto border border-gray-200 shadow-lg flex">
    {/* Left Sidebar */}
    <div className="w-1/3 bg-gray-800 text-white p-6">
      {/* Profile */}
      <div className="text-center mb-8">
        <div className="w-24 h-24 bg-gray-600 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span className="text-2xl font-bold">{basicInfo?.name?.charAt(0) || 'Y'}</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">{basicInfo?.name || 'Your Name'}</h1>
      </div>

      {/* Contact */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-4 bg-gray-700 px-3 py-2">CONTACT</h2>
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-gray-300">Email</p>
            <p>{basicInfo?.email || 'email@example.com'}</p>
          </div>
          <div>
            <p className="text-gray-300">Phone</p>
            <p>{basicInfo?.contact_no || 'Phone Number'}</p>
          </div>
          <div>
            <p className="text-gray-300">Location</p>
            <p>{basicInfo?.location || 'Location'}</p>
          </div>
        </div>
      </div>

      {/* Skills */}
      {skills && skills.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4 bg-gray-700 px-3 py-2">SKILLS</h2>
          <div className="space-y-2">
            {skills.map((skill, idx) => (
              <div key={idx} className="bg-gray-700 px-3 py-2 text-center text-sm">
                {skill.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4 bg-gray-700 px-3 py-2">EDUCATION</h2>
          <div className="space-y-4">
            {education.map((edu, index) => (
              <div key={edu.id ?? index} className="text-sm">
                <h3 className="font-semibold">{edu.degree}</h3>
                <p className="text-gray-300">{edu.institution}</p>
                <p className="text-gray-400">
                  {new Date(edu.startDate).getFullYear()} - {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}
                </p>
                {edu.Grade && <p className="text-gray-300">{edu.Grade}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>

    {/* Right Content */}
    <div className="w-2/3 p-8">
      {/* Summary */}
      {basicInfo?.about && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 bg-gray-100 px-4 py-2">
            PROFESSIONAL SUMMARY
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            {basicInfo.about}
          </p>
        </div>
      )}

      {/* Experience */}
      {experiences && experiences.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 bg-gray-100 px-4 py-2">
            WORK EXPERIENCE
          </h2>
          <div className="space-y-6">
            {experiences.map((exp, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{exp.position}</h3>
                    <p className="text-base text-gray-600">{exp.company}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - 
                    {exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : " Present"}
                  </div>
                </div>
                {exp.description && (
                  <p className="text-sm text-gray-700 mb-3">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 bg-gray-100 px-4 py-2">
            PROJECTS
          </h2>
          <div className="space-y-4">
            {projects.map((project, idx) => (
              <div key={idx}>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{project.title}</h3>
                <p className="text-sm text-gray-700 mb-2">{project.description}</p>
                {project.techStack && project.techStack.length > 0 && (
                  <p className="text-sm text-gray-600">Tech: {project.techStack.join(', ')}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

const templates = [
  { id: 'classic', name: 'Classic', component: ClassicTemplate },
  { id: 'modern', name: 'Modern', component: ModernTemplate },
  { id: 'creative', name: 'Creative', component: CreativeTemplate },
];

export default function ResumePreview({ basicInfo, projects, experiences, skills, education }: ResumePreviewProps) {
  const [currentTemplate, setCurrentTemplate] = useState(0);

  const nextTemplate = () => {
    setCurrentTemplate((prev) => (prev + 1) % templates.length);
  };

  const prevTemplate = () => {
    setCurrentTemplate((prev) => (prev - 1 + templates.length) % templates.length);
  };

  const handleDownloadPDF = async () => {
    try {
      // Simple approach: use browser's print functionality to save as PDF
      const resumeElement = document.querySelector('.resume-template');
      if (resumeElement) {
        // Create a new window with just the resume content
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Resume - ${basicInfo?.name || 'Resume'}</title>
                <style>
                  body { margin: 0; padding: 0; font-family: system-ui, sans-serif; }
                  @media print { 
                    body { margin: 0; padding: 0; }
                    .no-print { display: none; }
                  }
                  @page { margin: 0.5in; }
                </style>
              </head>
              <body>
                ${resumeElement.outerHTML}
              </body>
            </html>
          `);
          printWindow.document.close();
          
          // Wait a moment for content to load, then trigger print
          setTimeout(() => {
            printWindow.print();
          }, 500);
        }
      } else {
        // Fallback: print current page
        window.print();
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Error preparing download. Please try again.');
    }
  };

  const handlePreview = () => {
    // Scroll to resume template for better view
    const resumeElement = document.querySelector('.resume-template');
    if (resumeElement) {
      resumeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // Optional: Open in new tab for full-screen preview
    const confirm = window.confirm('Open resume in new tab for full preview?');
    if (confirm) {
      const newWindow = window.open(window.location.href, '_blank');
      if (newWindow) {
        newWindow.focus();
      }
    }
  };

  const CurrentComponent = templates[currentTemplate].component;

  return (
    <div className="relative">
      {/* Navigation Controls */}
      <div className="flex items-center justify-between mb-6 bg-muted p-4 rounded-lg">
        <Button
          onClick={prevTemplate}
          variant="outline"
          size="lg"
          className="flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </Button>

        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground">
            {templates[currentTemplate].name} Template
          </h3>
          <div className="flex justify-center gap-2 mt-2">
            {templates.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTemplate(index)}
                className={`w-3 h-3 rounded-full transition-colors cursor-pointer ${
                  index === currentTemplate ? 'bg-primary' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>
        </div>

        <Button
          onClick={nextTemplate}
          variant="outline"
          size="lg"
          className="flex items-center gap-2"
        >
          Next
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>

      {/* Template Selector & Download */}
      <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center gap-4">
          <label htmlFor="template-select" className="text-sm font-medium text-gray-700">
            Choose Template:
          </label>
          <select
            id="template-select"
            value={currentTemplate}
            onChange={(e) => setCurrentTemplate(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {templates.map((template, index) => (
              <option key={index} value={index}>
                {template.name} Template
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => handleDownloadPDF()}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            Download PDF
          </Button>
          <Button
            onClick={() => handlePreview()}
            variant="outline"
            className="flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Preview
          </Button>
        </div>
      </div>

      {/* Template Preview */}
      <div className="bg-gray-100 p-8 rounded-lg overflow-auto">
        <div className="scale-75 origin-top transform transition-transform duration-300">
          <CurrentComponent
            basicInfo={basicInfo}
            projects={projects}
            experiences={experiences}
            skills={skills}
            education={education}
          />
        </div>
      </div>

      {/* Template Info */}
      <div className="mt-4 text-center text-sm text-gray-600">
        Template {currentTemplate + 1} of {templates.length}: {templates[currentTemplate].name}
      </div>
    </div>
  );
}
