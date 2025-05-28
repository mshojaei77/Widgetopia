import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  CircularProgress,
  Tooltip,
  Card,
  CardContent,
  Badge,
  ListItemIcon,
  Checkbox,
  Fab,
  Menu,
  Divider,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Notifications as NotificationsIcon,
  Event as EventIcon,
  EditNote as NoteIcon,
  Settings as SettingsIcon,
  Sync as SyncIcon,
  Security as SecurityIcon,
  Google as GoogleIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  AccessTime as AccessTimeIcon,
  Flag as PriorityIcon,
  RadioButtonUnchecked as UncheckedIcon,
  Assignment as TodoIcon,
  FilterList as FilterIcon,
  MoreVert as MoreIcon,
  Schedule as ScheduleIcon,
  Today as TodayIcon,
  Work as WorkIcon,
  Person as PersonIcon,
  ShoppingCart as ShoppingCartIcon,
  LocalHospital as HealthIcon,

} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isTomorrow, isPast, addDays, parseISO } from 'date-fns';

// Types
interface BaseItem {
  id: string;
  title: string;
  content?: string;
  createdAt: Date;
  updatedAt: Date;
  priority: 'low' | 'medium' | 'high';
  category: 'personal' | 'work' | 'shopping' | 'health' | 'other';
  completed?: boolean;
  type: 'note' | 'todo';
}

interface Note extends BaseItem {
  type: 'note';
  tags: string[];
}

interface Todo extends BaseItem {
  type: 'todo';
  dueDate?: Date;
  completed: boolean;
  source?: 'local' | 'google';
  externalId?: string;
  notificationSent?: boolean;
}

type UnifiedItem = Note | Todo;

interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
}

interface AuthState {
  google: {
    isAuthenticated: boolean;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    error?: string;
  };
}

interface SecurityConfig {
  enableEncryption: boolean;
  autoLogout: boolean;
  logoutAfterMinutes: number;
  requireReauth: boolean;
  reauthIntervalHours: number;
}

// Security utilities
class SecureStorage {
  private static readonly ENCRYPTION_KEY = 'widgetopia-notes-key';
  
  static async encrypt(data: string): Promise<string> {
    try {
      const key = this.ENCRYPTION_KEY;
      let encrypted = '';
      for (let i = 0; i < data.length; i++) {
        encrypted += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
      }
      return btoa(encrypted);
    } catch (error) {
      console.error('Encryption failed:', error);
      return data;
    }
  }
  
  static async decrypt(encryptedData: string): Promise<string> {
    try {
      const data = atob(encryptedData);
      const key = this.ENCRYPTION_KEY;
      let decrypted = '';
      for (let i = 0; i < data.length; i++) {
        decrypted += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
      }
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      return encryptedData;
    }
  }
  
  static async setSecureItem(key: string, value: any, encrypt: boolean = true): Promise<void> {
    try {
      const stringValue = JSON.stringify(value);
      const finalValue = encrypt ? await this.encrypt(stringValue) : stringValue;
      
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ [key]: { data: finalValue, encrypted: encrypt } });
      } else {
        localStorage.setItem(key, JSON.stringify({ data: finalValue, encrypted: encrypt }));
      }
    } catch (error) {
      console.error('Secure storage set failed:', error);
    }
  }
  
  static async getSecureItem(key: string): Promise<any> {
    try {
      let stored: any;
      
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        const result = await new Promise<{[key: string]: any}>((resolve) => {
          chrome.storage.local.get([key], resolve);
        });
        stored = result[key];
      } else {
        const item = localStorage.getItem(key);
        stored = item ? JSON.parse(item) : null;
      }
      
      if (!stored) return null;
      
      const { data, encrypted } = stored;
      const finalData = encrypted ? await this.decrypt(data) : data;
      return JSON.parse(finalData);
    } catch (error) {
      console.error('Secure storage get failed:', error);
      return null;
    }
  }
}

