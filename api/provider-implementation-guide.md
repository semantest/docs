# Provider Implementation Guide

## Overview

This guide helps developers implement new image generation providers for the Semantest API. Following Aria's architectural guidance, we use the Strategy Pattern for clean provider abstraction.

## Strategy Pattern Implementation

### Base Provider Interface

```typescript
interface ImageProvider {
  name: string;
  version: string;
  
  // Core generation method
  generate(params: GenerationParams): Promise<GenerationResult>;
  
  // Rate limiting and quota management
  checkQuota(userId: string): Promise<QuotaStatus>;
  handleRateLimit(error: RateLimitError): Promise<void>;
  
  // Circuit breaker for failures
  isHealthy(): Promise<boolean>;
  recordFailure(error: Error): void;
  recordSuccess(): void;
}

interface GenerationParams {
  prompt: string;
  userId: string;
  options: ProviderOptions;
  webhookUrl?: string;
}

interface GenerationResult {
  jobId: string;
  images: GeneratedImage[];
  metadata: {
    provider: string;
    processingTime: number;
    creditsUsed: number;
  };
}
```

### DALL-E 3 Implementation

```typescript
import { OpenAI } from 'openai';
import { CircuitBreaker } from './circuit-breaker';

export class DallE3Provider implements ImageProvider {
  name = 'dalle3';
  version = '3.0';
  
  private client: OpenAI;
  private circuitBreaker: CircuitBreaker;
  
  constructor(config: DallE3Config) {
    this.client = new OpenAI({ apiKey: config.apiKey });
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      resetTimeout: 60000 // 1 minute
    });
  }
  
  async generate(params: GenerationParams): Promise<GenerationResult> {
    return this.circuitBreaker.execute(async () => {
      const startTime = Date.now();
      
      try {
        // Check quota before generation
        const quota = await this.checkQuota(params.userId);
        if (!quota.hasCredits) {
          throw new QuotaExceededError('Monthly quota exceeded');
        }
        
        // Generate image
        const response = await this.client.images.generate({
          model: "dall-e-3",
          prompt: params.prompt,
          size: params.options.size as any,
          quality: params.options.quality,
          style: params.options.style,
          n: 1
        });
        
        // Record success for circuit breaker
        this.recordSuccess();
        
        return {
          jobId: generateJobId(),
          images: response.data.map(img => ({
            url: img.url!,
            size: params.options.size,
            format: 'png'
          })),
          metadata: {
            provider: this.name,
            processingTime: Date.now() - startTime,
            creditsUsed: this.calculateCredits(params.options)
          }
        };
      } catch (error) {
        this.recordFailure(error as Error);
        throw this.handleProviderError(error);
      }
    });
  }
  
  async checkQuota(userId: string): Promise<QuotaStatus> {
    // Implementation specific to your quota system
    const usage = await quotaService.getUsage(userId, this.name);
    return {
      hasCredits: usage.remaining > 0,
      remaining: usage.remaining,
      resetDate: usage.resetDate
    };
  }
  
  async handleRateLimit(error: RateLimitError): Promise<void> {
    const retryAfter = error.retryAfter || 60;
    await sleep(retryAfter * 1000);
  }
  
  private calculateCredits(options: ProviderOptions): number {
    // HD quality uses more credits
    return options.quality === 'hd' ? 2 : 1;
  }
}
```

### Stable Diffusion Implementation

```typescript
export class StableDiffusionProvider implements ImageProvider {
  name = 'stable-diffusion';
  version = 'sdxl-1.0';
  
  private apiEndpoint: string;
  private circuitBreaker: CircuitBreaker;
  
  async generate(params: GenerationParams): Promise<GenerationResult> {
    return this.circuitBreaker.execute(async () => {
      const payload = {
        prompt: params.prompt,
        negative_prompt: params.options.negativePrompt,
        width: params.options.width || 1024,
        height: params.options.height || 1024,
        num_inference_steps: params.options.steps || 50,
        guidance_scale: params.options.cfgScale || 7.5,
        seed: params.options.seed
      };
      
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new ProviderError(`SD API error: ${response.status}`);
      }
      
      // Process response...
    });
  }
}
```

## Circuit Breaker Pattern

Protect against provider failures:

```typescript
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime?: number;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  constructor(
    private config: {
      failureThreshold: number;
      resetTimeout: number;
    }
  ) {}
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime! > this.config.resetTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new CircuitBreakerOpenError('Provider temporarily unavailable');
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
  
  private onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }
  
  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.config.failureThreshold) {
      this.state = 'OPEN';
    }
  }
}
```

## Provider Registry

Manage all providers centrally:

```typescript
class ProviderRegistry {
  private providers = new Map<string, ImageProvider>();
  
  register(provider: ImageProvider) {
    this.providers.set(provider.name, provider);
  }
  
  async getHealthyProvider(preferred?: string): Promise<ImageProvider> {
    // Try preferred provider first
    if (preferred) {
      const provider = this.providers.get(preferred);
      if (provider && await provider.isHealthy()) {
        return provider;
      }
    }
    
    // Fallback to any healthy provider
    for (const provider of this.providers.values()) {
      if (await provider.isHealthy()) {
        return provider;
      }
    }
    
    throw new NoHealthyProvidersError('All providers are currently unavailable');
  }
}

// Usage
const registry = new ProviderRegistry();
registry.register(new DallE3Provider(config));
registry.register(new StableDiffusionProvider(config));
registry.register(new MidjourneyProvider(config));
```

## Adding a New Provider

1. Implement the `ImageProvider` interface
2. Add provider-specific options to `ProviderOptions` type
3. Implement circuit breaker for resilience
4. Add quota/rate limit handling
5. Register with the provider registry
6. Update OpenAPI spec with new provider options

## Testing Providers

```typescript
describe('DallE3Provider', () => {
  it('handles rate limits gracefully', async () => {
    const provider = new DallE3Provider(testConfig);
    const rateLimitError = new RateLimitError(429, 60);
    
    await provider.handleRateLimit(rateLimitError);
    // Verify it waited appropriately
  });
  
  it('circuit breaker opens after failures', async () => {
    const provider = new DallE3Provider(testConfig);
    
    // Simulate 5 failures
    for (let i = 0; i < 5; i++) {
      provider.recordFailure(new Error('API Error'));
    }
    
    // Next call should fail immediately
    await expect(provider.generate(params))
      .rejects.toThrow(CircuitBreakerOpenError);
  });
});
```

---
*Provider Implementation Guide by Sam the Scribe*
*Architecture patterns from Aria the Architect*