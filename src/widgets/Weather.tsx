import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Tooltip, Divider, IconButton } from '@mui/material';
import { CacheAnalytics } from '../utils/CacheAnalytics';
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

// Weather data cache with expiration (30 minutes)
class WeatherCache {
  private static readonly CACHE_KEY = 'weather_data_cache';
  private static readonly CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes in milliseconds

  static async get(location: string): Promise<any | null> {
    try {
      const cache = localStorage.getItem(this.CACHE_KEY);
      if (!cache) return null;

      const cacheData = JSON.parse(cache);
      const item = cacheData[location.toLowerCase()];
      
      if (!item) return null;
      
      // Check if cache is expired
      if (Date.now() - item.timestamp > this.CACHE_EXPIRY) {
        this.remove(location);
        return null;
      }
      
      return item.data;
    } catch (error) {
      console.warn('Error reading weather cache:', error);
      return null;
    }
  }

  static async set(location: string, data: any): Promise<void> {
    try {
      const cache = localStorage.getItem(this.CACHE_KEY);
      const cacheData = cache ? JSON.parse(cache) : {};
      
      cacheData[location.toLowerCase()] = {
        data,
        timestamp: Date.now()
      };
      
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Error writing to weather cache:', error);
    }
  }

  static remove(location: string): void {
    try {
      const cache = localStorage.getItem(this.CACHE_KEY);
      if (!cache) return;

      const cacheData = JSON.parse(cache);
      delete cacheData[location.toLowerCase()];
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Error removing from weather cache:', error);
    }
  }

  static clear(): void {
    try {
      localStorage.removeItem(this.CACHE_KEY);
    } catch (error) {
      console.warn('Error clearing weather cache:', error);
    }
  }
}

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
  77: { description: 'Snow grains', icon: <AcUnitIcon sx={{ fontSize: 60, color: '#e0f2f1' }} /> },
  80: { description: 'Slight rain showers', icon: <GrainIcon sx={{ fontSize: 60, color: '#64b5f6' }} /> },
  81: { description: 'Moderate rain showers', icon: <GrainIcon sx={{ fontSize: 60, color: '#42a5f5' }} /> },
  82: { description: 'Violent rain showers', icon: <GrainIcon sx={{ fontSize: 60, color: '#1976d2' }} /> },
  85: { description: 'Slight snow showers', icon: <AcUnitIcon sx={{ fontSize: 60, color: '#b3e5fc' }} /> },
  86: { description: 'Heavy snow showers', icon: <AcUnitIcon sx={{ fontSize: 60, color: '#81d4fa' }} /> },
  95: { description: 'Thunderstorm', icon: <ThunderstormIcon sx={{ fontSize: 60, color: '#9c27b0' }} /> },
  96: { description: 'Thunderstorm with slight hail', icon: <ThunderstormIcon sx={{ fontSize: 60, color: '#7b1fa2' }} /> },
  99: { description: 'Thunderstorm with heavy hail', icon: <ThunderstormIcon sx={{ fontSize: 60, color: '#6a1b9a' }} /> },
};

