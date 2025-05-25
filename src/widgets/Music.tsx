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
  bind: (event: string, callback: (...args: any[]) => void) => void;
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

// New default playlists
const defaultPlaylists: Playlist[] = [
  {
    name: 'Persian Jazz',
    tracks: [
      'https://soundcloud.com/amirali-amiri-284341662/sets/1bkemtkzveqs?si=cef1e136eede4ccb85d4701486cdcd3a&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing',
    ]
  },
  {
    name: 'Persian Golden Era',
    tracks: [
      'https://soundcloud.com/mob-fall/sets/g-old?si=37daad98e9604892bf1546e37f265db3&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing',
    ]
  },
  {
    name: 'Persian Golden Era 2',
    tracks: [
      'https://soundcloud.com/jayko-grinding/sets/old-persian-music?si=8fa2d25976a547d9bc143d1d99ce2cb2&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing',
    ]
  },
  {
    name: "Hits of the 80's",
    tracks: [
      'https://soundcloud.com/playlistsmusic/sets/hits-of-the-80s-classic-pop?si=5882f1cc4e2845f6913a8dffeb980140&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing',
    ]
  }
];

// Type definition for a playlist
interface Playlist {
  name: string;
  tracks: string[];
}

// FallbackPlayer implementation
class FallbackPlayer implements SCWidget {
  private isPlaying: boolean = false;
  private audioElement: HTMLAudioElement | null = null;
  private volume: number = 80;
  private callbacks: Record<string, Array<(...args: any[]) => void>> = {
    [SC_EVENTS.PLAY]: [],
    [SC_EVENTS.PAUSE]: [],
    [SC_EVENTS.FINISH]: [],
    [SC_EVENTS.READY]: []
  };

  constructor() {
    this.audioElement = new Audio();
    this.audioElement.addEventListener('ended', () => {
      this.isPlaying = false;
      this.triggerCallbacks(SC_EVENTS.FINISH);
    });
    this.audioElement.addEventListener('play', () => {
      this.isPlaying = true;
      this.triggerCallbacks(SC_EVENTS.PLAY);
    });
    this.audioElement.addEventListener('pause', () => {
      this.isPlaying = false;
      this.triggerCallbacks(SC_EVENTS.PAUSE);
    });
    
    // Signal ready immediately
    setTimeout(() => {
      this.triggerCallbacks(SC_EVENTS.READY);
    }, 100);
  }

  private triggerCallbacks(event: string): void {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(callback => callback());
    }
  }

  play(): void {
    if (this.audioElement) {
      this.audioElement.play().catch(e => console.error('Fallback play error:', e));
    }
  }

  pause(): void {
    if (this.audioElement) {
      this.audioElement.pause();
    }
  }

  seekTo(milliseconds: number): void {
    if (this.audioElement) {
      this.audioElement.currentTime = milliseconds / 1000;
    }
  }

  skip(index: number): void {
    console.log('Fallback skip called with index:', index);
  }

  next(): void {
    console.log('Fallback next called');
  }

  prev(): void {
    console.log('Fallback prev called');
  }

  bind(event: string, callback: (...args: any[]) => void): void {
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }
    this.callbacks[event].push(callback);
  }

  unbind(event: string): void {
    this.callbacks[event] = [];
  }

  getCurrentSound(callback: (sound: any) => void): void {
    callback({ permalink_url: 'fallback' });
  }

  getSounds(callback: (sounds: any[]) => void): void {
    callback([{ permalink_url: 'fallback' }]);
  }

  getCurrentSoundIndex(callback: (index: number) => void): void {
    callback(0);
  }

  setVolume(volume: number): void {
    this.volume = volume * 100;
    if (this.audioElement) {
      this.audioElement.volume = volume;
    }
  }

  // Custom method for fallback player
  setSrc(url: string): void {
    console.log('Fallback player would set source to:', url);
    // For a real implementation, you'd need to extract the audio URL
  }
}

