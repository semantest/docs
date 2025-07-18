# TypeScript Style Guide

## Overview

This TypeScript style guide provides comprehensive coding standards for the Semantest project, ensuring consistency, maintainability, and adherence to Domain-Driven Design principles.

## General Principles

### 1. Code Should Be Self-Documenting
- Use descriptive names for variables, functions, and classes
- Prefer explicit code over clever code
- Write code that explains the "why" not just the "what"

### 2. Consistency Over Preference
- Follow established patterns in the codebase
- Use consistent naming conventions
- Maintain consistent file structure

### 3. Type Safety First
- Always use explicit types
- Avoid `any` type
- Leverage TypeScript's type system fully

## Naming Conventions

### Variables and Functions
```typescript
// ✅ Good: camelCase
const userEmail = 'user@example.com';
const calculateTotalPrice = (items: CartItem[]) => { };

// ❌ Bad: snake_case or PascalCase
const user_email = 'user@example.com';
const CalculateTotalPrice = (items: CartItem[]) => { };
```

### Classes and Interfaces
```typescript
// ✅ Good: PascalCase with domain suffix
class UserAggregate { }
class EmailValueObject { }
class UserCreatedEvent { }
class UserService { }
class UserRepository { }

// ✅ Good: Interface without 'I' prefix
interface UserRepository { }
interface PaymentGateway { }
interface ConfigurationSettings { }

// ❌ Bad: Interface with 'I' prefix
interface IUserRepository { }
interface IPaymentGateway { }
```

### Constants
```typescript
// ✅ Good: UPPER_CASE
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_TIMEOUT_MS = 5000;
const API_BASE_URL = 'https://api.example.com';

// ❌ Bad: camelCase for constants
const maxRetryAttempts = 3;
const defaultTimeout = 5000;
```

### Enums
```typescript
// ✅ Good: PascalCase with descriptive values
enum UserStatus {
  Active = 'active',
  Inactive = 'inactive',
  Suspended = 'suspended',
  Deleted = 'deleted'
}

enum PaymentMethod {
  CreditCard = 'credit_card',
  PayPal = 'paypal',
  BankTransfer = 'bank_transfer'
}

// ❌ Bad: Numeric values without explicit meaning
enum UserStatus {
  Active = 0,
  Inactive = 1,
  Suspended = 2
}
```

## Type Definitions

### Function Types
```typescript
// ✅ Good: Explicit return types
function processUser(user: User): Promise<ProcessedUser> {
  return userProcessor.process(user);
}

// ✅ Good: Arrow functions with explicit types
const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// ❌ Bad: Implicit return types
function processUser(user: User) {
  return userProcessor.process(user);
}
```

### Interface Definitions
```typescript
// ✅ Good: Clear interface structure
interface CreateUserRequest {
  readonly email: string;
  readonly password: string;
  readonly profile: UserProfile;
  readonly agreedToTerms: boolean;
}

interface UserProfile {
  readonly name: string;
  readonly bio?: string;
  readonly avatar?: string;
  readonly preferences: UserPreferences;
}

// ✅ Good: Generic interfaces
interface Repository<T, ID> {
  findById(id: ID): Promise<T | null>;
  findAll(): Promise<T[]>;
  save(entity: T): Promise<void>;
  delete(id: ID): Promise<void>;
}

// ❌ Bad: Unclear or too generic
interface UserData {
  data: any;
  info: string;
}
```

### Type Aliases
```typescript
// ✅ Good: Descriptive type aliases
type UserId = string;
type UserRole = 'admin' | 'user' | 'moderator';
type EventHandler<T> = (event: T) => Promise<void>;
type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

// ✅ Good: Union types for business logic
type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded';

// ❌ Bad: Overly generic aliases
type StringOrNumber = string | number;
type Data = any;
```

## Domain-Driven Design Patterns

### Aggregate Roots
```typescript
// ✅ Good: Aggregate root with proper encapsulation
class UserAggregate {
  private constructor(
    private readonly _id: UserId,
    private _email: Email,
    private _profile: UserProfile,
    private readonly _createdAt: Date = new Date()
  ) {}

  static create(email: Email, profile: UserProfile): UserAggregate {
    const id = UserId.generate();
    const user = new UserAggregate(id, email, profile);
    user.recordEvent(new UserCreatedEvent(id, email, profile));
    return user;
  }

  static reconstitute(
    id: UserId,
    email: Email,
    profile: UserProfile,
    createdAt: Date
  ): UserAggregate {
    return new UserAggregate(id, email, profile, createdAt);
  }

  changeEmail(newEmail: Email): void {
    if (this._email.equals(newEmail)) {
      return;
    }

    const oldEmail = this._email;
    this._email = newEmail;
    this.recordEvent(new UserEmailChangedEvent(this._id, oldEmail, newEmail));
  }

  get id(): UserId {
    return this._id;
  }

  get email(): Email {
    return this._email;
  }

  get profile(): UserProfile {
    return this._profile;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  private recordEvent(event: DomainEvent): void {
    // Record domain event for later publishing
  }
}
```

