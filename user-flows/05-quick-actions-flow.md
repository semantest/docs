# Quick Actions User Flow

## Overview
This flow describes how users interact with quick actions including sending prompts, creating new chats, continuing conversations, and accessing frequently used commands through keyboard shortcuts and quick menus.

## Quick Prompt Send Flow

```mermaid
flowchart TD
    Start([User Types in Quick Prompt]) --> InputText[Enter Prompt Text]
    InputText --> CheckText{Text Validation}
    
    CheckText -->|Empty| DisableSend[Disable Send Button]
    CheckText -->|Too Long > 4000| ShowLimit[Show Character Limit]
    CheckText -->|Valid| EnableActions[Enable Action Buttons]
    
    ShowLimit --> TruncateOption{Offer Truncate?}
    TruncateOption -->|Accept| TruncateText[Truncate to Limit]
    TruncateOption -->|Edit| ContinueEdit[Continue Editing]
    
    EnableActions --> UserAction{User Action}
    UserAction -->|Send| CheckContext[Check Current Context]
    UserAction -->|Clear| ClearPrompt[Clear Text Field]
    UserAction -->|Template| LoadTemplate[Load Prompt Template]
    
    CheckContext --> ActiveChat{Active Chat?}
    ActiveChat -->|Yes| SendToActive[Send to Active Chat]
    ActiveChat -->|No| CreateNew[Create New Chat]
    
    SendToActive --> InjectPrompt[Inject into ChatGPT]
    CreateNew --> OpenChat[Open New ChatGPT Tab]
    
    OpenChat --> WaitLoad{Page Loaded?}
    WaitLoad -->|Success| ApplyContext[Apply Project Context]
    WaitLoad -->|Timeout| RetryLoad[Retry Loading]
    WaitLoad -->|Failed| ShowError[Show Load Error]
    
    ApplyContext --> InjectPrompt
    InjectPrompt --> TriggerSend[Trigger Send Action]
    
    TriggerSend --> VerifySent{Sent Successfully?}
    VerifySent -->|Yes| HandleSuccess[Handle Success]
    VerifySent -->|No| HandleFailure[Handle Failure]
    
    HandleSuccess --> SaveToHistory[Save to History]
    SaveToHistory --> ClearField[Clear Prompt Field]
    ClearField --> UpdateStatus[Update Status]
    UpdateStatus --> Done([Prompt Sent])
    
    HandleFailure --> RetryCount{Retry Attempts}
    RetryCount -->|< 3| RetryInject[Retry Injection]
    RetryCount -->|>= 3| ShowSendError[Show Send Error]
    
    RetryInject --> WaitRetry[Wait 1s]
    WaitRetry --> InjectPrompt
    
    ShowSendError --> OfferOptions{Offer Options}
    OfferOptions -->|Copy| CopyToClipboard[Copy Prompt]
    OfferOptions -->|Retry| ManualRetry[Manual Retry]
    OfferOptions -->|Cancel| CancelSend[Cancel Operation]
```

## New Chat Quick Action

```mermaid
flowchart TD
    NewChat([Click New Chat / Ctrl+N]) --> CheckModifier{Check Modifier Keys}
    
    CheckModifier -->|None| DefaultNew[Create with Current Project]
    CheckModifier -->|Shift| BackgroundNew[Create in Background]
    CheckModifier -->|Alt| ProjectSelect[Show Project Picker]
    
    DefaultNew --> GetProject[Get Active Project]
    BackgroundNew --> GetProject
    ProjectSelect --> SelectProject[User Selects Project]
    
    GetProject --> PrepareContext[Prepare Chat Context]
    SelectProject --> PrepareContext
    
    PrepareContext --> OpenMethod{Open Method}
    OpenMethod -->|Foreground| OpenNewTab[Open and Focus Tab]
    OpenMethod -->|Background| OpenBgTab[Open Background Tab]
    
    OpenNewTab --> InitChat[Initialize ChatGPT]
    OpenBgTab --> InitChat
    
    InitChat --> CheckAuth{Authenticated?}
    CheckAuth -->|Yes| CreateChat[Create New Chat]
    CheckAuth -->|No| AuthPrompt[Show Auth Prompt]
    
    CreateChat --> ApplyInstructions{Custom Instructions?}
    ApplyInstructions -->|Yes| InjectInstructions[Apply Instructions]
    ApplyInstructions -->|No| SkipInstructions[Skip Instructions]
    
    InjectInstructions --> SetupComplete[Setup Complete]
    SkipInstructions --> SetupComplete
    
    SetupComplete --> RecordChat[Record Chat Metadata]
    RecordChat --> NotifyUser[Show Success Notification]
    NotifyUser --> ChatReady([New Chat Ready])
    
    AuthPrompt --> UserAuth{User Authenticates?}
    UserAuth -->|Yes| CreateChat
    UserAuth -->|No| CancelCreate[Cancel Creation]
```

