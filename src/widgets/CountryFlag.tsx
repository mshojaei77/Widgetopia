import React, { useState, useEffect } from 'react';
import { Paper, Typography, Box } from '@mui/material';

const CountryFlag: React.FC = () => {
  const [countryCode, setCountryCode] = useState<string>('us'); // Default to 'us' for instant display
  const [countryName, setCountryName] = useState<string>('United States'); // Default name

  useEffect(() => {
    // Fetch country data in background without blocking UI
    const fetchCountryData = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        if (data.country_code) {
          setCountryCode(data.country_code.toLowerCase());
          setCountryName(data.country_name || 'Unknown');
        }
      } catch (error) {
        console.warn('Failed to fetch country data:', error);
        // Keep default values
      }
    };

    fetchCountryData();
  }, []);

  const getFlagEmoji = (code: string) => {
    const codePoints = code
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  return (
    <Paper 
      elevation={0} 
      className="glass glass-frosted glass-premium" 
      sx={{ 
        p: 2, 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-lg)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        flex: 1,
        flexDirection: 'column'
      }}>
        <Typography variant="h1" sx={{ 
          fontSize: { xs: '3rem', sm: '4rem', md: '5rem' }, 
          textShadow: '0 2px 8px rgba(0,0,0,0.3)',
          mb: 1
        }}>
          {getFlagEmoji(countryCode)}
        </Typography>
        <Typography variant="body2" sx={{ 
          textAlign: 'center', 
          opacity: 0.8,
          textShadow: '0 1px 3px rgba(0,0,0,0.2)',
          fontWeight: 500
        }}>
          {countryName}
        </Typography>
      </Box>
    </Paper>
  );
};

export default CountryFlag; 