# Module API Reference - Domain-Driven Design

**Version**: 2.0.0  
**Date**: July 18, 2025  
**Architecture**: Domain-Driven Design (DDD)

---

## 📋 Overview

This document provides comprehensive API reference for the Semantest domain-driven architecture. Each module exposes specific APIs according to DDD principles with clear domain boundaries.

## 🏗️ Module Architecture

### Core Module APIs
- **`@semantest/core`**: Foundation classes and utilities
- **Domain Modules**: Business logic and domain events
- **Infrastructure Modules**: External integrations and adapters

### Domain Module APIs
- **`@semantest/images.google.com`**: Google Images domain
- **`@semantest/chatgpt.com`**: ChatGPT conversation domain
- **`@semantest/google.com`**: Google Search domain

### Infrastructure Module APIs
- **`@semantest/nodejs.server`**: Server infrastructure
- **`@semantest/browser`**: Browser automation
- **`@semantest/typescript.client`**: Generic client

---

## 🏛️ Core Module API

### @semantest/core

#### Base Event Classes

```typescript
// Base domain event
export abstract class BaseDomainEvent {
  readonly eventId: string;
  readonly eventType: string;
  readonly aggregateId: string;
  readonly timestamp: Date;
  readonly correlationId?: string;
  readonly causationId?: string;
  readonly metadata?: Record<string, any>;

  constructor(
    aggregateId: string,
    correlationId?: string,
    causationId?: string,
    metadata?: Record<string, any>
  );

  abstract validate(): boolean;
}

// Domain event interface
export interface DomainEvent {
  readonly eventId: string;
  readonly eventType: string;
  readonly aggregateId: string;
  readonly timestamp: Date;
  readonly correlationId?: string;
  readonly causationId?: string;
  readonly metadata?: Record<string, any>;
}
```

#### Event Bus

```typescript
export class EventBus {
  static getInstance(): EventBus;
  
  publish<T extends DomainEvent>(event: T): Promise<void>;
  subscribe<T extends DomainEvent>(
    eventType: string, 
    handler: (event: T) => void
  ): void;
  unsubscribe(eventType: string, handler: Function): void;
  
  // Batch operations
  publishBatch<T extends DomainEvent>(events: T[]): Promise<void>;
  subscribePattern(
    pattern: string, 
    handler: (event: DomainEvent) => void
  ): void;
}
```

#### Common Types

```typescript
// Generic repository interface
export interface Repository<T, ID> {
  findById(id: ID): Promise<T | null>;
  save(entity: T): Promise<T>;
  delete(id: ID): Promise<void>;
  findAll(): Promise<T[]>;
  findByQuery(query: any): Promise<T[]>;
}

// Event store interface
export interface EventStore {
  append(streamId: string, events: DomainEvent[]): Promise<void>;
  getEvents(streamId: string, fromVersion?: number): Promise<DomainEvent[]>;
  getSnapshot(streamId: string): Promise<any>;
}

// Application service interface
export interface ApplicationService {
  readonly serviceName: string;
  initialize(): Promise<void>;
  cleanup(): Promise<void>;
}
```

#### Utility Functions

```typescript
// Event utilities
export function createEventId(): string;
export function createCorrelationId(): string;
export function validateEvent(event: DomainEvent): boolean;
export function serializeEvent(event: DomainEvent): string;
export function deserializeEvent(data: string): DomainEvent;

// Validation utilities
export function validateRequired(value: any, field: string): void;
export function validateUrl(url: string): boolean;
export function validateEmail(email: string): boolean;
export function sanitizeInput(input: string): string;
```

---

## 🖼️ Google Images Domain API

### @semantest/images.google.com

#### Domain Events

