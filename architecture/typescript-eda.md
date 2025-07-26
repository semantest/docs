# TypeScript-EDA Integration

## Overview

Semantest leverages TypeScript's powerful type system to create a type-safe, developer-friendly Event-Driven Architecture. This document details how TypeScript enhances our EDA implementation.

## Type-Safe Event System

### Strongly Typed Events

```typescript
// Base event interface with generics
interface DomainEvent<T = unknown> {
  id: string;
  type: string;
  timestamp: number;
  source: EventSource;
  payload: T;
  correlationId?: string;
  version: number;
}

// Specific event types with payload contracts
interface ImageDownloadRequested extends DomainEvent<{
  imageUrl: string;
  quality: 'thumbnail' | 'medium' | 'high';
  filename?: string;
}> {
  type: 'images:download:requested';
}

interface ImageDownloadCompleted extends DomainEvent<{
  imageUrl: string;
  localPath: string;
  fileSize: number;
  downloadTime: number;
  metadata: ImageMetadata;
}> {
  type: 'images:download:completed';
}

// Union type for all events
type SystemEvent = 
  | ImageDownloadRequested
  | ImageDownloadCompleted
  | SessionCreated
  | SessionExpired
  // ... other events
```

### Type-Safe Event Bus

```typescript
// Event map for type inference
interface EventMap {
  'images:download:requested': ImageDownloadRequested;
  'images:download:completed': ImageDownloadCompleted;
  'auth:session:created': SessionCreated;
  'auth:session:expired': SessionExpired;
}

// Type-safe event bus
class TypedEventBus {
  private handlers = new Map<string, Set<Function>>();
  
  // Type-safe event subscription
  on<K extends keyof EventMap>(
    eventType: K,
    handler: (event: EventMap[K]) => void | Promise<void>
  ): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    
    this.handlers.get(eventType)!.add(handler);
    
    return () => {
      this.handlers.get(eventType)?.delete(handler);
    };
  }
  
  // Type-safe event emission
  emit<K extends keyof EventMap>(
    eventType: K,
    payload: EventMap[K]['payload']
  ): Promise<void> {
    const event: EventMap[K] = {
      id: generateId(),
      type: eventType,
      timestamp: Date.now(),
      source: this.getSource(),
      payload,
      version: 1
    } as EventMap[K];
    
    return this.processEvent(event);
  }
}

// Usage with full type safety
const eventBus = new TypedEventBus();

// TypeScript knows the payload type
eventBus.on('images:download:completed', (event) => {
  console.log(event.payload.fileSize); // ✓ Type safe
  console.log(event.payload.invalid);   // ✗ Compile error
});

// TypeScript enforces correct payload
eventBus.emit('images:download:requested', {
  imageUrl: 'https://example.com/image.jpg',
  quality: 'high'
}); // ✓ Valid

eventBus.emit('images:download:requested', {
  imageUrl: 'https://example.com/image.jpg',
  quality: 'invalid' // ✗ Compile error
});
```

## Advanced TypeScript Patterns

### Discriminated Unions for Event Handling

```typescript
// Event types with discriminated unions
type QueueEvent = 
  | { type: 'queue:item:added'; item: QueueItem }
  | { type: 'queue:item:started'; itemId: string; workerId: string }
  | { type: 'queue:item:completed'; itemId: string; result: any }
  | { type: 'queue:item:failed'; itemId: string; error: Error; retryCount: number };

// Type-safe event handler with exhaustive checking
function handleQueueEvent(event: QueueEvent): void {
  switch (event.type) {
    case 'queue:item:added':
      console.log('New item:', event.item);
      break;
      
    case 'queue:item:started':
      console.log('Started by worker:', event.workerId);
      break;
      
    case 'queue:item:completed':
      console.log('Result:', event.result);
      break;
      
    case 'queue:item:failed':
      console.log('Failed after', event.retryCount, 'retries');
      break;
      
    default:
      // TypeScript ensures exhaustive handling
      const _exhaustive: never = event;
      throw new Error(`Unhandled event type: ${_exhaustive}`);
  }
}
```

