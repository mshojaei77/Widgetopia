import React, { useState, useEffect, useMemo } from 'react';
import { CircularProgress, TextField, InputAdornment } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import SearchIcon from '@mui/icons-material/Search';
import { motion } from 'framer-motion';
import debounce from 'lodash.debounce';

const SearchBar: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Mock data for development environment
  const getMockSuggestions = (query: string): string[] => {
    const mockData = [
      'github',
      'google',
      'gmail',
      'google drive',
      'google maps',
      'google translate',
      'youtube',
      'youtube music',
      'react',
      'react hooks',
      'react tutorial',
      'javascript',
      'javascript tutorial',
      'typescript',
      'node.js',
      'npm',
      'vscode',
      'stackoverflow',
      'mdn web docs',
      'chatgpt',
      'openai',
      'artificial intelligence',
      'machine learning',
      'web development',
      'frontend development',
      'backend development',
      'css',
      'html',
      'bootstrap',
      'tailwind css',
      'material ui',
      'redux',
      'next.js',
      'vue.js',
      'angular',
      'python',
      'django',
      'flask',
      'express.js',
      'mongodb',
      'postgresql',
      'mysql',
      'docker',
      'kubernetes',
      'aws',
      'azure',
      'google cloud',
      'firebase',
      'netlify',
      'vercel'
    ];
    
    return mockData
      .filter(item => item.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 8);
  };

  const fetchGoogleSuggestions = async (query: string): Promise<string[]> => {
    try {
      // In development, use mock data
      if (process.env.NODE_ENV === 'development' || window.location.protocol === 'http:') {
        return getMockSuggestions(query);
      }
      
      // For production/extension environment, try direct API call
      const res = await fetch(
        `https://suggestqueries.google.com/complete/search?client=firefox&hl=en&q=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      return data[1] || [];
    } catch (error) {
      console.warn('Google suggestions failed, using mock data:', error);
      return getMockSuggestions(query);
    }
  };

  const fetchHistorySuggestions = async (query: string): Promise<string[]> => {
    try {
      if (typeof chrome !== 'undefined' && chrome.history) {
        return new Promise(resolve => {
          chrome.history.search({ text: query, maxResults: 5 }, results => {
            resolve(results.map(item => item.title || item.url).filter(Boolean));
          });
        });
      }
    } catch (error) {
      console.warn('History suggestions failed:', error);
    }
    
    // Mock history data for development
    if (process.env.NODE_ENV === 'development' || window.location.protocol === 'http:') {
      const mockHistory = [
        'GitHub - Where the world builds software',
        'Stack Overflow - Where Developers Learn',
        'MDN Web Docs',
        'React – A JavaScript library',
        'YouTube',
        'Google',
        'ChatGPT',
        'Reddit - Dive into anything'
      ];
      return mockHistory.filter(item => 
        item.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 3);
    }
    
    return [];
  };

  const fetchBookmarksSuggestions = async (query: string): Promise<string[]> => {
    try {
      if (typeof chrome !== 'undefined' && chrome.bookmarks) {
        return new Promise(resolve => {
          chrome.bookmarks.search(query, results => {
            resolve(results.map(item => item.title || item.url).filter(Boolean));
          });
        });
      }
    } catch (error) {
      console.warn('Bookmarks suggestions failed:', error);
    }
    
    // Mock bookmarks data for development
    if (process.env.NODE_ENV === 'development' || window.location.protocol === 'http:') {
      const mockBookmarks = [
        'React Documentation',
        'TypeScript Handbook',
        'Material-UI Components',
        'VS Code Extensions',
        'GitHub Repositories',
        'Stack Overflow Questions'
      ];
      return mockBookmarks.filter(item => 
        item.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 3);
    }
    
    return [];
  };

  const updateOptions = async (value: string) => {
    if (!value || value.length < 2) {
      setOptions([]);
      return;
    }
    
    setLoading(true);
    
    try {
      const [google, history, bookmarks] = await Promise.all([
        fetchGoogleSuggestions(value),
        fetchHistorySuggestions(value),
        fetchBookmarksSuggestions(value),
      ]);
      
      // Merge and deduplicate suggestions
      const allSuggestions = [...google, ...history, ...bookmarks];
      const uniqueSuggestions = Array.from(new Set(allSuggestions))
        .filter(suggestion => suggestion && suggestion.trim().length > 0)
        .slice(0, 10); // Limit to 10 suggestions
      
      setOptions(uniqueSuggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      // Fallback to mock suggestions
      setOptions(getMockSuggestions(value));
    } finally {
      setLoading(false);
    }
  };

  const debouncedUpdate = useMemo(() => debounce(updateOptions, 300), []);

  useEffect(() => {
    debouncedUpdate(inputValue);
    return () => {
      debouncedUpdate.cancel();
    };
  }, [inputValue, debouncedUpdate]);

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (inputValue.trim()) {
        window.open(
          `https://www.google.com/search?q=${encodeURIComponent(inputValue)}`,
          '_blank',
          'noopener,noreferrer'
        );
      }
    }
  };

  return (
    <motion.div
      onKeyPress={handleKeyPress}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
      style={{ width: '100%', maxWidth: 600, marginBottom: 24 }}
    >
      <Autocomplete
        freeSolo
        options={options}
        inputValue={inputValue}
        onInputChange={(e, value) => setInputValue(value)}
        onOpen={() => setIsFocused(true)}
        onClose={() => setIsFocused(false)}
        onChange={(event, value) => {
          if (value) {
            window.open(
              `https://www.google.com/search?q=${encodeURIComponent(value)}`,
              '_blank',
              'noopener,noreferrer'
            );
          }
        }}
        loading={loading}
        loadingText="Searching..."
        noOptionsText="No suggestions found"
        renderInput={params => (
          <TextField
            {...params}
            placeholder="Search Google..."
            variant="standard"
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <>
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'white', opacity: 0.7 }} />
                  </InputAdornment>
                  {params.InputProps.startAdornment}
                </>
              ),
              endAdornment: (
                <>
                  {loading && <CircularProgress color="inherit" size={20} sx={{ mr: 1 }} />}
                  {params.InputProps.endAdornment}
                </>
              ),
              disableUnderline: true,
              sx: {
                color: 'white',
                fontSize: '1rem',
              },
            }}
            sx={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: '30px',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              '& .MuiInputBase-root': {
                p: '6px 16px',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.3s ease',
                boxShadow: isFocused
                  ? '0 0 20px rgba(138, 180, 248, 0.4)'
                  : '0 2px 8px rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  boxShadow: isFocused
                    ? '0 0 25px rgba(138, 180, 248, 0.5)'
                    : '0 5px 15px rgba(0, 0, 0, 0.2)',
                },
                '& input::placeholder': {
                  color: isFocused ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.7)',
                },
              },
            }}
          />
        )}
        sx={{
          '& .MuiAutocomplete-popper': {
            '& .MuiPaper-root': {
              backgroundColor: 'rgba(15, 15, 20, 0.9)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              color: 'white',
              '& .MuiAutocomplete-option': {
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
                '&[aria-selected="true"]': {
                  backgroundColor: 'rgba(138, 180, 248, 0.2)',
                },
              },
            },
          },
        }}
      />
    </motion.div>
  );
};

export default SearchBar; 