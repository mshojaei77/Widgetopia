# Widgetopia Theme System

## Overview

Widgetopia features a sophisticated theme system with glassmorphism effects and customizable color palettes. The system provides a modern, elegant interface with smooth animations and professional visual effects.

## Features

### 🎨 Color Palettes

The application includes 11 carefully crafted color palettes:

1. **Purple Love** - Deep purples with magenta accents (Default)
2. **Cyberpunk Neon** - Electric blues and neon pinks with dark backgrounds
3. **Ocean Depths** - Deep blues and teals with aqua highlights
4. **Emerald Forest** - Rich greens with golden accents
5. **Sunset Glow** - Warm oranges and reds with golden highlights
6. **Midnight Rose** - Deep roses and pinks with silver accents
7. **Arctic Aurora** - Cool blues and cyans with mint highlights
8. **Golden Hour** - Warm golds and ambers with deep browns
9. **Cosmic Void** - Deep space blacks with stellar purples and blues
10. **Cherry Blossom** - Soft pinks and whites with gentle purples
11. **Monochrome Elite** - Sophisticated blacks, whites, and grays

### 🔮 Glass Effects

Advanced glassmorphism implementation with:

- **Blur Intensity** (0-30px) - Controls backdrop blur amount
- **Opacity** (0-50%) - Controls glass transparency
- **Border Opacity** (0-100%) - Controls border visibility
- **Shadow Intensity** (0-100%) - Controls drop shadow strength
- **Border Radius** (0-32px) - Controls corner roundness
- **Saturation** (0.5-3.0) - Controls color saturation
- **Brightness** (0.5-2.0) - Controls brightness enhancement
- **Contrast** (0.5-2.0) - Controls contrast enhancement

### 🎛️ Glass Presets

Four predefined glass effect configurations:

- **Minimal** - Subtle glass effect for minimal designs
- **Subtle** - Light glass effect for clean interfaces
- **Moderate** - Balanced glass effect (default)
- **Intense** - Strong glass effect for dramatic visuals

## Usage

### Accessing Theme Settings

1. Click the **Settings** button (⚙️) in the top-right corner
2. Navigate to the **Theme** tab
3. Customize color palettes and glass effects

### Color Palette Selection

```typescript
// Programmatically change color palette
onColorPaletteChange('cyberpunkNeon');
```

### Glass Configuration

```typescript
// Programmatically update glass settings
onGlassConfigChange({
  blurIntensity: 15,
  opacity: 0.12,
  borderOpacity: 0.25,
  shadowIntensity: 0.35,
  borderRadius: 18,
  saturation: 2.0,
  brightness: 1.15,
  contrast: 1.25
});
```

### CSS Classes

The theme system provides several CSS classes for consistent styling:

#### Basic Glass Effects
```css
.glass                /* Basic glass effect */
.glass-enhanced       /* Enhanced glass with overlays */
.glass-widget         /* Widget-specific glass styling */
```

#### Interactive Elements
```css
.glass-button         /* Glass button styling */
.glass-input          /* Glass input field styling */
.glass-modal          /* Glass modal styling */
```

#### Status Indicators
```css
.glass-success        /* Success state glass */
.glass-warning        /* Warning state glass */
.glass-error          /* Error state glass */
.glass-info           /* Info state glass */
```

#### Text Styling
```css
.glass-text-primary   /* Primary text on glass */
.glass-text-secondary /* Secondary text on glass */
.glass-text-muted     /* Muted text on glass */
```

## CSS Variables

The theme system exposes numerous CSS variables for customization:

### Color Variables
```css
--color-primary
--color-primaryLight
--color-primaryDark
--color-secondary
--color-accent
--text-light
--text-medium
--text-muted
```

### Glass Effect Variables
```css
--glass-background
--glass-border
--glass-shadow
--glass-backdrop-filter
--glass-border-radius
--glass-opacity
--glass-border-opacity
--glass-shadow-intensity
```

### Interactive State Variables
```css
--glass-hover-bg
--glass-active-bg
--glass-focus-border
```

## Implementation Details

### File Structure
```
src/
├── theme/
│   ├── colorPalettes.ts    # Color palette definitions
│   └── glassTheme.ts       # Glass effect system
├── styles/
│   └── glass-theme.css     # Global glass styles
└── components/
    └── SettingsModal.tsx   # Theme configuration UI
```

### Color Palette Interface
```typescript
interface ColorPalette {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    secondary: string;
    secondaryLight: string;
    secondaryDark: string;
    accent: string;
    accentLight: string;
    accentDark: string;
    glassBackground: string;
    glassBorder: string;
    glassHighlight: string;
    glassShadow: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    backgroundPrimary: string;
    backgroundSecondary: string;
    backgroundTertiary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}
```

### Glass Configuration Interface
```typescript
interface GlassThemeConfig {
  blurIntensity: number;
  opacity: number;
  borderOpacity: number;
  shadowIntensity: number;
  borderRadius: number;
  saturation: number;
  brightness: number;
  contrast: number;
}
```

## Accessibility

The theme system includes accessibility features:

- **High Contrast Mode** - Enhanced borders for better visibility
- **Reduced Motion** - Respects user's motion preferences
- **Keyboard Navigation** - Full keyboard support for theme controls
- **Screen Reader** - Proper ARIA labels and descriptions

## Browser Support

- **Modern Browsers** - Full support for Chrome, Firefox, Safari, Edge
- **Backdrop Filter** - Graceful degradation for older browsers
- **CSS Variables** - Fallbacks for unsupported browsers

## Performance

- **CSS Variables** - Efficient theme switching without re-rendering
- **Hardware Acceleration** - GPU-accelerated blur effects
- **Responsive Design** - Optimized effects for different screen sizes
- **Memory Efficient** - Minimal impact on application performance

## Customization

### Adding New Color Palettes

1. Add new palette to `colorPalettes.ts`:
```typescript
{
  id: 'myCustomPalette',
  name: 'My Custom Palette',
  description: 'A custom color scheme',
  colors: {
    // Define all required colors
  }
}
```

2. The palette will automatically appear in the settings

### Creating Custom Glass Presets

```typescript
export const customGlassPreset = {
  blurIntensity: 25,
  opacity: 0.08,
  borderOpacity: 0.15,
  shadowIntensity: 0.5,
  borderRadius: 24,
  saturation: 2.5,
  brightness: 1.3,
  contrast: 1.4,
};
```

## Troubleshooting

### Common Issues

1. **Glass effects not visible**
   - Check browser support for `backdrop-filter`
   - Ensure CSS file is imported correctly

2. **Performance issues**
   - Reduce blur intensity for better performance
   - Use minimal preset on lower-end devices

3. **Color not applying**
   - Verify palette ID is correct
   - Check localStorage for stored preferences

### Debug Mode

Enable debug logging:
```typescript
localStorage.setItem('themeDebug', 'true');
```

## Future Enhancements

- **Custom Color Picker** - Allow users to create custom colors
- **Animation Presets** - Different animation styles for glass effects
- **Theme Import/Export** - Save and share custom themes
- **Auto Dark Mode** - Automatic theme switching based on time
- **Gradient Backgrounds** - Support for gradient wallpapers

## Contributing

When contributing to the theme system:

1. Follow the existing color palette structure
2. Test accessibility features
3. Ensure cross-browser compatibility
4. Update documentation for new features
5. Add appropriate TypeScript types

## License

The theme system is part of Widgetopia and follows the same license terms. 