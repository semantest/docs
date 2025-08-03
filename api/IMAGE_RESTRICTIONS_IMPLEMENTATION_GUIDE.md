# Image Generation Restrictions Implementation Guide (Issue #24)

## Overview

This guide details how to implement image generation restrictions in the Semantest ecosystem, integrating with Alex's async API architecture.

## API-Level Restrictions

### 1. Rate Limiting Integration

The API already implements rate limiting middleware:

```typescript
// In image-generation.routes.ts
router.post('/chat/new', 
  rateLimitMiddleware({ windowMs: 60000, max: 10 }), // 10 requests per minute
  // ... handler
);

router.post('/images/generate',
  rateLimitMiddleware({ windowMs: 60000, max: 30 }), // 30 requests per minute
  // ... handler
);
```

### 2. Enhanced Restriction Service

Create a new service for managing restrictions:

```typescript
// src/api/v1/services/image-restriction.service.ts
export class ImageRestrictionService {
  private cache: Map<string, CachedImage> = new Map();
  
  async checkRestrictions(request: ImageGenerationRequest): Promise<RestrictionResult> {
    const checks = await Promise.all([
      this.checkRateLimit(request.userId),
      this.checkContentFilters(request.prompt),
      this.checkCache(request.prompt),
      this.checkUserQuota(request.userId)
    ]);
    
    return {
      allowed: checks.every(c => c.allowed),
      reason: checks.find(c => !c.allowed)?.reason,
      cachedImage: checks[2].cachedImage
    };
  }
  
  async checkContentFilters(prompt: string): Promise<FilterResult> {
    // Integration with content moderation service
    const moderationResult = await this.moderationService.check(prompt);
    
    if (moderationResult.flagged) {
      return {
        allowed: false,
        reason: `Content violation: ${moderationResult.categories.join(', ')}`
      };
    }
    
    return { allowed: true };
  }
  
  async checkUserQuota(userId: string): Promise<QuotaResult> {
    const quota = await this.getQuota(userId);
    const usage = await this.getUsage(userId);
    
    if (usage.daily >= quota.daily) {
      return {
        allowed: false,
        reason: 'Daily quota exceeded',
        resetAt: this.getNextResetTime()
      };
    }
    
    return {
      allowed: true,
      remaining: quota.daily - usage.daily
    };
  }
}
```

### 3. Caching Strategy

Implement intelligent caching to reduce redundant generations:

```typescript
interface CachedImage {
  id: string;
  prompt: string;
  promptHash: string;
  images: GeneratedImage[];
  createdAt: Date;
  expiresAt: Date;
  hitCount: number;
}

class ImageCacheService {
  async findCached(prompt: string): Promise<CachedImage | null> {
    const hash = this.hashPrompt(prompt);
    const cached = await this.redis.get(`image:cache:${hash}`);
    
    if (cached) {
      // Increment hit counter
      await this.redis.hincrby(`image:stats:${hash}`, 'hits', 1);
      return JSON.parse(cached);
    }
    
    return null;
  }
  
  async cache(result: ImageGenerationResult, prompt: string): Promise<void> {
    const hash = this.hashPrompt(prompt);
    const ttl = this.calculateTTL(result);
    
    await this.redis.setex(
      `image:cache:${hash}`,
      ttl,
      JSON.stringify({
        id: uuidv4(),
        prompt,
        promptHash: hash,
        images: result.images,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + ttl * 1000),
        hitCount: 0
      })
    );
  }
  
  private hashPrompt(prompt: string): string {
    // Normalize and hash prompt for consistent caching
    const normalized = prompt.toLowerCase().trim();
    return crypto.createHash('sha256').update(normalized).digest('hex');
  }
}
```

## Extension-Level Implementation

### 1. Queue Manager Updates

Enhance the queue manager to respect restrictions:

