// Toast debouncing utility to prevent excessive toast notifications
let lastToastMessage = '';
let lastToastTimestamp = 0;
const TOAST_DEBOUNCE_MS = 3000; // 3 seconds between identical toasts

/**
 * Determines whether a toast should be shown based on recent history
 * 
 * @param message The toast message
 * @returns Boolean indicating whether to show the toast
 */
export function shouldShowToast(message: string): boolean {
    const now = Date.now();
    
    // If it's the same message and within the debounce window, don't show
    if (message === lastToastMessage && now - lastToastTimestamp < TOAST_DEBOUNCE_MS) {
        return false;
    }
    
    // Update the last toast info
    lastToastMessage = message;
    lastToastTimestamp = now;
    
    return true;
}
