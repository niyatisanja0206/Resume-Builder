import { useState, useEffect } from 'react';
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

// --- PROPS INTERFACE ---
interface BasicFormProps {
    initialData: Basic | null;
    onDataChange: (newData: Basic | null) => void;
}

export default function BasicForm({ initialData, onDataChange }: BasicFormProps) {
    // This hook is used for backend communication
    const { updateBasic, removeBasicMutation } = useBasicForm();
    const { setCurrentUser, currentUser } = useUserContext();
    const { showToast } = useToast();
    
    const [isEditing, setIsEditing] = useState(false);
    const currentEmail = initialData?.email || currentUser?.email || '';

    // Load saved form data and editing state from localStorage on component mount
    useEffect(() => {
        try {
            // Check if we need to restore the editing state first
            const savedEditingState = localStorage.getItem('basicFormEditing');
            if (savedEditingState === 'true') {
                console.log('Restoring editing state to true');
                setIsEditing(true);
            }
            
            // Try to load saved form data
            const savedData = localStorage.getItem('basicFormData');
            if (savedData) {
                const parsedData = JSON.parse(savedData) as Basic;
                // If we have saved data and no initialData, use the saved data
                if (!initialData && parsedData.email) {
                    console.log('Loaded form data from localStorage:', parsedData);
                    onDataChange(parsedData);
                }
            }
        } catch (error) {
            console.error('Failed to load form data from localStorage:', error);
        }
    }, [initialData, onDataChange]);

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
    const handleFieldChange = (fieldName: 'name' | 'contact_no' | 'email' | 'location' | 'about', value: string) => {
        // Update form field
        form.setValue(fieldName, value);
        
        // Create updated data for immediate preview
        const currentValues = form.getValues();
        const updatedData: Basic = {
            ...(initialData || {}),
            ...currentValues,
            [fieldName]: value
        } as Basic;
        
        // Update preview immediately
        onDataChange(updatedData);
    };

    // --- LIVE UPDATE EFFECT ---
    // We're now handling live updates directly in each field's onChange handler
    // No global effect needed anymore

    // --- FORM SUBMISSION ---
    const onSubmit = (data: Record<string, string>) => {
        console.log('Form submitted with data:', data);
        
        try {
            // Validate required fields
            if (!data.email || !data.email.trim()) {
                alert('Email is required');
                return;
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
            
            // Save to localStorage before API call
            try {
                localStorage.setItem('basicFormData', JSON.stringify(payload));
                localStorage.setItem('basicFormEditing', 'false'); // Set editing to false on save
            } catch (storageError) {
                console.error('Failed to save to localStorage:', storageError);
                // Continue with API call even if localStorage fails
            }

            // Send to API using the callback pattern
            updateBasic.mutate(payload, {
                onSuccess: (updatedData) => {
                    try {
                        console.log('API update successful:', updatedData);
                        // Update the preview after successful save
                        onDataChange(updatedData);
                        setCurrentUser(updatedData);
                        setIsEditing(false);
                        showToast('Profile updated successfully!', 'success');
                    } catch (successError) {
                        console.error('Error in success handler:', successError);
                        showToast('Profile saved but there was an issue updating the display.', 'error');
                    }
                },
                onError: (error: unknown) => {
                    console.error('Failed to update profile:', error);
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    showToast(`Failed to update profile: ${errorMessage}`, 'error');
                }
            });
        } catch (submitError) {
            console.error('Error in form submission:', submitError);
            alert('An unexpected error occurred while saving. Please try again.');
        }
    };

    // --- DELETE HANDLER ---
    const handleDelete = () => {
        const emailToDelete = initialData?.email || form.getValues().email;
        if (!emailToDelete) return;
        
        if (window.confirm('Are you sure you want to delete your profile? This action cannot be undone.')) {
            try {
                removeBasicMutation.mutate(emailToDelete, {
                    onSuccess: () => {
                        try {
                            // Clear parent state and localStorage
                            onDataChange(null);
                            setCurrentUser(null);
                            localStorage.removeItem('basicFormData');
                            localStorage.removeItem('basicFormEditing');
                            
                            // Reset form and show success message
                            form.reset({ name: '', contact_no: '', email: '', location: '', about: '' });
                            showToast('Profile deleted successfully!', 'success');
                            setIsEditing(false);
                        } catch (successError) {
                            console.error('Error in delete success handler:', successError);
                            showToast('Profile deleted but there was an issue updating the display.', 'error');
                        }
                    },
                    onError: (error: unknown) => {
                        console.error('Failed to delete profile:', error);
                        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                        alert(`Failed to delete profile: ${errorMessage}`);
                    }
                });
            } catch (deleteError) {
                console.error('Error in delete handler:', deleteError);
                alert('An unexpected error occurred while deleting. Please try again.');
            }
        }
    };

    return (
        <section className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border">
                <h2 className="text-xl font-semibold text-foreground">Basic Information</h2>
                <p className="text-sm text-muted-foreground">Your personal details and contact information.</p>
            </div>
            <div className="p-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input 
                                            placeholder="Your Name" 
                                            value={field.value}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                handleFieldChange('name', e.target.value);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="contact_no" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Contact Number</FormLabel>
                                    <FormControl>
                                        <Input 
                                            placeholder="Phone Number" 
                                            value={field.value}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                handleFieldChange('contact_no', e.target.value);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl>
                                        <Input 
                                            type="email" 
                                            placeholder="your.email@example.com" 
                                            value={field.value}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                handleFieldChange('email', e.target.value);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="location" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Location</FormLabel>
                                    <FormControl>
                                        <Input 
                                            placeholder="City, Country" 
                                            value={field.value}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                handleFieldChange('location', e.target.value);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        <FormField control={form.control} name="about" render={({ field }) => (
                            <FormItem>
                                <FormLabel>About / Summary</FormLabel>
                                <FormControl>
                                    <Textarea 
                                        placeholder="A brief summary about you..." 
                                        value={field.value}
                                        onChange={(e) => {
                                            field.onChange(e);
                                            handleFieldChange('about', e.target.value);
                                        }}
                                        className="min-h-[100px]"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        
                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-3 pt-4 border-t border-border">
                            {isEditing ? (
                                <>
                                    <Button type="button" variant="ghost" onClick={() => {
                                        setIsEditing(false);
                                        localStorage.setItem('basicFormEditing', 'false');
                                        
                                        // Revert to initial data if available
                                        if (initialData) {
                                            const defaultValues = {
                                                name: initialData.name || '',
                                                contact_no: initialData.contact_no || '',
                                                email: initialData.email || '',
                                                location: initialData.location || '',
                                                about: initialData.about || ''
                                            };
                                            form.reset(defaultValues);
                                        }
                                    }}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={updateBasic.isPending}>
                                        {updateBasic.isPending ? 'Saving...' : 'Save Profile'}
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button type="button" variant="outline" onClick={() => {
                                        setIsEditing(true);
                                        localStorage.setItem('basicFormEditing', 'true');
                                    }}>
                                        Edit Profile
                                    </Button>
                                    <Button type="button" variant="destructive" onClick={handleDelete} disabled={!initialData?.email && !form.getValues().email || removeBasicMutation.isPending}>
                                        {removeBasicMutation.isPending ? 'Deleting...' : 'Delete'}
                                    </Button>
                                </>
                            )}
                        </div>
                    </form>
                </Form>
            </div>
        </section>
    );
}