```typescript
// Download requested event
export class GoogleImageDownloadRequested extends BaseDomainEvent {
  constructor(
    public readonly imageUrl: string,
    public readonly searchQuery: string,
    public readonly options: DownloadOptions,
    correlationId?: string
  );
  
  validate(): boolean;
}

// Download completed event
export class GoogleImageDownloadCompleted extends BaseDomainEvent {
  constructor(
    public readonly imageUrl: string,
    public readonly filename: string,
    public readonly fileSize: number,
    public readonly metadata: ImageMetadata,
    correlationId?: string
  );
  
  validate(): boolean;
}

// Download failed event
export class GoogleImageDownloadFailed extends BaseDomainEvent {
  constructor(
    public readonly imageUrl: string,
    public readonly reason: string,
    public readonly error: Error,
    correlationId?: string
  );
  
  validate(): boolean;
}

// Search completed event
export class GoogleImageSearchCompleted extends BaseDomainEvent {
  constructor(
    public readonly searchQuery: string,
    public readonly results: ImageSearchResult[],
    public readonly totalResults: number,
    correlationId?: string
  );
  
  validate(): boolean;
}
```

#### Domain Entities

```typescript
// Google Image entity
export class GoogleImage {
  constructor(
    public readonly id: string,
    public readonly url: string,
    public readonly metadata: ImageMetadata,
    public readonly source: ImageSource
  );
  
  // Entity methods
  toDownloadRequest(options?: DownloadOptions): GoogleImageDownloadRequested;
  getDisplayName(): string;
  isValidForDownload(): boolean;
  
  // Factory methods
  static fromSearchResult(result: ImageSearchResult): GoogleImage;
  static fromUrl(url: string): GoogleImage;
}

// Google Image Download entity
export class GoogleImageDownload {
  constructor(
    public readonly id: string,
    public readonly imageUrl: string,
    public readonly searchQuery: string,
    public readonly status: DownloadStatus,
    public readonly startTime: Date,
    public readonly endTime?: Date,
    public readonly filename?: string,
    public readonly fileSize?: number,
    public readonly error?: Error
  );
  
  // Entity methods
  markAsCompleted(filename: string, fileSize: number): void;
  markAsFailed(error: Error): void;
  getDuration(): number;
  
  // Factory methods
  static create(imageUrl: string, searchQuery: string): GoogleImageDownload;
}
```

#### Value Objects

```typescript
// Image URL value object
export class ImageUrl {
  constructor(private readonly value: string);
  
  toString(): string;
  isValid(): boolean;
  getDomain(): string;
  getExtension(): string;
  
  static create(url: string): ImageUrl;
  static isValid(url: string): boolean;
}

// Image metadata value object
export class ImageMetadata {
  constructor(
    public readonly width: number,
    public readonly height: number,
    public readonly format: string,
    public readonly size?: number,
    public readonly alt?: string,
    public readonly title?: string
  );
  
  getAspectRatio(): number;
  isLandscape(): boolean;
  isPortrait(): boolean;
  
  static create(metadata: Partial<ImageMetadata>): ImageMetadata;
}

// Download options value object
export class DownloadOptions {
  constructor(
    public readonly quality: 'low' | 'medium' | 'high',
    public readonly maxSize?: number,
    public readonly timeout?: number,
    public readonly retries?: number,
    public readonly directory?: string
  );
  
  static createDefault(): DownloadOptions;
  static createHighQuality(): DownloadOptions;
}
```

#### Application Services

