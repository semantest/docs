# Developer Guide

## Getting Started

This guide provides comprehensive information for developers working on the Semantest project, including setup instructions, development workflows, coding standards, and best practices.

## Prerequisites

### System Requirements

- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher
- **Git**: v2.30.0 or higher
- **Docker**: v20.10.0 or higher (for containerized development)
- **PostgreSQL**: v14.0 or higher (for local development)
- **Redis**: v6.2.0 or higher (for caching)

### Development Tools

- **VSCode**: Recommended IDE with the following extensions:
  - TypeScript and JavaScript Language Features
  - ESLint
  - Prettier
  - GitLens
  - Docker
  - Jest
  - Thunder Client (for API testing)
  - Better Comments
  - Bracket Pair Colorizer

- **Terminal**: Modern terminal with support for:
  - Git commands
  - npm scripts
  - Docker commands
  - SSH connections

## Project Setup

### 1. Clone the Repository

```bash
git clone https://github.com/semantest/semantest.git
cd semantest
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install all workspace dependencies
npm run install:all
```

### 3. Environment Configuration

Create environment files for different stages:

```bash
# Development environment
cp .env.example .env.development

# Test environment
cp .env.example .env.test

# Production environment (for deployment)
cp .env.example .env.production
```

Edit the environment files with your specific configuration:

```bash
# .env.development
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://semantest:password@localhost:5432/semantest_dev
REDIS_URL=redis://localhost:6379
LOG_LEVEL=debug

# Google API Configuration
GOOGLE_API_KEY=your_google_api_key
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id

# Pinterest API Configuration
PINTEREST_API_KEY=your_pinterest_api_key
PINTEREST_API_SECRET=your_pinterest_api_secret

# Instagram API Configuration
INSTAGRAM_API_KEY=your_instagram_api_key
INSTAGRAM_API_SECRET=your_instagram_api_secret
```

### 4. Database Setup

```bash
# Start PostgreSQL (if using Docker)
docker-compose up -d postgres

# Create database and run migrations
npm run db:create
npm run db:migrate

# Seed database with initial data
npm run db:seed
```

### 5. Cache Setup

```bash
# Start Redis (if using Docker)
docker-compose up -d redis

# Verify Redis connection
npm run cache:health
```

### 6. Build and Start Development Server

```bash
# Build all projects
npm run build

# Start development server
npm run dev
```

## Development Workflow

### 1. Feature Development

```bash
# Create feature branch
git checkout -b feature/new-feature-name

# Make changes and test
npm run test
npm run lint

# Commit changes
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/new-feature-name
```

### 2. Code Quality Checks

```bash
# Run all quality checks
npm run quality-gates

# Individual checks
npm run lint                # ESLint
npm run type-check         # TypeScript
npm run test:coverage      # Jest with coverage
npm run format:check       # Prettier
```

### 3. Domain Architecture Validation

```bash
# Validate domain boundaries
npm run lint:domain-boundaries

# Check architecture compliance
npm run validate-architecture

# Run domain-specific checks
npm run domain-check
```

### 4. Testing Strategy

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Test specific module
npm run test -- --testPathPattern=images.google.com

