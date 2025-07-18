# Semantest Hexagonal Architecture

Visual representation of the hexagonal (ports and adapters) architecture pattern used in the Semantest platform.

## Hexagonal Architecture Overview

```mermaid
graph TB
    subgraph "External Actors"
        USER[Users]
        CLI[CLI Tools]
        WEB[Web UI]
        EXT[Extensions]
        CRON[Schedulers]
    end
    
    subgraph "Primary Adapters"
        REST[REST API Adapter]
        GQL[GraphQL Adapter]
        WS[WebSocket Adapter]
        CMD[Command Line Adapter]
    end
    
    subgraph "Application Core (Hexagon)"
        subgraph "Primary Ports"
            UC[Use Cases]
            CS[Command Services]
            QS[Query Services]
        end
        
        subgraph "Domain"
            ENT[Entities]
            VO[Value Objects]
            AGG[Aggregates]
            DS[Domain Services]
        end
        
        subgraph "Secondary Ports"
            REPO[Repository Port]
            EVENT[Event Port]
            NOTIF[Notification Port]
            BROWSE[Browser Port]
        end
    end
    
    subgraph "Secondary Adapters"
        DB[Database Adapter]
        MQ[Message Queue Adapter]
        EMAIL[Email Adapter]
        BROWSER[Browser Adapter]
        FS[File System Adapter]
    end
    
    USER --> REST
    CLI --> CMD
    WEB --> GQL
    EXT --> WS
    CRON --> REST
    
    REST --> UC
    GQL --> QS
    WS --> CS
    CMD --> UC
    
    UC --> ENT
    CS --> AGG
    QS --> DS
    
    ENT --> REPO
    AGG --> EVENT
    DS --> NOTIF
    UC --> BROWSE
    
    REPO --> DB
    EVENT --> MQ
    NOTIF --> EMAIL
    BROWSE --> BROWSER
    DS --> FS
```

## Port Definitions

```mermaid
classDiagram
    class IDownloadService {
        <<interface>>
        +downloadImage(url: string, options: DownloadOptions) Promise~DownloadResult~
        +downloadBatch(urls: string[]) Promise~BatchResult~
        +getDownloadStatus(id: string) Promise~DownloadStatus~
        +cancelDownload(id: string) Promise~void~
    }
    
    class IImageRepository {
        <<interface>>
        +save(image: Image) Promise~void~
        +findById(id: string) Promise~Image~
        +findByUrl(url: string) Promise~Image~
        +delete(id: string) Promise~void~
    }
    
    class IEventPublisher {
        <<interface>>
        +publish(event: DomainEvent) Promise~void~
        +publishBatch(events: DomainEvent[]) Promise~void~
    }
    
    class IBrowserAutomation {
        <<interface>>
        +navigate(url: string) Promise~void~
        +screenshot() Promise~Buffer~
        +click(selector: string) Promise~void~
        +evaluate(script: string) Promise~any~
    }
    
    class INotificationService {
        <<interface>>
        +notify(recipient: string, message: Message) Promise~void~
        +notifyBatch(notifications: Notification[]) Promise~void~
    }
```

## Adapter Implementations

```mermaid
classDiagram
    class MongoImageRepository {
        -client: MongoClient
        -db: Database
        +save(image: Image) Promise~void~
        +findById(id: string) Promise~Image~
        +findByUrl(url: string) Promise~Image~
        +delete(id: string) Promise~void~
    }
    
    class RabbitMQEventPublisher {
        -connection: Connection
        -channel: Channel
        +publish(event: DomainEvent) Promise~void~
        +publishBatch(events: DomainEvent[]) Promise~void~
    }
    
    class PlaywrightBrowserAdapter {
        -browser: Browser
        -page: Page
        +navigate(url: string) Promise~void~
        +screenshot() Promise~Buffer~
        +click(selector: string) Promise~void~
        +evaluate(script: string) Promise~any~
    }
    
    IImageRepository <|.. MongoImageRepository
    IEventPublisher <|.. RabbitMQEventPublisher
    IBrowserAutomation <|.. PlaywrightBrowserAdapter
```

## Use Case Flow

