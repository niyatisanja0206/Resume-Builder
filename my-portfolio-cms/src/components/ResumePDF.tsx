import { Button } from "@/components/ui/button";
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { Basic, Project, Experience, Skill, Education } from '@/types/portfolio';
import React from 'react';
import { useUserStats } from '@/hooks/useUserStats';

// Register standard fonts to ensure they are available in the PDF.
// This is critical for the PDF to render correctly.
Font.register({ family: 'Times-Roman', src: 'https://cdn.jsdelivr.net/npm/times-roman-font@1.0.0/dist/Times-Roman.ttf' });
Font.register({ family: 'Times-Bold', src: 'https://cdn.jsdelivr.net/npm/times-roman-font@1.0.0/dist/Times-Bold.ttf' });
Font.register({ family: 'Helvetica', src: 'https://cdn.jsdelivr.net/npm/react-pdf-font@1.0.0/fonts/Helvetica.ttf' });
Font.register({ family: 'Helvetica-Bold', src: 'https://cdn.jsdelivr.net/npm/react-pdf-font@1.0.0/fonts/Helvetica-Bold.ttf' });

interface ResumePDFProps {
  basicInfo: Basic | null;
  projects: Project[];
  experiences: Experience[];
  skills: Skill[];
  education: Education[];
  templateType: 'classic' | 'modern' | 'creative';
}

// Helper function to safely format dates
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

// Define styles for different templates
const classicStyles = StyleSheet.create({
  page: {
    fontFamily: 'Times-Roman',
    fontSize: 11,
    paddingTop: 56, // 20mm
    paddingLeft: 56, // 20mm  
    paddingRight: 56, // 20mm
    paddingBottom: 56, // 20mm
    backgroundColor: '#ffffff',
    lineHeight: 1.3,
  },
  section: {
    marginBottom: 11, // mb-4 equivalent
  },
  header: {
    marginBottom: 11,
    textAlign: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#9ca3af', // border-gray-400
  },
  name: {
    fontSize: 18, // text-2xl equivalent
    fontFamily: 'Times-Bold',
    marginBottom: 3,
  },
  contactInfo: {
    fontSize: 9, // text-xs equivalent
    marginBottom: 0,
    color: '#4b5563', // text-gray-600
  },
  contactContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  contactSeparator: {
    fontSize: 9,
    color: '#4b5563',
  },
  sectionTitle: {
    fontSize: 11, // text-base equivalent
    fontFamily: 'Times-Bold',
    marginBottom: 6,
    marginTop: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#9ca3af', // border-gray-400
    paddingBottom: 3,
  },
  text: {
    fontSize: 9, // text-xs equivalent
    lineHeight: 1.4,
    marginBottom: 3,
    color: '#374151', // text-gray-700
  },
  jobTitle: {
    fontSize: 10, // text-sm equivalent
    fontFamily: 'Times-Bold',
    marginBottom: 1,
  },
  company: {
    fontSize: 9, // text-xs equivalent
    fontFamily: 'Times-Bold',
    marginBottom: 1,
    color: '#374151', // text-gray-700
  },
  date: {
    fontSize: 9, // text-xs equivalent
    fontStyle: 'italic',
    marginBottom: 3,
    color: '#6b7280', // text-gray-500
  },
  experienceItem: {
    marginBottom: 8, // mb-3 equivalent
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
  },
  skill: {
    fontSize: 9, // text-xs equivalent
    backgroundColor: '#e5e7eb', // bg-gray-200
    color: '#6b7280', // text-gray-500
    padding: '1 6',
    marginRight: 3,
    marginBottom: 1,
    borderRadius: 10, // rounded-full
  },
});

