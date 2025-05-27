import { type ColorPalette } from './colorPalettes';

export interface GlassThemeConfig {
  blurIntensity: number;
  opacity: number;
  borderOpacity: number;
  shadowIntensity: number;
  borderRadius: number;
  saturation: number;
  brightness: number;
  contrast: number;
}

export const defaultGlassConfig: GlassThemeConfig = {
  blurIntensity: 12,
  opacity: 0.1,
  borderOpacity: 0.2,
  shadowIntensity: 0.3,
  borderRadius: 16,
  saturation: 1.8,
  brightness: 1.1,
  contrast: 1.2,
};

export const applyColorPalette = (palette: ColorPalette, glassConfig: GlassThemeConfig = defaultGlassConfig) => {
  const root = document.documentElement;
  
  // Apply primary color variables
  Object.entries(palette.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
  
  // Apply enhanced glass effect variables
  root.style.setProperty('--glass-blur', `${glassConfig.blurIntensity}px`);
  root.style.setProperty('--glass-opacity', glassConfig.opacity.toString());
  root.style.setProperty('--glass-border-opacity', glassConfig.borderOpacity.toString());
  root.style.setProperty('--glass-shadow-intensity', glassConfig.shadowIntensity.toString());
  root.style.setProperty('--glass-border-radius', `${glassConfig.borderRadius}px`);
  root.style.setProperty('--glass-saturation', glassConfig.saturation.toString());
  root.style.setProperty('--glass-brightness', glassConfig.brightness.toString());
  root.style.setProperty('--glass-contrast', glassConfig.contrast.toString());
  
  // Enhanced backdrop filter with all effects
  const backdropFilter = `blur(${glassConfig.blurIntensity}px) saturate(${glassConfig.saturation}) brightness(${glassConfig.brightness}) contrast(${glassConfig.contrast})`;
  root.style.setProperty('--glass-backdrop-filter', backdropFilter);
  
  // Apply glassmorphism CSS variables with enhanced effects
  root.style.setProperty('--glass-background', `rgba(${hexToRgb(palette.colors.primary)}, ${glassConfig.opacity})`);
  root.style.setProperty('--glass-border', `1px solid rgba(255, 255, 255, ${glassConfig.borderOpacity})`);
  root.style.setProperty('--glass-shadow', `0 8px 32px rgba(0, 0, 0, ${glassConfig.shadowIntensity})`);
  
  // Enhanced glass effects for different component types
  root.style.setProperty('--glass-card-bg', `linear-gradient(135deg, rgba(${hexToRgb(palette.colors.primary)}, ${glassConfig.opacity * 1.2}) 0%, rgba(${hexToRgb(palette.colors.secondary)}, ${glassConfig.opacity * 0.8}) 100%)`);
  root.style.setProperty('--glass-button-bg', `rgba(${hexToRgb(palette.colors.primary)}, ${glassConfig.opacity * 2})`);
  root.style.setProperty('--glass-button-hover-bg', `rgba(${hexToRgb(palette.colors.primaryLight)}, ${glassConfig.opacity * 3})`);
  root.style.setProperty('--glass-input-bg', `rgba(${hexToRgb(palette.colors.backgroundSecondary)}, ${glassConfig.opacity * 3})`);
  root.style.setProperty('--glass-modal-bg', `rgba(${hexToRgb(palette.colors.backgroundPrimary)}, 0.95)`);
  
  // Enhanced dropdown-specific glass effects
  const dropdownBlur = Math.max(16, glassConfig.blurIntensity * 1.5); // Stronger blur for dropdowns
  const dropdownOpacity = Math.min(0.95, glassConfig.opacity * 8); // Higher opacity for better readability
  const dropdownBorderOpacity = Math.min(0.4, glassConfig.borderOpacity * 2); // More visible borders
  
  root.style.setProperty('--glass-dropdown-blur', `${dropdownBlur}px`);
  root.style.setProperty('--glass-dropdown-backdrop-filter', `blur(${dropdownBlur}px) saturate(${glassConfig.saturation * 1.2}) brightness(${glassConfig.brightness * 1.1}) contrast(${glassConfig.contrast * 1.1})`);
  root.style.setProperty('--glass-dropdown-bg', `linear-gradient(135deg, rgba(${hexToRgb(palette.colors.backgroundPrimary)}, ${dropdownOpacity}) 0%, rgba(${hexToRgb(palette.colors.backgroundSecondary)}, ${dropdownOpacity * 0.9}) 100%)`);
  root.style.setProperty('--glass-dropdown-border', `1px solid rgba(255, 255, 255, ${dropdownBorderOpacity})`);
  root.style.setProperty('--glass-dropdown-shadow', `0 12px 48px rgba(0, 0, 0, ${glassConfig.shadowIntensity * 1.5}), 0 4px 16px rgba(0, 0, 0, ${glassConfig.shadowIntensity * 0.8})`);
  
  // Dropdown menu item effects
  root.style.setProperty('--glass-dropdown-item-hover-bg', `rgba(${hexToRgb(palette.colors.primary)}, ${glassConfig.opacity * 2})`);
  root.style.setProperty('--glass-dropdown-item-selected-bg', `rgba(${hexToRgb(palette.colors.primary)}, ${glassConfig.opacity * 3})`);
  root.style.setProperty('--glass-dropdown-item-focus-bg', `rgba(${hexToRgb(palette.colors.accent)}, ${glassConfig.opacity * 1.5})`);
  
  // Select field glass effects
  root.style.setProperty('--glass-select-bg', `rgba(${hexToRgb(palette.colors.backgroundSecondary)}, ${glassConfig.opacity * 4})`);
  root.style.setProperty('--glass-select-border', `1px solid rgba(255, 255, 255, ${glassConfig.borderOpacity * 1.5})`);
  root.style.setProperty('--glass-select-hover-border', `1px solid rgba(${hexToRgb(palette.colors.primary)}, 0.6)`);
  root.style.setProperty('--glass-select-focus-border', `2px solid rgba(${hexToRgb(palette.colors.accent)}, 0.8)`);
  
  // Widget-specific glass effects
  root.style.setProperty('--glass-widget-bg', `linear-gradient(135deg, rgba(${hexToRgb(palette.colors.glassBackground.replace(/[^\d,]/g, ''))}, ${glassConfig.opacity}) 0%, rgba(${hexToRgb(palette.colors.backgroundSecondary)}, ${glassConfig.opacity * 0.5}) 100%)`);
  root.style.setProperty('--glass-widget-border', `1px solid rgba(255, 255, 255, ${glassConfig.borderOpacity * 0.8})`);
  root.style.setProperty('--glass-widget-shadow', `0 4px 16px rgba(0, 0, 0, ${glassConfig.shadowIntensity * 0.8})`);
  
  // Apply text colors with proper contrast
  root.style.setProperty('--text-on-glass', palette.colors.textPrimary);
  root.style.setProperty('--text-on-glass-secondary', palette.colors.textSecondary);
  root.style.setProperty('--text-on-glass-muted', palette.colors.textMuted);
  
  // Apply status colors with glass effect
  root.style.setProperty('--glass-success-bg', `rgba(${hexToRgb(palette.colors.success)}, ${glassConfig.opacity})`);
  root.style.setProperty('--glass-warning-bg', `rgba(${hexToRgb(palette.colors.warning)}, ${glassConfig.opacity})`);
  root.style.setProperty('--glass-error-bg', `rgba(${hexToRgb(palette.colors.error)}, ${glassConfig.opacity})`);
  root.style.setProperty('--glass-info-bg', `rgba(${hexToRgb(palette.colors.info)}, ${glassConfig.opacity})`);
  
  // Enhanced interactive states
  root.style.setProperty('--glass-hover-bg', `rgba(${hexToRgb(palette.colors.primary)}, ${glassConfig.opacity * 1.5})`);
  root.style.setProperty('--glass-active-bg', `rgba(${hexToRgb(palette.colors.primary)}, ${glassConfig.opacity * 2})`);
  root.style.setProperty('--glass-focus-border', `2px solid rgba(${hexToRgb(palette.colors.accent)}, 0.6)`);
  
  // Gradient overlays for enhanced depth
  root.style.setProperty('--glass-gradient-overlay', `linear-gradient(135deg, rgba(255, 255, 255, ${glassConfig.borderOpacity * 0.5}) 0%, transparent 50%, rgba(0, 0, 0, ${glassConfig.shadowIntensity * 0.3}) 100%)`);
  root.style.setProperty('--glass-shine-overlay', `linear-gradient(135deg, rgba(255, 255, 255, ${glassConfig.borderOpacity}) 0%, transparent 30%)`);
  
  // Store current palette ID and config for persistence
  localStorage.setItem('selectedColorPalette', palette.id);
  localStorage.setItem('glassThemeConfig', JSON.stringify(glassConfig));
  
  // Apply global CSS class for glass effects
  document.body.classList.add('glass-theme-active');
  
  // Update CSS custom properties for primary colors used in components
  root.style.setProperty('--primary-color', palette.colors.primary);
  root.style.setProperty('--primary-color-light', palette.colors.primaryLight);
  root.style.setProperty('--primary-color-dark', palette.colors.primaryDark);
  root.style.setProperty('--secondary-color', palette.colors.secondary);
  root.style.setProperty('--accent-color', palette.colors.accent);
  
  // Radius variables for consistent styling
  root.style.setProperty('--radius-sm', `${Math.max(4, glassConfig.borderRadius * 0.25)}px`);
  root.style.setProperty('--radius-md', `${Math.max(8, glassConfig.borderRadius * 0.5)}px`);
  root.style.setProperty('--radius-lg', `${glassConfig.borderRadius}px`);
  root.style.setProperty('--radius-xl', `${glassConfig.borderRadius * 1.5}px`);
  
  // Text color variables for easy access
  root.style.setProperty('--text-light', palette.colors.textPrimary);
  root.style.setProperty('--text-medium', palette.colors.textSecondary);
  root.style.setProperty('--text-muted', palette.colors.textMuted);
};

export const hexToRgb = (hex: string): string => {
  // Handle rgba values that might be passed in
  if (hex.includes('rgba') || hex.includes('rgb')) {
    const match = hex.match(/\d+/g);
    if (match && match.length >= 3) {
      return `${match[0]}, ${match[1]}, ${match[2]}`;
    }
  }
  
  // Handle hex values
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0, 0, 0';
  
  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ].join(', ');
};

