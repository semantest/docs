# TDD Quick Reference Card

## The TDD Cycle
```
🔴 RED → 🟢 GREEN → 🔵 REFACTOR → 🔁 REPEAT
```

## Rules
1. **No production code without failing test**
2. **Write minimal test to fail**
3. **Write minimal code to pass**
4. **Refactor only when green**

## Test Structure
```typescript
describe('Feature', () => {
  it('should behavior', () => {
    // Arrange
    const input = setupTestData();
    
    // Act
    const result = executeFunction(input);
    
    // Assert
    expect(result).toBe(expected);
  });
});
```

## Mob TDD Checklist

### Before Writing Test
- [ ] Is this the next logical test?
- [ ] Does it test one behavior?
- [ ] Is the test name clear?

### After Test Fails
- [ ] Does it fail for the right reason?
- [ ] Is the error message helpful?
- [ ] Is this the minimal test?

### Before Writing Code
- [ ] Do we understand what should pass?
- [ ] What's the simplest solution?
- [ ] Are we solving only this test?

### After Test Passes
- [ ] Can we refactor?
- [ ] Are all tests still green?
- [ ] Is the code clear?

## Common Anti-Patterns
❌ Writing multiple tests at once  
❌ Writing code before test  
❌ Skipping refactor step  
❌ Testing implementation details  
❌ Writing complex first test  

## Mob Mantras
- "Make it fail, make it pass, make it beautiful"
- "As simple as possible, but no simpler"
- "Test behavior, not implementation"
- "When in doubt, write a test"
- "Green is good, red is required"

---
*Keep this visible during mob sessions!*