import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { educationSchema, type EducationFormSchema } from '../lib/zodschema';
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
import { useEducation } from '../hooks/useEducation';
import { useBasic } from '../hooks/useBasic'; // To get the user's email
import { v4 as uuidv4 } from 'uuid';
import { type Education } from '@/types/portfolio';

export default function EducationForm() {
    // Get user email from the basic hook
    const { basic } = useBasic();
    const userEmail = basic?.email || '';

    // Fetch education data using the user's email as a key
    const { education, isLoading, updateEducation, removeEducationMutation } = useEducation(userEmail);

    const form = useForm<EducationFormSchema>({
        resolver: zodResolver(educationSchema),
        defaultValues: {
            institution: '',
            degree: '',
            startDate: new Date(),
            endDate: undefined,
            Grade: '',
        },
    });

    const onSubmit = (data: EducationFormSchema) => {
        const newEducation: Education = {
                  ...data,
                  id: uuidv4(), // Use a UUID for a temporary ID until saved
                };

        // Send a request to the backend to add the new education entry
        if (userEmail) {
            updateEducation.mutate({ email: userEmail, education: newEducation });
        }
        
        form.reset();
    };

    if (isLoading) {
        return (
            <div className="w-full max-w-2xl mx-auto p-4 text-center text-muted-foreground">
                <p>Loading education details...</p>
            </div>
        );
    }
    
    return (
        <div className="w-full max-w-2xl mx-auto p-4 space-y-8">
            {/* Education Form */}
            <div className="border border-border rounded-xl shadow-sm bg-card p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-foreground">Add New Education</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Add your educational background to showcase your qualifications
                    </p>
                </div>
                
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="institution"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Institution</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Institution Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <FormField
                            control={form.control}
                            name="degree"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Degree</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Degree" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="startDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Start Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" value={field.value ? new Date(field.value).toISOString().split("T")[0] : ""} onChange={(e) => field.onChange(new Date(e.target.value))}/>
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
                                    <FormLabel>End Date (optional)</FormLabel>
                                    <FormControl>
                                        <Input type="date" value={field.value ? new Date(field.value).toISOString().split("T")[0] : ""} onChange={(e) => field.onChange(new Date(e.target.value))}/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="Grade"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Grade/Percentage</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Grade" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button 
                            type="submit" 
                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                            disabled={updateEducation.isPending || !form.formState.isValid}
                        >
                            {updateEducation.isPending ? 'Adding...' : 'Add Education'}
                        </Button>


                    </form>
                </Form>
            </div>
            {/* Education List */}
            <div className="mt-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">Your Education</h2>
                {!education || education.length === 0 ? (
                    <p className="text-muted-foreground">No education entries added yet.</p>
                ) : (
                    <ul className="space-y-4">
                        {education.map((edu) => (
                            <li key={edu.id} className="border border-border rounded-lg p-4 bg-card">
                                <h3 className="text-lg font-medium text-foreground">{edu.institution}</h3>
                                <p className="text-sm text-muted-foreground">{edu.degree}</p>
                                <p className="text-sm text-muted-foreground">
                                    {edu.startDate ? new Date(edu.startDate).toLocaleDateString() : 'N/A'} - {edu.endDate ? new Date(edu.endDate).toLocaleDateString() : 'Present'}
                                </p>
                                <p className="text-sm text-muted-foreground">Grade: {edu.Grade}</p>
                                <Button 
                                    className="mt-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                                    onClick={() => removeEducationMutation.mutate({ email: userEmail, id: edu.id || '' })}
                                >
                                    Delete
                                </Button>
                                {/* Edit button logic is not implemented yet */}
                            </li>
                        ))}
                        {/*Options for edit and delete education*/}
                        <Button 
                            className="mt-4 bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors"
                            onClick={() => {}} >
                                {/* We can add a function to clear all education here if needed */}
                        </Button>
                    </ul>
                )}
            </div>
        </div>
    );
}
