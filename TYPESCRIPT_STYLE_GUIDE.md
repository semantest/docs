# Semantest TypeScript Style Guide

This guide defines the TypeScript coding standards for the Semantest project. All code must adhere to these standards to ensure consistency, maintainability, and quality.

## Table of Contents

1. [General Principles](#general-principles)
2. [File Organization](#file-organization)
3. [Naming Conventions](#naming-conventions)
4. [Type System](#type-system)
5. [Functions and Methods](#functions-and-methods)
6. [Classes and Interfaces](#classes-and-interfaces)
7. [Domain-Driven Design](#domain-driven-design)
8. [Error Handling](#error-handling)
9. [Async Programming](#async-programming)
10. [Testing](#testing)
11. [Performance](#performance)
12. [Security](#security)

## General Principles

### 1. Explicit Over Implicit

```typescript
// ✅ Good - Explicit types
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ❌ Bad - Implicit types
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

### 2. Immutability by Default

```typescript
// ✅ Good - Immutable approach
interface UserProfile {
  readonly id: string;
  readonly name: string;
  readonly email: string;
}

function updateUserName(user: UserProfile, newName: string): UserProfile {
  return { ...user, name: newName };
}

// ❌ Bad - Mutable approach
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

function updateUserName(user: UserProfile, newName: string): void {
  user.name = newName; // Mutating parameter
}
```

### 3. Composition Over Inheritance

```typescript
// ✅ Good - Composition
interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

interface Identifiable {
  id: string;
}

type User = Identifiable & Timestamped & {
  name: string;
  email: string;
};

// ❌ Bad - Deep inheritance
class BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

class User extends BaseEntity {
  name: string;
  email: string;
}
```

## File Organization

### Directory Structure

```
module/
├── domain/
│   ├── entities/
│   │   ├── user.entity.ts
│   │   └── user.entity.spec.ts
│   ├── events/
│   │   ├── user-created.event.ts
│   │   └── user-updated.event.ts
│   ├── value-objects/
│   │   ├── email.value-object.ts
│   │   └── user-id.value-object.ts
│   └── services/
│       └── user-validation.service.ts
├── application/
│   ├── commands/
│   │   └── create-user.command.ts
│   └── queries/
│       └── get-user.query.ts
└── infrastructure/
    ├── adapters/
    │   └── user-repository.adapter.ts
    └── mappers/
        └── user.mapper.ts
```

### File Naming

```typescript
// Entity files
user.entity.ts
user.entity.spec.ts

// Value object files
email.value-object.ts
email.value-object.spec.ts

// Event files
user-created.event.ts
user-updated.event.ts

// Service files
user-validation.service.ts
user-notification.service.ts

// Test files
*.spec.ts     // Unit tests
*.test.ts     // Integration tests
*.e2e.ts      // E2E tests
```

### Import Organization

```typescript
// 1. Node modules
import { readFile } from 'fs/promises';
import path from 'path';

// 2. External dependencies
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

// 3. Internal modules (absolute paths)
import { DomainEvent } from '@semantest/core';
import { User } from '@semantest/users/domain/entities';

// 4. Relative imports
import { EmailValidator } from './validators';
import { UserCreatedEvent } from '../events';

// 5. Type imports
import type { UserDto } from './types';
import type { Repository } from '../interfaces';
```

## Naming Conventions

### Variables and Functions

```typescript
// Variables: camelCase
const userName = 'John Doe';
const isActive = true;
const itemCount = 42;

// Functions: camelCase, verb prefix
function calculateTotal(items: Item[]): number { }
function getUserById(id: string): User { }
function hasPermission(user: User, action: string): boolean { }

// Boolean variables/functions: is/has/can prefix
const isLoading = true;
const hasAccess = false;
const canEdit = true;
```

### Classes and Interfaces

```typescript
// Classes: PascalCase
class UserService { }
class EmailValidator { }
class OrderAggregate { }

// Interfaces: PascalCase, 'I' prefix for contracts
interface User { }                    // Domain model
interface IUserRepository { }         // Contract/Port
interface IEmailService { }           // Contract/Port

// Type aliases: PascalCase
type UserId = string;
type OrderStatus = 'pending' | 'completed' | 'cancelled';
type AsyncResult<T> = Promise<Result<T>>;
```

### Constants and Enums

```typescript
// Constants: UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;
const DEFAULT_TIMEOUT = 5000;
const API_BASE_URL = 'https://api.semantest.com';

// Enums: PascalCase for name, PascalCase for values
enum OrderStatus {
  Pending = 'PENDING',
  Processing = 'PROCESSING',
  Completed = 'COMPLETED',
  Cancelled = 'CANCELLED'
}

// Const assertions for object literals
const HttpStatus = {
  OK: 200,
  Created: 201,
  BadRequest: 400,
  Unauthorized: 401,
  NotFound: 404
} as const;
```

## Type System

### Use Strict Types

```typescript
// ✅ Good - Strict types
interface CreateUserDto {
  name: string;
  email: string;
  age: number;
  roles: Role[];
}

// ❌ Bad - Loose types
interface CreateUserDto {
  name: any;
  email: string;
  age: number | string;
  roles: any[];
}
```

### Avoid `any` and `unknown`

```typescript
// ✅ Good - Specific types
function processData<T extends Record<string, unknown>>(data: T): ProcessedData<T> {
  // Process data
}

// ❌ Bad - Using any
function processData(data: any): any {
  // Process data
}

// ✅ Good - Type guards for unknown
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'email' in value
  );
}
```

### Use Union Types and Type Guards

```typescript
// Define union type
type PaymentMethod = CreditCard | BankTransfer | PayPal;

interface CreditCard {
  type: 'credit-card';
  cardNumber: string;
  cvv: string;
}

interface BankTransfer {
  type: 'bank-transfer';
  accountNumber: string;
  routingNumber: string;
}

interface PayPal {
  type: 'paypal';
  email: string;
}

// Type guard
function isCreditCard(payment: PaymentMethod): payment is CreditCard {
  return payment.type === 'credit-card';
}

// Usage with type narrowing
function processPayment(payment: PaymentMethod): void {
  if (isCreditCard(payment)) {
    // TypeScript knows payment is CreditCard here
    validateCreditCard(payment.cardNumber, payment.cvv);
  }
}
```

### Generic Constraints

```typescript
// ✅ Good - Constrained generics
interface Repository<T extends Entity<T>> {
  findById(id: string): Promise<T | null>;
  save(entity: T): Promise<void>;
}

// Specific constraints
function merge<T extends object, U extends object>(target: T, source: U): T & U {
  return { ...target, ...source };
}

// ❌ Bad - Unconstrained generics
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  save(entity: T): Promise<void>;
}
```

## Functions and Methods

### Function Declarations

```typescript
// ✅ Good - Clear return types
function calculateDiscount(price: number, percentage: number): number {
  return price * (percentage / 100);
}

// ✅ Good - Async functions
async function fetchUser(id: string): Promise<User> {
  const response = await api.get(`/users/${id}`);
  return response.data;
}

// ✅ Good - Never return type
function throwError(message: string): never {
  throw new Error(message);
}
```

### Arrow Functions

```typescript
// ✅ Good - Simple arrow functions
const double = (x: number): number => x * 2;
const greet = (name: string): string => `Hello, ${name}!`;

// ✅ Good - Multi-line arrow functions
const processItems = (items: Item[]): ProcessedItem[] => {
  return items
    .filter(item => item.isActive)
    .map(item => ({
      ...item,
      processed: true,
      timestamp: new Date()
    }));
};

// ❌ Bad - Implicit return with objects (needs parentheses)
const createUser = (name: string) => { name, createdAt: new Date() }; // Wrong!
const createUser = (name: string) => ({ name, createdAt: new Date() }); // Correct!
```

### Function Parameters

```typescript
// ✅ Good - Use object parameters for multiple arguments
interface CreateUserOptions {
  name: string;
  email: string;
  role?: Role;
  sendWelcomeEmail?: boolean;
}

function createUser(options: CreateUserOptions): User {
  const { name, email, role = Role.User, sendWelcomeEmail = true } = options;
  // Implementation
}

// ❌ Bad - Too many parameters
function createUser(
  name: string,
  email: string,
  role?: Role,
  sendWelcomeEmail?: boolean
): User {
  // Implementation
}
```

### Default Parameters and Optional Parameters

```typescript
// ✅ Good - Default parameters
function greet(name: string, greeting: string = 'Hello'): string {
  return `${greeting}, ${name}!`;
}

// ✅ Good - Optional parameters with defaults in destructuring
interface SearchOptions {
  query: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
}

function search({ 
  query, 
  limit = 10, 
  offset = 0, 
  sortBy = 'relevance' 
}: SearchOptions): SearchResult {
  // Implementation
}
```

## Classes and Interfaces

### Class Design

```typescript
// ✅ Good - Well-designed class
export class User extends Entity<User> {
  // Private constructor for factory pattern
  private constructor(
    private readonly id: UserId,
    private name: string,
    private email: Email,
    private readonly createdAt: Date
  ) {
    super();
  }

  // Static factory method
  static create(name: string, email: string): User {
    const id = UserId.generate();
    const emailVO = Email.create(email);
    const user = new User(id, name, emailVO, new Date());
    
    user.addDomainEvent(new UserCreatedEvent(id.value, name, email));
    return user;
  }

  // Getters for read access
  getId(): string {
    return this.id.value;
  }

  getName(): string {
    return this.name;
  }

  // Business methods that emit events
  changeName(newName: string): void {
    if (!newName || newName.trim().length === 0) {
      throw new InvalidNameError('Name cannot be empty');
    }
    
    const oldName = this.name;
    this.name = newName;
    
    this.addDomainEvent(new UserNameChangedEvent(
      this.id.value,
      oldName,
      newName
    ));
  }
}
```

### Interface Segregation

```typescript
// ✅ Good - Segregated interfaces
interface Readable {
  read(id: string): Promise<Data>;
}

interface Writable {
  write(data: Data): Promise<void>;
}

interface Deletable {
  delete(id: string): Promise<void>;
}

// Compose as needed
type ReadOnlyRepository = Readable;
type WriteOnlyRepository = Writable;
type FullRepository = Readable & Writable & Deletable;

// ❌ Bad - Fat interface
interface Repository {
  read(id: string): Promise<Data>;
  write(data: Data): Promise<void>;
  delete(id: string): Promise<void>;
  backup(): Promise<void>;
  restore(): Promise<void>;
  // ... many more methods
}
```

### Abstract Classes

```typescript
// ✅ Good - Abstract class with template method pattern
abstract class PaymentProcessor {
  async processPayment(amount: number, method: PaymentMethod): Promise<PaymentResult> {
    // Template method
    await this.validate(amount, method);
    const result = await this.executePayment(amount, method);
    await this.logTransaction(result);
    return result;
  }

  protected abstract validate(amount: number, method: PaymentMethod): Promise<void>;
  protected abstract executePayment(amount: number, method: PaymentMethod): Promise<PaymentResult>;
  
  protected async logTransaction(result: PaymentResult): Promise<void> {
    // Default implementation
    console.log(`Transaction ${result.id} completed`);
  }
}
```

## Domain-Driven Design

### Entities

```typescript
// ✅ Good - Rich domain entity
export class Order extends AggregateRoot<Order> {
  private items: OrderItem[] = [];
  private status: OrderStatus;

  private constructor(
    private readonly id: OrderId,
    private readonly customerId: CustomerId,
    items: OrderItem[],
    status: OrderStatus
  ) {
    super();
    this.items = items;
    this.status = status;
  }

  static create(customerId: string): Order {
    const order = new Order(
      OrderId.generate(),
      CustomerId.create(customerId),
      [],
      OrderStatus.Pending
    );
    
    order.applyEvent(new OrderCreatedEvent(order.id.value, customerId));
    return order;
  }

  addItem(productId: string, quantity: number, price: Money): void {
    if (this.status !== OrderStatus.Pending) {
      throw new OrderNotModifiableError('Cannot add items to non-pending order');
    }

    const item = OrderItem.create(productId, quantity, price);
    this.items.push(item);
    
    this.applyEvent(new OrderItemAddedEvent(
      this.id.value,
      productId,
      quantity,
      price.amount
    ));
  }

  getTotal(): Money {
    return this.items.reduce(
      (total, item) => total.add(item.getSubtotal()),
      Money.zero()
    );
  }

  protected apply(event: DomainEvent): void {
    if (event instanceof OrderCreatedEvent) {
      // Apply creation logic
    } else if (event instanceof OrderItemAddedEvent) {
      // Apply item addition logic
    }
  }
}
```

### Value Objects

```typescript
// ✅ Good - Immutable value object
export class Email extends ValueObject<Email> {
  private constructor(public readonly value: string) {
    super();
  }

  static create(value: string): Email {
    if (!Email.isValid(value)) {
      throw new InvalidEmailError(value);
    }
    return new Email(value.toLowerCase());
  }

  static isValid(value: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  hashCode(): number {
    return this.value.split('').reduce((hash, char) => {
      return ((hash << 5) - hash) + char.charCodeAt(0);
    }, 0);
  }

  toString(): string {
    return this.value;
  }
}
```

### Domain Events

```typescript
// ✅ Good - Domain event with all necessary data
export class OrderShippedEvent extends DomainEvent {
  constructor(
    public readonly orderId: string,
    public readonly shippedAt: Date,
    public readonly trackingNumber: string,
    public readonly carrier: string,
    correlationId?: string
  ) {
    super('order.shipped', correlationId);
  }

  static fromPrimitives(data: any): OrderShippedEvent {
    return new OrderShippedEvent(
      data.orderId,
      new Date(data.shippedAt),
      data.trackingNumber,
      data.carrier,
      data.correlationId
    );
  }

  toPrimitives(): Record<string, any> {
    return {
      orderId: this.orderId,
      shippedAt: this.shippedAt.toISOString(),
      trackingNumber: this.trackingNumber,
      carrier: this.carrier,
      eventType: this.eventType,
      eventId: this.eventId,
      timestamp: this.timestamp,
      correlationId: this.correlationId
    };
  }
}
```

## Error Handling

### Custom Error Classes

```typescript
// ✅ Good - Domain-specific error hierarchy
export abstract class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 400,
    public readonly context?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): object {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      context: this.context,
      timestamp: new Date().toISOString()
    };
  }
}

export class ValidationError extends DomainError {
  constructor(message: string, field?: string, value?: any) {
    super(
      message,
      'VALIDATION_ERROR',
      400,
      { field, value }
    );
  }
}

export class NotFoundError extends DomainError {
  constructor(resource: string, id: string) {
    super(
      `${resource} with id ${id} not found`,
      'NOT_FOUND',
      404,
      { resource, id }
    );
  }
}
```

### Error Handling Patterns

```typescript
// ✅ Good - Result type for expected errors
export class Result<T, E = Error> {
  private constructor(
    private readonly value?: T,
    private readonly error?: E,
    private readonly success: boolean
  ) {}

  static ok<T>(value: T): Result<T> {
    return new Result(value, undefined, true);
  }

  static fail<E>(error: E): Result<never, E> {
    return new Result(undefined, error, false);
  }

  isOk(): boolean {
    return this.success;
  }

  isFail(): boolean {
    return !this.success;
  }

  getValue(): T {
    if (!this.success) {
      throw new Error('Cannot get value from failed result');
    }
    return this.value!;
  }

  getError(): E {
    if (this.success) {
      throw new Error('Cannot get error from successful result');
    }
    return this.error!;
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    if (!this.success) {
      return Result.fail(this.error!);
    }
    return Result.ok(fn(this.value!));
  }

  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    if (!this.success) {
      return Result.fail(this.error!);
    }
    return fn(this.value!);
  }
}

// Usage
async function createUser(data: CreateUserDto): Promise<Result<User, ValidationError>> {
  const emailResult = Email.create(data.email);
  if (emailResult.isFail()) {
    return Result.fail(emailResult.getError());
  }

  const user = User.create(data.name, emailResult.getValue());
  return Result.ok(user);
}
```

### Try-Catch Best Practices

```typescript
// ✅ Good - Specific error handling
async function processOrder(orderId: string): Promise<void> {
  try {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order', orderId);
    }

    await order.process();
    await orderRepository.save(order);
    
  } catch (error) {
    if (error instanceof NotFoundError) {
      logger.warn('Order not found', { orderId });
      throw error; // Re-throw for caller to handle
    }
    
    if (error instanceof PaymentFailedError) {
      await notificationService.notifyPaymentFailed(orderId);
      throw error;
    }
    
    // Unexpected errors
    logger.error('Unexpected error processing order', {
      orderId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    throw new InternalServerError('Failed to process order');
  }
}
```

## Async Programming

### Promises and Async/Await

```typescript
// ✅ Good - Async/await with proper error handling
async function fetchUserWithPosts(userId: string): Promise<UserWithPosts> {
  try {
    const [user, posts] = await Promise.all([
      userService.findById(userId),
      postService.findByUserId(userId)
    ]);

    if (!user) {
      throw new NotFoundError('User', userId);
    }

    return { user, posts };
  } catch (error) {
    logger.error('Failed to fetch user with posts', { userId, error });
    throw error;
  }
}

// ❌ Bad - Mixing promises and callbacks
function fetchUserWithPosts(userId: string, callback: (error: Error | null, result?: UserWithPosts) => void): void {
  userService.findById(userId)
    .then(user => {
      postService.findByUserId(userId)
        .then(posts => {
          callback(null, { user, posts });
        })
        .catch(callback);
    })
    .catch(callback);
}
```

### Promise Utilities

```typescript
// ✅ Good - Useful promise utilities
class PromiseUtils {
  // Retry with exponential backoff
  static async retry<T>(
    fn: () => Promise<T>,
    options: {
      maxRetries?: number;
      delay?: number;
      backoff?: number;
      shouldRetry?: (error: Error) => boolean;
    } = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      delay = 1000,
      backoff = 2,
      shouldRetry = () => true
    } = options;

    let lastError: Error;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        if (!shouldRetry(lastError) || i === maxRetries - 1) {
          throw lastError;
        }
        
        const waitTime = delay * Math.pow(backoff, i);
        await PromiseUtils.delay(waitTime);
      }
    }
    
    throw lastError!;
  }

  // Delay utility
  static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Timeout wrapper
  static async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    errorMessage = 'Operation timed out'
  ): Promise<T> {
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
    });
    
    return Promise.race([promise, timeout]);
  }
}
```

## Testing

### Test Structure

```typescript
// ✅ Good - Well-structured tests
describe('UserService', () => {
  let service: UserService;
  let userRepository: MockRepository<User>;
  let eventBus: MockEventBus;

  beforeEach(() => {
    userRepository = new MockRepository();
    eventBus = new MockEventBus();
    service = new UserService(userRepository, eventBus);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create user with valid data', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com'
      };

      // Act
      const result = await service.createUser(createUserDto);

      // Assert
      expect(result.isOk()).toBe(true);
      const user = result.getValue();
      expect(user.getName()).toBe('John Doe');
      expect(userRepository.save).toHaveBeenCalledWith(user);
      expect(eventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'user.created'
        })
      );
    });

    it('should return error for invalid email', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'invalid-email'
      };

      // Act
      const result = await service.createUser(createUserDto);

      // Assert
      expect(result.isFail()).toBe(true);
      expect(result.getError()).toBeInstanceOf(ValidationError);
      expect(userRepository.save).not.toHaveBeenCalled();
      expect(eventBus.publish).not.toHaveBeenCalled();
    });

    describe('edge cases', () => {
      it.each([
        ['empty name', { name: '', email: 'test@example.com' }],
        ['whitespace name', { name: '   ', email: 'test@example.com' }],
        ['very long name', { name: 'a'.repeat(256), email: 'test@example.com' }]
      ])('should handle %s', async (scenario, data) => {
        const result = await service.createUser(data);
        expect(result.isFail()).toBe(true);
      });
    });
  });
});
```

### Test Utilities

```typescript
// ✅ Good - Reusable test utilities
export class TestUtils {
  static createMockUser(overrides?: Partial<User>): User {
    const defaults = {
      id: 'test-id',
      name: 'Test User',
      email: 'test@example.com',
      createdAt: new Date('2023-01-01')
    };
    
    return User.fromPrimitives({ ...defaults, ...overrides });
  }

