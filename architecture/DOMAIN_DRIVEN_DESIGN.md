# Semantest Domain-Driven Design Architecture

This document provides visual representations of the Semantest platform's Domain-Driven Design (DDD) architecture.

## Table of Contents

1. [Overall Architecture](#overall-architecture)
2. [Core Module Structure](#core-module-structure)
3. [Domain Module Structure](#domain-module-structure)
4. [Event Flow Architecture](#event-flow-architecture)
5. [Layered Architecture](#layered-architecture)
6. [Aggregate Boundaries](#aggregate-boundaries)
7. [Module Dependencies](#module-dependencies)
8. [Deployment Architecture](#deployment-architecture)

## Overall Architecture

```mermaid
graph TB
    subgraph "Presentation Layer"
        CE[Chrome Extension]
        CLI[CLI Interface]
        WEB[Web Dashboard]
    end
    
    subgraph "Application Layer"
        TC[TypeScript Client]
        API[REST API]
        WS[WebSocket Server]
    end
    
    subgraph "Domain Layer"
        subgraph "Core"
            CORE[Core Module]
            EVENTS[Event System]
            ENTITIES[Base Entities]
        end
        
        subgraph "Domain Modules"
            GOOGLE[google.com]
            IMAGES[images.google.com]
            CHATGPT[chatgpt.com]
        end
    end
    
    subgraph "Infrastructure Layer"
        BROWSER[Browser Automation]
        DB[(Database)]
        MQ[Message Queue]
        FS[File System]
    end
    
    CE --> TC
    CLI --> TC
    WEB --> API
    
    TC --> WS
    API --> WS
    WS --> EVENTS
    
    GOOGLE --> CORE
    IMAGES --> CORE
    CHATGPT --> CORE
    
    GOOGLE --> BROWSER
    IMAGES --> BROWSER
    CHATGPT --> BROWSER
    
    EVENTS --> MQ
    ENTITIES --> DB
    IMAGES --> FS
```

## Core Module Structure

```mermaid
classDiagram
    class DomainEvent {
        +string eventId
        +string eventType
        +Date timestamp
        +string correlationId
        +toJSON() object
    }
    
    class Entity {
        #DomainEvent[] _domainEvents
        +getId() string
        +equals(other) boolean
        #addDomainEvent(event)
        +getDomainEvents() DomainEvent[]
        +clearDomainEvents()
    }
    
    class AggregateRoot {
        -number version
        #applyEvent(event)
        #apply(event)*
        +getVersion() number
        +markEventsAsCommitted()
        +loadFromHistory(events)
    }
    
    class ValueObject {
        +equals(other)* boolean
        +hashCode()* number
    }
    
    class EventBus {
        <<interface>>
        +publish(event) Promise
        +publishBatch(events) Promise
        +subscribe(type, handler)
        +unsubscribe(type, handler)
    }
    
    class Repository {
        <<interface>>
        +findById(id) Promise~T~
        +save(aggregate) Promise
        +delete(id) Promise
    }
    
    Entity --|> AggregateRoot
    Entity ..> DomainEvent : emits
    EventBus ..> DomainEvent : publishes
    Repository ..> AggregateRoot : persists
```

## Domain Module Structure

```mermaid
graph TB
    subgraph "images.google.com Module"
        subgraph "Domain Layer"
            GID[GoogleImagesDownloader]
            GIE[Domain Events]
            GIV[Value Objects]
        end
        
        subgraph "Application Layer"
            GIC[Download Commands]
            GIQ[Search Queries]
            GIS[Application Services]
        end
        
        subgraph "Infrastructure Layer"
            GIA[Browser Adapter]
            GIR[Image Repository]
            GIM[Message Handler]
        end
    end
    
    GIC --> GIS
    GIQ --> GIS
    GIS --> GID
    GID --> GIE
    GID --> GIV
    
    GIA --> GID
    GIR --> GID
    GIM --> GIE
    
    style GID fill:#f9f,stroke:#333,stroke-width:4px
    style GIE fill:#bbf,stroke:#333,stroke-width:2px
    style GIV fill:#bbf,stroke:#333,stroke-width:2px
```

## Event Flow Architecture

```mermaid
sequenceDiagram
    participant User
    participant Extension
    participant Client
    participant Server
    participant EventBus
    participant Domain
    participant Infrastructure
    
    User->>Extension: Click Download
    Extension->>Client: Send Command
    Client->>Server: WebSocket Message
    Server->>EventBus: Publish Event
    EventBus->>Domain: Handle Event
    Domain->>Domain: Business Logic
    Domain->>Infrastructure: Download Image
    Infrastructure-->>Domain: Image Data
    Domain->>EventBus: Emit Completed Event
    EventBus->>Server: Event Published
    Server->>Client: WebSocket Response
    Client->>Extension: Update UI
    Extension->>User: Show Success
```

## Layered Architecture

```mermaid
graph LR
    subgraph "Clean Architecture Layers"
        subgraph "External"
            UI[User Interface]
            DB[Database]
            WEB[Web Services]
            DEV[Devices]
        end
        
        subgraph "Interface Adapters"
            CTRL[Controllers]
            PRES[Presenters]
            GATE[Gateways]
        end
        
        subgraph "Application Business Rules"
            UC[Use Cases]
            DS[Data Structures]
        end
        
        subgraph "Enterprise Business Rules"
            ENT[Entities]
            VO[Value Objects]
            AGG[Aggregates]
        end
    end
    
    UI --> CTRL
    CTRL --> UC
    UC --> ENT
    ENT --> VO
    
    UC --> GATE
    GATE --> DB
    GATE --> WEB
    
    style ENT fill:#f96,stroke:#333,stroke-width:4px
    style UC fill:#9f6,stroke:#333,stroke-width:3px
    style CTRL fill:#69f,stroke:#333,stroke-width:2px
    style UI fill:#ccc,stroke:#333,stroke-width:1px
```

## Aggregate Boundaries

```mermaid
graph TB
    subgraph "Download Aggregate"
        DA[Download Aggregate Root]
        DI[Download Item]
        DS[Download Status]
        DM[Download Metadata]
    end
    
    subgraph "Search Aggregate"
        SA[Search Aggregate Root]
        SQ[Search Query]
        SR[Search Results]
        SF[Search Filters]
    end
    
    subgraph "User Aggregate"
        UA[User Aggregate Root]
        UP[User Preferences]
        UH[User History]
        US[User Settings]
    end
    
    DA --> DI
    DA --> DS
    DA --> DM
    
    SA --> SQ
    SA --> SR
    SA --> SF
    
    UA --> UP
    UA --> UH
    UA --> US
    
    DA -.-> UA : user reference
    SA -.-> UA : user reference
    
    style DA fill:#f96,stroke:#333,stroke-width:4px
    style SA fill:#f96,stroke:#333,stroke-width:4px
    style UA fill:#f96,stroke:#333,stroke-width:4px
```

## Module Dependencies

```mermaid
graph TD
    subgraph "Domain Modules"
        CORE[["@semantest/core"]]
        BROWSER[["@semantest/browser"]]
        GOOGLE[["@semantest/google.com"]]
        IMAGES[["@semantest/images.google.com"]]
        CHATGPT[["@semantest/chatgpt.com"]]
        SERVER[["@semantest/nodejs.server"]]
        CLIENT[["@semantest/typescript.client"]]
        EXT[["@semantest/extension.chrome"]]
    end
    
    GOOGLE --> CORE
    IMAGES --> CORE
    CHATGPT --> CORE
    
    GOOGLE --> BROWSER
    IMAGES --> BROWSER
    CHATGPT --> BROWSER
    
    BROWSER --> CORE
    
    SERVER --> CORE
    CLIENT --> CORE
    EXT --> CORE
    
    CLIENT --> SERVER
    EXT --> CLIENT
    
    style CORE fill:#f96,stroke:#333,stroke-width:4px
    style BROWSER fill:#9f6,stroke:#333,stroke-width:3px
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Client Side"
        subgraph "Browser"
            EXT[Chrome Extension]
            CS[Content Scripts]
            BG[Background Script]
        end
        
        subgraph "Applications"
            WEB[Web App]
            CLI[CLI Tool]
        end
    end
    
    subgraph "Server Side"
        subgraph "API Gateway"
            LB[Load Balancer]
            APIG[API Gateway]
        end
        
        subgraph "Services"
            WS1[WebSocket Server 1]
            WS2[WebSocket Server 2]
            API1[REST API 1]
            API2[REST API 2]
        end
        
        subgraph "Infrastructure"
            REDIS[(Redis Cache)]
            PG[(PostgreSQL)]
            MQ[RabbitMQ]
            S3[S3 Storage]
        end
    end
    
    EXT --> LB
    WEB --> LB
    CLI --> LB
    
    LB --> APIG
    APIG --> WS1
    APIG --> WS2
    APIG --> API1
    APIG --> API2
    
    WS1 --> REDIS
    WS2 --> REDIS
    API1 --> PG
    API2 --> PG
    
    WS1 --> MQ
    WS2 --> MQ
    
    API1 --> S3
    API2 --> S3
```

## Domain Event Flow

```mermaid
stateDiagram-v2
    [*] --> CommandReceived
    CommandReceived --> DomainEventCreated
    DomainEventCreated --> EventPublished
    
    EventPublished --> HandlerProcessing
    HandlerProcessing --> BusinessLogicExecuted
    
    BusinessLogicExecuted --> SuccessEvent: Success
    BusinessLogicExecuted --> FailureEvent: Failure
    
    SuccessEvent --> EventStored
    FailureEvent --> EventStored
    
    EventStored --> ResponseSent
    ResponseSent --> [*]
    
    HandlerProcessing --> CompensationRequired: Error
    CompensationRequired --> CompensationEvent
    CompensationEvent --> EventStored
```

## Entity Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Created: new()
    Created --> Active: initialize()
    
    Active --> Modified: update()
    Modified --> Active: save()
    
    Active --> Deleted: delete()
    Modified --> Deleted: delete()
    
    Deleted --> [*]
    
    Active --> Archived: archive()
    Archived --> Active: restore()
    Archived --> Deleted: purge()
```

## CQRS Pattern Implementation

```mermaid
graph TB
    subgraph "Write Side"
        CMD[Command]
        CMDH[Command Handler]
        AGG[Aggregate]
        EVT[Domain Events]
        ES[(Event Store)]
    end
    
    subgraph "Read Side"
        QRY[Query]
    QRYH[Query Handler]
        PROJ[Projections]
        VIEW[(View Store)]
    end
    
    subgraph "Event Processing"
        EBUS[Event Bus]
        PROJH[Projection Handler]
    end
    
    CMD --> CMDH
    CMDH --> AGG
    AGG --> EVT
    EVT --> ES
    EVT --> EBUS
    
    EBUS --> PROJH
    PROJH --> PROJ
    PROJ --> VIEW
    
    QRY --> QRYH
    QRYH --> VIEW
    
    style CMD fill:#f96
    style QRY fill:#69f
    style EVT fill:#9f6
```

## Security Architecture

```mermaid
graph TB
    subgraph "Security Layers"
        subgraph "Perimeter Security"
            WAF[Web Application Firewall]
            DDos[DDoS Protection]
        end
        
        subgraph "Authentication"
            OAuth[OAuth 2.0]
            JWT[JWT Tokens]
            MFA[Multi-Factor Auth]
        end
        
        subgraph "Authorization"
            RBAC[Role-Based Access]
            ABAC[Attribute-Based Access]
            POL[Policy Engine]
        end
        
        subgraph "Data Security"
            ENC[Encryption at Rest]
            TLS[TLS 1.3]
            HSM[Hardware Security Module]
        end
    end
    
    WAF --> OAuth
    OAuth --> JWT
    JWT --> RBAC
    RBAC --> POL
    POL --> ENC
    
    style WAF fill:#f66
    style OAuth fill:#f96
    style RBAC fill:#fc6
    style ENC fill:#6f6
```

## Performance Architecture

```mermaid
graph LR
    subgraph "Caching Strategy"
        subgraph "L1 Cache"
            MEM[In-Memory Cache]
        end
        
        subgraph "L2 Cache"
            REDIS[Redis Cache]
        end
        
        subgraph "L3 Cache"
            CDN[CDN Cache]
        end
    end
    
    subgraph "Data Sources"
        API[API Services]
        DB[(Database)]
        FS[File System]
    end
    
    REQ[Request] --> CDN
    CDN -->|miss| MEM
    MEM -->|miss| REDIS
    REDIS -->|miss| API
    
    API --> DB
    API --> FS
    
    API -.->|populate| REDIS
    REDIS -.->|populate| MEM
    MEM -.->|populate| CDN
```

---

## Architecture Principles

### 1. Domain Isolation
Each domain module is completely isolated and can only communicate through well-defined interfaces and events.

### 2. Event-Driven Communication
All inter-module communication happens through domain events, ensuring loose coupling.

### 3. Dependency Inversion
High-level modules don't depend on low-level modules. Both depend on abstractions.

### 4. Single Responsibility
Each module, class, and method has a single, well-defined responsibility.

### 5. Open/Closed Principle
Modules are open for extension but closed for modification, achieved through proper abstraction.

## Best Practices

1. **Always emit domain events** for state changes
2. **Never bypass aggregate boundaries** when modifying state
3. **Use value objects** for domain concepts without identity
4. **Keep aggregates small** and focused on maintaining invariants
5. **Design around business capabilities**, not technical concerns