export const getStoredColorPalette = (): string | null => {
  return localStorage.getItem('selectedColorPalette');
};

export const getStoredGlassConfig = (): GlassThemeConfig => {
  const stored = localStorage.getItem('glassThemeConfig');
  if (stored) {
    try {
      return { ...defaultGlassConfig, ...JSON.parse(stored) };
    } catch {
      return defaultGlassConfig;
    }
  }
  return defaultGlassConfig;
};

// Enhanced glass effect utilities
export const createGlassStyle = (
  backgroundOpacity: number = 0.1,
  borderOpacity: number = 0.2,
  blurAmount: number = 12,
  saturation: number = 1.8,
  brightness: number = 1.1
) => ({
  background: `rgba(255, 255, 255, ${backgroundOpacity})`,
  backdropFilter: `blur(${blurAmount}px) saturate(${saturation}) brightness(${brightness})`,
  WebkitBackdropFilter: `blur(${blurAmount}px) saturate(${saturation}) brightness(${brightness})`,
  border: `1px solid rgba(255, 255, 255, ${borderOpacity})`,
  borderRadius: 'var(--glass-border-radius)',
  boxShadow: `
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, ${borderOpacity * 0.8}),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1)
  `,
  position: 'relative' as const,
  overflow: 'hidden' as const,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'var(--glass-gradient-overlay)',
    pointerEvents: 'none',
    zIndex: 1,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: '70%',
    bottom: '70%',
    background: 'var(--glass-shine-overlay)',
    pointerEvents: 'none',
    zIndex: 2,
  }
});

