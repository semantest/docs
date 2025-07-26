# Semantest SDK API Reference

The Semantest SDK provides TypeScript/JavaScript libraries for building distributed test applications and integrations.

## Package Overview

The SDK is organized as a monorepo with four main packages:

- **@semantest/core** - Core types, utilities, and constants
- **@semantest/contracts** - Event contracts and message schemas  
- **@semantest/client** - Client library for test execution
- **@semantest/server** - Server framework for test orchestration

## Installation

```bash
# Install individual packages
npm install @semantest/core @semantest/client @semantest/contracts

# For server development
npm install @semantest/server @semantest/core @semantest/contracts
```

## @semantest/core

Core utilities and types used across all Semantest packages.

### Types

#### Transport Types

```typescript
export interface TransportMessage {
  id: string;
  type: MessageType;
  payload: any;
  timestamp: number;
  correlationId?: string;
  metadata?: Record<string, any>;
}

export enum MessageType {
  // System messages
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  PING = 'ping',
  PONG = 'pong',
  ERROR = 'error',
  
  // Test messages
  TEST_START = 'test:start',
  TEST_COMPLETE = 'test:complete',
  TEST_FAILED = 'test:failed',
  TEST_PROGRESS = 'test:progress',
  
  // Browser messages
  BROWSER_READY = 'browser:ready',
  BROWSER_ERROR = 'browser:error',
  BROWSER_CONSOLE = 'browser:console',
  
  // Custom events
  CUSTOM_EVENT = 'custom:event'
}
```

#### Error Types

```typescript
export class SemantestError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'SemantestError';
  }
}

export class ValidationError extends SemantestError {
  constructor(message: string, field?: string) {
    super(message, 'VALIDATION_ERROR', { field });
  }
}

export class ConnectionError extends SemantestError {
  constructor(message: string, cause?: Error) {
    super(message, 'CONNECTION_ERROR', { cause });
  }
}

export class TimeoutError extends SemantestError {
  constructor(message: string, timeout: number) {
    super(message, 'TIMEOUT_ERROR', { timeout });
  }
}
```

### Constants

```typescript
export const SEMANTEST_VERSION = '2.0.0';

export const DEFAULT_OPTIONS = {
  timeout: 30000,
  retries: 3,
  reconnect: true,
  reconnectDelay: 1000,
  maxReconnectAttempts: 5
};

export const WEBSOCKET_STATES = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3
} as const;
```

### Utilities

#### Validation

```typescript
export function validateMessage(message: any): TransportMessage {
  // Validates message structure
  // Throws ValidationError if invalid
}

export function validateEventName(name: string): boolean {
  // Validates event name format
}

export function validatePayload(payload: any, schema?: any): boolean {
  // Validates payload against optional schema
}
```

## @semantest/contracts

Event contracts defining the communication protocol.

### Browser Events

```typescript
export interface BrowserNavigatedEvent {
  type: 'browser:navigated';
  payload: {
    url: string;
    title: string;
    timestamp: number;
  };
}

export interface BrowserScreenshotEvent {
  type: 'browser:screenshot';
  payload: {
    data: string; // base64
    format: 'png' | 'jpeg';
    fullPage: boolean;
    timestamp: number;
  };
}

export interface BrowserConsoleEvent {
  type: 'browser:console';
  payload: {
    level: 'log' | 'info' | 'warn' | 'error';
    message: string;
    args: any[];
    timestamp: number;
  };
}
```

### Test Events

```typescript
export interface TestStartedEvent {
  type: 'test:started';
  payload: {
    testId: string;
    name: string;
    suite?: string;
    tags?: string[];
    metadata?: Record<string, any>;
  };
}

export interface TestCompletedEvent {
  type: 'test:completed';
  payload: {
    testId: string;
    status: 'passed' | 'failed' | 'skipped';
    duration: number;
    error?: {
      message: string;
      stack?: string;
    };
    assertions?: {
      passed: number;
      failed: number;
      total: number;
    };
  };
}

export interface TestProgressEvent {
  type: 'test:progress';
  payload: {
    testId: string;
    step: string;
    progress: number; // 0-100
    message?: string;
  };
}
```

### System Events

```typescript
export interface SystemReadyEvent {
  type: 'system:ready';
  payload: {
    version: string;
    capabilities: string[];
    metadata?: Record<string, any>;
  };
}

export interface SystemErrorEvent {
  type: 'system:error';
  payload: {
    code: string;
    message: string;
    details?: any;
    fatal?: boolean;
  };
}
```

## @semantest/client

Client library for connecting to Semantest servers and executing tests.

### SemantestClient

```typescript
export class SemantestClient {
  constructor(options?: ClientOptions);
  
  // Connection management
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  reconnect(): Promise<void>;
  
  // Test execution
  runTest(test: TestDefinition): Promise<TestResult>;
  runTests(tests: TestDefinition[]): Promise<TestResult[]>;
  
  // Event handling
  on(event: string, handler: EventHandler): void;
  off(event: string, handler: EventHandler): void;
  once(event: string, handler: EventHandler): void;
  emit(event: string, data?: any): void;
  
  // State
  get isConnected(): boolean;
  get connectionState(): ConnectionState;
}
```

