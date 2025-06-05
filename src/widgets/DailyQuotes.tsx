import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Paper, 
  Box, 
  Typography, 
  IconButton, 
  Button,
  Tooltip,
  Menu,
  MenuItem,
  FormControl,
  Select,
  Skeleton,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Slider,
  CircularProgress
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import {
  Refresh,
  FormatQuote,
  Settings,
  Favorite,
  FavoriteBorder,
  Share,
  BookmarkAdd,
  BookmarkAdded,
  AutoAwesome,
  TrendingUp,
  Person,
  Schedule,
  FilterList,
  ArrowBackIosNew,
  ArrowForwardIos
} from '@mui/icons-material';
import { CacheAnalytics } from '../utils/CacheAnalytics';

// Real Inspire API Configuration
const API_BASE_URL = 'https://api.realinspire.live/v1';

// Quote data interfaces
interface Quote {
  content: string;
  author: string;
  authorSlug: string;
  length: number;
  id?: string; // For local management
}

interface Author {
  name: string;
  slug: string;
  description: string;
  bio: string;
  quoteCount: number;
}

interface QuoteSettings {
  minLength: number;
  maxLength: number;
  preferredAuthors: string[];
  autoRefresh: boolean;
  refreshInterval: number; // in hours
  showAuthorInfo: boolean;
  animationEnabled: boolean;
}

// Quote cache with expiration and smart caching
class QuoteCache {
  private static readonly CACHE_KEY = 'daily_quotes_cache_v2';
  private static readonly SETTINGS_KEY = 'daily_quotes_settings_v2';
  private static readonly FAVORITES_KEY = 'daily_quotes_favorites_v2';
  private static readonly CACHE_EXPIRY = 2 * 60 * 60 * 1000; // 2 hours
  private static readonly MAX_CACHE_SIZE = 100;

  static async get(cacheKey: string): Promise<Quote[] | null> {
    try {
      const cache = localStorage.getItem(this.CACHE_KEY);
      if (!cache) return null;

      const cacheData = JSON.parse(cache);
      const item = cacheData[cacheKey];
      
      if (!item) return null;
      
      // Check if cache is expired
      if (Date.now() - item.timestamp > this.CACHE_EXPIRY) {
        this.remove(cacheKey);
        return null;
      }
      
      // Update access time for LRU
      item.lastAccessed = Date.now();
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
      
      return item.data;
    } catch (error) {
      console.warn('Error reading quote cache:', error);
      return null;
    }
  }

  static async set(cacheKey: string, data: Quote[]): Promise<void> {
    try {
      const cache = localStorage.getItem(this.CACHE_KEY);
      const cacheData = cache ? JSON.parse(cache) : {};
      
      // Implement LRU eviction
      const cacheKeys = Object.keys(cacheData);
      if (cacheKeys.length >= this.MAX_CACHE_SIZE) {
        const sortedKeys = cacheKeys
          .map(key => ({ key, lastAccessed: cacheData[key].lastAccessed || 0 }))
          .sort((a, b) => a.lastAccessed - b.lastAccessed);
        
        // Remove oldest 20% of entries
        const toRemove = Math.ceil(this.MAX_CACHE_SIZE * 0.2);
        for (let i = 0; i < toRemove; i++) {
          delete cacheData[sortedKeys[i].key];
        }
      }
      
      cacheData[cacheKey] = {
        data,
        timestamp: Date.now(),
        lastAccessed: Date.now()
      };
      
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Error writing to quote cache:', error);
    }
  }

  static remove(cacheKey: string): void {
    try {
      const cache = localStorage.getItem(this.CACHE_KEY);
      if (!cache) return;

      const cacheData = JSON.parse(cache);
      delete cacheData[cacheKey];
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Error removing from quote cache:', error);
    }
  }

  static getSettings(): QuoteSettings {
    try {
      const settings = localStorage.getItem(this.SETTINGS_KEY);
      if (settings) {
        return JSON.parse(settings);
      }
    } catch (error) {
      console.warn('Error reading quote settings:', error);
    }
    
    // Default settings
    return {
      minLength: 50,
      maxLength: 300,
      preferredAuthors: [],
      autoRefresh: true,
      refreshInterval: 24, // 24 hours
      showAuthorInfo: true,
      animationEnabled: true
    };
  }

  static setSettings(settings: QuoteSettings): void {
    try {
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn('Error saving quote settings:', error);
    }
  }

  static getFavorites(): Quote[] {
    try {
      const favorites = localStorage.getItem(this.FAVORITES_KEY);
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.warn('Error reading favorites:', error);
      return [];
    }
  }

