# API Reference Documentation

## Overview

This document provides comprehensive API reference documentation for the Semantest system, covering all core services, domain modules, and integration points.

## Core Error Handling API

### Error Types

#### `SemantestError`
Base error class for all Semantest-specific errors.

```typescript
class SemantestError extends Error {
  constructor(
    message: string,
    code: string,
    context?: any,
    correlationId?: string
  );
  
  readonly name: string;
  readonly code: string;
  readonly type: ErrorType;
  readonly statusCode: number;
  readonly context?: any;
  readonly correlationId?: string;
  recovered?: boolean;
}
```

#### `ValidationError`
Validation-specific error handling.

```typescript
class ValidationError extends SemantestError {
  constructor(message: string, code: string, context?: any, correlationId?: string);
  
  // Inherited properties
  readonly type: ErrorType.VALIDATION;
  readonly statusCode: 400;
}
```

#### `SecurityError`
Security-specific error handling.

```typescript
class SecurityError extends SemantestError {
  constructor(message: string, code: string, context?: any, correlationId?: string);
  
  // Inherited properties
  readonly type: ErrorType.SECURITY;
  readonly statusCode: 403;
}
```

#### `DownloadError`
Download-specific error handling.

```typescript
class DownloadError extends SemantestError {
  constructor(message: string, code: string, context?: any, correlationId?: string);
  
  // Inherited properties
  readonly type: ErrorType.DOWNLOAD;
  readonly statusCode: 502;
}
```

### Error Handler Service

#### `ErrorHandler`
Central error handling service.

```typescript
class ErrorHandler {
  constructor(
    config: ErrorHandlerConfig,
    logger: StructuredLogger,
    monitoringService: MonitoringService
  );
  
  async handle(error: SemantestError): Promise<void>;
  async handleAsync(error: SemantestError): Promise<void>;
  createError<T extends SemantestError>(
    errorClass: new (...args: any[]) => T,
    message: string,
    code: string,
    context?: any
  ): T;
}
```

#### `ErrorHandlerConfig`
Configuration interface for error handler.

```typescript
interface ErrorHandlerConfig {
  logErrors: boolean;
  includeStackTrace: boolean;
  sanitizeErrors: boolean;
  enablePerformanceMonitoring: boolean;
  alertThresholds: {
    critical: number;
    warning: number;
  };
}
```

## Monitoring & Logging API

### Structured Logger

#### `StructuredLogger`
Structured logging service.

```typescript
class StructuredLogger {
  constructor(config: StructuredLoggerConfig);
  
  log(level: LogLevel, message: string, context?: any): void;
  error(message: string, context?: any): void;
  warn(message: string, context?: any): void;
  info(message: string, context?: any): void;
  debug(message: string, context?: any): void;
  
  getLastLogEntry(): LogEntry;
  getLogEntries(): LogEntry[];
}
```

#### `StructuredLoggerConfig`
Configuration for structured logging.

```typescript
interface StructuredLoggerConfig {
  logLevel: LogLevel;
  enableCorrelationId: boolean;
  outputFormat: 'json' | 'text';
  enableTimestamp: boolean;
  enableStackTrace: boolean;
}
```

### Performance Metrics

#### `PerformanceMetrics`
Performance monitoring service.

```typescript
class PerformanceMetrics {
  constructor(config: PerformanceMetricsConfig);
  
  startTimer(name: string): PerformanceTimer;
  increment(name: string, labels?: Record<string, string>): void;
  gauge(name: string, value: number, labels?: Record<string, string>): void;
  histogram(name: string, value: number, labels?: Record<string, string>): void;
  
  async getMetrics(): Promise<Metric[]>;
  async getMetric(name: string): Promise<Metric | undefined>;
}
```

#### `PerformanceTimer`
Timer for performance measurements.

```typescript
class PerformanceTimer {
  stop(labels?: Record<string, string>): number;
  getDuration(): number;
}
```

### Real-time Alerting

#### `RealTimeAlerting`
Real-time alerting service.

```typescript
class RealTimeAlerting {
  constructor(config: RealTimeAlertingConfig);
  
  async addClient(client: WebSocket): Promise<void>;
  async removeClient(client: WebSocket): Promise<void>;
  async sendAlert(alert: Alert): Promise<void>;
  async getAlertHistory(): Promise<Alert[]>;
}
```