  static async expectDomainEvent<T extends DomainEvent>(
    eventBus: MockEventBus,
    eventType: string,
    matcher?: (event: T) => boolean
  ): Promise<T> {
    const events = eventBus.getPublishedEvents();
    const event = events.find(e => 
      e.eventType === eventType && 
      (!matcher || matcher(e as T))
    ) as T;
    
    expect(event).toBeDefined();
    return event;
  }

  static mockDate(date: Date | string): void {
    const mockDate = typeof date === 'string' ? new Date(date) : date;
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  }
}
```

## Performance

### Optimization Patterns

```typescript
// ✅ Good - Memoization for expensive operations
class ProductService {
  private cache = new Map<string, CacheEntry<Product>>();
  private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes

  async getProduct(id: string): Promise<Product> {
    const cached = this.cache.get(id);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.value;
    }

    const product = await this.productRepository.findById(id);
    
    if (product) {
      this.cache.set(id, {
        value: product,
        timestamp: Date.now()
      });
    }

    return product;
  }

  // Batch operations for efficiency
  async getProducts(ids: string[]): Promise<Map<string, Product>> {
    const result = new Map<string, Product>();
    const missingIds: string[] = [];

    // Check cache first
    for (const id of ids) {
      const cached = this.cache.get(id);
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        result.set(id, cached.value);
      } else {
        missingIds.push(id);
      }
    }

    // Batch fetch missing items
    if (missingIds.length > 0) {
      const products = await this.productRepository.findByIds(missingIds);
      for (const product of products) {
        result.set(product.id, product);
        this.cache.set(product.id, {
          value: product,
          timestamp: Date.now()
        });
      }
    }

    return result;
  }
}

