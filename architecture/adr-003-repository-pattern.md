# ADR-003: Repository Pattern for Database Abstraction

## Status
**Accepted** - December 2024

## Context
Phase 3 of the Semantest platform will introduce database persistence for user data, chat history, and generated images. We need a clean abstraction layer that allows us to switch database technologies without affecting business logic.

## Decision
We will implement the Repository Pattern with TypeScript interfaces to abstract all database operations.

## Rationale

### Why Repository Pattern?
1. **Database Agnostic**: Switch between MongoDB, PostgreSQL, etc.
2. **Testability**: Easy to mock for unit tests
3. **Type Safety**: TypeScript interfaces enforce contracts
4. **Single Responsibility**: Separates data access from business logic
5. **Future Flexibility**: Easy migration path for Phase 3

## Implementation

### Core Interfaces
```typescript
// Base repository interface
interface Repository<T, ID> {
  findById(id: ID): Promise<T | null>;
  findAll(): Promise<T[]>;
  save(entity: T): Promise<T>;
  update(id: ID, entity: Partial<T>): Promise<T>;
  delete(id: ID): Promise<boolean>;
}

// Domain-specific repository
interface ChatRepository extends Repository<Chat, string> {
  findByUserId(userId: string): Promise<Chat[]>;
  findWithImages(chatId: string): Promise<ChatWithImages>;
  updateStatus(chatId: string, status: ChatStatus): Promise<void>;
}

// Image repository with specific queries
interface ImageRepository extends Repository<Image, string> {
  findByJobId(jobId: string): Promise<Image[]>;
  findByProvider(provider: ImageProvider): Promise<Image[]>;
  deleteExpired(): Promise<number>;
}
```

### Concrete Implementations
```typescript
// Phase 1-2: In-memory implementation
class InMemoryChatRepository implements ChatRepository {
  private chats: Map<string, Chat> = new Map();
  
  async findById(id: string): Promise<Chat | null> {
    return this.chats.get(id) || null;
  }
  // ... other methods
}

// Phase 3: MongoDB implementation
class MongoChatRepository implements ChatRepository {
  constructor(private db: Db) {}
  
  async findById(id: string): Promise<Chat | null> {
    return await this.db.collection<Chat>('chats').findOne({ _id: id });
  }
  // ... other methods
}
```

### Dependency Injection
```typescript
// Service layer depends on interface, not implementation
class ChatService {
  constructor(
    private chatRepo: ChatRepository,
    private imageRepo: ImageRepository
  ) {}
  
  async createChatWithImage(data: CreateChatDto): Promise<Chat> {
    const chat = await this.chatRepo.save({
      id: generateId(),
      userId: data.userId,
      prompt: data.prompt,
      status: 'processing'
    });
    
    // Queue image generation...
    return chat;
  }
}
```

### Type Safety Benefits
```typescript
// Compile-time safety for queries
const chats = await chatRepo.findByUserId(userId); // ✅ Type-safe
const chat = await chatRepo.findByEmail(email);    // ❌ Compile error

// Entity validation
interface Chat {
  id: string;
  userId: string;
  prompt: string;
  status: ChatStatus;
  createdAt: Date;
}

// TypeScript ensures all implementations follow the contract
```

## Migration Strategy

### Phase 1-2 (Current)
```typescript
// Simple in-memory setup
const chatRepo = new InMemoryChatRepository();
const imageRepo = new InMemoryImageRepository();
```

### Phase 3 (Database)
```typescript
// Switch to MongoDB without changing services
const chatRepo = new MongoChatRepository(mongoDb);
const imageRepo = new MongoImageRepository(mongoDb);

// Or PostgreSQL
const chatRepo = new PostgresChatRepository(pgClient);
const imageRepo = new PostgresImageRepository(pgClient);
```

## Consequences

### Positive
- ✅ Clean separation of concerns
- ✅ Easy to test with mocks
- ✅ Database migration without logic changes
- ✅ Type-safe data access
- ✅ Consistent API across repositories

### Negative
- ❌ Additional abstraction layer
- ❌ Potential for leaky abstractions
- ❌ More initial setup code

### Neutral
- 🔄 Need to define clear interfaces upfront
- 🔄 Repository methods must be generic enough
- 🔄 Query complexity hidden in repositories

## Testing Strategy
```typescript
// Easy to mock for tests
const mockChatRepo: ChatRepository = {
  findById: jest.fn().mockResolvedValue(mockChat),
  save: jest.fn().mockResolvedValue(mockChat),
  // ... other methods
};

const service = new ChatService(mockChatRepo, mockImageRepo);
```

## References
- [Martin Fowler - Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- TypeScript Handbook - Interfaces
- Clean Architecture principles

---
*Architecture Decision Record by Sam the Scribe*
*Reviewed by Aria the Architect*