#### `Alert`
Alert data structure.

```typescript
interface Alert {
  type: 'alert' | 'alert_batch';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  correlationId?: string;
  metadata?: Record<string, any>;
}
```

## Domain Module APIs

### Google Images Module

#### `GoogleImagesDownloader`
Main service for Google Images downloads.

```typescript
class GoogleImagesDownloader {
  constructor(config: GoogleImagesConfig);
  
  async searchImages(query: string, options?: SearchOptions): Promise<ImageSearchResult[]>;
  async downloadImage(url: string, options?: DownloadOptions): Promise<DownloadResult>;
  async downloadBatch(urls: string[], options?: BatchDownloadOptions): Promise<BatchDownloadResult>;
}
```

#### `GoogleImagesConfig`
Configuration for Google Images module.

```typescript
interface GoogleImagesConfig {
  apiKey: string;
  searchEngine: string;
  downloadPath: string;
  maxRetries: number;
  timeout: number;
  enableRateLimit: boolean;
  rateLimitDelay: number;
}
```

### Browser Extension Module

#### `BrowserExtensionService`
Main service for browser extension functionality.

```typescript
class BrowserExtensionService {
  constructor(config: BrowserExtensionConfig);
  
  async injectScript(script: string): Promise<void>;
  async extractData(selector: string): Promise<any>;
  async waitForElement(selector: string, timeout?: number): Promise<Element>;
  async performAction(action: BrowserAction): Promise<ActionResult>;
}
```

#### `BrowserAction`
Browser action data structure.

```typescript
interface BrowserAction {
  type: 'click' | 'scroll' | 'input' | 'navigate';
  selector?: string;
  value?: string;
  url?: string;
  options?: ActionOptions;
}
```

### TypeScript Client Module

#### `TypeScriptClient`
Main client for TypeScript integration.

```typescript
class TypeScriptClient {
  constructor(config: TypeScriptClientConfig);
  
  async connect(): Promise<void>;
  async disconnect(): Promise<void>;
  async sendMessage(message: ClientMessage): Promise<ClientResponse>;
  async subscribe(event: string, handler: EventHandler): Promise<void>;
}
```

#### `ClientMessage`
Client message data structure.

```typescript
interface ClientMessage {
  type: string;
  payload: any;
  correlationId?: string;
  timestamp: number;
}
```

### Node.js Server Module

#### `NodeJSServer`
Main server implementation.

```typescript
class NodeJSServer {
  constructor(config: NodeJSServerConfig);
  
  async start(): Promise<void>;
  async stop(): Promise<void>;
  async registerRoute(route: RouteDefinition): Promise<void>;
  async registerMiddleware(middleware: MiddlewareFunction): Promise<void>;
}
```

#### `RouteDefinition`
Route definition data structure.

```typescript
interface RouteDefinition {
  method: HttpMethod;
  path: string;
  handler: RouteHandler;
  middleware?: MiddlewareFunction[];
  validation?: ValidationSchema;
}
```

## Integration APIs

### Health Check System

#### `HealthCheck`
Health monitoring service.

```typescript
class HealthCheck {
  constructor(config: HealthCheckConfig);
  
  async getStatus(): Promise<HealthStatus>;
  async registerCheck(name: string, check: HealthCheckFunction): Promise<void>;
  async removeCheck(name: string): Promise<void>;
}
```

#### `HealthStatus`
Health status data structure.

```typescript
interface HealthStatus {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  checks: Record<string, CheckStatus>;
  timestamp: string;
}
```

### Monitoring Service

#### `MonitoringService`
Comprehensive monitoring service.

```typescript
class MonitoringService {
  constructor(config: MonitoringServiceConfig);
  
  async getHealthStatus(): Promise<HealthStatus>;
  async getMetrics(): Promise<Metric[]>;
  async getAlerts(): Promise<Alert[]>;
  async startMonitoring(): Promise<void>;
  async stopMonitoring(): Promise<void>;
}
```

## Common Types and Interfaces

### Error Types

```typescript
enum ErrorType {
  VALIDATION = 'VALIDATION',
  SECURITY = 'SECURITY',
  NETWORK = 'NETWORK',
  DOWNLOAD = 'DOWNLOAD',
  BROWSER_AUTOMATION = 'BROWSER_AUTOMATION',
  EXTERNAL = 'EXTERNAL'
}
```