```mermaid
sequenceDiagram
    participant HTTP as HTTP Adapter
    participant UC as Use Case
    participant DOM as Domain Service
    participant REPO as Repository Port
    participant EVENT as Event Port
    participant DB as Database Adapter
    participant MQ as Message Queue
    
    HTTP->>UC: Download Image Request
    UC->>DOM: Validate & Process
    DOM->>REPO: Check if exists
    REPO->>DB: Query
    DB-->>REPO: Result
    REPO-->>DOM: Image data
    
    alt Image not exists
        DOM->>DOM: Download Image
        DOM->>REPO: Save Image
        REPO->>DB: Insert
        DOM->>EVENT: Publish DownloadCompleted
        EVENT->>MQ: Send Event
    end
    
    DOM-->>UC: Download Result
    UC-->>HTTP: Response
```

## Domain Module Structure

```mermaid
graph TB
    subgraph "images.google.com Module"
        subgraph "Adapters Layer"
            subgraph "Primary Adapters"
                HTTP[HTTP Controller]
                GRPC[gRPC Service]
                CLI[CLI Commands]
            end
            
            subgraph "Secondary Adapters"
                MONGO[MongoDB Repository]
                RABBIT[RabbitMQ Publisher]
                CHROME[Chrome Browser]
            end
        end
        
        subgraph "Application Layer"
            UC1[DownloadImageUseCase]
            UC2[SearchImagesUseCase]
            UC3[BatchDownloadUseCase]
        end
        
        subgraph "Domain Layer"
            IMG[Image Entity]
            DL[Download Aggregate]
            SRCH[Search Service]
        end
        
        subgraph "Ports Layer"
            subgraph "Primary Ports"
                IDS[IDownloadService]
                ISS[ISearchService]
            end
            
            subgraph "Secondary Ports"
                IIR[IImageRepository]
                IEP[IEventPublisher]
                IBA[IBrowserAutomation]
            end
        end
    end
    
    HTTP --> UC1
    GRPC --> UC2
    CLI --> UC3
    
    UC1 --> IDS
    UC2 --> ISS
    UC3 --> IDS
    
    IDS --> DL
    ISS --> SRCH
    
    DL --> IIR
    DL --> IEP
    SRCH --> IBA
    
    IIR --> MONGO
    IEP --> RABBIT
    IBA --> CHROME
```

## Dependency Inversion

```mermaid
graph BT
    subgraph "Infrastructure Layer"
        EXPRESS[Express Server]
        MONGODB[MongoDB Client]
        RABBITMQ[RabbitMQ Client]
        PLAYWRIGHT[Playwright Browser]
    end
    
    subgraph "Adapter Layer"
        EXPADAPTER[Express Adapter]
        DBADAPTER[Database Adapter]
        MQADAPTER[MQ Adapter]
        BRADAPTER[Browser Adapter]
    end
    
    subgraph "Port Interfaces"
        HTTPPORT[HTTP Port]
        REPOPORT[Repository Port]
        EVENTPORT[Event Port]
        BROWSEPORT[Browser Port]
    end
    
    subgraph "Application Core"
        USECASE[Use Cases]
        DOMAIN[Domain Logic]
    end
    
    EXPRESS --> EXPADAPTER
    MONGODB --> DBADAPTER
    RABBITMQ --> MQADAPTER
    PLAYWRIGHT --> BRADAPTER
    
    EXPADAPTER -.-> HTTPPORT
    DBADAPTER -.-> REPOPORT
    MQADAPTER -.-> EVENTPORT
    BRADAPTER -.-> BROWSEPORT
    
    USECASE --> HTTPPORT
    DOMAIN --> REPOPORT
    DOMAIN --> EVENTPORT
    DOMAIN --> BROWSEPORT
    
    style HTTPPORT fill:#f9f,stroke:#333,stroke-width:2px,stroke-dasharray: 5 5
    style REPOPORT fill:#f9f,stroke:#333,stroke-width:2px,stroke-dasharray: 5 5
    style EVENTPORT fill:#f9f,stroke:#333,stroke-width:2px,stroke-dasharray: 5 5
    style BROWSEPORT fill:#f9f,stroke:#333,stroke-width:2px,stroke-dasharray: 5 5
```

## Testing Strategy

```mermaid
graph TB
    subgraph "Test Types"
        subgraph "Unit Tests"
            DT[Domain Tests]
            UCT[Use Case Tests]
            VT[Value Object Tests]
        end
        
        subgraph "Integration Tests"
            AT[Adapter Tests]
            PT[Port Tests]
            RT[Repository Tests]
        end
        
        subgraph "E2E Tests"
            FT[Full Flow Tests]
            API[API Tests]
            UI[UI Tests]
        end
    end
    
    subgraph "Test Doubles"
        STUB[Port Stubs]
        MOCK[Mock Adapters]
        FAKE[Fake Repositories]
        SPY[Event Spies]
    end
    
    DT --> STUB
    UCT --> MOCK
    AT --> FAKE
    PT --> SPY
```