interface CacheEntry<T> {
  value: T;
  timestamp: number;
}
```

### Lazy Loading

```typescript
// ✅ Good - Lazy loading with property getters
class UserProfile {
  private _posts?: Post[];
  private _followers?: User[];

  constructor(
    private readonly userId: string,
    private readonly postService: PostService,
    private readonly userService: UserService
  ) {}

  async getPosts(): Promise<Post[]> {
    if (!this._posts) {
      this._posts = await this.postService.findByUserId(this.userId);
    }
    return this._posts;
  }

  async getFollowers(): Promise<User[]> {
    if (!this._followers) {
      this._followers = await this.userService.getFollowers(this.userId);
    }
    return this._followers;
  }
}
```

## Security

### Input Validation

```typescript
// ✅ Good - Comprehensive input validation
class InputValidator {
  static validateEmail(email: string): Result<string, ValidationError> {
    if (!email || email.trim().length === 0) {
      return Result.fail(new ValidationError('Email is required'));
    }

    const trimmed = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(trimmed)) {
      return Result.fail(new ValidationError('Invalid email format'));
    }

    // Check for common SQL injection patterns
    if (trimmed.includes('--') || trimmed.includes(';') || trimmed.includes('/*')) {
      return Result.fail(new ValidationError('Invalid characters in email'));
    }