// OAuth 2.0 Security Implementation
class OAuth2Security {
  private static getGoogleClientId(userClientId?: string): string {
    return import.meta.env.VITE_GOOGLE_CLIENT_ID || userClientId || '';
  }
  
  private static readonly GOOGLE_SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';
  public static readonly REDIRECT_URI = (typeof chrome !== 'undefined' && chrome.identity) ? chrome.identity.getRedirectURL() : 'http://localhost:3000/oauth/callback';
  
  // Generate PKCE challenge for OAuth 2.0 security
  static async generatePKCE(): Promise<{ codeVerifier: string; codeChallenge: string }> {
    const codeVerifier = this.generateRandomString(128);
    const hashBuffer = await this.sha256(codeVerifier);
    const codeChallenge = this.base64URLEncode(hashBuffer);
    return { codeVerifier, codeChallenge };
  }
  
  private static generateRandomString(length: number): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let result = '';
    const values = new Uint8Array(length);
    crypto.getRandomValues(values);
    for (let i = 0; i < length; i++) {
      result += charset[values[i] % charset.length];
    }
    return result;
  }
  
  private static async sha256(plain: string): Promise<ArrayBuffer> {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return crypto.subtle.digest('SHA-256', data);
  }
  
  private static base64URLEncode(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }
  
  static async authenticateGoogle(userClientId?: string): Promise<{ accessToken: string; refreshToken?: string; expiresAt: number } | null> {
    try {
      const { codeVerifier, codeChallenge } = await this.generatePKCE();
      const state = this.generateRandomString(32);
      
      // Store PKCE verifier and state securely
      await SecureStorage.setSecureItem('oauth_pkce_verifier', codeVerifier);
      await SecureStorage.setSecureItem('oauth_state', state);
      
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.set('client_id', this.getGoogleClientId(userClientId));
      authUrl.searchParams.set('redirect_uri', this.REDIRECT_URI);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', this.GOOGLE_SCOPES);
      authUrl.searchParams.set('code_challenge', codeChallenge);
      authUrl.searchParams.set('code_challenge_method', 'S256');
      authUrl.searchParams.set('state', state);
      authUrl.searchParams.set('access_type', 'offline');
      authUrl.searchParams.set('prompt', 'consent');
      
      if (typeof chrome !== 'undefined' && chrome.identity && chrome.identity.launchWebAuthFlow) {
        // Chrome extension OAuth flow
        const responseUrl = await new Promise<string>((resolve, reject) => {
          chrome.identity.launchWebAuthFlow(
            {
              url: authUrl.toString(),
              interactive: true,
            },
            (responseUrl) => {
              if (chrome.runtime && chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
              } else {
                resolve(responseUrl || '');
              }
            }
          );
        });
        
        return this.handleAuthCallback(responseUrl, userClientId);
      } else {
        // Web OAuth flow
        window.open(authUrl.toString(), '_blank');
        return null; // Handle callback separately
      }
    } catch (error) {
      console.error('Google OAuth authentication failed:', error);
      return null;
    }
  }
  
  private static async handleAuthCallback(responseUrl: string, userClientId?: string): Promise<{ accessToken: string; refreshToken?: string; expiresAt: number } | null> {
    try {
      const url = new URL(responseUrl);
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const error = url.searchParams.get('error');
      
      if (error) {
        throw new Error(`OAuth error: ${error}`);
      }
      
      if (!code || !state) {
        throw new Error('Missing authorization code or state');
      }
      
      // Verify state parameter
      const storedState = await SecureStorage.getSecureItem('oauth_state');
      if (state !== storedState) {
        throw new Error('State mismatch - possible CSRF attack');
      }
      
      // Get PKCE verifier
      const codeVerifier = await SecureStorage.getSecureItem('oauth_pkce_verifier');
      if (!codeVerifier) {
        throw new Error('Missing PKCE verifier');
      }
      
      // Exchange code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.getGoogleClientId(userClientId),
          code,
          code_verifier: codeVerifier,
          grant_type: 'authorization_code',
          redirect_uri: this.REDIRECT_URI,
        }),
      });
      
      if (!tokenResponse.ok) {
        throw new Error(`Token exchange failed: ${tokenResponse.statusText}`);
      }
      
      const tokens = await tokenResponse.json();
      
      // Clean up stored PKCE data
      await SecureStorage.setSecureItem('oauth_pkce_verifier', null);
      await SecureStorage.setSecureItem('oauth_state', null);
      
      return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: Date.now() + (tokens.expires_in * 1000),
      };
    } catch (error) {
      console.error('OAuth callback handling failed:', error);
      return null;
    }
  }
  
  static async refreshGoogleToken(refreshToken: string): Promise<{ accessToken: string; expiresAt: number } | null> {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.getGoogleClientId(),
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.statusText}`);
      }
      
      const tokens = await response.json();
      
      return {
        accessToken: tokens.access_token,
        expiresAt: Date.now() + (tokens.expires_in * 1000),
      };
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }
}

// Google Calendar API
class GoogleCalendarAPI {
  static async getEvents(accessToken: string, maxResults: number = 10): Promise<GoogleCalendarEvent[]> {
    try {
      const now = new Date();
      const timeMin = now.toISOString();
      const timeMax = addDays(now, 30).toISOString();
      
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
        `timeMin=${timeMin}&timeMax=${timeMax}&maxResults=${maxResults}&singleEvents=true&orderBy=startTime`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`Calendar API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Failed to fetch calendar events:', error);
      return [];
    }
  }
}

