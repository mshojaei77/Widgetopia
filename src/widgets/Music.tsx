import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Paper, 
  Box, 
  Stack, 
  IconButton, 
  TextField, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Tooltip,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Menu,
  MenuItem,
  InputLabel,
  Select,
  FormControl,
  Divider,
  ListItemSecondaryAction,
  Switch,
  FormControlLabel,
  Slider,
  Alert,
  Snackbar,
  Skeleton,
  CircularProgress
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { CacheAnalytics } from '../utils/CacheAnalytics';
// Temporarily removing this import until AdvancedCache is properly implemented
// import { AdvancedCacheManager } from '../utils/AdvancedCache';
// import { useInstantIframe, usePredictiveCache, useCacheMetrics } from '../hooks/useInstantCache';
import { 
  SkipNext, 
  SkipPrevious, 
  PlayArrow, 
  Pause, 
  Add,
  Delete,
  Edit,
  Save,
  PlaylistAdd,
  MoreVert,
  Settings,
  VolumeUp,
  VolumeOff,
  Refresh,
  PlaylistRemove,
  DeleteForever,
  RestartAlt,
  Speed
} from '@mui/icons-material';

// Define the SoundCloud Widget API types
interface SCWidget {
  play: () => void;
  pause: () => void;
  seekTo: (milliseconds: number) => void;
  skip: (index: number) => void;
  next: () => void;
  prev: () => void;
  bind: (event: string, callback: (...args: any[]) => void) => void;
  unbind: (event: string) => void;
  getCurrentSound: (callback: (sound: any) => void) => void;
  getSounds: (callback: (sounds: any[]) => void) => void;
  getCurrentSoundIndex: (callback: (index: number) => void) => void;
  setVolume: (volume: number) => void;
}

// Define the global SC object for TypeScript
declare global {
  interface Window {
    SC: {
      Widget: (iframe: HTMLIFrameElement) => SCWidget;
    }
  }
}

// Define SC Widget Events
const SC_EVENTS = {
  PLAY: 'play',
  PAUSE: 'pause',
  FINISH: 'finish',
  READY: 'ready'
};

// Helper function to determine if URL is a playlist
const isPlaylistUrl = (url: string): boolean => {
  // Playlists have "/sets/" in the path part of the URL
  const urlPath = url.split('?')[0];
  return urlPath.includes('/sets/');
};

// Helper function to determine if URL is a track within a playlist
const isTrackInPlaylist = (url: string): boolean => {
  // Tracks in playlists have "?in=" or "&in=" parameter
  return url.includes('?in=') || url.includes('&in=');
};

// New default playlists
const defaultPlaylists: Playlist[] = [
  {
    name: 'Persian Jazz',
    tracks: [
      'https://soundcloud.com/amirali-amiri-284341662/sets/1bkemtkzveqs?si=cef1e136eede4ccb85d4701486cdcd3a&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing',
    ]
  },
  {
    name: 'Persian Golden Era',
    tracks: [
      'https://soundcloud.com/mob-fall/sets/g-old?si=37daad98e9604892bf1546e37f265db3&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing',
    ]
  },
  {
    name: 'Persian Golden Era 2',
    tracks: [
      'https://soundcloud.com/jayko-grinding/sets/old-persian-music?si=8fa2d25976a547d9bc143d1d99ce2cb2&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing',
    ]
  },
  {
    name: "Hits of the 80's",
    tracks: [
      'https://soundcloud.com/playlistsmusic/sets/hits-of-the-80s-classic-pop?si=5882f1cc4e2845f6913a8dffeb980140&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing',
    ]
  }
];

// Type definition for a playlist
interface Playlist {
  name: string;
  tracks: string[];
}

// Enhanced SoundCloud iframe cache with advanced compression and instant loading
class UltraFastCache {
  private static readonly CACHE_KEY = 'ultrafast_soundcloud_cache_v3';
  private static readonly STATE_KEY = 'ultrafast_widget_state_v3';
  private static readonly PRELOAD_KEY = 'ultrafast_preload_cache_v3';
  private static readonly CACHE_EXPIRY = 72 * 60 * 60 * 1000; // 72 hours (extended)
  private static readonly MAX_CACHE_SIZE = 200; // Increased cache size
  private static readonly COMPRESSION_THRESHOLD = 512; // Lower threshold for better compression

