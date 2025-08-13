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

// --- NEW PROPS INTERFACE ---
interface EducationFormProps {
    initialData: Education[];
    onDataChange: (newData: Education[]) => void;
}

export default function EducationForm({ initialData, onDataChange }: EducationFormProps) {
    const { currentUser } = useUserContext();
    const userEmail = currentUser?.email || '';
    
    // The useEducation hook is kept for its mutation functions (add, update, delete)
    const { addEducation, updateEducation, removeEducation, addEducationLoading, updateEducationLoading } = useEducation(userEmail);
    
    // --- LOCAL STATE MANAGEMENT ---
    // This local state holds the list of education items for this form.
    const [educationList, setEducationList] = useState<Education[]>([]);
    const [editingEducation, setEditingEducation] = useState<Education | null>(null);
    const [successMessage, setSuccessMessage] = useState<string>('');

    // --- DATA SYNCHRONIZATION ---
    // Sync local state with the initial data passed from the Dashboard.
    useEffect(() => {
        setEducationList(initialData || []);
    }, [initialData]);

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

    // --- HANDLERS ---
    const onSubmit = async (data: EducationFormSchema) => {
        try {
            if (editingEducation) {
                // Update existing education
                const updatedEducationItem: Education = { ...editingEducation, ...data };
                await updateEducation(editingEducation._id || editingEducation.id || '', updatedEducationItem);
                
                const updatedList = educationList.map(edu => 
                    edu._id === updatedEducationItem._id ? updatedEducationItem : edu
                );
                setEducationList(updatedList);
                onDataChange(updatedList); // Notify parent
                
                setSuccessMessage('Education updated successfully!');
                setEditingEducation(null);
            } else {
                // Add new education
                const newEducationItem = await addEducation(data as Education);
                
                const updatedList = [...educationList, newEducationItem];
                setEducationList(updatedList);
                onDataChange(updatedList); // Notify parent
                
                setSuccessMessage('Education added successfully!');
            }
            form.reset();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Failed to submit education:', error);
        }
    };

    const handleDelete = async (educationId: string) => {
        if (window.confirm('Are you sure you want to delete this education entry?')) {
            try {
                await removeEducation(educationId);
                const updatedList = educationList.filter(edu => edu._id !== educationId);
                setEducationList(updatedList);
                onDataChange(updatedList); // Notify parent
                setSuccessMessage('Education deleted successfully!');
                setTimeout(() => setSuccessMessage(''), 3000);
            } catch (error) {
                console.error('Failed to delete education:', error);
            }
        }
    };

    const handleEdit = (education: Education) => {
        setEditingEducation(education);
        form.reset({
            institution: education.institution || '',
            degree: education.degree || '',
            startDate: education.startDate ? new Date(education.startDate) : new Date(),
            endDate: education.endDate ? new Date(education.endDate) : undefined,
            Grade: education.Grade || '',
        });
    };

    const handleCancelEdit = () => {
        setEditingEducation(null);
        form.reset();
    };

    return (
        <section className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border">
                <h2 className="text-xl font-semibold text-foreground">Education</h2>
                <p className="text-sm text-muted-foreground">Your educational background and qualifications.</p>
            </div>
            <div className="p-6 space-y-6">
                {successMessage && (
                    <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded-md text-sm">
                        {successMessage}
                    </div>
                )}
                
                {/* Form for adding/editing */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <h3 className="text-lg font-medium">{editingEducation ? 'Edit Education' : 'Add New Education'}</h3>
                        <FormField control={form.control} name="institution" render={({ field }) => (
                            <FormItem><FormLabel>Institution</FormLabel><FormControl><Input placeholder="University Name" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="degree" render={({ field }) => (
                            <FormItem><FormLabel>Degree</FormLabel><FormControl><Input placeholder="e.g., Bachelor of Science" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="startDate" render={({ field }) => (
                                <FormItem><FormLabel>Start Date</FormLabel><FormControl><Input type="date" value={field.value ? new Date(field.value).toISOString().split("T")[0] : ""} onChange={(e) => field.onChange(new Date(e.target.value))} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="endDate" render={({ field }) => (
                                <FormItem><FormLabel>End Date</FormLabel><FormControl><Input type="date" value={field.value ? new Date(field.value).toISOString().split("T")[0] : ""} onChange={(e) => field.onChange(new Date(e.target.value))} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                        <FormField control={form.control} name="Grade" render={({ field }) => (
                            <FormItem><FormLabel>Grade / GPA</FormLabel><FormControl><Input placeholder="e.g., 3.8/4.0 or 85%" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <div className="flex justify-end space-x-2">
                            {editingEducation && <Button type="button" variant="ghost" onClick={handleCancelEdit}>Cancel</Button>}
                            <Button type="submit" disabled={addEducationLoading || updateEducationLoading}>
                                {editingEducation ? (updateEducationLoading ? 'Updating...' : 'Update Education') : (addEducationLoading ? 'Adding...' : 'Add Education')}
                            </Button>
                        </div>
                    </form>
                </Form>

                {/* List of existing education items */}
                {educationList.length > 0 && (
                    <div className="space-y-4 pt-6 border-t">
                        <h3 className="text-lg font-medium">Your Education History</h3>
                        {educationList.map((edu) => (
                            <div key={edu._id || edu.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-md">
                                <div>
                                    <p className="font-semibold">{edu.degree}</p>
                                    <p className="text-sm text-muted-foreground">{edu.institution}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <Button size="sm" variant="outline" onClick={() => handleEdit(edu)}>Edit</Button>
                                    <Button size="sm" variant="destructive" onClick={() => handleDelete(edu._id || edu.id || '')}>Delete</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