## Continue Chat Quick Action

```mermaid
flowchart TD
    Continue([Click Continue / Ctrl+Shift+Enter]) --> GetRecent[Get Most Recent Chat]
    GetRecent --> CheckRecent{Recent Chat Exists?}
    
    CheckRecent -->|No| NoRecent[Show No Recent Chat]
    CheckRecent -->|Yes| ValidateChat[Validate Chat Data]
    
    ValidateChat --> ChatValid{Chat Valid?}
    ChatValid -->|No| InvalidChat[Show Invalid Chat Error]
    ChatValid -->|Yes| FindTab[Find Existing Tab]
    
    FindTab --> TabFound{Tab Found?}
    TabFound -->|Yes| FocusTab[Focus Existing Tab]
    TabFound -->|No| OpenChatURL[Open Chat URL]
    
    FocusTab --> VerifyCorrect{Correct Chat?}
    VerifyCorrect -->|Yes| ReadyToContinue[Ready to Continue]
    VerifyCorrect -->|No| NavigateToChat[Navigate to Correct Chat]
    
    OpenChatURL --> WaitForLoad{Page Loaded?}
    WaitForLoad -->|Success| CheckChatExists{Chat Exists?}
    WaitForLoad -->|Timeout| LoadTimeout[Show Timeout Error]
    
    CheckChatExists -->|Yes| RestoreState[Restore Chat State]
    CheckChatExists -->|Deleted| ChatDeleted[Show Chat Deleted]
    CheckChatExists -->|No Access| NoAccess[Show Access Error]
    
    RestoreState --> ApplyPrevContext[Apply Previous Context]
    ApplyPrevContext --> ReadyToContinue
    
    ReadyToContinue --> FocusInput[Focus Input Field]
    FocusInput --> ShowIndicator[Show Active Indicator]
    ShowIndicator --> Continued([Chat Continued])
    
    NoRecent --> SuggestAction{Suggest Action}
    SuggestAction -->|New Chat| CreateNewChat[Start New Chat]
    SuggestAction -->|History| OpenHistory[Open Chat History]
```

## Keyboard Shortcuts Flow

```mermaid
flowchart TD
    KeyPress([User Presses Key Combo]) --> DetectCombo[Detect Key Combination]
    DetectCombo --> ValidCombo{Valid Shortcut?}
    
    ValidCombo -->|No| IgnoreKey[Ignore Keypress]
    ValidCombo -->|Yes| CheckContext[Check Current Context]
    
    CheckContext --> RouteAction{Route to Action}
    
    RouteAction -->|Ctrl+N| NewChatAction[New Chat Action]
    RouteAction -->|Ctrl+Enter| SendPromptAction[Send Prompt Action]
    RouteAction -->|Ctrl+Shift+Enter| ContinueAction[Continue Action]
    RouteAction -->|Ctrl+K| QuickCommandPalette[Open Command Palette]
    RouteAction -->|Ctrl+P| ProjectSwitcher[Open Project Switcher]
    RouteAction -->|Ctrl+H| HistoryPanel[Open History Panel]
    RouteAction -->|Ctrl+,| SettingsPanel[Open Settings]
    RouteAction -->|Escape| CancelCurrent[Cancel Current Action]
    
    QuickCommandPalette --> ShowPalette[Show Command Palette]
    ShowPalette --> SearchCommands[User Searches Commands]
    SearchCommands --> FilterResults[Filter Command List]
    FilterResults --> SelectCommand{Select Command}
    
    SelectCommand -->|Enter| ExecuteCommand[Execute Selected]
    SelectCommand -->|Escape| ClosePalette[Close Palette]
    SelectCommand -->|Arrow Keys| NavigateList[Navigate Commands]
    
    ProjectSwitcher --> ShowProjects[Show Project List]
    ShowProjects --> QuickSearch[Enable Quick Search]
    QuickSearch --> TypeToFilter[Type to Filter Projects]
    TypeToFilter --> SelectProject{Select Project}
    
    SelectProject -->|Enter| SwitchProject[Switch to Project]
    SelectProject -->|Ctrl+Enter| NewWithProject[New Chat with Project]
    SelectProject -->|Escape| CloseSwithcer[Close Switcher]
    
    ExecuteCommand --> ActionResult{Action Result}
    ActionResult -->|Success| ShowSuccess[Show Success Feedback]
    ActionResult -->|Failed| ShowError[Show Error Message]
    
    ShowSuccess --> Complete([Action Complete])
    ShowError --> RetryOption[Offer Retry]
```

