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
import type { WidgetConfig, QuickLink, Todo, WidgetLayout } from './types';
import type { Layout } from 'react-grid-layout';

// Import Widgets
import Clock from './widgets/Clock';
import Weather from './widgets/Weather'; // Assuming Weather exists
import TodoList from './widgets/TodoList'; // Assuming TodoList exists
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

// import './App.css'; // Removed as file doesn't exist

// Define WidgetWrapper outside the App component for stability
interface WidgetWrapperProps {
  widget: { id: string; name: string; component: React.ComponentType<any> };
  widgetProps: any;
  editMode: boolean;
  layout: WidgetLayout | undefined;
}

const WidgetWrapper = React.memo<WidgetWrapperProps>(({ widget, widgetProps, editMode, layout }) => {
  return (
    <Box sx={{ 
      height: '100%', 
      position: 'relative',
      border: editMode ? '2px dashed rgba(255, 255, 255, 0.3)' : 'none',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      {editMode && (
        <>
          {/* Top drag handle */}
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(15, 15, 20, 0.7)',
            color: 'white',
            padding: '4px 8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.8rem',
            zIndex: 10,
            backdropFilter: 'blur(4px)',
            cursor: 'move'
          }}>
            <DragIndicatorIcon fontSize="small" />
            <Typography variant="caption">{widget.name}</Typography>
          </Box>
          
          {/* Bottom-right resize handle */}
          <Box sx={{
            position: 'absolute',
            bottom: 4,
            right: 4,
            backgroundColor: 'rgba(76, 175, 80, 0.7)',
            color: 'white',
            borderRadius: '50%',
            width: 24,
            height: 24,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
            cursor: 'nwse-resize',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            opacity: 0.8,
            '&:hover': {
              opacity: 1,
              transform: 'scale(1.1)'
            },
            transition: 'all 0.2s ease'
          }}>
            <OpenWithIcon style={{ fontSize: 14 }} />
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
            zIndex: 10,
            backdropFilter: 'blur(4px)',
            opacity: 0.7
          }}>
            {`${layout?.w || 2} × ${layout?.h || 2}`}
          </Box>
        </>
      )}
      <Box sx={{ 
        height: editMode ? 'calc(100% - 32px)' : '100%', 
        overflow: 'auto',
        pt: editMode ? 4 : 0
      }}>
        {/* Use JSX syntax directly */}
        <widget.component {...widgetProps} />
      </Box>
    </Box>
  );
});

