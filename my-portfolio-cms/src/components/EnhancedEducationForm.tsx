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
import { useQueryClient } from '@tanstack/react-query';

// --- PROPS INTERFACE ---
interface EducationFormProps {
    initialData: Education[];
    onDataChange: (newData: Education[]) => void;
}

export default function EnhancedEducationForm({ initialData, onDataChange }: EducationFormProps) {
    const { currentUser } = useUserContext();
    const userEmail = currentUser?.email || '';
    const { showToast: originalShowToast } = useToast();
    const queryClient = useQueryClient();
    
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
    } = useEducation(userEmail);
    
    // --- LOCAL STATE MANAGEMENT ---
    const [educationList, setEducationList] = useState<Education[]>([]);
    const [editingEducation, setEditingEducation] = useState<Education | null>(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // --- DATA SYNCHRONIZATION ---
    useEffect(() => {
        if (Array.isArray(initialData)) {
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
        form.setValue(fieldName, value);
        const currentFormData = form.getValues();
        
        const updatedEducation: Education = {
            ...editingEducation,
            _id: editingEducation?._id || 'temp-new',
            institution: currentFormData.institution || '',
            degree: currentFormData.degree || '',
            startDate: currentFormData.startDate || new Date(),
            endDate: currentFormData.endDate,
            Grade: currentFormData.Grade || '',
        };

        let updatedList: Education[];
        
        if (editingEducation) {
            updatedList = educationList.map(edu => 
                edu._id === editingEducation._id ? updatedEducation : edu
            );
        } else if (isAddingNew) {
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
            if (editingEducation) {
                const updatedEducationItem: Education = { ...editingEducation, ...data };
                const result = await updateEducation(editingEducation._id || '', updatedEducationItem);
                handleEducationListChange(result);
                showToast('Education updated successfully!', 'success');
            } else {
                const educationData: Education = { ...data as Education };
                const result = await addEducation(educationData);
                const updatedList = [...educationList.filter(edu => edu._id !== 'temp-new'), result];
                handleEducationListChange(updatedList);
                showToast('Education added successfully!', 'success');
            }
            
            setEditingEducation(null);
            setIsAddingNew(false);
            form.reset();
            queryClient.invalidateQueries({ queryKey: ['resumeData', userEmail] });
        } catch {
            showToast('Failed to save education', 'error');
        }
    };

    const handleDelete = async (educationId: string) => {
        if (window.confirm('Are you sure you want to delete this education entry?')) {
            setIsDeleting(true);
            try {
                await removeEducation(educationId);
                const updatedList = educationList.filter(edu => edu._id !== educationId);
                handleEducationListChange(updatedList);
                showToast('Education deleted successfully!', 'success');
                if (editingEducation?._id === educationId) {
                    setEditingEducation(null);
                    setIsAddingNew(false);
                    form.reset();
                }
                queryClient.invalidateQueries({ queryKey: ['resumeData', userEmail] });
            } catch {
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
                await removeAllEducation();
                handleEducationListChange([]);
                showToast('All education entries deleted successfully!', 'success');
                queryClient.invalidateQueries({ queryKey: ['resumeData', userEmail] });
            } catch {
                showToast('Failed to delete all education entries', 'error');
            } finally {
                setIsDeleting(false);
            }
        }
    };

    const handleEdit = (education: Education) => {
        if (isAddingNew) {
            handleEducationListChange(educationList.filter(edu => edu._id !== 'temp-new'));
        }
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
        form.reset();
    };

    const handleCancelEdit = () => {
        if (isAddingNew) {
            handleEducationListChange(educationList.filter(edu => edu._id !== 'temp-new'));
        }
        setEditingEducation(null);
        setIsAddingNew(false);
        form.reset();
    };

    return (
        <ErrorBoundary>
            <section className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-semibold text-foreground">Education</h2>
                            <p className="text-sm text-muted-foreground">Your educational background.</p>
                        </div>
                        {!editingEducation && !isAddingNew && (
                            <div className="flex space-x-2">
                                <Button onClick={handleAddNew} size="sm">Add Education</Button>
                                {educationList.length > 0 && (
                                    <Button onClick={handleDeleteAll} size="sm" variant="destructive" disabled={isDeleting}>
                                        {isDeleting ? 'Deleting...' : 'Delete All'}
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="p-6 space-y-6">
                    {(editingEducation || isAddingNew) && (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <h3 className="text-lg font-medium">
                                    {editingEducation ? 'Edit Education' : 'Add New Education'}
                                </h3>
                                <FormField control={form.control} name="institution" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Institution</FormLabel>
                                        <FormControl>
                                            <Input placeholder="University Name" {...field} onChange={(e) => { field.onChange(e); handleFieldChange('institution', e.target.value); }} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="degree" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Degree</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Bachelor of Science" {...field} onChange={(e) => { field.onChange(e); handleFieldChange('degree', e.target.value); }} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="startDate" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Start Date</FormLabel>
                                            <FormControl>
                                                <Input type="date" value={field.value instanceof Date ? field.value.toISOString().split("T")[0] : ""} onChange={(e) => { const newDate = e.target.value ? new Date(e.target.value) : new Date(); field.onChange(newDate); handleFieldChange('startDate', newDate); }} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="endDate" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>End Date</FormLabel>
                                            <FormControl>
                                                <Input type="date" value={field.value instanceof Date ? field.value.toISOString().split("T")[0] : ""} onChange={(e) => { const newDate = e.target.value ? new Date(e.target.value) : undefined; field.onChange(newDate); handleFieldChange('endDate', newDate); }} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                                <FormField control={form.control} name="Grade" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Grade / GPA</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., 3.8/4.0 or 85%" {...field} onChange={(e) => { field.onChange(e); handleFieldChange('Grade', e.target.value); }} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <div className="flex justify-end space-x-2">
                                    <Button type="button" variant="ghost" onClick={handleCancelEdit}>Cancel</Button>
                                    <Button type="submit" disabled={addEducationLoading || updateEducationLoading}>
                                        {editingEducation ? (updateEducationLoading ? 'Updating...' : 'Update Education') : (addEducationLoading ? 'Adding...' : 'Add Education')}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    )}

                    {educationList.length > 0 && !isAddingNew && !editingEducation && (
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
                                                        <span>
                                                            {new Date(edu.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                                                            {edu.endDate ? ` - ${new Date(edu.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}` : ' - Present'}
                                                        </span>
                                                    </div>
                                                )}
                                                {edu.Grade && (
                                                    <div className="flex items-center ml-3">
                                                        <span>Grade: {edu.Grade}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <Button size="sm" variant="outline" onClick={() => handleEdit(edu)}>Edit</Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleDelete(edu._id || edu.id || '')} disabled={isDeleting}>Delete</Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {educationList.length === 0 && !isAddingNew && (
                        <div className="text-center py-8">
                            <h3 className="text-lg font-medium text-gray-900">No Education Added Yet</h3>
                            <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">Add your educational background.</p>
                            <Button onClick={handleAddNew} className="mt-4">Add Your First Education</Button>
                        </div>
                    )}
                </div>
            </section>
        </ErrorBoundary>
    );
}
