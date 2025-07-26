# WebSocket Security Implementation Guide

## Immediate Security Fixes - Step by Step

### Step 1: Integrate Security Middleware into Server

**File**: `/sdk/server/src/server.ts`

```typescript
// Add imports at the top
import { SecurityMiddleware } from './security/security-middleware';
import { SecurityPolicy } from './types/orchestration';

// Update the WebSocketServer class
export class WebSocketServer extends EventEmitter {
  private options: Required<WebSocketServerOptions>;
  private httpServer?: HTTPServer;
  private wsServer?: WSServer;
  private clientManager: ClientManager;
  private subscriptionManager: SubscriptionManager;
  private messageRouter: MessageRouter;
  private requestHandler: RequestHandler;
  private heartbeatInterval?: NodeJS.Timeout;
  private securityMiddleware: SecurityMiddleware; // ADD THIS
  private connectionsByIP: Map<string, Set<string>>; // ADD THIS

  constructor(options: WebSocketServerOptions) {
    super();
    
    // Set defaults for options
    this.options = {
      port: options.port,
      host: options.host || '0.0.0.0',
      maxConnections: options.maxConnections || 1000,
      heartbeatInterval: options.heartbeatInterval || 30000,
      requestTimeout: options.requestTimeout || 30000,
      path: options.path || '/'
    };

    // Initialize security components
    this.connectionsByIP = new Map();
    
    const securityPolicy: Partial<SecurityPolicy> = {
      maxEventsPerSecond: 100,
      maxEventSize: 64 * 1024, // 64KB
      requireAuthentication: true,
      allowedEventTypes: undefined, // Will be configured based on use case
      blockedEventTypes: [],
      allowedClients: undefined
    };
    
    this.securityMiddleware = new SecurityMiddleware(securityPolicy);

    // Initialize managers
    this.clientManager = new ClientManager(this.options.maxConnections);
    this.subscriptionManager = new SubscriptionManager();
    this.messageRouter = new MessageRouter(
      this.clientManager,
      this.subscriptionManager
    );
    this.requestHandler = new RequestHandler(
      this.clientManager,
      this.options.requestTimeout
    );
  }
```

### Step 2: Add Connection Security Checks

```typescript
  /**
   * Handle new WebSocket connection with security checks
   */
  private handleConnection(ws: WebSocket, request: any): void {
    const clientIP = request.socket.remoteAddress || 'unknown';
    
    // Security Check 1: Global connection limit
    if (this.clientManager.getAllClients().length >= this.options.maxConnections) {
      console.warn(`Connection limit reached. Rejecting connection from ${clientIP}`);
      ws.close(1008, 'Server at capacity');
      return;
    }
    
    // Security Check 2: Per-IP connection limit (max 5 per IP)
    const ipConnections = this.connectionsByIP.get(clientIP) || new Set();
    if (ipConnections.size >= 5) {
      console.warn(`Too many connections from IP ${clientIP}`);
      ws.close(1008, 'Too many connections from your IP');
      return;
    }
    
    // Security Check 3: Origin validation (if in browser context)
    const origin = request.headers.origin;
    if (origin && !this.isValidOrigin(origin)) {
      console.warn(`Invalid origin ${origin} from ${clientIP}`);
      ws.close(1008, 'Invalid origin');
      return;
    }

    const clientId = uuidv4();
    const clientInfo: ClientInfo = {
      id: clientId,
      connectedAt: Date.now(),
      subscriptions: new Set(),
      ipAddress: clientIP // Add IP tracking
    };

    // Extract metadata from headers if available (with validation)
    if (request.headers['x-metadata']) {
      try {
        const metadata = JSON.parse(request.headers['x-metadata']);
        // Validate metadata structure
        if (this.isValidMetadata(metadata)) {
          clientInfo.metadata = metadata;
        }
      } catch (error) {
        console.warn('Invalid metadata provided');
      }
    }

    const client: ClientConnection = {
      id: clientId,
      ws,
      info: clientInfo,
      isAlive: true,
      pendingRequests: new Map(),
      authenticated: false, // Start as unauthenticated
      authTimeout: null
    };

    // Set authentication timeout (30 seconds to authenticate)
    client.authTimeout = setTimeout(() => {
      if (!client.authenticated) {
        console.warn(`Client ${clientId} failed to authenticate in time`);
        ws.close(1008, 'Authentication timeout');
      }
    }, 30000);

    // Register client
    try {
      this.clientManager.addClient(client);
      
      // Track IP connection
      ipConnections.add(clientId);
      this.connectionsByIP.set(clientIP, ipConnections);
      
      this.emit('client:connected', clientInfo);
    } catch (error) {
      ws.close(1008, 'Server error');
      return;
    }

    // Set up client event handlers
    ws.on('message', (data) => this.handleMessage(client, data));
    ws.on('pong', () => this.handlePong(client));
    ws.on('close', () => this.handleDisconnect(client));
    ws.on('error', (error) => this.handleError(client, error));

    // Send authentication challenge
    const challengeMessage: TransportMessage = {
      id: uuidv4(),
      type: MessageType.AUTH_REQUIRED,
      timestamp: Date.now(),
      payload: {
        message: 'Authentication required',
        timeout: 30000
      }
    };
    
    this.sendToClient(client, challengeMessage);
  }
```

