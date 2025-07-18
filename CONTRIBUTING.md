# Contributing to Semantest

Thank you for your interest in contributing to Semantest! This guide will help you get started with contributing to our project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Setup](#development-setup)
4. [How to Contribute](#how-to-contribute)
5. [Pull Request Process](#pull-request-process)
6. [Coding Standards](#coding-standards)
7. [Testing Guidelines](#testing-guidelines)
8. [Documentation](#documentation)
9. [Release Process](#release-process)

## Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Expected Behavior

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment of any kind
- Discriminatory language or actions
- Personal attacks
- Publishing private information without consent
- Other conduct which could reasonably be considered inappropriate

## Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- Git 2.25+
- npm 9+ or yarn 1.22+
- TypeScript 5.0+
- Chrome browser (for extension development)

### Repository Structure

```
semantest/
├── core/                    # Core utilities and base classes
├── browser/                 # Browser automation framework
├── nodejs.server/           # Server infrastructure
├── extension.chrome/        # Chrome extension
├── images.google.com/       # Google Images domain
├── chatgpt.com/            # ChatGPT domain
├── docs/                   # Documentation
└── scripts/                # Build and utility scripts
```

## Development Setup

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/YOUR_USERNAME/semantest.git
cd semantest

# Add upstream remote
git remote add upstream https://github.com/semantest/workspace.git
```

### 2. Install Dependencies

```bash
# Install all dependencies
npm run install:all

# Build all modules
npm run build:all

# Run tests to verify setup
npm run test:all
```

### 3. Create a Branch

```bash
# Update your fork
git fetch upstream
git checkout main
git merge upstream/main

# Create a feature branch
git checkout -b feature/your-feature-name

# For bug fixes
git checkout -b fix/bug-description
```

## How to Contribute

### Types of Contributions

#### 1. Bug Reports

- Use the bug report template
- Include reproduction steps
- Provide system information
- Include error messages and logs

#### 2. Feature Requests

- Use the feature request template
- Explain the use case
- Provide examples
- Consider implementation details

#### 3. Code Contributions

- Fix bugs
- Add new features
- Improve performance
- Refactor code
- Add tests

#### 4. Documentation

- Fix typos
- Improve clarity
- Add examples
- Translate documentation

### Development Workflow

1. **Pick an Issue**
   - Check existing issues
   - Comment to claim an issue
   - Wait for assignment

2. **Development**
   - Write code following our standards
   - Add/update tests
   - Update documentation
   - Test locally

3. **Testing**
   ```bash
   # Run unit tests
   npm test
   
   # Run integration tests
   npm run test:integration
   
   # Run specific module tests
   cd images.google.com && npm test
   ```

4. **Commit Changes**
   ```bash
   # Stage changes
   git add .
   
   # Commit with conventional format
   git commit -m "feat(images): add high-resolution download"
   ```

## Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] Documentation updated
- [ ] Commit messages follow conventions
- [ ] Branch is up to date with main

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guide
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
```

### Review Process

1. **Automated Checks**
   - CI/CD pipeline runs
   - Tests must pass
   - Code coverage maintained
   - No security vulnerabilities

2. **Code Review**
   - 2+ approvals required
   - Address all feedback
   - Keep discussions professional
   - Update PR based on feedback

3. **Merge**
   - Squash and merge for features
   - Merge commit for releases
   - Delete branch after merge

## Coding Standards

### TypeScript Style Guide

#### 1. General Rules

```typescript
// Use explicit types
let count: number = 0;  // ✅
let count = 0;         // ❌

// Use interfaces over type aliases for objects
interface User {      // ✅
  name: string;
  age: number;
}

type User = {        // ❌ (for object types)
  name: string;
  age: number;
};

// Use const assertions
const config = {
  api: 'https://api.example.com'
} as const;
```

#### 2. Naming Conventions

```typescript
// Classes: PascalCase
class UserService { }

// Interfaces: PascalCase with 'I' prefix for contracts
interface IUserRepository { }

// Type aliases: PascalCase
type UserId = string;

// Functions/methods: camelCase
function getUserById(id: string) { }

// Constants: UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;

// File names: kebab-case
// user-service.ts
// download-manager.ts
```

#### 3. Domain-Driven Design

```typescript
// Entities must extend base Entity class
class User extends Entity<User> {
  // Private constructor for factory pattern
  private constructor(
    private readonly id: UserId,
    private name: string
  ) {
    super();
  }
  
  // Static factory method
  static create(name: string): User {
    return new User(UserId.generate(), name);
  }
  
  // Business methods emit events
  changeName(newName: string): void {
    this.name = newName;
    this.addDomainEvent(new UserNameChanged(this.id.value, newName));
  }
}

// Value objects are immutable
class Email extends ValueObject<Email> {
  constructor(public readonly value: string) {
    super();
    if (!Email.isValid(value)) {
      throw new InvalidEmailError(value);
    }
  }
  
  static isValid(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }
}
```

#### 4. Error Handling

```typescript
// Use custom error classes
class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: any
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

// Throw specific errors
throw new InvalidImageUrlError(url);

// Use Result type for expected errors
function parseUrl(url: string): Result<URL, string> {
  try {
    return Result.ok(new URL(url));
  } catch {
    return Result.fail('Invalid URL format');
  }
}
```

#### 5. Async/Await

```typescript
// Always use async/await over promises
async function fetchUser(id: string): Promise<User> {  // ✅
  const response = await api.get(`/users/${id}`);
  return User.fromJSON(response.data);
}

function fetchUser(id: string): Promise<User> {       // ❌
  return api.get(`/users/${id}`)
    .then(response => User.fromJSON(response.data));
}
```

### ESLint Configuration

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
    "no-console": ["error", { "allow": ["warn", "error"] }],
    "prefer-const": "error"
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
  "bracketSpacing": true
}
```

## Testing Guidelines

### Test Structure

```typescript
describe('UserService', () => {
  let service: UserService;
  let repository: MockRepository<User>;
  
  beforeEach(() => {
    repository = new MockRepository();
    service = new UserService(repository);
  });
  
  describe('createUser', () => {
    it('should create user with valid data', async () => {
      // Arrange
      const userData = { name: 'John Doe', email: 'john@example.com' };
      
      // Act
      const user = await service.createUser(userData);
      
      // Assert
      expect(user.getName()).toBe('John Doe');
      expect(repository.save).toHaveBeenCalledWith(user);
    });
    
    it('should throw error for invalid email', async () => {
      // Arrange
      const userData = { name: 'John Doe', email: 'invalid' };
      
      // Act & Assert
      await expect(service.createUser(userData))
        .rejects
        .toThrow(InvalidEmailError);
    });
  });
});
```

### Testing Checklist

- [ ] Unit tests for all public methods
- [ ] Integration tests for module boundaries
- [ ] E2E tests for critical user paths
- [ ] Edge cases covered
- [ ] Error scenarios tested
- [ ] Performance tests for critical paths

### Coverage Requirements

- Minimum 80% code coverage
- 100% coverage for domain logic
- Critical paths must have E2E tests

## Documentation

### Code Documentation

```typescript
/**
 * Downloads an image from the specified URL.
 * 
 * @param options - Download configuration
 * @returns Promise resolving to download result
 * @throws {InvalidImageUrlError} If the URL is invalid
 * @throws {DownloadTimeoutError} If download exceeds timeout
 * 
 * @example
 * ```typescript
 * const result = await downloader.downloadImage({
 *   imageUrl: 'https://example.com/image.jpg',
 *   fileName: 'my-image.jpg'
 * });
 * ```
 */
async downloadImage(options: DownloadOptions): Promise<DownloadResult> {
  // Implementation
}
```

### README Updates

- Update README when adding features
- Include usage examples
- Document breaking changes
- Add badges for build status

## Release Process

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking API changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist

1. **Prepare Release**
   ```bash
   # Create release branch
   git checkout -b release/v2.1.0
   
   # Update version
   npm version minor
   
   # Update CHANGELOG
   npm run changelog
   ```

2. **Testing**
   - Run full test suite
   - Manual smoke tests
   - Performance benchmarks
   - Security scan

3. **Documentation**
   - Update API docs
   - Update migration guide
   - Review README

4. **Release**
   ```bash
   # Merge to main
   git checkout main
   git merge release/v2.1.0
   
   # Tag release
   git tag -a v2.1.0 -m "Release version 2.1.0"
   
   # Push
   git push origin main --tags
   ```

## Getting Help

### Resources

- [Documentation](https://docs.semantest.com)
- [API Reference](./docs/API_REFERENCE.md)
- [Architecture Guide](./docs/architecture/README.md)
- [Discord Community](https://discord.gg/semantest)

### Communication Channels

- **Issues**: Bug reports and feature requests
- **Discussions**: General questions and ideas
- **Discord**: Real-time chat and support
- **Email**: security@semantest.com (security only)

## Recognition

Contributors are recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project website
- Annual contributor report

Thank you for contributing to Semantest! 🎉