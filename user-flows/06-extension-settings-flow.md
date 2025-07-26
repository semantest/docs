# Extension Settings User Flow

## Overview
This flow describes how users access, configure, and manage extension settings including preferences, data management, themes, keyboard shortcuts, and advanced configurations.

## Main Settings Access Flow

```mermaid
flowchart TD
    Start([User Wants to Change Settings]) --> AccessMethod{Access Method}
    
    AccessMethod -->|Extension Icon| RightClickIcon[Right Click Extension Icon]
    AccessMethod -->|Popup Menu| ClickSettings[Click Settings in Popup]
    AccessMethod -->|Keyboard| PressShortcut[Press Ctrl+,]
    AccessMethod -->|Chrome Menu| ChromeExtensions[Chrome Extensions Page]
    
    RightClickIcon --> ContextMenu[Show Context Menu]
    ContextMenu --> SelectOptions[Select 'Options']
    
    ClickSettings --> OpenSettings[Open Settings Page]
    PressShortcut --> OpenSettings
    ChromeExtensions --> ExtensionsList[Find Semantest]
    ExtensionsList --> ClickDetails[Click Extension Details]
    ClickDetails --> SelectExtOptions[Select Extension Options]
    SelectExtOptions --> OpenSettings
    
    OpenSettings --> LoadSettings[Load Current Settings]
    LoadSettings --> CheckStorage{Settings Exist?}
    
    CheckStorage -->|Yes| RestoreSettings[Restore User Settings]
    CheckStorage -->|No| LoadDefaults[Load Default Settings]
    
    RestoreSettings --> DisplaySettings[Display Settings Page]
    LoadDefaults --> FirstTimeSetup[Show First-Time Setup]
    
    FirstTimeSetup --> GuidedTour{Take Tour?}
    GuidedTour -->|Yes| StartTour[Start Guided Tour]
    GuidedTour -->|No| SkipTour[Skip to Settings]
    
    StartTour --> TourSteps[Show Tour Steps]
    TourSteps --> CompleteTour[Complete Tour]
    CompleteTour --> DisplaySettings
    SkipTour --> DisplaySettings
    
    DisplaySettings --> ShowNavigation[Show Settings Navigation]
    ShowNavigation --> UserInteraction([User Interacts with Settings])
```

## Settings Navigation Flow

```mermaid
flowchart TD
    SettingsPage([Settings Page Loaded]) --> NavigationChoice{Navigation Method}
    
    NavigationChoice -->|Click Nav Item| SelectSection[Select Settings Section]
    NavigationChoice -->|Keyboard Nav| UseArrows[Use Arrow Keys]
    NavigationChoice -->|Search| SearchSettings[Search for Setting]
    NavigationChoice -->|Direct Link| DeepLink[Navigate to Specific Setting]
    
    SelectSection --> LoadSection[Load Section Content]
    UseArrows --> HighlightItem[Highlight Nav Item]
    HighlightItem --> PressEnter{Press Enter?}
    PressEnter -->|Yes| SelectSection
    PressEnter -->|No| ContinueNav[Continue Navigation]
    
    SearchSettings --> TypeQuery[Type Search Query]
    TypeQuery --> FilterSettings[Filter All Settings]
    FilterSettings --> ShowResults[Show Matching Settings]
    ShowResults --> ClickResult[Click Search Result]
    ClickResult --> JumpToSetting[Jump to Setting]
    
    LoadSection --> AnimateTransition[Animate Section Change]
    AnimateTransition --> DisplaySection[Display Section Content]
    JumpToSetting --> HighlightSetting[Highlight Target Setting]
    
    DisplaySection --> SectionInteraction{User Action}
    SectionInteraction -->|Modify Setting| ChangeSetting[Change Setting Value]
    SectionInteraction -->|Navigate| NavigateElsewhere[Go to Other Section]
    SectionInteraction -->|Help| ShowHelp[Show Setting Help]
    
    ChangeSetting --> ValidateChange{Valid Change?}
    ValidateChange -->|Yes| ApplyChange[Apply Setting Change]
    ValidateChange -->|No| ShowValidation[Show Validation Error]
    
    ApplyChange --> MarkDirty[Mark Settings as Changed]
    MarkDirty --> ShowSaveBar[Show Save Bar]
    ShowSaveBar --> EnableSave[Enable Save Button]
```

## General Settings Configuration

