# Custom Instructions User Flow

## Overview
This flow describes how users create, edit, and manage custom instructions for ChatGPT conversations.

## Main Flow Diagram

```mermaid
flowchart TD
    Start([User Opens Extension]) --> LoadInstructions[Load Current Instructions]
    LoadInstructions --> CheckInstructions{Instructions Exist?}
    
    CheckInstructions -->|Yes| DisplayInstructions[Display in Textarea]
    CheckInstructions -->|No| ShowPlaceholder[Show Placeholder Text]
    
    DisplayInstructions --> UserInteraction{User Action}
    ShowPlaceholder --> UserInteraction
    
    UserInteraction -->|Edit Text| UpdateText[Update Textarea]
    UserInteraction -->|Use Template| OpenTemplates[Open Template Menu]
    UserInteraction -->|Save| SaveInstructions[Save Instructions]
    UserInteraction -->|Clear| ClearConfirm{Confirm Clear?}
    
    UpdateText --> CharCount[Update Character Count]
    CharCount --> CheckLimit{Within Limit?}
    CheckLimit -->|Yes| EnableSave[Enable Save Button]
    CheckLimit -->|No| ShowLimitWarning[Show Character Limit Warning]
    ShowLimitWarning --> DisableSave[Disable Save Button]
    
    OpenTemplates --> SelectTemplate[Select Template]
    SelectTemplate --> LoadTemplate[Load Template Text]
    LoadTemplate --> ReplaceText{Replace Existing?}
    ReplaceText -->|Confirm| ApplyTemplate[Apply Template]
    ReplaceText -->|Cancel| CloseTemplates[Close Template Menu]
    ApplyTemplate --> UpdateText
    
    SaveInstructions --> ValidateContent{Valid Content?}
    ValidateContent -->|No| ShowValidationError[Show Validation Error]
    ValidateContent -->|Yes| StoreInstructions[Store in Storage]
    
    StoreInstructions --> CheckStorageSpace{Storage Available?}
    CheckStorageSpace -->|No| StorageFullError[Show Storage Full Error]
    CheckStorageSpace -->|Yes| UpdateChatGPT[Send to ChatGPT]
    
    UpdateChatGPT --> CheckConnection{ChatGPT Connected?}
    CheckConnection -->|No| QueueUpdate[Queue for Later]
    CheckConnection -->|Yes| ApplyInstructions[Apply Instructions]
    
    ApplyInstructions --> ConfirmApplied{Successfully Applied?}
    ConfirmApplied -->|Yes| ShowSuccess[Show Success Message]
    ConfirmApplied -->|No| ShowSyncError[Show Sync Error]
    
    ClearConfirm -->|Yes| ClearInstructions[Clear All Text]
    ClearConfirm -->|No| CancelClear[Cancel Action]
    ClearInstructions --> UpdateText
    
    ShowSuccess --> Done([Instructions Saved])
    ShowSyncError --> RetryOption[Offer Retry]
    StorageFullError --> CleanupOption[Offer Cleanup]
    QueueUpdate --> ShowQueued[Show Queued Status]
```

## Template Selection Flow

```mermaid
flowchart TD
    TemplateButton[Click Template Icon] --> OpenMenu[Open Template Menu]
    OpenMenu --> ShowCategories[Show Template Categories]
    
    ShowCategories --> CategorySelect{Select Category}
    CategorySelect -->|Professional| ProfTemplates[Professional Templates]
    CategorySelect -->|Creative| CreativeTemplates[Creative Templates]
    CategorySelect -->|Technical| TechTemplates[Technical Templates]
    CategorySelect -->|Custom| CustomTemplates[User's Templates]
    
    ProfTemplates --> SelectSpecific[Select Specific Template]
    CreativeTemplates --> SelectSpecific
    TechTemplates --> SelectSpecific
    CustomTemplates --> ManageCustom{Manage Action}
    
    ManageCustom -->|Select| SelectSpecific
    ManageCustom -->|Create New| CreateTemplate[Create Template Dialog]
    ManageCustom -->|Edit| EditTemplate[Edit Template Dialog]
    ManageCustom -->|Delete| DeleteConfirm[Confirm Delete]
    
    SelectSpecific --> PreviewTemplate[Show Preview]
    PreviewTemplate --> UserDecision{User Decision}
    UserDecision -->|Use| CheckExisting{Has Existing Text?}
    UserDecision -->|Cancel| CloseMenu[Close Template Menu]
    
    CheckExisting -->|Yes| MergeDialog[Show Merge Options]
    CheckExisting -->|No| ApplyDirectly[Apply Template]
    
    MergeDialog --> MergeChoice{Merge Choice}
    MergeChoice -->|Replace| ReplaceAll[Replace All Text]
    MergeChoice -->|Append| AppendText[Add to End]
    MergeChoice -->|Prepend| PrependText[Add to Beginning]
    MergeChoice -->|Cancel| CloseMenu
    
    ReplaceAll --> UpdateInstructions[Update Instructions]
    AppendText --> UpdateInstructions
    PrependText --> UpdateInstructions
    ApplyDirectly --> UpdateInstructions
```

## Error States & Edge Cases

