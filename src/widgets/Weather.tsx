import React, { useState, useEffect } from 'react';
import Widget from '../components/Widget';
import './Weather.css';

// For a real implementation, you would use a weather API
// This is a mock implementation for demo purposes
const Weather: React.FC = () => {
  const [weather, setWeather] = useState({
    temperature: 72,
    condition: 'Sunny',
    location: 'New York, NY',
    icon: '☀️'
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    const timer = setTimeout(() => {
      // Mock different weather conditions
      const conditions = [
        { temperature: 72, condition: 'Sunny', icon: '☀️' },
        { temperature: 65, condition: 'Partly Cloudy', icon: '⛅' },
        { temperature: 58, condition: 'Rainy', icon: '🌧️' },
        { temperature: 45, condition: 'Cloudy', icon: '☁️' },
        { temperature: 85, condition: 'Hot', icon: '🔥' }
      ];
      
      const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
      
      setWeather({
        ...randomCondition,
        location: 'New York, NY'
      });
      
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <Widget title="Weather" className="weather-widget">
      {loading ? (
        <div className="weather-loading">Loading weather data...</div>
      ) : (
        <div className="weather-display">
          <div className="weather-icon">{weather.icon}</div>
          <div className="weather-temp">{weather.temperature}°F</div>
          <div className="weather-condition">{weather.condition}</div>
          <div className="weather-location">{weather.location}</div>
        </div>
      )}
    </Widget>
  );
};

export default Weather; 