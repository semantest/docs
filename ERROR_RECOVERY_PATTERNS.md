# Semantest Error Recovery Patterns

This document provides detailed patterns and strategies for error recovery in the Semantest DDD architecture.

## Recovery Strategy Decision Matrix

| Error Type | Severity | Recovery Type | User Impact | Example |
|------------|----------|---------------|-------------|---------|
| Validation | Low-Medium | User Correction | Blocked until fixed | Invalid email format |
| Domain Rule | Medium-High | User Guidance | Alternative action needed | Quota exceeded |
| Transient Network | Medium | Automatic Retry | Temporary delay | Timeout |
| Resource Not Found | Medium | Fallback/Alternative | Degraded experience | Missing image |
| Authentication | High | Re-authenticate | Session restart | Token expired |
| Rate Limit | High | Scheduled Retry | Delayed operation | API limit hit |
| System Failure | Critical | Circuit Breaker | Service degradation | Database down |
| Data Corruption | Critical | Compensation | Rollback required | Invalid state |

## Detailed Recovery Patterns

### 1. Resilient Download Pattern

```typescript
export class ResilientDownloadManager {
  private readonly strategies: DownloadStrategy[] = [
    new DirectDownloadStrategy(),
    new MirrorDownloadStrategy(),
    new CachedDownloadStrategy(),
    new PlaceholderStrategy()
  ];

  async download(request: DownloadRequest): Promise<DownloadResult> {
    const context = new DownloadContext(request);
    
    for (const strategy of this.strategies) {
      try {
        // Check if strategy is applicable
        if (!await strategy.canHandle(context)) {
          continue;
        }
        
        // Attempt download with timeout
        const result = await this.withTimeout(
          strategy.execute(context),
          context.timeout
        );
        
        // Validate result
        if (this.isValidResult(result)) {
          await this.recordSuccess(strategy, context);
          return result;
        }
        
      } catch (error) {
        await this.recordFailure(strategy, context, error as Error);
        
        // Check if we should continue with next strategy
        if (!this.shouldContinue(error as Error)) {
          throw error;
        }
      }
    }
    
    // All strategies failed
    throw new AllStrategiesFailedError(
      context.request.url,
      this.strategies.map(s => s.name)
    );
  }

  private async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new TimeoutError(timeoutMs)), timeoutMs);
    });
    
    return Promise.race([promise, timeout]);
  }

  private shouldContinue(error: Error): boolean {
    // Don't continue on critical errors
    if (error instanceof CriticalError) {
      return false;
    }
    
    // Don't continue on non-retryable errors
    if (error instanceof BaseError && !error.recoveryStrategy.retryable) {
      return false;
    }
    
    return true;
  }
}

// Strategy implementations
class DirectDownloadStrategy implements DownloadStrategy {
  name = 'direct';
  
  async canHandle(context: DownloadContext): boolean {
    // Always try direct download first
    return true;
  }
  
  async execute(context: DownloadContext): Promise<DownloadResult> {
    const response = await fetch(context.request.url);
    
    if (!response.ok) {
      throw new DownloadFailedError(
        context.request.url,
        response.status,
        response.statusText
      );
    }
    
    return {
      data: await response.blob(),
      source: 'direct',
      cached: false
    };
  }
}

class MirrorDownloadStrategy implements DownloadStrategy {
  name = 'mirror';
  
  constructor(private mirrorService: MirrorService) {}
  
  async canHandle(context: DownloadContext): boolean {
    // Only if mirrors are available
    return await this.mirrorService.hasMirrors(context.request.url);
  }
  
  async execute(context: DownloadContext): Promise<DownloadResult> {
    const mirrors = await this.mirrorService.getMirrors(context.request.url);
    
    for (const mirrorUrl of mirrors) {
      try {
        const response = await fetch(mirrorUrl);
        if (response.ok) {
          return {
            data: await response.blob(),
            source: 'mirror',
            cached: false,
            mirrorUrl
          };
        }
      } catch (error) {
        // Try next mirror
        continue;
      }
    }
    
    throw new NoWorkingMirrorsError(context.request.url);
  }
}
```

### 2. Intelligent Retry Pattern