```typescript
// Google Images service
export class GoogleImagesService implements ApplicationService {
  readonly serviceName = 'GoogleImagesService';
  
  constructor(
    private readonly imageRepository: ImageRepository,
    private readonly downloadRepository: DownloadRepository,
    private readonly eventBus: EventBus
  );
  
  // Service methods
  async searchImages(
    query: string, 
    options?: SearchOptions
  ): Promise<ImageSearchResult[]>;
  
  async downloadImage(
    imageUrl: string, 
    options?: DownloadOptions
  ): Promise<GoogleImageDownload>;
  
  async getDownloadHistory(
    query?: string
  ): Promise<GoogleImageDownload[]>;
  
  async cancelDownload(downloadId: string): Promise<void>;
  
  // Lifecycle methods
  async initialize(): Promise<void>;
  async cleanup(): Promise<void>;
}

// Download manager service
export class DownloadManager {
  constructor(
    private readonly downloadRepository: DownloadRepository,
    private readonly eventBus: EventBus
  );
  
  async startDownload(
    imageUrl: string, 
    options: DownloadOptions
  ): Promise<string>;
  
  async getDownloadStatus(downloadId: string): Promise<DownloadStatus>;
  async pauseDownload(downloadId: string): Promise<void>;
  async resumeDownload(downloadId: string): Promise<void>;
  async cancelDownload(downloadId: string): Promise<void>;
  
  // Batch operations
  async startBatchDownload(
    images: string[], 
    options: DownloadOptions
  ): Promise<string[]>;
  
  async getBatchStatus(batchId: string): Promise<BatchDownloadStatus>;
}
```

#### Repository Interfaces

```typescript
// Image repository interface
export interface ImageRepository extends Repository<GoogleImage, string> {
  findByUrl(url: string): Promise<GoogleImage | null>;
  findBySearchQuery(query: string): Promise<GoogleImage[]>;
  findByMetadata(metadata: Partial<ImageMetadata>): Promise<GoogleImage[]>;
  
  // Specialized queries
  findRecentSearches(limit?: number): Promise<ImageSearchResult[]>;
  findPopularImages(limit?: number): Promise<GoogleImage[]>;
  findImagesBySize(minSize: number, maxSize: number): Promise<GoogleImage[]>;
}

// Download repository interface
export interface DownloadRepository extends Repository<GoogleImageDownload, string> {
  findByStatus(status: DownloadStatus): Promise<GoogleImageDownload[]>;
  findBySearchQuery(query: string): Promise<GoogleImageDownload[]>;
  findByDateRange(start: Date, end: Date): Promise<GoogleImageDownload[]>;
  
  // Statistics
  getDownloadStats(): Promise<DownloadStatistics>;
  getSuccessRate(): Promise<number>;
  getAverageDownloadTime(): Promise<number>;
}
```

---

## 💬 ChatGPT Domain API

### @semantest/chatgpt.com

#### Domain Events

```typescript
// Conversation started event
export class ConversationStarted extends BaseDomainEvent {
  constructor(
    public readonly conversationId: string,
    public readonly projectId: string,
    public readonly title: string,
    public readonly initialPrompt?: string,
    correlationId?: string
  );
  
  validate(): boolean;
}

// Message sent event
export class MessageSent extends BaseDomainEvent {
  constructor(
    public readonly conversationId: string,
    public readonly messageId: string,
    public readonly content: string,
    public readonly timestamp: Date,
    correlationId?: string
  );
  
  validate(): boolean;
}

// Message received event
export class MessageReceived extends BaseDomainEvent {
  constructor(
    public readonly conversationId: string,
    public readonly messageId: string,
    public readonly content: string,
    public readonly timestamp: Date,
    public readonly metadata: MessageMetadata,
    correlationId?: string
  );
  
  validate(): boolean;
}
```

#### Domain Entities

```typescript
// ChatGPT Conversation entity
export class ChatGPTConversation {
  constructor(
    public readonly id: string,
    public readonly projectId: string,
    public readonly title: string,
    public readonly messages: ConversationMessage[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly status: ConversationStatus
  );
  
  // Entity methods
  addMessage(message: ConversationMessage): void;
  getLastMessage(): ConversationMessage | null;
  getMessageCount(): number;
  getDuration(): number;
  
  // Factory methods
  static create(projectId: string, title: string): ChatGPTConversation;
}

// Conversation Message entity
export class ConversationMessage {
  constructor(
    public readonly id: string,
    public readonly conversationId: string,
    public readonly content: string,
    public readonly role: MessageRole,
    public readonly timestamp: Date,
    public readonly metadata: MessageMetadata
  );
  
  // Entity methods
  isUserMessage(): boolean;
  isAssistantMessage(): boolean;
  getWordCount(): number;
  
  // Factory methods
  static createUserMessage(
    conversationId: string, 
    content: string
  ): ConversationMessage;
  
  static createAssistantMessage(
    conversationId: string, 
    content: string
  ): ConversationMessage;
}
```

