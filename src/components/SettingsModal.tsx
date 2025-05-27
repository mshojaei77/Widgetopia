import React, { useState, useEffect } from 'react';
import {
  Modal, Box, Paper, Typography, List, ListItem, ListItemText, Switch, IconButton, Divider,
  Tab, Tabs, TextField, Button, Alert, Slider, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { colorPalettes, type ColorPalette } from '../theme/colorPalettes';
import { type GlassThemeConfig } from '../theme/glassTheme';
import CloseIcon from '@mui/icons-material/Close';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  widgetVisibility: Record<string, boolean>;
  onVisibilityChange: (widgetId: string) => void;
  availableWidgets: { id: string; name: string }[];
  currentWallpaper: string;
  onWallpaperChange: (wallpaper: string) => void;
  currentLocation: string;
  onLocationChange: (location: string) => void;
  userName: string;
  onUserNameChange: (name: string) => void;
  openQuickLinksInNewTab: boolean;
  setOpenQuickLinksInNewTab: (val: boolean) => void;
  wallpaperShuffle: boolean;
  onWallpaperShuffleChange: (enabled: boolean) => void;
  customWallpapers: string[];
  onDeleteCustomWallpaper: (wallpaper: string) => void;
  onAddCustomWallpaper: (wallpaper: string) => void;
  hiddenDefaultWallpapers: string[];
  onDeleteDefaultWallpaper: (wallpaper: string) => void;
  // Color palette and glass theme props
  currentColorPalette: ColorPalette;
  onColorPaletteChange: (paletteId: string) => void;
  glassConfig: GlassThemeConfig;
  onGlassConfigChange: (config: Partial<GlassThemeConfig>) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Available wallpapers (these will be stored in public/wallpapers)
const WALLPAPERS = [
  { id: 'default', name: 'Default', path: '/wallpapers/default.jpg' },
  { id: 'nature', name: 'Nature', path: '/wallpapers/nature.jpg' },
  { id: 'anime', name: 'Anime', path: '/wallpapers/anime.jpeg' },
  { id: 'tea', name: 'Tea', path: '/wallpapers/tea.jpg' },
  { id: 'shiraz1', name: 'Shiraz', path: '/wallpapers/shiraz1.jpg' },
  { id: 'sunset', name: 'Sunset', path: '/wallpapers/sunset.jpg' },
  { id: 'heaven', name: 'Heaven', path: '/wallpapers/heaven.jpg' },
  { id: 'anime_cat', name: 'Anime Cat', path: '/wallpapers/anime_cat.jpg' },
  { id: 'anime_girl', name: 'Anime Girl', path: '/wallpapers/anime_girl.jpg' },
  { id: 'starrynight', name: 'Starry Night', path: '/wallpapers/starrynight.jpg' },
  { id: 'knight', name: 'Knight', path: '/wallpapers/knight.jpg' },
  { id: 'arcane', name: 'Arcane', path: '/wallpapers/arcane.png' },
  { id: 'rdr', name: 'Red Dead Redemption', path: '/wallpapers/RDR.png' },
  { id: 'cosmiccliffs', name: 'Cosmic Cliffs', path: '/wallpapers/CosmicCliffs.png' },
];

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  widgetVisibility,
  onVisibilityChange,
  availableWidgets,
  currentWallpaper,
  onWallpaperChange,
  currentLocation,
  onLocationChange,
  userName: initialUserName,
  onUserNameChange,
  openQuickLinksInNewTab,
  setOpenQuickLinksInNewTab,
  wallpaperShuffle,
  onWallpaperShuffleChange,
  customWallpapers,
  onDeleteCustomWallpaper,
  onAddCustomWallpaper,
  hiddenDefaultWallpapers,
  onDeleteDefaultWallpaper,
  currentColorPalette,
  onColorPaletteChange,
  glassConfig,
  onGlassConfigChange
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [userName, setUserName] = useState(initialUserName);
  const [locationInput, setLocationInput] = useState(currentLocation);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [uploadingWallpaper, setUploadingWallpaper] = useState(false);

  useEffect(() => {
    setUserName(initialUserName);
  }, [initialUserName]);

  useEffect(() => {
    setLocationInput(currentLocation);
  }, [currentLocation]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleUserNameInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(event.target.value);
  };
  
  const handleUserNameSave = () => {
    onUserNameChange(userName);
  };

  const handleLocationInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocationInput(event.target.value);
  };

  const handleLocationSave = () => {
    onLocationChange(locationInput);
  };

  const handleClearStorage = () => {
    setShowResetConfirm(true);
  };

  const handleConfirmReset = () => {
    localStorage.clear();
    setShowResetConfirm(false);
    window.location.reload(); // Reload to apply cleared settings
  };

  const handleCancelReset = () => {
    setShowResetConfirm(false);
  };

  const handleCustomWallpaperUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setUploadingWallpaper(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target?.result as string;
      
      // Check if this wallpaper already exists
      if (customWallpapers.includes(base64String)) {
        alert('This wallpaper has already been uploaded');
        setUploadingWallpaper(false);
        return;
      }
      
      // Add to custom wallpapers array via parent component
      onAddCustomWallpaper(base64String);
      
      // Set as current wallpaper
      onWallpaperChange(base64String);
      setUploadingWallpaper(false);
      
      // Reset file input
      event.target.value = '';
    };

    reader.onerror = () => {
      alert('Error reading file');
      setUploadingWallpaper(false);
    };

    reader.readAsDataURL(file);
  };

  // Animation variants
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.3,
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9,
      transition: { duration: 0.2 } 
    }
  };

  const wallpaperItemVariants = {
    initial: { opacity: 0, y: 10 },
    animate: (i: number) => ({ 
      opacity: 1, 
      y: 0, 
      transition: { 
        delay: i * 0.1,
        duration: 0.3 
      } 
    }),
    hover: { 
      y: -5, 
      boxShadow: "0px 10px 20px rgba(0,0,0,0.3)",
      transition: { duration: 0.2 } 
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="settings-modal-title"
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ 
              width: 500, 
              maxWidth: '90%', 
            }}
          >
            <Paper 
              className="glass"
              sx={{ 
                outline: 'none',
                borderRadius: 'var(--radius-lg)',
                padding: 0,
                overflow: 'hidden',
                background: 'rgba(10, 10, 15, 0.97) !important',
                backdropFilter: 'blur(8px) !important',
                WebkitBackdropFilter: 'blur(8px) !important',
                boxShadow: '0 15px 40px rgba(0, 0, 0, 0.5) !important',
                border: '1px solid rgba(255, 255, 255, 0.05) !important'
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                p: 2.5, 
                borderBottom: 1, 
                borderColor: 'rgba(255, 255, 255, 0.05)',
                position: 'relative',
              }}>
                <Typography 
                  id="settings-modal-title" 
                  variant="h5" 
                  component="h2"
                  sx={{
                    fontWeight: 600,
                    letterSpacing: '0.5px',
                  }}
                >
                  Settings
                </Typography>
                <IconButton 
                  onClick={onClose} 
                  aria-label="Close Settings"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: 'white',
                      transform: 'rotate(90deg)',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>

              <Box sx={{ width: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'rgba(255, 255, 255, 0.05)' }}>
                  <Tabs 
                    value={tabValue} 
                    onChange={handleTabChange} 
                    variant="fullWidth"
                    sx={{
                      '& .MuiTab-root': {
                        color: 'rgba(255, 255, 255, 0.7)',
                        transition: 'all 0.3s ease',
                        fontWeight: 500,
                        textTransform: 'none',
                        fontSize: '0.95rem',
                        letterSpacing: '0.5px',
                      },
                      '& .Mui-selected': {
                        color: 'white !important',
                        textShadow: '0 0 10px rgba(255, 255, 255, 0.3)'
                      },
                      '& .MuiTabs-indicator': {
                        backgroundColor: 'var(--primary-color)',
                        height: 3,
                        borderRadius: '3px 3px 0 0',
                        boxShadow: '0 0 8px var(--primary-color)'
                      }
                    }}
                  >
                    <Tab label="General" id="settings-tab-0" />
                    <Tab label="Widgets" id="settings-tab-1" />
                    <Tab label="Wallpaper" id="settings-tab-2" />
                    <Tab label="Theme" id="settings-tab-3" />
                  </Tabs>
                </Box>

                <TabPanel value={tabValue} index={0}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Typography variant="subtitle1" gutterBottom sx={{ 
                      mb: 2,
                      fontWeight: 600,
                      color: 'rgba(255, 255, 255, 0.9)',
                      textAlign: 'left'
                    }}>
                      General Settings
                    </Typography>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" gutterBottom sx={{ 
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontWeight: 500,
                        mb: 1,
                        textAlign: 'left'
                      }}>
                        Your Name
                      </Typography>
                      <TextField
                        fullWidth
                        value={userName}
                        onChange={handleUserNameInputChange}
                        onBlur={handleUserNameSave}
                        size="small"
                        placeholder="Enter your name"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'rgba(30, 30, 40, 0.7)',
                            backdropFilter: 'blur(5px)',
                            WebkitBackdropFilter: 'blur(5px)',
                            '& fieldset': {
                              borderColor: 'rgba(255, 255, 255, 0.1)',
                              transition: 'all 0.3s ease',
                            },
                            '&:hover fieldset': {
                              borderColor: 'rgba(255, 255, 255, 0.3)',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: 'var(--primary-color)',
                              boxShadow: '0 0 0 2px rgba(138, 180, 248, 0.2)'
                            },
                          },
                          '& .MuiInputBase-input': {
                            color: 'white',
                            padding: '10px 14px',
                          }
                        }}
                      />
                    </Box>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" gutterBottom sx={{ 
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontWeight: 500,
                        mb: 1,
                        textAlign: 'left'
                      }}>
                        Weather Location
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <TextField
                          fullWidth
                          value={locationInput}
                          onChange={handleLocationInputChange}
                          size="small"
                          placeholder="Enter City Name (e.g., London)"
                          sx={{
                            flexGrow: 1,
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: 'rgba(30, 30, 40, 0.7)',
                              backdropFilter: 'blur(5px)',
                              WebkitBackdropFilter: 'blur(5px)',
                              '& fieldset': {
                                borderColor: 'rgba(255, 255, 255, 0.1)',
                                transition: 'all 0.3s ease',
                              },
                              '&:hover fieldset': {
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: 'var(--primary-color)',
                                boxShadow: '0 0 0 2px rgba(138, 180, 248, 0.2)'
                              },
                            },
                            '& .MuiInputBase-input': {
                              color: 'white',
                              padding: '10px 14px',
                            }
                          }}
                        />
                        <Button 
                          variant="contained" 
                          size="small" 
                          onClick={handleLocationSave}
                          sx={{ 
                              height: '39.5px',
                              backgroundColor: 'var(--primary-color)',
                              '&:hover': {
                                backgroundColor: 'var(--primary-color-dark)'
                              }
                          }}
                        >
                          Set
                        </Button>
                      </Box>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', mt: 1, display: 'block' }}>
                        Enter a city name for weather updates.
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" gutterBottom sx={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500, mb: 1, textAlign: 'left' }}>
                        Open Quick Links in New Tab
                      </Typography>
                      <Switch
                        checked={openQuickLinksInNewTab}
                        onChange={e => setOpenQuickLinksInNewTab(e.target.checked)}
                        color="primary"
                        inputProps={{ 'aria-label': 'Open Quick Links in New Tab' }}
                      />
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', ml: 1 }}>
                        When enabled, quick links open in a new browser tab. Otherwise, they open in the same tab.
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" gutterBottom sx={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500, mb: 1, textAlign: 'left' }}>
                        Auto-Change Wallpaper
                      </Typography>
                      <Switch
                        checked={wallpaperShuffle}
                        onChange={e => onWallpaperShuffleChange(e.target.checked)}
                        color="primary"
                        inputProps={{ 'aria-label': 'Auto-Change Wallpaper' }}
                        sx={{
                          '& .MuiSwitch-switchBase': {
                            color: 'rgba(255, 255, 255, 0.5)',
                            '&.Mui-checked': {
                              color: 'var(--primary-color)',
                            },
                            '&.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: 'var(--primary-color)',
                              opacity: 0.5
                            },
                          },
                          '& .MuiSwitch-thumb': {
                            boxShadow: '0 2px 4px 0 rgba(0,0,0,0.2)'
                          },
                          '& .MuiSwitch-track': {
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            opacity: 1
                          }
                        }}
                      />
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', ml: 1 }}>
                        Automatically shuffle through all wallpapers every hour.
                      </Typography>
                    </Box>
                    
                    {/* Reset Application Settings Section */}
                    <Box sx={{ mt: 4, mb: 2 }}>
                      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', mb: 3 }} />
                      <Typography variant="subtitle2" gutterBottom sx={{ 
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontWeight: 600,
                        mb: 2,
                        textAlign: 'left'
                      }}>
                        Reset Application
                      </Typography>
                      
                      {showResetConfirm ? (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Alert 
                            severity="warning" 
                            sx={{ 
                              mb: 2,
                              backgroundColor: 'rgba(180, 83, 9, 0.2)',
                              color: 'rgba(255, 200, 155, 0.9)',
                              '& .MuiAlert-icon': {
                                color: 'rgba(255, 200, 155, 0.9)'
                              }
                            }}
                          >
                            This will reset all settings and preferences. You'll need to reload the page.
                          </Alert>
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button 
                              variant="contained" 
                              color="error"
                              onClick={handleConfirmReset}
                              sx={{ 
                                flex: 1,
                                backgroundColor: 'rgba(211, 47, 47, 0.8)',
                                '&:hover': {
                                  backgroundColor: 'rgba(211, 47, 47, 1)'
                                }
                              }}
                            >
                              Yes, Reset Everything
                            </Button>
                            <Button 
                              variant="outlined"
                              onClick={handleCancelReset}
                              sx={{ 
                                flex: 1,
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                color: 'white',
                                '&:hover': {
                                  borderColor: 'rgba(255, 255, 255, 0.5)',
                                  backgroundColor: 'rgba(255, 255, 255, 0.05)'
                                }
                              }}
                            >
                              Cancel
                            </Button>
                          </Box>
                        </motion.div>
                      ) : (
                        <Button 
                          variant="outlined" 
                          color="error"
                          onClick={handleClearStorage}
                          sx={{ 
                            width: '100%',
                            borderColor: 'rgba(211, 47, 47, 0.5)',
                            color: 'rgba(255, 100, 100, 0.9)',
                            '&:hover': {
                              borderColor: 'rgba(211, 47, 47, 0.8)',
                              backgroundColor: 'rgba(211, 47, 47, 0.08)'
                            }
                          }}
                        >
                          Reset All Settings
                        </Button>
                      )}
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', mt: 1, display: 'block' }}>
                        Clears all saved preferences from browser storage.
                      </Typography>
                    </Box>
                  </motion.div>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Typography variant="subtitle1" gutterBottom sx={{ 
                      mb: 2,
                      fontWeight: 600,
                      color: 'rgba(255, 255, 255, 0.9)',
                      textAlign: 'left'
                    }}>
                      Show/Hide Widgets
                    </Typography>
                    <List dense>
                      <AnimatePresence>
                        {availableWidgets.map((widget, index) => (
                          <motion.div
                            key={widget.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.3 }}
                          >
                            <ListItem 
                              sx={{ 
                                pl: 1, 
                                pr: 1,
                                borderRadius: 'var(--radius-sm)',
                                mb: 0.5,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  backgroundColor: 'rgba(40, 40, 50, 0.7)'
                                }
                              }}
                            >
                              <ListItemText 
                                id={`switch-list-label-${widget.id}`} 
                                primary={widget.name}
                                primaryTypographyProps={{
                                  sx: {
                                    fontWeight: 500,
                                    color: 'rgba(255, 255, 255, 0.9)'
                                  }
                                }}
                              />
                              <Switch
                                edge="end"
                                onChange={() => onVisibilityChange(widget.id)}
                                checked={!!widgetVisibility[widget.id]}
                                inputProps={{
                                  'aria-labelledby': `switch-list-label-${widget.id}`,
                                }}
                                sx={{
                                  '& .MuiSwitch-switchBase': {
                                    color: 'rgba(255, 255, 255, 0.5)',
                                    '&.Mui-checked': {
                                      color: 'var(--primary-color)',
                                    },
                                    '&.Mui-checked + .MuiSwitch-track': {
                                      backgroundColor: 'var(--primary-color)',
                                      opacity: 0.5
                                    },
                                  },
                                  '& .MuiSwitch-thumb': {
                                    boxShadow: '0 2px 4px 0 rgba(0,0,0,0.2)'
                                  },
                                  '& .MuiSwitch-track': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    opacity: 1
                                  }
                                }}
                              />
                            </ListItem>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </List>
                  </motion.div>
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Typography variant="subtitle1" gutterBottom sx={{ 
                      mb: 2,
                      fontWeight: 600,
                      color: 'rgba(255, 255, 255, 0.9)',
                      textAlign: 'left'
                    }}>
                      Select Wallpaper
                    </Typography>

                    {/* Custom Wallpaper Upload Section - Compact */}
                    <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="wallpaper-upload"
                        type="file"
                        onChange={handleCustomWallpaperUpload}
                      />
                      <label htmlFor="wallpaper-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          disabled={uploadingWallpaper}
                          size="small"
                          sx={{
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            color: 'white',
                            fontSize: '0.8rem',
                            '&:hover': {
                              borderColor: 'var(--primary-color)',
                              backgroundColor: 'rgba(138, 180, 248, 0.1)'
                            },
                            '&.Mui-disabled': {
                              borderColor: 'rgba(255, 255, 255, 0.1)',
                              color: 'rgba(255, 255, 255, 0.3)'
                            }
                          }}
                        >
                          {uploadingWallpaper ? 'Uploading...' : '+ Upload'}
                        </Button>
                      </label>
                      
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.75rem' }}>
                        JPG, PNG, WebP supported
                      </Typography>
                    </Box>

                    {/* All Wallpapers Grid */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2 }}>
                      {/* Default Wallpapers */}
                      {WALLPAPERS.filter(wallpaper => !hiddenDefaultWallpapers.includes(wallpaper.path)).map((wallpaper, i) => (
                        <Box 
                          key={wallpaper.id} 
                          sx={{ 
                            gridColumn: { xs: 'span 6', sm: 'span 4', md: 'span 4' } 
                          }}
                        >
                          <motion.div
                            custom={i}
                            variants={wallpaperItemVariants}
                            initial="initial"
                            animate="animate"
                            whileHover="hover"
                          >
                            <Box sx={{ position: 'relative' }}>
                              <Box
                                onClick={() => onWallpaperChange(wallpaper.path)}
                                sx={{
                                  height: 100,
                                  width: 100,
                                  backgroundImage: `url(${wallpaper.path})`,
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center',
                                  borderRadius: '12px',
                                  cursor: 'pointer',
                                  border: currentWallpaper === wallpaper.path 
                                    ? '2px solid var(--primary-color)' 
                                    : '2px solid transparent',
                                  transition: 'all 0.3s ease',
                                  boxShadow: currentWallpaper === wallpaper.path 
                                    ? '0 0 15px rgba(138, 180, 248, 0.5)' 
                                    : '0 5px 15px rgba(0, 0, 0, 0.2)',
                                  '&:hover': {
                                    opacity: 0.9,
                                    transform: 'scale(1.03)',
                                  }
                                }}
                              />
                              {/* Delete button for default wallpapers */}
                              <IconButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteDefaultWallpaper(wallpaper.path);
                                }}
                                sx={{
                                  position: 'absolute',
                                  top: 4,
                                  right: 4,
                                  width: 24,
                                  height: 24,
                                  backgroundColor: 'rgba(211, 47, 47, 0.9)',
                                  color: 'white',
                                  zIndex: 10,
                                  '&:hover': {
                                    backgroundColor: 'rgba(211, 47, 47, 1)',
                                    transform: 'scale(1.1)'
                                  },
                                  '& .MuiSvgIcon-root': {
                                    fontSize: '16px'
                                  }
                                }}
                              >
                                <CloseIcon />
                              </IconButton>
                            </Box>
                            <Typography 
                              variant="caption" 
                              display="block" 
                              align="center" 
                              sx={{ 
                                mt: 1,
                                fontWeight: currentWallpaper === wallpaper.path ? 600 : 400,
                                color: currentWallpaper === wallpaper.path ? 'var(--primary-color)' : 'inherit',
                                transition: 'all 0.3s ease',
                                textShadow: currentWallpaper === wallpaper.path ? '0 0 5px rgba(138, 180, 248, 0.5)' : 'none'
                              }}
                            >
                              {wallpaper.name}
                            </Typography>
                          </motion.div>
                        </Box>
                      ))}

                      {/* Custom Wallpapers */}
                      {customWallpapers.map((customWallpaper, i) => (
                        <Box 
                          key={`custom-${i}`} 
                          sx={{ 
                            gridColumn: { xs: 'span 6', sm: 'span 4', md: 'span 4' } 
                          }}
                        >
                          <motion.div
                            custom={WALLPAPERS.length + i}
                            variants={wallpaperItemVariants}
                            initial="initial"
                            animate="animate"
                            whileHover="hover"
                          >
                            <Box sx={{ position: 'relative' }}>
                              <Box
                                onClick={() => onWallpaperChange(customWallpaper)}
                                sx={{
                                  height: 100,
                                  width: 100,
                                  backgroundImage: `url(${customWallpaper})`,
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center',
                                  borderRadius: '12px',
                                  cursor: 'pointer',
                                  border: currentWallpaper === customWallpaper 
                                    ? '2px solid var(--primary-color)' 
                                    : '2px solid transparent',
                                  transition: 'all 0.3s ease',
                                  boxShadow: currentWallpaper === customWallpaper 
                                    ? '0 0 15px rgba(138, 180, 248, 0.5)' 
                                    : '0 5px 15px rgba(0, 0, 0, 0.2)',
                                  '&:hover': {
                                    opacity: 0.9,
                                    transform: 'scale(1.03)',
                                  }
                                }}
                              />
                              {/* Delete button for custom wallpapers */}
                              <IconButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteCustomWallpaper(customWallpaper);
                                }}
                                sx={{
                                  position: 'absolute',
                                  top: 4,
                                  right: 4,
                                  width: 24,
                                  height: 24,
                                  backgroundColor: 'rgba(211, 47, 47, 0.9)',
                                  color: 'white',
                                  zIndex: 10,
                                  '&:hover': {
                                    backgroundColor: 'rgba(211, 47, 47, 1)',
                                    transform: 'scale(1.1)'
                                  },
                                  '& .MuiSvgIcon-root': {
                                    fontSize: '16px'
                                  }
                                }}
                              >
                                <CloseIcon />
                              </IconButton>
                            </Box>
                            <Typography 
                              variant="caption" 
                              display="block" 
                              align="center" 
                              sx={{ 
                                mt: 1,
                                fontWeight: currentWallpaper === customWallpaper ? 600 : 400,
                                color: currentWallpaper === customWallpaper ? 'var(--primary-color)' : 'inherit',
                                transition: 'all 0.3s ease',
                                textShadow: currentWallpaper === customWallpaper ? '0 0 5px rgba(138, 180, 248, 0.5)' : 'none'
                              }}
                            >
                              Custom {i + 1}
                            </Typography>
                          </motion.div>
                        </Box>
                      ))}
                    </Box>
                  </motion.div>
                </TabPanel>

                <TabPanel value={tabValue} index={3}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Typography variant="subtitle1" gutterBottom sx={{ 
                      mb: 3,
                      fontWeight: 600,
                      color: 'rgba(255, 255, 255, 0.9)',
                      textAlign: 'left'
                    }}>
                      Theme & Glass Effects
                    </Typography>

                    {/* Color Palette Selection */}
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="body2" gutterBottom sx={{ 
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontWeight: 500,
                        mb: 2,
                        textAlign: 'left'
                      }}>
                        Color Palette
                      </Typography>
                      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                        <Select
                          value={currentColorPalette.id}
                          onChange={(e) => onColorPaletteChange(e.target.value)}
                          sx={{
                            backgroundColor: 'rgba(30, 30, 40, 0.7)',
                            backdropFilter: 'blur(5px)',
                            WebkitBackdropFilter: 'blur(5px)',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(255, 255, 255, 0.1)',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(255, 255, 255, 0.3)',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'var(--primary-color)',
                            },
                            '& .MuiSelect-select': {
                              color: 'white',
                              padding: '10px 14px',
                            },
                            '& .MuiSvgIcon-root': {
                              color: 'rgba(255, 255, 255, 0.7)',
                            }
                          }}
                        >
                          {colorPalettes.map((palette) => (
                            <MenuItem key={palette.id} value={palette.id}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                  <Box sx={{ 
                                    width: 16, 
                                    height: 16, 
                                    borderRadius: '50%', 
                                    backgroundColor: palette.colors.primary,
                                    border: '1px solid rgba(255,255,255,0.2)'
                                  }} />
                                  <Box sx={{ 
                                    width: 16, 
                                    height: 16, 
                                    borderRadius: '50%', 
                                    backgroundColor: palette.colors.secondary,
                                    border: '1px solid rgba(255,255,255,0.2)'
                                  }} />
                                  <Box sx={{ 
                                    width: 16, 
                                    height: 16, 
                                    borderRadius: '50%', 
                                    backgroundColor: palette.colors.accent,
                                    border: '1px solid rgba(255,255,255,0.2)'
                                  }} />
                                </Box>
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {palette.name}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                                    {palette.description}
                                  </Typography>
                                </Box>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      {/* Color Preview */}
                      <Box sx={{ 
                        p: 2, 
                        borderRadius: 2, 
                        backgroundColor: 'rgba(30, 30, 40, 0.5)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1, display: 'block' }}>
                          Preview Colors
                        </Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 1 }}>
                          {[
                            { label: 'Primary', color: currentColorPalette.colors.primary },
                            { label: 'Secondary', color: currentColorPalette.colors.secondary },
                            { label: 'Accent', color: currentColorPalette.colors.accent },
                            { label: 'Glass BG', color: currentColorPalette.colors.glassBackground },
                            { label: 'Success', color: currentColorPalette.colors.success },
                            { label: 'Warning', color: currentColorPalette.colors.warning },
                          ].map((item) => (
                            <Box key={item.label} sx={{ textAlign: 'center' }}>
                              <Box sx={{ 
                                width: '100%', 
                                height: 32, 
                                borderRadius: 1, 
                                backgroundColor: item.color,
                                border: '1px solid rgba(255,255,255,0.2)',
                                mb: 0.5
                              }} />
                              <Typography variant="caption" sx={{ 
                                color: 'rgba(255, 255, 255, 0.6)',
                                fontSize: '0.7rem'
                              }}>
                                {item.label}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    </Box>

                    {/* Glass Effect Configuration */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" gutterBottom sx={{ 
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontWeight: 500,
                        mb: 2,
                        textAlign: 'left'
                      }}>
                        Glass Effect Settings
                      </Typography>

                      {/* Blur Intensity */}
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1, display: 'block' }}>
                          Blur Intensity: {glassConfig.blurIntensity}px
                        </Typography>
                        <Slider
                          value={glassConfig.blurIntensity}
                          onChange={(_, value) => onGlassConfigChange({ blurIntensity: value as number })}
                          min={0}
                          max={30}
                          step={1}
                          sx={{
                            color: 'var(--primary-color)',
                            '& .MuiSlider-thumb': {
                              backgroundColor: 'var(--primary-color)',
                              border: '2px solid rgba(255, 255, 255, 0.3)',
                              '&:hover': {
                                boxShadow: '0 0 0 8px rgba(138, 180, 248, 0.16)',
                              },
                            },
                            '& .MuiSlider-track': {
                              backgroundColor: 'var(--primary-color)',
                            },
                            '& .MuiSlider-rail': {
                              backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            },
                          }}
                        />
                      </Box>

                      {/* Opacity */}
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1, display: 'block' }}>
                          Glass Opacity: {Math.round(glassConfig.opacity * 100)}%
                        </Typography>
                        <Slider
                          value={glassConfig.opacity}
                          onChange={(_, value) => onGlassConfigChange({ opacity: value as number })}
                          min={0}
                          max={0.5}
                          step={0.01}
                          sx={{
                            color: 'var(--primary-color)',
                            '& .MuiSlider-thumb': {
                              backgroundColor: 'var(--primary-color)',
                              border: '2px solid rgba(255, 255, 255, 0.3)',
                              '&:hover': {
                                boxShadow: '0 0 0 8px rgba(138, 180, 248, 0.16)',
                              },
                            },
                            '& .MuiSlider-track': {
                              backgroundColor: 'var(--primary-color)',
                            },
                            '& .MuiSlider-rail': {
                              backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            },
                          }}
                        />
                      </Box>

                      {/* Border Radius */}
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1, display: 'block' }}>
                          Border Radius: {glassConfig.borderRadius}px
                        </Typography>
                        <Slider
                          value={glassConfig.borderRadius}
                          onChange={(_, value) => onGlassConfigChange({ borderRadius: value as number })}
                          min={0}
                          max={32}
                          step={1}
                          sx={{
                            color: 'var(--primary-color)',
                            '& .MuiSlider-thumb': {
                              backgroundColor: 'var(--primary-color)',
                              border: '2px solid rgba(255, 255, 255, 0.3)',
                              '&:hover': {
                                boxShadow: '0 0 0 8px rgba(138, 180, 248, 0.16)',
                              },
                            },
                            '& .MuiSlider-track': {
                              backgroundColor: 'var(--primary-color)',
                            },
                            '& .MuiSlider-rail': {
                              backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            },
                          }}
                        />
                      </Box>

                      {/* Shadow Intensity */}
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1, display: 'block' }}>
                          Shadow Intensity: {Math.round(glassConfig.shadowIntensity * 100)}%
                        </Typography>
                        <Slider
                          value={glassConfig.shadowIntensity}
                          onChange={(_, value) => onGlassConfigChange({ shadowIntensity: value as number })}
                          min={0}
                          max={1}
                          step={0.01}
                          sx={{
                            color: 'var(--primary-color)',
                            '& .MuiSlider-thumb': {
                              backgroundColor: 'var(--primary-color)',
                              border: '2px solid rgba(255, 255, 255, 0.3)',
                              '&:hover': {
                                boxShadow: '0 0 0 8px rgba(138, 180, 248, 0.16)',
                              },
                            },
                            '& .MuiSlider-track': {
                              backgroundColor: 'var(--primary-color)',
                            },
                            '& .MuiSlider-rail': {
                              backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            },
                          }}
                        />
                      </Box>

                      {/* Saturation */}
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1, display: 'block' }}>
                          Saturation: {glassConfig.saturation?.toFixed(1) || '1.8'}
                        </Typography>
                        <Slider
                          value={glassConfig.saturation || 1.8}
                          onChange={(_, value) => onGlassConfigChange({ saturation: value as number })}
                          min={0.5}
                          max={3}
                          step={0.1}
                          sx={{
                            color: 'var(--primary-color)',
                            '& .MuiSlider-thumb': {
                              backgroundColor: 'var(--primary-color)',
                              border: '2px solid rgba(255, 255, 255, 0.3)',
                              '&:hover': {
                                boxShadow: '0 0 0 8px rgba(138, 180, 248, 0.16)',
                              },
                            },
                            '& .MuiSlider-track': {
                              backgroundColor: 'var(--primary-color)',
                            },
                            '& .MuiSlider-rail': {
                              backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            },
                          }}
                        />
                      </Box>

                      {/* Brightness */}
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1, display: 'block' }}>
                          Brightness: {glassConfig.brightness?.toFixed(1) || '1.1'}
                        </Typography>
                        <Slider
                          value={glassConfig.brightness || 1.1}
                          onChange={(_, value) => onGlassConfigChange({ brightness: value as number })}
                          min={0.5}
                          max={2}
                          step={0.1}
                          sx={{
                            color: 'var(--primary-color)',
                            '& .MuiSlider-thumb': {
                              backgroundColor: 'var(--primary-color)',
                              border: '2px solid rgba(255, 255, 255, 0.3)',
                              '&:hover': {
                                boxShadow: '0 0 0 8px rgba(138, 180, 248, 0.16)',
                              },
                            },
                            '& .MuiSlider-track': {
                              backgroundColor: 'var(--primary-color)',
                            },
                            '& .MuiSlider-rail': {
                              backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            },
                          }}
                        />
                      </Box>

                      {/* Contrast */}
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1, display: 'block' }}>
                          Contrast: {glassConfig.contrast?.toFixed(1) || '1.2'}
                        </Typography>
                        <Slider
                          value={glassConfig.contrast || 1.2}
                          onChange={(_, value) => onGlassConfigChange({ contrast: value as number })}
                          min={0.5}
                          max={2}
                          step={0.1}
                          sx={{
                            color: 'var(--primary-color)',
                            '& .MuiSlider-thumb': {
                              backgroundColor: 'var(--primary-color)',
                              border: '2px solid rgba(255, 255, 255, 0.3)',
                              '&:hover': {
                                boxShadow: '0 0 0 8px rgba(138, 180, 248, 0.16)',
                              },
                            },
                            '& .MuiSlider-track': {
                              backgroundColor: 'var(--primary-color)',
                            },
                            '& .MuiSlider-rail': {
                              backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            },
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Glass Presets */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" gutterBottom sx={{ 
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontWeight: 500,
                        mb: 2,
                        textAlign: 'left'
                      }}>
                        Glass Effect Presets
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                        {[
                          { key: 'minimal', name: 'Minimal', desc: 'Subtle glass effect' },
                          { key: 'subtle', name: 'Subtle', desc: 'Light glass effect' },
                          { key: 'moderate', name: 'Moderate', desc: 'Balanced glass effect' },
                          { key: 'intense', name: 'Intense', desc: 'Strong glass effect' }
                        ].map((preset) => (
                          <Button
                            key={preset.key}
                            variant="outlined"
                            fullWidth
                            size="small"
                            onClick={() => {
                              const presets = {
                                minimal: { blurIntensity: 4, opacity: 0.03, borderOpacity: 0.05, shadowIntensity: 0.1, borderRadius: 8, saturation: 1.2, brightness: 1.0, contrast: 1.0 },
                                subtle: { blurIntensity: 8, opacity: 0.05, borderOpacity: 0.1, shadowIntensity: 0.2, borderRadius: 12, saturation: 1.5, brightness: 1.05, contrast: 1.1 },
                                moderate: { blurIntensity: 12, opacity: 0.1, borderOpacity: 0.2, shadowIntensity: 0.3, borderRadius: 16, saturation: 1.8, brightness: 1.1, contrast: 1.2 },
                                intense: { blurIntensity: 20, opacity: 0.15, borderOpacity: 0.3, shadowIntensity: 0.4, borderRadius: 20, saturation: 2.2, brightness: 1.2, contrast: 1.3 }
                              };
                              onGlassConfigChange(presets[preset.key as keyof typeof presets]);
                            }}
                            sx={{
                              borderColor: 'rgba(255, 255, 255, 0.3)',
                              color: 'rgba(255, 255, 255, 0.8)',
                              textTransform: 'none',
                              '&:hover': {
                                borderColor: 'var(--primary-color)',
                                backgroundColor: 'rgba(138, 180, 248, 0.1)',
                              }
                            }}
                          >
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                                {preset.name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.7rem' }}>
                                {preset.desc}
                              </Typography>
                            </Box>
                          </Button>
                        ))}
                      </Box>
                    </Box>

                    {/* Reset to Default */}
                    <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          onColorPaletteChange('purpleLove');
                          onGlassConfigChange({
                            blurIntensity: 12,
                            opacity: 0.1,
                            borderOpacity: 0.2,
                            shadowIntensity: 0.3,
                            borderRadius: 16,
                            saturation: 1.8,
                            brightness: 1.1,
                            contrast: 1.2,
                          });
                        }}
                        sx={{
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                          color: 'rgba(255, 255, 255, 0.8)',
                          '&:hover': {
                            borderColor: 'var(--primary-color)',
                            backgroundColor: 'rgba(138, 180, 248, 0.1)',
                          }
                        }}
                      >
                        Reset to Default Theme
                      </Button>
                    </Box>
                  </motion.div>
                </TabPanel>
              </Box>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
};

export default SettingsModal; 