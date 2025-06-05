import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Grid, IconButton, Box, Typography, Snackbar, Alert, ButtonGroup, Button, Tooltip } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import OpenWithIcon from '@mui/icons-material/OpenWith';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import AddColumnIcon from '@mui/icons-material/KeyboardArrowRight';
import RemoveColumnIcon from '@mui/icons-material/KeyboardArrowLeft';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import FlagIcon from '@mui/icons-material/Flag';
import DeleteIcon from '@mui/icons-material/Delete';
import type { WidgetConfig, QuickLink, Todo, WidgetLayout } from './types';
import type { Layout } from 'react-grid-layout';
import { MdApps } from 'react-icons/md'; // Perfect dashboard/widget grid icon
import ReactDOMServer from 'react-dom/server'; // To render icon to string

// Import Theme System
import { colorPalettes, getColorPalette, getDefaultColorPalette, type ColorPalette } from './theme/colorPalettes';
import { applyColorPalette, getStoredColorPalette, getStoredGlassConfig, type GlassThemeConfig, defaultGlassConfig } from './theme/glassTheme';
import { prebuiltThemes, type PrebuiltTheme, applyPrebuiltTheme, getStoredPrebuiltTheme } from './theme/prebuiltThemes';

// Import Glass Theme CSS
import './styles/glass-theme.css';

// Import Widgets
import Clock from './widgets/Clock';
import Weather from './widgets/Weather'; // Assuming Weather exists
import QuickLinks from './widgets/QuickLinks';
import Calendar from './widgets/Calendar'; // Import the new Calendar widget
import AddQuickLinkForm from './components/AddQuickLinkForm'; 
import SettingsModal from './components/SettingsModal';
import Greeting from './components/Greeting'; // Import Greeting
import SearchBar from './components/SearchBar'; // Import SearchBar
import WidgetGrid from './components/WidgetGrid'; // Import WidgetGrid component
import Music from './widgets/Music'; // Import the Music widget
import RSS from './widgets/RSS'; // Import the RSS widget
import Github from './widgets/Github'; // Import the GitHub widget
import Timer from './widgets/Timer'; // Import the Timer widget
import BrowserHistory from './widgets/BrowserHistory'; // Import the BrowserHistory widget
import NotesReminders from './widgets/NotesReminders'; // Import the NotesReminders widget (now includes todos)
import DailyQuotes from './widgets/DailyQuotes'; // Import the Daily Quotes widget

// import './App.css'; // Removed as file doesn't exist

// Add logging utility function after imports and before WidgetWrapper
const logWidgetLayouts = (layouts: Record<string, WidgetLayout>, context: string = 'Layout Change') => {
  console.group(`🔧 ${context} - Widget Layout Log`);
  console.log(`📅 Timestamp: ${new Date().toLocaleString()}`);
  console.log(`📊 Total Widgets: ${Object.keys(layouts).length}`);
  console.log('─'.repeat(80));
  
  // Sort widgets by position (y first, then x) for better readability
  const sortedWidgets = Object.entries(layouts).sort(([, a], [, b]) => {
    if (a.y !== b.y) return a.y - b.y;
    return a.x - b.x;
  });
  
  sortedWidgets.forEach(([widgetId, layout]) => {
    const { x, y, w, h } = layout;
    console.log(`📦 ${widgetId.toUpperCase()}:`);
    console.log(`   📍 Position: (${x}, ${y})`);
    console.log(`   📏 Size: ${w} × ${h} (width × height)`);
    console.log(`   🎯 Grid Area: x:${x}-${x + w}, y:${y}-${y + h}`);
    console.log(`   📐 Total Grid Units: ${w * h}`);
    console.log('');
  });
  
  // Calculate grid statistics
  const maxX = Math.max(...sortedWidgets.map(([, layout]) => layout.x + layout.w));
  const maxY = Math.max(...sortedWidgets.map(([, layout]) => layout.y + layout.h));
  const totalGridUnits = sortedWidgets.reduce((sum, [, layout]) => sum + (layout.w * layout.h), 0);
  
  console.log('📈 Grid Statistics:');
  console.log(`   🔢 Grid Width Used: ${maxX} columns`);
  console.log(`   📏 Grid Height Used: ${maxY} rows`);
  console.log(`   🎯 Total Grid Units Used: ${totalGridUnits}`);
  console.log(`   📊 Average Widget Size: ${(totalGridUnits / Object.keys(layouts).length).toFixed(1)} units`);
  
  console.groupEnd();
};

// Define WidgetWrapper outside the App component for stability
interface WidgetWrapperProps {
  widget: { id: string; name: string; component: React.ComponentType<any> };
  widgetProps: any;
  editMode: boolean;
  layout: WidgetLayout | undefined;
  onDelete: (widgetId: string) => void;
}

const WidgetWrapper = React.memo<WidgetWrapperProps>(({ widget, widgetProps, editMode, layout, onDelete }) => {
  return (
    <Box sx={{ 
      height: '100%', 
      position: 'relative',
      border: editMode ? '2px dashed rgba(138, 180, 248, 0.6)' : 'none',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      background: editMode ? 'linear-gradient(135deg, rgba(138, 180, 248, 0.05) 0%, rgba(197, 138, 249, 0.05) 100%)' : 'transparent',
      boxShadow: editMode ? '0 0 20px rgba(138, 180, 248, 0.2), inset 0 0 20px rgba(138, 180, 248, 0.1)' : 'none',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      // Ensure resize handles are not blocked
      '& .react-resizable-handle': {
        zIndex: 15,
        opacity: editMode ? 1 : 0,
        transition: 'opacity 0.3s ease',
        background: editMode ? 'linear-gradient(45deg, rgba(138, 180, 248, 0.8), rgba(197, 138, 249, 0.8))' : 'transparent',
        borderRadius: '50%',
        '&:hover': {
          background: editMode ? 'linear-gradient(45deg, rgba(138, 180, 248, 1), rgba(197, 138, 249, 1))' : 'transparent',
          transform: 'scale(1.2)',
          boxShadow: '0 0 15px rgba(138, 180, 248, 0.6)'
        }
      }
    }}>
      {editMode && (
        <>
          {/* Top drag handle */}
          <Box className="drag-handle" sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '32px',
            background: 'linear-gradient(135deg, rgba(138, 180, 248, 0.9) 0%, rgba(197, 138, 249, 0.9) 100%)',
            color: 'white',
            padding: '4px 8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.8rem',
            zIndex: 12,
            backdropFilter: 'blur(8px) saturate(1.2)',
            WebkitBackdropFilter: 'blur(8px) saturate(1.2)',
            cursor: 'move',
            borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
            boxShadow: 
              '0 4px 15px rgba(138, 180, 248, 0.3), ' +
              'inset 0 1px 0 rgba(255, 255, 255, 0.3), ' +
              'inset 0 -1px 0 rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              background: 'linear-gradient(135deg, rgba(138, 180, 248, 1) 0%, rgba(197, 138, 249, 1) 100%)',
              transform: 'translateY(-1px)',
              boxShadow: 
                '0 6px 20px rgba(138, 180, 248, 0.4), ' +
                'inset 0 1px 0 rgba(255, 255, 255, 0.4), ' +
                'inset 0 -1px 0 rgba(0, 0, 0, 0.1)'
            }
          }}>
            <DragIndicatorIcon fontSize="small" />
            <Typography variant="caption">{widget.name}</Typography>
            <IconButton
              aria-label="delete-widget"
              onClick={() => onDelete(widget.id)}
              className="no-drag" // Prevent dragging when clicking delete
              sx={{
                color: 'white',
                padding: '4px',
                '&:hover': { color: 'rgba(255,0,0,0.8)' }
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
          
          {/* Size indicator */}
          <Box sx={{
            position: 'absolute',
            bottom: 4,
            left: 4,
            backgroundColor: 'rgba(15, 15, 20, 0.7)',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '0.7rem',
            zIndex: 11,
            backdropFilter: 'blur(4px)',
            opacity: 0.7,
            pointerEvents: 'none' // Don't interfere with resize handles
          }}>
            {`${layout?.w || 2} × ${layout?.h || 2}`}
          </Box>
        </>
      )}
      <Box 
        className="no-drag" // Prevent dragging from widget content
        sx={{ 
          height: '100%', 
          overflow: 'auto',
          // Use a consistent content area that accounts for the header
          ...(editMode ? {
            paddingTop: '32px',
            boxSizing: 'border-box'
          } : {}),
          position: 'relative'
        }}
      >
        {/* Use JSX syntax directly */}
        <widget.component {...widgetProps} />
      </Box>
    </Box>
  );
});