### Client Options

```typescript
export interface ClientOptions {
  // Connection
  serverUrl?: string;        // Default: 'ws://localhost:3000'
  auth?: {
    type: 'token' | 'basic' | 'custom';
    credentials: any;
  };
  
  // Behavior
  autoReconnect?: boolean;   // Default: true
  reconnectDelay?: number;   // Default: 1000ms
  maxReconnectAttempts?: number; // Default: 5
  
  // Timeouts
  connectionTimeout?: number; // Default: 10000ms
  requestTimeout?: number;    // Default: 30000ms
  
  // Transport
  transport?: 'websocket' | 'http'; // Default: 'websocket'
  transportOptions?: any;
}
```

### Test Definition

```typescript
export interface TestDefinition {
  id?: string;
  name: string;
  suite?: string;
  fn: TestFunction;
  timeout?: number;
  retries?: number;
  tags?: string[];
  metadata?: Record<string, any>;
}

export type TestFunction = (context: TestContext) => Promise<void> | void;

export interface TestContext {
  // Browser control
  page: Page;
  browser: Browser;
  
  // Assertions
  expect: ExpectInterface;
  
  // Utilities
  log(message: string): void;
  skip(reason?: string): void;
  fail(reason?: string): void;
  
  // Data
  testInfo: TestInfo;
  sharedData: Record<string, any>;
}
```

### React Hooks

```typescript
// Hook for React applications
export function useSemantestClient(options?: ClientOptions): {
  client: SemantestClient | null;
  isConnected: boolean;
  error: Error | null;
  runTest: (test: TestDefinition) => Promise<TestResult>;
}

// Test monitor component hook
export function useTestMonitor(testId?: string): {
  status: TestStatus;
  progress: number;
  logs: LogEntry[];
  error: Error | null;
}
```

### Example Usage

```typescript
import { SemantestClient } from '@semantest/client';

const client = new SemantestClient({
  serverUrl: 'ws://localhost:3000',
  auth: {
    type: 'token',
    credentials: 'your-api-token'
  }
});

// Connect to server
await client.connect();

// Define a test
const test = {
  name: 'Login Flow Test',
  suite: 'Authentication',
  fn: async (context) => {
    const { page, expect, log } = context;
    
    log('Navigating to login page');
    await page.goto('https://example.com/login');
    
    log('Filling login form');
    await page.fill('#username', 'testuser');
    await page.fill('#password', 'testpass');
    
    log('Submitting form');
    await page.click('#login-button');
    
    log('Verifying login success');
    await expect(page).toHaveURL('https://example.com/dashboard');
  }
};

// Run the test
const result = await client.runTest(test);
console.log('Test result:', result);

// Listen for events
client.on('test:progress', (data) => {
  console.log(`Progress: ${data.progress}% - ${data.message}`);
});

// Disconnect when done
await client.disconnect();
```

## @semantest/server

Server framework for building Semantest test orchestration servers.

### SemantestServer

```typescript
export class SemantestServer {
  constructor(options?: ServerOptions);
  
  // Server lifecycle
  start(): Promise<void>;
  stop(): Promise<void>;
  
  // Client management
  getClients(): ClientInfo[];
  getClient(id: string): ClientInfo | null;
  broadcastToClients(event: string, data?: any): void;
  
  // Test orchestration
  orchestrator: TestOrchestrator;
  
  // Plugin system
  use(plugin: Plugin): void;
  
  // Event handling
  on(event: string, handler: EventHandler): void;
  emit(event: string, data?: any): void;
}
```

### Server Options

```typescript
export interface ServerOptions {
  // Network
  port?: number;             // Default: 3000
  host?: string;            // Default: 'localhost'
  
  // WebSocket
  wsPath?: string;          // Default: '/ws'
  pingInterval?: number;    // Default: 30000ms
  
  // Security
  cors?: CorsOptions;
  auth?: AuthOptions;
  rateLimit?: RateLimitOptions;
  
  // Features
  enableOrchestration?: boolean; // Default: true
  enablePersistence?: boolean;   // Default: false
  enableMetrics?: boolean;       // Default: true
  
  // Storage
  storage?: StorageAdapter;
}
```

### Test Orchestrator

```typescript
export class TestOrchestrator {
  // Test management
  scheduleTest(test: TestDefinition, options?: ScheduleOptions): string;
  cancelTest(testId: string): boolean;
  getTestStatus(testId: string): TestStatus | null;
  
  // Batch operations
  scheduleBatch(tests: TestDefinition[], options?: BatchOptions): string;
  cancelBatch(batchId: string): boolean;
  
  // Queue management
  getQueueStatus(): QueueStatus;
  clearQueue(): void;
  
  // Results
  getTestResult(testId: string): TestResult | null;
  getTestResults(filter?: ResultFilter): TestResult[];
}
```