```typescript
// In queue-manager.js
class ImageGenerationQueue {
  constructor() {
    this.queue = [];
    this.restrictions = new RestrictionManager();
    this.rateLimiter = new RateLimiter();
  }
  
  async add(request) {
    // Check restrictions before queuing
    const restrictionCheck = await this.restrictions.check(request);
    
    if (!restrictionCheck.allowed) {
      this.sendRestrictionNotification(restrictionCheck);
      return;
    }
    
    // Check for cached result
    if (restrictionCheck.cachedImage) {
      this.serveCachedImage(restrictionCheck.cachedImage);
      return;
    }
    
    // Add to queue with priority
    this.queue.push({
      ...request,
      priority: this.calculatePriority(request),
      restrictions: restrictionCheck
    });
    
    this.processNext();
  }
  
  sendRestrictionNotification(check) {
    // Update UI with restriction info
    chrome.runtime.sendMessage({
      type: 'restriction:notification',
      reason: check.reason,
      remaining: check.remaining,
      resetAt: check.resetAt
    });
  }
}
```

### 2. UI Components

Create visual indicators for restrictions:

```javascript
// restriction-indicator.js
class RestrictionIndicator {
  constructor() {
    this.element = this.createElement();
    this.updateInterval = null;
  }
  
  createElement() {
    const div = document.createElement('div');
    div.className = 'semantest-restriction-indicator';
    div.innerHTML = `
      <div class="rate-limit-status">
        <span class="remaining">--</span> requests remaining
        <span class="reset-timer"></span>
      </div>
      <div class="quota-status">
        Daily quota: <span class="used">0</span>/<span class="total">100</span>
      </div>
    `;
    return div;
  }
  
  updateStatus(status) {
    this.element.querySelector('.remaining').textContent = status.remaining;
    this.element.querySelector('.used').textContent = status.quotaUsed;
    this.element.querySelector('.total').textContent = status.quotaTotal;
    
    if (status.resetAt) {
      this.startCountdown(status.resetAt);
    }
  }
  
  startCountdown(resetTime) {
    clearInterval(this.updateInterval);
    
    this.updateInterval = setInterval(() => {
      const remaining = resetTime - Date.now();
      if (remaining <= 0) {
        clearInterval(this.updateInterval);
        this.element.querySelector('.reset-timer').textContent = '';
        return;
      }
      
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      this.element.querySelector('.reset-timer').textContent = 
        `(resets in ${minutes}:${seconds.toString().padStart(2, '0')})`;
    }, 1000);
  }
}
```

### 3. Configuration Management

Allow users to configure restriction preferences:

```javascript
// extension-settings.js
const defaultSettings = {
  imageGeneration: {
    restrictions: {
      level: 'moderate', // none, moderate, strict
      cacheEnabled: true,
      cacheTTL: 3600, // 1 hour
      showIndicators: true,
      queueWhenLimited: true,
      notifyOnRestriction: true
    }
  }
};

// Save user preferences
chrome.storage.sync.set({
  'imageRestrictions': userSettings
});

// Apply settings
async function applyRestrictionSettings(settings) {
  const restrictionManager = new RestrictionManager(settings);
  
  // Update UI based on settings
  if (settings.showIndicators) {
    showRestrictionIndicator();
  }
  
  // Configure queue behavior
  imageQueue.setRestrictionMode(settings.level);
  imageQueue.setQueueWhenLimited(settings.queueWhenLimited);
}
```

## Server-Side Enhancements

### 1. Quota Management

Add user quota tracking:

```typescript
// src/api/v1/models/user-quota.model.ts
export interface UserQuota {
  userId: string;
  tier: 'free' | 'pro' | 'enterprise';
  limits: {
    daily: number;
    monthly: number;
    concurrent: number;
  };
  usage: {
    daily: number;
    monthly: number;
    current: number;
  };
  resetTimes: {
    daily: Date;
    monthly: Date;
  };
}

// Service implementation
export class QuotaService {
  async checkAndIncrement(userId: string): Promise<QuotaCheckResult> {
    const quota = await this.getQuota(userId);
    
    if (quota.usage.daily >= quota.limits.daily) {
      return {
        allowed: false,
        reason: 'Daily limit exceeded',
        resetAt: quota.resetTimes.daily
      };
    }
    
    // Increment usage
    await this.incrementUsage(userId);
    
    return {
      allowed: true,
      remaining: quota.limits.daily - quota.usage.daily - 1
    };
  }
}
```

