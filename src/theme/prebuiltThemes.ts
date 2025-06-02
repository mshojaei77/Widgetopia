import { type ColorPalette } from './colorPalettes';
import { type GlassThemeConfig } from './glassTheme';

export interface PrebuiltTheme {
  id: string;
  name: string;
  description: string;
  category: 'nature' | 'gaming' | 'anime' | 'cartoon' | 'minimal' | 'cyberpunk' | 'vintage';
  wallpaper: string;
  colorPalette: ColorPalette;
  glassConfig: GlassThemeConfig;
  preview?: string; // Optional preview image
}

// Enhanced color palettes for pre-built themes
const natureColorPalette: ColorPalette = {
  id: 'natureTheme',
  name: 'Nature Harmony',
  description: 'Fresh greens and earth tones inspired by nature',
  colors: {
    primary: '#22C55E',
    primaryLight: '#4ADE80',
    primaryDark: '#16A34A',
    
    secondary: '#84CC16',
    secondaryLight: '#A3E635',
    secondaryDark: '#65A30D',
    
    accent: '#F59E0B',
    accentLight: '#FBBF24',
    accentDark: '#D97706',
    
    glassBackground: 'rgba(34, 197, 94, 0.12)',
    glassBorder: 'rgba(255, 255, 255, 0.25)',
    glassHighlight: 'rgba(255, 255, 255, 0.15)',
    glassShadow: 'rgba(0, 0, 0, 0.25)',
    
    textPrimary: '#F0FDF4',
    textSecondary: '#DCFCE7',
    textMuted: '#86EFAC',
    
    backgroundPrimary: '#0F1F13',
    backgroundSecondary: '#1A2E1A',
    backgroundTertiary: '#2D4A2D',
    
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  }
};

const rdrColorPalette: ColorPalette = {
  id: 'rdrTheme',
  name: 'Wild West',
  description: 'Rustic reds and golden yellows of the frontier',
  colors: {
    primary: '#DC2626',
    primaryLight: '#EF4444',
    primaryDark: '#B91C1C',
    
    secondary: '#F59E0B',
    secondaryLight: '#FBBF24',
    secondaryDark: '#D97706',
    
    accent: '#92400E',
    accentLight: '#B45309',
    accentDark: '#78350F',
    
    glassBackground: 'rgba(220, 38, 38, 0.15)',
    glassBorder: 'rgba(255, 255, 255, 0.3)',
    glassHighlight: 'rgba(255, 255, 255, 0.2)',
    glassShadow: 'rgba(0, 0, 0, 0.4)',
    
    textPrimary: '#FEF2F2',
    textSecondary: '#FECACA',
    textMuted: '#FCA5A5',
    
    backgroundPrimary: '#1F1611',
    backgroundSecondary: '#2D1B0E',
    backgroundTertiary: '#451A03',
    
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#DC2626',
    info: '#3B82F6',
  }
};

const arcaneColorPalette: ColorPalette = {
  id: 'arcaneTheme',
  name: 'Arcane Magic',
  description: 'Mystical purples and electric blues',
  colors: {
    primary: '#8B5CF6',
    primaryLight: '#A78BFA',
    primaryDark: '#7C3AED',
    
    secondary: '#06B6D4',
    secondaryLight: '#22D3EE',
    secondaryDark: '#0891B2',
    
    accent: '#EC4899',
    accentLight: '#F472B6',
    accentDark: '#DB2777',
    
    glassBackground: 'rgba(139, 92, 246, 0.18)',
    glassBorder: 'rgba(255, 255, 255, 0.35)',
    glassHighlight: 'rgba(255, 255, 255, 0.25)',
    glassShadow: 'rgba(0, 0, 0, 0.5)',
    
    textPrimary: '#F8FAFC',
    textSecondary: '#E2E8F0',
    textMuted: '#C4B5FD',
    
    backgroundPrimary: '#0F0F23',
    backgroundSecondary: '#1E1B4B',
    backgroundTertiary: '#312E81',
    
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#8B5CF6',
  }
};

const animeColorPalette: ColorPalette = {
  id: 'animeTheme',
  name: 'Anime Vibes',
  description: 'Vibrant pinks and soft pastels',
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
    
    glassBackground: 'rgba(244, 114, 182, 0.12)',
    glassBorder: 'rgba(255, 255, 255, 0.3)',
    glassHighlight: 'rgba(255, 255, 255, 0.2)',
    glassShadow: 'rgba(0, 0, 0, 0.3)',
    
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
};

