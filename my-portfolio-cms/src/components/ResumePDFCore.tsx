import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { Basic, Project, Experience, Skill, Education } from '@/types/portfolio';
import { Button } from "@/components/ui/button";

// --- PROPS INTERFACE ---
interface ResumePDFCoreProps {
  basicInfo: Basic | null;
  projects: Project[];
  experiences: Experience[];
  skills: Skill[];
  education: Education[];
  templateType: 'classic' | 'modern' | 'creative';
}

// --- HELPER FUNCTIONS ---
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

// Fallback data for when props are missing
const getValidBasicInfo = (basicInfo: Basic | null) => {
  return basicInfo || {
    name: 'Your Name',
    email: 'email@example.com',
    contact_no: '+1-234-567-8900',
    location: 'Your Location',
    about: 'Professional summary goes here.'
  };
};

// --- STYLESHEETS ---

// Classic Template Styles
const classicStyles = StyleSheet.create({
  page: { 
    fontFamily: 'Times-Roman', 
    fontSize: 10, 
    padding: 40, 
    backgroundColor: '#ffffff', 
    color: '#2d2d2d' 
  },
  header: { 
    textAlign: 'center', 
    marginBottom: 20 
  },
  name: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 5,
    letterSpacing: 1
  },
  contactInfo: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    fontSize: 9, 
    color: '#555'
  },
  contactItem: { 
    marginHorizontal: 8 
  },
  section: { 
    marginBottom: 15 
  },
  sectionTitle: { 
    fontSize: 12, 
    fontWeight: 'bold', 
    textTransform: 'uppercase', 
    borderBottomWidth: 1.5, 
    borderBottomColor: '#333', 
    paddingBottom: 2, 
    marginBottom: 8
  },
  entry: { 
    marginBottom: 10 
  },
  entryHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: 2 
  },
  title: { 
    fontSize: 11, 
    fontWeight: 'bold' 
  },
  subtitle: { 
    fontSize: 10, 
    fontStyle: 'italic', 
    marginBottom: 3 
  },
  date: { 
    fontSize: 9, 
    color: '#555' 
  },
  description: { 
    fontSize: 9, 
    lineHeight: 1.4
  },
  bulletList: { 
    marginTop: 4, 
    paddingLeft: 10 
  },
  bullet: { 
    flexDirection: 'row', 
    marginBottom: 2 
  },
  bulletText: { 
    fontSize: 9, 
    lineHeight: 1.4, 
    flex: 1 
  },
  skills: { 
    fontSize: 10 
  }
});

// Modern Template Styles
const modernStyles = StyleSheet.create({
  page: { 
    fontFamily: 'Helvetica', 
    fontSize: 9, 
    backgroundColor: '#FEF6FA', 
    padding: 20 
  },
  container: { 
    backgroundColor: '#ffffff', 
    flex: 1, 
    borderRadius: 8, 
    padding: 30 
  },
  header: { 
    textAlign: 'center', 
    marginBottom: 20 
  },
  name: { 
    fontSize: 28, 
    fontWeight: 700, 
    color: '#333' 
  },
  jobTitle: { 
    fontSize: 14, 
    color: '#555', 
    marginTop: 2 
  },
  contactInfo: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 10, 
    fontSize: 8, 
    color: '#666' 
  },
  contactItem: { 
    marginHorizontal: 8 
  },
  section: { 
    marginBottom: 12 
  },
  sectionTitle: { 
    fontSize: 11, 
    fontWeight: 600, 
    textTransform: 'uppercase', 
    color: '#d16ba5',
    backgroundColor: '#f3f4f6',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginBottom: 8
  },
  entry: { 
    marginBottom: 8 
  },
  entryHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  title: { 
    fontSize: 10, 
    fontWeight: 600, 
    color: '#d16ba5' 
  },
  subtitle: { 
    fontSize: 10, 
    fontWeight: 700, 
    color: '#333' 
  },
  date: { 
    fontSize: 8, 
    color: '#777' 
  },
  description: { 
    fontSize: 9, 
    color: '#555', 
    marginTop: 2, 
    lineHeight: 1.4 
  },
  skills: { 
    fontSize: 9, 
    color: '#555' 
  }
});

