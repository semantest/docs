# Chat Management User Flow

## Overview
This flow describes how users create new chats, continue existing conversations, manage chat history, and organize their ChatGPT interactions.

## Main Chat Creation Flow

```mermaid
flowchart TD
    Start([User Clicks New Chat]) --> CheckContext{Check Current Context}
    
    CheckContext -->|Has Project| LoadProject[Load Project Settings]
    CheckContext -->|No Project| DefaultSettings[Use Default Settings]
    
    LoadProject --> PrepareChat[Prepare Chat Configuration]
    DefaultSettings --> PrepareChat
    
    PrepareChat --> CheckChatGPT{ChatGPT Tab Open?}
    CheckChatGPT -->|Yes| FocusTab[Focus Existing Tab]
    CheckChatGPT -->|No| OpenNewTab[Open ChatGPT in New Tab]
    
    OpenNewTab --> WaitForLoad{Page Loaded?}
    WaitForLoad -->|Timeout| ShowError[Show Timeout Error]
    WaitForLoad -->|Success| CheckAuth{User Authenticated?}
    
    FocusTab --> CheckAuth
    CheckAuth -->|No| ShowAuthPrompt[Prompt to Sign In]
    CheckAuth -->|Yes| CreateNewChat[Initiate New Chat]
    
    CreateNewChat --> ApplyInstructions{Has Custom Instructions?}
    ApplyInstructions -->|Yes| InjectInstructions[Apply Instructions]
    ApplyInstructions -->|No| SkipInstructions[Skip Instructions]
    
    InjectInstructions --> VerifyInjection{Instructions Applied?}
    VerifyInjection -->|Failed| RetryInjection[Retry Injection]
    VerifyInjection -->|Success| ChatReady[Chat Ready]
    
    SkipInstructions --> ChatReady
    RetryInjection --> RetryCount{Retry < 3?}
    RetryCount -->|Yes| InjectInstructions
    RetryCount -->|No| ShowInjectionError[Show Injection Error]
    
    ChatReady --> RecordMetadata[Save Chat Metadata]
    RecordMetadata --> Done([Chat Created])
    
    ShowAuthPrompt --> UserAuth{User Signs In?}
    UserAuth -->|Yes| CreateNewChat
    UserAuth -->|No| Cancelled([Operation Cancelled])
```

## Continue Chat Flow

```mermaid
flowchart TD
    Continue([User Clicks Continue]) --> GetLastChat[Retrieve Last Chat]
    GetLastChat --> CheckChatExists{Chat Data Exists?}
    
    CheckChatExists -->|No| NoRecentChat[Show No Recent Chat]
    CheckChatExists -->|Yes| LoadChatData[Load Chat Metadata]
    
    LoadChatData --> FindChatTab{Find Chat Tab}
    FindChatTab -->|Found| FocusChat[Focus Chat Tab]
    FindChatTab -->|Not Found| SearchChatGPT[Search in ChatGPT]
    
    FocusChat --> VerifyChat{Correct Chat?}
    VerifyChat -->|Yes| ReadyToContinue[Ready to Continue]
    VerifyChat -->|No| SearchChatGPT
    
    SearchChatGPT --> OpenChatGPT[Open ChatGPT]
    OpenChatGPT --> NavigateToChat[Navigate to Chat URL]
    NavigateToChat --> WaitLoad{Chat Loaded?}
    
    WaitLoad -->|Success| CheckChatState{Chat Accessible?}
    WaitLoad -->|Timeout| LoadTimeout[Show Timeout Error]
    
    CheckChatState -->|Yes| RestoreContext[Restore Chat Context]
    CheckChatState -->|Deleted| ChatDeleted[Show Chat Deleted]
    CheckChatState -->|No Access| AccessDenied[Show Access Error]
    
    RestoreContext --> ApplyContext{Apply Previous Context?}
    ApplyContext -->|Yes| InjectContext[Inject Project Context]
    ApplyContext -->|No| SkipContext[Use Current Context]
    
    InjectContext --> ReadyToContinue
    SkipContext --> ReadyToContinue
    ReadyToContinue --> UpdateLastAccess[Update Last Access Time]
    UpdateLastAccess --> Continued([Chat Continued])
    
    NoRecentChat --> SuggestNew[Suggest New Chat]
    ChatDeleted --> RemoveFromHistory[Remove from History]
    AccessDenied --> HandleError[Handle Access Error]
```

## Chat History Management

