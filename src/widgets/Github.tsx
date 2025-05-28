import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Box, 
  TextField, 
  Button, 
  Typography, 
  CircularProgress, 
  Grid,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  Link,
  InputAdornment,
  FormControl,
  InputLabel,
  OutlinedInput,
  FormHelperText
} from '@mui/material';
import { Refresh, Info, GitHub, Settings, OpenInNew, Visibility, VisibilityOff } from '@mui/icons-material';
import { fetchGitHubContributions } from '../utils/githubProxy';

interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

interface ContributionWeek {
  days: ContributionDay[];
}

interface ContributionData {
  weeks: ContributionWeek[];
  username: string;
}

// --- Mock Data for Development ---
const mockContributionData: ContributionData = {
  username: 'dev-user',
  weeks: Array.from({ length: 52 }, (_, weekIndex) => ({
    days: Array.from({ length: 7 }, (_, dayIndex) => {
      const date = new Date();
      date.setDate(date.getDate() - (51 - weekIndex) * 7 - (6 - dayIndex));
      const count = Math.random() > 0.3 ? Math.floor(Math.random() * 15) : 0;
      let level = 0;
      if (count > 0) level = 1;
      if (count > 5) level = 2;
      if (count > 10) level = 3;
      if (count > 15) level = 4; // Should be rare with Math.random() * 15
      return {
        date: date.toISOString().split('T')[0],
        count,
        level,
      };
    }),
  })),
};
// --- End Mock Data ---

