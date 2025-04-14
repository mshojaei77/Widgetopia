import React, { useState, useEffect, useCallback } from 'react';
import { Grid, IconButton, Box } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import type { WidgetConfig, QuickLink, Todo } from './types'; // Assuming Todo type exists

// Import Widgets
import Clock from './widgets/Clock';
import Weather from './widgets/Weather'; // Assuming Weather exists
import TodoList from './widgets/TodoList'; // Assuming TodoList exists
import QuickLinks from './widgets/QuickLinks';
import AddQuickLinkForm from './components/AddQuickLinkForm'; 
import SettingsModal from './components/SettingsModal';
import Greeting from './components/Greeting'; // Import Greeting
import SearchBar from './components/SearchBar'; // Import SearchBar

// import './App.css'; // Removed as file doesn't exist

const App: React.FC = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showAddLinkForm, setShowAddLinkForm] = useState(false);
  // Default wallpaper set here
  const [currentWallpaper, setCurrentWallpaper] = useState<string>(() => {
    return localStorage.getItem('selectedWallpaper') || '/wallpapers/forest.jpg';
  });
  const [userName, setUserName] = useState<string>(() => {
      return localStorage.getItem('userName') || 'Alex';
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
    // Add props for other widgets like Weather if needed

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

  return (
    <Box sx={{
      minHeight: '100vh',
      p: 4, // Padding around the content
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center', // Center items horizontally
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

      {/* Widget Grid - Excluding QuickLinks if rendered above */}
      <Grid container spacing={3} sx={{ maxWidth: '1200px', width: '100%' }}>
        {availableWidgets
            .filter(w => w.id !== 'quicklinks') // Don't render quicklinks in the grid
            .map(widget => renderWidget(widget.id))
        }
      </Grid>

      {/* Modals */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={handleCloseSettings}
        widgetVisibility={widgetVisibility}
        onVisibilityChange={handleVisibilityChange}
        availableWidgets={availableWidgets.map(w => ({ id: w.id, name: w.name }))}
        currentWallpaper={currentWallpaper}
        onWallpaperChange={handleWallpaperChange}
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