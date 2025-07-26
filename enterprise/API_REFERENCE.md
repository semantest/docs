# Semantest Enterprise API Reference

## Overview

This comprehensive API reference covers all Semantest Enterprise endpoints, authentication, rate limiting, and integration patterns. Designed for enterprise developers building custom integrations and automation workflows.

## Table of Contents

1. [Authentication](#authentication)
2. [Base URLs & Environments](#base-urls--environments)
3. [Rate Limiting](#rate-limiting)
4. [Error Handling](#error-handling)
5. [Core API Endpoints](#core-api-endpoints)
6. [Testing API](#testing-api)
7. [Analytics API](#analytics-api)
8. [Marketplace API](#marketplace-api)
9. [Blockchain API](#blockchain-api)
10. [Internationalization API](#internationalization-api)
11. [Performance API](#performance-api)
12. [Administration API](#administration-api)
13. [Webhooks](#webhooks)
14. [SDK Libraries](#sdk-libraries)
15. [Code Examples](#code-examples)

## Authentication

### API Key Authentication

```http
GET /api/v1/tests
Authorization: Bearer <your-api-key>
Content-Type: application/json
```

### OAuth 2.0 Flow

```javascript
// Step 1: Authorization URL
const authUrl = `https://api.semantest.com/oauth/authorize?
  client_id=${clientId}&
  response_type=code&
  scope=read:tests write:tests&
  redirect_uri=${redirectUri}`;

// Step 2: Exchange code for token
const tokenResponse = await fetch('https://api.semantest.com/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    grant_type: 'authorization_code',
    client_id: clientId,
    client_secret: clientSecret,
    code: authorizationCode,
    redirect_uri: redirectUri
  })
});

const { access_token, refresh_token } = await tokenResponse.json();
```

### JWT Token Refresh

```javascript
// Refresh expired JWT token
const refreshResponse = await fetch('https://api.semantest.com/oauth/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    grant_type: 'refresh_token',
    refresh_token: refreshToken
  })
});
```

## Base URLs & Environments

```yaml
environments:
  production:
    base_url: "https://api.semantest.com"
    websocket: "wss://ws.semantest.com"
    
  staging:
    base_url: "https://staging-api.semantest.com"
    websocket: "wss://staging-ws.semantest.com"
    
  development:
    base_url: "https://dev-api.semantest.com"
    websocket: "wss://dev-ws.semantest.com"

api_version: "v1"
current_version: "2.0.0"
```

## Rate Limiting

### Rate Limit Headers

```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 5000
X-RateLimit-Remaining: 4999
X-RateLimit-Reset: 1643723400
X-RateLimit-Window: 3600
Retry-After: 3600
```

### Rate Limit Tiers

```yaml
tiers:
  free:
    requests_per_hour: 1000
    concurrent_tests: 5
    
  professional:
    requests_per_hour: 10000
    concurrent_tests: 50
    
  enterprise:
    requests_per_hour: 100000
    concurrent_tests: 500
    
  custom:
    requests_per_hour: "unlimited"
    concurrent_tests: "custom"
```

## Error Handling

### Standard Error Response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid test configuration",
    "details": {
      "field": "browser",
      "value": "invalid-browser",
      "allowed_values": ["chrome", "firefox", "safari", "edge"]
    },
    "request_id": "req_1234567890",
    "timestamp": "2025-01-19T10:30:00Z",
    "documentation_url": "https://docs.semantest.com/errors/validation"
  }
}
```

### Error Codes

```yaml
error_codes:
  # Authentication Errors (4xx)
  UNAUTHORIZED: 401           # Invalid or missing authentication
  FORBIDDEN: 403             # Insufficient permissions
  INVALID_TOKEN: 401         # Expired or malformed token
  
  # Validation Errors (4xx)
  VALIDATION_ERROR: 422      # Request validation failed
  INVALID_FORMAT: 400        # Malformed request body
  MISSING_PARAMETER: 400     # Required parameter missing
  
  # Resource Errors (4xx)
  NOT_FOUND: 404            # Resource doesn't exist
  CONFLICT: 409             # Resource conflict
  RATE_LIMITED: 429         # Rate limit exceeded
  
  # Server Errors (5xx)
  INTERNAL_ERROR: 500       # Unexpected server error
  SERVICE_UNAVAILABLE: 503  # Temporary service outage
  TIMEOUT: 504              # Request timeout
```

## Core API Endpoints

### Projects

#### List Projects

```http
GET /api/v1/projects
```

**Parameters:**
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 20, max: 100)
- `sort` (string): Sort field (name, created_at, updated_at)
- `order` (string): Sort order (asc, desc)
- `filter[status]` (string): Filter by status (active, archived)

**Response:**
```json
{
  "data": [
    {
      "id": "proj_abc123",
      "name": "E-commerce Platform",
      "description": "Main application testing suite",
      "status": "active",
      "settings": {
        "default_browser": "chrome",
        "timeout": 30000,
        "retry_count": 3
      },
      "team_id": "team_xyz789",
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-19T10:30:00Z",
      "metadata": {
        "environment": "production",
        "version": "2.1.0"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
```

#### Create Project

```http
POST /api/v1/projects
```

**Request Body:**
```json
{
  "name": "New Project",
  "description": "Project description",
  "settings": {
    "default_browser": "chrome",
    "timeout": 30000,
    "retry_count": 3,
    "parallel_execution": true
  },
  "team_id": "team_xyz789",
  "metadata": {
    "environment": "staging",
    "framework": "react"
  }
}
```

#### Update Project

```http
PUT /api/v1/projects/{project_id}
PATCH /api/v1/projects/{project_id}
```

#### Delete Project

```http
DELETE /api/v1/projects/{project_id}
```

### Teams

#### List Team Members

```http
GET /api/v1/teams/{team_id}/members
```

**Response:**
```json
{
  "data": [
    {
      "id": "user_def456",
      "email": "developer@company.com",
      "name": "John Developer",
      "role": "developer",
      "permissions": ["read:tests", "write:tests", "execute:tests"],
      "status": "active",
      "joined_at": "2025-01-01T00:00:00Z",
      "last_activity": "2025-01-19T09:45:00Z"
    }
  ]
}
```

#### Invite Team Member

```http
POST /api/v1/teams/{team_id}/invitations
```

**Request Body:**
```json
{
  "email": "newmember@company.com",
  "role": "developer",
  "permissions": ["read:tests", "write:tests"],
  "message": "Welcome to our testing team!"
}
```

## Testing API

### Test Suites

#### List Test Suites

```http
GET /api/v1/projects/{project_id}/test-suites
```

**Parameters:**
- `status` (string): Filter by status (active, draft, archived)
- `tag` (string): Filter by tag
- `browser` (string): Filter by browser type

**Response:**
```json
{
  "data": [
    {
      "id": "suite_ghi789",
      "name": "User Authentication Tests",
      "description": "Complete authentication flow testing",
      "status": "active",
      "configuration": {
        "browsers": ["chrome", "firefox"],
        "viewports": ["desktop", "mobile"],
        "timeout": 30000,
        "retry_count": 3
      },
      "tests": [
        {
          "id": "test_jkl012",
          "name": "Login with valid credentials",
          "status": "active",
          "steps": 15,
          "estimated_duration": 120
        }
      ],
      "tags": ["authentication", "critical"],
      "created_at": "2025-01-15T08:00:00Z",
      "updated_at": "2025-01-19T10:00:00Z"
    }
  ]
}
```

#### Create Test Suite

```http
POST /api/v1/projects/{project_id}/test-suites
```

**Request Body:**
```json
{
  "name": "API Integration Tests",
  "description": "Backend API testing suite",
  "configuration": {
    "browsers": ["chrome"],
    "viewports": ["desktop"],
    "timeout": 60000,
    "retry_count": 2,
    "parallel_execution": true,
    "environment_variables": {
      "API_BASE_URL": "https://api.staging.com",
      "AUTH_TOKEN": "{{SECURE_TOKEN}}"
    }
  },
  "tags": ["api", "backend", "integration"]
}
```

### Test Execution

#### Execute Test Suite

```http
POST /api/v1/test-suites/{suite_id}/execute
```

**Request Body:**
```json
{
  "configuration": {
    "browsers": ["chrome", "firefox"],
    "environment": "staging",
    "parallel": true,
    "timeout": 300000
  },
  "options": {
    "record_video": true,
    "take_screenshots": true,
    "generate_report": true,
    "notify_on_completion": true
  },
  "context": {
    "build_id": "build_12345",
    "commit_sha": "abc123def456",
    "branch": "feature/new-auth"
  }
}
```

**Response:**
```json
{
  "execution_id": "exec_mno345",
  "status": "queued",
  "estimated_duration": 450,
  "queue_position": 3,
  "webhook_url": "https://api.semantest.com/webhooks/execution/exec_mno345",
  "created_at": "2025-01-19T10:30:00Z"
}
```

#### Get Execution Status

```http
GET /api/v1/executions/{execution_id}
```

**Response:**
```json
{
  "id": "exec_mno345",
  "status": "running",
  "progress": {
    "completed": 12,
    "total": 25,
    "percentage": 48,
    "current_test": "Login validation test"
  },
  "results": {
    "passed": 10,
    "failed": 2,
    "skipped": 0,
    "pending": 13
  },
  "timing": {
    "started_at": "2025-01-19T10:32:00Z",
    "estimated_completion": "2025-01-19T10:40:00Z",
    "elapsed_time": 480
  },
  "resources": {
    "cpu_usage": 75,
    "memory_usage": 60,
    "concurrent_browsers": 3
  }
}
```

#### Stop Execution

```http
POST /api/v1/executions/{execution_id}/stop
```

### Test Results

#### Get Test Results

```http
GET /api/v1/executions/{execution_id}/results
```

**Response:**
```json
{
  "execution_id": "exec_mno345",
  "status": "completed",
  "summary": {
    "total": 25,
    "passed": 22,
    "failed": 2,
    "skipped": 1,
    "duration": 420000,
    "success_rate": 88
  },
  "tests": [
    {
      "id": "test_jkl012",
      "name": "Login with valid credentials",
      "status": "passed",
      "duration": 15000,
      "browser": "chrome",
      "viewport": "desktop",
      "screenshots": [
        "https://cdn.semantest.com/screenshots/test_jkl012_1.png"
      ],
      "video_url": "https://cdn.semantest.com/videos/test_jkl012.mp4",
      "steps": [
        {
          "name": "Navigate to login page",
          "status": "passed",
          "duration": 2000,
          "screenshot": "https://cdn.semantest.com/screenshots/step_1.png"
        }
      ],
      "error": null
    },
    {
      "id": "test_pqr678",
      "name": "Invalid password handling",
      "status": "failed",
      "duration": 8000,
      "error": {
        "message": "Element not found: .error-message",
        "type": "ElementNotFoundError",
        "stack": "ElementNotFoundError: Element not found...",
        "screenshot": "https://cdn.semantest.com/screenshots/error.png"
      }
    }
  ],
  "artifacts": {
    "report_url": "https://cdn.semantest.com/reports/exec_mno345.html",
    "junit_xml": "https://cdn.semantest.com/reports/exec_mno345.xml",
    "coverage_report": "https://cdn.semantest.com/coverage/exec_mno345.html"
  }
}
```

## Analytics API

### Test Analytics

#### Get Test Metrics

```http
GET /api/v1/analytics/tests
```

**Parameters:**
- `project_id` (string): Filter by project
- `start_date` (string): Start date (ISO 8601)
- `end_date` (string): End date (ISO 8601)
- `group_by` (string): Group by (day, week, month)
- `metrics` (array): Metrics to include

**Response:**
```json
{
  "metrics": {
    "total_executions": 1250,
    "success_rate": 94.5,
    "average_duration": 320000,
    "total_test_time": 400000000,
    "flaky_tests": 15,
    "coverage_percentage": 87.3
  },
  "trends": [
    {
      "date": "2025-01-19",
      "executions": 45,
      "success_rate": 95.6,
      "average_duration": 315000,
      "failed_tests": 2
    }
  ],
  "top_failing_tests": [
    {
      "test_id": "test_abc123",
      "name": "Payment processing test",
      "failure_rate": 15.5,
      "last_failure": "2025-01-19T09:30:00Z"
    }
  ]
}
```

### Performance Analytics

#### Get Performance Metrics

```http
GET /api/v1/analytics/performance
```

**Response:**
```json
{
  "web_vitals": {
    "largest_contentful_paint": {
      "average": 1.8,
      "p95": 2.4,
      "trend": "improving"
    },
    "first_input_delay": {
      "average": 45,
      "p95": 120,
      "trend": "stable"
    },
    "cumulative_layout_shift": {
      "average": 0.08,
      "p95": 0.15,
      "trend": "improving"
    }
  },
  "page_load_times": [
    {
      "url": "/login",
      "average_load_time": 1200,
      "samples": 450,
      "trend": "improving"
    }
  ]
}
```

## Marketplace API

### Packages

#### List Packages

```http
GET /api/v1/marketplace/packages
```

**Parameters:**
- `category` (string): Filter by category
- `search` (string): Search query
- `sort` (string): Sort by (popularity, rating, updated)

**Response:**
```json
{
  "data": [
    {
      "id": "pkg_stu901",
      "name": "advanced-selectors",
      "display_name": "Advanced CSS Selectors",
      "description": "Enhanced CSS selector utilities for complex DOM navigation",
      "version": "2.1.0",
      "category": "utilities",
      "author": {
        "name": "Semantest Team",
        "email": "team@semantest.com"
      },
      "stats": {
        "downloads": 15420,
        "rating": 4.8,
        "reviews": 124
      },
      "repository": "https://github.com/semantest/advanced-selectors",
      "license": "MIT",
      "published_at": "2025-01-15T00:00:00Z"
    }
  ]
}
```

#### Install Package

```http
POST /api/v1/projects/{project_id}/packages
```

**Request Body:**
```json
{
  "package_id": "pkg_stu901",
  "version": "2.1.0",
  "configuration": {
    "enable_debug": false,
    "custom_settings": {
      "timeout": 5000
    }
  }
}
```

### Package Publishing

#### Publish Package

```http
POST /api/v1/marketplace/packages
```

**Request Body:**
```json
{
  "name": "my-custom-package",
  "display_name": "My Custom Testing Package",
  "description": "Custom utilities for specialized testing needs",
  "version": "1.0.0",
  "category": "custom",
  "main": "index.js",
  "files": [
    "index.js",
    "lib/",
    "README.md"
  ],
  "dependencies": {
    "@semantest/core": "^2.0.0"
  },
  "keywords": ["testing", "automation", "custom"],
  "license": "MIT"
}
```

## Blockchain API

### Certification

#### Certify Test Results

```http
POST /api/v1/blockchain/certify
```

**Request Body:**
```json
{
  "execution_id": "exec_mno345",
  "metadata": {
    "compliance_framework": "FDA_21CFR11",
    "certification_level": "FULL",
    "auditor": "external_auditor_123"
  },
  "blockchain_network": "ethereum-mainnet",
  "smart_contract": "0x742d35Cc6634C0532925a3b8D4c67bb4d8d9e4f1"
}
```

**Response:**
```json
{
  "certification_id": "cert_vwx234",
  "transaction_hash": "0xabc123def456789...",
  "block_number": 12345678,
  "timestamp": "2025-01-19T10:30:00Z",
  "certification_url": "https://etherscan.io/tx/0xabc123def456789...",
  "ipfs_hash": "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
  "compliance_proof": {
    "framework": "FDA_21CFR11",
    "level": "FULL",
    "attestation": "sha256:abc123def456..."
  }
}
```

#### Verify Certification

```http
GET /api/v1/blockchain/verify/{certification_id}
```

**Response:**
```json
{
  "certification_id": "cert_vwx234",
  "status": "verified",
  "blockchain_verification": {
    "transaction_hash": "0xabc123def456789...",
    "block_number": 12345678,
    "confirmations": 120,
    "verified_at": "2025-01-19T10:35:00Z"
  },
  "data_integrity": {
    "ipfs_hash": "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
    "checksum": "sha256:abc123def456...",
    "tamper_evident": true
  },
  "compliance": {
    "framework": "FDA_21CFR11",
    "status": "compliant",
    "audit_trail": "complete"
  }
}
```

## Internationalization API

### Localization

#### Get Supported Locales

```http
GET /api/v1/i18n/locales
```

**Response:**
```json
{
  "locales": [
    {
      "code": "en-US",
      "name": "English (United States)",
      "native_name": "English",
      "coverage": 100,
      "status": "stable"
    },
    {
      "code": "es-ES",
      "name": "Spanish (Spain)",
      "native_name": "Español",
      "coverage": 95,
      "status": "stable"
    },
    {
      "code": "ja-JP",
      "name": "Japanese (Japan)",
      "native_name": "日本語",
      "coverage": 88,
      "status": "beta"
    }
  ]
}
```

#### Translate Test Content

```http
POST /api/v1/i18n/translate
```

**Request Body:**
```json
{
  "content": {
    "test_name": "User login validation",
    "test_description": "Validates user authentication flow",
    "step_descriptions": [
      "Navigate to login page",
      "Enter valid credentials",
      "Click login button",
      "Verify successful login"
    ]
  },
  "source_locale": "en-US",
  "target_locales": ["es-ES", "fr-FR", "de-DE"],
  "context": {
    "domain": "authentication",
    "product": "web-application"
  }
}
```

**Response:**
```json
{
  "translations": {
    "es-ES": {
      "test_name": "Validación de inicio de sesión de usuario",
      "test_description": "Valida el flujo de autenticación del usuario",
      "step_descriptions": [
        "Navegar a la página de inicio de sesión",
        "Ingresar credenciales válidas",
        "Hacer clic en el botón de inicio de sesión",
        "Verificar el inicio de sesión exitoso"
      ]
    }
  },
  "quality_scores": {
    "es-ES": 0.94
  },
  "translation_id": "trans_yz123"
}
```

## Performance API

### Monitoring

#### Real User Monitoring (RUM)

```http
POST /api/v1/performance/rum
```

**Request Body:**
```json
{
  "page_url": "https://app.example.com/dashboard",
  "user_agent": "Mozilla/5.0...",
  "metrics": {
    "first_contentful_paint": 1200,
    "largest_contentful_paint": 1800,
    "first_input_delay": 45,
    "cumulative_layout_shift": 0.08
  },
  "context": {
    "user_id": "user_abc123",
    "session_id": "sess_def456",
    "viewport": {
      "width": 1920,
      "height": 1080
    },
    "connection": {
      "type": "4g",
      "downlink": 10.2
    }
  }
}
```

#### Performance Budget

```http
GET /api/v1/performance/budget/{project_id}
```

**Response:**
```json
{
  "budget": {
    "largest_contentful_paint": {
      "warning": 2500,
      "error": 4000,
      "current": 1800
    },
    "first_input_delay": {
      "warning": 100,
      "error": 300,
      "current": 45
    },
    "cumulative_layout_shift": {
      "warning": 0.1,
      "error": 0.25,
      "current": 0.08
    }
  },
  "status": "passing",
  "violations": [],
  "last_updated": "2025-01-19T10:30:00Z"
}
```

## Administration API

### User Management

#### List Users

```http
GET /api/v1/admin/users
```

**Response:**
```json
{
  "data": [
    {
      "id": "user_abc123",
      "email": "admin@company.com",
      "name": "System Administrator",
      "role": "admin",
      "status": "active",
      "permissions": ["*"],
      "last_login": "2025-01-19T09:00:00Z",
      "created_at": "2025-01-01T00:00:00Z",
      "metadata": {
        "department": "Engineering",
        "cost_center": "ENG-001"
      }
    }
  ]
}
```

#### Create User

```http
POST /api/v1/admin/users
```

**Request Body:**
```json
{
  "email": "newuser@company.com",
  "name": "New User",
  "role": "developer",
  "permissions": ["read:tests", "write:tests", "execute:tests"],
  "teams": ["team_xyz789"],
  "metadata": {
    "department": "QA",
    "manager": "manager@company.com"
  }
}
```

### System Configuration

#### Get System Status

```http
GET /api/v1/admin/status
```

**Response:**
```json
{
  "status": "healthy",
  "version": "2.0.0",
  "uptime": 2592000,
  "services": {
    "api": "healthy",
    "database": "healthy",
    "queue": "healthy",
    "storage": "healthy"
  },
  "metrics": {
    "active_executions": 45,
    "queue_length": 12,
    "cpu_usage": 35,
    "memory_usage": 60,
    "disk_usage": 45
  },
  "last_deployment": "2025-01-15T08:00:00Z"
}
```

## Webhooks

### Configuration

#### Create Webhook

```http
POST /api/v1/webhooks
```

**Request Body:**
```json
{
  "url": "https://your-app.com/semantest-webhook",
  "events": ["execution.completed", "execution.failed", "test.flaky"],
  "secret": "webhook_secret_key",
  "active": true,
  "filters": {
    "project_ids": ["proj_abc123"],
    "team_ids": ["team_xyz789"]
  }
}
```

### Event Types

```yaml
webhook_events:
  # Execution Events
  execution.queued: "Test execution queued"
  execution.started: "Test execution started"
  execution.completed: "Test execution completed"
  execution.failed: "Test execution failed"
  execution.cancelled: "Test execution cancelled"
  
  # Test Events
  test.passed: "Individual test passed"
  test.failed: "Individual test failed"
  test.skipped: "Individual test skipped"
  test.flaky: "Test identified as flaky"
  
  # Project Events
  project.created: "New project created"
  project.updated: "Project configuration updated"
  project.archived: "Project archived"
  
  # Team Events
  team.member_added: "New team member added"
  team.member_removed: "Team member removed"
  team.role_changed: "Member role changed"
```

### Webhook Payload

```json
{
  "event": "execution.completed",
  "timestamp": "2025-01-19T10:30:00Z",
  "data": {
    "execution_id": "exec_mno345",
    "project_id": "proj_abc123",
    "status": "completed",
    "results": {
      "total": 25,
      "passed": 22,
      "failed": 3,
      "success_rate": 88
    },
    "duration": 420000,
    "browser": "chrome",
    "environment": "staging"
  },
  "metadata": {
    "webhook_id": "hook_def456",
    "delivery_id": "delivery_789012",
    "signature": "sha256=abc123def456..."
  }
}
```

## SDK Libraries

### Official SDKs

#### JavaScript/Node.js

```bash
npm install @semantest/sdk
```

```javascript
import { SemantestClient } from '@semantest/sdk';

const client = new SemantestClient({
  apiKey: process.env.SEMANTEST_API_KEY,
  baseUrl: 'https://api.semantest.com'
});

// Execute test suite
const execution = await client.testSuites.execute('suite_abc123', {
  browsers: ['chrome', 'firefox'],
  environment: 'staging'
});

// Wait for completion
const results = await client.executions.waitForCompletion(execution.id);
console.log(`Tests completed with ${results.summary.success_rate}% success rate`);
```

#### Python

```bash
pip install semantest-sdk
```

```python
from semantest import SemantestClient

client = SemantestClient(
    api_key=os.environ['SEMANTEST_API_KEY'],
    base_url='https://api.semantest.com'
)

# Execute test suite
execution = client.test_suites.execute('suite_abc123', {
    'browsers': ['chrome', 'firefox'],
    'environment': 'staging'
})

# Wait for completion
results = client.executions.wait_for_completion(execution['id'])
print(f"Tests completed with {results['summary']['success_rate']}% success rate")
```

#### Java

```xml
<dependency>
    <groupId>com.semantest</groupId>
    <artifactId>semantest-sdk</artifactId>
    <version>2.0.0</version>
</dependency>
```

```java
import com.semantest.SemantestClient;
import com.semantest.model.Execution;

SemantestClient client = new SemantestClient.Builder()
    .apiKey(System.getenv("SEMANTEST_API_KEY"))
    .baseUrl("https://api.semantest.com")
    .build();

// Execute test suite
Execution execution = client.testSuites().execute("suite_abc123", 
    ExecutionConfig.builder()
        .browsers(Arrays.asList("chrome", "firefox"))
        .environment("staging")
        .build()
);

// Wait for completion
ExecutionResults results = client.executions().waitForCompletion(execution.getId());
System.out.println("Success rate: " + results.getSummary().getSuccessRate() + "%");
```

## Code Examples

### Complete Integration Example

```javascript
// Complete test automation workflow
class SemantestIntegration {
  constructor(apiKey) {
    this.client = new SemantestClient({ apiKey });
  }
  
  async runFullTestSuite(projectId, environment = 'staging') {
    try {
      // 1. Get project configuration
      const project = await this.client.projects.get(projectId);
      console.log(`Running tests for: ${project.name}`);
      
      // 2. List available test suites
      const suites = await this.client.testSuites.list(projectId, {
        status: 'active',
        tags: ['smoke', 'critical']
      });
      
      // 3. Execute test suites in parallel
      const executions = await Promise.all(
        suites.data.map(suite => 
          this.client.testSuites.execute(suite.id, {
            environment,
            browsers: ['chrome', 'firefox'],
            parallel: true,
            options: {
              record_video: true,
              take_screenshots: true,
              generate_report: true
            }
          })
        )
      );
      
      // 4. Wait for all executions to complete
      const results = await Promise.all(
        executions.map(exec => 
          this.client.executions.waitForCompletion(exec.id)
        )
      );
      
      // 5. Aggregate results
      const aggregatedResults = this.aggregateResults(results);
      
      // 6. Generate compliance report
      if (aggregatedResults.success_rate >= 95) {
        await this.client.blockchain.certify(executions[0].id, {
          compliance_framework: 'SOX',
          certification_level: 'FULL'
        });
      }
      
      // 7. Send notifications
      await this.sendNotifications(aggregatedResults);
      
      return aggregatedResults;
      
    } catch (error) {
      console.error('Test execution failed:', error);
      await this.handleFailure(error);
      throw error;
    }
  }
  
  aggregateResults(results) {
    const totals = results.reduce((acc, result) => ({
      total: acc.total + result.summary.total,
      passed: acc.passed + result.summary.passed,
      failed: acc.failed + result.summary.failed,
      duration: Math.max(acc.duration, result.summary.duration)
    }), { total: 0, passed: 0, failed: 0, duration: 0 });
    
    return {
      ...totals,
      success_rate: (totals.passed / totals.total) * 100,
      results: results
    };
  }
  
  async sendNotifications(results) {
    const webhook = {
      url: process.env.SLACK_WEBHOOK_URL,
      method: 'POST',
      body: {
        text: `🧪 Test Results: ${results.passed}/${results.total} passed (${results.success_rate.toFixed(1)}%)`
      }
    };
    
    await fetch(webhook.url, {
      method: webhook.method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhook.body)
    });
  }
}

// Usage
const semantest = new SemantestIntegration(process.env.SEMANTEST_API_KEY);
const results = await semantest.runFullTestSuite('proj_abc123', 'production');
```

### CI/CD Pipeline Integration

```yaml
# GitHub Actions workflow
name: Semantest Enterprise Testing
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Semantest
        uses: semantest/setup-action@v2
        with:
          api-key: ${{ secrets.SEMANTEST_API_KEY }}
          
      - name: Run Critical Tests
        id: critical
        run: |
          semantest execute \
            --project ${{ vars.SEMANTEST_PROJECT_ID }} \
            --suites critical,smoke \
            --environment staging \
            --wait-for-completion \
            --output-format json > results.json
            
      - name: Parse Results
        id: results
        run: |
          SUCCESS_RATE=$(jq '.summary.success_rate' results.json)
          echo "success_rate=$SUCCESS_RATE" >> $GITHUB_OUTPUT
          echo "report_url=$(jq -r '.artifacts.report_url' results.json)" >> $GITHUB_OUTPUT
          
      - name: Blockchain Certification
        if: steps.results.outputs.success_rate >= 95
        run: |
          semantest certify \
            --execution-id $(jq -r '.execution_id' results.json) \
            --framework SOX \
            --level FULL
            
      - name: Comment PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const successRate = ${{ steps.results.outputs.success_rate }};
            const reportUrl = '${{ steps.results.outputs.report_url }}';
            const status = successRate >= 95 ? '✅ PASSED' : '❌ FAILED';
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## ${status} Semantest Results
              
              **Success Rate:** ${successRate}%
              
              [📊 View Detailed Report](${reportUrl})
              ${successRate >= 95 ? '\n🔐 Blockchain certified for compliance' : ''}`
            });
```

This comprehensive API reference provides complete documentation for all Semantest Enterprise endpoints with practical examples for integration and automation workflows.

---

**Last Updated**: January 19, 2025  
**Version**: 1.0.0  
**Maintainer**: Semantest Enterprise API Team  
**Support**: enterprise-api@semantest.com