### Value Objects
```typescript
// ✅ Good: Immutable value object
class Email {
  private constructor(private readonly _value: string) {}

  static create(email: string): Email {
    if (!Email.isValid(email)) {
      throw new ValidationError(
        'Invalid email format',
        'INVALID_EMAIL_FORMAT',
        { email }
      );
    }
    return new Email(email.toLowerCase());
  }

  equals(other: Email): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  get value(): string {
    return this._value;
  }

  private static isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

// ✅ Good: Complex value object
class Money {
  private constructor(
    private readonly _amount: number,
    private readonly _currency: Currency
  ) {}

  static create(amount: number, currency: Currency): Money {
    if (amount < 0) {
      throw new ValidationError(
        'Amount cannot be negative',
        'NEGATIVE_AMOUNT',
        { amount }
      );
    }
    return new Money(amount, currency);
  }

  add(other: Money): Money {
    if (!this._currency.equals(other._currency)) {
      throw new ValidationError(
        'Cannot add money with different currencies',
        'CURRENCY_MISMATCH',
        { 
          thisCurrency: this._currency.code,
          otherCurrency: other._currency.code 
        }
      );
    }
    return new Money(this._amount + other._amount, this._currency);
  }

  equals(other: Money): boolean {
    return this._amount === other._amount && 
           this._currency.equals(other._currency);
  }

  get amount(): number {
    return this._amount;
  }

  get currency(): Currency {
    return this._currency;
  }
}
```

### Domain Events
```typescript
// ✅ Good: Domain event with proper structure
abstract class DomainEvent {
  constructor(
    public readonly aggregateId: string,
    public readonly occurredAt: Date = new Date(),
    public readonly correlationId?: string
  ) {}

  abstract get eventName(): string;
}

class UserCreatedEvent extends DomainEvent {
  constructor(
    public readonly userId: UserId,
    public readonly email: Email,
    public readonly profile: UserProfile,
    occurredAt?: Date,
    correlationId?: string
  ) {
    super(userId.toString(), occurredAt, correlationId);
  }

  get eventName(): string {
    return 'UserCreated';
  }
}

class UserEmailChangedEvent extends DomainEvent {
  constructor(
    public readonly userId: UserId,
    public readonly oldEmail: Email,
    public readonly newEmail: Email,
    occurredAt?: Date,
    correlationId?: string
  ) {
    super(userId.toString(), occurredAt, correlationId);
  }

  get eventName(): string {
    return 'UserEmailChanged';
  }
}
```

### Domain Services
```typescript
// ✅ Good: Domain service with clear responsibility
class UserDomainService {
  constructor(private readonly userRepository: UserRepository) {}

  async isEmailUnique(email: Email): Promise<boolean> {
    const existingUser = await this.userRepository.findByEmail(email);
    return existingUser === null;
  }

  async canUserChangeEmail(userId: UserId, newEmail: Email): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return false;
    }

    if (user.email.equals(newEmail)) {
      return false; // No change needed
    }

    return await this.isEmailUnique(newEmail);
  }
}
```

## Error Handling

### Custom Error Types
```typescript
// ✅ Good: Specific error hierarchy
abstract class SemantestError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, any>,
    public readonly correlationId?: string
  ) {
    super(message);
    this.name = this.constructor.name;
  }

  abstract get statusCode(): number;
}

class ValidationError extends SemantestError {
  constructor(
    message: string,
    code: string,
    context?: Record<string, any>,
    correlationId?: string
  ) {
    super(message, code, context, correlationId);
  }

  get statusCode(): number {
    return 400;
  }
}

class NotFoundError extends SemantestError {
  constructor(
    message: string,
    code: string,
    context?: Record<string, any>,
    correlationId?: string
  ) {
    super(message, code, context, correlationId);
  }

  get statusCode(): number {
    return 404;
  }
}
```

