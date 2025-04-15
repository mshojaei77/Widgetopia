# Widgetopia - Your Custom Chrome New Tab Page

Make your browser's new tab page useful and beautiful with customizable widgets!

![Widgetopia Screenshot](public/screenshot.png)

## What is Widgetopia?

Widgetopia replaces Chrome's default new tab page with a personalized dashboard that includes:

- ⏰ **Clock Widget** - Never lose track of time
- 🌤️ **Weather Widget** - See the current weather at a glance
- ✅ **Todo List** - Keep track of your tasks where you'll actually see them
- 🔗 **Quick Links** - One-click access to your favorite websites

## How to Install

Currently, Widgetopia is under development and not yet available in the Chrome Web Store. To try it out:

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/widgetopia.git
   ```

2. Install dependencies using Bun:
   ```
   cd widgetopia
   bun install
   ```

3. Build the extension:
   ```
   bun run build
   ```
   This creates a `dist` folder with the built extension.

4. Open Chrome and go to `chrome://extensions/`

5. Turn on "Developer mode" (toggle in the top-right corner)

6. Click "Load unpacked" and select the `dist` folder from your project

7. Open a new tab to enjoy your custom dashboard!

## How to Use

### Todo Widget
- Type your task and press Enter to add it
- Click a task to mark it as complete
- Click the ❌ to remove a task

### Quick Links
- Click the + button to add a new link
- Enter the website URL and a name
- Click on any link to visit that website

### Weather Widget
- Currently shows sample data (real weather integration coming soon!)

## Frequently Asked Questions

**Q: Will my data be shared or stored online?**
A: No. All your data stays in your browser using Chrome's built-in storage.

**Q: Can I customize the layout?**
A: Not yet, but we're working on drag-and-drop customization for a future release!

**Q: How do I change settings?**
A: Click the ⚙️ icon in the top-right corner of the new tab page.

## Need Help?

If you encounter any issues or have questions, please [open an issue](https://github.com/yourusername/widgetopia/issues) on our GitHub repository.

## For Developers

If you're interested in contributing to Widgetopia, please see our [CONTRIBUTING.md](CONTRIBUTING.md) file.
