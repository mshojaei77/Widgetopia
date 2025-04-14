# Widgetopia - Chrome New Tab Extension

A customizable new tab page Chrome extension with useful widgets, built with React, TypeScript, and Bun.

## Features

- **Clock Widget**: Displays current time and date
- **Weather Widget**: Shows weather information (mock data for now, can be connected to a real API)
- **Todo List Widget**: Manage your tasks directly from new tabs
- **Quick Links Widget**: Access your favorite websites quickly

## Tech Stack

- **Bun**: JavaScript runtime and package manager
- **React**: UI library
- **TypeScript**: Type-safe JavaScript
- **Vite**: Build tool and development server
- **Chrome Extension API**: Browser integration

## Development

### Prerequisites

- [Bun](https://bun.sh/) installed
- Google Chrome browser

### Setup

1. Clone the repository
2. Install dependencies:
   ```
   bun install
   ```
3. Start the development server:
   ```
   bun run dev
   ```

### Building the Extension

1. Build the extension:
   ```
   bun run build
   ```
2. This will create a `dist` directory with the built extension.

### Loading in Chrome

1. Open Chrome and navigate to `chrome://extensions`
2. Enable "Developer mode" in the top-right
3. Click "Load unpacked" and select the `dist` directory
4. Open a new tab to see your custom new tab page

## Project Structure

```
widgetopia/
├── public/             # Static assets
│   └── icons/          # Extension icons
├── src/                # Source code
│   ├── components/     # Reusable React components
│   ├── widgets/        # Individual widget components
│   ├── App.tsx         # Main application component
│   └── main.tsx        # React entry point
├── index.html          # HTML entry point
├── manifest.json       # Chrome extension manifest
├── vite.config.ts      # Vite configuration
└── package.json        # Project metadata and dependencies
```

## Notes

- The extension currently uses Chrome's storage API to persist todo items and quick links.
- The weather widget uses mock data for demonstration purposes.
- Icons in the QuickLinks widget are simple emoji characters.

## Future Improvements

- Connect to real weather API
- Add more customization options
- Add settings page
- Implement drag-and-drop for widget positioning
- Add more widget types