#### Application Services

```typescript
// ChatGPT Application service
export class ChatGPTApplication implements ApplicationService {
  readonly serviceName = 'ChatGPTApplication';
  
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly messageRepository: MessageRepository,
    private readonly eventBus: EventBus
  );
  
  // Core operations
  async startConversation(
    projectId: string, 
    title: string, 
    initialPrompt?: string
  ): Promise<ChatGPTConversation>;
  
  async sendMessage(
    conversationId: string, 
    content: string
  ): Promise<ConversationMessage>;
  
  async getConversation(
    conversationId: string
  ): Promise<ChatGPTConversation>;
  
  async getConversationHistory(
    projectId: string
  ): Promise<ChatGPTConversation[]>;
  
  // Advanced operations
  async sendMessageWithContext(
    conversationId: string,
    content: string,
    context: MessageContext
  ): Promise<ConversationMessage>;
  
  async exportConversation(
    conversationId: string,
    format: 'json' | 'markdown' | 'text'
  ): Promise<string>;
  
  // Lifecycle methods
  async initialize(): Promise<void>;
  async cleanup(): Promise<void>;
}
```

---

## 🖥️ Infrastructure Module API

### @semantest/nodejs.server

#### Server Infrastructure

```typescript
// Server application
export class ServerApplication {
  constructor(config: ServerConfiguration);
  
  async start(port: number): Promise<void>;
  async stop(): Promise<void>;
  
  // Request handling
  async handleAutomationRequest(
    request: AutomationRequest
  ): Promise<AutomationResponse>;
  
  async routeEventToModule(
    event: DomainEvent
  ): Promise<void>;
  
  // Health and monitoring
  async getHealthStatus(): Promise<HealthStatus>;
  async getMetrics(): Promise<ServerMetrics>;
}

// Coordination application
export class CoordinationApplication {
  constructor(
    private readonly eventBus: EventBus,
    private readonly securityService: SecurityService
  );
  
  // Event coordination
  async coordinateEvent(event: DomainEvent): Promise<void>;
  async routeToModule(
    event: DomainEvent, 
    targetModule: string
  ): Promise<void>;
  
  // Session management
  async createSession(
    userId: string, 
    sessionData: SessionData
  ): Promise<Session>;
  
  async validateSession(sessionId: string): Promise<boolean>;
  async endSession(sessionId: string): Promise<void>;
}
```

#### Security Infrastructure

```typescript
// Security service
export class SecurityService {
  async authenticateUser(
    credentials: UserCredentials
  ): Promise<AuthenticationResult>;
  
  async authorizeAction(
    userId: string, 
    action: string, 
    resource: string
  ): Promise<boolean>;
  
  async auditEvent(
    event: DomainEvent, 
    userId: string
  ): Promise<void>;
  
  // Security monitoring
  async detectAnomalies(
    events: DomainEvent[]
  ): Promise<SecurityAnomaly[]>;
  
  async enforceRateLimit(
    userId: string, 
    action: string
  ): Promise<boolean>;
}

// Audit service
export class AuditService {
  async recordEvent(
    event: DomainEvent, 
    context: AuditContext
  ): Promise<void>;
  
  async getAuditTrail(
    userId: string, 
    dateRange: DateRange
  ): Promise<AuditEntry[]>;
  
  async generateComplianceReport(
    startDate: Date, 
    endDate: Date
  ): Promise<ComplianceReport>;
}
```

---

## 🌐 Browser Module API

### @semantest/browser

#### Browser Automation

