# 🔍 WebSocket Connection Troubleshooting

## Error: "WebSocket not connected"

This error occurs when the Chrome extension cannot connect to the WebSocket server.

## Quick Checklist

### 1. Is the WebSocket Server Running?
The WebSocket server needs to be started separately:

```bash
# Navigate to SDK server directory
cd /home/chous/work/semantest/sdk/server

# Install dependencies (if not done)
npm install

# Build the server
npm run build

# Start the WebSocket server
node example/server.js
```

You should see output like:
```
🚀 WebSocket server listening on port 3004
```

### 2. Check Extension Console
1. Open the ChatGPT page where extension is active
2. Press F12 to open Developer Tools
3. Look in Console for WebSocket connection attempts
4. You should see messages like:
   - `🔌 WebSocket Handler initializing...`
   - `🔌 Connecting to WebSocket server at ws://localhost:3004...`

### 3. Verify Extension is Reloaded
After our port changes, the extension needs to be reloaded:
1. Go to `chrome://extensions/`
2. Find "Semantest" extension
3. Click the refresh/reload button
4. Try the test again

### 4. Check Network Tab
In Developer Tools:
1. Go to Network tab
2. Filter by "WS" (WebSocket)
3. Look for connection attempts to `localhost:3004`
4. Check if connection is:
   - ❌ Failed (red) - Server not running
   - ✅ Connected (101 status) - Should work

### 5. Alternative Test
Try running the command line test:
```bash
cd /home/chous/work/semantest
./generate-image.sh "test prompt"
```

This will also attempt to connect to the WebSocket server.

## Common Issues

1. **Server not started**: Most common issue
2. **Port blocked**: Firewall or another service using port 3004
3. **Extension not reloaded**: Changes not picked up
4. **Wrong port**: Extension still trying old port

## Need More Help?
- Check server logs in terminal where you started it
- Check browser console for detailed error messages
- The WebSocket handler is in: `extension.chrome/build/websocket-handler.js`