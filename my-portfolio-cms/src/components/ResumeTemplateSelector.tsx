import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ResumePDF from "./ResumePDF";
import type { Basic, Project, Experience, Skill, Education } from '@/types/portfolio';
import { Check } from "lucide-react";

interface ResumeTemplateSelectorProps {
  basicInfo: Basic | null;
  projects: Project[];
  experiences: Experience[];
  skills: Skill[];
  education: Education[];
}

const templates = [
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
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Choose Your Resume Template
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedTemplate === template.id
                  ? 'ring-2 ring-primary border-primary'
                  : 'border-border hover:border-muted-foreground'
              }`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <CardContent className="p-4">
                {/* Preview Area */}
                <div className="aspect-[3/4] bg-muted rounded-lg mb-3 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-muted-foreground/20 rounded mb-2 mx-auto"></div>
                    <div className="space-y-1">
                      <div className="h-2 bg-muted-foreground/20 rounded w-20 mx-auto"></div>
                      <div className="h-2 bg-muted-foreground/20 rounded w-16 mx-auto"></div>
                      <div className="h-1 bg-muted-foreground/20 rounded w-24 mx-auto mt-2"></div>
                      <div className="h-1 bg-muted-foreground/20 rounded w-20 mx-auto"></div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <h4 className="font-medium text-foreground mb-1">{template.name}</h4>
                  <p className="text-xs text-muted-foreground">{template.description}</p>
                </div>
                
                {selectedTemplate === template.id && (
                  <div className="mt-3 flex items-center justify-center">
                    <Badge variant="default" className="text-xs">
                      <Check className="w-3 h-3 mr-1" />
                      Selected
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Download Section */}
      <div className="border-t border-border pt-6">
        <Card className="bg-card shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-medium text-foreground">
                  Selected Template: {templates.find(t => t.id === selectedTemplate)?.name}
                </h4>
                <p className="text-sm text-muted-foreground">
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
          </CardContent>
        </Card>
      </div>

      {/* Features List */}
      <div className="mt-6 text-sm text-muted-foreground">
        <h5 className="font-medium text-foreground mb-2">What you get:</h5>
        <ul className="space-y-1">
          <li className="flex items-center">
            <Check className="w-4 h-4 mr-2 text-green-500" />
            A4 size PDF optimized for printing and ATS systems
          </li>
          <li className="flex items-center">
            <Check className="w-4 h-4 mr-2 text-green-500" />
            Professional typography and formatting
          </li>
          <li className="flex items-center">
            <Check className="w-4 h-4 mr-2 text-green-500" />
            Vector-based PDF for crisp text at any zoom level
          </li>
          <li className="flex items-center">
            <Check className="w-4 h-4 mr-2 text-green-500" />
            Instant download with your chosen template style
          </li>
        </ul>
      </div>
    </div>
  );
}
