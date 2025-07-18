# Semantest Code Review Checklist

This checklist ensures consistent, high-quality code reviews across the Semantest project.

## Pre-Review Checklist (For PR Author)

- [ ] **Self-Review Completed**: Reviewed own changes line-by-line
- [ ] **Tests Pass**: All unit, integration, and E2E tests passing
- [ ] **Documentation Updated**: API docs, README, and inline comments current
- [ ] **No Debug Code**: Removed console.logs, debugger statements, TODO comments
- [ ] **Commits Clean**: Logical commits with conventional commit messages
- [ ] **PR Description Complete**: Filled out PR template thoroughly

## General Review Checklist

### 1. Code Quality

- [ ] **Readability**: Code is clear and self-documenting
- [ ] **DRY Principle**: No unnecessary duplication
- [ ] **SOLID Principles**: Follows Single Responsibility, Open/Closed, etc.
- [ ] **Naming**: Variables, functions, and classes have meaningful names
- [ ] **Magic Numbers**: All constants are properly named and documented
- [ ] **Comments**: Complex logic is explained, no obvious comments

### 2. TypeScript Specific

- [ ] **Type Safety**: No `any` types without justification
- [ ] **Explicit Types**: Return types and parameters are explicitly typed
- [ ] **Null Handling**: Proper null/undefined checks
- [ ] **Type Guards**: Custom type guards for union types
- [ ] **Generics**: Appropriate use of generic constraints
- [ ] **Strict Mode**: Code complies with strict TypeScript settings

### 3. Architecture & Design

- [ ] **Domain Boundaries**: No violations of module boundaries
- [ ] **Dependency Direction**: Dependencies flow inward (DDD)
- [ ] **Event Driven**: State changes emit appropriate domain events
- [ ] **Interface Segregation**: Interfaces are focused and minimal
- [ ] **Abstraction Level**: Appropriate abstraction without over-engineering
- [ ] **Patterns**: Design patterns used appropriately

### 4. Error Handling

- [ ] **Try-Catch**: Async operations properly wrapped
- [ ] **Error Types**: Custom error classes for different scenarios
- [ ] **Error Recovery**: Graceful degradation strategies
- [ ] **Logging**: Errors are logged with context
- [ ] **User Messages**: User-friendly error messages
- [ ] **No Silent Failures**: All errors are handled or propagated

### 5. Security

- [ ] **Input Validation**: All user inputs validated and sanitized
- [ ] **SQL Injection**: Parameterized queries used
- [ ] **XSS Prevention**: Output properly escaped
- [ ] **Authentication**: Proper auth checks on sensitive operations
- [ ] **Sensitive Data**: No hardcoded secrets or credentials
- [ ] **Dependencies**: No known vulnerabilities in dependencies

### 6. Performance

- [ ] **Algorithm Efficiency**: Appropriate time/space complexity
- [ ] **Database Queries**: Optimized queries, no N+1 problems
- [ ] **Caching**: Appropriate caching strategies
- [ ] **Memory Leaks**: Event listeners and subscriptions cleaned up
- [ ] **Lazy Loading**: Large data sets paginated or lazily loaded
- [ ] **Bundle Size**: No unnecessary imports or dependencies

### 7. Testing

- [ ] **Test Coverage**: New code has appropriate test coverage (>80%)
- [ ] **Test Quality**: Tests are meaningful, not just for coverage
- [ ] **Edge Cases**: Boundary conditions and error cases tested
- [ ] **Test Isolation**: Tests don't depend on external services
- [ ] **Test Names**: Descriptive test names explaining what and why
- [ ] **Mocking**: Appropriate use of mocks and stubs

### 8. Documentation

- [ ] **API Documentation**: Public methods have JSDoc comments
- [ ] **Complex Logic**: Non-obvious code has explanatory comments
- [ ] **README Updates**: New features documented in README
- [ ] **Examples**: Usage examples for new APIs
- [ ] **Migration Guide**: Breaking changes documented
- [ ] **Architecture Decisions**: ADRs for significant changes

## Domain-Specific Checklists

### Browser Automation

