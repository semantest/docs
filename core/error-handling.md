# Semantest Error Handling Guide

## Overview

The Semantest platform implements a comprehensive error handling system that provides:
- Structured error hierarchy
- Rich context information
- Recovery suggestions
- User and developer friendly messages
- Integration with logging and monitoring
- React error boundaries for UI components

## Error Hierarchy

```
SemantestError (base)
├── ValidationError
│   ├── RequiredFieldError
│   ├── InvalidTypeError
│   └── RangeError
├── DomainError
│   ├── EntityNotFoundError
│   ├── BusinessRuleViolationError
│   ├── AggregateInvariantError
│   └── DomainEventError
├── InfrastructureError
│   ├── NetworkError
│   ├── DatabaseError
│   ├── ServiceUnavailableError
│   ├── TimeoutError
│   └── RateLimitError
├── BrowserError
│   ├── ElementNotFoundError
│   ├── NavigationError
│   ├── BrowserActionError
│   ├── EvaluationError
│   └── BrowserContextError
└── SecurityError
    ├── AuthenticationError
    ├── AuthorizationError
    ├── CSRFError
    ├── InputSanitizationError
    ├── SecurityRateLimitError
    └── CryptographyError
```

## Basic Usage

### Throwing Errors

```typescript
import { ValidationError, RequiredFieldError } from '@semantest/core';

// Basic validation error
throw new ValidationError('Invalid email format', 'email', value);

// Required field error
throw new RequiredFieldError('username');

// With context
throw new ValidationError(
  'Password too weak',
  'password',
  value,
  { minLength: 8, requireSpecialChars: true },
  { userId, attemptNumber }
);
```

### Domain Errors

```typescript
import { EntityNotFoundError, BusinessRuleViolationError } from '@semantest/core';

// Entity not found
throw new EntityNotFoundError('User', userId, 'users');

// Business rule violation
throw new BusinessRuleViolationError(
  'INSUFFICIENT_BALANCE',
  'Cannot withdraw more than current balance',
  'banking',
  { currentBalance, requestedAmount }
);
```

### Infrastructure Errors

```typescript
import { NetworkError, TimeoutError } from '@semantest/core';

// Network error
throw new NetworkError(
  'Failed to fetch user data',
  'https://api.example.com/users',
  'GET',
  404,
  originalError
);

// Timeout error
throw new TimeoutError('Database query', 5000, 'postgres');
```

## Error Handling

### Global Error Handler

```typescript
import { ErrorHandler } from '@semantest/core';

// Create error handler with custom config
const errorHandler = new ErrorHandler({
  logErrors: true,
  includeStackTrace: process.env.NODE_ENV !== 'production',
  sanitizeErrors: true,
  defaultMessage: 'An unexpected error occurred',
  onError: (error) => {
    // Send to monitoring service
    monitoringService.captureException(error);
  }
});

// Handle error
try {
  await riskyOperation();
} catch (error) {
  const response = errorHandler.handle(error);
  res.status(response.error.statusCode).json(response);
}
```

### Express Middleware

```typescript
import { expressErrorHandler, asyncHandler } from '@semantest/core';

// Add error middleware
app.use(expressErrorHandler({
  logErrors: true,
  sanitizeErrors: true
}));

// Wrap async routes
app.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await userService.findById(req.params.id);
  if (!user) {
    throw new EntityNotFoundError('User', req.params.id, 'users');
  }
  res.json(user);
}));
```

## React Error Boundaries

### Basic Error Boundary

```tsx
import { ErrorBoundary } from '@semantest/core';

function App() {
  return (
    <ErrorBoundary
      level="page"
      onError={(error, errorInfo) => {
        console.error('App error:', error);
      }}
    >
      <YourApp />
    </ErrorBoundary>
  );
}
```

### Custom Fallback UI

```tsx
<ErrorBoundary
  fallback={(error, errorInfo) => (
    <div className="error-page">
      <h1>Oops! Something went wrong</h1>
      <p>{error.message}</p>
      <button onClick={() => window.location.reload()}>
        Refresh Page
      </button>
    </div>
  )}
>
  <YourComponent />
</ErrorBoundary>
```

### HOC Pattern

```tsx
import { withErrorBoundary } from '@semantest/core';

const SafeComponent = withErrorBoundary(YourComponent, {
  level: 'component',
  resetOnPropsChange: true
});
```

### Error Hook

```tsx
import { useErrorHandler } from '@semantest/core';

function YourComponent() {
  const handleError = useErrorHandler();
  
  const riskyOperation = async () => {
    try {
      await doSomethingRisky();
    } catch (error) {
      handleError(error);
    }
  };
}
```

## Recovery Suggestions

Each error type provides helpful recovery suggestions:

```typescript
const error = new NetworkError(
  'API request failed',
  'https://api.example.com',
  'GET',
  503
);

console.log(error.getRecoverySuggestions());
// [
//   'Check your network connection',
//   'Retry the request',
//   'The server is experiencing issues',
//   'Try again later'
// ]
```

## Security Errors

Security errors are handled specially:

```typescript
import { AuthenticationError, SecurityError } from '@semantest/core';

try {
  await authenticate(credentials);
} catch (error) {
  if (error instanceof SecurityError) {
    // Security errors automatically log incidents
    error.logSecurityIncident();
  }
  throw error;
}
```

## Error Context and Correlation

```typescript
// Set correlation ID for distributed tracing
const error = new ValidationError('Invalid input');
error.setCorrelationId(requestId);

// Access error context
const errorData = error.toJSON();
console.log(errorData);
// {
//   name: 'ValidationError',
//   message: 'Invalid input',
//   code: 'VALIDATION_ERROR',
//   timestamp: '2025-01-18T...',
//   correlationId: 'req-123',
//   context: { ... },
//   recoverable: true,
//   statusCode: 400,
//   stack: '...'
// }
```

## Best Practices

1. **Use Specific Error Types**: Always use the most specific error type available
2. **Provide Context**: Include relevant context information for debugging
3. **Set Correlation IDs**: Use correlation IDs for distributed tracing
4. **Handle at Appropriate Level**: Handle errors at the right level in your application
5. **Log Security Incidents**: Security errors should always be logged
6. **Provide Recovery Suggestions**: Help users understand how to fix issues
7. **Use Error Boundaries**: Wrap React components with error boundaries
8. **Sanitize in Production**: Don't expose sensitive information in production

## Testing Errors

```typescript
import { ValidationError } from '@semantest/core';

describe('UserService', () => {
  it('should throw validation error for invalid email', () => {
    expect(() => {
      userService.validateEmail('invalid');
    }).toThrow(ValidationError);
  });
  
  it('should include proper error context', () => {
    try {
      userService.create({ email: 'invalid' });
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.field).toBe('email');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.getRecoverySuggestions()).toContain(
        'Check the input data and try again'
      );
    }
  });
});
```

## Integration with Monitoring

```typescript
import { ErrorHandler } from '@semantest/core';
import * as Sentry from '@sentry/node';

const errorHandler = new ErrorHandler({
  onError: (error) => {
    // Send to Sentry
    if (error instanceof SemantestError) {
      Sentry.captureException(error, {
        tags: {
          errorCode: error.code,
          recoverable: error.recoverable
        },
        extra: error.context
      });
    } else {
      Sentry.captureException(error);
    }
  }
});
```