```mermaid
flowchart TD
    GeneralSettings([General Settings Section]) --> SettingType{Setting Type}
    
    SettingType -->|Toggle| ToggleSetting[Toggle On/Off]
    SettingType -->|Dropdown| SelectOption[Select from Dropdown]
    SettingType -->|Slider| AdjustSlider[Adjust Slider Value]
    SettingType -->|Input| EnterText[Enter Text Value]
    SettingType -->|Shortcut| SetShortcut[Set Keyboard Shortcut]
    
    ToggleSetting --> UpdateToggle[Update Toggle State]
    UpdateToggle --> CheckDependencies{Has Dependencies?}
    CheckDependencies -->|Yes| UpdateDependent[Update Dependent Settings]
    CheckDependencies -->|No| ApplyToggle[Apply Toggle Change]
    
    SelectOption --> ShowOptions[Show Dropdown Options]
    ShowOptions --> SelectNewOption[Select New Option]
    SelectNewOption --> ValidateOption{Valid Selection?}
    ValidateOption -->|Yes| ApplySelection[Apply Selection]
    ValidateOption -->|No| ShowOptionError[Show Selection Error]
    
    AdjustSlider --> DragSlider[Drag Slider Handle]
    DragSlider --> UpdateValue[Update Display Value]
    UpdateValue --> ThrottleUpdate[Throttle Updates]
    ThrottleUpdate --> ApplySliderValue[Apply Slider Value]
    
    SetShortcut --> RecordMode[Enter Recording Mode]
    RecordMode --> CaptureKeys[Capture Key Combination]
    CaptureKeys --> ValidateShortcut{Valid Shortcut?}
    ValidateShortcut -->|Conflict| ShowConflict[Show Conflict Warning]
    ValidateShortcut -->|Reserved| ShowReserved[Show Reserved Key Error]
    ValidateShortcut -->|Valid| SaveShortcut[Save New Shortcut]
    
    ShowConflict --> ResolveConflict{Resolve Conflict?}
    ResolveConflict -->|Override| OverrideExisting[Override Existing]
    ResolveConflict -->|Cancel| CancelShortcut[Cancel Change]
```

## Theme & Appearance Settings

```mermaid
flowchart TD
    AppearanceSettings([Appearance Settings]) --> ThemeSelection[Theme Selection Area]
    
    ThemeSelection --> ThemeOption{Select Theme}
    ThemeOption -->|Light| ApplyLight[Apply Light Theme]
    ThemeOption -->|Dark| ApplyDark[Apply Dark Theme]
    ThemeOption -->|Auto| ApplyAuto[Apply Auto Theme]
    ThemeOption -->|Custom| OpenCustomizer[Open Theme Customizer]
    
    ApplyLight --> UpdatePreview[Update Live Preview]
    ApplyDark --> UpdatePreview
    ApplyAuto --> DetectSystem[Detect System Theme]
    DetectSystem --> UpdatePreview
    
    OpenCustomizer --> ShowColorPicker[Show Color Pickers]
    ShowColorPicker --> CustomizeColors[Customize Theme Colors]
    CustomizeColors --> PreviewCustom[Preview Custom Theme]
    PreviewCustom --> SaveCustom{Save Custom Theme?}
    
    SaveCustom -->|Yes| NameTheme[Name Custom Theme]
    SaveCustom -->|No| DiscardCustom[Discard Changes]
    
    NameTheme --> ValidateName{Valid Theme Name?}
    ValidateName -->|Yes| SaveTheme[Save to Theme Library]
    ValidateName -->|No| ShowNameError[Show Name Error]
    
    UpdatePreview --> UserSatisfied{User Satisfied?}
    UserSatisfied -->|Yes| KeepTheme[Keep Theme Selection]
    UserSatisfied -->|No| TryAnother[Try Another Theme]
    
    KeepTheme --> OtherAppearance[Other Appearance Settings]
    OtherAppearance --> FontSize[Adjust Font Size]
    OtherAppearance --> Animation[Animation Speed]
    OtherAppearance --> Density[UI Density]
```

## Privacy & Data Management