### Plugin System

```typescript
export interface Plugin {
  name: string;
  version: string;
  init(server: SemantestServer): void | Promise<void>;
  destroy?(): void | Promise<void>;
}

// Example plugin
export class MetricsPlugin implements Plugin {
  name = 'metrics';
  version = '1.0.0';
  
  init(server: SemantestServer) {
    server.on('test:completed', (data) => {
      // Collect metrics
      this.recordTestMetrics(data);
    });
  }
  
  private recordTestMetrics(data: any) {
    // Implementation
  }
}
```

### Security Middleware

```typescript
export interface AuthOptions {
  type: 'none' | 'token' | 'jwt' | 'custom';
  tokenValidator?: (token: string) => Promise<boolean>;
  jwtSecret?: string;
  customValidator?: (req: any) => Promise<boolean>;
}

export interface RateLimitOptions {
  windowMs?: number;        // Default: 60000 (1 minute)
  maxRequests?: number;     // Default: 100
  maxConnectionsPerIp?: number; // Default: 10
}
```

### Example Server

```typescript
import { SemantestServer } from '@semantest/server';
import { MetricsPlugin } from '@semantest/server/plugins';

const server = new SemantestServer({
  port: 3000,
  auth: {
    type: 'token',
    tokenValidator: async (token) => {
      // Validate token against database
      return await validateToken(token);
    }
  },
  rateLimit: {
    maxRequests: 100,
    windowMs: 60000
  }
});

// Add plugins
server.use(new MetricsPlugin());

// Handle events
server.on('client:connected', (client) => {
  console.log(`Client connected: ${client.id}`);
});

server.on('test:completed', async (data) => {
  console.log(`Test completed: ${data.testId}`);
  // Store results
  await storeTestResult(data);
});

// Start server
await server.start();
console.log('Semantest server running on port 3000');
```

## Advanced Topics

### Custom Transport

```typescript
import { Transport } from '@semantest/client';

export class CustomTransport implements Transport {
  async connect(url: string, options?: any): Promise<void> {
    // Custom connection logic
  }
  
  async disconnect(): Promise<void> {
    // Custom disconnection logic
  }
  
  async send(message: TransportMessage): Promise<void> {
    // Custom send logic
  }
  
  on(event: string, handler: Function): void {
    // Custom event handling
  }
}

// Use custom transport
const client = new SemantestClient({
  transport: new CustomTransport()
});
```

### Test Runners

```typescript
import { TestRunner, TestSuite } from '@semantest/client';

const runner = new TestRunner(client);

// Create test suite
const suite = new TestSuite('E2E Tests');

suite.addTest({
  name: 'User Registration',
  fn: async (ctx) => {
    // Test implementation
  }
});

suite.addTest({
  name: 'User Login',
  fn: async (ctx) => {
    // Test implementation
  }
});

// Run suite
const results = await runner.runSuite(suite, {
  parallel: true,
  maxConcurrency: 5,
  stopOnFailure: false
});
```

### State Management

```typescript
import { TestStateManager } from '@semantest/server';

const stateManager = new TestStateManager();

// Track test state
stateManager.on('state:changed', (change) => {
  console.log(`Test ${change.testId} changed from ${change.from} to ${change.to}`);
});

// Query state
const runningTests = stateManager.getTestsByState('running');
const failedTests = stateManager.getTestsByState('failed');
```

## Error Handling

### Client-Side

```typescript
try {
  await client.connect();
} catch (error) {
  if (error instanceof ConnectionError) {
    console.error('Failed to connect:', error.message);
  } else if (error instanceof TimeoutError) {
    console.error('Connection timeout:', error.timeout);
  }
}

// Global error handler
client.on('error', (error) => {
  console.error('Client error:', error);
});
```

### Server-Side

```typescript
server.on('error', (error) => {
  console.error('Server error:', error);
  
  if (error.fatal) {
    // Graceful shutdown
    server.stop();
  }
});

// Client error handling
server.on('client:error', (data) => {
  console.error(`Client ${data.clientId} error:`, data.error);
});
```

## Migration Guide

### From v1.x to v2.x

```typescript
// v1.x
const client = new WebBuddyClient({
  url: 'ws://localhost:3000'
});

// v2.x
const client = new SemantestClient({
  serverUrl: 'ws://localhost:3000'
});

// v1.x events
client.on('message', handler);

// v2.x typed events
client.on('test:completed', handler);
```

## Best Practices

1. **Connection Management**
   - Always handle connection errors
   - Implement reconnection logic
   - Clean up connections on exit

2. **Test Design**
   - Keep tests atomic and independent
   - Use descriptive test names
   - Add appropriate timeouts

3. **Error Handling**
   - Catch and report all errors
   - Provide meaningful error messages
   - Include context in error reports

4. **Performance**
   - Batch operations when possible
   - Use connection pooling
   - Monitor resource usage

5. **Security**
   - Always use authentication in production
   - Validate all inputs
   - Use secure WebSocket connections (wss://)