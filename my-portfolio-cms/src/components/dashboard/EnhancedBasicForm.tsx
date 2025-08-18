import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { basicSchema } from '@/lib/zodschema';
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
import { useBasicForm } from '../../hooks/useBasic';
import { Textarea } from '@/components/ui/textarea';
import { type Basic } from '@/types/portfolio';
import { useUserContext } from '@/hooks/useUserContext';
import { useToast } from '../../contexts/ToastContext';
import { shouldShowToast } from '@/utils/toastUtils';

// --- PROPS INTERFACE ---
interface BasicFormProps {
    initialData: Basic | null;
    onDataChange: (newData: Basic | null) => void;
    onSaveSuccess?: (savedData: Basic) => void;
    onSaveError?: (error: Error) => void;
}

export default function EnhancedBasicForm({
  initialData,
  onDataChange,
  onSaveSuccess,
  onSaveError
}: BasicFormProps) {
    // This hook is used for backend communication
    const { updateBasic, removeBasicMutation } = useBasicForm();
    const queryClient = useQueryClient();

    // Get user context safely with fallbacks
    const userContext = useUserContext();
    const setCurrentUser = userContext?.setCurrentUser;
    const currentUser = userContext?.currentUser;

    const { showToast: originalShowToast } = useToast();

    // Debounced toast function to prevent excessive notifications
    const showToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
        if (shouldShowToast(message)) {
            originalShowToast(message, type);
        }
    }, [originalShowToast]);

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const currentEmail = initialData?.email || currentUser?.email || '';

    // Create form using react-hook-form and Zod for validation
    const form = useForm({
        defaultValues: {
            name: '',
            contact_no: '',
            email: currentEmail,
            location: '',
            about: '',
        },
        resolver: zodResolver(basicSchema),
        mode: 'onChange',
    });

    // --- DATA SYNCHRONIZATION ---

    // Effect to set the initial editing state only once on mount
    useEffect(() => {
        if (!initialData || !initialData.name) {
            setIsEditing(true);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array ensures this runs only once.

    // Effect to keep the form's displayed values in sync with data from the parent Dashboard
    useEffect(() => {
        if (initialData) {
            form.reset({
                name: initialData.name || '',
                contact_no: initialData.contact_no || '',
                email: initialData.email || currentEmail || '',
                location: initialData.location || '',
                about: initialData.about || '',
            });
        }
    }, [initialData, currentEmail, form]);

    // --- LIVE PREVIEW HANDLER ---
    // This function is called on every keystroke to update the parent's state for the live preview.
    const handleFieldChange = useCallback((
      fieldName: keyof Basic,
      value: string
    ) => {
        // Get the current state of all form fields from react-hook-form
        const currentFormData = form.getValues();
        // Create the new, updated data object
        const newData = {
            ...initialData,       // Use initialData as a safe base
            ...currentFormData,   // Overlay with current form values
            [fieldName]: value,   // Apply the specific change from the input
        };
        // Pass the complete, updated object to the parent (Dashboard)
        onDataChange(newData as Basic);
    }, [form, initialData, onDataChange]);


    // --- FORM SUBMISSION ---
    const onSubmit = useCallback(async (data: Record<string, string>) => {
        setIsSaving(true);
        try {
            if (!data.email || !data.email.trim()) {
                throw new Error('Email is required');
            }

            const payload = {
                ...(initialData || {}),
                name: data.name || '',
                contact_no: data.contact_no || '',
                email: data.email.trim(),
                location: data.location || '',
                about: data.about || '',
            } as Basic;

            // Await the mutation to ensure the API call is complete
            const updatedData = await updateBasic.mutateAsync(payload);

            // Invalidate the main dashboard query to trigger a refetch
            await queryClient.invalidateQueries({ queryKey: ['resumeData', updatedData.email] });

            // Now that the data is saved and we have the response, update the UI
            onDataChange(updatedData);
            if (setCurrentUser) {
                setCurrentUser(updatedData);
            }
            setIsEditing(false); // Exit editing mode
            onSaveSuccess?.(updatedData);
            showToast('Profile updated successfully!', 'success');

        } catch (submitError) {
            const errorObj = submitError instanceof Error ? submitError : new Error('Unexpected error occurred');
            onSaveError?.(errorObj);
            showToast(`Error: ${errorObj.message}`, 'error');
        } finally {
            setIsSaving(false);
        }
    }, [initialData, onDataChange, onSaveSuccess, onSaveError, updateBasic, setCurrentUser, showToast, queryClient]);

    // --- DELETE HANDLER ---
    const handleDelete = useCallback(() => {
        const emailToDelete = initialData?.email || form.getValues().email;
        if (!emailToDelete) return;

        if (window.confirm('Are you sure you want to delete your profile? This action cannot be undone.')) {
            removeBasicMutation.mutate(emailToDelete, {
                onSuccess: () => {
                    onDataChange(null);
                    if (setCurrentUser) setCurrentUser(null);
                    form.reset();
                    setIsEditing(true); // Go back to editing mode for a new entry
                    showToast('Profile deleted successfully!', 'success');
                    // Invalidate the dashboard query on delete as well
                    queryClient.invalidateQueries({ queryKey: ['resumeData', emailToDelete] });
                },
                onError: (error) => {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    showToast(`Failed to delete profile: ${errorMessage}`, 'error');
                }
            });
        }
    }, [initialData?.email, form, removeBasicMutation, onDataChange, setCurrentUser, showToast, queryClient]);

    // --- EDIT MODE HANDLERS ---
    const startEditing = useCallback(() => setIsEditing(true), []);
    const cancelEditing = useCallback(() => {
        setIsEditing(false);
        if (initialData) {
            form.reset(initialData);
            onDataChange(initialData); // Revert preview to original data
        }
    }, [initialData, form, onDataChange]);

    return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Basic Information</h3>
                    <div className="flex space-x-2">
                        {!isEditing ? (
                            <>
                                <Button onClick={startEditing} size="sm" disabled={isSaving}>
                                    Edit Profile
                                </Button>
                                {initialData && (
                                    <Button onClick={handleDelete} size="sm" variant="destructive" disabled={isSaving}>
                                        Delete
                                    </Button>
                                )}
                            </>
                        ) : (
                            <Button onClick={cancelEditing} size="sm" variant="outline" disabled={isSaving}>
                                Cancel
                            </Button>
                        )}
                    </div>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name *</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Enter your full name"
                                            disabled={!isEditing || isSaving}
                                            className={!isEditing ? "bg-gray-50 text-gray-800 font-medium" : ""}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                handleFieldChange('name', e.target.value);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Address *</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="email"
                                            placeholder="Enter your email address"
                                            readOnly // This makes the field not editable
                                            className={"bg-gray-100 text-gray-500 font-medium cursor-not-allowed"}
                                        />
                                    </FormControl>
                                    <p className="text-xs text-gray-500 pt-1">Your email is your account identifier and cannot be changed here.</p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="contact_no"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Enter your phone number"
                                            disabled={!isEditing || isSaving}
                                            className={!isEditing ? "bg-gray-50 text-gray-800 font-medium" : ""}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                handleFieldChange('contact_no', e.target.value);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Location</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Enter your location"
                                            disabled={!isEditing || isSaving}
                                            className={!isEditing ? "bg-gray-50 text-gray-800 font-medium" : ""}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                handleFieldChange('location', e.target.value);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="about"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>About / Summary</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            placeholder="Write a brief summary about yourself"
                                            disabled={!isEditing || isSaving}
                                            className={!isEditing ? "bg-gray-50 text-gray-800 font-medium" : ""}
                                            rows={4}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                handleFieldChange('about', e.target.value);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {isEditing && (
                            <div className="flex justify-end space-x-2 pt-4">
                                <Button type="submit" disabled={isSaving} className="min-w-[120px]">
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        )}
                    </form>
                </Form>
            </div>
    );
}
