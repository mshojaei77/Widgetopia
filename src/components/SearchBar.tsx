import React, { useState } from 'react';
import { Paper, InputBase, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { motion } from 'framer-motion';

const SearchBar: React.FC = () => {
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const query = (event.target as HTMLFormElement).query.value;
    if (query) {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
      className="search-bar"
    >
      <Paper
        component="form"
        onSubmit={handleSearch}
        className={`glass ${isFocused ? 'focused' : ''}`}
        sx={{
          p: '6px 16px',
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          maxWidth: '600px',
          mb: 3,
          borderRadius: '30px',
          transition: 'all 0.3s ease',
          border: isFocused 
            ? '1px solid rgba(138, 180, 248, 0.5)' 
            : '1px solid var(--glass-border)',
          boxShadow: isFocused 
            ? '0 0 20px rgba(138, 180, 248, 0.4)' 
            : 'var(--shadow-md)',
          '&:hover': {
            boxShadow: isFocused 
              ? '0 0 25px rgba(138, 180, 248, 0.5)' 
              : '0 5px 15px rgba(0, 0, 0, 0.2)',
          }
        }}
      >
        <IconButton 
          sx={{ 
            p: '10px', 
            color: isFocused ? 'var(--primary-color)' : 'var(--text-light)',
            transition: 'all 0.3s ease',
          }} 
          aria-label="search"
        >
          <SearchIcon />
        </IconButton>
        <InputBase
          name="query"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          sx={{ 
            ml: 1.5, 
            flex: 1, 
            color: 'var(--text-light)',
            fontSize: '1rem',
            fontWeight: isFocused ? 400 : 300,
            letterSpacing: '0.2px',
            backgroundColor: 'transparent !important',
            transition: 'all 0.3s ease',
            '& input::placeholder': {
              color: isFocused ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.7)',
              opacity: 1,
              transition: 'all 0.3s ease',
            },
          }}
          placeholder="Search Google..."
          inputProps={{ 'aria-label': 'search google' }}
        />
      </Paper>
    </motion.div>
  );
};

export default SearchBar; 