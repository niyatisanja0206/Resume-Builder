import { useState, useEffect } from 'react';

/**
 * A custom React hook that simulates a typing effect for a given string.
 *
 * @param textToType The full string that should be "typed" out.
 * @param speed The delay in milliseconds between each character appearing.
 * @returns The currently displayed portion of the text, which grows over time.
 */
export function useTypingEffect(textToType: string, speed = 25) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    // Only start the effect if the target text is different from the displayed text
    if (displayedText !== textToType) {
      let i = 0;
      const intervalId = setInterval(() => {
        if (i < textToType.length) {
          setDisplayedText(textToType.substring(0, i + 1));
          i++;
        } else {
          clearInterval(intervalId);
        }
      }, speed);

      // Cleanup function to stop the interval when the component unmounts
      // or when the textToType dependency changes.
      return () => clearInterval(intervalId);
    }
  }, [textToType, speed, displayedText]); // Rerun effect if the target text changes

  return displayedText;
}
