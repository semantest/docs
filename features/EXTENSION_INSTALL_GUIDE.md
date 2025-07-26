# 🧩 Semantest Chrome Extension Installation Guide

## ✅ Pre-Installation Checklist

1. **Extension is Built** ✓ (Located in `/extension.chrome/build/`)
2. **Chrome/Chromium Browser** is installed
3. **You have access** to Chrome's extension management page

## 📥 Installation Steps

### 1. Open Chrome Extension Management
- Open Chrome/Chromium browser
- Navigate to: `chrome://extensions/`
- Or use menu: **⋮ → More Tools → Extensions**

### 2. Enable Developer Mode
- Look for **"Developer mode"** toggle in the top right
- Turn it **ON** (toggle should be blue/enabled)

### 3. Load the Extension
- Click **"Load unpacked"** button (appears after enabling Developer mode)
- Navigate to: `/home/chous/work/semantest/extension.chrome`
- Click **"Select Folder"**

### 4. Verify Installation
- ✅ Extension should appear in the list as **"Semantest"** v1.0.2
- ✅ Extension icon should appear in browser toolbar
- ✅ If icon is hidden, click puzzle piece icon and pin Semantest

## 🧪 Test the Installation

### Basic Health Check
1. Click the **Semantest icon** in toolbar
2. Popup should appear showing:
   - Health status indicators
   - Connection status
   - Quick action buttons

### ChatGPT Integration Test
1. Navigate to **https://chatgpt.com** or **https://chat.openai.com**
2. Open Developer Console (F12)
3. Look for: `🏥 ChatGPT Health Check Addon loaded`
4. Verify content scripts are injected

### WebSocket Connection Test
1. Ensure the WebSocket server is running:
   ```bash
   cd /home/chous/work/semantest/nodejs.server
   npm start
   ```

2. Test the image generation flow:
   ```bash
   cd /home/chous/work/semantest
   ./generate-image.sh "test prompt"
   ```

## 🔧 Troubleshooting

### Extension Not Loading
- Ensure you selected the root `extension.chrome` folder (not `build/` or `src/`)
- Check for any error messages in the Extensions page
- Try reloading the extension

### Icon Not Visible
- Click the puzzle piece icon in Chrome toolbar
- Find "Semantest" and click the pin icon

### Content Scripts Not Working
- Refresh the ChatGPT page after installation
- Check console for any error messages
- Ensure you're on the correct domain (chatgpt.com or chat.openai.com)

### WebSocket Connection Failed
- Verify the server is running on port 3000
- Check firewall settings
- Look for errors in browser console

## 📝 Development Notes

### File Structure
```
extension.chrome/
├── manifest.json      # Extension configuration
├── src/              # Source files
│   ├── background/   # Service worker
│   ├── content/      # Content scripts
│   └── popup.*       # Extension popup UI
└── build/            # Built extension files
```

### Key Features Enabled
- ✅ ChatGPT state detection
- ✅ WebSocket communication
- ✅ Image download handling
- ✅ Health monitoring
- ✅ Telemetry consent (opt-in)

## 🚀 Ready to Test!

Once installed, the extension should be ready to handle:
- Image generation requests via WebSocket
- ChatGPT automation tasks
- Download management
- Project organization features

---

**Need help?** Check the console logs or reach out to the team!