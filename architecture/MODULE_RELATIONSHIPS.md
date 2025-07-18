# Module Relationships - Domain-Driven Architecture

**Version**: 2.0.0  
**Date**: July 18, 2025  
**Architecture**: Domain-Driven Design

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SEMANTEST ARCHITECTURE                             │
│                        Domain-Driven Design                                │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              DOMAIN LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │
│  │ images.google.  │  │   chatgpt.com   │  │   google.com    │            │
│  │      com        │  │                 │  │                 │            │
│  │                 │  │                 │  │                 │            │
│  │ ┌─────────────┐ │  │ ┌─────────────┐ │  │ ┌─────────────┐ │            │
│  │ │   Domain    │ │  │ │   Domain    │ │  │ │   Domain    │ │            │
│  │ │  - Entities │ │  │ │  - Entities │ │  │ │  - Entities │ │            │
│  │ │  - Events   │ │  │ │  - Events   │ │  │ │  - Events   │ │            │
│  │ │  - VOs      │ │  │ │  - VOs      │ │  │ │  - VOs      │ │            │
│  │ └─────────────┘ │  │ └─────────────┘ │  │ └─────────────┘ │            │
│  │                 │  │                 │  │                 │            │
│  │ ┌─────────────┐ │  │ ┌─────────────┐ │  │ ┌─────────────┐ │            │
│  │ │ Application │ │  │ │ Application │ │  │ │ Application │ │            │
│  │ │  - Services │ │  │ │  - Services │ │  │ │  - Services │ │            │
│  │ │  - Use Cases│ │  │ │  - Use Cases│ │  │ │  - Use Cases│ │            │
│  │ └─────────────┘ │  │ └─────────────┘ │  │ └─────────────┘ │            │
│  │                 │  │                 │  │                 │            │
│  │ ┌─────────────┐ │  │ ┌─────────────┐ │  │ ┌─────────────┐ │            │
│  │ │Infrastructure│ │  │ │Infrastructure│ │  │ │Infrastructure│ │            │
│  │ │  - Adapters │ │  │ │  - Adapters │ │  │ │  - Adapters │ │            │
│  │ │  - Repos    │ │  │ │  - Repos    │ │  │ │  - Repos    │ │            │
│  │ └─────────────┘ │  │ └─────────────┘ │  │ └─────────────┘ │            │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘            │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Event Bus
                                    │
┌─────────────────────────────────────────────────────────────────────────────┐
│                           INFRASTRUCTURE LAYER                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │
│  │ nodejs.server   │  │    browser      │  │typescript.client│            │
│  │                 │  │                 │  │                 │            │
│  │ ┌─────────────┐ │  │ ┌─────────────┐ │  │ ┌─────────────┐ │            │
│  │ │Coordination │ │  │ │ Automation  │ │  │ │Event-Driven│ │            │
│  │ │  - Events   │ │  │ │  - Browser  │ │  │ │   Client    │ │            │
│  │ │  - Security │ │  │ │  - Learning │ │  │ │  - Generic  │ │            │
│  │ │  - Sessions │ │  │ │  - Storage  │ │  │ │  - Utilities│ │            │
│  │ └─────────────┘ │  │ └─────────────┘ │  │ └─────────────┘ │            │
│  │                 │  │                 │  │                 │            │
│  │ ┌─────────────┐ │  │ ┌─────────────┐ │  │ ┌─────────────┐ │            │
│  │ │   Server    │ │  │ │   Testing   │ │  │ │   Types     │ │            │
│  │ │  - HTTP     │ │  │ │  - E2E      │ │  │ │  - Generic  │ │            │
│  │ │  - WebSocket│ │  │ │  - Visual   │ │  │ │  - Client   │ │            │
│  │ │  - Security │ │  │ │  - Perf     │ │  │ │  - Events   │ │            │
│  │ └─────────────┘ │  │ └─────────────┘ │  │ └─────────────┘ │            │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘            │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Core Framework
                                    │
