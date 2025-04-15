import React, { useState, useRef, useEffect } from 'react';
import { 
  Paper, 
  Box, 
  Stack, 
  IconButton, 
  TextField, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Tooltip,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Menu,
  MenuItem,
  InputLabel,
  Select,
  FormControl,
  Divider,
  ListItemSecondaryAction,
  Switch,
  FormControlLabel,
  Slider
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { 
  SkipNext, 
  SkipPrevious, 
  PlayArrow, 
  Pause, 
  Add,
  Delete,
  Edit,
  Save,
  PlaylistAdd,
  MoreVert,
  Settings,
  VolumeUp,
  VolumeOff,
  Refresh,
  PlaylistRemove,
  DeleteForever
} from '@mui/icons-material';

// Define the SoundCloud Widget API types
interface SCWidget {
  play: () => void;
  pause: () => void;
  seekTo: (milliseconds: number) => void;
  skip: (index: number) => void;
  next: () => void;
  prev: () => void;
  bind: (event: string, callback: () => void) => void;
  unbind: (event: string) => void;
  getCurrentSound: (callback: (sound: any) => void) => void;
  getSounds: (callback: (sounds: any[]) => void) => void;
  getCurrentSoundIndex: (callback: (index: number) => void) => void;
  setVolume: (volume: number) => void;
}

// Define the global SC object for TypeScript
declare global {
  interface Window {
    SC: {
      Widget: (iframe: HTMLIFrameElement) => SCWidget;
    }
  }
}

// Define SC Widget Events
const SC_EVENTS = {
  PLAY: 'play',
  PAUSE: 'pause',
  FINISH: 'finish',
  READY: 'ready'
};

// Helper function to determine if URL is a playlist
const isPlaylistUrl = (url: string): boolean => {
  // Playlists have "/sets/" in the path part of the URL
  const urlPath = url.split('?')[0];
  return urlPath.includes('/sets/');
};

// Helper function to determine if URL is a track within a playlist
const isTrackInPlaylist = (url: string): boolean => {
  // Tracks in playlists have "?in=" or "&in=" parameter
  return url.includes('?in=') || url.includes('&in=');
};

// Default playlist structure
const defaultPlaylist = {
  name: 'Persian Jazz',
  tracks: [
    'https://soundcloud.com/amirali-amiri-284341662/sets/1bkemtkzveqs?si=cef1e136eede4ccb85d4701486cdcd3a&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing',
  ]
};

// Type definition for a playlist
interface Playlist {
  name: string;
  tracks: string[];
}

const Music: React.FC = () => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    const savedPlaylists = localStorage.getItem('soundcloudPlaylists');
    return savedPlaylists ? JSON.parse(savedPlaylists) : [defaultPlaylist];
  });
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState(0);
  const [trackUrlInput, setTrackUrlInput] = useState('');
  const [playlistNameInput, setPlaylistNameInput] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openPlaylistDialog, setOpenPlaylistDialog] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [widgetReady, setWidgetReady] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const widgetRef = useRef<SCWidget | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTrackIndex, setSelectedTrackIndex] = useState<number | null>(null);
  const [openSettingsDialog, setOpenSettingsDialog] = useState(false);
  const [volume, setVolume] = useState<number>(80);
  const [muted, setMuted] = useState<boolean>(false);
  const [showComments, setShowComments] = useState<boolean>(false);
  const [showRelated, setShowRelated] = useState<boolean>(false);
  const [visual, setVisual] = useState<boolean>(true);
  const [autoPlay, setAutoPlay] = useState<boolean>(false);

  // Current playlist and tracks
  const currentPlaylist = playlists[currentPlaylistIndex];
  const currentTracks = currentPlaylist.tracks;

  // Initialize SoundCloud Widget
  useEffect(() => {
    // Load SoundCloud Widget API if not already loaded
    if (!window.SC) {
      const script = document.createElement('script');
      script.src = 'https://w.soundcloud.com/player/api.js';
      script.async = true;
      document.body.appendChild(script);
      
      script.onload = initializeWidget;
      
      return () => {
        document.body.removeChild(script);
      };
    } else {
      initializeWidget();
    }
  }, []);

  // Initialize widget when iframe is available
  const initializeWidget = () => {
    if (iframeRef.current && window.SC) {
      widgetRef.current = window.SC.Widget(iframeRef.current);
      
      widgetRef.current.bind(SC_EVENTS.READY, () => {
        setWidgetReady(true);
        console.log('SoundCloud widget ready');
        
        // Set initial volume
        widgetRef.current?.setVolume(muted ? 0 : volume / 100);
      });
      
      widgetRef.current.bind(SC_EVENTS.PLAY, () => {
        setIsPlaying(true);
      });
      
      widgetRef.current.bind(SC_EVENTS.PAUSE, () => {
        setIsPlaying(false);
      });
      
      widgetRef.current.bind(SC_EVENTS.FINISH, () => {
        handleNextTrack();
      });
    }
  };

  // Update widget when currentTracks or currentTrackIndex changes
  useEffect(() => {
    if (widgetReady && widgetRef.current && currentTracks.length > 0) {
      // Load new track if it's not the same URL
      const url = currentTracks[currentTrackIndex];
      
      // Check if the URL is already loaded before changing
      widgetRef.current.getCurrentSound((currentSound) => {
        // Only reload if there's no current sound or the URL has changed
        if (!currentSound || !currentSound.permalink_url || currentSound.permalink_url !== url) {
          // Reset the iframe with the new URL
          const isPlaylist = isPlaylistUrl(url);
          
          // Add appropriate parameters based on URL type
          let embedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}`;
          embedUrl += `&auto_play=${autoPlay}`;
          embedUrl += `&hide_related=${!showRelated}`;
          embedUrl += `&show_comments=${showComments}`;
          embedUrl += '&show_user=true';
          embedUrl += '&show_reposts=false';
          embedUrl += '&show_teaser=true';
          embedUrl += `&visual=${visual}`;
          
          // For playlists, we don't want to restrict to a single active sound
          if (isPlaylist) {
            embedUrl += '&single_active=false';
          }
          
          iframeRef.current!.src = embedUrl;
          
          // Re-initialize widget with new iframe
          setTimeout(initializeWidget, 100);
        }
      });
    }
  }, [currentTrackIndex, currentTracks, widgetReady, isPlaying, autoPlay, showComments, showRelated, visual]);

  // Initialize playlists if none exist in localStorage
  useEffect(() => {
    const savedPlaylists = localStorage.getItem('soundcloudPlaylists');
    if (!savedPlaylists) {
      setPlaylists([defaultPlaylist]);
    }
  }, []);

  // Save playlists to localStorage when they change
  useEffect(() => {
    localStorage.setItem('soundcloudPlaylists', JSON.stringify(playlists));
  }, [playlists]);

  const handleNextTrack = () => {
    if (widgetRef.current) {
      const currentUrl = currentTracks[currentTrackIndex];
      
      // Check if current URL is a playlist
      if (isPlaylistUrl(currentUrl)) {
        // For SoundCloud playlists, let the widget handle navigation
        widgetRef.current.getSounds((sounds: any[]) => {
          if (sounds && sounds.length > 1) {
            // It's a playlist with multiple tracks, let SoundCloud handle it
            widgetRef.current?.next();
          } else {
            // It looks like a playlist but might be empty, use our app's navigation
            setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % currentTracks.length);
          }
        });
      } else {
        // For individual tracks, use our app's navigation
        setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % currentTracks.length);
      }
    } else {
      setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % currentTracks.length);
    }
  };

  const handlePreviousTrack = () => {
    if (widgetRef.current) {
      const currentUrl = currentTracks[currentTrackIndex];
      
      // Check if current URL is a playlist
      if (isPlaylistUrl(currentUrl)) {
        // For SoundCloud playlists, let the widget handle navigation
        widgetRef.current.getSounds((sounds: any[]) => {
          if (sounds && sounds.length > 1) {
            // It's a playlist with multiple tracks, let SoundCloud handle it
            widgetRef.current?.prev();
          } else {
            // It looks like a playlist but might be empty, use our app's navigation
            setCurrentTrackIndex((prevIndex) => (prevIndex - 1 + currentTracks.length) % currentTracks.length);
          }
        });
      } else {
        // For individual tracks, use our app's navigation
        setCurrentTrackIndex((prevIndex) => (prevIndex - 1 + currentTracks.length) % currentTracks.length);
      }
    } else {
      setCurrentTrackIndex((prevIndex) => (prevIndex - 1 + currentTracks.length) % currentTracks.length);
    }
  };

  const handlePlayPause = () => {
    if (widgetRef.current) {
      if (isPlaying) {
        widgetRef.current.pause();
      } else {
        widgetRef.current.play();
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleAddTrack = () => {
    // Basic validation - check if it looks like a SoundCloud URL
    if (trackUrlInput.includes('soundcloud.com')) {
      const updatedPlaylists = [...playlists];
      updatedPlaylists[currentPlaylistIndex].tracks.push(trackUrlInput);
      setPlaylists(updatedPlaylists);
      setOpenDialog(false);
      setTrackUrlInput('');
    } else {
      console.warn('Invalid SoundCloud URL provided');
    }
  };

  const handleRemoveTrack = (index: number) => {
    const updatedPlaylists = [...playlists];
    updatedPlaylists[currentPlaylistIndex].tracks.splice(index, 1);
    setPlaylists(updatedPlaylists);
    
    // Adjust current track index if needed
    if (index === currentTrackIndex) {
      setIsPlaying(false);
      setCurrentTrackIndex(0);
    } else if (index < currentTrackIndex) {
      setCurrentTrackIndex(currentTrackIndex - 1);
    }
    
    handleCloseMenu();
  };

  const handlePlayTrack = (index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
    handleCloseMenu();
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setTrackUrlInput('');
  };

  const handleOpenPlaylistDialog = () => {
    setPlaylistNameInput('');
    setOpenPlaylistDialog(true);
  };

  const handleClosePlaylistDialog = () => {
    setOpenPlaylistDialog(false);
  };

  const handleCreatePlaylist = () => {
    if (playlistNameInput.trim()) {
      const newPlaylist = {
        name: playlistNameInput,
        tracks: []
      };
      setPlaylists([...playlists, newPlaylist]);
      setCurrentPlaylistIndex(playlists.length);
      setCurrentTrackIndex(0);
      setOpenPlaylistDialog(false);
    }
  };

  const handleChangePlaylist = (event: SelectChangeEvent) => {
    const newIndex = parseInt(event.target.value, 10);
    setCurrentPlaylistIndex(newIndex);
    setCurrentTrackIndex(0);
    setIsPlaying(false);
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, index: number) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedTrackIndex(index);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setSelectedTrackIndex(null);
  };

  // Ensure playlist is not empty before accessing index
  const soundcloudUrl = currentTracks.length > 0 ? currentTracks[currentTrackIndex] : '';

  // Handle settings changes
  const handleVolumeChange = (_event: Event, newValue: number | number[]) => {
    const newVolume = newValue as number;
    setVolume(newVolume);
    if (widgetRef.current) {
      widgetRef.current.setVolume(newVolume / 100);
    }
  };

  const handleMuteToggle = () => {
    const newMuted = !muted;
    setMuted(newMuted);
    if (widgetRef.current) {
      widgetRef.current.setVolume(newMuted ? 0 : volume / 100);
    }
  };

  const handleToggleComments = () => {
    setShowComments(!showComments);
    // Reload iframe with new settings
    updateIframeSettings();
  };

  const handleToggleRelated = () => {
    setShowRelated(!showRelated);
    // Reload iframe with new settings
    updateIframeSettings();
  };

  const handleToggleVisual = () => {
    setVisual(!visual);
    // Reload iframe with new settings
    updateIframeSettings();
  };

  const handleToggleAutoPlay = () => {
    setAutoPlay(!autoPlay);
    // Reload iframe with new settings
    updateIframeSettings();
  };

  const updateIframeSettings = () => {
    if (widgetReady && widgetRef.current && currentTracks.length > 0) {
      const url = currentTracks[currentTrackIndex];
      const isPlaylist = isPlaylistUrl(url);
      
      // Build embed URL with updated settings
      let embedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}`;
      embedUrl += `&auto_play=${autoPlay}`;
      embedUrl += `&hide_related=${!showRelated}`;
      embedUrl += `&show_comments=${showComments}`;
      embedUrl += '&show_user=true';
      embedUrl += '&show_reposts=false';
      embedUrl += '&show_teaser=true';
      embedUrl += `&visual=${visual}`;
      
      // For playlists, we don't want to restrict to a single active sound
      if (isPlaylist) {
        embedUrl += '&single_active=false';
      }
      
      iframeRef.current!.src = embedUrl;
      
      // Re-initialize widget with new iframe
      setTimeout(initializeWidget, 100);
    }
  };

  const handleClearAllPlaylists = () => {
    if (window.confirm('Are you sure you want to remove all playlists? This cannot be undone.')) {
      localStorage.removeItem('soundcloudPlaylists');
      setPlaylists([defaultPlaylist]);
      setCurrentPlaylistIndex(0);
      setCurrentTrackIndex(0);
      setIsPlaying(false);
      setOpenSettingsDialog(false);
    }
  };

  const handleOpenSettingsDialog = () => {
    setOpenSettingsDialog(true);
  };

  const handleCloseSettingsDialog = () => {
    setOpenSettingsDialog(false);
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
      {/* Player */}
      <Box sx={{ 
        width: '100%', 
        height: 'auto', 
        mb: 2,
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        '& iframe': {
          borderRadius: 'var(--radius-md)',
        }
      }}>
        <iframe
          ref={iframeRef}
          width="100%"
          height="166"
          scrolling="no"
          frameBorder="no"
          allow="autoplay"
          src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(soundcloudUrl)}&auto_play=${autoPlay}&hide_related=${!showRelated}&show_comments=${showComments}&show_user=true&show_reposts=false&show_teaser=true&visual=${visual}${isPlaylistUrl(soundcloudUrl) ? '&single_active=false' : ''}`}
        ></iframe>
      </Box>
      
      {/* Playlist Selector with Settings button beside it */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <FormControl variant="outlined" size="small" sx={{ flex: 1, mr: 1 }}>
          <Select
            value={currentPlaylistIndex.toString()}
            onChange={handleChangePlaylist}
            displayEmpty
            sx={{ height: 36 }}
            renderValue={(selectedIndex) => {
              const index = parseInt(selectedIndex as string, 10);
              return (
                <Box component="span" sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {playlists[index]?.name || ''}
                </Box>
              );
            }}
          >
            {playlists.map((playlist: Playlist, index: number) => (
              <MenuItem key={index} value={index.toString()}>
                {playlist.name} ({playlist.tracks.length})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {/* Settings button beside dropdown */}
        <Tooltip title="Settings">
          <IconButton 
            onClick={handleOpenSettingsDialog}
            size="small"
            sx={{ color: 'text.primary' }}
          >
            <Settings fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* Player Controls - Moved below dropdown and made bigger */}
      <Stack 
        direction="row" 
        spacing={2} 
        alignItems="center" 
        justifyContent="center" 
        sx={{ mb: 2 }}
      >
        <Tooltip title="Previous Track">
          <IconButton 
            onClick={handlePreviousTrack} 
            aria-label="previous track" 
            size="medium"
            sx={{ color: 'text.primary' }}
          >
            <SkipPrevious />
          </IconButton>
        </Tooltip>

        <IconButton 
          onClick={handlePlayPause} 
          aria-label={isPlaying ? "pause" : "play"} 
          size="large"
          sx={{ 
            color: 'text.primary',
            bgcolor: 'action.selected',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          {isPlaying ? <Pause /> : <PlayArrow />}
        </IconButton>

        <Tooltip title="Next Track">
          <IconButton 
            onClick={handleNextTrack} 
            aria-label="next track" 
            size="medium"
            sx={{ color: 'text.primary' }}
          >
            <SkipNext />
          </IconButton>
        </Tooltip>
      </Stack>
    
      {/* Status and Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Status Indicator */}
        <Box sx={{ flexGrow: 1 }}>
          {!isPlaylistUrl(soundcloudUrl) && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {currentTracks.length} track{currentTracks.length !== 1 ? 's' : ''}
            </Typography>
          )}
        </Box>
        
        {/* Action Buttons - Without settings button */}
        <Box>
          {/* Removed Add Track and Add Playlist buttons from here */}
        </Box>
      </Box>

      {/* Track Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem dense onClick={() => selectedTrackIndex !== null && handlePlayTrack(selectedTrackIndex)}>
          <ListItemText primary="Play" />
        </MenuItem>
        <MenuItem dense onClick={() => selectedTrackIndex !== null && handleRemoveTrack(selectedTrackIndex)}>
          <ListItemText primary="Remove" />
        </MenuItem>
      </Menu>

      {/* Add Track Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>Add SoundCloud Track</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="SoundCloud Track URL"
            type="url"
            fullWidth
            variant="outlined"
            value={trackUrlInput}
            onChange={(e) => setTrackUrlInput(e.target.value)}
            placeholder="https://soundcloud.com/artist/track"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleAddTrack} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Playlist Dialog */}
      <Dialog open={openPlaylistDialog} onClose={handleClosePlaylistDialog} fullWidth maxWidth="sm">
        <DialogTitle>Create New Playlist</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Playlist Name"
            type="text"
            fullWidth
            variant="outlined"
            value={playlistNameInput}
            onChange={(e) => setPlaylistNameInput(e.target.value)}
            placeholder="My Awesome Playlist"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePlaylistDialog}>Cancel</Button>
          <Button onClick={handleCreatePlaylist} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Settings Dialog */}
      <Dialog open={openSettingsDialog} onClose={handleCloseSettingsDialog} fullWidth maxWidth="sm">
        <DialogTitle>Player Settings</DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle2" gutterBottom>Track Management</Typography>
          <Button 
            startIcon={<Add />} 
            variant="outlined" 
            size="small" 
            fullWidth 
            sx={{ mb: 1 }}
            onClick={() => {
              handleCloseSettingsDialog();
              handleOpenDialog();
            }}
          >
            Add Track
          </Button>
          <Button 
            startIcon={<PlaylistAdd />} 
            variant="outlined" 
            size="small" 
            fullWidth 
            sx={{ mb: 2 }}
            onClick={() => {
              handleCloseSettingsDialog();
              handleOpenPlaylistDialog();
            }}
          >
            Create New Playlist
          </Button>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle2" gutterBottom>Player Options</Typography>
          <FormControlLabel
            control={<Switch size="small" checked={autoPlay} onChange={handleToggleAutoPlay} />}
            label={<Typography variant="body2">Auto-play tracks</Typography>}
          />
          <FormControlLabel
            control={<Switch size="small" checked={visual} onChange={handleToggleVisual} />}
            label={<Typography variant="body2">Visual player</Typography>}
          />
          <FormControlLabel
            control={<Switch size="small" checked={showComments} onChange={handleToggleComments} />}
            label={<Typography variant="body2">Show comments</Typography>}
          />
          <FormControlLabel
            control={<Switch size="small" checked={showRelated} onChange={handleToggleRelated} />}
            label={<Typography variant="body2">Show related tracks</Typography>}
          />
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle2" gutterBottom>Data Management</Typography>
          <Button 
            startIcon={<Refresh />} 
            variant="outlined" 
            size="small" 
            fullWidth 
            sx={{ mb: 1 }}
            onClick={() => { 
              updateIframeSettings();
              handleCloseSettingsDialog();
            }}
          >
            Apply Settings & Refresh Player
          </Button>
          <Button 
            startIcon={<DeleteForever />} 
            color="error" 
            variant="outlined" 
            size="small" 
            fullWidth
            onClick={handleClearAllPlaylists}
          >
            Clear All Playlists
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSettingsDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default Music;