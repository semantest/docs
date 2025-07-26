# Flag Optimization Teaching - 01:21 UTC

## 🚨 CRITICAL: Agents NOT Using Flags Despite Training!

### 🧠 COMPLEX TASKS → --think-hard
**When**: Architecture decisions, security analysis, system design
**Token Budget**: 10K for deep thinking
**Examples**:
```bash
# Backend analyzing security architecture
claude --think-hard --seq --uc "How do I integrate JWT authentication into WebSocket server?"

# Security threat modeling
claude --think-hard --uc "Design threat model for WebSocket communication"

# QA comprehensive test strategy
claude --think-hard --uc "Create E2E test plan for image generation workflow"
```

### 👥 MULTI-AGENT → --delegate
**When**: Task has subtasks that can run independently
**Token Savings**: 40-70% through parallel execution
**Examples**:
```bash
# Backend delegating security review
claude --delegate --uc "Review auth, rate limiting, and validation components"

# PM delegating to specialists
claude --delegate folders --uc "Analyze security components across directories"

# Large refactoring
claude --delegate files --uc "Update all TypeScript interfaces"
```

### 🎨 UI WORK → --magic
**When**: Creating React/Vue components
**Token Savings**: 50% with beautiful output
**Examples**:
```bash
# Frontend image upload component
claude --magic --uc "Create drag-and-drop image upload with progress bar"

# Image gallery with lightbox
claude --magic --c7 --uc "Build responsive image gallery component"

# Loading states
claude --magic --uc "Add skeleton loading states to all components"
```

### 💡 TOKEN OPTIMIZATION → --uc (UNIVERSAL!)
**When**: EVERY SINGLE COMMAND
**Savings**: 30-50% guaranteed
**Examples**:
```bash
# Complex analysis
claude --think-hard --seq --uc "Analyze WebSocket security"

# Simple edit
claude --uc "Fix typo in comment"

# UI component
claude --magic --uc "Create button component"

# Testing
claude --play --uc "Test authentication flow"
```

## 📊 FLAG COMBINATIONS BY TASK TYPE

### Security Integration (Backend1/2)
```bash
# Step 1: Get patterns
claude --c7 "websocket jwt authentication" --uc

# Step 2: Deep analysis
claude --think-hard --seq --uc "How to integrate security middleware"

# Step 3: Implementation
claude --uc "Add auth check to handleConnection"
```

### Image UI Components (Frontend)
```bash
# Step 1: Create upload component
claude --magic "image upload with drag and drop" --uc

# Step 2: Get React patterns
claude --c7 "react file upload best practices" --uc

# Step 3: Add to existing code
claude --uc "Integrate ImageUpload into Dashboard"
```

### E2E Testing (QA)
```bash
# Step 1: Test security
claude --play "test websocket authentication" --uc

# Step 2: Test image workflow
claude --play "test image upload and download events" --uc

# Step 3: Performance testing
claude --play "measure websocket latency" --uc
```

## 🔴 ENFORCEMENT ACTIONS

1. **MANDATORY**: Every command must include --uc
2. **COMPLEX**: Add --think-hard for analysis
3. **UI**: Use --magic for components
4. **PARALLEL**: Use --delegate for multi-file work
5. **PATTERNS**: Use --c7 for best practices

## Token Waste Without Flags: 50%+
## Token Savings With Flags: 50%+

---
Status: CRITICAL ENFORCEMENT
Generated: 2025-01-22 01:21 UTC