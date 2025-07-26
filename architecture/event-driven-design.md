# Event-Driven Design Patterns

## Introduction

Semantest leverages Event-Driven Architecture (EDA) to create a loosely coupled, scalable, and maintainable system. This document outlines the key patterns and principles used throughout the platform.

## Core EDA Principles

### 1. Event-First Thinking
Every significant state change or action in the system is modeled as an event. This provides:
- **Auditability**: Complete history of system behavior
- **Decoupling**: Components don't need to know about each other
- **Flexibility**: Easy to add new event consumers
- **Resilience**: Failure isolation between components

### 2. Event Anatomy

```typescript
interface DomainEvent {
  // Unique identifier for this event instance
  id: string;
  
  // Type of event (namespaced)
  type: string;
  
  // When the event occurred
  timestamp: number;
  
  // Who/what triggered the event
  source: EventSource;
  
  // Event-specific data
  payload: unknown;
  
  // For tracking related events
  correlationId?: string;
  
  // For event ordering
  version: number;
}
```

## Event Patterns Used

### 1. Event Notification Pattern

Used when components need to know something happened without expecting a response.

```typescript
// Example: Image download completed
class ImageDownloadCompleted implements DomainEvent {
  type = 'images:download:completed';
  
  constructor(
    public payload: {
      imageUrl: string;
      localPath: string;
      fileSize: number;
      downloadTime: number;
    }
  ) {}
}

// Publisher
eventBus.emit(new ImageDownloadCompleted({
  imageUrl: 'https://example.com/image.jpg',
  localPath: '/downloads/image.jpg',
  fileSize: 1048576,
  downloadTime: 1500
}));

// Subscribers
eventBus.on('images:download:completed', async (event) => {
  // Update UI
  await updateDownloadList(event.payload);
  
  // Log metrics
  await logDownloadMetrics(event.payload);
});
```

### 2. Event-Carried State Transfer

Events carry enough data for consumers to update their own state without callbacks.

```typescript
// Example: User session state
interface SessionStateChanged extends DomainEvent {
  type: 'auth:session:changed';
  payload: {
    userId: string;
    isAuthenticated: boolean;
    permissions: string[];
    expiresAt: number;
  };
}

// Consumers maintain their own view of session state
class PermissionChecker {
  private permissions: Set<string> = new Set();
  
  constructor(eventBus: EventBus) {
    eventBus.on('auth:session:changed', (event) => {
      this.permissions = new Set(event.payload.permissions);
    });
  }
  
  hasPermission(permission: string): boolean {
    return this.permissions.has(permission);
  }
}
```

### 3. Event Sourcing (Partial)

Critical operations store events as the source of truth.

```typescript
// Download queue events as source of truth
type QueueEvent = 
  | { type: 'queue:item:added'; item: QueueItem }
  | { type: 'queue:item:started'; itemId: string }
  | { type: 'queue:item:completed'; itemId: string }
  | { type: 'queue:item:failed'; itemId: string; error: Error };

class QueueEventStore {
  private events: QueueEvent[] = [];
  
  append(event: QueueEvent): void {
    this.events.push({
      ...event,
      timestamp: Date.now()
    });
  }
  
  // Rebuild queue state from events
  rebuildState(): QueueState {
    return this.events.reduce((state, event) => {
      switch (event.type) {
        case 'queue:item:added':
          return { ...state, items: [...state.items, event.item] };
        case 'queue:item:completed':
          return {
            ...state,
            items: state.items.filter(i => i.id !== event.itemId)
          };
        // ... other cases
      }
    }, initialState);
  }
}
```

### 4. CQRS Pattern

Separate paths for commands (writes) and queries (reads).

```typescript
// Command side - events
class ImageDownloadCommand {
  constructor(
    private eventBus: EventBus,
    private downloadService: DownloadService
  ) {}
  
  async execute(request: DownloadRequest): Promise<void> {
    // Validate
    if (!this.isValidUrl(request.url)) {
      throw new ValidationError('Invalid URL');
    }
    
    // Emit event
    await this.eventBus.emit({
      type: 'images:download:requested',
      payload: request
    });
    
    // Process asynchronously
    this.downloadService.process(request);
  }
}

// Query side - read models
class DownloadHistoryQuery {
  constructor(private readModel: DownloadReadModel) {}
  
  async getHistory(userId: string): Promise<Download[]> {
    return this.readModel.getByUser(userId);
  }
  
  async getStats(): Promise<DownloadStats> {
    return this.readModel.getStats();
  }
}
```