### Generic Event Handlers

```typescript
// Generic event handler type
type EventHandler<T extends DomainEvent> = (event: T) => void | Promise<void>;

// Generic middleware type
type EventMiddleware<T extends DomainEvent = DomainEvent> = {
  process(event: T): T | Promise<T>;
};

// Type-safe middleware implementation
class LoggingMiddleware<T extends DomainEvent> implements EventMiddleware<T> {
  async process(event: T): Promise<T> {
    console.log(`Event: ${event.type}`, event.payload);
    return event;
  }
}

// Conditional types for event filtering
type EventsWithPayload<T> = Extract<SystemEvent, { payload: T }>;
type ImageEvents = Extract<SystemEvent, { type: `images:${string}` }>;
```

### Builder Pattern for Complex Events

```typescript
// Type-safe event builder
class EventBuilder<T extends DomainEvent> {
  private event: Partial<T> = {};
  
  static create<K extends keyof EventMap>(type: K): EventBuilder<EventMap[K]> {
    const builder = new EventBuilder<EventMap[K]>();
    builder.event.type = type;
    builder.event.id = generateId();
    builder.event.timestamp = Date.now();
    return builder;
  }
  
  withPayload(payload: T['payload']): this {
    this.event.payload = payload;
    return this;
  }
  
  withCorrelationId(id: string): this {
    this.event.correlationId = id;
    return this;
  }
  
  withSource(source: EventSource): this {
    this.event.source = source;
    return this;
  }
  
  build(): T {
    if (!this.event.payload) {
      throw new Error('Payload is required');
    }
    return this.event as T;
  }
}

// Usage
const event = EventBuilder
  .create('images:download:requested')
  .withPayload({
    imageUrl: 'https://example.com/image.jpg',
    quality: 'high'
  })
  .withCorrelationId('session-123')
  .build();
```

## TypeScript Decorators for Events

### Event Handler Decorators

```typescript
// Decorator for event handlers
function Subscribe(eventType: keyof EventMap) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    // Register handler on instantiation
    const constructor = target.constructor;
    if (!constructor.eventSubscriptions) {
      constructor.eventSubscriptions = [];
    }
    
    constructor.eventSubscriptions.push({
      eventType,
      handlerName: propertyKey
    });
    
    return descriptor;
  };
}

// Usage in classes
class ImageProcessor {
  constructor(private eventBus: TypedEventBus) {
    // Auto-register decorated methods
    this.registerEventHandlers();
  }
  
  @Subscribe('images:download:requested')
  async handleDownloadRequest(event: ImageDownloadRequested): Promise<void> {
    console.log('Processing download:', event.payload.imageUrl);
    // Process the download
  }
  
  @Subscribe('images:download:completed')
  async handleDownloadComplete(event: ImageDownloadCompleted): Promise<void> {
    console.log('Download complete:', event.payload.localPath);
    // Update UI or database
  }
  
  private registerEventHandlers(): void {
    const subscriptions = (this.constructor as any).eventSubscriptions || [];
    
    subscriptions.forEach(({ eventType, handlerName }) => {
      this.eventBus.on(eventType, this[handlerName].bind(this));
    });
  }
}
```

### Validation Decorators

```typescript
// Runtime validation decorator
function ValidatePayload<T extends DomainEvent>(
  validator: (payload: T['payload']) => boolean
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (event: T) {
      if (!validator(event.payload)) {
        throw new Error(`Invalid payload for ${event.type}`);
      }
      
      return originalMethod.call(this, event);
    };
    
    return descriptor;
  };
}

// Usage
class SecureImageProcessor {
  @Subscribe('images:download:requested')
  @ValidatePayload<ImageDownloadRequested>((payload) => 
    payload.imageUrl.startsWith('https://')
  )
  async handleSecureDownload(event: ImageDownloadRequested): Promise<void> {
    // Only processes HTTPS URLs
  }
}
```

## Type-Safe Event Sourcing

### Event Store with TypeScript

