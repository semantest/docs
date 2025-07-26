# TDD Mob Programming Protocol

## Overview

To improve our TDD adoption and shared ownership, we're implementing mob programming sessions where the entire team collaborates on a single feature using strict TDD principles.

## Mob Programming Patterns

### 1. **Randori (Ping-Pong) Pattern**
- Driver A writes failing test (🧪)
- Driver B makes it pass (🍬)
- Driver C refactors (🚀)
- Rotate every 5 minutes

### 2. **Classic Mob Pattern**
- One driver, multiple navigators
- Driver types exactly what navigators say
- Rotate driver every 5 minutes
- No thinking at keyboard - driver is "smart hands"

## Rotation Schedule

```
Alex (Backend) → Eva (Extension) → Quinn (QA) → Dana (DevOps) → Alex...
```

## TDD Emoji Commit Protocol

```bash
# Red Phase - Write failing test
git commit -m "🧪 Add test for image download queue"

# Green Phase - Make test pass (naive implementation)
git commit -m "🍬 Implement basic queue functionality"

# Refactor Phase - Improve code quality
git commit -m "🚀 Extract queue to separate class"

# Documentation 
git commit -m "📝 Document queue API"

# Complete feature
git commit -m "🏅 Complete image download queue feature"
```

## Mob Session Rules

1. **No Silent Coding** - Verbalize all thoughts
2. **Yes, And...** - Build on others' ideas
3. **Rotate Punctually** - Timer is law
4. **Test First** - No production code without failing test
5. **Small Steps** - Tiny increments, frequent commits
6. **Shared Screen** - Driver shares screen (if remote)
7. **No Judgment** - Safe space for learning

## Communication During Mob

### Driver Says:
- "I'm writing a test for..."
- "I'm making this test pass by..."
- "I see an opportunity to refactor..."

### Navigators Say:
- "Let's test the edge case where..."
- "Consider using [pattern] here"
- "Don't forget to handle..."
- "Can we extract this to..."

## Benefits We're Seeking

1. **Shared Code Ownership** - Everyone understands every part
2. **Knowledge Transfer** - Learn from each other's strengths
3. **TDD Discipline** - Harder to skip tests with witnesses
4. **Design Quality** - Multiple perspectives improve architecture
5. **Team Bonding** - Shared struggle and success

## Anti-Patterns to Avoid

- **Driver Goes Rogue** - Implements their own ideas
- **Silent Navigator** - Doesn't contribute
- **Skipping Tests** - "Just this once" syndrome
- **Large Steps** - Too much change between commits
- **Personal Criticism** - Focus on code, not coder

## Success Metrics

- Commit frequency (target: every 10-15 min)
- Test coverage increase
- Emoji usage in commits
- Team participation rate
- Feature completion time

## Starting Your First Mob

```bash
# Start mob session for image download feature
./tmux-orchestrator/tdd-mob-scheduler.sh semantest 5 randori "image-download-queue"

# Team gets notifications and rotation reminders
# Strict 5-minute rotations enforce participation
```

## Integration with Our Workflow

1. **PM Monitors** - Sees rotation updates
2. **Architect Guides** - Provides design input
3. **Scribe Documents** - Captures decisions
4. **Git Discipline** - Commits every rotation

This protocol ensures everyone experiences the full TDD cycle and takes ownership of quality.