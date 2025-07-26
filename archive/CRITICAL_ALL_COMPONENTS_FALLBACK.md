# 🚨 CRITICAL CLARIFICATION - Fallback Logic for ALL Components

## Important Update from rydnr:

The smart fallback logic applies to **ALL COMPONENTS**, not just the extension!

## This Means:

### ✅ Extension (Eva's work)
### ✅ SDK Libraries (Alex's work)
### ✅ Direct Clients (Alex's work)
### ✅ Shell Scripts (Dana's work)
### ✅ Any Future Clients

## Universal Connection Logic:

```javascript
// This logic must be implemented EVERYWHERE
async function connectToSemantestServer() {
  // Step 1: Always try localhost first
  if (await checkLocalServer()) {
    return connectLocal();
  }
  
  // Step 2: Fall back to public
  return connectPublic();
}

async function checkLocalServer() {
  try {
    const response = await fetch('http://localhost:3003/semantest-signature');
    const data = await response.json();
    return data.service === 'semantest';
  } catch {
    return false;
  }
}
```

## Implementation Requirements:

### 1. SDK Client Library (`/sdk/client/`)
```typescript
// In WebSocketClient class
export class WebSocketClient {
  private async determineServerUrl(): Promise<string> {
    const localUrl = 'ws://localhost:3003';
    const publicUrl = 'wss://api.extension.semantest.com';
    
    if (await this.isLocalServerAvailable()) {
      console.log('Using local Semantest server');
      return localUrl;
    }
    
    console.log('Using public Semantest server');
    return publicUrl;
  }
}
```

### 2. TypeScript Client (`/typescript.client/`)
- Same fallback logic
- Check signature before connecting
- Log which server is being used

### 3. Shell Scripts (`/generate-image.sh`)
```bash
# Check local server
if curl -s http://localhost:3003/semantest-signature | grep -q "semantest"; then
  SERVER_URL="ws://localhost:3003"
  echo "Using local server"
else
  SERVER_URL="wss://api.extension.semantest.com"
  echo "Using public server"
fi
```

### 4. Any Direct WebSocket Connections
- Always implement the fallback pattern
- Never hardcode server URLs
- Always check signature first

## Why This Matters:

1. **Consistent Behavior**: All clients work the same way
2. **Better UX**: No configuration needed anywhere
3. **Developer Friendly**: Local development just works
4. **Production Ready**: Public fallback for all users

## Team Impact:

**Alex** - PRIMARY:
- Update SDK client library
- Update TypeScript client
- Ensure all client code uses fallback

**Dana** - SECONDARY:
- Update shell scripts
- Use fallback in any client code

**Eva** - ALREADY DOING:
- Extension implementation (continue as planned)

**Sam** - DOCUMENTATION:
- Document universal fallback pattern
- Update all client examples

## Success Criteria:
- ALL components try localhost first
- ALL components check signature
- ALL components fall back to public
- Consistent logging across all clients

This is a CRITICAL architectural pattern that must be followed everywhere!

---
**Source**: rydnr clarification
**Impact**: All client components
**Priority**: CRITICAL