const Music: React.FC = () => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    const savedPlaylists = localStorage.getItem('soundcloudPlaylists');
    // Use the new list of default playlists if nothing is saved
    return savedPlaylists ? JSON.parse(savedPlaylists) : defaultPlaylists;
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
  const fallbackPlayerRef = useRef<FallbackPlayer | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTrackIndex, setSelectedTrackIndex] = useState<number | null>(null);
  const [openSettingsDialog, setOpenSettingsDialog] = useState(false);
  const [volume, setVolume] = useState<number>(80);
  const [muted, setMuted] = useState<boolean>(false);
  const [showComments, setShowComments] = useState<boolean>(false);
  const [showRelated, setShowRelated] = useState<boolean>(false);
  const [visual, setVisual] = useState<boolean>(true);
  const [autoPlay, setAutoPlay] = useState<boolean>(false);
  const [useFallbackMode, setUseFallbackMode] = useState<boolean>(false);
  const [currentTrackTitle, setCurrentTrackTitle] = useState<string>('No track selected');
  
  // Add state for widget dimensions
  const [widgetHeight, setWidgetHeight] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Current playlist and tracks
  // Ensure currentPlaylist defaults to the first playlist if index is out of bounds
  const currentPlaylist = playlists[currentPlaylistIndex] || playlists[0] || { name: 'Empty', tracks: [] };
  const currentTracks = currentPlaylist.tracks;
  
  // Make sure soundcloudUrl is available for the UI
  const soundcloudUrl = currentTracks.length > 0 ? currentTracks[currentTrackIndex] : '';

  // Calculate dynamic iframe height based on widget size
  const calculateIframeHeight = () => {
    if (!containerRef.current) return 166; // Default height
    
    const containerHeight = containerRef.current.clientHeight;
    const controlsHeight = 120; // Approximate height for controls and padding
    const minIframeHeight = 120; // Minimum height for SoundCloud player
    const maxIframeHeight = Math.max(containerHeight * 0.8, 300); // Max 80% of container or 300px
    
    // Calculate available height for iframe
    const availableHeight = Math.max(containerHeight - controlsHeight, minIframeHeight);
    
    // Return constrained height
    return Math.min(Math.max(availableHeight, minIframeHeight), maxIframeHeight);
  };

  // Monitor widget size changes
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const height = containerRef.current.clientHeight;
        setWidgetHeight(height);
      }
    };

    // Initial measurement
    updateDimensions();

    // Set up ResizeObserver for dynamic updates
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Initialize fallback player
  useEffect(() => {
    fallbackPlayerRef.current = new FallbackPlayer();
    
    const fallbackPlayer = fallbackPlayerRef.current;
    
    fallbackPlayer.bind(SC_EVENTS.READY, () => {
      if (useFallbackMode) {
        console.log('Fallback player ready');
        setWidgetReady(true);
      }
    });
    
    fallbackPlayer.bind(SC_EVENTS.PLAY, () => {
      console.log('Fallback player: play event');
      setIsPlaying(true);
    });
    
    fallbackPlayer.bind(SC_EVENTS.PAUSE, () => {
      console.log('Fallback player: pause event');
      setIsPlaying(false);
    });
    
    fallbackPlayer.bind(SC_EVENTS.FINISH, () => {
      console.log('Fallback player: finish event');
      handleNextTrack();
    });
    
    return () => {
      // Clean up fallback player
      if (fallbackPlayerRef.current) {
        fallbackPlayerRef.current.unbind(SC_EVENTS.READY);
        fallbackPlayerRef.current.unbind(SC_EVENTS.PLAY);
        fallbackPlayerRef.current.unbind(SC_EVENTS.PAUSE);
        fallbackPlayerRef.current.unbind(SC_EVENTS.FINISH);
      }
    };
  }, []);

  // Initialize SoundCloud Widget
  useEffect(() => {
    // Try to load the SoundCloud Widget API
    const loadSoundCloudAPI = () => {
      console.log('Loading SoundCloud Widget API...');
      
      return new Promise<void>((resolve, reject) => {
        if (window.SC) {
          console.log('SoundCloud API already loaded');
          resolve();
          return;
        }
        
        try {
          const script = document.createElement('script');
          script.src = 'https://w.soundcloud.com/player/api.js';
          script.async = true;
          
          script.onload = () => {
            console.log('SoundCloud Widget API loaded successfully');
            resolve();
          };
          
          script.onerror = (error) => {
            console.error('Failed to load SoundCloud Widget API:', error);
            reject(new Error('Failed to load SoundCloud API'));
          };
          
          document.body.appendChild(script);
        } catch (error) {
          console.error('Error setting up SoundCloud API script:', error);
          reject(error);
        }
      });
    };
    
    const setupWidget = async () => {
      try {
        // Try to load the SoundCloud API
        await loadSoundCloudAPI();
        
        // Initialize the widget if the API loaded successfully
        initializeWidget();
      } catch (error) {
        console.error('Failed to set up SoundCloud widget, using fallback mode:', error);
        setUseFallbackMode(true);
      }
    };
    
    setupWidget();
  }, []);

  // Initialize widget when iframe is available
  const initializeWidget = () => {
    console.log('Initializing SoundCloud widget...');
    if (iframeRef.current && window.SC) {
      try {
        console.log('Creating widget instance');
        widgetRef.current = window.SC.Widget(iframeRef.current);
        
        widgetRef.current.bind(SC_EVENTS.READY, () => {
          console.log('SoundCloud widget ready event received');
          setWidgetReady(true);
          setUseFallbackMode(false);
          
          // Set initial volume
          try {
            widgetRef.current?.setVolume(muted ? 0 : volume / 100);
          } catch (error) {
            console.error('Error setting volume:', error);
          }
          
          // Check current playing state when widget is ready
          try {
            widgetRef.current?.getCurrentSound((sound) => {
              if (sound) {
                console.log('Current sound on ready:', sound);
                // Update track title from API data
                setCurrentTrackTitle(sound.title || 'Unknown Track');
              }
            });
          } catch (error) {
            console.error('Error getting current sound:', error);
          }
        });
        
        widgetRef.current.bind(SC_EVENTS.PLAY, () => {
          console.log('Play event received from SoundCloud widget');
          setIsPlaying(true);
          
          // Get current track info when play starts
          try {
            widgetRef.current?.getCurrentSound((sound) => {
              if (sound) {
                console.log('Current sound on play:', sound);
                setCurrentTrackTitle(sound.title || 'Unknown Track');
              }
            });
          } catch (error) {
            console.error('Error getting current sound on play:', error);
          }
        });
        
        widgetRef.current.bind(SC_EVENTS.PAUSE, () => {
          console.log('Pause event received from SoundCloud widget');
          setIsPlaying(false);
        });
        
        widgetRef.current.bind(SC_EVENTS.FINISH, () => {
          console.log('Finish event received from SoundCloud widget');
          handleNextTrack();
        });
        
        // Check initial state periodically
        setTimeout(() => {
          // After a short delay, check if the track is actually playing
          try {
            if (widgetRef.current && isPlaying) {
              console.log('Verifying playback state...');
              widgetRef.current.getCurrentSound((sound) => {
                console.log('Current sound check:', sound ? 'Sound loaded' : 'No sound');
              });
            }
          } catch (error) {
            console.error('Error checking sound:', error);
          }
        }, 1000);
      } catch (error) {
        console.error('Error initializing SoundCloud widget:', error);
        setWidgetReady(false);
        setUseFallbackMode(true);
      }
    } else {
      console.warn('Cannot initialize widget: iframe or SC not available');
      setUseFallbackMode(true);
    }
  };

  // Update widget when currentTracks or currentTrackIndex changes
  useEffect(() => {
    if (currentTracks.length === 0) return;
    
    const url = currentTracks[currentTrackIndex];
    console.log(`Updating track: ${url}, Fallback: ${useFallbackMode}, Ready: ${widgetReady}`);
    
    if (useFallbackMode) {
      // Use fallback player
      if (fallbackPlayerRef.current) {
        console.log('Using fallback player for track:', url);
        fallbackPlayerRef.current.setSrc(url);
      }
      return;
    }
    
    // Use SoundCloud widget if ready, otherwise update iframe directly
    if (widgetReady && widgetRef.current) {
      widgetRef.current.getCurrentSound((currentSound) => {
        if (!currentSound || !currentSound.permalink_url || currentSound.permalink_url !== url) {
          updateIframeSource(url);
        }
      });
    } else if (iframeRef.current) {
      updateIframeSource(url);
    }
  }, [currentTrackIndex, currentTracks, widgetReady, autoPlay, showComments, showRelated, visual, useFallbackMode]);

  // Update iframe height when widget size changes
  useEffect(() => {
    if (iframeRef.current && widgetHeight > 0) {
      const newHeight = calculateIframeHeight();
      iframeRef.current.height = newHeight.toString();
    }
  }, [widgetHeight]);

  // Helper function to update the iframe source
  const updateIframeSource = (url: string) => {
    if (!iframeRef.current) return;
    
    const isPlaylist = isPlaylistUrl(url);
    const iframeHeight = calculateIframeHeight();
    
    let embedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}`;
    embedUrl += `&auto_play=${autoPlay}`;
    embedUrl += `&hide_related=${!showRelated}`;
    embedUrl += `&show_comments=${showComments}`;
    embedUrl += '&show_user=true';
    embedUrl += '&show_reposts=false';
    embedUrl += '&show_teaser=true';
    embedUrl += `&visual=${visual}`;
    
    if (isPlaylist) {
      embedUrl += '&single_active=false';
    }
    
    iframeRef.current.src = embedUrl;
    iframeRef.current.height = iframeHeight.toString();
    
    // Re-initialize widget after src change
    setTimeout(initializeWidget, 100);
  };

  // Save playlists to localStorage when they change
  useEffect(() => {
    localStorage.setItem('soundcloudPlaylists', JSON.stringify(playlists));
  }, [playlists]);

  // Simple function to replace the removed ones for event binding
  const handleNextTrack = () => {
    setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % currentTracks.length);
  };

  const handlePlayPause = () => {
    console.log('Play/Pause clicked. Widget ready:', widgetReady, 'Fallback mode:', useFallbackMode, 'Current state:', isPlaying);
    
    // Use fallback player if in fallback mode
    if (useFallbackMode && fallbackPlayerRef.current) {
      try {
        if (isPlaying) {
          console.log('Calling fallback pause()');
          fallbackPlayerRef.current.pause();
        } else {
          console.log('Calling fallback play()');
          fallbackPlayerRef.current.play();
        }
        // Let the fallback player events update isPlaying
      } catch (error) {
        console.error('Error in fallback play/pause:', error);
      }
      return;
    }
    
    // Use SoundCloud widget if available
    if (widgetRef.current && widgetReady) {
      try {
        if (isPlaying) {
          console.log('Calling pause()');
          widgetRef.current.pause();
        } else {
          console.log('Calling play()');
          widgetRef.current.play();
        }
      } catch (error) {
        console.error('Error in play/pause:', error);
        // Fallback: toggle state directly if widget methods fail
        setIsPlaying(!isPlaying);
      }
    } else {
      console.warn('Widget not ready, toggling state directly');
      setIsPlaying(!isPlaying);
    }
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

  // Handle settings changes
  const handleVolumeChange = (_event: Event, newValue: number | number[]) => {
    const newVolume = newValue as number;
    setVolume(newVolume);
    
    if (useFallbackMode && fallbackPlayerRef.current) {
      fallbackPlayerRef.current.setVolume(newVolume / 100);
    } else if (widgetRef.current && widgetReady) {
      widgetRef.current.setVolume(newVolume / 100);
    }
  };

  const handleMuteToggle = () => {
    const newMuted = !muted;
    setMuted(newMuted);
    
    if (useFallbackMode && fallbackPlayerRef.current) {
      fallbackPlayerRef.current.setVolume(newMuted ? 0 : volume / 100);
    } else if (widgetRef.current && widgetReady) {
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
    if (iframeRef.current && currentTracks.length > 0) {
      updateIframeSource(soundcloudUrl);
    }
  };

  const handleClearAllPlaylists = () => {
    if (window.confirm('Are you sure you want to remove all playlists? This cannot be undone.')) {
      localStorage.removeItem('soundcloudPlaylists');
      // Reset to the default list of playlists
      setPlaylists(defaultPlaylists);
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
      ref={containerRef}
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
        gap: 1,
      }}
    >
      {/* Compact Header with Playlist Selector and Settings */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        flexShrink: 0,
        minHeight: '36px'
      }}>
        <FormControl variant="outlined" size="small" sx={{ flex: 1, minWidth: 0 }}>
          <Select
            value={currentPlaylistIndex.toString()}
            onChange={handleChangePlaylist}
            displayEmpty
            sx={{ 
              height: 32,
              fontSize: '0.875rem',
              '& .MuiSelect-select': {
                py: 0.5,
                pr: '24px !important'
              }
            }}
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
                {playlist.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <Tooltip title="Settings">
          <IconButton 
            onClick={handleOpenSettingsDialog}
            size="small"
            sx={{ 
              color: 'text.primary',
              width: 32,
              height: 32,
              flexShrink: 0
            }}
          >
            <Settings fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* Dynamic SoundCloud Player - Takes up remaining space */}
      <Box sx={{ 
        flex: 1,
        width: '100%', 
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        minHeight: 120,
        '& iframe': {
          borderRadius: 'var(--radius-md)',
          width: '100%',
          height: '100%',
          border: 'none'
        }
      }}>
        <iframe
          ref={iframeRef}
          width="100%"
          height={calculateIframeHeight()}
          scrolling="no"
          frameBorder="no"
          allow="autoplay"
          src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(soundcloudUrl)}&auto_play=${autoPlay}&hide_related=${!showRelated}&show_comments=${showComments}&show_user=true&show_reposts=false&show_teaser=true&visual=${visual}${isPlaylistUrl(soundcloudUrl) ? '&single_active=false' : ''}`}
        ></iframe>
      </Box>
      
      {/* Compact Status Footer */}
      {soundcloudUrl && (
        <Box sx={{ 
          flexShrink: 0,
          minHeight: '20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Typography 
            variant="caption" 
            color="text.secondary" 
            sx={{ 
              fontSize: '0.75rem',
              opacity: 0.7,
              textAlign: 'center'
            }}
          >
            {currentTracks.length} track{currentTracks.length !== 1 ? 's' : ''} • {currentPlaylist.name}
          </Typography>
        </Box>
      )}

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
        <DialogTitle>
          {trackUrlInput && isPlaylistUrl(trackUrlInput) 
            ? "Import SoundCloud Playlist" 
            : "Add SoundCloud Track"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={isPlaylistUrl(trackUrlInput) ? "SoundCloud Playlist URL" : "SoundCloud Track URL"}
            type="url"
            fullWidth
            variant="outlined"
            value={trackUrlInput}
            onChange={(e) => setTrackUrlInput(e.target.value)}
            placeholder="https://soundcloud.com/artist/track-or-playlist"
          />
          {isPlaylistUrl(trackUrlInput) && (
            <Typography variant="caption" color="primary" sx={{ display: 'block', mt: 1 }}>
              This appears to be a playlist URL. It will be added as a single item.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleAddTrack} 
            variant="contained"
            disabled={!trackUrlInput.includes('soundcloud.com')}
          >
            {isPlaylistUrl(trackUrlInput) ? "Import Playlist" : "Add Track"}
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
            Add Track to Current Playlist
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
          
          {/* Add a direct SoundCloud playlist import option */}
          <Button 
            startIcon={<PlaylistAdd />} 
            variant="outlined" 
            size="small" 
            fullWidth 
            sx={{ mb: 2 }}
            onClick={() => {
              handleCloseSettingsDialog();
              setTrackUrlInput('');
              setOpenDialog(true);
            }}
          >
            Import SoundCloud Playlist
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