  static setFavorites(favorites: Quote[]): void {
    try {
      localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.warn('Error saving favorites:', error);
    }
  }

  static clear(): void {
    try {
      localStorage.removeItem(this.CACHE_KEY);
      localStorage.removeItem(this.SETTINGS_KEY);
      localStorage.removeItem(this.FAVORITES_KEY);
    } catch (error) {
      console.warn('Error clearing quote cache:', error);
    }
  }
}

// Quote API service
class QuoteAPIService {
  static async fetchRandomQuotes(
    limit: number = 1, 
    minLength?: number, 
    maxLength?: number, 
    author?: string
  ): Promise<Quote[]> {
    const params = new URLSearchParams({
      limit: limit.toString()
    });
    
    if (minLength) params.append('minLength', minLength.toString());
    if (maxLength) params.append('maxLength', maxLength.toString());
    if (author) params.append('author', author);
    
    const response = await fetch(`${API_BASE_URL}/quotes/random?${params}`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  }

  static async fetchAuthors(limit: number = 20, sortBy: string = 'quoteCount:desc'): Promise<Author[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      sortBy: sortBy
    });
    
    const response = await fetch(`${API_BASE_URL}/authors?${params}`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.results || [];
  }

  static async fetchQuotesByAuthor(author: string, limit: number = 10): Promise<Quote[]> {
    const params = new URLSearchParams({
      author: author,
      limit: limit.toString()
    });
    
    const response = await fetch(`${API_BASE_URL}/quotes?${params}`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.results || [];
  }
}

const DailyQuotes: React.FC = () => {
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<QuoteSettings>(() => QuoteCache.getSettings());
  const [favorites, setFavorites] = useState<Quote[]>(() => QuoteCache.getFavorites());
  const [authors, setAuthors] = useState<Author[]>([]);
  const [openSettingsDialog, setOpenSettingsDialog] = useState<boolean>(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [showAuthorBio, setShowAuthorBio] = useState<boolean>(false);
  const [currentAuthorInfo, setCurrentAuthorInfo] = useState<Author | null>(null);
  const [quotesPool, setQuotesPool] = useState<Quote[]>([]);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState<number>(0);
  
  // Auto-refresh timer
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastRefreshRef = useRef<number>(Date.now());

  // Build cache key based on current settings
  const buildCacheKey = useCallback((settings: QuoteSettings): string => {
    const key = `quotes_${settings.minLength}_${settings.maxLength}_${settings.preferredAuthors.join(',')}_v2`;
    return key.substring(0, 50); // Limit key length
  }, []);

  // Fetch quotes with caching
  const fetchQuotes = useCallback(async (forceRefresh: boolean = false): Promise<void> => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const cacheKey = buildCacheKey(settings);
      
      // Check cache first unless force refresh
      if (!forceRefresh) {
        const cachedQuotes = await QuoteCache.get(cacheKey);
        if (cachedQuotes && cachedQuotes.length > 0) {
          setQuotesPool(cachedQuotes);
          setCurrentQuote(cachedQuotes[0]);
          setCurrentQuoteIndex(0);
          CacheAnalytics.trackCacheHit('daily_quotes', 'api');
          setIsLoading(false);
          return;
        }
      }
      
      CacheAnalytics.trackCacheMiss('daily_quotes', 'api');
      
      // Fetch fresh quotes
      let allQuotes: Quote[] = [];
      
      if (settings.preferredAuthors.length > 0) {
        // Fetch quotes from preferred authors
        for (const authorSlug of settings.preferredAuthors) {
          try {
            const authorQuotes = await QuoteAPIService.fetchQuotesByAuthor(authorSlug, 5);
            allQuotes.push(...authorQuotes);
          } catch (error) {
            console.warn(`Failed to fetch quotes for author ${authorSlug}:`, error);
          }
        }
      }
      
      // Fill remaining slots with random quotes
      const remainingSlots = Math.max(0, 20 - allQuotes.length);
      if (remainingSlots > 0) {
        const randomQuotes = await QuoteAPIService.fetchRandomQuotes(
          remainingSlots,
          settings.minLength,
          settings.maxLength
        );
        allQuotes.push(...randomQuotes);
      }
      
      // If no quotes from preferred authors, get all random
      if (allQuotes.length === 0) {
        allQuotes = await QuoteAPIService.fetchRandomQuotes(
          20,
          settings.minLength,
          settings.maxLength
        );
      }
      
      // Shuffle quotes for variety
      const shuffledQuotes = allQuotes.sort(() => Math.random() - 0.5);
      
      // Add unique IDs for local management
      const quotesWithIds = shuffledQuotes.map((quote, index) => ({
        ...quote,
        id: `${Date.now()}_${index}`
      }));
      
      // Cache the fetched quotes
      await QuoteCache.set(cacheKey, quotesWithIds);
      
      setQuotesPool(quotesWithIds);
      setCurrentQuote(quotesWithIds[0] || null);
      setCurrentQuoteIndex(0);
      lastRefreshRef.current = Date.now();
      
    } catch (error) {
      console.error('Error fetching quotes:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch quotes');
    } finally {
      setIsLoading(false);
    }
  }, [settings, buildCacheKey, isLoading]);

