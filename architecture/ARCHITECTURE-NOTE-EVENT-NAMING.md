# 📐 ARCHITECTURE NOTE: Event Naming Convention

## From rydnr - For Future Refactoring (AFTER first use case works)

### The Wisdom:
Use **past-tense event naming** instead of command-style names:

❌ **Current (Command-style)**:
- `generateImage`
- `createChat`
- `downloadFile`
- `executeContract`

✅ **Future (Event-style)**:
- `imageGenerationRequested`
- `chatCreationRequested`
- `fileDownloadRequested`
- `contractExecutionRequested`

### Why This Matters:
1. **Aligns with Event Sourcing patterns** - Events describe what happened
2. **Makes async nature clearer** - "Requested" implies async handling
3. **Better for distributed systems** - Events can be replayed/audited
4. **Clearer intent** - Distinguishes events from synchronous methods

### For REQ-002 Bulk Generation:
When we build the bulk system, we should use:
```javascript
// Event-driven architecture for 500 comics:
{
  type: "bulkImageGenerationRequested",
  payload: {
    panels: [...],
    style: "noir",
    parallelCount: 10
  }
}

// Not:
{
  type: "generateBulkImages",  // Too command-like
  ...
}
```

### Current Code Examples to Refactor Later:
```javascript
// Current:
case 'GENERATE_IMAGE':
case 'CREATE_NEW_CHAT':
case 'SEND_PROMPT':

// Future:
case 'IMAGE_GENERATION_REQUESTED':
case 'NEW_CHAT_CREATION_REQUESTED':
case 'PROMPT_SUBMISSION_REQUESTED':
```

### The Pattern:
`[noun][action]Requested` or `[noun][action]Occurred`
- Requested: For commands that trigger async operations
- Occurred: For events that have already happened

### Implementation Timeline:
1. **NOW**: Get first use case working ✅
2. **AFTER SUCCESS**: Refactor to event naming
3. **REQ-002**: Use proper naming from start

---

*"Good architecture is worth waiting for. First make it work, then make it beautiful."*

## Noted for future improvement! 📝