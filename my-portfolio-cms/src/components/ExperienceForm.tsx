import { useState } from "react";
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

export default function ExperienceForm() {
    const { currentUser } = useUserContext();
    const userEmail = currentUser?.email || '';

    const { experiences, isLoading, addExperience, updateExperience, removeExperience, removeAllExperiences, addExperienceLoading, updateExperienceLoading } = useExperience(userEmail);
    const [successMessage, setSuccessMessage] = useState<string>("");
    const [editingExperience, setEditingExperience] = useState<Experience | null>(null);

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
    
    const [skill, setSkill] = useState("");
  
    const onSubmit = async (data: ExperienceFormSchema) => {
        try {
            if (editingExperience) {
                // Update existing experience
                const updatedExperience: Experience = {
                    ...editingExperience,
                    ...data,
                };

                if (userEmail) {
                    await updateExperience(editingExperience._id || editingExperience.id || '', updatedExperience);
                    form.reset();
                    setSkill("");
                    setEditingExperience(null);
                    setSuccessMessage("Experience updated successfully!");
                    setTimeout(() => setSuccessMessage(""), 3000);
                }
            } else {
                // Add new experience
                const newExperience: Omit<Experience, 'id' | '_id'> = {
                  ...data,
                  // Let MongoDB generate _id automatically
                };
            
                if (userEmail) {
                    await addExperience(newExperience as Experience);
                    form.reset();
                    setSkill("");
                    setSuccessMessage("Experience added successfully!");
                    setTimeout(() => setSuccessMessage(""), 3000);
                }
            }
        } catch (error) {
            console.error('Error submitting experience:', error);
        }
    };

    const handleDeleteExperience = async (experienceId: string) => {
        try {
            if (userEmail) {
                await removeExperience(experienceId);
                setSuccessMessage("Experience deleted successfully!");
                setTimeout(() => setSuccessMessage(""), 3000);
            }
        } catch (error) {
            console.error('Error deleting experience:', error);
        }
    };

    const handleDeleteAllExperiences = async () => {
        if (window.confirm('Are you sure you want to delete all experiences? This action cannot be undone.')) {
            try {
                if (userEmail) {
                    await removeAllExperiences();
                    setSuccessMessage("All experiences deleted successfully!");
                    setTimeout(() => setSuccessMessage(""), 3000);
                }
            } catch (error) {
                console.error('Error deleting all experiences:', error);
            }
        }
    };

    const handleEditExperience = (experience: Experience) => {
        setEditingExperience(experience);
        form.reset({
            company: experience.company || '',
            position: experience.position || '',
            startDate: experience.startDate || new Date(),
            endDate: experience.endDate || undefined,
            description: experience.description || '',
            skillsLearned: experience.skillsLearned || [],
        });
    };

    const handleCancelEdit = () => {
        setEditingExperience(null);
        form.reset({
            company: '',
            position: '',
            startDate: new Date(),
            endDate: undefined,
            description: '',
            skillsLearned: [],
        });
        setSkill("");
    };

    const addSkillToForm = () => {
        if (skill.trim()) {
            const currentSkills = form.getValues("skillsLearned") || [];
            form.setValue("skillsLearned", [...currentSkills, skill.trim()]);
            setSkill("");
        }
    };

    const removeSkillFromForm = (index: number) => {
        const currentSkills = form.getValues("skillsLearned") || [];
        const newSkills = currentSkills.filter((_, i) => i !== index);
        form.setValue("skillsLearned", newSkills);
    };

    if (isLoading) {
      return (
        <div className="w-full max-w-4xl mx-auto p-4 space-y-8 text-center text-muted-foreground">
          <p>Loading experience details...</p>
        </div>
      );
    }

    // Show message if no basic info exists
    if (!userEmail) {
        return (
            <div className="w-full max-w-4xl mx-auto p-4 space-y-8">
                <div className="border border-border rounded-xl shadow-sm bg-card p-6 text-center">
                    <div className="mb-4">
                        <svg className="w-12 h-12 text-muted-foreground mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-lg font-semibold text-foreground mb-2">Basic Information Required</h3>
                        <p className="text-muted-foreground">
                            Please fill out your basic information first before adding experience. 
                            Go to the "Basic Information" section above to get started.
                        </p>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <>
        <div className="w-full max-w-4xl mx-auto p-4 space-y-8">
            {/* Success Message */}
            {successMessage && (
                <div className="border border-green-200 bg-green-50 text-green-800 px-4 py-3 rounded-lg dark:bg-green-900/30 dark:border-green-800 dark:text-green-300">
                    {successMessage}
                </div>
            )}

            {/* Experience Form */}
            <div className="border border-border rounded-xl shadow-sm bg-card overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b border-border">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground flex items-center space-x-2">
                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                        </svg>
                        <span>{editingExperience ? 'Edit Work Experience' : 'Add Work Experience'}</span>
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                        {editingExperience ? 'Update your experience information' : 'Document your professional journey and achievements'}
                        </p>
                    </div>
                    {editingExperience && (
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
            </div>
            <div className="p-6">
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Company and Position Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="company"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-foreground font-medium flex items-center space-x-2">
                            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span>Company Name</span>
                            </FormLabel>
                            <FormControl>
                            <Input 
                                placeholder="Enter company name" 
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
                        name="position"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-foreground font-medium flex items-center space-x-2">
                            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>Position / Role</span>
                            </FormLabel>
                            <FormControl>
                            <Input 
                                placeholder="Enter your position" 
                                className="bg-background border-input focus:ring-ring focus:border-ring transition-colors"
                                {...field} 
                            />
                            </FormControl>
                            <FormMessage className="text-destructive" />
                        </FormItem>
                        )}
                    />
                    </div>
                    
                    {/* Date Range Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-foreground font-medium flex items-center space-x-2">
                            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Start Date</span>
                            </FormLabel>
                            <FormControl>
                            <Input
                                type="date"
                                className="bg-background border-input focus:ring-ring focus:border-ring transition-colors"
                                value={field.value ? new Date(field.value).toISOString().split("T")[0] : ""}
                                onChange={e => {
                                    const dateValue = e.target.value ? new Date(e.target.value) : undefined;
                                    field.onChange(dateValue);
                                }}
                            />
                            </FormControl>
                            <FormMessage className="text-destructive" />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-foreground font-medium flex items-center space-x-2">
                            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>End Date</span>
                            <span className="text-xs text-muted-foreground">(leave empty if current)</span>
                            </FormLabel>
                            <FormControl>
                            <Input
                                type="date"
                                className="bg-background border-input focus:ring-ring focus:border-ring transition-colors"
                                value={field.value ? new Date(field.value).toISOString().split("T")[0] : ""}
                                onChange={e => {
                                    const dateValue = e.target.value ? new Date(e.target.value) : undefined;
                                    field.onChange(dateValue);
                                }}
                            />
                            </FormControl>
                            <FormMessage className="text-destructive" />
                        </FormItem>
                        )}
                    />
                    </div>

                    {/* Description */}
                    <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="text-foreground font-medium flex items-center space-x-2">
                            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Job Description</span>
                        </FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder="Describe your responsibilities, achievements, and impact in this role..."
                            className="bg-background border-input focus:ring-ring focus:border-ring transition-colors min-h-[120px]"
                            {...field}
                            />
                        </FormControl>
                        <FormMessage className="text-destructive" />
                        </FormItem>
                    )}
                    />

                    {/* Skills Learned Section */}
                    <div className="space-y-4">
                    <FormLabel className="text-foreground font-medium flex items-center space-x-2">
                        <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <span>Skills & Technologies Learned</span>
                    </FormLabel>
                    
                    <div className="flex space-x-2">
                        <Input
                        placeholder="Add a skill or technology..."
                        value={skill}
                        onChange={(e) => setSkill(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                            e.preventDefault();
                            addSkillToForm();
                            }
                        }}
                        className="bg-background border-input focus:ring-ring focus:border-ring transition-colors"
                        />
                        <Button
                        type="button"
                        onClick={addSkillToForm}
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                        Add
                        </Button>
                    </div>

                    {/* Display added skills */}
                    {form.watch("skillsLearned") && form.watch("skillsLearned").length > 0 && (
                        <div className="flex flex-wrap gap-2 p-4 bg-muted/30 rounded-lg border border-muted">
                        {form.watch("skillsLearned").map((skill, index) => (
                            <Badge
                            key={index}
                            variant="secondary"
                            className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors group cursor-pointer"
                            onClick={() => removeSkillFromForm(index)}
                            >
                            {skill}
                            <svg className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            </Badge>
                        ))}
                        </div>
                    )}
                    </div>

                    <Button 
                    type="submit" 
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    disabled={addExperienceLoading || updateExperienceLoading}
                    >
                    {editingExperience 
                        ? (updateExperienceLoading ? 'Updating Experience...' : 'Update Experience')
                        : (addExperienceLoading ? 'Adding Experience...' : 'Add Experience')
                    }
                    </Button>
                </form>
                </Form>
            </div>
            </div>

            {/* Experience List */}
            <div className="border border-border rounded-xl shadow-sm bg-card overflow-hidden">
            <div className="bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent p-6 border-b border-border">
                <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-foreground flex items-center space-x-2">
                    <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>Your Experience History</span>
                    </h2>
                    <p className="text-sm text-muted-foreground">
                    {!experiences || experiences.length === 0 ? "No experience added yet" : `${experiences.length} experience${experiences.length === 1 ? '' : 's'} recorded`}
                    </p>
                </div>
                
                {experiences && experiences.length > 0 && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleDeleteAllExperiences}
                        className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    >
                        Clear All
                    </Button>
                )}
                </div>
            </div>

            <div className="p-6">
                {!experiences || experiences.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                    </svg>
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">No Experience Added Yet</h3>
                    <p className="text-muted-foreground mb-4">Start building your professional profile by adding your work experience above</p>
                </div>
                ) : (
                <div className="space-y-6">
                    {experiences.map((experience, index) => (
                    <div 
                        key={experience._id || experience.id || `experience-${index}`} 
                        className="border border-border rounded-lg p-6 bg-card hover:shadow-md transition-shadow group"
                    >
                        <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-foreground">{experience.position}</h3>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-lg font-medium text-primary">{experience.company}</span>
                            </div>
                            
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-3">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>
                                {new Date(experience.startDate).toLocaleDateString()} - {
                                experience.endDate 
                                    ? new Date(experience.endDate).toLocaleDateString()
                                    : "Present"
                                }
                            </span>
                            </div>

                            {experience.description && (
                            <p className="text-foreground mb-4 leading-relaxed">{experience.description}</p>
                            )}

                            {experience.skillsLearned && experience.skillsLearned.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium text-foreground flex items-center space-x-2">
                                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                <span>Skills & Technologies</span>
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                {experience.skillsLearned.map((skill, index) => (
                                    <Badge 
                                    key={index} 
                                    variant="outline" 
                                    className="bg-secondary/10 text-secondary border-secondary/30"
                                    >
                                    {skill}
                                    </Badge>
                                ))}
                                </div>
                            </div>
                            )}
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                            <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20"
                                onClick={() => handleEditExperience(experience)}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </Button>
                            
                            <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteExperience(experience._id || experience.id || '')}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </Button>
                        </div>
                        </div>
                    </div>
                    ))}
                </div>
                )}
            </div>
            </div>
        </div>
        </>
    );
}