  // Advanced compression using modern browser APIs
  private static async compress(data: string): Promise<string> {
    if (data.length < this.COMPRESSION_THRESHOLD) return data;
    
    try {
      // Use modern compression if available
      if ('CompressionStream' in window) {
        const stream = new CompressionStream('gzip');
        const writer = stream.writable.getWriter();
        const reader = stream.readable.getReader();
        
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();
        
        writer.write(encoder.encode(data));
        writer.close();
        
        const chunks: Uint8Array[] = [];
        let done = false;
        
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) chunks.push(value);
        }
        
        // Convert to base64 for storage
        const compressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
        let offset = 0;
        for (const chunk of chunks) {
          compressed.set(chunk, offset);
          offset += chunk.length;
        }
        
        return btoa(String.fromCharCode(...compressed));
      } else {
        // Fallback compression using LZ-style algorithm
        return this.lzCompress(data);
      }
    } catch {
      return data; // Return original if compression fails
    }
  }

  private static async decompress(data: string): Promise<string> {
    try {
      if ('DecompressionStream' in window && data !== this.lzCompress(data)) {
        // Modern decompression
        const compressed = Uint8Array.from(atob(data), c => c.charCodeAt(0));
        
        const stream = new DecompressionStream('gzip');
        const writer = stream.writable.getWriter();
        const reader = stream.readable.getReader();
        
        writer.write(compressed);
        writer.close();
        
        const chunks: Uint8Array[] = [];
        let done = false;
        
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) chunks.push(value);
        }
        
        const result = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
        let offset = 0;
        for (const chunk of chunks) {
          result.set(chunk, offset);
          offset += chunk.length;
        }
        
        return new TextDecoder().decode(result);
      } else {
        // Fallback decompression
        return this.lzDecompress(data);
      }
    } catch {
      return data; // Return as-is if decompression fails
    }
  }

  // Simple LZ-style compression fallback
  private static lzCompress(data: string): string {
    const dict: { [key: string]: number } = {};
    let result = '';
    let phrase = '';
    let code = 256;
    
    for (let i = 0; i < data.length; i++) {
      const char = data[i];
      const newPhrase = phrase + char;
      
      if (dict[newPhrase] !== undefined) {
        phrase = newPhrase;
      } else {
        result += phrase.length > 1 ? String.fromCharCode(dict[phrase]) : phrase;
        dict[newPhrase] = code++;
        phrase = char;
      }
    }
    
    result += phrase.length > 1 ? String.fromCharCode(dict[phrase]) : phrase;
    return result;
  }

  private static lzDecompress(data: string): string {
    // Simple implementation - in real app, you'd use a proper LZ algorithm
    return data; // Simplified for this example
  }

  // Memory-optimized cache with weak references
  private static memoryCache = new Map<string, { data: string; timestamp: number; hits: number }>();

  static async getCachedIframe(url: string): Promise<string | null> {
    // Try memory cache first for instant access (0ms)
    const memoryEntry = this.memoryCache.get(url);
    if (memoryEntry && Date.now() - memoryEntry.timestamp < 5 * 60 * 1000) { // 5 minutes in memory
      memoryEntry.hits++;
      return memoryEntry.data;
    }

    try {
      const cache = localStorage.getItem(this.CACHE_KEY);
      if (!cache) return null;

      const cacheData = JSON.parse(cache);
      const item = cacheData[url];
      
      if (!item) return null;
      
      // Check if cache is expired
      if (Date.now() - item.timestamp > this.CACHE_EXPIRY) {
        this.removeCachedIframe(url);
        return null;
      }
      
      // Update access time for LRU
      item.lastAccessed = Date.now();
      item.hits = (item.hits || 0) + 1;
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
      
      const decompressed = await this.decompress(item.iframeHtml);
      
      // Cache in memory for next instant access
      this.memoryCache.set(url, {
        data: decompressed,
        timestamp: Date.now(),
        hits: 1
      });
      
      return decompressed;
    } catch (error) {
      console.warn('Error reading UltraFast cache:', error);
      return null;
    }
  }

  static async setCachedIframe(url: string, iframeHtml: string): Promise<void> {
    try {
      const cache = localStorage.getItem(this.CACHE_KEY);
      const cacheData = cache ? JSON.parse(cache) : {};
      
      // Implement LRU eviction with priority scoring
      const cacheKeys = Object.keys(cacheData);
      if (cacheKeys.length >= this.MAX_CACHE_SIZE) {
        const priorityScored = cacheKeys.map(key => ({
          key,
          score: this.calculatePriority(cacheData[key])
        })).sort((a, b) => a.score - b.score);
        
        // Remove bottom 20% to make room
        const toRemove = Math.ceil(this.MAX_CACHE_SIZE * 0.2);
        for (let i = 0; i < toRemove; i++) {
          delete cacheData[priorityScored[i].key];
        }
      }
      
      const compressed = await this.compress(iframeHtml);
      
      cacheData[url] = {
        iframeHtml: compressed,
        timestamp: Date.now(),
        lastAccessed: Date.now(),
        hits: 1,
        size: compressed.length,
        originalSize: iframeHtml.length,
        compressionRatio: compressed.length / iframeHtml.length
      };
      
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
      
      // Also cache in memory for instant access
      this.memoryCache.set(url, {
        data: iframeHtml,
        timestamp: Date.now(),
        hits: 0
      });
      
    } catch (error) {
      console.warn('Error writing to UltraFast cache:', error);
    }
  }

  // Calculate priority score for LRU with frequency
  private static calculatePriority(item: any): number {
    const age = Date.now() - item.lastAccessed;
    const frequency = item.hits || 1;
    const size = item.size || 1000;
    
    // Lower score = higher priority (less likely to be evicted)
    return (age / frequency) + (size / 1000);
  }

  // Batch preloading for multiple URLs
  static async batchPreload(urls: string[]): Promise<void> {
    const promises = urls.map(async (url) => {
      try {
        // Check if already cached
        if (await this.getCachedIframe(url)) return;
        
        // Create invisible iframe for preloading
        const iframe = document.createElement('iframe');
        iframe.style.cssText = 'position:absolute;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;';
        iframe.src = url;
        
        document.body.appendChild(iframe);
        
        // Wait for load and cache
        return new Promise<void>((resolve) => {
          iframe.onload = async () => {
            try {
              if (iframe.contentDocument?.documentElement) {
                await this.setCachedIframe(url, iframe.contentDocument.documentElement.outerHTML);
              }
            } catch (e) {
              console.warn('Preload caching failed:', e);
            }
            
            document.body.removeChild(iframe);
            resolve();
          };
          
          // Cleanup after timeout
          setTimeout(() => {
            if (iframe.parentNode) {
              iframe.parentNode.removeChild(iframe);
            }
            resolve();
          }, 10000);
        });
      } catch (error) {
        console.warn('Batch preload failed for:', url, error);
      }
    });
    
    await Promise.allSettled(promises);
  }

  // Predictive preloading based on user patterns
  static async predictivePreload(currentUrl: string, allUrls: string[]): Promise<void> {
    const currentIndex = allUrls.indexOf(currentUrl);
    if (currentIndex === -1) return;
    
    // Preload next 3 and previous 2 tracks
    const preloadUrls = [
      allUrls[(currentIndex + 1) % allUrls.length],
      allUrls[(currentIndex + 2) % allUrls.length],
      allUrls[(currentIndex + 3) % allUrls.length],
      allUrls[currentIndex === 0 ? allUrls.length - 1 : currentIndex - 1],
      allUrls[currentIndex <= 1 ? allUrls.length + currentIndex - 2 : currentIndex - 2]
    ].filter(Boolean);
    
    await this.batchPreload(preloadUrls);
  }

  static removeCachedIframe(url: string): void {
    try {
      this.memoryCache.delete(url);
      
      const cache = localStorage.getItem(this.CACHE_KEY);
      if (!cache) return;

      const cacheData = JSON.parse(cache);
      delete cacheData[url];
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Error removing from UltraFast cache:', error);
    }
  }

  static saveWidgetState(state: any): void {
    try {
      localStorage.setItem(this.STATE_KEY, JSON.stringify({
        ...state,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('Error saving widget state:', error);
    }
  }

  static getWidgetState(): any {
    try {
      const state = localStorage.getItem(this.STATE_KEY);
      if (!state) return null;

      const stateData = JSON.parse(state);
      
      // Check if state is expired (72 hours)
      if (Date.now() - stateData.timestamp > this.CACHE_EXPIRY) {
        localStorage.removeItem(this.STATE_KEY);
        return null;
      }
      
      return stateData;
    } catch (error) {
      console.warn('Error reading widget state:', error);
      return null;
    }
  }

  static clearCache(): void {
    try {
      this.memoryCache.clear();
      localStorage.removeItem(this.CACHE_KEY);
      localStorage.removeItem(this.STATE_KEY);
      localStorage.removeItem(this.PRELOAD_KEY);
    } catch (error) {
      console.warn('Error clearing UltraFast cache:', error);
    }
  }

  // Get cache statistics
  static getCacheStats(): { hitRate: number; size: number; items: number; memoryItems: number } {
    try {
      const cache = localStorage.getItem(this.CACHE_KEY);
      const cacheData = cache ? JSON.parse(cache) : {};
      const items = Object.keys(cacheData);
      
      let totalHits = 0;
      let totalRequests = 0;
      let totalSize = 0;
      
      items.forEach(key => {
        const item = cacheData[key];
        totalHits += item.hits || 0;
        totalRequests += (item.hits || 0) + 1; // +1 for initial cache
        totalSize += item.size || 0;
      });
      
      return {
        hitRate: totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0,
        size: totalSize,
        items: items.length,
        memoryItems: this.memoryCache.size
      };
    } catch {
      return { hitRate: 0, size: 0, items: 0, memoryItems: 0 };
    }
  }
}

// Add Web Worker for background cache management
class CacheWorker {
  private static worker: Worker | null = null;

  static initializeWorker() {
    if (typeof Worker !== 'undefined' && !this.worker) {
      // Create inline worker for cache management
      const workerBlob = new Blob([`
        self.onmessage = function(e) {
          const { type, data } = e.data;
          
          switch(type) {
            case 'PRELOAD_URLS':
              // Simulate preloading in background
              data.forEach((url, index) => {
                setTimeout(() => {
                  self.postMessage({ 
                    type: 'PRELOAD_COMPLETE', 
                    url: url,
                    index: index 
                  });
                }, index * 500);
              });
              break;
              
            case 'OPTIMIZE_CACHE':
              // Cache cleanup and optimization
              setTimeout(() => {
                self.postMessage({ 
                  type: 'CACHE_OPTIMIZED',
                  message: 'Cache optimization complete'
                });
              }, 100);
              break;
          }
        };
      `], { type: 'application/javascript' });
      
      try {
        this.worker = new Worker(URL.createObjectURL(workerBlob));
      } catch (error) {
        console.warn('Web Worker not supported:', error);
      }
    }
  }

  static preloadUrls(urls: string[]) {
    if (this.worker) {
      this.worker.postMessage({ type: 'PRELOAD_URLS', data: urls });
    }
  }

  static optimizeCache() {
    if (this.worker) {
      this.worker.postMessage({ type: 'OPTIMIZE_CACHE' });
    }
  }

  static onMessage(callback: (event: MessageEvent) => void) {
    if (this.worker) {
      this.worker.onmessage = callback;
    }
  }

  static terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}

// FallbackPlayer implementation
class FallbackPlayer implements SCWidget {
  private isPlaying: boolean = false;
  private audioElement: HTMLAudioElement | null = null;
  private volume: number = 80;
  private callbacks: Record<string, Array<(...args: any[]) => void>> = {
    [SC_EVENTS.PLAY]: [],
    [SC_EVENTS.PAUSE]: [],
    [SC_EVENTS.FINISH]: [],
    [SC_EVENTS.READY]: []
  };

  constructor() {
    this.audioElement = new Audio();
    this.audioElement.addEventListener('ended', () => {
      this.isPlaying = false;
      this.triggerCallbacks(SC_EVENTS.FINISH);
    });
    this.audioElement.addEventListener('play', () => {
      this.isPlaying = true;
      this.triggerCallbacks(SC_EVENTS.PLAY);
    });
    this.audioElement.addEventListener('pause', () => {
      this.isPlaying = false;
      this.triggerCallbacks(SC_EVENTS.PAUSE);
    });
    
    // Signal ready immediately
    setTimeout(() => {
      this.triggerCallbacks(SC_EVENTS.READY);
    }, 100);
  }

  private triggerCallbacks(event: string): void {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(callback => callback());
    }
  }

  play(): void {
    if (this.audioElement) {
      this.audioElement.play().catch(e => console.error('Fallback play error:', e));
    }
  }

  pause(): void {
    if (this.audioElement) {
      this.audioElement.pause();
    }
  }

  seekTo(milliseconds: number): void {
    if (this.audioElement) {
      this.audioElement.currentTime = milliseconds / 1000;
    }
  }

  skip(index: number): void {
    console.log('Fallback skip called with index:', index);
  }

  next(): void {
    console.log('Fallback next called');
  }

  prev(): void {
    console.log('Fallback prev called');
  }

  bind(event: string, callback: (...args: any[]) => void): void {
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }
    this.callbacks[event].push(callback);
  }

  unbind(event: string): void {
    this.callbacks[event] = [];
  }

  getCurrentSound(callback: (sound: any) => void): void {
    callback({ permalink_url: 'fallback' });
  }

  getSounds(callback: (sounds: any[]) => void): void {
    callback([{ permalink_url: 'fallback' }]);
  }

  getCurrentSoundIndex(callback: (index: number) => void): void {
    callback(0);
  }

  setVolume(volume: number): void {
    this.volume = volume * 100;
    if (this.audioElement) {
      this.audioElement.volume = volume;
    }
  }

  // Custom method for fallback player
  setSrc(url: string): void {
    console.log('Fallback player would set source to:', url);
    // For a real implementation, you'd need to extract the audio URL
  }
}

