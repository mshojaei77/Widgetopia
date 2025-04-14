import React from 'react';
import { Box, Typography, IconButton, Paper, Tooltip } from '@mui/material';
import { Add as AddIcon, DeleteOutline as DeleteIcon } from '@mui/icons-material';
import type { QuickLink } from '../types';

interface QuickLinksProps {
  links: QuickLink[];
  setLinks: React.Dispatch<React.SetStateAction<QuickLink[]>>;
  onShowAddForm: () => void;
}

const QuickLinks: React.FC<QuickLinksProps> = ({ links, setLinks, onShowAddForm }) => {
  
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
          style={{ width: '24px', height: '24px', objectFit: 'contain' }}
        />
      );
    }
    // Render first character (or emoji) if not a favicon URL
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
        p: 2, 
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <Typography variant="h6" component="h2" sx={{ mr: 2, flexShrink: 0 }}>
        Quick Links
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: 1.5, overflowX: 'auto' }}>
        {links.map((link: QuickLink) => {
          const isFavicon = link.icon && (link.icon.startsWith('http') || link.icon.startsWith('data:image'));
          const bubbleBgColor = isFavicon ? 'rgba(255, 255, 255, 0.9)' : (link.color || 'rgba(255, 255, 255, 0.2)');

          return (
            <Box key={link.id} sx={{ position: 'relative' }}>
              <Tooltip title={link.title} placement="bottom">
                <Box
                  component="a"
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                    width: 48,
                    height: 48,
                    borderRadius: 'var(--radius-md)',
                    bgcolor: bubbleBgColor,
                    transition: 'transform 0.2s ease-out, background-color 0.2s ease-out',
                    overflow: 'hidden',
                    border: isFavicon ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255, 255, 255, 0.1)',
                    position: 'relative',
                    '&:hover .delete-button': {
                      opacity: 1,
                    },
                    '&:hover': {
                      transform: 'scale(1.08)'
                    }
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
                  opacity: 0,
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
                width: 48,
                height: 48,
                borderRadius: 'var(--radius-md)',
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                color: 'var(--text-light)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'transform 0.2s ease-out, background-color 0.2s ease-out',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.25)',
                  transform: 'scale(1.08)'
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