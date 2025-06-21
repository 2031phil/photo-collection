import { useEffect, useRef } from 'react';

export function useResponsiveIconScale(selector = '.icons', dependency = null) {
  const lastScaleRef = useRef(null);

  useEffect(() => {
    const rootElement = document.documentElement;
    
    function updateSize() {
      // Query for icons each time to catch newly added ones
      const icons = document.querySelectorAll(selector);
      const styles = getComputedStyle(rootElement);
      const scaleFactor = parseFloat(styles.getPropertyValue('--scale-factor')) || 1;

      // Always update when dependency changes, or when scale factor changes
      if (scaleFactor !== lastScaleRef.current || dependency !== null) {
        icons.forEach((icon) => {
          let originalWidth = icon.getAttribute('data-original-width');
          let originalHeight = icon.getAttribute('data-original-height');

          if (!originalWidth || !originalHeight) {
            originalWidth = icon.getAttribute('width');
            originalHeight = icon.getAttribute('height');
            icon.setAttribute('data-original-width', originalWidth);
            icon.setAttribute('data-original-height', originalHeight);
          }

          icon.setAttribute('width', originalWidth * scaleFactor);
          icon.setAttribute('height', originalHeight * scaleFactor);
        });

        lastScaleRef.current = scaleFactor;
      }
    }

    updateSize(); // Run once on mount/dependency change
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [selector, dependency]); // Add dependency to the dependency array
}