const modernStyles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    paddingTop: 56, // 20mm
    paddingLeft: 56, // 20mm
    paddingRight: 56, // 20mm
    paddingBottom: 56, // 20mm
    backgroundColor: '#ffffff',
    lineHeight: 1.3,
  },
  section: {
    marginBottom: 11, // mb-4 equivalent
  },
  header: {
    marginBottom: 11,
    paddingBottom: 11,
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6', // border-blue-500
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  name: {
    fontSize: 22, // text-3xl equivalent but smaller for PDF
    fontFamily: 'Helvetica-Bold',
    marginBottom: 3,
    color: '#1d4ed8', // text-blue-700
  },
  subtitle: {
    fontSize: 11, // text-base equivalent
    color: '#3b82f6', // text-blue-500
    fontFamily: 'Helvetica-Bold',
  },
  contactInfo: {
    fontSize: 9, // text-xs equivalent
    marginBottom: 1,
    color: '#000000',
  },
  contactIcon: {
    marginRight: 4,
  },
  sectionTitle: {
    fontSize: 11, // text-base equivalent
    fontFamily: 'Helvetica-Bold',
    marginBottom: 6,
    marginTop: 0,
    color: '#1d4ed8', // text-blue-700
    textTransform: 'uppercase',
  },
  text: {
    fontSize: 9, // text-xs equivalent
    lineHeight: 1.4,
    marginBottom: 3,
    color: '#000000',
  },
  jobTitle: {
    fontSize: 10, // text-sm equivalent
    fontFamily: 'Helvetica-Bold',
    marginBottom: 1,
  },
  company: {
    fontSize: 9, // text-xs equivalent
    fontFamily: 'Helvetica-Bold',
    marginBottom: 1,
    color: '#2563eb', // text-blue-600
  },
  date: {
    fontSize: 9, // text-xs equivalent
    fontStyle: 'italic',
    marginBottom: 3,
    color: '#6b7280', // text-gray-500
  },
  experienceItem: {
    marginBottom: 8, // mb-3 equivalent
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
  },
  skill: {
    fontSize: 9, // text-xs equivalent
    backgroundColor: '#dbeafe', // bg-blue-100
    color: '#1e40af', // text-blue-800
    padding: '2 6',
    marginRight: 3,
    marginBottom: 1,
    borderRadius: 3,
  },
});

const creativeStyles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    paddingTop: 0,
    paddingLeft: 0,
    paddingRight: 0,
    paddingBottom: 0,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    lineHeight: 1.3,
  },
  leftColumn: {
    width: '35%',
    backgroundColor: '#dbeafe', // bg-blue-100
    padding: 20,
    minHeight: '100%',
  },
  rightColumn: {
    width: '65%',
    padding: 20,
  },
  section: {
    marginBottom: 11, // mb-4 equivalent (space-y-4)
  },
  header: {
    marginBottom: 15,
    textAlign: 'center',
  },
  name: {
    fontSize: 18, // text-2xl equivalent but smaller for PDF
    fontFamily: 'Helvetica-Bold',
    marginBottom: 6,
    color: '#1f2937', // text-gray-800
    textAlign: 'center',
  },
  contactInfo: {
    fontSize: 9, // text-xs equivalent
    marginBottom: 1,
    color: '#000000',
  },
  contactIcon: {
    marginRight: 4,
  },
  sectionTitle: {
    fontSize: 10, // text-sm equivalent
    fontFamily: 'Helvetica-Bold',
    marginBottom: 6,
    marginTop: 11,
    color: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db', // border-gray-300
    paddingBottom: 3,
  },
  sectionTitleRight: {
    fontSize: 11, // text-base equivalent
    fontFamily: 'Helvetica-Bold',
    marginBottom: 6,
    marginTop: 11,
    color: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db', // border-gray-300
    paddingBottom: 3,
  },
  text: {
    fontSize: 9, // text-xs equivalent
    lineHeight: 1.4,
    marginBottom: 3,
    color: '#000000',
  },
  jobTitle: {
    fontSize: 10, // text-sm equivalent
    fontFamily: 'Helvetica-Bold',
    marginBottom: 1,
    color: '#1e293b',
  },
  company: {
    fontSize: 9, // text-xs equivalent
    fontFamily: 'Helvetica-Bold',
    marginBottom: 1,
    color: '#475569',
  },
  date: {
    fontSize: 9, // text-xs equivalent
    fontStyle: 'italic',
    marginBottom: 3,
    color: '#64748b',
  },
  experienceItem: {
    marginBottom: 8, // mb-3 equivalent
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  skillsContainer: {
    flexDirection: 'column',
    gap: 1,
  },
  skill: {
    fontSize: 9, // text-xs equivalent
    backgroundColor: 'transparent',
    color: '#000000',
    marginBottom: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillIcon: {
    marginRight: 4,
  },
  educationItem: {
    marginBottom: 6,
  },
});

