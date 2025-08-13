import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { basicSchema } from '../lib/zodschema';
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

// --- PROPS INTERFACE ---
interface BasicFormProps {
    initialData: Basic | null;
    onDataChange: (newData: Basic | null) => void;
}

export default function BasicForm({ initialData, onDataChange }: BasicFormProps) {
    // This hook is used for backend communication
    const { updateBasic, removeBasicMutation } = useBasicForm();
    const { setCurrentUser, currentUser } = useUserContext();
    
    const [isEditing, setIsEditing] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string>('');
    const currentEmail = initialData?.email || currentUser?.email || '';
    
    // Use a ref to track if the form is being updated to prevent update loops
    const isUpdatingRef = useRef(false);

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

    // Create form without explicit typing
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
        if (initialData && !isUpdatingRef.current) {
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

    // --- LIVE UPDATE EFFECT ---
    // This effect watches for form changes and reports them up to the Dashboard
    useEffect(() => {
        // Create a debounced function to avoid too frequent updates
        let debounceTimer: NodeJS.Timeout | null = null;
        
        const subscription = form.watch((formValues) => {
            // Don't process empty form values or if form is being programmatically updated
            if (!formValues || isUpdatingRef.current) return;
            
            // Clear any existing timer
            if (debounceTimer) clearTimeout(debounceTimer);
            
            // Set a new timer to update after a short delay (reduces UI crashes)
            debounceTimer = setTimeout(() => {
                try {
                    // Flag that we're updating to prevent update loops
                    isUpdatingRef.current = true;
                    
                    // Create updated data object that preserves the ID if it exists
                    const updatedData: Basic = {
                        ...(initialData || {}), // Preserve ID and other fields
                        name: formValues.name || '',
                        contact_no: formValues.contact_no || '',
                        email: formValues.email || currentEmail || '',
                        location: formValues.location || '',
                        about: formValues.about || '',
                    };
                    
                    // Only update if we have an email (required field)
                    if (updatedData.email) {
                        console.log('Form watch - sending data to parent:', updatedData);
                        onDataChange(updatedData);
                        
                        // Save to localStorage for recovery on refresh
                        try {
                            localStorage.setItem('basicFormData', JSON.stringify(updatedData));
                            localStorage.setItem('basicFormEditing', String(isEditing));
                        } catch (error) {
                            console.error('Failed to save to localStorage:', error);
                        }
                    }
                    
                    // Allow updates again after a short delay
                    setTimeout(() => {
                        isUpdatingRef.current = false;
                    }, 50);
                } catch (error) {
                    console.error('Error during form watch:', error);
                    isUpdatingRef.current = false;
                }
            }, 500); // Increased debounce delay for better stability
        });
        
        return () => {
            subscription.unsubscribe();
            if (debounceTimer) clearTimeout(debounceTimer);
            isUpdatingRef.current = false;
        };
    }, [form, onDataChange, initialData, isEditing, currentEmail]);

    // --- FORM SUBMISSION ---
    const onSubmit = (data: Record<string, string>) => {
        console.log('Form submitted with data:', data);
        
        // Create sanitized data object
        const sanitizedData = {
            name: data.name || '',
            contact_no: data.contact_no || '',
            email: data.email || '',
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
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
        }

        // Send to API
        updateBasic.mutate(payload, {
            onSuccess: (updatedData) => {
                console.log('API update successful:', updatedData);
                onDataChange(updatedData);
                setCurrentUser(updatedData);
                setIsEditing(false);
                setSuccessMessage('Profile updated successfully!');
                setTimeout(() => setSuccessMessage(''), 3000);
            },
            onError: (error: unknown) => {
                console.error('Failed to update profile:', error);
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                alert(`Failed to update profile: ${errorMessage}`);
            }
        });
    };

    // --- DELETE HANDLER ---
    const handleDelete = () => {
        const emailToDelete = initialData?.email || form.getValues().email;
        if (!emailToDelete) return;
        
        if (window.confirm('Are you sure you want to delete your profile? This action cannot be undone.')) {
            removeBasicMutation.mutate(emailToDelete, {
                onSuccess: () => {
                    // Clear parent state and localStorage
                    onDataChange(null);
                    setCurrentUser(null);
                    localStorage.removeItem('basicFormData');
                    localStorage.removeItem('basicFormEditing');
                    
                    // Reset form and show success message
                    form.reset({ name: '', contact_no: '', email: '', location: '', about: '' });
                    setSuccessMessage('Profile deleted successfully!');
                    setIsEditing(false);
                },
                onError: (error: unknown) => {
                    console.error('Failed to delete profile:', error);
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    alert(`Failed to delete profile: ${errorMessage}`);
                }
            });
        }
    };

    return (
        <section className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border">
                <h2 className="text-xl font-semibold text-foreground">Basic Information</h2>
                <p className="text-sm text-muted-foreground">Your personal details and contact information.</p>
            </div>
            <div className="p-6">
                {successMessage && (
                    <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-md text-sm">
                        {successMessage}
                    </div>
                )}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl><Input placeholder="Your Name" {...field} disabled={!isEditing} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="contact_no" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Contact Number</FormLabel>
                                    <FormControl><Input placeholder="Phone Number" {...field} disabled={!isEditing} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl><Input type="email" placeholder="your.email@example.com" {...field} disabled={!isEditing} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="location" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Location</FormLabel>
                                    <FormControl><Input placeholder="City, Country" {...field} disabled={!isEditing} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        <FormField control={form.control} name="about" render={({ field }) => (
                            <FormItem>
                                <FormLabel>About / Summary</FormLabel>
                                <FormControl><Textarea placeholder="A brief summary about you..." {...field} disabled={!isEditing} className="min-h-[100px]" /></FormControl>
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
                                        
                                        // Revert to initial data if available, otherwise keep current form values
                                        if (initialData) {
                                            const defaultValues = {
                                                name: initialData.name || '',
                                                contact_no: initialData.contact_no || '',
                                                email: initialData.email || '',
                                                location: initialData.location || '',
                                                about: initialData.about || ''
                                            };
                                            form.reset(defaultValues);
                                            onDataChange(initialData);
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
