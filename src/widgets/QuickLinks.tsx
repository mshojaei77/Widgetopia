import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Paper, Tooltip, Button } from '@mui/material';
import { Add as AddIcon, DeleteOutline as DeleteIcon, Edit as EditIcon, Check as CheckIcon } from '@mui/icons-material';
import type { QuickLink } from '../types';

interface QuickLinksProps {
  links: QuickLink[];
  setLinks: React.Dispatch<React.SetStateAction<QuickLink[]>>;
  onShowAddForm: () => void;
}

const STORAGE_KEY = 'widgetopia_quick_links';

const QuickLinks: React.FC<QuickLinksProps> = ({ links, setLinks, onShowAddForm }) => {
  const [editMode, setEditMode] = useState(false);
  
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

  // Function to render the icon bubble content (favicon or text)
  const renderIconContent = (link: QuickLink) => {
    const isFavicon = link.icon && (link.icon.startsWith('http') || link.icon.startsWith('data:image'));

    if (isFavicon) {
      return (
        <img
          src={link.icon}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      );
    }
    
    // If link.icon is an emoji or a short text, render it directly without modification
    if (link.icon && link.icon.length <= 2) {
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
          {link.icon}
        </Typography>
      );
    }
    
    // Fallback to first character of title
    return (
      <Typography variant="body1" sx={{ color: '#fff', fontWeight: 'bold' }}>
        {link.icon ? link.icon.charAt(0).toUpperCase() : link.title.charAt(0).toUpperCase()}
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
        {links.map((link: QuickLink) => {
          const isFavicon = link.icon && (link.icon.startsWith('http') || link.icon.startsWith('data:image'));
          const isEmoji = link.icon && link.icon.length <= 2 && !isFavicon;
          const bubbleBgColor = isFavicon 
            ? 'rgba(255, 255, 255, 0.9)' 
            : (link.color || 'rgba(255, 255, 255, 0.2)');

          return (
            <Box key={link.id} sx={{ position: 'relative' }}>
              <Tooltip title={link.title} placement="bottom">
                <Box
                  component="a"
                  href={link.url}
                  rel="noopener noreferrer"
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
                    '&:hover .delete-button': {
                      opacity: editMode ? 1 : 0.8,
                    },
                    '&:hover': {
                      transform: 'scale(1.08)',
                      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)'
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