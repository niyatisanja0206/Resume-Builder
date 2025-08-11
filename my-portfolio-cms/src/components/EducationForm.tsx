import { useState, useEffect } from 'react';
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
import { useUserContext } from '@/contexts/useUserContext';
import { type Education } from '@/types/portfolio';

export default function EducationForm() {
    const { currentUser } = useUserContext();
    const userEmail = currentUser?.email || '';
    
    const { education, isLoading, error, addEducation, updateEducation, removeEducation, removeAllEducation, addEducationLoading, updateEducationLoading } = useEducation(userEmail);
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [editingEducation, setEditingEducation] = useState<Education | null>(null);

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

    // Clear success message after 3 seconds
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    const onSubmit = async (data: EducationFormSchema) => {
        try {
            if (editingEducation) {
                // Update existing education
                const updatedEducation: Education = {
                    ...editingEducation,
                    ...data,
                };

                if (userEmail) {
                    await updateEducation(editingEducation._id || editingEducation.id || '', updatedEducation);
                    setSuccessMessage('Education updated successfully!');
                    setEditingEducation(null);
                    form.reset({
                        institution: '',
                        degree: '',
                        startDate: new Date(),
                        endDate: undefined,
                        Grade: '',
                    });
                }
            } else {
                // Add new education
                const newEducation: Omit<Education, 'id' | '_id'> = {
                    ...data,
                    // Let MongoDB generate _id automatically
                };

                if (userEmail) {
                    await addEducation(newEducation as Education);
                    setSuccessMessage('Education added successfully!');
                    form.reset({
                        institution: '',
                        degree: '',
                        startDate: new Date(),
                        endDate: undefined,
                        Grade: '',
                    });
                }
            }
        } catch (error) {
            console.error('Failed to submit education:', error);
        }
    };

    const handleDelete = async (educationId: string) => {
        if (window.confirm('Are you sure you want to delete this education entry?')) {
            try {
                if (userEmail) {
                    await removeEducation(educationId);
                    setSuccessMessage('Education deleted successfully!');
                }
            } catch (error) {
                console.error('Failed to delete education:', error);
            }
        }
    };

    const handleDeleteAll = async () => {
        if (window.confirm('Are you sure you want to delete all education records? This action cannot be undone.')) {
            try {
                if (userEmail) {
                    await removeAllEducation();
                    setSuccessMessage('All education records deleted successfully!');
                }
            } catch (error) {
                console.error('Error deleting all education:', error);
            }
        }
    };

    const handleEditEducation = (education: Education) => {
        setEditingEducation(education);
        form.reset({
            institution: education.institution || '',
            degree: education.degree || '',
            startDate: education.startDate || new Date(),
            endDate: education.endDate || undefined,
            Grade: education.Grade || '',
        });
    };

    const handleCancelEdit = () => {
        setEditingEducation(null);
        form.reset({
            institution: '',
            degree: '',
            startDate: new Date(),
            endDate: undefined,
            Grade: '',
        });
    };

    if (isLoading) {
        return (
            <div className="w-full max-w-4xl mx-auto p-4 space-y-8 text-center text-muted-foreground">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p>Loading education information...</p>
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
                            Please fill out your basic information first before adding education details. 
                            Go to the "Basic Information" section above to get started.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full max-w-4xl mx-auto p-4 space-y-8">
                <div className="border border-destructive/50 rounded-xl shadow-sm bg-destructive/5 overflow-hidden">
                    <div className="p-6 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
                            <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-destructive mb-2">Error Loading Education</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            There was an error loading your education information. Please try refreshing the page.
                        </p>
                        <Button 
                            onClick={() => window.location.reload()} 
                            variant="outline"
                            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                            Refresh Page
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="w-full max-w-2xl mx-auto p-4 text-center text-muted-foreground">
                <p>Loading education details...</p>
            </div>
        );
    }
    
    return (
        <div className="w-full max-w-2xl mx-auto p-4 space-y-8">
            {/* Success Message */}
            {successMessage && (
                <div className="border border-green-200 rounded-xl shadow-sm bg-green-50 overflow-hidden">
                    <div className="p-4 flex items-center space-x-3">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-sm text-green-800">{successMessage}</p>
                    </div>
                </div>
            )}

            {/* Education Form */}
            <div className="border border-border rounded-xl shadow-sm bg-card p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">
                            {editingEducation ? 'Edit Education' : 'Add New Education'}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            {editingEducation 
                                ? 'Update your educational background information'
                                : 'Add your educational background to showcase your qualifications'
                            }
                        </p>
                    </div>
                    {editingEducation && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancelEdit}
                            className="border-border text-muted-foreground hover:bg-muted"
                        >
                            Cancel Edit
                        </Button>
                    )}
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
                            disabled={(editingEducation ? updateEducationLoading : addEducationLoading) || Object.keys(form.formState.errors).length > 0}
                        >
                            {editingEducation 
                                ? (updateEducationLoading ? 'Updating...' : 'Update Education')
                                : (addEducationLoading ? 'Adding...' : 'Add Education')
                            }
                        </Button>


                    </form>
                </Form>
            </div>
            {/* Education List */}
            <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-foreground">Your Education</h2>
                    {education && education.length > 0 && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleDeleteAll}
                            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        >
                            Clear All
                        </Button>
                    )}
                </div>
                {!education || education.length === 0 ? (
                    <p className="text-muted-foreground">No education entries added yet.</p>
                ) : (
                    <ul className="space-y-4">
                        {education.map((edu, index) => (
                            <li key={edu._id || edu.id || `education-${index}`} className="border border-border rounded-lg p-4 bg-card">
                                <h3 className="text-lg font-medium text-foreground">{edu.institution}</h3>
                                <p className="text-sm text-muted-foreground">{edu.degree}</p>
                                <p className="text-sm text-muted-foreground">
                                    {edu.startDate ? new Date(edu.startDate).toLocaleDateString() : 'N/A'} - {edu.endDate ? new Date(edu.endDate).toLocaleDateString() : 'Present'}
                                </p>
                                <p className="text-sm text-muted-foreground">Grade: {edu.Grade}</p>
                                <div className="flex gap-2 mt-3">
                                    <Button 
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleEditEducation(edu)}
                                        className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                                    >
                                        Edit
                                    </Button>
                                    <Button 
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleDelete(edu._id || edu.id || '')}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
