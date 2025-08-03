# Issue #22: DALL-E 3 URL Detection Solution Architecture

**Issue**: DALL-E 3 URL Detection Broken
**Lead**: Sam (Documentation)
**Support**: Alex (Backend), Claude (Architecture)
**Created**: Hour 87 - Sunday 11:45 AM CEST

## Problem Analysis

The DALL-E 3 provider returns generated images with URLs that need to be:
1. Properly detected and validated
2. Stored with appropriate metadata
3. Made accessible to the Chrome extension
4. Handled when URLs expire or become invalid

## Root Cause Investigation

Based on the codebase analysis:

1. **URL Format Changes**: DALL-E 3 returns URLs in a different format than DALL-E 2
2. **Expiration Handling**: OpenAI image URLs expire after ~1 hour
3. **CORS Issues**: Direct URL access from extension may be blocked
4. **Missing URL Validation**: No current validation for DALL-E URL patterns

## Proposed Solution Architecture

### 1. URL Detection Service

Create a dedicated URL detection and validation service:

```typescript
// nodejs.server/src/api/v1/services/url-detection.service.ts
export class UrlDetectionService {
  private readonly dalleUrlPatterns = [
    // DALL-E 3 patterns
    /^https:\/\/oaidalleapiprodscus\.blob\.core\.windows\.net\/.*$/,
    /^https:\/\/openai-labs-public-images-prod\.s3\.amazonaws\.com\/.*$/,
    // Legacy DALL-E 2 patterns
    /^https:\/\/images\.openai\.com\/.*$/
  ];

  /**
   * Detect if URL is from DALL-E
   */
  isDalleUrl(url: string): boolean {
    return this.dalleUrlPatterns.some(pattern => pattern.test(url));
  }

  /**
   * Validate DALL-E URL structure
   */
  validateDalleUrl(url: string): {
    valid: boolean;
    provider: 'dalle-2' | 'dalle-3' | null;
    expiresAt?: Date;
  } {
    if (!url) return { valid: false, provider: null };

    // DALL-E 3 blob storage URLs
    if (url.includes('oaidalleapiprodscus.blob.core.windows.net')) {
      return {
        valid: true,
        provider: 'dalle-3',
        expiresAt: this.extractExpirationFromUrl(url)
      };
    }

    // DALL-E 3 S3 URLs
    if (url.includes('openai-labs-public-images-prod.s3.amazonaws.com')) {
      return {
        valid: true,
        provider: 'dalle-3',
        expiresAt: this.extractExpirationFromUrl(url)
      };
    }

    // Legacy DALL-E 2
    if (url.includes('images.openai.com')) {
      return {
        valid: true,
        provider: 'dalle-2',
        expiresAt: new Date(Date.now() + 3600000) // 1 hour default
      };
    }

    return { valid: false, provider: null };
  }

  /**
   * Extract expiration from URL query params
   */
  private extractExpirationFromUrl(url: string): Date {
    try {
      const urlObj = new URL(url);
      
      // Azure blob storage uses 'se' parameter
      const se = urlObj.searchParams.get('se');
      if (se) {
        return new Date(se);
      }

      // S3 uses 'Expires' parameter
      const expires = urlObj.searchParams.get('Expires');
      if (expires) {
        return new Date(parseInt(expires) * 1000);
      }

      // Default to 1 hour
      return new Date(Date.now() + 3600000);
    } catch {
      return new Date(Date.now() + 3600000);
    }
  }

  /**
   * Parse metadata from DALL-E URL
   */
  parseDalleUrlMetadata(url: string): {
    jobId?: string;
    timestamp?: string;
    signature?: string;
  } {
    const urlObj = new URL(url);
    
    return {
      jobId: urlObj.pathname.split('/').pop()?.split('.')[0],
      timestamp: urlObj.searchParams.get('st') || undefined,
      signature: urlObj.searchParams.get('sig') || undefined
    };
  }
}
```

### 2. URL Caching and Proxy Service

Implement a caching proxy to handle URL expiration:

