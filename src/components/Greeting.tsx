import React from 'react';
import { Typography } from '@mui/material';

interface GreetingProps {
  userName: string;
}

const Greeting: React.FC<GreetingProps> = ({ userName }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <Typography 
      variant="h2" 
      component="h1" 
      sx={{ 
        color: 'var(--text-light)', 
        textAlign: 'center', 
        mb: 4,
        mt: 2,
        fontWeight: 500,
        letterSpacing: '-0.5px',
        fontSize: { xs: '2.2rem', sm: '2.5rem', md: '3rem' },
      }}
    >
      {getGreeting()}, {userName}
    </Typography>
  );
};

export default Greeting; 