```mermaid
flowchart TD
    History([User Opens History]) --> LoadHistory[Load Chat History]
    LoadHistory --> CheckData{History Available?}
    
    CheckData -->|Empty| ShowEmpty[Show Empty State]
    CheckData -->|Has Data| ProcessHistory[Process History Data]
    
    ProcessHistory --> SortChats[Sort by Recent]
    SortChats --> GroupChats{Group By?}
    
    GroupChats -->|Project| GroupByProject[Group by Project]
    GroupChats -->|Date| GroupByDate[Group by Date]
    GroupChats -->|None| ShowFlat[Show Flat List]
    
    GroupByProject --> RenderGroups[Render Grouped View]
    GroupByDate --> RenderGroups
    ShowFlat --> RenderList[Render List View]
    
    RenderGroups --> UserAction{User Action}
    RenderList --> UserAction
    
    UserAction -->|Select Chat| OpenChat[Open Selected Chat]
    UserAction -->|Delete Chat| ConfirmDelete{Confirm Delete?}
    UserAction -->|Export| ExportChats[Export Selected]
    UserAction -->|Search| SearchChats[Filter Chats]
    UserAction -->|Clear All| ConfirmClearAll{Confirm Clear All?}
    
    ConfirmDelete -->|Yes| DeleteChat[Remove from History]
    ConfirmDelete -->|No| CancelDelete[Cancel Action]
    
    DeleteChat --> UpdateStorage[Update Storage]
    UpdateStorage --> RefreshView[Refresh History View]
    
    ExportChats --> SelectFormat{Export Format}
    SelectFormat -->|JSON| ExportJSON[Generate JSON]
    SelectFormat -->|Markdown| ExportMD[Generate Markdown]
    SelectFormat -->|PDF| ExportPDF[Generate PDF]
    
    SearchChats --> FilterResults[Apply Search Filter]
    FilterResults --> ShowFiltered[Display Filtered Results]
    
    ConfirmClearAll -->|Yes| ClearStorage[Clear All History]
    ConfirmClearAll -->|No| CancelClear[Cancel Clear]
    
    ClearStorage --> ShowEmpty
    ShowEmpty --> EmptyAction{User Action}
    EmptyAction -->|Create New| StartNewChat[Start New Chat]
    EmptyAction -->|Import| ImportHistory[Import History]
```

## Quick Prompt Flow

```mermaid
flowchart TD
    QuickPrompt([User Types in Quick Prompt]) --> CheckLength{Prompt Length OK?}
    CheckLength -->|Too Long| ShowLengthError[Show Length Warning]
    CheckLength -->|Empty| DisableSend[Disable Send Button]
    CheckLength -->|Valid| EnableSend[Enable Send Button]
    
    EnableSend --> UserSend{User Clicks Send}
    UserSend -->|Click| PreparePrompt[Prepare Prompt]
    UserSend -->|Enter Key| PreparePrompt
    
    PreparePrompt --> CheckChat{Active Chat?}
    CheckChat -->|Yes| SendToActive[Send to Active Chat]
    CheckChat -->|No| CreateWithPrompt[Create New Chat with Prompt]
    
    SendToActive --> InjectPrompt[Inject Prompt Text]
    CreateWithPrompt --> OpenNewChat[Open New ChatGPT Tab]
    
    OpenNewChat --> WaitReady{Chat Ready?}
    WaitReady -->|Yes| InjectPrompt
    WaitReady -->|Timeout| PromptTimeout[Show Timeout Error]
    
    InjectPrompt --> TriggerSend[Trigger Send Action]
    TriggerSend --> VerifySent{Prompt Sent?}
    
    VerifySent -->|Success| ClearPrompt[Clear Quick Prompt]
    VerifySent -->|Failed| RetryPrompt{Retry?}
    
    RetryPrompt -->|Retry < 3| WaitBrief[Wait 1s]
    WaitBrief --> InjectPrompt
    RetryPrompt -->|Max Retries| ShowSendError[Show Send Error]
    
    ClearPrompt --> RecordPrompt[Save to History]
    RecordPrompt --> Success([Prompt Sent])
    
    ShowSendError --> OfferCopy[Offer to Copy Prompt]
    PromptTimeout --> OfferCopy
```

## Error States & Recovery

