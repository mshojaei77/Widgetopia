import React, { useState, useEffect } from 'react';
import { Paper, Typography, Box, IconButton, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

const Timer: React.FC = () => {
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  useEffect(() => {
    let timerId: NodeJS.Timeout;
    
    if (isRunning) {
      timerId = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => clearInterval(timerId);
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hrs.toString().padStart(2, '0'),
      mins.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };

  const handleStartStop = () => {
    setIsRunning(prev => !prev);
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedTime(0);
  };

  return (
    <Paper 
      elevation={0} 
      className="glass" 
      sx={{ 
        p: 1.5, 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 'var(--radius-lg)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Typography variant="subtitle2" sx={{ opacity: 0.8, mb: 0.5 }}>
        Working Time
      </Typography>
      
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
          <Typography variant="h3" sx={{ 
            fontSize: { xs: '1.8rem', sm: '2rem', md: '2.2rem' }, 
            fontWeight: 500,
            textShadow: '0 1px 6px rgba(0,0,0,0.3)',
            letterSpacing: '-1px',
            textAlign: 'center',
            mb: 0
          }}>
            {formatTime(elapsedTime)}
          </Typography>
        </motion.div>
      </Box>

      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        <IconButton 
          color={isRunning ? "error" : "primary"}
          onClick={handleStartStop}
          size="small"
          sx={{ 
            bgcolor: isRunning ? 'rgba(211, 47, 47, 0.2)' : 'rgba(25, 118, 210, 0.2)',
            '&:hover': {
              bgcolor: isRunning ? 'rgba(211, 47, 47, 0.3)' : 'rgba(25, 118, 210, 0.3)'
            }
          }}
        >
          {isRunning ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
        </IconButton>
        <IconButton 
          onClick={handleReset}
          disabled={elapsedTime === 0}
          size="small"
          sx={{ 
            color: 'text.secondary',
            bgcolor: 'rgba(255, 255, 255, 0.1)',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.2)'
            }
          }}
        >
          <RestartAltIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Paper>
  );
};

export default Timer; 