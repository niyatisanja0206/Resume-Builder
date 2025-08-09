import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { skillSchema, type SkillFormSchema as BaseSkillFormSchema } from '../lib/zodschema';

type SkillFormSchema = BaseSkillFormSchema;
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import { v4 as uuidv4 } from 'uuid';

import { type Skill } from '@/types/portfolio';
import { useSkill } from '../hooks/useSkills';
import { useBasic } from '../hooks/useBasic';

export default function SkillForm() {
    const { basic } = useBasic();
    const userEmail = basic?.email || '';

    const { skills, isLoading, addSkill, removeSkill } = useSkill(userEmail);

    const form = useForm<SkillFormSchema>({
        resolver: zodResolver(skillSchema),
        defaultValues: {
            name: '',
            level: 'beginner',
        },
    });

    const onSubmit = (data: SkillFormSchema) => {
        const newSkill: Skill = {
            ...data,
            id: uuidv4(),
        };

        if (userEmail) {
            addSkill.mutate({ email: userEmail, skill: newSkill });
        }

        form.reset();
    };

    if (isLoading) {
        return (
            <div className="w-full max-w-2xl mx-auto p-4 space-y-8 text-center text-muted-foreground">
                <p>Loading skills...</p>
            </div>
        );
    }
    
    return (
        <>
        <div className="w-full max-w-2xl mx-auto p-4 space-y-8">
            {/* Skills Form */}
            <div className="border border-border rounded-xl shadow-sm bg-card p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-foreground">Add New Skill</h1>
                <p className="text-sm text-muted-foreground mt-1">
                Build your skills profile by adding your expertise levels
                </p>
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
                    disabled={addSkill.isPending}
                >
                    {addSkill.isPending ? 'Adding...' : 'Add Skill'}
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
                    onClick={() => { /* clear all logic can be added here */ }}
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
                {skills.map((skill) => (
                    <div 
                    key={skill.id ?? uuidv4()} 
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-muted hover:bg-muted/50 transition-colors group"
                    >
                    <div className="flex-1">
                        <div className="flex items-center space-x-3">
                        <div className="font-medium text-foreground">{skill.name}</div>
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            skill.level === 'beginner' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                            : skill.level === 'intermediate'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        }`}>
                            {skill.level.charAt(0).toUpperCase() + skill.level.slice(1)}
                        </span>
                        </div>
                    </div>
                    
                    <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeSkill.mutate({ email: userEmail, id: skill.id || '' })}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </Button>
                    </div>
                ))}
                </div>
            )}
            </div>
        </div>
        </>
    );
}
