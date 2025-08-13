import { Button } from "@/components/ui/button";
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Font, Svg, Path } from '@react-pdf/renderer';
import type { Basic, Project, Experience, Skill, Education } from '@/types/portfolio';
import React from 'react';
import { useUserStats } from '@/hooks/useUserStats';

// --- FONT REGISTRATION ---
// Registering fonts is crucial for react-pdf to render text correctly.
Font.register({
  family: 'Open Sans',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf' },
    { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf', fontWeight: 600 },
    { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700.ttf', fontWeight: 700 },
  ],
});

Font.register({
  family: 'Merriweather',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/merriweather/v30/u-440qyriQwlOrhSvowK_l5-fCZMdeX3rg.ttf' },
    { src: 'https://fonts.gstatic.com/s/merriweather/v30/u-4n0qyriQwlOrhSvowK_l52xwNZWMf6.ttf', fontStyle: 'italic' },
    { src: 'https://fonts.gstatic.com/s/merriweather/v30/u-4n0qyriQwlOrhSvowK_l52_wZWMf6.ttf', fontWeight: 'bold' },
  ]
});


// --- PROPS INTERFACE ---
interface ResumePDFProps {
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

// --- STYLESHEETS ---

// Styles for Classic Template (Ref: resume6.jpg)
const classicStyles = StyleSheet.create({
    page: { fontFamily: 'Merriweather', fontSize: 10, padding: 40, backgroundColor: '#ffffff', color: '#2d2d2d' },
    header: { textAlign: 'center', marginBottom: 20 },
    name: { fontSize: 28, fontWeight: 'bold', fontFamily: 'Merriweather', marginBottom: 5, letterSpacing: 1 },
    contactInfo: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', fontSize: 9, color: '#555' },
    contactItem: { marginHorizontal: 8 },
    section: { marginBottom: 15 },
    sectionTitle: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', borderBottomWidth: 1.5, borderBottomColor: '#333', paddingBottom: 2, marginBottom: 8, fontFamily: 'Merriweather' },
    entry: { marginBottom: 10 },
    entryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 },
    title: { fontSize: 11, fontWeight: 'bold' },
    subtitle: { fontSize: 10, fontStyle: 'italic', marginBottom: 3 },
    date: { fontSize: 9, color: '#555' },
    description: { fontSize: 9, lineHeight: 1.4 },
    bulletList: { marginTop: 4, paddingLeft: 10 },
    bullet: { flexDirection: 'row', marginBottom: 2 },
    bulletText: { fontSize: 9, lineHeight: 1.4, flex: 1 },
    skills: { fontSize: 10 }
});