```typescript
// Type-safe event store
interface EventStoreEntry<T extends DomainEvent = DomainEvent> {
  sequence: number;
  event: T;
  metadata: {
    userId?: string;
    sessionId?: string;
    timestamp: number;
  };
}

class TypedEventStore<T extends DomainEvent = SystemEvent> {
  private events: EventStoreEntry<T>[] = [];
  private sequence = 0;
  
  // Append with type safety
  append<K extends T>(event: K, metadata?: Partial<EventStoreEntry['metadata']>): void {
    this.events.push({
      sequence: ++this.sequence,
      event,
      metadata: {
        timestamp: Date.now(),
        ...metadata
      }
    });
  }
  
  // Query with type filters
  query<K extends T['type']>(
    filter: {
      type?: K;
      afterSequence?: number;
      beforeTimestamp?: number;
    }
  ): EventStoreEntry<Extract<T, { type: K }>>[] {
    return this.events.filter(entry => {
      if (filter.type && entry.event.type !== filter.type) return false;
      if (filter.afterSequence && entry.sequence <= filter.afterSequence) return false;
      if (filter.beforeTimestamp && entry.metadata.timestamp >= filter.beforeTimestamp) return false;
      return true;
    }) as EventStoreEntry<Extract<T, { type: K }>>[];
  }
  
  // Replay events with type safety
  replay<K extends T>(
    handler: (event: K) => void | Promise<void>,
    filter?: { type?: K['type'] }
  ): Promise<void> {
    const events = filter?.type 
      ? this.query({ type: filter.type })
      : this.events;
      
    return events.reduce(async (prev, entry) => {
      await prev;
      await handler(entry.event as K);
    }, Promise.resolve());
  }
}
```

### Aggregate Root with Events

```typescript
// Type-safe aggregate root
abstract class AggregateRoot<T extends DomainEvent> {
  private uncommittedEvents: T[] = [];
  protected version = 0;
  
  protected abstract apply(event: T): void;
  
  // Type-safe event application
  protected applyChange<K extends T>(event: K): void {
    this.apply(event);
    this.uncommittedEvents.push(event);
    this.version++;
  }
  
  // Load from event history
  loadFromHistory(events: T[]): void {
    events.forEach(event => {
      this.apply(event);
      this.version++;
    });
  }
  
  // Get uncommitted events with types
  getUncommittedEvents(): ReadonlyArray<T> {
    return this.uncommittedEvents;
  }
  
  markEventsAsCommitted(): void {
    this.uncommittedEvents = [];
  }
}

// Example aggregate
class DownloadQueueAggregate extends AggregateRoot<QueueEvent> {
  private items: Map<string, QueueItem> = new Map();
  
  addItem(item: QueueItem): void {
    this.applyChange({
      type: 'queue:item:added',
      item
    });
  }
  
  startItem(itemId: string, workerId: string): void {
    if (!this.items.has(itemId)) {
      throw new Error('Item not found');
    }
    
    this.applyChange({
      type: 'queue:item:started',
      itemId,
      workerId
    });
  }
  
  protected apply(event: QueueEvent): void {
    switch (event.type) {
      case 'queue:item:added':
        this.items.set(event.item.id, event.item);
        break;
        
      case 'queue:item:started':
        const item = this.items.get(event.itemId)!;
        item.status = 'processing';
        break;
        
      // Handle other events...
    }
  }
}
```

## WebSocket Type Safety

### Typed WebSocket Client

