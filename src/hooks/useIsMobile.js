import { useState, useEffect } from 'react';

/**
 * Custom React Hook to detect viewport layout state based on screen width.
 * @param {number} [breakpoint=768] - Width threshold in pixels.
 * @returns {boolean} True if viewport is below breakpoint width.
 */
export const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < breakpoint;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    window.addEventListener('resize', handleResize);
    // Execute immediate check
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [breakpoint]);

  return isMobile;
};

export default useIsMobile;
