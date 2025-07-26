# Semantest WebSocket Protocol Reference

The Semantest framework uses WebSocket for real-time bidirectional communication between clients and servers. This document defines the protocol specification, message formats, and event flows.

## Protocol Overview

- **Version**: 2.0.0
- **Transport**: WebSocket (RFC 6455)
- **Encoding**: JSON
- **Subprotocol**: `semantest-v2`

## Connection Lifecycle

### 1. Connection Establishment

```
Client                          Server
  |                               |
  |-------- WebSocket Upgrade --->|
  |<------- 101 Switching --------|
  |                               |
  |-------- AUTH message -------->|
  |<------- AUTH_SUCCESS ---------|
  |                               |
  |<------- SYSTEM_READY ---------|
  |                               |
```

### 2. Connection URL

```
ws://host:port/ws?token=<auth-token>&client-id=<uuid>&version=2.0.0
wss://host:port/ws?token=<auth-token>&client-id=<uuid>&version=2.0.0
```

### 3. Handshake Headers

```http
GET /ws HTTP/1.1
Host: localhost:3000
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
Sec-WebSocket-Protocol: semantest-v2
```

## Message Format

All messages follow this structure:

```typescript
interface Message {
  // Message metadata
  id: string;              // Unique message ID (UUID v4)
  type: string;            // Message type
  timestamp: number;       // Unix timestamp in milliseconds
  
  // Optional correlation
  correlationId?: string;  // For request-response correlation
  replyTo?: string;        // ID of message being replied to
  
  // Message content
  payload: any;            // Type-specific payload
  
  // Optional metadata
  metadata?: {
    clientId?: string;
    sessionId?: string;
    version?: string;
    [key: string]: any;
  };
}
```

## Message Types

### System Messages

#### AUTH
Client authentication request.

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "type": "AUTH",
  "timestamp": 1642531200000,
  "payload": {
    "type": "token",
    "credentials": "your-auth-token",
    "clientInfo": {
      "name": "Test Client",
      "version": "1.0.0",
      "capabilities": ["browser", "screenshot", "console"]
    }
  }
}
```

#### AUTH_SUCCESS
Server authentication success response.

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "type": "AUTH_SUCCESS",
  "timestamp": 1642531201000,
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "payload": {
    "sessionId": "session-123",
    "expiresAt": 1642617600000,
    "permissions": ["test:execute", "test:monitor", "browser:control"]
  }
}
```

#### AUTH_FAILED
Server authentication failure response.

```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "type": "AUTH_FAILED",
  "timestamp": 1642531201000,
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "payload": {
    "code": "INVALID_TOKEN",
    "message": "Authentication token is invalid or expired"
  }
}
```

#### SYSTEM_READY
Server ready notification with capabilities.

```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "type": "SYSTEM_READY",
  "timestamp": 1642531202000,
  "payload": {
    "version": "2.0.0",
    "capabilities": [
      "test-orchestration",
      "browser-automation",
      "parallel-execution",
      "real-time-monitoring"
    ],
    "limits": {
      "maxConcurrentTests": 10,
      "maxTestDuration": 3600000,
      "maxPayloadSize": 10485760
    }
  }
}
```

#### PING/PONG
Keep-alive messages.

```json
// Client -> Server
{
  "id": "990e8400-e29b-41d4-a716-446655440004",
  "type": "PING",
  "timestamp": 1642531210000
}

// Server -> Client
{
  "id": "aa0e8400-e29b-41d4-a716-446655440005",
  "type": "PONG",
  "timestamp": 1642531210001,
  "correlationId": "990e8400-e29b-41d4-a716-446655440004"
}
```

#### ERROR
Error notification.

```json
{
  "id": "bb0e8400-e29b-41d4-a716-446655440006",
  "type": "ERROR",
  "timestamp": 1642531215000,
  "payload": {
    "code": "TEST_EXECUTION_FAILED",
    "message": "Test execution failed due to timeout",
    "details": {
      "testId": "test-123",
      "timeout": 30000,
      "elapsed": 30100
    },
    "fatal": false
  }
}
```

### Test Messages

#### TEST_EXECUTE
Request to execute a test.

