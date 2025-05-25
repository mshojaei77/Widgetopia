import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, IconButton, Paper, Tooltip, Button } from '@mui/material';
import { Add as AddIcon, DeleteOutline as DeleteIcon, Edit as EditIcon, Check as CheckIcon, DragIndicator as DragIndicatorIcon } from '@mui/icons-material';
import type { QuickLink } from '../types';

interface QuickLinksProps {
  links: QuickLink[];
  setLinks: React.Dispatch<React.SetStateAction<QuickLink[]>>;
  onShowAddForm: () => void;
  openInNewTab?: boolean;
}

const STORAGE_KEY = 'widgetopia_quick_links';

const LocalIcon: React.FC<{ url: string; fallbackIcon: string }> = ({ url, fallbackIcon }) => {
  const [srcList] = React.useState(() => {
    try {
      const domain = new URL(url).hostname.replace(/^www\./i, '').toLowerCase();
      const extensions = ['webp', 'png', 'svg', 'ico', 'jpg', 'jpeg'];
      return extensions.map(ext => `/quicklinkicons/${domain}.${ext}`).concat(fallbackIcon);
    } catch {
      return [fallbackIcon];
    }
  });
  const [idx, setIdx] = React.useState(0);
  const handleError = () => {
    if (idx < srcList.length - 1) {
      setIdx(idx + 1);
    }
  };
  return (
    <img
      src={srcList[idx]}
      alt=""
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      onError={handleError}
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
  
  // Load links from localStorage on component mount
  useEffect(() => {
    const storedLinks = localStorage.getItem(STORAGE_KEY);
    if (storedLinks) {
      try {
        const parsedLinks = JSON.parse(storedLinks);
        if (Array.isArray(parsedLinks) && parsedLinks.length > 0) {
          setLinks(parsedLinks);
        }
      } catch (error) {
        console.error('Failed to parse stored quick links:', error);
      }
    }
  }, [setLinks]);

  // Save links to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
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
      className="glass" 
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
            ? 'rgba(255, 255, 255, 0.9)' 
            : (link.color || 'rgba(255, 255, 255, 0.2)');
          
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
                    bgcolor: bubbleBgColor,
                    transition: 'transform 0.2s ease-out, background-color 0.2s ease-out, box-shadow 0.2s ease-out',
                    overflow: 'hidden',
                    border: isFavicon ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                    position: 'relative',
                    padding: 0,
                    pointerEvents: editMode && isDragging ? 'none' : 'auto',
                    '&:hover .delete-button': {
                      opacity: editMode ? 1 : 0.8,
                    },
                    '&:hover': {
                      transform: editMode ? 'none' : 'scale(1.08)',
                      boxShadow: editMode ? 'none' : '0 4px 10px rgba(0, 0, 0, 0.2)'
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
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                color: 'var(--text-light)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'transform 0.2s ease-out, background-color 0.2s ease-out, box-shadow 0.2s ease-out',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.25)',
                  transform: 'scale(1.08)',
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)'
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