# Test with coverage
npm run test:coverage
```

## Project Structure

### Monorepo Organization

```
semantest/
├── core/                          # Core domain and shared components
│   ├── domain/                    # Domain entities, value objects, events
│   ├── application/               # Use cases and application services
│   └── infrastructure/            # Infrastructure adapters
├── images.google.com/             # Google Images domain module
├── pinterest.com/                 # Pinterest domain module
├── instagram.com/                 # Instagram domain module
├── unsplash.com/                  # Unsplash domain module
├── twitter.com/                   # Twitter domain module
├── video.google.com/              # Google Video domain module
├── extension.chrome/              # Chrome extension module
├── typescript.client/             # TypeScript client module
├── nodejs.server/                 # Node.js server module
├── browser/                       # Browser automation module
├── docs/                          # Documentation
├── eslint-plugin-ddd/             # Custom ESLint plugin for DDD
├── .github/                       # GitHub workflows and templates
├── .husky/                        # Git hooks
├── package.json                   # Root package.json
├── .eslintrc.enhanced.json        # Enhanced ESLint configuration
├── tsconfig.json                  # TypeScript configuration
└── docker-compose.yml             # Docker services
```

### Domain Module Structure

Each domain module follows the Clean Architecture pattern:

```
domain-module/
├── domain/
│   ├── entities/                  # Domain entities
│   ├── value-objects/             # Value objects
│   ├── events/                    # Domain events
│   └── services/                  # Domain services
├── application/
│   ├── use-cases/                 # Application use cases
│   ├── handlers/                  # Event handlers
│   └── ports/                     # Application ports
├── infrastructure/
│   ├── adapters/                  # External adapters
│   ├── repositories/              # Data repositories
│   └── config/                    # Configuration
├── tests/
│   ├── unit/                      # Unit tests
│   ├── integration/               # Integration tests
│   └── e2e/                       # End-to-end tests
├── package.json                   # Module dependencies
├── tsconfig.json                  # TypeScript configuration
└── jest.config.js                 # Jest configuration
```

## Coding Standards

### TypeScript Style Guide

#### 1. Naming Conventions

```typescript
// Classes: PascalCase with domain suffix
class UserAggregate { }
class EmailValueObject { }
class UserRegisteredEvent { }
class UserService { }
class UserRepository { }

// Interfaces: PascalCase without 'I' prefix
interface UserRepository { }
interface PaymentConfig { }

// Functions and variables: camelCase
const getUserById = (id: string) => { };
const userEmail = 'user@example.com';

// Constants: UPPER_CASE
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_TIMEOUT = 5000;

// Enums: PascalCase
enum UserStatus {
  Active = 'active',
  Inactive = 'inactive',
  Suspended = 'suspended'
}
```

#### 2. Type Definitions

```typescript
// Always use explicit return types for functions
function processUser(user: User): Promise<ProcessedUser> {
  return Promise.resolve(new ProcessedUser(user));
}

// Use interfaces for object shapes
interface CreateUserRequest {
  email: string;
  password: string;
  profile: UserProfile;
}

// Use type aliases for complex types
type UserID = string;
type UserRole = 'admin' | 'user' | 'moderator';
type UserEventHandler = (event: UserEvent) => Promise<void>;

// Use generics for reusable types
interface Repository<T, ID> {
  findById(id: ID): Promise<T | null>;
  save(entity: T): Promise<void>;
  delete(id: ID): Promise<void>;
}
```

#### 3. Error Handling

```typescript
// Always use specific error types
import { ValidationError, SecurityError } from '@semantest/core';

// Good: Specific error with context
function validateEmail(email: string): void {
  if (!email.includes('@')) {
    throw new ValidationError(
      'Invalid email format',
      'INVALID_EMAIL_FORMAT',
      { email }
    );
  }
}

// Good: Async error handling
async function createUser(userData: CreateUserRequest): Promise<User> {
  try {
    validateEmail(userData.email);
    return await userRepository.create(userData);
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error; // Re-throw validation errors
    }
    throw new Error('User creation failed');
  }
}
```

#### 4. Domain-Driven Design Patterns

```typescript
// Aggregate Root
class UserAggregate {
  private constructor(
    private readonly id: UserId,
    private email: Email,
    private profile: UserProfile
  ) {}

  static create(email: Email, profile: UserProfile): UserAggregate {
    const id = UserId.generate();
    return new UserAggregate(id, email, profile);
  }

  changeEmail(newEmail: Email): void {
    if (this.email.equals(newEmail)) {
      return;
    }

    this.email = newEmail;
    this.recordEvent(new UserEmailChangedEvent(this.id, newEmail));
  }

  private recordEvent(event: DomainEvent): void {
    // Record domain event
  }
}

// Value Object
class Email {
  private constructor(private readonly value: string) {}

