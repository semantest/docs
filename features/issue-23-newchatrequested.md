# Issue #23: NewChatRequested Event Support

## Overview

The NewChatRequested event enables Semantest extensions to handle new chat session requests seamlessly. This feature is crucial for maintaining context and state when users initiate new conversations or testing sessions.

## Implementation Guide

### Event Structure

```javascript
// Event payload
{
  event: 'NewChatRequested',
  timestamp: Date.now(),
  context: {
    previousSessionId: 'uuid-here',
    userIntent: 'start-fresh' | 'continue-context',
    metadata: {}
  }
}
```

### Backend Implementation (Alex)

The backend needs to:

1. **Listen for the Event**
```javascript
messageHandler.on('NewChatRequested', async (payload) => {
  // Handle new chat initialization
  const newSession = await createNewSession(payload);
  
  // Preserve relevant context if needed
  if (payload.context.userIntent === 'continue-context') {
    await transferContext(payload.context.previousSessionId, newSession.id);
  }
  
  return newSession;
});
```

2. **Session Management**
- Create new session with unique ID
- Handle context transfer when appropriate
- Clean up old sessions
- Emit confirmation event

### Frontend Integration

Extensions should:
- Display clear UI for new chat requests
- Preserve user preferences
- Handle loading states gracefully

## User Stories

### Sarah's Experience
"When I'm testing a complex flow and need to start fresh, I just click 'New Chat' and Semantest cleans everything up while keeping my test configuration. No more manual cleanup!"

### Mike's Workflow
"I can quickly switch between different testing contexts without losing my place. The NewChatRequested event makes my workflow so much smoother."

## Testing Scenarios

1. **Basic Flow**
   - User clicks "New Chat"
   - Event fires
   - New session created
   - UI updates

2. **Context Preservation**
   - User requests new chat with context
   - Previous test data preserved
   - Relevant configuration maintained

3. **Error Handling**
   - Network failures
   - Session creation errors
   - Graceful fallbacks

## Best Practices

- Always acknowledge the event immediately
- Provide visual feedback during session creation
- Log session transitions for debugging
- Implement proper cleanup of old sessions

---
*Documentation for Issue #23 - NewChatRequested Event*
*Part of the Semantest feature enhancement series*