# Consent Popup Implementation Guide

## Visual Design Specifications

### Dialog Dimensions
- **Width**: 480px (max-width for mobile)
- **Padding**: 32px content, 32px header
- **Border Radius**: 16px
- **Shadow**: 0 20px 60px rgba(0, 0, 0, 0.2)

### Color Palette
```css
/* Primary Colors */
--consent-primary: #10a37f;
--consent-primary-hover: #0e9066;

/* Text Colors */
--consent-text-primary: #374151;
--consent-text-secondary: #6b7280;
--consent-text-tertiary: #9ca3af;

/* Background Colors */
--consent-bg-white: #ffffff;
--consent-bg-gray: #f9fafb;
--consent-bg-success: #f0fdf4;

/* Border Colors */
--consent-border-gray: #e5e7eb;
--consent-border-success: #bbf7d0;
```

### Typography
```css
/* Font Stack */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', sans-serif;

/* Font Sizes */
--title-size: 24px;
--subtitle-size: 16px;
--body-size: 16px;
--small-size: 14px;
--micro-size: 12px;

/* Font Weights */
--weight-regular: 400;
--weight-medium: 500;
--weight-semibold: 600;
--weight-bold: 700;
```

## Component Structure

### 1. Backdrop
```html
<div class="consent-backdrop" onclick="handleBackdropClick()">
  <!-- Semi-transparent overlay -->
  <!-- Blur effect on background -->
</div>
```

### 2. Dialog Container
```html
<div class="consent-dialog" role="dialog">
  <header class="consent-header">...</header>
  <main class="consent-content">...</main>
</div>
```

### 3. Interactive Elements
```html
<!-- Primary Button -->
<button class="consent-btn primary">
  <span>Accept & Help Improve</span>
  <svg>→</svg>
</button>

<!-- Secondary Button -->
<button class="consent-btn secondary">
  <span>No Thanks</span>
</button>
```

## Animation Specifications

### Entry Animation
```css
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.consent-dialog {
  animation: slideUp 0.3s ease-out;
}
```

### Button Interactions
```css
.consent-btn {
  transition: all 0.2s ease;
}

.consent-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 163, 127, 0.3);
}

.consent-btn:active {
  transform: translateY(0);
}
```

## State Management

### 1. Initial State
```javascript
const consentState = {
  shown: false,
  decided: false,
  accepted: null,
  timestamp: null
};
```

### 2. Storage Schema
```javascript
// chrome.storage.local
{
  telemetryConsent: boolean,
  consentTimestamp: number,
  consentVersion: string,
  showReminder: boolean
}
```

### 3. Show Logic
```javascript
async function shouldShowConsent() {
  const { telemetryConsent, consentVersion } = await chrome.storage.local.get();
  
  // Show if never seen
  if (telemetryConsent === undefined) return true;
  
  // Show if version changed (privacy policy update)
  if (consentVersion !== CURRENT_VERSION) return true;
  
  return false;
}
```

## Integration Points

### 1. Extension Popup
```javascript
// In popup.js
chrome.runtime.sendMessage({ action: 'checkConsent' }, (response) => {
  if (response.showConsent) {
    chrome.windows.create({
      url: 'consent-popup.html',
      type: 'popup',
      width: 520,
      height: 600,
      focused: true
    });
  }
});
```

### 2. Background Script
```javascript
// In background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'telemetryAccepted') {
    initializeTelemetry();
  } else if (request.action === 'telemetryDeclined') {
    disableTelemetry();
  }
});
```

### 3. Settings Integration
```javascript
// In settings.html
<div class="setting-item">
  <label>
    <input type="checkbox" id="telemetryToggle">
    <span>Share anonymous usage data</span>
  </label>
  <a href="#" onclick="showConsentDialog()">What data?</a>
</div>
```

## Testing Scenarios

### 1. First Install
- User installs extension
- Consent popup appears immediately
- User makes choice
- Choice persisted

### 2. Privacy Policy Update
- Version check on startup
- Re-show consent if policy changed
- Highlight what changed

### 3. Settings Change
- User toggles in settings
- Immediate effect
- Optional confirmation

### 4. Multi-Device Sync
- Consent syncs across devices
- Respects most recent choice

## Performance Considerations

### Load Time
- Total size: ~15KB (HTML + CSS + JS)
- Load time: <100ms
- No external dependencies

### Memory Usage
- Single instance only
- Auto-cleanup on close
- No memory leaks

## Error Handling

### Storage Errors
```javascript
try {
  await chrome.storage.local.set({ telemetryConsent: true });
} catch (error) {
  console.error('Consent storage failed:', error);
  // Fallback to memory-only consent
}
```

### Display Errors
```javascript
chrome.windows.create(config, (window) => {
  if (chrome.runtime.lastError) {
    // Fallback to new tab
    chrome.tabs.create({ url: 'consent-popup.html' });
  }
});
```

## A/B Testing Hooks

### Variant Tracking
```javascript
const variant = {
  messaging: 'A', // or 'B', 'C'
  design: 'default',
  timestamp: Date.now()
};

chrome.storage.local.set({ consentVariant: variant });
```

### Metrics to Track
- Show to decision time
- Accept vs decline rate
- Settings page visits
- Re-consent rate

## Rollout Strategy

### Phase 1: Soft Launch (v1.0.1)
- 10% of users
- Monitor metrics
- Gather feedback

### Phase 2: Full Rollout (v1.0.2)
- All users
- Refined based on feedback
- Final messaging

### Phase 3: Optimization (v1.1.0)
- A/B test variations
- Improve accept rate
- Maintain trust