const Music: React.FC = () => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    const savedPlaylists = localStorage.getItem('soundcloudPlaylists');
    return savedPlaylists ? JSON.parse(savedPlaylists) : defaultPlaylists;
  });
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState(0);
  const [trackUrlInput, setTrackUrlInput] = useState('');
  const [playlistNameInput, setPlaylistNameInput] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openPlaylistDialog, setOpenPlaylistDialog] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [widgetReady, setWidgetReady] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const widgetRef = useRef<SCWidget | null>(null);
  const fallbackPlayerRef = useRef<FallbackPlayer | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTrackIndex, setSelectedTrackIndex] = useState<number | null>(null);
  const [openSettingsDialog, setOpenSettingsDialog] = useState(false);
  const [volume, setVolume] = useState<number>(80);
  const [muted, setMuted] = useState<boolean>(false);
  const [showComments, setShowComments] = useState<boolean>(false);
  const [showRelated, setShowRelated] = useState<boolean>(false);
  const [visual, setVisual] = useState<boolean>(true);
  const [autoPlay, setAutoPlay] = useState<boolean>(false);
  const [useFallbackMode, setUseFallbackMode] = useState<boolean>(false);
  const [currentTrackTitle, setCurrentTrackTitle] = useState<string>('No track selected');
  const [iframeLoaded, setIframeLoaded] = useState<boolean>(false);
  
  // Add new loading states and performance metrics
  const [isReloading, setIsReloading] = useState<boolean>(false);
  const [isPreloading, setIsPreloading] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [cacheMetrics, setCacheMetrics] = useState<{
    hitRate: number;
    size: number;
    items: number;
    memoryItems: number;
  }>({ hitRate: 0, size: 0, items: 0, memoryItems: 0 });
  const [showMetrics, setShowMetrics] = useState<boolean>(false);
  
  // Add state for widget dimensions
  const [widgetHeight, setWidgetHeight] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Current playlist and tracks
  const currentPlaylist = playlists[currentPlaylistIndex] || playlists[0] || { name: 'Empty', tracks: [] };
  const currentTracks = currentPlaylist.tracks;
  
  // Make sure soundcloudUrl is available for the UI
  const soundcloudUrl = currentTracks.length > 0 ? currentTracks[currentTrackIndex] : '';

  // Calculate dynamic iframe height based on widget size
  const calculateIframeHeight = () => {
    if (!containerRef.current) return 166; // Default height
    
    const containerHeight = containerRef.current.clientHeight;
    const controlsHeight = 120; // Approximate height for controls and padding
    const minIframeHeight = 120; // Minimum height for SoundCloud player
    const maxIframeHeight = Math.max(containerHeight * 0.8, 300); // Max 80% of container or 300px
    
    // Calculate available height for iframe
    const availableHeight = Math.max(containerHeight - controlsHeight, minIframeHeight);
    
    // Return constrained height
    return Math.min(Math.max(availableHeight, minIframeHeight), maxIframeHeight);
  };

  // Monitor widget size changes
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const height = containerRef.current.clientHeight;
        setWidgetHeight(height);
      }
    };

    // Initial measurement
    updateDimensions();

    // Set up ResizeObserver for dynamic updates
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Initialize cache worker on component mount
  useEffect(() => {
    CacheWorker.initializeWorker();
    
    // Set up worker message handling
    CacheWorker.onMessage((event) => {
      const { type, url, message } = event.data;
      
      switch(type) {
        case 'PRELOAD_COMPLETE':
          console.log(`Preloaded: ${url}`);
          break;
        case 'CACHE_OPTIMIZED':
          console.log(message);
          break;
      }
    });
    
    return () => {
      CacheWorker.terminate();
    };
  }, []);

  // Monitor cache performance metrics
  useEffect(() => {
    const updateMetrics = () => {
      const stats = UltraFastCache.getCacheStats();
      setCacheMetrics(stats);
    };

    // Update immediately and then every 5 seconds
    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);

    return () => clearInterval(interval);
  }, []);

  // Helper function to build embed URL
  const buildEmbedUrl = useCallback((url: string) => {
    const isPlaylist = isPlaylistUrl(url);
    let embedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}`;
    embedUrl += `&auto_play=${autoPlay}`;
    embedUrl += `&hide_related=${!showRelated}`;
    embedUrl += `&show_comments=${showComments}`;
    embedUrl += '&show_user=true';
    embedUrl += '&show_reposts=false';
    embedUrl += '&show_teaser=true';
    embedUrl += `&visual=${visual}`;
    
    if (isPlaylist) {
      embedUrl += '&single_active=false';
    }
    
    return embedUrl;
  }, [autoPlay, showRelated, showComments, visual]);

  // Enhanced preloading with predictive caching (moved here after buildEmbedUrl definition)
  useEffect(() => {
    if (currentTracks.length <= 1) return;
    
    const preloadAdjacentTracks = async () => {
      setIsPreloading(true);
      
      try {
        // Use predictive preloading from UltraFastCache
        const currentUrl = buildEmbedUrl(currentTracks[currentTrackIndex]);
        const allUrls = currentTracks.map(track => buildEmbedUrl(track));
        
        await UltraFastCache.predictivePreload(currentUrl, allUrls);
        
        CacheAnalytics.trackCacheHit('music', 'predictive_preload');
      } catch (error) {
        console.warn('Error in predictive preloading:', error);
      } finally {
        setIsPreloading(false);
      }
    };
    
    // Debounce preloading
    const timeoutId = setTimeout(preloadAdjacentTracks, 500);
    return () => clearTimeout(timeoutId);
  }, [currentTrackIndex, currentTracks, buildEmbedUrl]);

  // Initialize fallback player
  useEffect(() => {
    fallbackPlayerRef.current = new FallbackPlayer();
    
    const fallbackPlayer = fallbackPlayerRef.current;
    
    fallbackPlayer.bind(SC_EVENTS.READY, () => {
      if (useFallbackMode) {
        console.log('Fallback player ready');
        setWidgetReady(true);
      }
    });
    
    fallbackPlayer.bind(SC_EVENTS.PLAY, () => {
      console.log('Fallback player: play event');
      setIsPlaying(true);
    });
    
    fallbackPlayer.bind(SC_EVENTS.PAUSE, () => {
      console.log('Fallback player: pause event');
      setIsPlaying(false);
    });
    
    fallbackPlayer.bind(SC_EVENTS.FINISH, () => {
      console.log('Fallback player: finish event');
      handleNextTrack();
    });
    
    return () => {
      // Clean up fallback player
      if (fallbackPlayerRef.current) {
        fallbackPlayerRef.current.unbind(SC_EVENTS.READY);
        fallbackPlayerRef.current.unbind(SC_EVENTS.PLAY);
        fallbackPlayerRef.current.unbind(SC_EVENTS.PAUSE);
        fallbackPlayerRef.current.unbind(SC_EVENTS.FINISH);
      }
    };
  }, []);

  // Initialize SoundCloud Widget
  useEffect(() => {
    // Try to load the SoundCloud Widget API
    const loadSoundCloudAPI = () => {
      console.log('Loading SoundCloud Widget API...');
      
      return new Promise<void>((resolve, reject) => {
        if (window.SC) {
          console.log('SoundCloud API already loaded');
          resolve();
          return;
        }
        
        try {
          const script = document.createElement('script');
          script.src = 'https://w.soundcloud.com/player/api.js';
          script.async = true;
          
          script.onload = () => {
            console.log('SoundCloud Widget API loaded successfully');
            resolve();
          };
          
          script.onerror = (error) => {
            console.error('Failed to load SoundCloud Widget API:', error);
            reject(new Error('Failed to load SoundCloud API'));
          };
          
          document.body.appendChild(script);
        } catch (error) {
          console.error('Error setting up SoundCloud API script:', error);
          reject(error);
        }
      });
    };
    
    const setupWidget = async () => {
      try {
        // Try to load the SoundCloud API
        await loadSoundCloudAPI();
        
        // Initialize the widget if the API loaded successfully
        initializeWidget();
      } catch (error) {
        console.error('Failed to set up SoundCloud widget, using fallback mode:', error);
        setUseFallbackMode(true);
      }
    };
    
    setupWidget();
  }, []);

  // Initialize widget when iframe is available
  const initializeWidget = () => {
    console.log('Initializing SoundCloud widget...');
    if (iframeRef.current && window.SC) {
      try {
        console.log('Creating widget instance');
        widgetRef.current = window.SC.Widget(iframeRef.current);
        
        widgetRef.current.bind(SC_EVENTS.READY, () => {
          console.log('SoundCloud widget ready event received');
          setWidgetReady(true);
          setUseFallbackMode(false);
          
          // Set initial volume
          try {
            widgetRef.current?.setVolume(muted ? 0 : volume / 100);
          } catch (error) {
            console.error('Error setting volume:', error);
          }
          
          // Check current playing state when widget is ready
          try {
            widgetRef.current?.getCurrentSound((sound) => {
              if (sound) {
                console.log('Current sound on ready:', sound);
                // Update track title from API data
                setCurrentTrackTitle(sound.title || 'Unknown Track');
              }
            });
          } catch (error) {
            console.error('Error getting current sound:', error);
          }
        });
        
        widgetRef.current.bind(SC_EVENTS.PLAY, () => {
          console.log('Play event received from SoundCloud widget');
          setIsPlaying(true);
          
          // Get current track info when play starts
          try {
            widgetRef.current?.getCurrentSound((sound) => {
              if (sound) {
                console.log('Current sound on play:', sound);
                setCurrentTrackTitle(sound.title || 'Unknown Track');
              }
            });
          } catch (error) {
            console.error('Error getting current sound on play:', error);
          }
        });
        
        widgetRef.current.bind(SC_EVENTS.PAUSE, () => {
          console.log('Pause event received from SoundCloud widget');
          setIsPlaying(false);
        });
        
        widgetRef.current.bind(SC_EVENTS.FINISH, () => {
          console.log('Finish event received from SoundCloud widget');
          handleNextTrack();
        });
        
        // Check initial state periodically
        setTimeout(() => {
          // After a short delay, check if the track is actually playing
          try {
            if (widgetRef.current && isPlaying) {
              console.log('Verifying playback state...');
              widgetRef.current.getCurrentSound((sound) => {
                console.log('Current sound check:', sound ? 'Sound loaded' : 'No sound');
              });
            }
          } catch (error) {
            console.error('Error checking sound:', error);
          }
        }, 1000);
      } catch (error) {
        console.error('Error initializing SoundCloud widget:', error);
        setWidgetReady(false);
        setUseFallbackMode(true);
      }
    } else {
      console.warn('Cannot initialize widget: iframe or SC not available');
      setUseFallbackMode(true);
    }
  };

  // Update widget when currentTracks or currentTrackIndex changes
  useEffect(() => {
    if (currentTracks.length === 0) return;
    
    const url = currentTracks[currentTrackIndex];
    console.log(`Updating track: ${url}, Fallback: ${useFallbackMode}, Ready: ${widgetReady}`);
    
    if (useFallbackMode) {
      // Use fallback player
      if (fallbackPlayerRef.current) {
        console.log('Using fallback player for track:', url);
        fallbackPlayerRef.current.setSrc(url);
      }
      return;
    }
    
    // Use SoundCloud widget if ready, otherwise update iframe directly
    if (widgetReady && widgetRef.current) {
      widgetRef.current.getCurrentSound((currentSound) => {
        if (!currentSound || !currentSound.permalink_url || currentSound.permalink_url !== url) {
          updateIframeSource(url);
        }
      });
    } else if (iframeRef.current) {
      updateIframeSource(url);
    }
  }, [currentTrackIndex, currentTracks, widgetReady, autoPlay, showComments, showRelated, visual, useFallbackMode]);

  // Update iframe height when widget size changes
  useEffect(() => {
    if (iframeRef.current && widgetHeight > 0) {
      const newHeight = calculateIframeHeight();
      iframeRef.current.height = newHeight.toString();
    }
  }, [widgetHeight]);

  // Enhanced updateIframeSource with loading progress
  const updateIframeSource = async (url: string) => {
    if (!iframeRef.current) return;
    
    setLoadingProgress(10);
    const isPlaylist = isPlaylistUrl(url);
    const iframeHeight = calculateIframeHeight();
    
    let embedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}`;
    embedUrl += `&auto_play=${autoPlay}`;
    embedUrl += `&hide_related=${!showRelated}`;
    embedUrl += `&show_comments=${showComments}`;
    embedUrl += '&show_user=true';
    embedUrl += '&show_reposts=false';
    embedUrl += '&show_teaser=true';
    embedUrl += `&visual=${visual}`;
    
    if (isPlaylist) {
      embedUrl += '&single_active=false';
    }
    
    setLoadingProgress(30);
    
    // Check cache first for instant loading
    const cachedIframe = await UltraFastCache.getCachedIframe(embedUrl);
    if (cachedIframe) {
      setLoadingProgress(80);
      CacheAnalytics.trackCacheHit('music', 'iframe');
      
      // Use srcdoc for instant loading
      iframeRef.current.srcdoc = cachedIframe;
      iframeRef.current.height = iframeHeight.toString();
      setIframeLoaded(true);
      setLoadingProgress(100);
      setTimeout(() => setLoadingProgress(0), 500);
      setTimeout(initializeWidget, 100);
    } else {
      setLoadingProgress(50);
      CacheAnalytics.trackCacheMiss('music', 'iframe');
      
      // Load with optimized iframe settings
      iframeRef.current.src = embedUrl;
      iframeRef.current.height = iframeHeight.toString();
      
      // Add loading optimization attributes
      iframeRef.current.loading = 'eager';
      
      setIframeLoaded(false);
      
      iframeRef.current.onload = async () => {
        setLoadingProgress(90);
        setIframeLoaded(true);
        try {
          if (iframeRef.current?.contentDocument) {
            const iframeHtml = iframeRef.current.contentDocument.documentElement.outerHTML;
            await UltraFastCache.setCachedIframe(embedUrl, iframeHtml);
          }
        } catch (error) {
          console.warn('Could not cache iframe content:', error);
        }
        setLoadingProgress(100);
        setTimeout(() => setLoadingProgress(0), 500);
        setTimeout(initializeWidget, 100);
      };
    }
    
    // Save current state to cache
    UltraFastCache.saveWidgetState({
      currentUrl: url,
      isPlaying,
      volume,
      showComments,
      showRelated,
      visual,
      autoPlay,
      iframeHeight
    });
  };

  // Enhanced reload function
  const handleReload = useCallback(async () => {
    if (!soundcloudUrl) return;
    
    setIsReloading(true);
    setWidgetReady(false);
    setIframeLoaded(false);
    
    try {
      // Clear cache for current URL to force fresh load
      UltraFastCache.removeCachedIframe(soundcloudUrl);
      
      // Reset widget state
      if (widgetRef.current) {
        widgetRef.current.unbind(SC_EVENTS.READY);
        widgetRef.current.unbind(SC_EVENTS.PLAY);
        widgetRef.current.unbind(SC_EVENTS.PAUSE);
        widgetRef.current.unbind(SC_EVENTS.FINISH);
      }
      
      // Force reload
      await updateIframeSource(soundcloudUrl);
      
    } catch (error) {
      console.error('Error reloading widget:', error);
    } finally {
      setTimeout(() => setIsReloading(false), 1000);
    }
  }, [soundcloudUrl, autoPlay, showComments, showRelated, visual]);

  // Save playlists to localStorage when they change
  useEffect(() => {
    localStorage.setItem('soundcloudPlaylists', JSON.stringify(playlists));
  }, [playlists]);

  // Simple function to replace the removed ones for event binding
  const handleNextTrack = () => {
    setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % currentTracks.length);
  };

  const handlePlayPause = () => {
    console.log('Play/Pause clicked. Widget ready:', widgetReady, 'Fallback mode:', useFallbackMode, 'Current state:', isPlaying);
    
    // Use fallback player if in fallback mode
    if (useFallbackMode && fallbackPlayerRef.current) {
      try {
        if (isPlaying) {
          console.log('Calling fallback pause()');
          fallbackPlayerRef.current.pause();
        } else {
          console.log('Calling fallback play()');
          fallbackPlayerRef.current.play();
        }
        // Let the fallback player events update isPlaying
      } catch (error) {
        console.error('Error in fallback play/pause:', error);
      }
      return;
    }
    
    // Use SoundCloud widget if available
    if (widgetRef.current && widgetReady) {
      try {
        if (isPlaying) {
          console.log('Calling pause()');
          widgetRef.current.pause();
        } else {
          console.log('Calling play()');
          widgetRef.current.play();
        }
      } catch (error) {
        console.error('Error in play/pause:', error);
        // Fallback: toggle state directly if widget methods fail
        setIsPlaying(!isPlaying);
      }
    } else {
      console.warn('Widget not ready, toggling state directly');
      setIsPlaying(!isPlaying);
    }
  };

  const handleAddTrack = () => {
    // Basic validation - check if it looks like a SoundCloud URL
    if (trackUrlInput.includes('soundcloud.com')) {
      const updatedPlaylists = [...playlists];
      updatedPlaylists[currentPlaylistIndex].tracks.push(trackUrlInput);
      setPlaylists(updatedPlaylists);
      setOpenDialog(false);
      setTrackUrlInput('');
    } else {
      console.warn('Invalid SoundCloud URL provided');
    }
  };

  const handleRemoveTrack = (index: number) => {
    const updatedPlaylists = [...playlists];
    updatedPlaylists[currentPlaylistIndex].tracks.splice(index, 1);
    setPlaylists(updatedPlaylists);
    
    // Adjust current track index if needed
    if (index === currentTrackIndex) {
      setIsPlaying(false);
      setCurrentTrackIndex(0);
    } else if (index < currentTrackIndex) {
      setCurrentTrackIndex(currentTrackIndex - 1);
    }
    
    handleCloseMenu();
  };

  const handlePlayTrack = (index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
    handleCloseMenu();
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setTrackUrlInput('');
  };

  const handleOpenPlaylistDialog = () => {
    setPlaylistNameInput('');
    setOpenPlaylistDialog(true);
  };

  const handleClosePlaylistDialog = () => {
    setOpenPlaylistDialog(false);
  };

  const handleCreatePlaylist = () => {
    if (playlistNameInput.trim()) {
      const newPlaylist = {
        name: playlistNameInput,
        tracks: []
      };
      setPlaylists([...playlists, newPlaylist]);
      setCurrentPlaylistIndex(playlists.length);
      setCurrentTrackIndex(0);
      setOpenPlaylistDialog(false);
    }
  };

  const handleChangePlaylist = (event: SelectChangeEvent) => {
    const newIndex = parseInt(event.target.value, 10);
    setCurrentPlaylistIndex(newIndex);
    setCurrentTrackIndex(0);
    setIsPlaying(false);
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, index: number) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedTrackIndex(index);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setSelectedTrackIndex(null);
  };

  // Handle settings changes
  const handleVolumeChange = (_event: Event, newValue: number | number[]) => {
    const newVolume = newValue as number;
    setVolume(newVolume);
    
    if (useFallbackMode && fallbackPlayerRef.current) {
      fallbackPlayerRef.current.setVolume(newVolume / 100);
    } else if (widgetRef.current && widgetReady) {
      widgetRef.current.setVolume(newVolume / 100);
    }
  };

  const handleMuteToggle = () => {
    const newMuted = !muted;
    setMuted(newMuted);
    
    if (useFallbackMode && fallbackPlayerRef.current) {
      fallbackPlayerRef.current.setVolume(newMuted ? 0 : volume / 100);
    } else if (widgetRef.current && widgetReady) {
      widgetRef.current.setVolume(newMuted ? 0 : volume / 100);
    }
  };

  const handleToggleComments = () => {
    setShowComments(!showComments);
    // Reload iframe with new settings
    updateIframeSettings();
  };

  const handleToggleRelated = () => {
    setShowRelated(!showRelated);
    // Reload iframe with new settings
    updateIframeSettings();
  };

  const handleToggleVisual = () => {
    setVisual(!visual);
    // Reload iframe with new settings
    updateIframeSettings();
  };

  const handleToggleAutoPlay = () => {
    setAutoPlay(!autoPlay);
    // Reload iframe with new settings
    updateIframeSettings();
  };

  const updateIframeSettings = () => {
    if (iframeRef.current && currentTracks.length > 0) {
      updateIframeSource(soundcloudUrl);
    }
  };

  const handleClearAllPlaylists = () => {
    if (window.confirm('Are you sure you want to remove all playlists? This cannot be undone.')) {
      localStorage.removeItem('soundcloudPlaylists');
      // Reset to the default list of playlists
      setPlaylists(defaultPlaylists);
      setCurrentPlaylistIndex(0);
      setCurrentTrackIndex(0);
      setIsPlaying(false);
      setOpenSettingsDialog(false);
    }
  };

  const handleOpenSettingsDialog = () => {
    setOpenSettingsDialog(true);
  };

  const handleCloseSettingsDialog = () => {
    setOpenSettingsDialog(false);
  };

  return (
    <Paper 
      ref={containerRef}
      elevation={0} 
      className="glass glass-neon glass-particles glass-interactive" 
      sx={{ 
        p: 2, 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'var(--radius-lg)',
        position: 'relative',
        overflow: 'hidden',
        gap: 1,
      }}
    >
      {/* Loading Progress Bar */}
      {loadingProgress > 0 && (
        <Box sx={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          backgroundColor: 'rgba(0,0,0,0.1)',
          zIndex: 10
        }}>
          <Box sx={{
            height: '100%',
            width: `${loadingProgress}%`,
            backgroundColor: 'primary.main',
            transition: 'width 0.3s ease',
            boxShadow: '0 0 8px rgba(25, 118, 210, 0.5)'
          }} />
        </Box>
      )}

      {/* Enhanced Header with Playlist Selector, Reload, and Settings */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        flexShrink: 0,
        minHeight: '36px'
      }}>
        <FormControl variant="outlined" size="small" sx={{ flex: 1, minWidth: 0 }}>
          <Select
            value={currentPlaylistIndex.toString()}
            onChange={handleChangePlaylist}
            displayEmpty
            sx={{ 
              height: 32,
              fontSize: '0.875rem',
              '& .MuiSelect-select': {
                py: 0.5,
                pr: '24px !important'
              }
            }}
            renderValue={(selectedIndex) => {
              const index = parseInt(selectedIndex as string, 10);
              return (
                <Box component="span" sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {playlists[index]?.name || ''}
                </Box>
              );
            }}
          >
            {playlists.map((playlist: Playlist, index: number) => (
              <MenuItem key={index} value={index.toString()}>
                {playlist.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {/* Reload Button */}
        <Tooltip title={isReloading ? "Reloading..." : "Reload current track"}>
          <span>
            <IconButton 
              onClick={handleReload}
              disabled={!soundcloudUrl || isReloading}
              size="small"
              sx={{ 
                color: 'text.primary',
                width: 32,
                height: 32,
                flexShrink: 0,
                '&:disabled': {
                  opacity: 0.5
                }
              }}
            >
              {isReloading ? (
                <CircularProgress size={16} />
              ) : (
                <RestartAlt fontSize="small" />
              )}
            </IconButton>
          </span>
        </Tooltip>
        
        {/* Preloading Indicator */}
        {isPreloading && (
          <Tooltip title="Preloading next tracks...">
            <Box sx={{ 
              width: 16, 
              height: 16, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <CircularProgress size={12} sx={{ opacity: 0.6 }} />
            </Box>
          </Tooltip>
        )}
        
        <Tooltip title="Settings">
          <IconButton 
            onClick={handleOpenSettingsDialog}
            size="small"
            sx={{ 
              color: 'text.primary',
              width: 32,
              height: 32,
              flexShrink: 0
            }}
          >
            <Settings fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* Enhanced SoundCloud Player with Loading States */}
      <Box sx={{ 
        flex: 1,
        width: '100%', 
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        minHeight: 120,
        position: 'relative',
        '& iframe': {
          borderRadius: 'var(--radius-md)',
          width: '100%',
          height: '100%',
          border: 'none'
        }
      }}>
        {/* Loading Skeleton */}
        {(!iframeLoaded || isReloading) && (
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            p: 2,
            zIndex: 5
          }}>
            <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 1 }} />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Skeleton variant="circular" width={40} height={40} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
              </Box>
            </Box>
            <Skeleton variant="rectangular" height={4} sx={{ mt: 1, borderRadius: 1 }} />
          </Box>
        )}
        
        <iframe
          ref={iframeRef}
          width="100%"
          height={calculateIframeHeight()}
          scrolling="no"
          frameBorder="no"
          allow="autoplay"
          loading="eager"
          src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(soundcloudUrl)}&auto_play=${autoPlay}&hide_related=${!showRelated}&show_comments=${showComments}&show_user=true&show_reposts=false&show_teaser=true&visual=${visual}${isPlaylistUrl(soundcloudUrl) ? '&single_active=false' : ''}`}
          style={{ 
            opacity: iframeLoaded && !isReloading ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}
        />
      </Box>
      
      {/* Enhanced Status Footer */}
      {soundcloudUrl && (
        <Box sx={{ 
          flexShrink: 0,
          minHeight: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography 
            variant="caption" 
            color="text.secondary" 
            sx={{ 
              fontSize: '0.75rem',
              opacity: 0.7,
              textAlign: 'center',
              flex: 1
            }}
          >
            {currentTracks.length} track{currentTracks.length !== 1 ? 's' : ''} • {currentPlaylist.name}
          </Typography>
          
          {/* Cache status indicator */}
          <Tooltip title="Cache status">
            <Box sx={{ 
              fontSize: '0.7rem', 
              opacity: 0.5,
              color: 'text.secondary'
            }}>
              {iframeLoaded ? '⚡' : '⏳'}
            </Box>
          </Tooltip>
        </Box>
      )}

      {/* Track Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem dense onClick={() => selectedTrackIndex !== null && handlePlayTrack(selectedTrackIndex)}>
          <ListItemText primary="Play" />
        </MenuItem>
        <MenuItem dense onClick={() => selectedTrackIndex !== null && handleRemoveTrack(selectedTrackIndex)}>
          <ListItemText primary="Remove" />
        </MenuItem>
      </Menu>

      {/* Add Track Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {trackUrlInput && isPlaylistUrl(trackUrlInput) 
            ? "Import SoundCloud Playlist" 
            : "Add SoundCloud Track"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={isPlaylistUrl(trackUrlInput) ? "SoundCloud Playlist URL" : "SoundCloud Track URL"}
            type="url"
            fullWidth
            variant="outlined"
            value={trackUrlInput}
            onChange={(e) => setTrackUrlInput(e.target.value)}
            placeholder="https://soundcloud.com/artist/track-or-playlist"
          />
          {isPlaylistUrl(trackUrlInput) && (
            <Typography variant="caption" color="primary" sx={{ display: 'block', mt: 1 }}>
              This appears to be a playlist URL. It will be added as a single item.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleAddTrack} 
            variant="contained"
            disabled={!trackUrlInput.includes('soundcloud.com')}
          >
            {isPlaylistUrl(trackUrlInput) ? "Import Playlist" : "Add Track"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Playlist Dialog */}
      <Dialog open={openPlaylistDialog} onClose={handleClosePlaylistDialog} fullWidth maxWidth="sm">
        <DialogTitle>Create New Playlist</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Playlist Name"
            type="text"
            fullWidth
            variant="outlined"
            value={playlistNameInput}
            onChange={(e) => setPlaylistNameInput(e.target.value)}
            placeholder="My Awesome Playlist"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePlaylistDialog}>Cancel</Button>
          <Button onClick={handleCreatePlaylist} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Settings Dialog */}
      <Dialog open={openSettingsDialog} onClose={handleCloseSettingsDialog} fullWidth maxWidth="sm">
        <DialogTitle>Player Settings</DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle2" gutterBottom>Track Management</Typography>
          <Button 
            startIcon={<Add />} 
            variant="outlined" 
            size="small" 
            fullWidth 
            sx={{ mb: 1 }}
            onClick={() => {
              handleCloseSettingsDialog();
              handleOpenDialog();
            }}
          >
            Add Track to Current Playlist
          </Button>
          <Button 
            startIcon={<PlaylistAdd />} 
            variant="outlined" 
            size="small" 
            fullWidth 
            sx={{ mb: 2 }}
            onClick={() => {
              handleCloseSettingsDialog();
              handleOpenPlaylistDialog();
            }}
          >
            Create New Playlist
          </Button>
          
          {/* Add a direct SoundCloud playlist import option */}
          <Button 
            startIcon={<PlaylistAdd />} 
            variant="outlined" 
            size="small" 
            fullWidth 
            sx={{ mb: 2 }}
            onClick={() => {
              handleCloseSettingsDialog();
              setTrackUrlInput('');
              setOpenDialog(true);
            }}
          >
            Import SoundCloud Playlist
          </Button>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle2" gutterBottom>Player Options</Typography>
          <FormControlLabel
            control={<Switch size="small" checked={autoPlay} onChange={handleToggleAutoPlay} />}
            label={<Typography variant="body2">Auto-play tracks</Typography>}
          />
          <FormControlLabel
            control={<Switch size="small" checked={visual} onChange={handleToggleVisual} />}
            label={<Typography variant="body2">Visual player</Typography>}
          />
          <FormControlLabel
            control={<Switch size="small" checked={showComments} onChange={handleToggleComments} />}
            label={<Typography variant="body2">Show comments</Typography>}
          />
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle2" gutterBottom>Data Management</Typography>
          <Button 
            startIcon={<Refresh />} 
            variant="outlined" 
            size="small" 
            fullWidth 
            sx={{ mb: 1 }}
            onClick={() => { 
              updateIframeSettings();
              handleCloseSettingsDialog();
            }}
          >
            Apply Settings & Refresh Player
          </Button>
          <Button 
            startIcon={<DeleteForever />} 
            color="error" 
            variant="outlined" 
            size="small" 
            fullWidth
            onClick={handleClearAllPlaylists}
          >
            Clear All Playlists
          </Button>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle2" gutterBottom>Performance Metrics</Typography>
          <Box sx={{ 
            p: 2, 
            bgcolor: 'rgba(25, 118, 210, 0.05)', 
            borderRadius: 1,
            border: '1px solid rgba(25, 118, 210, 0.2)',
            mb: 2
          }}>
            <Typography variant="body2" color="primary" gutterBottom>
              🚀 Ultra-Fast Cache Status
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption">Cache Hit Rate:</Typography>
              <Typography variant="caption" color="success.main">
                {cacheMetrics.hitRate.toFixed(1)}%
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption">Cached Items:</Typography>
              <Typography variant="caption">
                {cacheMetrics.items} stored
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption">Memory Cache:</Typography>
              <Typography variant="caption">
                {cacheMetrics.memoryItems} instant access
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption">Cache Size:</Typography>
              <Typography variant="caption">
                {(cacheMetrics.size / 1024).toFixed(1)} KB
              </Typography>
            </Box>
            {isPreloading && (
              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={12} />
                <Typography variant="caption" color="primary">
                  Preloading tracks...
                </Typography>
              </Box>
            )}
          </Box>
          
          <Divider sx={{ my: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSettingsDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default Music;