const MyDocument = React.memo(({ basicInfo, projects, experiences, skills, education, templateType }: ResumePDFProps) => {
  const ClassicTemplate = () => (
    <Document>
      <Page size="A4" style={classicStyles.page}>
        {/* Header */}
        <View style={classicStyles.header}>
          <Text style={classicStyles.name}>{basicInfo?.name || 'Your Name'}</Text>
          <View style={classicStyles.contactContainer}>
            <Text style={classicStyles.contactInfo}>{basicInfo?.contact_no || 'Phone Number'}</Text>
            <Text style={classicStyles.contactSeparator}>|</Text>
            <Text style={classicStyles.contactInfo}>{basicInfo?.email || 'email@example.com'}</Text>
            <Text style={classicStyles.contactSeparator}>|</Text>
            <Text style={classicStyles.contactInfo}>{basicInfo?.location || 'Location'}</Text>
          </View>
        </View>

        {/* Profile/About */}
        {basicInfo?.about && (
          <View style={classicStyles.section}>
            <Text style={classicStyles.sectionTitle}>PROFILE</Text>
            <Text style={classicStyles.text}>{basicInfo.about}</Text>
          </View>
        )}

        {/* Work Experience */}
        {experiences && experiences.length > 0 && (
          <View style={classicStyles.section}>
            <Text style={classicStyles.sectionTitle}>WORK EXPERIENCE</Text>
            {experiences.map((exp, index) => (
              <View key={exp.id || index} style={classicStyles.experienceItem}>
                <View style={classicStyles.jobHeader}>
                  <Text style={classicStyles.jobTitle}>{exp?.position || 'Position'}</Text>
                  <Text style={classicStyles.date}>
                    {formatDate(exp?.startDate)} - {formatDate(exp?.endDate) || 'Present'}
                  </Text>
                </View>
                <Text style={classicStyles.company}>{exp?.company || 'Company'}</Text>
                {exp?.description && <Text style={classicStyles.text}>{exp.description}</Text>}
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <View style={classicStyles.section}>
            <Text style={classicStyles.sectionTitle}>EDUCATION</Text>
            {education.map((edu, index) => (
              <View key={index} style={classicStyles.experienceItem}>
                <View style={classicStyles.jobHeader}>
                  <Text style={classicStyles.jobTitle}>{edu.degree}</Text>
                  <Text style={classicStyles.date}>
                    {formatDate(edu.startDate)} - {formatDate(edu.endDate) || 'Present'}
                  </Text>
                </View>
                <Text style={classicStyles.company}>{edu.institution}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <View style={classicStyles.section}>
            <Text style={classicStyles.sectionTitle}>PROJECTS</Text>
            {projects.map((project, index) => (
              <View key={index} style={classicStyles.experienceItem}>
                <Text style={classicStyles.jobTitle}>{project.title}</Text>
                <Text style={classicStyles.text}>{project.description}</Text>
                {project.techStack && project.techStack.length > 0 && (
                  <View style={classicStyles.skillsContainer}>
                    {project.techStack.map((tech, techIndex) => (
                      <Text key={techIndex} style={classicStyles.skill}>
                        {tech}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {skills && skills.length > 0 && (
          <View style={classicStyles.section}>
            <Text style={classicStyles.sectionTitle}>SKILLS</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {skills.map((skill, index) => (
                <Text key={index} style={{
                  fontSize: 9,
                  marginRight: 8,
                  marginBottom: 2,
                  color: '#374151'
                }}>
                  • {skill.name} ({skill.level})
                </Text>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );

  const CreativeTemplate = () => (
    <Document>
      <Page size="A4" style={creativeStyles.page}>
        {/* Left Column */}
        <View style={creativeStyles.leftColumn}>
          {/* Name in Left Column */}
          <View style={creativeStyles.header}>
            <Text style={creativeStyles.name}>{basicInfo?.name || 'Your Name'}</Text>
          </View>

          {/* Contact Info */}
          <View style={creativeStyles.section}>
            <Text style={creativeStyles.sectionTitle}>CONTACT</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
              <Text style={{ fontSize: 9, marginRight: 6, color: '#6b7280' }}>@</Text>
              <Text style={creativeStyles.contactInfo}>{basicInfo?.email || 'email@example.com'}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
              <Text style={{ fontSize: 9, marginRight: 6, color: '#6b7280' }}>📞</Text>
              <Text style={creativeStyles.contactInfo}>{basicInfo?.contact_no || 'Phone Number'}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
              <Text style={{ fontSize: 9, marginRight: 6, color: '#6b7280' }}>📍</Text>
              <Text style={creativeStyles.contactInfo}>{basicInfo?.location || 'Location'}</Text>
            </View>
          </View>

          {/* Skills */}
          {skills && skills.length > 0 && (
            <View style={creativeStyles.section}>
              <Text style={creativeStyles.sectionTitle}>SKILLS</Text>
              <View style={creativeStyles.skillsContainer}>
                {skills.map((skill, index) => (
                  <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                    <Text style={{ fontSize: 8, marginRight: 6, color: '#10b981' }}>✓</Text>
                    <Text style={{ fontSize: 9, color: '#000000' }}>
                      {skill.name} : <Text style={{ color: '#6b7280' }}>{skill.level || 'Unknown'}</Text>
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Education */}
          {education && education.length > 0 && (
            <View style={creativeStyles.section}>
              <Text style={creativeStyles.sectionTitle}>EDUCATION</Text>
              {education.map((edu, index) => (
                <View key={index} style={creativeStyles.educationItem}>
                  <Text style={creativeStyles.jobTitle}>{edu.degree}</Text>
                  <Text style={creativeStyles.text}>{edu.institution}</Text>
                  <Text style={creativeStyles.date}>
                    {formatDate(edu.startDate)} - {formatDate(edu.endDate) || 'Present'}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Right Column */}
        <View style={creativeStyles.rightColumn}>
          {/* Profile */}
          {basicInfo?.about && (
            <View style={creativeStyles.section}>
              <Text style={creativeStyles.sectionTitleRight}>PROFILE</Text>
              <Text style={creativeStyles.text}>{basicInfo.about}</Text>
            </View>
          )}

          {/* Work Experience */}
          {experiences && experiences.length > 0 && (
            <View style={creativeStyles.section}>
              <Text style={creativeStyles.sectionTitleRight}>WORK EXPERIENCE</Text>
              {experiences.map((exp, index) => (
                <View key={index} style={creativeStyles.experienceItem}>
                  <View style={creativeStyles.jobHeader}>
                    <Text style={creativeStyles.jobTitle}>{exp.position}</Text>
                    <Text style={creativeStyles.date}>
                      {formatDate(exp.startDate)} - {formatDate(exp.endDate) || 'Present'}
                    </Text>
                  </View>
                  <Text style={creativeStyles.company}>{exp.company}</Text>
                  {exp.description && <Text style={creativeStyles.text}>{exp.description}</Text>}
                </View>
              ))}
            </View>
          )}

          {/* Projects */}
          {projects && projects.length > 0 && (
            <View style={creativeStyles.section}>
              <Text style={creativeStyles.sectionTitleRight}>PROJECTS</Text>
              {projects.map((project, index) => (
                <View key={index} style={creativeStyles.experienceItem}>
                  <Text style={creativeStyles.jobTitle}>{project.title}</Text>
                  <Text style={creativeStyles.text}>{project.description}</Text>
                  {project.techStack && project.techStack.length > 0 && (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 3 }}>
                      {project.techStack.map((tech, techIndex) => (
                        <Text key={techIndex} style={{
                          fontSize: 8,
                          backgroundColor: '#e5e7eb',
                          color: '#6b7280',
                          padding: '1 4',
                          marginRight: 3,
                          marginBottom: 1,
                          borderRadius: 8,
                        }}>
                          {tech}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </Page>
    </Document>
  );

  const ModernTemplate = () => (
    <Document>
      <Page size="A4" style={modernStyles.page}>
        {/* Header */}
        <View style={modernStyles.header}>
          <View style={modernStyles.headerLeft}>
            <Text style={modernStyles.name}>{basicInfo?.name || 'Your Name'}</Text>
            <Text style={modernStyles.subtitle}>{basicInfo?.about || 'Professional Title'}</Text>
          </View>
          <View style={modernStyles.headerRight}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 1 }}>
              <Text style={modernStyles.contactInfo}>{basicInfo?.contact_no || 'Phone Number'}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 1 }}>
              <Text style={modernStyles.contactInfo}>{basicInfo?.email || 'email@example.com'}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 1 }}>
              <Text style={modernStyles.contactInfo}>{basicInfo?.email || 'email@example.com'}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 1 }}>
              <Text style={modernStyles.contactInfo}>{basicInfo?.location || 'Location'}</Text>
            </View>
          </View>
        </View>

        {/* Summary - Only show if different from subtitle */}
        {basicInfo?.about && (
          <View style={modernStyles.section}>
            <Text style={modernStyles.sectionTitle}>SUMMARY</Text>
            <Text style={modernStyles.text}>{basicInfo.about}</Text>
          </View>
        )}

        {/* Experience */}
        {experiences && experiences.length > 0 && (
          <View style={modernStyles.section}>
            <Text style={modernStyles.sectionTitle}>EXPERIENCE</Text>
            {experiences.map((exp, index) => (
              <View key={exp.id || index} style={modernStyles.experienceItem}>
                <View style={modernStyles.jobHeader}>
                  <Text style={modernStyles.jobTitle}>{exp?.position || 'Position'}</Text>
                  <Text style={modernStyles.date}>
                    {formatDate(exp?.startDate)} - {formatDate(exp?.endDate) || 'Present'}
                  </Text>
                </View>
                <Text style={modernStyles.company}>{exp?.company || 'Company'}</Text>
                {exp?.description && <Text style={modernStyles.text}>{exp.description}</Text>}
              </View>
            ))}
          </View>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <View style={modernStyles.section}>
            <Text style={modernStyles.sectionTitle}>PROJECTS</Text>
            {projects.map((project, index) => (
              <View key={index} style={modernStyles.experienceItem}>
                <Text style={modernStyles.jobTitle}>{project.title}</Text>
                <Text style={modernStyles.text}>{project.description}</Text>
                {project.techStack && project.techStack.length > 0 && (
                  <View style={modernStyles.skillsContainer}>
                    {project.techStack.map((tech, techIndex) => (
                      <Text key={techIndex} style={modernStyles.skill}>
                        {tech}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <View style={modernStyles.section}>
            <Text style={modernStyles.sectionTitle}>EDUCATION</Text>
            {education.map((edu, index) => (
              <View key={edu.id || index} style={modernStyles.experienceItem}>
                <View style={modernStyles.jobHeader}>
                  <Text style={modernStyles.jobTitle}>{edu?.degree || 'Degree'}</Text>
                  <Text style={modernStyles.date}>
                    {formatDate(edu?.startDate)} - {formatDate(edu?.endDate) || 'Present'}
                  </Text>
                </View>
                <Text style={modernStyles.company}>{edu?.institution || 'Institution'}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {skills && skills.length > 0 && (
          <View style={modernStyles.section}>
            <Text style={modernStyles.sectionTitle}>SKILLS</Text>
            <View style={modernStyles.skillsContainer}>
              {skills.map((skill, index) => (
                <Text key={index} style={modernStyles.skill}>
                  {skill.name} : <Text style={{ color: '#6b7280' }}>{skill.level || 'Unknown'}</Text>
                </Text>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );

  switch (templateType) {
    case 'modern':
      return <ModernTemplate />;
    case 'creative':
      return <CreativeTemplate />;
    case 'classic':
    default:
      return <ClassicTemplate />;
  }
});

export default function ResumePDF({ basicInfo, projects, experiences, skills, education, templateType }: ResumePDFProps) {
  const { incrementDownloadCount } = useUserStats();
  
  const getFileName = () => {
    const name = basicInfo?.name?.replace(/\s+/g, '_') || 'resume';
    return `${name}_${templateType}_resume.pdf`;
  };

  const handleDownloadClick = async () => {
    try {
      await incrementDownloadCount();
      console.log('Download count incremented successfully');
    } catch (error) {
      console.error('Failed to increment download count:', error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          PDF Download
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          Download your resume as a professionally formatted PDF using React-PDF. 
          Perfect layout with A4 size formatting.
        </p>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded">
          <span>Format: A4 Portrait ({templateType})</span>
          <span>Quality: Vector-based PDF</span>
        </div>
        
        {/* The key is crucial here to force a re-render of the document when the template changes */}
        <PDFDownloadLink
          key={`resume-pdf-${templateType}`}
          document={<MyDocument {...{ templateType, basicInfo, projects, experiences, skills, education }} />}
          fileName={getFileName()}
          className="w-full"
        >
          {({ loading, error }) => (
            <Button 
              className="w-full font-medium" 
              disabled={loading || !!error}
              onClick={handleDownloadClick}
            >
              {error ? (
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Error generating PDF
                </div>
              ) : loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating PDF...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download {templateType.charAt(0).toUpperCase() + templateType.slice(1)} Resume PDF
                </div>
              )}
            </Button>
          )}
        </PDFDownloadLink>
      </div>
      
      <div className="mt-4 text-xs text-gray-500 space-y-1">
        <p className="flex items-center">
          <svg className="w-3 h-3 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
          </svg>
          Vector-based PDF with crisp text
        </p>
        <p className="flex items-center">
          <svg className="w-3 h-3 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
          </svg>
          Professional {templateType === 'classic' ? 'Times Roman' : 'Helvetica'} font
        </p>
        <p className="flex items-center">
          <svg className="w-3 h-3 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
          </svg>
          A4 size formatting
        </p>
        <p className="flex items-center">
          <svg className="w-3 h-3 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
          </svg>
          ATS-friendly format
        </p>
      </div>
    </div>
  );
}
