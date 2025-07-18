# Semantest Developer Guide

Welcome to the Semantest developer documentation. This guide provides comprehensive information for developers working with the Semantest platform.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Architecture Overview](#architecture-overview)
3. [API Reference](#api-reference)
4. [Development Workflow](#development-workflow)
5. [Testing Strategies](#testing-strategies)
6. [Best Practices](#best-practices)
7. [Contributing](#contributing)
8. [Troubleshooting](#troubleshooting)

## Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+ or yarn 1.22+
- Git 2.25+
- Chrome browser (for extension development)
- VS Code or WebStorm (recommended IDEs)

### Initial Setup

```bash
# Clone the workspace
git clone https://github.com/semantest/workspace.git
cd workspace

# Install dependencies for all modules
npm run install:all

# Build all modules
npm run build:all

# Run tests to verify setup
npm run test:all
```

### Development Environment

1. **IDE Configuration**
   - Install TypeScript language support
   - Install ESLint and Prettier extensions
   - Enable format on save
   - Configure TypeScript SDK to use workspace version

2. **Environment Variables**
   ```bash
   # Copy example environment files
   cp .env.example .env
   cp nodejs.server/.env.example nodejs.server/.env
   ```

3. **Chrome Extension Development**
   - Enable Developer Mode in Chrome
   - Load unpacked extension from `extension.chrome/dist`
   - Use Chrome DevTools for debugging

## Architecture Overview

### Domain-Driven Design (DDD)

Semantest follows Domain-Driven Design principles with clear boundaries:

```
semantest/
├── core/                    # Shared kernel
│   ├── src/
│   │   ├── events/         # Base event classes
│   │   ├── entities/       # Base entity classes
│   │   ├── value-objects/  # Common value objects
│   │   └── utils/          # Shared utilities
│   └── tests/
├── [domain].com/           # Domain modules
│   ├── domain/             # Business logic
│   │   ├── entities/       # Domain entities
│   │   ├── events/         # Domain events
│   │   ├── services/       # Domain services
│   │   └── value-objects/  # Domain value objects
│   ├── application/        # Use cases
│   │   ├── commands/       # Command handlers
│   │   ├── queries/        # Query handlers
│   │   └── services/       # Application services
│   └── infrastructure/     # External adapters
│       ├── adapters/       # Infrastructure adapters
│       ├── repositories/   # Data repositories
│       └── messaging/      # Message handlers
└── browser/                # Browser automation
```

### Key Architectural Patterns

1. **Event-Driven Architecture**
   - All state changes emit domain events
   - Events enable loose coupling between modules
   - Event sourcing capabilities for audit trails

2. **Hexagonal Architecture**
   - Domain logic isolated from infrastructure
   - Ports and adapters for external integrations
   - Testable business logic

3. **CQRS Pattern**
   - Commands for state modifications
   - Queries for data retrieval
   - Optimized read and write models

## API Reference

### Core Module APIs

#### Event Base Class

```typescript
import { DomainEvent } from '@semantest/core';

export class MyDomainEvent extends DomainEvent {
  constructor(
    public readonly data: any,
    correlationId?: string
  ) {
    super('my-domain-event', correlationId);
  }
}
```

#### Entity Base Class

```typescript
import { Entity, AggregateRoot } from '@semantest/core';

export class MyEntity extends Entity<MyEntity> {
  constructor(
    public readonly id: string,
    private name: string
  ) {
    super();
  }

  getId(): string {
    return this.id;
  }
}

export class MyAggregate extends AggregateRoot<MyAggregate> {
  changeName(newName: string): void {
    this.applyEvent(new NameChanged(this.id, newName));
  }

  protected apply(event: DomainEvent): void {
    if (event instanceof NameChanged) {
      this.name = event.newName;
    }
  }
}
```

#### Browser Automation API

```typescript
import { BrowserAutomation } from '@semantest/browser';

const browser = new BrowserAutomation();

await browser.initialize();
await browser.navigate('https://example.com');
await browser.fillInput({
  selector: '#username',
  value: 'john.doe@example.com'
});
await browser.click({ selector: '#submit' });
await browser.screenshot({ path: 'result.png' });
await browser.close();
```

### Domain Module APIs

#### Google Images Domain

```typescript
import { GoogleImagesDownloader } from '@semantest/images.google.com';

const downloader = new GoogleImagesDownloader();

// Download an image
await downloader.downloadImage({
  imageUrl: 'https://example.com/image.jpg',
  searchQuery: 'cute cats',
  fileName: 'cat-image.jpg'
});

// Listen for download events
downloader.on('download-completed', (event) => {
  console.log(`Downloaded: ${event.fileName}`);
});
```

#### ChatGPT Domain

```typescript
import { ChatGPTAutomation } from '@semantest/chatgpt.com';

const chatgpt = new ChatGPTAutomation();

await chatgpt.initialize();
await chatgpt.sendMessage('Hello, how are you?');
const response = await chatgpt.waitForResponse();
console.log(response);
```

## Development Workflow

### Branch Strategy

```bash
# Feature development
git checkout -b feature/description

# Bug fixes
git checkout -b fix/description

# Documentation
git checkout -b docs/description

# Release preparation
git checkout -b release/version
```

### Commit Convention

We follow Conventional Commits:

```bash
# Format: <type>(<scope>): <subject>

# Examples:
git commit -m "feat(images): add high-resolution download"
git commit -m "fix(browser): handle navigation timeout"
git commit -m "docs(api): update authentication section"
git commit -m "test(core): add entity validation tests"
git commit -m "refactor(chatgpt): simplify message handling"
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `test`: Testing
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `build`: Build system changes
- `ci`: CI/CD changes
- `chore`: Maintenance tasks

### Code Review Process

1. **Pull Request Creation**
   - Clear description of changes
   - Link to related issues
   - Include test results
   - Update documentation

2. **Review Checklist**
   - [ ] Code follows style guidelines
   - [ ] Tests pass and coverage maintained
   - [ ] Documentation updated
   - [ ] No security vulnerabilities
   - [ ] Performance impact assessed
   - [ ] Domain boundaries respected

3. **Merge Requirements**
   - Approved by 2+ reviewers
   - All CI checks passing
   - No merge conflicts
   - Documentation complete

## Testing Strategies

### Test Pyramid

```
         /\
        /  \  E2E Tests (10%)
       /----\
      /      \  Integration Tests (30%)
     /--------\
    /          \  Unit Tests (60%)
   /____________\
```

### Unit Testing

```typescript
import { MyEntity } from '../domain/entities/my-entity';

describe('MyEntity', () => {
  it('should create entity with valid data', () => {
    const entity = new MyEntity('123', 'Test Name');
    
    expect(entity.getId()).toBe('123');
    expect(entity.getName()).toBe('Test Name');
  });

  it('should emit event when name changes', () => {
    const entity = new MyEntity('123', 'Old Name');
    const events = entity.changeName('New Name');
    
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(NameChangedEvent);
  });
});
```

### Integration Testing

```typescript
import { TestBed } from '@semantest/testing';

describe('Google Images Integration', () => {
  let testBed: TestBed;

  beforeEach(async () => {
    testBed = await TestBed.create({
      modules: ['@semantest/images.google.com'],
      providers: [
        { provide: 'BrowserAdapter', useClass: MockBrowserAdapter }
      ]
    });
  });

  it('should download image with proper event flow', async () => {
    const downloader = testBed.get(GoogleImagesDownloader);
    const eventBus = testBed.get(EventBus);
    
    const events = [];
    eventBus.subscribe('*', (event) => events.push(event));
    
    await downloader.downloadImage({
      imageUrl: 'https://example.com/test.jpg'
    });
    
    expect(events).toContainEqual(
      expect.objectContaining({
        type: 'GoogleImageDownloadCompleted'
      })
    );
  });
});
```

### E2E Testing

```typescript
import { ChromeExtension } from '@semantest/e2e-utils';

describe('Image Download E2E', () => {
  let extension: ChromeExtension;

  beforeAll(async () => {
    extension = await ChromeExtension.launch({
      extensionPath: './extension.chrome/dist'
    });
  });

  it('should download image from Google Images', async () => {
    await extension.navigate('https://images.google.com');
    await extension.searchFor('cute cats');
    await extension.clickFirstImage();
    await extension.clickDownloadButton();
    
    const downloads = await extension.getDownloads();
    expect(downloads).toHaveLength(1);
    expect(downloads[0].filename).toContain('cute-cats');
  });
});
```

## Best Practices

### Domain Modeling

1. **Rich Domain Models**
   ```typescript
   // ❌ Anemic model
   class User {
     name: string;
     email: string;
   }
   
   // ✅ Rich model
   class User extends Entity<User> {
     private constructor(
       private readonly id: UserId,
       private name: PersonName,
       private email: Email
     ) {
       super();
     }
     
     static create(name: string, email: string): User {
       return new User(
         UserId.generate(),
         PersonName.create(name),
         Email.create(email)
       );
     }
     
     changeName(newName: string): void {
       const name = PersonName.create(newName);
       this.applyEvent(new UserNameChanged(this.id, name));
     }
   }
   ```

2. **Value Objects**
   ```typescript
   export class Email {
     private constructor(private readonly value: string) {}
     
     static create(value: string): Email {
       if (!this.isValid(value)) {
         throw new InvalidEmailError(value);
       }
       return new Email(value);
     }
     
     private static isValid(value: string): boolean {
       return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
     }
     
     toString(): string {
       return this.value;
     }
   }
   ```

### Error Handling

1. **Domain Errors**
   ```typescript
   export class DomainError extends Error {
     constructor(
       message: string,
       public readonly code: string,
       public readonly context?: any
     ) {
       super(message);
       this.name = this.constructor.name;
     }
   }
   
   export class InvalidImageUrlError extends DomainError {
     constructor(url: string) {
       super(
         `Invalid image URL: ${url}`,
         'INVALID_IMAGE_URL',
         { url }
       );
     }
   }
   ```

2. **Error Recovery**
   ```typescript
   async function downloadWithRetry(url: string, maxRetries = 3): Promise<void> {
     for (let i = 0; i < maxRetries; i++) {
       try {
         await download(url);
         return;
       } catch (error) {
         if (i === maxRetries - 1) throw error;
         
         logger.warn(`Download failed, retrying (${i + 1}/${maxRetries})`, {
           url,
           error: error.message
         });
         
         await delay(Math.pow(2, i) * 1000); // Exponential backoff
       }
     }
   }
   ```

### Performance Optimization

1. **Lazy Loading**
   ```typescript
   export class ImageRepository {
     private cache = new Map<string, Image>();
     
     async findById(id: string): Promise<Image> {
       if (this.cache.has(id)) {
         return this.cache.get(id);
       }
       
       const image = await this.loadFromDatabase(id);
       this.cache.set(id, image);
       return image;
     }
   }
   ```

2. **Event Batching**
   ```typescript
   export class EventBatcher {
     private events: DomainEvent[] = [];
     private timer: NodeJS.Timeout;
     
     add(event: DomainEvent): void {
       this.events.push(event);
       this.scheduleFlush();
     }
     
     private scheduleFlush(): void {
       if (this.timer) return;
       
       this.timer = setTimeout(() => {
         this.flush();
       }, 100);
     }
     
     private flush(): void {
       if (this.events.length === 0) return;
       
       this.eventBus.publishBatch(this.events);
       this.events = [];
       this.timer = null;
     }
   }
   ```

## Contributing

### Development Setup

1. Fork the repository
2. Clone your fork
3. Create a feature branch
4. Make your changes
5. Write/update tests
6. Update documentation
7. Submit pull request

### Code Quality Standards

- **Test Coverage**: Minimum 80% for new code
- **Documentation**: All public APIs must be documented
- **Type Safety**: Strict TypeScript with no `any` types
- **Linting**: Zero ESLint warnings or errors
- **Security**: No vulnerable dependencies

### Review Process

1. **Automated Checks**
   - Unit tests pass
   - Integration tests pass
   - Code coverage maintained
   - Linting passes
   - Security scan clean

2. **Manual Review**
   - Architecture compliance
   - Performance impact
   - Security implications
   - Documentation quality
   - Code maintainability

## Troubleshooting

### Common Issues

#### 1. Module Not Found Errors

**Problem**: TypeScript cannot resolve module imports
```typescript
// Error: Cannot find module '@semantest/core'
import { Entity } from '@semantest/core';
```

**Solutions**:
```bash
# Solution 1: Rebuild all modules
npm run build:all

# Solution 2: Check module links
npm run link:check

# Solution 3: Clean and reinstall
npm run clean:all
npm run install:all
npm run build:all

# Solution 4: Verify tsconfig paths
cat tsconfig.json | grep -A 10 "paths"
```

**Advanced debugging**:
```typescript
// Check module resolution
console.log(require.resolve('@semantest/core'));

// Verify module exports
const core = require('@semantest/core');
console.log(Object.keys(core));
```

#### 2. TypeScript Type Errors

**Problem**: Type mismatches or missing types
```typescript
// Error: Property 'correlationId' does not exist on type 'DomainEvent'
const correlationId = event.correlationId;
```

**Solutions**:
```bash
# Solution 1: Regenerate type definitions
npm run types:generate

# Solution 2: Check TypeScript version compatibility
npm ls typescript
# Ensure all modules use the same TypeScript version

# Solution 3: Clear TypeScript cache
rm -rf node_modules/.cache/typescript
npm run build:all

# Solution 4: Strict type checking
npx tsc --noEmit --strict
```

**Type debugging example**:
```typescript
// Use type assertions for debugging
import { DomainEvent } from '@semantest/core';

function debugEventType(event: unknown) {
  // Type guard
  if (isDomainEvent(event)) {
    console.log('Event type:', event.eventType);
    console.log('Correlation ID:', event.correlationId);
  }
}

function isDomainEvent(obj: any): obj is DomainEvent {
  return obj && 
         typeof obj.eventType === 'string' &&
         typeof obj.correlationId === 'string' &&
         obj.timestamp instanceof Date;
}
```

#### 3. Event Bus Not Receiving Events

**Problem**: Events are published but handlers don't execute
```typescript
// Publishing event
eventBus.publish(new UserCreated(userId));

// Handler never called
eventBus.subscribe('UserCreated', async (event) => {
  console.log('This never prints');
});
```

**Solutions**:
```typescript
// Solution 1: Check event type matching
class UserCreated extends DomainEvent {
  // Ensure eventType matches subscription
  readonly eventType = 'UserCreated'; // Must match exactly
}

// Solution 2: Verify async handling
eventBus.subscribe('UserCreated', async (event) => {
  try {
    await handleUserCreated(event);
  } catch (error) {
    // Always handle errors in async handlers
    logger.error('Handler failed', error);
  }
});

// Solution 3: Debug event flow
const debugEventBus = {
  publish: async (event: DomainEvent) => {
    console.log(`Publishing: ${event.eventType}`, event);
    await eventBus.publish(event);
  },
  subscribe: (type: string, handler: EventHandler) => {
    console.log(`Subscribing to: ${type}`);
    eventBus.subscribe(type, async (event) => {
      console.log(`Handling: ${event.eventType}`, event);
      await handler(event);
    });
  }
};

// Solution 4: Check event bus initialization
if (!eventBus.isInitialized()) {
  await eventBus.initialize();
}
```

#### 4. Browser Automation Timeouts

**Problem**: Browser operations timeout or hang
```typescript
// TimeoutError: Waiting for selector "#submit" failed: timeout 30000ms exceeded
await browser.click({ selector: '#submit' });
```

**Solutions**:
```typescript
// Solution 1: Increase timeout
await browser.click({ 
  selector: '#submit',
  timeout: 60000 // 60 seconds
});

// Solution 2: Wait for element explicitly
await browser.waitForSelector('#submit', {
  visible: true,
  timeout: 30000
});
await browser.click({ selector: '#submit' });

// Solution 3: Debug element state
const elementInfo = await browser.evaluate(() => {
  const element = document.querySelector('#submit');
  return {
    exists: !!element,
    visible: element?.offsetParent !== null,
    enabled: !element?.disabled,
    text: element?.textContent,
    classes: element?.className
  };
});
console.log('Element state:', elementInfo);

// Solution 4: Take screenshot for debugging
await browser.screenshot({ 
  path: 'debug-timeout.png',
  fullPage: true 
});

// Solution 5: Use retry logic
async function clickWithRetry(selector: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await browser.click({ selector });
      return;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.log(`Retry ${i + 1}/${maxRetries}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}
```

#### 5. Memory Leaks

**Problem**: Application memory usage grows over time
```bash
# Node process using excessive memory
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

**Solutions**:
```typescript
// Solution 1: Proper event listener cleanup
class ComponentWithCleanup extends Entity<ComponentWithCleanup> {
  private subscriptions: (() => void)[] = [];
  
  initialize() {
    // Store unsubscribe functions
    this.subscriptions.push(
      eventBus.subscribe('SomeEvent', this.handleEvent.bind(this))
    );
  }
  
  destroy() {
    // Clean up all subscriptions
    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subscriptions = [];
  }
}

// Solution 2: Clear large data structures
class DataProcessor {
  private cache = new Map<string, LargeObject>();
  
  processData(id: string) {
    const data = this.loadData(id);
    this.cache.set(id, data);
    
    // Clear old entries
    if (this.cache.size > 1000) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }
  
  // Provide manual cleanup
  clearCache() {
    this.cache.clear();
  }
}

// Solution 3: Use WeakMap for object references
class ObjectTracker {
  // WeakMap allows garbage collection of keys
  private metadata = new WeakMap<object, Metadata>();
  
  track(obj: object, meta: Metadata) {
    this.metadata.set(obj, meta);
    // No need to manually clean up
  }
}

// Solution 4: Monitor memory usage
import { memoryUsage } from 'process';

setInterval(() => {
  const usage = memoryUsage();
  console.log('Memory usage:', {
    rss: `${Math.round(usage.rss / 1024 / 1024)} MB`,
    heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)} MB`,
    heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)} MB`,
    external: `${Math.round(usage.external / 1024 / 1024)} MB`
  });
}, 60000); // Every minute
```

#### 6. Domain Event Ordering Issues

**Problem**: Events processed out of order
```typescript
// Events arrive in wrong order
// Expected: Created → Updated → Completed
// Actual: Created → Completed → Updated
```

**Solutions**:
```typescript
// Solution 1: Use event versioning
class OrderAggregate extends AggregateRoot<OrderAggregate> {
  private version = 0;
  
  protected applyEvent(event: DomainEvent): void {
    // Check event version
    if (event.aggregateVersion !== this.version + 1) {
      throw new EventVersionMismatchError(
        this.version,
        event.aggregateVersion
      );
    }
    
    super.applyEvent(event);
    this.version++;
  }
}

// Solution 2: Implement event ordering
class OrderedEventBus implements IEventBus {
  private queue = new PriorityQueue<QueuedEvent>();
  
  async publish(event: DomainEvent): Promise<void> {
    this.queue.enqueue({
      event,
      priority: event.timestamp.getTime()
    });
    
    await this.processQueue();
  }
  
  private async processQueue(): Promise<void> {
    while (!this.queue.isEmpty()) {
      const { event } = this.queue.dequeue();
      await this.processEvent(event);
    }
  }
}

// Solution 3: Use saga pattern for complex flows
class OrderSaga {
  private state: SagaState = 'initial';
  
  async handle(event: DomainEvent): Promise<void> {
    switch (this.state) {
      case 'initial':
        if (event instanceof OrderCreated) {
          this.state = 'created';
          await this.handleOrderCreated(event);
        }
        break;
        
      case 'created':
        if (event instanceof OrderUpdated) {
          this.state = 'updated';
          await this.handleOrderUpdated(event);
        }
        break;
        
      // Handle out-of-order events
      default:
        await this.compensate(event);
    }
  }
}
```

#### 7. Chrome Extension Content Script Issues

**Problem**: Content script not injecting or executing
```javascript
// manifest.json content script not working
"content_scripts": [{
  "matches": ["https://*.google.com/*"],
  "js": ["content.js"]
}]
```

**Solutions**:
```typescript
// Solution 1: Debug content script injection
// In background script
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    chrome.tabs.sendMessage(tabId, { type: 'ping' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Content script not loaded:', chrome.runtime.lastError);
        // Manually inject if needed
        chrome.tabs.executeScript(tabId, {
          file: 'content.js'
        });
      }
    });
  }
});

// Solution 2: Check CSP and permissions
// In content script
console.log('Content script loaded at:', window.location.href);
console.log('Permissions:', {
  canAccessDOM: !!document.body,
  canUseChrome: !!chrome.runtime,
  canSendMessages: !!chrome.runtime?.sendMessage
});

// Solution 3: Handle dynamic content
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.type === 'childList') {
      // Check for dynamically added elements
      const newElements = mutation.target.querySelectorAll('.target-class');
      newElements.forEach(initializeElement);
    }
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Solution 4: Race condition handling
function waitForElement(selector: string, timeout = 10000): Promise<Element> {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) return resolve(element);
    
    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found`));
    }, timeout);
  });
}
```

### Advanced Debugging Techniques

#### Enable Verbose Logging

```typescript
// Create debug namespace
import debug from 'debug';

// Enable all Semantest debugging
process.env.DEBUG = 'semantest:*';

// Enable specific module debugging
process.env.DEBUG = 'semantest:core:*,semantest:browser:*';

// Create module-specific loggers
const log = {
  main: debug('semantest:images:main'),
  download: debug('semantest:images:download'),
  events: debug('semantest:images:events'),
  error: debug('semantest:images:error')
};

// Use structured logging
log.download('Starting download', {
  url,
  fileName,
  timestamp: Date.now(),
  correlationId: event.correlationId
});

// Conditional logging
if (log.events.enabled) {
  log.events('Event published', event.toJSON());
}
```

#### Performance Profiling

```typescript
// Advanced performance monitoring
class PerformanceMonitor {
  private marks = new Map<string, number>();
  private measures: PerformanceMeasure[] = [];
  
  mark(name: string): void {
    this.marks.set(name, performance.now());
  }
  
  measure(name: string, startMark: string, endMark?: string): number {
    const start = this.marks.get(startMark);
    const end = endMark ? this.marks.get(endMark) : performance.now();
    
    if (!start) throw new Error(`Mark ${startMark} not found`);
    
    const duration = end - start;
    this.measures.push({ name, duration, timestamp: Date.now() });
    
    return duration;
  }
  
  getReport(): PerformanceReport {
    const summary = this.measures.reduce((acc, measure) => {
      if (!acc[measure.name]) {
        acc[measure.name] = {
          count: 0,
          total: 0,
          min: Infinity,
          max: -Infinity,
          avg: 0
        };
      }
      
      const stat = acc[measure.name];
      stat.count++;
      stat.total += measure.duration;
      stat.min = Math.min(stat.min, measure.duration);
      stat.max = Math.max(stat.max, measure.duration);
      stat.avg = stat.total / stat.count;
      
      return acc;
    }, {} as Record<string, PerformanceStat>);
    
    return { measures: this.measures, summary };
  }
}

// Usage
const perf = new PerformanceMonitor();

perf.mark('download-start');
await downloadImage(url);
perf.mark('download-end');

const duration = perf.measure('image-download', 'download-start', 'download-end');
console.log(`Download took ${duration}ms`);

// Get performance report
console.log(perf.getReport());
```

#### Memory Leak Detection

```typescript
// Memory leak detector
class MemoryLeakDetector {
  private snapshots: MemorySnapshot[] = [];
  private interval: NodeJS.Timer;
  
  start(intervalMs = 60000): void {
    this.interval = setInterval(() => {
      this.takeSnapshot();
    }, intervalMs);
  }
  
  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
  
  private takeSnapshot(): void {
    const usage = process.memoryUsage();
    const snapshot: MemorySnapshot = {
      timestamp: Date.now(),
      rss: usage.rss,
      heapTotal: usage.heapTotal,
      heapUsed: usage.heapUsed,
      external: usage.external,
      arrayBuffers: usage.arrayBuffers
    };
    
    this.snapshots.push(snapshot);
    
    // Keep only last 100 snapshots
    if (this.snapshots.length > 100) {
      this.snapshots.shift();
    }
    
    // Check for potential leak
    if (this.detectLeak()) {
      console.warn('Potential memory leak detected!', {
        current: this.formatBytes(snapshot.heapUsed),
        trend: this.getMemoryTrend()
      });
    }
  }
  
  private detectLeak(): boolean {
    if (this.snapshots.length < 10) return false;
    
    // Check if memory consistently increases
    const recent = this.snapshots.slice(-10);
    let increases = 0;
    
    for (let i = 1; i < recent.length; i++) {
      if (recent[i].heapUsed > recent[i-1].heapUsed) {
        increases++;
      }
    }
    
    return increases > 8; // 80% increase rate
  }
  
  private formatBytes(bytes: number): string {
    return `${Math.round(bytes / 1024 / 1024)} MB`;
  }
}

// Start leak detection
const leakDetector = new MemoryLeakDetector();
leakDetector.start();

// Stop on shutdown
process.on('SIGTERM', () => {
  leakDetector.stop();
});
```

### Production Debugging

#### Remote Debugging

```typescript
// Enable remote debugging for production
if (process.env.ENABLE_REMOTE_DEBUG) {
  const inspector = require('inspector');
  inspector.open(9229, '0.0.0.0');
  console.log('Remote debugging enabled on port 9229');
}

// SSH tunnel for secure debugging
// ssh -L 9229:localhost:9229 user@production-server
// Then open chrome://inspect
```

#### Error Tracking

```typescript
// Comprehensive error tracking
class ErrorTracker {
  private errors: TrackedError[] = [];
  
  track(error: Error, context?: any): void {
    const tracked: TrackedError = {
      id: generateId(),
      timestamp: new Date(),
      message: error.message,
      stack: error.stack,
      context,
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        memory: process.memoryUsage(),
        uptime: process.uptime()
      }
    };
    
    this.errors.push(tracked);
    this.sendToMonitoring(tracked);
  }
  
  private sendToMonitoring(error: TrackedError): void {
    // Send to external service (Sentry, etc.)
    if (process.env.SENTRY_DSN) {
      Sentry.captureException(error);
    }
    
    // Log to file for analysis
    fs.appendFileSync(
      'errors.log',
      JSON.stringify(error) + '\n'
    );
  }
}

// Global error handler
process.on('uncaughtException', (error) => {
  errorTracker.track(error, { fatal: true });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  errorTracker.track(new Error(`Unhandled rejection: ${reason}`), {
    promise,
    reason
  });
});
```

## Resources

- [Architecture Documentation](./architecture/README.md)
- [API Reference](./api-reference/README.md)
- [Security Guide](./security/README.md)
- [Performance Guide](./performance/README.md)
- [Migration Guide](./migration/README.md)

## Support

- **Documentation**: https://docs.semantest.com
- **Issues**: https://github.com/semantest/workspace/issues
- **Discussions**: https://github.com/semantest/workspace/discussions
- **Security**: security@semantest.com