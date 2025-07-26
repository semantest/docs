# Quick Security Integration Guide

## For Backend1 & Backend2 - INTEGRATE NOW!

### Step 1: Import Security Components
```typescript
// In server.ts
import { SecurityMiddleware } from './security/security-middleware';
import { RateLimiter } from './security/rate-limiter';
import { AccessController } from './security/access-controller';
import { EventValidator } from './security/event-validator';
```

### Step 2: Initialize Security
```typescript
// Add to WebSocketServer constructor
const security = new SecurityMiddleware({
  rateLimiter: new RateLimiter({
    windowMs: 60000,
    maxRequests: 100
  }),
  accessController: new AccessController({
    requireAuth: true,
    allowedOrigins: ['http://localhost:*']
  }),
  eventValidator: new EventValidator()
});
```

### Step 3: Wire into Connection Handler
```typescript
// In handleConnection method
async handleConnection(ws: WebSocket, request: IncomingMessage) {
  // Security check first!
  const securityCheck = await security.validateConnection(request);
  if (!securityCheck.allowed) {
    ws.close(1008, securityCheck.reason);
    return;
  }
  
  // Existing connection logic...
}
```

### Step 4: Add to Message Handler
```typescript
// In message handler
ws.on('message', async (data) => {
  const validation = await security.validateMessage(data, clientId);
  if (!validation.valid) {
    // Send error response
    return;
  }
  
  // Process message...
});
```

## USE FLAGS: --c7 --seq --uc
This saves 40% tokens!