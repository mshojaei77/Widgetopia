/**
 * Advanced Service Worker for Widgetopia - 2025 Edition
 * Features: Aggressive caching, predictive loading, background sync
 */

const CACHE_VERSION = 'v3.2025';
const CACHE_NAMES = {
  STATIC: `widgetopia-static-${CACHE_VERSION}`,
  API: `widgetopia-api-${CACHE_VERSION}`,
  IFRAME: `widgetopia-iframe-${CACHE_VERSION}`,
  PRELOAD: `widgetopia-preload-${CACHE_VERSION}`
};

// Cache strategies
const STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
};

// URL patterns and their strategies
const ROUTE_STRATEGIES = [
  { pattern: /\.(?:js|css|png|jpg|jpeg|svg|gif|webp|woff2?)$/, strategy: STRATEGIES.CACHE_FIRST },
  { pattern: /\/api\/soundcloud/, strategy: STRATEGIES.STALE_WHILE_REVALIDATE },
  { pattern: /soundcloud\.com\/player/, strategy: STRATEGIES.CACHE_FIRST },
  { pattern: /w\.soundcloud\.com/, strategy: STRATEGIES.CACHE_FIRST }
];

// Performance monitoring
let cacheStats = {
  hits: 0,
  misses: 0,
  networkRequests: 0,
  preloadedUrls: []
};

// Install event - precache essential resources
self.addEventListener('install', event => {
  console.log('Advanced SW installing...');
  
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAMES.STATIC);
      
      // Essential resources to precache
      const urlsToCache = [
        '/',
        '/index.html',
        '/manifest.json',
        // Add other critical resources
      ];
      
      try {
        await cache.addAll(urlsToCache);
        console.log('Precaching complete');
      } catch (error) {
        console.warn('Precaching failed:', error);
      }
      
      // Skip waiting and take control immediately
      self.skipWaiting();
    })()
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', event => {
  console.log('Advanced SW activating...');
  
  event.waitUntil(
    (async () => {
      // Take control immediately
      await self.clients.claim();
      
      // Cleanup old caches
      const cacheNames = await caches.keys();
      const oldCaches = cacheNames.filter(name => 
        name.startsWith('widgetopia-') && !Object.values(CACHE_NAMES).includes(name)
      );
      
      await Promise.all(oldCaches.map(name => caches.delete(name)));
      console.log('Cache cleanup complete');
    })()
  );
});

// Fetch event - advanced caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-HTTP requests
  if (!request.url.startsWith('http')) return;
  
  // Determine strategy based on URL pattern
  const strategy = getStrategy(request.url);
  
  event.respondWith(handleRequest(request, strategy));
});

// Message handling for preloading and communication
self.addEventListener('message', event => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'PRELOAD_URLS':
      handlePreload(event.data.urls);
      break;
      
    case 'GET_STATS':
      event.ports[0]?.postMessage(cacheStats);
      break;
      
    case 'CLEAR_CACHE':
      clearAllCaches();
      break;
      
    case 'PREFETCH_NEXT':
      prefetchNext(data.currentUrl, data.allUrls);
      break;
  }
});

// Advanced request handling with multiple strategies
async function handleRequest(request, strategy) {
  const url = request.url;
  const cacheKey = generateCacheKey(request);
  
  try {
    switch (strategy) {
      case STRATEGIES.CACHE_FIRST:
        return await cacheFirst(request, cacheKey);
        
      case STRATEGIES.NETWORK_FIRST:
        return await networkFirst(request, cacheKey);
        
      case STRATEGIES.STALE_WHILE_REVALIDATE:
        return await staleWhileRevalidate(request, cacheKey);
        
      case STRATEGIES.CACHE_ONLY:
        return await cacheOnly(request, cacheKey);
        
      case STRATEGIES.NETWORK_ONLY:
        return await networkOnly(request);
        
      default:
        return await staleWhileRevalidate(request, cacheKey);
    }
  } catch (error) {
    console.error('Request handling failed:', error);
    return new Response('Service Unavailable', { status: 503 });
  }
}

// Cache First Strategy - optimized for static assets
async function cacheFirst(request, cacheKey) {
  const cache = await getCacheByType(request.url);
  const cachedResponse = await cache.match(cacheKey);
  
  if (cachedResponse) {
    cacheStats.hits++;
    postMessage({ type: 'CACHE_HIT', data: { url: request.url } });
    
    // Background refresh for long-cached items
    if (shouldRefreshInBackground(cachedResponse)) {
      refreshInBackground(request, cache, cacheKey);
    }
    
    return cachedResponse;
  }
  
  cacheStats.misses++;
  cacheStats.networkRequests++;
  postMessage({ type: 'CACHE_MISS', data: { url: request.url } });
  
  try {
    const response = await fetch(request.clone());
    if (response.ok) {
      await cacheResponse(cache, cacheKey, response.clone());
    }
    return response;
  } catch (error) {
    return createErrorResponse();
  }
}

// Network First Strategy - for dynamic content
async function networkFirst(request, cacheKey) {
  const cache = await getCacheByType(request.url);
  
  try {
    cacheStats.networkRequests++;
    const response = await fetch(request.clone());
    
    if (response.ok) {
      await cacheResponse(cache, cacheKey, response.clone());
    }
    
    return response;
  } catch (error) {
    cacheStats.misses++;
    const cachedResponse = await cache.match(cacheKey);
    
    if (cachedResponse) {
      cacheStats.hits++;
      return cachedResponse;
    }
    
    return createErrorResponse();
  }
}

