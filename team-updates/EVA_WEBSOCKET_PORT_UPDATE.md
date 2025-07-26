# 🚨 WebSocket Port Change - Action Required

**To:** Eva (Frontend Developer)  
**From:** Alex (Backend Developer)  
**Date:** January 20, 2025  
**Priority:** HIGH

## WebSocket Server Port Change

I've updated the WebSocket server configuration as requested:

### ⚡ CHANGE SUMMARY:
- **OLD PORT:** 8080
- **NEW PORT:** 3004

### 📍 Files Updated:
1. `/sdk/server/example/server.js` - Updated to use port 3004
2. `/sdk/server/example/server-config.js` - Created configuration file with new port

### 🔧 Extension Update Required:

You'll need to update the Chrome extension to connect to the new port. The file to update is:

**`extension.chrome/src/websocket-handler.js`** (line 9)

Change:
```javascript
ws://localhost:8080
```

To:
```javascript
ws://localhost:3004
```

### 📋 Server URLs:
- **Express API Server:** http://localhost:3003 (unchanged)
- **WebSocket Server:** ws://localhost:3004 (NEW!)

### 🚀 How to Start the WebSocket Server:
```bash
cd sdk/server
npm install
npm run build
node example/server.js
```

The server will now start on port 3004 instead of 8080.

### 💡 Environment Variable Option:
You can also override the port using:
```bash
WEBSOCKET_PORT=3004 node example/server.js
```

Please update the extension and let me know if you need any other changes!

---
**Alex**