// Creative Template Styles
const creativeStyles = StyleSheet.create({
  page: { 
    flexDirection: 'row', 
    fontFamily: 'Helvetica', 
    backgroundColor: '#ffffff' 
  },
  leftColumn: { 
    width: '35%', 
    backgroundColor: '#1A4331', 
    padding: 30, 
    color: 'white' 
  },
  rightColumn: { 
    width: '65%', 
    padding: 30, 
    color: '#333' 
  },
  name: { 
    fontSize: 24, 
    fontWeight: 700, 
    marginBottom: 4 
  },
  jobTitle: { 
    fontSize: 12, 
    marginBottom: 15 
  },
  contactItem: { 
    fontSize: 8, 
    marginBottom: 4 
  },
  leftSection: { 
    marginBottom: 15 
  },
  leftSectionTitle: { 
    fontSize: 12, 
    fontWeight: 600, 
    borderBottomWidth: 1, 
    borderBottomColor: '#5a7e70', 
    paddingBottom: 2, 
    marginBottom: 6 
  },
  profileText: { 
    fontSize: 8.5, 
    lineHeight: 1.5, 
    color: '#f0f0f0' 
  },
  rightSection: { 
    marginBottom: 15 
  },
  rightSectionTitle: { 
    fontSize: 16, 
    fontWeight: 700, 
    color: '#1A4331', 
    borderBottomWidth: 1.5, 
    borderBottomColor: '#e0e0e0', 
    paddingBottom: 2, 
    marginBottom: 8 
  },
  expEntry: { 
    marginBottom: 10 
  },
  position: { 
    fontSize: 11, 
    fontWeight: 600 
  },
  company: { 
    fontSize: 10, 
    fontWeight: 600, 
    color: '#555', 
    marginBottom: 3 
  },
  expDescription: { 
    fontSize: 9, 
    lineHeight: 1.4 
  },
  skillItem: { 
    fontSize: 9, 
    marginBottom: 3 
  }
});