// Styles for Modern Template (Ref: resume4.png)
const modernStyles = StyleSheet.create({
    page: { fontFamily: 'Open Sans', fontSize: 9, backgroundColor: '#FEF6FA', padding: 20 },
    container: { backgroundColor: '#ffffff', flex: 1, borderRadius: 8, padding: 30 },
    header: { textAlign: 'center', marginBottom: 20 },
    name: { fontSize: 28, fontWeight: 700, color: '#333' },
    jobTitle: { fontSize: 14, color: '#555', marginTop: 2 },
    contactInfo: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10, gap: 15, fontSize: 8, color: '#666' },
    contactItem: { flexDirection: 'row', alignItems: 'center' },
    icon: { width: 10, height: 10, marginRight: 4, stroke: 'currentColor', strokeWidth: 1 },
    section: { marginBottom: 12 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', paddingVertical: 5, paddingHorizontal: 8, borderRadius: 4, marginBottom: 8 },
    sectionIcon: { width: 14, height: 14, stroke: 'currentColor', strokeWidth: 1.5 },
    sectionTitle: { fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#444', marginLeft: 6 },
    entry: { marginBottom: 8 },
    entryHeader: { flexDirection: 'row', justifyContent: 'space-between' },
    title: { fontSize: 10, fontWeight: 600, color: '#d16ba5' },
    subtitle: { fontSize: 10, fontWeight: 700, color: '#333' },
    date: { fontSize: 8, color: '#777' },
    description: { fontSize: 9, color: '#555', marginTop: 2, lineHeight: 1.4 },
    badgeContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
    badge: { backgroundColor: '#d16ba5', color: 'white', paddingVertical: 3, paddingHorizontal: 10, borderRadius: 12, fontSize: 8, fontWeight: 600 },
    skillGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    skillItem: { width: '48%', marginBottom: 6 },
    skillName: { fontSize: 9, fontWeight: 600 },
    skillDots: { flexDirection: 'row', gap: 2, marginTop: 2 },
    dot: { width: 8, height: 8, borderRadius: 4 },
});

// Styles for Creative Template (Ref: resume5.jpg)
const creativeStyles = StyleSheet.create({
    page: { flexDirection: 'row', fontFamily: 'Open Sans', backgroundColor: '#ffffff' },
    leftColumn: { width: '35%', backgroundColor: '#1A4331', padding: 30, color: 'white' },
    rightColumn: { width: '65%', padding: 30, color: '#333' },
    name: { fontSize: 24, fontWeight: 700, marginBottom: 4 },
    jobTitle: { fontSize: 12, marginBottom: 15 },
    contactItem: { flexDirection: 'row', alignItems: 'center', fontSize: 8, marginBottom: 4 },
    icon: { width: 9, height: 9, marginRight: 6, stroke: 'white', strokeWidth: 1.5 },
    leftSection: { marginBottom: 15 },
    leftSectionTitle: { fontSize: 12, fontWeight: 600, borderBottomWidth: 1, borderBottomColor: '#5a7e70', paddingBottom: 2, marginBottom: 6 },
    profileText: { fontSize: 8.5, lineHeight: 1.5, color: '#f0f0f0' },
    educationEntry: { marginBottom: 5 },
    institution: { fontSize: 9, fontWeight: 600 },
    degree: { fontSize: 8.5 },
    educationDate: { fontSize: 8, color: '#ccc' },
    rightSection: { marginBottom: 15 },
    rightSectionTitle: { fontSize: 16, fontWeight: 700, color: '#1A4331', borderBottomWidth: 1.5, borderBottomColor: '#e0e0e0', paddingBottom: 2, marginBottom: 8 },
    expEntry: { marginBottom: 10 },
    position: { fontSize: 11, fontWeight: 600 },
    company: { fontSize: 10, fontWeight: 600, color: '#555', marginBottom: 3 },
    expDescription: { fontSize: 9, lineHeight: 1.4 },
    bulletList: { marginTop: 4, paddingLeft: 10 },
    bulletText: { fontSize: 9, lineHeight: 1.4, flex: 1 },
    skillList: { paddingLeft: 5, marginTop: 4 },
});


// --- PDF DOCUMENT COMPONENT ---

const MyDocument = React.memo(({ basicInfo, projects, experiences, skills, education, templateType }: ResumePDFProps) => {

  const ClassicTemplate = () => (
    <Page size="A4" style={classicStyles.page}>
        <View style={classicStyles.header}>
            <Text style={classicStyles.name}>{basicInfo?.name || 'Jacob McLaren'}</Text>
            <View style={classicStyles.contactInfo}>
                <Text style={classicStyles.contactItem}>{basicInfo?.location || '54 Dunster St, Cambridge, MA 02138'}</Text>
                <Text>•</Text>
                <Text style={classicStyles.contactItem}>{basicInfo?.email || 'mclaren@gmail.com'}</Text>
                <Text>•</Text>
                <Text style={classicStyles.contactItem}>{basicInfo?.contact_no || '555-555-5555'}</Text>
            </View>
        </View>

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
                                        <Text>• </Text>
                                        <Text style={classicStyles.bulletText}>{skill}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                ))}
            </View>
        )}

        {skills && skills.length > 0 && (
            <View style={classicStyles.section}>
                <Text style={classicStyles.sectionTitle}>Technical Expertise</Text>
                <Text style={classicStyles.skills}>{skills.map(s => s.name).join(', ')}</Text>
            </View>
        )}

        {projects && projects.length > 0 && (
             <View style={classicStyles.section}>
                <Text style={classicStyles.sectionTitle}>Additional</Text>
                {projects.map((project, i) => (
                    <View key={i} style={classicStyles.entry}>
                         <Text style={classicStyles.description}>{project.description}</Text>
                    </View>
                ))}
            </View>
        )}
    </Page>
  );
  
  const ModernTemplate = () => (
    <Page size="A4" style={modernStyles.page}>
        <View style={modernStyles.container}>
            <View style={modernStyles.header}>
                <Text style={modernStyles.name}>{basicInfo?.name || 'Catherine Bale'}</Text>
                <Text style={modernStyles.jobTitle}>{basicInfo?.about?.split('.')[0] || 'Marketing Assistant'}</Text>
                <View style={modernStyles.contactInfo}>
                    <View style={modernStyles.contactItem}><Svg viewBox="0 0 24 24" style={modernStyles.icon}><Path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></Svg><Text>{basicInfo?.email}</Text></View>
                    <View style={modernStyles.contactItem}><Svg viewBox="0 0 24 24" style={modernStyles.icon}><Path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><Path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></Svg><Text>{basicInfo?.location}</Text></View>
                    <View style={modernStyles.contactItem}><Svg viewBox="0 0 24 24" style={modernStyles.icon}><Path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></Svg><Text>{basicInfo?.contact_no}</Text></View>
                </View>
            </View>

            {basicInfo?.about && (
                <View style={modernStyles.section}>
                    <View style={modernStyles.sectionHeader}><Svg viewBox="0 0 24 24" style={modernStyles.sectionIcon}><Path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></Svg><Text style={modernStyles.sectionTitle}>Profile</Text></View>
                    <Text style={modernStyles.description}>{basicInfo.about}</Text>
                </View>
            )}

            {experiences && experiences.length > 0 && (
                <View style={modernStyles.section}>
                    <View style={modernStyles.sectionHeader}><Svg viewBox="0 0 24 24" style={modernStyles.sectionIcon}><Path d="M20.25 14.15v4.07a2.25 2.25 0 01-2.25 2.25h-13.5a2.25 2.25 0 01-2.25-2.25v-4.07m18-4.22l-7.5-4.22m0 0l-7.5 4.22m7.5-4.22v10.5M4.5 9.75v10.5a2.25 2.25 0 002.25 2.25h13.5a2.25 2.25 0 002.25-2.25V9.75" /></Svg><Text style={modernStyles.sectionTitle}>Professional Experience</Text></View>
                    {experiences.map((exp, i) => (
                        <View key={i} style={modernStyles.entry}>
                             <View style={modernStyles.entryHeader}><Text style={modernStyles.subtitle}>{exp.position}</Text><Text style={modernStyles.date}>{formatDate(exp.startDate)} - {formatDate(exp.endDate)}</Text></View>
                             <Text style={modernStyles.title}>{exp.company}</Text>
                             <Text style={modernStyles.description}>{exp.description}</Text>
                        </View>
                    ))}
                </View>
            )}

            {education && education.length > 0 && (
                 <View style={modernStyles.section}>
                    <View style={modernStyles.sectionHeader}><Svg viewBox="0 0 24 24" style={modernStyles.sectionIcon}><Path d="M12 14l9-5-9-5-9 5 9 5z" /><Path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-5.998 12.078 12.078 0 01.665-6.479L12 14z" /><Path d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-5.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222 4 2.222V20M1 12l5.373 2.986M17.627 15L23 12M12 21v-7.5" /></Svg><Text style={modernStyles.sectionTitle}>Education</Text></View>
                    {education.map((edu, i) => (
                        <View key={i} style={modernStyles.entry}>
                             <View style={modernStyles.entryHeader}><Text style={modernStyles.subtitle}>{edu.institution}</Text><Text style={modernStyles.date}>{formatDate(edu.startDate)} - {formatDate(edu.endDate)}</Text></View>
                             <Text style={modernStyles.title}>{edu.degree}</Text>
                        </View>
                    ))}
                </View>
            )}

            {projects && projects.length > 0 && (
                <View style={modernStyles.section}>
                    <View style={modernStyles.sectionHeader}><Svg viewBox="0 0 24 24" style={modernStyles.sectionIcon}><Path d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" /></Svg><Text style={modernStyles.sectionTitle}>Certificates & Languages</Text></View>
                    <View style={modernStyles.badgeContainer}>
                        {projects.map((proj, i) => <Text key={i} style={modernStyles.badge}>{proj.title}</Text>)}
                    </View>
                </View>
            )}

            {skills && skills.length > 0 && (
                 <View style={modernStyles.section}>
                    <View style={modernStyles.sectionHeader}><Svg viewBox="0 0 24 24" style={modernStyles.sectionIcon}><Path d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></Svg><Text style={modernStyles.sectionTitle}>Skills</Text></View>
                    <View style={modernStyles.skillGrid}>
                        {skills.map((skill, i) => (
                            <View key={i} style={modernStyles.skillItem}>
                                <Text style={modernStyles.skillName}>{skill.name}</Text>
                                <View style={modernStyles.skillDots}>
                                    {[...Array(5)].map((_, j) => (
                                        <View key={j} style={[modernStyles.dot, {backgroundColor: j < (skill.level === 'advanced' ? 5 : skill.level === 'intermediate' ? 3 : 1) ? '#d16ba5' : '#e5e7eb'}]} />
                                    ))}
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            )}
        </View>
    </Page>
  );

  const CreativeTemplate = () => (
    <Page size="A4" style={creativeStyles.page}>
        <View style={creativeStyles.leftColumn}>
            <Text style={creativeStyles.name}>{basicInfo?.name || 'Brian T. Wayne'}</Text>
            <Text style={creativeStyles.jobTitle}>{basicInfo?.about?.split('.')[0] || 'Business Development Consultant'}</Text>
            
            <View style={{marginTop: 10, marginBottom: 15, gap: 4}}>
                <View style={creativeStyles.contactItem}><Svg viewBox="0 0 24 24" style={creativeStyles.icon}><Path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></Svg><Text>{basicInfo?.email}</Text></View>
                <View style={creativeStyles.contactItem}><Svg viewBox="0 0 24 24" style={creativeStyles.icon}><Path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></Svg><Text>{basicInfo?.contact_no}</Text></View>
                <View style={creativeStyles.contactItem}><Svg viewBox="0 0 24 24" style={creativeStyles.icon}><Path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><Path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></Svg><Text>{basicInfo?.location}</Text></View>
            </View>

            {basicInfo?.about && (
                <View style={creativeStyles.leftSection}>
                    <Text style={creativeStyles.leftSectionTitle}>Profile</Text>
                    <Text style={creativeStyles.profileText}>{basicInfo.about}</Text>
                </View>
            )}

            {education && education.length > 0 && (
                <View style={creativeStyles.leftSection}>
                    <Text style={creativeStyles.leftSectionTitle}>Education</Text>
                    {education.map((edu, i) => (
                        <View key={i} style={creativeStyles.educationEntry}>
                            <Text style={creativeStyles.institution}>{edu.institution}</Text>
                            <Text style={creativeStyles.degree}>{edu.degree}</Text>
                            <Text style={creativeStyles.educationDate}>{formatDate(edu.startDate)} - {formatDate(edu.endDate)}</Text>
                        </View>
                    ))}
                </View>
            )}

            {projects && projects.length > 0 && (
                <View style={creativeStyles.leftSection}>
                    <Text style={creativeStyles.leftSectionTitle}>Languages</Text>
                    {projects.map((proj, i) => <Text key={i} style={{fontSize: 9, marginTop: 4}}>{proj.title}</Text>)}
                </View>
            )}
        </View>

        <View style={creativeStyles.rightColumn}>
            {experiences && experiences.length > 0 && (
                <View style={creativeStyles.rightSection}>
                    <Text style={creativeStyles.rightSectionTitle}>Professional Experience</Text>
                    {experiences.map((exp, i) => (
                        <View key={i} style={creativeStyles.expEntry}>
                            <Text style={creativeStyles.position}>{exp.position}</Text>
                            <Text style={creativeStyles.company}>{exp.company} | {formatDate(exp.startDate)} - {formatDate(exp.endDate)}</Text>
                            {exp.description && <Text style={creativeStyles.expDescription}>{exp.description}</Text>}
                            {exp.skillsLearned && exp.skillsLearned.length > 0 && (
                                <View style={creativeStyles.bulletList}>
                                    {exp.skillsLearned.map((skill, j) => (
                                         <View key={j} style={classicStyles.bullet}>
                                            <Text>• </Text>
                                            <Text style={creativeStyles.bulletText}>{skill}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    ))}
                </View>
            )}
            {skills && skills.length > 0 && (
                <View style={creativeStyles.rightSection}>
                    <Text style={creativeStyles.rightSectionTitle}>Skills</Text>
                    <View style={creativeStyles.skillList}>
                        {skills.map((skill, i) => (
                            <View key={i} style={classicStyles.bullet}>
                                <Text>• </Text>
                                <Text style={creativeStyles.bulletText}>{skill.name}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}
             {projects && projects.length > 0 && (
                <View style={creativeStyles.rightSection}>
                    <Text style={creativeStyles.rightSectionTitle}>Awards</Text>
                     {projects.map((proj, i) => <Text key={i} style={{fontSize: 10, marginTop: 4}}>{proj.title}</Text>)}
                </View>
            )}
        </View>
    </Page>
  );

  return (
    <Document>
      {templateType === 'classic' && <ClassicTemplate />}
      {templateType === 'modern' && <ModernTemplate />}
      {templateType === 'creative' && <CreativeTemplate />}
    </Document>
  );
});

// --- MAIN EXPORTED COMPONENT ---
export default function ResumePDF({ basicInfo, projects, experiences, skills, education, templateType }: ResumePDFProps) {
  const { incrementDownloadCount } = useUserStats();
  
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
        document={<MyDocument {...{ templateType, basicInfo, projects, experiences, skills, education }} />} 
        fileName={getFileName()} 
        className="w-full"
      >
        {({ loading, error }) => (
          <Button 
            className="w-full font-medium text-white bg-blue-600 hover:bg-blue-700 py-2 flex items-center justify-center gap-2" 
            disabled={loading || !basicInfo || !!error} 
            onClick={incrementDownloadCount}
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
        )}
      </PDFDownloadLink>
      {!basicInfo && (
        <p className="text-sm text-red-500 mt-2 text-center">
          Please add your basic information before downloading your resume.
        </p>
      )}
    </div>
  );
}
