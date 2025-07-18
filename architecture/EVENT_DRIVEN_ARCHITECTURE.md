# Semantest Event-Driven Architecture

Visual representation of the event-driven architecture patterns used in the Semantest platform.

## Event System Overview

```mermaid
graph TB
    subgraph "Event Sources"
        UI[User Interface]
        API[API Requests]
        CRON[Scheduled Tasks]
        EXT[External Systems]
    end
    
    subgraph "Event Production"
        CMD[Commands]
        DOM[Domain Logic]
        AGG[Aggregates]
    end
    
    subgraph "Event Infrastructure"
        EBUS[Event Bus]
        ESTORE[(Event Store)]
        ELOG[(Event Log)]
    end
    
    subgraph "Event Consumption"
        PROJ[Projections]
        SAGA[Sagas]
        PROC[Process Managers]
        INT[Integrations]
    end
    
    subgraph "Read Models"
        VIEW[(View Store)]
        CACHE[(Cache)]
        SEARCH[(Search Index)]
    end
    
    UI --> CMD
    API --> CMD
    CRON --> CMD
    EXT --> CMD
    
    CMD --> DOM
    DOM --> AGG
    AGG --> EBUS
    
    EBUS --> ESTORE
    EBUS --> ELOG
    
    EBUS --> PROJ
    EBUS --> SAGA
    EBUS --> PROC
    EBUS --> INT
    
    PROJ --> VIEW
    PROJ --> CACHE
    PROJ --> SEARCH
```

## Event Types Hierarchy

```mermaid
classDiagram
    class DomainEvent {
        <<abstract>>
        +string eventId
        +string eventType
        +Date timestamp
        +string correlationId
        +string aggregateId
        +toJSON() object
    }
    
    class IntegrationEvent {
        <<abstract>>
        +string version
        +string source
    }
    
    class CommandEvent {
        <<abstract>>
        +string commandType
        +object payload
    }
    
    class NotificationEvent {
        <<abstract>>
        +string recipient
        +string channel
    }
    
    DomainEvent <|-- IntegrationEvent
    DomainEvent <|-- CommandEvent
    DomainEvent <|-- NotificationEvent
    
    class GoogleImageDownloadRequested {
        +string imageUrl
        +string fileName
        +object metadata
    }
    
    class GoogleImageDownloadCompleted {
        +string imageUrl
        +string filePath
        +number fileSize
        +number downloadTime
    }
    
    class GoogleImageDownloadFailed {
        +string imageUrl
        +string error
        +boolean retryable
    }
    
    DomainEvent <|-- GoogleImageDownloadRequested
    DomainEvent <|-- GoogleImageDownloadCompleted
    DomainEvent <|-- GoogleImageDownloadFailed
```

## Event Flow Patterns

### Command-Event Pattern

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant CommandHandler
    participant Aggregate
    participant EventStore
    participant EventBus
    participant ReadModel
    
    Client->>API: POST /download
    API->>CommandHandler: DownloadImageCommand
    CommandHandler->>Aggregate: downloadImage()
    
    Aggregate->>Aggregate: Validate Business Rules
    Aggregate->>EventStore: Save Events
    Aggregate->>EventBus: Publish Event
    
    EventBus-->>ReadModel: Update Projection
    EventBus-->>Client: WebSocket Notification
    
    API-->>Client: 202 Accepted
```

### Saga Pattern

```mermaid
stateDiagram-v2
    [*] --> DownloadRequested
    
    DownloadRequested --> FetchingImage: Start Download
    FetchingImage --> ValidatingImage: Image Fetched
    FetchingImage --> DownloadFailed: Fetch Error
    
    ValidatingImage --> ProcessingImage: Valid Image
    ValidatingImage --> DownloadFailed: Invalid Image
    
    ProcessingImage --> SavingImage: Processing Complete
    ProcessingImage --> DownloadFailed: Processing Error
    
    SavingImage --> DownloadCompleted: Save Success
    SavingImage --> DownloadFailed: Save Error
    
    DownloadFailed --> RetryDownload: Retryable
    DownloadFailed --> [*]: Not Retryable
    
    RetryDownload --> FetchingImage: Retry
    DownloadCompleted --> [*]