```typescript
export class IntelligentRetryManager {
  private readonly retryPolicies = new Map<string, RetryPolicy>();
  
  constructor() {
    // Register default policies
    this.registerPolicy('network', new NetworkRetryPolicy());
    this.registerPolicy('rate-limit', new RateLimitRetryPolicy());
    this.registerPolicy('server-error', new ServerErrorRetryPolicy());
  }
  
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    errorClassifier: (error: Error) => string | null
  ): Promise<T> {
    let lastError: Error;
    let attemptCount = 0;
    
    while (true) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        attemptCount++;
        
        // Classify error and get appropriate policy
        const errorType = errorClassifier(lastError);
        if (!errorType) {
          throw lastError; // Unretryable error
        }
        
        const policy = this.retryPolicies.get(errorType);
        if (!policy) {
          throw lastError; // No policy for this error type
        }
        
        // Check if we should retry
        const decision = await policy.shouldRetry(
          lastError,
          attemptCount
        );
        
        if (!decision.retry) {
          throw lastError;
        }
        
        // Wait before retrying
        await this.delay(decision.delayMs);
        
        // Execute pre-retry actions
        if (decision.preRetryAction) {
          await decision.preRetryAction();
        }
      }
    }
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Retry policies
class NetworkRetryPolicy implements RetryPolicy {
  async shouldRetry(
    error: Error,
    attemptCount: number
  ): Promise<RetryDecision> {
    // Max 3 retries for network errors
    if (attemptCount >= 3) {
      return { retry: false };
    }
    
    // Exponential backoff with jitter
    const baseDelay = Math.pow(2, attemptCount) * 1000;
    const jitter = Math.random() * 1000;
    
    return {
      retry: true,
      delayMs: baseDelay + jitter,
      preRetryAction: async () => {
        // Check network connectivity
        await this.checkConnectivity();
      }
    };
  }
  
  private async checkConnectivity(): Promise<void> {
    try {
      await fetch('https://www.google.com/favicon.ico', { mode: 'no-cors' });
    } catch {
      throw new NoInternetConnectionError();
    }
  }
}

class RateLimitRetryPolicy implements RetryPolicy {
  async shouldRetry(
    error: Error,
    attemptCount: number
  ): Promise<RetryDecision> {
    if (!(error instanceof RateLimitError)) {
      return { retry: false };
    }
    
    // Respect retry-after header
    const delayMs = error.retryAfter 
      ? error.retryAfter.getTime() - Date.now()
      : 60000; // Default 1 minute
    
    return {
      retry: attemptCount === 1, // Only retry once for rate limits
      delayMs,
      preRetryAction: async () => {
        // Could implement token bucket refill check here
        logger.info('Waiting for rate limit reset', { delayMs });
      }
    };
  }
}
```

### 3. Graceful Degradation Pattern

```typescript
export class GracefulDegradationService {
  private readonly featureFlags: FeatureFlags;
  private readonly healthMonitor: HealthMonitor;
  
  async executeWithDegradation<T>(
    primaryOperation: () => Promise<T>,
    degradationLevels: DegradationLevel<T>[]
  ): Promise<DegradationResult<T>> {
    // Try primary operation first
    try {
      const result = await primaryOperation();
      return {
        result,
        degradationLevel: 0,
        degraded: false
      };
    } catch (primaryError) {
      logger.warn('Primary operation failed, attempting degradation', {
        error: primaryError
      });
    }
    
    // Try each degradation level
    for (let level = 0; level < degradationLevels.length; level++) {
      const degradation = degradationLevels[level];
      
      // Check if this degradation is available
      if (!await this.canDegrade(degradation)) {
        continue;
      }
      
      try {
        const result = await degradation.operation();
        
        // Notify about degradation
        await this.notifyDegradation(degradation, level + 1);
        
        return {
          result,
          degradationLevel: level + 1,
          degraded: true,
          degradationType: degradation.type
        };
      } catch (degradationError) {
        logger.warn(`Degradation level ${level + 1} failed`, {
          type: degradation.type,
          error: degradationError
        });
      }
    }
    
    // All levels failed
    throw new ServiceUnavailableError(
      'All service levels failed',
      degradationLevels.map(d => d.type)
    );
  }
  
  private async canDegrade(degradation: DegradationLevel<any>): boolean {
    // Check feature flags
    if (degradation.featureFlag && 
        !await this.featureFlags.isEnabled(degradation.featureFlag)) {
      return false;
    }
    
    // Check health requirements
    if (degradation.healthRequirements) {
      const health = await this.healthMonitor.checkHealth(
        degradation.healthRequirements
      );
      return health.isHealthy;
    }
    
    return true;
  }
}

// Example usage for image service
class ImageService {
  constructor(
    private degradationService: GracefulDegradationService,
    private imageProviders: ImageProviders
  ) {}
  
  async getImage(imageId: string): Promise<Image> {
    const result = await this.degradationService.executeWithDegradation(
      // Primary: High-resolution from primary CDN
      () => this.imageProviders.primary.getHighRes(imageId),
      
      // Degradation levels
      [
        {
          type: 'secondary-cdn-highres',
          operation: () => this.imageProviders.secondary.getHighRes(imageId),
          featureFlag: 'use-secondary-cdn',
          userNotification: 'Using backup image source'
        },
        {
          type: 'primary-cdn-lowres',
          operation: () => this.imageProviders.primary.getLowRes(imageId),
          userNotification: 'Loading lower quality image'
        },
        {
          type: 'cached-version',
          operation: () => this.imageProviders.cache.get(imageId),
          healthRequirements: ['cache-service'],
          userNotification: 'Using cached version'
        },
        {
          type: 'placeholder',
          operation: () => this.imageProviders.getPlaceholder(imageId),
          userNotification: 'Image temporarily unavailable'
        }
      ]
    );
    
    // Log degradation metrics
    if (result.degraded) {
      metrics.increment('image.degradation', {
        level: result.degradationLevel,
        type: result.degradationType
      });
    }
    
    return result.result;
  }
}
```

