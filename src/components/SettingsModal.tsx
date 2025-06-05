import React, { useState, useEffect } from 'react';
import {
  Modal, Box, Paper, Typography, List, ListItem, ListItemText, Switch, IconButton, Divider,
  Tab, Tabs, TextField, Button, Alert, Slider, FormControl, InputLabel, Select, MenuItem,
  ToggleButton, ToggleButtonGroup, Card, CardContent, CardMedia, Chip, Grid
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { colorPalettes, type ColorPalette } from '../theme/colorPalettes';
import { type GlassThemeConfig } from '../theme/glassTheme';
import { prebuiltThemes, type PrebuiltTheme, getAllCategories, getThemesByCategory } from '../theme/prebuiltThemes';
import CloseIcon from '@mui/icons-material/Close';
import PaletteIcon from '@mui/icons-material/Palette';
import WallpaperIcon from '@mui/icons-material/Wallpaper';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CategoryIcon from '@mui/icons-material/Category';
import TuneIcon from '@mui/icons-material/Tune';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import BlurOnIcon from '@mui/icons-material/BlurOn';
import FormatPaintIcon from '@mui/icons-material/FormatPaint';

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
  // New pre-built theme props
  onApplyPrebuiltTheme?: (theme: PrebuiltTheme) => void;
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
  { id: 'knight', name: 'Knight', path: '/wallpapers/knight.jpg' },
  { id: 'arcane', name: 'Arcane', path: '/wallpapers/arcane.png' },
  { id: 'rdr', name: 'Red Dead Redemption', path: '/wallpapers/RDR.png' },
];

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      style={{
        height: '100%',
        overflow: 'visible'
      }}
      {...other}
    >
      {value === index && (
        <Box sx={{ 
          p: { xs: 2, sm: 3 },
          height: '100%',
          minHeight: 'fit-content'
        }}>
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
  onGlassConfigChange,
  onApplyPrebuiltTheme
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [userName, setUserName] = useState(initialUserName);
  const [locationInput, setLocationInput] = useState(currentLocation);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [uploadingWallpaper, setUploadingWallpaper] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customThemeMode, setCustomThemeMode] = useState<'prebuilt' | 'custom'>('prebuilt');

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
    window.location.reload();
  };

  const handleCancelReset = () => {
    setShowResetConfirm(false);
  };

  const handleCustomWallpaperUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setUploadingWallpaper(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target?.result as string;
      
      if (customWallpapers.includes(base64String)) {
        alert('This wallpaper has already been uploaded');
        setUploadingWallpaper(false);
        return;
      }
      
      onAddCustomWallpaper(base64String);
      onWallpaperChange(base64String);
      setUploadingWallpaper(false);
      event.target.value = '';
    };

    reader.onerror = () => {
      alert('Error reading file');
      setUploadingWallpaper(false);
    };

    reader.readAsDataURL(file);
  };

  const handleApplyPrebuiltTheme = (theme: PrebuiltTheme) => {
    // Apply wallpaper
    onWallpaperChange(theme.wallpaper);
    
    // Apply color palette
    onColorPaletteChange(theme.colorPalette.id);
    
    // Apply glass configuration
    onGlassConfigChange(theme.glassConfig);
    
    // Call the optional callback
    if (onApplyPrebuiltTheme) {
      onApplyPrebuiltTheme(theme);
    }
  };

  const getFilteredThemes = () => {
    if (selectedCategory === 'all') {
      return prebuiltThemes;
    }
    return getThemesByCategory(selectedCategory as any);
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

  const themeCardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: (i: number) => ({ 
      opacity: 1, 
      y: 0, 
      transition: { 
        delay: i * 0.1,
        duration: 0.3 
      } 
    }),
    hover: { 
      y: -8, 
      scale: 1.02,
      boxShadow: "0px 15px 30px rgba(0,0,0,0.4)",
      transition: { duration: 0.2 } 
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="settings-modal-title"
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        p: 2
      }}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ 
              width: '100%',
              maxWidth: '1200px',
              minWidth: '320px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column'
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
                border: '1px solid rgba(255, 255, 255, 0.05) !important',
                display: 'flex',
                flexDirection: 'column',
                width: {
                  xs: '95vw',
                  sm: '85vw',
                  md: '75vw',
                  lg: '65vw',
                  xl: '1200px'
                },
                height: {
                  xs: '85vh',
                  sm: '80vh',
                  md: '85vh',
                }
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                p: { xs: 2, sm: 2.5 },
                borderBottom: 1, 
                borderColor: 'rgba(255, 255, 255, 0.05)',
                position: 'relative',
                flexShrink: 0
              }}>
                <Typography 
                  id="settings-modal-title" 
                  variant="h5" 
                  component="h2"
                  sx={{
                    fontWeight: 600,
                    letterSpacing: '0.5px',
                    fontSize: { xs: '1.25rem', sm: '1.5rem' }
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

              <Box sx={{ 
                width: '100%', 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column',
                overflow: 'hidden'
              }}>
                <Box sx={{ 
                  borderBottom: 1, 
                  borderColor: 'rgba(255, 255, 255, 0.05)',
                  flexShrink: 0
                }}>
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
                        fontSize: { xs: '0.85rem', sm: '0.95rem' },
                        letterSpacing: '0.5px',
                        minHeight: { xs: 40, sm: 48 },
                        padding: { xs: '6px 8px', sm: '12px 16px' }
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
                    <Tab label="Themes" id="settings-tab-2" />
                  </Tabs>
                </Box>

                {/* Tab content container with proper scrolling */}
                <Box sx={{ 
                  flex: 1, 
                  overflow: 'auto',
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '4px',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.3)',
                    },
                  },
                }}>
                  {/* General Tab */}
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

                  {/* Widgets Tab */}
                  <TabPanel value={tabValue} index={1}>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Layout Prioritization Info */}
                      <Alert 
                        severity="info" 
                        sx={{ 
                          mb: 3,
                          background: 'linear-gradient(135deg, rgba(138, 180, 248, 0.1), rgba(197, 138, 249, 0.1))',
                          border: '1px solid rgba(138, 180, 248, 0.3)',
                          borderRadius: 'var(--radius-lg)',
                          color: 'rgba(255, 255, 255, 0.9)',
                          '& .MuiAlert-icon': {
                            color: 'var(--primary-color)'
                          }
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                          Layout Behavior
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', opacity: 0.8 }}>
                          Widget positions are preserved when you show/hide widgets or change column count. 
                          Use the "Auto arrange" button in edit mode for automatic repositioning when needed.
                        </Typography>
                      </Alert>

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

                  {/* New Combined Theme Design Tab */}
                  <TabPanel value={tabValue} index={2}>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Glass Theme Toggle Design */}
                      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
                        <ToggleButtonGroup
                          value={customThemeMode}
                          exclusive
                          onChange={(event, newMode) => { if (newMode) setCustomThemeMode(newMode); }}
                          aria-label="theme mode"
                          sx={{
                            background: 'rgba(255, 255, 255, 0.08)',
                            borderRadius: '12px',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            '& .MuiToggleButton-root': {
                              color: 'rgba(255, 255, 255, 0.6)',
                              px: 3,
                              py: 1,
                              textTransform: 'none',
                              fontWeight: 500,
                              fontSize: '0.9rem',
                            },
                            '& .Mui-selected': {
                              color: 'rgba(255, 255, 255, 0.95)',
                              backgroundColor: 'rgba(255, 255, 255, 0.15)',
                            },
                            '& .MuiToggleButton-root:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            },
                          }}
                        >
                          <ToggleButton value="prebuilt" aria-label="pre-built themes">Pre-built</ToggleButton>
                          <ToggleButton value="custom" aria-label="custom themes">Custom</ToggleButton>
                        </ToggleButtonGroup>
                      </Box>

                      {/* Pre-built Themes Section */}
                      {customThemeMode === 'prebuilt' && (
                        <Box>
                          {/* Enhanced Category Filter with Modern Design */}
                          <Box sx={{ 
                            mb: 4, 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 3, 
                            flexWrap: 'wrap', 
                            justifyContent: 'center',
                            p: 3,
                            background: 'linear-gradient(145deg, rgba(20, 20, 30, 0.8), rgba(15, 15, 25, 0.9))',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            borderRadius: '20px',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.3), 0 1px 0 rgba(255, 255, 255, 0.04) inset'
                          }}>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 1,
                              mb: { xs: 1, sm: 0 }
                            }}>
                              <CategoryIcon sx={{ 
                                color: 'var(--primary-color)', 
                                fontSize: 18,
                                filter: 'drop-shadow(0 0 8px rgba(138, 180, 248, 0.3))'
                              }} />
                              <Typography variant="body2" sx={{ 
                                color: 'rgba(255, 255, 255, 0.8)', 
                                fontWeight: 500,
                                fontSize: '0.85rem'
                              }}>
                                Filter
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: 'center' }}>
                              <Chip
                                label="All"
                                onClick={() => setSelectedCategory('all')}
                                variant={selectedCategory === 'all' ? 'filled' : 'outlined'}
                                sx={{
                                  background: selectedCategory === 'all' 
                                    ? 'linear-gradient(135deg, var(--primary-color), #667eea)' 
                                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
                                  backdropFilter: 'blur(10px)',
                                  WebkitBackdropFilter: 'blur(10px)',
                                  borderColor: selectedCategory === 'all' 
                                    ? 'transparent' 
                                    : 'rgba(255, 255, 255, 0.15)',
                                  color: selectedCategory === 'all' 
                                    ? 'white' 
                                    : 'rgba(255, 255, 255, 0.8)',
                                  fontWeight: 600,
                                  fontSize: '0.85rem',
                                  letterSpacing: '0.2px',
                                  boxShadow: selectedCategory === 'all' 
                                    ? '0 8px 20px rgba(138, 180, 248, 0.3)' 
                                    : '0 4px 12px rgba(0, 0, 0, 0.2)',
                                  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                  '&:hover': {
                                    background: selectedCategory === 'all' 
                                      ? 'linear-gradient(135deg, var(--primary-color), #667eea)' 
                                      : 'rgba(255, 255, 255, 0.1)',
                                    transform: 'translateY(-2px)',
                                    boxShadow: selectedCategory === 'all' 
                                      ? '0 12px 28px rgba(138, 180, 248, 0.4)' 
                                      : '0 8px 20px rgba(255, 255, 255, 0.1)',
                                  }
                                }}
                              />
                              {getAllCategories().map((category) => (
                                <Chip
                                  key={category}
                                  label={category.charAt(0).toUpperCase() + category.slice(1)}
                                  onClick={() => setSelectedCategory(category)}
                                  variant={selectedCategory === category ? 'filled' : 'outlined'}
                                  sx={{
                                    background: selectedCategory === category 
                                      ? 'linear-gradient(135deg, var(--primary-color), #667eea)' 
                                      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
                                    backdropFilter: 'blur(10px)',
                                    WebkitBackdropFilter: 'blur(10px)',
                                    borderColor: selectedCategory === category 
                                      ? 'transparent' 
                                      : 'rgba(255, 255, 255, 0.15)',
                                    color: selectedCategory === category 
                                      ? 'white' 
                                      : 'rgba(255, 255, 255, 0.8)',
                                    fontWeight: 600,
                                    fontSize: '0.85rem',
                                    letterSpacing: '0.2px',
                                    boxShadow: selectedCategory === category 
                                      ? '0 8px 20px rgba(138, 180, 248, 0.3)' 
                                      : '0 4px 12px rgba(0, 0, 0, 0.2)',
                                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                    '&:hover': {
                                      background: selectedCategory === category 
                                        ? 'linear-gradient(135deg, var(--primary-color), #667eea)' 
                                        : 'rgba(255, 255, 255, 0.1)',
                                      transform: 'translateY(-2px)',
                                      boxShadow: selectedCategory === category 
                                        ? '0 12px 28px rgba(138, 180, 248, 0.4)' 
                                        : '0 8px 20px rgba(255, 255, 255, 0.1)',
                                    }
                                  }}
                                />
                              ))}
                            </Box>
                          </Box>

                          {/* Pre-built Themes Grid - Using Box instead of Grid */}
                          <Box sx={{ 
                            display: 'grid',
                            gridTemplateColumns: {
                              xs: '1fr',
                              sm: 'repeat(2, 1fr)',
                              md: 'repeat(3, 1fr)'
                            },
                            gap: 3,
                            mb: 2
                          }}>
                            {getFilteredThemes().map((theme, index) => (
                              <motion.div
                                key={theme.id}
                                custom={index}
                                variants={themeCardVariants}
                                initial="initial"
                                animate="animate"
                                whileHover="hover"
                              >
                                <Card
                                  onClick={() => handleApplyPrebuiltTheme(theme)}
                                  sx={{
                                    cursor: 'pointer',
                                    background: 'linear-gradient(145deg, rgba(25, 25, 35, 0.95), rgba(20, 20, 30, 0.9))',
                                    backdropFilter: 'blur(20px)',
                                    WebkitBackdropFilter: 'blur(20px)',
                                    border: currentWallpaper === theme.wallpaper 
                                      ? '2px solid var(--primary-color)' 
                                      : '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '20px',
                                    overflow: 'hidden',
                                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                    position: 'relative',
                                    boxShadow: currentWallpaper === theme.wallpaper 
                                      ? '0 20px 40px rgba(138, 180, 248, 0.3), 0 0 0 1px rgba(138, 180, 248, 0.2)' 
                                      : '0 10px 30px rgba(0, 0, 0, 0.4), 0 1px 0 rgba(255, 255, 255, 0.05) inset',
                                    '&::before': {
                                      content: '""',
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      right: 0,
                                      height: '1px',
                                      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
                                      opacity: 0.6
                                    },
                                    '&:hover': {
                                      borderColor: 'var(--primary-color)',
                                      transform: 'translateY(-8px) scale(1.02)',
                                      boxShadow: '0 25px 50px rgba(138, 180, 248, 0.25), 0 0 0 1px rgba(138, 180, 248, 0.3)',
                                      '& .theme-preview': {
                                        transform: 'scale(1.05)',
                                        filter: 'brightness(1.1) saturate(1.2)',
                                      }
                                    }
                                  }}
                                >
                                  <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                                    <CardMedia
                                      component="img"
                                      height="140"
                                      image={theme.wallpaper}
                                      alt={theme.name}
                                      className="theme-preview"
                                      sx={{
                                        objectFit: 'cover',
                                        filter: 'brightness(0.85) saturate(1.1)',
                                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                      }}
                                    />
                                    <Box
                                      sx={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        height: '50%',
                                        background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.7))',
                                      }}
                                    />
                                    {currentWallpaper === theme.wallpaper && (
                                      <Box
                                        sx={{
                                          position: 'absolute',
                                          top: 12,
                                          right: 12,
                                          background: 'linear-gradient(135deg, var(--primary-color), #667eea)',
                                          borderRadius: '50%',
                                          width: 28,
                                          height: 28,
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          boxShadow: '0 4px 12px rgba(138, 180, 248, 0.4)',
                                          animation: 'pulse 2s infinite'
                                        }}
                                      >
                                        <AutoAwesomeIcon sx={{ fontSize: 16, color: 'white' }} />
                                      </Box>
                                    )}
                                  </Box>
                                  <CardContent sx={{ 
                                    p: 3, 
                                    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.01))',
                                    position: 'relative'
                                  }}>
                                    <Typography variant="h6" sx={{ 
                                      color: 'white', 
                                      fontWeight: 700,
                                      fontSize: '1.1rem',
                                      mb: 1,
                                      letterSpacing: '0.3px'
                                    }}>
                                      {theme.name}
                                    </Typography>
                                    <Typography variant="body2" sx={{ 
                                      color: 'rgba(255, 255, 255, 0.7)',
                                      fontSize: '0.9rem',
                                      mb: 2,
                                      lineHeight: 1.5,
                                      fontWeight: 400
                                    }}>
                                      {theme.description}
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <Chip
                                        label={theme.category}
                                        size="small"
                                        sx={{
                                          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
                                          color: 'rgba(255, 255, 255, 0.9)',
                                          fontSize: '0.75rem',
                                          fontWeight: 500,
                                          backdropFilter: 'blur(10px)',
                                          WebkitBackdropFilter: 'blur(10px)',
                                          border: '1px solid rgba(255, 255, 255, 0.1)',
                                          textTransform: 'capitalize'
                                        }}
                                      />
                                      <Box sx={{ 
                                        fontSize: '0.75rem', 
                                        color: 'rgba(255, 255, 255, 0.6)',
                                        fontWeight: 500
                                      }}>
                                        Click to apply
                                      </Box>
                                    </Box>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            ))}
                          </Box>
                        </Box>
                      )}

                      {/* Custom Theme Design Section */}
                      {customThemeMode === 'custom' && (
                        <Box>
                          {/* Custom Wallpaper Upload Section */}
                          <Box sx={{ mb: 4 }}>
                            <Typography variant="subtitle2" gutterBottom sx={{ 
                              color: 'rgba(255, 255, 255, 0.8)',
                              fontWeight: 500,
                              mb: 2,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              fontSize: '0.9rem'
                            }}>
                              <WallpaperIcon sx={{ fontSize: 18 }} />
                              Wallpapers
                            </Typography>

                            {/* Upload Section */}
                            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
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
                                  {uploadingWallpaper ? 'Uploading...' : '+ Upload Custom'}
                                </Button>
                              </label>
                              
                              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.75rem' }}>
                                JPG, PNG, WebP supported
                              </Typography>
                            </Box>

                            {/* Wallpaper Grid */}
                            <Box sx={{ 
                              display: 'grid', 
                              gridTemplateColumns: {
                                xs: 'repeat(3, 1fr)',
                                sm: 'repeat(4, 1fr)',
                                md: 'repeat(5, 1fr)',
                                lg: 'repeat(6, 1fr)'
                              }, 
                              gap: { xs: 1.5, sm: 2 }
                            }}>
                              {/* Default Wallpapers */}
                              {WALLPAPERS.filter(wallpaper => !hiddenDefaultWallpapers.includes(wallpaper.path)).map((wallpaper, i) => (
                                <Box key={wallpaper.id} sx={{ position: 'relative' }}>
                                  <Box
                                    onClick={() => onWallpaperChange(wallpaper.path)}
                                    sx={{
                                      height: { xs: 60, sm: 80 },
                                      width: '100%',
                                      aspectRatio: '1',
                                      backgroundImage: `url(${wallpaper.path})`,
                                      backgroundSize: 'cover',
                                      backgroundPosition: 'center',
                                      borderRadius: '8px',
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
                                  <IconButton
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDeleteDefaultWallpaper(wallpaper.path);
                                    }}
                                    sx={{
                                      position: 'absolute',
                                      top: 2,
                                      right: 2,
                                      width: 20,
                                      height: 20,
                                      backgroundColor: 'rgba(211, 47, 47, 0.9)',
                                      color: 'white',
                                      zIndex: 10,
                                      '&:hover': {
                                        backgroundColor: 'rgba(211, 47, 47, 1)',
                                        transform: 'scale(1.1)'
                                      },
                                      '& .MuiSvgIcon-root': {
                                        fontSize: '14px'
                                      }
                                    }}
                                  >
                                    <CloseIcon />
                                  </IconButton>
                                </Box>
                              ))}

                              {/* Custom Wallpapers */}
                              {customWallpapers.map((customWallpaper, i) => (
                                <Box key={`custom-${i}`} sx={{ position: 'relative' }}>
                                  <Box
                                    onClick={() => onWallpaperChange(customWallpaper)}
                                    sx={{
                                      height: { xs: 60, sm: 80 },
                                      width: '100%',
                                      aspectRatio: '1',
                                      backgroundImage: `url(${customWallpaper})`,
                                      backgroundSize: 'cover',
                                      backgroundPosition: 'center',
                                      borderRadius: '8px',
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
                                  <IconButton
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDeleteCustomWallpaper(customWallpaper);
                                    }}
                                    sx={{
                                      position: 'absolute',
                                      top: 2,
                                      right: 2,
                                      width: 20,
                                      height: 20,
                                      backgroundColor: 'rgba(211, 47, 47, 0.9)',
                                      color: 'white',
                                      zIndex: 10,
                                      '&:hover': {
                                        backgroundColor: 'rgba(211, 47, 47, 1)',
                                        transform: 'scale(1.1)'
                                      },
                                      '& .MuiSvgIcon-root': {
                                        fontSize: '14px'
                                      }
                                    }}
                                  >
                                    <CloseIcon />
                                  </IconButton>
                                </Box>
                              ))}
                            </Box>
                          </Box>

                          {/* Color Palette Selection */}
                          <Box sx={{ mb: 4 }}>
                            <Typography variant="subtitle2" gutterBottom sx={{ 
                              color: 'rgba(255, 255, 255, 0.8)',
                              fontWeight: 500,
                              mb: 2,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              fontSize: '0.9rem'
                            }}>
                              <ColorLensIcon sx={{ fontSize: 18 }} />
                              Colors
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
                                      </Box>
                                    </Box>
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Box>

                          {/* Glass Effect Configuration */}
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" gutterBottom sx={{ 
                              color: 'rgba(255, 255, 255, 0.8)',
                              fontWeight: 500,
                              mb: 2,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              fontSize: '0.9rem'
                            }}>
                              <BlurOnIcon sx={{ fontSize: 18 }} />
                              Glass Effects
                            </Typography>

                            {/* Blur Intensity */}
                            <Box sx={{ mb: 2 }}>
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
                            <Box sx={{ mb: 2 }}>
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

                            {/* Glass Presets */}
                            <Box sx={{ mt: 3 }}>
                              <Typography variant="body2" gutterBottom sx={{ 
                                color: 'rgba(255, 255, 255, 0.8)',
                                fontWeight: 500,
                                mb: 2
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
                          </Box>
                        </Box>
                      )}
                    </motion.div>
                  </TabPanel>
                </Box>
              </Box>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
};

export default SettingsModal; 