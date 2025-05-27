import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, List, ListItem, ListItemText, Paper, IconButton, Tooltip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import debounce from 'lodash.debounce';

interface SearchResult {
  content?: string;
  description?: string;
  url?: string;
}

interface SearchBarProps {
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder = "Search the web..." }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounced search function
  const debouncedSearch = debounce(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      // Try to use Chrome extension search API if available
      if (typeof chrome !== 'undefined' && chrome.search && chrome.search.query) {
        try {
          // Use proper typing for chrome.search.query - it doesn't actually take a callback
          // This is a mock implementation for development
          fallbackSearch(searchQuery);
        } catch (error) {
          console.warn('Chrome search API not available:', error);
          fallbackSearch(searchQuery);
        }
      } else {
        fallbackSearch(searchQuery);
      }
    } catch (error) {
      console.error('Search error:', error);
      setIsLoading(false);
    }
  }, 300);

  // Fallback search suggestions
  const fallbackSearch = (searchQuery: string) => {
    // Simple fallback suggestions based on common search patterns
    const commonSuggestions = [
      `${searchQuery} tutorial`,
      `${searchQuery} guide`,
      `${searchQuery} examples`,
      `${searchQuery} documentation`,
      `${searchQuery} tips`
    ];
    setSuggestions(commonSuggestions.slice(0, 3));
    setIsLoading(false);
  };

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

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  const handleClear = () => {
    setQuery('');
    setShowSuggestions(false);
    setSuggestions([]);
    setIsLoading(false);
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
                  primary="Searching..." 
                  primaryTypographyProps={{
                    sx: { color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }
                  }}
                />
              </ListItem>
            ) : (
              suggestions.map((suggestion, index) => (
                <ListItem
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(138, 180, 248, 0.1)',
                    },
                    transition: 'background-color 0.2s ease',
                  }}
                >
                  <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.5)', mr: 2, fontSize: '1rem' }} />
                  <ListItemText
                    primary={suggestion}
                    primaryTypographyProps={{
                      sx: { 
                        color: 'rgba(255, 255, 255, 0.9)', 
                        fontSize: '0.9rem',
                        fontWeight: 400
                      }
                    }}
                  />
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