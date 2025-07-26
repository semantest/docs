# System Architecture Overview

## Introduction

Semantest is a comprehensive web automation platform built on modern Event-Driven Architecture (EDA) principles. The system enables automated interaction with web applications through a modular, scalable, and secure architecture.

## Core Architecture Principles

### 1. Event-Driven Design
- **Loose Coupling**: Components communicate through events, not direct calls
- **Asynchronous Processing**: Non-blocking operations for better performance
- **Scalability**: Easy to add new components without affecting existing ones
- **Resilience**: Failure isolation and graceful degradation

### 2. Modular Architecture
- **Addon System**: Domain-specific functionality as pluggable modules
- **Core/Extension Separation**: Clear boundaries between framework and features
- **Microservices Ready**: Each component can scale independently

### 3. TypeScript-First
- **Type Safety**: Compile-time error detection
- **Developer Experience**: Better IDE support and documentation
- **Contract Definition**: Clear interfaces between components

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Client Layer                                │
├─────────────────┬──────────────────┬────────────────────────────────┤
│ Chrome Extension│   Web Client     │       SDK Client               │
│   (Modular)     │  (React/Next)    │   (TypeScript/JS)              │
└────────┬────────┴────────┬─────────┴────────┬───────────────────────┘
         │                 │                   │
         │                 ▼                   │
         │        ┌─────────────────┐         │
         │        │   REST API       │         │
         │        │  (Port 3000)     │         │
         │        └─────────────────┘         │
         │                 │                   │
         ▼                 ▼                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     WebSocket Server (Port 3004)                    │
│                                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────────┐  │
│  │Event Router │  │Message Queue │  │ Connection Manager      │  │
│  └─────────────┘  └──────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
         │                                     │
         ▼                                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        Service Layer                                 │
├─────────────────┬──────────────────┬────────────────────────────────┤
│ Image Download  │  Analytics       │     Authentication              │
│   Service       │   Service        │       Service                  │
└─────────────────┴──────────────────┴────────────────────────────────┘
         │                                     │
         ▼                                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        Data Layer                                    │
├─────────────────┬──────────────────┬────────────────────────────────┤
│   PostgreSQL    │     Redis        │      File Storage              │
│   (Primary DB)  │    (Cache)       │    (Local/Cloud)               │
└─────────────────┴──────────────────┴────────────────────────────────┘
```

## Component Details

### Chrome Extension (Modular Architecture)

The extension follows a revolutionary modular design:

```typescript
// Core Extension Structure
extension/
├── core/                    // Domain-agnostic framework
│   ├── message-bus.ts      // Event communication
│   ├── addon-manager.ts    // Addon lifecycle
│   └── websocket-client.ts // Server connection
└── addons/                 // Domain-specific modules
    ├── chatgpt/           // ChatGPT automation
    ├── google-images/     // Image search
    └── custom/            // User-defined addons
```

**Key Features**:
- Dynamic addon loading based on domain
- Isolated execution contexts
- Shared message bus for communication
- Permission-based access control

### WebSocket Server

Central hub for real-time communication:

```typescript
interface WebSocketEvents {
  // Core events
  'core:connected': { clientId: string };
  'core:disconnected': { clientId: string };
  
  // Addon events (namespaced)
  'addon:chatgpt:message': ChatGPTMessage;
  'addon:images:download': ImageDownloadRequest;
  
  // System events
  'system:error': SystemError;
  'system:health': HealthStatus;
}
```

**Features**:
- Event namespacing for clarity
- Automatic reconnection with exponential backoff
- Message queuing during disconnections
- Rate limiting per client

### REST API

Handles stateful operations and data retrieval:

```typescript
// Key endpoints
POST   /api/downloads        // Initiate download
GET    /api/queue/status     // Queue monitoring
GET    /api/messages         // Historical data
POST   /api/auth/login       // Authentication
GET    /api/health           // Health check
```

### Queue Management System

Sophisticated priority queue with retry logic:

```typescript
interface QueueItem {
  id: string;
  priority: 'high' | 'normal' | 'low';
  payload: any;
  attempts: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

class QueueManager {
  // Priority-based processing
  // Exponential backoff for retries
  // Dead letter queue for failures
  // Rate limiting integration
}
```

## Data Flow Examples

### 1. Image Download Flow

```
User clicks download → Extension addon → WebSocket event → 
Queue manager → Download service → File storage → 
Success event → Extension update → User notification
```

### 2. Real-time Message Flow

```
ChatGPT response → Extension captures → WebSocket emit →
Server broadcasts → All connected clients → UI update
```

### 3. Failover Flow

```
Local server down → Health monitor detects → 
Failover manager activates → Cloud server connection →
State restoration → Resume operations
```

## Security Architecture

### Defense in Depth

1. **Extension Security**
   - Content Security Policy (CSP)
   - Isolated addon contexts
   - Permission-based access

2. **Communication Security**
   - WSS/HTTPS in production
   - JWT authentication
   - Rate limiting

3. **Data Security**
   - Encryption at rest
   - Secure key management
   - Audit logging

## Scalability Design

### Horizontal Scaling
- Stateless services
- Load balancer ready
- Database connection pooling

### Vertical Scaling
- Resource monitoring
- Auto-scaling triggers
- Performance optimization

### Caching Strategy
- Redis for hot data
- Browser storage for offline
- CDN for static assets

## Deployment Architecture

### Local Development
```yaml
services:
  - WebSocket server (3004)
  - REST API (3000)
  - PostgreSQL (5432)
  - Redis (6379)
```

### Production (Cloud)
```yaml
services:
  - Load Balancer
  - WebSocket cluster
  - API cluster
  - Managed PostgreSQL
  - Redis cluster
  - CDN
```

## Monitoring & Observability

### Metrics Collection
- Prometheus for metrics
- Grafana for visualization
- Custom dashboards per service

### Logging
- Structured JSON logs
- Centralized log aggregation
- Log levels: ERROR, WARN, INFO, DEBUG

### Alerting
- Health check failures
- Queue depth thresholds
- Error rate spikes
- Performance degradation

## Future Architecture Considerations

### Planned Enhancements
1. **GraphQL API**: For flexible data queries
2. **gRPC**: For internal service communication
3. **Kubernetes**: For container orchestration
4. **Service Mesh**: For advanced traffic management

### Extensibility Points
- Plugin API for custom addons
- Webhook system for integrations
- Custom event handlers
- Theme system for UI

## Conclusion

Semantest's architecture is designed for:
- **Modularity**: Easy to extend and maintain
- **Scalability**: Grows with your needs
- **Security**: Defense in depth approach
- **Developer Experience**: TypeScript-first with great tooling

This architecture enables reliable web automation at scale while maintaining flexibility for future enhancements.