```

## Event Sourcing Implementation

```mermaid
graph LR
    subgraph "Write Model"
        CMD[Command] --> HANDLER[Handler]
        HANDLER --> AGG[Aggregate]
        AGG --> EVENTS[Events]
        EVENTS --> STORE[(Event Store)]
    end
    
    subgraph "Event Processing"
        STORE --> DISPATCHER[Dispatcher]
        DISPATCHER --> PROJECTOR[Projector]
        DISPATCHER --> REACTOR[Reactor]
    end
    
    subgraph "Read Model"
        PROJECTOR --> VIEWS[(View DB)]
        PROJECTOR --> CACHE[(Cache)]
        REACTOR --> EXTERNAL[External Systems]
    end
    
    subgraph "Query"
        QUERY[Query] --> VIEWS
        QUERY --> CACHE
    end
```

## Event Bus Architecture

```mermaid
graph TB
    subgraph "Publishers"
        P1[Domain Module 1]
        P2[Domain Module 2]
        P3[Domain Module 3]
    end
    
    subgraph "Event Bus Core"
        ROUTER[Event Router]
        QUEUE[Event Queue]
        DLQ[Dead Letter Queue]
        RETRY[Retry Logic]
    end
    
    subgraph "Subscribers"
        S1[Projection Handler]
        S2[Integration Handler]
        S3[Notification Handler]
        S4[Analytics Handler]
    end
    
    P1 --> ROUTER
    P2 --> ROUTER
    P3 --> ROUTER
    
    ROUTER --> QUEUE
    QUEUE --> S1
    QUEUE --> S2
    QUEUE --> S3
    QUEUE --> S4
    
    S1 -->|error| DLQ
    S2 -->|error| DLQ
    S3 -->|error| DLQ
    S4 -->|error| DLQ
    
    DLQ --> RETRY
    RETRY --> QUEUE
