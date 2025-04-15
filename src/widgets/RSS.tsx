import React, { useState, useEffect } from 'react';
import {
  Paper, Typography, Box, List, ListItem, ListItemText, IconButton,
  TextField, Button, Chip, CircularProgress, Link, Divider, Alert,
  Dialog, DialogActions, DialogContent, DialogTitle, Fade,
  Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { motion } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import RefreshIcon from '@mui/icons-material/Refresh';

interface RssItem {
  title: string;
  link: string;
  pubDate?: string;
  description?: string;
}

interface RssFeed {
  id: string;
  url: string;
  title?: string;
}

const DEFAULT_RSS_FEED = 'https://www.testingcatalog.com/rss/';

const RSS: React.FC = () => {
  const [feeds, setFeeds] = useState<RssFeed[]>(() => {
    const savedFeeds = localStorage.getItem('rssFeeds');
    if (savedFeeds) {
      const parsedFeeds = JSON.parse(savedFeeds);
      // Ensure at least one feed exists
      return parsedFeeds.length > 0 ? parsedFeeds : [{ id: '1', url: DEFAULT_RSS_FEED, title: 'Default Feed' }];
    }
    return [{ id: '1', url: DEFAULT_RSS_FEED, title: 'Default Feed' }];
  });

  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [feedItems, setFeedItems] = useState<RssItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use state for active feed, load from storage or default to first feed
  const [activeFeed, setActiveFeed] = useState<string>(() => {
    const savedActiveFeed = localStorage.getItem('activeRssFeedId');
    const firstFeedId = feeds.length > 0 ? feeds[0].id : null;
    // Check if saved feed ID still exists in the feeds list
    const savedFeedExists = feeds.some(f => f.id === savedActiveFeed);
    return savedActiveFeed && savedFeedExists ? savedActiveFeed : firstFeedId || '';
  });

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Save feeds to localStorage when they change
  useEffect(() => {
    localStorage.setItem('rssFeeds', JSON.stringify(feeds));
  }, [feeds]);

  // Save active feed ID to localStorage
  useEffect(() => {
    if (activeFeed) {
      localStorage.setItem('activeRssFeedId', activeFeed);
    }
  }, [activeFeed]);

  // Fetch RSS feed when activeFeed changes or component mounts
  useEffect(() => {
    if (activeFeed) {
      fetchRssFeed(activeFeed);
    } else if (feeds.length > 0) {
      // If no active feed is set (e.g., first load, or deleted active), set to first feed
      setActiveFeed(feeds[0].id);
    } else {
      // No feeds available
      setFeedItems([]);
      setLoading(false);
      setError("No RSS feeds added. Add one using the '+' button.");
    }
    // Intentionally omitting feeds from dependency array to avoid loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFeed]); // Only refetch when activeFeed changes

  const fetchRssFeed = async (feedId: string) => {
    setLoading(true);
    setError(null);
    setActiveFeed(feedId); // Ensure activeFeed state is updated

    const feed = feeds.find(f => f.id === feedId);
    if (!feed) {
      setError(`Feed with ID ${feedId} not found.`);
      setLoading(false);
      // Try setting to the first feed if the active one is gone
      if (feeds.length > 0) setActiveFeed(feeds[0].id);
      return;
    }

    try {
      const response = await fetch(
        `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch feed (HTTP ${response.status})`);
      }

      const data = await response.json();

      if (data.status !== 'ok') {
        throw new Error(data.message || 'Error parsing feed data');
      }

      // Update feed title if not already set or different
      if (data.feed?.title && (!feed.title || feed.title !== data.feed.title)) {
        setFeeds(prev =>
          prev.map(f => f.id === feedId ? { ...f, title: data.feed.title } : f)
        );
      }

      setFeedItems(data.items.map((item: any) => ({
        title: item.title,
        link: item.link,
        pubDate: new Date(item.pubDate).toLocaleString(),
        description: item.description
      })));
    } catch (err) {
      console.error('Error fetching RSS feed:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch RSS feed');
      setFeedItems([]); // Clear items on error
    } finally {
      setLoading(false);
    }
  };

  const handleAddFeed = () => {
    if (!newFeedUrl.trim()) return;

    try {
      new URL(newFeedUrl); // Basic validation
    } catch (e) {
      setError('Please enter a valid URL');
      // Optionally show error in dialog instead of main view
      return;
    }

    const newId = Date.now().toString();
    const newFeed = { id: newId, url: newFeedUrl };
    setFeeds(prev => [...prev, newFeed]);
    setNewFeedUrl('');
    // Don't close dialog, user might want to add more or delete
    // setIsAddDialogOpen(false);
    // Fetch the newly added feed immediately
    fetchRssFeed(newId);
    setError(null); // Clear previous errors
  };

  const handleDeleteFeed = (idToDelete: string) => {
    setFeeds(prev => prev.filter(feed => feed.id !== idToDelete));

    // If we deleted the active feed, switch to the first available feed (if any)
    if (activeFeed === idToDelete) {
      const nextFeed = feeds.find(f => f.id !== idToDelete); // Find the first remaining feed
      if (nextFeed) {
        setActiveFeed(nextFeed.id); // Fetch this next feed
      } else {
        // No feeds left
        setActiveFeed(''); // Clear active feed
        setFeedItems([]);
        setError("No RSS feeds remaining.");
      }
    }
    // If deleting a non-active feed, no need to change activeFeed
  };

  const handleRefresh = () => {
    if (activeFeed) {
      fetchRssFeed(activeFeed);
    }
  };

  const formatDescription = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    const text = tmp.textContent || tmp.innerText || '';
    return text.substring(0, 120) + (text.length > 120 ? '...' : '');
  };

  const getFeedDisplayName = (feed: RssFeed) => {
    if (feed.title) return feed.title;
    try {
      const url = new URL(feed.url);
      return url.hostname; // Fallback to hostname
    } catch {
      return feed.url; // Fallback to full URL if invalid
    }
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
        borderRadius: 'var(--radius-lg)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        {/* Feed Selector Dropdown */}
        <FormControl variant="outlined" size="small" sx={{ minWidth: 150, flexGrow: 1 }}>
          {/* <InputLabel id="rss-select-label">Feed</InputLabel> */}
          <Select
            labelId="rss-select-label"
            id="rss-select"
            value={activeFeed}
            onChange={(e) => setActiveFeed(e.target.value as string)}
            // label="Feed" // Removed label to save space, using placeholder logic maybe
            displayEmpty // Allows showing placeholder or first item
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              '& .MuiSelect-select': { py: 0.8, px: 1.5 },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.2)' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.4)' },
            }}
          >
            {feeds.length === 0 && <MenuItem value="" disabled>No feeds available</MenuItem>}
            {feeds.map((feed) => (
              <MenuItem key={feed.id} value={feed.id}>
                {getFeedDisplayName(feed)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Action Buttons */}
        <Box>
          <IconButton size="small" onClick={() => setIsAddDialogOpen(true)} title="Manage & Add Feeds">
            <AddIcon />
          </IconButton>
          <IconButton size="small" onClick={handleRefresh} disabled={loading || !activeFeed} title="Refresh Feed">
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {error && (
        <Alert severity={feedItems.length === 0 ? "info" : "error"} sx={{ mb: 1.5, fontSize: '0.8rem' }}>
          {error}
        </Alert>
      )}

      <Divider sx={{ mb: 1.5, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', pt: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : feedItems.length > 0 ? (
          <List sx={{ p: 0 }}>
            {feedItems.map((item, index) => (
              <motion.div
                key={item.link + index} // Add index for potential duplicate links
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
                  <ListItemText
                    primary={
                      <Link
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        color="inherit"
                        underline="hover"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          fontWeight: 500,
                          fontSize: '0.95rem',
                        }}
                      >
                        {item.title}
                        <OpenInNewIcon sx={{ ml: 0.5, fontSize: 16, opacity: 0.7 }} />
                      </Link>
                    }
                    secondary={
                      <>
                        {item.description && (
                          <Typography component="div" variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
                            {formatDescription(item.description)}
                          </Typography>
                        )}
                        {item.pubDate && (
                          <Typography component="div" variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.6 }}>
                            {item.pubDate}
                          </Typography>
                        )}
                      </>
                    }
                    secondaryTypographyProps={{ component: 'div' }}
                  />
                </ListItem>
                {index < feedItems.length - 1 && (
                  <Divider component="li" sx={{ bgcolor: 'rgba(255, 255, 255, 0.04)' }} />
                )}
              </motion.div>
            ))}
          </List>
        ) : !error ? ( // Only show "No items" if there wasn't a fetch error
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', pt: 2 }}>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              No items found in this feed or feed is empty.
            </Typography>
          </Box>
        ) : null /* Error message is already shown */ }
      </Box>

      {/* Manage & Add Feed Dialog */}
      <Dialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        PaperProps={{
          component: motion.div,
          initial: { opacity: 0, y: -20 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -20 },
          transition: { duration: 0.2 },
          sx: {
            width: '90%',
            maxWidth: '500px', // Max width for the dialog
            borderRadius: 'var(--radius-md)',
            bgcolor: 'var(--background-secondary-alpha)',
            backdropFilter: 'blur(10px)',
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>Manage & Add Feeds</DialogTitle>
        <DialogContent>
          {/* Add New Feed Section */}
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>Add New Feed</Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              placeholder="Enter RSS Feed URL"
              type="url"
              fullWidth
              variant="outlined"
              size="small"
              value={newFeedUrl}
              onChange={(e) => setNewFeedUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddFeed(); }}
              sx={{
                mt: 0, // Adjusted margin
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                  '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                },
              }}
            />
            <Button onClick={handleAddFeed} variant="contained" color="primary" size="small" sx={{ height: '40px', mt: '8px' }}>Add</Button>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Existing Feeds List */}
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>Your Feeds</Typography>
          <Box sx={{ maxHeight: '200px', overflowY: 'auto', pr: 1 }}> {/* Scrollable list */}
            {feeds.length > 0 ? (
              <List dense>
                {feeds.map((feed) => (
                  <ListItem
                    key={feed.id}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDeleteFeed(feed.id)}
                        size="small"
                        disabled={feeds.length <= 1} // Disable delete if only one feed left
                        title={feeds.length <= 1 ? "Cannot delete the last feed" : "Delete feed"}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    }
                    sx={{ pr: 5 }} // Add padding to prevent overlap with delete icon
                  >
                    <ListItemText
                      primary={getFeedDisplayName(feed)}
                      secondary={feed.url}
                      primaryTypographyProps={{ sx: { textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' } }}
                      secondaryTypographyProps={{ sx: { textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.7, fontSize: '0.75rem' } }}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" sx={{ textAlign: 'center', opacity: 0.7 }}>
                No feeds added yet.
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setIsAddDialogOpen(false)} color="secondary">Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default RSS; 