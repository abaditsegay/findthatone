import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for handling image loading states
 * Provides loading, error, and loaded states for images
 */
export const useImageLoad = (src, fallbackSrc = '/placeholder-avatar.svg') => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [actualSrc, setActualSrc] = useState(src);

  useEffect(() => {
    if (!src) {
      setActualSrc(fallbackSrc);
      setLoading(false);
      setError(false);
      return;
    }

    // Check if it's already a placeholder
    const isPlaceholder = src === fallbackSrc || 
                         src.includes('/placeholder-avatar.svg') ||
                         src.includes('/avatars/');

    if (isPlaceholder) {
      setActualSrc(src);
      setLoading(false);
      setError(false);
      return;
    }

    setLoading(true);
    setError(false);
    setActualSrc(src);

    // Preload the image
    const img = new Image();
    
    const handleLoad = () => {
      setLoading(false);
      setError(false);
    };

    const handleError = () => {
      setLoading(false);
      setError(true);
      setActualSrc(fallbackSrc);
    };

    img.onload = handleLoad;
    img.onerror = handleError;
    img.src = src;

    // Cleanup
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, fallbackSrc]);

  return { loading, error, src: actualSrc };
};

/**
 * Hook for handling user statistics fetching and caching
 */
export const useUserStats = (apiConfig) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiConfig.userStats();
      setStats(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  }, [apiConfig]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};

/**
 * Hook for managing swipe interactions with debouncing
 */
export const useSwipeHandler = (onSwipe, debounceMs = 300) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState('');

  const handleSwipe = async (direction, ...args) => {
    if (isProcessing) return;

    setIsProcessing(true);
    setSwipeDirection(direction);

    try {
      await onSwipe(direction, ...args);
    } catch (error) {
      // Error handling for swipe - fail silently for UX
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        setSwipeDirection('');
      }, debounceMs);
    }
  };

  return { 
    handleSwipe, 
    isProcessing, 
    swipeDirection 
  };
};
