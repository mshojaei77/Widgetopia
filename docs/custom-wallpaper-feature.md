# Custom Wallpaper Upload Feature

## Overview
The Widgetopia dashboard now supports advanced wallpaper management, including custom wallpaper uploads, auto-shuffle functionality, and comprehensive wallpaper management with a compact, user-friendly interface.

## Features
- **Compact Upload Interface**: Small, inline upload button with minimal space usage
- **File Upload**: Users can upload multiple image files (JPG, PNG, WebP) with no size limit
- **Base64 Storage**: Images are converted to Base64 format and stored in localStorage for persistence
- **Auto-Shuffle**: Automatically change wallpapers every hour from all available wallpapers (default + custom)
- **Unified Gallery**: All wallpapers (default and custom) are displayed together in a single grid
- **Individual Deletion**: Both custom and default wallpapers can be deleted individually with delete buttons
- **Default Wallpaper Management**: Users can hide default wallpapers they don't want to see
- **Migration Support**: Automatically migrates old single custom wallpaper to new multi-wallpaper system
- **Validation**: File type validation and duplicate detection
- **Proper State Management**: Uses parent component handlers for consistent state updates
- **Improved Delete Button Positioning**: Delete buttons are positioned inside the wallpaper preview for better visibility

## How It Works

### Upload Process
1. User clicks the compact "+ Upload" button in Settings > Wallpaper tab
2. File picker opens with image file filter
3. Selected image is validated for:
   - File type (must be image/*)
   - Duplicate detection (prevents uploading the same image twice)
4. Image is converted to Base64 using FileReader API
5. Base64 string is added to the customWallpapers array via parent component handler
6. Wallpaper is immediately applied to the dashboard
7. New wallpaper appears in the unified wallpaper gallery
8. User receives confirmation feedback via snackbar notification

### Auto-Shuffle Feature
1. User enables "Auto-Change Wallpaper" toggle in Settings > General tab
2. System creates an interval that runs every hour (3,600,000ms)
3. On each interval, a random wallpaper is selected from all available wallpapers (default + custom)
4. The new wallpaper is different from the current one (if multiple wallpapers exist)
5. The selected wallpaper is applied and saved to localStorage

### Storage Strategy
- **Custom wallpapers**: Stored as Base64 array in localStorage key 'customWallpapers'
- **Hidden default wallpapers**: Stored as file path array in localStorage key 'hiddenDefaultWallpapers'
- **Predefined wallpapers**: Stored as file paths, filtered by hidden list, combined with custom wallpapers for shuffle
- **Shuffle setting**: Stored as boolean in localStorage key 'wallpaperShuffle'
- **Migration**: Old 'customWallpaper' (single) is automatically migrated to 'customWallpapers' (array)
- **State Management**: Parent component (App.tsx) manages all wallpaper state and persistence

### Memory Considerations
- Base64 encoding increases file size by ~33%
- Large images may exceed localStorage quota limits (typically 5-10MB per domain)
- Images are compressed by the browser during Base64 conversion

## Technical Implementation

### Key Components
- `SettingsModal.tsx`: Contains compact upload UI and file handling logic
- `App.tsx`: Manages wallpaper state, localStorage integration, and provides handlers

### Component Interface
```typescript
interface SettingsModalProps {
  // ... other props
  customWallpapers: string[];
  onDeleteCustomWallpaper: (wallpaper: string) => void;
  onAddCustomWallpaper: (wallpaper: string) => void;
  hiddenDefaultWallpapers: string[];
  onDeleteDefaultWallpaper: (wallpaper: string) => void;
}
```

### State Management Handlers
```typescript
// In App.tsx
const handleAddCustomWallpaper = useCallback((wallpaper: string) => {
  setCustomWallpapers(prev => {
    const updated = [...prev, wallpaper];
    return updated;
  });
  
  setSnackbarMessage('Custom wallpaper added');
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

const handleDeleteDefaultWallpaper = useCallback((wallpaperToDelete: string) => {
  setHiddenDefaultWallpapers(prev => {
    const updated = [...prev, wallpaperToDelete];
    
    // If the deleted wallpaper was the current one, switch to a visible wallpaper
    if (currentWallpaper === wallpaperToDelete) {
      const allWallpapers = getAllWallpapers();
      const remainingWallpapers = allWallpapers.filter(w => w !== wallpaperToDelete);
      if (remainingWallpapers.length > 0) {
        setCurrentWallpaper(remainingWallpapers[0]);
        if (!remainingWallpapers[0].startsWith('data:image/')) {
          localStorage.setItem('selectedWallpaper', remainingWallpapers[0]);
        }
      }
    }
    
    return updated;
  });
  
  setSnackbarMessage('Default wallpaper hidden');
  setSnackbarOpen(true);
}, [currentWallpaper, customWallpapers]);
```

### File Validation
```typescript
// File type check
if (!file.type.startsWith('image/')) {
  alert('Please select an image file');
  return;
}

// Duplicate detection
if (customWallpapers.includes(base64String)) {
  alert('This wallpaper has already been uploaded');
  return;
}
```

### Base64 Conversion
```typescript
const reader = new FileReader();
reader.onload = (e) => {
  const base64String = e.target?.result as string;
  
  // Add via parent component handler
  onAddCustomWallpaper(base64String);
  
  // Set as current wallpaper
  onWallpaperChange(base64String);
};
reader.readAsDataURL(file);
```

## User Interface

### Compact Upload Section
- Small inline upload button with "+ Upload" text
- Condensed format information: "JPG, PNG, WebP supported"
- Minimal space usage in the settings modal
- Loading state during upload process

### Wallpaper Gallery
- Unified grid showing visible default and custom wallpapers together
- Custom wallpapers display with "Custom 1", "Custom 2" etc. labels
- Delete buttons (red X) on both default and custom wallpapers
- Delete buttons positioned inside the wallpaper preview (top-right corner)
- Hidden default wallpapers are filtered out from the display
- Selection indicators and hover effects
- Responsive grid layout

## Browser Compatibility
- Supported in all modern browsers that support:
  - FileReader API
  - localStorage
  - Base64 data URLs
  - HTML5 file input

## Performance Notes
- Large images may impact initial load time
- Base64 strings are stored in memory and localStorage
- Consider image optimization before upload for best performance
- Very large images may exceed browser localStorage limits
- Proper state management prevents unnecessary re-renders

## Testing
- Comprehensive test suite covering upload, deletion, and state management
- Mock localStorage for testing persistence
- File validation testing
- Duplicate detection testing
- Parent component handler testing
- Hidden default wallpapers storage and filtering tests
- Default wallpaper deletion functionality tests

## Future Enhancements
- Image compression/resizing before storage
- Cloud storage integration
- Image format conversion (e.g., WebP optimization)
- Drag and drop upload support
- Bulk upload functionality 