import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { skillSchema, type SkillFormSchema as BaseSkillFormSchema } from '../lib/zodschema';

type SkillFormSchema = BaseSkillFormSchema;
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
} from "@/components/ui/select"

import { type Skill } from '@/types/portfolio';
import { useSkill } from '../hooks/useSkills';
import { useUserContext } from '@/contexts/useUserContext';
import { useState } from 'react';

export default function SkillForm() {
    // We'll get basic info from the UserContext
    const { currentUser } = useUserContext();
    const userEmail = currentUser?.email || '';
    
    console.log('SkillForm - currentUser:', currentUser);
    console.log('SkillForm - userEmail:', userEmail);
    
    const { skills, isLoading, addSkill, updateSkill, removeSkill, removeAllSkills, addSkillLoading, updateSkillLoading } = useSkill(userEmail);
    const [successMessage, setSuccessMessage] = useState<string>("");
    const [editingSkill, setEditingSkill] = useState<Skill | null>(null);

    const form = useForm<SkillFormSchema>({
        resolver: zodResolver(skillSchema),
        defaultValues: {
            name: '',
            level: 'beginner',
        },
    });

    const onSubmit = async (data: SkillFormSchema) => {
        try {
            console.log('SkillForm submitting:', data);
            
            if (editingSkill) {
                // Update existing skill
                const updatedSkill: Skill = {
                    ...editingSkill,
                    ...data,
                };

                if (userEmail) {
                    console.log('Calling updateSkill with skill data:', updatedSkill);
                    await updateSkill(editingSkill._id || editingSkill.id || '', updatedSkill);
                    form.reset();
                    setEditingSkill(null);
                    setSuccessMessage("Skill updated successfully!");
                    setTimeout(() => setSuccessMessage(""), 3000);
                } else {
                    console.error('No user email available');
                }
            } else {
                // Add new skill
                const newSkill: Omit<Skill, 'id' | '_id'> = {
                    ...data,
                    // Let MongoDB generate _id automatically
                };

                if (userEmail) {
                    console.log('Calling addSkill with skill data:', newSkill);
                    await addSkill(newSkill as Skill);
                    form.reset();
                    setSuccessMessage("Skill added successfully!");
                    setTimeout(() => setSuccessMessage(""), 3000);
                } else {
                    console.error('No user email available');
                }
            }
        } catch (error) {
            console.error('Error submitting skill:', error);
        }
    };

    const handleDeleteSkill = async (skillId: string) => {
        if (window.confirm('Are you sure you want to delete this skill?')) {
            try {
                console.log('Deleting skill with ID:', skillId, 'for user:', userEmail);
                if (userEmail) {
                    await removeSkill(skillId);
                    setSuccessMessage("Skill deleted successfully!");
                    setTimeout(() => setSuccessMessage(""), 3000);
                } else {
                    console.error('No user email available for skill deletion');
                }
            } catch (error) {
                console.error('Error deleting skill:', error);
                setSuccessMessage('Failed to delete skill. Please try again.');
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        }
    };

    const handleDeleteAllSkills = async () => {
        if (window.confirm('Are you sure you want to delete all skills? This action cannot be undone.')) {
            try {
                console.log('Deleting all skills for user:', userEmail);
                if (userEmail) {
                    await removeAllSkills();
                    setSuccessMessage("All skills deleted successfully!");
                    setTimeout(() => setSuccessMessage(""), 3000);
                } else {
                    console.error('No user email available for deleting all skills');
                }
            } catch (error) {
                console.error('Error deleting all skills:', error);
                setSuccessMessage('Failed to delete all skills. Please try again.');
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        }
    };

    const handleEditSkill = (skill: Skill) => {
        setEditingSkill(skill);
        form.reset({
            name: skill.name,
            level: skill.level,
        });
    };

    const handleCancelEdit = () => {
        setEditingSkill(null);
        form.reset({
            name: '',
            level: 'beginner',
        });
    };

    if (isLoading) {
        return (
            <div className="w-full max-w-2xl mx-auto p-4 space-y-8 text-center text-muted-foreground">
                <p>Loading skills...</p>
            </div>
        );
    }

    // Show message if no basic info exists
    if (!userEmail) {
        return (
            <div className="w-full max-w-2xl mx-auto p-4 space-y-8">
                <div className="border border-border rounded-xl shadow-sm bg-card p-6 text-center">
                    <div className="mb-4">
                        <svg className="w-12 h-12 text-muted-foreground mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-lg font-semibold text-foreground mb-2">Basic Information Required</h3>
                        <p className="text-muted-foreground">
                            Please fill out your basic information first before adding skills. 
                            Go to the "Basic Information" section above to get started.
                        </p>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <>
        <div className="w-full max-w-2xl mx-auto p-4 space-y-8">
            {/* Success Message */}
            {successMessage && (
                <div className="border border-green-200 bg-green-50 text-green-800 px-4 py-3 rounded-lg dark:bg-green-900/30 dark:border-green-800 dark:text-green-300">
                    {successMessage}
                </div>
            )}

            {/* Skills Form */}
            <div className="border border-border rounded-xl shadow-sm bg-card p-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground">
                        {editingSkill ? 'Edit Skill' : 'Add New Skill'}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {editingSkill ? 'Update your skill information' : 'Build your skills profile by adding your expertise levels'}
                    </p>
                </div>
                {editingSkill && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelEdit}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        Cancel
                    </Button>
                )}
            </div>
            
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-foreground font-medium">Skill Name</FormLabel>
                        <FormControl>
                        <Input 
                            placeholder="Enter skill name (e.g., JavaScript, Design)" 
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
                    name="level"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-foreground font-medium">Skill Level</FormLabel>
                        <FormControl>
                        <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                        >
                            <SelectTrigger className="bg-background border-input focus:ring-ring focus:border-ring transition-colors">
                            <SelectValue placeholder="Select your proficiency level" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border">
                            <SelectItem value="beginner" className="focus:bg-accent focus:text-accent-foreground">
                                Beginner
                            </SelectItem>
                            <SelectItem value="intermediate" className="focus:bg-accent focus:text-accent-foreground">
                                Intermediate
                            </SelectItem>
                            <SelectItem value="advanced" className="focus:bg-accent focus:text-accent-foreground">
                                Advanced
                            </SelectItem>
                            </SelectContent>
                        </Select>
                        </FormControl>
                        <FormMessage className="text-destructive" />
                    </FormItem>
                    )}
                />
                
                <Button 
                    type="submit" 
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    disabled={addSkillLoading || updateSkillLoading}
                >
                    {editingSkill 
                        ? (updateSkillLoading ? 'Updating...' : 'Update Skill')
                        : (addSkillLoading ? 'Adding...' : 'Add Skill')
                    }
                </Button>
                </form>
            </Form>
            </div>

            {/* Skills List */}
            <div className="border border-border rounded-xl shadow-sm bg-card p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                <h2 className="text-xl font-semibold text-foreground">Your Skills</h2>
                <p className="text-sm text-muted-foreground">
                    {!skills || skills.length === 0 ? "No skills added yet" : `${skills.length} skill${skills.length === 1 ? '' : 's'} added`}
                </p>
                </div>
                
                {skills && skills.length > 0 && (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteAllSkills}
                    className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                >
                    Clear All
                </Button>
                )}
            </div>

            {!skills || skills.length === 0 ? (
                <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <p className="text-muted-foreground">Start by adding your first skill above</p>
                </div>
            ) : (
                <div className="space-y-3">
                {skills.map((skill, index) => (
                    <div 
                    key={skill._id || skill.id || `skill-${index}`} 
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-muted hover:bg-muted/50 transition-colors group"
                    >
                    <div className="flex-1">
                        <div className="flex items-center space-x-3">
                        <div className="font-medium text-foreground">{skill.name}</div>
                        <Badge variant={
                            skill.level === 'beginner' 
                            ? 'secondary'
                            : skill.level === 'intermediate'
                            ? 'outline'
                            : 'default'
                        }>
                            {skill.level.charAt(0).toUpperCase() + skill.level.slice(1)}
                        </Badge>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        {/* Edit Button */}
                        <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleEditSkill(skill)}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </Button>
                        
                        {/* Delete Button */}
                        <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteSkill(skill._id || skill.id || '')}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </Button>
                    </div>
                    </div>
                ))}
                </div>
            )}
            </div>
        </div>
        </>
    );
}