const sunsetColorPalette: ColorPalette = {
  id: 'sunsetTheme',
  name: 'Sunset Dreams',
  description: 'Warm oranges and golden hour vibes',
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
    
    glassBackground: 'rgba(249, 115, 22, 0.15)',
    glassBorder: 'rgba(255, 255, 255, 0.3)',
    glassHighlight: 'rgba(255, 255, 255, 0.2)',
    glassShadow: 'rgba(0, 0, 0, 0.35)',
    
    textPrimary: '#FFFBEB',
    textSecondary: '#FEF3C7',
    textMuted: '#FDE68A',
    
    backgroundPrimary: '#1C1917',
    backgroundSecondary: '#292524',
    backgroundTertiary: '#44403C',
    
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  }
};

const oceanColorPalette: ColorPalette = {
  id: 'oceanTheme',
  name: 'Ocean Depths',
  description: 'Deep blues and aqua waves',
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
    
    glassBackground: 'rgba(14, 165, 233, 0.15)',
    glassBorder: 'rgba(255, 255, 255, 0.3)',
    glassHighlight: 'rgba(255, 255, 255, 0.2)',
    glassShadow: 'rgba(0, 0, 0, 0.4)',
    
    textPrimary: '#F0F9FF',
    textSecondary: '#E0F2FE',
    textMuted: '#7DD3FC',
    
    backgroundPrimary: '#0C1426',
    backgroundSecondary: '#1E293B',
    backgroundTertiary: '#334155',
    
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#0EA5E9',
  }
};

const cyberpunkColorPalette: ColorPalette = {
  id: 'cyberpunkTheme',
  name: 'Cyberpunk 2077',
  description: 'Neon lights and electric dreams',
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
    
    glassBackground: 'rgba(0, 217, 255, 0.12)',
    glassBorder: 'rgba(0, 217, 255, 0.4)',
    glassHighlight: 'rgba(255, 255, 255, 0.15)',
    glassShadow: 'rgba(0, 0, 0, 0.6)',
    
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
};

const knightColorPalette: ColorPalette = {
  id: 'knightTheme',
  name: 'Medieval Knight',
  description: 'Noble silvers and royal blues',
  colors: {
    primary: '#475569',
    primaryLight: '#64748B',
    primaryDark: '#334155',
    
    secondary: '#3B82F6',
    secondaryLight: '#60A5FA',
    secondaryDark: '#2563EB',
    
    accent: '#F59E0B',
    accentLight: '#FBBF24',
    accentDark: '#D97706',
    
    glassBackground: 'rgba(71, 85, 105, 0.15)',
    glassBorder: 'rgba(255, 255, 255, 0.35)',
    glassHighlight: 'rgba(255, 255, 255, 0.25)',
    glassShadow: 'rgba(0, 0, 0, 0.4)',
    
    textPrimary: '#F8FAFC',
    textSecondary: '#E2E8F0',
    textMuted: '#CBD5E1',
    
    backgroundPrimary: '#0F172A',
    backgroundSecondary: '#1E293B',
    backgroundTertiary: '#334155',
    
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  }
};

// Glass configurations for different themes
const intensiveGlass: GlassThemeConfig = {
  blurIntensity: 20,
  opacity: 0.15,
  borderOpacity: 0.35,
  shadowIntensity: 0.45,
  borderRadius: 18,
  saturation: 2.2,
  brightness: 1.2,
  contrast: 1.3,
};

const moderateGlass: GlassThemeConfig = {
  blurIntensity: 14,
  opacity: 0.12,
  borderOpacity: 0.25,
  shadowIntensity: 0.35,
  borderRadius: 16,
  saturation: 1.8,
  brightness: 1.1,
  contrast: 1.2,
};

const subtleGlass: GlassThemeConfig = {
  blurIntensity: 10,
  opacity: 0.08,
  borderOpacity: 0.2,
  shadowIntensity: 0.25,
  borderRadius: 14,
  saturation: 1.5,
  brightness: 1.05,
  contrast: 1.1,
};

const minimalGlass: GlassThemeConfig = {
  blurIntensity: 6,
  opacity: 0.05,
  borderOpacity: 0.15,
  shadowIntensity: 0.15,
  borderRadius: 12,
  saturation: 1.3,
  brightness: 1.02,
  contrast: 1.05,
};

