# 🚨 CRITICAL CORRECTION - Event Naming from rydnr

## IMPORTANT: Disregard Previous Event Name Guidance!

### ❌ INCORRECT: `ImageRequestReceived` 
### ✅ CORRECT: `imageDownloadRequested`

## Official Clarification from rydnr:

The event should be named **`imageDownloadRequested`** because:
- It represents the USER'S deliberate intention to download an image
- It's about the user's REQUEST, not about us receiving it
- The name reflects the user action, not the system state

## IMMEDIATE ACTIONS REQUIRED:

### 1. Code Updates Needed:

#### Alex (Backend):
- Change event handler to listen for `imageDownloadRequested`
- Update any references to `ImageRequestReceived`
- The existing handler logic can stay, just change the event name

#### Dana (DevOps):
- Update shell script to send `imageDownloadRequested` events
- Event type should be: `chatgpt:image/download/requested`

#### Eva (Extension):
- UI should trigger `imageDownloadRequested` events
- Update any event listeners or emitters

#### Quinn (QA):
- Test for `imageDownloadRequested` events
- Update test cases with correct event name

### 2. Current Implementation Status:

**PROBLEM**: The codebase currently uses `ImageRequestReceived`
**SOLUTION**: Need to refactor to `imageDownloadRequested`

### 3. Event Structure (Updated):
```typescript
// Event name: imageDownloadRequested
{
  type: "chatgpt:image/download/requested",
  payload: {
    project?: string,
    chat?: string,
    prompt: string,
    metadata?: {
      downloadFolder?: string
    }
  }
}
```

## Why This Matters:

The naming convention reflects the USER'S INTENT:
- User REQUESTS an image download
- System processes the request
- Image is downloaded and saved

## Team Communication:

**EVERYONE**: Please acknowledge you've seen this correction and update your work accordingly. This is a breaking change that affects all components.

---
**Source**: Direct clarification from rydnr
**Date**: January 25, 2025
**Priority**: CRITICAL - Update immediately