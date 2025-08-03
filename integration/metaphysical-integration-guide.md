# Metaphysical Integration Guide

## Overview

The Semantest browser extension now powers Metaphysical's image generation capabilities through our comprehensive API integration.

## Key Features

### Batch Image Generation
- Process up to 100 images per request
- Support for DALL-E 3, Stable Diffusion, and Midjourney
- Automatic provider selection based on request type

### API Endpoints

#### Create Batch Job
```bash
POST /api/v1/metaphysical/batch
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "images": [
    {
      "prompt": "A serene mountain landscape",
      "provider": "dalle3",
      "size": "1024x1024"
    }
  ],
  "webhookUrl": "https://your-domain.com/webhook",
  "metadata": {
    "projectId": "proj_123",
    "userId": "user_456"
  }
}
```

#### Check Job Status
```bash
GET /api/v1/metaphysical/batch/{jobId}
Authorization: Bearer YOUR_API_KEY
```

### Webhook Callbacks

Your webhook will receive updates:

```json
{
  "jobId": "job_789",
  "status": "completed",
  "images": [
    {
      "id": "img_123",
      "url": "https://cdn.semantest.com/images/...",
      "prompt": "A serene mountain landscape",
      "provider": "dalle3"
    }
  ],
  "completedAt": "2024-08-03T16:40:00Z"
}
```

## Rate Limiting

- 1000 requests per hour per API key
- 10,000 images per day per account
- Burst limit: 100 requests per minute

## Error Handling

All errors follow our standard format:

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "API rate limit exceeded",
    "details": {
      "limit": 1000,
      "reset": "2024-08-03T17:00:00Z"
    }
  }
}
```

## Security

- All requests must use HTTPS
- API keys must be kept secure
- Webhook endpoints must validate signatures
- CORS enabled for approved domains only

## Getting Started

1. Obtain API credentials from Semantest dashboard
2. Configure webhook endpoint
3. Install necessary SDKs
4. Start with test mode
5. Move to production

## Support

- Documentation: https://docs.semantest.com/metaphysical
- API Status: https://status.semantest.com
- Support: support@semantest.com

---
*Integration guide v1.0 - Sunday, August 3, 2024*