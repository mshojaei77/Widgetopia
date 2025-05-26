import React, { useState } from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameDay, isSameMonth, getDate } from 'date-fns';

const Calendar: React.FC = () => {
  const [currentDate] = useState(new Date());
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  // Single letters for days of week
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const days = [];
  let day = startDate;

  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }

  const isToday = (date: Date) => isSameDay(date, new Date());
  const isCurrentMonth = (date: Date) => isSameMonth(date, currentDate);

  return (
    <Paper
      elevation={0}
      className="glass glass-neon glass-glow glass-interactive"
      sx={{
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'var(--radius-lg)',
        position: 'relative',
        overflow: 'hidden',
        color: 'var(--text-light)',
        animation: 'fadeIn 1s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <Box sx={{ flex: 1 }}>
        {/* Month name */}
        <Typography variant="h6" sx={{ 
          fontWeight: 600, 
          mb: 1.5, 
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          {format(currentDate, 'MMMM')}
        </Typography>

        {/* Days of Week Headers */}
        <Box 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(7, 1fr)', 
            textAlign: 'center',
            mb: 1
          }}
        >
          {daysOfWeek.map((dayName, index) => (
            <Typography key={`${dayName}-${index}`} variant="body2" sx={{ 
              fontWeight: 500, 
              opacity: 0.8, 
              fontSize: '0.85rem',
              color: 'inherit'
            }}>
              {dayName}
            </Typography>
          ))}
        </Box>

        {/* Calendar Grid */}
        <Box 
          sx={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gridTemplateRows: 'repeat(6, 1fr)',
            gap: '8px 4px',
            flex: 1
          }}
        >
          {days.map((date, index) => {
            return (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  margin: '0 auto',
                  backgroundColor: isToday(date) ? '#2196f3' : 'transparent',
                  color: isToday(date) 
                    ? 'white' 
                    : !isCurrentMonth(date) 
                      ? 'rgba(255, 255, 255, 0.4)' 
                      : 'inherit',
                  fontWeight: isToday(date) ? 600 : 400,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '0.85rem',
                    fontWeight: 'inherit',
                    color: 'inherit',
                  }}
                >
                  {format(date, 'd')}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Paper>
  );
};

export default Calendar; 