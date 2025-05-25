# Contributing to Widgetopia

Thank you for your interest in contributing to Widgetopia! This guide will help you get set up with the development environment.

## Tech Stack

- **Bun**: JavaScript runtime and package manager
- **React**: UI library
- **TypeScript**: Type-safe JavaScript
- **Vite**: Build tool and development server
- **Chrome Extension API**: Browser integration

## Development Setup

### Prerequisites

- [Bun](https://bun.sh/) installed
- Google Chrome browser

### Getting Started

1. Clone the repository

   ```
   git clone https://github.com/yourusername/widgetopia.git
   cd widgetopia
   ```
2. Install dependencies:

   ```
   bun install
   ```
3. Start the development server:

   ```
   https://github.com/trendingbun run dev
   ```

### Building the Extension

1. Build the extension:

   ```
   bun run build
   ```
2. This will create a `dist` directory with the built extension.

### Testing in Chrome

1. Open Chrome and navigate to `chrome://extensions`
2. Enable "Developer mode" in the top-right corner
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

## Technical Notes

- The extension uses Chrome's storage API to persist todo items and quick links.
- The weather widget currently uses mock data for demonstration purposes.
- Icons in the QuickLinks widget are simple emoji characters.

## Future Development Plans

- Add more customization options
- Add more widgets
- add more browswer (firefox) support

## Pull Request Guidelines

1. Fork the repository and create a new branch for your feature
2. Make your changes and test thoroughly
3. Submit a pull request with a clear description of the changes
4. Ensure your code follows the existing style conventions

## Questions?

Feel free to open an issue if you have any questions or need clarification about the codebase.
