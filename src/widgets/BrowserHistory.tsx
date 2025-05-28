import React, { useState, useEffect } from 'react';
import {
  Paper, Typography, Box, List, ListItem, ListItemText, IconButton,
  CircularProgress, Link, Divider, Alert, Chip, Avatar, Tooltip,
  Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { motion } from 'framer-motion';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import RefreshIcon from '@mui/icons-material/Refresh';
import HistoryIcon from '@mui/icons-material/History';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface HistoryItem {
  id: string;
  url: string;
  title: string;
  visitCount: number;
  lastVisitTime: number;
  typedCount?: number;
}

interface TimeRange {
  label: string;
  value: number; // milliseconds
}

const TIME_RANGES: TimeRange[] = [
  { label: 'Last 24 hours', value: 24 * 60 * 60 * 1000 },
  { label: 'Last 3 days', value: 3 * 24 * 60 * 60 * 1000 },
  { label: 'Last week', value: 7 * 24 * 60 * 60 * 1000 },
  { label: 'Last month', value: 30 * 24 * 60 * 60 * 1000 },
  { label: 'All time', value: 0 }
];

// Mock data for development environment
const getMockHistoryData = (): HistoryItem[] => {
  return [
    {
      id: '1',
      url: 'https://github.com',
      title: 'GitHub: Let\'s build from here',
      visitCount: 45,
      lastVisitTime: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
      typedCount: 12
    },
    {
      id: '2',
      url: 'https://stackoverflow.com',
      title: 'Stack Overflow - Where Developers Learn, Share, & Build Careers',
      visitCount: 38,
      lastVisitTime: Date.now() - 4 * 60 * 60 * 1000, // 4 hours ago
      typedCount: 8
    },
    {
      id: '3',
      url: 'https://developer.mozilla.org',
      title: 'MDN Web Docs',
      visitCount: 32,
      lastVisitTime: Date.now() - 6 * 60 * 60 * 1000, // 6 hours ago
      typedCount: 15
    },
    {
      id: '4',
      url: 'https://react.dev',
      title: 'React – The library for web and native user interfaces',
      visitCount: 28,
      lastVisitTime: Date.now() - 8 * 60 * 60 * 1000, // 8 hours ago
      typedCount: 6
    },
    {
      id: '5',
      url: 'https://www.youtube.com',
      title: 'YouTube',
      visitCount: 25,
      lastVisitTime: Date.now() - 12 * 60 * 60 * 1000, // 12 hours ago
      typedCount: 3
    },
    {
      id: '6',
      url: 'https://www.google.com',
      title: 'Google',
      visitCount: 22,
      lastVisitTime: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
      typedCount: 18
    },
    {
      id: '7',
      url: 'https://chatgpt.com',
      title: 'ChatGPT',
      visitCount: 20,
      lastVisitTime: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
      typedCount: 7
    },
    {
      id: '8',
      url: 'https://www.reddit.com',
      title: 'Reddit - Dive into anything',
      visitCount: 18,
      lastVisitTime: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
      typedCount: 4
    }
  ];
};

const BrowserHistory: React.FC = () => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<number>(TIME_RANGES[0].value);
  const [maxResults, setMaxResults] = useState<number>(10);

  // Fetch browser history
  const fetchHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      // Check if we're in a Chrome extension environment
      if (typeof chrome === 'undefined' || !chrome.history) {
        // Development environment fallback - show mock data
        if (process.env.NODE_ENV === 'development' || window.location.protocol === 'http:') {
          console.warn('Chrome extension APIs not available in development environment. Showing mock data.');
          setHistoryItems(getMockHistoryData());
          setLoading(false);
          return;
        }
        throw new Error('Browser history API not available. Please ensure the extension is properly installed and the history permission is granted.');
      }

      const startTime = selectedTimeRange > 0 ? Date.now() - selectedTimeRange : 0;
      
      const results = await chrome.history.search({
        text: '', // Empty text to get all history
        startTime: startTime,
        maxResults: 1000 // Get more results to filter and sort properly
      });

      // Filter out items without titles and sort by visit count
      const filteredResults = results
        .filter(item => item.title && item.url && item.visitCount && item.visitCount > 1)
        .filter(item => {
          // Filter out common browser pages and extensions
          const url = item.url || '';
          return !url.startsWith('chrome://') && 
                 !url.startsWith('chrome-extension://') &&
                 !url.startsWith('edge://') &&
                 !url.startsWith('about:') &&
                 !url.includes('newtab') &&
                 url.length > 0;
        })
        .sort((a, b) => (b.visitCount || 0) - (a.visitCount || 0))
        .slice(0, maxResults)
        .map(item => ({
          id: item.id || '',
          url: item.url || '',
          title: item.title || 'Untitled',
          visitCount: item.visitCount || 0,
          lastVisitTime: item.lastVisitTime || 0,
          typedCount: item.typedCount || 0
        }));

      setHistoryItems(filteredResults);
    } catch (err) {
      console.error('Error fetching browser history:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch browser history');
      setHistoryItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch history on component mount and when filters change
  useEffect(() => {
    fetchHistory();
  }, [selectedTimeRange, maxResults]);

  const handleRefresh = () => {
    fetchHistory();
  };

  const formatLastVisit = (timestamp: number) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Less than an hour ago';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return null;
    }
  };

  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <Paper
      elevation={0}
      className="glass glass-holographic glass-glow glass-interactive"
      sx={{
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'var(--radius-lg)',
        position: 'relative',
        overflow: 'hidden',
        animation: 'fadeIn 2s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HistoryIcon sx={{ fontSize: 20 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
            Most Visited
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {/* Time Range Selector */}
          <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
            <Select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as number)}
              displayEmpty
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                '& .MuiSelect-select': { py: 0.5, px: 1, fontSize: '0.8rem' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.4)' },
              }}
            >
              {TIME_RANGES.map((range) => (
                <MenuItem key={range.value} value={range.value} sx={{ fontSize: '0.8rem' }}>
                  {range.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Results Count Selector */}
          <FormControl variant="outlined" size="small" sx={{ minWidth: 60 }}>
            <Select
              value={maxResults}
              onChange={(e) => setMaxResults(e.target.value as number)}
              displayEmpty
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                '& .MuiSelect-select': { py: 0.5, px: 1, fontSize: '0.8rem' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.4)' },
              }}
            >
              {[5, 10, 15, 20].map((count) => (
                <MenuItem key={count} value={count} sx={{ fontSize: '0.8rem' }}>
                  {count}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {loading ? (
            <span title="Refresh History">
              <IconButton size="small" disabled sx={{ pointerEvents: 'none' }}>
                <RefreshIcon />
              </IconButton>
            </span>
          ) : (
            <IconButton size="small" onClick={handleRefresh} title="Refresh History">
              <RefreshIcon />
            </IconButton>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 1.5, fontSize: '0.8rem' }}>
          {error}
        </Alert>
      )}

      <Divider sx={{ mb: 1.5, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', pt: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : historyItems.length > 0 ? (
          <List sx={{ p: 0 }}>
            {historyItems.map((item, index) => (
              <motion.div
                key={item.id + index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    p: 1.5,
                    mb: 1,
                    borderRadius: 1,
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.07)',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', gap: 1.5 }}>
                    {/* Favicon */}
                    <Avatar
                      src={getFaviconUrl(item.url) || undefined}
                      sx={{
                        width: 24,
                        height: 24,
                        mt: 0.5,
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                        fontSize: '0.7rem'
                      }}
                    >
                      {getDomainFromUrl(item.url).charAt(0).toUpperCase()}
                    </Avatar>

                    {/* Content */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Link
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        color="inherit"
                        underline="hover"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          fontWeight: 500,
                          fontSize: '0.9rem',
                          mb: 0.5,
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {item.title}
                        <OpenInNewIcon sx={{ ml: 0.5, fontSize: 14, opacity: 0.7, flexShrink: 0 }} />
                      </Link>

                      <Typography
                        variant="body2"
                        sx={{
                          opacity: 0.7,
                          fontSize: '0.75rem',
                          mb: 0.5,
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {getDomainFromUrl(item.url)}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Tooltip title="Visit count">
                          <Chip
                            icon={<TrendingUpIcon />}
                            label={`${item.visitCount} visits`}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.65rem',
                              bgcolor: 'rgba(76, 175, 80, 0.2)',
                              color: 'rgba(76, 175, 80, 1)',
                              '& .MuiChip-icon': { fontSize: 12 }
                            }}
                          />
                        </Tooltip>

                        <Tooltip title="Last visited">
                          <Chip
                            icon={<AccessTimeIcon />}
                            label={formatLastVisit(item.lastVisitTime)}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.65rem',
                              bgcolor: 'rgba(33, 150, 243, 0.2)',
                              color: 'rgba(33, 150, 243, 1)',
                              '& .MuiChip-icon': { fontSize: 12 }
                            }}
                          />
                        </Tooltip>

                        {item.typedCount && item.typedCount > 0 && (
                          <Tooltip title="Times typed in address bar">
                            <Chip
                              label={`${item.typedCount} typed`}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '0.65rem',
                                bgcolor: 'rgba(156, 39, 176, 0.2)',
                                color: 'rgba(156, 39, 176, 1)'
                              }}
                            />
                          </Tooltip>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </ListItem>
                {index < historyItems.length - 1 && (
                  <Divider component="li" sx={{ bgcolor: 'rgba(255, 255, 255, 0.04)' }} />
                )}
              </motion.div>
            ))}
          </List>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', pt: 2 }}>
            <Typography variant="body2" sx={{ opacity: 0.7, textAlign: 'center' }}>
              No browsing history found for the selected time range.
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default BrowserHistory; 