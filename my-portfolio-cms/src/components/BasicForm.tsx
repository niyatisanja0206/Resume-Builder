import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { basicSchema, type BasicFormSchema } from '../lib/zodschema';
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

// --- NEW PROPS INTERFACE ---
// The component now accepts its initial data and a change handler from the parent (Dashboard.tsx)
interface BasicFormProps {
    initialData: Basic | null;
    onDataChange: (newData: Basic | null) => void;
}

export default function BasicForm({ initialData, onDataChange }: BasicFormProps) {
    // This hook is still used here to handle the backend communication (update/delete) for this specific form.
    const { updateBasic, removeBasicMutation } = useBasicForm();
    const { setCurrentUser } = useUserContext();
    
    const [isEditing, setIsEditing] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string>('');

    const form = useForm<BasicFormSchema>({
        resolver: zodResolver(basicSchema),
        defaultValues: {
            name: '',
            contact_no: '',
            email: '',
            location: '',
            about: '',
        },
    });

    // --- DATA SYNCHRONIZATION ---
    // This effect populates the form whenever the initialData from the Dashboard changes.
    useEffect(() => {
        if (initialData) {
            form.reset({
                name: initialData.name || '',
                contact_no: initialData.contact_no || '',
                email: initialData.email || '',
                location: initialData.location || '',
                about: initialData.about || '',
            });
            // If there's no data, start in editing mode.
            if (!initialData.name) {
                setIsEditing(true);
            }
        } else {
            setIsEditing(true);
        }
    }, [initialData, form]);

    // --- LIVE UPDATE EFFECT ---
    // This effect watches for any changes in the form fields and reports them up to the Dashboard.
    useEffect(() => {
        const subscription = form.watch((value) => {
            // Only report changes if the form is valid to avoid sending incomplete data
            if (form.formState.isValid) {
                const updatedData = { ...initialData, ...value } as Basic;
                onDataChange(updatedData);
            }
        });
        return () => subscription.unsubscribe();
    }, [form, onDataChange, initialData]);


    // --- HANDLERS ---
    const onSubmit = (data: BasicFormSchema) => {
        // Add console logs to debug
        console.log('Form data before submit:', data);
        
        // Make sure location field is properly formatted as a string
        const location = data.location || '';
        
        const payload = { 
            ...initialData, 
            ...data,
            location, // Ensure location is included and is a string
        } as Basic;
        
        console.log('Payload being sent to API:', payload);

        updateBasic.mutate(payload, {
            onSuccess: (updatedData) => {
                // On successful save, update the parent state and user context
                onDataChange(updatedData);
                setCurrentUser(updatedData);
                setIsEditing(false);
                setSuccessMessage('Profile updated successfully!');
                setTimeout(() => setSuccessMessage(''), 3000);
            },
            onError: (error) => {
                console.error('Failed to update profile:', error);
            }
        });
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete your profile? This action cannot be undone.')) {
            if (initialData?.email) {
                removeBasicMutation.mutate(initialData.email, {
                    onSuccess: () => {
                        // On successful delete, clear the data in the parent state
                        onDataChange(null);
                        setCurrentUser(null);
                        setSuccessMessage('Profile deleted successfully!');
                        setIsEditing(false);
                        form.reset({ name: '', contact_no: '', email: '', location: '', about: '' });
                    },
                    onError: (error) => {
                        console.error('Failed to delete profile:', error);
                    }
                });
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
                                        form.reset(initialData || {}); // Revert changes
                                        onDataChange(initialData); // Sync reverted state with parent
                                    }}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={updateBasic.isPending}>
                                        {updateBasic.isPending ? 'Saving...' : 'Save Profile'}
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button type="button" variant="outline" onClick={() => setIsEditing(true)}>
                                        Edit Profile
                                    </Button>
                                    <Button type="button" variant="destructive" onClick={handleDelete} disabled={!initialData || removeBasicMutation.isPending}>
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