```mermaid
flowchart TD
    PrivacySettings([Privacy & Data Section]) --> DataAction{User Action}
    
    DataAction -->|View Data| ShowDataSummary[Show Data Summary]
    DataAction -->|Export| ExportData[Export User Data]
    DataAction -->|Clear| ClearData[Clear Data Options]
    DataAction -->|Import| ImportData[Import Settings]
    DataAction -->|Privacy| PrivacyToggles[Privacy Settings]
    
    ShowDataSummary --> CalculateUsage[Calculate Storage Usage]
    CalculateUsage --> DisplayBreakdown[Display Data Breakdown]
    DisplayBreakdown --> ShowCategories[Show by Category]
    
    ExportData --> SelectFormat{Export Format}
    SelectFormat -->|JSON| GenerateJSON[Generate JSON Export]
    SelectFormat -->|ZIP| CreateArchive[Create ZIP Archive]
    
    GenerateJSON --> IncludeOptions{Include What?}
    IncludeOptions -->|All| ExportAll[Export All Data]
    IncludeOptions -->|Selected| SelectCategories[Select Categories]
    
    SelectCategories --> BuildExport[Build Export File]
    ExportAll --> BuildExport
    BuildExport --> DownloadFile[Download Export File]
    
    ClearData --> ShowWarning[Show Clear Warning]
    ShowWarning --> SelectClearType{Clear What?}
    SelectClearType -->|Cache| ClearCache[Clear Cache Only]
    SelectClearType -->|History| ClearHistory[Clear Chat History]
    SelectClearType -->|All| ClearAllData[Clear All Data]
    
    ClearCache --> ConfirmClear{Confirm Clear?}
    ClearHistory --> ConfirmClear
    ClearAllData --> DoubleConfirm[Double Confirmation]
    
    DoubleConfirm --> TypeConfirm[Type 'DELETE' to Confirm]
    TypeConfirm --> ValidateConfirm{Typed Correctly?}
    ValidateConfirm -->|Yes| ExecuteClear[Execute Clear Operation]
    ValidateConfirm -->|No| ShowTypeError[Show Type Error]
    
    ConfirmClear -->|Yes| ExecuteClear
    ConfirmClear -->|No| CancelClear[Cancel Operation]
    
    ExecuteClear --> ClearProgress[Show Clear Progress]
    ClearProgress --> ClearComplete[Clear Complete]
    ClearComplete --> RefreshUI[Refresh UI State]
```

## Settings Save & Sync Flow

```mermaid
flowchart TD
    ChangesMade([Settings Changed]) --> ShowSaveBar[Display Save Bar]
    ShowSaveBar --> UserAction{User Action}
    
    UserAction -->|Save| ValidateAll[Validate All Settings]
    UserAction -->|Discard| ConfirmDiscard{Confirm Discard?}
    UserAction -->|Continue Editing| KeepEditing[Continue Editing]
    
    ValidateAll --> ValidationResult{All Valid?}
    ValidationResult -->|Yes| SaveSettings[Save to Storage]
    ValidationResult -->|No| ShowErrors[Show Validation Errors]
    
    ShowErrors --> HighlightInvalid[Highlight Invalid Fields]
    HighlightInvalid --> ScrollToFirst[Scroll to First Error]
    ScrollToFirst --> WaitForFix[Wait for User Fix]
    
    SaveSettings --> CheckSync{Sync Enabled?}
    CheckSync -->|Yes| SyncSettings[Sync to Cloud]
    CheckSync -->|No| LocalOnly[Save Locally Only]
    
    SyncSettings --> SyncStatus{Sync Success?}
    SyncStatus -->|Success| ShowSyncSuccess[Show Sync Success]
    SyncStatus -->|Failed| ShowSyncError[Show Sync Error]
    SyncStatus -->|Conflict| ResolveConflict[Resolve Sync Conflict]
    
    LocalOnly --> SaveComplete[Save Complete]
    ShowSyncSuccess --> SaveComplete
    
    SaveComplete --> HideSaveBar[Hide Save Bar]
    HideSaveBar --> UpdateStatus[Update Status Indicators]
    
    ResolveConflict --> ShowConflictUI[Show Conflict Resolution]
    ShowConflictUI --> UserChoice{Resolution Choice}
    UserChoice -->|Keep Local| OverwriteRemote[Overwrite Remote]
    UserChoice -->|Keep Remote| OverwriteLocal[Overwrite Local]
    UserChoice -->|Merge| MergeSettings[Merge Both Versions]
    
    ConfirmDiscard -->|Yes| RevertSettings[Revert All Changes]
    ConfirmDiscard -->|No| KeepEditing
    
    RevertSettings --> ReloadSettings[Reload Original Settings]
    ReloadSettings --> HideSaveBar
```

## Advanced Settings & Reset

```mermaid
flowchart TD
    AdvancedSettings([Advanced Settings]) --> AdvancedAction{Action Type}
    
    AdvancedAction -->|Developer| DevSettings[Developer Options]
    AdvancedAction -->|Experimental| ExpFeatures[Experimental Features]
    AdvancedAction -->|Reset| ResetOptions[Reset Options]
    AdvancedAction -->|Backup| BackupRestore[Backup & Restore]
    
    DevSettings --> EnableDev{Enable Dev Mode?}
    EnableDev -->|Yes| ShowDevOptions[Show Developer Options]
    EnableDev -->|No| HideDevOptions[Hide Developer Options]
    
    ShowDevOptions --> DevTools[Developer Tools]
    DevTools --> DebugMode[Debug Logging]
    DevTools --> Console[Extension Console]
    DevTools --> Inspector[DOM Inspector]
    
    ExpFeatures --> ShowExperimental[List Experimental Features]
    ShowExperimental --> ToggleFeature[Toggle Feature On/Off]
    ToggleFeature --> WarnExperimental[Show Warning Dialog]
    WarnExperimental --> AcceptRisk{Accept Risk?}
    AcceptRisk -->|Yes| EnableFeature[Enable Feature]
    AcceptRisk -->|No| KeepDisabled[Keep Disabled]
    
    ResetOptions --> ResetType{Reset Type}
    ResetType -->|Partial| SelectReset[Select What to Reset]
    ResetType -->|Factory| FactoryReset[Factory Reset All]
    
    SelectReset --> ChooseCategories[Choose Categories]
    ChooseCategories --> ConfirmPartial[Confirm Partial Reset]
    
    FactoryReset --> FinalWarning[Show Final Warning]
    FinalWarning --> RequireConfirm[Require Typed Confirmation]
    RequireConfirm --> ValidateReset{Confirmed?}
    ValidateReset -->|Yes| ExecuteReset[Execute Factory Reset]
    ValidateReset -->|No| CancelReset[Cancel Reset]
    
    ExecuteReset --> ClearAllSettings[Clear All Settings]
    ClearAllSettings --> RestoreDefaults[Restore Defaults]
    RestoreDefaults --> RestartExtension[Restart Extension]
    RestartExtension --> ShowWelcome[Show Welcome Screen]
```

