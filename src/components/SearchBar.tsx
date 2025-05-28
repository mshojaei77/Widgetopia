import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, List, ListItem, ListItemText, Paper, IconButton, Tooltip, Avatar, Chip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import HistoryIcon from '@mui/icons-material/History';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import debounce from 'lodash.debounce';

interface HistoryItem {
  id: string;
  url: string;
  title: string;
  visitCount: number;
  lastVisitTime: number;
  typedCount?: number;
}

interface BookmarkItem {
  id: string;
  url: string;
  title: string;
  dateAdded?: number;
}

interface SearchSuggestion {
  id: string;
  title: string;
  url: string;
  type: 'history' | 'bookmark';
  visitCount?: number;
  score: number;
}

interface SearchBarProps {
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder = "Search the web..." }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Get mock data for development environment
  const getMockHistoryData = (): HistoryItem[] => {
    return [
      {
        id: '1',
        url: 'https://github.com',
        title: 'GitHub: Let\'s build from here',
        visitCount: 45,
        lastVisitTime: Date.now() - 2 * 60 * 60 * 1000,
        typedCount: 12
      },
      {
        id: '2',
        url: 'https://stackoverflow.com',
        title: 'Stack Overflow - Where Developers Learn, Share, & Build Careers',
        visitCount: 38,
        lastVisitTime: Date.now() - 4 * 60 * 60 * 1000,
        typedCount: 8
      },
      {
        id: '3',
        url: 'https://developer.mozilla.org',
        title: 'MDN Web Docs',
        visitCount: 32,
        lastVisitTime: Date.now() - 6 * 60 * 60 * 1000,
        typedCount: 15
      },
      {
        id: '4',
        url: 'https://react.dev',
        title: 'React – The library for web and native user interfaces',
        visitCount: 28,
        lastVisitTime: Date.now() - 8 * 60 * 60 * 1000,
        typedCount: 6
      },
      {
        id: '5',
        url: 'https://www.youtube.com',
        title: 'YouTube',
        visitCount: 25,
        lastVisitTime: Date.now() - 12 * 60 * 60 * 1000,
        typedCount: 3
      }
    ];
  };

  const getMockBookmarkData = (): BookmarkItem[] => {
    return [
      {
        id: 'b1',
        url: 'https://www.typescriptlang.org',
        title: 'TypeScript: JavaScript With Syntax For Types',
        dateAdded: Date.now() - 7 * 24 * 60 * 60 * 1000
      },
      {
        id: 'b2',
        url: 'https://vitejs.dev',
        title: 'Vite | Next Generation Frontend Tooling',
        dateAdded: Date.now() - 14 * 24 * 60 * 60 * 1000
      },
      {
        id: 'b3',
        url: 'https://mui.com',
        title: 'MUI: The React component library you always wanted',
        dateAdded: Date.now() - 21 * 24 * 60 * 60 * 1000
      },
      {
        id: 'b4',
        url: 'https://developer.chrome.com/docs/extensions',
        title: 'Chrome Extensions - Chrome for Developers',
        dateAdded: Date.now() - 30 * 24 * 60 * 60 * 1000
      }
    ];
  };

  // Search browser history
  const searchHistory = async (searchQuery: string): Promise<HistoryItem[]> => {
    try {
      if (typeof chrome === 'undefined' || !chrome.history) {
        // Development environment fallback
        if (process.env.NODE_ENV === 'development' || window.location.protocol === 'http:') {
          const mockData = getMockHistoryData();
          return mockData.filter(item => 
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.url.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        return [];
      }

      const results = await chrome.history.search({
        text: searchQuery,
        maxResults: 20,
        startTime: Date.now() - 30 * 24 * 60 * 60 * 1000 // Last 30 days
      });

      return results
        .filter(item => item.title && item.url && item.visitCount && item.visitCount > 1)
        .filter(item => {
          const url = item.url || '';
          return !url.startsWith('chrome://') && 
                 !url.startsWith('chrome-extension://') &&
                 !url.startsWith('edge://') &&
                 !url.startsWith('about:') &&
                 !url.includes('newtab');
        })
        .map(item => ({
          id: item.id || '',
          url: item.url || '',
          title: item.title || 'Untitled',
          visitCount: item.visitCount || 0,
          lastVisitTime: item.lastVisitTime || 0,
          typedCount: item.typedCount || 0
        }));
    } catch (error) {
      console.error('Error searching history:', error);
      return [];
    }
  };

  // Search bookmarks
  const searchBookmarks = async (searchQuery: string): Promise<BookmarkItem[]> => {
    try {
      if (typeof chrome === 'undefined' || !chrome.bookmarks) {
        // Development environment fallback
        if (process.env.NODE_ENV === 'development' || window.location.protocol === 'http:') {
          const mockData = getMockBookmarkData();
          return mockData.filter(item => 
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.url.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        return [];
      }

      const results = await chrome.bookmarks.search(searchQuery);
      
      return results
        .filter(item => item.url && item.title) // Only bookmarks with URLs (not folders)
        .map(item => ({
          id: item.id,
          url: item.url || '',
          title: item.title,
          dateAdded: item.dateAdded
        }));
    } catch (error) {
      console.error('Error searching bookmarks:', error);
      return [];
    }
  };

  // Calculate relevance score for suggestions
  const calculateScore = (item: HistoryItem | BookmarkItem, query: string, type: 'history' | 'bookmark'): number => {
    const titleMatch = item.title.toLowerCase().includes(query.toLowerCase());
    const urlMatch = item.url.toLowerCase().includes(query.toLowerCase());
    
    let score = 0;
    
    // Base score for matches
    if (titleMatch) score += 10;
    if (urlMatch) score += 5;
    
    // Boost for exact matches
    if (item.title.toLowerCase() === query.toLowerCase()) score += 20;
    if (item.url.toLowerCase().includes(query.toLowerCase())) score += 3;
    
    // Type-specific scoring
    if (type === 'history') {
      const historyItem = item as HistoryItem;
      score += Math.min(historyItem.visitCount * 0.1, 5); // Visit count bonus (max 5)
      score += Math.min((historyItem.typedCount || 0) * 0.5, 3); // Typed count bonus (max 3)
      
      // Recency bonus
      const daysSinceVisit = (Date.now() - historyItem.lastVisitTime) / (1000 * 60 * 60 * 24);
      if (daysSinceVisit < 1) score += 3;
      else if (daysSinceVisit < 7) score += 2;
      else if (daysSinceVisit < 30) score += 1;
    } else {
      // Bookmarks get a slight boost as they're intentionally saved
      score += 2;
    }
    
    return score;
  };

  // Debounced search function
  const debouncedSearch = debounce(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const [historyResults, bookmarkResults] = await Promise.all([
        searchHistory(searchQuery),
        searchBookmarks(searchQuery)
      ]);

      // Convert to suggestions with scores
      const historySuggestions: SearchSuggestion[] = historyResults.map(item => ({
        id: `h_${item.id}`,
        title: item.title,
        url: item.url,
        type: 'history' as const,
        visitCount: item.visitCount,
        score: calculateScore(item, searchQuery, 'history')
      }));

      const bookmarkSuggestions: SearchSuggestion[] = bookmarkResults.map(item => ({
        id: `b_${item.id}`,
        title: item.title,
        url: item.url,
        type: 'bookmark' as const,
        score: calculateScore(item, searchQuery, 'bookmark')
      }));

      // Combine and sort by score
      const allSuggestions = [...historySuggestions, ...bookmarkSuggestions]
        .sort((a, b) => b.score - a.score)
        .slice(0, 8); // Limit to top 8 suggestions

      setSuggestions(allSuggestions);
    } catch (error) {
      console.error('Search error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, 300);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);
    
    if (value.trim()) {
      setShowSuggestions(true);
      debouncedSearch(value);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
      setIsLoading(false);
    }
  };

  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (finalQuery.trim()) {
      // Open search in new tab
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(finalQuery)}`;
      window.open(searchUrl, '_blank');
      setQuery('');
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    } else if (event.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    // Navigate directly to the URL instead of searching
    window.open(suggestion.url, '_blank');
    setQuery('');
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleClear = () => {
    setQuery('');
    setShowSuggestions(false);
    setSuggestions([]);
    setIsLoading(false);
  };

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return null;
    }
  };

  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <Box 
      ref={searchRef}
      sx={{ 
        position: 'relative', 
        width: '100%', 
        maxWidth: 600, 
        margin: '0 auto 2rem auto',
        zIndex: 10
      }}
    >
      <TextField
        fullWidth
        value={query}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        variant="outlined"
        size="medium"
        InputProps={{
          startAdornment: (
            <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.7)', mr: 1 }} />
          ),
          endAdornment: query && (
            <Tooltip title="Clear search">
              <IconButton onClick={handleClear} size="small">
                <ClearIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
              </IconButton>
            </Tooltip>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(30, 30, 40, 0.8)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderRadius: '25px',
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.2)',
              transition: 'all 0.3s ease',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.4)',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'var(--primary-color)',
              boxShadow: '0 0 0 2px rgba(138, 180, 248, 0.2)'
            },
          },
          '& .MuiInputBase-input': {
            color: 'white',
            padding: '12px 0',
            fontSize: '1.1rem',
            '&::placeholder': {
              color: 'rgba(255, 255, 255, 0.6)',
              opacity: 1,
            }
          }
        }}
      />

      {/* Search Suggestions */}
      {showSuggestions && (suggestions.length > 0 || isLoading) && (
        <Paper
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            mt: 1,
            backgroundColor: 'rgba(30, 30, 40, 0.95)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            overflow: 'hidden',
            zIndex: 1000,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          }}
        >
          <List dense>
            {isLoading ? (
              <ListItem>
                <ListItemText 
                  primary="Searching history and bookmarks..." 
                  primaryTypographyProps={{
                    sx: { color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }
                  }}
                />
              </ListItem>
            ) : (
              suggestions.map((suggestion) => (
                <ListItem
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(138, 180, 248, 0.1)',
                    },
                    transition: 'background-color 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    py: 1
                  }}
                >
                  {/* Favicon */}
                  <Avatar
                    src={getFaviconUrl(suggestion.url) || undefined}
                    sx={{
                      width: 20,
                      height: 20,
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      fontSize: '0.6rem'
                    }}
                  >
                    {getDomainFromUrl(suggestion.url).charAt(0).toUpperCase()}
                  </Avatar>

                  {/* Content */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <ListItemText
                        primary={suggestion.title}
                        primaryTypographyProps={{
                          sx: { 
                            color: 'rgba(255, 255, 255, 0.9)', 
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }
                        }}
                      />
                      
                      {/* Type indicator */}
                      <Chip
                        icon={suggestion.type === 'history' ? <HistoryIcon /> : <BookmarkIcon />}
                        label={suggestion.type}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: '0.6rem',
                          bgcolor: suggestion.type === 'history' 
                            ? 'rgba(33, 150, 243, 0.2)' 
                            : 'rgba(255, 193, 7, 0.2)',
                          color: suggestion.type === 'history' 
                            ? 'rgba(33, 150, 243, 1)' 
                            : 'rgba(255, 193, 7, 1)',
                          '& .MuiChip-icon': { fontSize: 10 }
                        }}
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ListItemText
                        primary={getDomainFromUrl(suggestion.url)}
                        primaryTypographyProps={{
                          sx: { 
                            color: 'rgba(255, 255, 255, 0.6)', 
                            fontSize: '0.75rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }
                        }}
                      />
                      
                      {suggestion.visitCount && suggestion.visitCount > 1 && (
                        <Chip
                          icon={<TrendingUpIcon />}
                          label={`${suggestion.visitCount} visits`}
                          size="small"
                          sx={{
                            height: 16,
                            fontSize: '0.6rem',
                            bgcolor: 'rgba(76, 175, 80, 0.2)',
                            color: 'rgba(76, 175, 80, 1)',
                            '& .MuiChip-icon': { fontSize: 8 }
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                </ListItem>
              ))
            )}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default SearchBar; 