import React, { useState, useEffect } from 'react';
import {
  Modal, Box, Paper, Typography, List, ListItem, ListItemText, Switch, IconButton, Divider,
  Tab, Tabs, TextField, Button, Alert
} from '@mui/material';
import { Grid } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { motion, AnimatePresence } from 'framer-motion';

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
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Available wallpapers (these will be stored in public/wallpapers)
const WALLPAPERS = [
  { id: 'default', name: 'Default', path: '/wallpapers/default.jpg' },
  { id: 'mountains', name: 'Mountains', path: '/wallpapers/mountains.jpg' },
  { id: 'ocean', name: 'Ocean', path: '/wallpapers/ocean.jpg' },
  { id: 'forest', name: 'Forest', path: '/wallpapers/forest.jpg' },
  { id: 'night', name: 'Night Sky', path: '/wallpapers/night.jpg' },
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
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [userName, setUserName] = useState(initialUserName);
  const [locationInput, setLocationInput] = useState(currentLocation);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [customWallpaper, setCustomWallpaper] = useState<string | null>(() => {
    return localStorage.getItem('customWallpaper');
  });
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
    setCustomWallpaper(null); // Clear custom wallpaper state
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

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setUploadingWallpaper(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target?.result as string;
      setCustomWallpaper(base64String);
      localStorage.setItem('customWallpaper', base64String);
      onWallpaperChange(base64String);
      setUploadingWallpaper(false);
    };

    reader.onerror = () => {
      alert('Error reading file');
      setUploadingWallpaper(false);
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveCustomWallpaper = () => {
    setCustomWallpaper(null);
    localStorage.removeItem('customWallpaper');
    // Set to default wallpaper
    onWallpaperChange('/wallpapers/default.jpg');
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

                    {/* Custom Wallpaper Upload Section */}
                    <Box sx={{ mb: 3, p: 2, borderRadius: '8px', backgroundColor: 'rgba(30, 30, 40, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <Typography variant="body2" gutterBottom sx={{ 
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontWeight: 500,
                        mb: 2,
                        textAlign: 'left'
                      }}>
                        Upload Custom Wallpaper
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                            sx={{
                              width: '100%',
                              borderColor: 'rgba(255, 255, 255, 0.3)',
                              color: 'white',
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
                            {uploadingWallpaper ? 'Uploading...' : 'Choose Image'}
                          </Button>
                        </label>
                        
                        {customWallpaper && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                              sx={{
                                width: 60,
                                height: 40,
                                backgroundImage: `url(${customWallpaper})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                borderRadius: '4px',
                                border: currentWallpaper === customWallpaper 
                                  ? '2px solid var(--primary-color)' 
                                  : '1px solid rgba(255, 255, 255, 0.2)',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  opacity: 0.8
                                }
                              }}
                              onClick={() => onWallpaperChange(customWallpaper)}
                            />
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', flex: 1 }}>
                              Custom wallpaper
                            </Typography>
                            <Button
                              size="small"
                              color="error"
                              onClick={handleRemoveCustomWallpaper}
                              sx={{ 
                                minWidth: 'auto',
                                color: 'rgba(255, 100, 100, 0.9)',
                                '&:hover': {
                                  backgroundColor: 'rgba(211, 47, 47, 0.1)'
                                }
                              }}
                            >
                              Remove
                            </Button>
                          </Box>
                        )}
                        
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                          Supported formats: JPG, PNG, WebP. Max size: 5MB
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2 }}>
                      {WALLPAPERS.map((wallpaper, i) => (
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