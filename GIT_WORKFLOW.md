# Semantest Git Workflow Guide

This document outlines the Git workflow and conventions used in the Semantest project.

## Table of Contents

1. [Branch Strategy](#branch-strategy)
2. [Commit Conventions](#commit-conventions)
3. [Pull Request Process](#pull-request-process)
4. [Release Process](#release-process)
5. [Hotfix Process](#hotfix-process)
6. [Best Practices](#best-practices)

## Branch Strategy

We follow a modified Git Flow strategy with the following branch types:

### Main Branches

- **`main`** - Production-ready code. Protected branch.
- **`develop`** - Integration branch for features. Protected branch.

### Supporting Branches

- **`feature/*`** - New features and enhancements
- **`fix/*`** - Bug fixes (non-critical)
- **`hotfix/*`** - Critical production fixes
- **`release/*`** - Release preparation
- **`docs/*`** - Documentation updates
- **`test/*`** - Test additions or fixes
- **`refactor/*`** - Code refactoring
- **`chore/*`** - Maintenance tasks

### Branch Naming

```bash
# Feature branches
feature/add-user-authentication
feature/implement-payment-gateway
feature/033-comprehensive-error-handling

# Fix branches
fix/resolve-login-timeout
fix/correct-email-validation

# Documentation branches
docs/update-api-reference
docs/add-deployment-guide

# Release branches
release/v2.1.0
release/v2.2.0-beta.1
```

## Commit Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, semicolons, etc.)
- **refactor**: Code refactoring without changing functionality
- **perf**: Performance improvements
- **test**: Adding or modifying tests
- **build**: Build system or dependency changes
- **ci**: CI/CD configuration changes
- **chore**: Maintenance tasks
- **revert**: Reverting a previous commit

### Scopes

Common scopes in our project:

- **core**: Core module changes
- **browser**: Browser automation changes
- **images**: Google Images domain
- **chatgpt**: ChatGPT domain
- **server**: Server infrastructure
- **extension**: Chrome extension
- **api**: API changes
- **auth**: Authentication
- **db**: Database changes

### Examples

```bash
# Feature commit
git commit -m "feat(images): add high-resolution image download support

- Implement URL resolution for full-size images
- Add retry logic for failed downloads
- Update documentation with new options

Closes #123"

# Bug fix
git commit -m "fix(auth): resolve token expiration handling

Token refresh was failing when multiple requests were made simultaneously.
Implemented mutex to ensure single refresh operation.

Fixes #456"

# Breaking change
git commit -m "feat(api)!: redesign authentication endpoints

BREAKING CHANGE: Authentication endpoints have been restructured.
- POST /auth/login -> POST /api/v2/auth/login
- GET /auth/user -> GET /api/v2/auth/me
- Token format changed from JWT to opaque tokens

Migration guide available in docs/migration/v2.md"

# Documentation
git commit -m "docs(api): update authentication examples

- Add curl examples for all auth endpoints
- Include error response samples
- Fix typos in parameter descriptions"

# Performance improvement
git commit -m "perf(images): optimize image processing pipeline

- Implement parallel processing for batch downloads
- Add caching for processed images
- Reduce memory usage by 40%

Performance benchmarks:
- Before: 100 images in 45s
- After: 100 images in 12s"
```

### Commit Message Guidelines

1. **Subject Line**
   - Use imperative mood ("add" not "added" or "adds")
   - Don't capitalize first letter
   - No period at the end
   - Maximum 50 characters

2. **Body**
   - Wrap at 72 characters
   - Explain what and why, not how
   - Include motivation for change
   - Contrast behavior with previous

3. **Footer**
   - Reference issues and PRs
   - Note breaking changes
   - Include co-authors

## Pull Request Process

### Creating a Pull Request

1. **Update your branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout feature/your-feature
   git rebase develop
   ```

2. **Push your branch**
   ```bash
   git push origin feature/your-feature
   ```

3. **Create PR on GitHub**
   - Use PR template
   - Link related issues
   - Add appropriate labels
   - Assign reviewers

### PR Template

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Changes Made
- List key changes
- Highlight important decisions
- Note any compromises or debt

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Performance impact assessed

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where necessary
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing unit tests pass locally
- [ ] Any dependent changes have been merged

## Screenshots (if applicable)
Add screenshots for UI changes

## Related Issues
Closes #123
Related to #456
```

### Review Process

1. **Automated Checks**
   - CI/CD pipeline must pass
   - Code coverage maintained
   - No security vulnerabilities
   - Linting passes

2. **Code Review Requirements**
   - Minimum 2 approvals
   - At least 1 senior developer
   - Domain expert for significant changes
   - Security review for auth/sensitive changes

3. **Review Guidelines**
   - Check code quality and standards
   - Verify business logic
   - Assess performance impact
   - Review test coverage
   - Validate documentation

### Merging

1. **Merge Requirements**
   - All checks passing
   - Required approvals received
   - No unresolved comments
   - Up to date with base branch

2. **Merge Strategy**
   - **Squash and merge** for features
   - **Merge commit** for releases
   - **Rebase and merge** for hotfixes

## Release Process

### Version Numbers

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR.MINOR.PATCH** (e.g., 2.1.3)
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Workflow

1. **Create Release Branch**
   ```bash
   git checkout -b release/v2.1.0 develop
   ```

2. **Prepare Release**
   - Update version numbers
   - Update CHANGELOG.md
   - Run full test suite
   - Update documentation

3. **Release Checklist**
   ```bash
   # Update version
   npm version minor --no-git-tag-version
   
   # Update changelog
   npm run changelog
   
   # Commit changes
   git add .
   git commit -m "chore(release): prepare v2.1.0"
   ```

4. **Create Release PR**
   - PR from release branch to main
   - Include release notes
   - Get required approvals

5. **Merge and Tag**
   ```bash
   # Merge to main
   git checkout main
   git merge --no-ff release/v2.1.0
   
   # Create tag
   git tag -a v2.1.0 -m "Release version 2.1.0"
   
   # Merge back to develop
   git checkout develop
   git merge --no-ff main
   
   # Push everything
   git push origin main develop --tags
   ```

6. **Post-Release**
   - Create GitHub release
   - Publish to npm
   - Update documentation site
   - Announce to team/community

## Hotfix Process

For critical production issues:

1. **Create Hotfix Branch**
   ```bash
   git checkout -b hotfix/fix-critical-bug main
   ```

2. **Fix and Test**
   - Implement fix
   - Add regression test
   - Verify fix in production-like environment

3. **Fast-Track Review**
   - Expedited review process
   - Minimum 1 senior approval
   - Focus on fix correctness

4. **Deploy**
   ```bash
   # Merge to main
   git checkout main
   git merge --no-ff hotfix/fix-critical-bug
   
   # Tag hotfix
   git tag -a v2.1.1 -m "Hotfix: Fix critical bug"
   
   # Merge to develop
   git checkout develop
   git merge --no-ff main
   
   # Push
   git push origin main develop --tags
   ```

## Best Practices

### General Guidelines

1. **Commit Often**
   - Small, logical commits
   - One feature/fix per commit
   - Commit working code only

2. **Pull Regularly**
   - Pull latest changes daily
   - Rebase feature branches
   - Resolve conflicts early

3. **Clean History**
   - Use interactive rebase for cleanup
   - Squash WIP commits
   - Maintain linear history where possible

### Dos and Don'ts

#### Do ✅

```bash
# Rebase feature branches
git checkout feature/my-feature
git rebase develop

# Use descriptive branch names
git checkout -b feature/add-image-compression

# Sign commits
git commit -S -m "feat: add secure feature"

# Clean up local branches
git branch -d feature/completed-feature
```

#### Don't ❌

```bash
# Don't commit sensitive data
git add .env  # Never!

# Don't force push to shared branches
git push --force origin develop  # Never!

# Don't commit large files
git add large-video.mp4  # Use Git LFS

# Don't merge without reviewing
git merge feature/untested  # Always review first
```

### Troubleshooting

#### Undo Last Commit

```bash
# Keep changes
git reset --soft HEAD~1

# Discard changes
git reset --hard HEAD~1
```

#### Fix Commit Message

```bash
# Last commit
git commit --amend -m "New message"

# Older commits
git rebase -i HEAD~3
# Mark commit as 'reword'
```

#### Resolve Conflicts

```bash
# During rebase
git rebase develop
# Fix conflicts in files
git add .
git rebase --continue
```

#### Clean Up

```bash
# Remove untracked files
git clean -fd

# Reset to remote state
git fetch origin
git reset --hard origin/develop
```

## Git Aliases

Useful Git aliases for common operations:

```bash
# Add to ~/.gitconfig
[alias]
    # Shortcuts
    co = checkout
    br = branch
    ci = commit
    st = status
    
    # Useful commands
    last = log -1 HEAD
    unstage = reset HEAD --
    visual = !gitk
    
    # Pretty log
    lg = log --color --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit
    
    # List branches by date
    recent = for-each-ref --sort=committerdate refs/heads/ --format='%(HEAD) %(color:yellow)%(refname:short)%(color:reset) - %(color:red)%(objectname:short)%(color:reset) - %(contents:subject) - %(authorname) (%(color:green)%(committerdate:relative)%(color:reset))'
    
    # Cleanup merged branches
    cleanup = !git branch --merged | grep -v '\\*\\|main\\|develop' | xargs -n 1 git branch -d
```

## Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Git Documentation](https://git-scm.com/doc)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)