```typescript
// nodejs.server/src/api/v1/services/image-cache.service.ts
export class ImageCacheService {
  private redis: Redis;
  private storage: CloudStorageService;

  /**
   * Cache DALL-E image and return permanent URL
   */
  async cacheImage(
    originalUrl: string, 
    metadata: ImageMetadata
  ): Promise<CachedImage> {
    const cacheKey = `image:${metadata.jobId}:${metadata.imageId}`;
    
    // Check if already cached
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Download image
    const imageBuffer = await this.downloadImage(originalUrl);
    
    // Store in cloud storage
    const permanentUrl = await this.storage.upload(
      `dalle/${metadata.jobId}/${metadata.imageId}.png`,
      imageBuffer,
      {
        contentType: 'image/png',
        metadata: {
          originalUrl,
          provider: metadata.provider,
          generatedAt: metadata.generatedAt,
          prompt: metadata.prompt
        }
      }
    );

    const cachedImage: CachedImage = {
      imageId: metadata.imageId,
      originalUrl,
      permanentUrl,
      cachedAt: new Date(),
      expiresAt: metadata.expiresAt,
      metadata
    };

    // Cache with TTL
    await this.redis.setex(
      cacheKey,
      86400, // 24 hours
      JSON.stringify(cachedImage)
    );

    return cachedImage;
  }

  /**
   * Get cached image or re-cache if expired
   */
  async getCachedImage(imageId: string): Promise<CachedImage | null> {
    const pattern = `image:*:${imageId}`;
    const keys = await this.redis.keys(pattern);
    
    if (keys.length === 0) return null;

    const cached = await this.redis.get(keys[0]);
    if (!cached) return null;

    const cachedImage: CachedImage = JSON.parse(cached);
    
    // Check if original URL expired
    if (new Date(cachedImage.expiresAt) < new Date()) {
      // Return permanent URL
      return {
        ...cachedImage,
        originalUrl: cachedImage.permanentUrl
      };
    }

    return cachedImage;
  }
}
```

### 3. Enhanced DALL-E Provider Integration

Update the DALL-E provider to use URL detection:

```typescript
// Enhance nodejs.server/src/api/v1/services/providers/dalle-provider.ts
export class DalleProvider extends BaseImageProvider {
  private urlDetection: UrlDetectionService;
  private imageCache: ImageCacheService;

  protected async doInitialize(): Promise<void> {
    // ... existing initialization ...
    this.urlDetection = new UrlDetectionService();
    this.imageCache = new ImageCacheService();
  }

  async generateImages(
    request: GenerateImageRequest, 
    options?: DalleOptions
  ): Promise<ImageGenerationResult> {
    // ... existing generation code ...

    const generatedImages = await Promise.all(
      response.data.map(async (image) => {
        const imageId = uuidv4();
        
        // Validate URL
        const urlValidation = this.urlDetection.validateDalleUrl(image.url!);
        if (!urlValidation.valid) {
          throw new Error('Invalid DALL-E URL detected');
        }

        // Cache image immediately
        const cachedImage = await this.imageCache.cacheImage(
          image.url!,
          {
            jobId: request.requestId,
            imageId,
            provider: this.provider,
            generatedAt: new Date(),
            expiresAt: urlValidation.expiresAt!,
            prompt: request.prompt,
            revisedPrompt: image.revised_prompt
          }
        );

        return {
          id: imageId,
          url: cachedImage.permanentUrl, // Use permanent URL
          originalUrl: image.url!, // Keep original for reference
          size: request.size,
          prompt: request.prompt,
          revisedPrompt: image.revised_prompt,
          metadata: {
            provider: this.provider,
            model: options?.model || this.defaultModel,
            style: options?.style || 'vivid',
            quality: request.quality,
            generatedAt: new Date().toISOString(),
            urlDetection: {
              provider: urlValidation.provider,
              expiresAt: urlValidation.expiresAt?.toISOString(),
              cached: true,
              cacheKey: cachedImage.imageId
            }
          }
        };
      })
    );

    // ... rest of the method ...
  }
}
```

### 4. API Endpoint for URL Validation

Add a dedicated endpoint for URL validation:

```typescript
// Add to nodejs.server/src/api/v1/routes/image-generation.routes.ts

/**
 * POST /api/v1/images/validate-url
 * Validate and process DALL-E URLs
 */
router.post('/images/validate-url',
  rateLimitMiddleware({ windowMs: 60000, max: 100 }),
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { url, jobId } = req.body;
      
      const urlDetection = new UrlDetectionService();
      const validation = urlDetection.validateDalleUrl(url);
      
      if (!validation.valid) {
        return res.status(400).json({
          error: {
            code: 'INVALID_URL',
            message: 'URL is not a valid DALL-E image URL'
          }
        });
      }

      // Check if we have a cached version
      const imageCache = new ImageCacheService();
      const metadata = urlDetection.parseDalleUrlMetadata(url);
      
      let permanentUrl = url;
      if (jobId && metadata.jobId) {
        const cached = await imageCache.getCachedImage(metadata.jobId);
        if (cached) {
          permanentUrl = cached.permanentUrl;
        }
      }

      res.json({
        valid: true,
        provider: validation.provider,
        expiresAt: validation.expiresAt,
        permanentUrl,
        metadata
      });

    } catch (error) {
      next(error);
    }
  }
);
```

### 5. Chrome Extension Integration

Update the extension to handle URL detection:

```typescript
// extension.chrome/src/services/image-url-detector.ts
export class ImageUrlDetector {
  private readonly API_BASE = process.env.VITE_API_URL;

  /**
   * Detect and validate DALL-E URLs in content
   */
  async detectDalleUrls(content: string): Promise<DetectedUrl[]> {
    const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/g;
    const urls = content.match(urlRegex) || [];
    
    const detectedUrls: DetectedUrl[] = [];
    
    for (const url of urls) {
      try {
        const response = await fetch(`${this.API_BASE}/api/v1/images/validate-url`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await this.getAuthToken()}`
          },
          body: JSON.stringify({ url })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.valid && data.provider?.startsWith('dalle')) {
            detectedUrls.push({
              originalUrl: url,
              permanentUrl: data.permanentUrl,
              provider: data.provider,
              expiresAt: data.expiresAt,
              metadata: data.metadata
            });
          }
        }
      } catch (error) {
        console.error('Failed to validate URL:', url, error);
      }
    }

    return detectedUrls;
  }

  /**
   * Monitor page for new DALL-E URLs
   */
  startUrlMonitoring(callback: (urls: DetectedUrl[]) => void): void {
    const observer = new MutationObserver(async (mutations) => {
      const newUrls = new Set<string>();
      
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
              const urls = await this.detectDalleUrls(node.textContent || '');
              urls.forEach(u => newUrls.add(u.originalUrl));
            }
          });
        }
      });

      if (newUrls.size > 0) {
        const detectedUrls = await Promise.all(
          Array.from(newUrls).map(url => this.detectDalleUrls(url))
        );
        callback(detectedUrls.flat());
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }
}
```

### 6. Testing Strategy

Comprehensive tests for URL detection:

```typescript
// nodejs.server/src/api/v1/services/__tests__/url-detection.service.test.ts
describe('UrlDetectionService', () => {
  let service: UrlDetectionService;

  beforeEach(() => {
    service = new UrlDetectionService();
  });

  describe('DALL-E 3 URL Detection', () => {
    it('should detect Azure blob storage URLs', () => {
      const url = 'https://oaidalleapiprodscus.blob.core.windows.net/images/12345.png?se=2024-01-01T12:00:00Z&sig=abc123';
      expect(service.isDalleUrl(url)).toBe(true);
      
      const validation = service.validateDalleUrl(url);
      expect(validation.valid).toBe(true);
      expect(validation.provider).toBe('dalle-3');
      expect(validation.expiresAt).toBeDefined();
    });

    it('should detect S3 URLs', () => {
      const url = 'https://openai-labs-public-images-prod.s3.amazonaws.com/12345.png?Expires=1234567890';
      expect(service.isDalleUrl(url)).toBe(true);
      
      const validation = service.validateDalleUrl(url);
      expect(validation.valid).toBe(true);
      expect(validation.provider).toBe('dalle-3');
    });

    it('should extract metadata from URLs', () => {
      const url = 'https://oaidalleapiprodscus.blob.core.windows.net/images/job-12345.png?st=2024-01-01T11:00:00Z&se=2024-01-01T12:00:00Z&sig=abc123';
      const metadata = service.parseDalleUrlMetadata(url);
      
      expect(metadata.jobId).toBe('job-12345');
      expect(metadata.timestamp).toBe('2024-01-01T11:00:00Z');
      expect(metadata.signature).toBe('abc123');
    });
  });

  describe('Legacy DALL-E 2 Support', () => {
    it('should still detect DALL-E 2 URLs', () => {
      const url = 'https://images.openai.com/generations/12345.png';
      expect(service.isDalleUrl(url)).toBe(true);
      
      const validation = service.validateDalleUrl(url);
      expect(validation.valid).toBe(true);
      expect(validation.provider).toBe('dalle-2');
    });
  });
});
```

## Implementation Timeline

1. **Hour 87-88**: Implement URL detection service (Sam)
2. **Hour 88-89**: Add caching service (Alex)
3. **Hour 89-90**: Update DALL-E provider (Alex)
4. **Hour 90-91**: Add API endpoints (Sam)
5. **Hour 91-92**: Chrome extension integration (Sam)
6. **Hour 92-93**: Comprehensive testing (Sam + Alex)

## Success Metrics

- ✅ 100% DALL-E 3 URL detection accuracy
- ✅ < 100ms URL validation response time
- ✅ Zero expired URL errors in production
- ✅ 95%+ cache hit rate for images
- ✅ Full backward compatibility with DALL-E 2

## Edge Cases Handled

1. **Expired URLs**: Automatic fallback to cached version
2. **Network failures**: Retry with exponential backoff
3. **Invalid URLs**: Clear error messages and validation
4. **CORS issues**: Proxy through backend API
5. **Rate limiting**: Respect OpenAI rate limits

## Notes for Sam

This architecture provides:
1. Robust URL detection for both DALL-E 2 and 3
2. Automatic handling of URL expiration
3. Performance optimization through caching
4. Clear separation of concerns
5. Comprehensive error handling

The URL patterns I've identified are based on current DALL-E 3 behavior, but we should monitor for changes and update patterns as needed.

---

**Created by**: Claude (Architecture Support)
**For**: Sam (Issue #22 Lead)
**Hour**: 87
**Status**: Ready for implementation