```json
{
  "id": "cc0e8400-e29b-41d4-a716-446655440007",
  "type": "TEST_EXECUTE",
  "timestamp": 1642531220000,
  "payload": {
    "testId": "test-123",
    "name": "Login Flow Test",
    "suite": "Authentication",
    "code": "async function test(ctx) { ... }",
    "options": {
      "timeout": 30000,
      "retries": 2,
      "browser": "chrome",
      "headless": true
    },
    "metadata": {
      "tags": ["smoke", "auth"],
      "priority": "high"
    }
  }
}
```

#### TEST_STARTED
Test execution started notification.

```json
{
  "id": "dd0e8400-e29b-41d4-a716-446655440008",
  "type": "TEST_STARTED",
  "timestamp": 1642531221000,
  "correlationId": "cc0e8400-e29b-41d4-a716-446655440007",
  "payload": {
    "testId": "test-123",
    "executionId": "exec-456",
    "startTime": 1642531221000,
    "environment": {
      "browser": "chrome",
      "version": "96.0.4664.110",
      "os": "linux"
    }
  }
}
```

#### TEST_PROGRESS
Test execution progress update.

```json
{
  "id": "ee0e8400-e29b-41d4-a716-446655440009",
  "type": "TEST_PROGRESS",
  "timestamp": 1642531225000,
  "payload": {
    "testId": "test-123",
    "executionId": "exec-456",
    "step": "Filling login form",
    "progress": 45,
    "screenshot": "data:image/png;base64,..."
  }
}
```

#### TEST_COMPLETED
Test execution completed notification.

```json
{
  "id": "ff0e8400-e29b-41d4-a716-446655440010",
  "type": "TEST_COMPLETED",
  "timestamp": 1642531250000,
  "payload": {
    "testId": "test-123",
    "executionId": "exec-456",
    "status": "passed",
    "duration": 29000,
    "results": {
      "assertions": {
        "total": 5,
        "passed": 5,
        "failed": 0
      },
      "screenshots": ["screenshot-1.png", "screenshot-2.png"],
      "logs": [
        {
          "level": "info",
          "message": "Navigation successful",
          "timestamp": 1642531222000
        }
      ]
    }
  }
}
```

#### TEST_FAILED
Test execution failed notification.

```json
{
  "id": "110e8400-e29b-41d4-a716-446655440011",
  "type": "TEST_FAILED",
  "timestamp": 1642531240000,
  "payload": {
    "testId": "test-123",
    "executionId": "exec-456",
    "status": "failed",
    "duration": 19000,
    "error": {
      "name": "AssertionError",
      "message": "Expected URL to be '/dashboard' but got '/login'",
      "stack": "AssertionError: Expected URL...\n  at test.js:15:10",
      "screenshot": "data:image/png;base64,..."
    }
  }
}
```

### Browser Messages

#### BROWSER_NAVIGATE
Navigate browser to URL.

```json
{
  "id": "220e8400-e29b-41d4-a716-446655440012",
  "type": "BROWSER_NAVIGATE",
  "timestamp": 1642531260000,
  "payload": {
    "url": "https://example.com/login",
    "options": {
      "waitUntil": "networkidle",
      "timeout": 30000
    }
  }
}
```

#### BROWSER_CLICK
Click element in browser.

```json
{
  "id": "330e8400-e29b-41d4-a716-446655440013",
  "type": "BROWSER_CLICK",
  "timestamp": 1642531265000,
  "payload": {
    "selector": "#login-button",
    "options": {
      "button": "left",
      "clickCount": 1,
      "delay": 0
    }
  }
}
```

#### BROWSER_TYPE
Type text in browser input.

```json
{
  "id": "440e8400-e29b-41d4-a716-446655440014",
  "type": "BROWSER_TYPE",
  "timestamp": 1642531270000,
  "payload": {
    "selector": "#username",
    "text": "testuser@example.com",
    "options": {
      "delay": 50,
      "clearFirst": true
    }
  }
}
```

