import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import type { QuickLink } from '../types'; // Use shared type

// Removed: import './QuickLinks.css'; // Assuming styles are handled by MUI

interface QuickLinkFormProps {
  // Update onAdd to expect the QuickLink type (minus id)
  onAdd: (link: Omit<QuickLink, 'id'>) => void;
  onCancel: () => void;
}

const QuickLinkForm: React.FC<QuickLinkFormProps> = ({ onAdd, onCancel }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [siteInfo, setSiteInfo] = useState<{ title: string; favicon: string | null }>({ title: '', favicon: null });
  const [error, setError] = useState<string | null>(null);

  // Predefined colors (if needed for text icons)
  const iconColors = [
    '#3b82f6', '#10b981', '#ef4444', '#f59e0b',
    '#8b5cf6', '#ec4899', '#06b6d4', '#f97316',
  ];

  const extractTitle = (urlInput: string): string => {
    try {
      let formattedUrl = urlInput;
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = 'https://' + formattedUrl;
      }
      const domain = new URL(formattedUrl).hostname;
      const cleanDomain = domain.replace(/^www\./i, '');
      const firstPart = cleanDomain.split('.')[0];
      return firstPart.charAt(0).toUpperCase() + firstPart.slice(1);
    } catch {
      return urlInput; // Return original input if URL parsing fails
    }
  };

  useEffect(() => {
    // Initialize timer variable
    let debounceTimer: NodeJS.Timeout | null = null;

    const fetchSiteInfo = async () => {
      if (!url || !url.trim()) {
        setSiteInfo({ title: '', favicon: null });
        setError(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        let validUrl = url.trim();
        if (!/^https?:\/\//i.test(validUrl)) {
          validUrl = 'https://' + validUrl;
        }
        const domain = new URL(validUrl).hostname;
        const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

        // Basic check if faviconUrl returns a valid image (optional)
        // This is imperfect but can catch some direct errors
        try {
           const imgResponse = await fetch(faviconUrl);
           if (!imgResponse.ok || !imgResponse.headers.get('content-type')?.startsWith('image')) {
               throw new Error('Favicon not found or invalid');
           }
           setSiteInfo({ title: extractTitle(validUrl), favicon: faviconUrl });
        } catch (faviconError) {
            console.warn('Favicon fetch failed, using title fallback:', faviconError);
            setSiteInfo({ title: extractTitle(validUrl), favicon: null });
        }

      } catch (error) {
        console.error('Error parsing URL or fetching info:', error);
        setError('Invalid URL or could not fetch info.');
        setSiteInfo({ title: extractTitle(url), favicon: null }); // Use extracted title even on error
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce
    if (debounceTimer) {
       clearTimeout(debounceTimer);
    }
    if (url.trim()) {
        debounceTimer = setTimeout(fetchSiteInfo, 500);
    } else {
        // Clear info immediately if URL is empty
        setSiteInfo({ title: '', favicon: null });
        setError(null);
        setIsLoading(false);
    }

    // Cleanup function
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [url]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || isLoading) return;

    let validUrl = url.trim();
    if (!/^https?:\/\//i.test(validUrl)) {
      validUrl = 'https://' + validUrl;
    }

    const title = siteInfo.title || extractTitle(validUrl);
    const icon = siteInfo.favicon ? siteInfo.favicon : title.charAt(0).toUpperCase();
    const color = siteInfo.favicon ? undefined : iconColors[Math.floor(Math.random() * iconColors.length)];

    onAdd({ title, url: validUrl, icon, color });
  };

  // Render Preview Icon
  const renderPreviewIcon = () => {
    const previewSize = 56;
    const previewBorderRadius = '14px';

    if (isLoading) {
      return (
        <Box sx={{ width: previewSize, height: previewSize, borderRadius: previewBorderRadius, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'action.disabledBackground' }}>
          <CircularProgress size={24} color="inherit" />
        </Box>
      );
    }

    if (siteInfo.favicon) {
      return (
        <Box sx={{ width: previewSize, height: previewSize, borderRadius: previewBorderRadius, overflow: 'hidden', bgcolor: '#fff', border: '1px solid rgba(0,0,0,0.1)' }}>
          <img src={siteInfo.favicon} alt="Preview" style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain' }} />
        </Box>
      );
    }

    // Fallback to text icon
    const displayChar = siteInfo.title ? siteInfo.title.charAt(0).toUpperCase() : ' ';
    const bgColor = iconColors[0]; // Use a default color
    return (
      <Box sx={{ width: previewSize, height: previewSize, borderRadius: previewBorderRadius, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: bgColor, color: '#fff' }}>
        <Typography variant="h5">{displayChar}</Typography>
      </Box>
    );
  };

  return (
    // Use Paper directly, as the Modal provides the overlay and positioning
    <Paper component="form" onSubmit={handleSubmit} sx={{ p: 0, width: 400, maxWidth: '90%', overflow: 'hidden' }}>
      <DialogTitle sx={{ m: 0, p: 2, borderBottom: 1, borderColor: 'divider' }}>
        Add Quick Link
        <IconButton
          aria-label="close"
          onClick={onCancel}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Preview Section */}
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: 'action.hover' }}>
          {renderPreviewIcon()}
          <Typography variant="body2" sx={{ mt: 1 }}>
            {isLoading ? 'Loading...' : (siteInfo.title || 'Enter URL')}
          </Typography>
        </Box>

        {/* Fields Section */}
        <Box sx={{ p: 3 }}>
          <TextField
            fullWidth
            required
            autoFocus
            margin="dense"
            id="url"
            label="Website URL"
            type="text"
            variant="outlined"
            placeholder="e.g., google.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            error={!!error}
            helperText={isLoading ? 'Fetching website info...' : (error || 'Enter a URL to fetch details')}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={onCancel} color="inherit">
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          startIcon={<AddIcon />}
          disabled={isLoading || !url.trim() || !!error} // Disable if loading, no url, or error
        >
          {isLoading ? 'Loading...' : 'Add'}
        </Button>
      </DialogActions>
    </Paper>
  );
};

export default QuickLinkForm; 