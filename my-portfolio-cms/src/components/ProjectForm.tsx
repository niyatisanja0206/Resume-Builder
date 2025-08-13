import { useState, useEffect } from "react";
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

// --- NEW PROPS INTERFACE ---
interface ProjectFormProps {
    initialData: Project[];
    onDataChange: (newData: Project[]) => void;
}

export default function ProjectForm({ initialData, onDataChange }: ProjectFormProps) {
    const { currentUser } = useUserContext();
    const userEmail = currentUser?.email || '';

    // Hook is kept for its backend mutation functions
    const { addProject, updateProject, removeProject, addProjectLoading, updateProjectLoading } = useProject(userEmail);

    // --- LOCAL STATE MANAGEMENT ---
    const [projectList, setProjectList] = useState<Project[]>([]);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [successMessage, setSuccessMessage] = useState<string>("");
    const [techInput, setTechInput] = useState("");

    // --- DATA SYNCHRONIZATION ---
    useEffect(() => {
        setProjectList(initialData || []);
    }, [initialData]);

    const form = useForm<ProjectFormSchema>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            title: "",
            description: "",
            techStack: [],
            link: "",
        },
    });
    
    // --- HANDLERS ---
    const onSubmit = async (data: ProjectFormSchema) => {
        try {
            if (editingProject) {
                // Update existing project
                const updatedProjectItem: Project = { ...editingProject, ...data };
                await updateProject(editingProject._id || editingProject.id || '', updatedProjectItem);
                
                const updatedList = projectList.map(proj => 
                    proj._id === updatedProjectItem._id ? updatedProjectItem : proj
                );
                setProjectList(updatedList);
                onDataChange(updatedList); // Notify parent
                
                setSuccessMessage("Project updated successfully!");
                setEditingProject(null);
            } else {
                // Add new project
                const newProjectItem = await addProject(data as Project);
                const updatedList = [...projectList, newProjectItem];
                setProjectList(updatedList);
                onDataChange(updatedList); // Notify parent
                
                setSuccessMessage("Project added successfully!");
            }
            form.reset();
            setTechInput("");
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (error) {
            console.error('Error submitting project:', error);
        }
    };

    const handleDelete = async (projectId: string) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            try {
                await removeProject(projectId);
                const updatedList = projectList.filter(proj => proj._id !== projectId);
                setProjectList(updatedList);
                onDataChange(updatedList); // Notify parent
                setSuccessMessage("Project deleted successfully!");
                setTimeout(() => setSuccessMessage(""), 3000);
            } catch (error) {
                console.error('Error deleting project:', error);
            }
        }
    };

    const handleEdit = (project: Project) => {
        setEditingProject(project);
        form.reset({
            title: project.title || '',
            description: project.description || '',
            techStack: project.techStack || [],
            link: project.link || '',
        });
    };

    const handleCancelEdit = () => {
        setEditingProject(null);
        form.reset();
        setTechInput("");
    };

    const addTechToForm = () => {
        if (techInput.trim()) {
            const currentTech = form.getValues("techStack") || [];
            form.setValue("techStack", [...currentTech, techInput.trim()]);
            setTechInput("");
        }
    };

    const removeTechFromForm = (index: number) => {
        const currentTech = form.getValues("techStack") || [];
        form.setValue("techStack", currentTech.filter((_, i) => i !== index));
    };
    
    return (
        <section className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border">
                <h2 className="text-xl font-semibold text-foreground">Projects</h2>
                <p className="text-sm text-muted-foreground">Showcase your work and technical achievements.</p>
            </div>
            <div className="p-6 space-y-6">
                {successMessage && (
                    <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded-md text-sm">
                        {successMessage}
                    </div>
                )}
                
                {/* Add/Edit Form */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <h3 className="text-lg font-medium">{editingProject ? 'Edit Project' : 'Add New Project'}</h3>
                        <FormField control={form.control} name="title" render={({ field }) => (
                            <FormItem><FormLabel>Project Title</FormLabel><FormControl><Input placeholder="Project Name" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe your project..." {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="link" render={({ field }) => (
                            <FormItem><FormLabel>Link (Live or Repo)</FormLabel><FormControl><Input placeholder="https://github.com/user/repo" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <div>
                            <FormLabel>Tech Stack</FormLabel>
                            <div className="flex space-x-2 mt-2">
                                <Input placeholder="Add a technology and press Enter" value={techInput} onChange={(e) => setTechInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTechToForm(); }}} />
                                <Button type="button" onClick={addTechToForm}>Add</Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {form.watch("techStack").map((tech, index) => (
                                    <Badge key={index} variant="secondary" onClick={() => removeTechFromForm(index)} className="cursor-pointer">{tech} &times;</Badge>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                            {editingProject && <Button type="button" variant="ghost" onClick={handleCancelEdit}>Cancel</Button>}
                            <Button type="submit" disabled={addProjectLoading || updateProjectLoading}>
                                {editingProject ? (updateProjectLoading ? 'Updating...' : 'Update Project') : (addProjectLoading ? 'Adding...' : 'Add Project')}
                            </Button>
                        </div>
                    </form>
                </Form>

                {/* List of existing projects */}
                {projectList.length > 0 && (
                    <div className="space-y-4 pt-6 border-t">
                        <h3 className="text-lg font-medium">Your Project History</h3>
                        {projectList.map((proj) => (
                            <div key={proj._id || proj.id} className="flex justify-between items-start p-3 bg-muted/50 rounded-md">
                                <div className="flex-1">
                                    <p className="font-semibold">{proj.title}</p>
                                    <p className="text-sm text-muted-foreground">{proj.description}</p>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {proj.techStack?.map((tech, i) => <Badge key={i} variant="outline">{tech}</Badge>)}
                                    </div>
                                </div>
                                <div className="flex space-x-2 ml-4">
                                    <Button size="sm" variant="outline" onClick={() => handleEdit(proj)}>Edit</Button>
                                    <Button size="sm" variant="destructive" onClick={() => handleDelete(proj._id || proj.id || '')}>Delete</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