### Error Handling Patterns
```typescript
// ✅ Good: Explicit error handling
async function createUser(userData: CreateUserRequest): Promise<User> {
  try {
    const email = Email.create(userData.email);
    const profile = UserProfile.create(userData.profile);
    
    const user = UserAggregate.create(email, profile);
    await userRepository.save(user);
    
    return user;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error; // Re-throw validation errors
    }
    
    if (error instanceof DatabaseError) {
      throw new Error('Failed to create user due to database error');
    }
    
    throw new Error('Unexpected error during user creation');
  }
}

// ✅ Good: Result pattern for operations that may fail
type Result<T, E = Error> = {
  success: true;
  data: T;
} | {
  success: false;
  error: E;
};

async function findUser(id: UserId): Promise<Result<User, NotFoundError>> {
  try {
    const user = await userRepository.findById(id);
    if (!user) {
      return {
        success: false,
        error: new NotFoundError('User not found', 'USER_NOT_FOUND', { id })
      };
    }
    
    return {
      success: true,
      data: user
    };
  } catch (error) {
    return {
      success: false,
      error: new NotFoundError('Failed to find user', 'USER_LOOKUP_FAILED', { id })
    };
  }
}
```

## Async/Await Best Practices

### Promise Handling
```typescript
// ✅ Good: Explicit async/await
async function processUserRegistration(request: RegisterUserRequest): Promise<User> {
  const email = Email.create(request.email);
  
  // Check if email is unique
  const isUnique = await userDomainService.isEmailUnique(email);
  if (!isUnique) {
    throw new ValidationError(
      'Email is already in use',
      'EMAIL_ALREADY_EXISTS',
      { email: request.email }
    );
  }
  
  // Create user
  const user = UserAggregate.create(email, UserProfile.create(request.profile));
  await userRepository.save(user);
  
  // Send welcome email
  await emailService.sendWelcomeEmail(user.email, user.profile.name);
  
  return user;
}

// ✅ Good: Parallel async operations
async function getUserDashboardData(userId: UserId): Promise<DashboardData> {
  const [user, orders, preferences] = await Promise.all([
    userRepository.findById(userId),
    orderRepository.findByUserId(userId),
    preferencesRepository.findByUserId(userId)
  ]);
  
  if (!user) {
    throw new NotFoundError('User not found', 'USER_NOT_FOUND', { userId });
  }
  
  return new DashboardData(user, orders, preferences);
}
```

### Error Handling with Async/Await
```typescript
// ✅ Good: Proper error handling
async function updateUserProfile(
  userId: UserId,
  profileData: UpdateProfileRequest
): Promise<User> {
  let user: User;
  
  try {
    user = await userRepository.findById(userId);
  } catch (error) {
    throw new Error('Failed to retrieve user');
  }
  
  if (!user) {
    throw new NotFoundError('User not found', 'USER_NOT_FOUND', { userId });
  }
  
  try {
    const updatedProfile = UserProfile.create(profileData);
    user.updateProfile(updatedProfile);
    
    await userRepository.save(user);
    
    return user;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    
    throw new Error('Failed to update user profile');
  }
}
```

## Class Design

### Constructor Patterns
```typescript
// ✅ Good: Private constructor with factory methods
class UserAggregate {
  private constructor(
    private readonly _id: UserId,
    private _email: Email,
    private _profile: UserProfile,
    private readonly _createdAt: Date = new Date()
  ) {}

  static create(email: Email, profile: UserProfile): UserAggregate {
    const id = UserId.generate();
    return new UserAggregate(id, email, profile);
  }

  static reconstitute(
    id: UserId,
    email: Email,
    profile: UserProfile,
    createdAt: Date
  ): UserAggregate {
    return new UserAggregate(id, email, profile, createdAt);
  }
}

// ✅ Good: Dependency injection
class UserApplicationService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userDomainService: UserDomainService,
    private readonly eventBus: EventBus
  ) {}

  async createUser(request: CreateUserRequest): Promise<CreateUserResponse> {
    // Implementation
  }
}
```

### Property Access
```typescript
// ✅ Good: Explicit getters for encapsulation
class User {
  private constructor(
    private readonly _id: UserId,
    private _email: Email,
    private _profile: UserProfile
  ) {}

  get id(): UserId {
    return this._id;
  }

  get email(): Email {
    return this._email;
  }

  get profile(): UserProfile {
    return this._profile;
  }

  // Business methods
  changeEmail(newEmail: Email): void {
    if (this._email.equals(newEmail)) {
      return;
    }
    
    this._email = newEmail;
    this.recordEvent(new UserEmailChangedEvent(this._id, this._email, newEmail));
  }
}
```

## Generic Programming

