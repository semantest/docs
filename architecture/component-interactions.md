# Component Interaction Diagrams

## Overview

This document illustrates how Semantest components interact with each other through events, APIs, and data flows.

## Core Component Interactions

### 1. Extension-Server Communication Flow

```mermaid
sequenceDiagram
    participant CE as Chrome Extension
    participant AM as Addon Manager
    participant WS as WebSocket Client
    participant WSS as WebSocket Server
    participant API as REST API
    participant Q as Queue Manager
    participant DB as Database
    
    Note over CE,AM: User visits chatgpt.com
    CE->>AM: Domain detected
    AM->>AM: Load ChatGPT addon
    AM->>CE: Inject addon scripts
    
    Note over CE,WS: User triggers action
    CE->>WS: Connect to WebSocket
    WS->>WSS: Establish connection
    WSS->>WS: Connection confirmed
    
    CE->>WS: emit('addon:chatgpt:message')
    WS->>WSS: Forward event
    WSS->>Q: Queue processing
    Q->>DB: Store message
    WSS->>WS: Broadcast to subscribers
```

### 2. Image Download Flow

```mermaid
graph TD
    A[User clicks download] -->|Extension| B[Addon captures event]
    B --> C{Validate request}
    C -->|Valid| D[emit download:requested]
    C -->|Invalid| E[Show error]
    
    D --> F[WebSocket Server]
    F --> G[Queue Manager]
    G --> H{Check rate limit}
    H -->|OK| I[Add to queue]
    H -->|Exceeded| J[Return 429]
    
    I --> K[Download Service]
    K --> L[Fetch image]
    L --> M[Save to storage]
    M --> N[emit download:completed]
    
    N --> O[Update all clients]
    O --> P[Extension shows success]
```

### 3. Event Bus Architecture

```mermaid
graph TB
    subgraph "Chrome Extension"
        A[Content Script] -->|emit| B[Message Bus]
        C[Popup] -->|subscribe| B
        D[Background] -->|subscribe| B
        E[Addon 1] -->|emit/subscribe| B
        F[Addon 2] -->|emit/subscribe| B
    end
    
    subgraph "Server Side"
        B -->|WebSocket| G[Event Router]
        G --> H[Auth Events]
        G --> I[Image Events]
        G --> J[System Events]
        
        H --> K[Auth Service]
        I --> L[Image Service]
        J --> M[Monitor Service]
    end
    
    subgraph "Storage"
        K --> N[(PostgreSQL)]
        L --> O[(File Storage)]
        M --> P[(Redis)]
    end
```

### 4. Failover Sequence

```mermaid
stateDiagram-v2
    [*] --> LocalServer: Initial State
    
    LocalServer --> HealthCheck: Every 5s
    HealthCheck --> LocalServer: Healthy
    HealthCheck --> CloudPrimary: Local Failed
    
    CloudPrimary --> CloudHealthCheck: Every 5s
    CloudHealthCheck --> CloudPrimary: Healthy
    CloudHealthCheck --> CloudFallback: Primary Failed
    
    CloudFallback --> FallbackCheck: Every 5s
    FallbackCheck --> CloudFallback: Healthy
    FallbackCheck --> OfflineMode: All Failed
    
    OfflineMode --> RetryConnection: Every 30s
    RetryConnection --> LocalServer: Local Available
    RetryConnection --> CloudPrimary: Cloud Available
    RetryConnection --> OfflineMode: Still Offline
```

## Detailed Component Responsibilities

### Chrome Extension Components

#### 1. Core Message Bus
```typescript
class MessageBus {
  // Central event system
  private handlers: Map<string, Set<Handler>>;
  
  emit(event: string, data: any): void
  on(event: string, handler: Handler): void
  off(event: string, handler: Handler): void
}
```

**Interactions:**
- Receives events from all extension components
- Routes events to appropriate handlers
- Manages WebSocket communication
- Handles offline queuing

#### 2. Addon Manager
```typescript
class AddonManager {
  // Dynamic addon loading
  private addons: Map<string, Addon>;
  
  loadAddon(domain: string): Promise<void>
  unloadAddon(addonId: string): void
  getActiveAddons(): Addon[]
}
```

**Interactions:**
- Monitors tab URL changes
- Loads/unloads addons dynamically
- Provides addon isolation
- Manages addon permissions

#### 3. WebSocket Client
```typescript
class WebSocketClient {
  // Server communication
  private connection: WebSocket;
  private reconnectAttempts: number;
  
  connect(): Promise<void>
  send(event: Event): void
  onMessage(handler: Handler): void
}
```