## Quick Templates Flow

```mermaid
flowchart TD
    Template([Access Quick Templates]) --> TriggerMethod{Trigger Method}
    
    TriggerMethod -->|Button Click| OpenTemplateMenu[Open Template Menu]
    TriggerMethod -->|Slash Command| ShowInlineTemplates[Show Inline Templates]
    TriggerMethod -->|Hotkey| QuickTemplatePanel[Quick Template Panel]
    
    OpenTemplateMenu --> DisplayCategories[Display Template Categories]
    DisplayCategories --> BrowseTemplates[Browse Templates]
    
    ShowInlineTemplates --> TypeSlash[User Types /]
    TypeSlash --> ShowSuggestions[Show Template Suggestions]
    ShowSuggestions --> FilterByTyping[Filter as User Types]
    
    BrowseTemplates --> SelectTemplate[Select Template]
    FilterByTyping --> SelectTemplate
    QuickTemplatePanel --> RecentTemplates[Show Recent Templates]
    RecentTemplates --> SelectTemplate
    
    SelectTemplate --> PreviewTemplate[Preview Template Content]
    PreviewTemplate --> CustomizeOption{Customize?}
    
    CustomizeOption -->|Yes| EditTemplate[Edit Template Variables]
    CustomizeOption -->|No| UseAsIs[Use Template As-Is]
    
    EditTemplate --> FillVariables[Fill Variable Fields]
    FillVariables --> ValidateInput{Valid Input?}
    ValidateInput -->|No| ShowValidationError[Show Validation Error]
    ValidateInput -->|Yes| ProcessTemplate[Process Template]
    
    UseAsIs --> ProcessTemplate
    ProcessTemplate --> InsertLocation{Insert Where?}
    
    InsertLocation -->|New Chat| CreateWithTemplate[Create Chat with Template]
    InsertLocation -->|Current Field| InsertInField[Insert in Prompt Field]
    InsertLocation -->|Active Chat| SendToChat[Send to Active Chat]
    
    CreateWithTemplate --> ApplyTemplate[Apply Template as Prompt]
    InsertInField --> ReplaceOrAppend{Replace or Append?}
    
    ReplaceOrAppend -->|Replace| ReplaceContent[Replace Field Content]
    ReplaceOrAppend -->|Append| AppendContent[Append to Content]
    
    SendToChat --> DirectSend[Send Template to Chat]
    ApplyTemplate --> TemplateApplied([Template Applied])
    ReplaceContent --> TemplateApplied
    AppendContent --> TemplateApplied
    DirectSend --> TemplateApplied
```

## Command Palette

```mermaid
flowchart TD
    OpenPalette([Ctrl+K / Cmd+K]) --> ShowOverlay[Show Command Overlay]
    ShowOverlay --> FocusSearch[Focus Search Input]
    
    FocusSearch --> UserTypes{User Input}
    UserTypes -->|Types Query| SearchCommands[Search Commands]
    UserTypes -->|Empty| ShowAll[Show All Commands]
    UserTypes -->|>| ShowActions[Show Actions Only]
    UserTypes -->|@| ShowProjects[Show Projects Only]
    UserTypes -->|#| ShowChats[Show Recent Chats]
    UserTypes -->|?| ShowHelp[Show Help Commands]
    
    SearchCommands --> FilterResults[Filter and Rank Results]
    FilterResults --> GroupResults[Group by Category]
    GroupResults --> DisplayResults[Display Filtered List]
    
    DisplayResults --> Navigation{Navigation}
    Navigation -->|Arrow Keys| MoveSelection[Move Selection]
    Navigation -->|Tab| NextCategory[Next Category]
    Navigation -->|Enter| ExecuteSelected[Execute Selected]
    Navigation -->|Escape| ClosePalette[Close Palette]
    
    ExecuteSelected --> CommandType{Command Type}
    CommandType -->|Action| RunAction[Run Action Command]
    CommandType -->|Navigation| NavigateTo[Navigate to Location]
    CommandType -->|Toggle| ToggleSetting[Toggle Setting]
    CommandType -->|External| OpenExternal[Open External Link]
    
    RunAction --> ActionComplete{Action Complete?}
    ActionComplete -->|Success| CloseWithSuccess[Close and Show Success]
    ActionComplete -->|Failed| ShowInlineError[Show Error in Palette]
    
    ShowInlineError --> AllowRetry{Allow Retry?}
    AllowRetry -->|Yes| StayOpen[Keep Palette Open]
    AllowRetry -->|No| CloseWithError[Close with Error]
```

## Error States & Recovery

