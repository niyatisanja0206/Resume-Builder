import { useState, useEffect, useRef } from 'react';

/**
 * A custom React hook that simulates a typing effect for a given string.
 *
 * @param textToType The full string that should be "typed" out.
 * @param speed The delay in milliseconds between each character appearing.
 * @returns The currently displayed portion of the text, which grows over time.
 */
export function useTypingEffect(textToType: string, speed = 25) {
  const [displayedText, setDisplayedText] = useState('');
  const intervalRef = useRef<number | null>(null);
  const indexRef = useRef(0);
  
  // This effect handles both initialization and cleanup
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Reset state for new text
    setDisplayedText('');
    indexRef.current = 0;
    
    // Only proceed if we have text to type
    if (!textToType) return;
    
    // Start a new typing animation
    const animate = () => {
      intervalRef.current = window.setInterval(() => {
        if (indexRef.current < textToType.length) {
          setDisplayedText(textToType.substring(0, indexRef.current + 1));
          indexRef.current++;
        } else if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }, speed);
    };
    
    animate();
    
    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [textToType, speed]);
  
  return displayedText;
}