```typescript
// Shared types between client and server
interface WebSocketMessage<T = unknown> {
  id: string;
  type: string;
  payload: T;
  timestamp: number;
}

interface WebSocketEventMap {
  // Client → Server
  'client:subscribe': { channels: string[] };
  'client:unsubscribe': { channels: string[] };
  'client:event': SystemEvent;
  
  // Server → Client
  'server:event': SystemEvent;
  'server:error': { code: string; message: string };
  'server:subscribed': { channels: string[] };
}

// Type-safe WebSocket wrapper
class TypedWebSocketClient {
  private ws: WebSocket;
  private handlers = new Map<string, Set<Function>>();
  
  constructor(url: string) {
    this.ws = new WebSocket(url);
    this.setupMessageHandler();
  }
  
  // Type-safe send
  send<K extends keyof Pick<WebSocketEventMap, 'client:subscribe' | 'client:unsubscribe' | 'client:event'>>(
    type: K,
    payload: WebSocketEventMap[K]
  ): void {
    const message: WebSocketMessage<WebSocketEventMap[K]> = {
      id: generateId(),
      type,
      payload,
      timestamp: Date.now()
    };
    
    this.ws.send(JSON.stringify(message));
  }
  
  // Type-safe receive
  on<K extends keyof Pick<WebSocketEventMap, 'server:event' | 'server:error' | 'server:subscribed'>>(
    type: K,
    handler: (payload: WebSocketEventMap[K]) => void
  ): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    
    this.handlers.get(type)!.add(handler);
    
    return () => {
      this.handlers.get(type)?.delete(handler);
    };
  }
  
  private setupMessageHandler(): void {
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data) as WebSocketMessage;
      const handlers = this.handlers.get(message.type);
      
      if (handlers) {
        handlers.forEach(handler => handler(message.payload));
      }
    };
  }
}
```

## Testing TypeScript Events

### Type-Safe Test Utilities

```typescript
// Test event builder
class TestEventBuilder {
  static createEvent<K extends keyof EventMap>(
    type: K,
    overrides?: Partial<EventMap[K]>
  ): EventMap[K] {
    const defaults = this.getDefaults(type);
    
    return {
      id: 'test-id',
      type,
      timestamp: Date.now(),
      source: { service: 'test', instance: 'test-1' },
      version: 1,
      ...defaults,
      ...overrides
    } as EventMap[K];
  }
  
  private static getDefaults(type: keyof EventMap): any {
    const defaultPayloads: Record<keyof EventMap, any> = {
      'images:download:requested': {
        payload: {
          imageUrl: 'https://test.com/image.jpg',
          quality: 'medium'
        }
      },
      'images:download:completed': {
        payload: {
          imageUrl: 'https://test.com/image.jpg',
          localPath: '/tmp/image.jpg',
          fileSize: 1024,
          downloadTime: 100,
          metadata: {}
        }
      },
      // ... other defaults
    };
    
    return defaultPayloads[type];
  }
}

// Type-safe event assertions
expect.extend({
  toHaveEmittedEvent(
    eventBus: TypedEventBus,
    eventType: keyof EventMap,
    payload?: Partial<EventMap[typeof eventType]['payload']>
  ) {
    // Implementation...
  }
});

// Usage in tests
it('should emit download completed event', async () => {
  const testEvent = TestEventBuilder.createEvent('images:download:completed');
  
  await service.processDownload(request);
  
  expect(eventBus).toHaveEmittedEvent('images:download:completed', {
    imageUrl: 'https://example.com/image.jpg'
  });
});
```

## Best Practices

### 1. Type Organization
```typescript
// Organize types hierarchically
// events/
// ├── base.ts          // Base interfaces
// ├── auth/           // Auth domain events
// ├── images/         // Image domain events
// └── index.ts        // Barrel export
```

### 2. Type Guards
```typescript
// Create type guards for runtime checks
function isImageEvent(event: SystemEvent): event is ImageEvents {
  return event.type.startsWith('images:');
}

function hasPayloadProperty<K extends keyof any>(
  event: DomainEvent,
  property: K
): event is DomainEvent<Record<K, any>> {
  return property in event.payload;
}
```

### 3. Strict Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

## Conclusion

TypeScript transforms our Event-Driven Architecture by providing:
- **Compile-time Safety**: Catch errors before runtime
- **Better Developer Experience**: Auto-completion and IntelliSense
- **Self-documenting Code**: Types serve as documentation
- **Refactoring Confidence**: Safe large-scale changes
- **Runtime Validation**: Decorators for additional safety

This combination creates a robust, maintainable, and developer-friendly event system.