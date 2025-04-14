# Widgetopia Widget Development Guide

This guide explains how to create new widgets for the Widgetopia Chrome extension. Follow these steps to build your own custom widgets and extend the functionality of your new tab page.

## Widget Architecture

Widgets in Widgetopia share a common structure:

1. Each widget is a React component that uses the base `Widget` component
2. Widgets have their own CSS file for styling
3. Widgets may use Chrome's storage API for persistence
4. Widgets are rendered in the `WidgetGrid` component in `App.tsx`

## Creating a New Widget

### Step 1: Create Widget Files

Create the following files in the `src/widgets` directory:

```
src/widgets/
  ├── YourWidgetName.tsx
  └── YourWidgetName.css
```

### Step 2: Build the Widget Component

Create your widget component using the following template:

```tsx
// src/widgets/YourWidgetName.tsx
import React, { useState, useEffect } from 'react';
import Widget from '../components/Widget';
import './YourWidgetName.css';

// Define interfaces for your data if needed
interface YourDataType {
  // Your data properties
}

const YourWidgetName: React.FC = () => {
  // State management
  const [data, setData] = useState<YourDataType | null>(null);
  
  // Load data on mount (if needed)
  useEffect(() => {
    // Initialize your widget
    loadData();
    
    // Optional: Set up any timers or event listeners
    const timerId = setInterval(() => {
      // Periodic updates if needed
    }, 5000);
    
    // Clean up on unmount
    return () => {
      clearInterval(timerId);
      // Remove any event listeners
    };
  }, []);
  
  // Function to load data (from Chrome storage or APIs)
  const loadData = async () => {
    try {
      // Example using Chrome storage
      if (chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.get(['yourWidgetData'], (result) => {
          if (result.yourWidgetData) {
            setData(result.yourWidgetData);
          } else {
            // Set default data
            setData(/* default data */);
          }
        });
      } else {
        // For development outside Chrome extension
        setData(/* mock data */);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Set fallback data
      setData(/* fallback data */);
    }
  };
  
  // Function to save data (if widget has editable content)
  const saveData = (newData: YourDataType) => {
    setData(newData);
    
    // Save to Chrome storage if available
    try {
      if (chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.set({ yourWidgetData: newData });
      }
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };
  
  // Widget UI rendering
  return (
    <Widget title="Your Widget Title" className="your-widget-name">
      <div className="your-widget-content">
        {/* Your widget content here */}
        {data ? (
          <div>
            {/* Render your data */}
          </div>
        ) : (
          <div className="loading">Loading...</div>
        )}
      </div>
    </Widget>
  );
};

export default YourWidgetName;
```

### Step 3: Style Your Widget

Create a CSS file for your widget:

```css
/* src/widgets/YourWidgetName.css */
.your-widget-name {
  /* Set widget background (optional) */
  background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
}

.your-widget-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  /* Add more styling as needed */
}

/* Add more specific styles for your widget elements */
```

### Step 4: Add the Widget to the App

Open `src/App.tsx` and add your widget to the `WidgetGrid`:

```tsx
import YourWidgetName from './widgets/YourWidgetName';

// Inside the App component's return statement
<WidgetGrid>
  <Clock />
  <Weather />
  <TodoList />
  <QuickLinks />
  <YourWidgetName /> {/* Add your new widget here */}
</WidgetGrid>
```

## Widget Examples

### Data-Driven Widget

A widget that fetches and displays data from an API:

```tsx
// DataWidget.tsx
import React, { useState, useEffect } from 'react';
import Widget from '../components/Widget';
import './DataWidget.css';

interface DataItem {
  id: number;
  title: string;
  value: string;
}

const DataWidget: React.FC = () => {
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // In a real widget, replace with actual API call
      // const response = await fetch('https://api.example.com/data');
      // const result = await response.json();
      
      // Mock data for example
      const mockData = [
        { id: 1, title: 'Item 1', value: '42' },
        { id: 2, title: 'Item 2', value: '108' },
        { id: 3, title: 'Item 3', value: '1337' },
      ];
      
      // Simulate API delay
      setTimeout(() => {
        setData(mockData);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to fetch data');
      setLoading(false);
      console.error('Error fetching data:', err);
    }
  };

  return (
    <Widget title="Data Widget" className="data-widget">
      {loading ? (
        <div className="data-loading">Loading data...</div>
      ) : error ? (
        <div className="data-error">{error}</div>
      ) : (
        <div className="data-content">
          <button onClick={fetchData} className="data-refresh-btn">
            Refresh
          </button>
          <ul className="data-list">
            {data.map(item => (
              <li key={item.id} className="data-item">
                <span className="data-title">{item.title}</span>
                <span className="data-value">{item.value}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Widget>
  );
};

export default DataWidget;
```

### Interactive Widget

A widget with user interaction:

```tsx
// NoteWidget.tsx
import React, { useState, useEffect } from 'react';
import Widget from '../components/Widget';
import './NoteWidget.css';

const NoteWidget: React.FC = () => {
  const [note, setNote] = useState('');
  
  // Load note from storage on mount
  useEffect(() => {
    if (chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.get(['note'], (result) => {
        if (result.note) {
          setNote(result.note);
        }
      });
    }
  }, []);
  
  // Save note to storage when it changes
  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNote = e.target.value;
    setNote(newNote);
    
    if (chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.set({ note: newNote });
    }
  };
  
  return (
    <Widget title="Quick Note" className="note-widget">
      <div className="note-content">
        <textarea
          className="note-textarea"
          value={note}
          onChange={handleNoteChange}
          placeholder="Write a quick note here..."
        />
      </div>
    </Widget>
  );
};

export default NoteWidget;
```

## Best Practices

1. **Keep widgets focused**: Each widget should serve a specific purpose.
2. **Handle loading states**: Always show loading indicators while fetching data.
3. **Error handling**: Gracefully handle errors and provide fallback content.
4. **Responsive design**: Make sure your widget looks good on different screen sizes.
5. **Storage considerations**: Remember Chrome storage has limitations (5MB per extension).
6. **Clean up**: Remove event listeners and clear intervals in the cleanup function of useEffect.
7. **Consistent styling**: Follow the existing design patterns for consistency.

## Advanced Topics

### Custom Widget Settings

To add settings to your widget:

1. Add a settings button to your widget
2. Create a settings modal or dropdown
3. Save settings in Chrome storage
4. Apply settings to customize widget behavior

### Widget Communication

If you need widgets to communicate with each other:

1. Use a state management library like Zustand or React Context
2. Share state between widgets using the central store
3. Update the shared state when changes occur

## Testing Your Widget

1. **Development mode**: Use `bun run dev` to test in the dev server.
2. **Chrome testing**: Build with `bun run build` and load in Chrome to test full functionality.
3. **Storage testing**: Test with and without Chrome storage to ensure fallbacks work.

---

Happy widget building! If you create a useful widget, consider contributing it back to the Widgetopia project. 