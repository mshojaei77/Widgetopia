import React, { useState, useRef } from 'react';
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
  Tooltip
} from '@mui/material';
import { 
  SkipNext, 
  SkipPrevious, 
  PlayArrow, 
  Pause, 
  Add 
} from '@mui/icons-material';
import ReactPlayer from 'react-player/soundcloud';

// Sample Playlist - This will be replaced or updated by user input
let initialPlaylist = [
  'https://soundcloud.com/amirali-amiri-284341662/sets/1bkemtkzveqs?si=cef1e136eede4ccb85d4701486cdcd3a&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing'
];

const Music: React.FC = () => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [playlist, setPlaylist] = useState(initialPlaylist);
  const [playlistUrlInput, setPlaylistUrlInput] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<ReactPlayer>(null);

  const handleNextTrack = () => {
    setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % playlist.length);
  };

  const handlePreviousTrack = () => {
    setCurrentTrackIndex((prevIndex) => (prevIndex - 1 + playlist.length) % playlist.length);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleLoadPlaylist = () => {
    // Basic validation - check if it looks like a SoundCloud URL
    if (playlistUrlInput.includes('soundcloud.com')) {
      // Replace the current playlist with the single URL provided.
      // NOTE: This treats the input as a single track or embeddable resource.
      // Fetching multiple tracks from a standard playlist URL requires API integration.
      setPlaylist([playlistUrlInput]);
      setCurrentTrackIndex(0); // Reset index to the start of the new 'playlist'
      setOpenDialog(false); // Close the dialog after successful submission
      setPlaylistUrlInput(''); // Clear the input field
    } else {
      // Optional: Add user feedback for invalid URL
      console.warn('Invalid SoundCloud URL provided');
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setPlaylistUrlInput(''); // Clear the input when canceling
  };

  // Ensure playlist is not empty before accessing index
  const soundcloudUrl = playlist.length > 0 ? playlist[currentTrackIndex] : '';

  return (
    <Paper 
      elevation={0} 
      className="glass" 
      sx={{ 
        p: 2, 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', // Center the player horizontally
        justifyContent: 'center', // Center the player vertically
        borderRadius: 'var(--radius-lg)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ width: '100%', height: 'auto', mb: 1 }}> {/* Add margin bottom */}
        <ReactPlayer 
          ref={playerRef}
          url={soundcloudUrl}
          width="100%"
          height="166px" // Standard SoundCloud embed height
          playing={isPlaying} // Control play state
          onPlay={() => setIsPlaying(true)} // Sync state with player
          onPause={() => setIsPlaying(false)} // Sync state with player
          config={{
            soundcloud: {
              options: {
                auto_play: false,
                hide_related: true,
                show_comments: false,
                show_user: true,
                show_reposts: false,
                show_teaser: true,
                visual: true // Enable visual mode for a potentially darker theme
              }
            }
          } as any} // Cast config to any to bypass type error
        />
      </Box>
      
      {/* Standard Player Controls */}
      <Stack 
        direction="row" 
        spacing={2} 
        alignItems="center" 
        justifyContent="center" 
        sx={{ 
          mb: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          padding: '4px 12px',
        }}
      >
        <IconButton 
          onClick={handlePreviousTrack} 
          aria-label="previous track" 
          disabled={playlist.length <= 1}
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
          disabled={playlist.length <= 1}
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

      {/* Dialog for URL input */}
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
            value={playlistUrlInput}
            onChange={(e) => setPlaylistUrlInput(e.target.value)}
            placeholder="https://soundcloud.com/artist/track"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleLoadPlaylist} variant="contained">
            Load
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default Music; 