```typescript
// Browser automation service
export class BrowserAutomationService {
  constructor(config: BrowserConfiguration);
  
  async launchBrowser(options?: LaunchOptions): Promise<Browser>;
  async createPage(browser: Browser): Promise<Page>;
  
  // Navigation
  async navigateToUrl(page: Page, url: string): Promise<void>;
  async waitForElement(
    page: Page, 
    selector: string, 
    timeout?: number
  ): Promise<Element>;
  
  // Interaction
  async clickElement(
    page: Page, 
    selector: string
  ): Promise<void>;
  
  async fillInput(
    page: Page, 
    selector: string, 
    value: string
  ): Promise<void>;
  
  async extractText(
    page: Page, 
    selector: string
  ): Promise<string>;
  
  // Advanced operations
  async executeScript(
    page: Page, 
    script: string
  ): Promise<any>;
  
  async takeScreenshot(
    page: Page, 
    options?: ScreenshotOptions
  ): Promise<Buffer>;
}
```

---

## 📦 Client Module API

### @semantest/typescript.client

#### Event-Driven Client

```typescript
// Generic event-driven client
export class EventDrivenClient {
  constructor(config: ClientConfiguration);
  
  // Event operations
  async sendEvent<T extends DomainEvent>(
    event: T
  ): Promise<EventResponse>;
  
  async subscribeToEvents<T extends DomainEvent>(
    eventType: string,
    handler: (event: T) => void
  ): Promise<void>;
  
  async unsubscribeFromEvents(
    eventType: string,
    handler: Function
  ): Promise<void>;
  
  // Connection management
  async connect(): Promise<void>;
  async disconnect(): Promise<void>;
  async reconnect(): Promise<void>;
  
  // Utility methods
  async ping(): Promise<number>;
  async getStatus(): Promise<ClientStatus>;
}
```

#### Client Configuration

```typescript
// Client configuration interface
export interface ClientConfiguration {
  serverUrl: string;
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
  authentication?: AuthenticationConfig;
  websocket?: WebSocketConfig;
}

// Authentication configuration
export interface AuthenticationConfig {
  type: 'jwt' | 'oauth' | 'apikey';
  credentials: Record<string, string>;
  refreshToken?: string;
  tokenEndpoint?: string;
}

// WebSocket configuration
export interface WebSocketConfig {
  url: string;
  protocols?: string[];
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}
```

---

## 🔧 Integration Examples

### Cross-Module Communication

```typescript
// Example: Google Images to ChatGPT workflow
import { GoogleImageDownloadCompleted } from '@semantest/images.google.com/domain/events';
import { MessageSent } from '@semantest/chatgpt.com/domain/events';
import { EventBus } from '@semantest/core/events';

const eventBus = EventBus.getInstance();

// Subscribe to Google Images events
eventBus.subscribe('GoogleImageDownloadCompleted', async (event: GoogleImageDownloadCompleted) => {
  // Send notification to ChatGPT
  const message = new MessageSent(
    'conversation-123',
    'msg-456',
    `Image downloaded: ${event.filename}`,
    new Date(),
    event.correlationId
  );
  
  await eventBus.publish(message);
});

// Start Google Images download
const downloadEvent = new GoogleImageDownloadRequested(
  'https://example.com/image.jpg',
  'cats',
  { quality: 'high' }
);

await eventBus.publish(downloadEvent);
```

### Server-side Event Handling

```typescript
// Server-side event coordination
import { CoordinationApplication } from '@semantest/nodejs.server';
import { GoogleImageDownloadRequested } from '@semantest/images.google.com/domain/events';

const coordinator = new CoordinationApplication(eventBus, securityService);

// Handle domain events
coordinator.subscribeToEvent('GoogleImageDownloadRequested', async (event) => {
  // Security check
  await securityService.authorizeAction(
    event.metadata.userId,
    'download',
    'images'
  );
  
  // Route to appropriate module
  await coordinator.routeToModule(event, 'images.google.com');
  
  // Audit the action
  await securityService.auditEvent(event, event.metadata.userId);
});
```

---

## 📊 Error Handling

