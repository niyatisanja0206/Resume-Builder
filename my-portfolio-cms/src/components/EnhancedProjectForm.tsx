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

// --- PROPS INTERFACE ---
interface ProjectFormProps {
    initialData: Project[];
    onDataChange: (newData: Project[]) => void;
}

export default function EnhancedProjectForm({ initialData, onDataChange }: ProjectFormProps) {
    const { currentUser } = useUserContext();
    const userEmail = currentUser?.email || '';
    const { showToast } = useToast();

    // Hook for backend mutation functions
    const { addProject, updateProject, removeProject, addProjectLoading, updateProjectLoading } = useProject(userEmail);

    // --- LOCAL STATE MANAGEMENT ---
    const [projectList, setProjectList] = useState<Project[]>([]);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [techInput, setTechInput] = useState("");

    // --- DATA SYNCHRONIZATION ---
    useEffect(() => {
        setProjectList(initialData || []);
    }, [initialData]);

    // --- LIVE UPDATE HANDLER ---
    const handleProjectListChange = useCallback((newProjectList: Project[]) => {
        setProjectList(newProjectList);
        onDataChange(newProjectList);
    }, [onDataChange]);

    const form = useForm<ProjectFormSchema>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            title: "",
            description: "",
            technologies: [],
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
            technologies: currentFormData.technologies || [],
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
            const currentTech = form.getValues().technologies || [];
            const newTech = [...currentTech, techInput.trim()];
            form.setValue("technologies", newTech);
            handleFieldChange("technologies", newTech);
            setTechInput("");
        }
    };

    const removeTechnology = (techToRemove: string) => {
        const currentTech = form.getValues().technologies || [];
        const newTech = currentTech.filter(tech => tech !== techToRemove);
        form.setValue("technologies", newTech);
        handleFieldChange("technologies", newTech);
    };

    // --- HANDLERS ---
    const onSubmit = async (data: ProjectFormSchema) => {
        try {
            if (editingProject && editingProject._id !== 'temp-new') {
                // Update existing project
                const updatedProjectItem: Project = { ...editingProject, ...data };
                await updateProject(editingProject._id || '', updatedProjectItem);
                
                const updatedList = projectList.map(proj => 
                    proj._id === editingProject._id ? updatedProjectItem : proj
                );
                handleProjectListChange(updatedList);
                
                showToast("Project updated successfully!", "success");
            } else {
                // Add new project
                const newProjectItem = await addProject(data as Project);
                
                // Remove temp entry and add real one
                const filteredList = projectList.filter(proj => proj._id !== 'temp-new');
                const updatedList = [...filteredList, newProjectItem];
                handleProjectListChange(updatedList);
                
                showToast("Project added successfully!", "success");
            }
            
            // Reset form state
            setEditingProject(null);
            setIsAddingNew(false);
            form.reset();
            setTechInput("");
        } catch (error) {
            console.error('Error submitting project:', error);
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
        setEditingProject(project);
        setIsAddingNew(false);
        form.reset({
            title: project.title || '',
            description: project.description || '',
            technologies: project.technologies || [],
            link: project.link || '',
        });
    };

    const handleAddNew = () => {
        setIsAddingNew(true);
        setEditingProject(null);
        form.reset({
            title: "",
            description: "",
            technologies: [],
            link: "",
        });
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
                            <Button onClick={handleAddNew} size="sm">
                                Add Project
                            </Button>
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
                                        {form.watch("technologies")?.map((tech, index) => (
                                            <Badge key={index} variant="secondary" className="cursor-pointer">
                                                {tech}
                                                <button
                                                    type="button"
                                                    onClick={() => removeTechnology(tech)}
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
                                        {proj.technologies && proj.technologies.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {proj.technologies.slice(0, 3).map((tech, index) => (
                                                    <Badge key={index} variant="outline" className="text-xs">
                                                        {tech}
                                                    </Badge>
                                                ))}
                                                {proj.technologies.length > 3 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{proj.technologies.length - 3} more
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
