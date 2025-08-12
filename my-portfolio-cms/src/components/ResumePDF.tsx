import { Button } from "@/components/ui/button";
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { useUserStats } from "@/hooks/useUserStats";
import type { Basic, Project, Experience, Skill, Education } from '@/types/portfolio';

interface ResumePDFProps {
  basicInfo: Basic | null;
  projects: Project[];
  experiences: Experience[];
  skills: Skill[];
  education: Education[];
  templateType?: 'classic' | 'modern' | 'creative' | 'original';
}

// Define styles for different templates
const classicStyles = StyleSheet.create({
  page: {
    fontFamily: 'Times-Roman',
    fontSize: 11,
    paddingTop: 30,
    paddingLeft: 30,
    paddingRight: 30,
    paddingBottom: 30,
    backgroundColor: '#ffffff',
  },
  section: {
    marginBottom: 10,
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  contactInfo: {
    fontSize: 10,
    marginBottom: 3,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 2,
  },
  text: {
    fontSize: 11,
    lineHeight: 1.4,
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  company: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  date: {
    fontSize: 10,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  skill: {
    fontSize: 10,
    backgroundColor: '#f0f0f0',
    padding: '2 6',
    marginRight: 5,
    marginBottom: 3,
  },

  
});

const modernStyles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 40,
    paddingLeft: 40,
    paddingRight: 40,
    paddingBottom: 40,
    backgroundColor: '#ffffff',
  },
  section: {
    marginBottom: 15,
  },
  header: {
    marginBottom: 25,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1e40af',
  },
  contactInfo: {
    fontSize: 9,
    marginBottom: 2,
    color: '#4b5563',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 18,
    color: '#1e40af',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  text: {
    fontSize: 10,
    lineHeight: 1.5,
    marginBottom: 5,
    color: '#374151',
  },
  jobTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 3,
    color: '#1f2937',
  },
  company: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 3,
    color: '#4b5563',
  },
  date: {
    fontSize: 9,
    fontStyle: 'italic',
    marginBottom: 5,
    color: '#6b7280',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skill: {
    fontSize: 9,
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    padding: '3 8',
    marginRight: 6,
    marginBottom: 4,
    borderRadius: 3,
  },
});

const creativeStyles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    paddingTop: 30,
    paddingLeft: 30,
    paddingRight: 30,
    paddingBottom: 30,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
  },
  leftColumn: {
    width: '35%',
    backgroundColor: '#f8fafc',
    padding: 20,
    marginRight: 15,
  },
  rightColumn: {
    width: '65%',
    padding: 20,
  },
  section: {
    marginBottom: 12,
  },
  header: {
    marginBottom: 20,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#0f172a',
  },
  contactInfo: {
    fontSize: 9,
    marginBottom: 3,
    color: '#475569',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 15,
    color: '#0f172a',
    backgroundColor: '#e2e8f0',
    padding: 4,
  },
  text: {
    fontSize: 10,
    lineHeight: 1.4,
    marginBottom: 4,
    color: '#334155',
  },
  jobTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#1e293b',
  },
  company: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#475569',
  },
  date: {
    fontSize: 9,
    fontStyle: 'italic',
    marginBottom: 4,
    color: '#64748b',
  },
  skillsContainer: {
    flexDirection: 'column',
    gap: 3,
  },
  skill: {
    fontSize: 9,
    backgroundColor: '#334155',
    color: '#ffffff',
    padding: '2 6',
    marginBottom: 2,
    textAlign: 'center',
  },
});

