# ChatGPT Browser Extension API Documentation

## Technical API Reference for Browser Extension Integration

### Version 1.0 | API Version: v1 | Last Updated: January 2025

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Core API Endpoints](#core-api-endpoints)
4. [Project Management API](#project-management-api)
5. [Instructions API](#instructions-api)
6. [Chat Management API](#chat-management-api)
7. [Prompt API](#prompt-api)
8. [Image API](#image-api)
9. [Download API](#download-api)
10. [WebSocket Events](#websocket-events)
11. [Error Handling](#error-handling)
12. [Rate Limiting](#rate-limiting)
13. [Code Examples](#code-examples)

---

## 🌐 Overview

### Base URL
```
Production: https://api.chatgpt-extension.com/v1
Development: https://dev-api.chatgpt-extension.com/v1
```

### Request Format
- **Content-Type**: `application/json`
- **Accept**: `application/json`
- **Authorization**: `Bearer {token}`

### Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "timestamp": "2025-01-19T10:00:00Z",
  "requestId": "req_123456789"
}
```

---

## 🔐 Authentication

### OAuth 2.0 Flow

```javascript
// Initialize OAuth
const auth = new ChatGPTAuth({
  clientId: 'your-client-id',
  redirectUri: 'chrome-extension://your-extension-id/callback',
  scope: 'projects chats images'
});

// Authenticate
auth.authenticate().then(token => {
  // Store token securely
  chrome.storage.local.set({ authToken: token });
});
```

### Token Management

**Get Access Token**
```http
POST /auth/token
Content-Type: application/json

{
  "grant_type": "authorization_code",
  "code": "auth_code_from_oauth",
  "client_id": "your_client_id",
  "client_secret": "your_client_secret"
}
```

**Refresh Token**
```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "your_refresh_token"
}
```

**Response**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "refresh_token_string"
}
```

---

## 🛠️ Core API Endpoints

### Health Check

```http
GET /health
```

**Response**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2025-01-19T10:00:00Z"
}
```

### User Profile

```http
GET /user/profile
Authorization: Bearer {token}
```

**Response**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "subscription": "pro",
    "usage": {
      "projects": 15,
      "chats": 234,
      "images": 567
    }
  }
}
```

---

## 📁 Project Management API

### Create Project

```http
POST /projects
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Web Development Project",
  "description": "React application development",
  "tags": ["react", "frontend", "spa"],
  "color": "#3B82F6",
  "settings": {
    "autoSave": true,
    "syncEnabled": true,
    "notifications": false
  }
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "id": "proj_abc123",
    "name": "Web Development Project",
    "description": "React application development",
    "tags": ["react", "frontend", "spa"],
    "color": "#3B82F6",
    "createdAt": "2025-01-19T10:00:00Z",
    "updatedAt": "2025-01-19T10:00:00Z",
    "settings": {
      "autoSave": true,
      "syncEnabled": true,
      "notifications": false
    }
  }
}
```

### List Projects

```http
GET /projects?page=1&limit=20&sort=createdAt&order=desc
Authorization: Bearer {token}
```

**Query Parameters**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |
| sort | string | createdAt | Sort field |
| order | string | desc | Sort order (asc/desc) |
| search | string | - | Search query |
| tags | array | - | Filter by tags |

**Response**
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "proj_abc123",
        "name": "Web Development Project",
        "description": "React application development",
        "chatCount": 5,
        "lastActivity": "2025-01-19T09:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

### Update Project

```http
PUT /projects/{projectId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Project Name",
  "description": "Updated description",
  "tags": ["react", "typescript"],
  "archived": false
}
```

### Delete Project

```http
DELETE /projects/{projectId}
Authorization: Bearer {token}
```

---

## 📝 Instructions API

### Create Instruction Set

```http
POST /instructions
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "React Developer Assistant",
  "scope": "global", // global, project, chat
  "projectId": "proj_abc123", // Required if scope is project
  "instructions": {
    "role": "You are an expert React developer",
    "style": "Provide clean, modern React code with hooks",
    "constraints": [
      "Use functional components only",
      "Include TypeScript types",
      "Follow React best practices"
    ],
    "examples": [
      "Prefer useState over class state",
      "Use custom hooks for logic reuse"
    ]
  }
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "id": "inst_xyz789",
    "name": "React Developer Assistant",
    "scope": "global",
    "instructions": {
      "role": "You are an expert React developer",
      "style": "Provide clean, modern React code with hooks",
      "constraints": [...],
      "examples": [...]
    },
    "createdAt": "2025-01-19T10:00:00Z"
  }
}
```

### Get Instructions

```http
GET /instructions?scope=global&projectId=proj_abc123
Authorization: Bearer {token}
```

### Update Instructions

```http
PUT /instructions/{instructionId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Instructions",
  "instructions": {
    "role": "Updated role description"
  }
}
```

### Delete Instructions

```http
DELETE /instructions/{instructionId}
Authorization: Bearer {token}
```

---

## 💬 Chat Management API

### Create Chat

```http
POST /projects/{projectId}/chats
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "API Integration Discussion",
  "model": "gpt-4",
  "settings": {
    "temperature": 0.7,
    "maxTokens": 2000,
    "topP": 1,
    "frequencyPenalty": 0,
    "presencePenalty": 0
  },
  "systemMessage": "You are a helpful API integration expert"
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "id": "chat_def456",
    "projectId": "proj_abc123",
    "name": "API Integration Discussion",
    "model": "gpt-4",
    "settings": {...},
    "messageCount": 0,
    "createdAt": "2025-01-19T10:00:00Z"
  }
}
```

### List Chats

```http
GET /projects/{projectId}/chats
Authorization: Bearer {token}
```

### Get Chat Messages

```http
GET /chats/{chatId}/messages?page=1&limit=50
Authorization: Bearer {token}
```

**Response**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "msg_123",
        "role": "user",
        "content": "How do I integrate a REST API?",
        "timestamp": "2025-01-19T10:00:00Z"
      },
      {
        "id": "msg_124",
        "role": "assistant",
        "content": "To integrate a REST API...",
        "timestamp": "2025-01-19T10:00:30Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 23
    }
  }
}
```

### Update Chat

```http
PUT /chats/{chatId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Chat Name",
  "archived": false
}
```

### Delete Chat

```http
DELETE /chats/{chatId}
Authorization: Bearer {token}
```

---

## 📤 Prompt API

### Send Prompt

```http
POST /chats/{chatId}/messages
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "Explain React hooks with examples",
  "attachments": [], // Optional file attachments
  "metadata": {
    "template": "explanation",
    "variables": {}
  }
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "id": "msg_125",
    "role": "user",
    "content": "Explain React hooks with examples",
    "timestamp": "2025-01-19T10:01:00Z",
    "status": "sending"
  }
}
```

### Stream Response (WebSocket)

```javascript
// WebSocket connection for streaming responses
const ws = new WebSocket('wss://api.chatgpt-extension.com/v1/ws');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'authenticate',
    token: 'your_auth_token'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch(data.type) {
    case 'message.chunk':
      // Handle streaming text chunk
      console.log(data.content);
      break;
    case 'message.complete':
      // Handle complete message
      console.log('Message complete:', data.message);
      break;
    case 'error':
      // Handle error
      console.error('Error:', data.error);
      break;
  }
};
```

### Batch Prompts

```http
POST /chats/{chatId}/messages/batch
Authorization: Bearer {token}
Content-Type: application/json

{
  "prompts": [
    {
      "content": "Summarize this article: [article text]",
      "metadata": { "order": 1 }
    },
    {
      "content": "Extract key points",
      "metadata": { "order": 2 }
    },
    {
      "content": "Create action items",
      "metadata": { "order": 3 }
    }
  ],
  "mode": "sequential", // sequential, parallel, chained
  "options": {
    "continueOnError": true,
    "timeout": 30000
  }
}
```

---

## 🖼️ Image API

### Request Image Generation

```http
POST /images/generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "prompt": "A minimalist logo for a tech startup, blue and white colors, modern design",
  "chatId": "chat_def456", // Optional, to associate with chat
  "options": {
    "model": "dall-e-3",
    "size": "1024x1024", // 1024x1024, 1792x1024, 1024x1792
    "quality": "standard", // standard, hd
    "style": "natural", // natural, vivid
    "n": 1 // Number of images (1-4)
  }
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "id": "img_gen_789",
    "status": "processing",
    "prompt": "A minimalist logo for a tech startup...",
    "estimatedTime": 15,
    "queuePosition": 3
  }
}
```

### Get Generation Status

```http
GET /images/generate/{generationId}
Authorization: Bearer {token}
```

**Response (Complete)**
```json
{
  "success": true,
  "data": {
    "id": "img_gen_789",
    "status": "completed",
    "images": [
      {
        "id": "img_123",
        "url": "https://cdn.chatgpt-extension.com/images/img_123.png",
        "thumbnailUrl": "https://cdn.chatgpt-extension.com/images/img_123_thumb.png",
        "size": "1024x1024",
        "format": "png",
        "createdAt": "2025-01-19T10:02:00Z"
      }
    ]
  }
}
```

### Analyze Image

```http
POST /images/analyze
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "image": [binary data],
  "question": "What architectural style is shown in this image?",
  "chatId": "chat_def456",
  "options": {
    "detailLevel": "detailed", // basic, detailed, expert
    "focus": "architecture", // general, text, colors, objects, architecture
    "outputFormat": "structured" // description, structured, both
  }
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "id": "img_analysis_456",
    "analysis": {
      "description": "The image shows a modern minimalist building...",
      "structuredData": {
        "style": "Modern Minimalist",
        "features": ["Glass facade", "Clean lines", "Open spaces"],
        "period": "Contemporary (2010s-2020s)",
        "materials": ["Glass", "Steel", "Concrete"]
      },
      "confidence": 0.92
    }
  }
}
```

---

## 💾 Download API

### Download Single Image

```http
POST /images/{imageId}/download
Authorization: Bearer {token}
Content-Type: application/json