### 4. Compensation Pattern (Saga)

```typescript
export class CompensationManager {
  async executeWithCompensation<T>(
    transaction: Transaction<T>
  ): Promise<T> {
    const executedSteps: ExecutedStep[] = [];
    
    try {
      // Execute forward steps
      for (const step of transaction.steps) {
        logger.info(`Executing step: ${step.name}`);
        
        const stepResult = await this.executeStep(step);
        executedSteps.push({
          step,
          result: stepResult,
          timestamp: new Date()
        });
        
        // Check if we should continue
        if (step.stopOnFailure && !stepResult.success) {
          throw new StepFailedError(step.name, stepResult.error);
        }
      }
      
      // All steps succeeded
      return this.aggregateResults<T>(executedSteps);
      
    } catch (error) {
      logger.error('Transaction failed, starting compensation', {
        error,
        executedSteps: executedSteps.length
      });
      
      // Execute compensation in reverse order
      await this.compensate(executedSteps);
      
      throw new TransactionFailedError(
        transaction.name,
        error as Error,
        executedSteps
      );
    }
  }
  
  private async compensate(executedSteps: ExecutedStep[]): Promise<void> {
    const errors: CompensationError[] = [];
    
    // Reverse order compensation
    for (const executedStep of executedSteps.reverse()) {
      if (!executedStep.step.compensate) {
        continue;
      }
      
      try {
        logger.info(`Compensating step: ${executedStep.step.name}`);
        
        await executedStep.step.compensate(executedStep.result);
        
      } catch (compensationError) {
        // Log but continue compensation
        const error = new CompensationError(
          executedStep.step.name,
          compensationError as Error
        );
        errors.push(error);
        logger.error('Compensation failed for step', error);
      }
    }
    
    if (errors.length > 0) {
      // Alert about compensation failures
      await this.alertCompensationFailures(errors);
    }
  }
}

// Example: Order processing saga
class OrderProcessingSaga {
  constructor(
    private compensationManager: CompensationManager,
    private inventoryService: InventoryService,
    private paymentService: PaymentService,
    private shippingService: ShippingService
  ) {}
  
  async processOrder(order: Order): Promise<ProcessedOrder> {
    const transaction: Transaction<ProcessedOrder> = {
      name: `process-order-${order.id}`,
      steps: [
        {
          name: 'reserve-inventory',
          execute: async () => {
            const reservation = await this.inventoryService.reserve(
              order.items
            );
            return { success: true, data: reservation };
          },
          compensate: async (result) => {
            if (result.data) {
              await this.inventoryService.cancelReservation(
                result.data.reservationId
              );
            }
          },
          stopOnFailure: true
        },
        {
          name: 'process-payment',
          execute: async () => {
            const payment = await this.paymentService.charge(
              order.customerId,
              order.total
            );
            return { success: true, data: payment };
          },
          compensate: async (result) => {
            if (result.data) {
              await this.paymentService.refund(
                result.data.transactionId
              );
            }
          },
          stopOnFailure: true
        },
        {
          name: 'create-shipment',
          execute: async () => {
            const shipment = await this.shippingService.createShipment(
              order
            );
            return { success: true, data: shipment };
          },
          compensate: async (result) => {
            if (result.data) {
              await this.shippingService.cancelShipment(
                result.data.shipmentId
              );
            }
          },
          stopOnFailure: false // Best effort
        }
      ]
    };
    
    return this.compensationManager.executeWithCompensation(transaction);
  }
}
```

