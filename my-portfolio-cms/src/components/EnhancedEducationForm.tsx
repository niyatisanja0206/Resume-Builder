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
import { shouldShowToast } from '@/utils/toastUtils';

// --- PROPS INTERFACE ---
interface EducationFormProps {
    initialData: Education[];
    onDataChange: (newData: Education[]) => void;
}

export default function EnhancedEducationForm({ initialData, onDataChange }: EducationFormProps) {
    const { currentUser } = useUserContext();
    const userEmail = currentUser?.email || '';
    const { showToast: originalShowToast } = useToast();
    
    // Debounced toast function to prevent excessive notifications
    const showToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
        if (shouldShowToast(message)) {
            originalShowToast(message, type);
        }
    }, [originalShowToast]);
    
    // The useEducation hook for mutation functions
    const { 
        addEducation, 
        updateEducation, 
        removeEducation, 
        removeAllEducation,
        addEducationLoading, 
        updateEducationLoading,
        //removeAllEducationLoading
    } = useEducation(userEmail);
    
    // --- LOCAL STATE MANAGEMENT ---
    const [educationList, setEducationList] = useState<Education[]>([]);
    const [editingEducation, setEditingEducation] = useState<Education | null>(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // --- DATA SYNCHRONIZATION ---
    useEffect(() => {
        console.log("Initial education data received:", initialData);
        if (Array.isArray(initialData)) {
            // Process dates to ensure they are proper Date objects
            const processedData = initialData.map(item => ({
                ...item,
                startDate: item.startDate ? new Date(item.startDate) : new Date(),
                endDate: item.endDate ? new Date(item.endDate) : undefined
            }));
            setEducationList(processedData);
        } else {
            setEducationList([]);
        }
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
            Grade: currentFormData.Grade || '',
            // Ensure we preserve any other properties that might exist
            ...(editingEducation || {})
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
                const updatedEducationItem: Education = { 
                    ...editingEducation, 
                    ...data,
                    // Ensure dates are properly formatted
                    startDate: data.startDate ? new Date(data.startDate) : new Date(),
                    endDate: data.endDate ? new Date(data.endDate) : undefined
                };
                
                await updateEducation(editingEducation._id || '', updatedEducationItem);
                
                const updatedList = educationList.map(edu => 
                    edu._id === editingEducation._id ? updatedEducationItem : edu
                );
                handleEducationListChange(updatedList);
                
                showToast('Education updated successfully!', 'success');
            } else {
                // Add new education
                console.log("Adding new education with data:", data);
                
                try {
                    // Prepare the education data with proper date formatting
                    const educationData: Education = {
                        ...data as Education,
                        startDate: data.startDate ? new Date(data.startDate) : new Date(),
                        endDate: data.endDate ? new Date(data.endDate) : undefined
                    };
                    
                    // The addEducation function from the hook already includes the email
                    const result = await addEducation(educationData);
                    console.log("Received new education item:", result);
                    
                    // Remove temp entry and add real one
                    const filteredList = educationList.filter(edu => edu._id !== 'temp-new');
                    const updatedList = [...filteredList, result];
                    console.log("Updated education list:", updatedList);
                    
                    handleEducationListChange(updatedList);
                    
                    showToast('Education added successfully!', 'success');
                } catch (error) {
                    console.error("Error adding education:", error);
                    showToast('Failed to add education', 'error');
                }
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
            setIsDeleting(true);
            try {
                await removeEducation(educationId);
                // Update the local state immediately for better UX
                const updatedList = educationList.filter(edu => edu._id !== educationId);
                handleEducationListChange(updatedList);
                showToast('Education deleted successfully!', 'success');
                
                // If we were editing the item that was just deleted, reset the form
                if (editingEducation && editingEducation._id === educationId) {
                    setEditingEducation(null);
                    setIsAddingNew(false);
                    form.reset();
                }
            } catch (error) {
                console.error('Failed to delete education:', error);
                showToast('Failed to delete education', 'error');
            } finally {
                setIsDeleting(false);
            }
        }
    };

    const handleDeleteAll = async () => {
        if (window.confirm('Are you sure you want to delete ALL education entries? This action cannot be undone.')) {
            setIsDeleting(true);
            try {
                // Use the removeAllEducation function from the hook to delete all entries at once
                await removeAllEducation();
                
                // Clear the local list
                handleEducationListChange([]);
                showToast('All education entries deleted successfully!', 'success');
            } catch (error) {
                console.error('Failed to delete all education entries:', error);
                showToast('Failed to delete all education entries', 'error');
            } finally {
                setIsDeleting(false);
            }
        }
    };

    const handleEdit = (education: Education) => {
        // Ensure we're not already editing or adding a new entry
        if (isAddingNew) {
            // Remove temporary entry if we were adding one
            const updatedList = educationList.filter(edu => edu._id !== 'temp-new');
            handleEducationListChange(updatedList);
        }
        
        setEditingEducation(education);
        setIsAddingNew(false);
        
        // Format dates properly
        const startDate = education.startDate ? new Date(education.startDate) : new Date();
        const endDate = education.endDate ? new Date(education.endDate) : undefined;
        
        form.reset({
            institution: education.institution || '',
            degree: education.degree || '',
            startDate: startDate,
            endDate: endDate,
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
                            <div className="flex space-x-2">
                                <Button onClick={handleAddNew} size="sm" className="bg-blue-500 hover:bg-blue-600 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add Education
                                </Button>
                                {educationList.length > 0 && (
                                    <Button 
                                        onClick={handleDeleteAll} 
                                        size="sm" 
                                        variant="destructive"
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? 'Deleting...' : 'Delete All'}
                                    </Button>
                                )}
                            </div>
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
                                                        value={field.value instanceof Date ? field.value.toISOString().split("T")[0] : ""} 
                                                        onChange={(e) => {
                                                            const newDate = e.target.value ? new Date(e.target.value) : new Date();
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
                                                        value={field.value instanceof Date ? field.value.toISOString().split("T")[0] : ""} 
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

                    {/* List of existing education items - Always show in view mode */}
                    {educationList.length > 0 && (
                        <div className="space-y-4 pt-6 border-t">
                            <h3 className="text-lg font-medium">Your Education History</h3>
                            {educationList.map((edu) => (
                                <div key={edu._id || 'temp-' + Math.random()} className="p-4 bg-gray-50 hover:bg-gray-100 transition-colors rounded-md border mb-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-lg">{edu.degree || 'Untitled Degree'}</p>
                                            <p className="text-md text-gray-700">{edu.institution || 'Institution'}</p>
                                            
                                            <div className="flex flex-wrap gap-2 mt-2 text-sm text-gray-600">
                                                {edu.startDate && (
                                                    <div className="flex items-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <span>
                                                            {new Date(edu.startDate).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'short'
                                                            })}
                                                            {edu.endDate ? 
                                                                ` - ${new Date(edu.endDate).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'short'
                                                                })}` 
                                                                : ' - Present'}
                                                        </span>
                                                    </div>
                                                )}
                                                
                                                {edu.Grade && (
                                                    <div className="flex items-center ml-3">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span>Grade: {edu.Grade}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="flex space-x-2">
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                className="flex items-center" 
                                                onClick={() => handleEdit(edu)}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                                Edit
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="destructive"
                                                className="flex items-center"
                                                onClick={() => handleDelete(edu._id || edu.id || '')}
                                                disabled={isDeleting}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {/* Empty state when no education entries exist */}
                    {educationList.length === 0 && !isAddingNew && (
                        <div className="text-center py-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path d="M12 14l9-5-9-5-9 5 9 5z" />
                                    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No Education Added Yet</h3>
                            <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                                Add your educational background to showcase your academic achievements and qualifications.
                            </p>
                            <Button onClick={handleAddNew} className="mt-4">
                                Add Your First Education
                            </Button>
                        </div>
                    )}
                    
                    {/* Info message when entries exist */}
                    {educationList.length > 0 && !editingEducation && !isAddingNew && (
                        <div className="text-sm bg-blue-50 border border-blue-100 text-blue-600 p-3 rounded-md flex items-center mt-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p>Click "Edit" on any education entry to make changes or "Add Education" to add a new one.</p>
                        </div>
                    )}
                </div>
            </section>
        </ErrorBoundary>
    );
}
