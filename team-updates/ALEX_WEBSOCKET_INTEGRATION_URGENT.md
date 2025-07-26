# 🚨 URGENT: Alex - WebSocket Integration Needed

## Priority: CRITICAL 🔴

Alex, the entire team is blocked waiting for the WebSocket integration of the image handler. Here's exactly what needs to be done:

### Current Status
✅ Image handler is fully implemented at: `/sdk/server/src/handlers/image-handler.ts`
✅ Event schemas are defined in contracts
✅ Extension is built and ready
❌ **MISSING: WebSocket server doesn't know about the image handler**

### Required Changes

#### 1. In `/sdk/server/src/server.ts`:
```typescript
// Add import at top
import { createImageHandler } from './handlers/image-handler';

// In constructor or start(), add:
const imageHandler = createImageHandler();

// Wire up the events
imageHandler.on('error', (error) => {
  console.error('Image handler error:', error);
});

imageHandler.on(ImageEventTypes.DOWNLOADED, (payload) => {
  // Broadcast to all clients
  this.messageRouter.broadcastEvent({
    type: ImageEventTypes.DOWNLOADED,
    payload
  });
});
```

#### 2. In the message handling section:
```typescript
// When receiving ImageRequestReceived event
if (event.type === ImageEventTypes.REQUEST_RECEIVED) {
  await imageHandler.handleImageRequest(event.payload);
}
```

### Quick Test
Once integrated, test with:
```bash
# Send test event via WebSocket
echo '{"type":"chatgpt:image/request-received","payload":{"prompt":"test image"}}' | websocat ws://localhost:8080
```

### Time Estimate
- Integration: 30 minutes
- Testing: 30 minutes
- Total: 1 hour

### Impact
- Quinn is blocked from testing
- Dana needs this to complete shell script
- Eva's UI work depends on seeing events flow

Please prioritize this ASAP. The rest of the team is ready to move once this is done!

Let me know if you need any clarification or run into issues.

- PM