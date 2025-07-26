# 🚨 CRITICAL UX ISSUE - WebSocket Connection Failed

## Feedback from rydnr:
Extension installed but WebSocket fails with `ERR_CONNECTION_REFUSED`

## The Problem:
Users install the extension but don't know they need to start the server!

## IMMEDIATE ACTIONS REQUIRED:

### Option 1: Error Detection & User Guidance (RECOMMENDED)

#### Eva (Extension) - PRIORITY 🔴
1. **Detect WebSocket connection failures**
   ```javascript
   ws.onerror = (error) => {
     if (error.message.includes('ERR_CONNECTION_REFUSED')) {
       showUserFriendlyError();
     }
   };
   ```

2. **Show helpful popup/notification**
   ```
   "📡 Server Not Running
   
   To use this extension, please start the local server:
   
   1. Open terminal
   2. Run: cd semantest && npm start
   3. Server will start on port 3003
   4. Click 'Retry Connection'
   
   [Retry] [Learn More]"
   ```

3. **Add connection status indicator**
   - Green dot: Connected ✅
   - Red dot: Disconnected ❌
   - Yellow dot: Connecting... ⏳

#### Alex (Backend) - SUPPORT
1. **Create server startup documentation**
2. **Add health check endpoint**
3. **Consider auto-retry logic**

### Option 2: Remote Server (ALTERNATIVE)
- Deploy WebSocket server to public URL
- Update extension to use remote server
- Handle authentication/security

## User Experience Flow:

### Current (BAD) ❌:
1. User installs extension
2. Clicks icon
3. Nothing works
4. User confused/frustrated

### Improved (GOOD) ✅:
1. User installs extension
2. Clicks icon
3. Sees "Server not running" with instructions
4. Follows simple steps
5. Everything works!

## Implementation Priority:

1. **Eva**: Add connection error detection (1 hour)
2. **Eva**: Create user-friendly error UI (1 hour)
3. **Alex**: Document server startup clearly (30 min)
4. **Eva**: Add retry mechanism (30 min)
5. **Sam**: Update installation guide (30 min)

## Success Criteria:
- User NEVER sees raw WebSocket errors
- Clear instructions when server isn't running
- One-click retry after starting server
- Visual connection status indicator

## Timeline: 
This is CRITICAL - impacts every new user!
Target: Complete by end of day

---
**Reported by**: rydnr
**Severity**: CRITICAL - Blocking user adoption
**Assignment**: Eva (primary), Alex (support)