  static create(email: string): Email {
    if (!this.isValid(email)) {
      throw new ValidationError(
        'Invalid email format',
        'INVALID_EMAIL_FORMAT',
        { email }
      );
    }
    return new Email(email);
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  private static isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

// Domain Event
class UserEmailChangedEvent implements DomainEvent {
  constructor(
    public readonly aggregateId: UserId,
    public readonly newEmail: Email,
    public readonly occurredAt: Date = new Date()
  ) {}

  get eventName(): string {
    return 'UserEmailChanged';
  }
}
```

### ESLint Configuration

The project uses enhanced ESLint rules for domain-driven design:

```json
{
  "extends": [
    "plugin:@semantest/eslint-plugin-ddd/recommended"
  ],
  "rules": {
    "@semantest/ddd/domain-boundary-enforcement": "error",
    "@semantest/ddd/aggregate-root-validation": "error",
    "@semantest/ddd/event-naming-convention": "error",
    "@semantest/ddd/value-object-immutability": "error",
    "@semantest/ddd/repository-pattern-compliance": "error",
    "@semantest/ddd/no-anemic-domain-models": "error"
  }
}
```

### Prettier Configuration

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "bracketSpacing": true,
  "endOfLine": "lf"
}
```

## Testing Guidelines

### Unit Testing

```typescript
// Example unit test
describe('UserAggregate', () => {
  describe('changeEmail', () => {
    it('should change email when new email is different', () => {
      // Arrange
      const originalEmail = Email.create('old@example.com');
      const newEmail = Email.create('new@example.com');
      const user = UserAggregate.create(originalEmail, UserProfile.create('John'));

      // Act
      user.changeEmail(newEmail);

      // Assert
      expect(user.getEmail()).toEqual(newEmail);
      expect(user.getUncommittedEvents()).toHaveLength(1);
      expect(user.getUncommittedEvents()[0]).toBeInstanceOf(UserEmailChangedEvent);
    });

    it('should not change email when new email is same as current', () => {
      // Arrange
      const email = Email.create('test@example.com');
      const user = UserAggregate.create(email, UserProfile.create('John'));

      // Act
      user.changeEmail(email);

      // Assert
      expect(user.getEmail()).toEqual(email);
      expect(user.getUncommittedEvents()).toHaveLength(0);
    });
  });
});
```

### Integration Testing

```typescript
// Example integration test
describe('UserService Integration', () => {
  let userService: UserService;
  let userRepository: UserRepository;
  let eventBus: EventBus;

  beforeEach(async () => {
    // Setup test database
    await testDatabase.reset();
    
    userRepository = new PostgresUserRepository(testDatabase);
    eventBus = new InMemoryEventBus();
    userService = new UserService(userRepository, eventBus);
  });

  it('should create user and publish event', async () => {
    // Arrange
    const createUserRequest = {
      email: 'test@example.com',
      password: 'password123',
      profile: { name: 'Test User' }
    };

    // Act
    const user = await userService.createUser(createUserRequest);

    // Assert
    expect(user).toBeDefined();
    expect(user.getEmail().toString()).toBe('test@example.com');
    
    const savedUser = await userRepository.findById(user.getId());
    expect(savedUser).toBeDefined();
    
    const publishedEvents = eventBus.getPublishedEvents();
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0]).toBeInstanceOf(UserCreatedEvent);
  });
});
```

### E2E Testing

```typescript
// Example E2E test
describe('User Registration E2E', () => {
  let app: Application;
  let request: SuperTest<Test>;

  beforeAll(async () => {
    app = await createTestApp();
    request = supertest(app);
  });

  beforeEach(async () => {
    await cleanupDatabase();
  });

  it('should register user successfully', async () => {
    // Arrange
    const registrationData = {
      email: 'test@example.com',
      password: 'password123',
      profile: { name: 'Test User' }
    };

    // Act
    const response = await request
      .post('/api/users/register')
      .send(registrationData)
      .expect(201);

    // Assert
    expect(response.body).toMatchObject({
      id: expect.any(String),
      email: 'test@example.com',
      profile: { name: 'Test User' }
    });

    // Verify user was created in database
    const user = await userRepository.findByEmail('test@example.com');
    expect(user).toBeDefined();
  });
});
```

## API Development

### REST API Design

```typescript
// Controller example
@Controller('/api/users')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/register')
  @HttpCode(201)
  async register(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.userService.createUser(createUserDto);
    return UserResponseDto.fromAggregate(user);
  }

  @Get('/:id')
  async getUser(@Param('id') id: string): Promise<UserResponseDto> {
    const userId = UserId.fromString(id);
    const user = await this.userService.getUser(userId);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    return UserResponseDto.fromAggregate(user);
  }

  @Put('/:id/email')
  async changeEmail(
    @Param('id') id: string,
    @Body() changeEmailDto: ChangeEmailDto
  ): Promise<UserResponseDto> {
    const userId = UserId.fromString(id);
    const newEmail = Email.create(changeEmailDto.email);
    
    const user = await this.userService.changeUserEmail(userId, newEmail);
    return UserResponseDto.fromAggregate(user);
  }
}
```

### Input Validation

```typescript
// DTO with validation
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  profile?: {
    name?: string;
    bio?: string;
    avatar?: string;
  };
}

export class ChangeEmailDto {
  @IsEmail()
  email: string;
}
```

### Response DTOs

```typescript
// Response DTO
export class UserResponseDto {
  id: string;
  email: string;
  profile: UserProfileDto;
  createdAt: string;
  updatedAt: string;

  static fromAggregate(user: UserAggregate): UserResponseDto {
    return {
      id: user.getId().toString(),
      email: user.getEmail().toString(),
      profile: UserProfileDto.fromValueObject(user.getProfile()),
      createdAt: user.getCreatedAt().toISOString(),
      updatedAt: user.getUpdatedAt().toISOString()
    };
  }
}

export class UserProfileDto {
  name?: string;
  bio?: string;
  avatar?: string;

  static fromValueObject(profile: UserProfile): UserProfileDto {
    return {
      name: profile.getName(),
      bio: profile.getBio(),
      avatar: profile.getAvatar()
    };
  }
}
```

## Database Development

### Migration Example

```typescript
// Migration file: 20250118000001-create-users-table.ts
import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('users', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    profile_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    profile_bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    profile_avatar: {
      type: DataTypes.STRING,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  });

  // Add indexes
  await queryInterface.addIndex('users', ['email']);
  await queryInterface.addIndex('users', ['created_at']);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('users');
}
```

### Repository Implementation

```typescript
// Repository implementation
export class PostgresUserRepository implements UserRepository {
  constructor(private readonly database: Database) {}

  async findById(id: UserId): Promise<UserAggregate | null> {
    const result = await this.database.query(
      'SELECT * FROM users WHERE id = $1',
      [id.toString()]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapToAggregate(result.rows[0]);
  }

  async findByEmail(email: Email): Promise<UserAggregate | null> {
    const result = await this.database.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toString()]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapToAggregate(result.rows[0]);
  }

  async save(user: UserAggregate): Promise<void> {
    const userData = this.mapToData(user);
    
    await this.database.query(
      `INSERT INTO users (id, email, password_hash, profile_name, profile_bio, profile_avatar)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET
         email = EXCLUDED.email,
         password_hash = EXCLUDED.password_hash,
         profile_name = EXCLUDED.profile_name,
         profile_bio = EXCLUDED.profile_bio,
         profile_avatar = EXCLUDED.profile_avatar,
         updated_at = NOW()`,
      [
        userData.id,
        userData.email,
        userData.passwordHash,
        userData.profileName,
        userData.profileBio,
        userData.profileAvatar
      ]
    );
  }

  private mapToAggregate(row: any): UserAggregate {
    const id = UserId.fromString(row.id);
    const email = Email.create(row.email);
    const profile = UserProfile.create(
      row.profile_name,
      row.profile_bio,
      row.profile_avatar
    );

    return UserAggregate.reconstitute(id, email, profile, row.created_at, row.updated_at);
  }

  private mapToData(user: UserAggregate): any {
    return {
      id: user.getId().toString(),
      email: user.getEmail().toString(),
      passwordHash: user.getPasswordHash(),
      profileName: user.getProfile().getName(),
      profileBio: user.getProfile().getBio(),
      profileAvatar: user.getProfile().getAvatar()
    };
  }
}
```

## Event-Driven Architecture

### Domain Events

```typescript
// Domain event base class
export abstract class DomainEvent {
  constructor(
    public readonly aggregateId: string,
    public readonly occurredAt: Date = new Date(),
    public readonly correlationId?: string
  ) {}

  abstract get eventName(): string;
}

// Specific domain event
export class UserEmailChangedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly oldEmail: string,
    public readonly newEmail: string,
    occurredAt?: Date,
    correlationId?: string
  ) {
    super(aggregateId, occurredAt, correlationId);
  }

  get eventName(): string {
    return 'UserEmailChanged';
  }
}
```

### Event Handlers

```typescript
// Event handler
@EventHandler(UserEmailChangedEvent)
export class UserEmailChangedHandler {
  constructor(
    private readonly emailService: EmailService,
    private readonly logger: Logger
  ) {}

  async handle(event: UserEmailChangedEvent): Promise<void> {
    try {
      await this.emailService.sendEmailConfirmation(event.newEmail);
      
      this.logger.info('Email confirmation sent', {
        userId: event.aggregateId,
        newEmail: event.newEmail,
        correlationId: event.correlationId
      });
    } catch (error) {
      this.logger.error('Failed to send email confirmation', {
        error: error.message,
        userId: event.aggregateId,
        correlationId: event.correlationId
      });
      
      throw error;
    }
  }
}
```

### Event Bus

```typescript
// Event bus implementation
export class InMemoryEventBus implements EventBus {
  private handlers: Map<string, EventHandler[]> = new Map();

  register<T extends DomainEvent>(
    eventName: string,
    handler: EventHandler<T>
  ): void {
    const handlers = this.handlers.get(eventName) || [];
    handlers.push(handler);
    this.handlers.set(eventName, handlers);
  }

  async publish<T extends DomainEvent>(event: T): Promise<void> {
    const handlers = this.handlers.get(event.eventName) || [];
    
    await Promise.all(
      handlers.map(handler => handler.handle(event))
    );
  }
}
```

## Performance Optimization

### Caching Strategy

```typescript
// Cache decorator
export function Cacheable(ttl: number = 300) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${target.constructor.name}:${propertyKey}:${JSON.stringify(args)}`;
      
      // Try to get from cache
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }
      