export const createGlassGradient = (color1: string, color2: string, opacity: number = 0.1) => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  return `linear-gradient(135deg, 
    rgba(${rgb1}, ${opacity}) 0%, 
    rgba(${rgb2}, ${opacity * 0.5}) 100%
  )`;
};

// Enhanced dropdown glass effect utilities
export const createDropdownGlassStyle = (
  backgroundOpacity: number = 0.95,
  borderOpacity: number = 0.4,
  blurAmount: number = 20,
  saturation: number = 2.0,
  brightness: number = 1.15,
  contrast: number = 1.25
) => ({
  background: `var(--glass-dropdown-bg)`,
  backdropFilter: `blur(${blurAmount}px) saturate(${saturation}) brightness(${brightness}) contrast(${contrast})`,
  WebkitBackdropFilter: `blur(${blurAmount}px) saturate(${saturation}) brightness(${brightness}) contrast(${contrast})`,
  border: `var(--glass-dropdown-border)`,
  borderRadius: 'var(--radius-md)',
  boxShadow: `var(--glass-dropdown-shadow)`,
  position: 'relative' as const,
  overflow: 'hidden' as const,
  zIndex: 1300, // Higher z-index for dropdowns
  // Constrain width to match select field
  minWidth: '160px',
  maxWidth: '400px',
  width: 'auto', // Size based on content and anchor element
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(0, 0, 0, 0.05) 100%)',
    pointerEvents: 'none',
    zIndex: 1,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: '60%',
    bottom: '60%',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, transparent 40%)',
    pointerEvents: 'none',
    zIndex: 2,
  }
});