┌─────────────────────────────────────────────────────────────────────────────┐
│                               CORE LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                         ┌─────────────────┐                               │
│                         │   @semantest/   │                               │
│                         │      core       │                               │
│                         │                 │                               │
│                         │ ┌─────────────┐ │                               │
│                         │ │   Events    │ │                               │
│                         │ │  - Base     │ │                               │
│                         │ │  - Bus      │ │                               │
│                         │ │  - Types    │ │                               │
│                         │ └─────────────┘ │                               │
│                         │                 │                               │
│                         │ ┌─────────────┐ │                               │
│                         │ │   Types     │ │                               │
│                         │ │  - Common   │ │                               │
│                         │ │  - Generic  │ │                               │
│                         │ │  - Interfaces│ │                               │
│                         │ └─────────────┘ │                               │
│                         │                 │                               │
│                         │ ┌─────────────┐ │                               │
│                         │ │  Utilities  │ │                               │
│                         │ │  - Validation│ │                               │
│                         │ │  - Security │ │                               │
│                         │ │  - Logging  │ │                               │
│                         │ └─────────────┘ │                               │
│                         └─────────────────┘                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 🔗 Dependency Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DEPENDENCY RULES                                │
└─────────────────────────────────────────────────────────────────────────────┘

✅ ALLOWED DEPENDENCIES:
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Domain Layer   │───▶│  Core Layer     │    │Infrastructure   │
│  - Entities     │    │  - Events       │    │  - Adapters     │
│  - Events       │    │  - Types        │    │  - Repos        │
│  - VOs          │    │  - Utilities    │    │  - Clients      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       ▲                       │
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │ Application     │
                    │  - Services     │
                    │  - Use Cases    │
                    │  - Handlers     │
                    └─────────────────┘

❌ FORBIDDEN DEPENDENCIES:
┌─────────────────┐    ┌─────────────────┐
│  Core Layer     │╱╱╱▶│  Domain Layer   │  ❌ Core cannot depend on Domain
│  - Events       │    │  - Entities     │
│  - Types        │    │  - Events       │
│  - Utilities    │    │  - VOs          │
└─────────────────┘    └─────────────────┘

┌─────────────────┐    ┌─────────────────┐
│  Domain Layer   │╱╱╱▶│Infrastructure   │  ❌ Domain cannot depend on Infrastructure
│  - Entities     │    │  - Adapters     │
│  - Events       │    │  - Repos        │
│  - VOs          │    │  - Clients      │
└─────────────────┘    └─────────────────┘

┌─────────────────┐    ┌─────────────────┐
│ images.google.  │╱╱╱▶│   chatgpt.com   │  ❌ No cross-domain dependencies
│      com        │    │                 │
└─────────────────┘    └─────────────────┘
```

## 🔄 Event Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              EVENT BUS                                     │
└─────────────────────────────────────────────────────────────────────────────┘

Domain Events Flow:
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ images.google.  │    │   Event Bus     │    │   chatgpt.com   │
│      com        │    │                 │    │                 │
│                 │    │ ┌─────────────┐ │    │                 │
│ ┌─────────────┐ │    │ │  Routing    │ │    │ ┌─────────────┐ │
│ │   Events    │─┼────┼▶│  - Pub/Sub  │─┼────┼▶│   Events    │ │
│ │  - Download │ │    │ │  - Filtering│ │    │ │  - Message  │ │
│ │  - Search   │ │    │ │  - Security │ │    │ │  - Convo    │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │Application  │ │    │ │Coordination │ │    │ │Application  │ │
│ │  - Services │ │    │ │  - Security │ │    │ │  - Services │ │
│ │  - Use Cases│ │    │ │  - Audit    │ │    │ │  - Use Cases│ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         │              │ nodejs.server   │              │
         │              │                 │              │
         │              │ ┌─────────────┐ │              │
         └──────────────┼▶│Coordination │◀┼──────────────┘
                        │ │  - Events   │ │
                        │ │  - Security │ │
                        │ │  - Sessions │ │
                        │ └─────────────┘ │
                        │                 │
                        │ ┌─────────────┐ │
                        │ │   Server    │ │
                        │ │  - HTTP     │ │
                        │ │  - WebSocket│ │
                        │ │  - API      │ │
                        │ └─────────────┘ │
                        └─────────────────┘
```

## 🔐 Security Boundaries

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SECURITY LAYERS                                  │
└─────────────────────────────────────────────────────────────────────────────┘