      // Execute original method
      const result = await originalMethod.apply(this, args);
      
      // Cache the result
      await this.cache.set(cacheKey, result, ttl);
      
      return result;
    };
  };
}

// Usage
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly cache: CacheService
  ) {}

  @Cacheable(300) // Cache for 5 minutes
  async getUserProfile(userId: UserId): Promise<UserProfile> {
    const user = await this.userRepository.findById(userId);
    return user ? user.getProfile() : null;
  }
}
```

### Database Query Optimization

```typescript
// Query builder for complex queries
export class UserQueryBuilder {
  private query: string = 'SELECT * FROM users';
  private conditions: string[] = [];
  private params: any[] = [];

  whereEmail(email: string): this {
    this.conditions.push(`email = $${this.params.length + 1}`);
    this.params.push(email);
    return this;
  }

  whereCreatedAfter(date: Date): this {
    this.conditions.push(`created_at > $${this.params.length + 1}`);
    this.params.push(date);
    return this;
  }

  orderBy(field: string, direction: 'ASC' | 'DESC' = 'ASC'): this {
    this.query += ` ORDER BY ${field} ${direction}`;
    return this;
  }

  limit(count: number): this {
    this.query += ` LIMIT $${this.params.length + 1}`;
    this.params.push(count);
    return this;
  }

