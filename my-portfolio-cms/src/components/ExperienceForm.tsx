import { useState, useEffect } from "react";
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

// --- NEW PROPS INTERFACE ---
interface ExperienceFormProps {
    initialData: Experience[];
    onDataChange: (newData: Experience[]) => void;
}

export default function ExperienceForm({ initialData, onDataChange }: ExperienceFormProps) {
    const { currentUser } = useUserContext();
    const userEmail = currentUser?.email || '';
    const { showToast } = useToast();

    // Hook is kept for its backend mutation functions
    const { addExperience, updateExperience, removeExperience, addExperienceLoading, updateExperienceLoading } = useExperience(userEmail);

    // --- LOCAL STATE MANAGEMENT ---
    const [experienceList, setExperienceList] = useState<Experience[]>([]);
    const [editingExperience, setEditingExperience] = useState<Experience | null>(null);

    // --- LIVE UPDATE HANDLER ---
    const handleExperienceListChange = (newExperienceList: Experience[]) => {
        setExperienceList(newExperienceList);
        onDataChange(newExperienceList);
    };
    const [skillInput, setSkillInput] = useState("");

    // --- DATA SYNCHRONIZATION ---
    useEffect(() => {
        setExperienceList(initialData || []);
    }, [initialData]);

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
    
    // --- HANDLERS ---
    const onSubmit = async (data: ExperienceFormSchema) => {
        try {
            if (editingExperience) {
                // Update existing experience
                const updatedExperienceItem: Experience = { ...editingExperience, ...data };
                await updateExperience(editingExperience._id || editingExperience.id || '', updatedExperienceItem);
                
                const updatedList = experienceList.map(exp => 
                    exp._id === updatedExperienceItem._id ? updatedExperienceItem : exp
                );
                handleExperienceListChange(updatedList);
                
                showToast("Experience updated successfully!", "success");
                setEditingExperience(null);
            } else {
                // Add new experience
                const newExperienceItem = await addExperience(data as Experience);
                const updatedList = [...experienceList, newExperienceItem];
                handleExperienceListChange(updatedList);
                
                showToast("Experience added successfully!", "success");
            }
            form.reset();
            setSkillInput("");
        } catch (error) {
            console.error('Error submitting experience:', error);
        }
    };

    const handleDelete = async (experienceId: string) => {
        if (window.confirm('Are you sure you want to delete this experience?')) {
            try {
                await removeExperience(experienceId);
                const updatedList = experienceList.filter(exp => exp._id !== experienceId);
                handleExperienceListChange(updatedList);
                showToast("Experience deleted successfully!", "success");
            } catch (error) {
                console.error('Error deleting experience:', error);
            }
        }
    };

    const handleEdit = (experience: Experience) => {
        setEditingExperience(experience);
        form.reset({
            company: experience.company || '',
            position: experience.position || '',
            startDate: experience.startDate ? new Date(experience.startDate) : new Date(),
            endDate: experience.endDate ? new Date(experience.endDate) : undefined,
            description: experience.description || '',
            skillsLearned: experience.skillsLearned || [],
        });
    };

    const handleCancelEdit = () => {
        setEditingExperience(null);
        form.reset();
        setSkillInput("");
    };

    const addSkillToForm = () => {
        if (skillInput.trim()) {
            const currentSkills = form.getValues("skillsLearned") || [];
            form.setValue("skillsLearned", [...currentSkills, skillInput.trim()]);
            setSkillInput("");
        }
    };

    const removeSkillFromForm = (index: number) => {
        const currentSkills = form.getValues("skillsLearned") || [];
        form.setValue("skillsLearned", currentSkills.filter((_, i) => i !== index));
    };
    
    return (
        <section className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border">
                <h2 className="text-xl font-semibold text-foreground">Work Experience</h2>
                <p className="text-sm text-muted-foreground">Your professional journey and achievements.</p>
            </div>
            <div className="p-6 space-y-6">
                {/* Add/Edit Form */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <h3 className="text-lg font-medium">{editingExperience ? 'Edit Experience' : 'Add New Experience'}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="company" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Company</FormLabel>
                                    <FormControl>
                                        <Input 
                                            placeholder="Company Name" 
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                // Live preview update for company
                                                const currentFormData = form.getValues();
                                                const updatedExperience: Experience = {
                                                    _id: editingExperience?._id || 'temp-id',
                                                    company: e.target.value,
                                                    position: currentFormData.position || '',
                                                    startDate: currentFormData.startDate,
                                                    endDate: currentFormData.endDate,
                                                    description: currentFormData.description || '',
                                                    skillsLearned: currentFormData.skillsLearned || []
                                                };
                                                
                                                let updatedList;
                                                if (editingExperience) {
                                                    updatedList = experienceList.map(exp => 
                                                        exp._id === editingExperience._id ? updatedExperience : exp
                                                    );
                                                } else {
                                                    updatedList = [...experienceList, updatedExperience];
                                                }
                                                handleExperienceListChange(updatedList);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="position" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Position</FormLabel>
                                    <FormControl>
                                        <Input 
                                            placeholder="e.g., Software Engineer" 
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                // Live preview update for position
                                                const currentFormData = form.getValues();
                                                const updatedExperience: Experience = {
                                                    _id: editingExperience?._id || 'temp-id',
                                                    company: currentFormData.company || '',
                                                    position: e.target.value,
                                                    startDate: currentFormData.startDate,
                                                    endDate: currentFormData.endDate,
                                                    description: currentFormData.description || '',
                                                    skillsLearned: currentFormData.skillsLearned || []
                                                };
                                                
                                                let updatedList;
                                                if (editingExperience) {
                                                    updatedList = experienceList.map(exp => 
                                                        exp._id === editingExperience._id ? updatedExperience : exp
                                                    );
                                                } else {
                                                    updatedList = [...experienceList, updatedExperience];
                                                }
                                                handleExperienceListChange(updatedList);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="startDate" render={({ field }) => (
                                <FormItem><FormLabel>Start Date</FormLabel><FormControl><Input type="date" value={field.value ? new Date(field.value).toISOString().split("T")[0] : ""} onChange={e => field.onChange(new Date(e.target.value))} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="endDate" render={({ field }) => (
                                <FormItem><FormLabel>End Date</FormLabel><FormControl><Input type="date" value={field.value ? new Date(field.value).toISOString().split("T")[0] : ""} onChange={e => field.onChange(new Date(e.target.value))} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea 
                                        placeholder="Describe your role and accomplishments..." 
                                        {...field}
                                        onChange={(e) => {
                                            field.onChange(e);
                                            // Live preview update for description
                                            const currentFormData = form.getValues();
                                            const updatedExperience: Experience = {
                                                _id: editingExperience?._id || 'temp-id',
                                                company: currentFormData.company || '',
                                                position: currentFormData.position || '',
                                                startDate: currentFormData.startDate,
                                                endDate: currentFormData.endDate,
                                                description: e.target.value,
                                                skillsLearned: currentFormData.skillsLearned || []
                                            };
                                            
                                            let updatedList;
                                            if (editingExperience) {
                                                updatedList = experienceList.map(exp => 
                                                    exp._id === editingExperience._id ? updatedExperience : exp
                                                );
                                            } else {
                                                updatedList = [...experienceList, updatedExperience];
                                            }
                                            handleExperienceListChange(updatedList);
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <div>
                            <FormLabel>Skills Learned</FormLabel>
                            <div className="flex space-x-2 mt-2">
                                <Input placeholder="Add a skill and press Enter" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkillToForm(); }}} />
                                <Button type="button" onClick={addSkillToForm}>Add</Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {form.watch("skillsLearned").map((skill, index) => (
                                    <Badge key={index} variant="secondary" onClick={() => removeSkillFromForm(index)} className="cursor-pointer">{skill} &times;</Badge>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                            {editingExperience && <Button type="button" variant="ghost" onClick={handleCancelEdit}>Cancel</Button>}
                            <Button type="submit" disabled={addExperienceLoading || updateExperienceLoading}>
                                {editingExperience ? (updateExperienceLoading ? 'Updating...' : 'Update Experience') : (addExperienceLoading ? 'Adding...' : 'Add Experience')}
                            </Button>
                        </div>
                    </form>
                </Form>

                {/* List of existing experiences */}
                {experienceList.length > 0 && (
                    <div className="space-y-4 pt-6 border-t">
                        <h3 className="text-lg font-medium">Your Work History</h3>
                        {experienceList.map((exp) => (
                            <div key={exp._id || exp.id} className="flex justify-between items-start p-3 bg-muted/50 rounded-md">
                                <div className="flex-1">
                                    <p className="font-semibold">{exp.position} at {exp.company}</p>
                                    <p className="text-sm text-muted-foreground">{exp.description}</p>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {exp.skillsLearned?.map((skill, i) => <Badge key={i} variant="outline">{skill}</Badge>)}
                                    </div>
                                </div>
                                <div className="flex space-x-2 ml-4">
                                    <Button size="sm" variant="outline" onClick={() => handleEdit(exp)}>Edit</Button>
                                    <Button size="sm" variant="destructive" onClick={() => handleDelete(exp._id || exp.id || '')}>Delete</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
