// Form validation utilities

// Form validation utilities

/**
 * Check if any form data exists in localStorage
 */
export const hasLocalStorageData = (): boolean => {
  const formKeys = ['education-form', 'experience-form', 'project-form', 'skill-form']; // Removed basic-form
  
  for (const key of formKeys) {
    const data = localStorage.getItem(key);
    if (data) {
      try {
        const parsedData = JSON.parse(data);
        // Check if the form has meaningful data (not just empty objects)
        if (typeof parsedData === 'object' && parsedData !== null) {
          const hasData = Object.values(parsedData).some(value => {
            if (Array.isArray(value)) {
              return value.length > 0;
            }
            return value !== '' && value !== null && value !== undefined;
          });
          if (hasData) {
            return true;
          }
        }
      } catch {
        // If parsing fails, continue to next key
      }
    }
  }
  
  return false;
};

/**
 * Check if any form has been filled with data (localStorage + backend)
 */
export const hasFormData = async (userEmail: string): Promise<boolean> => {
  if (!userEmail) return hasLocalStorageData();
  
  try {
    // Check localStorage first
    if (hasLocalStorageData()) {
      return true;
    }
    
    // Check backend data for each form type (excluding basic)
    const checks = await Promise.allSettled([
      // Removed basic endpoint - we don't check basic data
      fetch(`/api/edu/get?email=${encodeURIComponent(userEmail)}`),
      fetch(`/api/exp/get?email=${encodeURIComponent(userEmail)}`),
      fetch(`/api/pro/get?email=${encodeURIComponent(userEmail)}`),
      fetch(`/api/skill/get?email=${encodeURIComponent(userEmail)}`)
    ]);
    
    // Check if any of the API calls returned data
    for (const result of checks) {
      if (result.status === 'fulfilled' && result.value.ok) {
        const data = await result.value.json();
        if (data && Array.isArray(data) && data.length > 0) {
          return true;
        } else if (data && typeof data === 'object' && Object.keys(data).length > 0) {
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking form data:', error);
    return hasLocalStorageData(); // Fallback to localStorage check
  }
};

/**
 * Get a summary of filled forms
 */
export const getFormSummary = (): { [key: string]: boolean } => {
  const formKeys = ['education-form', 'experience-form', 'project-form', 'skill-form']; // Removed basic-form
  const summary: { [key: string]: boolean } = {};
  
  formKeys.forEach(key => {
    const data = localStorage.getItem(key);
    summary[key] = false;
    
    if (data) {
      try {
        const parsedData = JSON.parse(data);
        if (typeof parsedData === 'object' && parsedData !== null) {
          summary[key] = Object.values(parsedData).some(value => {
            if (Array.isArray(value)) {
              return value.length > 0;
            }
            return value !== '' && value !== null && value !== undefined;
          });
        }
      } catch {
        // If parsing fails, form is considered empty
      }
    }
  });
  
  return summary;
};

/**
 * Clear all form data from localStorage
 */
export const clearLocalStorageData = (): void => {
  const keysToRemove: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (
      key.includes('resume') || 
      key.includes('form') || 
      key.includes('draft') ||
      key.includes('education') ||
      key.includes('experience') ||
      key.includes('project') ||
      key.includes('skill')
    ) && !key.includes('basic')) { // Exclude basic information
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
  console.log('Cleared localStorage keys (excluding basic):', keysToRemove);
};

/**
 * Clear all form data from both localStorage and backend
 */
export const clearAllFormData = async (userEmail: string): Promise<void> => {
  if (!userEmail) {
    throw new Error('User email is required to clear form data');
  }
  
  try {
    console.log('Starting to clear all form data for user:', userEmail);
    
    // Clear localStorage data
    clearLocalStorageData();
    
    // Clear backend data for all form types EXCEPT basic
    const clearPromises = [
      // Removed basic endpoint - we don't want to clear basic info
      fetch(`/api/edu/deleteAll?email=${encodeURIComponent(userEmail)}`, { method: 'DELETE' }),
      fetch(`/api/exp/deleteAll?email=${encodeURIComponent(userEmail)}`, { method: 'DELETE' }),
      fetch(`/api/pro/deleteAll?email=${encodeURIComponent(userEmail)}`, { method: 'DELETE' }),
      fetch(`/api/skill/deleteAll?email=${encodeURIComponent(userEmail)}`, { method: 'DELETE' })
    ];
    
    console.log('Making delete requests to backend...');
    
    // Execute all delete operations
    const results = await Promise.allSettled(clearPromises);
    
    // Log results for debugging
    results.forEach((result, index) => {
      const endpoints = ['education', 'experience', 'projects', 'skills'];
      if (result.status === 'rejected') {
        console.error(`Failed to clear ${endpoints[index]} data:`, result.reason);
      } else if (!result.value.ok) {
        console.error(`Failed to clear ${endpoints[index]} data:`, result.value.status, result.value.statusText);
      } else {
        console.log(`Successfully cleared ${endpoints[index]} data`);
      }
    });
    
    console.log('Form data clearing completed');
    
  } catch (error) {
    console.error('Error clearing form data:', error);
    throw error;
  }
};
