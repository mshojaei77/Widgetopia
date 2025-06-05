 # Widgetopia - Source Code Build Instructions for AMO Review

This document provides comprehensive instructions for Mozilla Add-on reviewers to build the Widgetopia extension from source code.

## Build Environment Requirements

### Operating System
- **Tested on**: Windows 10/11, macOS, Linux (Ubuntu 20.04+)
- **Default AMO Environment Compatible**: Ubuntu 24.04 LTS

### Required Tools and Versions
- **Node.js**: Version 18+ (tested with Node 22 LTS - matches AMO default)
- **npm**: Version 9+ (tested with npm 10 - matches AMO default)
- **Git**: Any recent version (for cloning dependencies)

### System Requirements
- **RAM**: Minimum 4GB (8GB+ recommended for faster builds)
- **Disk Space**: At least 2GB free space
- **CPU**: Multi-core recommended (build uses parallel processing)

## Dependencies Overview

This extension uses the following build tools and bundlers:
- **Vite 6.2.6**: Main build tool and development server
- **Rollup**: Bundler (included with Vite)
- **Terser 5.39.2**: JavaScript minifier
- **TypeScript 5.8.3**: TypeScript compiler
- **React 19.1.0**: UI framework
- **@vitejs/plugin-react**: React support for Vite

All tools are open source and can be run locally.

## Pre-Build Setup

### 1. Install Node.js and npm
If not already installed, download from: https://nodejs.org/
- Choose the LTS version (currently Node 22)
- npm is included with Node.js installation

### 2. Verify Installation
```bash
node --version  # Should show v18+ (v22+ recommended)
npm --version   # Should show v9+ (v10+ recommended)
```

## Build Instructions

### Step 1: Install Dependencies
```bash
npm install
```
**Important**: This command uses the included `package-lock.json` file to ensure exact dependency versions match the developer's environment.

### Step 2: Run the Complete Build Process
```bash
npm run build:extension
```

This command performs the following steps:
1. Runs `vite build` to compile and bundle the source code
2. Copies necessary files to the `dist/` directory
3. Runs security analysis
4. Creates the final `widgetopia.zip` extension package

### Alternative: Step-by-Step Build
If you prefer to run each step individually:

```bash
# Step 1: Build the extension
npm run build

# Step 2: Create the extension package
node build-extension.js
```

## Build Output

After successful build, you will find:
- **`dist/` directory**: Contains the complete built extension
- **`widgetopia.zip`**: Final extension package (identical to the submitted extension)

### Key Built Files
- `dist/index.html`: Main extension page
- `dist/manifest.json`: Extension manifest (copied from source)
- `dist/assets/main.js`: Bundled and minified JavaScript
- `dist/assets/main.css`: Bundled and minified CSS
- `dist/icons/`: Extension icons
- `dist/wallpapers/`, `dist/sample/`, etc.: Static assets

## Build Process Details

### What Vite Does
1. **Bundles** multiple TypeScript/JavaScript files into single files
2. **Minifies** JavaScript using Terser for smaller file sizes
3. **Processes** React JSX/TSX files into standard JavaScript
4. **Bundles** CSS and processes imports
5. **Copies** static assets from `public/` directory
6. **Generates** optimized production builds

### Minification Settings
The build uses Terser with these security-focused settings:
- Removes console statements and debuggers
- Does NOT use unsafe optimizations
- Preserves critical function names ('Function', 'eval')
- Maintains code readability for review

## Verification Steps

To verify the build matches the submitted extension:

### 1. Compare File Structure
```bash
# List all files in the built extension
find dist/ -type f | sort
```

### 2. Compare Key Files
The following files should be identical between your build and the submitted extension:
- `manifest.json`
- `index.html`
- All files in `assets/`, `icons/`, `wallpapers/` directories

### 3. Zip Comparison
After running the build, compare `widgetopia.zip` with the submitted extension package.

## Troubleshooting

### Common Issues

**Issue**: "npm install" fails
**Solution**: 
- Ensure Node.js 18+ is installed
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules/` and try again

**Issue**: Build fails with memory errors
**Solution**: Increase Node.js memory limit:
```bash
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build:extension
```

**Issue**: File permission errors (Linux/macOS)
**Solution**: Ensure proper permissions:
```bash
chmod +x build-extension.js
```

## Security Notes

### No Remote Code Execution
- All build tools run locally
- No web-based compilation services used
- All dependencies are from npm registry (public, auditable)

### Code Integrity
- The build process is deterministic
- Uses locked dependency versions via `package-lock.json`
- No obfuscation is used (only standard minification for size reduction)

## File Inclusion Checklist

This source package includes:
- ✅ All source code files (`src/`, `public/`)
- ✅ Build configuration (`vite.config.ts`, `tsconfig.json`)
- ✅ Package management files (`package.json`, `package-lock.json`)
- ✅ Build scripts (`build-extension.js`, `fix-security.js`)
- ✅ Extension manifest (`manifest.json`)
- ✅ This README with complete build instructions
- ✅ Static assets (`public/` directory contents)

## Support Information

- **Extension Version**: 2.0.0
- **Build Tool**: Vite 6.2.6
- **Last Updated**: January 2025
- **Contact**: GitHub Issues at https://github.com/mshojaei77/widgetopia/issues

## Quick Reference Commands

```bash
# Install dependencies (required first step)
npm install

# Full build process (recommended)
npm run build:extension

# Development build (for testing)
npm run build

# Development server (for testing changes)
npm run dev
```

---

**For AMO Reviewers**: If you encounter any issues with these build instructions or need clarification on any step, please don't hesitate to reach out. The build process is designed to be straightforward and reproducible.