## Settings UI Components

### Settings Navigation Sidebar
```
┌─────────────────────────────────────┐
│ Settings                        [×] │
├─────────────────────────────────────┤
│ 🔍 Search settings...               │
├─────────────────────────────────────┤
│ ⚙️  General                    ←    │
│ 🎨 Appearance                       │
│ 💬 ChatGPT                         │
│ ⚡ Automation                       │
│ 🔒 Privacy & Data                  │
│ ⌨️  Keyboard Shortcuts             │
│ 🔧 Advanced                        │
│ ❓ Help & Support                  │
│ ℹ️  About                          │
└─────────────────────────────────────┘
```

### Settings Section Example
```
┌─────────────────────────────────────┐
│ General Settings                    │
├─────────────────────────────────────┤
│ Extension Behavior                  │
│                                     │
│ Auto-activate on ChatGPT       [ON] │
│ When visiting ChatGPT, the         │
│ extension activates automatically   │
│                                     │
│ Default Project                     │
│ [Marketing Campaign        ▼]       │
│                                     │
│ Notifications                  [ON] │
│ Show desktop notifications for      │
│ important events                    │
│                                     │
│ Performance                         │
│ Cache Size: [━━━━━━●━━━] 100MB    │
│ Clear cache every: [30 days    ▼]  │
└─────────────────────────────────────┘
```

### Save Bar
```
┌─────────────────────────────────────┐
│ ⚠️  You have unsaved changes        │
│                                     │
│ [Discard Changes]    [Save Changes] │
└─────────────────────────────────────┘
```

## Error Handling

### Validation Errors
```
┌─────────────────────────────────────┐
│ ❌ Settings Validation Error        │
├─────────────────────────────────────┤
│ Please fix the following errors:    │
│                                     │
│ • Keyboard shortcut conflicts with  │
│   existing shortcut (Ctrl+N)       │
│ • Cache size must be between       │
│   10MB and 500MB                   │
│                                     │
│ [Review Errors]                     │
└─────────────────────────────────────┘
```

### Sync Conflicts
```
┌─────────────────────────────────────┐
│ 🔄 Settings Sync Conflict           │
├─────────────────────────────────────┤
│ Your settings have been modified    │
│ on another device.                  │
│                                     │
│ Local:  Modified 2 mins ago        │
│ Remote: Modified 5 mins ago        │
│                                     │
│ [Keep Local] [Keep Remote] [Merge]  │
└─────────────────────────────────────┘
```

## Performance Optimizations

### Settings Loading
1. **Lazy Section Loading**: Load section content on demand
2. **Virtual Scrolling**: For long settings lists
3. **Debounced Saves**: Batch setting changes
4. **Incremental Validation**: Validate on change, not on save

### Storage Strategy
```javascript
// Settings storage tiers
const storageTiers = {
  critical: 'sync',      // Cross-device settings
  user: 'local',         // User preferences
  cache: 'session',      // Temporary settings
  computed: 'memory'     // Derived values
};
```

## Accessibility Features

### Navigation
- Full keyboard navigation
- Skip links to sections
- Breadcrumb navigation
- Search with autocomplete

### Screen Reader Support
```html
<nav role="navigation" aria-label="Settings sections">
  <ul role="list">
    <li role="listitem">
      <a href="#general" 
         aria-current="page"
         aria-describedby="general-desc">
        General Settings
      </a>
    </li>
  </ul>
</nav>

<main role="main" aria-labelledby="settings-title">
  <h1 id="settings-title">Extension Settings</h1>
  <section aria-labelledby="general-heading">
    <h2 id="general-heading">General Settings</h2>
  </section>
</main>
```

### Visual Indicators
- Focus rings on all controls
- Color contrast compliance
- Error states with icons
- Loading states
- Success confirmations