## Event Bus Implementation

### TypeScript Event Bus

```typescript
type EventHandler<T = any> = (event: T) => void | Promise<void>;

class EventBus {
  private handlers = new Map<string, Set<EventHandler>>();
  private middlewares: EventMiddleware[] = [];
  
  // Register handler
  on<T extends DomainEvent>(
    eventType: string,
    handler: EventHandler<T>
  ): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    
    this.handlers.get(eventType)!.add(handler);
    
    // Return unsubscribe function
    return () => {
      this.handlers.get(eventType)?.delete(handler);
    };
  }
  
  // Emit event
  async emit<T extends DomainEvent>(event: T): Promise<void> {
    // Apply middlewares
    let processedEvent = event;
    for (const middleware of this.middlewares) {
      processedEvent = await middleware.process(processedEvent);
    }
    
    // Get handlers
    const handlers = this.handlers.get(processedEvent.type) || new Set();
    
    // Execute handlers
    const promises = Array.from(handlers).map(handler => 
      this.executeHandler(handler, processedEvent)
    );
    
    await Promise.allSettled(promises);
  }
  
  // Error handling
  private async executeHandler(
    handler: EventHandler,
    event: DomainEvent
  ): Promise<void> {
    try {
      await handler(event);
    } catch (error) {
      console.error(`Handler error for ${event.type}:`, error);
      
      // Emit error event
      await this.emit({
        type: 'system:handler:error',
        payload: { originalEvent: event, error }
      } as any);
    }
  }
}
```

### Event Namespacing Convention

```typescript
// Format: domain:entity:action
const eventTypes = {
  // Authentication domain
  'auth:session:created': SessionCreated,
  'auth:session:expired': SessionExpired,
  'auth:user:logged-in': UserLoggedIn,
  
  // Images domain
  'images:download:requested': DownloadRequested,
  'images:download:queued': DownloadQueued,
  'images:download:completed': DownloadCompleted,
  
  // Extension domain
  'extension:addon:loaded': AddonLoaded,
  'extension:addon:activated': AddonActivated,
  'extension:message:received': MessageReceived,
  
  // System domain
  'system:health:checked': HealthChecked,
  'system:error:occurred': ErrorOccurred,
  'system:metric:recorded': MetricRecorded
};
```

## WebSocket Event Patterns

### Bidirectional Event Flow

```typescript
// Client → Server events
interface ClientEvents {
  'client:subscribe': { channels: string[] };
  'client:unsubscribe': { channels: string[] };
  'client:action': { type: string; payload: any };
}

// Server → Client events
interface ServerEvents {
  'server:connected': { clientId: string };
  'server:event': DomainEvent;
  'server:error': { code: string; message: string };
}

// WebSocket wrapper with type safety
class TypedWebSocket {
  private ws: WebSocket;
  private eventHandlers = new Map<string, Set<Function>>();
  
  on<K extends keyof ServerEvents>(
    event: K,
    handler: (data: ServerEvents[K]) => void
  ): void {
    // Type-safe event handling
  }
  
  emit<K extends keyof ClientEvents>(
    event: K,
    data: ClientEvents[K]
  ): void {
    this.ws.send(JSON.stringify({ type: event, data }));
  }
}
```

### Event Reliability Patterns

```typescript
// 1. At-least-once delivery with acknowledgments
class ReliableEventBus extends EventBus {
  async emitWithAck(event: DomainEvent): Promise<void> {
    const ackEvent = {
      ...event,
      requiresAck: true,
      ackTimeout: 5000
    };
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Event acknowledgment timeout'));
      }, ackEvent.ackTimeout);
      
      this.once(`ack:${event.id}`, () => {
        clearTimeout(timeout);
        resolve();
      });
      
      this.emit(ackEvent);
    });
  }
}

// 2. Event ordering with version numbers
class OrderedEventProcessor {
  private lastProcessedVersion = 0;
  private pendingEvents = new Map<number, DomainEvent>();
  
  async process(event: DomainEvent): Promise<void> {
    if (event.version === this.lastProcessedVersion + 1) {
      // Process immediately
      await this.processEvent(event);
      this.lastProcessedVersion = event.version;
      
      // Check for pending events
      this.processPending();
    } else if (event.version > this.lastProcessedVersion) {
      // Out of order - store for later
      this.pendingEvents.set(event.version, event);
    }
    // Ignore if version <= lastProcessed (duplicate)
  }
}
```

