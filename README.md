# Widgetopia - Your Custom Chrome New Tab Page

Make your browser's new tab page useful and beautiful with customizable widgets!
![image](https://github.com/user-attachments/assets/b64d08cb-f6cb-4713-a6d1-5686e7175e05)

## How to Install (Easy Method)

1.  **Download the latest version:**
    *   Click [here](https://raw.githubusercontent.com/mshojaei77/Widgetopia/refs/heads/main/widgetopia.zip) to download `widgetopia`.

2.  **Unzip the downloaded file:**
    *   Find the downloaded `widgetopia-v1.0.0.zip` file (usually in your Downloads folder).
    *   Right-click on the file and select "Extract All..." or "Unzip". This will create a new folder named `widgetopia-v1.0.0`.

3.  **Load the extension in Chrome:**
    *   Open Chrome and type `chrome://extensions/` in the address bar, then press Enter.
    *   Turn on **"Developer mode"** using the toggle switch in the top-right corner.
    *   Click the **"Load unpacked"** button (usually appears on the top-left).
    *   Navigate to the folder where you unzipped the files (the `widgetopia-v1.0.0` folder) and select it.

4.  **Enjoy!**
    *   Open a new tab in Chrome to see your Widgetopia dashboard!

## Frequently Asked Questions

**Q: Will my data be shared or stored online?**
A: No. All your data stays in your browser using Chrome's built-in storage.

**Q: Can I customize the layout?**
A: Yes, there is drag-and-drop customization now !

**Q: How do I change settings?**
A: Click the ⚙️ icon in the top-right corner of the new tab page.

## Need Help?

If you encounter any issues or have questions, please [open an issue](https://github.com/mshojaei77/widgetopia/issues) on our GitHub repository.

## For Developers (Build from Source)

If you want to build the extension from the source code:

1. Clone this repository:
   ```
   git clone https://github.com/mshojaei77/widgetopia.git
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

4. Load the unpacked extension in Chrome (follow steps 3c and 4 from the "Easy Method" above, but select the `dist` folder instead).

If you're interested in contributing to Widgetopia, please see our [CONTRIBUTING.md](CONTRIBUTING.md) file.

## License

Widgetopia is released under the [MIT License](LICENSE). This means you are free to use, modify, distribute, and even use it commercially, as long as you include the original copyright notice. See the [LICENSE](LICENSE) file for full details.
