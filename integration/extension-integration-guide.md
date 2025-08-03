# Extension Integration Guide

## Overview

This guide shows how to integrate browser extensions with the Semantest API, using Alex's schemas and Eva's extension patterns.

## Quick Start

### 1. Extension Manifest Setup

```json
// manifest.json (Chrome/Edge)
{
  "manifest_version": 3,
  "name": "Semantest Extension",
  "version": "1.0.0",
  "permissions": [
    "storage",
    "tabs",
    "webRequest"
  ],
  "host_permissions": [
    "https://api.semantest.com/*",
    "wss://realtime.semantest.com/*"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["content.js"]
  }]
}
```

### 2. API Client Setup

```typescript
// api-client.ts
import { ImageGenerationAPI } from '@semantest/types';

class SemantestClient {
  private apiKey: string;
  private wsConnection?: WebSocket;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  async createChat(params: NewChatRequest): Promise<NewChatResponse> {
    const response = await fetch('https://api.semantest.com/v1/chat/new', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
        'X-Extension-ID': chrome.runtime.id,
        'X-Extension-Version': chrome.runtime.getManifest().version
      },
      body: JSON.stringify(params)
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  }
  
  connectWebSocket(onMessage: (event: MessageEvent) => void) {
    this.wsConnection = new WebSocket('wss://realtime.semantest.com');
    
    this.wsConnection.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };
    
    this.wsConnection.onopen = () => {
      this.wsConnection!.send(JSON.stringify({
        type: 'auth',
        apiKey: this.apiKey
      }));
    };
  }
}
```

### 3. Background Service Worker

```typescript
// background.js
let client: SemantestClient;

// Initialize on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['apiKey'], (result) => {
    if (result.apiKey) {
      client = new SemantestClient(result.apiKey);
      client.connectWebSocket(handleWebSocketMessage);
    }
  });
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'NEW_CHAT_REQUEST':
      handleNewChatRequest(request.payload)
        .then(sendResponse)
        .catch(err => sendResponse({ error: err.message }));
      return true; // Keep channel open for async response
      
    case 'CHECK_JOB_STATUS':
      checkJobStatus(request.jobId)
        .then(sendResponse)
        .catch(err => sendResponse({ error: err.message }));
      return true;
  }
});

async function handleNewChatRequest(params: any) {
  try {
    const response = await client.createChat({
      userId: await getUserId(),
      prompt: params.prompt,
      imageGeneration: {
        enabled: true,
        provider: params.provider || 'dalle3'
      }
    });
    
    // Store job ID for tracking
    await chrome.storage.local.set({
      [`job_${response.jobId}`]: {
        status: 'queued',
        createdAt: Date.now()
      }
    });
    
    return response;
  } catch (error) {
    console.error('Failed to create chat:', error);
    throw error;
  }
}

function handleWebSocketMessage(message: any) {
  switch (message.event) {
    case 'job.status.updated':
      updateJobStatus(message.job);
      notifyContentScripts(message);
      break;
      
    case 'job.completed':
      handleJobCompletion(message.job);
      break;
  }
}
```

### 4. Content Script Integration

```typescript
// content.js
class SemantestUI {
  private overlay?: HTMLElement;
  
  initialize() {
    // Listen for keyboard shortcut
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'G') {
        this.showGenerateUI();
      }
    });
    
    // Listen for updates from background
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'JOB_UPDATE') {
        this.updateUI(message.job);
      }
    });
  }
  
  showGenerateUI() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'semantest-overlay';
    this.overlay.innerHTML = `
      <div class="semantest-modal">
        <h3>Generate Image</h3>
        <textarea id="semantest-prompt" placeholder="Describe your image..."></textarea>
        <select id="semantest-provider">
          <option value="dalle3">DALL-E 3</option>
          <option value="stable-diffusion">Stable Diffusion</option>
          <option value="midjourney">Midjourney</option>
        </select>
        <button id="semantest-generate">Generate</button>
        <div id="semantest-status"></div>
      </div>
    `;
    
    document.body.appendChild(this.overlay);
    this.attachEventListeners();
  }
  
  private attachEventListeners() {
    const generateBtn = document.getElementById('semantest-generate');
    generateBtn?.addEventListener('click', () => this.handleGenerate());
  }
  
  private async handleGenerate() {
    const prompt = (document.getElementById('semantest-prompt') as HTMLTextAreaElement).value;
    const provider = (document.getElementById('semantest-provider') as HTMLSelectElement).value;
    
    const response = await chrome.runtime.sendMessage({
      type: 'NEW_CHAT_REQUEST',
      payload: { prompt, provider }
    });
    
    if (response.error) {
      this.showError(response.error);
    } else {
      this.showStatus(`Job queued: ${response.jobId}`);
    }
  }
}

// Initialize on page load
const semantestUI = new SemantestUI();
semantestUI.initialize();
```

