import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, IconButton, Paper, Tooltip, Button } from '@mui/material';
import { Add as AddIcon, DeleteOutline as DeleteIcon, Edit as EditIcon, Check as CheckIcon, DragIndicator as DragIndicatorIcon } from '@mui/icons-material';
import type { QuickLink } from '../types';
import { CacheAnalytics } from '../utils/CacheAnalytics';

// Image cache with expiration (7 days)
class ImageCache {
  private static readonly CACHE_KEY = 'quicklinks_image_cache';
  private static readonly CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

  static async get(url: string): Promise<string | null> {
    try {
      const cache = localStorage.getItem(this.CACHE_KEY);
      if (!cache) return null;

      const cacheData = JSON.parse(cache);
      const item = cacheData[url];
      
      if (!item) return null;
      
      // Check if cache is expired
      if (Date.now() - item.timestamp > this.CACHE_EXPIRY) {
        this.remove(url);
        return null;
      }
      
      return item.data;
    } catch (error) {
      console.warn('Error reading image cache:', error);
      return null;
    }
  }

  static async set(url: string, data: string): Promise<void> {
    try {
      const cache = localStorage.getItem(this.CACHE_KEY);
      const cacheData = cache ? JSON.parse(cache) : {};
      
      cacheData[url] = {
        data,
        timestamp: Date.now()
      };
      
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Error writing to image cache:', error);
    }
  }

  static remove(url: string): void {
    try {
      const cache = localStorage.getItem(this.CACHE_KEY);
      if (!cache) return;

      const cacheData = JSON.parse(cache);
      delete cacheData[url];
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Error removing from image cache:', error);
    }
  }

  static clear(): void {
    try {
      localStorage.removeItem(this.CACHE_KEY);
    } catch (error) {
      console.warn('Error clearing image cache:', error);
    }
  }
}

interface QuickLinksProps {
  links: QuickLink[];
  setLinks: React.Dispatch<React.SetStateAction<QuickLink[]>>;
  onShowAddForm: () => void;
  openInNewTab?: boolean;
}

const LocalIcon: React.FC<{ url: string; fallbackIcon: string }> = ({ url, fallbackIcon }) => {
  const [iconSrc, setIconSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const loadIcon = async () => {
      setIsLoading(true);
      setHasError(false);

      // Check cache first
      const cachedIcon = await ImageCache.get(url);
      if (cachedIcon) {
        CacheAnalytics.trackCacheHit('quicklinks', 'image');
        setIconSrc(cachedIcon);
        setIsLoading(false);
        return;
      }
      
      CacheAnalytics.trackCacheMiss('quicklinks', 'image');

      // Try to load the icon
      try {
        const response = await fetch(url);
        if (response.ok) {
          const blob = await response.blob();
          const reader = new FileReader();
          reader.onload = async () => {
            const base64Data = reader.result as string;
            setIconSrc(base64Data);
            // Cache the successful result
            await ImageCache.set(url, base64Data);
            setIsLoading(false);
          };
          reader.readAsDataURL(blob);
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        console.warn(`Failed to load icon from ${url}:`, error);
        setHasError(true);
        setIconSrc(fallbackIcon);
        setIsLoading(false);
      }
    };

    if (url) {
      loadIcon();
    } else {
      setIconSrc(fallbackIcon);
      setIsLoading(false);
    }
  }, [url, fallbackIcon]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setIconSrc(fallbackIcon);
    }
  };

  return (
    <img
      src={iconSrc || fallbackIcon}
      alt="Site icon"
      onError={handleError}
      style={{
        width: '32px',
        height: '32px',
        borderRadius: '6px',
        objectFit: 'cover',
        opacity: isLoading ? 0.5 : 1,
        transition: 'opacity 0.2s ease'
      }}
    />
  );
};

