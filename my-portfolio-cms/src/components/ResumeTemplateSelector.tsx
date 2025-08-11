import { useState } from "react";
import { Card } from "@/components/ui/card";
import ResumePDF from "./ResumePDF";
import type { Basic, Project, Experience, Skill, Education } from '@/types/portfolio';

interface ResumeTemplateSelectorProps {
  basicInfo: Basic | null;
  projects: Project[];
  experiences: Experience[];
  skills: Skill[];
  education: Education[];
}

const templates = [
  {
    id: 'original',
    name: 'Original',
    description: 'Your original portfolio format with traditional styling',
    preview: '/images/original-preview.png'
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional format with clean typography and professional layout',
    preview: '/images/classic-preview.png' // You can add preview images later
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Contemporary design with blue accents and modern typography',
    preview: '/images/modern-preview.png'
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Two-column layout with sidebar for a unique professional look',
    preview: '/images/creative-preview.png'
  }
] as const;

export default function ResumeTemplateSelector({ basicInfo, projects, experiences, skills, education }: ResumeTemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<'classic' | 'modern' | 'creative' | 'original'>('classic');

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Choose Your Resume Template
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedTemplate === template.id
                  ? 'ring-2 ring-blue-500 border-blue-500'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <div className="p-4">
                {/* Preview Area */}
                <div className="aspect-[3/4] bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-gray-300 rounded mb-2 mx-auto"></div>
                    <div className="space-y-1">
                      <div className="h-2 bg-gray-300 rounded w-20 mx-auto"></div>
                      <div className="h-2 bg-gray-300 rounded w-16 mx-auto"></div>
                      <div className="h-1 bg-gray-300 rounded w-24 mx-auto mt-2"></div>
                      <div className="h-1 bg-gray-300 rounded w-20 mx-auto"></div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <h4 className="font-medium text-gray-900 mb-1">{template.name}</h4>
                  <p className="text-xs text-gray-600">{template.description}</p>
                </div>
                
                {selectedTemplate === template.id && (
                  <div className="mt-3 flex items-center justify-center">
                    <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                      Selected
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Download Section */}
      <div className="border-t pt-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-medium text-gray-900">
                Selected Template: {templates.find(t => t.id === selectedTemplate)?.name}
              </h4>
              <p className="text-sm text-gray-600">
                {templates.find(t => t.id === selectedTemplate)?.description}
              </p>
            </div>
          </div>
          
          <ResumePDF
            basicInfo={basicInfo}
            projects={projects}
            experiences={experiences}
            skills={skills}
            education={education}
            templateType={selectedTemplate}
          />
        </div>
      </div>

      {/* Features List */}
      <div className="mt-6 text-sm text-gray-600">
        <h5 className="font-medium text-gray-900 mb-2">What you get:</h5>
        <ul className="space-y-1">
          <li className="flex items-center">
            <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
            </svg>
            A4 size PDF optimized for printing and ATS systems
          </li>
          <li className="flex items-center">
            <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
            </svg>
            Professional typography and formatting
          </li>
          <li className="flex items-center">
            <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
            </svg>
            Vector-based PDF for crisp text at any zoom level
          </li>
          <li className="flex items-center">
            <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
            </svg>
            Instant download with your chosen template style
          </li>
        </ul>
      </div>
    </div>
  );
}