### Generic Constraints
```typescript
// ✅ Good: Constrained generics
interface Repository<T extends AggregateRoot, ID> {
  findById(id: ID): Promise<T | null>;
  save(entity: T): Promise<void>;
  delete(id: ID): Promise<void>;
}

// ✅ Good: Multiple type parameters
interface EventHandler<T extends DomainEvent, R = void> {
  handle(event: T): Promise<R>;
}

// ✅ Good: Conditional types
type ApiResponse<T> = T extends string 
  ? { message: T }
  : { data: T };

// ✅ Good: Utility types
type CreateUserRequest = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateUserRequest = Partial<Pick<User, 'email' | 'profile'>>;
```

### Generic Functions
```typescript
// ✅ Good: Generic utility functions
function createRepository<T extends AggregateRoot, ID>(
  entityClass: new (...args: any[]) => T,
  database: Database
): Repository<T, ID> {
  return new GenericRepository<T, ID>(entityClass, database);
}

// ✅ Good: Generic validation
function validateAndCreate<T>(
  data: any,
  validator: (data: any) => boolean,
  factory: (data: any) => T
): T {
  if (!validator(data)) {
    throw new ValidationError('Invalid data', 'VALIDATION_FAILED', { data });
  }
  
  return factory(data);
}
```

## Module Organization

### Import/Export Patterns
```typescript
// ✅ Good: Explicit imports
import { UserAggregate } from './domain/entities/UserAggregate';
import { Email } from './domain/value-objects/Email';
import { UserCreatedEvent } from './domain/events/UserCreatedEvent';

// ✅ Good: Grouped imports
import {
  UserRepository,
  OrderRepository,
  PreferencesRepository
} from './infrastructure/repositories';

// ✅ Good: Type-only imports
import type { UserRepository } from './domain/repositories/UserRepository';
import type { EventBus } from './infrastructure/EventBus';

// ✅ Good: Barrel exports
// domain/index.ts
export { UserAggregate } from './entities/UserAggregate';
export { Email } from './value-objects/Email';
export { UserCreatedEvent } from './events/UserCreatedEvent';
```

### File Organization
```typescript
// ✅ Good: Single responsibility per file
// UserAggregate.ts
export class UserAggregate {
  // Implementation
}

// UserRepository.ts
export interface UserRepository {
  // Interface definition
}

// UserCreatedEvent.ts
export class UserCreatedEvent extends DomainEvent {
  // Implementation
}
```

## Comments and Documentation

### JSDoc Comments
```typescript
/**
 * Represents a user aggregate root in the domain model.
 * Encapsulates user business logic and invariants.
 */
class UserAggregate {
  /**
   * Creates a new user with the provided email and profile.
   * 
   * @param email - The user's email address
   * @param profile - The user's profile information
   * @returns A new UserAggregate instance
   * @throws ValidationError when email or profile is invalid
   */
  static create(email: Email, profile: UserProfile): UserAggregate {
    // Implementation
  }

  /**
   * Changes the user's email address.
   * 
   * @param newEmail - The new email address
   * @throws ValidationError when the new email is invalid
   */
  changeEmail(newEmail: Email): void {
    // Implementation
  }
}
```

### Code Comments
```typescript
// ✅ Good: Explain business logic
function calculateDiscountAmount(order: Order): Money {
  // Apply volume discount for orders over $100
  if (order.total.amount > 100) {
    return order.total.multiply(0.1); // 10% discount
  }
  
  // Apply first-time customer discount
  if (order.customer.isFirstTime) {
    return order.total.multiply(0.05); // 5% discount
  }
  
  return Money.zero(order.total.currency);
}

// ✅ Good: Explain complex algorithms
function calculateShippingCost(order: Order): Money {
  // Use distance-based shipping calculation
  // Formula: base_cost + (distance * rate_per_mile) + packaging_cost
  const baseCost = Money.create(5.99, Currency.USD);
  const distanceCost = order.shippingDistance.multiply(0.75);
  const packagingCost = order.items.reduce(
    (total, item) => total.add(item.packagingCost),
    Money.zero(Currency.USD)
  );
  
  return baseCost.add(distanceCost).add(packagingCost);
}
```

## Testing Patterns

