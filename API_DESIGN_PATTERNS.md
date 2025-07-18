# API Design Patterns

## 🎯 Overview

This document defines the consistent API design patterns and conventions used across all Semantest API endpoints.

## 🌐 RESTful Design Principles

### Resource-Based URLs
- **Pattern**: `/resources/{id}/sub-resources`
- **Examples**:
  - `GET /videos/{videoId}`
  - `GET /channels/{channelId}/videos`
  - `POST /playlists/{playlistId}/videos`

### HTTP Methods Semantic Usage
| Method | Purpose | Idempotent | Safe |
|--------|---------|------------|------|
| GET    | Retrieve resource | ✅ | ✅ |
| POST   | Create resource | ❌ | ❌ |
| PUT    | Update/Replace resource | ✅ | ❌ |
| PATCH  | Partial update | ❌ | ❌ |
| DELETE | Remove resource | ✅ | ❌ |

### Status Codes
| Code | Meaning | Usage |
|------|---------|-------|
| 200  | OK | Successful GET, PUT, PATCH |
| 201  | Created | Successful POST |
| 202  | Accepted | Async operation started |
| 204  | No Content | Successful DELETE |
| 400  | Bad Request | Invalid request data |
| 401  | Unauthorized | Authentication required |
| 403  | Forbidden | Insufficient permissions |
| 404  | Not Found | Resource doesn't exist |
| 409  | Conflict | Resource state conflict |
| 422  | Unprocessable Entity | Validation failed |
| 429  | Too Many Requests | Rate limit exceeded |
| 500  | Internal Server Error | Server error |

## 📝 Request/Response Patterns

### Request Structure
```json
{
  "data": {
    "type": "video",
    "attributes": {
      "title": "Video Title",
      "description": "Video description"
    },
    "relationships": {
      "channel": {
        "data": { "type": "channel", "id": "channel_123" }
      }
    }
  },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Response Structure
```json
{
  "data": {
    "type": "video",
    "id": "video_123",
    "attributes": {
      "title": "Video Title",
      "description": "Video description",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    },
    "relationships": {
      "channel": {
        "data": { "type": "channel", "id": "channel_123" }
      }
    }
  },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "1.0.0"
  }
}
```

### Error Response Structure
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "field": "title",
        "code": "REQUIRED",
        "message": "Title is required"
      }
    ]
  },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "1.0.0"
  }
}
```

## 📊 Pagination Patterns

### Cursor-Based Pagination
```json
{
  "data": [...],
  "pagination": {
    "cursor": "eyJpZCI6IjEyMyIsInRzIjoiMjAyNC0wMS0xNSJ9",
    "limit": 20,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

### Offset-Based Pagination
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 1000,
    "totalPages": 50,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

### Pagination Headers
```http
Link: <https://api.semantest.com/v1/videos?page=2>; rel="next",
      <https://api.semantest.com/v1/videos?page=50>; rel="last"
X-Total-Count: 1000
X-Page-Count: 50
```

## 🔍 Filtering and Sorting

### Query Parameters
```http
GET /videos?filter[status]=published&filter[category]=music&sort=-createdAt,title&page=1&limit=20
```

### Filter Operators
| Operator | Description | Example |
|----------|-------------|---------|
| `eq` | Equal | `filter[status]=published` |
| `ne` | Not equal | `filter[status][ne]=draft` |
| `lt` | Less than | `filter[views][lt]=1000` |
| `lte` | Less than or equal | `filter[views][lte]=1000` |
| `gt` | Greater than | `filter[views][gt]=1000` |
| `gte` | Greater than or equal | `filter[views][gte]=1000` |
| `in` | In array | `filter[category][in]=music,entertainment` |
| `nin` | Not in array | `filter[category][nin]=spam,adult` |
| `contains` | Contains substring | `filter[title][contains]=tutorial` |
| `startswith` | Starts with | `filter[title][startswith]=How to` |
| `endswith` | Ends with | `filter[title][endswith]=2024` |

### Sort Parameters
- **Ascending**: `sort=createdAt` or `sort=+createdAt`
- **Descending**: `sort=-createdAt`
- **Multiple**: `sort=-createdAt,title`

## 🔄 Asynchronous Operations

### Async Operation Pattern
```json
{
  "data": {
    "type": "operation",
    "id": "op_abc123",
    "attributes": {
      "status": "pending",
      "progress": 0,
      "createdAt": "2024-01-15T10:30:00Z",
      "estimatedCompletion": "2024-01-15T10:35:00Z"
    }
  },
  "meta": {
    "pollUrl": "/operations/op_abc123",
    "webhookUrl": "/webhooks/operations"
  }
}
```

### Operation Status Values
- `pending`: Operation queued
- `processing`: Operation in progress
- `completed`: Operation successful
- `failed`: Operation failed
- `cancelled`: Operation cancelled

### Progress Tracking
```http
GET /operations/{operationId}
```

```json
{
  "data": {
    "type": "operation",
    "id": "op_abc123",
    "attributes": {
      "status": "processing",
      "progress": 45.5,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:32:00Z",
      "estimatedCompletion": "2024-01-15T10:35:00Z",
      "result": null,
      "error": null
    }
  }
}
```

## 🔐 Authentication Patterns

### API Key Authentication
```http
GET /videos
Authorization: Bearer sk_abc123def456
X-API-Key: sk_abc123def456
```

### JWT Authentication
```http
GET /videos
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### OAuth2 Authentication
```http
GET /videos
Authorization: Bearer oauth2_access_token
```