## Configuration Management

```mermaid
graph LR
    subgraph "Environment"
        ENV[Environment Variables]
        SECRETS[Secrets Manager]
        CONFIG[Config Files]
    end
    
    subgraph "Configuration Adapters"
        ENVADAPTER[Env Adapter]
        SECRETADAPTER[Secret Adapter]
        FILEADAPTER[File Adapter]
    end
    
    subgraph "Configuration Port"
        CONFIGPORT[IConfiguration]
    end
    
    subgraph "Application"
        APP[Application Core]
        ADAPTERS[Adapters]
    end
    
    ENV --> ENVADAPTER
    SECRETS --> SECRETADAPTER
    CONFIG --> FILEADAPTER
    
    ENVADAPTER --> CONFIGPORT
    SECRETADAPTER --> CONFIGPORT
    FILEADAPTER --> CONFIGPORT
    
    CONFIGPORT --> APP
    CONFIGPORT --> ADAPTERS
```

## Multi-Adapter Pattern

```mermaid
graph TB
    subgraph "Browser Automation Port"
        BA[IBrowserAutomation]
    end
    
    subgraph "Multiple Implementations"
        PW[Playwright Adapter]
        PP[Puppeteer Adapter]
        SEL[Selenium Adapter]
        CDP[CDP Adapter]
    end
    
    subgraph "Selection Strategy"
        FACTORY[Adapter Factory]
        CONFIG[Configuration]
    end
    
    subgraph "Application"
        UC[Use Case]
    end
    
    UC --> BA
    
    BA --> FACTORY
    CONFIG --> FACTORY
    
    FACTORY --> PW
    FACTORY --> PP
    FACTORY --> SEL
    FACTORY --> CDP
    
    style BA fill:#f9f,stroke:#333,stroke-width:2px,stroke-dasharray: 5 5
```

## Port Types

### Primary Ports (Driving)
- **Use Case Interfaces**: Define application capabilities
- **Query Interfaces**: Read-only operations
- **Command Interfaces**: State-changing operations

### Secondary Ports (Driven)
- **Repository Interfaces**: Data persistence
- **Event Publisher Interfaces**: Event distribution
- **External Service Interfaces**: Third-party integrations
- **Infrastructure Interfaces**: System resources

## Advantages of Hexagonal Architecture

1. **Testability**: Easy to test with mock adapters
2. **Flexibility**: Swap implementations without changing core
3. **Maintainability**: Clear separation of concerns
4. **Portability**: Core logic independent of infrastructure
5. **Scalability**: Add new adapters without modifying core

## Implementation Guidelines

### 1. Define Ports First
```typescript
// Primary Port
interface IDownloadService {
  downloadImage(url: string): Promise<DownloadResult>;
}

// Secondary Port
interface IImageRepository {
  save(image: Image): Promise<void>;
  findByUrl(url: string): Promise<Image | null>;
}
```

### 2. Implement Core Logic
```typescript
class DownloadService implements IDownloadService {
  constructor(
    private repository: IImageRepository,
    private browser: IBrowserAutomation,
    private eventPublisher: IEventPublisher
  ) {}
  
  async downloadImage(url: string): Promise<DownloadResult> {
    // Core business logic here
  }
}
```

### 3. Create Adapters
```typescript
class MongoImageRepository implements IImageRepository {
  async save(image: Image): Promise<void> {
    // MongoDB-specific implementation
  }
  
  async findByUrl(url: string): Promise<Image | null> {
    // MongoDB-specific query
  }
}
```

### 4. Wire Everything Together
```typescript
// Dependency injection
const repository = new MongoImageRepository(mongoClient);
const browser = new PlaywrightAdapter();
const eventPublisher = new RabbitMQPublisher(connection);

const downloadService = new DownloadService(
  repository,
  browser,
  eventPublisher
);

const httpAdapter = new ExpressAdapter(downloadService);
```

## Anti-Patterns to Avoid

1. **Framework Leakage**: Don't let framework specifics leak into core
2. **Anemic Domain**: Keep business logic in domain, not in adapters
3. **Port Pollution**: Don't create too many fine-grained ports
4. **Adapter Logic**: Keep adapters thin, logic belongs in core
5. **Direct Dependencies**: Always depend on ports, not concrete implementations