### Unit Test Structure
```typescript
// ✅ Good: Clear test structure
describe('UserAggregate', () => {
  describe('create', () => {
    it('should create user with valid email and profile', () => {
      // Arrange
      const email = Email.create('test@example.com');
      const profile = UserProfile.create('John Doe');

      // Act
      const user = UserAggregate.create(email, profile);

      // Assert
      expect(user.email).toEqual(email);
      expect(user.profile).toEqual(profile);
      expect(user.id).toBeDefined();
    });

    it('should throw ValidationError for invalid email', () => {
      // Arrange
      const invalidEmail = 'invalid-email';
      const profile = UserProfile.create('John Doe');

      // Act & Assert
      expect(() => {
        Email.create(invalidEmail);
      }).toThrow(ValidationError);
    });
  });

  describe('changeEmail', () => {
    it('should change email when new email is different', () => {
      // Arrange
      const originalEmail = Email.create('old@example.com');
      const newEmail = Email.create('new@example.com');
      const user = UserAggregate.create(originalEmail, UserProfile.create('John'));

      // Act
      user.changeEmail(newEmail);

      // Assert
      expect(user.email).toEqual(newEmail);
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
      expect(user.email).toEqual(email);
      expect(user.getUncommittedEvents()).toHaveLength(0);
    });
  });
});
```

### Mock and Stub Patterns
```typescript
// ✅ Good: Mock dependencies
describe('UserApplicationService', () => {
  let userService: UserApplicationService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockEventBus: jest.Mocked<EventBus>;

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
      delete: jest.fn()
    };

    mockEventBus = {
      publish: jest.fn()
    };

    userService = new UserApplicationService(
      mockUserRepository,
      mockEventBus
    );
  });

  it('should create user successfully', async () => {
    // Arrange
    const request = {
      email: 'test@example.com',
      profile: { name: 'John Doe' }
    };

    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.save.mockResolvedValue();

    // Act
    const result = await userService.createUser(request);

    // Assert
    expect(result.success).toBe(true);
    expect(mockUserRepository.save).toHaveBeenCalledWith(
      expect.any(UserAggregate)
    );
    expect(mockEventBus.publish).toHaveBeenCalledWith(
      expect.any(UserCreatedEvent)
    );
  });
});
```

## Performance Considerations

### Lazy Loading
```typescript
// ✅ Good: Lazy loading for expensive operations
class UserAggregate {
  private _orders?: Order[];

  async getOrders(): Promise<Order[]> {
    if (!this._orders) {
      this._orders = await this.orderRepository.findByUserId(this.id);
    }
    return this._orders;
  }
}
```

### Memoization
```typescript
// ✅ Good: Memoization for expensive calculations
class PriceCalculator {
  private cache = new Map<string, Money>();

  calculateDiscountedPrice(product: Product, discountCode: string): Money {
    const cacheKey = `${product.id}-${discountCode}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }
    
    const discountedPrice = this.performCalculation(product, discountCode);
    this.cache.set(cacheKey, discountedPrice);
    
    return discountedPrice;
  }

  private performCalculation(product: Product, discountCode: string): Money {
    // Expensive calculation logic
    return product.price.multiply(0.9);
  }
}
```

## Common Anti-Patterns to Avoid

### Anemic Domain Models
```typescript
// ❌ Bad: Anemic domain model
class User {
  id: string;
  email: string;
  profile: UserProfile;
}

class UserService {
  changeUserEmail(user: User, newEmail: string): void {
    // Business logic in service instead of domain
    user.email = newEmail;
  }
}

// ✅ Good: Rich domain model
class UserAggregate {
  private constructor(
    private readonly _id: UserId,
    private _email: Email,
    private _profile: UserProfile
  ) {}

  changeEmail(newEmail: Email): void {
    // Business logic in the domain
    if (this._email.equals(newEmail)) {
      return;
    }
    
    this._email = newEmail;
    this.recordEvent(new UserEmailChangedEvent(this._id, this._email, newEmail));
  }
}
```

### Primitive Obsession
```typescript
// ❌ Bad: Primitive obsession
function createUser(email: string, name: string): User {
  if (!email.includes('@')) {
    throw new Error('Invalid email');
  }
  
  return new User(email, name);
}

// ✅ Good: Value objects
function createUser(email: Email, name: Name): User {
  return UserAggregate.create(email, UserProfile.create(name));
}
```

### God Classes
```typescript
// ❌ Bad: God class
class UserManager {
  createUser() { }
  updateUser() { }
  deleteUser() { }
  sendEmail() { }
  calculateDiscount() { }
  processPayment() { }
  generateReport() { }
}

// ✅ Good: Single responsibility
class UserApplicationService {
  createUser() { }
  updateUser() { }
  deleteUser() { }
}

class EmailService {
  sendEmail() { }
}

class DiscountService {
  calculateDiscount() { }
}
```

---

**Version**: 1.0.0  
**Last Updated**: January 18, 2025  
**Maintainer**: Semantest Architecture Team