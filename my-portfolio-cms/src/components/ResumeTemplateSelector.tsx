import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

// Define the available templates with their properties
const templates = [
  {
    id: 'classic',
    imgSrc: '@/assets/resume6.png',
    name: 'Classic',
    description: 'A timeless, professional format.',
  },
  {
    id: 'modern',
    imgSrc: '@/assets/resume4.png',
    name: 'Modern',
    description: 'Contemporary design with stylish accents.',
  },
  {
    id: 'creative',
    imgSrc: '@/assets/resume5.png',
    name: 'Creative',
    description: 'A unique two-column layout.',
  }
] as const;

// Define the type for a valid template ID
type TemplateId = typeof templates[number]['id'];

// --- NEW PROPS INTERFACE ---
// This component receives the currently selected template and a function to call when the selection changes.
interface ResumeTemplateSelectorProps {
  selectedTemplate: TemplateId;
  onTemplateChange: (templateId: TemplateId) => void;
}

export default function ResumeTemplateSelector({ selectedTemplate, onTemplateChange }: ResumeTemplateSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">
        Change Template
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
            onClick={() => onTemplateChange(template.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <img src={template.imgSrc} alt={template.name} className="w-12 h-12 object-cover rounded-md" />
                  <h4 className="font-medium text-foreground mb-1">{template.name}</h4>
                  <p className="text-xs text-muted-foreground">{template.description}</p>
                </div>
                {selectedTemplate === template.id && (
                  <Badge variant="default" className="text-xs shrink-0 ml-2">
                    <Check className="w-3 h-3 mr-1" />
                    Selected
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
