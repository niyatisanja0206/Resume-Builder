import { Button } from "@/components/ui/button";
import React, { Suspense } from 'react';
import type { Basic, Project, Experience, Skill, Education } from '@/types/portfolio';

// --- PROPS INTERFACE ---
interface ResumePDFProps {
  basicInfo: Basic | null;
  projects: Project[];
  experiences: Experience[];
  skills: Skill[];
  education: Education[];
  templateType: 'classic' | 'modern' | 'creative';
  canDownload?: boolean;
}

// Simple fallback component
const SimplePDFDownload = () => {
  const handleFallbackDownload = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No authentication token found, skipping download count increment');
        return;
      }
      
      const response = await fetch('/api/auth/increment-download-count', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to increment download count');
      }
      
      console.log('Download count incremented successfully');
    } catch (error) {
      console.error('Error incrementing download count:', error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md border dark:border-gray-700">
      <div className="text-center mb-5">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">PDF Download Temporarily Unavailable</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          PDF generation is currently experiencing issues. Please try refreshing the page.
        </p>
      </div>
      <Button 
        className="w-full font-medium text-gray-500 bg-gray-200 cursor-not-allowed py-2 flex items-center justify-center gap-2" 
        disabled
        onClick={handleFallbackDownload}
      >
        PDF Generation Error
      </Button>
      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-yellow-800 text-sm">
          <strong>Workaround:</strong> You can still copy your resume content from the preview and paste it into a document editor.
        </p>
      </div>
    </div>
  );
};

// Dynamic import wrapper
const PDFComponent = React.lazy(async () => {
  try {
    // Force the browser to not use cached version
    const module = await import('./ResumePDFCore');
    return { default: module.default };
  } catch (error) {
    console.error('Failed to load PDF component:', error);
    return { default: SimplePDFDownload };
  }
});

// --- MAIN EXPORTED COMPONENT ---
export default function ResumePDF({ basicInfo, projects, experiences, skills, education, templateType, canDownload = true }: ResumePDFProps) {
  // Debug logging
  console.log('ResumePDF component rendered with:', {
    templateType,
    hasBasicInfo: !!basicInfo,
    projectsCount: projects?.length || 0,
    experiencesCount: experiences?.length || 0,
    skillsCount: skills?.length || 0,
    educationCount: education?.length || 0,
    canDownload
  });

  return (
    <Suspense fallback={
      <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md border dark:border-gray-700">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading PDF component...</p>
        </div>
      </div>
    }>
      <PDFComponent 
        basicInfo={basicInfo}
        projects={projects}
        experiences={experiences}
        skills={skills}
        education={education}
        templateType={templateType}
        canDownload={canDownload}
      />
    </Suspense>
  );
}
