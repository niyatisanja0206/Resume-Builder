import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { skillSchema, type SkillFormSchema } from '../lib/zodschema';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Skill } from '@/types/portfolio';
import { useSkill } from '../hooks/useSkills';
import { useUserContext } from '@/contexts/useUserContext';
import { useToast } from '../contexts/ToastContext';
import ErrorBoundary from './ErrorBoundary';

// --- PROPS INTERFACE ---
interface SkillFormProps {
    initialData: Skill[];
    onDataChange: (newData: Skill[]) => void;
}

export default function EnhancedSkillForm({ initialData, onDataChange }: SkillFormProps) {
    const { currentUser } = useUserContext();
    const userEmail = currentUser?.email || '';
    const { showToast } = useToast();

    // Hook for backend communication with proper types
    const { 
        addSkill, 
        updateSkill, 
        removeSkill 
    } = useSkill(userEmail);

    // --- LOCAL STATE MANAGEMENT ---
    const [skillList, setSkillList] = useState<Skill[]>([]);
    const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // --- DATA SYNCHRONIZATION ---
    useEffect(() => {
        setSkillList(initialData || []);
    }, [initialData]);

    // --- LIVE UPDATE HANDLER ---
    const handleSkillListChange = useCallback((newSkillList: Skill[]) => {
        setSkillList(newSkillList);
        onDataChange(newSkillList);
    }, [onDataChange]);

    // Create form following the same pattern as other forms
    const form = useForm<SkillFormSchema>({
        resolver: zodResolver(skillSchema),
        defaultValues: {
            name: '',
            level: 'beginner',
        },
        mode: 'onChange'
    });

    // --- FORM ACTIONS ---
    // Reset form when editing skill changes
    useEffect(() => {
        if (editingSkill) {
            form.reset({
                name: editingSkill.name,
                level: editingSkill.level,
            });
        } else {
            form.reset({
                name: '',
                level: 'beginner',
            });
        }
    }, [editingSkill, form]);

    // Handle form submission
    const onSubmit = async (data: SkillFormSchema) => {
        try {
            setIsLoading(true);
            const isEditing = !!editingSkill;
            
            // Perform backend operation based on whether we're editing or adding
            if (isEditing && editingSkill?._id) {
                try {
                    const updatedSkill = await updateSkill(editingSkill._id, {
                        ...data,
                        _id: editingSkill._id
                    } as Skill);
                    
                    // Update skill list by replacing the edited skill
                    if (Array.isArray(updatedSkill)) {
                        // If updateSkill returns an array of all skills
                        handleSkillListChange(updatedSkill);
                    } else {
                        // If it returns just the updated skill
                        const updatedSkills = skillList.map(skill => 
                            skill._id === editingSkill._id ? updatedSkill : skill
                        );
                        handleSkillListChange(updatedSkills);
                    }
                    
                    setEditingSkill(null);
                    showToast('Skill updated successfully!', 'success');
                } catch (error) {
                    console.error('Error updating skill:', error);
                    showToast(`Failed to update skill: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
                }
            } else {
                try {
                    const newSkill = await addSkill({
                        ...data,
                        _id: undefined
                    } as Skill);
                    
                    // Add new skill to the list
                    const updatedSkills = [...skillList, newSkill];
                    handleSkillListChange(updatedSkills);
                    setIsAddingNew(false);
                    showToast('Skill added successfully!', 'success');
                } catch (error) {
                    console.error('Error adding skill:', error);
                    showToast(`Failed to add skill: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
                }
            }
        } catch (error) {
            console.error('Error in skill submission:', error);
            showToast(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle delete operation
    const handleDelete = async (skillId?: string) => {
        if (!skillId) return;
        
        if (window.confirm('Are you sure you want to delete this skill?')) {
            try {
                setIsLoading(true);
                
                await removeSkill(skillId);
                
                // Remove the skill from the list
                const updatedSkills = skillList.filter(skill => skill._id !== skillId);
                handleSkillListChange(updatedSkills);
                setEditingSkill(null);
                showToast('Skill deleted successfully!', 'success');
                
            } catch (error) {
                console.error('Error in delete operation:', error);
                showToast(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
            } finally {
                setIsLoading(false);
            }
        }
    };

    // --- RENDER LOGIC ---
    return (
        <ErrorBoundary>
            <div className="space-y-6">
                {/* Header with Add/Edit buttons */}
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Skills</h3>
                    <div className="space-x-2">
                        {!isAddingNew && !editingSkill && (
                            <Button 
                                onClick={() => setIsAddingNew(true)} 
                                size="sm"
                                disabled={isLoading}
                            >
                                Add New Skill
                            </Button>
                        )}
                        {(isAddingNew || editingSkill) && (
                            <Button 
                                onClick={() => {
                                    setIsAddingNew(false);
                                    setEditingSkill(null);
                                }} 
                                size="sm" 
                                variant="outline"
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                        )}
                    </div>
                </div>

                {/* Form for adding/editing */}
                {(isAddingNew || editingSkill) && (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Skill Name *</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="Enter skill name" 
                                                {...field} 
                                                disabled={isLoading}
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
                                        <FormLabel>Proficiency Level *</FormLabel>
                                        <Select 
                                            value={field.value} 
                                            onValueChange={field.onChange}
                                            disabled={isLoading}
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

                            <div className="flex justify-end space-x-2 pt-2">
                                <Button 
                                    type="submit" 
                                    disabled={!form.formState.isValid || isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                            {editingSkill ? 'Updating...' : 'Adding...'}
                                        </>
                                    ) : (
                                        editingSkill ? 'Update Skill' : 'Add Skill'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                )}

                {/* Display List of Skills */}
                <div className="space-y-2">
                    {skillList.length === 0 ? (
                        <div className="text-center py-6 text-gray-500">
                            No skills added yet. Click "Add New Skill" to get started.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {skillList.map((skill) => (
                                <div 
                                    key={skill._id || skill.name} 
                                    className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md flex justify-between items-center"
                                >
                                    <div>
                                        <p className="font-medium">{skill.name}</p>
                                        <Badge 
                                            variant={
                                                skill.level === 'beginner' ? 'outline' :
                                                skill.level === 'intermediate' ? 'secondary' :
                                                'default'
                                            }
                                            className="mt-1"
                                        >
                                            {skill.level}
                                        </Badge>
                                    </div>
                                    <div className="flex space-x-1">
                                        <Button 
                                            size="sm" 
                                            variant="ghost" 
                                            onClick={() => setEditingSkill(skill)}
                                            disabled={isLoading}
                                        >
                                            Edit
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant="ghost" 
                                            className="text-red-500 hover:text-red-700"
                                            onClick={() => handleDelete(skill._id)}
                                            disabled={isLoading}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </ErrorBoundary>
    );
}