const Weather: React.FC<WeatherWidgetProps> = ({ location }) => {
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 22, // Default temperature
    condition: 'Clear Sky',
    locationName: location, // Start with the passed location name
    weatherCode: 0, // Clear sky code
    windSpeed: 5,
    humidity: 65,
    pressure: 1013,
  });
  const [dailyForecast, setDailyForecast] = useState<DailyForecastData[]>([]); // State for daily forecast
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      setError(null);
      
      // Check cache first for instant loading
      const cachedData = await WeatherCache.get(location);
      if (cachedData) {
        CacheAnalytics.trackCacheHit('weather', 'api');
        setWeather(cachedData.weather);
        setDailyForecast(cachedData.dailyForecast || []);
        // Still fetch fresh data in background but don't block UI
        fetchFreshWeatherData();
        return;
      }

      CacheAnalytics.trackCacheMiss('weather', 'api');
      // No cache available, fetch fresh data
      await fetchFreshWeatherData();
    };

    const fetchFreshWeatherData = async () => {
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

        const newWeatherData = {
          temperature: Math.round(currentTemperature),
          condition: conditionInfo.description,
          locationName: displayLocation,
          weatherCode: currentConditionCode,
          windSpeed: Math.round(currentWindSpeed),
          humidity: currentHumidity,
          pressure: currentPressureMmHg,
        };

        setWeather(newWeatherData);

        // 3. Process Daily Forecast Data
        let newDailyForecast: DailyForecastData[] = [];
        if (weatherData.daily && weatherData.daily.time && weatherData.daily.temperature_2m_max && weatherData.daily.temperature_2m_min && weatherData.daily.weather_code) {
          // Start from index 1 to skip today (already shown in current weather)
          for (let i = 1; i < weatherData.daily.time.length; i++) {
            const date = new Date(weatherData.daily.time[i] + 'T00:00:00'); // Ensure correct date parsing
            newDailyForecast.push({
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
        }
        
        setDailyForecast(newDailyForecast);

        // Cache the fresh data
        await WeatherCache.set(location, {
          weather: newWeatherData,
          dailyForecast: newDailyForecast
        });

      } catch (err: any) {
        console.error("Failed to fetch weather data:", err);
        setError(err.message || 'Failed to fetch weather data');
        setWeather(prev => ({ ...prev, condition: 'Error', locationName: location })); // Keep original input location on error
      }
    };

    if (location) {
      fetchWeatherData();
    }

  }, [location]); // Re-fetch when location changes

  const getWeatherIcon = (code: number | null) => {
    if (code === null) return <CloudIcon sx={{ fontSize: 60, color: 'grey' }} />;

    const condition = weatherConditions[code];
    if (!condition || !React.isValidElement(condition.icon)) {
      return <CloudIcon sx={{ fontSize: 60, color: 'grey' }} />; // Default/Unknown icon
    }

    // Return static icon for instant loading
    return condition.icon;
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
      className="glass glass-premium glass-particles glass-morph" 
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
      
      {error ? (
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
            <Box>
              {/* Adjust icon size directly in getWeatherIcon/weatherConditions if needed, or keep dynamic */}
              {getWeatherIcon(weather.weatherCode)} 
            </Box>
            
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
            {/* Wind */}
            <Tooltip title={`Wind: ${weather.windSpeed} km/h`}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                <AirIcon sx={{ fontSize: 14, opacity: 0.7 }} />
                <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                  {weather.windSpeed}
                </Typography>
              </Box>
            </Tooltip>

            {/* Humidity */}
            <Tooltip title={`Humidity: ${weather.humidity}%`}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                <OpacityIcon sx={{ fontSize: 14, opacity: 0.7 }} />
                <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                  {weather.humidity}%
                </Typography>
              </Box>
            </Tooltip>

            {/* Pressure */}
            <Tooltip title={`Pressure: ${weather.pressure} mmHg`}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                <CompressIcon sx={{ fontSize: 14, opacity: 0.7 }} />
                <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                  {weather.pressure}
                </Typography>
              </Box>
            </Tooltip>
          </Box>

          {/* Daily Forecast - Compact */}
          {dailyForecast.length > 0 && (
            <>
              <Divider sx={{ width: '100%', my: 0.5, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                width: '100%', 
                px: 0.5,
                gap: 0.5, // Reduced gap
                overflow: 'hidden' // Prevent overflow
              }}>
                {dailyForecast.slice(0, 4).map((day, index) => ( // Show only first 4 days
                  <Box key={day.date} sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    flex: 1, // Equal width distribution
                    minWidth: 0 // Allow shrinking
                  }}>
                    <Typography variant="caption" sx={{ 
                      fontSize: '0.65rem', 
                      opacity: 0.7, 
                      mb: 0.2,
                      textAlign: 'center'
                    }}>
                      {day.dayOfWeek}
                    </Typography>
                    <Box sx={{ mb: 0.2 }}>
                      {getSmallIcon(day.weatherCode)}
                    </Box>
                    <Typography variant="caption" sx={{ 
                      fontSize: '0.65rem', 
                      fontWeight: 500,
                      textAlign: 'center',
                      lineHeight: 1
                    }}>
                      {day.tempMax}°/{day.tempMin}°
                    </Typography>
                  </Box>
                ))}
              </Box>
            </>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default Weather;