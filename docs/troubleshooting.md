# Troubleshooting Guide - Notes & Reminders Widget

## Common Runtime Errors

### 1. "process is not defined" Error

**Error Message:**
```
Uncaught ReferenceError: process is not defined
```

**Cause:**
This error occurs when trying to access `process.env` in a browser environment. Vite uses `import.meta.env` instead of `process.env`.

**Solution:**
1. **Update environment variable access** in your code:
   ```typescript
   // ❌ Wrong (causes error)
   const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
   
   // ✅ Correct (Vite syntax)
   const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
   ```

2. **Update your `.env` file** to use `VITE_` prefix:
   ```env
   # ❌ Wrong
   REACT_APP_GOOGLE_CLIENT_ID=your_client_id
   
   # ✅ Correct
   VITE_GOOGLE_CLIENT_ID=your_client_id
   ```

3. **Restart the development server** after making changes:
   ```bash
   npm run dev
   ```

### 2. Chrome Extension APIs Not Available

**Error Message:**
```
Cannot read properties of undefined (reading 'identity')
```

**Cause:**
Chrome extension APIs are not available in development mode or when running outside of a Chrome extension context.

**Solution:**
The widget includes safety checks for Chrome APIs:
```typescript
// Safe Chrome API access
if (typeof chrome !== 'undefined' && chrome.identity) {
  // Use Chrome extension APIs
} else {
  // Fallback for development/web environment
}
```

### 3. Environment Variables Not Loading

**Symptoms:**
- OAuth authentication fails
- Google Client ID appears as empty string
- Integration features don't work

**Solutions:**

1. **Check file location**: Ensure `.env` file is in project root
2. **Check variable names**: Must start with `VITE_`
3. **Restart server**: Changes to `.env` require server restart
4. **Check syntax**: No spaces around `=` in `.env` file

**Example correct `.env` file:**
```env
VITE_GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
VITE_DEBUG_MODE=true
```

### 4. OAuth Authentication Issues

**Error Messages:**
- "OAuth error: invalid_client"
- "redirect_uri_mismatch"
- "unauthorized_client"

**Solutions:**

1. **Verify Client ID**: Check Google Cloud Console credentials
2. **Check Redirect URI**: Must match exactly in Google Cloud Console
3. **Enable APIs**: Ensure Google Calendar API is enabled
4. **Check Permissions**: Verify manifest.json permissions

**Correct manifest.json permissions:**
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

### 5. Data Not Persisting

**Symptoms:**
- Notes and reminders disappear after refresh
- Settings reset to defaults
- Authentication state lost

**Solutions:**

1. **Check storage permissions**: Ensure extension has storage permission
2. **Clear browser cache**: Sometimes corrupted cache causes issues
3. **Check encryption settings**: Verify encryption is working properly
4. **Browser storage limits**: Check if storage quota is exceeded

### 6. Telegram Integration Fails

**Error Messages:**
- "Invalid bot token format"
- "Unauthorized"
- "Chat not found"

**Solutions:**

1. **Verify bot token format**: Should be `123456789:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`
2. **Check chat ID**: Must be your personal chat ID with the bot
3. **Bot permissions**: Ensure bot can read messages
4. **Network connectivity**: Check if Telegram API is accessible

### 7. Performance Issues

**Symptoms:**
- Slow loading times
- High memory usage
- Laggy animations
- Browser freezing

**Solutions:**

1. **Reduce data size**: Limit number of notes/reminders
2. **Enable auto-logout**: Helps free memory
3. **Clear old data**: Remove unnecessary items
4. **Check browser resources**: Close other tabs/extensions

## Debug Mode

Enable debug mode for detailed logging:

1. **Set environment variable:**
   ```env
   VITE_DEBUG_MODE=true
   ```

2. **Or enable in browser console:**
   ```javascript
   localStorage.setItem('notes-reminders-debug', 'true');
   ```

3. **Check browser console** for detailed logs

## Browser Compatibility

### Supported Browsers
- ✅ Chrome 88+
- ✅ Edge 88+
- ✅ Firefox 85+ (with limitations)
- ❌ Safari (Chrome extension APIs not available)

### Known Limitations
- **Firefox**: Limited Chrome extension API support
- **Development mode**: Some features require Chrome extension context
- **Mobile browsers**: Not optimized for mobile use

## Getting Help

### Before Reporting Issues

1. **Check this troubleshooting guide**
2. **Enable debug mode** and check console logs
3. **Try in incognito mode** to rule out extension conflicts
4. **Clear browser cache and data**
5. **Update to latest version**

### Reporting Bugs

Include the following information:

1. **Error message** (exact text)
2. **Browser version** and operating system
3. **Steps to reproduce** the issue
4. **Console logs** (with debug mode enabled)
5. **Extension version** and configuration

### Support Channels

- **GitHub Issues**: Technical bugs and feature requests
- **Documentation**: Check setup and API guides
- **Email Support**: privacy@widgetopia.com

## Quick Fixes

### Reset Widget to Default State

```javascript
// Run in browser console to reset everything
localStorage.clear();
chrome.storage.local.clear();
location.reload();
```

### Clear Authentication Data

```javascript
// Run in browser console to clear auth data only
localStorage.removeItem('notes-reminders-auth');
chrome.storage.local.remove(['notes-reminders-auth']);
```

### Force Sync

```javascript
// Run in browser console to trigger manual sync
localStorage.setItem('notes-reminders-force-sync', 'true');
location.reload();
```

## Performance Optimization

### Recommended Settings

```env
# Optimal performance settings
VITE_ENABLE_ENCRYPTION=true
VITE_AUTO_LOGOUT_MINUTES=30
VITE_DEBUG_MODE=false
```

### Browser Settings

1. **Enable hardware acceleration** in browser settings
2. **Increase memory limit** for extensions if available
3. **Disable unnecessary extensions** to free resources
4. **Keep browser updated** for best performance

---

*Last Updated: December 2024*  
*For additional help, check the main documentation or contact support.* 