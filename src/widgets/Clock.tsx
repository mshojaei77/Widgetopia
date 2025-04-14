import React, { useState, useEffect } from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';

const Clock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setTime(new Date());
    }, 1000);
    
    return () => clearInterval(timerId);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
        Clock
      </Typography>
      
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        justifyContent: 'center',
        mt: 1
      }}>
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
            {formatTime(time)}
          </Typography>
        </motion.div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Typography variant="body1" sx={{ 
            opacity: 0.8,
            fontWeight: 300,
            fontSize: '1.1rem'
          }}>
            {formatDate(time)}
          </Typography>
        </motion.div>
      </Box>
    </Paper>
  );
};

export default Clock; 