### Step 3: Secure Message Handling

```typescript
  /**
   * Handle incoming message with security validation
   */
  private async handleMessage(client: ClientConnection, data: any): Promise<void> {
    try {
      // Security Check 1: Message size limit
      const messageSize = Buffer.byteLength(data.toString());
      if (messageSize > 64 * 1024) { // 64KB limit
        this.sendError(client, 'Message too large', 'MESSAGE_TOO_LARGE');
        return;
      }

      const message = JSON.parse(data.toString()) as TransportMessage;
      
      // Security Check 2: Validate message structure
      if (!this.isValidMessageStructure(message)) {
        this.sendError(client, 'Invalid message structure', 'INVALID_MESSAGE');
        return;
      }
      
      // Security Check 3: Apply security middleware validation
      const event = message.type === MessageType.EVENT ? message.payload : message;
      const validationResult = await this.securityMiddleware.validateEvent(event);
      
      if (!validationResult.valid) {
        const error = validationResult.errors[0];
        this.sendError(client, error.message, error.code);
        return;
      }
      
      // Security Check 4: Authentication requirement
      if (!client.authenticated && message.type !== MessageType.AUTH) {
        this.sendError(client, 'Authentication required', 'AUTH_REQUIRED');
        return;
      }
      
      switch (message.type) {
        case MessageType.AUTH:
          await this.handleAuthentication(client, message);
          break;
        case MessageType.EVENT:
          await this.handleEventMessage(client, message as EventMessage);
          break;
        case MessageType.REQUEST:
          await this.handleRequestMessage(client, message as RequestMessage);
          break;
        case MessageType.RESPONSE:
          await this.handleResponseMessage(client, message as ResponseMessage);
          break;
        case MessageType.SUBSCRIBE:
          await this.handleSubscribe(client, message);
          break;
        case MessageType.UNSUBSCRIBE:
          await this.handleUnsubscribe(client, message);
          break;
        case MessageType.PING:
          this.handlePing(client);
          break;
        default:
          this.sendError(client, 'Unknown message type', 'INVALID_MESSAGE_TYPE');
      }
    } catch (error) {
      console.error('Message handling error:', error);
      this.sendError(client, 'Invalid message format', 'PARSE_ERROR');
    }
  }
```

### Step 4: Implement Authentication Handler

