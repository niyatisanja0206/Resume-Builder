import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useProject } from "../hooks/useProject";
import { useUserContext } from "@/contexts/useUserContext";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { type Project } from "@/types/portfolio";
import { useToast } from '../contexts/ToastContext';
import ErrorBoundary from './ErrorBoundary';
import { shouldShowToast } from '@/utils/toastUtils';

// --- PROPS INTERFACE ---
interface ProjectFormProps {
    initialData: Project[];
    onDataChange: (newData: Project[]) => void;
}

export default function EnhancedProjectForm({ initialData, onDataChange }: ProjectFormProps) {
    console.log('🔄 EnhancedProjectForm rendered with initialData:', initialData);
    
    const { currentUser } = useUserContext();
    const userEmail = currentUser?.email || '';
    const { showToast: originalShowToast } = useToast();

    // Debounced toast function to prevent excessive notifications
    const showToast = useCallback(
        (message: string, type: 'success' | 'error' | 'info') => {
            if (shouldShowToast(message)) {
                originalShowToast(message, type);
            }
        },
        [originalShowToast]
    );

    // Hook for backend mutation functions
    const { 
        addProject, 
        updateProject, 
        removeProject, 
        removeAllProjects,
        addProjectLoading, 
        updateProjectLoading,
        removeAllProjectsLoading 
    } = useProject(userEmail);

    // --- LOCAL STATE MANAGEMENT ---
    const [projectList, setProjectList] = useState<Project[]>([]);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [techInput, setTechInput] = useState("");

    // --- DATA SYNCHRONIZATION ---
    useEffect(() => {
        console.log('🚀 Received initialData:', initialData);
        if (Array.isArray(initialData) && initialData.length > 0) {
            console.log('🚀 Processed project data:', initialData);
            setProjectList(initialData);
        } else if (Array.isArray(initialData) && initialData.length === 0) {
            console.log('🚀 Initial data is empty array, setting empty list');
            setProjectList([]);
        } else {
            console.log('🚀 Initial data is null/undefined or invalid, keeping current list');
            // Don't reset if we have existing data and initialData is invalid
        }
    }, [initialData]);

    // Debug onDataChange prop
    const debugOnDataChange = useCallback((data: Project[]) => {
        console.log('🔄 onDataChange called with:', data);
        onDataChange(data);
    }, [onDataChange]);

    // --- LIVE UPDATE HANDLER ---
    const handleProjectListChange = useCallback((newProjectList: Project[]) => {
        console.log('🚀 Updating project list:', newProjectList);
        console.log('🚀 Calling onDataChange with:', newProjectList);
        setProjectList(newProjectList);
        debugOnDataChange(newProjectList);
    }, [debugOnDataChange]);

    const form = useForm<ProjectFormSchema>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            title: "",
            description: "",
            techStack: [],
            link: "",
        },
    });

    // --- LIVE UPDATE FOR FORM FIELDS ---
    const handleFieldChange = useCallback((fieldName: keyof ProjectFormSchema, value: string | string[]) => {
        // Update the form field
        form.setValue(fieldName, value);
        
        // Get current form values
        const currentFormData = form.getValues();
        
        // Create updated project object
        const updatedProject: Project = {
            _id: editingProject?._id || (isAddingNew ? 'temp-new' : ''),
            title: currentFormData.title || '',
            description: currentFormData.description || '',
            techStack: currentFormData.techStack || [],
            link: currentFormData.link || ''
        };

        let updatedList: Project[];
        
        if (editingProject) {
            // Update existing project item
            updatedList = projectList.map(proj => 
                proj._id === editingProject._id ? updatedProject : proj
            );
        } else if (isAddingNew) {
            // Update the temporary new entry or add it if it doesn't exist
            const tempIndex = projectList.findIndex(proj => proj._id === 'temp-new');
            if (tempIndex >= 0) {
                updatedList = [...projectList];
                updatedList[tempIndex] = updatedProject;
            } else {
                updatedList = [...projectList, updatedProject];
            }
        } else {
            updatedList = projectList;
        }
        
        handleProjectListChange(updatedList);
    }, [form, editingProject, isAddingNew, projectList, handleProjectListChange]);

    // --- TECHNOLOGY MANAGEMENT ---
    const addTechnology = () => {
        if (techInput.trim()) {
            const currentTech = form.getValues().techStack || [];
            const newTech = [...currentTech, techInput.trim()];
            form.setValue("techStack", newTech);
            handleFieldChange("techStack", newTech);
            setTechInput("");
        }
    };

    const removeTechnology = (techToRemove: string) => {
        const currentTech = form.getValues().techStack || [];
        const newTech = currentTech.filter((tech: string) => tech !== techToRemove);
        form.setValue("techStack", newTech);
        handleFieldChange("techStack", newTech);
    };

    // --- HANDLERS ---
    const onSubmit = async (data: ProjectFormSchema) => {
        try {
            if (editingProject) {
                // Update existing project entry
                const updatedProjectItem: Project = { 
                    ...editingProject, 
                    ...data,
                    _id: editingProject._id || editingProject.id
                } as Project;
                
                const result = await updateProject(editingProject._id || editingProject.id || '', updatedProjectItem);

                // Handle different hook return types
                let nextList: Project[];
                if (Array.isArray(result)) {
                    nextList = result as Project[];
                } else if (result && typeof result === 'object') {
                    nextList = projectList.map((p) =>
                        (p._id || p.id) === (updatedProjectItem._id || updatedProjectItem.id)
                            ? (result as Project)
                            : p
                    );
                } else {
                    nextList = projectList.map((p) =>
                        (p._id || p.id) === (updatedProjectItem._id || updatedProjectItem.id)
                            ? updatedProjectItem
                            : p
                    );
                }

                handleProjectListChange(nextList);
                showToast('Project updated successfully!', 'success');
            } else {
                // Add new project entry
                const projectData: Project = { 
                    ...data
                } as Project;
                
                const result = await addProject(projectData);
                console.log('✅ Add project result:', result);

                let nextItem: Project | null = null;
                if (Array.isArray(result)) {
                    // If API returns a list, assume last one is newest
                    nextItem = (result as Project[])[(result as Project[]).length - 1] || null;
                    console.log('📋 Result is array, using last item:', nextItem);
                } else if (result && typeof result === 'object') {
                    nextItem = result as Project;
                    console.log('📝 Result is object, using directly:', nextItem);
                }

                // Remove temp entry and add the real one
                const withoutTemp = projectList.filter((proj) => proj._id !== 'temp-new');
                console.log('🗑️ Filtered list without temp:', withoutTemp);
                
                const finalProject: Project = {
                    ...projectData,
                    _id: nextItem?._id || `saved-${Date.now()}`,
                    id: nextItem?.id || `saved-${Date.now()}`,
                    title: nextItem?.title || projectData.title,
                    description: nextItem?.description || projectData.description,
                    techStack: nextItem?.techStack || projectData.techStack,
                    link: nextItem?.link || projectData.link,
                };
                
                const updatedList = [...withoutTemp, finalProject];
                console.log('🚀 Final updated list:', updatedList);
                handleProjectListChange(updatedList);
                showToast('Project added successfully!', 'success');
            }

            // Reset form state but keep the data visible
            setEditingProject(null);
            setIsAddingNew(false);
            form.reset({
                title: '',
                description: '',
                techStack: [],
                link: '',
            });
            setTechInput("");
            
        } catch (error) {
            console.error('Error saving project:', error);
            showToast('Failed to save project', 'error');
        }
    };

    const handleDelete = async (projectId: string) => {
        if (projectId === 'temp-new') {
            // Just remove from local state if it's a temporary entry
            const updatedList = projectList.filter(proj => proj._id !== projectId);
            handleProjectListChange(updatedList);
            setIsAddingNew(false);
            setEditingProject(null);
            form.reset();
            return;
        }

        if (window.confirm('Are you sure you want to delete this project?')) {
            try {
                await removeProject(projectId);
                const updatedList = projectList.filter(proj => proj._id !== projectId);
                handleProjectListChange(updatedList);
                showToast("Project deleted successfully!", "success");
            } catch (error) {
                console.error('Error deleting project:', error);
                showToast('Failed to delete project', 'error');
            }
        }
    };

    const handleEdit = (project: Project) => {
        // If we're currently adding a new entry, remove the temp entry
        if (isAddingNew) {
            handleProjectListChange(projectList.filter((proj) => proj._id !== 'temp-new'));
        }
        
        setEditingProject(project);
        setIsAddingNew(false);
        form.reset({
            title: project.title || '',
            description: project.description || '',
            techStack: project.techStack || [],
            link: project.link || '',
        });
    };

    const handleAddNew = () => {
        // If we're currently editing, clear that state first
        if (editingProject) {
            setEditingProject(null);
        }
        
        setIsAddingNew(true);
        form.reset({
            title: "",
            description: "",
            techStack: [],
            link: "",
        });
        
        // Create a temporary entry for live preview
        const tempProject: Project = {
            _id: 'temp-new',
            title: '',
            description: '',
            techStack: [],
            link: ''
        };
        
        const updatedList = [...projectList, tempProject];
        handleProjectListChange(updatedList);
    };

    const handleDeleteAll = async () => {
        if (projectList.length === 0) return;
        
        try {
            const validProjects = projectList.filter(proj => proj._id !== 'temp-new');
            
            if (validProjects.length === 0) {
                // Just clear the temporary project
                handleProjectListChange([]);
                showToast('All projects cleared.', 'success');
                return;
            }

            // Use the removeAllProjects hook function
            await removeAllProjects();
            handleProjectListChange([]);
            
            showToast('All projects deleted successfully.', 'success');
        } catch (error) {
            console.error('Error deleting all projects:', error);
            showToast('Error deleting projects. Please try again.', 'error');
        }
    };

    const handleCancelEdit = () => {
        setEditingProject(null);
        setIsAddingNew(false);
        
        // Remove temp entry if it exists
        if (isAddingNew) {
            const updatedList = projectList.filter(proj => proj._id !== 'temp-new');
            handleProjectListChange(updatedList);
        }
        
        form.reset();
        setTechInput("");
    };

    return (
        <ErrorBoundary>
            <section className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-semibold text-foreground">Projects</h2>
                            <p className="text-sm text-muted-foreground">Showcase your personal and professional projects.</p>
                        </div>
                        {!editingProject && !isAddingNew && (
                            <div className="flex gap-2">
                                {projectList.length > 0 && (
                                    <Button 
                                        onClick={handleDeleteAll} 
                                        variant="destructive" 
                                        size="sm"
                                        disabled={removeAllProjectsLoading}
                                    >
                                        {removeAllProjectsLoading ? 'Deleting...' : 'Delete All'}
                                    </Button>
                                )}
                                <Button onClick={handleAddNew} size="sm">
                                    Add Project
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="p-6 space-y-6">
                    {/* Form for adding/editing */}
                    {(editingProject || isAddingNew) && (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <h3 className="text-lg font-medium">
                                    {editingProject && editingProject._id !== 'temp-new' ? 'Edit Project' : 'Add New Project'}
                                </h3>
                                
                                <FormField 
                                    control={form.control} 
                                    name="title" 
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Project Title</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    placeholder="My Awesome Project" 
                                                    {...field}
                                                    onChange={(e) => {
                                                        field.onChange(e);
                                                        handleFieldChange('title', e.target.value);
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} 
                                />
                                
                                <FormField 
                                    control={form.control} 
                                    name="description" 
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea 
                                                    placeholder="Describe your project..." 
                                                    rows={4}
                                                    {...field}
                                                    onChange={(e) => {
                                                        field.onChange(e);
                                                        handleFieldChange('description', e.target.value);
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} 
                                />

                                {/* Technologies Section */}
                                <div className="space-y-2">
                                    <FormLabel>Technologies Used</FormLabel>
                                    <div className="flex space-x-2">
                                        <Input
                                            placeholder="Add a technology..."
                                            value={techInput}
                                            onChange={(e) => setTechInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addTechnology();
                                                }
                                            }}
                                        />
                                        <Button type="button" onClick={addTechnology} variant="outline">
                                            Add
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {form.watch("techStack")?.map((tech, index) => (
                                            <Badge key={index} variant="secondary" className="cursor-pointer">
                                                {tech}
                                                <button
                                                    type="button"
                                                    onClick={() => removeTechnology(tech as string)}
                                                    className="ml-2 text-red-500 hover:text-red-700"
                                                >
                                                    ×
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                
                                <FormField 
                                    control={form.control} 
                                    name="link" 
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Project Link (Optional)</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    placeholder="https://github.com/username/project" 
                                                    {...field}
                                                    onChange={(e) => {
                                                        field.onChange(e);
                                                        handleFieldChange('link', e.target.value);
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} 
                                />
                                
                                <div className="flex justify-end space-x-2">
                                    <Button type="button" variant="ghost" onClick={handleCancelEdit}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={addProjectLoading || updateProjectLoading}>
                                        {editingProject && editingProject._id !== 'temp-new' ? 
                                            (updateProjectLoading ? 'Updating...' : 'Update Project') : 
                                            (addProjectLoading ? 'Adding...' : 'Add Project')
                                        }
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    )}

                    {/* List of existing project items */}
                    {projectList.length > 0 && (
                        <div className="space-y-4 pt-6 border-t">
                            <h3 className="text-lg font-medium">Your Projects</h3>
                            {projectList.map((proj) => (
                                <div key={proj._id || proj.id || 'temp'} className="flex justify-between items-start p-3 bg-muted/50 rounded-md">
                                    <div className="flex-1">
                                        <p className="font-semibold">{proj.title || 'Untitled Project'}</p>
                                        {proj.description && (
                                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                {proj.description}
                                            </p>
                                        )}
                                        {proj.techStack && proj.techStack.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {proj.techStack.slice(0, 3).map((tech: string, index: number) => (
                                                    <Badge key={index} variant="outline" className="text-xs">
                                                        {tech}
                                                    </Badge>
                                                ))}
                                                {proj.techStack.length > 3 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{proj.techStack.length - 3} more
                                                    </Badge>
                                                )}
                                            </div>
                                        )}
                                        {proj.link && (
                                            <a 
                                                href={proj.link} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-xs text-blue-500 hover:text-blue-700 mt-1 block"
                                            >
                                                View Project →
                                            </a>
                                        )}
                                    </div>
                                    <div className="flex space-x-2 ml-4">
                                        <Button size="sm" variant="outline" onClick={() => handleEdit(proj)}>
                                            Edit
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant="destructive" 
                                            onClick={() => handleDelete(proj._id || proj.id || '')}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </ErrorBoundary>
    );
}
