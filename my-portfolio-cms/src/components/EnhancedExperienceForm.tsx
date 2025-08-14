import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { experienceSchema, type ExperienceFormSchema } from "../lib/zodschema";
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
import { useExperience } from '../hooks/useExperience';
import { useUserContext } from '@/contexts/useUserContext';
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { type Experience } from "@/types/portfolio";
import { useToast } from '../contexts/ToastContext';
import ErrorBoundary from './ErrorBoundary';

// --- PROPS INTERFACE ---
interface ExperienceFormProps {
    initialData: Experience[];
    onDataChange: (newData: Experience[]) => void;
}

export default function EnhancedExperienceForm({ initialData, onDataChange }: ExperienceFormProps) {
    const { currentUser } = useUserContext();
    const userEmail = currentUser?.email || '';
    const { showToast } = useToast();

    // Hook for backend mutation functions
    const { addExperience, updateExperience, removeExperience, addExperienceLoading, updateExperienceLoading } = useExperience(userEmail);

    // --- LOCAL STATE MANAGEMENT ---
    const [experienceList, setExperienceList] = useState<Experience[]>([]);
    const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [skillInput, setSkillInput] = useState("");

    // --- DATA SYNCHRONIZATION ---
    useEffect(() => {
        setExperienceList(initialData || []);
    }, [initialData]);

    // --- LIVE UPDATE HANDLER ---
    const handleExperienceListChange = useCallback((newExperienceList: Experience[]) => {
        setExperienceList(newExperienceList);
        onDataChange(newExperienceList);
    }, [onDataChange]);

    const form = useForm<ExperienceFormSchema>({
        resolver: zodResolver(experienceSchema),
        defaultValues: {
            company: "",
            position: "",
            startDate: new Date(),
            endDate: undefined,
            description: "",
            skillsLearned: [],
        },
    });

    // --- LIVE UPDATE FOR FORM FIELDS ---
    const handleFieldChange = useCallback((fieldName: keyof ExperienceFormSchema, value: string | Date | undefined | string[]) => {
        // Update the form field
        form.setValue(fieldName, value);
        
        // Get current form values
        const currentFormData = form.getValues();
        
        // Create updated experience object
        const updatedExperience: Experience = {
            _id: editingExperience?._id || (isAddingNew ? 'temp-new' : ''),
            company: currentFormData.company || '',
            position: currentFormData.position || '',
            startDate: currentFormData.startDate || new Date(),
            endDate: currentFormData.endDate,
            description: currentFormData.description || '',
            skillsLearned: currentFormData.skillsLearned || []
        };

        let updatedList: Experience[];
        
        if (editingExperience) {
            // Update existing experience item
            updatedList = experienceList.map(exp => 
                exp._id === editingExperience._id ? updatedExperience : exp
            );
        } else if (isAddingNew) {
            // Update the temporary new entry or add it if it doesn't exist
            const tempIndex = experienceList.findIndex(exp => exp._id === 'temp-new');
            if (tempIndex >= 0) {
                updatedList = [...experienceList];
                updatedList[tempIndex] = updatedExperience;
            } else {
                updatedList = [...experienceList, updatedExperience];
            }
        } else {
            updatedList = experienceList;
        }
        
        handleExperienceListChange(updatedList);
    }, [form, editingExperience, isAddingNew, experienceList, handleExperienceListChange]);

    // --- SKILL MANAGEMENT ---
    const addSkill = () => {
        if (skillInput.trim()) {
            const currentSkills = form.getValues().skillsLearned || [];
            const newSkills = [...currentSkills, skillInput.trim()];
            form.setValue("skillsLearned", newSkills);
            handleFieldChange("skillsLearned", newSkills);
            setSkillInput("");
        }
    };

    const removeSkill = (skillToRemove: string) => {
        const currentSkills = form.getValues().skillsLearned || [];
        const newSkills = currentSkills.filter(skill => skill !== skillToRemove);
        form.setValue("skillsLearned", newSkills);
        handleFieldChange("skillsLearned", newSkills);
    };
    
    // --- HANDLERS ---
    const onSubmit = async (data: ExperienceFormSchema) => {
        try {
            if (editingExperience && editingExperience._id !== 'temp-new') {
                // Update existing experience
                const updatedExperienceItem: Experience = { ...editingExperience, ...data };
                await updateExperience(editingExperience._id || '', updatedExperienceItem);
                
                const updatedList = experienceList.map(exp => 
                    exp._id === editingExperience._id ? updatedExperienceItem : exp
                );
                handleExperienceListChange(updatedList);
                
                showToast("Experience updated successfully!", "success");
            } else {
                // Add new experience
                const newExperienceItem = await addExperience(data as Experience);
                
                // Remove temp entry and add real one
                const filteredList = experienceList.filter(exp => exp._id !== 'temp-new');
                const updatedList = [...filteredList, newExperienceItem];
                handleExperienceListChange(updatedList);
                
                showToast("Experience added successfully!", "success");
            }
            
            // Reset form state
            setEditingExperience(null);
            setIsAddingNew(false);
            form.reset();
            setSkillInput("");
        } catch (error) {
            console.error('Error submitting experience:', error);
            showToast('Failed to save experience', 'error');
        }
    };

    const handleDelete = async (experienceId: string) => {
        if (experienceId === 'temp-new') {
            // Just remove from local state if it's a temporary entry
            const updatedList = experienceList.filter(exp => exp._id !== experienceId);
            handleExperienceListChange(updatedList);
            setIsAddingNew(false);
            setEditingExperience(null);
            form.reset();
            return;
        }

        if (window.confirm('Are you sure you want to delete this experience?')) {
            try {
                await removeExperience(experienceId);
                const updatedList = experienceList.filter(exp => exp._id !== experienceId);
                handleExperienceListChange(updatedList);
                showToast("Experience deleted successfully!", "success");
            } catch (error) {
                console.error('Error deleting experience:', error);
                showToast('Failed to delete experience', 'error');
            }
        }
    };

    const handleEdit = (experience: Experience) => {
        setEditingExperience(experience);
        setIsAddingNew(false);
        form.reset({
            company: experience.company || '',
            position: experience.position || '',
            startDate: experience.startDate ? new Date(experience.startDate) : new Date(),
            endDate: experience.endDate ? new Date(experience.endDate) : undefined,
            description: experience.description || '',
            skillsLearned: experience.skillsLearned || [],
        });
    };

    const handleAddNew = () => {
        setIsAddingNew(true);
        setEditingExperience(null);
        form.reset({
            company: "",
            position: "",
            startDate: new Date(),
            endDate: undefined,
            description: "",
            skillsLearned: [],
        });
    };

    const handleCancelEdit = () => {
        setEditingExperience(null);
        setIsAddingNew(false);
        
        // Remove temp entry if it exists
        if (isAddingNew) {
            const updatedList = experienceList.filter(exp => exp._id !== 'temp-new');
            handleExperienceListChange(updatedList);
        }
        
        form.reset();
        setSkillInput("");
    };

    return (
        <ErrorBoundary>
            <section className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-semibold text-foreground">Work Experience</h2>
                            <p className="text-sm text-muted-foreground">Your professional work history and accomplishments.</p>
                        </div>
                        {!editingExperience && !isAddingNew && (
                            <Button onClick={handleAddNew} size="sm">
                                Add Experience
                            </Button>
                        )}
                    </div>
                </div>
                
                <div className="p-6 space-y-6">
                    {/* Form for adding/editing */}
                    {(editingExperience || isAddingNew) && (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <h3 className="text-lg font-medium">
                                    {editingExperience && editingExperience._id !== 'temp-new' ? 'Edit Experience' : 'Add New Experience'}
                                </h3>
                                
                                <FormField 
                                    control={form.control} 
                                    name="company" 
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Company</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    placeholder="Company Name" 
                                                    {...field}
                                                    onChange={(e) => {
                                                        field.onChange(e);
                                                        handleFieldChange('company', e.target.value);
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} 
                                />
                                
                                <FormField 
                                    control={form.control} 
                                    name="position" 
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Position</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    placeholder="Job Title" 
                                                    {...field}
                                                    onChange={(e) => {
                                                        field.onChange(e);
                                                        handleFieldChange('position', e.target.value);
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} 
                                />
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField 
                                        control={form.control} 
                                        name="startDate" 
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Start Date</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        type="date" 
                                                        value={field.value ? new Date(field.value).toISOString().split("T")[0] : ""} 
                                                        onChange={(e) => {
                                                            const newDate = new Date(e.target.value);
                                                            field.onChange(newDate);
                                                            handleFieldChange('startDate', newDate);
                                                        }} 
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} 
                                    />
                                    
                                    <FormField 
                                        control={form.control} 
                                        name="endDate" 
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>End Date</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        type="date" 
                                                        value={field.value ? new Date(field.value).toISOString().split("T")[0] : ""} 
                                                        onChange={(e) => {
                                                            const newDate = e.target.value ? new Date(e.target.value) : undefined;
                                                            field.onChange(newDate);
                                                            handleFieldChange('endDate', newDate);
                                                        }} 
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} 
                                    />
                                </div>
                                
                                <FormField 
                                    control={form.control} 
                                    name="description" 
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea 
                                                    placeholder="Describe your role and achievements..." 
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

                                {/* Skills Learned Section */}
                                <div className="space-y-2">
                                    <FormLabel>Skills Learned</FormLabel>
                                    <div className="flex space-x-2">
                                        <Input
                                            placeholder="Add a skill..."
                                            value={skillInput}
                                            onChange={(e) => setSkillInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addSkill();
                                                }
                                            }}
                                        />
                                        <Button type="button" onClick={addSkill} variant="outline">
                                            Add
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {form.watch("skillsLearned")?.map((skill, index) => (
                                            <Badge key={index} variant="secondary" className="cursor-pointer">
                                                {skill}
                                                <button
                                                    type="button"
                                                    onClick={() => removeSkill(skill)}
                                                    className="ml-2 text-red-500 hover:text-red-700"
                                                >
                                                    ×
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="flex justify-end space-x-2">
                                    <Button type="button" variant="ghost" onClick={handleCancelEdit}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={addExperienceLoading || updateExperienceLoading}>
                                        {editingExperience && editingExperience._id !== 'temp-new' ? 
                                            (updateExperienceLoading ? 'Updating...' : 'Update Experience') : 
                                            (addExperienceLoading ? 'Adding...' : 'Add Experience')
                                        }
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    )}

                    {/* List of existing experience items */}
                    {experienceList.length > 0 && (
                        <div className="space-y-4 pt-6 border-t">
                            <h3 className="text-lg font-medium">Your Work History</h3>
                            {experienceList.map((exp) => (
                                <div key={exp._id || exp.id || 'temp'} className="flex justify-between items-start p-3 bg-muted/50 rounded-md">
                                    <div className="flex-1">
                                        <p className="font-semibold">{exp.position || 'Untitled Position'}</p>
                                        <p className="text-sm text-muted-foreground">{exp.company || 'Company'}</p>
                                        {exp.description && (
                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                {exp.description}
                                            </p>
                                        )}
                                        {exp.skillsLearned && exp.skillsLearned.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {exp.skillsLearned.slice(0, 3).map((skill, index) => (
                                                    <Badge key={index} variant="outline" className="text-xs">
                                                        {skill}
                                                    </Badge>
                                                ))}
                                                {exp.skillsLearned.length > 3 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{exp.skillsLearned.length - 3} more
                                                    </Badge>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex space-x-2 ml-4">
                                        <Button size="sm" variant="outline" onClick={() => handleEdit(exp)}>
                                            Edit
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant="destructive" 
                                            onClick={() => handleDelete(exp._id || exp.id || '')}
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