Layer 1 - Network Security:
┌─────────────────────────────────────────────────────────────────────────────┐
│  HTTPS/TLS ┌─────────────────┐  Firewall ┌─────────────────┐  WAF          │
│  ┌─────────┤   Load Balancer │  ┌────────┤   API Gateway   │  ┌─────────┐   │
│  │         └─────────────────┘  │        └─────────────────┘  │         │   │
│  ▼                              ▼                             ▼         │   │
│ ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        │   │
│ │ nodejs.server   │    │    browser      │    │extension.chrome │        │   │
│ │  - Rate Limit   │    │  - Sandboxing   │    │  - Permissions  │        │   │
│ │  - Auth/Authz   │    │  - CSP          │    │  - Manifest     │        │   │
│ │  - Audit Log    │    │  - Isolation    │    │  - Secure Comm  │        │   │
│ └─────────────────┘    └─────────────────┘    └─────────────────┘        │   │
└─────────────────────────────────────────────────────────────────────────────┘

Layer 2 - Application Security:
┌─────────────────────────────────────────────────────────────────────────────┐
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        │
│  │ Authentication  │    │  Authorization  │    │  Input Validation│        │
│  │  - JWT Tokens   │    │  - RBAC         │    │  - Sanitization │        │
│  │  - MFA          │    │  - Permissions  │    │  - Type Checking│        │
│  │  - Session Mgmt │    │  - Context      │    │  - Rate Limiting│        │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘        │
└─────────────────────────────────────────────────────────────────────────────┘

Layer 3 - Domain Security:
┌─────────────────────────────────────────────────────────────────────────────┐
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        │
│  │ images.google.  │    │   chatgpt.com   │    │   google.com    │        │
│  │      com        │    │                 │    │                 │        │
│  │                 │    │                 │    │                 │        │
│  │ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │        │
│  │ │   Domain    │ │    │ │   Domain    │ │    │ │   Domain    │ │        │
│  │ │  - Bus Rules│ │    │ │  - Bus Rules│ │    │ │  - Bus Rules│ │        │
│  │ │  - Validation│ │    │ │  - Validation│ │    │ │  - Validation│ │        │
│  │ │  - Policies │ │    │ │  - Policies │ │    │ │  - Policies │ │        │
│  │ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │        │
│  │                 │    │                 │    │                 │        │
│  │ Security Context│    │ Security Context│    │ Security Context│        │
│  │  - User ID      │    │  - User ID      │    │  - User ID      │        │
│  │  - Session ID   │    │  - Session ID   │    │  - Session ID   │        │
│  │  - Permissions  │    │  - Permissions  │    │  - Permissions  │        │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘        │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 📊 Module Communication Matrix

| Source Module | Target Module | Communication Method | Purpose |
|---------------|---------------|---------------------|---------|
| images.google.com | Event Bus | Domain Events | Publish download events |
| chatgpt.com | Event Bus | Domain Events | Publish conversation events |
| google.com | Event Bus | Domain Events | Publish search events |
| nodejs.server | Event Bus | Event Coordination | Route and secure events |
| browser | Domain Modules | Infrastructure | Provide automation services |
| typescript.client | nodejs.server | HTTP/WebSocket | Generic client communication |
| extension.chrome | nodejs.server | WebSocket | Real-time communication |

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DEPLOYMENT TOPOLOGY                                │
└─────────────────────────────────────────────────────────────────────────────┘

Production Environment:
┌─────────────────────────────────────────────────────────────────────────────┐
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        │
│  │  Load Balancer  │    │   API Gateway   │    │   CDN/Static    │        │
│  │  - SSL Term     │    │  - Rate Limit   │    │  - Extensions   │        │
│  │  - Health Check │    │  - Auth         │    │  - Assets       │        │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘        │
│           │                       │                       │                │
│           ▼                       ▼                       ▼                │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        │
│  │ nodejs.server   │    │    Database     │    │   Redis Cache   │        │
│  │  - Cluster      │    │  - PostgreSQL   │    │  - Sessions     │        │
│  │  - Auto-scale   │    │  - Encryption   │    │  - Rate Limits  │        │
│  │  - Monitoring   │    │  - Backup       │    │  - Event Cache  │        │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘        │
│           │                       │                       │                │
│           ▼                       ▼                       ▼                │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        │
│  │   Monitoring    │    │     Logging     │    │   Security      │        │
│  │  - Prometheus   │    │  - ELK Stack    │    │  - WAF          │        │
│  │  - Grafana      │    │  - Audit Trail  │    │  - IDS/IPS      │        │
│  │  - Alerting     │    │  - Compliance   │    │  - Scanning     │        │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

**Architecture Documentation Version**: 2.0.0  
**Last Updated**: July 18, 2025  
**Next Review**: August 18, 2025