### 5. Bulkhead Pattern

```typescript
export class BulkheadManager {
  private readonly bulkheads = new Map<string, Bulkhead>();
  
  constructor(private config: BulkheadConfig) {
    // Initialize bulkheads for different resources
    this.bulkheads.set('database', new Bulkhead(config.database));
    this.bulkheads.set('external-api', new Bulkhead(config.externalApi));
    this.bulkheads.set('file-system', new Bulkhead(config.fileSystem));
  }
  
  async execute<T>(
    resourceType: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const bulkhead = this.bulkheads.get(resourceType);
    if (!bulkhead) {
      throw new Error(`Unknown resource type: ${resourceType}`);
    }
    
    return bulkhead.execute(operation);
  }
}

class Bulkhead {
  private activeCount = 0;
  private queue: QueueItem[] = [];
  
  constructor(private config: BulkheadResourceConfig) {}
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    // Check if we can execute immediately
    if (this.activeCount < this.config.maxConcurrent) {
      return this.executeOperation(operation);
    }
    
    // Check queue limit
    if (this.queue.length >= this.config.maxQueueSize) {
      throw new BulkheadRejectedError(
        `Queue full: ${this.queue.length}/${this.config.maxQueueSize}`
      );
    }
    
    // Queue the operation
    return this.queueOperation(operation);
  }
  
  private async executeOperation<T>(
    operation: () => Promise<T>
  ): Promise<T> {
    this.activeCount++;
    
    try {
      // Add timeout to prevent resource hogging
      const result = await this.withTimeout(
        operation(),
        this.config.timeout
      );
      
      return result;
    } finally {
      this.activeCount--;
      this.processQueue();
    }
  }
  
  private async queueOperation<T>(
    operation: () => Promise<T>
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        // Remove from queue
        const index = this.queue.findIndex(item => item.timeoutId === timeoutId);
        if (index !== -1) {
          this.queue.splice(index, 1);
        }
        
        reject(new BulkheadTimeoutError(
          `Queue timeout after ${this.config.queueTimeout}ms`
        ));
      }, this.config.queueTimeout);
      
      this.queue.push({
        operation,
        resolve,
        reject,
        timeoutId,
        enqueuedAt: new Date()
      });
    });
  }
  
  private processQueue(): void {
    if (this.queue.length === 0 || this.activeCount >= this.config.maxConcurrent) {
      return;
    }
    
    const item = this.queue.shift()!;
    clearTimeout(item.timeoutId);
    
    this.executeOperation(item.operation)
      .then(item.resolve)
      .catch(item.reject);
  }
}

// Usage example
class DatabaseService {
  constructor(private bulkheadManager: BulkheadManager) {}
  
  async query<T>(sql: string, params: any[]): Promise<T> {
    return this.bulkheadManager.execute('database', async () => {
      // Actual database query
      return await db.query<T>(sql, params);
    });
  }
}
```

### 6. Timeout and Deadline Pattern