const QuickLinks: React.FC<QuickLinksProps> = ({ links, setLinks, onShowAddForm, openInNewTab = true }) => {
  const [editMode, setEditMode] = useState(false);
  const [draggedItem, setDraggedItem] = useState<QuickLink | null>(null);
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const dragThreshold = 5; // pixels to move before starting drag
  
  // Preload all icons on component mount
  useEffect(() => {
    const preloadIcons = async () => {
      const preloadPromises = links.map(async (link) => {
        if (link.icon && typeof link.icon === 'string' && !await ImageCache.get(link.icon)) {
          try {
            const response = await fetch(link.icon);
            if (response.ok) {
              const blob = await response.blob();
              const reader = new FileReader();
              reader.onload = async () => {
                const base64Data = reader.result as string;
                await ImageCache.set(link.icon!, base64Data);
              };
              reader.readAsDataURL(blob);
            }
          } catch (error) {
            console.warn(`Failed to preload icon for ${link.title}:`, error);
          }
        }
      });
      
      await Promise.all(preloadPromises);
    };

    preloadIcons();
  }, [links]);
  
  const deleteLink = (id: number) => {
    setLinks(prevLinks => prevLinks.filter(link => link.id !== id));
  };

  // Drag and drop handlers
  const handleMouseDown = (e: React.MouseEvent, link: QuickLink) => {
    if (!editMode) return;
    e.preventDefault();
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    setDraggedItem(link);
  };

  const handleTouchStart = (e: React.TouchEvent, link: QuickLink) => {
    if (!editMode) return;
    e.preventDefault();
    const touch = e.touches[0];
    dragStartPos.current = { x: touch.clientX, y: touch.clientY };
    setDraggedItem(link);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedItem || !dragStartPos.current || !editMode) return;
    
    const deltaX = Math.abs(e.clientX - dragStartPos.current.x);
    const deltaY = Math.abs(e.clientY - dragStartPos.current.y);
    
    if (!isDragging && (deltaX > dragThreshold || deltaY > dragThreshold)) {
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!draggedItem || !dragStartPos.current || !editMode) return;
    
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - dragStartPos.current.x);
    const deltaY = Math.abs(touch.clientY - dragStartPos.current.y);
    
    if (!isDragging && (deltaX > dragThreshold || deltaY > dragThreshold)) {
      setIsDragging(true);
    }
  };

  const handleMouseUp = () => {
    if (draggedItem && draggedOverIndex !== null && isDragging && editMode) {
      reorderLinks(draggedItem, draggedOverIndex);
    }
    resetDragState();
  };

  const handleTouchEnd = () => {
    if (draggedItem && draggedOverIndex !== null && isDragging && editMode) {
      reorderLinks(draggedItem, draggedOverIndex);
    }
    resetDragState();
  };

  const resetDragState = () => {
    setDraggedItem(null);
    setDraggedOverIndex(null);
    setIsDragging(false);
    dragStartPos.current = null;
  };

  const handleDragOver = (index: number) => {
    if (!isDragging || !editMode) return;
    setDraggedOverIndex(index);
  };

  const reorderLinks = (draggedLink: QuickLink, targetIndex: number) => {
    const currentIndex = links.findIndex(link => link.id === draggedLink.id);
    if (currentIndex === -1 || currentIndex === targetIndex) return;

    const newLinks = [...links];
    const [removed] = newLinks.splice(currentIndex, 1);
    newLinks.splice(targetIndex, 0, removed);
    setLinks(newLinks);
  };

  // Function to render the icon bubble content (custom local icon, fallback URL, or emoji)
  const renderIconContent = (link: QuickLink) => {
    const icon = link.icon ?? '';
    const isEmoji = icon.length <= 2 && !(icon.startsWith('http') || icon.startsWith('data:image'));
    if (!isEmoji) {
      // Try local custom icons from public/quicklinkicons, fallback to provided icon URL
      return (
        <LocalIcon
          url={link.url}
          fallbackIcon={icon.startsWith('http') || icon.startsWith('data:image') ? icon : ''}
        />
      );
    }
    // Emoji or text icon
    return (
      <Typography
        variant="h6"
        sx={{
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '1.5rem',
          fontFamily: '"Segoe UI Emoji", "Segoe UI Symbol", "Apple Color Emoji", "Noto Color Emoji", sans-serif'
        }}
      >
        {icon}
      </Typography>
    );
  };

  return (
    <Paper 
      elevation={0} 
      className="glass glass-holographic glass-glow" 
      sx={{ 
        py: 2, 
        px: 2,
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',

      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={resetDragState}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <Tooltip title={editMode ? "Done editing" : "Edit quick links"}>
        <IconButton 
          onClick={() => setEditMode(!editMode)}
          size="small"
          sx={{
            position: 'absolute',
            top: 4,
            right: 4,
            bgcolor: editMode ? 'rgba(76, 175, 80, 0.15)' : 'rgba(255, 255, 255, 0.08)',
            color: editMode ? 'rgba(76, 175, 80, 0.9)' : 'rgba(255, 255, 255, 0.5)',
            '&:hover': {
              bgcolor: editMode ? 'rgba(76, 175, 80, 0.25)' : 'rgba(255, 255, 255, 0.15)',
            },
            transition: 'all 0.2s ease-out',
            width: 16,
            height: 16,
            padding: '2px',
            minWidth: '16px',
            minHeight: '16px',
          }}
        >
          {editMode ? <CheckIcon sx={{ fontSize: 12 }} /> : <EditIcon sx={{ fontSize: 12 }} />}
        </IconButton>
      </Tooltip>

      {editMode && (
        <Typography
          variant="caption"
          sx={{
            position: 'absolute',
            top: -8,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(76, 175, 80, 0.8)',
            color: 'white',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '0.7rem',
            whiteSpace: 'nowrap',
            zIndex: 10,
          }}
        >
          Drag to reorder
        </Typography>
      )}

      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'nowrap', 
        gap: 1.5, 
        overflowX: 'auto', 
        width: '100%',
        justifyContent: 'center',
        py: 1.5,
        pb: 0.5,
        '::-webkit-scrollbar': {
          height: '4px',
        },
        '::-webkit-scrollbar-track': {
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '10px',
        },
        '::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          borderRadius: '10px',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.25)',
          },
        },
      }}>
        {links.map((link: QuickLink, index: number) => {
          const isFavicon = link.icon && (link.icon.startsWith('http') || link.icon.startsWith('data:image'));
          const isEmoji = link.icon && link.icon.length <= 2 && !isFavicon;
          const bubbleBgColor = isFavicon
            ? 'rgba(255, 255, 255, 0.1)' // More translucent for favicons to blend better
            : (link.color || 'rgba(255, 255, 255, 0.15)'); // Slightly more opaque base for colored/emoji
          
          const isBeingDragged = draggedItem?.id === link.id && isDragging;
          const isDropTarget = draggedOverIndex === index && isDragging && draggedItem?.id !== link.id;

          return (
            <Box 
              key={link.id} 
              sx={{ 
                position: 'relative',
                transform: isBeingDragged ? 'scale(1.1) rotate(5deg)' : 'none',
                opacity: isBeingDragged ? 0.8 : 1,
                zIndex: isBeingDragged ? 1000 : 1,
                transition: isDragging ? 'none' : 'all 0.2s ease-out',
                '&::before': isDropTarget ? {
                  content: '""',
                  position: 'absolute',
                  left: -8,
                  top: 0,
                  bottom: 0,
                  width: 3,
                  backgroundColor: 'rgba(76, 175, 80, 0.8)',
                  borderRadius: '2px',
                  zIndex: 10,
                } : {},
              }}
              onMouseEnter={() => handleDragOver(index)}
            >
              {editMode && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -8,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'rgba(15, 15, 20, 0.8)',
                    color: 'white',
                    borderRadius: '50%',
                    width: 16,
                    height: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'grab',
                    zIndex: 10,
                    '&:active': {
                      cursor: 'grabbing',
                    },
                  }}
                  onMouseDown={(e) => handleMouseDown(e, link)}
                  onTouchStart={(e) => handleTouchStart(e, link)}
                >
                  <DragIndicatorIcon sx={{ fontSize: 10 }} />
                </Box>
              )}
              
              <Tooltip title={link.title} placement="bottom">
                <Box
                  component="a"
                  href={link.url}
                  rel="noopener noreferrer"
                  target={openInNewTab ? '_blank' : '_self'}
                  sx={{
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                    width: 52,
                    height: 52,
                    borderRadius: 'var(--radius-md)',
                    bgcolor: isBeingDragged ? 'rgba(255, 255, 255, 0.25)' : bubbleBgColor,
                    backdropFilter: 'blur(6px) saturate(120%)', // Enhanced glass effect
                WebkitBackdropFilter: 'blur(6px) saturate(120%)',
                    transition: 'transform 0.2s ease-out, background-color 0.2s ease-out, box-shadow 0.2s ease-out, border-color 0.2s ease-out',
                    overflow: 'hidden',
                    border: isFavicon ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(255, 255, 255, 0.2)', // Subtle border for all
                    position: 'relative',
                    padding: 0,
                    pointerEvents: editMode && isDragging ? 'none' : 'auto',
                    boxShadow: editMode ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.1)', // Softer shadow + inner highlight
                    '&:hover .delete-button': {
                      opacity: editMode ? 1 : 0.8,
                    },
                    '&:hover': {
                      transform: editMode ? 'none' : 'scale(1.08)',
                      boxShadow: editMode ? 'none' : '0 5px 15px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.2)',
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      backgroundColor: isFavicon ? 'rgba(255, 255, 255, 0.2)' : (link.color || 'rgba(255, 255, 255, 0.25)'),
                    },
                    // Add extra styling for emoji icons to improve rendering
                    ...(isEmoji && {
                      fontFamily: '"Segoe UI Emoji", "Segoe UI Symbol", "Apple Color Emoji", "Noto Color Emoji", sans-serif',
                      fontSize: '1.5rem',
                    })
                  }}
                >
                  {renderIconContent(link)}
                </Box>
              </Tooltip>
              <IconButton
                className="delete-button"
                size="small"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  deleteLink(link.id);
                }}
                aria-label={`Delete ${link.title}`}
                sx={{
                  position: 'absolute',
                  top: -5,
                  right: -5,
                  bgcolor: 'rgba(255, 82, 82, 0.85)',
                  color: 'white',
                  opacity: editMode ? 1 : 0,
                  transition: 'opacity 0.2s ease-in-out',
                  width: 18,
                  height: 18,
                  '&:hover': {
                    bgcolor: 'rgba(255, 82, 82, 1)',
                  }
                }}
              >
                <DeleteIcon sx={{ fontSize: '12px' }} />
              </IconButton>
            </Box>
          );
        })}

        {links.length < 12 && (
          <Tooltip title="Add new link" placement="bottom">
            <IconButton
              onClick={onShowAddForm}
              aria-label="Add new quick link"
              sx={{
                width: 52,
                height: 52,
                borderRadius: 'var(--radius-md)',
                bgcolor: 'rgba(255, 255, 255, 0.1)', // Consistent with icon style
                backdropFilter: 'blur(6px) saturate(120%)',
                WebkitBackdropFilter: 'blur(6px) saturate(120%)',
                color: 'var(--text-light)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
                transition: 'transform 0.2s ease-out, background-color 0.2s ease-out, box-shadow 0.2s ease-out, border-color 0.2s ease-out',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  transform: 'scale(1.08)',
                  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.2)',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                }
              }}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Paper>
  );
};

export default QuickLinks; 