```typescript
  /**
   * Handle authentication with proper validation
   */
  private async handleAuthentication(client: ClientConnection, message: TransportMessage): Promise<void> {
    const { token, extensionId, apiKey } = message.payload;
    
    // Validate required fields
    if (!token || !extensionId) {
      this.sendError(client, 'Missing authentication credentials', 'INVALID_CREDENTIALS');
      return;
    }
    
    // Validate extension ID format (Chrome extensions are 32 lowercase letters)
    if (!/^[a-z]{32}$/.test(extensionId)) {
      this.sendError(client, 'Invalid extension ID format', 'INVALID_EXTENSION_ID');
      return;
    }
    
    // Validate token (implement your token validation logic)
    const isValidToken = await this.validateAuthToken(token, extensionId, apiKey);
    if (!isValidToken) {
      this.sendError(client, 'Invalid authentication token', 'INVALID_TOKEN');
      return;
    }
    
    // Clear authentication timeout
    if (client.authTimeout) {
      clearTimeout(client.authTimeout);
      client.authTimeout = null;
    }
    
    // Mark as authenticated
    client.authenticated = true;
    client.info.extensionId = extensionId;
    
    // Update security middleware to track authenticated client
    this.securityMiddleware.addAllowedClient(client.id);
    
    // Send success response
    const response: ResponseMessage = {
      id: uuidv4(),
      type: MessageType.RESPONSE,
      timestamp: Date.now(),
      requestId: message.id,
      success: true,
      payload: {
        authenticated: true,
        sessionToken: this.generateSessionToken(client.id),
        expiresIn: 3600000 // 1 hour
      }
    };
    
    this.sendToClient(client, response);
    this.emit('client:authenticated', client.info);
  }
  
  /**
   * Validate authentication token
   */
  private async validateAuthToken(token: string, extensionId: string, apiKey?: string): Promise<boolean> {
    // TODO: Implement your token validation logic
    // Options:
    // 1. Check against a database of valid tokens
    // 2. Validate JWT signature
    // 3. Verify with Chrome Web Store API
    // 4. Check API key against whitelist
    
    // For now, basic validation
    if (token.length < 32) {
      return false;
    }
    
    // In production, implement proper validation
    return true;
  }
  
  /**
   * Generate secure session token
   */
  private generateSessionToken(clientId: string): string {
    // Use crypto for secure token generation
    const crypto = require('crypto');
    const timestamp = Date.now().toString();
    const random = crypto.randomBytes(16).toString('hex');
    const hash = crypto.createHash('sha256')
      .update(`${clientId}-${timestamp}-${random}`)
      .digest('hex');
    return hash;
  }
```

### Step 5: Add Helper Security Methods

```typescript
  /**
   * Validate message structure
   */
  private isValidMessageStructure(message: any): boolean {
    if (!message || typeof message !== 'object') {
      return false;
    }
    
    // Required fields
    if (!message.id || typeof message.id !== 'string') {
      return false;
    }
    
    if (!message.type || typeof message.type !== 'string') {
      return false;
    }
    
    if (typeof message.timestamp !== 'number') {
      return false;
    }
    
    // Validate timestamp is recent (within 5 minutes)
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    if (Math.abs(now - message.timestamp) > fiveMinutes) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Validate metadata structure
   */
  private isValidMetadata(metadata: any): boolean {
    if (!metadata || typeof metadata !== 'object') {
      return false;
    }
    
    // Prevent prototype pollution
    if ('__proto__' in metadata || 'constructor' in metadata || 'prototype' in metadata) {
      return false;
    }
    
    // Limit metadata size
    const metadataStr = JSON.stringify(metadata);
    if (metadataStr.length > 1024) { // 1KB limit
      return false;
    }
    
    return true;
  }
  
  /**
   * Validate connection origin
   */
  private isValidOrigin(origin: string): boolean {
    // Define allowed origins
    const allowedOrigins = [
      'chrome-extension://',
      'moz-extension://',
      'https://localhost',
      'https://semantest.com',
      // Add your production domains
    ];
    
    return allowedOrigins.some(allowed => origin.startsWith(allowed));
  }
  
  /**
   * Handle client disconnect with cleanup
   */
  private handleDisconnect(client: ClientConnection): void {
    // Clear authentication timeout if exists
    if (client.authTimeout) {
      clearTimeout(client.authTimeout);
    }
    
    // Remove from IP tracking
    const clientIP = client.info.ipAddress;
    if (clientIP) {
      const ipConnections = this.connectionsByIP.get(clientIP);
      if (ipConnections) {
        ipConnections.delete(client.id);
        if (ipConnections.size === 0) {
          this.connectionsByIP.delete(clientIP);
        }
      }
    }
    
    // Remove from security middleware
    this.securityMiddleware.removeAllowedClient(client.id);
    this.securityMiddleware.resetRateLimit(client.id);
    
    // Clean up subscriptions
    this.subscriptionManager.unsubscribeAll(client.id);
    
    // Remove client
    this.clientManager.removeClient(client.id);
    
    // Clear pending requests
    this.requestHandler.clearClientRequests(client.id);
    
    this.emit('client:disconnected', client.info);
  }
```

