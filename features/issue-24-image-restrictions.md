# Issue #24: Chat Image Generation Restrictions

## Overview

This feature implements smart restrictions for image generation in chat contexts, ensuring appropriate usage while maintaining flexibility for legitimate testing scenarios.

## The Challenge

Eva discovered that unrestricted image generation could lead to:
- Resource exhaustion
- Inappropriate content requests
- Testing workflow disruptions
- Performance degradation

## Solution Architecture

### Restriction Levels

```typescript
enum RestrictionLevel {
  NONE = 'none',           // No restrictions (dev mode)
  MODERATE = 'moderate',   // Rate limiting only
  STRICT = 'strict'        // Rate + content filtering
}

interface ImageRestrictionConfig {
  level: RestrictionLevel;
  rateLimit: {
    requests: number;
    windowMs: number;
  };
  contentFilters: string[];
  whitelistedDomains: string[];
}
```

### Implementation Strategy

1. **Rate Limiting**
```javascript
const rateLimiter = new RateLimiter({
  requests: 10,
  windowMs: 60000 // 10 requests per minute
});

async function handleImageRequest(request) {
  if (!rateLimiter.allow(request.userId)) {
    throw new Error('Rate limit exceeded. Please wait before requesting more images.');
  }
  
  // Process image request
}
```

2. **Content Filtering**
```javascript
const contentFilter = {
  prohibited: ['inappropriate', 'terms', 'here'],
  
  check(prompt) {
    const normalized = prompt.toLowerCase();
    return !this.prohibited.some(term => normalized.includes(term));
  }
};
```

3. **Smart Caching**
- Cache generated images by prompt hash
- Serve cached results for duplicate requests
- Implement TTL for cache entries

## User Experience

### For Developers

"The restrictions are smart - they prevent abuse but don't get in my way when I'm legitimately testing image-heavy workflows." - Developer feedback

### Configuration Options

```yaml
# semantest.config.yml
imageGeneration:
  enabled: true
  restrictions:
    level: moderate
    rateLimit:
      requests: 20
      window: 5m
    cache:
      enabled: true
      ttl: 1h
    allowedFormats:
      - png
      - jpg
      - webp
```

## Extension Integration (Eva)

The Chrome extension implements:

1. **Visual Indicators**
   - Rate limit status in UI
   - Remaining requests counter
   - Cool-down timer

2. **Graceful Degradation**
   - Queue requests when rate-limited
   - Provide alternatives (cached images)
   - Clear error messaging

3. **Developer Tools**
   - Bypass restrictions in dev mode
   - Debug panel for restriction status
   - Request history logging

## Testing Guidelines

### Unit Tests
```javascript
describe('Image Restrictions', () => {
  it('should enforce rate limits', async () => {
    // Test rate limiting logic
  });
  
  it('should filter inappropriate content', async () => {
    // Test content filtering
  });
  
  it('should serve cached images', async () => {
    // Test caching mechanism
  });
});
```

### Integration Tests
- Test with real extension
- Verify UI updates correctly
- Ensure graceful handling of restrictions

## Migration Path

For existing users:
1. Restrictions start in 'none' mode
2. Gradual introduction of 'moderate' mode
3. Optional 'strict' mode for enterprise

## Performance Impact

- Minimal overhead (<5ms per request)
- Efficient caching reduces load
- Background cleanup of old cache entries

---
*Documentation for Issue #24 - Chat Image Generation Restrictions*
*Ensuring responsible resource usage in Semantest*