    return Result.ok(trimmed);
  }

  static sanitizeHtml(input: string): string {
    // Remove script tags and event handlers
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
      .replace(/on\w+\s*=\s*'[^']*'/gi, '')
      .replace(/javascript:/gi, '');
  }

  static validateId(id: string): Result<string, ValidationError> {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(id)) {
      return Result.fail(new ValidationError('Invalid ID format'));
    }

    return Result.ok(id);
  }
}
```

### Secure Defaults

```typescript
// ✅ Good - Secure by default configuration
interface SecurityConfig {
  readonly enableAuth: boolean;
  readonly requireHttps: boolean;
  readonly csrfProtection: boolean;
  readonly rateLimiting: RateLimitConfig;
  readonly cors: CorsConfig;
}

const defaultSecurityConfig: SecurityConfig = {
  enableAuth: true,
  requireHttps: true,
  csrfProtection: true,
  rateLimiting: {
    enabled: true,
    maxRequests: 100,
    windowMs: 15 * 60 * 1000 // 15 minutes
  },
  cors: {
    enabled: true,
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
};
```

## Code Comments

### Documentation Comments

```typescript
/**
 * Processes a payment transaction using the specified payment method.
 * 
 * @param amount - The payment amount in cents
 * @param method - The payment method to use
 * @param options - Additional payment options
 * @returns A promise that resolves to the payment result
 * @throws {InvalidAmountError} If the amount is invalid
 * @throws {PaymentFailedError} If the payment processing fails
 * 
 * @example
 * ```typescript
 * const result = await processPayment(
 *   1000, 
 *   { type: 'credit-card', cardNumber: '...', cvv: '...' },
 *   { currency: 'USD', description: 'Order #123' }
 * );
 * ```
 */
async function processPayment(
  amount: number,
  method: PaymentMethod,
  options?: PaymentOptions
): Promise<PaymentResult> {
  // Implementation
}
```

### Inline Comments

```typescript
// ✅ Good - Explains "why", not "what"
function calculatePrice(basePrice: number, taxRate: number): number {
  // Apply tax rate as a percentage (e.g., 0.08 for 8%)
  const tax = basePrice * taxRate;
  
  // Round to 2 decimal places to avoid floating point issues
  return Math.round((basePrice + tax) * 100) / 100;
}

// ❌ Bad - States the obvious
function calculatePrice(basePrice: number, taxRate: number): number {
  // Multiply base price by tax rate
  const tax = basePrice * taxRate;
  
  // Add tax to base price
  return basePrice + tax;
}
```

## Linting and Formatting

### ESLint Rules

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:@typescript-eslint/strict"
  ],
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": ["error", {
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_"
    }],
    "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
    "@typescript-eslint/strict-boolean-expressions": "error",
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/no-misused-promises": "error",
    "@typescript-eslint/await-thenable": "error",
    "@typescript-eslint/no-unnecessary-type-assertion": "error",
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/prefer-optional-chain": "error",
    "no-console": ["error", { "allow": ["warn", "error"] }],
    "prefer-const": "error",
    "no-var": "error",
    "eqeqeq": ["error", "always"],
    "curly": ["error", "all"]
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
  "endOfLine": "lf",
  "quoteProps": "as-needed"
}
```

## Summary

This style guide represents our commitment to writing clean, maintainable, and high-quality TypeScript code. Following these guidelines ensures:

1. **Consistency** across the codebase
2. **Readability** for all team members
3. **Maintainability** for long-term success
4. **Type Safety** to catch errors early
5. **Performance** through best practices
6. **Security** by default

Remember: these are guidelines, not rigid rules. Use your judgment, and when in doubt, prioritize code clarity and team consistency.