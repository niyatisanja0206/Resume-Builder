import type { Basic, Project, Experience, Skill, Education } from '@/types/portfolio';
import { AtSign, Phone, MapPin, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Add CSS for A4 print styling
const printStyles = `
  @media print {
    * {
      -webkit-print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    
    @page {
      size: A4;
      margin: 0;
    }
    
    body {
      margin: 0;
      padding: 0;
    }
    
    .resume-template {
      width: 210mm !important;
      height: 297mm !important;
      margin: 0 !important;
      padding: 20mm !important;
      box-sizing: border-box !important;
      font-size: 11pt !important;
      line-height: 1.3 !important;
      page-break-after: avoid !important;
      overflow: hidden !important;
    }
    
    .no-print {
      display: none !important;
    }
  }
`;

// Inject print styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = printStyles;
  document.head.appendChild(styleSheet);
}

// Interface for props passed to the component
interface ResumePreviewProps {
  basicInfo: Basic | null;
  projects: Project[];
  experiences: Experience[];
  skills: Skill[];
  education: Education[];
  templateType: 'classic' | 'modern' | 'creative';
}

// Helper function to format dates
const formatDate = (dateInput: Date | string | undefined): string => {
  if (!dateInput) return '';
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

// Component for the Classic resume template preview
const ClassicTemplate = ({ basicInfo, projects, experiences, skills, education }: Omit<ResumePreviewProps, 'templateType'>) => (
  <div className="resume-template bg-white font-serif" style={{ 
    width: '210mm', 
    minHeight: '297mm', 
    maxHeight: '297mm',
    padding: '20mm',
    margin: '0 auto',
    boxSizing: 'border-box',
    fontSize: '11pt',
    lineHeight: '1.3',
    overflow: 'hidden'
  }}>
    <div className="text-center pb-3 border-b border-gray-400 mb-4">
      <h1 className="text-2xl font-bold mb-1">{basicInfo?.name || 'Your Name'}</h1>
      <div className="flex justify-center items-center space-x-2 text-xs text-gray-600">
        <span>{basicInfo?.contact_no || 'Phone Number'}</span>
        <span>|</span>
        <span>{basicInfo?.email || 'email@example.com'}</span>
        <span>|</span>
        <span>{basicInfo?.location || 'Location'}</span>
      </div>
    </div>

    {/* Summary */}
    {basicInfo?.about && (
      <div className="mb-4">
        <h2 className="text-base font-bold border-b border-gray-400 mb-2 pb-1">PROFILE</h2>
        <p className="text-xs text-gray-700 leading-relaxed">{basicInfo.about}</p>
      </div>
    )}

    {/* Work Experience */}
    {experiences && experiences.length > 0 && (
      <div className="mb-4">
        <h2 className="text-base font-bold border-b border-gray-400 mb-2 pb-1">WORK EXPERIENCE</h2>
        {experiences.map((exp, index) => (
          <div key={index} className="mb-3">
            <div className="flex justify-between items-start">
              <h3 className="text-sm font-semibold">{exp.position}</h3>
              <span className="text-xs text-gray-500">{formatDate(exp.startDate)} - {formatDate(exp.endDate) || 'Present'}</span>
            </div>
            <p className="text-xs text-gray-700 font-medium">{exp.company}</p>
            {exp.description && <p className="text-xs text-gray-600 mt-1 leading-relaxed">{exp.description}</p>}
          </div>
        ))}
      </div>
    )}

    {/* Education */}
    {education && education.length > 0 && (
      <div className="mb-4">
        <h2 className="text-base font-bold border-b border-gray-400 mb-2 pb-1">EDUCATION</h2>
        {education.map((edu, index) => (
          <div key={index} className="mb-3">
            <div className="flex justify-between items-start">
              <h3 className="text-sm font-semibold">{edu.degree}</h3>
              <span className="text-xs text-gray-500">{formatDate(edu.startDate)} - {formatDate(edu.endDate) || 'Present'}</span>
            </div>
            <p className="text-xs text-gray-700 font-medium">{edu.institution}</p>
          </div>
        ))}
      </div>
    )}

    {/* Projects */}
    {projects && projects.length > 0 && (
      <div className="mb-4">
        <h2 className="text-base font-bold border-b border-gray-400 mb-2 pb-1">PROJECTS</h2>
        {projects.map((project, index) => (
          <div key={index} className="mb-3">
            <h3 className="text-sm font-semibold">{project.title}</h3>
            <p className="text-xs text-gray-700 leading-relaxed">{project.description}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {project.techStack.map((tech, index) => (
                <span key={index} className="text-xs text-gray-500 bg-gray-200 rounded-full px-2 py-0.5">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    )}

    {/* Skills */}
    {skills && skills.length > 0 && (
      <div className="mb-4">
        <h2 className="text-base font-bold border-b border-gray-400 mb-2 pb-1">SKILLS</h2>
        <ul className="grid grid-cols-2 text-xs text-gray-700 list-disc list-inside gap-y-1">
          {skills.map((skill, index) => (
            <li key={index}>{skill.name} ({skill.level})</li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

// Component for the Modern resume template preview
const ModernTemplate = ({ basicInfo, projects, experiences, skills, education }: Omit<ResumePreviewProps, 'templateType'>) => (
  <div className="resume-template bg-white font-sans text-gray-800" style={{ 
    width: '210mm', 
    minHeight: '297mm', 
    maxHeight: '297mm',
    padding: '20mm',
    margin: '0 auto',
    boxSizing: 'border-box',
    fontSize: '11pt',
    lineHeight: '1.3',
    overflow: 'hidden'
  }}>
    <div className="flex justify-between items-end pb-4 border-b-2 border-blue-500 mb-4">
      <div>
        <h1 className="text-3xl font-bold text-blue-700 mb-1">{basicInfo?.name || 'Your Name'}</h1>
        <p className="text-base text-blue-500 font-medium">{basicInfo?.about || 'Professional Title'}</p>
      </div>
      <div className="text-xs space-y-1">
        <div className="flex items-center space-x-2">
          <Phone size={12} className="text-blue-500" />
          <span>{basicInfo?.contact_no || 'Phone Number'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <AtSign size={12} className="text-blue-500" />
          <span>{basicInfo?.email || 'email@example.com'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <MapPin size={12} className="text-blue-500" />
          <span>{basicInfo?.location || 'Location'}</span>
        </div>
      </div>
    </div>
    
    {/* Summary */}
    {basicInfo?.about && (
      <div className="mb-4">
        <h2 className="text-base font-bold text-blue-700 uppercase mb-2">Summary</h2>
        <p className="text-xs leading-relaxed">{basicInfo.about}</p>
      </div>
    )}

    {/* Experience */}
    {experiences && experiences.length > 0 && (
      <div className="mb-4">
        <h2 className="text-base font-bold text-blue-700 uppercase mb-2">Experience</h2>
        {experiences.map((exp, index) => (
          <div key={index} className="mb-3">
            <div className="flex justify-between items-baseline">
              <h3 className="text-sm font-semibold">{exp.position}</h3>
              <span className="text-xs text-gray-500">{formatDate(exp.startDate)} - {formatDate(exp.endDate) || 'Present'}</span>
            </div>
            <p className="text-xs font-medium text-blue-600">{exp.company}</p>
            {exp.description && <p className="text-xs mt-1 leading-relaxed">{exp.description}</p>}
          </div>
        ))}
      </div>
    )}

    {/* Projects */}
    {projects && projects.length > 0 && (
      <div className="mb-4">
        <h2 className="text-base font-bold text-blue-700 uppercase mb-2">Projects</h2>
        {projects.map((project, index) => (
          <div key={index} className="mb-3">
            <h3 className="text-sm font-semibold">{project.title}</h3>
            <p className="text-xs text-gray-700 leading-relaxed">{project.description}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {project.techStack.map((tech, index) => (
                <span key={index} className="text-xs text-gray-500 bg-gray-200 rounded-full px-2 py-0.5">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    )}

    {/* Education */}
    {education && education.length > 0 && (
      <div className="mb-4">
        <h2 className="text-base font-bold text-blue-700 uppercase mb-2">Education</h2>
        {education.map((edu, index) => (
          <div key={index} className="mb-3">
            <div className="flex justify-between items-baseline">
              <h3 className="text-sm font-semibold">{edu.degree}</h3>
              <span className="text-xs text-gray-500">{formatDate(edu.startDate)} - {formatDate(edu.endDate) || 'Present'}</span>
            </div>
            <p className="text-xs font-medium text-blue-600">{edu.institution}</p>
          </div>
        ))}
      </div>
    )}

    {/* Skills */}
    {skills && skills.length > 0 && (
      <div className="mb-4">
        <h2 className="text-base font-bold text-blue-700 uppercase mb-2">Skills</h2>
        <div className="flex flex-wrap gap-1">
          {skills.map((skill, index) => (
            <Badge key={index} className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs">
              {skill.name} : <span className="text-gray-600">{skill.level || 'Unknown'}</span>
            </Badge>
          ))}
        </div>
      </div>
    )}
  </div>
);

// Component for the Creative resume template preview
const CreativeTemplate = ({ basicInfo, projects, experiences, skills, education }: Omit<ResumePreviewProps, 'templateType'>) => (
  <div className="resume-template bg-white font-sans shadow-lg" style={{ 
    width: '210mm', 
    minHeight: '297mm', 
    maxHeight: '297mm',
    margin: '0 auto',
    boxSizing: 'border-box',
    fontSize: '11pt',
    lineHeight: '1.3',
    overflow: 'hidden',
    display: 'flex'
  }}>
    <div className="bg-blue-100 text-gray-800 space-y-4" style={{ 
      width: '35%', 
      padding: '20mm 15mm',
      minHeight: '100%'
    }}>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">{basicInfo?.name || 'Your Name'}</h1>
      </div>
      <div className="space-y-2">
        <h2 className="text-sm font-bold border-b border-gray-300 pb-1">Contact</h2>
        <div className="text-xs space-y-1">
          <p className="flex items-center space-x-2">
            <AtSign size={12} className="text-gray-600" />
            <span>{basicInfo?.email || 'email@example.com'}</span>
          </p>
          <p className="flex items-center space-x-2">
            <Phone size={12} className="text-gray-600" />
            <span>{basicInfo?.contact_no || 'Phone Number'}</span>
          </p>
          <p className="flex items-center space-x-2">
            <MapPin size={12} className="text-gray-600" />
            <span>{basicInfo?.location || 'Location'}</span>
          </p>
        </div>
      </div>
      {skills && skills.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-bold border-b border-gray-300 pb-1">Skills</h2>
          <ul className="text-xs space-y-1">
            {skills.map((skill, index) => (
              <li key={index} className="flex items-center">
                <CheckCircle size={12} className="text-green-500 mr-2" />
                {skill.name} : <span className="text-gray-600">{skill.level || 'Unknown'}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {education && education.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-bold border-b border-gray-300 pb-1">Education</h2>
          {education.map((edu, index) => (
            <div key={index} className="text-xs">
              <h3 className="font-semibold text-xs">{edu.degree}</h3>
              <p className="text-gray-500">{edu.institution}</p>
              <p className="text-gray-500">{formatDate(edu.startDate)} - {formatDate(edu.endDate) || 'Present'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
    <div className="space-y-4" style={{ 
      width: '65%', 
      padding: '20mm 15mm 20mm 20mm'
    }}>
      {basicInfo?.about && (
        <div className="space-y-2">
          <h2 className="text-base font-bold border-b border-gray-300 pb-1">Profile</h2>
          <p className="text-xs text-gray-700 leading-relaxed">{basicInfo.about}</p>
        </div>
      )}
      {experiences && experiences.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-base font-bold border-b border-gray-300 pb-1">Work Experience</h2>
          {experiences.map((exp, index) => (
            <div key={index} className="mb-3">
              <div className="flex justify-between items-baseline">
                <h3 className="text-sm font-semibold">{exp.position}</h3>
                <span className="text-xs text-gray-500">{formatDate(exp.startDate)} - {formatDate(exp.endDate) || 'Present'}</span>
              </div>
              <p className="text-xs font-medium text-gray-600">{exp.company}</p>
              {exp.description && <p className="text-xs mt-1 leading-relaxed">{exp.description}</p>}
            </div>
          ))}
        </div>
      )}
      {projects && projects.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-base font-bold border-b border-gray-300 pb-1">Projects</h2>
          {projects.map((project, index) => (
            <div key={index} className="mb-3">
              <h3 className="text-sm font-semibold">{project.title}</h3>
              <p className="text-xs text-gray-700 mt-1 leading-relaxed">{project.description}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {project.techStack.map((tech, index) => (
                  <span key={index} className="text-xs text-gray-500 bg-gray-200 rounded-full px-2 py-0.5">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

// The main component that switches between the different templates
const ResumePreview = (props: ResumePreviewProps) => {
  switch (props.templateType) {
    case 'modern':
      return <ModernTemplate {...props} />;
    case 'creative':
      return <CreativeTemplate {...props} />;
    case 'classic':
    default:
      return <ClassicTemplate {...props} />;
  }
};

export default ResumePreview;
