import type { Basic, Project, Experience, Skill, Education } from '@/types/portfolio';
import { AtSign, Phone, MapPin, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  <div className="bg-white p-8 max-w-2xl mx-auto font-serif">
    <div className="text-center pb-4 border-b border-gray-400">
      <h1 className="text-3xl font-bold">{basicInfo?.name || 'Your Name'}</h1>
      <div className="flex justify-center items-center space-x-2 text-sm text-gray-600 mt-1">
        <span>{basicInfo?.contact_no || 'Phone Number'}</span>
        <span>|</span>
        <span>{basicInfo?.email || 'email@example.com'}</span>
        <span>|</span>
        <span>{basicInfo?.location || 'Location'}</span>
      </div>
    </div>

    {/* Summary */}
    {basicInfo?.about && (
      <div className="mb-6">
        <h2 className="text-lg font-bold border-b border-gray-400 mb-2 pb-1">PROFILE</h2>
        <p className="text-sm text-gray-700">{basicInfo.about}</p>
      </div>
    )}

    {/* Work Experience */}
    {experiences && experiences.length > 0 && (
      <div className="mb-6">
        <h2 className="text-lg font-bold border-b border-gray-400 mb-2 pb-1">WORK EXPERIENCE</h2>
        {experiences.map((exp, index) => (
          <div key={index} className="mb-4">
            <div className="flex justify-between items-start">
              <h3 className="text-base font-semibold">{exp.position}</h3>
              <span className="text-sm text-gray-500">{formatDate(exp.startDate)} - {formatDate(exp.endDate) || 'Present'}</span>
            </div>
            <p className="text-sm text-gray-700 font-medium">{exp.company}</p>
            {exp.description && <p className="text-sm text-gray-600 mt-1">{exp.description}</p>}
          </div>
        ))}
      </div>
    )}

    {/* Education */}
    {education && education.length > 0 && (
      <div className="mb-6">
        <h2 className="text-lg font-bold border-b border-gray-400 mb-2 pb-1">EDUCATION</h2>
        {education.map((edu, index) => (
          <div key={index} className="mb-4">
            <div className="flex justify-between items-start">
              <h3 className="text-base font-semibold">{edu.degree}</h3>
              <span className="text-sm text-gray-500">{formatDate(edu.startDate)} - {formatDate(edu.endDate) || 'Present'}</span>
            </div>
            <p className="text-sm text-gray-700 font-medium">{edu.institution}</p>
          </div>
        ))}
      </div>
    )}

    {/* Projects */}
    {projects && projects.length > 0 && (
      <div className="mb-6">
        <h2 className="text-lg font-bold border-b border-gray-400 mb-2 pb-1">PROJECTS</h2>
        {projects.map((project, index) => (
          <div key={index} className="mb-4">
            <h3 className="text-base font-semibold">{project.title}</h3>
            <p className="text-sm text-gray-700">{project.description}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {project.techStack.map((tech, index) => (
                <span key={index} className="text-xs text-gray-500 bg-gray-200 rounded-full px-2 py-1">
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
      <div className="mb-6">
        <h2 className="text-lg font-bold border-b border-gray-400 mb-2 pb-1">SKILLS</h2>
        <ul className="grid grid-cols-2 text-sm text-gray-700 list-disc list-inside">
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
  <div className="bg-white p-8 max-w-2xl mx-auto font-sans text-gray-800">
    <div className="flex justify-between items-end pb-6 border-b-2 border-blue-500 mb-6">
      <div>
        <h1 className="text-4xl font-bold text-blue-700">{basicInfo?.name || 'Your Name'}</h1>
        <p className="text-lg text-blue-500 font-medium">{basicInfo?.about || 'Professional Title'}</p>
      </div>
      <div className="text-sm space-y-1">
        <div className="flex items-center space-x-2">
          <Phone size={14} className="text-blue-500" />
          <span>{basicInfo?.contact_no || 'Phone Number'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <AtSign size={14} className="text-blue-500" />
          <span>{basicInfo?.email || 'email@example.com'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <MapPin size={14} className="text-blue-500" />
          <span>{basicInfo?.location || 'Location'}</span>
        </div>
      </div>
    </div>
    
    {/* Summary */}
    {basicInfo?.about && (
      <div className="mb-6">
        <h2 className="text-xl font-bold text-blue-700 uppercase mb-2">Summary</h2>
        <p className="text-sm">{basicInfo.about}</p>
      </div>
    )}

    {/* Experience */}
    {experiences && experiences.length > 0 && (
      <div className="mb-6">
        <h2 className="text-xl font-bold text-blue-700 uppercase mb-2">Experience</h2>
        {experiences.map((exp, index) => (
          <div key={index} className="mb-4">
            <div className="flex justify-between items-baseline">
              <h3 className="text-lg font-semibold">{exp.position}</h3>
              <span className="text-sm text-gray-500">{formatDate(exp.startDate)} - {formatDate(exp.endDate) || 'Present'}</span>
            </div>
            <p className="text-sm font-medium text-blue-600">{exp.company}</p>
            {exp.description && <p className="text-sm mt-1">{exp.description}</p>}
          </div>
        ))}
      </div>
    )}

    {/* Projects */}
    {projects && projects.length > 0 && (
      <div className="mb-6">
        <h2 className="text-xl font-bold text-blue-700 uppercase mb-2">Projects</h2>
        {projects.map((project, index) => (
          <div key={index} className="mb-4">
            <h3 className="text-lg font-semibold">{project.title}</h3>
            <p className="text-sm text-gray-700">{project.description}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {project.techStack.map((tech, index) => (
                <span key={index} className="text-xs text-gray-500 bg-gray-200 rounded-full px-2 py-1">
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
      <div className="mb-6">
        <h2 className="text-xl font-bold text-blue-700 uppercase mb-2">Education</h2>
        {education.map((edu, index) => (
          <div key={index} className="mb-4">
            <div className="flex justify-between items-baseline">
              <h3 className="text-lg font-semibold">{edu.degree}</h3>
              <span className="text-sm text-gray-500">{formatDate(edu.startDate)} - {formatDate(edu.endDate) || 'Present'}</span>
            </div>
            <p className="text-sm font-medium text-blue-600">{edu.institution}</p>
          </div>
        ))}
      </div>
    )}

    {/* Skills */}
    {skills && skills.length > 0 && (
      <div className="mb-6">
        <h2 className="text-xl font-bold text-blue-700 uppercase mb-2">Skills</h2>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <Badge key={index} className="bg-blue-100 text-blue-800 hover:bg-blue-200">
              {skill.name}
            </Badge>
          ))}
        </div>
      </div>
    )}
  </div>
);

// Component for the Creative resume template preview
const CreativeTemplate = ({ basicInfo, projects, experiences, skills, education }: Omit<ResumePreviewProps, 'templateType'>) => (
  <div className="bg-white p-6 max-w-4xl mx-auto flex font-sans shadow-lg">
    <div className="w-1/3 bg-gray-100 text-gray-800 p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{basicInfo?.name || 'Your Name'}</h1>
      </div>
      <div className="space-y-2">
        <h2 className="text-lg font-bold border-b border-gray-300 pb-1">Contact</h2>
        <div className="text-sm">
          <p className="flex items-center space-x-2">
            <AtSign size={14} className="text-gray-600" />
            <span>{basicInfo?.email || 'email@example.com'}</span>
          </p>
          <p className="flex items-center space-x-2">
            <Phone size={14} className="text-gray-600" />
            <span>{basicInfo?.contact_no || 'Phone Number'}</span>
          </p>
          <p className="flex items-center space-x-2">
            <MapPin size={14} className="text-gray-600" />
            <span>{basicInfo?.location || 'Location'}</span>
          </p>
        </div>
      </div>
      {skills && skills.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-bold border-b border-gray-300 pb-1">Skills</h2>
          <ul className="text-sm space-y-1">
            {skills.map((skill, index) => (
              <li key={index} className="flex items-center">
                <CheckCircle size={14} className="text-green-500 mr-2" />
                {skill.name}
              </li>
            ))}
          </ul>
        </div>
      )}
      {education && education.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-bold border-b border-gray-300 pb-1">Education</h2>
          {education.map((edu, index) => (
            <div key={index} className="text-sm">
              <h3 className="font-semibold">{edu.degree}</h3>
              <p className="text-gray-500">{edu.institution}</p>
              <p className="text-gray-500">{formatDate(edu.startDate)} - {formatDate(edu.endDate) || 'Present'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
    <div className="w-2/3 p-6 space-y-6">
      {basicInfo?.about && (
        <div className="space-y-2">
          <h2 className="text-xl font-bold border-b border-gray-300 pb-1">Profile</h2>
          <p className="text-sm text-gray-700">{basicInfo.about}</p>
        </div>
      )}
      {experiences && experiences.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xl font-bold border-b border-gray-300 pb-1">Work Experience</h2>
          {experiences.map((exp, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-baseline">
                <h3 className="text-lg font-semibold">{exp.position}</h3>
                <span className="text-sm text-gray-500">{formatDate(exp.startDate)} - {formatDate(exp.endDate) || 'Present'}</span>
              </div>
              <p className="text-sm font-medium text-gray-600">{exp.company}</p>
              {exp.description && <p className="text-sm mt-1">{exp.description}</p>}
            </div>
          ))}
        </div>
      )}
      {projects && projects.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xl font-bold border-b border-gray-300 pb-1">Projects</h2>
          {projects.map((project, index) => (
            <div key={index} className="mb-4">
              <h3 className="text-lg font-semibold">{project.title}</h3>
              <p className="text-sm text-gray-700 mt-1">{project.description}</p>
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