  build(): { query: string; params: any[] } {
    if (this.conditions.length > 0) {
      this.query += ' WHERE ' + this.conditions.join(' AND ');
    }
    
    return {
      query: this.query,
      params: this.params
    };
  }
}

// Usage
const { query, params } = new UserQueryBuilder()
  .whereEmail('test@example.com')
  .whereCreatedAfter(new Date('2023-01-01'))
  .orderBy('created_at', 'DESC')
  .limit(10)
  .build();
```

## Monitoring and Logging

### Structured Logging

```typescript
// Logger configuration
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp(),
    errors({ stack: true }),
    json()
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' })
  ]
});

// Usage in service
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: Logger
  ) {}

  async createUser(userData: CreateUserRequest): Promise<UserAggregate> {
    const correlationId = generateCorrelationId();
    
    this.logger.info('Creating user', {
      correlationId,
      email: userData.email,
      operation: 'createUser'
    });

    try {
      const user = UserAggregate.create(
        Email.create(userData.email),
        UserProfile.create(userData.profile.name)
      );

      await this.userRepository.save(user);

      this.logger.info('User created successfully', {
        correlationId,
        userId: user.getId().toString(),
        email: userData.email
      });

      return user;
    } catch (error) {
      this.logger.error('Failed to create user', {
        correlationId,
        email: userData.email,
        error: error.message,
        stack: error.stack
      });

      throw error;
    }
  }
}
```

### Performance Monitoring

```typescript
// Performance monitoring decorator
export function Monitor() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();
      const methodName = `${target.constructor.name}.${propertyKey}`;
      
      try {
        const result = await originalMethod.apply(this, args);
        
        const duration = Date.now() - startTime;
        this.metrics.histogram('method_duration_ms', duration, {
          method: methodName,
          status: 'success'
        });
        
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        this.metrics.histogram('method_duration_ms', duration, {
          method: methodName,
          status: 'error'
        });
        
        this.metrics.increment('method_error_count', {
          method: methodName,
          error: error.constructor.name
        });
        
        throw error;
      }
    };
  };
}
```

## Deployment

### Docker Configuration

```dockerfile
# Dockerfile for production
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS runtime

