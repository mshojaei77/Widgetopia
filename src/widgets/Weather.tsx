import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, Tooltip, Divider, IconButton } from '@mui/material';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import CloudIcon from '@mui/icons-material/Cloud';
import AirIcon from '@mui/icons-material/Air'; // For wind
import GrainIcon from '@mui/icons-material/Grain'; // For rain
import AcUnitIcon from '@mui/icons-material/AcUnit'; // For snow
import ThunderstormIcon from '@mui/icons-material/Thunderstorm';
import FoggyIcon from '@mui/icons-material/Foggy'; // Placeholder for fog/mist
import OpacityIcon from '@mui/icons-material/Opacity'; // For humidity
import CompressIcon from '@mui/icons-material/Compress'; // For pressure
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import { motion } from 'framer-motion';
import { useRef } from 'react';

// Open-Meteo API base URLs
const GEOCODING_API_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';
const UNITS = 'metric'; // Use Celsius

interface WeatherData {
  temperature: number | null;
  condition: string;
  locationName: string;
  weatherCode: number | null; // WMO Weather interpretation codes
  windSpeed: number | null;
  humidity: number | null;
  pressure: number | null;
}

// Interface for Daily Forecast
interface DailyForecastData {
  date: string; // e.g., "2023-10-27"
  dayOfWeek: string; // e.g., "Fri"
  temperature: number;
  tempMax: number;
  tempMin: number;
  weatherCode: number;
}

interface WeatherWidgetProps {
  location: string; // Passed from App.tsx
}

// WMO Weather interpretation codes mapping (simplified)
const weatherConditions: { [key: number]: { description: string; icon: React.ReactNode } } = {
  0: { description: 'Clear sky', icon: <WbSunnyIcon sx={{ fontSize: 60, color: '#FFD700' }} /> },
  1: { description: 'Mainly clear', icon: <WbSunnyIcon sx={{ fontSize: 60, color: '#FFD700' }} /> }, // Often combined with sunny
  2: { description: 'Partly cloudy', icon: <CloudIcon sx={{ fontSize: 60, color: 'white', opacity: 0.8 }} /> },
  3: { description: 'Overcast', icon: <CloudIcon sx={{ fontSize: 60, color: '#b0bec5' }} /> }, // Darker cloud
  45: { description: 'Fog', icon: <FoggyIcon sx={{ fontSize: 60, color: '#bdbdbd' }} /> },
  48: { description: 'Depositing rime fog', icon: <FoggyIcon sx={{ fontSize: 60, color: '#e0e0e0' }} /> },
  51: { description: 'Light drizzle', icon: <GrainIcon sx={{ fontSize: 60, color: '#90caf9' }} /> },
  53: { description: 'Moderate drizzle', icon: <GrainIcon sx={{ fontSize: 60, color: '#64b5f6' }} /> },
  55: { description: 'Dense drizzle', icon: <GrainIcon sx={{ fontSize: 60, color: '#42a5f5' }} /> },
  56: { description: 'Light freezing drizzle', icon: <AcUnitIcon sx={{ fontSize: 60, color: '#b3e5fc' }} /> },
  57: { description: 'Dense freezing drizzle', icon: <AcUnitIcon sx={{ fontSize: 60, color: '#81d4fa' }} /> },
  61: { description: 'Slight rain', icon: <GrainIcon sx={{ fontSize: 60, color: '#64b5f6' }} /> },
  63: { description: 'Moderate rain', icon: <GrainIcon sx={{ fontSize: 60, color: '#42a5f5' }} /> },
  65: { description: 'Heavy rain', icon: <GrainIcon sx={{ fontSize: 60, color: '#2196f3' }} /> },
  66: { description: 'Light freezing rain', icon: <AcUnitIcon sx={{ fontSize: 60, color: '#81d4fa' }} /> },
  67: { description: 'Heavy freezing rain', icon: <AcUnitIcon sx={{ fontSize: 60, color: '#4fc3f7' }} /> },
  71: { description: 'Slight snow fall', icon: <AcUnitIcon sx={{ fontSize: 60, color: '#e1f5fe' }} /> },
  73: { description: 'Moderate snow fall', icon: <AcUnitIcon sx={{ fontSize: 60, color: '#b3e5fc' }} /> },
  75: { description: 'Heavy snow fall', icon: <AcUnitIcon sx={{ fontSize: 60, color: '#81d4fa' }} /> },
  77: { description: 'Snow grains', icon: <AcUnitIcon sx={{ fontSize: 60, color: '#e3f2fd' }} /> },
  80: { description: 'Slight rain showers', icon: <GrainIcon sx={{ fontSize: 60, color: '#64b5f6' }} /> },
  81: { description: 'Moderate rain showers', icon: <GrainIcon sx={{ fontSize: 60, color: '#42a5f5' }} /> },
  82: { description: 'Violent rain showers', icon: <ThunderstormIcon sx={{ fontSize: 60, color: '#1e88e5' }} /> },
  85: { description: 'Slight snow showers', icon: <AcUnitIcon sx={{ fontSize: 60, color: '#b3e5fc' }} /> },
  86: { description: 'Heavy snow showers', icon: <AcUnitIcon sx={{ fontSize: 60, color: '#81d4fa' }} /> },
  95: { description: 'Thunderstorm', icon: <ThunderstormIcon sx={{ fontSize: 60, color: '#ffeb3b' }} /> }, // Slight or moderate
  96: { description: 'Thunderstorm with slight hail', icon: <ThunderstormIcon sx={{ fontSize: 60, color: '#ffee58' }} /> },
  99: { description: 'Thunderstorm with heavy hail', icon: <ThunderstormIcon sx={{ fontSize: 60, color: '#fdd835' }} /> },
};