### 1. Action Timeout Handling
```mermaid
flowchart LR
    ActionStart[Start Quick Action] --> SetTimeout[Set Action Timeout]
    SetTimeout --> ExecuteAction[Execute Action]
    
    ExecuteAction --> TimeoutCheck{Timeout Reached?}
    TimeoutCheck -->|No| ActionComplete[Action Completes]
    TimeoutCheck -->|Yes| TimeoutReached[Timeout Reached]
    
    TimeoutReached --> ShowTimeout[Show Timeout Warning]
    ShowTimeout --> OfferOptions[Offer Options]
    OfferOptions --> UserChoice{User Choice}
    
    UserChoice -->|Wait| ExtendTimeout[Extend Timeout]
    UserChoice -->|Cancel| CancelAction[Cancel Action]
    UserChoice -->|Background| ContinueBackground[Continue in Background]
```

### 2. Conflict Resolution
```mermaid
flowchart LR
    DetectConflict[Detect Action Conflict] --> ConflictType{Conflict Type}
    
    ConflictType -->|Duplicate| DuplicateAction[Duplicate Action Running]
    ConflictType -->|Resource| ResourceBusy[Resource Busy]
    ConflictType -->|State| InvalidState[Invalid State]
    
    DuplicateAction --> MergeActions[Merge with Existing]
    ResourceBusy --> QueueAction[Queue Action]
    InvalidState --> ResolveState[Resolve State First]
```

## UI Components

### Quick Prompt Bar
```
┌─────────────────────────────────────┐
│ 💬 Quick Prompt                     │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ Type your prompt here...        │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│ 0 / 4000          [/] [Clear] [Send]│
└─────────────────────────────────────┘

Slash Commands Preview:
/template - Insert template
/continue - Continue last chat
/new - New chat with options
/history - Search chat history
```

### Command Palette UI
```
┌─────────────────────────────────────┐
│ 🔍 Quick Commands    (Ctrl+K)   [×] │
├─────────────────────────────────────┤
│ > Search commands...                │
├─────────────────────────────────────┤
│ Recent                              │
│ ⚡ New Chat          Ctrl+N        │
│ 📋 Marketing Project               │
│ 💬 Continue Chat    Ctrl+Shift+N   │
│                                     │
│ Actions                             │
│ 📥 Download All Images             │
│ 🔄 Sync Instructions               │
│ 📊 Export Chat History             │
│                                     │
│ Projects                            │
│ @ Marketing Campaign               │
│ @ Development Sprint               │
│ @ Customer Research                │
└─────────────────────────────────────┘
```

### Keyboard Shortcuts Reference
```
┌─────────────────────────────────────┐
│ Keyboard Shortcuts                  │
├─────────────────────────────────────┤
│ General                             │
│ Ctrl+K         Command Palette      │
│ Ctrl+N         New Chat            │
│ Ctrl+P         Switch Project      │
│ Ctrl+,         Settings            │
│                                     │
│ Chat Actions                        │
│ Ctrl+Enter     Send Prompt         │
│ Ctrl+Shift+N   Continue Chat       │
│ Ctrl+H         Chat History        │
│                                     │
│ Quick Actions                       │
│ /              Template Menu       │
│ Ctrl+T         Insert Template     │
│ Ctrl+D         Download Image      │
│ Escape         Cancel Action       │
└─────────────────────────────────────┘
```

## Performance Considerations

### Action Queueing
```javascript
// Quick action queue management
const actionQueue = {
  maxConcurrent: 3,
  timeout: 10000, // 10s default
  retryAttempts: 3,
  retryDelay: 1000 // 1s exponential backoff
};

// Debouncing for search/filter
const SEARCH_DEBOUNCE = 300;
const COMMAND_THROTTLE = 100;
```

### Caching Strategy
1. **Command History**: Last 20 commands
2. **Template Cache**: Frequently used templates
3. **Project State**: Active project context
4. **Shortcut Mappings**: User customizations

## Accessibility Features

### Keyboard Navigation
- Full keyboard control for all actions
- Tab order follows visual hierarchy
- Escape cancels current operation
- Clear focus indicators

### Screen Reader Support
```html
<div role="combobox" 
     aria-label="Quick command palette"
     aria-expanded="true"
     aria-controls="command-list">
  <input type="text" 
         role="searchbox"
         aria-label="Search commands"
         aria-describedby="command-help"/>
</div>

<ul id="command-list" role="listbox">
  <li role="option" aria-selected="true">
    New Chat (Ctrl+N)
  </li>
</ul>
```

### Status Announcements
- Action start/complete announcements
- Error messages in live regions
- Progress updates for long operations
- Success confirmations