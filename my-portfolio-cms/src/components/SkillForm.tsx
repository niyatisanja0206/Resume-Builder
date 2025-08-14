import { useState, useEffect } from 'react';
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

// --- NEW PROPS INTERFACE ---
interface SkillFormProps {
    initialData: Skill[];
    onDataChange: (newData: Skill[]) => void;
}

export default function SkillForm({ initialData, onDataChange }: SkillFormProps) {
    const { currentUser } = useUserContext();
    const userEmail = currentUser?.email || '';
    const { showToast } = useToast();

    // Hook is kept for its backend mutation functions
    const { addSkill, updateSkill, removeSkill, addSkillLoading, updateSkillLoading } = useSkill(userEmail);

    // --- LOCAL STATE MANAGEMENT ---
    const [skillList, setSkillList] = useState<Skill[]>([]);
    const [editingSkill, setEditingSkill] = useState<Skill | null>(null);

    // --- DATA SYNCHRONIZATION ---
    useEffect(() => {
        setSkillList(initialData || []);
    }, [initialData]);

    // --- LIVE UPDATE HANDLER ---
    const handleSkillListChange = (newSkillList: Skill[]) => {
        setSkillList(newSkillList);
        onDataChange(newSkillList);
    };

    const form = useForm<SkillFormSchema>({
        resolver: zodResolver(skillSchema),
        defaultValues: {
            name: '',
            level: 'beginner',
        },
    });

    // --- HANDLERS ---
    const onSubmit = async (data: SkillFormSchema) => {
        try {
            if (editingSkill) {
                // Update existing skill
                const updatedSkillItem: Skill = { ...editingSkill, ...data };
                await updateSkill(editingSkill._id || editingSkill.id || '', updatedSkillItem);
                
                const updatedList = skillList.map(skill => 
                    skill._id === updatedSkillItem._id ? updatedSkillItem : skill
                );
                handleSkillListChange(updatedList);
                
                showToast("Skill updated successfully!", "success");
                setEditingSkill(null);
            } else {
                // Add new skill
                const newSkillItem = await addSkill(data as Skill);
                const updatedList = [...skillList, newSkillItem];
                handleSkillListChange(updatedList);
                
                showToast("Skill added successfully!", "success");
            }
            form.reset();
        } catch (error) {
            console.error('Error submitting skill:', error);
        }
    };

    const handleDelete = async (skillId: string) => {
        if (window.confirm('Are you sure you want to delete this skill?')) {
            try {
                await removeSkill(skillId);
                const updatedList = skillList.filter(skill => skill._id !== skillId);
                handleSkillListChange(updatedList);
                showToast("Skill deleted successfully!", "success");
            } catch (error) {
                console.error('Error deleting skill:', error);
            }
        }
    };

    const handleEdit = (skill: Skill) => {
        setEditingSkill(skill);
        form.reset({
            name: skill.name,
            level: skill.level,
        });
    };

    const handleCancelEdit = () => {
        setEditingSkill(null);
        form.reset();
    };

    return (
        <section className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border">
                <h2 className="text-xl font-semibold text-foreground">Skills</h2>
                <p className="text-sm text-muted-foreground">Highlight your technical and professional expertise.</p>
            </div>
            <div className="p-6 space-y-6">
                {/* Add/Edit Form */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <h3 className="text-lg font-medium">{editingSkill ? 'Edit Skill' : 'Add New Skill'}</h3>
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Skill Name</FormLabel>
                                <FormControl>
                                    <Input 
                                        placeholder="e.g., React, TypeScript" 
                                        {...field}
                                        onChange={(e) => {
                                            field.onChange(e);
                                            // Live preview update for skill name
                                            const currentFormData = form.getValues();
                                            const updatedSkill: Skill = {
                                                _id: editingSkill?._id || 'temp-id',
                                                name: e.target.value,
                                                level: currentFormData.level || 'beginner'
                                            };
                                            
                                            let updatedList;
                                            if (editingSkill) {
                                                updatedList = skillList.map(skill => 
                                                    skill._id === editingSkill._id ? updatedSkill : skill
                                                );
                                            } else {
                                                updatedList = [...skillList, updatedSkill];
                                            }
                                            handleSkillListChange(updatedList);
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="level" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Proficiency Level</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="beginner">Beginner</SelectItem>
                                        <SelectItem value="intermediate">Intermediate</SelectItem>
                                        <SelectItem value="advanced">Advanced</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <div className="flex justify-end space-x-2">
                            {editingSkill && <Button type="button" variant="ghost" onClick={handleCancelEdit}>Cancel</Button>}
                            <Button type="submit" disabled={addSkillLoading || updateSkillLoading}>
                                {editingSkill ? (updateSkillLoading ? 'Updating...' : 'Update Skill') : (addSkillLoading ? 'Adding...' : 'Add Skill')}
                            </Button>
                        </div>
                    </form>
                </Form>

                {/* List of existing skills */}
                {skillList.length > 0 && (
                    <div className="space-y-3 pt-6 border-t">
                        <h3 className="text-lg font-medium">Your Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {skillList.map((skill) => (
                                <div key={skill._id || skill.id} className="flex items-center p-2 pr-1 bg-muted/50 rounded-md group">
                                    <Badge variant="secondary" className="pointer-events-none">
                                        {skill.name} - <span className="capitalize text-muted-foreground/80 ml-1">{skill.level}</span>
                                    </Badge>
                                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleEdit(skill)}>
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => handleDelete(skill._id || skill.id || '')}>
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
