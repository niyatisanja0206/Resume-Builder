import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { projectSchema, type ProjectFormSchema } from "../lib/zodschema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { type Project } from "@/types/portfolio";
import { useProject } from "../hooks/useProject";
import { useUserContext } from "@/contexts/useUserContext";

export default function ProjectForm() {
  const { currentUser } = useUserContext();
  const userEmail = currentUser?.email || '';
  
  const { 
    projects, 
    isLoading, 
    error, 
    addProject, 
    removeProject, 
    removeAllProjects, 
    addProjectLoading,
    updateProject,
    updateProjectLoading
  } = useProject(userEmail);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const form = useForm<ProjectFormSchema>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      techStack: [],
      link: "",
    },
  });

  const [tech, setTech] = useState("");

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const onSubmit = async (data: ProjectFormSchema) => {
    try {
      if (editingProject) {
        // Update existing project
        console.log('Editing project:', editingProject);
        console.log('Form data:', data);
        const updatedProject: Project = {
          ...editingProject,
          ...data,
          _id: editingProject._id || editingProject.id,
        };
        console.log('Updated project object:', updatedProject);

        if (userEmail) {
          await updateProject(editingProject._id || editingProject.id || '', updatedProject);
          setSuccessMessage('Project updated successfully!');
          setEditingProject(null);
          form.reset({
            title: "",
            description: "",
            techStack: [],
            link: "",
          });
          setTech("");
        }
      } else {
        // Add new project
        const newProject: Omit<Project, 'id' | '_id'> = {
          ...data,
          // Let MongoDB generate _id automatically
        };

        if (userEmail) {
          await addProject(newProject as Project);
          setSuccessMessage('Project added successfully!');
          form.reset({
            title: "",
            description: "",
            techStack: [],
            link: "",
          });
          setTech("");
        }
      }
    } catch (error) {
      console.error('Failed to save project:', error);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        if (userEmail) {
          await removeProject(projectId);
          setSuccessMessage('Project deleted successfully!');
        }
      } catch (error) {
        console.error('Failed to delete project:', error);
      }
    }
  };

  const handleDeleteAllProjects = async () => {
    if (window.confirm('Are you sure you want to delete all projects? This action cannot be undone.')) {
      try {
        if (userEmail) {
          await removeAllProjects();
          setSuccessMessage('All projects deleted successfully!');
        }
      } catch (error) {
        console.error('Failed to delete all projects:', error);
      }
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    form.reset({
      title: project.title || '',
      description: project.description || '',
      techStack: project.techStack || [],
      link: project.link || '',
    });
    setTech('');
  };

  const handleCancelEdit = () => {
    setEditingProject(null);
    form.reset({
      title: '',
      description: '',
      techStack: [],
      link: '',
    });
    setTech('');
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 space-y-8 text-center text-muted-foreground">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p>Loading projects...</p>
      </div>
    );
  }

  // Show message if no basic info exists
  if (!userEmail) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 space-y-8">
        <div className="border border-border rounded-xl shadow-sm bg-card p-6 text-center">
          <div className="mb-4">
            <svg className="w-12 h-12 text-muted-foreground mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-foreground mb-2">Basic Information Required</h3>
            <p className="text-muted-foreground">
              Please fill out your basic information first before adding projects. 
              Go to the "Basic Information" section above to get started.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 space-y-8">
        <div className="border border-destructive/50 rounded-xl shadow-sm bg-destructive/5 overflow-hidden">
          <div className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-destructive mb-2">Error Loading Projects</h3>
            <p className="text-sm text-muted-foreground mb-4">
              There was an error loading your projects. Please try refreshing the page.
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              Refresh Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="w-full max-w-4xl mx-auto p-4 space-y-8">
      {/* Success Message */}
      {successMessage && (
        <div className="border border-green-200 rounded-xl shadow-sm bg-green-50 overflow-hidden">
          <div className="p-4 flex items-center space-x-3">
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Projects Form */}
      <div className="border border-border rounded-xl shadow-sm bg-card overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground flex items-center space-x-2">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>{editingProject ? 'Edit Project' : 'Add New Project'}</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {editingProject 
                  ? 'Update your project information'
                  : 'Showcase your work and technical expertise'
                }
              </p>
            </div>
            {editingProject && (
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelEdit}
                className="border-border text-muted-foreground hover:bg-muted"
              >
                Cancel Edit
              </Button>
            )}
          </div>
        </div>

        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-medium flex items-center space-x-2">
                      <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span>Project Title</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your project title" 
                        className="bg-background border-input focus:ring-ring focus:border-ring transition-colors"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-medium flex items-center space-x-2">
                      <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                      </svg>
                      <span>Description</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your project, its purpose, key features, and achievements..." 
                        className="bg-background border-input focus:ring-ring focus:border-ring transition-colors min-h-[100px] resize-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="techStack"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-medium flex items-center space-x-2">
                      <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                      <span>Tech Stack</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        value={tech}
                        onChange={(e) => setTech(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (tech.trim() && !field.value.includes(tech.trim())) {
                              field.onChange([...field.value, tech.trim()]);
                              setTech("");
                            }
                          }
                        }}
                        placeholder="Type technology and press Enter (e.g., React, Node.js)"
                        className="bg-background border-input focus:ring-ring focus:border-ring transition-colors"
                      />
                    </FormControl>
                    
                    {field.value.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3 p-3 bg-muted/20 rounded-lg border border-muted">
                        {field.value.map((item, index) => (
                          <Badge
                            key={index}
                            onClick={() =>
                              field.onChange(field.value.filter((_, i) => i !== index))
                            }
                            className="cursor-pointer bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors group"
                          >
                            <span>{item}</span>
                            <span className="ml-1 group-hover:text-destructive transition-colors">✕</span>
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Press Enter to add technologies or click on badges to remove them
                    </p>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-medium flex items-center space-x-2">
                      <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      <span>Live Link/Code Link</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://yourproject.com" 
                        type="url"
                        className="bg-background border-input focus:ring-ring focus:border-ring transition-colors"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                disabled={(editingProject ? updateProjectLoading : addProjectLoading) || Object.keys(form.formState.errors).length > 0}
              >
                {editingProject ? (
                  updateProjectLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      <span>Updating...</span>
                    </div>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Update Project
                    </>
                  )
                ) : (
                  addProjectLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      <span>Adding...</span>
                    </div>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Project
                    </>
                  )
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>

      {/* Saved Projects */}
      <div className="border border-border rounded-xl shadow-sm bg-card overflow-hidden">
        <div className="bg-gradient-to-r from-secondary/20 via-secondary/10 to-transparent p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground flex items-center space-x-2">
                <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>Your Projects</span>
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {projects?.length === 0 ? "No projects added yet" : `${projects?.length} project${projects?.length === 1 ? '' : 's'} in your portfolio`}
              </p>
            </div>
            
            {projects && projects.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDeleteAllProjects}
                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
              >
                Clear All
              </Button>
            )}
          </div>
        </div>

        <div className="p-6">
          {!projects || projects.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No projects yet</h3>
              <p className="text-muted-foreground">Start building your portfolio by adding your first project above</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {projects.map((project, index) => (
                <div 
                  key={project._id || project.id || `project-${index}`} 
                  className="border border-border rounded-lg p-6 bg-card/50 hover:bg-card transition-colors group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        {project.title}
                      </h3>
                      {project.link && (
                        <a
                          href={project.link}
                          className="inline-flex items-center space-x-1 text-sm text-primary hover:text-primary/80 transition-colors mt-1"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          <span>View Live</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {project.description}
                  </p>

                  {project.techStack.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-foreground uppercase tracking-wide">
                        Technologies Used
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {project.techStack.map((tech, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 text-xs rounded-md bg-accent text-accent-foreground border border-accent"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditProject(project)}
                          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteProject(project._id || project.id || '')}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  </>
  );
}
