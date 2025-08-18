import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { experienceSchema, type ExperienceFormSchema } from "../../lib/zodschema";
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
import { useExperience } from '../../hooks/useExperience';
import { useUserContext } from '@/hooks/useUserContext';
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { type Experience } from "@/types/portfolio";
import { useToast } from '../../contexts/ToastContext';
import ErrorBoundary from './ErrorBoundary';
import { shouldShowToast } from '@/utils/toastUtils';

// --- PROPS INTERFACE ---
interface ExperienceFormProps {
    initialData: Experience[];
    onDataChange: (newData: Experience[]) => void;
}

export default function EnhancedExperienceForm({ initialData, onDataChange }: ExperienceFormProps) {
    console.log('🔄 EnhancedExperienceForm rendered with initialData:', initialData);
    
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
        addExperience, 
        updateExperience, 
        removeExperience, 
        removeAllExperiences,
        addExperienceLoading, 
        updateExperienceLoading,
        removeAllExperiencesLoading 
    } = useExperience(userEmail);

    // --- LOCAL STATE MANAGEMENT ---
    const [experienceList, setExperienceList] = useState<Experience[]>([]);
    const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [skillInput, setSkillInput] = useState("");

    // --- DATA SYNCHRONIZATION ---
    useEffect(() => {
        console.log('💼 Received initialData:', initialData);
        if (Array.isArray(initialData) && initialData.length > 0) {
            const processedData = initialData.map((item) => ({
                ...item,
                startDate: item.startDate ? new Date(item.startDate) : new Date(),
                endDate: item.endDate ? new Date(item.endDate) : undefined,
            }));
            console.log('💼 Processed experience data:', processedData);
            setExperienceList(processedData);
        } else if (Array.isArray(initialData) && initialData.length === 0) {
            console.log('💼 Initial data is empty array, setting empty list');
            setExperienceList([]);
        } else {
            console.log('💼 Initial data is null/undefined or invalid, keeping current list');
            // Don't reset if we have existing data and initialData is invalid
        }
    }, [initialData]);

    // Debug onDataChange prop
    const debugOnDataChange = useCallback((data: Experience[]) => {
        console.log('🔄 onDataChange called with:', data);
        onDataChange(data);
    }, [onDataChange]);

    // --- LIVE UPDATE HANDLER ---
    const handleExperienceListChange = useCallback((newExperienceList: Experience[]) => {
        console.log('💼 Updating experience list:', newExperienceList);
        console.log('💼 Calling onDataChange with:', newExperienceList);
        setExperienceList(newExperienceList);
        debugOnDataChange(newExperienceList);
    }, [debugOnDataChange]);

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
            if (editingExperience) {
                // Update existing experience entry
                const updatedExperienceItem: Experience = { 
                    ...editingExperience, 
                    ...data,
                    _id: editingExperience._id || editingExperience.id
                } as Experience;
                
                const result = await updateExperience(editingExperience._id || editingExperience.id || '', updatedExperienceItem);

                // Handle different hook return types
                let nextList: Experience[];
                if (Array.isArray(result)) {
                    nextList = result as Experience[];
                } else if (result && typeof result === 'object') {
                    nextList = experienceList.map((e) =>
                        (e._id || e.id) === (updatedExperienceItem._id || updatedExperienceItem.id)
                            ? (result as Experience)
                            : e
                    );
                } else {
                    nextList = experienceList.map((e) =>
                        (e._id || e.id) === (updatedExperienceItem._id || updatedExperienceItem.id)
                            ? updatedExperienceItem
                            : e
                    );
                }

                handleExperienceListChange(nextList);
                showToast('Experience updated successfully!', 'success');
            } else {
                // Add new experience entry
                const experienceData: Experience = { 
                    ...data,
                    // Ensure dates are properly formatted
                    startDate: data.startDate || new Date(),
                    endDate: data.endDate || undefined
                } as Experience;
                
                const result = await addExperience(experienceData);
                console.log('✅ Add experience result:', result);

                let nextItem: Experience | null = null;
                if (Array.isArray(result)) {
                    // If API returns a list, assume last one is newest
                    nextItem = (result as Experience[])[(result as Experience[]).length - 1] || null;
                    console.log('📋 Result is array, using last item:', nextItem);
                } else if (result && typeof result === 'object') {
                    nextItem = result as Experience;
                    console.log('📝 Result is object, using directly:', nextItem);
                }

                // Remove temp entry and add the real one
                const withoutTemp = experienceList.filter((exp) => exp._id !== 'temp-new');
                console.log('🗑️ Filtered list without temp:', withoutTemp);
                
                const finalExperience: Experience = {
                    ...experienceData,
                    _id: nextItem?._id || `saved-${Date.now()}`,
                    id: nextItem?.id || `saved-${Date.now()}`,
                    company: nextItem?.company || experienceData.company,
                    position: nextItem?.position || experienceData.position,
                    startDate: nextItem?.startDate || experienceData.startDate,
                    endDate: nextItem?.endDate || experienceData.endDate,
                    description: nextItem?.description || experienceData.description,
                    skillsLearned: nextItem?.skillsLearned || experienceData.skillsLearned,
                };
                
                const updatedList = [...withoutTemp, finalExperience];
                console.log('💼 Final updated list:', updatedList);
                handleExperienceListChange(updatedList);
                showToast('Experience added successfully!', 'success');
            }

            // Reset form state but keep the data visible
            setEditingExperience(null);
            setIsAddingNew(false);
            form.reset({
                company: '',
                position: '',
                startDate: new Date(),
                endDate: undefined,
                description: '',
                skillsLearned: [],
            });
            setSkillInput("");
            
        } catch (error) {
            console.error('Error saving experience:', error);
            showToast('Failed to save experience', 'error');
        }
    };

    const handleDelete = async (experienceId: string) => {
        if (!experienceId) return;
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
            setIsDeleting(true);
            try {
                await removeExperience(experienceId);
                const updatedList = experienceList.filter(exp => (exp._id || exp.id) !== experienceId);
                console.log('🗑️ Delete operation - filtered list:', updatedList);
                handleExperienceListChange(updatedList);
                showToast('Experience deleted successfully!', 'success');
                if ((editingExperience?._id || editingExperience?.id) === experienceId) {
                    setEditingExperience(null);
                    setIsAddingNew(false);
                    form.reset();
                }
            } catch {
                showToast('Failed to delete experience', 'error');
            } finally {
                setIsDeleting(false);
            }
        }
    };

    const handleEdit = (experience: Experience) => {
        // If we're currently adding a new entry, remove the temp entry
        if (isAddingNew) {
            handleExperienceListChange(experienceList.filter((exp) => exp._id !== 'temp-new'));
        }
        
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
        // If we're currently editing, clear that state first
        if (editingExperience) {
            setEditingExperience(null);
        }
        
        setIsAddingNew(true);
        form.reset({
            company: "",
            position: "",
            startDate: new Date(),
            endDate: undefined,
            description: "",
            skillsLearned: [],
        });
        
        // Create a temporary entry for live preview
        const tempExperience: Experience = {
            _id: 'temp-new',
            company: '',
            position: '',
            startDate: new Date(),
            endDate: undefined,
            description: '',
            skillsLearned: []
        };
        
        const updatedList = [...experienceList, tempExperience];
        handleExperienceListChange(updatedList);
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

    const handleDeleteAll = async () => {
        if (window.confirm('Are you sure you want to delete ALL experience entries? This action cannot be undone.')) {
            setIsDeleting(true);
            try {
                await removeAllExperiences();
                console.log('🗑️ Delete all operation - setting empty list');
                handleExperienceListChange([]);
                showToast('All experience entries deleted successfully!', 'success');
            } catch {
                showToast('Failed to delete all experience entries', 'error');
            } finally {
                setIsDeleting(false);
            }
        }
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
                            <div className="flex space-x-2">
                                <Button onClick={handleAddNew} size="sm">
                                    Add Experience
                                </Button>
                                {experienceList.filter(exp => exp._id !== 'temp-new' && (exp.company || exp.position)).length > 0 && (
                                    <Button 
                                        onClick={handleDeleteAll} 
                                        size="sm" 
                                        variant="destructive"
                                        disabled={removeAllExperiencesLoading}
                                    >
                                        {removeAllExperiencesLoading ? 'Deleting All...' : 'Delete All'}
                                    </Button>
                                )}
                            </div>
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
                    {experienceList.filter(exp => exp._id !== 'temp-new' && (exp.company || exp.position)).length > 0 ? (
                        <div className="space-y-4 pt-6 border-t">
                            <h3 className="text-lg font-medium">Your Work History</h3>
                            {experienceList
                                .filter(exp => exp._id !== 'temp-new' && (exp.company || exp.position))
                                .map((exp) => (
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
                                            disabled={isDeleting}
                                        >
                                            {isDeleting ? 'Deleting...' : 'Delete'}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>No work experience added yet.</p>
                            <p className="text-sm">Click "Add Experience" to get started!</p>
                        </div>
                    )}
                </div>
            </section>
        </ErrorBoundary>
    );
}