```typescript
export class DeadlineManager {
  async executeWithDeadline<T>(
    operations: DeadlineOperation<T>[],
    totalDeadline: number
  ): Promise<DeadlineResult<T>> {
    const startTime = Date.now();
    const results: OperationResult<T>[] = [];
    let remainingTime = totalDeadline;
    
    for (const operation of operations) {
      // Calculate time budget for this operation
      const operationDeadline = Math.min(
        operation.maxTime || remainingTime,
        remainingTime
      );
      
      try {
        const result = await this.withDeadline(
          operation.execute(),
          operationDeadline
        );
        
        results.push({
          name: operation.name,
          success: true,
          result,
          duration: Date.now() - startTime
        });
        
        // Update remaining time
        remainingTime = totalDeadline - (Date.now() - startTime);
        
        if (remainingTime <= 0) {
          break; // Out of time
        }
        
      } catch (error) {
        if (error instanceof DeadlineExceededError) {
          // Try fallback if available
          if (operation.fallback) {
            try {
              const fallbackResult = await this.withDeadline(
                operation.fallback(),
                Math.min(operation.fallbackMaxTime || 1000, remainingTime)
              );
              
              results.push({
                name: operation.name,
                success: true,
                result: fallbackResult,
                duration: Date.now() - startTime,
                usedFallback: true
              });
            } catch (fallbackError) {
              results.push({
                name: operation.name,
                success: false,
                error: fallbackError as Error,
                duration: Date.now() - startTime
              });
            }
          } else {
            results.push({
              name: operation.name,
              success: false,
              error: error as Error,
              duration: Date.now() - startTime
            });
          }
        } else {
          // Non-timeout error
          results.push({
            name: operation.name,
            success: false,
            error: error as Error,
            duration: Date.now() - startTime
          });
          
          if (operation.critical) {
            // Stop on critical operation failure
            break;
          }
        }
      }
    }
    
    return {
      results,
      totalDuration: Date.now() - startTime,
      deadlineExceeded: Date.now() - startTime > totalDeadline,
      successfulOperations: results.filter(r => r.success).length,
      totalOperations: operations.length
    };
  }
  
  private async withDeadline<T>(
    promise: Promise<T>,
    deadline: number
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new DeadlineExceededError(deadline)),
        deadline
      );
    });
    
    return Promise.race([promise, timeoutPromise]);
  }
}

// Usage example: Search aggregation with deadline
class SearchAggregator {
  constructor(
    private deadlineManager: DeadlineManager,
    private searchProviders: SearchProvider[]
  ) {}
  
  async aggregateSearch(
    query: string,
    maxTime: number = 5000
  ): Promise<AggregatedSearchResults> {
    const operations: DeadlineOperation<SearchResult[]>[] = 
      this.searchProviders.map(provider => ({
        name: provider.name,
        execute: () => provider.search(query),
        maxTime: provider.timeout,
        fallback: provider.cachedSearch 
          ? () => provider.cachedSearch!(query)
          : undefined,
        fallbackMaxTime: 500,
        critical: provider.critical || false
      }));
    
    const deadlineResult = await this.deadlineManager.executeWithDeadline(
      operations,
      maxTime
    );
    
    // Aggregate successful results
    const allResults = deadlineResult.results
      .filter(r => r.success)
      .flatMap(r => r.result as SearchResult[]);
    
    return {
      results: this.deduplicateAndRank(allResults),
      totalProviders: this.searchProviders.length,
      successfulProviders: deadlineResult.successfulOperations,
      totalTime: deadlineResult.totalDuration,
      degraded: deadlineResult.successfulOperations < this.searchProviders.length
    };
  }
}
```

## Implementation Checklist

### For Engineers Implementing Error Handling

- [ ] **Identify Error Types**: Map all possible errors in your domain
- [ ] **Define Recovery Strategies**: Choose appropriate recovery pattern for each error type
- [ ] **Implement Base Classes**: Extend from `BaseError` with proper categorization
- [ ] **Add Context**: Include all debugging information in error context
- [ ] **Create User Messages**: Translate technical errors to user-friendly messages
- [ ] **Unit Test Errors**: Test both success and failure paths
- [ ] **Integration Test Recovery**: Test recovery strategies with real dependencies
- [ ] **Monitor and Alert**: Set up error tracking and alerting
- [ ] **Document Error Codes**: Maintain error code documentation
- [ ] **Performance Test**: Ensure error handling doesn't degrade performance

## Summary

These error recovery patterns provide:

1. **Resilience**: Multiple strategies to handle failures
2. **User Experience**: Graceful degradation maintains functionality
3. **Data Integrity**: Compensation ensures consistency
4. **Performance**: Bulkheads and timeouts prevent cascade failures
5. **Observability**: Rich context for debugging and monitoring

The patterns work together to create a robust system that handles failures gracefully while maintaining data consistency and user experience.