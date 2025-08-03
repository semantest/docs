# Semantest Extension API Integration Analysis

## Overview

Based on Alex's API schemas, here's a comprehensive analysis of how to integrate the new Image Generation API with our browser extensions architecture.

## API Key Endpoints

### 1. POST /api/v1/chat/new (Issue #23 - NewChatRequested)
- **Purpose**: Create chat session with optional image generation
- **Authentication**: JWT Bearer token (from authMiddleware)
- **Rate Limit**: 10 requests per minute
- **Key Features**:
  - Combined chat + image generation in single request
  - Returns both chat response and image job details
  - Supports webhooks for async updates

### 2. POST /api/v1/images/generate
- **Purpose**: Direct image generation without chat
- **Authentication**: API Key (X-API-Key header)
- **Rate Limit**: 30 requests per minute
- **Returns**: Job ID for async tracking

### 3. POST /api/v1/images/batch
- **Purpose**: Multiple image generation in one request
- **Authentication**: API Key
- **Rate Limit**: 5 batch requests per minute
- **Max Jobs**: 100 per batch

## Extension Integration Points

### 1. ChatGPT Extension Integration

```javascript
// In semantest-chatgpt/src/addon/index.js
// Modify the event handler to use new API

if (eventType === 'semantest/custom/image/download/requested') {
  // Option 1: Use /chat/new endpoint
  const response = await fetch('https://api.semantest.com/v1/chat/new', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userId: getUserId(),
      prompt: eventPayload.prompt,
      imageGeneration: {
        enabled: true,
        provider: 'dalle3',
        size: '1024x1024',
        quality: 'hd',
        metadata: {
          filename: eventPayload.metadata?.filename,
          requestId: eventPayload.metadata?.requestId
        }
      }
    })
  });

  const result = await response.json();
  
  // Poll for job completion
  if (result.imageGenerationJob) {
    pollJobStatus(result.imageGenerationJob.jobId);
  }
}
```

### 2. Queue Manager Updates

The queue manager needs to integrate with the async job API:

```javascript
// Modified queue processing
async processNext() {
  const request = this.queue.shift();
  
  // Submit to API
  const jobResponse = await submitToAPI(request);
  
  // Track job status
  this.trackJob(jobResponse.jobId, request);
  
  // Start polling
  this.pollJobStatus(jobResponse.jobId);
}

async pollJobStatus(jobId) {
  const statusUrl = `/api/v1/images/status/${jobId}`;
  
  const checkStatus = async () => {
    const response = await fetch(statusUrl);
    const status = await response.json();
    
    if (status.status === 'completed') {
      // Download images
      for (const image of status.result.images) {
        await downloadImage(image.url, image.metadata);
      }
    } else if (status.status === 'failed') {
      // Handle error
      console.error('Job failed:', status.error);
    } else {
      // Continue polling
      setTimeout(checkStatus, 2000);
    }
  };
  
  checkStatus();
}
```

## Authentication Strategy

### For Browser Extensions

1. **User Authentication Flow**:
   - Extension prompts user to login via semantest.com
   - Receives JWT token after successful auth
   - Stores token securely in extension storage
   - Uses token for /chat/new requests

2. **API Key for Direct Access**:
   - User can optionally provide API key in extension settings
   - Used for /images/generate and /images/batch endpoints
   - Allows higher rate limits and batch operations

### Security Considerations

```javascript
// Secure token storage
chrome.storage.local.set({
  'auth_token': encryptedToken,
  'api_key': encryptedApiKey
});

// Token refresh logic
async function getAuthHeaders() {
  const token = await getStoredToken();
  
  if (isTokenExpired(token)) {
    token = await refreshToken();
  }
  
  return {
    'Authorization': `Bearer ${token}`
  };
}
```

## Event Flow Architecture

### Current WebSocket Flow
```
User Action → Extension → WebSocket → Server → ChatGPT
```

### New API Integration Flow
```
User Action → Extension → API Request → Job Queue → Provider
                              ↓
                        Job Status ← Polling/Webhook
                              ↓
                        Download Image
```

## Implementation Recommendations

### 1. Hybrid Approach
- Keep WebSocket for real-time events and coordination
- Use REST API for actual image generation jobs
- This provides reliability + real-time updates

### 2. Progressive Enhancement
- Phase 1: Add API integration alongside existing WebSocket
- Phase 2: Migrate core functionality to API
- Phase 3: WebSocket becomes notification channel only

### 3. Error Handling & Retry Logic

```javascript
class APIClient {
  async requestWithRetry(url, options, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(url, options);
        
        if (response.status === 429) {
          // Rate limited - wait and retry
          const retryAfter = response.headers.get('X-RateLimit-Reset');
          await this.waitUntil(retryAfter);
          continue;
        }
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        return response;
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await this.exponentialBackoff(i);
      }
    }
  }
}
```

## Webhook Integration

For better efficiency, extensions can register webhooks:

```javascript
// Register webhook when extension starts
const webhookUrl = await registerWebhook();

// Include in API requests
const jobRequest = {
  ...requestData,
  webhookUrl: webhookUrl,
  webhookEvents: ['job.completed', 'job.failed']
};

// Listen for webhook notifications
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'webhook:notification') {
    handleJobUpdate(message.data);
  }
});
```

## Performance Optimizations

### 1. Batch Processing
- Group multiple requests into batch API calls
- Reduces API calls and improves efficiency

### 2. Caching Strategy
- Cache generated images locally
- Use content hash for deduplication
- Implement TTL based on API response

### 3. Progressive Loading
- Show thumbnails first (thumbnailUrl)
- Load full images in background
- Update UI progressively

## Migration Path

### Phase 1: API Integration (Current Sprint)
- Add API client to extensions
- Implement authentication flow
- Test with staging API

### Phase 2: Dual Mode Operation
- WebSocket for legacy compatibility
- API for new features
- Gradual migration of users

### Phase 3: API-First Architecture
- WebSocket becomes optional
- Full API integration
- Enhanced reliability and scalability

## Next Steps

1. **Implement API Client Library**
   - Shared across all extensions
   - Handles auth, retry, rate limiting

2. **Update Extension Manifests**
   - Add API domain to permissions
   - Update CSP for API calls

3. **Create Migration Guide**
   - For existing WebSocket users
   - Clear upgrade path

4. **Testing Strategy**
   - Unit tests for API client
   - Integration tests with staging
   - Load testing for queue system

## Conclusion

Alex's API design provides a solid foundation for reliable, scalable image generation. The async job queue pattern with webhooks solves the timeout issues we've faced with synchronous WebSocket approaches. The multi-provider support also gives us flexibility to optimize cost and quality based on user needs.

The key is to implement this incrementally, maintaining backward compatibility while moving toward a more robust architecture.