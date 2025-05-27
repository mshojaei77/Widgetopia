export interface ColorPalette {
  id: string;
  name: string;
  description: string;
  colors: {
    // Primary colors
    primary: string;
    primaryLight: string;
    primaryDark: string;
    
    // Secondary colors
    secondary: string;
    secondaryLight: string;
    secondaryDark: string;
    
    // Accent colors
    accent: string;
    accentLight: string;
    accentDark: string;
    
    // Glass effect colors
    glassBackground: string;
    glassBorder: string;
    glassHighlight: string;
    glassShadow: string;
    
    // Text colors
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    
    // Background colors
    backgroundPrimary: string;
    backgroundSecondary: string;
    backgroundTertiary: string;
    
    // Status colors
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

export const colorPalettes: ColorPalette[] = [
  {
    id: 'purpleLove',
    name: 'Purple Love',
    description: 'Deep purples with magenta accents - inspired by modern UI trends',
    colors: {
      primary: '#8B5CF6',
      primaryLight: '#A78BFA',
      primaryDark: '#7C3AED',
      
      secondary: '#EC4899',
      secondaryLight: '#F472B6',
      secondaryDark: '#DB2777',
      
      accent: '#06B6D4',
      accentLight: '#22D3EE',
      accentDark: '#0891B2',
      
      glassBackground: 'rgba(139, 92, 246, 0.1)',
      glassBorder: 'rgba(255, 255, 255, 0.2)',
      glassHighlight: 'rgba(255, 255, 255, 0.1)',
      glassShadow: 'rgba(0, 0, 0, 0.3)',
      
      textPrimary: '#F8FAFC',
      textSecondary: '#E2E8F0',
      textMuted: '#94A3B8',
      
      backgroundPrimary: '#0F0F23',
      backgroundSecondary: '#1E1B4B',
      backgroundTertiary: '#312E81',
      
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    }
  },
  {
    id: 'cyberpunkNeon',
    name: 'Cyberpunk Neon',
    description: 'Electric blues and neon pinks with dark backgrounds',
    colors: {
      primary: '#00D9FF',
      primaryLight: '#33E1FF',
      primaryDark: '#00B8D4',
      
      secondary: '#FF0080',
      secondaryLight: '#FF3399',
      secondaryDark: '#E6006B',
      
      accent: '#FFFF00',
      accentLight: '#FFFF66',
      accentDark: '#E6E600',
      
      glassBackground: 'rgba(0, 217, 255, 0.08)',
      glassBorder: 'rgba(0, 217, 255, 0.3)',
      glassHighlight: 'rgba(255, 255, 255, 0.1)',
      glassShadow: 'rgba(0, 0, 0, 0.5)',
      
      textPrimary: '#FFFFFF',
      textSecondary: '#B3E5FC',
      textMuted: '#4FC3F7',
      
      backgroundPrimary: '#0A0A0F',
      backgroundSecondary: '#1A1A2E',
      backgroundTertiary: '#16213E',
      
      success: '#00FF88',
      warning: '#FFB300',
      error: '#FF1744',
      info: '#00D9FF',
    }
  },
  {
    id: 'oceanDepths',
    name: 'Ocean Depths',
    description: 'Deep blues and teals with aqua highlights',
    colors: {
      primary: '#0EA5E9',
      primaryLight: '#38BDF8',
      primaryDark: '#0284C7',
      
      secondary: '#06B6D4',
      secondaryLight: '#22D3EE',
      secondaryDark: '#0891B2',
      
      accent: '#8B5CF6',
      accentLight: '#A78BFA',
      accentDark: '#7C3AED',
      
      glassBackground: 'rgba(14, 165, 233, 0.1)',
      glassBorder: 'rgba(255, 255, 255, 0.2)',
      glassHighlight: 'rgba(255, 255, 255, 0.1)',
      glassShadow: 'rgba(0, 0, 0, 0.3)',
      
      textPrimary: '#F0F9FF',
      textSecondary: '#E0F2FE',
      textMuted: '#7DD3FC',
      
      backgroundPrimary: '#0C1426',
      backgroundSecondary: '#1E293B',
      backgroundTertiary: '#334155',
      
      success: '#059669',
      warning: '#D97706',
      error: '#DC2626',
      info: '#2563EB',
    }
  },
  {
    id: 'emeraldForest',
    name: 'Emerald Forest',
    description: 'Rich greens with golden accents',
    colors: {
      primary: '#10B981',
      primaryLight: '#34D399',
      primaryDark: '#059669',
      
      secondary: '#F59E0B',
      secondaryLight: '#FBBF24',
      secondaryDark: '#D97706',
      
      accent: '#8B5CF6',
      accentLight: '#A78BFA',
      accentDark: '#7C3AED',
      
      glassBackground: 'rgba(16, 185, 129, 0.1)',
      glassBorder: 'rgba(255, 255, 255, 0.2)',
      glassHighlight: 'rgba(255, 255, 255, 0.1)',
      glassShadow: 'rgba(0, 0, 0, 0.3)',
      
      textPrimary: '#F0FDF4',
      textSecondary: '#DCFCE7',
      textMuted: '#86EFAC',
      
      backgroundPrimary: '#0F1F13',
      backgroundSecondary: '#1F2937',
      backgroundTertiary: '#374151',
      
      success: '#059669',
      warning: '#D97706',
      error: '#DC2626',
      info: '#2563EB',
    }
  },
  {
    id: 'sunsetGlow',
    name: 'Sunset Glow',
    description: 'Warm oranges and reds with golden highlights',
    colors: {
      primary: '#F97316',
      primaryLight: '#FB923C',
      primaryDark: '#EA580C',
      
      secondary: '#EF4444',
      secondaryLight: '#F87171',
      secondaryDark: '#DC2626',
      
      accent: '#FBBF24',
      accentLight: '#FCD34D',
      accentDark: '#F59E0B',
      
      glassBackground: 'rgba(249, 115, 22, 0.1)',
      glassBorder: 'rgba(255, 255, 255, 0.2)',
      glassHighlight: 'rgba(255, 255, 255, 0.1)',
      glassShadow: 'rgba(0, 0, 0, 0.3)',
      
      textPrimary: '#FFFBEB',
      textSecondary: '#FEF3C7',
      textMuted: '#FDE68A',
      
      backgroundPrimary: '#1C1917',
      backgroundSecondary: '#292524',
      backgroundTertiary: '#44403C',
      
      success: '#059669',
      warning: '#D97706',
      error: '#DC2626',
      info: '#2563EB',
    }
  },
  {
    id: 'midnightRose',
    name: 'Midnight Rose',
    description: 'Deep roses and pinks with silver accents',
    colors: {
      primary: '#EC4899',
      primaryLight: '#F472B6',
      primaryDark: '#DB2777',
      
      secondary: '#8B5CF6',
      secondaryLight: '#A78BFA',
      secondaryDark: '#7C3AED',
      
      accent: '#06B6D4',
      accentLight: '#22D3EE',
      accentDark: '#0891B2',
      
      glassBackground: 'rgba(236, 72, 153, 0.1)',
      glassBorder: 'rgba(255, 255, 255, 0.2)',
      glassHighlight: 'rgba(255, 255, 255, 0.1)',
      glassShadow: 'rgba(0, 0, 0, 0.3)',
      
      textPrimary: '#FDF2F8',
      textSecondary: '#FCE7F3',
      textMuted: '#F9A8D4',
      
      backgroundPrimary: '#1F0A1F',
      backgroundSecondary: '#2D1B2E',
      backgroundTertiary: '#4C1D4C',
      
      success: '#059669',
      warning: '#D97706',
      error: '#DC2626',
      info: '#2563EB',
    }
  },
  {
    id: 'arcticAurora',
    name: 'Arctic Aurora',
    description: 'Cool blues and cyans with mint highlights',
    colors: {
      primary: '#06B6D4',
      primaryLight: '#22D3EE',
      primaryDark: '#0891B2',
      
      secondary: '#10B981',
      secondaryLight: '#34D399',
      secondaryDark: '#059669',
      
      accent: '#8B5CF6',
      accentLight: '#A78BFA',
      accentDark: '#7C3AED',
      
      glassBackground: 'rgba(6, 182, 212, 0.1)',
      glassBorder: 'rgba(255, 255, 255, 0.2)',
      glassHighlight: 'rgba(255, 255, 255, 0.1)',
      glassShadow: 'rgba(0, 0, 0, 0.3)',
      
      textPrimary: '#F0FDFA',
      textSecondary: '#CCFBF1',
      textMuted: '#5EEAD4',
      
      backgroundPrimary: '#0F1419',
      backgroundSecondary: '#1F2937',
      backgroundTertiary: '#374151',
      
      success: '#059669',
      warning: '#D97706',
      error: '#DC2626',
      info: '#2563EB',
    }
  },
  {
    id: 'goldenHour',
    name: 'Golden Hour',
    description: 'Warm golds and ambers with deep browns',
    colors: {
      primary: '#F59E0B',
      primaryLight: '#FBBF24',
      primaryDark: '#D97706',
      
      secondary: '#F97316',
      secondaryLight: '#FB923C',
      secondaryDark: '#EA580C',
      
      accent: '#EF4444',
      accentLight: '#F87171',
      accentDark: '#DC2626',
      
      glassBackground: 'rgba(245, 158, 11, 0.1)',
      glassBorder: 'rgba(255, 255, 255, 0.2)',
      glassHighlight: 'rgba(255, 255, 255, 0.15)',
      glassShadow: 'rgba(0, 0, 0, 0.3)',
      
      textPrimary: '#FFFBEB',
      textSecondary: '#FEF3C7',
      textMuted: '#FDE68A',
      
      backgroundPrimary: '#1C1917',
      backgroundSecondary: '#292524',
      backgroundTertiary: '#44403C',
      
      success: '#059669',
      warning: '#D97706',
      error: '#DC2626',
      info: '#2563EB',
    }
  },
  {
    id: 'cosmicVoid',
    name: 'Cosmic Void',
    description: 'Deep space blacks with stellar purples and blues',
    colors: {
      primary: '#6366F1',
      primaryLight: '#818CF8',
      primaryDark: '#4F46E5',
      
      secondary: '#8B5CF6',
      secondaryLight: '#A78BFA',
      secondaryDark: '#7C3AED',
      
      accent: '#EC4899',
      accentLight: '#F472B6',
      accentDark: '#DB2777',
      
      glassBackground: 'rgba(99, 102, 241, 0.08)',
      glassBorder: 'rgba(255, 255, 255, 0.15)',
      glassHighlight: 'rgba(255, 255, 255, 0.08)',
      glassShadow: 'rgba(0, 0, 0, 0.4)',
      
      textPrimary: '#F8FAFC',
      textSecondary: '#E2E8F0',
      textMuted: '#94A3B8',
      
      backgroundPrimary: '#0A0A0F',
      backgroundSecondary: '#1E1B4B',
      backgroundTertiary: '#312E81',
      
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    }
  },
  {
    id: 'cherryBlossom',
    name: 'Cherry Blossom',
    description: 'Soft pinks and whites with gentle purples',
    colors: {
      primary: '#F472B6',
      primaryLight: '#F9A8D4',
      primaryDark: '#EC4899',
      
      secondary: '#A78BFA',
      secondaryLight: '#C4B5FD',
      secondaryDark: '#8B5CF6',
      
      accent: '#06B6D4',
      accentLight: '#22D3EE',
      accentDark: '#0891B2',
      
      glassBackground: 'rgba(244, 114, 182, 0.08)',
      glassBorder: 'rgba(255, 255, 255, 0.25)',
      glassHighlight: 'rgba(255, 255, 255, 0.15)',
      glassShadow: 'rgba(0, 0, 0, 0.2)',
      
      textPrimary: '#FDF2F8',
      textSecondary: '#FCE7F3',
      textMuted: '#F9A8D4',
      
      backgroundPrimary: '#1F0A1F',
      backgroundSecondary: '#2D1B2E',
      backgroundTertiary: '#4C1D4C',
      
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    }
  },
  {
    id: 'monochrome',
    name: 'Monochrome Elite',
    description: 'Sophisticated blacks, whites, and grays',
    colors: {
      primary: '#6B7280',
      primaryLight: '#9CA3AF',
      primaryDark: '#4B5563',
      
      secondary: '#374151',
      secondaryLight: '#6B7280',
      secondaryDark: '#1F2937',
      
      accent: '#F3F4F6',
      accentLight: '#FFFFFF',
      accentDark: '#E5E7EB',
      
      glassBackground: 'rgba(107, 114, 128, 0.1)',
      glassBorder: 'rgba(255, 255, 255, 0.2)',
      glassHighlight: 'rgba(255, 255, 255, 0.1)',
      glassShadow: 'rgba(0, 0, 0, 0.3)',
      
      textPrimary: '#F9FAFB',
      textSecondary: '#F3F4F6',
      textMuted: '#D1D5DB',
      
      backgroundPrimary: '#111827',
      backgroundSecondary: '#1F2937',
      backgroundTertiary: '#374151',
      
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    }
  }
];

export const getColorPalette = (id: string): ColorPalette | undefined => {
  return colorPalettes.find(palette => palette.id === id);
};

export const getDefaultColorPalette = (): ColorPalette => {
  return colorPalettes[0]; // Purple Love as default
}; 