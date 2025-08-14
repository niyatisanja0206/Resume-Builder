import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { useBasicForm } from '../hooks/useBasic';
import { Textarea } from '@/components/ui/textarea';
import { type Basic } from '@/types/portfolio';
import { useUserContext } from '@/contexts/useUserContext';
import { useToast } from '../contexts/ToastContext';
import ErrorBoundary from './ErrorBoundary';

// --- PROPS INTERFACE ---
interface BasicFormProps {
    initialData: Basic | null;
    onDataChange: (newData: Basic | null) => void;
    onSaveSuccess?: (savedData: Basic) => void;
    onSaveError?: (error: Error) => void;
}

export default function BasicForm({ 
  initialData, 
  onDataChange, 
  onSaveSuccess,
  onSaveError 
}: BasicFormProps) {
    // This hook is used for backend communication
    const { updateBasic, removeBasicMutation } = useBasicForm();
    const { setCurrentUser, currentUser } = useUserContext();
    const { showToast } = useToast();
    
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const currentEmail = initialData?.email || currentUser?.email || '';

    // Create form following the same pattern as other forms
    const form = useForm({
        defaultValues: {
            name: '',
            contact_no: '',
            email: currentEmail,
            location: '',
            about: '',
        },
        resolver: zodResolver(basicSchema),
        mode: 'onChange'
    });

    // --- DATA SYNCHRONIZATION ---
    // This effect populates the form whenever the initialData changes
    useEffect(() => {
        if (initialData) {
            // Create default values object with all fields as strings
            const defaultValues = {
                name: initialData.name || '',
                contact_no: initialData.contact_no || '',
                email: initialData.email || '',
                location: initialData.location || '',
                about: initialData.about || '',
            };
            
            console.log('Resetting form with data:', defaultValues);
            form.reset(defaultValues);
            
            // If there's no name, start in editing mode
            if (!initialData.name) {
                setIsEditing(true);
            }
        } else if (!initialData) {
            setIsEditing(true);
        }
    }, [initialData, form]);

    // --- LIVE UPDATE HANDLER ---
    const handleFieldChange = useCallback((
      fieldName: 'name' | 'contact_no' | 'email' | 'location' | 'about', 
      value: string
    ) => {
        // Update form field
        form.setValue(fieldName, value);
        
        // Create updated data for immediate preview
        const currentValues = form.getValues();
        const updatedData: Basic = {
            ...(initialData || {}),
            ...currentValues,
            [fieldName]: value
        } as Basic;
        
        // Update preview immediately - this provides the live typing effect
        onDataChange(updatedData);
    }, [form, initialData, onDataChange]);

    // --- FORM SUBMISSION ---
    const onSubmit = useCallback(async (data: Record<string, string>) => {
        console.log('Form submitted with data:', data);
        setIsSaving(true);
        
        try {
            // Validate required fields
            if (!data.email || !data.email.trim()) {
                throw new Error('Email is required');
            }

            // Create sanitized data object
            const sanitizedData = {
                name: data.name || '',
                contact_no: data.contact_no || '',
                email: data.email.trim(),
                location: data.location || '',
                about: data.about || '',
            };
            
            // Create payload that preserves ID if it exists
            const payload = { 
                ...(initialData || {}),
                ...sanitizedData
            } as Basic;
            
            console.log('Sending payload to API:', payload);
            
            // Send to API using the mutation
            await new Promise<Basic>((resolve, reject) => {
                updateBasic.mutate(payload, {
                    onSuccess: (updatedData) => {
                        try {
                            console.log('API update successful:', updatedData);
                            
                            // Update the local preview data to match saved data
                            onDataChange(updatedData);
                            setCurrentUser(updatedData);
                            setIsEditing(false);
                            
                            // Call success callback if provided
                            onSaveSuccess?.(updatedData);
                            
                            // Show success toast
                            showToast('Profile updated successfully!', 'success');
                            resolve(updatedData);
                        } catch (successError) {
                            console.error('Error in success handler:', successError);
                            reject(successError);
                        }
                    },
                    onError: (error: unknown) => {
                        console.error('Failed to update profile:', error);
                        const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
                        
                        // Call error callback if provided
                        onSaveError?.(errorObj);
                        
                        // Show error toast  
                        showToast(`Failed to update profile: ${errorObj.message}`, 'error');
                        reject(errorObj);
                    }
                });
            });
        } catch (submitError) {
            console.error('Error in form submission:', submitError);
            const errorObj = submitError instanceof Error ? submitError : new Error('Unexpected error occurred');
            
            // Call error callback if provided
            onSaveError?.(errorObj);
            
            // Show error toast
            showToast(`Error: ${errorObj.message}`, 'error');
        } finally {
            setIsSaving(false);
        }
    }, [initialData, onDataChange, onSaveSuccess, onSaveError, updateBasic, setCurrentUser, showToast]);

    // --- DELETE HANDLER ---
    const handleDelete = useCallback(() => {
        const emailToDelete = initialData?.email || form.getValues().email;
        if (!emailToDelete) return;
        
        if (window.confirm('Are you sure you want to delete your profile? This action cannot be undone.')) {
            try {
                removeBasicMutation.mutate(emailToDelete, {
                    onSuccess: () => {
                        try {
                            // Clear parent state
                            onDataChange(null);
                            setCurrentUser(null);
                            
                            // Reset form and show success message
                            form.reset();
                            setIsEditing(false);
                            showToast('Profile deleted successfully!', 'success');
                        } catch (deleteSuccessError) {
                            console.error('Error in delete success handler:', deleteSuccessError);
                            showToast('Profile deleted but there was an issue updating the display.', 'error');
                        }
                    },
                    onError: (error: unknown) => {
                        console.error('Failed to delete profile:', error);
                        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                        showToast(`Failed to delete profile: ${errorMessage}`, 'error');
                    }
                });
            } catch (deleteError) {
                console.error('Error in delete handler:', deleteError);
                showToast('An unexpected error occurred while deleting.', 'error');
            }
        }
    }, [initialData?.email, form, removeBasicMutation, onDataChange, setCurrentUser, showToast]);

    // --- EDIT MODE HANDLERS ---
    const startEditing = useCallback(() => {
        setIsEditing(true);
    }, []);

    const cancelEditing = useCallback(() => {
        setIsEditing(false);
        // Reset form to initial data
        if (initialData) {
            form.reset({
                name: initialData.name || '',
                contact_no: initialData.contact_no || '',
                email: initialData.email || '',
                location: initialData.location || '',
                about: initialData.about || '',
            });
        }
    }, [initialData, form]);

    // --- LOADING AND ERROR STATES ---
    if (updateBasic.isPending || removeBasicMutation.isPending) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></div>
                <span>Processing...</span>
            </div>
        );
    }

    // --- RENDER LOGIC ---
    return (
        <ErrorBoundary>
            <div className="space-y-6">
                {/* Header with Action Buttons */}
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Basic Information</h3>
                    <div className="flex space-x-2">
                        {!isEditing ? (
                            <>
                                <Button 
                                    onClick={startEditing} 
                                    size="sm" 
                                    variant="outline"
                                    disabled={isSaving}
                                >
                                    Edit
                                </Button>
                                {initialData && (
                                    <Button 
                                        onClick={handleDelete} 
                                        size="sm" 
                                        variant="destructive"
                                        disabled={isSaving}
                                    >
                                        Delete
                                    </Button>
                                )}
                            </>
                        ) : (
                            <Button 
                                onClick={cancelEditing} 
                                size="sm" 
                                variant="outline"
                                disabled={isSaving}
                            >
                                Cancel
                            </Button>
                        )}
                    </div>
                </div>

                {/* Form */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        
                        {/* Name Field */}
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

                        {/* Email Field */}
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
                                            disabled={!isEditing || isSaving}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                handleFieldChange('email', e.target.value);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Contact Number Field */}
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

                        {/* Location Field */}
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

                        {/* About Field */}
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

                        {/* Save Button - Only show when editing */}
                        {isEditing && (
                            <div className="flex justify-end space-x-2 pt-4">
                                <Button 
                                    type="submit" 
                                    disabled={isSaving || !form.formState.isValid}
                                    className="min-w-[120px]"
                                >
                                    {isSaving ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </Button>
                            </div>
                        )}
                    </form>
                </Form>

                {/* Form Status */}
                {!isEditing && initialData && (
                    <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
                        <p>✓ Profile information is saved. Click "Edit" to make changes.</p>
                    </div>
                )}
            </div>
        </ErrorBoundary>
    );
}
