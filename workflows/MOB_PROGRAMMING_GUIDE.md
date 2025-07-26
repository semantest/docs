# Mob Programming Guide for Semantest Team

## What is Mob Programming?

"All the brilliant minds working on the same thing, at the same time, in the same space, and on the same computer" - Woody Zuill

## Our Approach: TDD Randori Pattern

### Core Principles
1. **One Computer**: Shared screen, shared code
2. **Rotation**: Regular driver changes (5-7 minutes)
3. **TDD Discipline**: Red → Green → Refactor
4. **Collective Ownership**: The mob owns the code

### Roles

#### 🚗 Driver
- Types the code
- Focuses on syntax and implementation
- Verbalizes actions
- Does NOT make design decisions alone

#### 🧭 Navigator  
- Guides the driver
- Thinks strategically
- Maintains TDD discipline
- Communicates next steps

#### 👀 Observers
- Watch for issues
- Research solutions
- Prepare for their turn
- Ask clarifying questions

## TDD in Mob Sessions

### The Sacred Cycle
```
1. RED: Write a failing test
   - Test describes desired behavior
   - Run test to see it fail
   
2. GREEN: Make it pass
   - Write minimal code
   - Just enough to pass
   
3. REFACTOR: Improve
   - Clean up code
   - Maintain green tests
```

### Mob TDD Rules
1. **No production code without a failing test**
2. **Only write enough test to fail**
3. **Only write enough code to pass**
4. **Refactor only with green tests**
5. **The mob decides, not individuals**

## Rotation Patterns

### Randori (Recommended for TDD)
```
Round 1: Alex drives, Eva navigates, Others observe
Round 2: Eva drives, Quinn navigates, Others observe  
Round 3: Quinn drives, Dana navigates, Others observe
Round 4: Dana drives, Alex navigates, Others observe
(repeat)
```

### Benefits
- Everyone drives
- Everyone navigates
- Maintains energy
- Shares knowledge

## Session Structure

### Pre-Session (10 minutes)
- [ ] Environment check
- [ ] Feature overview
- [ ] Goal setting
- [ ] Role assignment

### During Session
- [ ] Strict rotation timer
- [ ] TDD discipline enforcement
- [ ] Regular micro-retrospectives
- [ ] Celebrate test passes!

### Post-Session (10 minutes)
- [ ] Quick retrospective
- [ ] Document learnings
- [ ] Plan next session
- [ ] Commit code together

## Communication Patterns

### Driver Says
- "I'm typing [action]"
- "Running tests now"
- "I see [result]"
- "Should I [question]?"

### Navigator Says
- "Let's write a test for [behavior]"
- "Type [specific code]"
- "Run the tests"
- "Time to refactor"

### Observer Says
- "I notice [observation]"
- "What if [suggestion]?"
- "I can research [topic]"
- "Question: [clarification]"

## Common Challenges & Solutions

### Challenge: Dominant Personalities
**Solution**: Navigator speaks, driver types, enforce rotation

### Challenge: TDD Discipline Slips
**Solution**: Observer becomes TDD champion, gentle reminders

### Challenge: Energy Drops
**Solution**: Take breaks, celebrate wins, rotate faster

### Challenge: Technical Blockers
**Solution**: Time-box research, use observer for lookup

## Tools & Setup

### Essential Tools
- **Timer**: Visible to all (mob-timer.com)
- **Screen Share**: High quality, low latency
- **IDE**: Consistent settings across team
- **Tests**: Fast feedback loop (<5 seconds)

### Recommended Setup
```bash
# Session startup script
mob start
npm test -- --watch
git checkout -b mob-session-$(date +%Y%m%d)
```

## Metrics to Track

### Process Metrics
- Rotation completion rate
- TDD cycle adherence
- Test-first percentage
- Break frequency

### Outcome Metrics
- Tests written
- Coverage achieved
- Features completed
- Knowledge shared

## Tips for Success

### For New Mobbers
1. **Ask questions** - No question is stupid
2. **Trust the process** - TDD works
3. **Speak up** - Your perspective matters
4. **Be patient** - Learning takes time

### For Experienced Mobbers
1. **Share knowledge** - Teach don't preach
2. **Stay humble** - Everyone has something to learn
3. **Enforce discipline** - Gentle TDD reminders
4. **Celebrate others** - Acknowledge contributions

## Session Variations

### Learning Focus
- Longer rotations (10 minutes)
- More explanation time
- Pair within mob for complex parts

### Speed Focus  
- Shorter rotations (3 minutes)
- Prepared test cases
- Clear acceptance criteria

### Quality Focus
- Extended refactor phases
- Code review within mob
- Performance testing included

## The Semantest Way

Our mob programming culture:
- **Inclusive**: Everyone contributes
- **Educational**: Continuous learning
- **Disciplined**: TDD without compromise
- **Fun**: Celebrate successes together

> "The best code we've written has been mob code" - Semantest Team

## Resources

- [Original Mob Programming](https://mobprogramming.org/)
- [TDD by Example](https://www.amazon.com/Test-Driven-Development-Kent-Beck/dp/0321146530)
- [Our Session Logs](./MOB_SESSION_LOGS/)

---

*Guide maintained by the Semantest Team - Updates welcome via mob session!*