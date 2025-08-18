import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { educationSchema, type EducationFormSchema } from '../../lib/zodschema';
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
import { useEducation } from '../../hooks/useEducation';
import { useUserContext } from '@/hooks/useUserContext';
import { type Education } from '@/types/portfolio';
import { useToast } from '../../contexts/ToastContext';
import ErrorBoundary from './ErrorBoundary';
import { shouldShowToast } from '@/utils/toastUtils';

// --- PROPS INTERFACE ---
interface EducationFormProps {
  initialData: Education[];
  onDataChange: (newData: Education[]) => void;
}

export default function EnhancedEducationForm({ initialData, onDataChange }: EducationFormProps) {
  console.log('🔄 EnhancedEducationForm rendered with initialData:', initialData);
  
  const { currentUser } = useUserContext();
  const userEmail = currentUser?.email || '';
  const { showToast: originalShowToast } = useToast();

  // Debounced toast function to prevent excessive notifications
  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info') => {
      if (shouldShowToast(message)) {
        originalShowToast(message, type);
      }
    },
    [originalShowToast]
  );

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
    console.log('📚 Received initialData:', initialData);
    if (Array.isArray(initialData) && initialData.length > 0) {
      const processedData = initialData.map((item) => ({
        ...item,
        startDate: item.startDate ? new Date(item.startDate) : new Date(),
        endDate: item.endDate ? new Date(item.endDate) : undefined,
      }));
      console.log('📚 Processed education data:', processedData);
      setEducationList(processedData);
    } else if (Array.isArray(initialData) && initialData.length === 0) {
      console.log('📚 Initial data is empty array, setting empty list');
      setEducationList([]);
    } else {
      console.log('📚 Initial data is null/undefined or invalid, keeping current list');
      // Don't reset if we have existing data and initialData is invalid
    }
  }, [initialData]);

  // Debug onDataChange prop
  const debugOnDataChange = useCallback((data: Education[]) => {
    console.log('🔄 onDataChange called with:', data);
    onDataChange(data);
  }, [onDataChange]);

  // --- LIVE UPDATE HANDLER ---
  const handleEducationListChange = useCallback(
    (newEducationList: Education[]) => {
      console.log('📚 Updating education list:', newEducationList);
      console.log('📚 Calling onDataChange with:', newEducationList);
      setEducationList(newEducationList);
      debugOnDataChange(newEducationList);
    },
    [debugOnDataChange]
  );

  // Debug education list changes
  useEffect(() => {
    console.log('📚 Education list changed:', educationList);
    
    // Clean up any invalid entries (those without institution AND degree)
    const cleanedList = educationList.filter(edu => 
      edu && (edu.institution?.trim() || edu.degree?.trim())
    );
    
    if (cleanedList.length !== educationList.length) {
      console.log('📚 Cleaning invalid entries from list');
      setEducationList(cleanedList);
      debugOnDataChange(cleanedList);
    }
  }, [educationList, debugOnDataChange]);

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

  // --- LIVE UPDATE FOR FORM FIELDS (letter-to-letter) ---
  const handleFieldChange = useCallback(
    (
      fieldName: keyof EducationFormSchema,
      value: string | Date | undefined
    ) => {
      // Update the form value immediately
      form.setValue(fieldName, value, { shouldDirty: true, shouldTouch: true });
      
      // Get the current form data with the new value
      const currentFormData = {
        ...form.getValues(),
        [fieldName]: value
      };

      const updatedEducation: Education = {
        ...((editingEducation as Education) || {}),
        _id: editingEducation?._id || 'temp-new',
        institution: currentFormData.institution || '',
        degree: currentFormData.degree || '',
        startDate: currentFormData.startDate || new Date(),
        endDate: currentFormData.endDate,
        Grade: currentFormData.Grade || '',
      } as Education;

      let updatedList: Education[];

      if (editingEducation) {
        // Update existing education entry
        updatedList = educationList.map((edu) =>
          (edu._id || edu.id) === (editingEducation._id || editingEducation.id)
            ? updatedEducation
            : edu
        );
      } else if (isAddingNew) {
        // Update temp entry or add it if it doesn't exist
        const tempIndex = educationList.findIndex((edu) => edu._id === 'temp-new');
        if (tempIndex >= 0) {
          updatedList = [...educationList];
          updatedList[tempIndex] = updatedEducation;
        } else {
          updatedList = [...educationList, updatedEducation];
        }
      } else {
        updatedList = educationList;
      }

      // Update the education list and trigger live preview update
      handleEducationListChange(updatedList);
    },
    [form, editingEducation, isAddingNew, educationList, handleEducationListChange]
  );

  // --- HANDLERS ---
  const onSubmit = async (data: EducationFormSchema) => {
    try {
      if (editingEducation) {
        // Update existing education entry
        const updatedEducationItem: Education = { 
          ...editingEducation, 
          ...data,
          _id: editingEducation._id || editingEducation.id
        } as Education;
        
        const result = await updateEducation(editingEducation._id || editingEducation.id || '', updatedEducationItem);

        // Handle different hook return types
        let nextList: Education[];
        if (Array.isArray(result)) {
          nextList = result as Education[];
        } else if (result && typeof result === 'object') {
          nextList = educationList.map((e) =>
            (e._id || e.id) === (updatedEducationItem._id || updatedEducationItem.id)
              ? (result as Education)
              : e
          );
        } else {
          nextList = educationList.map((e) =>
            (e._id || e.id) === (updatedEducationItem._id || updatedEducationItem.id)
              ? updatedEducationItem
              : e
          );
        }

        handleEducationListChange(nextList);
        showToast('Education updated successfully!', 'success');
      } else {
        // Add new education entry
        const educationData: Education = { 
          ...data,
          // Ensure dates are properly formatted
          startDate: data.startDate || new Date(),
          endDate: data.endDate || undefined
        } as Education;
        
        const result = await addEducation(educationData);
        console.log('✅ Add education result:', result);

        let nextItem: Education | null = null;
        if (Array.isArray(result)) {
          // If API returns a list, assume last one is newest
          nextItem = (result as Education[])[(result as Education[]).length - 1] || null;
          console.log('📋 Result is array, using last item:', nextItem);
        } else if (result && typeof result === 'object') {
          nextItem = result as Education;
          console.log('📝 Result is object, using directly:', nextItem);
        }

        // Remove temp entry and add the real one
        const withoutTemp = educationList.filter((edu) => edu._id !== 'temp-new');
        console.log('🗑️ Filtered list without temp:', withoutTemp);
        
        const finalEducation: Education = {
          ...educationData,
          _id: nextItem?._id || `saved-${Date.now()}`,
          id: nextItem?.id || `saved-${Date.now()}`,
          institution: nextItem?.institution || educationData.institution,
          degree: nextItem?.degree || educationData.degree,
          startDate: nextItem?.startDate || educationData.startDate,
          endDate: nextItem?.endDate || educationData.endDate,
          Grade: nextItem?.Grade || educationData.Grade,
        };
        
        const updatedList = [...withoutTemp, finalEducation];
        console.log('📚 Final updated list:', updatedList);
        handleEducationListChange(updatedList);
        showToast('Education added successfully!', 'success');
      }

      // Reset form state but keep the data visible
      setEditingEducation(null);
      setIsAddingNew(false);
      form.reset({
        institution: '',
        degree: '',
        startDate: new Date(),
        endDate: undefined,
        Grade: '',
      });
      
      // Don't invalidate queries immediately after save to prevent state conflicts
      // The local state update through handleEducationListChange is sufficient
      // Data will be properly synced on next page load or manual refresh
      
    } catch (error) {
      console.error('Error saving education:', error);
      showToast('Failed to save education', 'error');
    }
  };

  const handleDelete = async (educationId: string) => {
    if (!educationId) return;
    if (window.confirm('Are you sure you want to delete this education entry?')) {
      setIsDeleting(true);
      try {
        await removeEducation(educationId);
        const updatedList = educationList.filter((edu) => (edu._id || edu.id) !== educationId);
        console.log('🗑️ Delete operation - filtered list:', updatedList);
        handleEducationListChange(updatedList);
        showToast('Education deleted successfully!', 'success');
        if ((editingEducation?._id || editingEducation?.id) === educationId) {
          setEditingEducation(null);
          setIsAddingNew(false);
          form.reset();
        }
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
        console.log('🗑️ Delete all operation - setting empty list');
        handleEducationListChange([]);
        showToast('All education entries deleted successfully!', 'success');
      } catch {
        showToast('Failed to delete all education entries', 'error');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleEdit = (education: Education) => {
    // If we're currently adding a new entry, remove the temp entry
    if (isAddingNew) {
      handleEducationListChange(educationList.filter((edu) => edu._id !== 'temp-new'));
    }
    
    setEditingEducation(education);
    setIsAddingNew(false);
    
    // Properly format the dates for the form
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
    
    // Reset form with default values
    form.reset({
      institution: '',
      degree: '',
      startDate: new Date(),
      endDate: undefined,
      Grade: '',
    });
    
    // Add an immediate empty temp row so preview shows instantly
    const hasTemp = educationList.some((e) => e._id === 'temp-new');
    if (!hasTemp) {
      const tempEducation: Education = {
        _id: 'temp-new',
        institution: '',
        degree: '',
        startDate: new Date(),
        endDate: undefined,
        Grade: '',
      } as Education;
      
      handleEducationListChange([...educationList, tempEducation]);
    }
  };

  const handleCancelEdit = () => {
    // Remove temp entry if we were adding a new one
    if (isAddingNew) {
      handleEducationListChange(educationList.filter((edu) => edu._id !== 'temp-new'));
    }
    
    // Reset all states
    setEditingEducation(null);
    setIsAddingNew(false);
    
    // Reset form to default values
    form.reset({
      institution: '',
      degree: '',
      startDate: new Date(),
      endDate: undefined,
      Grade: '',
    });
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
                <Button onClick={handleAddNew} size="sm" className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Education
                </Button>
                {educationList.filter(edu => edu && (edu.institution?.trim() || edu.degree?.trim()) && edu._id !== 'temp-new').length > 0 && (
                  <Button 
                    onClick={handleDeleteAll} 
                    size="sm" 
                    variant="destructive" 
                    disabled={isDeleting}
                    className="flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
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
                            value={
                              field.value instanceof Date
                                ? field.value.toISOString().split('T')[0]
                                : ''
                            }
                            onChange={(e) => {
                              const newDate = e.target.value
                                ? new Date(e.target.value)
                                : new Date();
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
                            value={
                              field.value instanceof Date
                                ? field.value.toISOString().split('T')[0]
                                : ''
                            }
                            onChange={(e) => {
                              const newDate = e.target.value
                                ? new Date(e.target.value)
                                : undefined;
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
                  <Button 
                    type="submit" 
                    disabled={addEducationLoading || updateEducationLoading}
                    className="min-w-[120px]"
                  >
                    {editingEducation ? (
                      updateEducationLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Updating...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Save Changes
                        </div>
                      )
                    ) : (
                      addEducationLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Adding...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Add Education
                        </div>
                      )
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          )}

          {/* Education List - Always show BELOW the form, inside the same container */}
          {(() => {
            // Filter out invalid entries and temp entries that shouldn't be displayed
            const validEducationList = educationList.filter(edu => 
              edu && 
              (edu._id !== 'temp-new' || isAddingNew) && // Only show temp-new if we're adding
              (edu.institution || edu.degree) // Must have at least institution or degree
            );
            
            console.log('📚 Valid education list:', validEducationList);
            
            if (validEducationList.length > 0) {
              return (
                <div className="space-y-4 pt-6 border-t">
                  <h3 className="text-lg font-medium text-foreground">Your Education History</h3>
                  <div className="space-y-3">
                    {validEducationList.map((edu) => (
                      <div
                        key={(edu._id || edu.id || 'temp-' + Math.random()).toString()}
                        className={`p-4 rounded-lg border transition-all duration-200 ${
                          edu._id === 'temp-new'
                            ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                            : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-lg text-foreground">
                                {edu.degree || (edu.institution ? `Degree at ${edu.institution}` : 'New Education Entry')}
                              </p>
                              {edu._id === 'temp-new' && (
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300">
                                  Draft
                                </span>
                              )}
                            </div>
                            <p className="text-md text-muted-foreground mb-2">
                              {edu.institution || (edu.degree ? 'Institution not specified' : 'Enter institution name')}
                            </p>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              {edu.startDate && (
                                <div className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <span>
                                    {new Date(edu.startDate).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                    })}
                                    {edu.endDate
                                      ? ` - ${new Date(edu.endDate).toLocaleDateString('en-US', {
                                          year: 'numeric',
                                          month: 'short',
                                        })}`
                                      : ' - Present'}
                                  </span>
                                </div>
                              )}
                              {edu.Grade && (
                                <div className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                  </svg>
                                  <span>Grade: {edu.Grade}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          {edu._id !== 'temp-new' && (
                            <div className="flex space-x-2 ml-4">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleEdit(edu)}
                                className="hover:bg-primary hover:text-primary-foreground"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(edu._id || (edu as Education).id || '')}
                                disabled={isDeleting}
                                className="hover:bg-red-600"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                {isDeleting ? 'Deleting...' : 'Delete'}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            } else if (!isAddingNew) {
              return (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-foreground">No Education Added Yet</h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                    Add your educational background to showcase your academic achievements.
                  </p>
                  <Button onClick={handleAddNew} className="mt-4">
                    Add Your First Education
                  </Button>
                </div>
              );
            }
            return null;
          })()}
        </div>
      </section>
    </ErrorBoundary>
  );
}
