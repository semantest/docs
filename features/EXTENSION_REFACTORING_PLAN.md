# Extension Refactoring Plan

## Goal
Transform the extension from a ChatGPT-specific tool into a modular, domain-agnostic extension that can load site-specific addons dynamically.

## Current Architecture Issues
1. ChatGPT-specific code is mixed with core logic
2. Popup has test buttons instead of message logs
3. No clear separation between core and addon functionality
4. Static loading of all scripts regardless of domain

## Target Architecture

### 1. Core Extension (Domain-Agnostic)
**Location**: `/extension.chrome/src/core/`
- **WebSocket Handler**: Generic message passing
- **Message Logger**: Stores and displays all messages
- **Addon Loader**: Dynamically loads domain-specific addons
- **Background Service**: Core message routing

**Files to move/create**:
- `core/websocket-handler.js` (refactor from existing)
- `core/message-logger.js` (new)
- `core/addon-loader.js` (new)
- `core/background.js` (refactor from service-worker.js)

### 2. ChatGPT Addon
**Location**: `/extension.chrome/src/addons/chatgpt/`
- **State Detector**: ChatGPT-specific state monitoring
- **DOM Controller**: ChatGPT page interactions
- **Button Clicker**: ChatGPT UI automation

**Files to move**:
- `addons/chatgpt/state-detector.js` (from chatgpt-state-detector.js)
- `addons/chatgpt/controller.js` (from chatgpt-controller.js)
- `addons/chatgpt/button-clicker.js` (from chatgpt-button-clicker.js)
- `addons/chatgpt/direct-send.js` (from chatgpt-direct-send.js)

### 3. Popup Refactoring
**New Design**: Message log viewer
- Remove all test buttons
- Display WebSocket message log with:
  - Timestamp
  - Message type
  - Source/destination
  - Payload preview
- Filter/search capabilities
- Clear log button

### 4. Manifest Changes
```json
{
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["src/core/addon-loader.js"],
      "run_at": "document_start"
    }
  ],
  "web_accessible_resources": [
    {
      "resources": ["src/addons/*"],
      "matches": ["<all_urls>"]
    }
  ]
}
```

### 5. Addon Loading Logic
```javascript
// addon-loader.js
const ADDON_MAP = {
  'chatgpt.com': 'chatgpt',
  'chat.openai.com': 'chatgpt',
  'images.google.com': 'google-images',
  // Add more as needed
};

const domain = window.location.hostname;
const addon = ADDON_MAP[domain];

if (addon) {
  // Dynamically inject addon scripts
  injectAddonScripts(addon);
}
```

## Implementation Steps

### Phase 1: Core Extraction (Priority: High)
1. Create `/src/core/` directory structure
2. Extract WebSocket handler (remove ChatGPT-specific code)
3. Create message logger service
4. Refactor background service worker

### Phase 2: ChatGPT Addon Creation (Priority: High)
1. Create `/src/addons/chatgpt/` directory
2. Move all ChatGPT-specific files
3. Create addon manifest/config
4. Update imports and dependencies

### Phase 3: Popup Redesign (Priority: High)
1. Remove test buttons from popup
2. Create message log UI
3. Implement filtering/searching
4. Add WebSocket connection status

### Phase 4: Dynamic Loading (Priority: Medium)
1. Implement addon loader
2. Update manifest for dynamic injection
3. Test addon loading on different domains
4. Create addon development guide

### Phase 5: Testing & Documentation (Priority: Medium)
1. Test full flow: CLI → WebSocket → Extension → ChatGPT
2. Create addon development documentation
3. Update user guides
4. Performance optimization

## Success Criteria
- [ ] CLI can send events that appear in popup log
- [ ] ChatGPT addon loads only on ChatGPT domains
- [ ] Core extension has no domain-specific code
- [ ] Popup shows real-time message log
- [ ] Easy to add new domain addons

## Estimated Timeline
- Phase 1-2: 2-3 hours (core refactoring)
- Phase 3: 1-2 hours (popup redesign)
- Phase 4-5: 2-3 hours (dynamic loading & testing)

Total: ~6-8 hours of focused work