const Github: React.FC = () => {
  const theme = useTheme();
  const [username, setUsername] = useState<string>(() => {
    return localStorage.getItem('githubUsername') || '';
  });
  const [token, setToken] = useState<string>(() => {
    return localStorage.getItem('githubToken') || '';
  });
  const [inputUsername, setInputUsername] = useState(username);
  const [inputToken, setInputToken] = useState(token);
  const [showToken, setShowToken] = useState(false);
  const [contributionData, setContributionData] = useState<ContributionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (import.meta.env.DEV) {
      setLoading(true);
      setError(null);
      setTimeout(() => {
        setContributionData(mockContributionData);
        setLoading(false);
      }, 1000); // Simulate loading
    } else {
      if (username && token) {
        fetchContributions(username, token);
        localStorage.setItem('githubUsername', username);
        localStorage.setItem('githubToken', token);
      } else {
        // Clear data if no credentials in production, to show connect prompt
        setContributionData(null);
      }
    }
  }, [username, token]);

  const fetchContributions = async (user: string, userToken: string) => {
    if (import.meta.env.DEV) {
      setLoading(true);
      setError(null);
      setTimeout(() => {
        setContributionData(mockContributionData);
        setLoading(false);
      }, 500); // Simulate loading for refresh
      return;
    }

    if (!user || !userToken) {
      setError("Username and token are required to fetch contributions.");
      setContributionData(null);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Use our GitHub proxy utility
      const data = await fetchGitHubContributions(user, userToken);
      setContributionData(data);
    } catch (err) {
      console.error('Failed to fetch contribution data:', err);
      setContributionData(null); // Clear data on error
      
      // Provide more detailed error information
      let errorMessage = 'Failed to fetch GitHub contribution data.';
      
      if (err instanceof Error) {
        errorMessage += ' ' + err.message;
      }
      
      if (navigator.onLine === false) {
        errorMessage = 'You are offline. Please check your internet connection.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUsername.trim() !== username || inputToken !== token) {
      setUsername(inputUsername.trim());
      setToken(inputToken);
    } else if (import.meta.env.DEV && (!username || !token)) {
      // If in dev mode and submitting for the first time (no stored username/token)
      // trigger mock data loading if it wasn't already loaded by initial useEffect
      // This handles the case where the user opens the dialog and saves without changing
      // inputUsername/inputToken from potentially empty initial state.
      setLoading(true);
      setError(null);
      setTimeout(() => {
        setContributionData(mockContributionData);
        setLoading(false);
      }, 500);
    }
    setDialogOpen(false);
  };

  const handleRefresh = () => {
    if (import.meta.env.DEV) {
      fetchContributions('dev-user', 'dev-token'); // Args don't matter for dev
    } else if (username && token) {
      fetchContributions(username, token);
    } else {
      setDialogOpen(true);
    }
  };

  const handleOpenDialog = () => {
    setInputUsername(username);
    setInputToken(token);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleToggleTokenVisibility = () => {
    setShowToken(!showToken);
  };

  // Get contribution level color - Matching GitHub's color scheme
  const getLevelColor = (level: number) => {
    switch (level) {
      case 0: return 'rgba(22, 27, 34, 0.3)'; // Empty
      case 1: return 'rgba(14, 68, 41, 0.7)'; // Level 1 - Lightest green
      case 2: return 'rgba(0, 109, 50, 0.8)'; // Level 2 - Light green
      case 3: return 'rgba(38, 166, 65, 0.85)'; // Level 3 - Medium green
      case 4: return 'rgba(57, 211, 83, 0.9)'; // Level 4 - Dark green
      default: return 'rgba(22, 27, 34, 0.3)';
    }
  };

  // Get total contributions
  const getTotalContributions = (): number => {
    if (!contributionData) return 0;
    
    return contributionData.weeks.reduce((total, week) => {
      return total + week.days.reduce((weekTotal, day) => weekTotal + day.count, 0);
    }, 0);
  };

  // Get current streak
  const getCurrentStreak = (): number => {
    if (!contributionData) return 0;
    
    let streak = 0;
    let currentStreak = 0;
    
    // Flatten and reverse the days to start from the most recent
    const allDays = [...contributionData.weeks]
      .flatMap(week => week.days)
      .reverse();
    
    for (const day of allDays) {
      if (day.count > 0) {
        currentStreak++;
      } else {
        // Break once we hit a day with no contributions
        break;
      }
    }
    
    return currentStreak;
  };

  return (
    <Paper 
      elevation={0} 
      className="glass glass-frosted glass-premium" 
      sx={{ 
        p: 2, 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'var(--radius-lg)',
        position: 'relative',
        overflow: 'hidden',
        animation: 'fadeIn 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 1,
        p: 0.5,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <GitHub sx={{ mr: 1, fontSize: 20, color: 'var(--text-color)', opacity: 0.9 }} />
          <Typography variant="h6" component="h2" sx={{ 
            fontSize: '16px', 
            fontWeight: 500,
            textShadow: '0 1px 3px rgba(0,0,0,0.2)',
            color: 'var(--text-color)'
          }}>
            GitHub Contributions {import.meta.env.DEV && "(Dev Mode)"}
          </Typography>
        </Box>
        
        <Box>
          { (contributionData?.username || username) && (
            <Tooltip title="View on GitHub">
              <IconButton 
                size="small" 
                component={Link}
                href={`https://github.com/${contributionData?.username || username}`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ 
                  color: 'var(--text-color)',
                  opacity: 0.8,
                  '&:hover': { 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    opacity: 1 
                  }
                }}
              >
                <OpenInNew fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          
          <Tooltip title="Change GitHub username">
            <IconButton 
              size="small" 
              onClick={handleOpenDialog} 
              sx={{ 
                color: 'var(--text-color)',
                opacity: 0.8,
                '&:hover': { 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  opacity: 1 
                }
              }}
            >
              <Settings fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Refresh">
            <IconButton 
              onClick={handleRefresh} 
              disabled={loading || (!username && !import.meta.env.DEV)}
              size="small" 
              sx={{ 
                ml: 1, 
                color: 'var(--text-color)',
                opacity: 0.8,
                '&:hover': { 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  opacity: 1 
                },
                '&.Mui-disabled': {
                  opacity: 0.3
                }
              }}
            >
              <Refresh fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {error && (
        <Typography color="error" variant="body2" sx={{ mb: 2, fontSize: '12px' }}>
          {error}
        </Typography>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
          <CircularProgress size={40} sx={{ color: 'var(--text-color)', opacity: 0.7 }} />
        </Box>
      ) : contributionData ? (
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mt: 1,
          flexGrow: 1
        }}>
          {/* Contribution stats */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-around', 
            width: '100%',
            mb: 2,
          }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ 
                fontSize: '11px', 
                opacity: 0.7,
                color: 'var(--text-color)' 
              }}>
                Total Contributions
              </Typography>
              <Typography variant="h6" sx={{ 
                fontSize: '16px', 
                fontWeight: 'bold',
                color: 'var(--text-color)' 
              }}>
                {getTotalContributions()}
              </Typography>
            </Box>
            
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ 
                fontSize: '11px', 
                opacity: 0.7,
                color: 'var(--text-color)' 
              }}>
                Current Streak
              </Typography>
              <Typography variant="h6" sx={{ 
                fontSize: '16px', 
                fontWeight: 'bold',
                color: 'var(--text-color)' 
              }}>
                {getCurrentStreak()} days
              </Typography>
            </Box>
          </Box>

          {/* Contribution grid */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            borderRadius: 'var(--radius-md)',
            p: 1.5,
            overflowX: 'auto',
            maxWidth: '100%',
            boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.1)'
          }}>
            {contributionData.weeks.map((week, weekIndex) => (
              <Box key={weekIndex} sx={{ display: 'flex', flexDirection: 'column' }}>
                {week.days.map((day, dayIndex) => (
                  <Tooltip
                    key={dayIndex}
                    title={
                      <Box>
                        <Typography variant="body2" sx={{ fontSize: '12px', fontWeight: 500 }}>
                          {day.count} contribution{day.count !== 1 ? 's' : ''} on {new Date(day.date).toLocaleDateString(undefined, { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </Typography>
                        {day.count > 0 && (
                          <Typography variant="body2" sx={{ fontSize: '11px', opacity: 0.8 }}>
                            {day.count} commit{day.count !== 1 ? 's' : ''} on this day
                          </Typography>
                        )}
                      </Box>
                    }
                    arrow
                  >
                    <Box 
                      sx={{
                        width: 10,
                        height: 10,
                        m: '2px',
                        borderRadius: '2px',
                        backgroundColor: getLevelColor(day.level),
                        boxShadow: day.level > 0 ? '0 1px 3px rgba(0, 0, 0, 0.2)' : 'none',
                        '&:hover': {
                          outline: '1px solid rgba(255, 255, 255, 0.3)',
                          transform: 'scale(1.15)',
                          transition: 'transform 0.1s ease-in-out'
                        },
                        cursor: 'pointer'
                      }}
                    />
                  </Tooltip>
                ))}
              </Box>
            ))}
          </Box>
          
          {/* GitHub username link */}
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link 
              href={`https://github.com/${contributionData?.username || username}`}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ 
                color: 'var(--text-color)',
                opacity: 0.7,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                '&:hover': {
                  opacity: 1,
                  textDecoration: 'underline'
                }
              }}
            >
              <GitHub sx={{ fontSize: 14, mr: 0.5 }} />
              {contributionData?.username || username}
            </Link>
          </Box>
        </Box>
      ) : (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          flexGrow: 1,
          flexDirection: 'column'
        }}>
          <GitHub sx={{ 
            fontSize: 40, 
            mb: 2, 
            opacity: 0.7,
            color: 'var(--text-color)' 
          }} />
          <Typography variant="body2" sx={{ mb: 2, color: 'var(--text-color)', textAlign: 'center' }}>
            Connect to GitHub to display your contribution graph
          </Typography>
          <Button 
            variant="outlined" 
            onClick={handleOpenDialog}
            startIcon={<GitHub />}
            sx={{ 
              borderColor: 'rgba(255, 255, 255, 0.2)',
              color: 'var(--text-color)',
              backdropFilter: 'blur(5px)',
              '&:hover': { 
                borderColor: 'rgba(255, 255, 255, 0.4)', 
                backgroundColor: 'rgba(255, 255, 255, 0.1)' 
              } 
            }}
          >
            Connect GitHub Account
          </Button>
        </Box>
      )}

      {/* Settings Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(22, 27, 34, 0.9)',
            backdropFilter: 'blur(10px)',
            color: 'var(--text-color)',
            borderRadius: 'var(--radius-md)',
            maxWidth: '450px',
            width: '100%',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <GitHub sx={{ mr: 1, fontSize: 20 }} />
            Connect GitHub Account
          </Box>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 3, opacity: 0.8 }}>
              To display your GitHub contributions, you need to provide your username and a personal access token.
            </Typography>
            
            <TextField
              autoFocus
              margin="dense"
              label="GitHub Username"
              fullWidth
              variant="outlined"
              value={inputUsername}
              onChange={(e) => setInputUsername(e.target.value)}
              disabled={process.env.NODE_ENV === 'development'} // Disable in dev mode as it's not used
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.4)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.6)',
                  },
                  color: 'var(--text-color)'
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&.Mui-focused': {
                    color: 'rgba(255, 255, 255, 0.9)'
                  }
                }
              }}
            />
            
            <FormControl variant="outlined" fullWidth sx={{ mb: 1 }}>
              <InputLabel 
                htmlFor="github-token" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&.Mui-focused': {
                    color: 'rgba(255, 255, 255, 0.9)'
                  }
                }}
              >
                Personal Access Token
              </InputLabel>
              <OutlinedInput
                id="github-token"
                type={showToken ? 'text' : 'password'}
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value)}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle token visibility"
                      onClick={handleToggleTokenVisibility}
                      edge="end"
                      sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                    >
                      {showToken ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                label="Personal Access Token"
                sx={{
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.4)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.6)',
                  },
                  color: 'var(--text-color)'
                }}
                disabled={process.env.NODE_ENV === 'development'} // Disable in dev mode
              />
              <FormHelperText sx={{ color: 'rgba(255, 255, 255, 0.6)', mt: 1 }}>
                <Link 
                  href="https://github.com/settings/tokens/new?scopes=read:user&description=Widgetopia%20Contribution%20Graph" 
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: 'rgba(120, 180, 255, 0.9)' }}
                >
                  Create a token
                </Link> with at least <code style={{ background: 'rgba(0,0,0,0.2)', padding: '2px 4px', borderRadius: '3px' }}>read:user</code> scope
              </FormHelperText>
            </FormControl>
            
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block', mt: 2 }}>
              Your token is stored locally in your browser and is only sent directly to GitHub's API.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button 
              onClick={handleCloseDialog} 
              sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={(!inputUsername.trim() || !inputToken) && !import.meta.env.DEV}
              sx={{ 
                backgroundColor: 'rgba(35, 134, 54, 0.8)', 
                '&:hover': { backgroundColor: 'rgba(46, 160, 67, 0.9)' },
                '&.Mui-disabled': { backgroundColor: 'rgba(35, 134, 54, 0.3)' },
                backdropFilter: 'blur(5px)'
              }}
            >
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Paper>
  );
};

export default Github; 