// Create a country flag component based on IP
const CountryFlag = () => {
  const [countryCode, setCountryCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
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
      } finally {
        setLoading(false);
      }
    };

    fetchCountry();
  }, []);

  if (loading) {
    return (
      <Box sx={{
        position: 'absolute',
        top: 16,
        left: 16,
        width: 40,
        height: 40,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(15, 15, 20, 0.5)',
        backdropFilter: 'blur(10px)',
        borderRadius: '50%',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <Box sx={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }}/>
      </Box>
    );
  }

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
  
  // Default wallpaper set here
  const [currentWallpaper, setCurrentWallpaper] = useState<string>(() => {
    return localStorage.getItem('selectedWallpaper') || '/wallpapers/forest.jpg';
  });
  const [userName, setUserName] = useState<string>(() => {
      return localStorage.getItem('userName') || 'Mohammad';
  });
  // Add location state
  const [location, setLocation] = useState<string>(() => {
    return localStorage.getItem('weatherLocation') || 'Shiraz'; // Changed default to match screenshot
  });

  // Widget Definitions
  const availableWidgets = [
    { id: 'clock', name: 'Clock', component: Clock },
    { id: 'weather', name: 'Weather', component: Weather },
    { id: 'todo', name: 'Todo List', component: TodoList },
    { id: 'quicklinks', name: 'Quick Links', component: QuickLinks },
    { id: 'calendar', name: 'Calendar', component: Calendar }, // Add Calendar widget
    { id: 'music', name: 'Music Player', component: Music }, // Add Music widget
    { id: 'rss', name: 'RSS', component: RSS }, // Add RSS widget
    { id: 'github', name: 'GitHub Contributions', component: Github }, // Add GitHub widget
    { id: 'timer', name: 'Working Timer', component: Timer }, // Add Timer widget
  ];

  // Widget Visibility State
  const [widgetVisibility, setWidgetVisibility] = useState<Record<string, boolean>>(() => {
    const storedVisibility = localStorage.getItem('widgetVisibility');
    if (storedVisibility) {
      return JSON.parse(storedVisibility);
    }
    // Default visibility to exactly match the screenshot
    return {
      clock: false, // Clock is turned off in the settings modal
      weather: true,
      todo: true,
      quicklinks: true,
      calendar: true,
      music: true,
      rss: true,
      github: true,
      timer: true,
    };
  });

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
        title: 'Stremio', 
        url: 'https://www.stremio.com/', 
        icon: 'https://www.google.com/s2/favicons?domain=stremio.com&sz=64' 
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

  // Todo List State (Assuming TodoList uses this structure)
  const [todos, setTodos] = useState<Todo[]>([]); 

  // Widget Layout State
  const [widgetLayouts, setWidgetLayouts] = useState<Record<string, WidgetLayout>>(() => {
    const storedLayouts = localStorage.getItem('widgetLayouts');
    if (storedLayouts) {
      return JSON.parse(storedLayouts);
    }
    // Updated layout based on user request
    return {
      weather:    { i: 'weather',    x: 0,  y: 0,  w: 3, h: 8 },
      quicklinks: { i: 'quicklinks', x: 3,  y: 0,  w: 6, h: 4 },
      calendar:   { i: 'calendar',   x: 9,  y: 0,  w: 3, h: 8 },
      music:      { i: 'music',      x: 0,  y: 8,  w: 3, h: 10 },
      todo:       { i: 'todo',       x: 3,  y: 5,  w: 3, h: 8 },
      timer:      { i: 'timer',      x: 6,  y: 5,  w: 3, h: 8 },
      rss:        { i: 'rss',        x: 9,  y: 5,  w: 3, h: 10 },
      github:     { i: 'github',     x: 3,  y: 13, w: 6, h: 6 },
    };
  });

  // Track previous column count for comparison
  const prevColumnCount = useRef(columnCount.lg);

  // Fetch initial data from storage
  useEffect(() => {
    // Get username
    const storedName = localStorage.getItem('userName');
    if (storedName) setUserName(storedName);

    // Get quick links
    try {
        if (chrome.storage && chrome.storage.sync) {
            chrome.storage.sync.get(['quickLinks', 'todos', 'selectedWallpaper', 'widgetVisibility'], (result) => {
                if (result.quickLinks) setQuickLinks(result.quickLinks);
                if (result.todos) setTodos(result.todos); 
                if (result.selectedWallpaper) setCurrentWallpaper(result.selectedWallpaper);
                if (result.widgetVisibility) setWidgetVisibility(result.widgetVisibility);
            });
        } else {
            // Fallback to localStorage if chrome.storage is not available
            const localLinks = localStorage.getItem('quickLinks');
            if (localLinks) setQuickLinks(JSON.parse(localLinks));
            const localTodos = localStorage.getItem('todos');
            if (localTodos) setTodos(JSON.parse(localTodos));
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
        const localTodos = localStorage.getItem('todos');
        if (localTodos) setTodos(JSON.parse(localTodos));
         const localWallpaper = localStorage.getItem('selectedWallpaper');
        if (localWallpaper) setCurrentWallpaper(localWallpaper);
         const localVisibility = localStorage.getItem('widgetVisibility');
        if (localVisibility) setWidgetVisibility(JSON.parse(localVisibility));
    }

  }, []);

  // Save state changes to storage
  useEffect(() => {
    localStorage.setItem('widgetVisibility', JSON.stringify(widgetVisibility));
  }, [widgetVisibility]);

  useEffect(() => {
    localStorage.setItem('selectedWallpaper', currentWallpaper);
    document.body.style.backgroundImage = `url(${currentWallpaper})`;
  }, [currentWallpaper]);

  useEffect(() => {
    localStorage.setItem('userName', userName);
  }, [userName]);

  // Save location to storage
  useEffect(() => {
    localStorage.setItem('weatherLocation', location);
  }, [location]);

  // Save todos (example, adapt to your TodoList implementation)
  useEffect(() => {
    try {
        if (chrome.storage && chrome.storage.sync) {
             chrome.storage.sync.set({ todos: todos });
        } else {
            localStorage.setItem('todos', JSON.stringify(todos));
        }
    } catch (error) {
        console.error('Error saving todos:', error);
         localStorage.setItem('todos', JSON.stringify(todos));
    }
   
  }, [todos]);

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

  // Calculate optimal widget layout based on column count
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
      const width = Math.min(currentLayout.w, cols); // Ensure width doesn't exceed column count
      
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
        h: currentLayout.h
      };
      
      // Update position for next widget
      x += width;
      maxHeightInRow = Math.max(maxHeightInRow, currentLayout.h);
      
      // If we're at the end of a row, reset x and increment y
      if (x >= cols) {
        x = 0;
        y += maxHeightInRow;
        maxHeightInRow = 0;
      }
    });
    
    return newLayouts;
  }, [availableWidgets, widgetVisibility, widgetLayouts, columnCount.lg]);

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
    setWidgetVisibility(prev => ({
      ...prev,
      [widgetId]: !prev[widgetId],
    }));
  }, []);

  const handleWallpaperChange = useCallback((wallpaperPath: string) => {
    setCurrentWallpaper(wallpaperPath);
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

  const handleToggleEditMode = () => {
    if (editMode) {
      // Exiting edit mode, save any changes
      setSnackbarMessage('Widget layout saved!');
      setSnackbarOpen(true);
    } else {
      // Entering edit mode
      setSnackbarMessage('You can now move and resize widgets');
      setSnackbarOpen(true);
    }
    setEditMode(!editMode);
  };

  const handleLayoutChange = (layout: Layout[]) => {
    // Only save layouts if in edit mode
    if (editMode) {
      const newLayouts = { ...widgetLayouts };
      
      // Update each widget's layout based on the new layout
      layout.forEach(item => {
        newLayouts[item.i] = {
          i: item.i,
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h
        };
      });
      
      setWidgetLayouts(newLayouts);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

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

  // Auto-arrange widgets
  const handleAutoArrange = () => {
    const optimalLayout = generateOptimalLayout();
    setWidgetLayouts(optimalLayout);
    setSnackbarMessage('Widgets auto-arranged');
    setSnackbarOpen(true);
  };

  // Effect to rearrange widgets when column count changes
  useEffect(() => {
    if (prevColumnCount.current !== columnCount.lg) {
      // Column count has changed, rearrange widgets
      const optimalLayout = generateOptimalLayout();
      setWidgetLayouts(optimalLayout);
      
      // Update the previous column count
      prevColumnCount.current = columnCount.lg;
    }
  }, [columnCount.lg, generateOptimalLayout]);

  const toggleColumnControls = () => {
    setShowColumnControls(!showColumnControls);
  };

  // --- Render Logic ---
  const renderWidget = (widgetId: string) => {
    const widget = availableWidgets.find(w => w.id === widgetId);
    if (!widget || !widgetVisibility[widgetId]) return null;

    const WidgetComponent = widget.component;

    // Pass necessary props to each widget
    let widgetProps: any = {};
    if (widgetId === 'quicklinks') {
      widgetProps = { links: quickLinks, setLinks: setQuickLinks, onShowAddForm: handleShowAddLinkForm };
    }
    if (widgetId === 'todo') {
        // Assuming TodoList accepts todos and setTodos
        widgetProps = { todos: todos, setTodos: setTodos }; 
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
    .filter(widget => widgetVisibility[widget.id])
    .map(widget => {
      // Pass necessary props to each widget component based on its type
      let widgetProps: any = {};
      if (widget.id === 'todo') {
        widgetProps = { todos, setTodos };
      } else if (widget.id === 'weather') {
        widgetProps = { location };
      } else if (widget.id === 'calendar') {
        // Calendar doesn't need any special props for now
        widgetProps = {};
      } else if (widget.id === 'quicklinks') {
        widgetProps = { links: quickLinks, setLinks: setQuickLinks, onShowAddForm: handleShowAddLinkForm };
      } else if (widget.id === 'music') {
        // Add Music widget props if needed in the future
        // widgetProps = { /* Add music props here */ };
      } else if (widget.id === 'rss') {
        // RSS doesn't need any special props for now
        widgetProps = {};
      }
      // Add props for other widgets if needed
      
      // Create a wrapper component that adds edit mode indicators
      // REMOVED INLINE DEFINITION
      /*
      const WrappedComponent = () => (
        <Box sx={{ 
          height: '100%', 
          position: 'relative',
          border: editMode ? '2px dashed rgba(255, 255, 255, 0.3)' : 'none',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          {editMode && (
            <>
              
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                backgroundColor: 'rgba(15, 15, 20, 0.7)',
                color: 'white',
                padding: '4px 8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.8rem',
                zIndex: 10,
                backdropFilter: 'blur(4px)',
                cursor: 'move'
              }}>
                <DragIndicatorIcon fontSize="small" />
                <Typography variant="caption">{widget.name}</Typography>
              </Box>
              
              
              <Box sx={{
                position: 'absolute',
                bottom: 4,
                right: 4,
                backgroundColor: 'rgba(76, 175, 80, 0.7)',
                color: 'white',
                borderRadius: '50%',
                width: 24,
                height: 24,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 10,
                cursor: 'nwse-resize',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                opacity: 0.8,
                '&:hover': {
                  opacity: 1,
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.2s ease'
              }}>
                <OpenWithIcon style={{ fontSize: 14 }} />
              </Box>
              
              
              <Box sx={{
                position: 'absolute',
                bottom: 4,
                left: 4,
                backgroundColor: 'rgba(15, 15, 20, 0.7)',
                color: 'white',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '0.7rem',
                zIndex: 10,
                backdropFilter: 'blur(4px)',
                opacity: 0.7
              }}>
                {`${widgetLayouts[widget.id]?.w || 2} × ${widgetLayouts[widget.id]?.h || 2}`}
              </Box>
            </>
          )}
          <Box sx={{ 
            height: editMode ? 'calc(100% - 32px)' : '100%', 
            overflow: 'auto',
            pt: editMode ? 4 : 0
          }}>
            
            {React.createElement(widget.component as any, widgetProps)}
          </Box>
        </Box>
      );
      */
      
      return {
        id: widget.id,
        component: (
          <WidgetWrapper 
            widget={widget}
            widgetProps={widgetProps}
            editMode={editMode}
            layout={widgetLayouts[widget.id]}
          />
        ),
        layout: widgetLayouts[widget.id] || { w: 2, h: 2, x: 0, y: 0 }
      };
    });

  return (
    <Box sx={{
      minHeight: '100vh',
      p: 4, // Padding around the content
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center', // Center items horizontally
      position: 'relative', // Add relative positioning to parent
    }}>
      {/* Country Flag - Top Left */}
      <CountryFlag />
      
      {/* Top Right Buttons Container */}
      <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 1 }}>
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
            width: 48,
            height: 48,
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
          {editMode ? <SaveIcon /> : <EditIcon />}
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
              width: 48,
              height: 48,
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
            <CloseIcon />
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
            width: 48,
            height: 48,
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
          <SettingsIcon />
        </IconButton>
      </Box>

      {/* Main Content Area */}
      <Greeting userName={userName} />
      <SearchBar />
      
      {/* Edit mode indicator */}
      {editMode && (
        <>
          <Typography
            sx={{
              position: 'fixed',
              top: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(76, 175, 80, 0.7)',
              color: 'white',
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '0.9rem',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <DragIndicatorIcon fontSize="small" />
            <span>Drag to move</span>
            <Box sx={{ mx: 1, color: 'rgba(255,255,255,0.5)' }}>•</Box>
            <OpenWithIcon fontSize="small" />
            <span>Resize from corner</span>
          </Typography>
          
          {/* Column controls toggle button */}
          <Tooltip title="Change column layout">
            <IconButton
              aria-label="column-settings"
              onClick={toggleColumnControls}
              sx={{
                position: 'fixed',
                top: 16,
                left: 16,
                color: 'white',
                backgroundColor: 'rgba(15, 15, 20, 0.7)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                width: 36,
                height: 36,
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
                top: 16,
                left: 60,
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'rgba(15, 15, 20, 0.8)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                padding: '12px',
                borderRadius: '8px',
                zIndex: 1000,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Typography variant="caption" sx={{ color: 'white', mb: 1, textAlign: 'center' }}>
                Column count: {columnCount.lg}
              </Typography>
              <ButtonGroup size="small" sx={{ mb: 1 }}>
                <Button
                  onClick={handleDecreaseColumns}
                  disabled={columnCount.lg <= 1}
                  sx={{ 
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.3)', 
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
                startIcon={<AutorenewIcon />}
                onClick={handleAutoArrange}
                sx={{ 
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.3)', 
                  fontSize: '0.75rem',
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
      <Box sx={{ width: '100%' }}>
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
        // Pass location props
        currentLocation={location}
        onLocationChange={handleLocationChange}
        // Pass username props
        userName={userName}
        onUserNameChange={handleUserNameChange}
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