  // Navigate through quotes pool
  const showNextQuote = useCallback(() => {
    if (quotesPool.length === 0) return;
    
    const nextIndex = (currentQuoteIndex + 1) % quotesPool.length;
    setCurrentQuoteIndex(nextIndex);
    setCurrentQuote(quotesPool[nextIndex]);
  }, [quotesPool, currentQuoteIndex]);

  const showPreviousQuote = useCallback(() => {
    if (quotesPool.length === 0) return;
    
    const prevIndex = currentQuoteIndex === 0 ? quotesPool.length - 1 : currentQuoteIndex - 1;
    setCurrentQuoteIndex(prevIndex);
    setCurrentQuote(quotesPool[prevIndex]);
  }, [quotesPool, currentQuoteIndex]);

  // Favorite management
  const toggleFavorite = useCallback((quote: Quote) => {
    const updatedFavorites = favorites.some(fav => 
      fav.content === quote.content && fav.author === quote.author
    ) 
      ? favorites.filter(fav => !(fav.content === quote.content && fav.author === quote.author))
      : [...favorites, quote];
    
    setFavorites(updatedFavorites);
    QuoteCache.setFavorites(updatedFavorites);
  }, [favorites]);

  const isFavorite = useCallback((quote: Quote): boolean => {
    return favorites.some(fav => 
      fav.content === quote.content && fav.author === quote.author
    );
  }, [favorites]);

