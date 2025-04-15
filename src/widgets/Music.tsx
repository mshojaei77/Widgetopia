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
  ListItemSecondaryAction
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
  MoreVert
} from '@mui/icons-material';
import ReactPlayer from 'react-player/soundcloud';

// Default playlist structure
const defaultPlaylist = {
  name: 'Persian Jazz',
  tracks: [
    'https://soundcloud.com/amirali-amiri-284341662/sets/1bkemtkzveqs?si=cef1e136eede4ccb85d4701486cdcd3a&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing'
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
  const playerRef = useRef<ReactPlayer>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTrackIndex, setSelectedTrackIndex] = useState<number | null>(null);

  // Current playlist and tracks
  const currentPlaylist = playlists[currentPlaylistIndex];
  const currentTracks = currentPlaylist.tracks;

  // Initialize playlists and clear localStorage on first mount
  useEffect(() => {
    localStorage.removeItem('soundcloudPlaylists');
    setPlaylists([defaultPlaylist]);
  }, []);

  // Save playlists to localStorage when they change
  useEffect(() => {
    localStorage.setItem('soundcloudPlaylists', JSON.stringify(playlists));
  }, [playlists]);

  const handleNextTrack = () => {
    setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % currentTracks.length);
  };

  const handlePreviousTrack = () => {
    setCurrentTrackIndex((prevIndex) => (prevIndex - 1 + currentTracks.length) % currentTracks.length);
  };

  const handlePlayPause = () => {
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
        mb: 1,
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        '& iframe': {
          borderRadius: 'var(--radius-md)',
        }
      }}>
        <ReactPlayer 
          ref={playerRef}
          url={soundcloudUrl}
          width="100%"
          height="166px"
          playing={isPlaying}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={handleNextTrack}
          config={{
            soundcloud: {
              options: {
                auto_play: false,
                hide_related: true,
                show_comments: false,
                show_user: true,
                show_reposts: false,
                show_teaser: true,
                visual: true
              }
            }
          } as any}
        />
      </Box>
      
      {/* Playlist Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, width: '100%' }}>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 150, flexGrow: 1, mr: 1 }}>
          <Select
            value={currentPlaylistIndex.toString()}
            onChange={handleChangePlaylist}
            displayEmpty
            renderValue={(selectedIndex) => {
              const index = parseInt(selectedIndex as string, 10);
              return playlists[index]?.name || '';
            }}
          >
            {playlists.map((playlist: Playlist, index: number) => (
              <MenuItem key={index} value={index.toString()}>
                {playlist.name} ({playlist.tracks.length})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Tooltip title="New Playlist">
          <IconButton 
            onClick={handleOpenPlaylistDialog}
            size="small"
            sx={{ color: 'text.primary' }}
          >
            <PlaylistAdd />
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* Player Controls */}
      <Stack 
        direction="row" 
        spacing={2} 
        alignItems="center" 
        justifyContent="center" 
        sx={{ 
          mb: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          padding: '4px 12px',
        }}
      >
        <IconButton 
          onClick={handlePreviousTrack} 
          aria-label="previous track" 
          disabled={currentTracks.length <= 1}
          size="small"
          sx={{ color: 'text.primary' }}
        >
          <SkipPrevious />
        </IconButton>

        <IconButton 
          onClick={handlePlayPause} 
          aria-label={isPlaying ? "pause" : "play"} 
          size="medium"
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

        <IconButton 
          onClick={handleNextTrack} 
          aria-label="next track" 
          disabled={currentTracks.length <= 1}
          size="small"
          sx={{ color: 'text.primary' }}
        >
          <SkipNext />
        </IconButton>
        
        <Tooltip title="Add Track">
          <IconButton 
            onClick={handleOpenDialog} 
            aria-label="add track"
            size="small"
            sx={{ color: 'text.primary' }}
          >
            <Add />
          </IconButton>
        </Tooltip>
      </Stack>

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
    </Paper>
  );
};

export default Music; 