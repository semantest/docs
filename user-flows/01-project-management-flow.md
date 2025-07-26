# Project Management User Flow

## Overview
This flow describes how users create, select, and manage projects within the ChatGPT extension.

## Main Flow Diagram

```mermaid
flowchart TD
    Start([User Opens Extension]) --> CheckProjects{Projects Exist?}
    
    CheckProjects -->|Yes| ShowDropdown[Show Project Dropdown]
    CheckProjects -->|No| ShowEmpty[Show Empty State]
    
    ShowDropdown --> UserAction{User Action}
    ShowEmpty --> CreateFirst[Prompt to Create First Project]
    
    UserAction -->|Click Dropdown| OpenMenu[Open Project Menu]
    UserAction -->|Click + Icon| CreateNew[Open Create Project Dialog]
    
    OpenMenu --> SelectProject[Select Different Project]
    OpenMenu --> CreateFromMenu[Click 'Create New Project']
    
    SelectProject --> UpdateUI[Update UI with Selected Project]
    UpdateUI --> SaveSelection[Save to Local Storage]
    SaveSelection --> Success([Project Switched])
    
    CreateNew --> ShowDialog[Show Create Project Dialog]
    CreateFromMenu --> ShowDialog
    CreateFirst --> ShowDialog
    
    ShowDialog --> InputDetails[User Inputs Project Details]
    InputDetails --> Validate{Valid Input?}
    
    Validate -->|No| ShowError[Show Validation Error]
    ShowError --> InputDetails
    
    Validate -->|Yes| CheckDuplicate{Duplicate Name?}
    CheckDuplicate -->|Yes| DuplicateError[Show Duplicate Error]
    DuplicateError --> InputDetails
    
    CheckDuplicate -->|No| CreateProject[Create Project]
    CreateProject --> StoreProject[Store in Local Storage]
    StoreProject --> CheckStorage{Storage Available?}
    
    CheckStorage -->|No| StorageError[Show Storage Error]
    StorageError --> OfferCleanup[Offer to Clean Old Data]
    OfferCleanup --> UserDecision{User Decision}
    UserDecision -->|Clean| CleanStorage[Remove Old Projects]
    CleanStorage --> StoreProject
    UserDecision -->|Cancel| CancelCreate[Cancel Creation]
    
    CheckStorage -->|Yes| SetActive[Set as Active Project]
    SetActive --> RefreshUI[Refresh Extension UI]
    RefreshUI --> ProjectCreated([Project Created])
    
    CancelCreate --> ReturnToList([Return to Project List])
```

## Edge Cases & Error States

### 1. Storage Quota Exceeded
```mermaid
flowchart LR
    CreateAttempt[Create Project] --> CheckQuota{Storage Available?}
    CheckQuota -->|No| QuotaError[Storage Quota Exceeded]
    QuotaError --> ShowOptions[Show Options Dialog]
    ShowOptions --> UserChoice{User Choice}
    UserChoice -->|Delete Old| SelectDelete[Select Projects to Delete]
    UserChoice -->|Export| ExportProjects[Export Projects as JSON]
    UserChoice -->|Cancel| CancelOperation[Cancel Operation]
```

### 2. Project Name Validation
```mermaid
flowchart LR
    InputName[Input Project Name] --> ValidateName{Validate}
    ValidateName -->|Empty| EmptyError[Name Required]
    ValidateName -->|Too Long| LengthError[Max 50 Characters]
    ValidateName -->|Special Chars| CharError[Invalid Characters]
    ValidateName -->|Duplicate| DupeError[Name Already Exists]
    ValidateName -->|Valid| ProceedCreate[Continue Creation]
```

### 3. Project Switching Failures
```mermaid
flowchart LR
    SwitchProject[Switch Project] --> LoadData{Load Project Data}
    LoadData -->|Corrupted| CorruptError[Data Corrupted]
    LoadData -->|Missing| MissingError[Project Not Found]
    LoadData -->|Success| ApplyProject[Apply Project Settings]
    
    CorruptError --> RecoveryOptions[Show Recovery Options]
    MissingError --> RemoveFromList[Remove from List]
    
    RecoveryOptions --> UserRecover{Recovery Choice}
    UserRecover -->|Reset| ResetProject[Reset to Defaults]
    UserRecover -->|Delete| DeleteProject[Delete Project]
```

## User States

### New User Flow
```mermaid
stateDiagram-v2
    [*] --> FirstOpen: Install Extension
    FirstOpen --> EmptyState: No Projects
    EmptyState --> Onboarding: Show Welcome
    Onboarding --> CreateFirst: Guide Creation
    CreateFirst --> ActiveProject: Project Created
    ActiveProject --> [*]
```

### Returning User Flow
```mermaid
stateDiagram-v2
    [*] --> OpenExtension: Click Icon
    OpenExtension --> LoadProjects: Fetch Storage
    LoadProjects --> CheckDefault: Has Default?
    CheckDefault --> LoadDefault: Yes
    CheckDefault --> ShowList: No
    LoadDefault --> Ready: Project Loaded
    ShowList --> SelectProject: User Selects
    SelectProject --> Ready
    Ready --> [*]
```

## Interaction Details

### Project Creation Form
```
┌─────────────────────────────────┐
│ Create New Project              │
├─────────────────────────────────┤
│ Project Name *                  │
│ ┌─────────────────────────────┐ │
│ │ Marketing Campaign 2024     │ │
│ └─────────────────────────────┘ │
│ 23/50 characters                │
│                                 │
│ Color Theme                     │
│ ◉ Green  ○ Blue  ○ Purple     │
│ ○ Orange ○ Red   ○ Gray       │
│                                 │
│ Description (optional)          │
│ ┌─────────────────────────────┐ │
│ │ Q4 marketing strategies     │ │
│ │ and campaign planning       │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Cancel]          [Create]      │
└─────────────────────────────────┘
```

### Error States Display
```
┌─────────────────────────────────┐
│ ⚠️ Project Name Already Exists  │
│                                 │
│ A project named "Marketing      │
│ Campaign" already exists.       │
│ Please choose a different name. │
│                                 │
│ [OK]                           │
└─────────────────────────────────┘
```

## Accessibility Considerations

1. **Keyboard Navigation**
   - Tab through all interactive elements
   - Enter/Space to activate buttons
   - Escape to close dialogs
   - Arrow keys for dropdown navigation

2. **Screen Reader Support**
   - ARIA labels for all buttons
   - Live regions for status updates
   - Form validation announcements
   - Role attributes for custom components

3. **Focus Management**
   - Focus trapped in modals
   - Focus returns to trigger element
   - Visual focus indicators
   - Skip links where appropriate

## Performance Considerations

1. **Local Storage Limits**
   - Monitor storage usage
   - Implement data compression
   - Automatic cleanup of old data
   - Export functionality for backup

2. **UI Responsiveness**
   - Debounce name validation
   - Optimistic UI updates
   - Loading states for async operations
   - Smooth transitions between states