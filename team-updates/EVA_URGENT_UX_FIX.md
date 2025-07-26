# 🚨 Eva - URGENT UX Fix Required!

## rydnr found CRITICAL issue:
Extension fails with `ERR_CONNECTION_REFUSED` when server isn't running!

## YOUR IMMEDIATE TASKS:

### 1. Add Connection Error Detection
```javascript
// In websocket-handler.js
ws.onerror = (error) => {
  console.error('WebSocket error:', error);
  if (error.message?.includes('ERR_CONNECTION_REFUSED') || 
      error.code === 'ECONNREFUSED') {
    showServerNotRunningError();
  }
};

ws.onclose = (event) => {
  if (!event.wasClean) {
    showServerNotRunningError();
  }
};
```

### 2. Create User-Friendly Error UI
```javascript
function showServerNotRunningError() {
  // Update popup.html with error state
  document.getElementById('status').innerHTML = `
    <div class="error-box">
      <h3>📡 Server Not Running</h3>
      <p>To use this extension, start the local server:</p>
      <ol>
        <li>Open terminal</li>
        <li>cd /path/to/semantest</li>
        <li>npm start</li>
      </ol>
      <button id="retry-connection">Retry Connection</button>
    </div>
  `;
}
```

### 3. Add Visual Connection Status
```html
<!-- In popup.html -->
<div id="connection-status">
  <span class="status-dot" id="status-indicator"></span>
  <span id="status-text">Connecting...</span>
</div>
```

```css
.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}
.status-dot.connected { background: #4CAF50; }
.status-dot.disconnected { background: #F44336; }
.status-dot.connecting { background: #FF9800; }
```

### 4. Implement Retry Logic
```javascript
let retryCount = 0;
const MAX_RETRIES = 3;

function connectWebSocket() {
  ws = new WebSocket('ws://localhost:3003');
  
  ws.onopen = () => {
    retryCount = 0;
    updateStatus('connected', 'Connected to server');
  };
  
  ws.onerror = ws.onclose = () => {
    updateStatus('disconnected', 'Server not running');
    if (retryCount < MAX_RETRIES) {
      setTimeout(() => {
        retryCount++;
        connectWebSocket();
      }, 2000);
    }
  };
}
```

## Priority Order:
1. Error detection (prevents user confusion)
2. Helpful error message (guides user to solution)
3. Visual status (immediate feedback)
4. Auto-retry (better UX)

## This fixes:
- Users won't see scary technical errors
- Clear instructions on starting server
- Visual feedback on connection status
- Automatic recovery when server starts

**TIME CRITICAL - Every new user hits this issue!**

Report progress using:
```bash
./tmux-orchestrator/send-claude-message.sh semantest:0 @PM: Eva - UX fix progress update
```

- PM