// Stale While Revalidate - best for API responses
async function staleWhileRevalidate(request, cacheKey) {
  const cache = await getCacheByType(request.url);
  const cachedResponse = await cache.match(cacheKey);
  
  // Fetch fresh data in background
  const fetchPromise = fetch(request.clone())
    .then(response => {
      if (response.ok) {
        cacheResponse(cache, cacheKey, response.clone());
      }
      return response;
    })
    .catch(() => null);
  
  if (cachedResponse) {
    cacheStats.hits++;
    
    // Return cached version immediately, update in background
    fetchPromise.then(() => {
      postMessage({ type: 'BACKGROUND_UPDATE', data: { url: request.url } });
    });
    
    return cachedResponse;
  }
  
  // No cached version, wait for network
  cacheStats.misses++;
  cacheStats.networkRequests++;
  const response = await fetchPromise;
  
  return response || createErrorResponse();
}

// Cache Only Strategy
async function cacheOnly(request, cacheKey) {
  const cache = await getCacheByType(request.url);
  const cachedResponse = await cache.match(cacheKey);
  
  if (cachedResponse) {
    cacheStats.hits++;
    return cachedResponse;
  }
  
  cacheStats.misses++;
  return createErrorResponse();
}

// Network Only Strategy
async function networkOnly(request) {
  cacheStats.networkRequests++;
  try {
    return await fetch(request);
  } catch (error) {
    return createErrorResponse();
  }
}

// Utility functions
function getStrategy(url) {
  for (const route of ROUTE_STRATEGIES) {
    if (route.pattern.test(url)) {
      return route.strategy;
    }
  }
  return STRATEGIES.STALE_WHILE_REVALIDATE;
}

function generateCacheKey(request) {
  // Create deterministic cache key
  const url = new URL(request.url);
  
  // Remove cache-busting parameters
  url.searchParams.delete('_');
  url.searchParams.delete('timestamp');
  url.searchParams.delete('cache_bust');
  
  return `${request.method}:${url.toString()}`;
}

async function getCacheByType(url) {
  if (url.includes('soundcloud.com')) {
    return await caches.open(CACHE_NAMES.IFRAME);
  }
  if (url.includes('/api/')) {
    return await caches.open(CACHE_NAMES.API);
  }
  return await caches.open(CACHE_NAMES.STATIC);
}

async function cacheResponse(cache, cacheKey, response) {
  try {
    // Add metadata headers
    const headers = new Headers(response.headers);
    headers.set('sw-cached', Date.now().toString());
    headers.set('sw-cache-key', cacheKey);
    
    const responseWithMetadata = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
    
    await cache.put(cacheKey, responseWithMetadata);
  } catch (error) {
    console.warn('Failed to cache response:', error);
  }
}

function shouldRefreshInBackground(response) {
  const cached = response.headers.get('sw-cached');
  if (!cached) return false;
  
  const cacheAge = Date.now() - parseInt(cached);
  return cacheAge > 30 * 60 * 1000; // 30 minutes
}

async function refreshInBackground(request, cache, cacheKey) {
  try {
    const response = await fetch(request.clone());
    if (response.ok) {
      await cacheResponse(cache, cacheKey, response);
      postMessage({ 
        type: 'BACKGROUND_REFRESH', 
        data: { url: request.url } 
      });
    }
  } catch (error) {
    console.warn('Background refresh failed:', error);
  }
}

function createErrorResponse() {
  return new Response(
    JSON.stringify({ error: 'Network unavailable' }),
    {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

// Preloading functionality
async function handlePreload(urls) {
  if (!Array.isArray(urls)) return;
  
  const cache = await caches.open(CACHE_NAMES.PRELOAD);
  const preloadPromises = urls.map(async (url) => {
    try {
      if (cacheStats.preloadedUrls.includes(url)) return;
      
      const response = await fetch(url);
      if (response.ok) {
        await cache.put(url, response.clone());
        cacheStats.preloadedUrls.push(url);
        
        postMessage({ 
          type: 'PRELOAD_COMPLETE', 
          data: { url } 
        });
      }
    } catch (error) {
      console.warn('Preload failed for:', url, error);
    }
  });
  
  await Promise.allSettled(preloadPromises);
}

// Predictive prefetching
async function prefetchNext(currentUrl, allUrls) {
  const currentIndex = allUrls.indexOf(currentUrl);
  if (currentIndex === -1) return;
  
  const nextUrls = [
    allUrls[(currentIndex + 1) % allUrls.length],
    allUrls[(currentIndex + 2) % allUrls.length]
  ].filter(Boolean);
  
  await handlePreload(nextUrls);
}

// Cache management
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  const deletePromises = cacheNames
    .filter(name => name.startsWith('widgetopia-'))
    .map(name => caches.delete(name));
  
  await Promise.all(deletePromises);
  
  // Reset stats
  cacheStats = {
    hits: 0,
    misses: 0,
    networkRequests: 0,
    preloadedUrls: []
  };
  
  postMessage({ type: 'CACHE_CLEARED' });
}

// Communication helper
function postMessage(message) {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => client.postMessage(message));
  });
}

// Performance monitoring
setInterval(() => {
  const hitRate = cacheStats.hits / (cacheStats.hits + cacheStats.misses) * 100 || 0;
  
  postMessage({
    type: 'PERFORMANCE_STATS',
    data: {
      ...cacheStats,
      hitRate: hitRate.toFixed(2)
    }
  });
}, 60000); // Every minute

console.log('Advanced Service Worker loaded successfully!'); 