{
  "format": "png", // png, jpg, webp
  "quality": 100, // 1-100 (only for jpg)
  "width": 1024, // Optional resize
  "height": 1024 // Optional resize
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://download.chatgpt-extension.com/temp/img_123.png",
    "expiresAt": "2025-01-19T11:00:00Z",
    "size": 245678,
    "format": "png"
  }
}
```

### Bulk Download

```http
POST /images/download/bulk
Authorization: Bearer {token}
Content-Type: application/json

{
  "imageIds": ["img_123", "img_124", "img_125"],
  "format": "png",
  "quality": 90,
  "createZip": true,
  "folderStructure": "flat", // flat, grouped, dated
  "namingPattern": "{project}-{date}-{index}"
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://download.chatgpt-extension.com/bulk/batch_xyz.zip",
    "expiresAt": "2025-01-19T12:00:00Z",
    "fileCount": 3,
    "totalSize": 1234567,
    "status": "ready"
  }
}
```

### Download History

```http
GET /downloads/history?page=1&limit=20
Authorization: Bearer {token}
```

**Response**
```json
{
  "success": true,
  "data": {
    "downloads": [
      {
        "id": "dl_789",
        "type": "single", // single, bulk
        "fileName": "project-2025-01-19-001.png",
        "size": 245678,
        "downloadedAt": "2025-01-19T10:30:00Z",
        "source": {
          "imageId": "img_123",
          "chatId": "chat_def456",
          "projectId": "proj_abc123"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156
    }
  }
}
```

---

## 🔌 WebSocket Events

### Connection

```javascript
const ws = new WebSocket('wss://api.chatgpt-extension.com/v1/ws');

// Authentication
ws.send(JSON.stringify({
  type: 'auth',
  token: 'your_auth_token'
}));
```

### Event Types

**Message Events**
```javascript
// Incoming message chunk
{
  "type": "message.chunk",
  "chatId": "chat_def456",
  "messageId": "msg_126",
  "content": "React hooks are...",
  "index": 0
}

// Message complete
{
  "type": "message.complete",
  "chatId": "chat_def456",
  "messageId": "msg_126",
  "fullContent": "React hooks are functions that...",
  "usage": {
    "promptTokens": 15,
    "completionTokens": 250,
    "totalTokens": 265
  }
}

// Message error
{
  "type": "message.error",
  "chatId": "chat_def456",
  "error": {
    "code": "rate_limit",
    "message": "Rate limit exceeded"
  }
}
```

**Image Events**
```javascript
// Image generation progress
{
  "type": "image.progress",
  "generationId": "img_gen_789",
  "progress": 45,
  "status": "generating"
}

// Image complete
{
  "type": "image.complete",
  "generationId": "img_gen_789",
  "images": [...]
}
```

**System Events**
```javascript
// Connection established
{
  "type": "connection.ready",
  "sessionId": "session_123"
}

// Heartbeat
{
  "type": "ping",
  "timestamp": "2025-01-19T10:00:00Z"
}
```

---

## ⚠️ Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid project name",
    "details": {
      "field": "name",
      "constraint": "minLength",
      "value": 3
    }
  },
  "timestamp": "2025-01-19T10:00:00Z",
  "requestId": "req_123456789"
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| UNAUTHORIZED | 401 | Invalid or expired token |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Invalid request data |
| RATE_LIMIT | 429 | Rate limit exceeded |
| SERVER_ERROR | 500 | Internal server error |
| SERVICE_UNAVAILABLE | 503 | Service temporarily unavailable |

### Error Handling Example

```javascript
try {
  const response = await fetch('/api/projects', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(projectData)
  });

  const data = await response.json();
  
  if (!response.ok) {
    switch (data.error.code) {
      case 'VALIDATION_ERROR':
        // Handle validation error
        showValidationError(data.error.details);
        break;
      case 'RATE_LIMIT':
        // Handle rate limit
        const retryAfter = response.headers.get('Retry-After');
        scheduleRetry(retryAfter);
        break;
      default:
        // Handle other errors
        showGenericError(data.error.message);
    }
  }
} catch (error) {
  // Handle network errors
  console.error('Network error:', error);
}
```

---

## 🚦 Rate Limiting

### Rate Limit Headers

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642680000
X-RateLimit-Reset-After: 3600
```

### Rate Limits by Endpoint

| Endpoint | Limit | Window |
|----------|-------|---------|
| /auth/* | 10 | 5 min |
| /projects/* | 100 | 1 hour |
| /chats/*/messages | 50 | 1 min |
| /images/generate | 10 | 1 hour |
| /images/analyze | 30 | 1 hour |
| /downloads/* | 100 | 1 hour |

### Handling Rate Limits

```javascript
class RateLimitHandler {
  constructor() {
    this.queue = [];
    this.retryAfter = 0;
  }

  async makeRequest(request) {
    if (this.retryAfter > Date.now()) {
      // Wait before making request
      await this.delay(this.retryAfter - Date.now());
    }

    try {
      const response = await fetch(request.url, request.options);
      
      if (response.status === 429) {
        // Get retry after from headers
        const retryAfter = response.headers.get('Retry-After');
        this.retryAfter = Date.now() + (parseInt(retryAfter) * 1000);
        
        // Retry after delay
        await this.delay(parseInt(retryAfter) * 1000);
        return this.makeRequest(request);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

---

## 💻 Code Examples

### Complete Integration Example

```javascript
// Extension initialization
class ChatGPTExtension {
  constructor() {
    this.api = new ChatGPTAPI();
    this.storage = chrome.storage.local;
    this.ws = null;
  }

  async initialize() {
    // Load saved token
    const { authToken } = await this.storage.get(['authToken']);
    
    if (authToken) {
      this.api.setToken(authToken);
      this.connectWebSocket(authToken);
    } else {
      // Initiate authentication
      await this.authenticate();
    }
  }

  async authenticate() {
    const token = await this.api.authenticate();
    await this.storage.set({ authToken: token });
    this.connectWebSocket(token);
  }

  connectWebSocket(token) {
    this.ws = new WebSocket('wss://api.chatgpt-extension.com/v1/ws');
    
    this.ws.onopen = () => {
      this.ws.send(JSON.stringify({ type: 'auth', token }));
    };

    this.ws.onmessage = (event) => {
      this.handleWebSocketMessage(JSON.parse(event.data));
    };
  }

  async createProject(name, description) {
    try {
      const response = await this.api.post('/projects', {
        name,
        description,
        settings: {
          autoSave: true,
          syncEnabled: true
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    }
  }

  async sendPrompt(chatId, content) {
    try {
      // Send via API
      const response = await this.api.post(`/chats/${chatId}/messages`, {
        content
      });

      // Response will come through WebSocket
      return response.data;
    } catch (error) {
      console.error('Failed to send prompt:', error);
      throw error;
    }
  }

  async requestImage(prompt, options = {}) {
    try {
      const response = await this.api.post('/images/generate', {
        prompt,
        options: {
          model: 'dall-e-3',
          size: '1024x1024',
          quality: 'standard',
          n: 1,
          ...options
        }
      });

      // Poll for completion
      return await this.pollImageGeneration(response.data.id);
    } catch (error) {
      console.error('Failed to generate image:', error);
      throw error;
    }
  }

  async pollImageGeneration(generationId) {
    const maxAttempts = 30;
    const interval = 2000;

    for (let i = 0; i < maxAttempts; i++) {
      const response = await this.api.get(`/images/generate/${generationId}`);
      
      if (response.data.status === 'completed') {
        return response.data.images;
      } else if (response.data.status === 'failed') {
        throw new Error('Image generation failed');
      }

      await this.delay(interval);
    }

    throw new Error('Image generation timeout');
  }

  async downloadImage(imageId, options = {}) {
    try {
      const response = await this.api.post(`/images/${imageId}/download`, {
        format: options.format || 'png',
        quality: options.quality || 100
      });

      // Download the file
      const blob = await fetch(response.data.downloadUrl).then(r => r.blob());
      
      // Save using Chrome API
      const url = URL.createObjectURL(blob);
      chrome.downloads.download({
        url,
        filename: options.filename || `image_${imageId}.png`,
        saveAs: options.saveAs || false
      });

      return response.data;
    } catch (error) {
      console.error('Failed to download image:', error);
      throw error;
    }
  }

  handleWebSocketMessage(data) {
    switch (data.type) {
      case 'message.chunk':
        // Handle streaming message
        this.handleMessageChunk(data);
        break;
      case 'message.complete':
        // Handle complete message
        this.handleMessageComplete(data);
        break;
      case 'image.complete':
        // Handle image completion
        this.handleImageComplete(data);
        break;
      default:
        console.log('Unknown WebSocket event:', data.type);
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// API wrapper class
class ChatGPTAPI {
  constructor() {
    this.baseURL = 'https://api.chatgpt-extension.com/v1';
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

  async request(method, path, data = null) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${this.baseURL}${path}`, options);
    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error.message);
    }

    return responseData;
  }

  get(path) {
    return this.request('GET', path);
  }

  post(path, data) {
    return this.request('POST', path, data);
  }

  put(path, data) {
    return this.request('PUT', path, data);
  }

  delete(path) {
    return this.request('DELETE', path);
  }
}

// Initialize extension
const extension = new ChatGPTExtension();
extension.initialize();
```

### Browser Extension Manifest

```json
{
  "manifest_version": 3,
  "name": "ChatGPT Browser Extension",
  "version": "1.0.0",
  "description": "Enhanced ChatGPT experience with project management",
  "permissions": [
    "storage",
    "downloads",
    "activeTab"
  ],
  "host_permissions": [
    "https://api.chatgpt-extension.com/*",
    "https://chat.openai.com/*"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "content_scripts": [
    {
      "matches": ["https://chat.openai.com/*"],
      "js": ["content.js"],
      "css": ["content.css"]
    }
  ],
  "web_accessible_resources": [
    {
      "resources": ["images/*", "fonts/*"],
      "matches": ["<all_urls>"]
    }
  ]
}
```

---

## 📚 Additional Resources

### SDK Libraries

- **JavaScript/TypeScript**: `npm install @chatgpt-extension/sdk`
- **Python**: `pip install chatgpt-extension-sdk`
- **React Hooks**: `npm install @chatgpt-extension/react`

### Useful Links

- **API Status**: https://status.chatgpt-extension.com
- **Developer Portal**: https://developers.chatgpt-extension.com
- **API Playground**: https://playground.chatgpt-extension.com
- **GitHub**: https://github.com/chatgpt-extension/api-docs

### Support

- **Developer Support**: dev-support@chatgpt-extension.com
- **API Issues**: https://github.com/chatgpt-extension/api/issues
- **Discord**: https://discord.gg/chatgpt-extension-dev

---

*This documentation is subject to change. Always refer to the latest version at https://docs.chatgpt-extension.com/api*