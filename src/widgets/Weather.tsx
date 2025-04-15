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
        p: 2, // Further reduced padding
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
          mb: 1, // Further reduced margin bottom
          letterSpacing: '0.5px',
          alignSelf: 'flex-start',
          width: '100%',
          minHeight: '32px', // Ensure space for title even when loading
        }}
      >
        Weather
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
          <CircularProgress sx={{ color: 'white' }} />
          <Typography sx={{ mt: 2, color: 'rgba(255,255,255,0.7)' }}>Fetching weather...</Typography>
        </Box>
      ) : error ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, textAlign: 'center', px: 2 }}>
          <Typography color="error" sx={{ mb: 1 }}>{error}</Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Please check the location or try again later.</Typography>
        </Box>
      ) : (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          justifyContent: 'space-between',
          mt: 1,
          flexGrow: 1,
        }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {getWeatherIcon(weather.weatherCode)}
            </motion.div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Typography variant="h1" sx={{ 
                fontSize: '3.6rem', // Further reduced font size
                fontWeight: 500, 
                mt: 0.5, // Further reduced margin top
                mb: 0, // Reduced margin bottom
                textShadow: '0 2px 10px rgba(0,0,0,0.4)',
                letterSpacing: '-2px'
              }}>
                {weather.temperature !== null ? `${weather.temperature}°C` : '--'}
              </Typography>
            </motion.div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Typography variant="h6" sx={{ 
                minHeight: '28px', // Keep space
                opacity: 0.95, 
                mb: 0.5, // Reduced margin bottom
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
                minHeight: '24px', // Keep space
                opacity: 0.8,
                fontWeight: 300
              }}>
                {weather.locationName}
              </Typography>
            </motion.div>
          </Box>

          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-around', 
              width: '100%', 
              my: 1.5, // Further reduced vertical margin
              px: 1, 
              opacity: 0.85,
              gap: 2, // Gap between items
            }}
          >
            {/* Wind Speed */}          
            {weather.windSpeed !== null && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }} // Slightly faster anim
              >
                <Tooltip title="Wind Speed">
                  <Box sx={{ display: 'flex', alignItems: 'center', opacity: 0.8 }}>
                    <AirIcon sx={{ fontSize: 16, mr: 0.4 }}/> {/* Smaller icon/margin */}
                    <Typography variant="caption" sx={{ fontWeight: 300 }}> {/* Smaller font */}
                      {`${weather.windSpeed} km/h`}
                    </Typography>
                  </Box>
                </Tooltip>
              </motion.div>
            )}
            {/* Humidity */}          
            {weather.humidity !== null && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }} // Slightly faster anim
              >
                <Tooltip title="Humidity">
                  <Box sx={{ display: 'flex', alignItems: 'center', opacity: 0.8 }}>
                    <OpacityIcon sx={{ fontSize: 16, mr: 0.4 }}/> {/* Smaller icon/margin */}
                    <Typography variant="caption" sx={{ fontWeight: 300 }}> {/* Smaller font */}
                      {`${weather.humidity}%`}
                    </Typography>
                  </Box>
                </Tooltip>
              </motion.div>
            )}
            {/* Pressure */}          
            {weather.pressure !== null && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.4 }} // Slightly faster anim
              >
                <Tooltip title="Pressure">
                  <Box sx={{ display: 'flex', alignItems: 'center', opacity: 0.8 }}>
                    <CompressIcon sx={{ fontSize: 16, mr: 0.4 }}/> {/* Smaller icon/margin */}
                    <Typography variant="caption" sx={{ fontWeight: 300 }}> {/* Smaller font */}
                      {`${weather.pressure} mmHg`}
                    </Typography>
                  </Box>
                </Tooltip>
              </motion.div>
            )}
          </Box>

          {/* Bottom Section: Daily Forecast */}
          {dailyForecast.length > 0 && (
            <Box sx={{ width: '100%', mt: 'auto' }}> {/* Pushes to bottom */}
              <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', mb: 1, mt: 1 }} />
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-around', // Distribute days evenly
                  pb: 0.5, // Small padding bottom
                }}
              >
                {dailyForecast.map((day, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 + index * 0.1, duration: 0.4 }} // Delay after details
                  >
                    <Box sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      px: 1,
                      textAlign: 'center'
                    }}>
                      <Typography variant="caption" sx={{ opacity: 0.8, mb: 0.5, fontWeight: 500 }}>{day.dayOfWeek}</Typography>
                      <Box sx={{ height: 30, mb: 0.5 }}>{getSmallIcon(day.weatherCode)}</Box> {/* Use renamed function */}
                      <Typography variant="caption" sx={{ fontWeight: 500, display: 'flex', gap: '2px' }}>
                        <span>{day.tempMax}°</span>
                        <span style={{opacity: 0.6}}>{day.tempMin}°</span>
                      </Typography>
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