### 1. ChatGPT Connection Issues
```mermaid
flowchart LR
    ConnectionLost[Connection Lost] --> IdentifyIssue{Issue Type}
    IdentifyIssue -->|Network| NetworkError[Network Error]
    IdentifyIssue -->|ChatGPT Down| ServiceError[Service Error]
    IdentifyIssue -->|Auth Expired| AuthError[Auth Error]
    
    NetworkError --> RetryConnection[Auto-retry Connection]
    ServiceError --> ShowStatus[Show Service Status]
    AuthError --> ReAuthenticate[Prompt Re-auth]
    
    RetryConnection --> Connected{Connected?}
    Connected -->|Yes| ResumeOperation[Resume Operation]
    Connected -->|No| ShowOffline[Show Offline Mode]
```

### 2. Storage Quota Management
```mermaid
flowchart LR
    SaveChat[Save Chat] --> CheckQuota{Storage Available?}
    CheckQuota -->|Full| QuotaExceeded[Quota Exceeded]
    CheckQuota -->|OK| SaveData[Save to Storage]
    
    QuotaExceeded --> ShowOptions[Show Cleanup Options]
    ShowOptions --> UserChoice{User Choice}
    UserChoice -->|Auto-clean| RemoveOld[Remove Chats > 30 days]
    UserChoice -->|Manual| SelectChats[Select Chats to Delete]
    UserChoice -->|Export| ExportFirst[Export Then Delete]
```

### 3. Chat Synchronization
```mermaid
flowchart LR
    DetectDesync[Detect Desync] --> AnalyzeDiff{Analyze Difference}
    AnalyzeDiff -->|Local Newer| UpdateRemote[Update ChatGPT]
    AnalyzeDiff -->|Remote Newer| UpdateLocal[Update Extension]
    AnalyzeDiff -->|Conflict| ShowConflict[Show Conflict Dialog]
    
    ShowConflict --> ResolveChoice{User Choice}
    ResolveChoice -->|Keep Local| UseLocal[Use Local Version]
    ResolveChoice -->|Keep Remote| UseRemote[Use Remote Version]
    ResolveChoice -->|Merge| AttemptMerge[Try to Merge]
```

## UI Components

### Chat History List
```
┌─────────────────────────────────────┐
│ Chat History           [Clear All]  │
├─────────────────────────────────────┤
│ 🔍 Search chats...                  │
├─────────────────────────────────────┤
│ Today                               │
│ ┌─────────────────────────────────┐ │
│ │ 🟢 Marketing Strategy Discussion│ │
│ │ Project: Marketing Campaign     │ │
│ │ 2:30 PM • 15 messages          │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 🔵 Code Review: Auth Module    │ │
│ │ Project: Development           │ │
│ │ 11:45 AM • 8 messages         │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Yesterday                           │
│ ┌─────────────────────────────────┐ │
│ │ 🟣 Customer Feedback Analysis  │ │
│ │ Project: Research              │ │
│ │ 4:15 PM • 23 messages         │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Quick Actions Panel
```
┌─────────────────────────────────────┐
│ Quick Actions                       │
├─────────────────────────────────────┤
│ [+ New Chat]  [↺ Continue]         │
│                                     │
│ Recent Prompts:                     │
│ • "Explain quantum computing"       │
│ • "Write a Python function for..."  │
│ • "Analyze this marketing data"     │
└─────────────────────────────────────┘
```

## Performance Considerations

### Caching Strategy
1. **Active Chat Cache**: Current chat metadata
2. **History Cache**: Last 50 chats
3. **Project Cache**: Associated project data
4. **Prompt Cache**: Last 10 quick prompts

### Optimization Techniques
```javascript
// Lazy loading for history > 50 items
// Virtual scrolling for long lists
// Debounced search (300ms)
// Throttled storage updates (1000ms)
// Background sync for chat metadata
```

## Accessibility Features

### Keyboard Navigation
- `Ctrl/Cmd + N`: New chat
- `Ctrl/Cmd + Shift + N`: New chat in background
- `Ctrl/Cmd + L`: Focus chat list
- `Ctrl/Cmd + F`: Search chats
- `Arrow keys`: Navigate chat list
- `Enter`: Open selected chat
- `Delete`: Delete selected chat

### Screen Reader Announcements
```html
<div role="status" aria-live="polite">
  New chat created with Marketing Campaign project
</div>

<ul role="list" aria-label="Chat history grouped by date">
  <li role="listitem">
    <h3>Today</h3>
    <ul role="list">
      <li role="listitem" aria-label="Marketing Strategy Discussion, 2:30 PM, 15 messages">
        ...
      </li>
    </ul>
  </li>
</ul>
```

### Visual Indicators
- Project color coding
- Active chat highlighting
- Unread message badges
- Loading spinners
- Success/error toast messages