// Animation variants
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
};

const NotesReminders: React.FC = () => {
  // State management
  const [items, setItems] = useState<UnifiedItem[]>([]);
  const [authState, setAuthState] = useState<AuthState>({
    google: { isAuthenticated: false }
  });
  const [securityConfig, setSecurityConfig] = useState<SecurityConfig>({
    enableEncryption: true,
    autoLogout: false,
    logoutAfterMinutes: 30,
    requireReauth: false,
    reauthIntervalHours: 24
  });
  
  // UI state
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<UnifiedItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [filterType, setFilterType] = useState<'note' | 'todo'>('todo');
  const [quickAddText, setQuickAddText] = useState('');
  const [quickAddType, setQuickAddType] = useState<'note' | 'todo'>('todo');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'warning' | 'info' }>({
    open: false,
    message: '',
    severity: 'info'
  });
  
  // Form state for add dialog
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemContent, setNewItemContent] = useState('');
  const [newItemDueDate, setNewItemDueDate] = useState('');
  const [newItemPriority, setNewItemPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newItemCategory, setNewItemCategory] = useState<'personal' | 'work' | 'shopping' | 'health' | 'other'>('personal');
  const [newItemTags, setNewItemTags] = useState<string[]>([]);
  
  // Google Client ID state for user configuration
  const [googleClientId, setGoogleClientId] = useState<string>('');
  const [showGoogleSetup, setShowGoogleSetup] = useState(false);
  
  // Refs
  const autoLogoutTimer = useRef<NodeJS.Timeout | null>(null);
  const reauthTimer = useRef<NodeJS.Timeout | null>(null);
  
  const GOOGLE_CLIENT_ID_IS_SET = !!(import.meta.env.VITE_GOOGLE_CLIENT_ID || googleClientId);
  
  // Load data on mount
  useEffect(() => {
    loadData();
    setupSecurityTimers();
    
    return () => {
      if (autoLogoutTimer.current) clearTimeout(autoLogoutTimer.current);
      if (reauthTimer.current) clearTimeout(reauthTimer.current);
    };
  }, []);
  
  // Save data when state changes
  useEffect(() => {
    saveData();
  }, [items, authState, securityConfig]);
  
  const loadData = async () => {
    try {
      setLoading(true);
      
      const [savedItems, savedAuth, savedSecurity, savedGoogleClientId] = await Promise.all([
        SecureStorage.getSecureItem('notes-reminders-unified'),
        SecureStorage.getSecureItem('notes-reminders-auth'),
        SecureStorage.getSecureItem('notes-reminders-security'),
        SecureStorage.getSecureItem('notes-reminders-google-client-id')
      ]);
      
      if (savedItems) {
        setItems(savedItems.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
          ...(item.type === 'todo' && item.dueDate && { dueDate: new Date(item.dueDate) }),
          // Convert old reminders to todos
          ...(item.type === 'reminder' && { type: 'todo', completed: item.completed || false, dueDate: item.dueDate ? new Date(item.dueDate) : undefined })
        })));
      } else {
        // Set default items if none exist
        const defaultItems: UnifiedItem[] = [
          {
            id: 'todo-1',
            type: 'todo',
            title: 'Write design document',
            completed: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            priority: 'high',
            category: 'work'
          },
          {
            id: 'todo-2',
            type: 'todo',
            title: 'Call caterer',
            completed: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            priority: 'medium',
            category: 'personal'
          },
          {
            id: 'todo-3',
            type: 'todo',
            title: 'Team meeting',
            content: 'Discuss Q1 goals and project roadmap',
            dueDate: addDays(new Date(), 1),
            completed: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            priority: 'high',
            category: 'work',
            source: 'local'
          },
          {
            id: 'note-1',
            type: 'note',
            title: 'Project Ideas',
            content: 'New widget concepts for the dashboard. Consider weather integration and calendar sync.',
            tags: ['ideas', 'projects'],
            createdAt: new Date(),
            updatedAt: new Date(),
            priority: 'medium',
            category: 'work'
          }
        ];
        setItems(defaultItems);
      }
      
      if (savedAuth) {
        setAuthState(savedAuth);
      }
      
      if (savedSecurity) {
        setSecurityConfig(savedSecurity);
      }
      
      if (savedGoogleClientId) {
        setGoogleClientId(savedGoogleClientId);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      showSnackbar('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const saveData = async () => {
    try {
      await Promise.all([
        SecureStorage.setSecureItem('notes-reminders-unified', items, securityConfig.enableEncryption),
        SecureStorage.setSecureItem('notes-reminders-auth', authState, true),
        SecureStorage.setSecureItem('notes-reminders-security', securityConfig, false),
        SecureStorage.setSecureItem('notes-reminders-google-client-id', googleClientId, true)
      ]);
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  };
  
  const setupSecurityTimers = () => {
    if (securityConfig.autoLogout && securityConfig.logoutAfterMinutes > 0) {
      if (autoLogoutTimer.current) clearTimeout(autoLogoutTimer.current);
      autoLogoutTimer.current = setTimeout(() => {
        handleLogout();
        showSnackbar('Automatically logged out for security', 'info');
      }, securityConfig.logoutAfterMinutes * 60 * 1000);
    }
    
    if (securityConfig.requireReauth && securityConfig.reauthIntervalHours > 0) {
      if (reauthTimer.current) clearTimeout(reauthTimer.current);
      reauthTimer.current = setTimeout(() => {
        handleLogout();
        showSnackbar('Please re-authenticate for security', 'warning');
      }, securityConfig.reauthIntervalHours * 60 * 60 * 1000);
    }
  };
  
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };
  
  const handleLogout = () => {
    setAuthState({
      google: { isAuthenticated: false }
    });
    
    if (autoLogoutTimer.current) clearTimeout(autoLogoutTimer.current);
    if (reauthTimer.current) clearTimeout(reauthTimer.current);
  };
  
  // Quick add functionality
  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAddText.trim()) return;
    
    const now = new Date();
    let newItem: UnifiedItem;
    
    if (quickAddType === 'note') {
      newItem = {
        id: `note-${Date.now()}`,
        type: 'note',
        title: quickAddText,
        createdAt: now,
        updatedAt: now,
        priority: 'medium',
        category: 'personal',
        tags: []
      } as Note;
    } else {
      newItem = {
        id: `todo-${Date.now()}`,
        type: 'todo',
        title: quickAddText,
        createdAt: now,
        updatedAt: now,
        priority: 'medium',
        category: 'personal',
        completed: false,
        dueDate: addDays(now, 1)
      } as Todo;
    }
    
    setItems(prev => [newItem, ...prev]);
    setQuickAddText('');
    showSnackbar(`Added successfully`, 'success');
  };
  
  // Filter items
  const filteredItems = items.filter(item => {
    const matchesType = item.type === filterType;
    return matchesType;
  });
  
  // Sort items by priority and date
  const sortedItems = filteredItems.sort((a, b) => {
    // Completed items go to bottom
    if ('completed' in a && 'completed' in b) {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
    }
    
    // Priority order
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    // Date order (newest first for notes, due date for todos)
    if (a.type === 'todo' && b.type === 'todo') {
      const aDueDate = (a as Todo).dueDate;
      const bDueDate = (b as Todo).dueDate;
      if (aDueDate && bDueDate) {
        return aDueDate.getTime() - bDueDate.getTime();
      }
    }
    
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });
  
  const handleToggleComplete = (id: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === id && ('completed' in item)) {
        return { ...item, completed: !item.completed, updatedAt: new Date() };
      }
      return item;
    }));
  };
  
  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    showSnackbar('Deleted', 'success');
  };
  
  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#9e9e9e';
    }
  };
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'work': return <WorkIcon sx={{ fontSize: 14 }} />;
      case 'personal': return <PersonIcon sx={{ fontSize: 14 }} />;
      case 'shopping': return <ShoppingCartIcon sx={{ fontSize: 14 }} />;
      case 'health': return <HealthIcon sx={{ fontSize: 14 }} />;
      default: return <NoteIcon sx={{ fontSize: 14 }} />;
    }
  };
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'note': return <NoteIcon sx={{ fontSize: 16 }} />;
      case 'todo': return <TodoIcon sx={{ fontSize: 16 }} />;
      default: return <NoteIcon sx={{ fontSize: 16 }} />;
    }
  };
  
  const formatDueDate = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isPast(date)) return `Overdue`;
    return format(date, 'MMM d');
  };
  
  const getOverdueCount = () => {
    return items.filter(item => 
      item.type === 'todo' && 
      !(item as Todo).completed && 
      (item as Todo).dueDate &&
      isPast((item as Todo).dueDate!)
    ).length;
  };
  
  const getTodayCount = () => {
    return items.filter(item => 
      item.type === 'todo' && 
      !(item as Todo).completed && 
      (item as Todo).dueDate &&
      isToday((item as Todo).dueDate!)
    ).length;
  };

  return (
    <Paper
      elevation={0}
      className="glass glass-frosted glass-premium glass-particles"
      sx={{
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'var(--radius-lg)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Simplified Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NoteIcon />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Workspace
          </Typography>
          {getOverdueCount() > 0 && (
            <Badge badgeContent={getOverdueCount()} color="error" sx={{ ml: 0.5 }}>
              <WarningIcon sx={{ fontSize: 16, color: 'error.main' }} />
            </Badge>
          )}
        </Box>
        
        <IconButton
          onClick={() => setShowSettingsDialog(true)}
          size="small"
          sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
        >
          <SettingsIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>
      
      {/* Simplified Quick Add */}
      <Box 
        component="form" 
        onSubmit={handleQuickAdd}
        sx={{ 
          display: 'flex', 
          gap: 0.5, 
          mb: 2,
          p: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <TextField
          fullWidth
          size="small"
          variant="outlined"
          value={quickAddText}
          onChange={(e) => setQuickAddText(e.target.value)}
          placeholder={`Add ${quickAddType}...`}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                {getTypeIcon(quickAddType)}
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255, 255, 255, 0.07)',
              borderRadius: 'var(--radius-sm)',
              '& fieldset': { border: 'none' },
              height: 36,
            },
            '& .MuiInputBase-input': {
              color: 'white',
              fontSize: '0.85rem',
              '&::placeholder': {
                color: 'rgba(255, 255, 255, 0.7)',
                opacity: 1,
              }
            }
          }}
        />
        
        <Box sx={{ display: 'flex', gap: 0.25 }}>
          <Button
            variant={quickAddType === 'note' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setQuickAddType('note')}
            sx={{
              minWidth: 32,
              width: 32,
              height: 36,
              p: 0,
              borderRadius: 'var(--radius-sm)',
              bgcolor: quickAddType === 'note' ? 'var(--primary-color)' : 'transparent',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              '&:hover': { 
                bgcolor: quickAddType === 'note' ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.1)',
                borderColor: 'rgba(255, 255, 255, 0.3)'
              }
            }}
          >
            <NoteIcon sx={{ fontSize: 16 }} />
          </Button>
          
          <Button
            variant={quickAddType === 'todo' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setQuickAddType('todo')}
            sx={{
              minWidth: 32,
              width: 32,
              height: 36,
              p: 0,
              borderRadius: 'var(--radius-sm)',
              bgcolor: quickAddType === 'todo' ? 'var(--primary-color)' : 'transparent',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              '&:hover': { 
                bgcolor: quickAddType === 'todo' ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.1)',
                borderColor: 'rgba(255, 255, 255, 0.3)'
              }
            }}
          >
            <TodoIcon sx={{ fontSize: 16 }} />
          </Button>
        </Box>
        
        <Button
          type="submit"
          variant="contained"
          disabled={!quickAddText.trim()}
          sx={{
            minWidth: 36,
            width: 36,
            height: 36,
            p: 0,
            borderRadius: 'var(--radius-sm)',
            bgcolor: 'var(--primary-color)',
            '&:hover': { bgcolor: 'var(--primary-color)' }
          }}
        >
          <AddIcon sx={{ fontSize: 18 }} />
        </Button>
      </Box>
      
      {/* Simple Filter Toggle */}
      <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5 }}>
        <Button
          variant={filterType === 'note' ? 'contained' : 'outlined'}
          size="small"
          onClick={() => setFilterType('note')}
          startIcon={<NoteIcon sx={{ fontSize: 14 }} />}
          sx={{
            height: 28,
            fontSize: '0.75rem',
            backgroundColor: filterType === 'note' ? 'var(--primary-color)' : 'transparent',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            '&:hover': {
              backgroundColor: filterType === 'note' ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.1)',
            }
          }}
        >
          Notes
        </Button>
        
        <Button
          variant={filterType === 'todo' ? 'contained' : 'outlined'}
          size="small"
          onClick={() => setFilterType('todo')}
          startIcon={<TodoIcon sx={{ fontSize: 14 }} />}
          sx={{
            height: 28,
            fontSize: '0.75rem',
            backgroundColor: filterType === 'todo' ? 'var(--primary-color)' : 'transparent',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            '&:hover': {
              backgroundColor: filterType === 'todo' ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.1)',
            }
          }}
        >
          Todos
        </Button>
      </Box>
      
      {/* Items List */}
      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
        <List sx={{ height: '100%', overflow: 'auto', px: 0 }}>
          <AnimatePresence>
            {sortedItems.map((item) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <Card
                  sx={{
                    mb: 0.5,
                    backgroundColor: 'completed' in item && item.completed
                      ? 'rgba(76, 175, 80, 0.1)'
                      : item.type === 'todo' && (item as Todo).dueDate && isPast((item as Todo).dueDate!) && !(item as Todo).completed
                      ? 'rgba(244, 67, 54, 0.1)'
                      : 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid rgba(255, 255, 255, 0.1)`,
                    opacity: 'completed' in item && item.completed ? 0.7 : 1,
                  }}
                >
                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
                        {('completed' in item) && (
                          <IconButton
                            size="small"
                            onClick={() => handleToggleComplete(item.id)}
                            sx={{ 
                              color: item.completed ? '#4caf50' : 'rgba(255, 255, 255, 0.7)',
                              p: 0.5
                            }}
                          >
                            {item.completed ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : <UncheckedIcon sx={{ fontSize: 16 }} />}
                          </IconButton>
                        )}
                        
                        <Box sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          {getTypeIcon(item.type)}
                        </Box>
                        
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 500,
                            color: 'white',
                            textDecoration: 'completed' in item && item.completed ? 'line-through' : 'none',
                            flexGrow: 1,
                            fontSize: '0.85rem'
                          }}
                        >
                          {item.title}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                        <Box sx={{ color: getPriorityColor(item.priority) }}>
                          <PriorityIcon sx={{ fontSize: 12 }} />
                        </Box>
                        
                        {getCategoryIcon(item.category)}
                        
                        {item.type === 'todo' && (item as Todo).dueDate && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: isPast((item as Todo).dueDate!) && !(item as Todo).completed
                                ? '#f44336'
                                : 'rgba(255, 255, 255, 0.5)',
                              fontSize: '0.7rem',
                              ml: 0.5
                            }}
                          >
                            {formatDueDate((item as Todo).dueDate!)}
                          </Typography>
                        )}
                        
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteItem(item.id)}
                          sx={{ 
                            color: 'rgba(255, 255, 255, 0.5)',
                            p: 0.25,
                            ml: 0.5
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {sortedItems.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <NoteIcon sx={{ fontSize: 48, color: 'rgba(255, 255, 255, 0.3)', mb: 2 }} />
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {`No ${filterType}s found`}
              </Typography>
            </Box>
          )}
        </List>
      </Box>
      
      {/* Settings Dialog */}
      <Dialog
        open={showSettingsDialog}
        onClose={() => setShowSettingsDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(10, 10, 15, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 'var(--radius-lg)',
          }
        }}
      >
        <DialogTitle sx={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SettingsIcon />
            Settings
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {/* Google Calendar Integration */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ color: 'white', mb: 2, fontWeight: 600 }}>
              Google Calendar Integration
            </Typography>
            
            {!GOOGLE_CLIENT_ID_IS_SET ? (
              <Box>
                <Alert severity="info" sx={{ mb: 2, backgroundColor: 'rgba(33, 150, 243, 0.1)' }}>
                  Google Calendar integration requires setup
                </Alert>
                
                {!showGoogleSetup ? (
                  <Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                      Connect your Google Calendar to sync events as todos. This requires a Google API key.
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => setShowGoogleSetup(true)}
                      startIcon={<SettingsIcon />}
                      sx={{
                        backgroundColor: 'var(--primary-color)',
                        '&:hover': { backgroundColor: 'var(--primary-color)' }
                      }}
                    >
                      Setup Google Calendar
                    </Button>
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 2, fontWeight: 500 }}>
                      Google Calendar Setup
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                      First, get your Google API credentials, then paste your Client ID below:
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={() => window.open('https://console.cloud.google.com/apis/credentials', '_blank')}
                      startIcon={<GoogleIcon />}
                      sx={{
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        color: 'white',
                        mb: 2,
                        '&:hover': { borderColor: 'rgba(255, 255, 255, 0.5)' }
                      }}
                    >
                      Get API Key from Google
                    </Button>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="123456789-abcdefghijklmnop.apps.googleusercontent.com"
                      value={googleClientId}
                      onChange={(e) => setGoogleClientId(e.target.value)}
                      sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                          '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                          '&.Mui-focused fieldset': { borderColor: 'var(--primary-color)' },
                        },
                        '& .MuiInputBase-input': { 
                          color: 'white',
                          fontSize: '0.85rem'
                        }
                      }}
                    />
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Button
                        variant="contained"
                        onClick={() => {
                          if (googleClientId.trim()) {
                            showSnackbar('Google Client ID saved successfully!', 'success');
                            setShowGoogleSetup(false);
                          } else {
                            showSnackbar('Please enter a valid Client ID', 'error');
                          }
                        }}
                        disabled={!googleClientId.trim()}
                        sx={{
                          backgroundColor: 'var(--primary-color)',
                          '&:hover': { backgroundColor: 'var(--primary-color)' }
                        }}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setShowGoogleSetup(false);
                          setGoogleClientId('');
                        }}
                        sx={{
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                          color: 'white',
                          '&:hover': { borderColor: 'rgba(255, 255, 255, 0.5)' }
                        }}
                      >
                        Cancel
                      </Button>
                    </Box>
                    <Alert severity="warning" sx={{ backgroundColor: 'rgba(255, 152, 0, 0.1)' }}>
                      <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                        <strong>Quick Setup Guide:</strong>
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block' }}>
                        1. Go to Google Cloud Console → APIs & Services → Credentials<br/>
                        2. Create OAuth 2.0 Client ID for "Web application"<br/>
                        3. Add your domain to authorized origins<br/>
                        4. Copy the Client ID and paste it above
                      </Typography>
                    </Alert>
                  </Box>
                )}
              </Box>
            ) : authState.google.isAuthenticated ? (
              <Box>
                <Alert severity="success" sx={{ mb: 2, backgroundColor: 'rgba(76, 175, 80, 0.1)' }}>
                  Connected to Google Calendar
                </Alert>
                <Button
                  variant="outlined"
                  onClick={handleLogout}
                  startIcon={<GoogleIcon />}
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    '&:hover': { borderColor: 'rgba(255, 255, 255, 0.5)' }
                  }}
                >
                  Disconnect
                </Button>
              </Box>
            ) : (
              <Box>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                  Connect your Google Calendar to sync events as todos
                </Typography>
                                  <Button
                    variant="contained"
                    onClick={async () => {
                      setLoading(true);
                      const result = await OAuth2Security.authenticateGoogle(googleClientId);
                      if (result) {
                        setAuthState(prev => ({
                          ...prev,
                          google: {
                            isAuthenticated: true,
                            accessToken: result.accessToken,
                            refreshToken: result.refreshToken,
                            expiresAt: result.expiresAt
                          }
                        }));
                        showSnackbar('Connected to Google Calendar', 'success');
                      } else {
                        showSnackbar('Failed to connect to Google Calendar', 'error');
                      }
                      setLoading(false);
                    }}
                    startIcon={<GoogleIcon />}
                    disabled={loading}
                    sx={{
                      backgroundColor: 'var(--primary-color)',
                      '&:hover': { backgroundColor: 'var(--primary-color)' }
                    }}
                  >
                    {loading ? <CircularProgress size={20} /> : 'Connect Google Calendar'}
                  </Button>
              </Box>
            )}
          </Box>

          {/* Data Management */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ color: 'white', mb: 2, fontWeight: 600 }}>
              Data Management
            </Typography>
            
            <Button
              variant="outlined"
              onClick={() => {
                const dataStr = JSON.stringify(items, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `notes-todos-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
                link.click();
                URL.revokeObjectURL(url);
                showSnackbar('Data exported successfully', 'success');
              }}
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.3)',
                color: 'white',
                mr: 1,
                mb: 1,
                '&:hover': { borderColor: 'rgba(255, 255, 255, 0.5)' }
              }}
            >
              Export Data
            </Button>
            
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                  setItems([]);
                  showSnackbar('All data cleared', 'success');
                  setShowSettingsDialog(false);
                }
              }}
              sx={{ mb: 1 }}
            >
              Clear All Data
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', p: 2 }}>
          <Button
            onClick={() => setShowSettingsDialog(false)}
            sx={{ color: 'white' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default NotesReminders; 