## 🏷️ Resource Identification

### ID Patterns
- **Format**: `{resource_type}_{unique_id}`
- **Examples**:
  - `video_abc123def456`
  - `channel_def456ghi789`
  - `playlist_ghi789jkl012`

### UUID vs Custom IDs
- **UUID**: For internal system resources
- **Custom**: For external platform resources (YouTube IDs, etc.)

## 📅 Timestamp Patterns

### ISO 8601 Format
```json
{
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  "publishedAt": "2024-01-15T08:00:00-05:00"
}
```

### Timezone Handling
- **Storage**: UTC timezone
- **Display**: User's timezone preference
- **API**: Always include timezone information

## 🎛️ Feature Flags

### Feature Flag Header
```http
X-Feature-Flags: new-ui=true,beta-features=false
```

### Feature Flag Response
```json
{
  "data": {...},
  "meta": {
    "features": {
      "new-ui": true,
      "beta-features": false
    }
  }
}
```

## 🔍 Search Patterns

### Search Endpoints
```http
GET /search?q=javascript+tutorial&type=video&category=education
GET /videos/search?q=javascript+tutorial&category=education
```

### Search Response
```json
{
  "data": [...],
  "meta": {
    "query": "javascript tutorial",
    "totalResults": 10000,
    "searchTime": 0.15,
    "suggestions": [
      "javascript tutorial for beginners",
      "javascript tutorial advanced"
    ]
  }
}
```

## 📊 Batch Operations

### Batch Request
```json
{
  "operations": [
    {
      "method": "POST",
      "url": "/videos",
      "body": {...}
    },
    {
      "method": "GET",
      "url": "/videos/123"
    }
  ]
}
```

### Batch Response
```json
{
  "results": [
    {
      "status": 201,
      "body": {...}
    },
    {
      "status": 200,
      "body": {...}
    }
  ]
}
```

## 📝 Content Negotiation

### Accept Headers
```http
Accept: application/json
Accept: application/vnd.semantest.v1+json
Accept: application/xml
```

### Content-Type Headers
```http
Content-Type: application/json
Content-Type: application/vnd.semantest.v1+json
Content-Type: multipart/form-data
```

## 🔄 Caching Patterns

### Cache Headers
```http
Cache-Control: public, max-age=300
ETag: "abc123def456"
Last-Modified: Mon, 15 Jan 2024 10:30:00 GMT
```

### Conditional Requests
```http
If-None-Match: "abc123def456"
If-Modified-Since: Mon, 15 Jan 2024 10:30:00 GMT
```

## 🎯 Rate Limiting

### Rate Limit Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642248600
X-RateLimit-Window: 3600
```

### Rate Limit Response
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded",
    "retryAfter": 60
  }
}
```

## 📋 Validation Patterns

### Validation Rules
- **Required Fields**: Must be present
- **Format Validation**: Email, URL, date formats
- **Range Validation**: Min/max values
- **Pattern Validation**: Regular expressions
- **Business Rules**: Domain-specific validation

### Validation Response
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "validationErrors": [
      {
        "field": "email",
        "code": "INVALID_FORMAT",
        "message": "Email format is invalid",
        "value": "not-an-email"
      }
    ]
  }
}
```

## 🔒 Security Patterns

### CORS Headers
```http
Access-Control-Allow-Origin: https://app.semantest.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Max-Age: 86400
```

### Security Headers
```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
```

## 📈 Monitoring and Observability

### Request Tracing
```http
X-Request-ID: req_abc123def456
X-Correlation-ID: corr_def456ghi789
```

### Performance Headers
```http
X-Response-Time: 150ms
X-Cache-Status: HIT
X-Server-ID: server-01
```

---

**Last Updated**: 2024-01-15  
**Next Review**: 2024-04-15  
**Version**: 1.0.0