# 🎨 Eva - New UX Feature: Visual Server Indicator

## New Requirement from rydnr:

Show visual indication on ChatGPT tab based on server connection!

## Implementation Requirements:

### 1. Add Visual Indicator to ChatGPT Page
When connected, inject a visual element showing server type:

```javascript
// content-script.js (injected into ChatGPT tab)
function injectServerIndicator(serverType) {
  // Remove existing indicator if any
  const existing = document.getElementById('semantest-indicator');
  if (existing) existing.remove();
  
  // Create new indicator
  const indicator = document.createElement('div');
  indicator.id = 'semantest-indicator';
  indicator.className = `semantest-indicator ${serverType}`;
  
  // Different styles for each connection type
  if (serverType === 'local') {
    indicator.innerHTML = `
      <div class="indicator-badge local">
        <span class="icon">🏠</span>
        <span class="text">Local Dev</span>
      </div>
    `;
  } else if (serverType === 'public') {
    indicator.innerHTML = `
      <div class="indicator-badge cloud">
        <span class="icon">☁️</span>
        <span class="text">Cloud</span>
      </div>
    `;
  }
  
  // Inject into page
  document.body.appendChild(indicator);
}
```

### 2. CSS Styles for Indicators
```css
/* Inject these styles into ChatGPT page */
.semantest-indicator {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
}

.indicator-badge {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  animation: slideIn 0.3s ease-out;
}

.indicator-badge.local {
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
}

.indicator-badge.cloud {
  background: linear-gradient(135deg, #2196F3, #1976d2);
  color: white;
}

.indicator-badge .icon {
  margin-right: 6px;
  font-size: 16px;
}

/* Subtle watermark alternative */
.semantest-watermark {
  position: fixed;
  top: 10px;
  right: 10px;
  opacity: 0.3;
  font-size: 12px;
  color: #666;
  pointer-events: none;
}

@keyframes slideIn {
  from {
    transform: translateX(100px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

### 3. Update Extension Communication
```javascript
// When connection status changes, update ChatGPT tab
chrome.tabs.query({url: "*://chat.openai.com/*"}, function(tabs) {
  tabs.forEach(tab => {
    chrome.tabs.sendMessage(tab.id, {
      action: 'updateServerIndicator',
      serverType: currentServerType // 'local' or 'public'
    });
  });
});
```

### 4. Alternative Designs (Choose One):

**Option A: Corner Badge** (Recommended)
- Bottom-right corner badge
- Shows 🏠 Local Dev or ☁️ Cloud
- Subtle but visible

**Option B: Top Bar**
- Thin bar across top of page
- Green for local, blue for cloud
- Very subtle

**Option C: Floating Watermark**
- Semi-transparent "semantest" text
- Different opacity for local vs cloud
- Ultra-subtle

## Benefits:
- Developers instantly know which server they're using
- No confusion about connection status
- Clean, professional appearance
- Doesn't interfere with ChatGPT UI

## Implementation Priority:
1. Basic badge indicator (1 hour)
2. Smooth animations (30 min)
3. User preference to hide/show (30 min)

This enhances the developer experience significantly!

Report progress:
```bash
./tmux-orchestrator/send-claude-message.sh semantest:0 @PM: Eva - Visual indicator implemented
```

- PM