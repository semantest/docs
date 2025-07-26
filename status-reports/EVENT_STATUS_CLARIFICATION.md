# Event Status Clarification - IMPORTANT! ⚠️

## The event name has changed!

### ❌ OLD (incorrect): `imageDownloadRequested`
### ✅ NEW (correct): `ImageRequestReceived`

## Current Implementation Status:

### ✅ IMPLEMENTED:
1. **Event Definitions** (`/sdk/contracts/src/custom-events.ts`)
   - `ImageRequestReceived` event (NOT imageDownloadRequested)
   - `ImageDownloaded` event
   - Full TypeScript interfaces with payload types

2. **Event Handler** (`/sdk/server/src/handlers/image-handler.ts`)
   - Complete implementation of ImageEventHandler
   - Handles `ImageRequestReceived` events
   - Emits `ImageDownloaded` events
   - Mock image generation (placeholder)

3. **Event Types Available:**
   ```typescript
   ImageEventTypes.REQUEST_RECEIVED     // "chatgpt:image/request/received"
   ImageEventTypes.DOWNLOADED           // "chatgpt:image/downloaded"
   ImageEventTypes.GENERATION_STARTED   // "chatgpt:image/generation/started"
   ImageEventTypes.GENERATION_COMPLETED // "chatgpt:image/generation/completed"
   ImageEventTypes.GENERATION_FAILED    // "chatgpt:image/generation/failed"
   ```

### ❌ NOT IMPLEMENTED:
1. **WebSocket Integration** - Image handler not wired into server
2. **Shell Script** - Not sending events yet
3. **Extension UI** - No folder selection

## GitHub Issues Status:
- No existing issues found for "imageDownloadRequested"
- This is expected since the event name is actually "ImageRequestReceived"

## Action Items:
1. Update all references from `imageDownloadRequested` to `ImageRequestReceived`
2. Use the correct event type: `chatgpt:image/request/received`
3. Ensure team knows about the correct event naming

## For the Team:
- **Alex**: Wire up `ImageRequestReceived` handler
- **Dana**: Send `chatgpt:image/request/received` events
- **Quinn**: Test for `ImageRequestReceived` not `imageDownloadRequested`
- **Eva**: UI should trigger `ImageRequestReceived` events

The foundation is there, just need to use the correct event names!