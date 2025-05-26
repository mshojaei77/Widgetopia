# Notes & Reminders Widget Setup Guide

## Overview

The Notes & Reminders widget provides a secure, production-ready solution for managing personal notes and reminders with optional integration to Google Calendar and Telegram saved messages.

## Features

### Core Features
- ✅ Create, edit, and delete notes
- ✅ Create, edit, and delete reminders with due dates
- ✅ Priority levels (Low, Medium, High)
- ✅ Categories (Personal, Work, Shopping, Health, Other)
- ✅ Tags for notes
- ✅ Overdue reminder notifications
- ✅ Today/Tomorrow smart date formatting

### Security Features
- ✅ Data encryption using secure storage
- ✅ OAuth 2.0 with PKCE for Google Calendar
- ✅ Secure credential management
- ✅ Auto-logout after inactivity
- ✅ Periodic re-authentication
- ✅ State verification for CSRF protection

### Integrations
- ✅ Google Calendar (read-only events as reminders)
- ✅ Telegram Bot API (saved messages as notes)

## Setup Instructions

### 1. Basic Setup

The widget works out of the box with local storage. No additional setup required for basic note and reminder functionality.

### 2. Google Calendar Integration

#### Prerequisites
- Google Cloud Console project
- OAuth 2.0 credentials configured

#### Steps:

1. **Create Google Cloud Project**
   ```bash
   # Go to https://console.cloud.google.com/
   # Create a new project or select existing one
   ```

2. **Enable Google Calendar API**
   ```bash
   # In Google Cloud Console:
   # APIs & Services > Library > Search "Google Calendar API" > Enable
   ```

3. **Create OAuth 2.0 Credentials**
   ```bash
   # APIs & Services > Credentials > Create Credentials > OAuth 2.0 Client ID
   # Application type: Web application
   # Authorized redirect URIs: Add your extension's redirect URI
   ```

4. **Configure Environment Variables**
   Create a `.env` file in your project root:
   ```env
   VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
   ```

5. **Update Manifest Permissions**
   The manifest.json already includes necessary permissions:
   ```json
   {
     "permissions": ["storage", "history", "identity"],
     "host_permissions": [
       "https://www.googleapis.com/*",
       "https://accounts.google.com/*",
       "https://oauth2.googleapis.com/*"
     ]
   }
   ```

### 3. Telegram Integration

#### Prerequisites
- Telegram Bot Token
- Your Telegram Chat ID

#### Steps:

1. **Create Telegram Bot**
   ```bash
   # Message @BotFather on Telegram
   # Send: /newbot
   # Follow instructions to get bot token
   ```

2. **Get Your Chat ID**
   ```bash
   # Method 1: Message @userinfobot on Telegram
   # Method 2: Send message to your bot, then visit:
   # https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
   ```

3. **Configure in Widget**
   - Open widget settings
   - Click "Setup" for Telegram
   - Enter your bot token and chat ID
   - Click "Connect"

## Security Configuration

### Encryption Settings

```typescript
interface SecurityConfig {
  enableEncryption: boolean;        // Encrypt stored data
  autoLogout: boolean;             // Auto logout after inactivity
  logoutAfterMinutes: number;      // Minutes before auto logout
  requireReauth: boolean;          // Require periodic re-auth
  reauthIntervalHours: number;     // Hours between re-auth
}
```

### Default Security Settings
- Data encryption: **Enabled**
- Auto logout: **Disabled** (can be enabled in settings)
- Logout timer: **30 minutes**
- Periodic re-auth: **Disabled** (can be enabled in settings)
- Re-auth interval: **24 hours**

## API Reference

### Storage Structure

```typescript
// Notes storage
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

// Reminders storage
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
```

### OAuth 2.0 Flow

```typescript
// PKCE implementation for security
class OAuth2Security {
  static async generatePKCE(): Promise<{
    codeVerifier: string;
    codeChallenge: string;
  }>;
  
  static async authenticateGoogle(): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresAt: number;
  } | null>;
  
  static async refreshGoogleToken(refreshToken: string): Promise<{
    accessToken: string;
    expiresAt: number;
  } | null>;
}
```

## Troubleshooting

### Common Issues

1. **Google OAuth Not Working**
   - Verify client ID is correct
   - Check redirect URI matches exactly
   - Ensure Calendar API is enabled
   - Check browser console for errors

2. **Telegram Integration Fails**
   - Verify bot token format (should be: `123456789:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`)
   - Ensure chat ID is correct
   - Check if bot has permission to read messages
   - Verify network connectivity

3. **Data Not Persisting**
   - Check if storage permissions are granted
   - Verify encryption settings
   - Clear browser cache and try again

4. **Performance Issues**
   - Reduce sync frequency
   - Limit number of imported items
   - Enable auto-logout to free memory

### Debug Mode

Enable debug logging by adding to console:
```javascript
localStorage.setItem('notes-reminders-debug', 'true');
```

## Security Best Practices

### For Users
1. **Use Strong Bot Tokens**: Never share your Telegram bot token
2. **Regular Token Rotation**: Regenerate tokens periodically
3. **Enable Encryption**: Always keep data encryption enabled
4. **Monitor Access**: Check OAuth permissions regularly
5. **Use Auto-Logout**: Enable for shared computers

### For Developers
1. **HTTPS Only**: All API calls use HTTPS
2. **PKCE Implementation**: OAuth 2.0 with PKCE for security
3. **State Verification**: CSRF protection implemented
4. **Secure Storage**: Credentials encrypted at rest
5. **Token Refresh**: Automatic token refresh handling
6. **Error Handling**: Comprehensive error handling and logging

## Production Deployment

### Environment Variables
```env
# Required for Google Calendar
VITE_GOOGLE_CLIENT_ID=your_client_id

# Optional security settings
VITE_ENABLE_ENCRYPTION=true
VITE_AUTO_LOGOUT_MINUTES=30
VITE_REAUTH_INTERVAL_HOURS=24
```

### Build Configuration
```bash
# Install dependencies
npm install

# Build for production
npm run build

# The widget is automatically included in the build
```

### Chrome Extension Store
1. Update manifest.json version
2. Create extension package
3. Submit for review with proper OAuth configuration
4. Include privacy policy for data handling

## Support

For issues and feature requests, please check:
1. This documentation
2. Browser console for error messages
3. Network tab for API call failures
4. Extension permissions in browser settings

## Changelog

### v1.0.0 (Current)
- Initial release
- Google Calendar integration
- Telegram integration
- Security features
- Production-ready implementation 