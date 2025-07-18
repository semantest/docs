# Semantest Testing Standards

Comprehensive testing standards for the Semantest platform ensuring quality, reliability, and maintainability.

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Test Types and Coverage](#test-types-and-coverage)
3. [Unit Testing](#unit-testing)
4. [Integration Testing](#integration-testing)
5. [End-to-End Testing](#end-to-end-testing)
6. [Test Organization](#test-organization)
7. [Testing Best Practices](#testing-best-practices)
8. [Mocking and Stubbing](#mocking-and-stubbing)
9. [Performance Testing](#performance-testing)
10. [Security Testing](#security-testing)

## Testing Philosophy

### Core Principles

1. **Test Behavior, Not Implementation**
   - Focus on what the code does, not how it does it
   - Tests should survive refactoring

2. **Fast and Reliable**
   - Tests must run quickly and consistently
   - No flaky tests allowed

3. **Clear and Maintainable**
   - Tests serve as documentation
   - Easy to understand and modify

4. **Comprehensive Coverage**
   - Critical paths must have 100% coverage
   - Overall target: 80%+ coverage

## Test Types and Coverage

### Testing Pyramid

```
         /\
        /  \  E2E Tests (10%)
       /----\    - User workflows
      /      \   - Critical paths
     /--------\  - Browser automation
    /          \ Integration Tests (30%)
   /            \  - API endpoints
  /              \ - Module boundaries
 /                \- External services
/                  \ Unit Tests (60%)
                     - Business logic
                     - Domain entities
                     - Utilities
```

### Coverage Requirements

| Component Type | Minimum Coverage | Target Coverage |
|----------------|------------------|-----------------|
| Domain Logic | 95% | 100% |
| API Endpoints | 90% | 95% |
| Utilities | 85% | 90% |
| Infrastructure | 70% | 80% |
| UI Components | 70% | 80% |

## Unit Testing

### Test Structure

```typescript
// user.entity.spec.ts
import { User } from './user.entity';
import { UserCreatedEvent } from '../events/user-created.event';
import { InvalidEmailError } from '../errors/invalid-email.error';

describe('User Entity', () => {
  describe('create', () => {
    it('should create a user with valid data', () => {
      // Arrange
      const name = 'John Doe';
      const email = 'john@example.com';

      // Act
      const user = User.create(name, email);

      // Assert
      expect(user.getName()).toBe(name);
      expect(user.getEmail()).toBe(email);
      expect(user.getId()).toBeDefined();
    });

    it('should emit UserCreatedEvent when created', () => {
      // Arrange
      const name = 'John Doe';
      const email = 'john@example.com';

      // Act
      const user = User.create(name, email);
      const events = user.getDomainEvents();

      // Assert
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(UserCreatedEvent);
      expect(events[0].userId).toBe(user.getId());
    });

    it('should throw error for invalid email', () => {
      // Arrange
      const name = 'John Doe';
      const invalidEmail = 'not-an-email';

      // Act & Assert
      expect(() => User.create(name, invalidEmail))
        .toThrow(InvalidEmailError);
    });
  });

  describe('changeName', () => {
    let user: User;

    beforeEach(() => {
      user = User.create('John Doe', 'john@example.com');
      user.clearDomainEvents(); // Clear creation event
    });

    it('should update name and emit event', () => {
      // Arrange
      const newName = 'Jane Doe';

      // Act
      user.changeName(newName);

      // Assert
      expect(user.getName()).toBe(newName);
      const events = user.getDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('user.name-changed');
    });

    it('should not accept empty name', () => {
      // Act & Assert
      expect(() => user.changeName(''))
        .toThrow('Name cannot be empty');
    });
  });
});
```

### Testing Value Objects

```typescript
// email.value-object.spec.ts
describe('Email Value Object', () => {
  describe('create', () => {
    it.each([
      ['user@example.com'],
      ['test.user+tag@example.co.uk'],
      ['123@test.com']
    ])('should accept valid email: %s', (validEmail) => {
      const email = Email.create(validEmail);
      expect(email.value).toBe(validEmail.toLowerCase());
    });

    it.each([
      ['not-an-email'],
      ['@example.com'],
      ['user@'],
      ['user @example.com'],
      ['']
    ])('should reject invalid email: %s', (invalidEmail) => {
      expect(() => Email.create(invalidEmail))
        .toThrow(InvalidEmailError);
    });
  });

  describe('equals', () => {
    it('should be equal for same email', () => {
      const email1 = Email.create('user@example.com');
      const email2 = Email.create('USER@EXAMPLE.COM');
      
      expect(email1.equals(email2)).toBe(true);
    });

    it('should not be equal for different emails', () => {
      const email1 = Email.create('user1@example.com');
      const email2 = Email.create('user2@example.com');
      
      expect(email1.equals(email2)).toBe(false);
    });
  });
});
```

### Testing Domain Services

```typescript
// user-validation.service.spec.ts
describe('UserValidationService', () => {
  let service: UserValidationService;
  let userRepository: MockRepository<User>;

  beforeEach(() => {
    userRepository = new MockRepository();
    service = new UserValidationService(userRepository);
  });

  describe('isEmailAvailable', () => {
    it('should return true for available email', async () => {
      // Arrange
      userRepository.findByEmail.mockResolvedValue(null);

      // Act
      const result = await service.isEmailAvailable('new@example.com');

      // Assert
      expect(result).toBe(true);
      expect(userRepository.findByEmail).toHaveBeenCalledWith('new@example.com');
    });

    it('should return false for taken email', async () => {
      // Arrange
      const existingUser = TestUtils.createUser({ email: 'taken@example.com' });
      userRepository.findByEmail.mockResolvedValue(existingUser);

      // Act
      const result = await service.isEmailAvailable('taken@example.com');

      // Assert
      expect(result).toBe(false);
    });
  });
});
```

## Integration Testing

### API Endpoint Testing

```typescript
// user.controller.integration.spec.ts
import { TestServer } from '@semantest/testing';
import { UserModule } from '../user.module';

describe('User API Integration', () => {
  let server: TestServer;

  beforeAll(async () => {
    server = await TestServer.create({
      modules: [UserModule],
      database: 'test-db'
    });
  });

  afterAll(async () => {
    await server.close();
  });

  beforeEach(async () => {
    await server.clearDatabase();
  });

  describe('POST /users', () => {
    it('should create user with valid data', async () => {
      // Arrange
      const userData = {
        name: 'John Doe',
        email: 'john@example.com'
      };

      // Act
      const response = await server.request()
        .post('/users')
        .send(userData)
        .expect(201);

      // Assert
      expect(response.body).toMatchObject({
        id: expect.any(String),
        name: userData.name,
        email: userData.email,
        createdAt: expect.any(String)
      });

      // Verify in database
      const user = await server.database.users.findByEmail(userData.email);
      expect(user).toBeDefined();
    });

    it('should return 400 for invalid email', async () => {
      // Arrange
      const userData = {
        name: 'John Doe',
        email: 'invalid-email'
      };

      // Act
      const response = await server.request()
        .post('/users')
        .send(userData)
        .expect(400);

      // Assert
      expect(response.body).toMatchObject({
        error: 'VALIDATION_ERROR',
        message: expect.stringContaining('email')
      });
    });

    it('should return 409 for duplicate email', async () => {
      // Arrange
      const email = 'existing@example.com';
      await server.database.users.create({ name: 'Existing', email });

      // Act
      const response = await server.request()
        .post('/users')
        .send({ name: 'New User', email })
        .expect(409);

      // Assert
      expect(response.body.error).toBe('EMAIL_ALREADY_EXISTS');
    });
  });

  describe('GET /users/:id', () => {
    it('should return user by id', async () => {
      // Arrange
      const user = await server.database.users.create({
        name: 'John Doe',
        email: 'john@example.com'
      });

      // Act
      const response = await server.request()
        .get(`/users/${user.id}`)
        .expect(200);

      // Assert
      expect(response.body).toMatchObject({
        id: user.id,
        name: user.name,
        email: user.email
      });
    });

    it('should return 404 for non-existent user', async () => {
      // Act
      const response = await server.request()
        .get('/users/non-existent-id')
        .expect(404);

      // Assert
      expect(response.body.error).toBe('NOT_FOUND');
    });
  });
});
```

### Event Integration Testing

```typescript
// event-flow.integration.spec.ts
describe('Event Flow Integration', () => {
  let eventBus: TestEventBus;
  let userService: UserService;
  let notificationService: NotificationService;

  beforeEach(async () => {
    const testBed = await TestBed.create({
      modules: [UserModule, NotificationModule]
    });

    eventBus = testBed.get(EventBus);
    userService = testBed.get(UserService);
    notificationService = testBed.get(NotificationService);
  });

  it('should send welcome email when user is created', async () => {
    // Arrange
    const sendEmailSpy = jest.spyOn(notificationService, 'sendEmail');
    const userData = {
      name: 'John Doe',
      email: 'john@example.com'
    };

    // Act
    await userService.createUser(userData);
    await eventBus.waitForHandlers(); // Wait for async handlers

    // Assert
    expect(sendEmailSpy).toHaveBeenCalledWith({
      to: userData.email,
      subject: 'Welcome to Semantest',
      template: 'welcome',
      data: expect.objectContaining({ name: userData.name })
    });
  });

  it('should update search index when user is modified', async () => {
    // Arrange
    const updateIndexSpy = jest.spyOn(searchService, 'updateIndex');
    const user = await userService.createUser({
      name: 'John Doe',
      email: 'john@example.com'
    });

    await eventBus.clearEvents();

    // Act
    await userService.updateUser(user.id, { name: 'Jane Doe' });
    await eventBus.waitForHandlers();

    // Assert
    expect(updateIndexSpy).toHaveBeenCalledWith('users', {
      id: user.id,
      name: 'Jane Doe',
      email: user.email
    });
  });
});
```

## End-to-End Testing

### Browser Automation E2E

```typescript
// google-images-download.e2e.spec.ts
import { ChromeExtension, BrowserPage } from '@semantest/e2e-utils';

describe('Google Images Download E2E', () => {
  let extension: ChromeExtension;
  let page: BrowserPage;

  beforeAll(async () => {
    extension = await ChromeExtension.launch({
      extensionPath: './extension.chrome/dist',
      headless: false // Visual debugging
    });
  });

  afterAll(async () => {
    await extension.close();
  });

  beforeEach(async () => {
    page = await extension.newPage();
  });

  afterEach(async () => {
    await page.close();
  });

  it('should download image from search results', async () => {
    // Navigate to Google Images
    await page.goto('https://images.google.com');
    await page.waitForSelector('input[name="q"]');

    // Search for images
    await page.type('input[name="q"]', 'cute puppies');
    await page.keyboard.press('Enter');
    await page.waitForSelector('[data-testid="image-result"]');

    // Click first image
    await page.click('[data-testid="image-result"]:first-child');
    await page.waitForSelector('[data-semantest-download]');

    // Click download button
    await page.click('[data-semantest-download]');

    // Verify download
    const downloads = await extension.waitForDownload({
      timeout: 10000,
      filenamePattern: /cute-puppies.*\.(jpg|png)/
    });

    expect(downloads).toHaveLength(1);
    expect(downloads[0].state).toBe('completed');
    expect(downloads[0].fileSize).toBeGreaterThan(0);
  });

  it('should handle download errors gracefully', async () => {
    // Setup network failure
    await page.setOfflineMode(true);

    // Attempt download
    await page.goto('https://images.google.com/broken-image.jpg');
    await page.click('[data-semantest-download]');

    // Verify error handling
    const notification = await page.waitForSelector('.error-notification');
    const errorText = await notification.textContent();
    
    expect(errorText).toContain('Download failed');
    expect(errorText).toContain('network error');
  });
});
```

### API Workflow E2E

```typescript
// user-registration-flow.e2e.spec.ts
describe('User Registration Flow E2E', () => {
  let apiClient: APIClient;
  let emailService: TestEmailService;

  beforeAll(async () => {
    apiClient = new APIClient({
      baseURL: process.env.API_URL || 'http://localhost:3000'
    });
    
    emailService = new TestEmailService();
    await emailService.connect();
  });

  afterAll(async () => {
    await emailService.disconnect();
  });

  it('should complete full registration flow', async () => {
    // Step 1: Register user
    const testEmail = `test-${Date.now()}@example.com`;
    const registrationData = {
      name: 'Test User',
      email: testEmail,
      password: 'SecurePass123!'
    };

    const { data: user } = await apiClient.post('/auth/register', registrationData);
    
    expect(user).toMatchObject({
      id: expect.any(String),
      name: registrationData.name,
      email: registrationData.email,
      emailVerified: false
    });

    // Step 2: Check verification email
    const email = await emailService.waitForEmail({
      to: testEmail,
      subject: 'Verify your email'
    });

    expect(email).toBeDefined();
    
    const verificationLink = email.extractLink(/\/verify\?token=[\w-]+/);
    expect(verificationLink).toBeDefined();

    // Step 3: Verify email
    const verificationToken = verificationLink.match(/token=([\w-]+)/)[1];
    await apiClient.post('/auth/verify-email', { token: verificationToken });

    // Step 4: Login with verified account
    const { data: session } = await apiClient.post('/auth/login', {
      email: testEmail,
      password: registrationData.password
    });

    expect(session).toMatchObject({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
      user: expect.objectContaining({
        emailVerified: true
      })
    });

    // Step 5: Access protected resource
    apiClient.setAuthToken(session.accessToken);
    const { data: profile } = await apiClient.get('/users/me');
    
    expect(profile.email).toBe(testEmail);
  });
});
```

## Test Organization

### File Structure

```
module/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── user.entity.ts
│   │   │   └── user.entity.spec.ts
│   │   └── value-objects/
│   │       ├── email.value-object.ts
│   │       └── email.value-object.spec.ts
│   └── application/
│       ├── services/
│       │   ├── user.service.ts
│       │   └── user.service.spec.ts
│       └── controllers/
│           ├── user.controller.ts
│           └── user.controller.spec.ts
├── tests/
│   ├── integration/
│   │   ├── api/
│   │   │   └── user-api.integration.spec.ts
│   │   └── events/
│   │       └── user-events.integration.spec.ts
│   ├── e2e/
│   │   └── user-flow.e2e.spec.ts
│   └── fixtures/
│       ├── users.fixture.ts
│       └── test-data.ts
└── jest.config.js
```

### Test Naming Conventions

```typescript
// Unit tests: *.spec.ts
user.entity.spec.ts
email.value-object.spec.ts

// Integration tests: *.integration.spec.ts
user-api.integration.spec.ts
event-flow.integration.spec.ts

// E2E tests: *.e2e.spec.ts
user-registration.e2e.spec.ts
google-images-download.e2e.spec.ts

// Test utilities: *.fixture.ts, *.mock.ts
user.fixture.ts
repository.mock.ts
```

## Testing Best Practices

### 1. Test Independence

```typescript
// ❌ Bad - Tests depend on each other
let sharedUser: User;

it('should create user', () => {
  sharedUser = User.create('John', 'john@example.com');
  expect(sharedUser).toBeDefined();
});

it('should update user name', () => {
  sharedUser.changeName('Jane'); // Depends on previous test
  expect(sharedUser.getName()).toBe('Jane');
});

// ✅ Good - Independent tests
describe('User', () => {
  let user: User;

  beforeEach(() => {
    user = User.create('John', 'john@example.com');
  });

  it('should create user', () => {
    expect(user).toBeDefined();
    expect(user.getName()).toBe('John');
  });

  it('should update user name', () => {
    user.changeName('Jane');
    expect(user.getName()).toBe('Jane');
  });
});
```

### 2. Descriptive Test Names

```typescript
// ❌ Bad - Vague test names
it('should work', () => { });
it('test user', () => { });
it('error case', () => { });

// ✅ Good - Descriptive names
it('should create user with valid email and name', () => { });
it('should throw InvalidEmailError when email format is invalid', () => { });
it('should emit UserCreatedEvent when user is successfully created', () => { });
```

### 3. AAA Pattern (Arrange, Act, Assert)

```typescript
it('should calculate order total with tax', () => {
  // Arrange
  const order = new Order();
  order.addItem('Product A', 100, 2);
  order.addItem('Product B', 50, 1);
  const taxRate = 0.08;

  // Act
  const total = order.calculateTotal(taxRate);

  // Assert
  expect(total).toBe(270); // (100*2 + 50) * 1.08
});
```

### 4. Test Data Builders

```typescript
// test-utils/builders/user.builder.ts
export class UserBuilder {
  private data = {
    id: 'test-id',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    createdAt: new Date()
  };

  withId(id: string): this {
    this.data.id = id;
    return this;
  }

  withName(name: string): this {
    this.data.name = name;
    return this;
  }

  withEmail(email: string): this {
    this.data.email = email;
    return this;
  }

  asAdmin(): this {
    this.data.role = 'admin';
    return this;
  }

  build(): User {
    return User.fromPrimitives(this.data);
  }
}

// Usage in tests
const adminUser = new UserBuilder()
  .withName('Admin User')
  .withEmail('admin@example.com')
  .asAdmin()
  .build();
```

## Mocking and Stubbing

### Mock Factories

```typescript
// test-utils/mocks/repository.mock.ts
export function createMockRepository<T>(): MockRepository<T> {
  return {
    findById: jest.fn(),
    findAll: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  };
}

// test-utils/mocks/event-bus.mock.ts
export class MockEventBus implements IEventBus {
  private publishedEvents: DomainEvent[] = [];

  async publish(event: DomainEvent): Promise<void> {
    this.publishedEvents.push(event);
  }

  getPublishedEvents(): DomainEvent[] {
    return [...this.publishedEvents];
  }

  hasPublished(eventType: string): boolean {
    return this.publishedEvents.some(e => e.type === eventType);
  }

  clear(): void {
    this.publishedEvents = [];
  }
}
```

### Service Mocking

```typescript
// user.service.spec.ts
describe('UserService', () => {
  let service: UserService;
  let mockRepository: jest.Mocked<IUserRepository>;
  let mockEventBus: MockEventBus;
  let mockEmailService: jest.Mocked<IEmailService>;

  beforeEach(() => {
    mockRepository = createMockRepository<User>();
    mockEventBus = new MockEventBus();
    mockEmailService = {
      sendEmail: jest.fn().mockResolvedValue(true),
      validateEmail: jest.fn().mockReturnValue(true)
    };

    service = new UserService(
      mockRepository,
      mockEventBus,
      mockEmailService
    );
  });

  it('should send welcome email after user creation', async () => {
    // Arrange
    mockRepository.save.mockResolvedValue(undefined);
    const userData = { name: 'John', email: 'john@example.com' };

    // Act
    await service.createUser(userData);

    // Assert
    expect(mockEmailService.sendEmail).toHaveBeenCalledWith({
      to: userData.email,
      template: 'welcome',
      data: { name: userData.name }
    });
  });
});
```

## Performance Testing

### Load Testing

```typescript
// performance/load-test.spec.ts
import { LoadTester } from '@semantest/performance-testing';

describe('API Load Tests', () => {
  let loadTester: LoadTester;

  beforeAll(() => {
    loadTester = new LoadTester({
      baseURL: process.env.API_URL,
      maxConcurrent: 100
    });
  });

  it('should handle 1000 requests per minute', async () => {
    // Arrange
    const scenario = {
      endpoint: '/api/users',
      method: 'GET',
      rps: 17, // ~1000 per minute
      duration: 60 // seconds
    };

    // Act
    const results = await loadTester.run(scenario);

    // Assert
    expect(results.successRate).toBeGreaterThan(0.99); // 99% success
    expect(results.avgResponseTime).toBeLessThan(200); // ms
    expect(results.p95ResponseTime).toBeLessThan(500); // ms
    expect(results.errors).toHaveLength(0);
  });
});
```

### Benchmark Tests

```typescript
// performance/benchmark.spec.ts
describe('Performance Benchmarks', () => {
  it('should process 10000 events in under 1 second', async () => {
    // Arrange
    const processor = new EventProcessor();
    const events = generateTestEvents(10000);

    // Act
    const start = performance.now();
    await processor.processEvents(events);
    const duration = performance.now() - start;

    // Assert
    expect(duration).toBeLessThan(1000); // ms
    console.log(`Processed 10000 events in ${duration}ms`);
  });

  it('should maintain sub-100ms query time with 1M records', async () => {
    // Arrange
    await seedDatabase(1_000_000);
    const queries = [
      { filter: { status: 'active' }, limit: 100 },
      { filter: { createdAt: { $gte: new Date('2024-01-01') } }, limit: 50 },
      { search: 'test user', limit: 20 }
    ];

    // Act & Assert
    for (const query of queries) {
      const start = performance.now();
      const results = await userRepository.find(query);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(100);
      expect(results).toHaveLength(query.limit);
    }
  });
});
```

## Security Testing

### Input Validation Testing

```typescript
// security/input-validation.spec.ts
describe('Input Validation Security', () => {
  it('should prevent SQL injection', async () => {
    // Arrange
    const maliciousInputs = [
      "'; DROP TABLE users; --",
      "1' OR '1'='1",
      "admin'--",
      "1; UPDATE users SET role='admin' WHERE id=1"
    ];

    // Act & Assert
    for (const input of maliciousInputs) {
      const response = await request(app)
        .get(`/api/users?search=${encodeURIComponent(input)}`)
        .expect(400);

      expect(response.body.error).toBe('INVALID_INPUT');
    }
  });

  it('should prevent XSS attacks', async () => {
    // Arrange
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert("XSS")>',
      'javascript:alert("XSS")',
      '<iframe src="javascript:alert(\'XSS\')"></iframe>'
    ];

    // Act & Assert
    for (const payload of xssPayloads) {
      const response = await request(app)
        .post('/api/comments')
        .send({ content: payload })
        .expect(201);

      // Verify stored content is sanitized
      const comment = await commentRepository.findById(response.body.id);
      expect(comment.content).not.toContain('<script>');
      expect(comment.content).not.toContain('javascript:');
    }
  });
});
```

### Authentication Testing

```typescript
// security/authentication.spec.ts
describe('Authentication Security', () => {
  it('should rate limit login attempts', async () => {
    // Arrange
    const email = 'test@example.com';
    const attempts = 10;

    // Act - Make multiple failed login attempts
    for (let i = 0; i < attempts; i++) {
      await request(app)
        .post('/api/auth/login')
        .send({ email, password: 'wrong-password' });
    }

    // Assert - Should be rate limited
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'correct-password' })
      .expect(429);

    expect(response.body.error).toBe('TOO_MANY_ATTEMPTS');
    expect(response.headers['retry-after']).toBeDefined();
  });

  it('should expire tokens after inactivity', async () => {
    // Arrange
    const token = await getAuthToken();
    
    // Act - Wait for token expiration
    await sleep(TOKEN_EXPIRY_TIME + 1000);

    // Assert
    const response = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);

    expect(response.body.error).toBe('TOKEN_EXPIRED');
  });
});
```

## Test Utilities

### Custom Matchers

```typescript
// test-utils/matchers.ts
expect.extend({
  toBeValidEmail(received: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);
    
    return {
      pass,
      message: () => 
        pass
          ? `expected ${received} not to be a valid email`
          : `expected ${received} to be a valid email`
    };
  },

  toContainEvent(events: DomainEvent[], eventType: string) {
    const pass = events.some(e => e.type === eventType);
    
    return {
      pass,
      message: () =>
        pass
          ? `expected events not to contain ${eventType}`
          : `expected events to contain ${eventType}`
    };
  }
});

// Usage
expect('test@example.com').toBeValidEmail();
expect(domainEvents).toContainEvent('user.created');
```

### Test Helpers

```typescript
// test-utils/helpers.ts
export class TestHelpers {
  static async waitFor<T>(
    fn: () => T | Promise<T>,
    options: {
      timeout?: number;
      interval?: number;
      errorMessage?: string;
    } = {}
  ): Promise<T> {
    const { timeout = 5000, interval = 100, errorMessage } = options;
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        const result = await fn();
        if (result) return result;
      } catch (error) {
        // Continue waiting
      }
      
      await new Promise(resolve => setTimeout(resolve, interval));
    }

    throw new Error(errorMessage || 'Timeout waiting for condition');
  }

  static generateTestData<T>(
    factory: (index: number) => T,
    count: number
  ): T[] {
    return Array.from({ length: count }, (_, i) => factory(i));
  }

  static async measurePerformance<T>(
    fn: () => Promise<T>
  ): Promise<{ result: T; duration: number }> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    
    return { result, duration };
  }
}
```

## CI/CD Test Configuration

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/*.spec.ts',
    '**/*.integration.spec.ts',
    '**/*.e2e.spec.ts'
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/**/*.mock.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/src/$1',
    '@test/(.*)': '<rootDir>/tests/$1'
  }
};
```

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run test:unit
      - uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/test

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm run test:e2e
        env:
          HEADLESS: true
```

## Summary

These testing standards ensure:

1. **Quality**: Comprehensive testing at all levels
2. **Reliability**: Consistent and trustworthy tests
3. **Maintainability**: Clear, organized test code
4. **Performance**: Fast test execution
5. **Security**: Proactive security testing

Remember: Tests are not just about catching bugs - they're about building confidence in your code and enabling fearless refactoring.