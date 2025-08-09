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
import { useBasic } from '../hooks/useBasic';
import { v4 as uuidv4 } from "uuid";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { type Experience } from "@/types/portfolio";

export default function ExperienceForm() {
    const { basic } = useBasic();
    const userEmail = basic?.email || '';

    const { experiences, isLoading, addExperience, removeExperience } = useExperience(userEmail);

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
  
    const onSubmit = (data: ExperienceFormSchema) => {
        const newExperience: Experience = {
          ...data,
          id: uuidv4(),
        };
    
        if (userEmail) {
            addExperience.mutate({ email: userEmail, experience: newExperience });
        }
    
        form.reset();
        setSkill("");
    };

    if (isLoading) {
      return (
        <div className="w-full max-w-4xl mx-auto p-4 space-y-8 text-center text-muted-foreground">
          <p>Loading experience details...</p>
        </div>
      );
    }
    
    return(
        <>
        <div className="w-full max-w-4xl mx-auto p-4 space-y-8">
            {/* Experience Form */}
            <div className="border border-border rounded-xl shadow-sm bg-card overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b border-border">
                <h1 className="text-2xl font-semibold text-foreground flex items-center space-x-2">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
                <span>Add Work Experience</span>
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                Document your professional journey and achievements
                </p>
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
                            placeholder="Describe your role, responsibilities, achievements, and key contributions..." 
                            className="bg-background border-input focus:ring-ring focus:border-ring transition-colors min-h-[120px] resize-none"
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
                        <span>Skills Learned</span>
                    </FormLabel>

                    {/* Skills Display */}
                    {form.watch("skillsLearned").length > 0 && (
                        <div className="p-4 bg-muted/20 rounded-lg border border-muted">
                        <div className="flex flex-wrap gap-2">
                            {form.watch("skillsLearned").map((skill, index) => (
                                <Badge 
                                key={index} 
                                className="cursor-pointer bg-primary/10 text-primary border-primary/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-colors group"
                                onClick={() => {
                                    const updatedSkills = form.getValues("skillsLearned").filter((s) => s !== skill);
                                    form.setValue("skillsLearned", updatedSkills, { shouldValidate: true });
                                }}
                                >
                                <span>{skill}</span>
                                <span className="ml-1 group-hover:text-destructive transition-colors">✕</span>
                                </Badge>
                            ))}
                        </div>
                        </div>
                    )}

                    {/* Add Skill Input */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Input
                        placeholder="Add a skill you learned (e.g., React, Leadership)"
                        value={skill}
                        onChange={(e) => setSkill(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && skill.trim()) {
                            e.preventDefault();
                            const currentSkills = form.getValues("skillsLearned");
                            if (!currentSkills.includes(skill.trim())) {
                                form.setValue("skillsLearned", [...currentSkills, skill.trim()], { shouldValidate: true });
                                setSkill("");
                            }
                            }
                        }}
                        className="bg-background border-input focus:ring-ring focus:border-ring transition-colors flex-1"
                        />
                        <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            if (skill.trim()) {
                            const currentSkills = form.getValues("skillsLearned");
                            if (!currentSkills.includes(skill.trim())) {
                                form.setValue("skillsLearned", [...currentSkills, skill.trim()], { shouldValidate: true });
                                setSkill("");
                            }
                            }
                        }}
                        disabled={!skill.trim()}
                        className="shrink-0"
                        >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Skill
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Press Enter to quickly add skills or click on badges to remove them
                    </p>
                    </div>
                </form>
                </Form>
                <Button 
                type="submit" 
                className="w-full mt-6 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors" 
                onClick={form.handleSubmit(onSubmit)}
                >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Experience
                </Button>
            </div>
            </div>
            {/* Experience List */}
            <div className="border border-border rounded-xl shadow-sm bg-card overflow-hidden">
            <div className="bg-gradient-to-r from-secondary/20 via-secondary/10 to-transparent p-6 border-b border-border">
                <h2 className="text-xl font-semibold text-foreground flex items-center space-x-2">
                <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
                <span>Work Experience</span>
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                {experiences?.length === 0 ? "No experience added yet" : `${experiences?.length} experience${experiences?.length === 1 ? '' : 's'} recorded`}
                </p>
            </div>
            <div className="p-6">
                {!experiences || experiences.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                    <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                    </svg>
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">No experience yet</h3>
                    <p className="text-muted-foreground">Start building your professional profile by adding your work experience above</p>
                </div>
                ) : (
                <div className="space-y-6">
                    {experiences.map((exp) => (
                    <div 
                        key={exp.id} 
                        className="border border-border rounded-lg p-6 bg-card/50 hover:bg-card transition-colors group relative"
                    >
                        {/* Remove Button */}
                        <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExperience.mutate({ email: userEmail, id: exp.id || '' })}
                        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        </Button>

                        {/* Header */}
                        <div className="flex items-start justify-between mb-4 pr-12">
                        <div>
                            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                            {exp.position}
                            </h3>
                            <div className="flex items-center space-x-2 mt-1">
                            <p className="text-primary font-medium">{exp.company}</p>
                            <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                            <p className="text-sm text-muted-foreground">
                                {new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - {' '}
                                {exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : (
                                <span className="text-primary font-medium">Present</span>
                                )}
                            </p>
                            </div>
                        </div>
                        </div>

                        {/* Description */}
                        {exp.description && (
                        <div className="mb-4">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                            {exp.description}
                            </p>
                        </div>
                        )}

                        {/* Skills Learned */}
                        {exp.skillsLearned.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-xs font-medium text-foreground uppercase tracking-wide">
                            Skills Developed
                            </h4>
                            <div className="flex flex-wrap gap-2">
                            {exp.skillsLearned.map((skill, index) => (
                                <Badge 
                                key={index} 
                                className="cursor-pointer bg-accent/50 text-accent-foreground border-accent hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-colors group/skill"
                                onClick={() => {
                                    const updatedSkills = form.getValues("skillsLearned").filter((s) => s !== skill);
                                    form.setValue("skillsLearned", updatedSkills, { shouldValidate: true });
                                }}
                                >
                                <span>{skill}</span>
                                <span className="ml-1 opacity-0 group-hover/skill:opacity-100 transition-opacity">✕</span>
                                </Badge>
                            ))}
                            </div>
                        </div>
                        )}
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
