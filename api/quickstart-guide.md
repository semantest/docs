# Semantest Image Generation API - Quick Start Guide

## Overview

The Semantest Image Generation API provides a powerful, asynchronous solution for AI-powered image generation. This guide walks you through the complete flow from creating a chat session to receiving generated images.

## Complete Flow: NewChatRequested → Job Creation → Status Polling → Webhook

### Step 1: Create a New Chat Session

Start by creating a new chat session with image generation enabled:

```bash
curl -X POST https://api.semantest.com/v1/chat/new \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "prompt": "A serene Japanese garden with cherry blossoms",
    "imageGeneration": {
      "enabled": true,
      "provider": "dalle3",
      "size": "1024x1024",
      "quality": "hd"
    }
  }'
```

**Response:**
```json
{
  "chatId": "chat_abc123",
  "jobId": "job_xyz789",
  "status": "queued",
  "estimatedCompletionTime": "2024-12-20T10:05:00Z",
  "webhookUrl": "https://api.semantest.com/v1/webhooks/job_xyz789"
}
```

### Step 2: Monitor Job Status

Poll the job status endpoint to track progress:

```bash
curl -X GET https://api.semantest.com/v1/jobs/job_xyz789 \
  -H "X-API-Key: your-api-key"
```

**Response States:**
- `queued` - Job is waiting in the queue
- `processing` - Image generation in progress
- `completed` - Images ready for download
- `failed` - Generation failed (check error details)

### Step 3: Webhook Notifications

Configure a webhook endpoint to receive real-time updates:

```json
{
  "event": "job.status.updated",
  "timestamp": "2024-12-20T10:03:45Z",
  "job": {
    "id": "job_xyz789",
    "status": "completed",
    "images": [
      {
        "url": "https://cdn.semantest.com/images/generated_abc123.png",
        "size": "1024x1024",
        "format": "png"
      }
    ],
    "metadata": {
      "provider": "dalle3",
      "processingTime": 4523,
      "creditsUsed": 1
    }
  }
}
```

## Provider-Specific Parameters

### DALL-E 3
```json
{
  "provider": "dalle3",
  "size": "1024x1024", // or "1792x1024", "1024x1792"
  "quality": "standard", // or "hd"
  "style": "vivid" // or "natural"
}
```

### Stable Diffusion
```json
{
  "provider": "stable-diffusion",
  "model": "sdxl-turbo",
  "steps": 50,
  "cfg_scale": 7.5,
  "width": 1024,
  "height": 1024,
  "seed": 42 // optional, for reproducibility
}
```

### Midjourney
```json
{
  "provider": "midjourney",
  "version": "v6",
  "aspect_ratio": "16:9",
  "chaos": 0, // 0-100
  "stylize": 100 // 0-1000
}
```

## Rate Limiting

Each endpoint has specific rate limits:

| Endpoint | Rate Limit | Window |
|----------|------------|---------|
| `/chat/new` | 10 requests | per minute |
| `/images/generate` | 5 requests | per minute |
| `/jobs/{jobId}` | 60 requests | per minute |

When rate limited, you'll receive:
```json
{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests",
  "retryAfter": 45,
  "limit": 10,
  "window": "1m"
}
```

## Error Handling & Retry Strategies

### Common Error Codes

| Code | Description | Retry Strategy |
|------|-------------|----------------|
| `PROVIDER_UNAVAILABLE` | AI provider temporarily down | Exponential backoff, max 3 retries |
| `INVALID_PROMPT` | Prompt violates content policy | Do not retry, modify prompt |
| `QUOTA_EXCEEDED` | Monthly quota reached | Do not retry until next billing cycle |
| `PROCESSING_TIMEOUT` | Job timed out after 5 minutes | Retry once with simpler prompt |

### Retry Example

```javascript
async function generateWithRetry(prompt, maxRetries = 3) {
  let attempt = 0;
  let backoff = 1000; // Start with 1 second
  
  while (attempt < maxRetries) {
    try {
      const response = await generateImage(prompt);
      return response;
    } catch (error) {
      if (error.code === 'PROVIDER_UNAVAILABLE' && attempt < maxRetries - 1) {
        attempt++;
        await sleep(backoff);
        backoff *= 2; // Exponential backoff
      } else {
        throw error;
      }
    }
  }
}
```

## Complete Integration Example

```typescript
import { SemantestClient } from '@semantest/sdk';

const client = new SemantestClient({
  apiKey: process.env.SEMANTEST_API_KEY,
  webhookUrl: 'https://your-app.com/webhooks/semantest'
});

// Create chat with image generation
const chat = await client.chat.create({
  userId: 'user123',
  prompt: 'A futuristic city at sunset',
  imageGeneration: {
    enabled: true,
    provider: 'dalle3',
    quality: 'hd'
  }
});

// Set up webhook handler
app.post('/webhooks/semantest', (req, res) => {
  const { event, job } = req.body;
  
  if (event === 'job.status.updated' && job.status === 'completed') {
    console.log('Images ready:', job.images);
    // Process completed images
  }
  
  res.status(200).send('OK');
});
```

## Next Steps

- Review the [full API reference](/api/reference)
- Set up [webhook endpoints](/guides/webhooks)
- Configure [authentication](/guides/authentication)
- Monitor usage with our [dashboard](https://dashboard.semantest.com)

---
*Documentation by Sam the Scribe for the Semantest Team*