// Pre-built themes combining wallpapers, colors, and glass effects
export const prebuiltThemes: PrebuiltTheme[] = [
  {
    id: 'nature',
    name: 'Nature Harmony',
    description: 'Peaceful forest vibes with fresh green tones',
    category: 'nature',
    wallpaper: '/wallpapers/nature.jpg',
    colorPalette: natureColorPalette,
    glassConfig: moderateGlass,
  },
  {
    id: 'rdr',
    name: 'Wild West',
    description: 'Red Dead Redemption inspired frontier theme',
    category: 'gaming',
    wallpaper: '/wallpapers/RDR.png',
    colorPalette: rdrColorPalette,
    glassConfig: intensiveGlass,
  },
  {
    id: 'arcane',
    name: 'Arcane Magic',
    description: 'Mystical and magical with vibrant purples',
    category: 'gaming',
    wallpaper: '/wallpapers/arcane.png',
    colorPalette: arcaneColorPalette,
    glassConfig: intensiveGlass,
  },
  {
    id: 'anime',
    name: 'Anime Dreams',
    description: 'Soft pastels and vibrant anime aesthetics',
    category: 'anime',
    wallpaper: '/wallpapers/anime.jpeg',
    colorPalette: animeColorPalette,
    glassConfig: subtleGlass,
  },
  {
    id: 'animeCat',
    name: 'Kawaii Cat',
    description: 'Cute anime cat with playful colors',
    category: 'anime',
    wallpaper: '/wallpapers/anime_cat.jpg',
    colorPalette: animeColorPalette,
    glassConfig: subtleGlass,
  },
  {
    id: 'animeGirl',
    name: 'Anime Portrait',
    description: 'Beautiful anime character with soft tones',
    category: 'anime',
    wallpaper: '/wallpapers/anime_girl.jpg',
    colorPalette: animeColorPalette,
    glassConfig: subtleGlass,
  },
  {
    id: 'sunset',
    name: 'Golden Sunset',
    description: 'Warm sunset colors with golden hour magic',
    category: 'nature',
    wallpaper: '/wallpapers/sunset.jpg',
    colorPalette: sunsetColorPalette,
    glassConfig: moderateGlass,
  },
  {
    id: 'heaven',
    name: 'Heavenly Clouds',
    description: 'Ethereal sky with divine lighting',
    category: 'cartoon',
    wallpaper: '/wallpapers/heaven.jpg',
    colorPalette: oceanColorPalette,
    glassConfig: subtleGlass,
  },
  {
    id: 'knight',
    name: 'Medieval Knight',
    description: 'Noble warrior with metallic tones',
    category: 'gaming',
    wallpaper: '/wallpapers/knight.jpg',
    colorPalette: knightColorPalette,
    glassConfig: intensiveGlass,
  },
  {
    id: 'tea',
    name: 'Zen Tea',
    description: 'Peaceful tea ceremony with warm earth tones',
    category: 'vintage',
    wallpaper: '/wallpapers/tea.jpg',
    colorPalette: sunsetColorPalette,
    glassConfig: minimalGlass,
  },
  {
    id: 'shiraz',
    name: 'Persian Garden',
    description: 'Beautiful Shiraz architecture with cultural vibes',
    category: 'vintage',
    wallpaper: '/wallpapers/shiraz1.jpg',
    colorPalette: sunsetColorPalette,
    glassConfig: moderateGlass,
  },
  {
    id: 'onePiece2',
    name: 'One Piece 2',
    description: 'One Piece anime wallpaper featuring epic adventure scenes',
    category: 'anime',
    wallpaper: '/wallpapers/one_piece2.jpg',
    colorPalette: animeColorPalette,
    glassConfig: subtleGlass,
  },
  {
    id: 'onePieceAnime',
    name: 'One Piece Anime',
    description: 'One Piece anime wallpaper featuring Luffy and friends',
    category: 'anime',
    wallpaper: '/wallpapers/one_piece_anime.jpeg',
    colorPalette: animeColorPalette,
    glassConfig: subtleGlass,
  },
  {
    id: 'narutoAnime',
    name: 'Naruto Anime',
    description: 'Naruto anime wallpaper featuring popular ninja scenes',
    category: 'anime',
    wallpaper: '/wallpapers/naruto_anime.jpeg',
    colorPalette: animeColorPalette,
    glassConfig: subtleGlass,
  },
  {
    id: 'gamingFire',
    name: 'Gaming Fire',
    description: 'Gaming-themed wallpaper with fiery visuals',
    category: 'gaming',
    wallpaper: '/wallpapers/gaming_fire.jpg',
    colorPalette: rdrColorPalette,
    glassConfig: intensiveGlass,
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Vibes',
    description: 'Cyberpunk-themed neon wallpaper',
    category: 'cyberpunk',
    wallpaper: '/wallpapers/cyberpunk.jpg',
    colorPalette: cyberpunkColorPalette,
    glassConfig: intensiveGlass,
  },
  {
    id: 'winterSnowflakes',
    name: 'Winter Snowflakes',
    description: 'Cool winter snowflake pattern wallpaper',
    category: 'nature',
    wallpaper: '/wallpapers/winter_snowflakes.jpg',
    colorPalette: natureColorPalette,
    glassConfig: moderateGlass,
  },
  {
    id: 'berry',
    name: 'Berry Delight',
    description: 'Vibrant berry-themed wallpaper',
    category: 'nature',
    wallpaper: '/wallpapers/berry.jpg',
    colorPalette: natureColorPalette,
    glassConfig: moderateGlass,
  },
  {
    id: 'persianCarpet',
    name: 'Persian Carpet',
    description: 'Elegant Persian carpet pattern wallpaper',
    category: 'vintage',
    wallpaper: '/wallpapers/persian_carpet.jpg',
    colorPalette: sunsetColorPalette,
    glassConfig: moderateGlass,
  },
  {
    id: 'shirazWine',
    name: 'Shiraz Wine',
    description: 'Stylish Shiraz wine-themed wallpaper',
    category: 'vintage',
    wallpaper: '/wallpapers/shiraz_wine.jpg',
    colorPalette: sunsetColorPalette,
    glassConfig: moderateGlass,
  },
  {
    id: 'wallECartoon',
    name: 'Wall-E Cartoon',
    description: 'Wall-E cartoon wallpaper featuring charming robot scenes',
    category: 'cartoon',
    wallpaper: '/wallpapers/wall-e-cartoon.jpg',
    colorPalette: animeColorPalette,
    glassConfig: subtleGlass,
  },
  {
    id: 'spongebobCartoon',
    name: 'Spongebob Cartoon',
    description: 'Spongebob Squarepants cartoon wallpaper',
    category: 'cartoon',
    wallpaper: '/wallpapers/spongebob_cartoon.jpg',
    colorPalette: animeColorPalette,
    glassConfig: subtleGlass,
  },
  {
    id: 'dreamcoreMinimal',
    name: 'Dreamcore Minimal',
    description: 'Dreamcore minimalistic pastel wallpaper',
    category: 'minimal',
    wallpaper: '/wallpapers/dreamcore_minimal.jpg',
    colorPalette: sunsetColorPalette,
    glassConfig: minimalGlass,
  },
  {
    id: 'aestheticMinimal',
    name: 'Aesthetic Minimal',
    description: 'Aesthetic minimal wallpaper with soft tones',
    category: 'minimal',
    wallpaper: '/wallpapers/aesthetic_minimal.jpg',
    colorPalette: sunsetColorPalette,
    glassConfig: minimalGlass,
  },
  {
    id: 'pastelCloudsMinimal',
    name: 'Pastel Clouds',
    description: 'Pastel clouds minimalistic wallpaper',
    category: 'minimal',
    wallpaper: '/wallpapers/pastel_clouds_minimal.jpg',
    colorPalette: sunsetColorPalette,
    glassConfig: minimalGlass,
  },
];

// Helper functions
export const getPrebuiltTheme = (id: string): PrebuiltTheme | undefined => {
  return prebuiltThemes.find(theme => theme.id === id);
};

export const getThemesByCategory = (category: PrebuiltTheme['category']): PrebuiltTheme[] => {
  return prebuiltThemes.filter(theme => theme.category === category);
};

export const getAllCategories = (): PrebuiltTheme['category'][] => {
  return Array.from(new Set(prebuiltThemes.map(theme => theme.category)));
};

export const applyPrebuiltTheme = (themeId: string): PrebuiltTheme | null => {
  const theme = getPrebuiltTheme(themeId);
  if (!theme) return null;
  
  // Store the applied theme
  localStorage.setItem('selectedPrebuiltTheme', themeId);
  
  return theme;
};

export const getStoredPrebuiltTheme = (): string | null => {
  return localStorage.getItem('selectedPrebuiltTheme');
}; 