### 5. TypeScript Types (from Alex's schemas)

```typescript
// types.ts
export interface NewChatRequest {
  userId: string;
  prompt: string;
  imageGeneration?: {
    enabled: boolean;
    provider?: 'dalle3' | 'stable-diffusion' | 'midjourney';
    size?: string;
    quality?: 'standard' | 'hd';
  };
  webhookUrl?: string;
}

export interface NewChatResponse {
  chatId: string;
  jobId?: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  estimatedCompletionTime?: string;
}

export interface WebSocketEvent {
  event: 'job.status.updated' | 'job.completed' | 'job.failed';
  timestamp: number;
  job: {
    id: string;
    status: string;
    progress?: number;
    images?: Array<{
      url: string;
      size: string;
    }>;
    error?: string;
  };
}
```

## Advanced Features

### Addon Loading (from Aria's architecture)

```typescript
// addon-loader.ts
class AddonLoader {
  private loadedAddons = new Map<string, Addon>();
  
  async loadAddon(addonId: string): Promise<void> {
    // Fetch from CDN (as per Dana's infrastructure)
    const addonUrl = `https://cdn.semantest.com/addons/${addonId}/bundle.js`;
    
    try {
      const module = await import(addonUrl);
      const addon = new module.default();
      
      // Initialize with current context
      await addon.initialize({
        apiClient: this.apiClient,
        extensionId: chrome.runtime.id
      });
      
      this.loadedAddons.set(addonId, addon);
      
      // Emit loaded event
      chrome.runtime.sendMessage({
        type: 'ADDON_LOADED',
        addonId
      });
    } catch (error) {
      console.error(`Failed to load addon ${addonId}:`, error);
    }
  }
}
```

### Error Handling

```typescript
// error-handler.ts
class ExtensionErrorHandler {
  handleApiError(error: any): void {
    if (error.status === 429) {
      // Rate limited
      this.showRateLimitUI(error.retryAfter);
    } else if (error.status === 403) {
      // CORS or permission issue
      this.showPermissionError();
    } else {
      // Generic error
      this.showGenericError(error.message);
    }
  }
  
  private showRateLimitUI(retryAfter: number): void {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon128.png',
      title: 'Rate Limited',
      message: `Please wait ${retryAfter} seconds before trying again`
    });
  }
}
```

## Testing Your Extension

```typescript
// extension.test.ts
describe('Extension Integration', () => {
  it('should handle NewChatRequest correctly', async () => {
    const mockResponse = { chatId: 'chat-123', jobId: 'job-456' };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    });
    
    const result = await chrome.runtime.sendMessage({
      type: 'NEW_CHAT_REQUEST',
      payload: { prompt: 'Test prompt' }
    });
    
    expect(result).toEqual(mockResponse);
  });
});
```

## Best Practices

1. **Always include extension headers** for API requests
2. **Handle WebSocket reconnection** for reliability
3. **Store API keys securely** in chrome.storage
4. **Implement proper error boundaries**
5. **Follow Dana's CSP guidelines** for security
6. **Use TypeScript** for type safety (as Aria recommended)

---
*Extension Integration Guide by Sam the Scribe*
*Based on Alex's API design and Eva's extension expertise*