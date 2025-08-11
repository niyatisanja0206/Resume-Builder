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

export default function BasicForm() {
    const { basic, isLoading, error, updateBasic, removeBasicMutation } = useBasicForm();
    const { setCurrentUser } = useUserContext();
    const [editing, setEditing] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string>('');

    const form = useForm<BasicFormSchema>({
        resolver: zodResolver(basicSchema),
        // Use defaultValues to initialize the form with empty strings
        // The form will be populated later with fetched data via useEffect
        defaultValues: {
            name: '',
            contact_no: '',
            email: '',
            location: '',
            about: '',
        },
    });

    // Use a useEffect to reset the form when basic data is fetched or changes.
    // This is the correct way to handle asynchronous data with react-hook-form.
    useEffect(() => {
        if (basic) {
            form.reset({
                name: basic.name || '',
                contact_no: basic.contact_no || '',
                email: basic.email || '',
                location: basic.location || '',
                about: basic.about || '',
            });
            // Also set the current user in context when basic data is loaded
            setCurrentUser(basic);
        }
    }, [basic, form, setCurrentUser]);

    // Clear success message after 3 seconds
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    const onSubmit = (data: BasicFormSchema) => {
        console.log('BasicForm submitting:', data);
        // Create a new object that combines the existing basic data with the form data.
        // This ensures the ID from the backend is included.
        const payload = {
            ...basic,
            ...data,
        };

        console.log('BasicForm payload:', payload);
        // Pass the correctly-typed object to the mutate function
        updateBasic.mutate(payload as Basic, {
            onSuccess: (data) => {
                console.log('BasicForm - Save successful for email:', data.email);
                setCurrentUser(data);
                setEditing(false);
                setSuccessMessage('Profile updated successfully!');
            },
            onError: (error) => {
                console.error('Failed to update profile:', error);
            }
        });
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete your profile? This action cannot be undone.')) {
            if (basic?.email) {
                removeBasicMutation.mutate(basic.email, {
                    onSuccess: () => {
                        setCurrentUser(null);
                        setSuccessMessage('Profile deleted successfully!');
                        setEditing(false);
                        form.reset();
                    },
                    onError: (error) => {
                        console.error('Failed to delete profile:', error);
                    }
                });
            }
        }
    };

    const handleEdit = () => {
        setEditing(!editing);
        if (!editing) {
            if (basic) {
                form.reset({
                    name: basic.name || '',
                    contact_no: basic.contact_no || '',
                    email: basic.email || '',
                    location: basic.location || '',
                    about: basic.about || '',
                });
            } else {
                form.reset();
            }
        }
    };

    if (isLoading) {
        return (
            <div className="w-full max-w-4xl mx-auto p-4 space-y-8 text-center text-muted-foreground">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p>Loading basic information...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full max-w-4xl mx-auto p-4 space-y-8">
                <div className="border border-destructive/50 rounded-xl shadow-sm bg-destructive/5 overflow-hidden">
                    <div className="p-6 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
                            <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-destructive mb-2">Error Loading Profile</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            There was an error loading your profile information. Please try refreshing the page.
                        </p>
                        <Button 
                            onClick={() => window.location.reload()} 
                            variant="outline"
                            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                            Refresh Page
                        </Button>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <>
        <div className="w-full max-w-4xl mx-auto p-4 space-y-8">
            {/* Success Message */}
            {successMessage && (
                <div className="border border-green-200 rounded-xl shadow-sm bg-green-50 overflow-hidden">
                    <div className="p-4 flex items-center space-x-3">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-sm text-green-800">{successMessage}</p>
                    </div>
                </div>
            )}

            {/* Profile Form */}
            <div className="border border-border rounded-xl shadow-sm bg-card overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b border-border">
                <h1 className="text-2xl font-semibold text-foreground">Personal Information</h1>
                <p className="text-sm text-muted-foreground mt-1">
                Update your profile details and personal information
                </p>
            </div>
            
            <div className="p-6">
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Name and Contact Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-foreground font-medium flex items-center space-x-2">
                            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>Full Name</span>
                            </FormLabel>
                            <FormControl>
                            <Input 
                                placeholder="Enter your full name" 
                                className="bg-background border-input focus:ring-ring focus:border-ring transition-colors"
                                disabled={!editing && !!basic}
                                {...field} 
                            />
                            </FormControl>
                            <FormMessage className="text-destructive" />
                        </FormItem>
                        )}
                    />
                    
                    <FormField
                        control={form.control}
                        name="contact_no"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-foreground font-medium flex items-center space-x-2">
                            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span>Contact Number</span>
                            </FormLabel>
                            <FormControl>
                            <Input 
                                placeholder="Enter your contact number" 
                                className="bg-background border-input focus:ring-ring focus:border-ring transition-colors"
                                disabled={!editing && !!basic}
                                {...field} 
                            />
                            </FormControl>
                            <FormMessage className="text-destructive" />
                        </FormItem>
                        )}
                    />
                    </div>

                    {/* Email and Location Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-foreground font-medium flex items-center space-x-2">
                            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span>Email Address</span>
                            </FormLabel>
                            <FormControl>
                            <Input 
                                type="email"
                                placeholder="Enter your email address" 
                                className="bg-background border-input focus:ring-ring focus:border-ring transition-colors"
                                disabled={!editing && !!basic}
                                {...field} 
                            />
                            </FormControl>
                            <FormMessage className="text-destructive" />
                        </FormItem>
                        )}
                    />
                    
                    <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-foreground font-medium flex items-center space-x-2">
                            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>Location</span>
                            </FormLabel>
                            <FormControl>
                            <Input 
                                placeholder="Enter your location" 
                                className="bg-background border-input focus:ring-ring focus:border-ring transition-colors"
                                disabled={!editing && !!basic}
                                {...field} 
                            />
                            </FormControl>
                            <FormMessage className="text-destructive" />
                        </FormItem>
                        )}
                    />
                    </div>

                    {/* About Section */}
                    <FormField
                    control={form.control}
                    name="about"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="text-foreground font-medium flex items-center space-x-2">
                            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>About</span>
                        </FormLabel>
                        <FormControl>
                            <Textarea 
                            placeholder="Tell us about yourself, your background, interests, and professional experience..." 
                            className="bg-background border-input focus:ring-ring focus:border-ring transition-colors min-h-[120px] resize-none"
                            disabled={!editing && !!basic}
                            {...field} 
                            />
                        </FormControl>
                        <FormMessage className="text-destructive" />
                        </FormItem>
                    )}
                    />

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-border">
                    {!editing ? (
                        <>
                        <Button
                            type="button"
                            variant="outline"
                            className="border-border hover:bg-accent hover:text-accent-foreground transition-colors"
                            onClick={handleEdit}
                        >
                            Edit Profile
                        </Button>
                        
                        <Button
                            type="button"
                            variant="destructive"
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                            onClick={handleDelete}
                            disabled={!basic || removeBasicMutation.isPending}
                        >
                            {removeBasicMutation.isPending ? (
                                <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                    <span>Deleting...</span>
                                </div>
                            ) : (
                                'Delete Profile'
                            )}
                        </Button>
                        </>
                    ) : (
                        <>
                        <Button
                            type="button"
                            variant="outline"
                            className="border-border hover:bg-accent hover:text-accent-foreground transition-colors"
                            onClick={handleEdit}
                        >
                            Cancel Changes
                        </Button>
                        
                        <Button 
                            type="submit" 
                            disabled={updateBasic.isPending}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                        >
                            {updateBasic.isPending ? (
                            <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                <span>Saving...</span>
                            </div>
                            ) : (
                            'Save Changes'
                            )}
                        </Button>
                        </>
                    )}
                    </div>
                </form>
                </Form>
            </div>
            </div>

            {/* Profile Preview */}
            <div className="border border-border rounded-xl shadow-sm bg-card overflow-hidden">
            <div className="bg-gradient-to-r from-secondary/20 via-secondary/10 to-transparent p-6 border-b border-border">
                <h2 className="text-xl font-semibold text-foreground flex items-center space-x-2">
                <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>Profile Preview</span>
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                This is how your profile will appear to others
                </p>
            </div>
            
            <div className="p-6">
                {basic ? (
                <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl font-semibold text-primary">
                        {basic.name ? basic.name.charAt(0).toUpperCase() : '?'}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-semibold text-foreground truncate">
                        {basic.name || 'No name provided'}
                        </h3>
                        <div className="space-y-2 mt-2">
                        {basic.contact_no && (
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span>{basic.contact_no}</span>
                            </div>
                        )}
                        {basic.email && (
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span>{basic.email}</span>
                            </div>
                        )}
                        {basic.location && (
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{basic.location}</span>
                            </div>
                        )}
                        </div>
                    </div>
                    </div>
                    
                    {basic.about && (
                    <div className="pt-4 border-t border-border">
                        <h4 className="text-sm font-medium text-foreground mb-2">About</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                        {basic.about}
                        </p>
                    </div>
                    )}
                </div>
                ) : (
                <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                    <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    </div>
                    <p className="text-muted-foreground">Fill out the form above to see your profile preview</p>
                </div>
                )}
            </div>
            </div>
        </div>
        </>
    );
}