### Log Levels

```typescript
enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}
```

### HTTP Methods

```typescript
enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH'
}
```

### Metric Types

```typescript
interface Metric {
  name: string;
  type: 'counter' | 'gauge' | 'histogram';
  value: number;
  labels?: Record<string, string>;
  timestamp: number;
}
```

## Usage Examples

### Basic Error Handling

```typescript
import { ErrorHandler, ValidationError, StructuredLogger } from '@semantest/core';

// Initialize error handler
const logger = new StructuredLogger({ logLevel: LogLevel.INFO });
const errorHandler = new ErrorHandler(
  { logErrors: true, includeStackTrace: true },
  logger,
  monitoringService
);

// Handle validation error
try {
  // Some operation that might fail
  throw new ValidationError('Invalid input', 'VALIDATION_ERROR', { field: 'email' });
} catch (error) {
  await errorHandler.handle(error);
}
```

### Performance Monitoring

```typescript
import { PerformanceMetrics } from '@semantest/core';

// Initialize performance metrics
const metrics = new PerformanceMetrics({
  exportFormat: 'prometheus',
  metricsPrefix: 'semantest_'
});

// Measure operation performance
const timer = metrics.startTimer('operation_duration');
try {
  // Perform operation
  await someOperation();
} finally {
  timer.stop({ operation: 'example' });
}
```

### Real-time Alerting

```typescript
import { RealTimeAlerting } from '@semantest/core';

// Initialize alerting
const alerting = new RealTimeAlerting({
  webSocketPort: 8080,
  enableRealTimeAlerts: true
});

// Send alert
await alerting.sendAlert({
  type: 'alert',
  severity: 'warning',
  title: 'Performance Degradation',
  message: 'Response time increased by 50%',
  timestamp: new Date().toISOString()
});
```

## Error Codes Reference

### Validation Errors (400)
- `VALIDATION_ERROR`: General validation failure
- `REQUIRED_FIELD_MISSING`: Required field is missing
- `INVALID_FORMAT`: Invalid data format
- `VALUE_OUT_OF_RANGE`: Value outside acceptable range

### Security Errors (403)
- `UNAUTHORIZED_ACCESS`: Unauthorized access attempt
- `INVALID_TOKEN`: Invalid authentication token
- `PERMISSION_DENIED`: Insufficient permissions
- `RATE_LIMIT_EXCEEDED`: Rate limit exceeded

### Network Errors (503)
- `CONNECTION_TIMEOUT`: Connection timeout
- `CONNECTION_REFUSED`: Connection refused
- `NETWORK_UNREACHABLE`: Network unreachable
- `DNS_RESOLUTION_FAILED`: DNS resolution failed

### Download Errors (502)
- `DOWNLOAD_FAILED`: General download failure
- `INVALID_URL`: Invalid download URL
- `FILE_TOO_LARGE`: File size exceeds limit
- `UNSUPPORTED_FORMAT`: Unsupported file format

### Browser Automation Errors (500)
- `ELEMENT_NOT_FOUND`: Element not found
- `PAGE_LOAD_TIMEOUT`: Page load timeout
- `SCRIPT_INJECTION_FAILED`: Script injection failed
- `BROWSER_CRASH`: Browser process crashed

### External Service Errors (502)
- `EXTERNAL_API_ERROR`: External API error
- `SERVICE_UNAVAILABLE`: Service temporarily unavailable
- `DATABASE_CONNECTION_FAILED`: Database connection failed
- `CACHE_MISS`: Cache miss error

## Best Practices

### Error Handling
1. Always use specific error types
2. Include meaningful context information
3. Use correlation IDs for tracking
4. Log errors with structured format
5. Monitor error rates and patterns

### Performance Monitoring
1. Measure critical path operations
2. Set appropriate alert thresholds
3. Use labels for metric categorization
4. Monitor both success and failure metrics
5. Track resource usage patterns

### Health Checks
1. Implement comprehensive health checks
2. Include dependency status
3. Use appropriate check intervals
4. Provide actionable health information
5. Monitor check performance

### Security
1. Sanitize error messages in production
2. Implement rate limiting
3. Use secure communication protocols
4. Validate all input data
5. Monitor security events

---

**Version**: 1.0.0  
**Last Updated**: January 18, 2025  
**Maintainer**: Semantest Architecture Team