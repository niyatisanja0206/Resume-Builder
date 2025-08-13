import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
//import { Badge } from "@/components/ui/badge";
import AuthGuard from "@/components/AuthGuard";
//import { Check } from "lucide-react";

// Define the available templates
const templates = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'A timeless, professional format with clean typography.',
    image: 'https://placehold.co/600x800/F3F4F6/374151?text=Classic+Template',
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Contemporary design with stylish accents and a fresh layout.',
    image: 'https://placehold.co/600x800/DBEAFE/1D4ED8?text=Modern+Template',
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'A unique two-column layout to make your profile stand out.',
    image: 'https://placehold.co/600x800/E0F2FE/075985?text=Creative+Template',
  }
] as const;

type TemplateId = typeof templates[number]['id'];

export default function Portfolio() {
  const navigate = useNavigate();

  // Function to handle template selection and navigate to the dashboard
  const handleTemplateSelect = (templateId: TemplateId) => {
    // Navigate to the dashboard, passing the chosen template ID as a URL parameter.
    // The Dashboard will read this to show the correct preview.
    navigate(`/dashboard?template=${templateId}`);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 text-foreground">
        <div className="container max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
          
          {/* Header Section */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Choose Your Template
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Select a template to start building your professional resume. You can change it anytime.
            </p>
          </div>

          {/* Template Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card
                key={template.id}
                className="cursor-pointer transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-105 group border-2 border-transparent hover:border-primary"
                onClick={() => handleTemplateSelect(template.id)}
              >
                <CardContent className="p-4 flex flex-col h-full">
                  <div className="overflow-hidden rounded-md mb-4">
                    <img 
                      src={template.image} 
                      alt={`${template.name} resume template preview`}
                      className="w-full h-auto object-cover aspect-[3/4] transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex-grow">
                    <h2 className="text-lg font-semibold text-foreground">{template.name}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click when button is clicked
                      handleTemplateSelect(template.id);
                    }}
                    className="mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Select {template.name}
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>

        </div>
      </div>
    </AuthGuard>
  );
}
