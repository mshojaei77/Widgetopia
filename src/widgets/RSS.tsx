import React, { useState, useEffect } from 'react';
import {
  Paper, Typography, Box, List, ListItem, ListItemText, IconButton,
  TextField, Button, Chip, CircularProgress, Link, Divider, Alert,
  Dialog, DialogActions, DialogContent, DialogTitle, Fade,
  Select, MenuItem, FormControl, InputLabel
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import RefreshIcon from '@mui/icons-material/Refresh';

interface RssItem {
  title: string;
  link: string;
  pubDate?: string;
  description?: string;
  feedSource?: string; // Add source feed info for merged view
}

interface RssFeed {
  id: string;
  url: string;
  title?: string;
}

// Array of robust, popular default RSS feeds
const DEFAULT_RSS_FEEDS: RssFeed[] = [
  { id: '1', url: 'https://www.testingcatalog.com/rss/', title: 'Testing Catalog - AI News' },
  { id: '2', url: 'https://techcrunch.com/feed/', title: 'TechCrunch - Technology News & Startups' },
  { id: '3', url: 'https://www.wired.com/feed/rss', title: 'WIRED - Technology, Science & Culture' },
  { id: '4', url: 'https://feeds.arstechnica.com/arstechnica/index', title: 'Ars Technica - Technology Analysis' },
  { id: '5', url: 'https://stackoverflow.blog/feed', title: 'Stack Overflow Blog - Developer Insights' },
  { id: '6', url: 'https://feeds.ign.com/ign/games-all', title: 'IGN - Gaming News & Reviews' },
  { id: '7', url: 'https://www.polygon.com/rss/index.xml', title: 'Polygon - Gaming Culture' },
  { id: '8', url: 'https://lifehacker.com/rss', title: 'Lifehacker - Productivity & Life Tips' },
  { id: '9', url: 'https://www.theverge.com/rss/index.xml', title: 'The Verge - Technology & Digital Culture' },
  { id: '10', url: 'https://www.ksat.com/arc/outboundfeeds/rss/category/news/?outputType=xml&size=10', title: 'Ksat - News' },
  { id: '11', url: 'https://faroutmagazine.co.uk/feed/', title: 'Far Out Magazine - Music, Culture & Lifestyle' },
  { id: '12', url: 'https://theplaylist.net/feed/', title: 'The Playlist - Music, Culture & Lifestyle' },
  { id: '13', url: 'https://feeds.feedburner.com/variety/headlines', title: 'Variety - Entertainment News' },
];

const RSS: React.FC = () => {
  const [feeds, setFeeds] = useState<RssFeed[]>(() => {
    const savedFeeds = localStorage.getItem('rssFeeds');
    if (savedFeeds) {
      const parsedFeeds = JSON.parse(savedFeeds);
      // Ensure at least one feed exists
      return parsedFeeds.length > 0 ? parsedFeeds : DEFAULT_RSS_FEEDS;
    }
    return DEFAULT_RSS_FEEDS;
  });

  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [feedItems, setFeedItems] = useState<RssItem[]>([]);
  const [loading, setLoading] = useState(false); // Set to false for instant loading
  const [error, setError] = useState<string | null>(null);

  // Use state for active feed, load from storage or default to "all" feeds
  const [activeFeed, setActiveFeed] = useState<string>(() => {
    const savedActiveFeed = localStorage.getItem('activeRssFeedId');
    // Check if saved feed ID still exists in the feeds list or is "all"
    const savedFeedExists = feeds.some(f => f.id === savedActiveFeed) || savedActiveFeed === 'all';
    
    if (savedActiveFeed && savedFeedExists) {
      return savedActiveFeed;
    }
    
    // Default to "all" if there are multiple feeds, otherwise use the first feed
    if (feeds.length > 1) {
      return 'all';
    } else if (feeds.length === 1) {
      return feeds[0].id;
    }
    
    return '';
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
    if (activeFeed === 'all') {
      fetchAllFeeds();
    } else if (activeFeed) {
      fetchRssFeed(activeFeed);
    } else if (feeds.length > 1) {
      // If no active feed is set and there are multiple feeds, default to "all"
      setActiveFeed('all');
    } else if (feeds.length === 1) {
      // If only one feed, set to that feed
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

  const fetchAllFeeds = async () => {
    setLoading(true);
    setError(null);
    setActiveFeed('all'); // Ensure activeFeed state is updated

    if (feeds.length === 0) {
      setFeedItems([]);
      setLoading(false);
      setError("No RSS feeds available to merge.");
      return;
    }

    try {
      // Fetch all feeds concurrently
      const feedPromises = feeds.map(async (feed) => {
        try {
          const response = await fetch(
            `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`
          );

          if (!response.ok) {
            console.warn(`Failed to fetch feed ${feed.title || feed.url}: HTTP ${response.status}`);
            return { feed, items: [] };
          }

          const data = await response.json();

          if (data.status !== 'ok') {
            console.warn(`Error parsing feed ${feed.title || feed.url}: ${data.message}`);
            return { feed, items: [] };
          }

          // Update feed title if not already set or different
          if (data.feed?.title && (!feed.title || feed.title !== data.feed.title)) {
            setFeeds(prev =>
              prev.map(f => f.id === feed.id ? { ...f, title: data.feed.title } : f)
            );
          }

          return {
            feed,
            items: data.items.map((item: any) => ({
              title: item.title,
              link: item.link,
              pubDate: new Date(item.pubDate).toLocaleString(),
              description: item.description,
              feedSource: feed.title || feed.url
            }))
          };
        } catch (err) {
          console.warn(`Error fetching feed ${feed.title || feed.url}:`, err);
          return { feed, items: [] };
        }
      });

      const results = await Promise.all(feedPromises);
      
      // Combine all items and sort by publication date (newest first)
      const allItems = results.flatMap(result => result.items);
      const sortedItems = allItems.sort((a, b) => {
        const dateA = new Date(a.pubDate || 0).getTime();
        const dateB = new Date(b.pubDate || 0).getTime();
        return dateB - dateA; // Newest first
      });

      setFeedItems(sortedItems);

      if (sortedItems.length === 0) {
        setError("No articles found in any of the RSS feeds.");
      }
    } catch (err) {
      console.error('Error fetching merged RSS feeds:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch RSS feeds');
      setFeedItems([]);
    } finally {
      setLoading(false);
    }
  };

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

    // If we deleted the active feed, switch to appropriate default
    if (activeFeed === idToDelete) {
      const remainingFeeds = feeds.filter(f => f.id !== idToDelete);
      if (remainingFeeds.length > 1) {
        setActiveFeed('all'); // Default to "all" if multiple feeds remain
      } else if (remainingFeeds.length === 1) {
        setActiveFeed(remainingFeeds[0].id); // Switch to the only remaining feed
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
    if (activeFeed === 'all') {
      fetchAllFeeds();
    } else if (activeFeed) {
      fetchRssFeed(activeFeed);
    }
  };

  const formatDescription = (html: string) => {
    // Safely extract text content without using innerHTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const text = doc.body.textContent || doc.body.innerText || '';
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
      className="glass glass-holographic glass-particles glass-premium"
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
            {feeds.length > 1 && (
              <MenuItem value="all">
                <Box sx={{ display: 'flex', alignItems: 'center', fontWeight: 600 }}>
                  📰 All Feeds ({feeds.length})
                </Box>
              </MenuItem>
            )}
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
          {loading || !activeFeed ? (
            <span title="Refresh Feed">
              <IconButton size="small" disabled sx={{ pointerEvents: 'none' }}>
                <RefreshIcon />
              </IconButton>
            </span>
          ) : (
            <IconButton size="small" onClick={handleRefresh} title="Refresh Feed">
              <RefreshIcon />
            </IconButton>
          )}
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
              <Box key={item.link + index}>
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
                        {activeFeed === 'all' && item.feedSource && (
                          <Chip
                            label={item.feedSource}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.7rem',
                              bgcolor: 'rgba(255, 255, 255, 0.1)',
                              color: 'rgba(255, 255, 255, 0.8)',
                              mb: 0.5,
                              '& .MuiChip-label': { px: 1 }
                            }}
                          />
                        )}
                        {item.description && (
                          <Typography component="div" variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
                            {formatDescription(item.description)}
                          </Typography>
                        )}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                          {item.pubDate && (
                            <Typography component="div" variant="caption" sx={{ opacity: 0.6 }}>
                              {item.pubDate}
                            </Typography>
                          )}
                        </Box>
                      </>
                    }
                    secondaryTypographyProps={{ component: 'div' }}
                  />
                </ListItem>
                {index < feedItems.length - 1 && (
                  <Divider component="li" sx={{ bgcolor: 'rgba(255, 255, 255, 0.04)' }} />
                )}
              </Box>
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
          sx: {
            width: '90%',
            maxWidth: '500px', // Max width for the dialog
            borderRadius: 'var(--radius-md)',
            bgcolor: 'var(--background-secondary-alpha)',
            backdropFilter: 'blur(7px)',
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
                      feeds.length <= 1 ? (
                        <span title="Cannot delete the last feed">
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            size="small"
                            disabled
                            sx={{ pointerEvents: 'none' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </span>
                      ) : (
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDeleteFeed(feed.id)}
                          size="small"
                          title="Delete feed"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )
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