## Event-Driven UI Patterns

### UI Event Synchronization

```typescript
// Extension popup subscribes to events
class PopupController {
  private messageList: Message[] = [];
  
  constructor(private eventBus: EventBus) {
    // Subscribe to relevant events
    this.eventBus.on('extension:message:received', (event) => {
      this.messageList.push(event.payload);
      this.render();
    });
    
    this.eventBus.on('extension:message:cleared', () => {
      this.messageList = [];
      this.render();
    });
  }
  
  private render(): void {
    // Update UI with new state
    ReactDOM.render(
      <MessageList messages={this.messageList} />,
      document.getElementById('root')
    );
  }
}
```

### Optimistic UI Updates

```typescript
class OptimisticDownloadManager {
  async requestDownload(url: string): Promise<void> {
    const tempId = generateTempId();
    
    // Optimistic update
    this.eventBus.emit({
      type: 'ui:download:pending',
      payload: { id: tempId, url, status: 'pending' }
    });
    
    try {
      const result = await this.api.requestDownload(url);
      
      // Replace with real data
      this.eventBus.emit({
        type: 'ui:download:confirmed',
        payload: { tempId, ...result }
      });
    } catch (error) {
      // Rollback on failure
      this.eventBus.emit({
        type: 'ui:download:failed',
        payload: { tempId, error }
      });
    }
  }
}
```

## Testing Event-Driven Systems

### Event Testing Patterns

```typescript
describe('ImageDownloadService', () => {
  let eventBus: EventBus;
  let service: ImageDownloadService;
  let eventSpy: jest.SpyInstance;
  
  beforeEach(() => {
    eventBus = new EventBus();
    service = new ImageDownloadService(eventBus);
    eventSpy = jest.spyOn(eventBus, 'emit');
  });
  
  it('should emit download:completed on success', async () => {
    await service.download('https://example.com/image.jpg');
    
    expect(eventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'images:download:completed',
        payload: expect.objectContaining({
          imageUrl: 'https://example.com/image.jpg'
        })
      })
    );
  });
  
  it('should handle event flow integration', async () => {
    const events: DomainEvent[] = [];
    
    eventBus.on('images:download:requested', (e) => events.push(e));
    eventBus.on('images:download:queued', (e) => events.push(e));
    eventBus.on('images:download:completed', (e) => events.push(e));
    
    await service.download('https://example.com/image.jpg');
    
    expect(events.map(e => e.type)).toEqual([
      'images:download:requested',
      'images:download:queued',
      'images:download:completed'
    ]);
  });
});
```

## Best Practices

### 1. Event Design
- **Single Responsibility**: Each event represents one thing
- **Immutability**: Events are read-only once created
- **Self-Contained**: Include all necessary data
- **Versioning**: Plan for event evolution

### 2. Error Handling
- **Fail Fast**: Validate before emitting events
- **Graceful Degradation**: Handle missing event handlers
- **Error Events**: Emit errors as events too
- **Retry Logic**: Implement for critical events

### 3. Performance
- **Async Handlers**: Don't block the event loop
- **Batch Processing**: Group related events
- **Debouncing**: Prevent event storms
- **Selective Subscription**: Only subscribe to needed events

### 4. Monitoring
- **Event Metrics**: Count, latency, errors
- **Event Tracing**: Correlation IDs for debugging
- **Dead Letter Queue**: For failed events
- **Event Replay**: For debugging and recovery

## Conclusion

Event-Driven Architecture in Semantest provides:
- **Loose Coupling**: Components evolve independently
- **Scalability**: Easy to add new event consumers
- **Reliability**: Failure isolation and recovery
- **Flexibility**: Multiple consumers for same events
- **Debuggability**: Complete audit trail of system behavior

This architecture enables building complex web automation workflows while maintaining system simplicity and reliability.