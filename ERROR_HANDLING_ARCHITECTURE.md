# Semantest Error Handling Architecture

This document defines the error handling patterns and hierarchies for the Semantest Domain-Driven Design architecture.

## Table of Contents

1. [Core Error Philosophy](#core-error-philosophy)
2. [Error Hierarchy](#error-hierarchy)
3. [Domain-Specific Errors](#domain-specific-errors)
4. [Error Recovery Strategies](#error-recovery-strategies)
5. [Implementation Guidelines](#implementation-guidelines)
6. [Testing Error Scenarios](#testing-error-scenarios)

## Core Error Philosophy

### Principles

1. **Explicit Over Implicit**: All errors must be explicitly typed and handled
2. **Domain Awareness**: Errors should reflect domain concepts and business rules
3. **Recovery-Oriented**: Every error should have a defined recovery strategy
4. **Context-Rich**: Errors must carry sufficient context for debugging and recovery
5. **User-Friendly**: Technical errors must be translated to user-understandable messages

### Error Categories

```typescript
// Error severity levels
enum ErrorSeverity {
  Critical = 'CRITICAL',    // System failure, immediate attention required
  High = 'HIGH',           // Operation failed, user action blocked
  Medium = 'MEDIUM',       // Degraded functionality, workaround available
  Low = 'LOW',            // Minor issue, does not block user
  Info = 'INFO'           // Informational, no action required
}

// Error categories for monitoring and alerting
enum ErrorCategory {
  Domain = 'DOMAIN',           // Business rule violations
  Infrastructure = 'INFRA',    // External service failures
  Validation = 'VALIDATION',   // Input validation failures
  Authorization = 'AUTH',      // Permission/auth failures
  Integration = 'INTEGRATION', // Third-party integration issues
  System = 'SYSTEM'           // Internal system errors
}
```

## Error Hierarchy

### Base Error Classes

```typescript
// @semantest/core/errors/base.error.ts
export abstract class BaseError extends Error {
  public readonly timestamp: Date = new Date();
  public readonly correlationId: string;
  
  constructor(
    message: string,
    public readonly code: string,
    public readonly severity: ErrorSeverity,
    public readonly category: ErrorCategory,
    public readonly context?: Record<string, any>,
    correlationId?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    this.correlationId = correlationId || generateCorrelationId();
    Error.captureStackTrace(this, this.constructor);
  }

  abstract get httpStatusCode(): number;
  abstract get userMessage(): string;
  abstract get recoveryStrategy(): ErrorRecoveryStrategy;

  toJSON(): ErrorDto {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      userMessage: this.userMessage,
      severity: this.severity,
      category: this.category,
      timestamp: this.timestamp.toISOString(),
      correlationId: this.correlationId,
      context: this.context,
      stack: this.stack
    };
  }
}

// Domain-specific base error
export abstract class DomainError extends BaseError {
  constructor(
    message: string,
    code: string,
    severity: ErrorSeverity = ErrorSeverity.High,
    context?: Record<string, any>,
    correlationId?: string
  ) {
    super(message, code, severity, ErrorCategory.Domain, context, correlationId);
  }

  get httpStatusCode(): number {
    return 400; // Bad Request by default for domain errors
  }
}

// Infrastructure error base
export abstract class InfrastructureError extends BaseError {
  constructor(
    message: string,
    code: string,
    public readonly isTransient: boolean,
    severity: ErrorSeverity = ErrorSeverity.High,
    context?: Record<string, any>,
    correlationId?: string
  ) {
    super(message, code, severity, ErrorCategory.Infrastructure, context, correlationId);
  }

  get httpStatusCode(): number {
    return this.isTransient ? 503 : 500; // Service Unavailable for transient
  }
}
```

### Validation Errors

```typescript
// @semantest/core/errors/validation.error.ts
export class ValidationError extends BaseError {
  constructor(
    message: string,
    public readonly field: string,
    public readonly value: any,
    public readonly constraints: Record<string, any>,
    correlationId?: string
  ) {
    super(
      message,
      'VALIDATION_ERROR',
      ErrorSeverity.Medium,
      ErrorCategory.Validation,
      { field, value, constraints },
      correlationId
    );
  }

  get httpStatusCode(): number {
    return 400;
  }

  get userMessage(): string {
    return `Invalid value for ${this.field}: ${this.message}`;
  }

  get recoveryStrategy(): ErrorRecoveryStrategy {
    return {
      type: RecoveryType.UserCorrection,
      actions: ['Review input requirements', 'Correct the invalid value'],
      retryable: false
    };
  }
}

// Aggregate validation error for multiple fields
export class AggregateValidationError extends BaseError {
  constructor(
    public readonly errors: ValidationError[],
    correlationId?: string
  ) {
    super(
      'Multiple validation errors occurred',
      'AGGREGATE_VALIDATION_ERROR',
      ErrorSeverity.Medium,
      ErrorCategory.Validation,
      { errorCount: errors.length },
      correlationId
    );
  }

  get httpStatusCode(): number {
    return 400;
  }

  get userMessage(): string {
    return `Please correct ${this.errors.length} validation error(s)`;
  }

  get recoveryStrategy(): ErrorRecoveryStrategy {
    return {
      type: RecoveryType.UserCorrection,
      actions: ['Review all validation errors', 'Correct invalid values'],
      retryable: false
    };
  }

  toJSON(): ErrorDto {
    const base = super.toJSON();
    return {
      ...base,
      errors: this.errors.map(e => e.toJSON())
    };
  }
}
```

## Domain-Specific Errors

### Google Images Domain Errors

```typescript
// @semantest/images.google.com/domain/errors/index.ts
export class ImageNotFoundError extends DomainError {
  constructor(
    public readonly imageUrl: string,
    correlationId?: string
  ) {
    super(
      `Image not found at URL: ${imageUrl}`,
      'IMAGE_NOT_FOUND',
      ErrorSeverity.Medium,
      { imageUrl },
      correlationId
    );
  }

  get userMessage(): string {
    return 'The requested image could not be found. It may have been removed or the link may be broken.';
  }

  get recoveryStrategy(): ErrorRecoveryStrategy {
    return {
      type: RecoveryType.Automatic,
      actions: ['Try alternative image source', 'Search for similar images'],
      retryable: false,
      fallbackAction: 'Use placeholder image'
    };
  }
}

export class ImageDownloadQuotaExceededError extends DomainError {
  constructor(
    public readonly quota: number,
    public readonly used: number,
    public readonly resetTime: Date,
    correlationId?: string
  ) {
    super(
      `Download quota exceeded: ${used}/${quota}`,
      'DOWNLOAD_QUOTA_EXCEEDED',
      ErrorSeverity.High,
      { quota, used, resetTime },
      correlationId
    );
  }

  get userMessage(): string {
    const timeUntilReset = this.resetTime.getTime() - Date.now();
    const minutes = Math.ceil(timeUntilReset / 60000);
    return `You have reached your download limit. Please try again in ${minutes} minutes.`;
  }

  get recoveryStrategy(): ErrorRecoveryStrategy {
    return {
      type: RecoveryType.Scheduled,
      actions: ['Queue download for later', 'Notify user when quota resets'],
      retryable: true,
      retryAfter: this.resetTime,
      fallbackAction: 'Add to download queue'
    };
  }
}

export class UnsupportedImageFormatError extends DomainError {
  constructor(
    public readonly format: string,
    public readonly supportedFormats: string[],
    correlationId?: string
  ) {
    super(
      `Unsupported image format: ${format}`,
      'UNSUPPORTED_IMAGE_FORMAT',
      ErrorSeverity.Medium,
      { format, supportedFormats },
      correlationId
    );
  }

  get userMessage(): string {
    return `The image format "${this.format}" is not supported. Supported formats: ${this.supportedFormats.join(', ')}`;
  }

  get recoveryStrategy(): ErrorRecoveryStrategy {
    return {
      type: RecoveryType.Automatic,
      actions: ['Convert image to supported format', 'Find alternative image'],
      retryable: false,
      fallbackAction: 'Convert to JPEG'
    };
  }
}
```

### ChatGPT Domain Errors

```typescript
// @semantest/chatgpt.com/domain/errors/index.ts
export class ConversationNotFoundError extends DomainError {
  constructor(
    public readonly conversationId: string,
    correlationId?: string
  ) {
    super(
      `Conversation not found: ${conversationId}`,
      'CONVERSATION_NOT_FOUND',
      ErrorSeverity.Medium,
      { conversationId },
      correlationId
    );
  }

  get httpStatusCode(): number {
    return 404;
  }

  get userMessage(): string {
    return 'The conversation you requested could not be found. It may have been deleted.';
  }

  get recoveryStrategy(): ErrorRecoveryStrategy {
    return {
      type: RecoveryType.UserGuidance,
      actions: ['Return to conversation list', 'Start a new conversation'],
      retryable: false
    };
  }
}

export class RateLimitExceededError extends DomainError {
  constructor(
    public readonly limit: number,
    public readonly window: string,
    public readonly resetAt: Date,
    correlationId?: string
  ) {
    super(
      `Rate limit exceeded: ${limit} requests per ${window}`,
      'RATE_LIMIT_EXCEEDED',
      ErrorSeverity.High,
      { limit, window, resetAt },
      correlationId
    );
  }

  get httpStatusCode(): number {
    return 429;
  }

  get userMessage(): string {
    const waitTime = Math.ceil((this.resetAt.getTime() - Date.now()) / 1000);
    return `Too many requests. Please wait ${waitTime} seconds before trying again.`;
  }

  get recoveryStrategy(): ErrorRecoveryStrategy {
    return {
      type: RecoveryType.Scheduled,
      actions: ['Queue request', 'Implement exponential backoff'],
      retryable: true,
      retryAfter: this.resetAt,
      maxRetries: 3
    };
  }
}
```

### Browser Automation Errors

```typescript
// @semantest/browser/errors/index.ts
export class ElementNotFoundError extends InfrastructureError {
  constructor(
    public readonly selector: string,
    public readonly timeout: number,
    correlationId?: string
  ) {
    super(
      `Element not found: ${selector} (timeout: ${timeout}ms)`,
      'ELEMENT_NOT_FOUND',
      false, // Not transient - element genuinely missing
      ErrorSeverity.High,
      { selector, timeout },
      correlationId
    );
  }

  get userMessage(): string {
    return 'The page element could not be found. The website structure may have changed.';
  }

  get recoveryStrategy(): ErrorRecoveryStrategy {
    return {
      type: RecoveryType.Automatic,
      actions: [
        'Try alternative selectors',
        'Update selector patterns',
        'Notify about website changes'
      ],
      retryable: true,
      maxRetries: 2,
      fallbackAction: 'Use fallback selector strategy'
    };
  }
}

export class BrowserCrashError extends InfrastructureError {
  constructor(
    public readonly browserType: string,
    public readonly lastAction: string,
    correlationId?: string
  ) {
    super(
      `Browser crashed during: ${lastAction}`,
      'BROWSER_CRASH',
      true, // Transient - can retry with new instance
      ErrorSeverity.Critical,
      { browserType, lastAction },
      correlationId
    );
  }

  get userMessage(): string {
    return 'The browser unexpectedly closed. Attempting to restart...';
  }

  get recoveryStrategy(): ErrorRecoveryStrategy {
    return {
      type: RecoveryType.Automatic,
      actions: [
        'Clean up crashed browser process',
        'Start new browser instance',
        'Restore session state',
        'Retry last action'
      ],
      retryable: true,
      maxRetries: 3,
      backoffMultiplier: 2
    };
  }
}
```

## Error Recovery Strategies

### Recovery Types

```typescript
enum RecoveryType {
  Automatic = 'AUTOMATIC',         // System can recover without user intervention
  UserCorrection = 'USER_CORRECTION', // User must fix input
  UserGuidance = 'USER_GUIDANCE',    // Guide user to alternative action
  Scheduled = 'SCHEDULED',           // Retry after specific time
  Escalation = 'ESCALATION',         // Escalate to admin/support
  Compensation = 'COMPENSATION'       // Execute compensating transaction
}

interface ErrorRecoveryStrategy {
  type: RecoveryType;
  actions: string[];
  retryable: boolean;
  maxRetries?: number;
  retryAfter?: Date;
  backoffMultiplier?: number;
  fallbackAction?: string;
  compensationHandler?: () => Promise<void>;
}
```

### Recovery Strategy Patterns

#### 1. Automatic Recovery with Circuit Breaker

```typescript
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime?: Date;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private readonly threshold: number = 5,
    private readonly timeout: number = 60000, // 1 minute
    private readonly resetTimeout: number = 30000 // 30 seconds
  ) {}

  async execute<T>(
    operation: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime!.getTime() > this.timeout) {
        this.state = 'HALF_OPEN';
      } else if (fallback) {
        return fallback();
      } else {
        throw new CircuitBreakerOpenError();
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = new Date();
    
    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
    }
  }
}
```

#### 2. Retry with Exponential Backoff

```typescript
export class RetryHandler {
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    strategy: ErrorRecoveryStrategy
  ): Promise<T> {
    let lastError: Error;
    const maxRetries = strategy.maxRetries || 3;
    const backoffMultiplier = strategy.backoffMultiplier || 2;
    let delay = 1000; // Start with 1 second

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (!strategy.retryable || attempt === maxRetries) {
          throw error;
        }

        // Check if error is retryable
        if (error instanceof BaseError && !this.isRetryable(error)) {
          throw error;
        }

        // Wait before retrying
        await this.delay(delay);
        delay *= backoffMultiplier;
        
        // Log retry attempt
        logger.warn('Retrying operation', {
          attempt: attempt + 1,
          maxRetries,
          delay,
          error: lastError.message
        });
      }
    }

    throw lastError!;
  }

  private isRetryable(error: BaseError): boolean {
    // Don't retry validation errors or auth errors
    if (error.category === ErrorCategory.Validation || 
        error.category === ErrorCategory.Authorization) {
      return false;
    }

    // Retry infrastructure errors if they're transient
    if (error instanceof InfrastructureError) {
      return error.isTransient;
    }

    // Check specific recovery strategy
    return error.recoveryStrategy.retryable;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

#### 3. Saga Pattern for Compensation

```typescript
export class SagaOrchestrator {
  private steps: SagaStep[] = [];
  private completedSteps: SagaStep[] = [];

  addStep(step: SagaStep): void {
    this.steps.push(step);
  }

  async execute(): Promise<void> {
    for (const step of this.steps) {
      try {
        await step.execute();
        this.completedSteps.push(step);
      } catch (error) {
        // Compensate in reverse order
        await this.compensate();
        throw new SagaFailedError(step.name, error as Error);
      }
    }
  }

  private async compensate(): Promise<void> {
    for (const step of this.completedSteps.reverse()) {
      try {
        if (step.compensate) {
          await step.compensate();
        }
      } catch (compensationError) {
        // Log but continue compensation
        logger.error('Compensation failed', {
          step: step.name,
          error: compensationError
        });
      }
    }
  }
}

interface SagaStep {
  name: string;
  execute: () => Promise<void>;
  compensate?: () => Promise<void>;
}
```

## Implementation Guidelines

### Error Handling in Domain Services

```typescript
export class ImageDownloadService {
  constructor(
    private readonly imageRepository: IImageRepository,
    private readonly downloadAdapter: IDownloadAdapter,
    private readonly circuitBreaker: CircuitBreaker,
    private readonly retryHandler: RetryHandler
  ) {}

  async downloadImage(url: string): Promise<Result<Image, BaseError>> {
    try {
      // Validate URL
      const urlValidation = this.validateImageUrl(url);
      if (urlValidation.isFailure()) {
        return Result.fail(urlValidation.getError());
      }

      // Check quota
      const quotaCheck = await this.checkDownloadQuota();
      if (quotaCheck.isFailure()) {
        return Result.fail(quotaCheck.getError());
      }

      // Download with circuit breaker and retry
      const image = await this.circuitBreaker.execute(
        async () => {
          return await this.retryHandler.executeWithRetry(
            () => this.downloadAdapter.download(url),
            {
              type: RecoveryType.Automatic,
              actions: ['Retry download'],
              retryable: true,
              maxRetries: 3,
              backoffMultiplier: 2
            }
          );
        },
        async () => {
          // Fallback: try mirror URL
          const mirrorUrl = await this.findMirrorUrl(url);
          return this.downloadAdapter.download(mirrorUrl);
        }
      );

      // Save to repository
      await this.imageRepository.save(image);
      
      return Result.ok(image);
      
    } catch (error) {
      // Transform to domain error
      const domainError = this.mapToDomainError(error as Error);
      
      // Log with full context
      logger.error('Image download failed', {
        url,
        error: domainError.toJSON(),
        correlationId: domainError.correlationId
      });
      
      return Result.fail(domainError);
    }
  }

  private mapToDomainError(error: Error): BaseError {
    // Map known errors
    if (error.message.includes('404')) {
      return new ImageNotFoundError(error.message);
    }
    
    if (error.message.includes('timeout')) {
      return new NetworkTimeoutError(
        'Download timeout',
        30000,
        true // transient
      );
    }
    
    // Unknown errors become system errors
    return new SystemError(
      error.message,
      'UNKNOWN_ERROR',
      ErrorSeverity.High,
      { originalError: error.message }
    );
  }
}
```

### Error Handling in Application Layer

```typescript
export class DownloadImageCommandHandler {
  constructor(
    private readonly downloadService: ImageDownloadService,
    private readonly eventBus: IEventBus
  ) {}

  async handle(command: DownloadImageCommand): Promise<void> {
    const result = await this.downloadService.downloadImage(command.url);
    
    if (result.isSuccess()) {
      await this.eventBus.publish(
        new ImageDownloadedEvent(
          result.getValue().id,
          command.url,
          command.correlationId
        )
      );
    } else {
      const error = result.getError();
      
      // Publish failure event
      await this.eventBus.publish(
        new ImageDownloadFailedEvent(
          command.url,
          error.code,
          error.message,
          command.correlationId
        )
      );
      
      // Handle based on recovery strategy
      await this.handleErrorRecovery(error, command);
    }
  }

  private async handleErrorRecovery(
    error: BaseError,
    command: DownloadImageCommand
  ): Promise<void> {
    const strategy = error.recoveryStrategy;
    
    switch (strategy.type) {
      case RecoveryType.Scheduled:
        // Schedule retry
        await this.scheduleRetry(command, strategy.retryAfter!);
        break;
        
      case RecoveryType.UserGuidance:
        // Notify user with guidance
        await this.notifyUser(error.userMessage, strategy.actions);
        break;
        
      case RecoveryType.Compensation:
        // Execute compensation
        if (strategy.compensationHandler) {
          await strategy.compensationHandler();
        }
        break;
        
      default:
        // Log unhandled recovery type
        logger.warn('Unhandled recovery type', {
          type: strategy.type,
          error: error.code
        });
    }
  }
}
```

### Error Handling in Infrastructure Layer

```typescript
export class HttpImageDownloadAdapter implements IDownloadAdapter {
  async download(url: string): Promise<Image> {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 30000,
        maxRedirects: 3
      });
      
      // Validate response
      if (!this.isValidImageResponse(response)) {
        throw new InvalidImageResponseError(url, response.status);
      }
      
      return this.createImageFromResponse(response);
      
    } catch (error) {
      // Map HTTP errors to infrastructure errors
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new NetworkTimeoutError(
            `Download timeout for ${url}`,
            30000,
            true
          );
        }
        
        if (error.response?.status === 404) {
          throw new ResourceNotFoundError(url);
        }
        
        if (error.response?.status === 429) {
          const retryAfter = this.parseRetryAfter(error.response.headers);
          throw new RateLimitError(url, retryAfter);
        }
      }
      
      // Re-throw unknown errors
      throw error;
    }
  }
}
```

## Testing Error Scenarios

### Unit Testing Errors

```typescript
describe('ImageDownloadService', () => {
  describe('downloadImage', () => {
    it('should handle quota exceeded error', async () => {
      // Arrange
      const quotaChecker = {
        checkQuota: jest.fn().mockResolvedValue(
          Result.fail(new ImageDownloadQuotaExceededError(
            100, 100, new Date(Date.now() + 3600000)
          ))
        )
      };
      
      const service = new ImageDownloadService(
        imageRepository,
        downloadAdapter,
        circuitBreaker,
        retryHandler,
        quotaChecker
      );
      
      // Act
      const result = await service.downloadImage('http://example.com/image.jpg');
      
      // Assert
      expect(result.isFailure()).toBe(true);
      expect(result.getError()).toBeInstanceOf(ImageDownloadQuotaExceededError);
      expect(result.getError().recoveryStrategy.type).toBe(RecoveryType.Scheduled);
    });
    
    it('should retry transient errors with backoff', async () => {
      // Arrange
      let attempts = 0;
      downloadAdapter.download.mockImplementation(async () => {
        attempts++;
        if (attempts < 3) {
          throw new NetworkTimeoutError('Timeout', 5000, true);
        }
        return mockImage;
      });
      
      // Act
      const result = await service.downloadImage('http://example.com/image.jpg');
      
      // Assert
      expect(result.isSuccess()).toBe(true);
      expect(downloadAdapter.download).toHaveBeenCalledTimes(3);
    });
    
    it('should not retry non-transient errors', async () => {
      // Arrange
      downloadAdapter.download.mockRejectedValue(
        new ValidationError('Invalid URL format', 'url', 'not-a-url', {})
      );
      
      // Act
      const result = await service.downloadImage('not-a-url');
      
      // Assert
      expect(result.isFailure()).toBe(true);
      expect(downloadAdapter.download).toHaveBeenCalledTimes(1);
    });
  });
});
```

### Integration Testing Error Recovery

```typescript
describe('Error Recovery Integration', () => {
  it('should recover from browser crash', async () => {
    // Arrange
    const automationService = new BrowserAutomationService();
    let crashSimulated = false;
    
    // Simulate browser crash on first attempt
    jest.spyOn(browser, 'newPage').mockImplementation(async () => {
      if (!crashSimulated) {
        crashSimulated = true;
        throw new BrowserCrashError('chrome', 'navigate');
      }
      return mockPage;
    });
    
    // Act
    const result = await automationService.navigateAndExtract('http://example.com');
    
    // Assert
    expect(result.isSuccess()).toBe(true);
    expect(browser.newPage).toHaveBeenCalledTimes(2);
  });
  
  it('should execute saga compensation on failure', async () => {
    // Arrange
    const saga = new OrderProcessingSaga();
    const compensationSpy = jest.fn();
    
    saga.addStep({
      name: 'reserve-inventory',
      execute: async () => { /* success */ },
      compensate: compensationSpy
    });
    
    saga.addStep({
      name: 'charge-payment',
      execute: async () => { throw new PaymentFailedError(); },
      compensate: jest.fn()
    });
    
    // Act & Assert
    await expect(saga.execute()).rejects.toThrow(SagaFailedError);
    expect(compensationSpy).toHaveBeenCalled();
  });
});
```

## Error Monitoring and Alerting

### Error Tracking

```typescript
export class ErrorTracker {
  private readonly errorCounts = new Map<string, ErrorMetrics>();
  
  track(error: BaseError): void {
    const key = `${error.category}:${error.code}`;
    const metrics = this.errorCounts.get(key) || {
      count: 0,
      lastOccurrence: new Date(),
      severityCounts: {}
    };
    
    metrics.count++;
    metrics.lastOccurrence = new Date();
    metrics.severityCounts[error.severity] = 
      (metrics.severityCounts[error.severity] || 0) + 1;
    
    this.errorCounts.set(key, metrics);
    
    // Check thresholds
    this.checkAlertThresholds(error, metrics);
  }
  
  private checkAlertThresholds(error: BaseError, metrics: ErrorMetrics): void {
    // Alert on critical errors immediately
    if (error.severity === ErrorSeverity.Critical) {
      this.sendAlert(AlertLevel.Critical, error);
    }
    
    // Alert on high error rates
    if (metrics.count > 100 && this.isWithinTimeWindow(metrics.lastOccurrence, 5)) {
      this.sendAlert(AlertLevel.High, error, metrics);
    }
  }
}
```

## Summary

This error handling architecture provides:

1. **Comprehensive Error Hierarchy**: Domain-specific errors with clear inheritance
2. **Rich Context**: Every error carries sufficient debugging information
3. **Recovery Strategies**: Defined patterns for automatic and manual recovery
4. **User-Friendly Messages**: Technical errors translated for users
5. **Testing Support**: Patterns for testing error scenarios
6. **Monitoring Integration**: Built-in support for error tracking and alerting

The architecture ensures that errors are not just caught but actively managed, with clear recovery paths and user communication strategies.