- [ ] **Selector Stability**: Using stable selectors (data-testid preferred)
- [ ] **Wait Strategies**: Proper waits instead of arbitrary delays
- [ ] **Error Recovery**: Handles common browser errors
- [ ] **Resource Cleanup**: Browser instances properly closed
- [ ] **Timeout Handling**: Appropriate timeouts configured

### Event System

- [ ] **Event Naming**: Follows naming conventions
- [ ] **Event Data**: Contains all necessary information
- [ ] **Correlation IDs**: Proper event correlation
- [ ] **Event Ordering**: No assumptions about event order
- [ ] **Event Versioning**: Backward compatibility considered

### API Endpoints

- [ ] **RESTful Design**: Follows REST conventions
- [ ] **Status Codes**: Appropriate HTTP status codes
- [ ] **Request Validation**: Input validation middleware
- [ ] **Response Format**: Consistent response structure
- [ ] **Rate Limiting**: Protected against abuse
- [ ] **CORS**: Proper CORS configuration

## Review Response Guidelines

### Providing Feedback

#### Good Feedback ✅

```typescript
// Consider using a more specific type instead of string
// This would provide better type safety and prevent invalid values
type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';
```

```typescript
// This could lead to a memory leak if the component unmounts
// before the timeout completes. Consider:
useEffect(() => {
  const timer = setTimeout(() => setData(newData), 1000);
  return () => clearTimeout(timer);
}, [newData]);
```

#### Poor Feedback ❌

```
// This is wrong
// Fix this
// Bad code
```

### Categorizing Comments

- **🔴 Must Fix**: Bugs, security issues, or violations of requirements
- **🟡 Should Fix**: Important improvements that should be addressed
- **🟢 Consider**: Suggestions for better practices or minor improvements
- **💡 Nitpick**: Style preferences or very minor issues
- **❓ Question**: Clarification needed to understand the code
- **👏 Praise**: Highlighting good practices or clever solutions

## Approval Criteria

### Approval Requirements

1. **No Blocking Issues**: All 🔴 Must Fix items resolved
2. **Tests Pass**: CI/CD pipeline green
3. **Coverage Maintained**: Code coverage not decreased
4. **Documentation Complete**: All public APIs documented
5. **Security Cleared**: No security vulnerabilities

### When to Request Changes

- Critical bugs or security issues
- Missing required tests
- Violations of architecture principles
- Performance regressions
- Incomplete implementation

### When to Approve with Comments

- Minor issues that can be fixed in follow-up
- Style preferences
- Suggestions for future improvements
- Non-critical optimizations

## Review Efficiency Tips

1. **Review in Passes**
   - First pass: Overall architecture and approach
   - Second pass: Implementation details
   - Third pass: Tests and documentation

2. **Use Tools**
   - IDE/Editor integration for inline comments
   - Linting results to catch style issues
   - Coverage reports to verify testing

3. **Time Management**
   - Limit review sessions to 60-90 minutes
   - Review smaller PRs more frequently
   - Focus on high-risk areas first

4. **Communication**
   - Ask questions rather than make assumptions
   - Suggest alternatives with examples
   - Acknowledge good practices

## Post-Review Actions

### For Reviewers

- [ ] Mark conversations as resolved when addressed
- [ ] Re-review after significant changes
- [ ] Approve when all criteria met
- [ ] Follow up on merged PRs if needed

### For Authors

- [ ] Address all comments (fix or respond)
- [ ] Update PR description with changes made
- [ ] Request re-review after changes
- [ ] Thank reviewers for their time

## Special Considerations

### Large PRs

- Consider breaking into smaller PRs
- Review commit-by-commit
- Focus on architecture first
- Schedule dedicated review time

### Urgent Changes

- Minimum one senior approval
- Focus on critical path
- Create follow-up issues for improvements
- Document any shortcuts taken

### New Contributors

- Extra patience and explanation
- Link to relevant documentation
- Suggest learning resources
- Pair review if possible

## Resources

- [TypeScript Style Guide](./TYPESCRIPT_STYLE_GUIDE.md)
- [Testing Standards](./TESTING_STANDARDS.md)
- [Git Workflow](./GIT_WORKFLOW.md)
- [Architecture Documentation](./architecture/README.md)