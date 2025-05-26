# Custom Wallpaper Upload Feature

## Overview
The Widgetopia dashboard now supports custom wallpaper uploads, allowing users to personalize their dashboard with their own images.

## Features
- **File Upload**: Users can upload image files (JPG, PNG, WebP) up to 5MB
- **Base64 Storage**: Images are converted to Base64 format and stored in localStorage for persistence
- **Preview**: Uploaded wallpapers show a preview thumbnail
- **Management**: Users can remove custom wallpapers and revert to default options
- **Validation**: File type and size validation to ensure optimal performance

## How It Works

### Upload Process
1. User clicks "Choose Image" button in Settings > Wallpaper tab
2. File picker opens with image file filter
3. Selected image is validated for:
   - File type (must be image/*)
   - File size (max 5MB)
4. Image is converted to Base64 using FileReader API
5. Base64 string is stored in localStorage as 'customWallpaper'
6. Wallpaper is immediately applied to the dashboard

### Storage Strategy
- **Custom wallpapers**: Stored as Base64 in localStorage key 'customWallpaper'
- **Predefined wallpapers**: Stored as file paths in localStorage key 'selectedWallpaper'
- **Priority**: Custom wallpaper takes precedence over predefined wallpapers on app load

### Memory Considerations
- Base64 encoding increases file size by ~33%
- 5MB limit helps prevent localStorage quota issues
- Images are compressed by the browser during Base64 conversion

## Technical Implementation

### Key Components
- `SettingsModal.tsx`: Contains upload UI and file handling logic
- `App.tsx`: Manages wallpaper state and localStorage integration

### File Validation
```typescript
// File type check
if (!file.type.startsWith('image/')) {
  alert('Please select an image file');
  return;
}

// File size check (5MB limit)
if (file.size > 5 * 1024 * 1024) {
  alert('Image size should be less than 5MB');
  return;
}
```

### Base64 Conversion
```typescript
const reader = new FileReader();
reader.onload = (e) => {
  const base64String = e.target?.result as string;
  setCustomWallpaper(base64String);
  localStorage.setItem('customWallpaper', base64String);
  onWallpaperChange(base64String);
};
reader.readAsDataURL(file);
```

## User Interface
- Upload button in Settings modal under Wallpaper tab
- Preview thumbnail with selection indicator
- Remove button for custom wallpapers
- Loading state during upload process
- File format and size limit information

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
- 5MB limit helps maintain reasonable performance

## Future Enhancements
- Image compression/resizing before storage
- Multiple custom wallpaper slots
- Cloud storage integration
- Image format conversion (e.g., WebP optimization) 