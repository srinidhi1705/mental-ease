import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook to scroll to top when navigating between pages
 */
export const useScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    // Scroll to top when route changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // Use instant for immediate scroll on navigation
    });
  }, [location.pathname]);
};

/**
 * Custom hook for managing auto-scroll behavior in chat-like interfaces
 */
export const useAutoScroll = (dependency, enabled = true) => {
  useEffect(() => {
    if (enabled && dependency) {
      // Small delay to ensure DOM is updated
      const timeoutId = setTimeout(() => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [dependency, enabled]);
};