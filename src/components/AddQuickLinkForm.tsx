import React, { useState } from 'react';
import { Modal, Box, TextField, Button, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { QuickLink } from '../types';

interface AddQuickLinkFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLink: (link: Omit<QuickLink, 'id'>) => void;
}

const AddQuickLinkForm: React.FC<AddQuickLinkFormProps> = ({ isOpen, onClose, onAddLink }) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [icon, setIcon] = useState('');
  const [color, setColor] = useState('#757575'); // Default color

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (title && url) {
      onAddLink({ title, url, icon, color });
      // Reset form
      setTitle('');
      setUrl('');
      setIcon('');
      setColor('#757575');
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="add-quicklink-modal-title"
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Box 
        component="form" 
        onSubmit={handleSubmit} 
        className="glass" // Apply glass style
        sx={{ 
          p: 3, 
          width: 400, 
          maxWidth: '90%', 
          borderRadius: 'var(--radius-lg)', 
          outline: 'none',
          position: 'relative' 
        }}
      >
        <IconButton 
            aria-label="close"
            onClick={onClose}
            sx={{ position: 'absolute', top: 8, right: 8 }}
        >
            <CloseIcon />
        </IconButton>
        <Typography id="add-quicklink-modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
          Add Quick Link
        </Typography>
        <TextField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          required
          margin="normal"
          size="small"
        />
        <TextField
          label="URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          fullWidth
          required
          margin="normal"
          type="url"
          size="small"
        />
        <TextField
          label="Icon (URL or Initial/Emoji)"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          fullWidth
          margin="normal"
          size="small"
          helperText="Optional. Leave blank to use first letter of title."
        />
         {/* Optional: Add color picker if needed */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onClose} sx={{ mr: 1, color: 'var(--text-light)' }}>Cancel</Button>
          <Button type="submit" variant="contained" sx={{ bgcolor: 'var(--primary-color)'}}>
            Add Link
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AddQuickLinkForm; 