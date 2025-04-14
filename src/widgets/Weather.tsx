import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import CloudIcon from '@mui/icons-material/Cloud';
import { motion } from 'framer-motion';

// NOTE: You'll need an OpenWeatherMap API key for real data.
// Store it securely, e.g., in environment variables.
const OWM_API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY'; // Replace with your key
const CITY = 'New York'; // Or get from user settings/geolocation
const UNITS = 'imperial'; // Or 'metric'

interface WeatherData {
  temperature: number;
  condition: string;
  location: string;
  iconCode: string; // OpenWeatherMap icon code (e.g., '04d')
}

const Weather: React.FC = () => {
  const [weather, setWeather] = useState({
    temperature: 65,
    condition: 'Partly cloudy',
    location: 'New York, NY',
    icon: 'partly-cloudy'
  });
  const [loading, setLoading] = useState(false);

  // In a real application, you would fetch weather data from an API
  // For now, we'll just use the mock data

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return (
          <motion.div
            animate={{ rotate: [0, 5, 0, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <WbSunnyIcon sx={{ fontSize: 72, color: '#FFD700', filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.7))' }} />
          </motion.div>
        );
      case 'partly cloudy':
      case 'mostly cloudy':
      case 'cloudy':
        return (
          <Box sx={{ position: 'relative' }}>
            <motion.div
              animate={{ rotate: [0, 3, 0, -3, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              style={{ position: 'relative', zIndex: 1 }}
            >
              <WbSunnyIcon sx={{ 
                fontSize: 72, 
                color: '#FFD700', 
                filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.5))'
              }} />
            </motion.div>
            <motion.div
              animate={{ x: [0, 5, 0, -5, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              style={{ position: 'absolute', top: 10, left: 30 }}
            >
              <CloudIcon sx={{ 
                fontSize: 56, 
                color: 'white', 
                opacity: 0.95,
                filter: 'drop-shadow(0 2px 5px rgba(255, 255, 255, 0.3))'
              }} />
            </motion.div>
          </Box>
        );
      default:
        return (
          <motion.div
            animate={{ y: [0, 5, 0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <CloudIcon sx={{ 
              fontSize: 72, 
              color: 'white',
              filter: 'drop-shadow(0 2px 5px rgba(255, 255, 255, 0.3))'
            }} />
          </motion.div>
        );
    }
  };

  return (
    <Paper 
      elevation={0} 
      className="glass" 
      sx={{ 
        p: 3, 
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
      <Typography 
        variant="h5" 
        component="h2" 
        gutterBottom
        sx={{ 
          fontWeight: 600,
          mb: 2.5,
          letterSpacing: '0.5px',
          alignSelf: 'flex-start',
          width: '100%',
        }}
      >
        Weather
      </Typography>
      
      {loading ? (
        <CircularProgress sx={{ my: 4 }} />
      ) : (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          mt: 1
        }}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {getWeatherIcon(weather.condition)}
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Typography variant="h1" sx={{ 
              fontSize: '4.5rem', 
              fontWeight: 500, 
              mt: 2,
              mb: 0.5,
              textShadow: '0 2px 10px rgba(0,0,0,0.4)',
              letterSpacing: '-2px'
            }}>
              {`${weather.temperature}°F`}
            </Typography>
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Typography variant="h6" sx={{ 
              opacity: 0.95, 
              mb: 1,
              fontWeight: 400,
              letterSpacing: '1px'
            }}>
              {weather.condition}
            </Typography>
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Typography variant="body1" sx={{ 
              opacity: 0.8,
              fontWeight: 300
            }}>
              {weather.location}
            </Typography>
          </motion.div>
        </Box>
      )}
    </Paper>
  );
};

export default Weather; 