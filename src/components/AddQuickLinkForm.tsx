import React, { useState, useEffect } from 'react';
import { Modal, Box, TextField, Button, Typography, IconButton, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import type { QuickLink } from '../types';

// Common emoji options for representing websites
const commonEmojis = ["📧", "🌐", "📱", "💬", "📝", "🔍", "📰", "🛒", "🎬", "🎵", "📚", "💻", "🏦", "📊", "📷", "🎮", "✈️", "🍔", "💼", "📅", "☁️", "📨", "🔐", "📺", "🏠", "💳", "🎓", "💰", "🏥", "🗂️"];

interface AddQuickLinkFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLink: (link: Omit<QuickLink, 'id'>) => void;
}

const AddQuickLinkForm: React.FC<AddQuickLinkFormProps> = ({ isOpen, onClose, onAddLink }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [siteInfo, setSiteInfo] = useState<{ title: string; favicon: string | null }>({ title: '', favicon: null });
  const [customEmoji, setCustomEmoji] = useState<string>('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Predefined colors for text icons
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

  // Returns prioritized favicon URLs, starting with high-quality sources
  const getLikelyFaviconUrl = (domain: string): string => {
    // We need to balance quality with reliability
    // Start with a larger Google Favicon size
    const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    console.log(`Using likely favicon URL: ${googleFaviconUrl}`);
    return googleFaviconUrl;
  };

  // Generate high-quality favicon sources for direct <img> use
  const getHighQualityIconUrl = (domain: string): string => {
    // Return Google's favicon service as the initial source - it's most reliable
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  };

  useEffect(() => {
    // Initialize timer variable
    let debounceTimer: NodeJS.Timeout | null = null;

    const fetchSiteInfo = async () => {
      if (!url || !url.trim()) {
        setSiteInfo({ title: '', favicon: null });
        setError(null);
        setIsLoading(false);
        setShowEmojiPicker(false);
        setCustomEmoji('');
        return;
      }

      setIsLoading(true);
      setError(null);
      setShowEmojiPicker(false);
      setCustomEmoji('');

      try {
        let validUrl = url.trim();
        if (!/^https?:\/\//i.test(validUrl)) {
          validUrl = 'https://' + validUrl;
        }
        
        const domain = new URL(validUrl).hostname;
        const extractedTitle = extractTitle(validUrl);
        console.log(`Getting favicon for domain: ${domain}`);
        
        // Try to get a high-quality icon URL first
        const highQualityFavicon = getHighQualityIconUrl(domain);
        
        // Set the title and the likely favicon URL.
        // The actual validation happens when the <img> tag tries to load it.
        setSiteInfo({ 
          title: extractedTitle, 
          favicon: highQualityFavicon  // Start with highest quality
        });

      } catch (error) {
        console.error('Error parsing URL:', error);
        setError('Invalid URL.');
        // Use extracted title even on error, set favicon to null
        setSiteInfo({ title: extractTitle(url), favicon: null }); 
        setShowEmojiPicker(true); // Show emoji picker on URL parse error
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
      setShowEmojiPicker(false);
      setCustomEmoji('');
    }

    // Cleanup function
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [url]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!url.trim() || isLoading) return;

    let validUrl = url.trim();
    if (!/^https?:\/\//i.test(validUrl)) {
      validUrl = 'https://' + validUrl;
    }

    const title = siteInfo.title || extractTitle(validUrl);
    
    // Use custom emoji if provided, otherwise fallback to favicon or first letter
    const icon = customEmoji 
      ? customEmoji 
      : (siteInfo.favicon ? siteInfo.favicon : title.charAt(0).toUpperCase());
    
    const color = (siteInfo.favicon || customEmoji) ? undefined : iconColors[Math.floor(Math.random() * iconColors.length)];

    onAddLink({ title, url: validUrl, icon, color });
    setUrl('');
    setSiteInfo({ title: '', favicon: null });
    setCustomEmoji('');
    setShowEmojiPicker(false);
  };

  const handleEmojiSelect = (emoji: string) => {
    setCustomEmoji(emoji);
  };

  // Render Preview Icon
  const renderPreviewIcon = () => {
    const previewSize = 56;
    const previewBorderRadius = '14px';

    if (isLoading) {
      return (
        <Box sx={{ width: previewSize, height: previewSize, borderRadius: previewBorderRadius, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(255, 255, 255, 0.1)' }}>
          <CircularProgress size={24} />
        </Box>
      );
    }

    // If custom emoji is selected, show it
    if (customEmoji) {
      return (
        <Box sx={{ width: previewSize, height: previewSize, borderRadius: previewBorderRadius, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: iconColors[Math.floor(Math.random() * iconColors.length)], color: '#fff' }}>
          <Typography variant="h4">{customEmoji}</Typography>
        </Box>
      );
    }

    if (siteInfo.favicon) {
      const domain = (() => {
        try {
          if (url && url.trim()) {
            let validUrl = url.trim();
            if (!/^https?:\/\//i.test(validUrl)) {
              validUrl = 'https://' + validUrl;
            }
            return new URL(validUrl).hostname;
          }
          return null;
        } catch {
          return null;
        }
      })();

      return (
        <Box sx={{ width: previewSize, height: previewSize, borderRadius: previewBorderRadius, overflow: 'hidden', bgcolor: '#fff', border: '1px solid rgba(0,0,0,0.1)' }}>
          <img 
            src={siteInfo.favicon} 
            alt="Preview" 
            style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain' }} 
            onError={(e) => {
              console.error("Image failed to load:", e);
              
              // If we have a domain, try fallback sources in order
              if (domain) {
                // Sources to try in priority order (after the first failure)
                const fallbackSources = [
                  `https://www.google.com/s2/favicons?domain=${domain}&sz=128`, // Google as reliable first fallback
                  `https://icons.duckduckgo.com/ip3/${domain}.ico`,  // DuckDuckGo as second reliable source
                  `https://${domain}/apple-touch-icon.png`,
                  `https://${domain}/apple-touch-icon-precomposed.png`,
                  `https://${domain}/favicon-196x196.png`,
                  `https://${domain}/favicon-192x192.png`, 
                  `https://${domain}/favicon-128x128.png`,
                  `https://${domain}/favicon-96x96.png`,
                  `https://${domain}/favicon.png`,
                  `https://${domain}/favicon.ico`
                ];

                // Find our current source in the list
                const currentSource = siteInfo.favicon;
                const currentIndex = fallbackSources.indexOf(currentSource || '');
                
                // If we have more fallbacks to try (or if current source isn't in the list)
                if (currentIndex === -1 || currentIndex < fallbackSources.length - 1) {
                  // Try the next one, or start from beginning if current source isn't in list
                  const nextIndex = currentIndex === -1 ? 0 : currentIndex + 1;
                  const nextSource = fallbackSources[nextIndex];
                  console.log(`Trying fallback favicon: ${nextSource}`);
                  setSiteInfo(prev => ({ ...prev, favicon: nextSource }));
                  return; // Don't show emoji picker yet, try next source
                }
              }
              
              // If no more fallbacks or no domain, show emoji picker
              setSiteInfo(prev => ({ ...prev, favicon: null }));
              setShowEmojiPicker(true);
            }}
          />
        </Box>
      );
    }

    // Fallback to text icon
    const displayChar = siteInfo.title ? siteInfo.title.charAt(0).toUpperCase() : ' ';
    const bgColor = iconColors[Math.floor(Math.random() * iconColors.length)]; // Random color
    return (
      <Box sx={{ width: previewSize, height: previewSize, borderRadius: previewBorderRadius, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: bgColor, color: '#fff' }}>
        <Typography variant="h5">{displayChar}</Typography>
      </Box>
    );
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
        className="glass" 
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

        {/* Preview Section */}
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
          {renderPreviewIcon()}
          <Typography variant="body2" sx={{ mt: 1 }}>
            {isLoading ? 'Loading...' : (siteInfo.title || 'Enter URL')}
          </Typography>
        </Box>

        <TextField
          label="Website URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          fullWidth
          required
          margin="normal"
          type="text"
          placeholder="e.g., google.com"
          size="small"
          error={!!error}
          helperText={isLoading ? 'Fetching website info...' : (error || 'Enter a URL to fetch details')}
        />

        {/* Emoji Selection - show when favicon isn't found */}
        {showEmojiPicker && !isLoading && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <EmojiEmotionsIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                No icon found. Choose an emoji or enter your own:
              </Typography>
            </Box>
            
            {/* Emoji selection grid */}
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 1, 
              mb: 2,
              maxHeight: '120px',
              overflowY: 'auto',
              p: 1,
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 1
            }}>
              {commonEmojis.map((emoji, index) => (
                <Button 
                  key={index}
                  sx={{ 
                    minWidth: '36px', 
                    height: '36px',
                    p: 0,
                    fontSize: '1.2rem',
                    bgcolor: customEmoji === emoji ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                  onClick={() => handleEmojiSelect(emoji)}
                >
                  {emoji}
                </Button>
              ))}
            </Box>
            
            {/* Custom emoji input */}
            <TextField
              label="Custom Emoji"
              value={customEmoji}
              onChange={(e) => setCustomEmoji(e.target.value)}
              placeholder="Enter emoji or text"
              size="small"
              fullWidth
              inputProps={{ maxLength: 2 }}
              helperText="Enter a single emoji or character"
            />
          </Box>
        )}

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onClose} sx={{ mr: 1, color: 'var(--text-light)' }}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            sx={{ bgcolor: 'var(--primary-color)'}}
            disabled={isLoading || !url.trim() || !!error}
          >
            Add Link
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AddQuickLinkForm; 