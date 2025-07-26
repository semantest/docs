# 🔄 Eva - Implement Smart WebSocket Fallback

## NEW ARCHITECTURE: Try Local → Fallback to Public

### Your Implementation Tasks:

## 1. Update WebSocket Connection Logic

```javascript
// websocket-handler.js
const LOCAL_WS_URL = 'ws://localhost:3003';
const PUBLIC_WS_URL = 'wss://api.extension.semantest.com';
const SIGNATURE_URL = 'http://localhost:3003/semantest-signature';

let currentServerType = null;
let ws = null;

async function initializeWebSocket() {
  updateConnectionStatus('connecting');
  
  // Try local first
  if (await isLocalServerAvailable()) {
    connectToServer(LOCAL_WS_URL, 'local');
  } else {
    // Fallback to public
    connectToServer(PUBLIC_WS_URL, 'public');
  }
}

async function isLocalServerAvailable() {
  try {
    const response = await fetch(SIGNATURE_URL, { 
      timeout: 2000 // 2 second timeout
    });
    const data = await response.json();
    return data.service === 'semantest';
  } catch (error) {
    console.log('Local server not available, using public fallback');
    return false;
  }
}

function connectToServer(url, serverType) {
  currentServerType = serverType;
  ws = new WebSocket(url);
  
  ws.onopen = () => {
    console.log(`Connected to ${serverType} server`);
    updateConnectionStatus('connected', serverType);
  };
  
  ws.onerror = (error) => {
    console.error(`${serverType} server error:`, error);
    if (serverType === 'local' && !ws.readyState === WebSocket.OPEN) {
      // If local fails, try public
      connectToServer(PUBLIC_WS_URL, 'public');
    } else {
      updateConnectionStatus('error');
    }
  };
  
  ws.onclose = () => {
    updateConnectionStatus('disconnected');
    // Retry logic
    setTimeout(initializeWebSocket, 5000);
  };
}
```

## 2. Update UI to Show Connection Type

```html
<!-- popup.html -->
<div id="connection-status">
  <span class="status-dot" id="status-indicator"></span>
  <span id="status-text">Connecting...</span>
  <span id="server-type" class="server-badge"></span>
</div>
```

```css
.server-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 3px;
  margin-left: 5px;
}

.server-badge.local {
  background: #4CAF50;
  color: white;
}

.server-badge.public {
  background: #2196F3;
  color: white;
}
```

```javascript
function updateConnectionStatus(status, serverType) {
  const statusDot = document.getElementById('status-indicator');
  const statusText = document.getElementById('status-text');
  const serverBadge = document.getElementById('server-type');
  
  switch(status) {
    case 'connected':
      statusDot.className = 'status-dot connected';
      statusText.textContent = 'Connected';
      serverBadge.textContent = serverType.toUpperCase();
      serverBadge.className = `server-badge ${serverType}`;
      break;
    case 'connecting':
      statusDot.className = 'status-dot connecting';
      statusText.textContent = 'Connecting...';
      serverBadge.textContent = '';
      break;
    case 'disconnected':
    case 'error':
      statusDot.className = 'status-dot disconnected';
      statusText.textContent = 'Disconnected';
      serverBadge.textContent = '';
      break;
  }
}
```

## 3. Handle Different Server Behaviors

```javascript
// Different behavior for local vs public
function sendEvent(event) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.error('WebSocket not connected');
    return;
  }
  
  // Add server type to event metadata
  event.metadata = event.metadata || {};
  event.metadata.serverType = currentServerType;
  
  ws.send(JSON.stringify(event));
}
```

## Benefits:
1. **Power users** get fast local server
2. **Casual users** get automatic public server
3. **No configuration** required
4. **Seamless fallback** if local unavailable

## Testing:
1. With local server running → should connect locally
2. Stop local server → should fallback to public
3. Start local server → next retry connects locally

Report progress:
```bash
./tmux-orchestrator/send-claude-message.sh semantest:0 @PM: Eva - Smart fallback implemented
```

- PM