// Create a country flag component based on IP
const CountryFlag = () => {
  const [countryCode, setCountryCode] = useState<string>('us'); // Default to US
  const [useDefaultFlag, setUseDefaultFlag] = useState<boolean>(false);

  useEffect(() => {
    const fetchCountry = async () => {
      try {
        // Use ip-api.com which seems to have better CORS support for free usage
        const response = await fetch('http://ip-api.com/json/?fields=countryCode');
        const data = await response.json();
        if (data.countryCode) {
          setCountryCode(data.countryCode.toLowerCase());
          // If country is Iran, use default flag
          if (data.countryCode.toLowerCase() === 'ir') {
            setUseDefaultFlag(true);
          } else {
            setUseDefaultFlag(false);
          }
        } else {
          throw new Error('Could not determine country code from IP');
        }
      } catch (error) {
        console.error('Error fetching country from IP:', error);
        // Use default flag instead of 'us'
        setUseDefaultFlag(true);
      }
    };

    // Fetch country in background without blocking UI
    fetchCountry();
  }, []);

  return (
    <Tooltip title={`IP location: ${countryCode.toUpperCase()}`}>
      <Box 
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          width: 40,
          height: 40,
          borderRadius: '50%',
          overflow: 'hidden',
          cursor: 'pointer',
          boxShadow: '0 5px 15px rgba(0,0,0,0.25), inset 0 0 0 1.5px rgba(255,255,255,0.75)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.1)',
            boxShadow: '0 8px 20px rgba(0,0,0,0.3), inset 0 0 0 2px rgba(255,255,255,0.9)',
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '2%',
            left: '5%',
            width: '90%',
            height: '50%',
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.6), rgba(255,255,255,0))',
            zIndex: 3,
            borderRadius: '50% / 40% 40% 60% 60%',
            pointerEvents: 'none',
            filter: 'blur(1px)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle at 70% 20%, rgba(255,255,255,0.1), transparent 70%)',
            zIndex: 2,
            pointerEvents: 'none',
            opacity: 0.8,
          }
        }}
      >
        <Box 
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f0f0f0',
          }}
        >
          <img 
            src={useDefaultFlag ? '/sample/default_flag.png' : `https://flagcdn.com/w80/${countryCode}.png`}
            alt={useDefaultFlag ? 'Default flag' : `${countryCode} flag`}
            style={{ 
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center'
            }}
          />
        </Box>
      </Box>
    </Tooltip>
  );
};