const Weather: React.FC<WeatherWidgetProps> = ({ location }) => {
  const [weather, setWeather] = useState<WeatherData>({
    temperature: null,
    condition: 'Loading...',
    locationName: location, // Start with the passed location name
    weatherCode: null,
    windSpeed: null,
    humidity: null,
    pressure: null,
  });
  const [dailyForecast, setDailyForecast] = useState<DailyForecastData[]>([]); // State for daily forecast
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      setLoading(true);
      setError(null);
      setWeather(prev => ({ 
        ...prev, 
        condition: 'Loading...', 
        temperature: null, 
        weatherCode: null, 
        windSpeed: null,
        humidity: null,
        pressure: null,
      })); 
      setDailyForecast([]); // Clear daily forecast

      try {
        // 1. Get Coordinates from City Name
        const geocodingResponse = await fetch(`${GEOCODING_API_URL}?name=${encodeURIComponent(location)}&count=1&language=en&format=json`);
        if (!geocodingResponse.ok) {
          throw new Error(`Geocoding error: ${geocodingResponse.statusText} (Location: ${location})`);
        }
        const geocodingData = await geocodingResponse.json();

        if (!geocodingData.results || geocodingData.results.length === 0) {
          throw new Error(`Could not find location: ${location}`);
        }

        const { latitude, longitude, name: foundName, admin1, country } = geocodingData.results[0];
        const displayLocation = `${foundName}${admin1 ? `, ${admin1}` : ''}, ${country}`;

        // 2. Get Weather Data from Coordinates (Requesting DAILY forecast)
        const weatherResponse = await fetch(`${WEATHER_API_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,surface_pressure,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&temperature_unit=${UNITS === 'metric' ? 'celsius' : 'fahrenheit'}&wind_speed_unit=kmh&pressure_unit=hpa&timezone=auto&forecast_days=6`); // Changed to daily, forecast_days=6 (today + 5 future)
        if (!weatherResponse.ok) {
          throw new Error(`Weather API error: ${weatherResponse.statusText}`);
        }
        const weatherData = await weatherResponse.json();

        if (!weatherData.current) {
             throw new Error('No current weather data available.');
        }

        const currentTemperature = weatherData.current.temperature_2m;
        const currentConditionCode = weatherData.current.weather_code;
        const currentWindSpeed = weatherData.current.wind_speed_10m;
        const currentHumidity = weatherData.current.relative_humidity_2m;
        const currentPressureHpa = weatherData.current.surface_pressure;

        // Convert pressure hPa to mmHg
        const currentPressureMmHg = currentPressureHpa ? Math.round(currentPressureHpa * 0.750062) : null;

        const conditionInfo = weatherConditions[currentConditionCode] || { description: 'Unknown', icon: <CloudIcon sx={{ fontSize: 60, color: 'grey' }} /> };

        setWeather({
          temperature: Math.round(currentTemperature),
          condition: conditionInfo.description,
          locationName: displayLocation,
          weatherCode: currentConditionCode,
          windSpeed: Math.round(currentWindSpeed),
          humidity: currentHumidity,
          pressure: currentPressureMmHg,
        });

        // 3. Process Daily Forecast Data
        if (weatherData.daily && weatherData.daily.time && weatherData.daily.temperature_2m_max && weatherData.daily.temperature_2m_min && weatherData.daily.weather_code) {
          const processedDailyForecast: DailyForecastData[] = [];
          // Start from index 1 to skip today (already shown in current weather)
          for (let i = 1; i < weatherData.daily.time.length; i++) {
            const date = new Date(weatherData.daily.time[i] + 'T00:00:00'); // Ensure correct date parsing
            processedDailyForecast.push({
              date: weatherData.daily.time[i],
              dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'short' }),
              tempMax: Math.round(weatherData.daily.temperature_2m_max[i]),
              tempMin: Math.round(weatherData.daily.temperature_2m_min[i]),
              weatherCode: weatherData.daily.weather_code[i],
              // Added temperature field to DailyForecastData for compatibility if needed, 
              // but using tempMax/Min for display.
              temperature: Math.round((weatherData.daily.temperature_2m_max[i] + weatherData.daily.temperature_2m_min[i]) / 2) // Example avg temp
            });
          }
          setDailyForecast(processedDailyForecast);
        }

      } catch (err: any) {
        console.error("Failed to fetch weather data:", err);
        setError(err.message || 'Failed to fetch weather data');
        setWeather(prev => ({ ...prev, condition: 'Error', locationName: location })); // Keep original input location on error
      } finally {
        setLoading(false);
      }
    };

    if (location) {
      fetchWeatherData();
    }

  }, [location]); // Re-fetch when location changes

  const getWeatherIcon = (code: number | null) => {
    if (code === null) return <CircularProgress size={50} sx={{ color: 'white' }}/>; // Reduced size

    const condition = weatherConditions[code];
    if (!condition || !React.isValidElement(condition.icon)) {
      return <CloudIcon sx={{ fontSize: 60, color: 'grey' }} />; // Default/Unknown icon (reduced size)
    }

    // Apply animation based on condition type (example)
    let animationProps = {};
    if (code === 0 || code === 1) { // Sunny/Clear
      animationProps = {
        animate: { rotate: [0, 2, 0, -2, 0], scale: [1, 1.03, 1] },
        transition: { duration: 8, repeat: Infinity, ease: "easeInOut" }
      };
    } else if (code >= 51 && code <= 67 || code >= 80 && code <= 82) { // Rain/Drizzle
      animationProps = {
        animate: { y: [0, 3, 0, -2, 0] },
        transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
      };
    } else if (code >= 71 && code <= 77 || code >= 85 && code <= 86) { // Snow
      animationProps = {
        animate: { y: [0, 4, 0], opacity: [1, 0.8, 1] },
        transition: { duration: 3, repeat: Infinity, ease: "linear" }
      };
    } else if (code >= 95 && code <= 99) { // Thunderstorm
      animationProps = {
        animate: { scale: [1, 1.02, 1, 0.98, 1], x: [0, 1, -1, 1, 0] },
        transition: { duration: 0.5, repeat: Infinity, ease: "easeInOut" }
      };
     } else if (code === 2 || code === 3) { // Cloudy
      animationProps = {
        animate: { x: [0, 4, 0, -4, 0] },
        transition: { duration: 10, repeat: Infinity, ease: "easeInOut" }
      };
    }
    else { // Default gentle bob for others
      animationProps = {
        animate: { y: [0, 2, 0] },
        transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
      };
    }

    return (
      <motion.div {...animationProps}>
        {condition.icon}
      </motion.div>
    );
  };

  // Function to get smaller icon for daily forecast
  const getSmallIcon = (code: number | null): React.ReactNode => {
    if (code === null) return null;
    const condition = weatherConditions[code];

    // Check if condition and icon exist and if icon is a valid element
    if (!condition || !React.isValidElement(condition.icon)) {
      return <CloudIcon sx={{ fontSize: 28, color: 'grey', opacity: 0.7 }} />;
    }

    // Clone the element with updated sx props
    // Cast to any to bypass strict clone typing if necessary, or ensure icon type is correct
    const iconElement = condition.icon as React.ReactElement<any>; 
    const originalSx = iconElement.props.sx || {};
    
    try {
      return React.cloneElement(iconElement, {
        sx: { ...originalSx, fontSize: 28, opacity: 0.9 }
      });
    } catch (e) {
      console.error("Error cloning weather icon:", e);
      return <CloudIcon sx={{ fontSize: 28, color: 'grey', opacity: 0.7 }} />; // Fallback
    }
  };

  return (
    <Paper 
      elevation={0} 
      className="glass" 
      sx={{ 
        p: 1.5, // Reduced padding
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-lg)', // Adjusted radius if needed for compactness, using existing var
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* REMOVED Title Typography component */}
      
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
          <CircularProgress size={30} sx={{ color: 'white' }} /> {/* Smaller loader */}
          <Typography variant="caption" sx={{ mt: 1, color: 'rgba(255,255,255,0.7)' }}>Fetching...</Typography> {/* Smaller text */}
        </Box>
      ) : error ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, textAlign: 'center', px: 1 }}>
          <Typography color="error" variant="caption" sx={{ mb: 0.5 }}>{error}</Typography> {/* Smaller text */}
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>Check location</Typography> {/* Shorter text */}
        </Box>
      ) : (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          justifyContent: 'flex-start', // Changed to flex-start to reduce middle space
          mt: 0, // Removed top margin
          flexGrow: 1,
          width: '100%', // Ensure full width usage
        }}>
          {/* Main Weather Info */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', mb: 0 }}> {/* Removed margin bottom */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Adjust icon size directly in getWeatherIcon/weatherConditions if needed, or keep dynamic */}
              {getWeatherIcon(weather.weatherCode)} 
            </motion.div>
            
            <motion.div
              initial={{ y: 15, opacity: 0 }} // Reduced animation distance
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }} // Faster animation
            >
              <Typography variant="h2" sx={{ // Use h2 but adjust style
                fontSize: '2.8rem', // Significantly reduced font size
                fontWeight: 500,
                mt: 0.5, // Increased margin top slightly
                mb: 0.2, // Added small margin bottom
                textShadow: '0 1px 5px rgba(0,0,0,0.3)', // Adjusted shadow
                letterSpacing: '-1.5px' // Adjusted spacing
              }}>
                {weather.temperature !== null ? `${weather.temperature}°C` : '--'}
              </Typography>
            </motion.div>
            
            <motion.div
              initial={{ y: 15, opacity: 0 }} // Reduced animation distance
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }} // Faster animation
            >
              <Typography variant="body1" sx={{ // Use body1 but adjust style
                fontSize: '0.9rem', // Reduced font size
                minHeight: 'auto', // Remove minHeight
                opacity: 0.9,
                mb: 0.5, // Increased margin bottom
                fontWeight: 400,
                letterSpacing: '0.5px' // Adjusted spacing
              }}>
                {weather.condition}
              </Typography>
            </motion.div>
            
            <motion.div
              initial={{ y: 15, opacity: 0 }} // Reduced animation distance
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }} // Faster animation
            >
              <Typography variant="body2" sx={{ // Use body2
                fontSize: '0.75rem', // Reduced font size
                minHeight: 'auto', // Remove minHeight
                opacity: 0.75,
                fontWeight: 300,
                textAlign: 'center', // Center location name if long
                lineHeight: 1.2, // Adjust line height
              }}>
                {weather.locationName}
              </Typography>
            </motion.div>
          </Box>

          {/* Details Row */}
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', // Center items if space allows
              alignItems: 'center',
              width: '100%', 
              my: 0.5, // Increased vertical margin
              px: 0.5, 
              opacity: 0.8,
              gap: 1.5, // Reduced gap
              flexWrap: 'wrap', // Allow wrapping if needed
            }}
          >
            {/* Wind Speed */}          
            {weather.windSpeed !== null && (
              <motion.div
                initial={{ y: 10, opacity: 0 }} // Reduced animation distance
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }} // Faster animation
              >
                <Tooltip title="Wind Speed" placement="top">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AirIcon sx={{ fontSize: 14, mr: 0.3 }}/> {/* Smaller icon/margin */}
                    <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 300 }}> {/* Smaller font */}
                      {`${weather.windSpeed} km/h`}
                    </Typography>
                  </Box>
                </Tooltip>
              </motion.div>
            )}
            {/* Humidity */}          
            {weather.humidity !== null && (
              <motion.div
                initial={{ y: 10, opacity: 0 }} // Reduced animation distance
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }} // Faster animation
              >
                <Tooltip title="Humidity" placement="top">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <OpacityIcon sx={{ fontSize: 14, mr: 0.3 }}/> {/* Smaller icon/margin */}
                    <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 300 }}> {/* Smaller font */}
                      {`${weather.humidity}%`}
                    </Typography>
                  </Box>
                </Tooltip>
              </motion.div>
            )}
            {/* Pressure */}          
            {weather.pressure !== null && (
              <motion.div
                initial={{ y: 10, opacity: 0 }} // Reduced animation distance
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.3 }} // Faster animation
              >
                <Tooltip title="Pressure" placement="top">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CompressIcon sx={{ fontSize: 14, mr: 0.3 }}/> {/* Smaller icon/margin */}
                    <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 300 }}> {/* Smaller font */}
                      {`${weather.pressure} mmHg`}
                    </Typography>
                  </Box>
                </Tooltip>
              </motion.div>
            )}
          </Box>

          {/* Bottom Section: Daily Forecast */}
          {dailyForecast.length > 0 && (
            <Box sx={{ width: '100%', mt: 1, pt: 0.5 }}> {/* Increased top margin */}
              <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', my: 0.5 }} /> {/* Increased margin */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-around', // Distribute days evenly
                  alignItems: 'flex-start', // Align items to top
                  pb: 0, // Removed padding bottom
                }}
              >
                {dailyForecast.map((day, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 5 }} // Reduced animation distance
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + index * 0.05, duration: 0.3 }} // Faster animation
                  >
                    <Box sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      px: 0.5, // Reduced padding
                      textAlign: 'center'
                    }}>
                      <Typography variant="caption" sx={{ fontSize: '0.65rem', opacity: 0.8, mb: 0.4, fontWeight: 500 }}>{day.dayOfWeek}</Typography> {/* Smaller font, increased margin */}
                      <Box sx={{ height: 24, mb: 0.3 }}>{getSmallIcon(day.weatherCode)}</Box> {/* Use renamed function, adjusted height, increased margin */}
                    </Box>
                  </motion.div>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default Weather; 