### 1. Character Limit Handling
```mermaid
flowchart LR
    TypeText[User Types] --> CountChars[Count Characters]
    CountChars --> CheckThreshold{Check Threshold}
    CheckThreshold -->|< 1400| NormalState[Normal Display]
    CheckThreshold -->|1400-1500| WarningState[Yellow Warning]
    CheckThreshold -->|= 1500| LimitReached[Red Warning]
    CheckThreshold -->|> 1500| PreventInput[Block Additional Input]
    
    LimitReached --> TruncateOption[Offer to Truncate]
    PreventInput --> ShowTooltip[Show Limit Tooltip]
```

### 2. Sync Failure Recovery
```mermaid
flowchart LR
    SyncFail[Sync Failed] --> IdentifyCause{Identify Cause}
    IdentifyCause -->|No Connection| WaitConnection[Wait for Connection]
    IdentifyCause -->|ChatGPT Error| RetrySync[Retry Automatically]
    IdentifyCause -->|Invalid Format| ShowFormatError[Show Format Error]
    
    WaitConnection --> ConnectionRestored{Connected?}
    ConnectionRestored -->|Yes| AutoSync[Auto-sync Instructions]
    ConnectionRestored -->|No| KeepWaiting[Continue Waiting]
    
    RetrySync --> RetryCount{Retry Count}
    RetryCount -->|< 3| WaitAndRetry[Wait 5s and Retry]
    RetryCount -->|>= 3| ManualRetry[Show Manual Retry]
```

### 3. Template Corruption Handling
```mermaid
flowchart LR
    LoadTemplates[Load Templates] --> ValidateTemplates{Validate JSON}
    ValidateTemplates -->|Invalid| TemplateError[Template Error]
    ValidateTemplates -->|Valid| DisplayTemplates[Display Templates]
    
    TemplateError --> RecoveryAction{Recovery Action}
    RecoveryAction -->|Reset| LoadDefaults[Load Default Templates]
    RecoveryAction -->|Repair| AttemptRepair[Try JSON Repair]
    RecoveryAction -->|Skip| SkipCorrupted[Skip Corrupted Items]
```

## UI States

### Character Count Display
```
┌─────────────────────────────────────┐
│ Custom Instructions                 │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ You are a helpful assistant     │ │
│ │ focused on providing clear,     │ │
│ │ concise answers...              │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│ 156 / 1500     [Template] [Save]    │
└─────────────────────────────────────┘

States:
- Normal: "156 / 1500" (gray)
- Warning: "1423 / 1500" (yellow)
- Limit: "1500 / 1500" (red)
- Over: "1500 / 1500 - Limit reached" (red)
```

### Template Preview Modal
```
┌─────────────────────────────────────┐
│ Professional Assistant Template     │
├─────────────────────────────────────┤
│ Preview:                            │
│ ┌─────────────────────────────────┐ │
│ │ You are a professional          │ │
│ │ assistant with expertise in     │ │
│ │ business communication. Focus   │ │
│ │ on clarity, professionalism,    │ │
│ │ and actionable advice.          │ │
│ └─────────────────────────────────┘ │
│                                     │
│ This will replace your current      │
│ instructions. Continue?             │
│                                     │
│ [Cancel]    [Append]    [Replace]   │
└─────────────────────────────────────┘
```

## Validation Rules

### Content Validation
1. **Length**: 1-1500 characters
2. **Format**: Plain text only (no HTML/Markdown)
3. **Encoding**: UTF-8 compatible
4. **Prohibited Content**:
   - No personal information (emails, phones)
   - No API keys or secrets
   - No malicious instructions

### Storage Validation
```mermaid
stateDiagram-v2
    [*] --> CheckSpace: Save Attempt
    CheckSpace --> ValidateSize: Space Available
    CheckSpace --> ShowError: No Space
    ValidateSize --> CheckFormat: Size OK
    ValidateSize --> CompressText: Too Large
    CheckFormat --> SaveData: Valid Format
    CheckFormat --> SanitizeText: Invalid Chars
    CompressText --> CheckFormat
    SanitizeText --> SaveData
    SaveData --> [*]: Success
    ShowError --> [*]: Failed
```

## Accessibility Features

### Keyboard Shortcuts
- `Ctrl/Cmd + S`: Save instructions
- `Ctrl/Cmd + T`: Open templates
- `Ctrl/Cmd + K`: Clear all
- `Tab`: Navigate between elements
- `Escape`: Close dialogs

### Screen Reader Support
```html
<textarea 
  aria-label="Custom instructions for ChatGPT"
  aria-describedby="char-count instructions-help"
  aria-invalid="false"
  aria-live="polite"
/>
<div id="char-count" role="status" aria-live="polite">
  156 of 1500 characters used
</div>
```

### Visual Indicators
- Focus rings on all interactive elements
- Color + icon for all status messages
- High contrast mode support
- Reduced motion options

## Performance Optimizations

### Debouncing & Throttling
```javascript
// Character count updates: throttled to 100ms
// Auto-save: debounced to 1000ms
// Template search: debounced to 300ms
// Sync attempts: exponential backoff
```

### Local Storage Strategy
1. **Primary Storage**: Current instructions
2. **Backup Storage**: Last 5 versions
3. **Template Cache**: Frequently used templates
4. **Compression**: LZ-string for large texts
5. **Cleanup**: Remove versions older than 30 days