#### BROWSER_SCREENSHOT
Take browser screenshot.

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440015",
  "type": "BROWSER_SCREENSHOT",
  "timestamp": 1642531280000,
  "payload": {
    "options": {
      "fullPage": true,
      "format": "png",
      "quality": 90
    }
  }
}
```

#### BROWSER_CONSOLE
Browser console output.

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440016",
  "type": "BROWSER_CONSOLE",
  "timestamp": 1642531285000,
  "payload": {
    "level": "error",
    "message": "Failed to load resource: 404",
    "url": "https://example.com/api/data",
    "line": 42,
    "column": 15
  }
}
```

### Subscription Messages

#### SUBSCRIBE
Subscribe to event types.

```json
{
  "id": "770e8400-e29b-41d4-a716-446655440017",
  "type": "SUBSCRIBE",
  "timestamp": 1642531290000,
  "payload": {
    "events": [
      "TEST_STARTED",
      "TEST_COMPLETED",
      "TEST_FAILED",
      "BROWSER_CONSOLE"
    ],
    "filter": {
      "testSuite": "Authentication",
      "tags": ["smoke"]
    }
  }
}
```

#### UNSUBSCRIBE
Unsubscribe from event types.

```json
{
  "id": "880e8400-e29b-41d4-a716-446655440018",
  "type": "UNSUBSCRIBE",
  "timestamp": 1642531295000,
  "payload": {
    "events": ["BROWSER_CONSOLE"]
  }
}
```

## Event Flow Examples

### Test Execution Flow

```
Client                              Server
  |                                   |
  |------- TEST_EXECUTE ------------>|
  |<------ TEST_STARTED --------------|
  |                                   |
  |<------ TEST_PROGRESS (25%) ------|
  |<------ BROWSER_NAVIGATE ---------|
  |                                   |
  |<------ TEST_PROGRESS (50%) ------|
  |<------ BROWSER_TYPE -------------|
  |<------ BROWSER_CLICK ------------|
  |                                   |
  |<------ TEST_PROGRESS (75%) ------|
  |<------ BROWSER_SCREENSHOT -------|
  |                                   |
  |<------ TEST_COMPLETED -----------|
  |                                   |
```

### Error Handling Flow

```
Client                              Server
  |                                   |
  |------- TEST_EXECUTE ------------>|
  |<------ TEST_STARTED --------------|
  |                                   |
  |<------ BROWSER_NAVIGATE ---------|
  |<------ ERROR (timeout) ----------|
  |<------ TEST_FAILED --------------|
  |                                   |
```

### Subscription Flow

```
Client                              Server
  |                                   |
  |------- SUBSCRIBE --------------->|
  |<------ SUBSCRIPTION_CONFIRMED ----|
  |                                   |
  |        (Other client executes test)
  |<------ TEST_STARTED --------------|
  |<------ TEST_PROGRESS ------------|
  |<------ TEST_COMPLETED -----------|
  |                                   |
  |------- UNSUBSCRIBE ------------->|
  |<------ UNSUBSCRIBE_CONFIRMED ----|
  |                                   |
```

## Error Codes

| Code | Description | Recoverable |
|------|-------------|-------------|
| `AUTH_FAILED` | Authentication failed | Yes |
| `INVALID_MESSAGE` | Message format invalid | Yes |
| `UNKNOWN_MESSAGE_TYPE` | Unknown message type | Yes |
| `TEST_NOT_FOUND` | Test ID not found | Yes |
| `TEST_TIMEOUT` | Test execution timeout | Yes |
| `BROWSER_ERROR` | Browser operation failed | Yes |
| `QUOTA_EXCEEDED` | Rate limit exceeded | Yes |
| `SERVER_ERROR` | Internal server error | Maybe |
| `CONNECTION_LOST` | WebSocket connection lost | Yes |

## Rate Limiting

The server implements rate limiting to prevent abuse:

- **Connection limit**: 10 connections per IP
- **Message limit**: 100 messages per minute per connection
- **Test execution limit**: 10 concurrent tests per client
- **Screenshot limit**: 60 screenshots per minute

Rate limit headers in error responses:

```json
{
  "type": "ERROR",
  "payload": {
    "code": "QUOTA_EXCEEDED",
    "message": "Rate limit exceeded",
    "details": {
      "limit": 100,
      "remaining": 0,
      "resetAt": 1642531320000
    }
  }
}
```

## Binary Data