RUN addgroup -g 1001 -S nodejs
RUN adduser -S semantest -u 1001

WORKDIR /app

# Copy built application
COPY --from=builder --chown=semantest:nodejs /app/dist ./dist
COPY --from=builder --chown=semantest:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=semantest:nodejs /app/package*.json ./

USER semantest

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "dist/main.js"]
```

### Environment-Specific Configuration

```typescript
// Configuration management
export class ConfigService {
  private static instance: ConfigService;
  private config: any;

  private constructor() {
    this.config = {
      app: {
        name: process.env.APP_NAME || 'semantest',
        version: process.env.APP_VERSION || '1.0.0',
        port: parseInt(process.env.PORT || '3000'),
        env: process.env.NODE_ENV || 'development'
      },
      database: {
        url: process.env.DATABASE_URL || 'postgresql://localhost:5432/semantest',
        pool: {
          min: parseInt(process.env.DB_POOL_MIN || '2'),
          max: parseInt(process.env.DB_POOL_MAX || '10')
        }
      },
      cache: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        ttl: parseInt(process.env.CACHE_TTL || '300')
      },
      logging: {
        level: process.env.LOG_LEVEL || 'info'
      }
    };
  }

  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  get<T>(key: string): T {
    return this.config[key];
  }
}
```

## Troubleshooting

### Common Issues

1. **TypeScript Compilation Errors**
   ```bash
   # Clear TypeScript cache
   rm -rf node_modules/.cache
   
   # Rebuild TypeScript
   npm run build
   ```

2. **ESLint Rule Violations**
   ```bash
   # Fix auto-fixable issues
   npm run lint:fix
   
   # Check specific domain boundaries
   npm run lint:domain-boundaries
   ```

3. **Test Failures**
   ```bash
   # Run tests with verbose output
   npm run test -- --verbose
   
   # Run specific test file
   npm run test -- --testPathPattern=UserService.test.ts
   ```

4. **Database Connection Issues**
   ```bash
   # Check database connection
   npm run db:health
   
   # Reset database
   npm run db:reset
   ```

### Debug Configuration

```typescript
// Debug configuration for VSCode
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Node.js",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/dist/main.js",
      "env": {
        "NODE_ENV": "development",
        "LOG_LEVEL": "debug"
      },
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    },
    {
      "name": "Debug Jest Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand", "--no-cache", "--no-coverage"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

## Resources

### Documentation
- [API Reference](./API_REFERENCE.md)
- [Architecture Guide](./ARCHITECTURE_GUIDE.md)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Domain-Driven Design](https://martinfowler.com/tags/domain%20driven%20design.html)

### Tools
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)
- [Jest](https://jestjs.io/)
- [Docker](https://docs.docker.com/)
- [PostgreSQL](https://www.postgresql.org/docs/)
- [Redis](https://redis.io/documentation)

### Community
- [GitHub Repository](https://github.com/semantest/semantest)
- [Issue Tracker](https://github.com/semantest/semantest/issues)
- [Contributing Guide](./CONTRIBUTING.md)

---

**Version**: 1.0.0  
**Last Updated**: January 18, 2025  
**Maintainer**: Semantest Development Team