const App = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showAddLinkForm, setShowAddLinkForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showColumnControls, setShowColumnControls] = useState(false);
  
  // Column count state
  const [columnCount, setColumnCount] = useState<Record<string, number>>(() => {
    const storedColumns = localStorage.getItem('columnCount');
    if (storedColumns) {
      return JSON.parse(storedColumns);
    }
    // Exactly 12 columns as seen in the screenshot
    return {
      lg: 12, 
      md: 10, 
      sm: 6, 
      xs: 4, 
      xxs: 2
    };
  });
  
  // Wallpaper state management
  const [customWallpapers, setCustomWallpapers] = useState<string[]>(() => {
    const stored = localStorage.getItem('customWallpapers');
    return stored ? JSON.parse(stored) : [];
  });

  const [hiddenDefaultWallpapers, setHiddenDefaultWallpapers] = useState<string[]>(() => {
    const stored = localStorage.getItem('hiddenDefaultWallpapers');
    return stored ? JSON.parse(stored) : [];
  });

  const [wallpaperShuffle, setWallpaperShuffle] = useState<boolean>(() => {
    const stored = localStorage.getItem('wallpaperShuffle');
    return stored ? JSON.parse(stored) : false;
  });

  const [currentWallpaper, setCurrentWallpaper] = useState<string>(() => {
    // Check for old single custom wallpaper first, then selected wallpaper, then default
    const oldCustomWallpaper = localStorage.getItem('customWallpaper');
    if (oldCustomWallpaper) {
      // Migrate old custom wallpaper to new system
      const existingCustomWallpapers = localStorage.getItem('customWallpapers');
      const customWallpapers = existingCustomWallpapers ? JSON.parse(existingCustomWallpapers) : [];
      if (!customWallpapers.includes(oldCustomWallpaper)) {
        customWallpapers.push(oldCustomWallpaper);
        localStorage.setItem('customWallpapers', JSON.stringify(customWallpapers));
      }
      localStorage.removeItem('customWallpaper'); // Remove old storage
      return oldCustomWallpaper;
    }
    return localStorage.getItem('selectedWallpaper') || '/wallpapers/default.jpg';
  });
  const [userName, setUserName] = useState<string>(() => {
      return localStorage.getItem('userName') || 'Mohammad';
  });
  // Add location state
  const [location, setLocation] = useState<string>(() => {
    return localStorage.getItem('weatherLocation') || 'Shiraz'; // Changed default to match screenshot
  });

  // Color Palette and Glass Theme State
  const [currentColorPalette, setCurrentColorPalette] = useState<ColorPalette>(() => {
    const storedPaletteId = getStoredColorPalette();
    if (storedPaletteId) {
      const palette = getColorPalette(storedPaletteId);
      if (palette) return palette;
    }
    return getDefaultColorPalette();
  });

  const [glassConfig, setGlassConfig] = useState<GlassThemeConfig>(() => {
    return getStoredGlassConfig();
  });

  // Widget Definitions
  const availableWidgets = [
    { id: 'clock', name: 'Clock', component: Clock },
    { id: 'weather', name: 'Weather', component: Weather },
    { id: 'quicklinks', name: 'Quick Links', component: QuickLinks },
    { id: 'calendar', name: 'Calendar', component: Calendar }, // Add Calendar widget
    { id: 'music', name: 'Music Player', component: Music }, // Add Music widget
    { id: 'rss', name: 'RSS', component: RSS }, // Add RSS widget
    { id: 'github', name: 'GitHub Contributions', component: Github }, // Add GitHub widget
    { id: 'timer', name: 'Working Timer', component: Timer }, // Add Timer widget
    { id: 'browserhistory', name: 'Browser History', component: BrowserHistory }, // Add BrowserHistory widget
    { id: 'notesreminders', name: 'Notes, Reminders & Todos', component: NotesReminders }, // Add NotesReminders widget (now includes todos)
    { id: 'dailyquotes', name: 'Daily Quotes', component: DailyQuotes }, // Add Daily Quotes widget
  ];

  // Widget Visibility State
  const [widgetVisibility, setWidgetVisibility] = useState<Record<string, boolean>>(() => {
    const storedVisibility = localStorage.getItem('widgetVisibility');
    if (storedVisibility) {
      return JSON.parse(storedVisibility);
    }
    // Default visibility based on the logged layout (all 10 widgets visible)
    return {
      quicklinks: true,
      clock: false, 
      weather: true,
      calendar: true,
      music: true,
      rss: true,
      github: false,
      timer: true,
      browserhistory: false, // Browser History widget - visible in logged layout
      notesreminders: true, // Notes, Reminders & Todos widget - visible in logged layout
      dailyquotes: true, // Daily Quotes widget - visible by default
    };
  });

  // Temporary widget visibility state during edit sessions
  const [tempWidgetVisibility, setTempWidgetVisibility] = useState<Record<string, boolean>>(() => widgetVisibility);

  // Quick Links State
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>(() => {
    const storedLinks = localStorage.getItem('quickLinks');
    if (storedLinks) {
      return JSON.parse(storedLinks);
    }
    // Default quick links
    return [
      { 
        id: 1, 
        title: 'Google', 
        url: 'https://www.google.com', 
        icon: 'https://www.google.com/s2/favicons?domain=google.com&sz=64' 
      },
      { 
        id: 2, 
        title: 'YouTube', 
        url: 'https://www.youtube.com', 
        icon: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=64' 
      },
      { 
        id: 3, 
        title: 'ChatGPT', 
        url: 'https://chatgpt.com/', 
        icon: 'https://www.google.com/s2/favicons?domain=chatgpt.com&sz=64' 
      },
      { 
        id: 4, 
        title: 'Reddit', 
        url: 'https://reddit.com', 
        icon: 'https://www.google.com/s2/favicons?domain=reddit.com&sz=64' 
      },
      { 
        id: 5, 
        title: 'LinkedIn', 
        url: 'https://linkedin.com', 
        icon: 'https://www.google.com/s2/favicons?domain=linkedin.com&sz=64' 
      },
      { 
        id: 6, 
        title: 'Twitter', 
        url: 'https://twitter.com', 
        icon: 'https://www.google.com/s2/favicons?domain=twitter.com&sz=64' 
      },
      { 
        id: 7, 
        title: 'DeepSeek', 
        url: 'https://chat.deepseek.com/', 
        icon: 'https://www.google.com/s2/favicons?domain=deepseek.com&sz=64' 
      },
      { 
        id: 8, 
        title: 'Perplexity', 
        url: 'https://www.perplexity.ai', 
        icon: 'https://www.google.com/s2/favicons?domain=perplexity.ai&sz=64' 
      },
      { 
        id: 9, 
        title: 'SoundCloud', 
        url: 'https://soundcloud.com/discover', 
        icon: 'https://www.google.com/s2/favicons?domain=soundcloud.com&sz=64' 
      },
      { 
        id: 10, 
        title: 'Instagram', 
        url: 'https://www.instagram.com', 
        icon: 'https://www.google.com/s2/favicons?domain=instagram.com&sz=64' 
      },
      { 
        id: 11, 
        title: 'Wikipedia', 
        url: 'https://wikipedia.org', 
        icon: 'https://www.google.com/s2/favicons?domain=wikipedia.org&sz=64' 
      },
      { 
        id: 12, 
        title: 'HuggingFace', 
        url: 'https://huggingface.co', 
        icon: 'https://www.google.com/s2/favicons?domain=huggingface.co&sz=64' 
      }
    ];
  });

 

  // Widget Layout State
  const [widgetLayouts, setWidgetLayouts] = useState<Record<string, WidgetLayout>>(() => {
    const storedLayouts = localStorage.getItem('widgetLayouts');
    if (storedLayouts) {
      return JSON.parse(storedLayouts);
    }
    // Layout with quicklinks prioritized at the top
    return {
      quicklinks:     { i: 'quicklinks',     x: 3,  y: 0,  w: 6, h: 6 }, // Quicklinks at the very top
      weather:        { i: 'weather',        x: 0,  y: 6,  w: 3, h: 12 }, // Weather starts after quicklinks
      github:         { i: 'github',         x: 9,  y: 6,  w: 3, h: 14 },

      music:          { i: 'music',          x: 0,  y: 18, w: 3, h: 14 },
      notesreminders: { i: 'notesreminders', x: 3,  y: 6,  w: 3, h: 20 },
      rss:            { i: 'rss',            x: 6,  y: 6,  w: 3, h: 20 },
      browserhistory: { i: 'browserhistory', x: 9,  y: 20, w: 3, h: 15 },
      dailyquotes:    { i: 'dailyquotes',    x: 0,  y: 32, w: 3, h: 12 }, // Daily Quotes widget
      
      clock:          { i: 'clock',          x: 3,  y: 26, w: 3, h: 6 },
      calendar:       { i: 'calendar',       x: 6,  y: 26, w: 3, h: 12 },
      timer:          { i: 'timer',          x: 9,  y: 35, w: 3, h: 8 },
    };
  });

  // Temporary widget layout state during edit sessions
  const [tempWidgetLayouts, setTempWidgetLayouts] = useState<Record<string, WidgetLayout>>(() => widgetLayouts);

  // Track previous column count for comparison
  const prevColumnCount = useRef(columnCount.lg);

  // Add state for openInNewTab
  const [openQuickLinksInNewTab, setOpenQuickLinksInNewTab] = useState(() => {
    const stored = localStorage.getItem('openQuickLinksInNewTab');
    return stored ? JSON.parse(stored) : true; // default true for better UX
  });

  // Fetch initial data from storage
  useEffect(() => {
    // Get username
    const storedName = localStorage.getItem('userName');
    if (storedName) setUserName(storedName);

    // Get quick links
    try {
        if (chrome.storage && chrome.storage.sync) {
            chrome.storage.sync.get(['quickLinks', 'selectedWallpaper', 'widgetVisibility'], (result) => {
                if (result.quickLinks) setQuickLinks(result.quickLinks);
                if (result.selectedWallpaper) setCurrentWallpaper(result.selectedWallpaper);
                if (result.widgetVisibility) setWidgetVisibility(result.widgetVisibility);
            });
        } else {
            // Fallback to localStorage if chrome.storage is not available
            const localLinks = localStorage.getItem('quickLinks');
            if (localLinks) setQuickLinks(JSON.parse(localLinks));

            const localWallpaper = localStorage.getItem('selectedWallpaper');
            if (localWallpaper) setCurrentWallpaper(localWallpaper);
             const localVisibility = localStorage.getItem('widgetVisibility');
            if (localVisibility) setWidgetVisibility(JSON.parse(localVisibility));
        }
    } catch (error) {
        console.error('Error fetching data from storage:', error);
        // Load defaults from localStorage as a fallback
        const localLinks = localStorage.getItem('quickLinks');
        if (localLinks) setQuickLinks(JSON.parse(localLinks));

         const localWallpaper = localStorage.getItem('selectedWallpaper');
        if (localWallpaper) setCurrentWallpaper(localWallpaper);
         const localVisibility = localStorage.getItem('widgetVisibility');
        if (localVisibility) setWidgetVisibility(JSON.parse(localVisibility));
    }

    // Ensure a valid wallpaper is set
    const validateAndSetWallpaper = () => {
      const storedWallpaper = localStorage.getItem('selectedWallpaper');
      if (!storedWallpaper) {
        // No wallpaper stored, set default
        const defaultWallpaper = '/wallpapers/default.jpg';
        setCurrentWallpaper(defaultWallpaper);
        localStorage.setItem('selectedWallpaper', defaultWallpaper);
      }
    };
    
    validateAndSetWallpaper();

    // Log initial layout state
    setTimeout(() => {
      logWidgetLayouts(widgetLayouts, 'App Initialization');
    }, 100); // Small delay to ensure all state is loaded

  }, []);

  // Sync custom wallpapers from localStorage when component mounts
  useEffect(() => {
    const syncCustomWallpapers = () => {
      const stored = localStorage.getItem('customWallpapers');
      if (stored) {
        const parsed = JSON.parse(stored);
        setCustomWallpapers(parsed);
      }
    };

    // Listen for storage changes from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'customWallpapers') {
        syncCustomWallpapers();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Save state changes to storage
  useEffect(() => {
    localStorage.setItem('widgetVisibility', JSON.stringify(widgetVisibility));
  }, [widgetVisibility]);

  useEffect(() => {
    // Only save to selectedWallpaper if it's not a custom base64 wallpaper
    if (!currentWallpaper.startsWith('data:image/')) {
      localStorage.setItem('selectedWallpaper', currentWallpaper);
    }
    
    // Set background image with error handling
    const img = new Image();
    img.onload = () => {
      document.body.style.backgroundImage = `url(${currentWallpaper})`;
    };
    img.onerror = () => {
      // If wallpaper fails to load, fallback to default
      console.warn(`Failed to load wallpaper: ${currentWallpaper}, falling back to default`);
      const defaultWallpaper = '/wallpapers/default.jpg';
      setCurrentWallpaper(defaultWallpaper);
      localStorage.setItem('selectedWallpaper', defaultWallpaper);
      document.body.style.backgroundImage = `url(${defaultWallpaper})`;
    };
    img.src = currentWallpaper;
  }, [currentWallpaper]);

  useEffect(() => {
    localStorage.setItem('userName', userName);
  }, [userName]);

  // Save location to storage
  useEffect(() => {
    localStorage.setItem('weatherLocation', location);
  }, [location]);

  // Apply color palette and glass theme
  useEffect(() => {
    applyColorPalette(currentColorPalette, glassConfig);
  }, [currentColorPalette, glassConfig]);

  // Save quick links (moved from QuickLinks component)
  useEffect(() => {
    try {
        if (chrome.storage && chrome.storage.sync) {
            chrome.storage.sync.set({ quickLinks: quickLinks });
        } else {
            localStorage.setItem('quickLinks', JSON.stringify(quickLinks));
        }
    } catch (error) {
        console.error('Error saving quick links:', error);
         localStorage.setItem('quickLinks', JSON.stringify(quickLinks));
    }
  }, [quickLinks]);

  // Save widget layouts to storage
  useEffect(() => {
    localStorage.setItem('widgetLayouts', JSON.stringify(widgetLayouts));
  }, [widgetLayouts]);

  // Save column count to storage
  useEffect(() => {
    localStorage.setItem('columnCount', JSON.stringify(columnCount));
  }, [columnCount]);

  // Persist openInNewTab
  useEffect(() => {
    localStorage.setItem('openQuickLinksInNewTab', JSON.stringify(openQuickLinksInNewTab));
  }, [openQuickLinksInNewTab]);

  // Persist wallpaper shuffle setting
  useEffect(() => {
    localStorage.setItem('wallpaperShuffle', JSON.stringify(wallpaperShuffle));
  }, [wallpaperShuffle]);

  // Persist custom wallpapers
  useEffect(() => {
    localStorage.setItem('customWallpapers', JSON.stringify(customWallpapers));
  }, [customWallpapers]);

  // Persist hidden default wallpapers
  useEffect(() => {
    localStorage.setItem('hiddenDefaultWallpapers', JSON.stringify(hiddenDefaultWallpapers));
  }, [hiddenDefaultWallpapers]);

  // Add a ref to hold the latest currentWallpaper without resetting the shuffle interval
  const currentWallpaperRef = useRef(currentWallpaper);
  useEffect(() => {
    currentWallpaperRef.current = currentWallpaper;
  }, [currentWallpaper]);

  // Improved auto-change wallpaper effect: immediate shuffle on enable, interval reset only on key dependencies
  useEffect(() => {
    if (!wallpaperShuffle) return;

    const getAllWallpapers = () => {
      const defaultWallpapers = [
        '/wallpapers/default.jpg',
        '/wallpapers/nature.jpg',
        '/wallpapers/anime.jpeg',
        '/wallpapers/tea.jpg',
        '/wallpapers/shiraz1.jpg',
        '/wallpapers/sunset.jpg',
        '/wallpapers/heaven.jpg',
        '/wallpapers/anime_cat.jpg',
        '/wallpapers/anime_girl.jpg',
        '/wallpapers/knight.jpg',
        '/wallpapers/arcane.png',
        '/wallpapers/RDR.png',
      ];
      const visibleDefaults = defaultWallpapers.filter(
        wp => !hiddenDefaultWallpapers.includes(wp)
      );
      return [...visibleDefaults, ...customWallpapers];
    };

    const shuffleWallpaper = () => {
      const all = getAllWallpapers();
      if (all.length <= 1) return;

      let newWallpaper;
      do {
        newWallpaper = all[Math.floor(Math.random() * all.length)];
      } while (newWallpaper === currentWallpaperRef.current && all.length > 1);

      setCurrentWallpaper(newWallpaper);
      if (!newWallpaper.startsWith('data:image/')) {
        localStorage.setItem('selectedWallpaper', newWallpaper);
      }
    };

    // Shuffle immediately when enabled
    shuffleWallpaper();
    const intervalId = setInterval(shuffleWallpaper, 3600000);
    return () => clearInterval(intervalId);
  }, [wallpaperShuffle, customWallpapers, hiddenDefaultWallpapers]);

  // Calculate optimal widget layout based on column count with responsive considerations
  const generateOptimalLayout = useCallback(() => {
    const newLayouts: Record<string, WidgetLayout> = {};
    const visibleWidgets = availableWidgets.filter(w => widgetVisibility[w.id]);
    const cols = columnCount.lg;
    
    // Calculate how many widgets can fit per row based on their width
    let x = 0;
    let y = 0;
    let maxHeightInRow = 0;
    
    visibleWidgets.forEach(widget => {
      const currentLayout = widgetLayouts[widget.id] || { w: 2, h: 2, x: 0, y: 0 };
      
      // Ensure widget dimensions are responsive-friendly
      let width = Math.min(currentLayout.w, cols);
      let height = currentLayout.h;
      
      // Adjust widget size based on type for better responsive behavior
      switch (widget.id) {
        case 'quicklinks':
          // Quick links can be wider on large screens but should scale down
          width = Math.min(width, Math.floor(cols * 0.5)); // Max 50% of available columns
          break;
        case 'weather':
        case 'calendar':
        case 'music':
          // These widgets work well at medium sizes
          width = Math.min(width, Math.floor(cols * 0.25)); // Max 25% of available columns
          break;
        default:
          // Other widgets can use their original size but capped
          width = Math.min(width, Math.floor(cols * 0.33)); // Max 33% of available columns
          break;
      }
      
      // If this widget won't fit in current row, move to next row
      if (x + width > cols) {
        x = 0;
        y += maxHeightInRow;
        maxHeightInRow = 0;
      }
      
      newLayouts[widget.id] = {
        i: widget.id,
        x: x,
        y: y,
        w: width,
        h: height
      };
      
      // Update position for next widget
      x += width;
      maxHeightInRow = Math.max(maxHeightInRow, height);
      
      // If we're at the end of a row, reset x and increment y
      if (x >= cols) {
        x = 0;
        y += maxHeightInRow;
        maxHeightInRow = 0;
      }
    });
    
    return newLayouts;
  }, [availableWidgets, widgetVisibility, widgetLayouts, columnCount.lg]);

  // Store original widget positions to restore when re-enabled
  const [originalWidgetLayouts] = useState<Record<string, WidgetLayout>>(() => {
    // Layout with quicklinks always at the top
    return {
      quicklinks:     { i: 'quicklinks',     x: 3,  y: 0,  w: 6, h: 6 }, // Quicklinks at the very top
      weather:        { i: 'weather',        x: 0,  y: 6,  w: 3, h: 12 }, // Weather starts after quicklinks
      github:         { i: 'github',         x: 9,  y: 6,  w: 3, h: 11 },

      music:          { i: 'music',          x: 0,  y: 18, w: 3, h: 14 },
      notesreminders: { i: 'notesreminders', x: 3,  y: 6,  w: 3, h: 20 },
      rss:            { i: 'rss',            x: 6,  y: 6,  w: 3, h: 20 },
      browserhistory: { i: 'browserhistory', x: 9,  y: 17, w: 3, h: 15 },
      dailyquotes:    { i: 'dailyquotes',    x: 0,  y: 32, w: 3, h: 12 }, // Daily Quotes widget
      
      // Widgets not in the screenshot, placed below the ones above, starting at y=26
      clock:          { i: 'clock',          x: 3,  y: 26, w: 3, h: 6 },
      calendar:       { i: 'calendar',       x: 6,  y: 26, w: 3, h: 12 },
      timer:          { i: 'timer',          x: 9,  y: 32, w: 3, h: 8 },
    };
  });

  // Function to move widgets vertically upward to fill gaps with MINIMAL compaction - preserving user positions
  const compactWidgetsVertically = useCallback((layouts: Record<string, WidgetLayout>, visibility: Record<string, boolean>) => {
    const visibleWidgets = availableWidgets.filter(w => visibility[w.id]);
    const newLayouts: Record<string, WidgetLayout> = { ...layouts };
    
    // Only do minimal compaction - preserve user positioning as much as possible
    // Just remove completely empty rows if they exist
    const sortedWidgets = visibleWidgets
      .map(widget => ({ widget, layout: layouts[widget.id] }))
      .filter(item => item.layout)
      .sort((a, b) => {
        if (a.layout.y !== b.layout.y) return a.layout.y - b.layout.y;
        return a.layout.x - b.layout.x;
      });
    
    // Find completely empty rows (rows with no widgets at all)
    const occupiedRows = new Set(sortedWidgets.map(({ layout }) => layout.y));
    const maxY = Math.max(...sortedWidgets.map(({ layout }) => layout.y + layout.h));
    
    // Only move widgets up to fill completely empty rows, maintain relative positioning otherwise
    const emptyRows: number[] = [];
    for (let y = 0; y < maxY; y++) {
      const hasAnyWidget = sortedWidgets.some(({ layout }) => 
        y >= layout.y && y < layout.y + layout.h
      );
      if (!hasAnyWidget) {
        emptyRows.push(y);
      }
    }
    
    // Only compact if there are completely empty rows
    if (emptyRows.length > 0) {
      sortedWidgets.forEach(({ widget, layout }) => {
        const emptyRowsAbove = emptyRows.filter(row => row < layout.y).length;
        if (emptyRowsAbove > 0) {
          newLayouts[widget.id] = {
            ...layout,
            y: Math.max(0, layout.y - emptyRowsAbove)
          };
        }
      });
    }
    
    return newLayouts;
  }, [availableWidgets]);

  // --- Handlers ---
  const handleOpenSettings = () => setSettingsOpen(true);
  const handleCloseSettings = () => setSettingsOpen(false);
  const handleShowAddLinkForm = () => setShowAddLinkForm(true);
  const handleCloseAddLinkForm = () => setShowAddLinkForm(false);

  const handleAddQuickLink = (newLink: Omit<QuickLink, 'id'>) => {
    setQuickLinks(prev => [...prev, { ...newLink, id: Date.now() }]);
    handleCloseAddLinkForm();
  };

  const handleVisibilityChange = useCallback((widgetId: string) => {
    setWidgetVisibility(prev => {
      const newVisibility = {
        ...prev,
        [widgetId]: !prev[widgetId],
      };
      
      // Log visibility change
      console.group(`👁️ Widget Visibility Change - ${widgetId.toUpperCase()}`);
      console.log(`📅 Timestamp: ${new Date().toLocaleString()}`);
      console.log(`📦 Widget: ${widgetId}`);
      console.log(`🔄 Status: ${prev[widgetId] ? 'VISIBLE' : 'HIDDEN'} → ${!prev[widgetId] ? 'VISIBLE' : 'HIDDEN'}`);
      if (!prev[widgetId] && widgetLayouts[widgetId]) {
        console.log(`📍 Position: (${widgetLayouts[widgetId].x}, ${widgetLayouts[widgetId].y})`);
        console.log(`📏 Size: ${widgetLayouts[widgetId].w} × ${widgetLayouts[widgetId].h}`);
      }
      console.groupEnd();
      
      if (prev[widgetId]) {
        // Widget is being disabled - do MINIMAL compaction to preserve user layout
        const newLayouts = compactWidgetsVertically(widgetLayouts, newVisibility);
        setWidgetLayouts(newLayouts);
        logWidgetLayouts(newLayouts, `Minimal Compact After Disabling ${widgetId.toUpperCase()}`);
      } else {
        // Widget is being enabled - restore to original position, NO automatic compaction
        const restoredLayouts = {
          ...widgetLayouts,
          [widgetId]: originalWidgetLayouts[widgetId] || widgetLayouts[widgetId]
        };
        setWidgetLayouts(restoredLayouts);
        logWidgetLayouts(restoredLayouts, `Restore Position for ${widgetId.toUpperCase()} (No Auto-Compact)`);
      }
      
      return newVisibility;
    });
  }, [widgetLayouts, compactWidgetsVertically, originalWidgetLayouts]);

  const handleWallpaperChange = useCallback((wallpaperPath: string) => {
    setCurrentWallpaper(wallpaperPath);
    // If it's a custom wallpaper (base64), don't save to selectedWallpaper
    if (!wallpaperPath.startsWith('data:image/')) {
      localStorage.setItem('selectedWallpaper', wallpaperPath);
    }
  }, []);

  const handleUserNameChange = useCallback((newName: string) => {
    setUserName(newName);
  }, []);

  // Add handler for location change
  const handleLocationChange = useCallback((newLocation: string) => {
    setLocation(newLocation);
    // Optionally, show a snackbar confirmation
    setSnackbarMessage(`Weather location set to ${newLocation}`);
    setSnackbarOpen(true);
  }, []);

  // Add handlers for color palette and glass theme
  const handleColorPaletteChange = useCallback((paletteId: string) => {
    const palette = getColorPalette(paletteId);
    if (palette) {
      setCurrentColorPalette(palette);
      localStorage.setItem('selectedColorPalette', paletteId);
      setSnackbarMessage(`Color palette changed to ${palette.name}`);
      setSnackbarOpen(true);
    }
  }, []);

  const handleGlassConfigChange = useCallback((newConfig: Partial<GlassThemeConfig>) => {
    const updatedConfig = { ...glassConfig, ...newConfig };
    setGlassConfig(updatedConfig);
    localStorage.setItem('glassConfig', JSON.stringify(updatedConfig));
    setSnackbarMessage('Glass theme settings updated');
    setSnackbarOpen(true);
  }, [glassConfig]);

  // Add handler for pre-built themes
  const handleApplyPrebuiltTheme = useCallback((theme: PrebuiltTheme) => {
    // Apply wallpaper
    setCurrentWallpaper(theme.wallpaper);
    if (!theme.wallpaper.startsWith('data:image/')) {
      localStorage.setItem('selectedWallpaper', theme.wallpaper);
    }
    
    // Apply color palette
    setCurrentColorPalette(theme.colorPalette);
    localStorage.setItem('selectedColorPalette', theme.colorPalette.id);
    
    // Apply glass configuration
    setGlassConfig(theme.glassConfig);
    localStorage.setItem('glassConfig', JSON.stringify(theme.glassConfig));
    
    // Store the applied theme
    applyPrebuiltTheme(theme.id);
    
    setSnackbarMessage(`Applied ${theme.name} theme`);
    setSnackbarOpen(true);
  }, []);

  const handleToggleEditMode = () => {
    if (editMode) {
      // Exiting edit mode, apply deletions and layout changes
      setWidgetVisibility(tempWidgetVisibility);
      setWidgetLayouts(tempWidgetLayouts);
      
      // Log the final saved layout
      logWidgetLayouts(tempWidgetLayouts, 'Edit Mode Saved');
      
      setSnackbarMessage('Changes saved!');
      setSnackbarOpen(true);
    } else {
      // Entering edit mode, initialize temporary visibility and layouts
      setTempWidgetVisibility(widgetVisibility);
      setTempWidgetLayouts(widgetLayouts);
      
      // Log the initial layout when entering edit mode
      logWidgetLayouts(widgetLayouts, 'Edit Mode Started');
      
      setSnackbarMessage('You can now move, resize, or delete widgets');
      setSnackbarOpen(true);
    }
    setEditMode(!editMode);
  };

  const handleLayoutChange = (layout: Layout[]) => {
    // Only update temporary layouts during edit mode
    if (editMode) {
      const newLayouts = { ...tempWidgetLayouts };
      layout.forEach(item => {
        newLayouts[item.i] = {
          i: item.i,
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h
        };
      });
      setTempWidgetLayouts(newLayouts);
      
      // Log the layout changes
      logWidgetLayouts(newLayouts, 'Widget Drag/Resize');
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Add handler to disable (delete) a widget in edit mode - minimize compaction
  const handleDisableWidget = useCallback((widgetId: string) => {
    setTempWidgetVisibility(prev => {
      const newVisibility = {
        ...prev,
        [widgetId]: false,
      };
      
      // Only do MINIMAL compaction to preserve user edits
      const newLayouts = compactWidgetsVertically(tempWidgetLayouts, newVisibility);
      setTempWidgetLayouts(newLayouts);
      
      // Log widget deletion and repositioning
      console.group(`🗑️ Widget Deletion - ${widgetId.toUpperCase()}`);
      console.log(`📅 Timestamp: ${new Date().toLocaleString()}`);
      console.log(`📦 Deleted Widget: ${widgetId}`);
      console.log(`📍 Previous Position: (${tempWidgetLayouts[widgetId]?.x || 0}, ${tempWidgetLayouts[widgetId]?.y || 0})`);
      console.log(`📏 Previous Size: ${tempWidgetLayouts[widgetId]?.w || 0} × ${tempWidgetLayouts[widgetId]?.h || 0}`);
      console.log(`💡 Note: Minimal compaction applied to preserve user layout`);
      console.groupEnd();
      
      // Log the repositioning
      logWidgetLayouts(newLayouts, `Minimal Compact After Deleting ${widgetId.toUpperCase()} (Edit Mode)`);
      
      return newVisibility;
    });
    
    setSnackbarMessage('Widget deleted with minimal layout changes');
    setSnackbarOpen(true);
  }, [tempWidgetLayouts, compactWidgetsVertically]);

  // Column count handlers
  const handleIncreaseColumns = () => {
    setColumnCount(prev => ({
      ...prev,
      lg: Math.min(prev.lg + 1, 16), // Max 16 columns
      md: Math.min(prev.md + 1, 12), // Max 12 columns for medium screens
    }));
    
    setSnackbarMessage('Increased column count');
    setSnackbarOpen(true);
  };

  const handleDecreaseColumns = () => {
    setColumnCount(prev => ({
      ...prev,
      lg: Math.max(prev.lg - 1, 1), // Min 1 column
      md: Math.max(prev.md - 1, 1), // Min 1 column for medium screens
    }));
    
    setSnackbarMessage('Decreased column count');
    setSnackbarOpen(true);
  };

  // Auto-arrange widgets - make this EXPLICIT and opt-in only
  const handleAutoArrange = () => {
    const optimalLayout = generateOptimalLayout();
    setWidgetLayouts(optimalLayout);
    
    // Log the auto-arranged layout
    logWidgetLayouts(optimalLayout, 'Manual Auto-Arrange Applied');
    
    setSnackbarMessage('Widgets auto-arranged - positions optimized');
    setSnackbarOpen(true);
  };

  // Effect to rearrange widgets when column count changes - REMOVE AUTO-ARRANGEMENT
  useEffect(() => {
    if (prevColumnCount.current !== columnCount.lg) {
      // Column count has changed - but DO NOT auto-arrange, just log the change
      console.group(`📊 Column Count Changed`);
      console.log(`📅 Timestamp: ${new Date().toLocaleString()}`);
      console.log(`🔢 Changed: ${prevColumnCount.current} → ${columnCount.lg} columns`);
      console.log(`💡 Note: Widget positions preserved. Use "Auto arrange" button if repositioning is needed.`);
      console.groupEnd();
      
      // Update the previous column count but don't auto-arrange
      prevColumnCount.current = columnCount.lg;
      
      setSnackbarMessage(`Column count changed to ${columnCount.lg}. Widget positions preserved.`);
      setSnackbarOpen(true);
    }
  }, [columnCount.lg]); // Removed generateOptimalLayout dependency

  const toggleColumnControls = () => {
    setShowColumnControls(!showColumnControls);
  };

  // Wallpaper handlers
  const handleWallpaperShuffleChange = useCallback((enabled: boolean) => {
    setWallpaperShuffle(enabled);
    if (enabled) {
      setSnackbarMessage('Auto wallpaper change enabled - changes every hour');
    } else {
      setSnackbarMessage('Auto wallpaper change disabled');
    }
    setSnackbarOpen(true);
  }, []);

  const handleDeleteCustomWallpaper = useCallback((wallpaperToDelete: string) => {
    setCustomWallpapers(prev => {
      const updated = prev.filter(w => w !== wallpaperToDelete);
      
      // If the deleted wallpaper was the current one, switch to default
      if (currentWallpaper === wallpaperToDelete) {
        setCurrentWallpaper('/wallpapers/default.jpg');
        localStorage.setItem('selectedWallpaper', '/wallpapers/default.jpg');
      }
      
      return updated;
    });
    
    setSnackbarMessage('Custom wallpaper deleted');
    setSnackbarOpen(true);
  }, [currentWallpaper]);

  const handleAddCustomWallpaper = useCallback((wallpaper: string) => {
    setCustomWallpapers(prev => {
      const updated = [...prev, wallpaper];
      return updated;
    });
    
    setSnackbarMessage('Custom wallpaper added');
    setSnackbarOpen(true);
  }, []);

  const handleDeleteDefaultWallpaper = useCallback((wallpaperToDelete: string) => {
    setHiddenDefaultWallpapers(prev => {
      const updated = [...prev, wallpaperToDelete];
      
      // If the deleted wallpaper was the current one, switch to a visible wallpaper
      if (currentWallpaper === wallpaperToDelete) {
        const defaultWallpapers = [
          '/wallpapers/default.jpg',
          '/wallpapers/nature.jpg',
          '/wallpapers/anime.jpeg',
          '/wallpapers/tea.jpg',
          '/wallpapers/shiraz1.jpg',
          '/wallpapers/sunset.jpg',
          '/wallpapers/heaven.jpg',
          '/wallpapers/anime_cat.jpg',
          '/wallpapers/anime_girl.jpg',
          '/wallpapers/knight.jpg',
          '/wallpapers/arcane.png',
          '/wallpapers/RDR.png',
        ];
        // Filter out hidden default wallpapers (including the one being deleted)
        const visibleDefaultWallpapers = defaultWallpapers.filter(
          (wallpaper: string) => !updated.includes(wallpaper)
        );
        const allWallpapers = [...visibleDefaultWallpapers, ...customWallpapers];
        
        if (allWallpapers.length > 0) {
          setCurrentWallpaper(allWallpapers[0]);
          if (!allWallpapers[0].startsWith('data:image/')) {
            localStorage.setItem('selectedWallpaper', allWallpapers[0]);
          }
        } else {
          // If no wallpapers left, reset to default
          setCurrentWallpaper('/wallpapers/default.jpg');
          localStorage.setItem('selectedWallpaper', '/wallpapers/default.jpg');
        }
      }
      
      return updated;
    });
    
    setSnackbarMessage('Default wallpaper hidden');
    setSnackbarOpen(true);
  }, [currentWallpaper, customWallpapers]);

  // --- Render Logic ---
  const renderWidget = (widgetId: string) => {
    const widget = availableWidgets.find(w => w.id === widgetId);
    if (!widget || !widgetVisibility[widgetId]) return null;

    const WidgetComponent = widget.component;

    // Pass necessary props to each widget
    let widgetProps: any = {};
    if (widgetId === 'quicklinks') {
      widgetProps = { links: quickLinks, setLinks: setQuickLinks, onShowAddForm: handleShowAddLinkForm, openInNewTab: openQuickLinksInNewTab };
    }

    // Pass location to Weather widget
    if (widgetId === 'weather') {
      widgetProps = { location };
    }
    // Add props for other widgets if needed

    return (
      <Box 
        key={widgetId} 
        sx={{ 
          width: { 
            xs: '100%', 
            sm: '50%', 
            md: widgetId === 'quicklinks' ? '100%' : '33.33%',
            lg: widgetId === 'quicklinks' ? '66.66%' : '25%' 
          },
          padding: 1 
        }}
      >
         {/* Apply glass styling implicitly via component's root or explicitly here if needed */}
        <WidgetComponent {...widgetProps} />
      </Box>
    );
  };

  // Prepare WidgetGrid items
  const gridItems = availableWidgets
    .filter(widget => (editMode ? tempWidgetVisibility[widget.id] : widgetVisibility[widget.id]))
    .map(widget => {
      // Pass necessary props to each widget component based on its type
      let widgetProps: any = {};
      if (widget.id === 'weather') {
        widgetProps = { location };
      } else if (widget.id === 'calendar') {
        // Calendar doesn't need any special props for now
        widgetProps = {};
      } else if (widget.id === 'quicklinks') {
        widgetProps = { links: quickLinks, setLinks: setQuickLinks, onShowAddForm: handleShowAddLinkForm, openInNewTab: openQuickLinksInNewTab };
      } else if (widget.id === 'music') {
        // Add Music widget props if needed in the future
        // widgetProps = { /* Add music props here */ };
      } else if (widget.id === 'rss') {
        // RSS doesn't need any special props for now
        widgetProps = {};
      } else if (widget.id === 'browserhistory') {
        // Browser History doesn't need any special props for now
        widgetProps = {};
      }
      // Add props for other widgets if needed
      
      return {
        id: widget.id,
        component: (
          <WidgetWrapper 
            widget={widget}
            widgetProps={widgetProps}
            editMode={editMode}
            layout={editMode ? tempWidgetLayouts[widget.id] : widgetLayouts[widget.id]}
            onDelete={handleDisableWidget}
          />
        ),
        layout: (editMode ? tempWidgetLayouts[widget.id] : widgetLayouts[widget.id]) || { w: 2, h: 2, x: 0, y: 0 }
      };
    });

  return (
    <Box sx={{
      minHeight: '100vh',
      maxHeight: '100vh', // Prevent vertical overflow
      p: { xs: 1, sm: 1.5, md: 2 }, // Responsive padding
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center', // Center items horizontally
      position: 'relative', // Add relative positioning to parent
      overflow: 'hidden', // Prevent scrolling on main container
    }}>
      {/* Country Flag - Top Left */}
      <CountryFlag />
      
      {/* Top Right Buttons Container */}
      <Box sx={{ 
        position: 'absolute', 
        top: { xs: 8, sm: 12, md: 16 }, 
        right: { xs: 8, sm: 12, md: 16 }, 
        display: 'flex', 
        gap: { xs: 0.5, sm: 0.75, md: 1 } 
      }}>
        {/* Edit/Save Button - Moved to Top Right */}
        <IconButton
          aria-label="edit"
          onClick={handleToggleEditMode}
          sx={{
            // Shared styles with Settings button
            color: 'var(--text-light)',
            backgroundColor: editMode ? 'rgba(76, 175, 80, 0.5)' : 'rgba(15, 15, 20, 0.5)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            width: { xs: 40, sm: 44, md: 48 },
            height: { xs: 40, sm: 44, md: 48 },
            transition: 'all 0.3s ease',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            '&:hover': {
              backgroundColor: editMode ? 'rgba(76, 175, 80, 0.7)' : 'rgba(15, 15, 20, 0.7)',
              transform: 'scale(1.05)',
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }
          }}
        >
          {editMode ? <SaveIcon fontSize={window.innerWidth < 768 ? 'small' : 'medium'} /> : <EditIcon fontSize={window.innerWidth < 768 ? 'small' : 'medium'} />}
        </IconButton>

        {/* Cancel Edit Button - Only shows in edit mode, now top right */}
        {editMode && (
          <IconButton
            aria-label="cancel-edit"
            onClick={() => {
              setEditMode(false);
              setShowColumnControls(false);
              setSnackbarMessage('Edit mode cancelled');
              setSnackbarOpen(true);
            }}
            sx={{
              // Match size/style of other top-right buttons
              color: 'var(--text-light)',
              backgroundColor: 'rgba(211, 47, 47, 0.5)', // Red background
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              width: { xs: 40, sm: 44, md: 48 },
              height: { xs: 40, sm: 44, md: 48 },
              transition: 'all 0.3s ease',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(211, 47, 47, 0.7)', // Darker red on hover
                transform: 'scale(1.05)',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }
            }}
          >
            <CloseIcon fontSize={window.innerWidth < 768 ? 'small' : 'medium'} />
          </IconButton>
        )}

        {/* Settings Button - Remains Top Right */}
        <IconButton
          aria-label="settings"
          onClick={handleOpenSettings}
          sx={{
            // No position needed, handled by parent Box
            color: 'var(--text-light)',
            backgroundColor: 'rgba(15, 15, 20, 0.5)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            width: { xs: 40, sm: 44, md: 48 },
            height: { xs: 40, sm: 44, md: 48 },
            transition: 'all 0.3s ease',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(15, 15, 20, 0.7)',
              transform: 'scale(1.05)',
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }
          }}
        >
          <SettingsIcon fontSize={window.innerWidth < 768 ? 'small' : 'medium'} />
        </IconButton>
      </Box>

      {/* Main Content Area */}
      <Greeting userName={userName} />
      <SearchBar />
      
      {/* Edit mode indicator */}
      {editMode && (
        <>
          <Box
            sx={{
              position: 'fixed',
              top: { xs: 8, sm: 12, md: 16 },
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(76, 175, 80, 0.7)',
              color: 'white',
              padding: { xs: '4px 12px', sm: '5px 14px', md: '6px 16px' },
              borderRadius: '20px',
              fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.9rem' },
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 0.5, sm: 0.75, md: 1 },
              // Hide detailed instructions on very small screens
              '& .detailed-instructions': {
                display: { xs: 'none', sm: 'flex' }
              }
            }}
          >
            <DragIndicatorIcon fontSize="small" />
            <span className="detailed-instructions">Drag header to move</span>
            <Box sx={{ display: { xs: 'block', sm: 'none' } }}>Edit Mode</Box>
            <Box className="detailed-instructions" sx={{ mx: 1, color: 'rgba(255,255,255,0.5)' }}>•</Box>
            <OpenWithIcon className="detailed-instructions" fontSize="small" />
            <span className="detailed-instructions">Resize from edges/corners</span>
          </Box>
          
          {/* Column controls toggle button */}
          <Tooltip title="Change column layout">
            <IconButton
              aria-label="column-settings"
              onClick={toggleColumnControls}
              sx={{
                position: 'fixed',
                top: { xs: 8, sm: 12, md: 16 },
                left: { xs: 8, sm: 12, md: 16 },
                color: 'white',
                backgroundColor: 'rgba(15, 15, 20, 0.7)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                width: { xs: 32, sm: 34, md: 36 },
                height: { xs: 32, sm: 34, md: 36 },
                transition: 'all 0.3s ease',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(15, 15, 20, 0.9)',
                  transform: 'scale(1.05)',
                },
                zIndex: 1000,
              }}
            >
              <ViewColumnIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          {/* Column count controls - Appears when column toggle is clicked */}
          {showColumnControls && (
            <Box
              sx={{
                position: 'fixed',
                top: { xs: 8, sm: 12, md: 16 },
                left: { xs: 48, sm: 52, md: 60 },
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'rgba(15, 15, 20, 0.8)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                padding: { xs: '8px', sm: '10px', md: '12px' },
                borderRadius: '8px',
                zIndex: 1000,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                minWidth: { xs: '120px', sm: '140px', md: '160px' }
              }}
            >
              <Typography variant="caption" sx={{ 
                color: 'white', 
                mb: 1, 
                textAlign: 'center',
                fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' }
              }}>
                Columns: {columnCount.lg}
              </Typography>
              <ButtonGroup size="small" sx={{ mb: 1 }}>
                <Button
                  onClick={handleDecreaseColumns}
                  disabled={columnCount.lg <= 1}
                  sx={{ 
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.3)', 
                    minWidth: { xs: '28px', sm: '32px', md: '36px' },
                    fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                    '&:hover': { 
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      borderColor: 'rgba(255,255,255,0.5)',
                    }
                  }}
                >
                  <RemoveColumnIcon fontSize="small" />
                </Button>
                <Button
                  onClick={handleIncreaseColumns}
                  disabled={columnCount.lg >= 16}
                  sx={{ 
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.3)', 
                    minWidth: { xs: '28px', sm: '32px', md: '36px' },
                    fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                    '&:hover': { 
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      borderColor: 'rgba(255,255,255,0.5)',
                    }
                  }}
                >
                  <AddColumnIcon fontSize="small" />
                </Button>
              </ButtonGroup>
              
              {/* Auto-arrange button */}
              <Button
                size="small"
                startIcon={<AutorenewIcon fontSize="small" />}
                onClick={handleAutoArrange}
                sx={{ 
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.3)', 
                  fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' },
                  padding: { xs: '4px 8px', sm: '6px 12px', md: '8px 16px' },
                  '&:hover': { 
                    backgroundColor: 'rgba(76,175,80,0.2)',
                  }
                }}
              >
                Auto arrange
              </Button>
            </Box>
          )}
        </>
      )}

      {/* Widget Grid - Using WidgetGrid component */}
      <Box sx={{ 
        width: '100%', 
        flex: 1, 
        overflow: 'auto', // Allow scrolling only within the grid area
        maxHeight: { 
          xs: 'calc(100vh - 120px)', // More space reserved on mobile
          sm: 'calc(100vh - 160px)', 
          md: 'calc(100vh - 200px)' 
        },
        // Add some responsive spacing
        mt: { xs: 1, sm: 1.5, md: 2 }
      }}>
        <WidgetGrid 
          items={gridItems}
          onLayoutChange={handleLayoutChange}
          isDraggable={editMode}
          isResizable={editMode}
          columnCount={columnCount}
        />
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Modals */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={handleCloseSettings}
        widgetVisibility={widgetVisibility}
        onVisibilityChange={handleVisibilityChange}
        availableWidgets={availableWidgets.map(w => ({ id: w.id, name: w.name }))}
        currentWallpaper={currentWallpaper}
        onWallpaperChange={handleWallpaperChange}
        currentLocation={location}
        onLocationChange={handleLocationChange}
        userName={userName}
        onUserNameChange={handleUserNameChange}
        openQuickLinksInNewTab={openQuickLinksInNewTab}
        setOpenQuickLinksInNewTab={setOpenQuickLinksInNewTab}
        wallpaperShuffle={wallpaperShuffle}
        onWallpaperShuffleChange={handleWallpaperShuffleChange}
        customWallpapers={customWallpapers}
        onDeleteCustomWallpaper={handleDeleteCustomWallpaper}
        onAddCustomWallpaper={handleAddCustomWallpaper}
        hiddenDefaultWallpapers={hiddenDefaultWallpapers}
        onDeleteDefaultWallpaper={handleDeleteDefaultWallpaper}
        currentColorPalette={currentColorPalette}
        onColorPaletteChange={handleColorPaletteChange}
        glassConfig={glassConfig}
        onGlassConfigChange={handleGlassConfigChange}
        onApplyPrebuiltTheme={handleApplyPrebuiltTheme}
      />

      <AddQuickLinkForm
        isOpen={showAddLinkForm}
        onClose={handleCloseAddLinkForm}
        onAddLink={handleAddQuickLink}
      />
    </Box>
  );
};

export default App; 