**Interactions:**
- Maintains persistent connection
- Handles reconnection logic
- Queues messages during disconnection
- Routes server events to Message Bus

### Server Components

#### 1. WebSocket Server
```typescript
class WebSocketServer {
  // Client management
  private clients: Map<string, Client>;
  private rooms: Map<string, Set<Client>>;
  
  handleConnection(ws: WebSocket): void
  broadcast(event: Event): void
  sendToRoom(room: string, event: Event): void
}
```

**Interactions:**
- Accepts client connections
- Routes events to appropriate services
- Manages client subscriptions
- Handles broadcasting

#### 2. Queue Manager
```typescript
class QueueManager {
  // Priority queue system
  private queues: PriorityQueues;
  private workers: Worker[];
  
  enqueue(item: QueueItem): void
  process(): Promise<void>
  getStatus(): QueueStatus
}
```

**Interactions:**
- Receives tasks from WebSocket Server
- Distributes work to processors
- Manages retry logic
- Reports status updates

#### 3. Service Layer
```typescript
interface Service {
  // Business logic
  handleEvent(event: Event): Promise<void>
  getStatus(): ServiceStatus
}
```

**Interactions:**
- Processes domain-specific events
- Interacts with data layer
- Emits result events
- Handles errors gracefully

## Data Flow Patterns

### 1. Request-Response Pattern
```
Client → WebSocket → Server → Service → Database
   ↑                                        ↓
   ←────────── Response Event ──────────────
```

### 2. Broadcast Pattern
```
Client A → WebSocket → Server → All Clients
                         ↓
                    Event Store
```

### 3. Queue Processing Pattern
```
Multiple Clients → Queue → Workers → Services
                     ↓
                Rate Limiter
```

## Integration Points

### 1. Extension ↔ Server
- **Protocol**: WebSocket (primary), REST (fallback)
- **Authentication**: JWT tokens
- **Events**: Namespaced (core:*, addon:*, system:*)
- **Error Handling**: Automatic retry with backoff

### 2. Server ↔ Database
- **PostgreSQL**: Primary data storage
- **Redis**: Caching and session storage
- **Connection Pooling**: Yes
- **Transactions**: ACID compliant

### 3. Server ↔ External Services
- **HTTP Client**: Axios with retry
- **Rate Limiting**: Per-service limits
- **Circuit Breaker**: Prevents cascading failures
- **Timeout**: 30s default

## Security Interactions

### Authentication Flow
```mermaid
sequenceDiagram
    participant U as User
    participant E as Extension
    participant A as Auth Service
    participant D as Database
    
    U->>E: Enter credentials
    E->>A: POST /auth/login
    A->>D: Verify credentials
    D->>A: User data
    A->>A: Generate JWT
    A->>E: Return token
    E->>E: Store in secure storage
    
    Note over E,A: Subsequent requests
    E->>A: Request with JWT
    A->>A: Verify token
    A->>E: Authorized response
```

### Permission Check Flow
```typescript
// Extension addon requests permission
addon.requestPermission('downloads') 
  → Core validates manifest
  → User consent dialog
  → Permission granted/denied
  → Update addon context
```

## Performance Considerations

### 1. Caching Strategy
- **Browser**: IndexedDB for offline data
- **Server**: Redis for hot data
- **CDN**: Static assets
- **TTL**: Context-dependent

### 2. Load Distribution
- **Round-robin**: WebSocket connections
- **Priority-based**: Queue processing
- **Geographic**: CDN and edge servers
- **Adaptive**: Based on server load

### 3. Resource Management
- **Connection Pooling**: Database and Redis
- **Worker Threads**: CPU-intensive tasks
- **Memory Limits**: Per-component quotas
- **Garbage Collection**: Aggressive cleanup

## Monitoring Integration

### Metrics Collection Points
```
Extension → Events → Server → Prometheus → Grafana
     ↓                  ↓
  Console Logs    Application Logs → ElasticSearch
```

### Health Check Endpoints
- `/health` - Basic liveness
- `/ready` - Readiness probe
- `/metrics` - Prometheus format
- `/status` - Detailed status

## Error Handling Flows

### 1. Client-Side Error
```
Error in Addon → Caught by Message Bus → Log to Console → Report to Server → User Notification
```

### 2. Server-Side Error
```
Service Error → Error Event → All Clients → Retry Logic → Dead Letter Queue → Alert
```

### 3. Network Error
```
Connection Lost → Offline Queue → Reconnect Attempts → Resume on Success → Sync Queue
```

## Conclusion

These interaction diagrams show how Semantest components work together to create a robust, scalable web automation platform. The event-driven architecture ensures loose coupling while maintaining reliable communication between all parts of the system.