  // Share quote
  const shareQuote = useCallback(async (quote: Quote) => {
    const shareText = `"${quote.content}" - ${quote.author}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Inspirational Quote',
          text: shareText
        });
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        // Could show a snackbar here
      } catch (error) {
        console.warn('Failed to copy to clipboard:', error);
      }
    }
  }, []);

  // Auto-refresh setup
  useEffect(() => {
    if (settings.autoRefresh && settings.refreshInterval > 0) {
      const interval = settings.refreshInterval * 60 * 60 * 1000; // Convert hours to milliseconds
      
      refreshTimerRef.current = setInterval(() => {
        const timeSinceLastRefresh = Date.now() - lastRefreshRef.current;
        if (timeSinceLastRefresh >= interval) {
          fetchQuotes(true);
        }
      }, 60000); // Check every minute
      
      return () => {
        if (refreshTimerRef.current) {
          clearInterval(refreshTimerRef.current);
        }
      };
    }
  }, [settings.autoRefresh, settings.refreshInterval, fetchQuotes]);

  // Initial load
  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  // Load popular authors for settings
  useEffect(() => {
    const loadAuthors = async () => {
      try {
        const popularAuthors = await QuoteAPIService.fetchAuthors(50);
        setAuthors(popularAuthors);
      } catch (error) {
        console.warn('Failed to load authors:', error);
      }
    };
    
    loadAuthors();
  }, []);

  // Settings handlers
  const handleSettingsChange = useCallback((newSettings: Partial<QuoteSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    QuoteCache.setSettings(updatedSettings);
  }, [settings]);

  const handleApplySettings = useCallback(() => {
    setOpenSettingsDialog(false);
    fetchQuotes(true); // Force refresh with new settings
  }, [fetchQuotes]);

  // Menu handlers
  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  }, []);

  const handleMenuClose = useCallback(() => {
    setMenuAnchorEl(null);
  }, []);

  if (error) {
    return (
      <Paper 
        elevation={0} 
        className="glass glass-neon glass-particles glass-interactive" 
        sx={{ 
          p: 3, 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center'
        }}
      >
        <Typography variant="h6" color="error" gutterBottom>
          Failed to load quotes
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {error}
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => fetchQuotes(true)}
          startIcon={<Refresh />}
        >
          Try Again
        </Button>
      </Paper>
    );
  }

  if (isLoading && !currentQuote) {
    return (
      <Paper 
        elevation={0} 
        className="glass glass-neon glass-particles glass-interactive" 
        sx={{ 
          p: 3, 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" color="primary">
            Daily Quotes
          </Typography>
          <CircularProgress size={20} />
        </Box>
        
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Skeleton variant="text" height={40} />
          <Skeleton variant="text" height={30} />
          <Skeleton variant="text" height={30} width="80%" />
          <Skeleton variant="text" height={20} width="60%" />
        </Box>
      </Paper>
    );
  }

  return (
    <Paper 
      elevation={0} 
      className="glass glass-neon glass-particles glass-interactive" 
      sx={{ 
        p: 2, 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'var(--radius-lg)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 2,
        flexShrink: 0
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FormatQuote color="primary" />
          <Typography variant="h6" color="primary">
            Daily Quotes
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          {isLoading && (
            <CircularProgress size={16} />
          )}
          <Tooltip title="More options">
            <IconButton 
              size="small" 
              onClick={handleMenuOpen}
              sx={{ color: 'text.primary' }}
            >
              <FilterList fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Settings">
            <IconButton 
              size="small" 
              onClick={() => setOpenSettingsDialog(true)}
              sx={{ color: 'text.primary' }}
            >
              <Settings fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Quote Content */}
      {currentQuote && (
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center',
          textAlign: 'center',
          position: 'relative'
        }}>
          <Box sx={{ 
            animation: settings.animationEnabled ? 'fadeIn 0.5s ease-in' : 'none',
            '@keyframes fadeIn': {
              from: { opacity: 0, transform: 'translateY(10px)' },
              to: { opacity: 1, transform: 'translateY(0)' }
            }
          }}>
            <Typography 
              variant="body1" 
              sx={{ 
                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                lineHeight: 1.6,
                fontStyle: 'italic',
                color: 'text.primary',
                mb: 2,
                px: 1
              }}
            >
              "{currentQuote.content}"
            </Typography>
            
            <Typography 
              variant="subtitle2" 
              color="text.secondary"
              sx={{ 
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                fontWeight: 600,
                mb: 1
              }}
            >
              — {currentQuote.author}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Actions */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        gap: 1, 
        flexShrink: 0,
        flexWrap: 'wrap'
      }}>
        {quotesPool.length > 1 && (
          <>
            <Tooltip title="Previous quote">
              <IconButton 
                size="small" 
                onClick={showPreviousQuote}
                sx={{ color: 'text.primary' }}
              >
                <ArrowBackIosNew fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Next quote">
              <IconButton 
                size="small" 
                onClick={showNextQuote}
                sx={{ color: 'text.primary' }}
              >
                <ArrowForwardIos fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        )}
        
        {currentQuote && (
          <>
            <Tooltip title={isFavorite(currentQuote) ? "Remove from favorites" : "Add to favorites"}>
              <IconButton 
                size="small" 
                onClick={() => toggleFavorite(currentQuote)}
                sx={{ color: isFavorite(currentQuote) ? 'error.main' : 'text.primary' }}
              >
                {isFavorite(currentQuote) ? <Favorite fontSize="small" /> : <FavoriteBorder fontSize="small" />}
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Share quote">
              <IconButton 
                size="small" 
                onClick={() => shareQuote(currentQuote)}
                sx={{ color: 'text.primary' }}
              >
                <Share fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>

      {/* Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          className: 'glass glass-menu'
        }}
      >
        <MenuItem onClick={() => {
          // Show random quote
          showNextQuote();
          handleMenuClose();
        }}>
          <AutoAwesome sx={{ mr: 1 }} fontSize="small" />
          Random Quote
        </MenuItem>
        <MenuItem onClick={() => {
          // Show favorites
          if (favorites.length > 0) {
            const randomFavorite = favorites[Math.floor(Math.random() * favorites.length)];
            setCurrentQuote(randomFavorite);
          }
          handleMenuClose();
        }} disabled={favorites.length === 0}>
          <Favorite sx={{ mr: 1 }} fontSize="small" />
          Show Favorite ({favorites.length})
        </MenuItem>
        <MenuItem onClick={() => {
          fetchQuotes(true);
          handleMenuClose();
        }}>
          <TrendingUp sx={{ mr: 1 }} fontSize="small" />
          Fresh Quotes
        </MenuItem>
      </Menu>

      {/* Settings Dialog */}
      <Dialog 
        open={openSettingsDialog} 
        onClose={() => setOpenSettingsDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          className: 'glass glass-dialog'
        }}
      >
        <DialogTitle>Quote Settings</DialogTitle>
        <DialogContent dividers>
          {/* Quote Length */}
          <Typography variant="subtitle2" gutterBottom>
            Quote Length
          </Typography>
          <Box sx={{ px: 2, mb: 3 }}>
            <Typography variant="caption" color="text.secondary">
              Minimum Length: {settings.minLength} characters
            </Typography>
            <Slider
              value={settings.minLength}
              onChange={(_, value) => handleSettingsChange({ minLength: value as number })}
              min={10}
              max={200}
              step={10}
              marks
              valueLabelDisplay="auto"
              sx={{ mb: 2 }}
            />
            <Typography variant="caption" color="text.secondary">
              Maximum Length: {settings.maxLength} characters
            </Typography>
            <Slider
              value={settings.maxLength}
              onChange={(_, value) => handleSettingsChange({ maxLength: value as number })}
              min={100}
              max={500}
              step={25}
              marks
              valueLabelDisplay="auto"
            />
          </Box>

          {/* Preferred Authors */}
          <Typography variant="subtitle2" gutterBottom>
            Preferred Authors ({settings.preferredAuthors.length} selected)
          </Typography>
          <Box sx={{ mb: 3, maxHeight: 200, overflowY: 'auto' }}>
            {authors.map((author) => (
              <FormControlLabel
                key={author.slug}
                control={
                  <Switch
                    size="small"
                    checked={settings.preferredAuthors.includes(author.slug)}
                    onChange={(e) => {
                      const updatedAuthors = e.target.checked
                        ? [...settings.preferredAuthors, author.slug]
                        : settings.preferredAuthors.filter(slug => slug !== author.slug);
                      handleSettingsChange({ preferredAuthors: updatedAuthors });
                    }}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2">{author.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {author.quoteCount} quotes
                    </Typography>
                  </Box>
                }
                sx={{ display: 'block', mb: 1 }}
              />
            ))}
          </Box>

          {/* Auto Refresh */}
          <FormControlLabel
            control={
              <Switch
                checked={settings.autoRefresh}
                onChange={(e) => handleSettingsChange({ autoRefresh: e.target.checked })}
              />
            }
            label="Auto-refresh quotes"
            sx={{ mb: 2 }}
          />

          {settings.autoRefresh && (
            <Box sx={{ px: 2, mb: 3 }}>
              <Typography variant="caption" color="text.secondary">
                Refresh Interval: {settings.refreshInterval} hours
              </Typography>
              <Slider
                value={settings.refreshInterval}
                onChange={(_, value) => handleSettingsChange({ refreshInterval: value as number })}
                min={1}
                max={72}
                step={1}
                marks={[
                  { value: 1, label: '1h' },
                  { value: 12, label: '12h' },
                  { value: 24, label: '24h' },
                  { value: 72, label: '72h' }
                ]}
                valueLabelDisplay="auto"
              />
            </Box>
          )}

          {/* Other Settings */}
          <FormControlLabel
            control={
              <Switch
                checked={settings.showAuthorInfo}
                onChange={(e) => handleSettingsChange({ showAuthorInfo: e.target.checked })}
              />
            }
            label="Show author information"
            sx={{ mb: 1 }}
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={settings.animationEnabled}
                onChange={(e) => handleSettingsChange({ animationEnabled: e.target.checked })}
              />
            }
            label="Enable animations"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSettingsDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleApplySettings} variant="contained">
            Apply Settings
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default DailyQuotes;

// Test section - equivalent to "if __name__ == '__main__':" in Python
if (typeof window !== 'undefined' && window.location.href.includes('test-daily-quotes')) {
  // Test the Daily Quotes widget functionality
  console.log('🧪 Testing Daily Quotes Widget');
  
  // Test QuoteCache functionality
  const testQuote: Quote = {
    content: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    authorSlug: "steve-jobs",
    length: 45,
    id: "test-quote-1"
  };
  
  // Test cache operations
  console.log('📦 Testing cache operations...');
  const testSettings = QuoteCache.getSettings();
  console.log('⚙️ Default settings loaded:', testSettings);
  
  // Test favorites
  const initialFavorites = QuoteCache.getFavorites();
  console.log('❤️ Initial favorites:', initialFavorites.length);
  
  // Test API service (only in development)
  if (process.env.NODE_ENV === 'development') {
    QuoteAPIService.fetchRandomQuotes(1)
      .then(quotes => {
        console.log('🎯 API test successful:', quotes.length, 'quotes fetched');
      })
      .catch(error => {
        console.log('❌ API test failed:', error.message);
      });
  }
  
  console.log('✅ Daily Quotes Widget tests completed');
} 