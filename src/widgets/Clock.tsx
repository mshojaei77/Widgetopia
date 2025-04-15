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
      second: '2-digit',
      hour12: false
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
        p: 2, 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
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
        flex: 1
      }}>
        <motion.div
          initial={{ y: 5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <Typography variant="h2" sx={{ 
            fontSize: { xs: '2.2rem', sm: '2.5rem', md: '3rem' }, 
            fontWeight: 500,
            textShadow: '0 1px 6px rgba(0,0,0,0.3)',
            letterSpacing: '-1px',
            textAlign: 'center'
          }}>
            {formatTime(time)}
          </Typography>
          <Typography variant="body2" sx={{ 
            textAlign: 'center', 
            mt: 1, 
            opacity: 0.8,
            textShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }}>
            {formatDate(time)}
          </Typography>
        </motion.div>
      </Box>
    </Paper>
  );
};

export default Clock; 