// --- PDF DOCUMENT COMPONENT ---
const SimpleDocument = ({ basicInfo, projects, experiences, skills, education, templateType }: ResumePDFCoreProps) => {
  const validBasicInfo = getValidBasicInfo(basicInfo);

  // Render Classic Template
  const renderClassicTemplate = () => (
    <Page size="A4" style={classicStyles.page}>
      {/* Header */}
      <View style={classicStyles.header}>
        <Text style={classicStyles.name}>{validBasicInfo.name}</Text>
        <View style={classicStyles.contactInfo}>
          <Text style={classicStyles.contactItem}>{validBasicInfo.location}</Text>
          <Text>•</Text>
          <Text style={classicStyles.contactItem}>{validBasicInfo.email}</Text>
          <Text>•</Text>
          <Text style={classicStyles.contactItem}>{validBasicInfo.contact_no}</Text>
        </View>
      </View>

      {/* About Section */}
      {validBasicInfo.about && (
        <View style={classicStyles.section}>
          <Text style={classicStyles.sectionTitle}>Professional Summary</Text>
          <Text style={classicStyles.description}>{validBasicInfo.about}</Text>
        </View>
      )}

      {/* Education Section */}
      {education && education.length > 0 && (
        <View style={classicStyles.section}>
          <Text style={classicStyles.sectionTitle}>Education</Text>
          {education.map((edu, i) => (
            <View key={i} style={classicStyles.entry}>
              <View style={classicStyles.entryHeader}>
                <Text style={classicStyles.title}>{edu.institution}</Text>
                <Text style={classicStyles.date}>{formatDate(edu.endDate)}</Text>
              </View>
              <Text style={classicStyles.subtitle}>{edu.degree}</Text>
              {edu.Grade && <Text style={classicStyles.description}>{edu.Grade}</Text>}
            </View>
          ))}
        </View>
      )}

      {/* Experience Section */}
      {experiences && experiences.length > 0 && (
        <View style={classicStyles.section}>
          <Text style={classicStyles.sectionTitle}>Professional Experience</Text>
          {experiences.map((exp, i) => (
            <View key={i} style={classicStyles.entry}>
              <View style={classicStyles.entryHeader}>
                <Text style={classicStyles.title}>{exp.company}</Text>
                <Text style={classicStyles.date}>{formatDate(exp.startDate)} - {formatDate(exp.endDate)}</Text>
              </View>
              <Text style={classicStyles.subtitle}>{exp.position}</Text>
              {exp.description && <Text style={classicStyles.description}>{exp.description}</Text>}
              {exp.skillsLearned && exp.skillsLearned.length > 0 && (
                <View style={classicStyles.bulletList}>
                  {exp.skillsLearned.map((skill, j) => (
                    <View key={j} style={classicStyles.bullet}>
                      <Text> • </Text>
                      <Text style={classicStyles.bulletText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Projects Section */}
      {projects && projects.length > 0 && (
        <View style={classicStyles.section}>
          <Text style={classicStyles.sectionTitle}>Additional</Text>
          {projects.map((project, i) => (
            <View key={i} style={classicStyles.entry}>
              <Text style={classicStyles.title}>{project.title}</Text>
              {project.description && <Text style={classicStyles.description}>{project.description}</Text>}
            </View>
          ))}
        </View>
      )}

      {/* Skills Section */}
      {skills && skills.length > 0 && (
        <View style={classicStyles.section}>
          <Text style={classicStyles.sectionTitle}>Technical Skills</Text>
          <Text style={classicStyles.skills}>{skills.map(s => s.name).join(', ')}</Text>
        </View>
      )}
    </Page>
  );

  // Render Modern Template
  const renderModernTemplate = () => (
    <Page size="A4" style={modernStyles.page}>
      <View style={modernStyles.container}>
        {/* Header */}
        <View style={modernStyles.header}>
          <Text style={modernStyles.name}>{validBasicInfo.name}</Text>
          <View style={modernStyles.contactInfo}>
            <Text style={modernStyles.contactItem}>{validBasicInfo.email}</Text>
            <Text>•</Text>
            <Text style={modernStyles.contactItem}>{validBasicInfo.contact_no}</Text>
            <Text>•</Text>
            <Text style={modernStyles.contactItem}>{validBasicInfo.location}</Text>
          </View>
        </View>

        {/* About Section */}
        {validBasicInfo.about && (
          <View style={modernStyles.section}>
            <Text style={modernStyles.sectionTitle}>Profile</Text>
            <Text style={modernStyles.description}>{validBasicInfo.about}</Text>
          </View>
        )}

        {/* Experience Section */}
        {experiences && experiences.length > 0 && (
          <View style={modernStyles.section}>
            <Text style={modernStyles.sectionTitle}>Professional Experience</Text>
            {experiences.map((exp, i) => (
              <View key={i} style={modernStyles.entry}>
                <View style={modernStyles.entryHeader}>
                  <Text style={modernStyles.subtitle}>{exp.position}</Text>
                  <Text style={modernStyles.date}>{formatDate(exp.startDate)} - {formatDate(exp.endDate)}</Text>
                </View>
                <Text style={modernStyles.title}>{exp.company}</Text>
                <Text style={modernStyles.description}>{exp.description}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Education Section */}
        {education && education.length > 0 && (
          <View style={modernStyles.section}>
            <Text style={modernStyles.sectionTitle}>Education</Text>
            {education.map((edu, i) => (
              <View key={i} style={modernStyles.entry}>
                <View style={modernStyles.entryHeader}>
                  <Text style={modernStyles.subtitle}>{edu.institution}</Text>
                  <Text style={modernStyles.date}>{formatDate(edu.startDate)} - {formatDate(edu.endDate)}</Text>
                </View>
                <Text style={modernStyles.title}>{edu.degree}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Projects Section */}
        {projects && projects.length > 0 && (
          <View style={modernStyles.section}>
            <Text style={modernStyles.sectionTitle}>Certificates & Languages</Text>
            {projects.map((proj, i) => (
              <Text key={i} style={modernStyles.title}>{proj.title}</Text>
            ))}
          </View>
        )}

        {/* Skills Section */}
        {skills && skills.length > 0 && (
          <View style={modernStyles.section}>
            <Text style={modernStyles.sectionTitle}>Skills</Text>
            <Text style={modernStyles.skills}>{skills.map(s => s.name).join(', ')}</Text>
          </View>
        )}
      </View>
    </Page>
  );

  // Render Creative Template
  const renderCreativeTemplate = () => (
    <Page size="A4" style={creativeStyles.page}>
      {/* Left Column */}
      <View style={creativeStyles.leftColumn}>
        <Text style={creativeStyles.name}>{validBasicInfo.name}</Text>
        
        <View style={{marginTop: 10, marginBottom: 15}}>
          <Text style={creativeStyles.contactItem}>{validBasicInfo.email}</Text>
          <Text style={creativeStyles.contactItem}>{validBasicInfo.contact_no}</Text>
          <Text style={creativeStyles.contactItem}>{validBasicInfo.location}</Text>
        </View>

        {/* Profile Section */}
        {validBasicInfo.about && (
          <View style={creativeStyles.leftSection}>
            <Text style={creativeStyles.leftSectionTitle}>Profile</Text>
            <Text style={creativeStyles.profileText}>{validBasicInfo.about}</Text>
          </View>
        )}

        {/* Education Section */}
        {education && education.length > 0 && (
          <View style={creativeStyles.leftSection}>
            <Text style={creativeStyles.leftSectionTitle}>Education</Text>
            {education.map((edu, i) => (
              <View key={i} style={{marginBottom: 5}}>
                <Text style={{fontSize: 9, fontWeight: 600}}>{edu.institution}</Text>
                <Text style={{fontSize: 8.5}}>{edu.degree}</Text>
                <Text style={{fontSize: 8, color: '#ccc'}}>{formatDate(edu.startDate)} - {formatDate(edu.endDate)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Projects as Languages */}
        {projects && projects.length > 0 && (
          <View style={creativeStyles.leftSection}>
            <Text style={creativeStyles.leftSectionTitle}>Languages</Text>
            {projects.map((proj, i) => (
              <Text key={i} style={{fontSize: 9, marginTop: 4}}>{proj.title}</Text>
            ))}
          </View>
        )}
      </View>

      {/* Right Column */}
      <View style={creativeStyles.rightColumn}>
        {/* Experience Section */}
        {experiences && experiences.length > 0 && (
          <View style={creativeStyles.rightSection}>
            <Text style={creativeStyles.rightSectionTitle}>Professional Experience</Text>
            {experiences.map((exp, i) => (
              <View key={i} style={creativeStyles.expEntry}>
                <Text style={creativeStyles.position}>{exp.position}</Text>
                <Text style={creativeStyles.company}>{exp.company} | {formatDate(exp.startDate)} - {formatDate(exp.endDate)}</Text>
                {exp.description && <Text style={creativeStyles.expDescription}>{exp.description}</Text>}
                {exp.skillsLearned && exp.skillsLearned.length > 0 && (
                  <View style={{marginTop: 4, paddingLeft: 10}}>
                    {exp.skillsLearned.map((skill, j) => (
                      <View key={j} style={{flexDirection: 'row', marginBottom: 2}}>
                        <Text>• </Text>
                        <Text style={{fontSize: 9, lineHeight: 1.4, flex: 1}}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Skills Section */}
        {skills && skills.length > 0 && (
          <View style={creativeStyles.rightSection}>
            <Text style={creativeStyles.rightSectionTitle}>Skills</Text>
            <View style={{paddingLeft: 5, marginTop: 4}}>
              {skills.map((skill, i) => (
                <Text key={i} style={creativeStyles.skillItem}>• {skill.name}</Text>
              ))}
            </View>
          </View>
        )}

        {/* Projects as Awards */}
        {projects && projects.length > 0 && (
          <View style={creativeStyles.rightSection}>
            <Text style={creativeStyles.rightSectionTitle}>Awards</Text>
            {projects.map((proj, i) => (
              <Text key={i} style={{fontSize: 10, marginTop: 4}}>{proj.title}</Text>
            ))}
          </View>
        )}
      </View>
    </Page>
  );

  return (
    <Document>
      {templateType === 'classic' && renderClassicTemplate()}
      {templateType === 'modern' && renderModernTemplate()}
      {templateType === 'creative' && renderCreativeTemplate()}
    </Document>
  );
};

// --- MAIN EXPORTED COMPONENT ---
export default function ResumePDFCore({ basicInfo, projects, experiences, skills, education, templateType }: ResumePDFCoreProps) {
  const getFileName = () => {
    const name = basicInfo?.name?.replace(/\s+/g, '_') || 'resume';
    return `${name}_${templateType}_resume.pdf`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md border dark:border-gray-700">
      <div className="text-center mb-5">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Download Your Resume</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">Generate a professional, print-ready PDF of your resume.</p>
      </div>
      
      <PDFDownloadLink 
        document={<SimpleDocument basicInfo={basicInfo} projects={projects} experiences={experiences} skills={skills} education={education} templateType={templateType} />} 
        fileName={getFileName()} 
        className="w-full"
      >
        {({ loading, error }) => {
          // Handle PDF generation errors
          if (error) {
            console.error('PDF generation error:', error);
            return (
              <div className="w-full p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm text-center">
                  Error generating PDF. Please try again or refresh the page.
                </p>
                <p className="text-red-500 text-xs text-center mt-1">
                  {error.message || 'Unknown error occurred'}
                </p>
              </div>
            );
          }
          
          return (
            <Button 
              className="w-full font-medium text-white bg-black hover:bg-gray-800 py-2 flex items-center justify-center gap-2" 
              disabled={loading || !basicInfo}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating PDF...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download {templateType.charAt(0).toUpperCase() + templateType.slice(1)} PDF
                </>
              )}
            </Button>
          );
        }}
      </PDFDownloadLink>
      
      {!basicInfo && (
        <p className="text-sm text-red-500 mt-2 text-center">
          Please add your basic information before downloading your resume.
        </p>
      )}
    </div>
  );
}
