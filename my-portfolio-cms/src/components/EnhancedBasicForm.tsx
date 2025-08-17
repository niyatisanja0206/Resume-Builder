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
        mode: 'onChange',
        criteriaMode: 'all',
        reValidateMode: 'onChange'
    });

    // --- DATA SYNCHRONIZATION ---
    // This effect populates the form whenever the initialData changes
    useEffect(() => {
        console.log('EnhancedBasicForm - initialData changed:', initialData);
        console.log('EnhancedBasicForm - currentUser is:', currentUser);
        
        // If we have initialData, use it to populate the form
        if (initialData) {
            // Create default values object with all fields as strings
            const defaultValues = {
                name: initialData.name || '',
                contact_no: initialData.contact_no || '',
                email: initialData.email || currentEmail || '',
                location: initialData.location || '',
                about: initialData.about || '',
            };
            
            console.log('Resetting form with data:', defaultValues);
            
            // Reset with shouldValidate to ensure form state is properly updated
            form.reset(defaultValues, { 
                keepValues: false,
                keepDirty: false,
                keepIsValid: false,
                keepTouched: false,
                keepErrors: false,
                keepIsSubmitted: false,
                keepSubmitCount: false
            });
            
            // Store the email in localStorage to ensure it's available
            if (defaultValues.email) {
                localStorage.setItem('currentUserEmail', defaultValues.email);
            }
            
            // Update in parent if initial data email is different from form email
            if (initialData.email !== defaultValues.email && defaultValues.email) {
                console.log('Email mismatch detected, syncing with parent component');
                onDataChange({
                    ...initialData,
                    email: defaultValues.email
                });
            }
            
            // Only start in editing mode if there's no data
            // Otherwise, display in disabled state with data filled
            if (!initialData.name) {
                setIsEditing(true);
            } else {
                setIsEditing(false);
            }
        } else if (!initialData) {
            // If no data at all, go into editing mode and clear form
            const defaultValues = {
                name: '',
                contact_no: '',
                email: currentEmail || '',
                location: '',
                about: '',
            };
            
            form.reset(defaultValues);
            
            // If we have currentUser but no initialData, sync with parent
            if (currentUser?.email && !initialData) {
                console.log('No initialData but have currentUser, syncing with parent');
                onDataChange({
                    name: currentUser.name || '',
                    contact_no: currentUser.contact_no || '',
                    email: currentUser.email,
                    location: currentUser.location || '',
                    about: currentUser.about || '',
                });
            }
            
            setIsEditing(true);
        }
    }, [initialData, form, currentEmail, currentUser, onDataChange]);

    // --- FORM FIELD HANDLER ---
    // Handle field changes with more detailed logging
    const handleFieldChange = useCallback((
      fieldName: 'name' | 'contact_no' | 'email' | 'location' | 'about', 
      value: string
    ) => {
        // Update the form field value
        form.setValue(fieldName, value, { 
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true 
        });
        
        // Log the change for debugging
        console.log(`Field ${fieldName} updated to: ${value}`);
        console.log('Current form values:', form.getValues());
    }, [form]);

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
            
            // First update the preview right away to show changes immediately
            onDataChange(payload);
            
            // Update currentUser in context immediately to reflect changes in UI
            if (setCurrentUser) {
                try {
                    setCurrentUser(payload);
                    console.log('Current user updated immediately in context:', payload);
                } catch (error) {
                    console.error('Error updating current user:', error);
                }
            } else {
                console.warn('setCurrentUser is undefined, cannot update user context immediately');
            }
            
            // Store the user email in localStorage
            localStorage.setItem('currentUserEmail', payload.email);
            
            // Send to API using the mutation
            await new Promise<Basic>((resolve, reject) => {
                updateBasic.mutate(payload, {
                    onSuccess: (updatedData) => {
                        try {
                                            console.log('API update successful:', updatedData);
                                            
                                            // Update the local preview data to match saved data
                                            onDataChange(updatedData);
                                            
                                            // Update current user directly (no timeout needed)
                                            if (setCurrentUser) {
                                                try {
                                                    setCurrentUser(updatedData);
                                                    console.log('Current user updated with server data:', updatedData);
                                                } catch (error) {
                                                    console.error('Error updating current user with server data:', error);
                                                }
                                            } else {
                                                console.warn('setCurrentUser is undefined, cannot update user context with server data');
                                            }
                                            
                                            setIsEditing(false);                            // Call success callback if provided
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
        
        // Ensure form has the latest data
        if (initialData) {
            form.reset({
                name: initialData.name || '',
                contact_no: initialData.contact_no || '',
                email: initialData.email || currentEmail || '',
                location: initialData.location || '',
                about: initialData.about || '',
            }, {
                keepValues: true
            });
        }
    }, [initialData, form, currentEmail]);

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
            }, { 
                keepDirty: false,
                keepTouched: false,
                keepErrors: false 
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
                                        variant="default"
                                        className="bg-blue-500 hover:bg-blue-600 flex items-center"
                                        disabled={isSaving}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                        Edit Profile
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
                    </div>                {/* Form */}
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
                                            className={!isEditing ? "bg-gray-50 text-gray-800 font-medium" : ""}
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

                        {/* Save Button - Only show when editing */}
                        {isEditing && (
                            <div className="flex justify-end space-x-2 pt-4">
                                <Button 
                                    type="submit" 
                                    disabled={isSaving || (form.formState.isDirty === false && !form.formState.isValid)}
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
                    <div className="text-sm bg-blue-50 border border-blue-100 text-blue-600 p-3 rounded-md flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p>View mode: Profile information is displayed. Click "Edit" to make changes.</p>
                    </div>
                )}
            </div>
        </ErrorBoundary>
    );
}