### Standard Error Types

```typescript
// Domain error base class
export abstract class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

// Specific error types
export class ValidationError extends DomainError {
  constructor(field: string, value: any, constraint: string) {
    super(
      `Validation failed for field '${field}': ${constraint}`,
      'VALIDATION_ERROR',
      { field, value, constraint }
    );
  }
}

export class NotFoundError extends DomainError {
  constructor(resource: string, id: string) {
    super(
      `${resource} with id '${id}' not found`,
      'NOT_FOUND',
      { resource, id }
    );
  }
}

export class UnauthorizedError extends DomainError {
  constructor(action: string, resource: string) {
    super(
      `Unauthorized to perform '${action}' on '${resource}'`,
      'UNAUTHORIZED',
      { action, resource }
    );
  }
}
```

### Error Response Format

```typescript
// Standard error response
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: Date;
    correlationId?: string;
  };
}

// Success response format
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  timestamp: Date;
  correlationId?: string;
}
```

---

## 🔒 Security Considerations

### Authentication & Authorization

```typescript
// Authentication token
export interface AuthToken {
  userId: string;
  roles: string[];
  permissions: string[];
  expiresAt: Date;
  issuedAt: Date;
}

// Authorization context
export interface AuthContext {
  user: AuthToken;
  session: Session;
  requestId: string;
  ipAddress: string;
}

// Security constraints
export interface SecurityConstraints {
  requiresAuth: boolean;
  requiredRoles: string[];
  requiredPermissions: string[];
  rateLimit?: RateLimit;
}
```

### Data Protection

```typescript
// Sensitive data handling
export interface SensitiveData {
  value: string;
  encrypted: boolean;
  classification: 'public' | 'internal' | 'confidential' | 'restricted';
}

// Data masking
export function maskSensitiveData(data: any): any;
export function encryptSensitiveData(data: SensitiveData): SensitiveData;
export function decryptSensitiveData(data: SensitiveData): SensitiveData;
```

---

## 📈 Performance Monitoring

### Metrics Collection

```typescript
// Performance metrics
export interface PerformanceMetrics {
  timestamp: Date;
  
  // Request metrics
  requestCount: number;
  averageResponseTime: number;
  errorRate: number;
  
  // Resource metrics
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  
  cpuUsage: {
    user: number;
    system: number;
  };
  
  // Event metrics
  eventCount: number;
  eventProcessingTime: number;
  eventQueueSize: number;
}

// Monitoring service
export class MonitoringService {
  async collectMetrics(): Promise<PerformanceMetrics>;
  async recordEvent(event: DomainEvent, processingTime: number): Promise<void>;
  async getMetricsTrend(period: TimePeriod): Promise<PerformanceMetrics[]>;
}
```

---

## 🧪 Testing Support

### Test Utilities

```typescript
// Test event factory
export class TestEventFactory {
  static createGoogleImageDownloadRequested(
    overrides?: Partial<GoogleImageDownloadRequested>
  ): GoogleImageDownloadRequested;
  
  static createConversationStarted(
    overrides?: Partial<ConversationStarted>
  ): ConversationStarted;
  
  static createRandomEvent<T extends DomainEvent>(
    eventType: new (...args: any[]) => T,
    overrides?: Partial<T>
  ): T;
}

// Mock services
export class MockEventBus implements EventBus {
  private publishedEvents: DomainEvent[] = [];
  
  async publish<T extends DomainEvent>(event: T): Promise<void>;
  subscribe<T extends DomainEvent>(eventType: string, handler: (event: T) => void): void;
  unsubscribe(eventType: string, handler: Function): void;
  
  // Test utilities
  getPublishedEvents(): DomainEvent[];
  getPublishedEventsOfType<T extends DomainEvent>(eventType: string): T[];
  clearPublishedEvents(): void;
}
```

---

**API Reference Version**: 2.0.0  
**Last Updated**: July 18, 2025  
**Next Review**: August 18, 2025