import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { skillSchema, type SkillFormSchema } from "../lib/zodschema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Skill } from "@/types/portfolio";
import { useSkill } from "../hooks/useSkills";
import { useUserContext } from "@/contexts/useUserContext";
import { useToast } from '../contexts/ToastContext';
import ErrorBoundary from './ErrorBoundary';
import { shouldShowToast } from '@/utils/toastUtils';
import { Edit2, Trash2 } from "lucide-react";

// --- PROPS INTERFACE ---
interface SkillFormProps {
    initialData: Skill[];
    onDataChange: (newData: Skill[]) => void;
}

export default function EnhancedSkillForm({ initialData, onDataChange }: SkillFormProps) {
    console.log('🔄 EnhancedSkillForm rendered with initialData:', initialData);
    
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
        addSkill, 
        updateSkill, 
        removeSkill, 
        removeAllSkills,
        addSkillLoading, 
        updateSkillLoading,
        removeAllSkillsLoading 
    } = useSkill(userEmail);

    // --- LOCAL STATE MANAGEMENT ---
    const [skillList, setSkillList] = useState<Skill[]>([]);
    const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
    const [isAddingNew, setIsAddingNew] = useState(false);

    // --- DATA SYNCHRONIZATION ---
    useEffect(() => {
        console.log('🚀 Received initialData:', initialData);
        if (Array.isArray(initialData) && initialData.length > 0) {
            console.log('🚀 Processed skill data:', initialData);
            setSkillList(initialData);
        } else if (Array.isArray(initialData) && initialData.length === 0) {
            console.log('🚀 Initial data is empty array, setting empty list');
            setSkillList([]);
        } else {
            console.log('🚀 Initial data is null/undefined or invalid, keeping current list');
            // Don't reset if we have existing data and initialData is invalid
        }
    }, [initialData]);

    // Debug onDataChange prop
    useEffect(() => {
        console.log('🔄 onDataChange prop function:', typeof onDataChange);
    }, [onDataChange]);

    // Live update handler for skill data changes
    const handleSkillListChange = useCallback((newSkillList: Skill[]) => {
        console.log('📡 handleSkillListChange called with:', newSkillList);
        setSkillList(newSkillList);
        if (typeof onDataChange === 'function') {
            onDataChange(newSkillList);
        } else {
            console.warn('⚠️ onDataChange is not a function');
        }
    }, [onDataChange]);

    // --- FORM SETUP ---
    const form = useForm<SkillFormSchema>({
        resolver: zodResolver(skillSchema),
        defaultValues: {
            name: '',
            level: 'beginner',
        },
        mode: 'onChange'
    });

    // --- LIVE UPDATE FOR FORM FIELDS (letter-to-letter) ---
    const handleFieldChange = useCallback(
        (
            fieldName: keyof SkillFormSchema,
            value: string
        ) => {
            // Update the form value immediately
            form.setValue(fieldName, value, { shouldDirty: true, shouldTouch: true });
            
            // Get the current form data with the new value
            const currentFormData = {
                ...form.getValues(),
                [fieldName]: value
            };

            const updatedSkill: Skill = {
                ...((editingSkill as Skill) || {}),
                _id: editingSkill?._id || 'temp-new',
                name: currentFormData.name || '',
                level: currentFormData.level || 'beginner',
            } as Skill;

            let updatedList: Skill[];

            if (editingSkill) {
                // Update existing skill entry
                updatedList = skillList.map((skill) =>
                    skill._id === editingSkill._id
                        ? updatedSkill
                        : skill
                );
            } else if (isAddingNew) {
                // Update temp entry or add it if it doesn't exist
                const tempIndex = skillList.findIndex((skill) => skill._id === 'temp-new');
                if (tempIndex >= 0) {
                    updatedList = [...skillList];
                    updatedList[tempIndex] = updatedSkill;
                } else {
                    updatedList = [...skillList, updatedSkill];
                }
            } else {
                updatedList = skillList;
            }

            // Update the skill list and trigger live preview update
            handleSkillListChange(updatedList);
        },
        [form, editingSkill, isAddingNew, skillList, handleSkillListChange]
    );

    // --- FORM RESET LOGIC ---
    useEffect(() => {
        if (editingSkill && editingSkill._id !== 'temp-new') {
            console.log('📝 Setting form for editing skill:', editingSkill);
            form.reset({
                name: editingSkill.name,
                level: editingSkill.level,
            });
        } else {
            console.log('📝 Resetting form for new skill');
            form.reset({
                name: '',
                level: 'beginner',
            });
        }
    }, [editingSkill, form]);

    // --- FORM SUBMISSION HANDLER ---
    const onSubmit = async (data: SkillFormSchema) => {
        console.log('📤 Form submitted with data:', data);
        
        try {
            if (editingSkill && editingSkill._id !== 'temp-new') {
                // Update existing skill
                console.log('🔄 Updating skill:', editingSkill._id);
                const result = await updateSkill(editingSkill._id!, {
                    ...data,
                    _id: editingSkill._id
                } as Skill);
                
                console.log('✅ Update skill result:', result);
                
                // Handle both array and single skill response
                if (Array.isArray(result)) {
                    handleSkillListChange(result);
                } else {
                    const updatedSkills = skillList.map(skill => 
                        skill._id === editingSkill._id ? result : skill
                    );
                    handleSkillListChange(updatedSkills);
                }
                
                setEditingSkill(null);
                form.reset();
                showToast('Skill updated successfully!', 'success');
            } else {
                // Add new skill
                console.log('➕ Adding new skill');
                const skillData: Skill = { 
                    ...data,
                } as Skill;
                
                const result = await addSkill(skillData);
                console.log('✅ Add skill result:', result);

                let nextItem: Skill | null = null;
                if (Array.isArray(result)) {
                    // If API returns a list, assume last one is newest
                    nextItem = (result as Skill[])[(result as Skill[]).length - 1] || null;
                    console.log('📋 Result is array, using last item:', nextItem);
                } else if (result && typeof result === 'object') {
                    nextItem = result as Skill;
                    console.log('📝 Result is object, using directly:', nextItem);
                }

                // Remove temp entry and add the real one
                const withoutTemp = skillList.filter((skill) => skill._id !== 'temp-new');
                console.log('🗑️ Filtered list without temp:', withoutTemp);
                
                const finalSkill: Skill = {
                    ...skillData,
                    _id: nextItem?._id || `saved-${Date.now()}`,
                    name: nextItem?.name || skillData.name,
                    level: nextItem?.level || skillData.level,
                };
                
                const updatedList = [...withoutTemp, finalSkill];
                console.log('🎯 Final updated list:', updatedList);
                handleSkillListChange(updatedList);
                showToast('Skill added successfully!', 'success');
            }

            // Reset form state but keep the data visible
            setEditingSkill(null);
            setIsAddingNew(false);
            form.reset({
                name: '',
                level: 'beginner',
            });
        } catch (error) {
            console.error('❌ Error in skill submission:', error);
            showToast(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
        }
    };

    // --- DELETE HANDLERS ---
    const handleDelete = async (skillId?: string) => {
        if (!skillId || skillId === 'temp-new') return;
        
        if (window.confirm('Are you sure you want to delete this skill?')) {
            try {
                console.log('🗑️ Deleting skill:', skillId);
                await removeSkill(skillId);
                
                const updatedSkills = skillList.filter(skill => skill._id !== skillId);
                handleSkillListChange(updatedSkills);
                
                if (editingSkill?._id === skillId) {
                    setEditingSkill(null);
                    form.reset();
                }
                
                showToast('Skill deleted successfully!', 'success');
            } catch (error) {
                console.error('❌ Error deleting skill:', error);
                showToast(`Error deleting skill: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
            }
        }
    };

    const handleDeleteAll = async () => {
        if (skillList.length === 0) return;
        
        try {
            const validSkills = skillList.filter(skill => skill._id !== 'temp-new');
            
            if (validSkills.length === 0) {
                // Just clear the temporary skill
                handleSkillListChange([]);
                showToast('All skills cleared.', 'success');
                return;
            }

            // Use the removeAllSkills hook function
            await removeAllSkills();
            handleSkillListChange([]);
            
            showToast('All skills deleted successfully.', 'success');
        } catch (error) {
            console.error('Error deleting all skills:', error);
            showToast('Error deleting skills. Please try again.', 'error');
        }
    };

    // --- UI HANDLERS ---
    const handleAddNew = () => {
        setIsAddingNew(true);
        setEditingSkill(null);
        
        // Reset form with default values
        form.reset({
            name: '',
            level: 'beginner',
        });
        
        // Add an immediate empty temp row so preview shows instantly
        const hasTemp = skillList.some((s) => s._id === 'temp-new');
        if (!hasTemp) {
            const tempSkill: Skill = {
                _id: 'temp-new',
                name: '',
                level: 'beginner',
            } as Skill;
            
            handleSkillListChange([...skillList, tempSkill]);
        }
    };

    const handleEdit = (skill: Skill) => {
        // If we're currently adding a new entry, remove the temp entry
        if (isAddingNew) {
            handleSkillListChange(skillList.filter((s) => s._id !== 'temp-new'));
        }
        
        setEditingSkill(skill);
        setIsAddingNew(false);
        
        form.reset({
            name: skill.name || '',
            level: skill.level || 'beginner',
        });
    };

    const handleCancelEdit = () => {
        // Remove temp entry if we were adding a new one
        if (isAddingNew) {
            handleSkillListChange(skillList.filter((skill) => skill._id !== 'temp-new'));
        }
        
        setEditingSkill(null);
        setIsAddingNew(false);
        form.reset();
    };

    // --- RENDER LOGIC ---
    return (
        <ErrorBoundary>
            <section className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-semibold text-foreground">Skills</h2>
                            <p className="text-sm text-muted-foreground">Add your technical and professional skills.</p>
                        </div>
                        {!editingSkill && !isAddingNew && (
                            <div className="flex gap-2">
                                {skillList.length > 0 && (
                                    <Button 
                                        onClick={handleDeleteAll} 
                                        variant="destructive" 
                                        size="sm"
                                        disabled={removeAllSkillsLoading}
                                    >
                                        {removeAllSkillsLoading ? 'Deleting...' : 'Delete All'}
                                    </Button>
                                )}
                                <Button onClick={handleAddNew} size="sm">
                                    Add Skill
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="p-6 space-y-6">
                    {/* Form for adding/editing */}
                    {(editingSkill || isAddingNew) && (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <h3 className="text-lg font-medium">
                                    {editingSkill && editingSkill._id !== 'temp-new' ? 'Edit Skill' : 'Add New Skill'}
                                </h3>
                                
                                <FormField 
                                    control={form.control} 
                                    name="name" 
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Skill Name</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    placeholder="e.g., JavaScript, Leadership, Design" 
                                                    {...field}
                                                    onChange={(e) => {
                                                        field.onChange(e);
                                                        handleFieldChange('name', e.target.value);
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField 
                                    control={form.control} 
                                    name="level" 
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Proficiency Level</FormLabel>
                                            <Select 
                                                value={field.value} 
                                                onValueChange={(value) => {
                                                    field.onChange(value);
                                                    handleFieldChange('level', value);
                                                }}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select proficiency level" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="beginner">Beginner</SelectItem>
                                                    <SelectItem value="intermediate">Intermediate</SelectItem>
                                                    <SelectItem value="advanced">Advanced</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex gap-2">
                                    <Button 
                                        type="submit" 
                                        disabled={!form.formState.isValid || addSkillLoading || updateSkillLoading}
                                    >
                                        {(addSkillLoading || updateSkillLoading) ? (
                                            editingSkill && editingSkill._id !== 'temp-new' ? 'Updating...' : 'Adding...'
                                        ) : (
                                            editingSkill && editingSkill._id !== 'temp-new' ? 'Update Skill' : 'Add Skill'
                                        )}
                                    </Button>
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        onClick={handleCancelEdit}
                                        disabled={addSkillLoading || updateSkillLoading}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    )}

                    {/* Skills List */}
                    {skillList.length > 0 ? (
                        <div className="space-y-3">
                            <h4 className="text-lg font-medium text-foreground">Your Skills</h4>
                            <div className="grid gap-3">
                                {skillList.map((skill, index) => (
                                    <div 
                                        key={skill._id || `skill-${index}`}
                                        className={`p-4 border rounded-lg transition-all duration-200 hover:shadow-sm ${
                                            skill._id === 'temp-new' 
                                                ? 'border-dashed border-blue-300 bg-blue-50' 
                                                : 'border-border bg-background'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h5 className="font-medium text-foreground">
                                                        {skill.name || 'Untitled Skill'}
                                                    </h5>
                                                    <Badge 
                                                        variant={
                                                            skill.level === 'advanced' ? 'default' :
                                                            skill.level === 'intermediate' ? 'secondary' : 'outline'
                                                        }
                                                        className="text-xs"
                                                    >
                                                        {skill.level?.charAt(0).toUpperCase() + skill.level?.slice(1)}
                                                    </Badge>
                                                </div>
                                            </div>
                                            
                                            {/* Action buttons - hide for temp entries */}
                                            {skill._id !== 'temp-new' && !editingSkill && !isAddingNew && (
                                                <div className="flex gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleEdit(skill)}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleDelete(skill._id)}
                                                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        !isAddingNew && !editingSkill && (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground mb-4">No skills added yet.</p>
                                <Button onClick={handleAddNew}>Add Your First Skill</Button>
                            </div>
                        )
                    )}
                </div>
            </section>
        </ErrorBoundary>
    );
}
