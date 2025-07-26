# GitHub Issue: [BLOCKER] Test Chrome Extension WebSocket Connection

## Issue Title: [BLOCKER] Test Chrome Extension WebSocket Connection - Eva Blocked

## Priority: 🔴 CRITICAL BLOCKER

## Labels: 
- blocker
- testing
- extension
- websocket
- urgent

## Assignee: Quinn (QA) / Any Available Tester

## Description:

Eva has completed critical WebSocket port fixes but is BLOCKED waiting for manual Chrome testing. This is preventing further extension development.

### Work Completed by Eva ✅
- Fixed WebSocket port mismatch (8080 → 3003)
- Updated extension code with correct port
- Created installation guides
- Built extension at `/extension.chrome/build/`

### Testing Required 🧪

1. **Install Extension in Chrome**
   ```
   1. Open Chrome browser
   2. Navigate to chrome://extensions
   3. Enable "Developer mode" (top right)
   4. Click "Load unpacked"
   5. Select: /home/chous/work/semantest/extension.chrome/build/
   6. Verify extension loads without errors
   ```

2. **Start WebSocket Server**
   ```bash
   cd /home/chous/work/semantest/sdk/server
   npm start  # Must run on port 3003
   ```

3. **Test WebSocket Connection**
   - Click extension icon in Chrome toolbar
   - Open Chrome DevTools (F12) → Network tab
   - Look for WebSocket connection to `ws://localhost:3003`
   - Check Console tab for any errors

4. **Test Image Generation**
   ```bash
   ./generate-image.sh "test robot"
   ```
   - Verify events flow through WebSocket
   - Check for `imageDownloadRequested` events
   - Confirm no connection errors

### Expected Results ✅
- Extension loads successfully
- WebSocket connects to port 3003
- No console errors
- Events transmit successfully

### Actual Results
*[To be filled by tester]*

### Definition of Done
- [ ] Extension installed in Chrome
- [ ] WebSocket connection verified on port 3003
- [ ] No connection errors in console
- [ ] imageDownloadRequested events tested
- [ ] Results reported back to Eva and PM

### Impact if Not Resolved
- Eva remains BLOCKED on extension development
- Cannot implement folder selection UI
- Cannot complete image download feature
- Team productivity impacted

### Time Estimate: 15-30 minutes

### Additional Notes
- Use send-claude-message.sh to report results:
  ```bash
  ./tmux-orchestrator/send-claude-message.sh semantest:0 @PM: Test results - [pass/fail details]
  ```

**Eva is actively blocked. Please prioritize this immediately!**

---
Created by: PM (on behalf of Eva)
Date: January 25, 2025
Blocking: Extension development