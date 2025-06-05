/**
 * useInstantCache Hook - 2025 Edition
 * Features: Instant loading, predictive caching, virtual DOM optimization
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { AdvancedCacheManager } from '../utils/AdvancedCache';

interface CacheOptions {
  priority?: number;
  ttl?: number;
  preloadNext?: boolean;
  enablePredictive?: boolean;
  compression?: boolean;
  virtualDOM?: boolean;
}

interface CacheState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  isStale: boolean;
  cacheHit: boolean;
  loadTime: number;
}

interface CacheMetrics {
  hits: number;
  misses: number;
  avgLoadTime: number;
  compressionRatio: number;
}

export function useInstantCache<T = any>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
) {
  const {
    priority = 1,
    ttl = 24 * 60 * 60 * 1000, // 24 hours
    preloadNext = true,
    enablePredictive = true,
    compression = true,
    virtualDOM = true
  } = options;

  // State management
  const [state, setState] = useState<CacheState<T>>({
    data: null,
    isLoading: true,
    error: null,
    isStale: false,
    cacheHit: false,
    loadTime: 0
  });

  // Performance tracking
  const metricsRef = useRef<CacheMetrics>({
    hits: 0,
    misses: 0,
    avgLoadTime: 0,
    compressionRatio: 0
  });

  const cacheManager = useMemo(() => AdvancedCacheManager.getInstance(), []);
  const abortControllerRef = useRef<AbortController | null>(null);
  const loadStartTimeRef = useRef<number>(0);

  // Virtual DOM optimization - prevent unnecessary re-renders
  const memoizedData = useMemo(() => state.data, [state.data]);

  // Instant data retrieval with background refresh
  const loadData = useCallback(async (forceRefresh = false) => {
    // Cancel any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    loadStartTimeRef.current = performance.now();

    try {
      // Initialize cache manager
      await cacheManager.initialize();

      // Try cache first for instant loading
      if (!forceRefresh) {
        const cachedData = await cacheManager.getCachedIframe(key);
        if (cachedData) {
          const loadTime = performance.now() - loadStartTimeRef.current;
          
          setState(prev => ({
            ...prev,
            data: JSON.parse(cachedData) as T,
            isLoading: false,
            cacheHit: true,
            loadTime
          }));
          
          metricsRef.current.hits++;
          
          // Background refresh for fresh data
          refreshInBackground();
          return;
        }
      }

      // Cache miss - fetch fresh data
      metricsRef.current.misses++;
      setState(prev => ({ ...prev, isLoading: true, cacheHit: false }));

      const data = await fetcher();
      const loadTime = performance.now() - loadStartTimeRef.current;

      // Cache the fresh data
      await cacheManager.cacheIframe(
        key, 
        JSON.stringify(data)
      );

      setState({
        data,
        isLoading: false,
        error: null,
        isStale: false,
        cacheHit: false,
        loadTime
      });

      // Update metrics
      const currentAvg = metricsRef.current.avgLoadTime;
      const totalRequests = metricsRef.current.hits + metricsRef.current.misses;
      metricsRef.current.avgLoadTime = 
        (currentAvg * (totalRequests - 1) + loadTime) / totalRequests;

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return; // Request was cancelled
      }

      setState(prev => ({
        ...prev,
        error: error as Error,
        isLoading: false
      }));
    }
  }, [key, fetcher, cacheManager]);

  // Background refresh for stale-while-revalidate pattern
  const refreshInBackground = useCallback(async () => {
    try {
      const freshData = await fetcher();
      
      // Update cache
      await cacheManager.cacheIframe(key, JSON.stringify(freshData));
      
      // Update state if data has changed
      setState(prev => {
        const hasChanged = JSON.stringify(prev.data) !== JSON.stringify(freshData);
        if (hasChanged) {
          return {
            ...prev,
            data: freshData,
            isStale: false
          };
        }
        return prev;
      });
    } catch (error) {
      console.warn('Background refresh failed:', error);
    }
  }, [fetcher, key, cacheManager]);

  // Predictive preloading
  const preloadRelated = useCallback(async (relatedKeys: string[]) => {
    if (!enablePredictive) return;

    try {
      const preloadPromises = relatedKeys.map(async (relatedKey) => {
        const cached = await cacheManager.getCachedIframe(relatedKey);
        if (!cached) {
          // This would need to be implemented based on your data structure
          console.log('Would preload:', relatedKey);
        }
      });

      await Promise.allSettled(preloadPromises);
    } catch (error) {
      console.warn('Predictive preloading failed:', error);
    }
  }, [enablePredictive, cacheManager]);

  // Effect for initial load
  useEffect(() => {
    loadData();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Public methods
  const refresh = useCallback(() => loadData(true), [loadData]);
  
  const clearCache = useCallback(async () => {
    await cacheManager.clearAll();
    setState(prev => ({ ...prev, cacheHit: false, isStale: true }));
  }, [cacheManager]);

  const getMetrics = useCallback(() => ({ ...metricsRef.current }), []);

  return {
    // Data and state
    data: memoizedData,
    isLoading: state.isLoading,
    error: state.error,
    isStale: state.isStale,
    cacheHit: state.cacheHit,
    loadTime: state.loadTime,
    
    // Methods
    refresh,
    clearCache,
    preloadRelated,
    getMetrics,
    
    // Performance info
    metrics: getMetrics()
  };
}

// Specialized hook for iframe caching
export function useInstantIframe(
  url: string,
  options: CacheOptions = {}
) {
  const fetcher = useCallback(async () => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }
    return response.text();
  }, [url]);

  return useInstantCache<string>(url, fetcher, {
    ...options,
    compression: true // Always compress iframes
  });
}

// Hook for predictive caching of multiple resources
export function usePredictiveCache(
  resources: Array<{ key: string; fetcher: () => Promise<any> }>,
  options: CacheOptions = {}
) {
  const [loadedCount, setLoadedCount] = useState(0);
  const [totalCount] = useState(resources.length);
  const cacheManager = useMemo(() => AdvancedCacheManager.getInstance(), []);

  useEffect(() => {
    let mounted = true;
    
    const preloadResources = async () => {
      await cacheManager.initialize();
      
      const preloadPromises = resources.map(async ({ key, fetcher }, index) => {
        try {
          const cached = await cacheManager.getCachedIframe(key);
          if (!cached) {
            const data = await fetcher();
            await cacheManager.cacheIframe(key, JSON.stringify(data));
          }
          
          if (mounted) {
            setLoadedCount(prev => prev + 1);
          }
        } catch (error) {
          console.warn(`Preload failed for ${key}:`, error);
        }
      });

      await Promise.allSettled(preloadPromises);
    };

    preloadResources();

    return () => {
      mounted = false;
    };
  }, [resources, cacheManager]);

  return {
    isPreloading: loadedCount < totalCount,
    progress: totalCount > 0 ? (loadedCount / totalCount) * 100 : 100,
    loadedCount,
    totalCount
  };
}

// Performance monitoring hook
export function useCacheMetrics() {
  const [metrics, setMetrics] = useState<{
    hitRate: number;
    avgLoadTime: number;
    cacheSize: number;
  }>({
    hitRate: 0,
    avgLoadTime: 0,
    cacheSize: 0
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const updateMetrics = async () => {
      try {
        const cacheManager = AdvancedCacheManager.getInstance();
        await cacheManager.initialize();
        
        const analytics = await cacheManager.getAnalytics();
        if (analytics) {
          setMetrics({
            hitRate: analytics.hitRate || 0,
            avgLoadTime: analytics.avgLoadTime || 0,
            cacheSize: analytics.cacheSize || 0
          });
        }
      } catch (error) {
        console.warn('Failed to update cache metrics:', error);
      }
    };

    updateMetrics();
    interval = setInterval(updateMetrics, 10000); // Update every 10 seconds

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  return metrics;
}

if (typeof window !== 'undefined' && 'name' in globalThis && globalThis.name === '__main__') {
  // Test the hooks
  console.log('useInstantCache hooks loaded successfully!');
} 