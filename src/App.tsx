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
import type { WidgetConfig, QuickLink, Todo, WidgetLayout } from './types';
import type { Layout } from 'react-grid-layout';

// Import Widgets
import Clock from './widgets/Clock';
import Weather from './widgets/Weather'; // Assuming Weather exists
import TodoList from './widgets/TodoList'; // Assuming TodoList exists
import QuickLinks from './widgets/QuickLinks';
import AddQuickLinkForm from './components/AddQuickLinkForm'; 
import SettingsModal from './components/SettingsModal';
import Greeting from './components/Greeting'; // Import Greeting
import SearchBar from './components/SearchBar'; // Import SearchBar
import WidgetGrid from './components/WidgetGrid'; // Import WidgetGrid component

// import './App.css'; // Removed as file doesn't exist

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
    // Default column configuration
    return {
      lg: 6, 
      md: 4, 
      sm: 3, 
      xs: 2, 
      xxs: 1
    };
  });
  
  // Default wallpaper set here
  const [currentWallpaper, setCurrentWallpaper] = useState<string>(() => {
    return localStorage.getItem('selectedWallpaper') || '/wallpapers/forest.jpg';
  });
  const [userName, setUserName] = useState<string>(() => {
      return localStorage.getItem('userName') || 'Alex';
  });
  // Add location state
  const [location, setLocation] = useState<string>(() => {
    return localStorage.getItem('weatherLocation') || 'Tehran'; // Default to Tehran
  });

  // Widget Definitions
  const availableWidgets = [
    { id: 'clock', name: 'Clock', component: Clock },
    { id: 'weather', name: 'Weather', component: Weather },
    { id: 'todo', name: 'Todo List', component: TodoList },
    { id: 'quicklinks', name: 'Quick Links', component: QuickLinks },
  ];

  // Widget Visibility State
  const [widgetVisibility, setWidgetVisibility] = useState<Record<string, boolean>>(() => {
    const storedVisibility = localStorage.getItem('widgetVisibility');
    if (storedVisibility) {
      return JSON.parse(storedVisibility);
    }
    // Default visibility
    return {
      clock: true, 
      weather: true,
      todo: true,
      quicklinks: true, 
    };
  });

  // Quick Links State
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>([]);

  // Todo List State (Assuming TodoList uses this structure)
  const [todos, setTodos] = useState<Todo[]>([]); 

  // Widget Layout State
  const [widgetLayouts, setWidgetLayouts] = useState<Record<string, WidgetLayout>>(() => {
    const storedLayouts = localStorage.getItem('widgetLayouts');
    if (storedLayouts) {
      return JSON.parse(storedLayouts);
    }
    // Default layouts
    return {
      clock: { i: 'clock', x: 0, y: 0, w: 2, h: 2 },
      weather: { i: 'weather', x: 2, y: 0, w: 2, h: 2 },
      todo: { i: 'todo', x: 0, y: 2, w: 2, h: 3 },
      quicklinks: { i: 'quicklinks', x: 2, y: 2, w: 2, h: 2 },
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
      lg: Math.min(prev.lg + 1, 12), // Max 12 columns
      md: Math.min(prev.md + 1, 10), // Max 10 columns for medium screens
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
    .filter(widget => widgetVisibility[widget.id] && widget.id !== 'quicklinks')
    .map(widget => {
      // Pass necessary props to each widget component
      let widgetProps: any = {};
      if (widget.id === 'todo') {
        widgetProps = { todos, setTodos };
      }
      // Pass location to Weather widget
      if (widget.id === 'weather') {
        widgetProps = { location };
      }
      // Add props for other widgets if needed
      
      // Create a wrapper component that adds edit mode indicators
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
                {`${widgetLayouts[widget.id]?.w || 2} × ${widgetLayouts[widget.id]?.h || 2}`}
              </Box>
            </>
          )}
          <Box sx={{ 
            height: editMode ? 'calc(100% - 32px)' : '100%', 
            overflow: 'auto',
            pt: editMode ? 4 : 0
          }}>
            {React.createElement(widget.component, widgetProps)}
          </Box>
        </Box>
      );
      
      return {
        id: widget.id,
        component: <WrappedComponent />,
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
      {/* Settings Button - Top Right */}
      <IconButton
        aria-label="settings"
        onClick={handleOpenSettings}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
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

      {/* Main Content Area */}
      <Greeting userName={userName} />
      <SearchBar />
      
      {/* Render QuickLinks separately above the grid if visible */}
      {widgetVisibility.quicklinks && (
          <Box sx={{ 
            width: '100%', 
            maxWidth: '900px',
            mb: 3,
            mt: 1
          }}>
              <QuickLinks links={quickLinks} setLinks={setQuickLinks} onShowAddForm={handleShowAddLinkForm} />
          </Box>
      )}

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
                  disabled={columnCount.lg >= 12}
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
          
          {/* Cancel Edit Button */}
          <IconButton
            aria-label="cancel-edit"
            onClick={() => {
              setEditMode(false);
              setShowColumnControls(false);
              setSnackbarMessage('Edit mode cancelled');
              setSnackbarOpen(true);
            }}
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 60, // Position it to the left of the save button
              color: 'white',
              backgroundColor: 'rgba(211, 47, 47, 0.7)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              width: 36,
              height: 36,
              transition: 'all 0.3s ease',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(211, 47, 47, 0.9)',
                transform: 'scale(1.05)',
              }
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </>
      )}

      {/* Widget Grid - Using WidgetGrid component */}
      <Box sx={{ width: '100%', maxWidth: '1200px' }}>
        <WidgetGrid 
          items={gridItems}
          onLayoutChange={handleLayoutChange}
          isDraggable={editMode}
          isResizable={editMode}
          columnCount={columnCount}
        />
      </Box>

      {/* Edit Button - Bottom Right */}
      <IconButton
        aria-label="edit"
        onClick={handleToggleEditMode}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          color: 'white',
          backgroundColor: editMode ? 'rgba(76, 175, 80, 0.7)' : 'rgba(15, 15, 20, 0.5)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
          width: 36,
          height: 36,
          fontSize: '0.8rem',
          transition: 'all 0.3s ease',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          '&:hover': {
            backgroundColor: editMode ? 'rgba(76, 175, 80, 0.9)' : 'rgba(15, 15, 20, 0.7)',
            transform: 'scale(1.05)',
            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }
        }}
      >
        {editMode ? <SaveIcon fontSize="small" /> : <EditIcon fontSize="small" />}
      </IconButton>

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