For large payloads (screenshots, files), use binary frames:

1. Send metadata message with `binaryFollows: true`
2. Send binary data in next frame
3. Server correlates by sequence

```json
// Frame 1: Metadata (text)
{
  "id": "990e8400-e29b-41d4-a716-446655440019",
  "type": "BROWSER_SCREENSHOT_RESULT",
  "timestamp": 1642531300000,
  "payload": {
    "format": "png",
    "size": 1048576,
    "binaryFollows": true
  }
}

// Frame 2: Binary data
[Binary PNG data]
```

## Security Considerations

1. **Authentication**: Always require authentication before accepting commands
2. **Input Validation**: Validate all message payloads against schemas
3. **Rate Limiting**: Implement rate limiting to prevent DoS
4. **Encryption**: Use WSS (WebSocket Secure) in production
5. **Origin Checking**: Validate connection origins
6. **Token Expiry**: Implement token expiration and refresh
7. **Permission Checking**: Verify permissions for each operation

## Client Implementation Example

```typescript
class SemantestWebSocketClient {
  private ws: WebSocket;
  private messageHandlers = new Map<string, Function>();
  
  connect(url: string, token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(`${url}?token=${token}`);
      
      this.ws.onopen = () => {
        this.send('AUTH', {
          type: 'token',
          credentials: token
        });
      };
      
      this.ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        
        if (message.type === 'AUTH_SUCCESS') {
          resolve();
        } else if (message.type === 'AUTH_FAILED') {
          reject(new Error(message.payload.message));
        }
        
        // Handle other messages
        const handler = this.messageHandlers.get(message.type);
        if (handler) {
          handler(message.payload);
        }
      };
      
      this.ws.onerror = reject;
    });
  }
  
  send(type: string, payload: any): void {
    const message = {
      id: generateUUID(),
      type,
      timestamp: Date.now(),
      payload
    };
    
    this.ws.send(JSON.stringify(message));
  }
  
  on(type: string, handler: Function): void {
    this.messageHandlers.set(type, handler);
  }
}
```

## Server Implementation Example

```typescript
class SemantestWebSocketServer {
  private wss: WebSocketServer;
  private clients = new Map<string, AuthenticatedClient>();
  
  constructor(port: number) {
    this.wss = new WebSocketServer({ port });
    
    this.wss.on('connection', (ws, req) => {
      const token = this.extractToken(req.url);
      
      if (!token) {
        ws.close(1008, 'Missing authentication token');
        return;
      }
      
      this.handleConnection(ws, token);
    });
  }
  
  private async handleConnection(ws: WebSocket, token: string) {
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'AUTH') {
          const isValid = await this.validateToken(message.payload.credentials);
          
          if (isValid) {
            const client = {
              id: generateUUID(),
              ws,
              permissions: ['test:execute', 'test:monitor']
            };
            
            this.clients.set(client.id, client);
            
            this.sendMessage(ws, 'AUTH_SUCCESS', {
              sessionId: client.id,
              permissions: client.permissions
            });
            
            this.sendMessage(ws, 'SYSTEM_READY', {
              version: '2.0.0',
              capabilities: ['test-orchestration', 'browser-automation']
            });
          } else {
            this.sendMessage(ws, 'AUTH_FAILED', {
              code: 'INVALID_TOKEN',
              message: 'Invalid authentication token'
            });
            ws.close(1008, 'Authentication failed');
          }
        } else {
          // Handle other message types
          await this.handleMessage(message, ws);
        }
      } catch (error) {
        this.sendError(ws, 'INVALID_MESSAGE', 'Failed to parse message');
      }
    });
  }
  
  private sendMessage(ws: WebSocket, type: string, payload: any): void {
    const message = {
      id: generateUUID(),
      type,
      timestamp: Date.now(),
      payload
    };
    
    ws.send(JSON.stringify(message));
  }
}
```

## Compatibility

- **WebSocket Protocol**: RFC 6455
- **Minimum Browser Support**: Chrome 16+, Firefox 11+, Safari 7+, Edge 12+
- **Node.js**: 14.0+
- **Encoding**: UTF-8 for text frames
- **Maximum Message Size**: 10MB (configurable)