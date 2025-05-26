# Environment Setup - Notes & Reminders Widget

## Environment Variables

The Notes & Reminders widget uses Vite's environment variable system. Create a `.env` file in your project root with the following configuration:

### Required Variables

```env
# Google OAuth Client ID (required for Google Calendar integration)
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### Optional Variables

```env
# Custom OAuth redirect URI (defaults to chrome extension redirect)
VITE_OAUTH_REDIRECT_URI=https://your-domain.com/oauth/callback

# Security Configuration
VITE_ENABLE_ENCRYPTION=true
VITE_AUTO_LOGOUT_MINUTES=30
VITE_REAUTH_INTERVAL_HOURS=24

# Development settings
VITE_DEBUG_MODE=false
```

## Setup Instructions

### 1. Create Environment File

Create a `.env` file in your project root:

```bash
# Copy the example configuration
cp .env.example .env

# Edit with your actual values
# Use your preferred text editor
```

### 2. Google OAuth Setup

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create or select a project**
3. **Enable Google Calendar API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"
4. **Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - For Chrome extension: `chrome-extension://YOUR_EXTENSION_ID/oauth`
     - For development: `http://localhost:3000/oauth/callback`
5. **Copy the Client ID** to your `.env` file

### 3. Environment File Example

```env
# .env file example
VITE_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
VITE_ENABLE_ENCRYPTION=true
VITE_AUTO_LOGOUT_MINUTES=30
VITE_DEBUG_MODE=false
```

## Security Notes

- **Never commit your `.env` file** to version control
- **Keep your Google Client ID secure** - it should only be used in your application
- **Use different credentials** for development and production
- **Regularly rotate your credentials** for security

## Troubleshooting

### Common Issues

1. **"process is not defined" error**:
   - Make sure you're using `VITE_` prefix for environment variables
   - Use `import.meta.env.VITE_VARIABLE_NAME` instead of `process.env.VARIABLE_NAME`

2. **Environment variables not loading**:
   - Ensure the `.env` file is in the project root
   - Restart the development server after creating/modifying `.env`
   - Check that variable names start with `VITE_`

3. **OAuth not working**:
   - Verify the Google Client ID is correct
   - Check that the redirect URI matches exactly
   - Ensure Google Calendar API is enabled

### Debug Mode

Enable debug mode to see detailed logging:

```env
VITE_DEBUG_MODE=true
```

Then check the browser console for detailed logs.

## Production Deployment

For production deployment:

1. **Set production environment variables** in your hosting platform
2. **Use production Google OAuth credentials**
3. **Disable debug mode**: `VITE_DEBUG_MODE=false`
4. **Enable security features**: `VITE_ENABLE_ENCRYPTION=true`

## Environment Variable Reference

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `VITE_GOOGLE_CLIENT_ID` | string | '' | Google OAuth 2.0 Client ID |
| `VITE_OAUTH_REDIRECT_URI` | string | auto | Custom OAuth redirect URI |
| `VITE_ENABLE_ENCRYPTION` | boolean | true | Enable data encryption |
| `VITE_AUTO_LOGOUT_MINUTES` | number | 30 | Auto-logout timeout |
| `VITE_REAUTH_INTERVAL_HOURS` | number | 24 | Re-authentication interval |
| `VITE_DEBUG_MODE` | boolean | false | Enable debug logging | 