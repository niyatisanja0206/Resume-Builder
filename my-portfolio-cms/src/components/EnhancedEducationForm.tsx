import { useState, useEffect, useCallback } from 'react';
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
import { useToast } from '../contexts/ToastContext';
import ErrorBoundary from './ErrorBoundary';

// --- PROPS INTERFACE ---
interface EducationFormProps {
    initialData: Education[];
    onDataChange: (newData: Education[]) => void;
}

export default function EducationForm({ initialData, onDataChange }: EducationFormProps) {
    const { currentUser } = useUserContext();
    const userEmail = currentUser?.email || '';
    const { showToast } = useToast();
    
    // The useEducation hook for mutation functions
    const { addEducation, updateEducation, removeEducation, addEducationLoading, updateEducationLoading } = useEducation(userEmail);
    
    // --- LOCAL STATE MANAGEMENT ---
    const [educationList, setEducationList] = useState<Education[]>([]);
    const [editingEducation, setEditingEducation] = useState<Education | null>(null);
    const [isAddingNew, setIsAddingNew] = useState(false);

    // --- DATA SYNCHRONIZATION ---
    useEffect(() => {
        setEducationList(initialData || []);
    }, [initialData]);

    // --- LIVE UPDATE HANDLER ---
    const handleEducationListChange = useCallback((newEducationList: Education[]) => {
        setEducationList(newEducationList);
        onDataChange(newEducationList);
    }, [onDataChange]);

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

    // --- LIVE UPDATE FOR FORM FIELDS ---
    const handleFieldChange = useCallback((fieldName: keyof EducationFormSchema, value: string | Date | undefined) => {
        // Update the form field
        form.setValue(fieldName, value);
        
        // Get current form values
        const currentFormData = form.getValues();
        
        // Create updated education object
        const updatedEducation: Education = {
            _id: editingEducation?._id || (isAddingNew ? 'temp-new' : ''),
            institution: currentFormData.institution || '',
            degree: currentFormData.degree || '',
            startDate: currentFormData.startDate || new Date(),
            endDate: currentFormData.endDate,
            Grade: currentFormData.Grade || ''
        };

        let updatedList: Education[];
        
        if (editingEducation) {
            // Update existing education item
            updatedList = educationList.map(edu => 
                edu._id === editingEducation._id ? updatedEducation : edu
            );
        } else if (isAddingNew) {
            // Update the temporary new entry or add it if it doesn't exist
            const tempIndex = educationList.findIndex(edu => edu._id === 'temp-new');
            if (tempIndex >= 0) {
                updatedList = [...educationList];
                updatedList[tempIndex] = updatedEducation;
            } else {
                updatedList = [...educationList, updatedEducation];
            }
        } else {
            updatedList = educationList;
        }
        
        handleEducationListChange(updatedList);
    }, [form, editingEducation, isAddingNew, educationList, handleEducationListChange]);

    // --- HANDLERS ---
    const onSubmit = async (data: EducationFormSchema) => {
        try {
            if (editingEducation && editingEducation._id !== 'temp-new') {
                // Update existing education
                const updatedEducationItem: Education = { ...editingEducation, ...data };
                await updateEducation(editingEducation._id || '', updatedEducationItem);
                
                const updatedList = educationList.map(edu => 
                    edu._id === editingEducation._id ? updatedEducationItem : edu
                );
                handleEducationListChange(updatedList);
                
                showToast('Education updated successfully!', 'success');
            } else {
                // Add new education
                const newEducationItem = await addEducation(data as Education);
                
                // Remove temp entry and add real one
                const filteredList = educationList.filter(edu => edu._id !== 'temp-new');
                const updatedList = [...filteredList, newEducationItem];
                handleEducationListChange(updatedList);
                
                showToast('Education added successfully!', 'success');
            }
            
            // Reset form state
            setEditingEducation(null);
            setIsAddingNew(false);
            form.reset();
        } catch (error) {
            console.error('Failed to submit education:', error);
            showToast('Failed to save education', 'error');
        }
    };

    const handleDelete = async (educationId: string) => {
        if (educationId === 'temp-new') {
            // Just remove from local state if it's a temporary entry
            const updatedList = educationList.filter(edu => edu._id !== educationId);
            handleEducationListChange(updatedList);
            setIsAddingNew(false);
            setEditingEducation(null);
            form.reset();
            return;
        }

        if (window.confirm('Are you sure you want to delete this education entry?')) {
            try {
                await removeEducation(educationId);
                const updatedList = educationList.filter(edu => edu._id !== educationId);
                handleEducationListChange(updatedList);
                showToast('Education deleted successfully!', 'success');
            } catch (error) {
                console.error('Failed to delete education:', error);
                showToast('Failed to delete education', 'error');
            }
        }
    };

    const handleEdit = (education: Education) => {
        setEditingEducation(education);
        setIsAddingNew(false);
        form.reset({
            institution: education.institution || '',
            degree: education.degree || '',
            startDate: education.startDate ? new Date(education.startDate) : new Date(),
            endDate: education.endDate ? new Date(education.endDate) : undefined,
            Grade: education.Grade || '',
        });
    };

    const handleAddNew = () => {
        setIsAddingNew(true);
        setEditingEducation(null);
        form.reset({
            institution: '',
            degree: '',
            startDate: new Date(),
            endDate: undefined,
            Grade: '',
        });
    };

    const handleCancelEdit = () => {
        setEditingEducation(null);
        setIsAddingNew(false);
        
        // Remove temp entry if it exists
        if (isAddingNew) {
            const updatedList = educationList.filter(edu => edu._id !== 'temp-new');
            handleEducationListChange(updatedList);
        }
        
        form.reset();
    };

    return (
        <ErrorBoundary>
            <section className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-semibold text-foreground">Education</h2>
                            <p className="text-sm text-muted-foreground">Your educational background and qualifications.</p>
                        </div>
                        {!editingEducation && !isAddingNew && (
                            <Button onClick={handleAddNew} size="sm">
                                Add Education
                            </Button>
                        )}
                    </div>
                </div>
                
                <div className="p-6 space-y-6">
                    {/* Form for adding/editing */}
                    {(editingEducation || isAddingNew) && (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <h3 className="text-lg font-medium">
                                    {editingEducation && editingEducation._id !== 'temp-new' ? 'Edit Education' : 'Add New Education'}
                                </h3>
                                
                                <FormField 
                                    control={form.control} 
                                    name="institution" 
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Institution</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    placeholder="University Name" 
                                                    {...field}
                                                    onChange={(e) => {
                                                        field.onChange(e);
                                                        handleFieldChange('institution', e.target.value);
                                                    }}
                                                />
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
                                                <Input 
                                                    placeholder="e.g., Bachelor of Science" 
                                                    {...field}
                                                    onChange={(e) => {
                                                        field.onChange(e);
                                                        handleFieldChange('degree', e.target.value);
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} 
                                />
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField 
                                        control={form.control} 
                                        name="startDate" 
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Start Date</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        type="date" 
                                                        value={field.value ? new Date(field.value).toISOString().split("T")[0] : ""} 
                                                        onChange={(e) => {
                                                            const newDate = new Date(e.target.value);
                                                            field.onChange(newDate);
                                                            handleFieldChange('startDate', newDate);
                                                        }} 
                                                    />
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
                                                <FormLabel>End Date</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        type="date" 
                                                        value={field.value ? new Date(field.value).toISOString().split("T")[0] : ""} 
                                                        onChange={(e) => {
                                                            const newDate = e.target.value ? new Date(e.target.value) : undefined;
                                                            field.onChange(newDate);
                                                            handleFieldChange('endDate', newDate);
                                                        }} 
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} 
                                    />
                                </div>
                                
                                <FormField 
                                    control={form.control} 
                                    name="Grade" 
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Grade / GPA</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    placeholder="e.g., 3.8/4.0 or 85%" 
                                                    {...field}
                                                    onChange={(e) => {
                                                        field.onChange(e);
                                                        handleFieldChange('Grade', e.target.value);
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} 
                                />
                                
                                <div className="flex justify-end space-x-2">
                                    <Button type="button" variant="ghost" onClick={handleCancelEdit}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={addEducationLoading || updateEducationLoading}>
                                        {editingEducation && editingEducation._id !== 'temp-new' ? 
                                            (updateEducationLoading ? 'Updating...' : 'Update Education') : 
                                            (addEducationLoading ? 'Adding...' : 'Add Education')
                                        }
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    )}

                    {/* List of existing education items */}
                    {educationList.length > 0 && (
                        <div className="space-y-4 pt-6 border-t">
                            <h3 className="text-lg font-medium">Your Education History</h3>
                            {educationList.map((edu) => (
                                <div key={edu._id || edu.id || 'temp'} className="flex justify-between items-center p-3 bg-muted/50 rounded-md">
                                    <div>
                                        <p className="font-semibold">{edu.degree || 'Untitled Degree'}</p>
                                        <p className="text-sm text-muted-foreground">{edu.institution || 'Institution'}</p>
                                        {edu.Grade && <p className="text-xs text-muted-foreground">Grade: {edu.Grade}</p>}
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button size="sm" variant="outline" onClick={() => handleEdit(edu)}>
                                            Edit
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant="destructive" 
                                            onClick={() => handleDelete(edu._id || edu.id || '')}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </ErrorBoundary>
    );
}