export default function ResumePDF({ basicInfo, projects, experiences, skills, education, templateType = 'classic' }: ResumePDFProps) {
  const { incrementDownloadCount } = useUserStats();
  
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

  // Classic Template
  const ClassicTemplate = () => (
    <Document>
      <Page size="A4" style={classicStyles.page}>
        {/* Header */}
        <View style={classicStyles.header}>
          <Text style={classicStyles.name}>{basicInfo?.name || 'Your Name'}</Text>
          <Text style={classicStyles.contactInfo}>{basicInfo?.email || 'email@example.com'}</Text>
          <Text style={classicStyles.contactInfo}>{basicInfo?.contact_no || 'Phone Number'}</Text>
          <Text style={classicStyles.contactInfo}>{basicInfo?.location || 'Location'}</Text>
        </View>

        {/* About */}
        {basicInfo?.about && (
          <View style={classicStyles.section}>
            <Text style={classicStyles.sectionTitle}>SUMMARY</Text>
            <Text style={classicStyles.text}>{basicInfo.about}</Text>
          </View>
        )}

        {/* Experience */}
        {experiences && experiences.length > 0 && (
          <View style={classicStyles.section}>
            <Text style={classicStyles.sectionTitle}>WORK EXPERIENCE</Text>
            {experiences.map((exp, index) => (
              <View key={index} style={{ marginBottom: 8 }}>
                <Text style={classicStyles.jobTitle}>{exp.position}</Text>
                <Text style={classicStyles.company}>{exp.company}</Text>
                <Text style={classicStyles.date}>
                  {exp.startDate ? new Date(exp.startDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short' 
                  }) : ''} - {exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short' 
                  }) : 'Present'}
                </Text>
                {exp.description && <Text style={classicStyles.text}>{exp.description}</Text>}
                {exp.skillsLearned && exp.skillsLearned.length > 0 && (
                  <Text style={classicStyles.text}>Skills: {exp.skillsLearned.join(', ')}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <View style={classicStyles.section}>
            <Text style={classicStyles.sectionTitle}>EDUCATION</Text>
            {education.map((edu, index) => (
              <View key={index} style={{ marginBottom: 8 }}>
                <Text style={classicStyles.company}>{edu.degree}</Text>
                <Text style={classicStyles.text}>{edu.institution}</Text>
                <Text style={classicStyles.date}>
                  {formatDate(edu.startDate)} - {formatDate(edu.endDate) || 'Present'}
                </Text>
                {edu.Grade && <Text style={classicStyles.text}>Grade: {edu.Grade}</Text>}
              </View>
            ))}
          </View>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <View style={classicStyles.section}>
            <Text style={classicStyles.sectionTitle}>PROJECTS</Text>
            {projects.map((project, index) => (
              <View key={index} style={{ marginBottom: 8 }}>
                <Text style={classicStyles.jobTitle}>{project.title}</Text>
                <Text style={classicStyles.text}>{project.description}</Text>
                {project.techStack && project.techStack.length > 0 && (
                  <Text style={classicStyles.text}>Technologies: {project.techStack.join(', ')}</Text>
                )}
                {project.link && <Text style={classicStyles.text}>Link: {project.link}</Text>}
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {skills && skills.length > 0 && (
          <View style={classicStyles.section}>
            <Text style={classicStyles.sectionTitle}>SKILLS</Text>
            <View style={classicStyles.skillsContainer}>
              {skills.map((skill, index) => (
                <Text key={index} style={classicStyles.skill}>
                  {skill.name} ({skill.level})
                </Text>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );

  // Creative Template (Two-column layout)
  const CreativeTemplate = () => (
    <Document>
      <Page size="A4" style={creativeStyles.page}>
        {/* Left Column */}
        <View style={creativeStyles.leftColumn}>
          {/* Contact Info */}
          <View style={creativeStyles.section}>
            <Text style={creativeStyles.sectionTitle}>CONTACT</Text>
            <Text style={creativeStyles.contactInfo}>{basicInfo?.email || 'email@example.com'}</Text>
            <Text style={creativeStyles.contactInfo}>{basicInfo?.contact_no || 'Phone Number'}</Text>
            <Text style={creativeStyles.contactInfo}>{basicInfo?.location || 'Location'}</Text>
          </View>

          {/* Skills */}
          {skills && skills.length > 0 && (
            <View style={creativeStyles.section}>
              <Text style={creativeStyles.sectionTitle}>SKILLS</Text>
              <View style={creativeStyles.skillsContainer}>
                {skills.map((skill, index) => (
                  <Text key={index} style={creativeStyles.skill}>
                    {skill.name}
                  </Text>
                ))}
              </View>
            </View>
          )}

          {/* Education */}
          {education && education.length > 0 && (
            <View style={creativeStyles.section}>
              <Text style={creativeStyles.sectionTitle}>EDUCATION</Text>
              {education.map((edu, index) => (
                <View key={index} style={{ marginBottom: 8 }}>
                  <Text style={creativeStyles.company}>{edu.degree}</Text>
                  <Text style={creativeStyles.text}>{edu.institution}</Text>
                  <Text style={creativeStyles.date}>
                    {edu.startDate ? new Date(edu.startDate).getFullYear() : ''} - {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Right Column */}
        <View style={creativeStyles.rightColumn}>
          {/* Header */}
          <View style={creativeStyles.header}>
            <Text style={creativeStyles.name}>{basicInfo?.name || 'Your Name'}</Text>
          </View>

          {/* About */}
          {basicInfo?.about && (
            <View style={creativeStyles.section}>
              <Text style={creativeStyles.sectionTitle}>SUMMARY</Text>
              <Text style={creativeStyles.text}>{basicInfo.about}</Text>
            </View>
          )}

          {/* Experience */}
          {experiences && experiences.length > 0 && (
            <View style={creativeStyles.section}>
              <Text style={creativeStyles.sectionTitle}>EXPERIENCE</Text>
              {experiences.map((exp, index) => (
                <View key={index} style={{ marginBottom: 10 }}>
                  <Text style={creativeStyles.jobTitle}>{exp.position}</Text>
                  <Text style={creativeStyles.company}>{exp.company}</Text>
                  <Text style={creativeStyles.date}>
                    {formatDate(exp.startDate)} - {formatDate(exp.endDate) || 'Present'}
                  </Text>
                  {exp.description && <Text style={creativeStyles.text}>{exp.description}</Text>}
                </View>
              ))}
            </View>
          )}

          {/* Projects */}
          {projects && projects.length > 0 && (
            <View style={creativeStyles.section}>
              <Text style={creativeStyles.sectionTitle}>PROJECTS</Text>
              {projects.map((project, index) => (
                <View key={index} style={{ marginBottom: 8 }}>
                  <Text style={creativeStyles.jobTitle}>{project.title}</Text>
                  <Text style={creativeStyles.text}>{project.description}</Text>
                  {project.techStack && project.techStack.length > 0 && (
                    <Text style={creativeStyles.text}>Tech: {project.techStack.join(', ')}</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </Page>
    </Document>
  );

  // Modern Template
  const ModernTemplate = () => (
    <Document>
      <Page size="A4" style={modernStyles.page}>
        {/* Header */}
        <View style={modernStyles.header}>
          <Text style={modernStyles.name}>{basicInfo?.name || 'Your Name'}</Text>
          <Text style={modernStyles.contactInfo}>{basicInfo?.email || 'email@example.com'}</Text>
          <Text style={modernStyles.contactInfo}>{basicInfo?.contact_no || 'Phone Number'}</Text>
          <Text style={modernStyles.contactInfo}>{basicInfo?.location || 'Location'}</Text>
        </View>

        {/* About */}
        {basicInfo?.about && (
          <View style={modernStyles.section}>
            <Text style={modernStyles.sectionTitle}>PROFESSIONAL SUMMARY</Text>
            <Text style={modernStyles.text}>{basicInfo.about}</Text>
          </View>
        )}

        {/* Experience */}
        {experiences && experiences.length > 0 && (
          <View style={modernStyles.section}>
            <Text style={modernStyles.sectionTitle}>WORK EXPERIENCE</Text>
            {experiences.map((exp, index) => (
              <View key={index} style={{ marginBottom: 12 }}>
                <Text style={modernStyles.jobTitle}>{exp.position}</Text>
                <Text style={modernStyles.company}>{exp.company}</Text>
                <Text style={modernStyles.date}>
                  {formatDate(exp.startDate)} - {formatDate(exp.endDate) || 'Present'}
                </Text>
                {exp.description && <Text style={modernStyles.text}>{exp.description}</Text>}
                {exp.skillsLearned && exp.skillsLearned.length > 0 && (
                  <Text style={modernStyles.text}>Skills: {exp.skillsLearned.join(', ')}</Text>
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
              <View key={index} style={{ marginBottom: 10 }}>
                <Text style={modernStyles.company}>{edu.degree}</Text>
                <Text style={modernStyles.text}>{edu.institution}</Text>
                <Text style={modernStyles.date}>
                  {formatDate(edu.startDate)} - {formatDate(edu.endDate) || 'Present'}
                </Text>
                {edu.Grade && <Text style={modernStyles.text}>Grade: {edu.Grade}</Text>}
              </View>
            ))}
          </View>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <View style={modernStyles.section}>
            <Text style={modernStyles.sectionTitle}>PROJECTS</Text>
            {projects.map((project, index) => (
              <View key={index} style={{ marginBottom: 10 }}>
                <Text style={modernStyles.jobTitle}>{project.title}</Text>
                <Text style={modernStyles.text}>{project.description}</Text>
                {project.techStack && project.techStack.length > 0 && (
                  <Text style={modernStyles.text}>Technologies: {project.techStack.join(', ')}</Text>
                )}
                {project.link && <Text style={modernStyles.text}>Link: {project.link}</Text>}
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {skills && skills.length > 0 && (
          <View style={modernStyles.section}>
            <Text style={modernStyles.sectionTitle}>TECHNICAL SKILLS</Text>
            <View style={modernStyles.skillsContainer}>
              {skills.map((skill, index) => (
                <Text key={index} style={modernStyles.skill}>
                  {skill.name}
                </Text>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );

  const MyDocument = () => {
    try {
      switch (templateType) {
        case 'modern':
          return <ModernTemplate />;
        case 'creative':
          return <CreativeTemplate />;
        case 'classic':
          return <ClassicTemplate />;
        default:
          return <ClassicTemplate />;
      }
    } catch (error) {
      console.error('Error creating PDF document:', error);
      // Return a simple fallback document
      return (
        <Document>
          <Page size="A4" style={classicStyles.page}>
            <View style={classicStyles.header}>
              <Text style={classicStyles.name}>Error generating resume</Text>
              <Text style={classicStyles.contactInfo}>Please check your data and try again</Text>
            </View>
          </Page>
        </Document>
      );
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
        
        <PDFDownloadLink
          document={<MyDocument />}
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