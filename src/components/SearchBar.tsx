import React, { useState, useEffect, useMemo } from 'react';
import { CircularProgress, TextField, InputAdornment } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import SearchIcon from '@mui/icons-material/Search';
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

  // Check if we're in a Chrome extension environment
  const isExtensionEnvironment = () => {
    return typeof chrome !== 'undefined' && chrome.search;
  };

  // Get search suggestions from Chrome API or mock data
  const getSearchSuggestions = async (query: string): Promise<string[]> => {
    if (!query.trim()) return [];

    try {
      if (isExtensionEnvironment()) {
        // Use Chrome's search suggestion API if available
        return new Promise((resolve) => {
          chrome.search.query({ text: query }, (results) => {
            if (chrome.runtime.lastError) {
              console.warn('Chrome search API error:', chrome.runtime.lastError);
              resolve(getMockSuggestions(query));
            } else {
              const suggestions = results?.map(result => result.content || result.description || '') || [];
              resolve(suggestions.slice(0, 8));
            }
          });
        });
      } else {
        // Fallback to mock data for development
        return getMockSuggestions(query);
      }
    } catch (error) {
      console.warn('Error getting search suggestions:', error);
      return getMockSuggestions(query);
    }
  };

  const updateOptions = async (query: string) => {
    if (!query.trim()) {
      setOptions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const suggestions = await getSearchSuggestions(query);
      setOptions(suggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setOptions([]);
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
    <div
      onKeyPress={handleKeyPress}
      style={{ width: '100%', maxWidth: 600, marginBottom: 24 }}
    >
      <Autocomplete
        freeSolo
        options={options}
        loading={loading}
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Search the web..."
            variant="outlined"
            fullWidth
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
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
    </div>
  );
};

export default SearchBar; 