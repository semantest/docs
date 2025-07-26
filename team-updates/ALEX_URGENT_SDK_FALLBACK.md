# 🚨 Alex - URGENT: Implement Fallback in ALL Client Components

## Critical Update from rydnr:

The smart fallback logic must be in ALL components, not just the extension!

## Your Implementation Tasks:

### 1. SDK Client Library (`/sdk/client/src/`)

Update the WebSocket client class:

```typescript
// websocket-client.ts
export class WebSocketClient {
  private readonly LOCAL_URL = 'ws://localhost:3003';
  private readonly PUBLIC_URL = 'wss://api.extension.semantest.com';
  private readonly SIGNATURE_URL = 'http://localhost:3003/semantest-signature';
  
  private currentServerUrl: string;
  private serverType: 'local' | 'public';
  
  async connect(): Promise<void> {
    // Determine which server to use
    this.currentServerUrl = await this.determineServerUrl();
    
    // Connect with the selected URL
    this.ws = new WebSocket(this.currentServerUrl);
    console.log(`Connecting to ${this.serverType} Semantest server...`);
  }
  
  private async determineServerUrl(): Promise<string> {
    if (await this.isLocalServerAvailable()) {
      this.serverType = 'local';
      return this.LOCAL_URL;
    }
    
    this.serverType = 'public';
    return this.PUBLIC_URL;
  }
  
  private async isLocalServerAvailable(): Promise<boolean> {
    try {
      const response = await fetch(this.SIGNATURE_URL, {
        timeout: 2000 // 2 second timeout
      });
      const data = await response.json();
      return data.service === 'semantest';
    } catch (error) {
      console.log('Local server not available, will use public server');
      return false;
    }
  }
}
```

### 2. TypeScript Client (`/typescript.client/src/`)

Same pattern for any direct client usage:

```typescript
// client.ts
export async function createSemantestClient(): Promise<SemantestClient> {
  const serverUrl = await determineServerUrl();
  return new SemantestClient(serverUrl);
}

async function determineServerUrl(): Promise<string> {
  // Same logic as above
}
```

### 3. Update Core Library (`/sdk/core/`)

Add server detection utilities:

```typescript
// server-detector.ts
export class ServerDetector {
  static async getOptimalServer(): Promise<{url: string, type: 'local' | 'public'}> {
    // Reusable logic for all components
  }
}
```

### 4. Examples and Tests

Update ALL examples to use fallback:

```typescript
// Before (WRONG):
const client = new WebSocketClient('ws://localhost:3003');

// After (CORRECT):
const client = new WebSocketClient(); // Auto-detects server
await client.connect();
```

## Testing Requirements:

1. **Local server running**: Should use localhost
2. **Local server stopped**: Should use public
3. **No internet**: Should fail gracefully
4. **Signature endpoint down**: Should fallback

## Why This Is Critical:

- SDK users expect same behavior as extension
- No configuration should be needed
- Consistent experience across all tools
- Future-proof for any client implementation

## Coordinate with Team:

- **Dana**: Ensure shell scripts use same pattern
- **Eva**: Align implementation approach
- **Sam**: Document the pattern

Report progress:
```bash
./tmux-orchestrator/send-claude-message.sh semantest:0 @PM: Alex - SDK fallback implementation complete
```

This affects ALL client code - prioritize immediately!

- PM