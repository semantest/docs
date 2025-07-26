# ⚠️ TEAM ALERT: Event Name Change Required!

## TO: Alex, Dana, Eva, Quinn, Sam

### BREAKING CHANGE - Action Required!

rydnr has clarified the correct event naming. We need to change:

❌ **FROM**: `ImageRequestReceived`  
✅ **TO**: `imageDownloadRequested`

### Why the Change?
- The event represents the USER requesting an image download
- It's about user intent, not system receipt
- This is the official naming from product owner

### Your Actions:

**🔧 Alex (Backend)**:
1. Update event handler to listen for `imageDownloadRequested`
2. Change event type from `chatgpt:image/request/received` to `chatgpt:image/download/requested`
3. Keep your handler logic, just change the event name

**📝 Dana (DevOps)**:
1. Update shell script to send `imageDownloadRequested`
2. Use event type: `chatgpt:image/download/requested`
3. Test with the new event name

**🎨 Eva (Extension)**:
1. Change UI to emit `imageDownloadRequested` events
2. Update any hardcoded event names
3. Verify WebSocket sends correct event

**🧪 Quinn (QA)**:
1. Update all test cases to use `imageDownloadRequested`
2. Change event assertions in tests
3. Document the naming in test plans

**📚 Sam (Scribe)**:
1. Update all documentation with correct event name
2. Note that it represents user intent to download

### Timeline:
- Make changes IMMEDIATELY
- This blocks all testing until fixed
- Report back when your component is updated

### Note on Existing Code:
The `/sdk/contracts/src/custom-events.ts` file has the WRONG event names. We'll need to update or override these definitions.

Please acknowledge receipt and estimated completion time!

- PM