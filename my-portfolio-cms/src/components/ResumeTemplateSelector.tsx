import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ResumePDF from "./ResumePDF";
import type { Basic, Project, Experience, Skill, Education } from '@/types/portfolio';
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import ResumePreview from "./ResumePreview"; // Import the ResumePreview component
import { Button } from "@/components/ui/button";

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
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Contemporary design with blue accents and modern typography',
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Two-column layout with sidebar for a unique professional look',
  }
] as const;

export default function ResumeTemplateSelector({ basicInfo, projects, experiences, skills, education }: ResumeTemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<'classic' | 'modern' | 'creative' >('classic');

  const handleNext = () => {
    const currentIndex = templates.findIndex(t => t.id === selectedTemplate);
    const nextIndex = (currentIndex + 1) % templates.length;
    setSelectedTemplate(templates[nextIndex].id);
  };

  const handlePrevious = () => {
    const currentIndex = templates.findIndex(t => t.id === selectedTemplate);
    const prevIndex = (currentIndex - 1 + templates.length) % templates.length;
    setSelectedTemplate(templates[prevIndex].id);
  };
  
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
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-foreground mb-1">{template.name}</h4>
                  <p className="text-xs text-muted-foreground">{template.description}</p>
                </div>
                {selectedTemplate === template.id && (
                  <Badge variant="default" className="text-xs">
                    <Check className="w-3 h-3 mr-1" />
                    Selected
                  </Badge>
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
            <div className="flex flex-col items-center justify-between mb-4">
              <div className="text-center">
                <h4 className="font-medium text-foreground">
                  Selected Template: {templates.find(t => t.id === selectedTemplate)?.name}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {templates.find(t => t.id === selectedTemplate)?.description}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="relative p-2 bg-gray-100 rounded-lg shadow-inner flex items-center justify-center">
                {/* Navigation Buttons for Preview */}
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handlePrevious} 
                  className="absolute left-2 z-10 bg-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="overflow-hidden rounded-lg">
                  <ResumePreview
                    basicInfo={basicInfo}
                    projects={projects}
                    experiences={experiences}
                    skills={skills}
                    education={education}
                    templateType={selectedTemplate}
                  />
                </div>
                
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleNext} 
                  className="absolute right-2 z-10 bg-white"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              {/* PDF Download Component */}
              <div>
                {selectedTemplate && (
                  <ResumePDF
                    basicInfo={basicInfo}
                    projects={projects}
                    experiences={experiences}
                    skills={skills}
                    education={education}
                    templateType={selectedTemplate}
                  />
                )}
              </div>
            </div>
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