### 2. Analytics Integration

Track restriction effectiveness:

```typescript
// Analytics events
analytics.track('image_generation_restricted', {
  userId: request.userId,
  reason: restrictionResult.reason,
  promptHash: hashPrompt(request.prompt),
  cachedServed: !!restrictionResult.cachedImage,
  timestamp: new Date()
});

analytics.track('quota_exceeded', {
  userId: request.userId,
  tier: user.tier,
  quotaType: 'daily',
  usage: quota.usage.daily,
  limit: quota.limits.daily
});
```

## Testing Strategy

### Unit Tests

```javascript
describe('ImageRestrictionService', () => {
  it('should enforce rate limits', async () => {
    const service = new ImageRestrictionService();
    const userId = 'test-user';
    
    // Exhaust rate limit
    for (let i = 0; i < 10; i++) {
      await service.checkRateLimit(userId);
    }
    
    // Next request should be denied
    const result = await service.checkRateLimit(userId);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Rate limit');
  });
  
  it('should filter inappropriate content', async () => {
    const service = new ImageRestrictionService();
    const result = await service.checkContentFilters('inappropriate prompt');
    
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Content violation');
  });
  
  it('should serve cached images', async () => {
    const service = new ImageRestrictionService();
    const prompt = 'A beautiful sunset';
    
    // First request - no cache
    const result1 = await service.checkCache(prompt);
    expect(result1.cachedImage).toBeNull();
    
    // Cache the result
    await service.cacheResult(mockResult, prompt);
    
    // Second request - should hit cache
    const result2 = await service.checkCache(prompt);
    expect(result2.cachedImage).toBeDefined();
  });
});
```

### Integration Tests

```javascript
describe('Extension Restriction Integration', () => {
  it('should show rate limit indicator', async () => {
    // Simulate rate limit
    await simulateRateLimit();
    
    // Check UI update
    const indicator = await page.$('.rate-limit-status');
    expect(await indicator.textContent()).toContain('0 requests remaining');
  });
  
  it('should queue requests when limited', async () => {
    // Enable queue when limited
    await setRestrictionSettings({ queueWhenLimited: true });
    
    // Exhaust limit
    await exhaustRateLimit();
    
    // Try to generate image
    await requestImage('Test prompt');
    
    // Check if queued
    const queueStatus = await getQueueStatus();
    expect(queueStatus.length).toBe(1);
  });
});
```

## Monitoring & Alerts

### Key Metrics

1. **Restriction Metrics**
   - Rate limit hits per user/tier
   - Content filter blocks
   - Cache hit ratio
   - Quota exhaustion rate

2. **Performance Metrics**
   - Restriction check latency
   - Cache lookup time
   - Queue processing time

3. **User Experience Metrics**
   - Restriction notification CTR
   - Queue abandonment rate
   - Settings adjustment frequency

### Alert Thresholds

```yaml
alerts:
  - name: high_restriction_rate
    condition: restriction_rate > 0.3  # 30% of requests restricted
    severity: warning
    
  - name: cache_degradation
    condition: cache_hit_ratio < 0.1  # Less than 10% cache hits
    severity: info
    
  - name: quota_exhaustion_spike
    condition: quota_exhaustion_rate > 0.5  # 50% users hitting quota
    severity: critical
```

## Rollout Strategy

### Phase 1: Soft Launch (Week 1)
- Enable caching for all users
- Monitor cache effectiveness
- No hard restrictions yet

### Phase 2: Rate Limiting (Week 2)
- Enable rate limiting for free tier
- Generous limits initially
- Monitor user feedback

### Phase 3: Content Filtering (Week 3)
- Enable basic content filtering
- Log violations without blocking
- Refine filter rules

### Phase 4: Full Restrictions (Week 4)
- Enable all restriction features
- Different limits per tier
- Full monitoring dashboard

## Conclusion

This implementation provides a balanced approach to image generation restrictions:
- Protects resources while maintaining usability
- Provides clear feedback to users
- Integrates seamlessly with existing architecture
- Scales with user growth

The phased rollout ensures smooth adoption with minimal user disruption.