### Step 6: Update Types

**File**: `/sdk/server/src/types.ts`

```typescript
export interface ClientInfo {
  id: string;
  connectedAt: number;
  subscriptions: Set<string>;
  metadata?: any;
  extensionId?: string; // Add this
  ipAddress?: string; // Add this
}

export interface ClientConnection {
  id: string;
  ws: WebSocket;
  info: ClientInfo;
  isAlive: boolean;
  pendingRequests: Map<string, any>;
  authenticated?: boolean; // Add this
  authTimeout?: NodeJS.Timeout | null; // Add this
}

export enum MessageType {
  EVENT = 'event',
  REQUEST = 'request',
  RESPONSE = 'response',
  ERROR = 'error',
  SUBSCRIBE = 'subscribe',
  UNSUBSCRIBE = 'unsubscribe',
  PING = 'ping',
  PONG = 'pong',
  AUTH = 'auth', // Add this
  AUTH_REQUIRED = 'auth_required' // Add this
}
```

## Testing the Security Implementation

### Unit Tests

```typescript
// security.integration.test.ts
import { WebSocketServer } from '../src/server';
import WebSocket from 'ws';

describe('WebSocket Security Integration', () => {
  let server: WebSocketServer;
  
  beforeEach(async () => {
    server = new WebSocketServer({ port: 3001 });
    await server.start();
  });
  
  afterEach(async () => {
    await server.stop();
  });
  
  test('should reject unauthenticated messages', async () => {
    const ws = new WebSocket('ws://localhost:3002/');
    
    await new Promise(resolve => ws.on('open', resolve));
    
    // Try to send message without authentication
    ws.send(JSON.stringify({
      id: '123',
      type: 'event',
      timestamp: Date.now(),
      payload: { type: 'test', data: 'should fail' }
    }));
    
    const response = await new Promise<any>(resolve => {
      ws.on('message', data => resolve(JSON.parse(data.toString())));
    });
    
    expect(response.type).toBe('error');
    expect(response.payload.code).toBe('AUTH_REQUIRED');
  });
  
  test('should enforce rate limiting', async () => {
    const ws = new WebSocket('ws://localhost:3002/');
    await new Promise(resolve => ws.on('open', resolve));
    
    // Authenticate first
    ws.send(JSON.stringify({
      id: '123',
      type: 'auth',
      timestamp: Date.now(),
      payload: {
        token: 'a'.repeat(32),
        extensionId: 'a'.repeat(32)
      }
    }));
    
    // Wait for auth response
    await new Promise(resolve => ws.once('message', resolve));
    
    // Send many messages rapidly
    const errors = [];
    ws.on('message', data => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'error') errors.push(msg);
    });
    
    for (let i = 0; i < 150; i++) {
      ws.send(JSON.stringify({
        id: `msg-${i}`,
        type: 'event',
        timestamp: Date.now(),
        payload: { type: 'test', data: i }
      }));
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    expect(errors.some(e => e.payload.code === 'RATE_LIMIT_EXCEEDED')).toBe(true);
  });
});
```

## Deployment Checklist

- [ ] Security middleware integrated
- [ ] Authentication required for all operations
- [ ] Rate limiting active and tested
- [ ] Connection limits enforced
- [ ] Message size limits implemented
- [ ] Origin validation configured
- [ ] Security logging enabled
- [ ] Error messages don't leak sensitive info
- [ ] All security tests passing
- [ ] Performance impact assessed

## Next Steps

1. **Implement TLS/WSS support** (see separate guide)
2. **Add comprehensive security logging**
3. **Implement token management system**
4. **Create security monitoring dashboard**
5. **Set up intrusion detection alerts**

---

**Note**: This implementation provides basic security. For production use, implement proper token validation, database-backed authentication, and comprehensive logging.