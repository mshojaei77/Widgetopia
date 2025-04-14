import React, { useState } from 'react';
import { Box, TextField, InputAdornment, IconButton, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const Search: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
      window.open(searchUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSearch}
      elevation={0}
      className="glass"
      sx={{
        p: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        mb: 3,
        borderRadius: '28px',
        backdropFilter: 'blur(var(--blur-amount))',
        border: '1px solid var(--glass-border)',
      }}
    >
      <TextField
        fullWidth
        variant="standard"
        placeholder="Search Google..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          disableUnderline: true,
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: 'white', opacity: 0.7, mr: 1 }} />
            </InputAdornment>
          ),
          sx: {
            color: 'white',
            fontSize: '1rem',
          }
        }}
        sx={{
          '& .MuiInputBase-root': {
            padding: 0,
          },
          '& .MuiInputBase-input::placeholder': {
            color: 'rgba(255, 255, 255, 0.7)',
            opacity: 1,
          },
          '& .MuiInputBase-input': {
            color: 'white',
          }
        }}
      />
    </Paper>
  );
};

export default Search; 