import { Button } from "@/components/ui/button";
import React, { Suspense, Component } from 'react';
import type { Basic, Project, Experience, Skill, Education } from '@/types/portfolio';
import type { ErrorInfo, ReactNode } from 'react';

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

// --- PDF ERROR BOUNDARY ---
interface PDFErrorBoundaryProps {
  children: ReactNode;
}

interface PDFErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class PDFErrorBoundary extends Component<PDFErrorBoundaryProps, PDFErrorBoundaryState> {
  public state: PDFErrorBoundaryState = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): PDFErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('PDF ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium mb-2">PDF Component Error</h3>
          <p className="text-red-600 text-sm mb-3">
            The PDF download component encountered an error:
          </p>
          <div className="bg-red-100 border border-red-300 rounded p-2 mb-3">
            <code className="text-red-800 text-xs">{this.state.error?.message}</code>
          </div>
          <p className="text-red-600 text-sm mb-3">
            Common causes:
          </p>
          <ul className="text-red-600 text-sm list-disc list-inside mb-3 space-y-1">
            <li>Internet connection issues (fonts loading from CDN)</li>
            <li>Browser compatibility with @react-pdf/renderer</li>
            <li>Missing or invalid resume data</li>
            <li>Template rendering errors</li>
          </ul>
          <div className="flex gap-2">
            <button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simple fallback component with enhanced error information
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
        <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">PDF Component Loading Failed</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          The PDF generation component could not be loaded.
        </p>
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
        <h4 className="text-yellow-800 font-medium text-sm mb-2">Possible causes:</h4>
        <ul className="text-yellow-700 text-xs list-disc list-inside space-y-1">
          <li>Network connection issues</li>
          <li>Browser compatibility problems</li>
          <li>JavaScript execution errors</li>
          <li>Missing dependencies</li>
        </ul>
      </div>
      
      <div className="flex gap-2 mb-4">
        <Button 
          onClick={() => window.location.reload()}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
        >
          Refresh Page
        </Button>
        <Button 
          onClick={handleFallbackDownload}
          variant="outline"
          className="flex-1"
        >
          Try Alternative
        </Button>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded p-3">
        <p className="text-blue-800 text-sm">
          <strong>Workaround:</strong> You can copy your resume content from the preview and paste it into a document editor, then save as PDF.
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
    <PDFErrorBoundary>
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
    </PDFErrorBoundary>
  );
}
