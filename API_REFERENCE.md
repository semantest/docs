# Semantest API Reference

Complete API documentation for the Semantest platform, organized by module.

## Table of Contents

1. [@semantest/core](#semantestcore)
2. [@semantest/browser](#semantestbrowser)
3. [@semantest/google.com](#semantestgooglecom)
4. [@semantest/images.google.com](#semantestimagesgooglecom)
5. [@semantest/chatgpt.com](#semantestchatgptcom)
6. [@semantest/nodejs.server](#semantestnodejsserver)
7. [@semantest/extension.chrome](#semantestextensionchrome)
8. [@semantest/typescript.client](#semantesttypescriptclient)

## @semantest/core

Core utilities and base classes used across all Semantest modules.

### Classes

#### DomainEvent

Base class for all domain events in the system.

```typescript
abstract class DomainEvent {
  readonly eventId: string;
  readonly eventType: string;
  readonly timestamp: Date;
  readonly correlationId: string;
  readonly causationId?: string;
  readonly metadata: Record<string, any>;

  constructor(eventType: string, correlationId?: string);
  
  toJSON(): object;
  static fromJSON<T extends DomainEvent>(json: object): T;
}
```

**Example:**
```typescript
class UserRegistered extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    correlationId?: string
  ) {
    super('user.registered', correlationId);
  }
}
```

#### Entity

Base class for domain entities.

```typescript
abstract class Entity<T> {
  protected _domainEvents: DomainEvent[] = [];
  
  abstract getId(): string;
  
  protected addDomainEvent(event: DomainEvent): void;
  clearDomainEvents(): void;
  getDomainEvents(): ReadonlyArray<DomainEvent>;
  
  equals(other: Entity<T>): boolean;
}
```

**Example:**
```typescript
class User extends Entity<User> {
  constructor(
    private readonly id: UserId,
    private name: string
  ) {
    super();
  }
  
  getId(): string {
    return this.id.value;
  }
  
  changeName(newName: string): void {
    this.name = newName;
    this.addDomainEvent(new UserNameChanged(this.id.value, newName));
  }
}
```

#### AggregateRoot

Base class for aggregate roots, extending Entity with event application.

```typescript
abstract class AggregateRoot<T> extends Entity<T> {
  private version: number = 0;
  
  protected applyEvent(event: DomainEvent): void;
  protected abstract apply(event: DomainEvent): void;
  
  getVersion(): number;
  markEventsAsCommitted(): void;
  getUncommittedEvents(): ReadonlyArray<DomainEvent>;
  loadFromHistory(events: DomainEvent[]): void;
}
```

**Example:**
```typescript
class Order extends AggregateRoot<Order> {
  private items: OrderItem[] = [];
  private status: OrderStatus;
  
  static create(customerId: string): Order {
    const order = new Order();
    order.applyEvent(new OrderCreated(OrderId.generate(), customerId));
    return order;
  }
  
  protected apply(event: DomainEvent): void {
    if (event instanceof OrderCreated) {
      this.id = event.orderId;
      this.customerId = event.customerId;
      this.status = OrderStatus.Pending;
    }
  }
}
```

#### ValueObject

Base class for value objects.

```typescript
abstract class ValueObject<T> {
  abstract equals(other: ValueObject<T>): boolean;
  abstract hashCode(): number;
  
  static isValueObject(obj: any): obj is ValueObject<any>;
}
```

**Example:**
```typescript
class Email extends ValueObject<Email> {
  constructor(public readonly value: string) {
    super();
    if (!Email.isValid(value)) {
      throw new InvalidEmailError(value);
    }
  }
  
  static isValid(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }
  
  equals(other: Email): boolean {
    return this.value === other.value;
  }
  
  hashCode(): number {
    return this.value.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
  }
}
```

### Interfaces

#### IEventBus

Interface for event bus implementations.

```typescript
interface IEventBus {
  publish(event: DomainEvent): Promise<void>;
  publishBatch(events: DomainEvent[]): Promise<void>;
  subscribe(eventType: string, handler: EventHandler): void;
  unsubscribe(eventType: string, handler: EventHandler): void;
}

type EventHandler = (event: DomainEvent) => Promise<void> | void;
```

#### IRepository

Generic repository interface.

```typescript
interface IRepository<T extends AggregateRoot<T>> {
  findById(id: string): Promise<T | null>;
  save(aggregate: T): Promise<void>;
  delete(id: string): Promise<void>;
}
```

### Utilities

#### Logger

Structured logging utility.

```typescript
interface ILogger {
  debug(message: string, context?: any): void;
  info(message: string, context?: any): void;
  warn(message: string, context?: any): void;
  error(message: string, error?: Error, context?: any): void;
}

const logger = createLogger({
  level: 'info',
  format: 'json',
  transports: ['console', 'file']
});
```

#### Result

Result type for error handling without exceptions.

```typescript
class Result<T, E = Error> {
  private constructor(
    private readonly value?: T,
    private readonly error?: E
  ) {}
  
  static ok<T>(value: T): Result<T>;
  static fail<E>(error: E): Result<never, E>;
  
  isOk(): boolean;
  isFail(): boolean;
  getValue(): T;
  getError(): E;
  
  map<U>(fn: (value: T) => U): Result<U, E>;
  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E>;
}
```

**Example:**
```typescript
function divide(a: number, b: number): Result<number, string> {
  if (b === 0) {
    return Result.fail('Division by zero');
  }
  return Result.ok(a / b);
}

const result = divide(10, 2);
if (result.isOk()) {
  console.log(result.getValue()); // 5
}
```

## @semantest/browser

Browser automation framework for web interaction.

### Classes

#### BrowserAutomation

Main class for browser automation.

```typescript
class BrowserAutomation {
  constructor(config?: BrowserConfig);
  
  initialize(): Promise<void>;
  close(): Promise<void>;
  
  navigate(url: string, options?: NavigationOptions): Promise<void>;
  reload(options?: NavigationOptions): Promise<void>;
  goBack(): Promise<void>;
  goForward(): Promise<void>;
  
  fillInput(options: FormInputOptions): Promise<void>;
  click(options: ClickOptions): Promise<void>;
  hover(options: HoverOptions): Promise<void>;
  select(options: SelectOptions): Promise<void>;
  
  waitForSelector(selector: string, options?: WaitOptions): Promise<void>;
  waitForNavigation(options?: NavigationOptions): Promise<void>;
  
  screenshot(options?: ScreenshotOptions): Promise<Buffer>;
  pdf(options?: PDFOptions): Promise<Buffer>;
  
  evaluate<T>(fn: Function, ...args: any[]): Promise<T>;
  evaluateHandle<T>(fn: Function, ...args: any[]): Promise<T>;
}
```

**Example:**
```typescript
const browser = new BrowserAutomation({
  headless: false,
  viewport: { width: 1280, height: 720 }
});

await browser.initialize();
await browser.navigate('https://example.com');
await browser.fillInput({
  selector: '#email',
  value: 'user@example.com'
});
await browser.click({ selector: '#submit' });
await browser.waitForNavigation();
await browser.screenshot({ path: 'result.png' });
await browser.close();
```

### Interfaces

#### BrowserConfig

```typescript
interface BrowserConfig {
  headless?: boolean;
  viewport?: Viewport;
  userAgent?: string;
  locale?: string;
  timezone?: string;
  geolocation?: Geolocation;
  permissions?: string[];
  extraHTTPHeaders?: Record<string, string>;
  httpCredentials?: HTTPCredentials;
  offline?: boolean;
  colorScheme?: 'light' | 'dark' | 'no-preference';
  acceptDownloads?: boolean;
  ignoreHTTPSErrors?: boolean;
  bypassCSP?: boolean;
  javaScriptEnabled?: boolean;
  timezoneId?: string;
  proxy?: ProxySettings;
}
```

#### NavigationOptions

```typescript
interface NavigationOptions {
  timeout?: number;
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle';
  referer?: string;
}
```

#### FormInputOptions

```typescript
interface FormInputOptions {
  selector?: string;
  xpath?: string;
  text?: string;
  value: string;
  delay?: number;
  clear?: boolean;
}
```

#### ClickOptions

```typescript
interface ClickOptions {
  selector?: string;
  xpath?: string;
  text?: string;
  button?: 'left' | 'right' | 'middle';
  clickCount?: number;
  delay?: number;
  position?: { x: number; y: number };
  modifiers?: ('Alt' | 'Control' | 'Meta' | 'Shift')[];
  force?: boolean;
  noWaitAfter?: boolean;
  trial?: boolean;
  timeout?: number;
}
```

## @semantest/google.com

Google Search automation domain module for general Google search functionality.

### Classes

#### GoogleSearchAutomation

Main class for automating Google Search interactions.

```typescript
class GoogleSearchAutomation extends Entity<GoogleSearchAutomation> {
  constructor(config?: GoogleSearchConfig);
  
  initialize(): Promise<void>;
  close(): Promise<void>;
  
  search(query: string, options?: SearchOptions): Promise<SearchResults>;
  navigateToResult(index: number): Promise<void>;
  getSearchSuggestions(partial: string): Promise<string[]>;
  
  setSearchFilters(filters: SearchFilters): Promise<void>;
  switchToImageSearch(): Promise<void>;
  switchToVideoSearch(): Promise<void>;
  switchToNewsSearch(): Promise<void>;
  
  on(event: 'search-performed', handler: (event: SearchPerformedEvent) => void): void;
  on(event: 'result-clicked', handler: (event: ResultClickedEvent) => void): void;
  on(event: 'filter-applied', handler: (event: FilterAppliedEvent) => void): void;
}
```

**Example:**
```typescript
const googleSearch = new GoogleSearchAutomation();

await googleSearch.initialize();
const results = await googleSearch.search('semantic web automation');

console.log(`Found ${results.totalResults} results`);
results.items.forEach((result, index) => {
  console.log(`${index + 1}. ${result.title} - ${result.url}`);
});

// Navigate to first result
await googleSearch.navigateToResult(0);
```

### Events

#### GoogleSearchPerformed

```typescript
class GoogleSearchPerformed extends DomainEvent {
  constructor(
    public readonly query: string,
    public readonly resultsCount: number,
    public readonly searchType: SearchType,
    public readonly filters?: SearchFilters,
    correlationId?: string
  );
}
```

#### GoogleResultClicked

```typescript
class GoogleResultClicked extends DomainEvent {
  constructor(
    public readonly resultIndex: number,
    public readonly resultUrl: string,
    public readonly resultTitle: string,
    public readonly searchQuery: string,
    correlationId?: string
  );
}
```

### Interfaces

#### GoogleSearchConfig

```typescript
interface GoogleSearchConfig {
  language?: string;
  region?: string;
  safeSearch?: 'off' | 'moderate' | 'strict';
  resultsPerPage?: number;
  timeout?: number;
}
```

#### SearchOptions

```typescript
interface SearchOptions {
  type?: 'web' | 'image' | 'video' | 'news' | 'maps';
  timeRange?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
  sortBy?: 'relevance' | 'date';
  filters?: SearchFilters;
}
```

#### SearchResults

```typescript
interface SearchResults {
  query: string;
  totalResults: number;
  searchTime: number;
  items: SearchResultItem[];
  relatedSearches?: string[];
  nextPageToken?: string;
}

interface SearchResultItem {
  title: string;
  url: string;
  description: string;
  displayUrl: string;
  cachedUrl?: string;
  thumbnail?: string;
  metadata?: Record<string, any>;
}
```

#### SearchFilters

```typescript
interface SearchFilters {
  site?: string;
  fileType?: string;
  excludeSites?: string[];
  excludeTerms?: string[];
  exactTerms?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
}
```

### Value Objects

#### SearchQuery

```typescript
class SearchQuery extends ValueObject<SearchQuery> {
  constructor(
    public readonly value: string,
    public readonly operators: SearchOperator[] = []
  ) {
    super();
    if (!value || value.trim().length === 0) {
      throw new InvalidSearchQueryError('Search query cannot be empty');
    }
  }
  
  static create(query: string): SearchQuery {
    const operators = this.extractOperators(query);
    return new SearchQuery(query, operators);
  }
  
  addOperator(operator: SearchOperator): SearchQuery {
    return new SearchQuery(
      `${this.value} ${operator.toString()}`,
      [...this.operators, operator]
    );
  }
  
  equals(other: SearchQuery): boolean {
    return this.value === other.value;
  }
}

class SearchOperator {
  constructor(
    public readonly type: 'site' | 'filetype' | 'inurl' | 'intitle',
    public readonly value: string
  ) {}
  
  toString(): string {
    return `${this.type}:${this.value}`;
  }
}
```

## @semantest/images.google.com

Google Images automation domain module.

### Classes

#### GoogleImagesDownloader

Main class for downloading images from Google Images.

```typescript
class GoogleImagesDownloader extends Entity<GoogleImagesDownloader> {
  constructor();
  
  downloadImage(options: DownloadOptions): Promise<DownloadResult>;
  downloadBatch(images: DownloadOptions[]): Promise<DownloadResult[]>;
  
  setDownloadPath(path: string): void;
  setNamingStrategy(strategy: NamingStrategy): void;
  
  on(event: 'download-started', handler: (event: DownloadStartedEvent) => void): void;
  on(event: 'download-completed', handler: (event: DownloadCompletedEvent) => void): void;
  on(event: 'download-failed', handler: (event: DownloadFailedEvent) => void): void;
  on(event: 'pattern-detected', handler: (event: PatternDetectedEvent) => void): void;
}
```

**Example:**
```typescript
const downloader = new GoogleImagesDownloader();

downloader.on('download-completed', (event) => {
  console.log(`Downloaded: ${event.fileName} (${event.fileSize} bytes)`);
});

const result = await downloader.downloadImage({
  imageUrl: 'https://example.com/image.jpg',
  searchQuery: 'cute cats',
  fileName: 'my-cat.jpg'
});
```

### Events

#### GoogleImageDownloadRequested

```typescript
class GoogleImageDownloadRequested extends DomainEvent {
  constructor(
    public readonly imageUrl: string,
    public readonly searchQuery?: string,
    public readonly fileName?: string,
    public readonly metadata?: ImageMetadata,
    correlationId?: string
  );
}
```

#### GoogleImageDownloadCompleted

```typescript
class GoogleImageDownloadCompleted extends DomainEvent {
  constructor(
    public readonly imageUrl: string,
    public readonly fileName: string,
    public readonly filePath: string,
    public readonly fileSize: number,
    public readonly mimeType: string,
    public readonly downloadTime: number,
    correlationId?: string
  );
}
```

#### GoogleImageDownloadFailed

```typescript
class GoogleImageDownloadFailed extends DomainEvent {
  constructor(
    public readonly imageUrl: string,
    public readonly error: string,
    public readonly errorCode: string,
    public readonly retryable: boolean,
    correlationId?: string
  );
}
```

### Interfaces

#### DownloadOptions

```typescript
interface DownloadOptions {
  imageUrl: string;
  searchQuery?: string;
  fileName?: string;
  timeout?: number;
  maxRetries?: number;
  headers?: Record<string, string>;
  skipDuplicates?: boolean;
}
```

#### DownloadResult

```typescript
interface DownloadResult {
  success: boolean;
  fileName?: string;
  filePath?: string;
  fileSize?: number;
  mimeType?: string;
  downloadTime?: number;
  error?: string;
  errorCode?: string;
}
```

#### ImageMetadata

```typescript
interface ImageMetadata {
  width?: number;
  height?: number;
  format?: string;
  colorDepth?: number;
  hasAlpha?: boolean;
  orientation?: number;
  dpi?: number;
  colorSpace?: string;
  fileSize?: number;
  createdAt?: Date;
  modifiedAt?: Date;
}
```

## @semantest/chatgpt.com

ChatGPT automation domain module.

### Classes

#### ChatGPTAutomation

Main class for automating ChatGPT interactions.

```typescript
class ChatGPTAutomation extends Entity<ChatGPTAutomation> {
  constructor(config?: ChatGPTConfig);
  
  initialize(): Promise<void>;
  close(): Promise<void>;
  
  login(credentials: LoginCredentials): Promise<void>;
  logout(): Promise<void>;
  
  newConversation(): Promise<void>;
  sendMessage(message: string, options?: MessageOptions): Promise<void>;
  waitForResponse(options?: WaitOptions): Promise<ChatResponse>;
  
  getConversationHistory(): Promise<Message[]>;
  exportConversation(format: 'json' | 'markdown' | 'pdf'): Promise<Buffer>;
  
  selectModel(model: GPTModel): Promise<void>;
  uploadFile(filePath: string): Promise<void>;
  
  on(event: 'message-sent', handler: (event: MessageSentEvent) => void): void;
  on(event: 'response-received', handler: (event: ResponseReceivedEvent) => void): void;
  on(event: 'error', handler: (event: ChatGPTErrorEvent) => void): void;
}
```

**Example:**
```typescript
const chatgpt = new ChatGPTAutomation({
  model: 'gpt-4',
  timeout: 30000
});

await chatgpt.initialize();
await chatgpt.login({
  email: 'user@example.com',
  password: 'password'
});

await chatgpt.newConversation();
await chatgpt.sendMessage('Write a haiku about programming');
const response = await chatgpt.waitForResponse();
console.log(response.content);

await chatgpt.close();
```

### Events

#### ChatGPTMessageSent

```typescript
class ChatGPTMessageSent extends DomainEvent {
  constructor(
    public readonly conversationId: string,
    public readonly messageId: string,
    public readonly content: string,
    public readonly attachments?: Attachment[],
    correlationId?: string
  );
}
```

#### ChatGPTResponseReceived

```typescript
class ChatGPTResponseReceived extends DomainEvent {
  constructor(
    public readonly conversationId: string,
    public readonly messageId: string,
    public readonly content: string,
    public readonly model: string,
    public readonly tokensUsed: number,
    correlationId?: string
  );
}
```

### Interfaces

#### ChatGPTConfig

```typescript
interface ChatGPTConfig {
  model?: GPTModel;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
  retryAttempts?: number;
  customInstructions?: string;
}
```

#### LoginCredentials

```typescript
interface LoginCredentials {
  email: string;
  password: string;
  twoFactorCode?: string;
}
```

#### ChatResponse

```typescript
interface ChatResponse {
  messageId: string;
  content: string;
  model: string;
  tokensUsed: number;
  finishReason: 'stop' | 'length' | 'error';
  timestamp: Date;
}
```

## @semantest/nodejs.server

Server infrastructure for Semantest platform.

### Classes

#### SemantestServer

Main server class.

```typescript
class SemantestServer {
  constructor(config?: ServerConfig);
  
  start(): Promise<void>;
  stop(): Promise<void>;
  
  registerModule(module: DomainModule): void;
  registerMiddleware(middleware: Middleware): void;
  registerEventHandler(handler: EventHandler): void;
  
  getHealth(): HealthStatus;
  getMetrics(): ServerMetrics;
}
```

### WebSocket API

#### Connection

```typescript
interface WebSocketConnection {
  id: string;
  
  send(message: WebSocketMessage): void;
  close(code?: number, reason?: string): void;
  
  on(event: 'message', handler: (message: WebSocketMessage) => void): void;
  on(event: 'close', handler: (code: number, reason: string) => void): void;
  on(event: 'error', handler: (error: Error) => void): void;
}
```

#### Messages

```typescript
interface WebSocketMessage {
  type: 'event' | 'command' | 'query' | 'response';
  id: string;
  correlationId: string;
  payload: any;
  timestamp: Date;
}
```

### REST API

#### Endpoints

```typescript
// Health check
GET /health

// Metrics
GET /metrics

// Events
POST /events
GET /events/:eventId
GET /events?type=:eventType&from=:date&to=:date

// Downloads
GET /downloads
GET /downloads/:downloadId
POST /downloads/cleanup

// Automation tasks
POST /automation/tasks
GET /automation/tasks/:taskId
DELETE /automation/tasks/:taskId
```

## @semantest/extension.chrome

Chrome extension for Semantest automation.

### Classes

#### ChromeExtension

Main extension class.

```typescript
class ChromeExtension {
  constructor();
  
  initialize(): Promise<void>;
  
  registerContentScript(pattern: string, script: ContentScript): void;
  registerBackgroundScript(script: BackgroundScript): void;
  
  sendMessage(tabId: number, message: ExtensionMessage): Promise<any>;
  broadcastMessage(message: ExtensionMessage): Promise<void>;
  
  createContextMenu(options: ContextMenuOptions): void;
  setBadgeText(text: string, tabId?: number): void;
  
  storage: ExtensionStorage;
  tabs: TabManager;
  downloads: DownloadManager;
}
```

### Content Scripts

#### ContentScriptContext

```typescript
interface ContentScriptContext {
  tabId: number;
  frameId: number;
  url: string;
  
  injectCSS(css: string): void;
  injectScript(script: string): void;
  
  querySelector(selector: string): Element | null;
  querySelectorAll(selector: string): NodeList;
  
  addEventListener(type: string, handler: EventListener): void;
  removeEventListener(type: string, handler: EventListener): void;
  
  sendMessage(message: any): Promise<any>;
  onMessage(handler: MessageHandler): void;
}
```

### Storage API

```typescript
interface ExtensionStorage {
  local: StorageArea;
  sync: StorageArea;
  session: StorageArea;
}

interface StorageArea {
  get(keys?: string | string[]): Promise<any>;
  set(items: Record<string, any>): Promise<void>;
  remove(keys: string | string[]): Promise<void>;
  clear(): Promise<void>;
}
```

### Permissions

```typescript
interface ExtensionPermissions {
  contains(permissions: string[]): Promise<boolean>;
  request(permissions: string[]): Promise<boolean>;
  remove(permissions: string[]): Promise<boolean>;
  getAll(): Promise<Permissions>;
}
```

## Error Handling

All API methods follow consistent error handling patterns:

```typescript
try {
  const result = await api.someMethod();
} catch (error) {
  if (error instanceof DomainError) {
    // Handle domain-specific errors
    console.error(`Domain error: ${error.code}`, error.context);
  } else if (error instanceof ValidationError) {
    // Handle validation errors
    console.error(`Validation failed: ${error.message}`);
  } else {
    // Handle unexpected errors
    console.error('Unexpected error:', error);
  }
}
```

## Rate Limiting

API methods that interact with external services implement rate limiting:

```typescript
const rateLimiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60000 // 1 minute
});

await rateLimiter.acquire();
const result = await api.externalCall();
```

## Pagination

APIs that return collections support pagination:

```typescript
interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface PaginationOptions {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
```

## Versioning

The API follows semantic versioning with backward compatibility:

- **Major version**: Breaking changes
- **Minor version**: New features, backward compatible
- **Patch version**: Bug fixes, backward compatible

```typescript
import { version } from '@semantest/core';
console.log(version); // "2.0.0"
```

## Deprecation Policy

Deprecated APIs are marked and maintained for at least 2 major versions:

```typescript
/**
 * @deprecated Use `downloadImage` instead. Will be removed in v4.0.0
 */
async downloadGoogleImage(url: string): Promise<void> {
  console.warn('downloadGoogleImage is deprecated. Use downloadImage instead.');
  return this.downloadImage({ imageUrl: url });
}
```

## @semantest/typescript.client

TypeScript client library for Semantest platform integration.

### Classes

#### SemantestClient

Main client for interacting with Semantest services.

```typescript
class SemantestClient {
  constructor(config: ClientConfig);
  
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  
  // Event handling
  on(event: string, handler: EventHandler): void;
  off(event: string, handler: EventHandler): void;
  once(event: string, handler: EventHandler): void;
  
  // Command execution
  execute<T>(command: Command): Promise<T>;
  executeAsync<T>(command: Command): AsyncResult<T>;
  
  // Query execution
  query<T>(query: Query): Promise<T>;
  subscribe<T>(query: Query, handler: (data: T) => void): Subscription;
  
  // Domain-specific clients
  images: ImagesClient;
  search: SearchClient;
  chatgpt: ChatGPTClient;
  browser: BrowserClient;
}
```

**Example:**
```typescript
const client = new SemantestClient({
  serverUrl: 'ws://localhost:3000',
  apiKey: process.env.SEMANTEST_API_KEY,
  reconnect: true
});

await client.connect();

// Execute command
const result = await client.execute({
  type: 'google-search',
  payload: {
    query: 'semantic web automation',
    options: { resultsPerPage: 50 }
  }
});

// Subscribe to events
client.on('download-completed', (event) => {
  console.log(`Downloaded: ${event.fileName}`);
});

// Use domain-specific client
const images = await client.images.search('cute cats');
await client.images.download(images[0].url);
```

### Interfaces

#### ClientConfig

```typescript
interface ClientConfig {
  serverUrl: string;
  apiKey?: string;
  timeout?: number;
  reconnect?: boolean;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
  headers?: Record<string, string>;
  debug?: boolean;
}
```

#### Command

```typescript
interface Command {
  id?: string;
  type: string;
  payload: any;
  correlationId?: string;
  timeout?: number;
}
```

#### Query

```typescript
interface Query {
  id?: string;
  type: string;
  parameters?: any;
  pagination?: PaginationOptions;
}
```

#### AsyncResult

```typescript
interface AsyncResult<T> {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  result?: T;
  error?: Error;
  
  onProgress(handler: (progress: number) => void): void;
  onComplete(handler: (result: T) => void): void;
  onError(handler: (error: Error) => void): void;
  cancel(): Promise<void>;
}
```

### Domain Clients

#### ImagesClient

```typescript
class ImagesClient {
  search(query: string, options?: ImageSearchOptions): Promise<ImageResult[]>;
  download(url: string, options?: DownloadOptions): Promise<DownloadResult>;
  downloadBatch(urls: string[], options?: BatchDownloadOptions): AsyncResult<BatchDownloadResult>;
  
  getDownloadHistory(options?: HistoryOptions): Promise<DownloadHistoryItem[]>;
  clearDownloadHistory(): Promise<void>;
}
```

#### SearchClient

```typescript
class SearchClient {
  web(query: string, options?: SearchOptions): Promise<SearchResults>;
  images(query: string, options?: ImageSearchOptions): Promise<ImageSearchResults>;
  videos(query: string, options?: VideoSearchOptions): Promise<VideoSearchResults>;
  news(query: string, options?: NewsSearchOptions): Promise<NewsSearchResults>;
  
  suggest(partial: string): Promise<string[]>;
  trending(): Promise<TrendingTopic[]>;
}
```

#### ChatGPTClient

```typescript
class ChatGPTClient {
  createConversation(): Promise<Conversation>;
  getConversation(id: string): Promise<Conversation>;
  listConversations(): Promise<Conversation[]>;
  
  sendMessage(conversationId: string, message: string): Promise<ChatResponse>;
  streamMessage(conversationId: string, message: string): AsyncIterator<ChatToken>;
  
  deleteConversation(id: string): Promise<void>;
  exportConversation(id: string, format: ExportFormat): Promise<Buffer>;
}
```

### Error Handling

```typescript
class SemantestClientError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: any
  ) {
    super(message);
  }
}

class ConnectionError extends SemantestClientError {
  constructor(message: string, public readonly cause?: Error) {
    super(message, 'CONNECTION_ERROR', { cause });
  }
}

class TimeoutError extends SemantestClientError {
  constructor(operation: string, timeout: number) {
    super(
      `Operation '${operation}' timed out after ${timeout}ms`,
      'TIMEOUT_ERROR',
      { operation, timeout }
    );
  }
}

class AuthenticationError extends SemantestClientError {
  constructor(message: string) {
    super(message, 'AUTH_ERROR');
  }
}
```

### WebSocket Events

The client uses WebSocket for real-time communication:

```typescript
// Connection events
client.on('connected', () => console.log('Connected to server'));
client.on('disconnected', (reason) => console.log('Disconnected:', reason));
client.on('reconnecting', (attempt) => console.log('Reconnecting...', attempt));
client.on('error', (error) => console.error('Client error:', error));

// Domain events
client.on('download-started', (event) => { /* ... */ });
client.on('download-progress', (event) => { /* ... */ });
client.on('download-completed', (event) => { /* ... */ });
client.on('download-failed', (event) => { /* ... */ });

// Custom events
client.on('custom-event', (data) => { /* ... */ });
```

### Authentication

```typescript
// API Key authentication
const client = new SemantestClient({
  serverUrl: 'wss://api.semantest.com',
  apiKey: 'your-api-key'
});

// Token authentication
const client = new SemantestClient({
  serverUrl: 'wss://api.semantest.com',
  headers: {
    'Authorization': 'Bearer your-token'
  }
});

// Custom authentication
client.on('authenticate', async () => {
  const token = await getAuthToken();
  return { token };
});
```