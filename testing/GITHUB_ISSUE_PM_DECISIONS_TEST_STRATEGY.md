# GitHub Issue: PM Decision Required - Critical Test Coverage Strategy

## Issue Type
🚨 **Decision Required** / **Strategic Planning**

## Priority
**P0 - CRITICAL** (Blocking quality assurance)

## Summary
QA assessment reveals 9.8% test coverage, requiring immediate PM decisions on resource allocation and strategy. Recent WebSocket port mismatch bug (found by Eva) demonstrates the real cost of inadequate testing.

## Decision Points Needed

### 1. Developer Resource Allocation
**Question**: How many developers can we dedicate to test writing?

| Option | Resources | Timeline | Coverage Target |
|--------|-----------|----------|-----------------|
| A | 3 devs full-time | 1 month | 50% |
| B | 2 devs full-time | 2 months | 50% |
| C | 1 dev part-time | 6 months | 50% |

**QA Recommendation**: Option A (critical gap requires aggressive response)

### 2. Merge Policy Changes
**Question**: Should we enforce mandatory tests for all new code?

| Option | Policy | Impact |
|--------|--------|--------|
| A | No merge without tests | Immediate quality improvement, slower initial velocity |
| B | Tests required for critical paths only | Partial improvement |
| C | Tests encouraged but optional | Status quo (insufficient) |

**QA Recommendation**: Option A (stop coverage from getting worse)

### 3. Timeline for 80% Coverage
**Question**: What timeline is acceptable for reaching standard coverage?

| Timeline | Milestones | Risk Level |
|----------|------------|------------|
| 2 months | Aggressive, may impact quality | High |
| 3 months | Steady progress, achievable | Medium |
| 6 months | Gradual, continues risk exposure | Very High |

**QA Recommendation**: 3 months (balanced approach)

### 4. Feature Development Impact
**Question**: Should we pause features to focus on testing?

| Option | Approach | Duration |
|--------|----------|----------|
| A | Full pause, 100% testing | 2 weeks |
| B | 50/50 split | 4 weeks |
| C | Continue features, gradual tests | Ongoing |

**QA Recommendation**: Option A then B (critical first, then balanced)

### 5. Enforcement Mechanism
**Question**: How do we ensure testing standards compliance?

| Option | Mechanism | Effectiveness |
|--------|-----------|---------------|
| A | CI/CD gates + review checklist | High (automated) |
| B | Weekly reports + accountability | Medium |
| C | Trust-based self-enforcement | Low (current failing approach) |

**QA Recommendation**: Option A + B (automation plus visibility)

## Context and Evidence

### Current State
- **Test Coverage**: 9.8% (72 test files / 736+ source files)
- **Most Critical**: google.com (2%), nodejs.server (5%), sdk (8%)
- **Recent Bug**: WebSocket port mismatch broke production

### Business Impact
- **Customer Experience**: Production bugs reaching users
- **Development Velocity**: Fear of refactoring
- **Technical Debt**: Compounding daily
- **Competitive Risk**: Quality issues impact market position

### Cost Analysis
- **Investment Needed**: 3 developer months
- **Cost of Inaction**: 10-20 hours per production bug
- **ROI**: Break-even at 24-48 prevented bugs

## Required Actions

1. **PM Decision By**: EOD Today
2. **Implementation Start**: Tomorrow
3. **First Review**: End of Week 1
4. **Milestone 1**: 30% coverage in 4 weeks

## Success Criteria
- [ ] PM decisions documented on all 5 points
- [ ] Resource allocation confirmed
- [ ] Timeline approved
- [ ] Policy changes communicated
- [ ] Implementation plan activated

## Stakeholders
- **Decision Maker**: Project Manager
- **Implementers**: Development Team
- **Advisor**: QA Team
- **Impacted**: All Teams

## References
- [QA Assessment Report](QA_ASSESSMENT_REPORT_COMPREHENSIVE.md)
- [PM Decision Document](PM_CRITICAL_DECISIONS_NEEDED.md)
- [Testing Standards](docs/TESTING_STANDARDS.md)
- [WebSocket Bug Report](WEBSOCKET_PORT_FIX.md)

## Labels
- `decision-required`
- `pm-attention`
- `critical`
- `test-strategy`
- `resource-planning`

---

**⏰ Time-Sensitive**: Each day without decision increases technical debt and production risk