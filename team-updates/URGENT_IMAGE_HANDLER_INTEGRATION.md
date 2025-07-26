# URGENT: Image Handler Integration Guide

## 🚨 Critical Updates

### 1. Auto-Start Feature Added ✅
The `generate-image.sh` script now:
- Checks if server is running on ws://localhost:8080
- Automatically starts the server if not running
- Installs dependencies if missing
- Creates log at `/tmp/semantest-server.log`

### 2. Handler Integration Steps

#### Step 1: Wire handler in server.ts
```typescript
// In sdk/server/src/server.ts
import { createImageHandler } from './handlers/image-handler';
import { ImageEventTypes } from '@semantest/contracts';

// In the WebSocketServer class constructor or start method:
const imageHandler = createImageHandler();

// Add event listener
this.on('client-message', async (client, message) => {
  if (message.type === ImageEventTypes.REQUEST_RECEIVED) {
    await imageHandler.handleImageRequest(message.payload);
    
    // Listen for download completion
    imageHandler.once(ImageEventTypes.DOWNLOADED, (payload) => {
      // Send back to client
      client.send(JSON.stringify({
        type: ImageEventTypes.DOWNLOADED,
        payload
      }));
    });
  }
});
```

#### Step 2: Update message router (if needed)
The message router may need to recognize image events. Check if custom events are already supported.

#### Step 3: Ensure handler exports are correct
```typescript
// In sdk/server/src/handlers/index.ts (create if not exists)
export * from './image-handler';
```

## 🧪 Quick Test

### Kill any running server:
```bash
pkill -f "npm run dev"
```

### Test auto-start:
```bash
./generate-image.sh "a robot coding"
```

### Expected output:
```
⚠️  Semantest server is not running on localhost:8080
🚀 Starting Semantest WebSocket server...
✅ Server is now running on ws://localhost:8080
✅ Connected to Semantest server
📤 Sending ImageRequestReceived event...
🎉 SUCCESS! Image downloaded
📍 File path: /home/user/Downloads/chatgpt_img-xxxxx.png
```

## 📊 Current Team Status

### Active Members:
- **Window 0**: PM (me) - Coordinating
- **Window 1**: Architect - Implementing handler
- **Window 2**: Backend1 - Testing integration

### Missing Members:
- Windows 3-8 not found/created

## ⚡ Next Steps

1. **Architect**: Complete handler integration in server.ts
2. **Backend1**: Test the auto-start functionality
3. **Both**: Ensure ImageRequestReceived → ImageDownloaded flow works

## 🆘 If Issues Arise

Check server logs:
```bash
tail -f /tmp/semantest-server.log
```

Check if handler is receiving events:
```bash
# Add console.log in handler
console.log('Received event:', message);
```

Verify WebSocket connection:
```bash
wscat -c ws://localhost:8080
```