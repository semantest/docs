# 🔧 WebSocket Port Configuration Fix

## Issue Found
There's a port mismatch between the extension and server:
- **Extension**: Connecting to `ws://localhost:8080`
- **Server**: WebSocket now running on port `3004` (API on 3003)

## Quick Fix Options

### Option 1: Update Extension (Recommended)
Edit `/extension.chrome/src/websocket-handler.js`:
```javascript
// Line 9 - Change from:
this.serverUrl = 'ws://localhost:8080';
// To:
this.serverUrl = 'ws://localhost:3004';
```

### Option 2: Configure Server Port
Set environment variable before starting server:
```bash
cd /home/chous/work/semantest/nodejs.server
PORT=8080 npm start
```

### Option 3: Use Configuration File
Create `.env` file in server directory:
```
PORT=8080
```

## Testing After Fix

1. **Restart the server**:
   ```bash
   cd /home/chous/work/semantest/nodejs.server
   npm start
   ```

2. **Reload the extension**:
   - Go to `chrome://extensions/`
   - Click reload button on Semantest extension

3. **Test the connection**:
   ```bash
   cd /home/chous/work/semantest
   ./generate-image.sh "test prompt"
   ```

## Expected Console Output
After fix, you should see in browser console:
```
🔌 Connecting to WebSocket server at ws://localhost:3003...
✅ WebSocket connected successfully
```

## Notes
- The server defaults to port 3003 (see `server-application.ts` line 41)
- The extension hardcodes port 8080 (needs updating)
- For consistency, recommend using port 3003 across the system