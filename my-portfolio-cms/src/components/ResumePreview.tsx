import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PDFDownloadLink, Document, Page, Text, View } from '@react-pdf/renderer';
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
    {/* Debug indicator */}
    <div className="bg-red-100 text-red-800 p-2 mb-4 text-sm">CLASSIC TEMPLATE ACTIVE</div>
    
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
    {/* Debug indicator */}
    <div className="bg-blue-100 text-blue-800 p-2 mb-4 text-sm">MODERN TEMPLATE ACTIVE</div>
    
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
  <div className="min-h-screen bg-white font-sans max-w-5xl mx-auto border border-gray-200 shadow-lg" style={{ display: 'flex' }}>
    {/* Debug indicator */}
    <div className="absolute top-0 left-0 bg-green-100 text-green-800 p-2 text-sm z-10">CREATIVE TEMPLATE ACTIVE</div>
    
    {/* Left Sidebar */}
    <div style={{ width: '33.333%' }} className="bg-gray-800 text-white p-6">
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
    <div style={{ width: '66.666%' }} className="p-8">
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

  // Get template type string for PDF component
  const getTemplateType = (): 'classic' | 'modern' | 'creative' => {
    switch (currentTemplate) {
      case 1: return 'modern';
      case 2: return 'creative';
      default: return 'classic';
    }
  };

  // Generate PDF document based on selected template
  const getPDFDocument = () => {
    try {
      const commonStyles = {
        fontFamily: 'Times-Roman',
        fontSize: 11,
        paddingTop: 30,
        paddingLeft: 30,
        paddingRight: 30,
        paddingBottom: 30,
      };

      // Simplified PDF generation to avoid any style conflicts
      const basicDocument = (
        <Document>
          <Page size="A4" style={commonStyles}>
            {/* Header */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 24, fontFamily: 'Times-Bold', marginBottom: 10 }}>
                {basicInfo?.name || 'Your Name'}
              </Text>
              <Text style={{ fontSize: 10 }}>
                {basicInfo?.email || 'email@example.com'} • {basicInfo?.contact_no || 'Phone'} • {basicInfo?.location || 'Location'}
              </Text>
            </View>

            {/* About */}
            {basicInfo?.about && (
              <View style={{ marginBottom: 15 }}>
                <Text style={{ fontSize: 14, fontFamily: 'Times-Bold', marginBottom: 8 }}>
                  SUMMARY
                </Text>
                <Text style={{ fontSize: 11, lineHeight: 1.4 }}>
                  {basicInfo.about}
                </Text>
              </View>
            )}

            {/* Experience */}
            {experiences && experiences.length > 0 && (
              <View style={{ marginBottom: 15 }}>
                <Text style={{ fontSize: 14, fontFamily: 'Times-Bold', marginBottom: 8 }}>
                  EXPERIENCE
                </Text>
                {experiences.map((exp, index) => (
                  <View key={index} style={{ marginBottom: 10 }}>
                    <Text style={{ fontSize: 12, fontFamily: 'Times-Bold' }}>
                      {exp.position} - {exp.company}
                    </Text>
                    <Text style={{ fontSize: 10, marginBottom: 4 }}>
                      {new Date(exp.startDate).toLocaleDateString()} - {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'Present'}
                    </Text>
                    {exp.description && (
                      <Text style={{ fontSize: 11, lineHeight: 1.4 }}>
                        {exp.description}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Education */}
            {education && education.length > 0 && (
              <View style={{ marginBottom: 15 }}>
                <Text style={{ fontSize: 14, fontFamily: 'Times-Bold', marginBottom: 8 }}>
                  EDUCATION
                </Text>
                {education.map((edu, index) => (
                  <View key={index} style={{ marginBottom: 8 }}>
                    <Text style={{ fontSize: 12, fontFamily: 'Times-Bold' }}>
                      {edu.degree}
                    </Text>
                    <Text style={{ fontSize: 11 }}>
                      {edu.institution}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Projects */}
            {projects && projects.length > 0 && (
              <View style={{ marginBottom: 15 }}>
                <Text style={{ fontSize: 14, fontFamily: 'Times-Bold', marginBottom: 8 }}>
                  PROJECTS
                </Text>
                {projects.map((project, index) => (
                  <View key={index} style={{ marginBottom: 8 }}>
                    <Text style={{ fontSize: 12, fontFamily: 'Times-Bold' }}>
                      {project.title}
                    </Text>
                    <Text style={{ fontSize: 11, lineHeight: 1.4 }}>
                      {project.description}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Skills */}
            {skills && skills.length > 0 && (
              <View style={{ marginBottom: 15 }}>
                <Text style={{ fontSize: 14, fontFamily: 'Times-Bold', marginBottom: 8 }}>
                  SKILLS
                </Text>
                <Text style={{ fontSize: 11 }}>
                  {skills.map(skill => skill.name).join(', ')}
                </Text>
              </View>
            )}
          </Page>
        </Document>
      );

      return basicDocument;
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Return a simple fallback document
      return (
        <Document>
          <Page size="A4" style={{ fontFamily: 'Times-Roman', fontSize: 12, padding: 30 }}>
            <Text>Error generating PDF. Please try again.</Text>
          </Page>
        </Document>
      );
    }
  };  const nextTemplate = () => {
    setCurrentTemplate((prev) => (prev + 1) % templates.length);
  };

  const prevTemplate = () => {
    setCurrentTemplate((prev) => (prev - 1 + templates.length) % templates.length);
  };

  const CurrentComponent = templates[currentTemplate].component;

  console.log('Current template index:', currentTemplate);
  console.log('Current template name:', templates[currentTemplate].name);
  console.log('Basic info:', basicInfo);

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
          <PDFDownloadLink
            document={getPDFDocument()}
            fileName={`${basicInfo?.name?.replace(/\s+/g, '_') || 'resume'}_${getTemplateType()}_resume.pdf`}
          >
            {({ loading, error }) => {
              if (error) {
                console.error('PDF Error:', error);
                return (
                  <Button 
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600"
                    disabled
                  >
                    PDF Error
                  </Button>
                );
              }
              
              return (
                <Button 
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                      </svg>
                      Download PDF
                    </>
                  )}
                </Button>
              );
            }}
          </PDFDownloadLink>
        </div>
      </div>

      {/* Template Preview */}
      <div className="bg-gray-100 p-8 rounded-lg overflow-auto">
        <div className="w-full">
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
