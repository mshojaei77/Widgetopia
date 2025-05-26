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
  Tabs,
  Tab,
  Alert,
  Snackbar,
  CircularProgress,
  Tooltip,
  Divider,
  Card,
  CardContent,
  Badge,
  ListItemIcon,
  Checkbox,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Notifications as NotificationsIcon,
  Event as EventIcon,
  Note as NoteIcon,
  Settings as SettingsIcon,
  Sync as SyncIcon,
  Security as SecurityIcon,
  Telegram as TelegramIcon,
  Google as GoogleIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  AccessTime as AccessTimeIcon,
  Flag as PriorityIcon,
  RadioButtonUnchecked as UncheckedIcon,
  Assignment as TodoIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isTomorrow, isPast, addDays, parseISO } from 'date-fns';

// Types
interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  category: 'personal' | 'work' | 'shopping' | 'health' | 'other';
}

interface Reminder {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: 'personal' | 'work' | 'shopping' | 'health' | 'other';
  source: 'local' | 'google' | 'telegram';
  externalId?: string;
  notificationSent?: boolean;
}

// Add Todo interface
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
}

interface TelegramMessage {
  message_id: number;
  text: string;
  date: number;
  from?: {
    id: number;
    first_name: string;
    username?: string;
  };
}

interface AuthState {
  google: {
    isAuthenticated: boolean;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    error?: string;
  };
  telegram: {
    isAuthenticated: boolean;
    botToken?: string;
    chatId?: string;
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
      // Simple XOR encryption for demo - in production use Web Crypto API
      const key = this.ENCRYPTION_KEY;
      let encrypted = '';
      for (let i = 0; i < data.length; i++) {
        encrypted += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
      }
      return btoa(encrypted);
    } catch (error) {
      console.error('Encryption failed:', error);
      return data; // Fallback to unencrypted
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
      return encryptedData; // Fallback to original
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
  private static readonly GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  private static readonly GOOGLE_SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';
  private static readonly REDIRECT_URI = (typeof chrome !== 'undefined' && chrome.identity) ? chrome.identity.getRedirectURL() : 'http://localhost:3000/oauth/callback';
  
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
  
  static async authenticateGoogle(): Promise<{ accessToken: string; refreshToken?: string; expiresAt: number } | null> {
    try {
      const { codeVerifier, codeChallenge } = await this.generatePKCE();
      const state = this.generateRandomString(32);
      
      // Store PKCE verifier and state securely
      await SecureStorage.setSecureItem('oauth_pkce_verifier', codeVerifier);
      await SecureStorage.setSecureItem('oauth_state', state);
      
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.set('client_id', this.GOOGLE_CLIENT_ID);
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
        
        return this.handleAuthCallback(responseUrl);
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
  
  private static async handleAuthCallback(responseUrl: string): Promise<{ accessToken: string; refreshToken?: string; expiresAt: number } | null> {
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
          client_id: this.GOOGLE_CLIENT_ID,
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
          client_id: this.GOOGLE_CLIENT_ID,
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

// Telegram API (for saved messages)
class TelegramAPI {
  static async getSavedMessages(botToken: string, chatId: string, limit: number = 20): Promise<TelegramMessage[]> {
    try {
      // Note: This is a simplified example. In practice, you'd need to implement
      // a proper Telegram bot that can access saved messages through the Bot API
      const response = await fetch(
        `https://api.telegram.org/bot${botToken}/getUpdates?limit=${limit}&offset=-${limit}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`Telegram API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.ok) {
        throw new Error(`Telegram API error: ${data.description}`);
      }
      
      // Filter for saved messages (messages to self)
      return data.result
        .filter((update: any) => update.message && update.message.chat.type === 'private')
        .map((update: any) => update.message);
    } catch (error) {
      console.error('Failed to fetch Telegram messages:', error);
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
  const [activeTab, setActiveTab] = useState(0);
  const [notes, setNotes] = useState<Note[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [authState, setAuthState] = useState<AuthState>({
    google: { isAuthenticated: false },
    telegram: { isAuthenticated: false }
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
  const [editingItem, setEditingItem] = useState<Note | Reminder | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'warning' | 'info' }>({
    open: false,
    message: '',
    severity: 'info'
  });
  
  // Form state
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemContent, setNewItemContent] = useState('');
  const [newItemDueDate, setNewItemDueDate] = useState('');
  const [newItemPriority, setNewItemPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newItemCategory, setNewItemCategory] = useState<'personal' | 'work' | 'shopping' | 'health' | 'other'>('personal');
  const [newItemTags, setNewItemTags] = useState<string[]>([]);
  
  // Todo form state
  const [newTodo, setNewTodo] = useState('');
  
  // Refs
  const autoLogoutTimer = useRef<NodeJS.Timeout | null>(null);
  const reauthTimer = useRef<NodeJS.Timeout | null>(null);
  
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
  }, [notes, reminders, todos, authState, securityConfig]);
  
  const loadData = async () => {
    try {
      setLoading(true);
      
      const [savedNotes, savedReminders, savedTodos, savedAuth, savedSecurity] = await Promise.all([
        SecureStorage.getSecureItem('notes-reminders-notes'),
        SecureStorage.getSecureItem('notes-reminders-reminders'),
        SecureStorage.getSecureItem('notes-reminders-todos'),
        SecureStorage.getSecureItem('notes-reminders-auth'),
        SecureStorage.getSecureItem('notes-reminders-security')
      ]);
      
      if (savedNotes) {
        setNotes(savedNotes.map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt)
        })));
      }
      
      if (savedReminders) {
        setReminders(savedReminders.map((reminder: any) => ({
          ...reminder,
          dueDate: new Date(reminder.dueDate)
        })));
      }
      
      if (savedTodos) {
        setTodos(savedTodos);
      } else {
        // Set default todos if none exist
        const defaultTodos = [
          { id: 1, text: 'Write design document', completed: true },
          { id: 2, text: 'Call caterer', completed: false },
          { id: 3, text: 'Read user feedback', completed: false },
        ];
        setTodos(defaultTodos);
      }
      
      if (savedAuth) {
        setAuthState(savedAuth);
      }
      
      if (savedSecurity) {
        setSecurityConfig(savedSecurity);
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
        SecureStorage.setSecureItem('notes-reminders-notes', notes, securityConfig.enableEncryption),
        SecureStorage.setSecureItem('notes-reminders-reminders', reminders, securityConfig.enableEncryption),
        SecureStorage.setSecureItem('notes-reminders-todos', todos, securityConfig.enableEncryption),
        SecureStorage.setSecureItem('notes-reminders-auth', authState, true), // Always encrypt auth data
        SecureStorage.setSecureItem('notes-reminders-security', securityConfig, false)
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
  
  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      const result = await OAuth2Security.authenticateGoogle();
      
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
        showSnackbar('Google Calendar connected successfully', 'success');
        await syncGoogleCalendar();
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      console.error('Google authentication failed:', error);
      setAuthState(prev => ({
        ...prev,
        google: {
          isAuthenticated: false,
          error: error instanceof Error ? error.message : 'Authentication failed'
        }
      }));
      showSnackbar('Google authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleTelegramAuth = async (botToken: string, chatId: string) => {
    try {
      setLoading(true);
      
      // Validate bot token format
      if (!botToken.match(/^\d+:[A-Za-z0-9_-]{35}$/)) {
        throw new Error('Invalid bot token format');
      }
      
      // Test the connection
      const testMessages = await TelegramAPI.getSavedMessages(botToken, chatId, 1);
      
      setAuthState(prev => ({
        ...prev,
        telegram: {
          isAuthenticated: true,
          botToken,
          chatId
        }
      }));
      
      showSnackbar('Telegram connected successfully', 'success');
      await syncTelegramMessages();
    } catch (error) {
      console.error('Telegram authentication failed:', error);
      setAuthState(prev => ({
        ...prev,
        telegram: {
          isAuthenticated: false,
          error: error instanceof Error ? error.message : 'Authentication failed'
        }
      }));
      showSnackbar('Telegram authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = () => {
    setAuthState({
      google: { isAuthenticated: false },
      telegram: { isAuthenticated: false }
    });
    
    if (autoLogoutTimer.current) clearTimeout(autoLogoutTimer.current);
    if (reauthTimer.current) clearTimeout(reauthTimer.current);
  };
  
  const syncGoogleCalendar = async () => {
    if (!authState.google.isAuthenticated || !authState.google.accessToken) return;
    
    try {
      setSyncing(true);
      
      // Check if token needs refresh
      let accessToken = authState.google.accessToken;
      if (authState.google.expiresAt && Date.now() >= authState.google.expiresAt) {
        if (authState.google.refreshToken) {
          const refreshResult = await OAuth2Security.refreshGoogleToken(authState.google.refreshToken);
          if (refreshResult) {
            accessToken = refreshResult.accessToken;
            setAuthState(prev => ({
              ...prev,
              google: {
                ...prev.google,
                accessToken: refreshResult.accessToken,
                expiresAt: refreshResult.expiresAt
              }
            }));
          } else {
            throw new Error('Token refresh failed');
          }
        } else {
          throw new Error('Token expired and no refresh token available');
        }
      }
      
      const events = await GoogleCalendarAPI.getEvents(accessToken);
      
      // Convert events to reminders
      const newReminders: Reminder[] = events.map(event => ({
        id: `google-${event.id}`,
        title: event.summary,
        description: event.description,
        dueDate: new Date(event.start.dateTime || event.start.date || Date.now()),
        completed: false,
        priority: 'medium',
        category: 'work',
        source: 'google',
        externalId: event.id
      }));
      
      // Merge with existing reminders (avoid duplicates)
      setReminders(prev => {
        const filtered = prev.filter(r => r.source !== 'google');
        return [...filtered, ...newReminders];
      });
      
      showSnackbar(`Synced ${newReminders.length} events from Google Calendar`, 'success');
    } catch (error) {
      console.error('Google Calendar sync failed:', error);
      showSnackbar('Google Calendar sync failed', 'error');
    } finally {
      setSyncing(false);
    }
  };
  
  const syncTelegramMessages = async () => {
    if (!authState.telegram.isAuthenticated || !authState.telegram.botToken || !authState.telegram.chatId) return;
    
    try {
      setSyncing(true);
      
      const messages = await TelegramAPI.getSavedMessages(
        authState.telegram.botToken,
        authState.telegram.chatId
      );
      
      // Convert messages to notes
      const newNotes: Note[] = messages
        .filter(msg => msg.text && msg.text.length > 0)
        .map(msg => ({
          id: `telegram-${msg.message_id}`,
          title: msg.text.substring(0, 50) + (msg.text.length > 50 ? '...' : ''),
          content: msg.text,
          createdAt: new Date(msg.date * 1000),
          updatedAt: new Date(msg.date * 1000),
          tags: ['telegram'],
          priority: 'low',
          category: 'personal'
        }));
      
      // Merge with existing notes (avoid duplicates)
      setNotes(prev => {
        const filtered = prev.filter(n => !n.id.startsWith('telegram-'));
        return [...filtered, ...newNotes];
      });
      
      showSnackbar(`Synced ${newNotes.length} messages from Telegram`, 'success');
    } catch (error) {
      console.error('Telegram sync failed:', error);
      showSnackbar('Telegram sync failed', 'error');
    } finally {
      setSyncing(false);
    }
  };
  
  const handleAddItem = () => {
    if (!newItemTitle.trim()) return;
    
    const now = new Date();
    
    if (activeTab === 0) {
      // Add note
      const newNote: Note = {
        id: `note-${Date.now()}`,
        title: newItemTitle,
        content: newItemContent,
        createdAt: now,
        updatedAt: now,
        tags: newItemTags,
        priority: newItemPriority,
        category: newItemCategory
      };
      
      setNotes(prev => [newNote, ...prev]);
    } else if (activeTab === 1) {
      // Add reminder
      const newReminder: Reminder = {
        id: `reminder-${Date.now()}`,
        title: newItemTitle,
        description: newItemContent,
        dueDate: newItemDueDate ? new Date(newItemDueDate) : addDays(now, 1),
        completed: false,
        priority: newItemPriority,
        category: newItemCategory,
        source: 'local'
      };
      
      setReminders(prev => [newReminder, ...prev]);
    }
    
    // Reset form
    setNewItemTitle('');
    setNewItemContent('');
    setNewItemDueDate('');
    setNewItemPriority('medium');
    setNewItemCategory('personal');
    setNewItemTags([]);
    setShowAddDialog(false);
    
    showSnackbar(`${activeTab === 0 ? 'Note' : activeTab === 1 ? 'Reminder' : 'Todo'} added successfully`, 'success');
  };
  
  // Todo-specific functions
  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim() === '') return;
    const newId = todos.length > 0 ? Math.max(...todos.map(t => t.id)) + 1 : 1;
    setTodos([...todos, { id: newId, text: newTodo, completed: false }]);
    setNewTodo('');
    showSnackbar('Todo added successfully', 'success');
  };
  
  const handleToggleTodo = (id: number) => {
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };
  
  const handleDeleteTodo = (id: number) => {
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
    showSnackbar('Todo deleted', 'success');
  };
  
  const handleDeleteItem = (id: string) => {
    if (activeTab === 0) {
      setNotes(prev => prev.filter(note => note.id !== id));
    } else if (activeTab === 1) {
      setReminders(prev => prev.filter(reminder => reminder.id !== id));
    }
    showSnackbar(`${activeTab === 0 ? 'Note' : activeTab === 1 ? 'Reminder' : 'Todo'} deleted`, 'success');
  };
  
  const handleToggleReminder = (id: string) => {
    setReminders(prev =>
      prev.map(reminder =>
        reminder.id === id ? { ...reminder, completed: !reminder.completed } : reminder
      )
    );
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
      case 'work': return '💼';
      case 'personal': return '👤';
      case 'shopping': return '🛒';
      case 'health': return '🏥';
      default: return '📝';
    }
  };
  
  const formatDueDate = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isPast(date)) return `Overdue (${format(date, 'MMM d')})`;
    return format(date, 'MMM d, yyyy');
  };
  
  const getOverdueCount = () => {
    return reminders.filter(r => !r.completed && isPast(r.dueDate)).length;
  };
  
  const getTodayCount = () => {
    return reminders.filter(r => !r.completed && isToday(r.dueDate)).length;
  };

  return (
    <Paper
      elevation={0}
      className="glass"
      sx={{
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'var(--radius-lg)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography
          variant="h5"
          component="h2"
          sx={{
            fontWeight: 600,
            letterSpacing: '0.5px',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <NoteIcon />
          Notes & Reminders
          {getOverdueCount() > 0 && (
            <Badge badgeContent={getOverdueCount()} color="error" sx={{ ml: 1 }}>
              <WarningIcon color="error" />
            </Badge>
          )}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Sync with external services">
            <IconButton
              onClick={() => {
                syncGoogleCalendar();
                syncTelegramMessages();
              }}
              disabled={syncing || (!authState.google.isAuthenticated && !authState.telegram.isAuthenticated)}
              sx={{ color: 'white' }}
            >
              {syncing ? <CircularProgress size={20} /> : <SyncIcon />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Settings">
            <IconButton
              onClick={() => setShowSettingsDialog(true)}
              sx={{ color: 'white' }}
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Add new item">
            <IconButton
              onClick={() => setShowAddDialog(true)}
              sx={{ color: 'white' }}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        sx={{
          mb: 2,
          '& .MuiTab-root': {
            color: 'rgba(255, 255, 255, 0.7)',
            '&.Mui-selected': {
              color: 'white',
            }
          },
          '& .MuiTabs-indicator': {
            backgroundColor: 'var(--primary-color)',
          }
        }}
      >
        <Tab
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <NoteIcon />
              Notes ({notes.length})
            </Box>
          }
        />
        <Tab
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <NotificationsIcon />
              Reminders ({reminders.filter(r => !r.completed).length})
              {getTodayCount() > 0 && (
                <Chip
                  label={getTodayCount()}
                  size="small"
                  color="primary"
                  sx={{ ml: 0.5, height: 20, fontSize: '0.7rem' }}
                />
              )}
            </Box>
          }
        />
        <Tab
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TodoIcon />
              Todos ({todos.filter(t => !t.completed).length})
            </Box>
          }
        />
      </Tabs>
      
      {/* Content */}
      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
        {activeTab === 0 ? (
          // Notes Tab
          <List sx={{ height: '100%', overflow: 'auto', px: 0 }}>
            <AnimatePresence>
              {notes.map((note) => (
                <motion.div
                  key={note.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <Card
                    sx={{
                      mb: 1,
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'white' }}>
                          {note.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Chip
                            label={note.priority}
                            size="small"
                            sx={{
                              backgroundColor: getPriorityColor(note.priority),
                              color: 'white',
                              fontSize: '0.7rem',
                              height: 20
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteItem(note.id)}
                            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                      
                      {note.content && (
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'rgba(255, 255, 255, 0.8)',
                            mb: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}
                        >
                          {note.content}
                        </Typography>
                      )}
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          <Chip
                            label={`${getCategoryIcon(note.category)} ${note.category}`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                          {note.tags.map((tag, index) => (
                            <Chip
                              key={index}
                              label={tag}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                          ))}
                        </Box>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                          {format(note.updatedAt, 'MMM d')}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {notes.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <NoteIcon sx={{ fontSize: 48, color: 'rgba(255, 255, 255, 0.3)', mb: 2 }} />
                <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  No notes yet. Click the + button to add your first note.
                </Typography>
              </Box>
            )}
          </List>
        ) : activeTab === 1 ? (
          // Reminders Tab
          <List sx={{ height: '100%', overflow: 'auto', px: 0 }}>
            <AnimatePresence>
              {reminders
                .sort((a, b) => {
                  if (a.completed !== b.completed) return a.completed ? 1 : -1;
                  return a.dueDate.getTime() - b.dueDate.getTime();
                })
                .map((reminder) => (
                  <motion.div
                    key={reminder.id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <Card
                      sx={{
                        mb: 1,
                        backgroundColor: reminder.completed
                          ? 'rgba(76, 175, 80, 0.1)'
                          : isPast(reminder.dueDate)
                          ? 'rgba(244, 67, 54, 0.1)'
                          : 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${
                          reminder.completed
                            ? 'rgba(76, 175, 80, 0.3)'
                            : isPast(reminder.dueDate)
                            ? 'rgba(244, 67, 54, 0.3)'
                            : 'rgba(255, 255, 255, 0.1)'
                        }`,
                        opacity: reminder.completed ? 0.7 : 1,
                      }}
                    >
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleToggleReminder(reminder.id)}
                              sx={{ color: reminder.completed ? '#4caf50' : 'rgba(255, 255, 255, 0.7)' }}
                            >
                              {reminder.completed ? <CheckCircleIcon /> : <AccessTimeIcon />}
                            </IconButton>
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: 600,
                                color: 'white',
                                textDecoration: reminder.completed ? 'line-through' : 'none'
                              }}
                            >
                              {reminder.title}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                            <Chip
                              label={reminder.priority}
                              size="small"
                              sx={{
                                backgroundColor: getPriorityColor(reminder.priority),
                                color: 'white',
                                fontSize: '0.7rem',
                                height: 20
                              }}
                            />
                            {reminder.source === 'google' && (
                              <Tooltip title="From Google Calendar">
                                <GoogleIcon sx={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.5)' }} />
                              </Tooltip>
                            )}
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteItem(reminder.id)}
                              sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                        
                        {reminder.description && (
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'rgba(255, 255, 255, 0.8)',
                              mb: 1,
                              ml: 5,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical'
                            }}
                          >
                            {reminder.description}
                          </Typography>
                        )}
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', ml: 5 }}>
                          <Chip
                            label={`${getCategoryIcon(reminder.category)} ${reminder.category}`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                          <Typography
                            variant="caption"
                            sx={{
                              color: isPast(reminder.dueDate) && !reminder.completed
                                ? '#f44336'
                                : isToday(reminder.dueDate)
                                ? '#ff9800'
                                : 'rgba(255, 255, 255, 0.5)',
                              fontWeight: isPast(reminder.dueDate) && !reminder.completed ? 600 : 400
                            }}
                          >
                            {formatDueDate(reminder.dueDate)}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </AnimatePresence>
            
            {reminders.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <NotificationsIcon sx={{ fontSize: 48, color: 'rgba(255, 255, 255, 0.3)', mb: 2 }} />
                <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  No reminders yet. Click the + button to add your first reminder.
                </Typography>
              </Box>
            )}
          </List>
        ) : (
          // Todos Tab
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Todo Add Form */}
            <Box 
              component="form" 
              onSubmit={handleAddTodo} 
              sx={{ 
                display: 'flex', 
                mb: 2,
                position: 'relative',
              }}
            >
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Add a new task"
                sx={{ 
                  mr: 1,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.07)',
                    borderRadius: 'var(--radius-md)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    transition: 'all 0.3s ease',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.15)',
                      transition: 'border-color 0.3s ease',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--primary-color)',
                      boxShadow: '0 0 15px rgba(138, 180, 248, 0.3)',
                    }
                  },
                  '& .MuiInputBase-input': {
                    color: 'white',
                    '&::placeholder': {
                      color: 'rgba(255, 255, 255, 0.7)',
                      opacity: 1,
                    }
                  }
                }}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                sx={{ 
                  whiteSpace: 'nowrap',
                  borderRadius: 'var(--radius-md)',
                  bgcolor: 'var(--primary-color)',
                  boxShadow: '0 4px 10px rgba(138, 180, 248, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'var(--primary-color)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 15px rgba(138, 180, 248, 0.4)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                    boxShadow: '0 2px 5px rgba(138, 180, 248, 0.3)',
                  }
                }}
              >
                Add
              </Button>
            </Box>

            {/* Todo List */}
            <List sx={{ 
              overflowY: 'auto', 
              flexGrow: 1, 
              px: 0.5,
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                borderRadius: '3px'
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '3px',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                }
              },
            }}>
              <AnimatePresence>
                {todos.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <ListItem>
                      <ListItemText 
                        secondary="No tasks yet. Add one above!" 
                        sx={{ 
                          textAlign: 'center', 
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontStyle: 'italic' 
                        }} 
                      />
                    </ListItem>
                  </motion.div>
                ) : (
                  todos.map(todo => (
                    <motion.div
                      key={todo.id}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={itemVariants}
                      layout
                    >
                      <ListItem
                        dense
                        secondaryAction={
                          <IconButton 
                            edge="end" 
                            aria-label="delete" 
                            onClick={() => handleDeleteTodo(todo.id)} 
                            size="small"
                            sx={{
                              color: 'rgba(255, 255, 255, 0.6)',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                color: 'rgba(255, 255, 255, 0.9)',
                                transform: 'scale(1.1)',
                              }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        }
                        sx={{ 
                          transition: 'all 0.3s ease',
                          '&:hover': { 
                            bgcolor: 'rgba(255, 255, 255, 0.07)',
                            transform: 'translateX(4px)'
                          },
                          borderRadius: 'var(--radius-sm)',
                          mb: 0.7,
                          padding: '8px 16px',
                          backdropFilter: 'blur(8px)',
                          WebkitBackdropFilter: 'blur(8px)',
                          border: todo.completed ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(255, 255, 255, 0.1)',
                          opacity: todo.completed ? 0.7 : 1,
                          background: todo.completed ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.05)',
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 'auto', mr: 1.5 }}>
                          <Checkbox
                            className={`custom-checkbox ${todo.completed ? 'checked' : ''}`}
                            edge="start"
                            checked={todo.completed}
                            tabIndex={-1}
                            disableRipple
                            onClick={() => handleToggleTodo(todo.id)}
                            icon={
                              <UncheckedIcon 
                                sx={{ 
                                  color: 'rgba(255, 255, 255, 0.7)',
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    color: 'var(--primary-color)',
                                    transform: 'scale(1.1)'
                                  }
                                }} 
                              />
                            }
                            checkedIcon={
                              <CheckCircleIcon 
                                sx={{ 
                                  color: 'var(--primary-color)',
                                  filter: 'drop-shadow(0 0 3px rgba(138, 180, 248, 0.5))'
                                }} 
                              />
                            }
                            sx={{
                              '&.Mui-checked': {
                                '& svg': {
                                  animation: 'bounce 0.4s'
                                }
                              }
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText 
                          primary={todo.text} 
                          sx={{ 
                            textDecoration: todo.completed ? 'line-through' : 'none',
                            transition: 'all 0.3s ease',
                            '& .MuiListItemText-primary': {
                              color: todo.completed ? 'rgba(255, 255, 255, 0.7)' : 'white',
                              transition: 'color 0.3s ease',
                              fontWeight: todo.completed ? 'normal' : 500,
                              letterSpacing: '0.1px',
                              lineHeight: 1.4,
                            }
                          }} 
                        />
                      </ListItem>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </List>
          </Box>
        )}
      </Box>
      
      {/* Add Item Dialog */}
      <Dialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(15, 15, 20, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }
        }}
      >
        <DialogTitle sx={{ color: 'white' }}>
          Add New {activeTab === 0 ? 'Note' : activeTab === 1 ? 'Reminder' : 'Todo'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            variant="outlined"
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                '&.Mui-focused fieldset': { borderColor: 'var(--primary-color)' }
              },
              '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
              '& .MuiInputBase-input': { color: 'white' }
            }}
          />
          
          <TextField
            margin="dense"
            label={activeTab === 0 ? 'Content' : 'Description'}
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newItemContent}
            onChange={(e) => setNewItemContent(e.target.value)}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                '&.Mui-focused fieldset': { borderColor: 'var(--primary-color)' }
              },
              '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
              '& .MuiInputBase-input': { color: 'white' }
            }}
          />
          
          {activeTab === 1 && (
            <TextField
              margin="dense"
              label="Due Date"
              type="datetime-local"
              fullWidth
              variant="outlined"
              value={newItemDueDate}
              onChange={(e) => setNewItemDueDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                  '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&.Mui-focused fieldset': { borderColor: 'var(--primary-color)' }
                },
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                '& .MuiInputBase-input': { color: 'white' }
              }}
            />
          )}
          
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Priority</InputLabel>
              <Select
                value={newItemPriority}
                onChange={(e) => setNewItemPriority(e.target.value as any)}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary-color)' },
                  '& .MuiSelect-select': { color: 'white' }
                }}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Category</InputLabel>
              <Select
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value as any)}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary-color)' },
                  '& .MuiSelect-select': { color: 'white' }
                }}
              >
                <MenuItem value="personal">Personal</MenuItem>
                <MenuItem value="work">Work</MenuItem>
                <MenuItem value="shopping">Shopping</MenuItem>
                <MenuItem value="health">Health</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Cancel
          </Button>
          <Button
            onClick={handleAddItem}
            variant="contained"
            disabled={!newItemTitle.trim()}
            sx={{
              bgcolor: 'var(--primary-color)',
              '&:hover': { bgcolor: 'var(--primary-color)' }
            }}
          >
            Add {activeTab === 0 ? 'Note' : 'Reminder'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Settings Dialog */}
      <Dialog
        open={showSettingsDialog}
        onClose={() => setShowSettingsDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(15, 15, 20, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }
        }}
      >
        <DialogTitle sx={{ color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsIcon />
          Settings & Integrations
        </DialogTitle>
        <DialogContent>
          <Tabs
            value={0}
            sx={{
              mb: 3,
              '& .MuiTab-root': { color: 'rgba(255, 255, 255, 0.7)' },
              '& .Mui-selected': { color: 'white' },
              '& .MuiTabs-indicator': { backgroundColor: 'var(--primary-color)' }
            }}
          >
            <Tab label="Integrations" />
            <Tab label="Security" />
          </Tabs>
          
          {/* Google Calendar Integration */}
          <Card sx={{ mb: 2, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GoogleIcon sx={{ color: '#4285f4' }} />
                  <Typography variant="h6" sx={{ color: 'white' }}>
                    Google Calendar
                  </Typography>
                  {authState.google.isAuthenticated && (
                    <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                  )}
                </Box>
                <Button
                  variant={authState.google.isAuthenticated ? 'outlined' : 'contained'}
                  onClick={authState.google.isAuthenticated ? handleLogout : handleGoogleAuth}
                  disabled={loading}
                  sx={{
                    bgcolor: authState.google.isAuthenticated ? 'transparent' : 'var(--primary-color)',
                    borderColor: authState.google.isAuthenticated ? 'rgba(255, 255, 255, 0.3)' : 'var(--primary-color)',
                    color: 'white'
                  }}
                >
                  {authState.google.isAuthenticated ? 'Disconnect' : 'Connect'}
                </Button>
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Sync your calendar events as reminders. Uses secure OAuth 2.0 with PKCE for authentication.
              </Typography>
              {authState.google.error && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {authState.google.error}
                </Alert>
              )}
            </CardContent>
          </Card>
          
          {/* Telegram Integration */}
          <Card sx={{ mb: 2, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TelegramIcon sx={{ color: '#0088cc' }} />
                  <Typography variant="h6" sx={{ color: 'white' }}>
                    Telegram Saved Messages
                  </Typography>
                  {authState.telegram.isAuthenticated && (
                    <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                  )}
                </Box>
                <Button
                  variant={authState.telegram.isAuthenticated ? 'outlined' : 'contained'}
                  onClick={() => {
                    if (authState.telegram.isAuthenticated) {
                      handleLogout();
                    } else {
                      // Show Telegram setup dialog
                      const botToken = prompt('Enter your Telegram Bot Token:');
                      const chatId = prompt('Enter your Chat ID:');
                      if (botToken && chatId) {
                        handleTelegramAuth(botToken, chatId);
                      }
                    }
                  }}
                  disabled={loading}
                  sx={{
                    bgcolor: authState.telegram.isAuthenticated ? 'transparent' : 'var(--primary-color)',
                    borderColor: authState.telegram.isAuthenticated ? 'rgba(255, 255, 255, 0.3)' : 'var(--primary-color)',
                    color: 'white'
                  }}
                >
                  {authState.telegram.isAuthenticated ? 'Disconnect' : 'Setup'}
                </Button>
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Import your saved messages as notes. Requires a Telegram bot token and your chat ID.
              </Typography>
              {authState.telegram.error && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {authState.telegram.error}
                </Alert>
              )}
            </CardContent>
          </Card>
          
          {/* Security Settings */}
          <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <SecurityIcon sx={{ color: '#ff9800' }} />
                <Typography variant="h6" sx={{ color: 'white' }}>
                  Security Settings
                </Typography>
              </Box>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={securityConfig.enableEncryption}
                    onChange={(e) => setSecurityConfig(prev => ({ ...prev, enableEncryption: e.target.checked }))}
                  />
                }
                label="Enable data encryption"
                sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1 }}
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={securityConfig.autoLogout}
                    onChange={(e) => setSecurityConfig(prev => ({ ...prev, autoLogout: e.target.checked }))}
                  />
                }
                label="Auto logout after inactivity"
                sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1 }}
              />
              
              {securityConfig.autoLogout && (
                <TextField
                  label="Logout after (minutes)"
                  type="number"
                  value={securityConfig.logoutAfterMinutes}
                  onChange={(e) => setSecurityConfig(prev => ({ ...prev, logoutAfterMinutes: parseInt(e.target.value) || 30 }))}
                  sx={{
                    ml: 4,
                    mb: 1,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' }
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                    '& .MuiInputBase-input': { color: 'white' }
                  }}
                />
              )}
              
              <FormControlLabel
                control={
                  <Switch
                    checked={securityConfig.requireReauth}
                    onChange={(e) => setSecurityConfig(prev => ({ ...prev, requireReauth: e.target.checked }))}
                  />
                }
                label="Require periodic re-authentication"
                sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
              />
              
              {securityConfig.requireReauth && (
                <TextField
                  label="Re-auth interval (hours)"
                  type="number"
                  value={securityConfig.reauthIntervalHours}
                  onChange={(e) => setSecurityConfig(prev => ({ ...prev, reauthIntervalHours: parseInt(e.target.value) || 24 }))}
                  sx={{
                    ml: 4,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' }
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                    '& .MuiInputBase-input': { color: 'white' }
                  }}
                />
              )}
            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSettingsDialog(false)} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default NotesReminders; 