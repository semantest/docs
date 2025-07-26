# 🚀 WEBSOCKET 404 - QUICK FIX GUIDE

## For ANYONE who can see this:

### The Problem:
```
WebSocket connection to 'ws://localhost:3003/' failed: 
Error during WebSocket handshake: Unexpected response code: 404
```

### Root Cause:
- Extension expects WebSocket at `ws://localhost:3003/`
- But Express server is running (nodejs.server)
- Need actual WebSocket server from sdk/server

### IMMEDIATE FIX OPTIONS:

## Option 1: Quick Extension Update (Eva)
Edit `extension.chrome/src/websocket-handler.js` line 9:
```javascript
// FROM:
this.serverUrl = 'ws://localhost:3003';
// TO:
this.serverUrl = 'ws://localhost:3003/socket.io/?EIO=4&transport=websocket';
```

## Option 2: Start Correct Server (Alex)
```bash
# Stop current server
pkill -f "node.*3003"

# Start WebSocket server
cd sdk/server
npm run build
node dist/start-server.js
```

## Option 3: Enable Fallback (Eva)
Add after line 9 in websocket-handler.js:
```javascript
this.fallbackUrl = 'wss://api.extension.semantest.com';
// Then implement fallback logic
```

### Testing:
```bash
# Test WebSocket connection
wscat -c ws://localhost:3003
```

### This blocks ALL users from installing!
**Please fix IMMEDIATELY!**

---
**Duration**: 1+ hour and counting
**Impact**: Total service outage
**Priority**: HIGHEST