```

## Event Store Schema

```mermaid
erDiagram
    EVENT_STORE {
        uuid event_id PK
        string aggregate_id FK
        int version
        string event_type
        jsonb event_data
        jsonb metadata
        timestamp created_at
        string correlation_id
        string causation_id
    }
    
    AGGREGATE_SNAPSHOT {
        uuid snapshot_id PK
        string aggregate_id FK
        int version
        jsonb state
        timestamp created_at
    }
    
    EVENT_STREAM {
        string stream_id PK
        string aggregate_type
        int current_version
        timestamp last_updated
    }
    
    EVENT_STORE ||--o{ EVENT_STREAM : belongs_to
    AGGREGATE_SNAPSHOT ||--o{ EVENT_STREAM : snapshots
```

## Event Correlation

```mermaid
graph TB
    subgraph "User Action"
        UA[User Clicks Download]
    end
    
    subgraph "Correlated Events"
        E1[DownloadRequested<br/>correlationId: abc123]
        E2[ImageFetched<br/>correlationId: abc123]
        E3[ImageProcessed<br/>correlationId: abc123]
        E4[DownloadCompleted<br/>correlationId: abc123]
    end
    
    subgraph "Side Effects"
        SE1[UserNotified<br/>correlationId: abc123]
        SE2[AnalyticsRecorded<br/>correlationId: abc123]
        SE3[QuotaUpdated<br/>correlationId: abc123]
    end
    
    UA --> E1
    E1 --> E2
    E2 --> E3
    E3 --> E4
    
    E4 --> SE1
    E4 --> SE2
    E4 --> SE3
    
    style E1 fill:#f9f
    style E2 fill:#f9f
    style E3 fill:#f9f
    style E4 fill:#f9f
```

## Process Manager Pattern

```mermaid
stateDiagram-v2
    [*] --> Idle
    
    Idle --> DownloadStarted: DownloadRequested
    
    state DownloadStarted {
        [*] --> FetchingMetadata
        FetchingMetadata --> ValidatingSource
        ValidatingSource --> InitiatingDownload
    }
    
    DownloadStarted --> Downloading: MetadataReady
    
    state Downloading {
        [*] --> InProgress
        InProgress --> Paused: PauseRequested
        Paused --> InProgress: ResumeRequested
        InProgress --> Completed: DownloadFinished
    }
    
    Downloading --> Processing: FileReady
    
    state Processing {
        [*] --> VirusScanning
        VirusScanning --> Optimizing
        Optimizing --> Storing
    }
    
    Processing --> Completed: ProcessingDone
    Completed --> [*]
    
    DownloadStarted --> Failed: Error
    Downloading --> Failed: Error
    Processing --> Failed: Error
    Failed --> [*]
```

## Event Replay Architecture

```mermaid
graph TB
    subgraph "Event History"
        ES[(Event Store)]
        SNAP[(Snapshots)]
    end
    
    subgraph "Replay Process"
        REPLAY[Replay Controller]
        FILTER[Event Filter]
        BUILDER[State Builder]
    end
    
    subgraph "Target"
        AGG[Aggregate]
        PROJ[Projection]
        TEST[Test Fixture]
    end
    
    ES --> REPLAY
    SNAP --> REPLAY
    
    REPLAY --> FILTER
    FILTER --> BUILDER
    
    BUILDER --> AGG
    BUILDER --> PROJ
    BUILDER --> TEST
    
    style REPLAY fill:#f96
```

## Event-Driven Microservices

```mermaid
graph TB
    subgraph "Google Service"
        GS[Google Search]
        GE[Google Events]
    end
    
    subgraph "Images Service"
        IS[Image Processor]
        IE[Image Events]
    end
    
    subgraph "ChatGPT Service"
        CS[ChatGPT Client]
        CE[ChatGPT Events]
    end
    
    subgraph "Event Backbone"
        EB[Event Bus]
        ES[(Event Store)]
        EM[Event Monitor]
    end
    
    subgraph "Gateway"
        AG[API Gateway]
        WG[WebSocket Gateway]
    end
    
    GE --> EB
    IE --> EB
    CE --> EB
    
    EB --> ES
    EB --> EM
    
    EB --> AG
    EB --> WG
    
    AG --> GS
    AG --> IS
    AG --> CS
```

## Event Monitoring Dashboard

```mermaid
graph LR
    subgraph "Metrics Collection"
        EVT[Events]
        COLL[Collector]
        AGG[Aggregator]
    end
    
    subgraph "Storage"
        TS[(Time Series DB)]
        LOG[(Log Storage)]
    end
    
    subgraph "Visualization"
        DASH[Dashboard]
        ALERT[Alerts]
        REPORT[Reports]
    end
    
    EVT --> COLL
    COLL --> AGG
    AGG --> TS
    AGG --> LOG
    
    TS --> DASH
    TS --> ALERT
    LOG --> REPORT
    
    style DASH fill:#6f6
    style ALERT fill:#f66
```

## Event-Driven Patterns

### 1. Event Notification
Simple notification that something happened, minimal data.

### 2. Event-Carried State Transfer
Event contains all data needed by consumers.

### 3. Event Sourcing
Store all changes as events, rebuild state from events.

### 4. CQRS
Separate read and write models, connected by events.

### 5. Saga Pattern
Coordinate distributed transactions through events.

## Best Practices

1. **Idempotent Event Handlers**: Handle duplicate events gracefully
2. **Event Versioning**: Support multiple event versions
3. **Correlation IDs**: Track related events across services
4. **Dead Letter Queues**: Handle failed event processing
5. **Event Replay**: Support rebuilding state from events
6. **Monitoring**: Track event flow and processing metrics
7. **Testing**: Use event fixtures for testing