export const createSelectFieldGlassStyle = (
  backgroundOpacity: number = 0.4,
  borderOpacity: number = 0.3,
  blurAmount: number = 8,
  saturation: number = 1.6,
  brightness: number = 1.05
) => ({
  background: `var(--glass-select-bg)`,
  backdropFilter: `blur(${blurAmount}px) saturate(${saturation}) brightness(${brightness})`,
  WebkitBackdropFilter: `blur(${blurAmount}px) saturate(${saturation}) brightness(${brightness})`,
  border: `var(--glass-select-border)`,
  borderRadius: 'var(--radius-md)',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    border: `var(--glass-select-hover-border)`,
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  '&:focus-within': {
    border: `var(--glass-select-focus-border)`,
    boxShadow: '0 0 0 3px rgba(138, 180, 248, 0.2)',
  }
});

export const createMenuItemGlassStyle = () => ({
  transition: 'all 0.15s ease-in-out',
  borderRadius: 'var(--radius-sm)',
  margin: '2px 4px',
  '&:hover': {
    background: `var(--glass-dropdown-item-hover-bg)`,
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    transform: 'translateX(2px)',
  },
  '&.Mui-selected': {
    background: `var(--glass-dropdown-item-selected-bg)`,
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    '&:hover': {
      background: `var(--glass-dropdown-item-selected-bg)`,
    }
  },
  '&.Mui-focusVisible': {
    background: `var(--glass-dropdown-item-focus-bg)`,
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
  }
});

// Preset glass configurations for different use cases
export const glassPresets = {
  subtle: {
    blurIntensity: 8,
    opacity: 0.05,
    borderOpacity: 0.1,
    shadowIntensity: 0.2,
    borderRadius: 12,
    saturation: 1.5,
    brightness: 1.05,
    contrast: 1.1,
  },
  moderate: {
    blurIntensity: 12,
    opacity: 0.1,
    borderOpacity: 0.2,
    shadowIntensity: 0.3,
    borderRadius: 16,
    saturation: 1.8,
    brightness: 1.1,
    contrast: 1.2,
  },
  intense: {
    blurIntensity: 20,
    opacity: 0.15,
    borderOpacity: 0.3,
    shadowIntensity: 0.4,
    borderRadius: 20,
    saturation: 2.2,
    brightness: 1.2,
    contrast: 1.3,
  },
  minimal: {
    blurIntensity: 4,
    opacity: 0.03,
    borderOpacity: 0.05,
    shadowIntensity: 0.1,
    borderRadius: 8,
    saturation: 1.2,
    brightness: 1.0,
    contrast: 1.0,
  },
  // New dropdown-optimized presets
  dropdownOptimal: {
    blurIntensity: 16,
    opacity: 0.12,
    borderOpacity: 0.25,
    shadowIntensity: 0.35,
    borderRadius: 14,
    saturation: 2.0,
    brightness: 1.15,
    contrast: 1.25,
  },
  dropdownSubtle: {
    blurIntensity: 12,
    opacity: 0.08,
    borderOpacity: 0.18,
    shadowIntensity: 0.25,
    borderRadius: 12,
    saturation: 1.7,
    brightness: 1.08,
    contrast: 1.15,
  }
};

export const applyGlassPreset = (presetName: keyof typeof glassPresets, palette: ColorPalette) => {
  const preset = glassPresets[presetName];
  applyColorPalette(palette, preset);
  return preset;
}; 