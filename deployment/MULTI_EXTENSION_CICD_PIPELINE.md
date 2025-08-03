# Multi-Extension CI/CD Pipeline Architecture

## Overview

This document outlines the CI/CD pipeline architecture for deploying multiple Semantest-powered browser extensions, coordinating with Dana's infrastructure excellence (487 commits, Hour 86!).

## Pipeline Architecture

### 1. Repository Structure

```
semantest/
├── extensions/
│   ├── shared/              # Shared core library
│   │   ├── src/
│   │   ├── tests/
│   │   └── package.json
│   ├── semantest-chatgpt/   # ChatGPT extension
│   │   ├── src/
│   │   ├── manifest.json
│   │   └── package.json
│   ├── semantest-claude/    # Claude extension
│   │   ├── src/
│   │   ├── manifest.json
│   │   └── package.json
│   └── semantest-gemini/    # Gemini extension
│       ├── src/
│       ├── manifest.json
│       └── package.json
└── .github/
    └── workflows/
        ├── extension-ci.yml
        ├── extension-cd.yml
        └── shared-library.yml
```

### 2. GitHub Actions Workflow

```yaml
# .github/workflows/extension-ci.yml
name: Extension CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  shared-library-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: |
          cd extensions/shared
          npm ci
      
      - name: Run shared library tests
        run: |
          cd extensions/shared
          npm run test:ci
      
      - name: Build shared library
        run: |
          cd extensions/shared
          npm run build
      
      - name: Upload shared artifacts
        uses: actions/upload-artifact@v3
        with:
          name: shared-library
          path: extensions/shared/dist/

  extension-tests:
    needs: shared-library-tests
    runs-on: ubuntu-latest
    strategy:
      matrix:
        extension: [chatgpt, claude, gemini]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Download shared library
        uses: actions/download-artifact@v3
        with:
          name: shared-library
          path: extensions/shared/dist/
      
      - name: Setup Chrome
        uses: browser-actions/setup-chrome@latest
      
      - name: Install dependencies
        run: |
          cd extensions/semantest-${{ matrix.extension }}
          npm ci
      
      - name: Run extension tests
        run: |
          cd extensions/semantest-${{ matrix.extension }}
          npm run test:ci
      
      - name: Build extension
        run: |
          cd extensions/semantest-${{ matrix.extension }}
          npm run build:production
      
      - name: Run E2E tests
        run: |
          cd extensions/semantest-${{ matrix.extension }}
          npm run test:e2e
      
      - name: Package extension
        run: |
          cd extensions/semantest-${{ matrix.extension }}
          npm run package
      
      - name: Upload extension artifact
        uses: actions/upload-artifact@v3
        with:
          name: semantest-${{ matrix.extension }}-${{ github.sha }}
          path: extensions/semantest-${{ matrix.extension }}/dist/*.zip
```

### 3. Deployment Pipeline

```yaml
# .github/workflows/extension-cd.yml
name: Extension CD Pipeline

on:
  push:
    tags:
      - 'v*.*.*'
  workflow_dispatch:
    inputs:
      environment:
        description: 'Deployment environment'
        required: true
        type: choice
        options:
          - staging
          - production

jobs:
  deploy-extensions:
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment || 'production' }}
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup deployment tools
        run: |
          npm install -g chrome-webstore-upload-cli
          npm install -g @mozilla/web-ext
      
      - name: Deploy ChatGPT Extension
        env:
          CHROME_CLIENT_ID: ${{ secrets.CHROME_CLIENT_ID }}
          CHROME_CLIENT_SECRET: ${{ secrets.CHROME_CLIENT_SECRET }}
          CHROME_REFRESH_TOKEN: ${{ secrets.CHROME_REFRESH_TOKEN }}
        run: |
          chrome-webstore-upload upload \
            --source extensions/semantest-chatgpt/dist/semantest-chatgpt.zip \
            --extension-id ${{ secrets.CHATGPT_EXTENSION_ID }}
      
      - name: Deploy to Firefox Add-ons
        env:
          FIREFOX_API_KEY: ${{ secrets.FIREFOX_API_KEY }}
          FIREFOX_API_SECRET: ${{ secrets.FIREFOX_API_SECRET }}
        run: |
          web-ext sign \
            --source-dir extensions/semantest-chatgpt/dist \
            --api-key $FIREFOX_API_KEY \
            --api-secret $FIREFOX_API_SECRET
```

## Staging Environment

### Infrastructure (Dana's Domain)

```yaml
# kubernetes/staging/extensions-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: extension-test-server
  namespace: semantest-staging
spec:
  replicas: 2
  selector:
    matchLabels:
      app: extension-test-server
  template:
    metadata:
      labels:
        app: extension-test-server
    spec:
      containers:
      - name: test-server
        image: semantest/extension-test-server:latest
        ports:
        - containerPort: 3004
        env:
        - name: ENVIRONMENT
          value: "staging"
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: redis-credentials
              key: url
```

### Test Infrastructure

```javascript
// test-infrastructure/extension-test-harness.js
class ExtensionTestHarness {
  constructor() {
    this.extensions = ['chatgpt', 'claude', 'gemini'];
    this.testResults = new Map();
  }
  
  async runStagingTests() {
    for (const ext of this.extensions) {
      console.log(`Testing ${ext} extension in staging...`);
      
      const results = await this.testExtension(ext);
      this.testResults.set(ext, results);
      
      // Send results to monitoring
      await this.reportResults(ext, results);
    }
    
    return this.generateReport();
  }
  
  async testExtension(name) {
    const tests = [
      this.testInstallation(name),
      this.testWebSocketConnection(name),
      this.testAPIIntegration(name),
      this.testImageGeneration(name),
      this.testRestrictions(name)
    ];
    
    const results = await Promise.all(tests);
    return {
      name,
      timestamp: new Date(),
      results,
      passed: results.every(r => r.passed)
    };
  }
}
```

## Monitoring & Observability

### Extension Metrics

```typescript
// monitoring/extension-metrics.ts
export const extensionMetrics = {
  // Installation metrics
  installSuccess: new Counter({
    name: 'extension_install_success_total',
    help: 'Total successful extension installations',
    labelNames: ['extension', 'version', 'browser']
  }),
  
  // API usage metrics
  apiRequests: new Counter({
    name: 'extension_api_requests_total',
    help: 'Total API requests from extensions',
    labelNames: ['extension', 'endpoint', 'status']
  }),
  
  // Performance metrics
  loadTime: new Histogram({
    name: 'extension_load_time_seconds',
    help: 'Extension load time in seconds',
    labelNames: ['extension', 'version'],
    buckets: [0.1, 0.5, 1, 2, 5]
  }),
  
  // Error tracking
  errors: new Counter({
    name: 'extension_errors_total',
    help: 'Total errors in extensions',
    labelNames: ['extension', 'error_type', 'severity']
  })
};
```

### Grafana Dashboard

```json
{
  "dashboard": {
    "title": "Semantest Extensions Overview",
    "panels": [
      {
        "title": "Extension Health",
        "type": "stat",
        "targets": [
          {
            "expr": "up{job=\"extension-monitor\"}"
          }
        ]
      },
      {
        "title": "API Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(extension_api_requests_total[5m])"
          }
        ]
      },
      {
        "title": "Error Rate by Extension",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(extension_errors_total[5m]) by (extension)"
          }
        ]
      }
    ]
  }
}
```

## Release Process

### 1. Version Management

```javascript
// scripts/version-manager.js
const fs = require('fs');
const path = require('path');

class VersionManager {
  constructor() {
    this.extensions = ['chatgpt', 'claude', 'gemini'];
  }
  
  async bumpVersion(type = 'patch') {
    // Update shared library version
    await this.updatePackageVersion('shared', type);
    
    // Update each extension
    for (const ext of this.extensions) {
      await this.updateExtensionVersion(ext, type);
    }
    
    // Create git tag
    const version = await this.getVersion();
    await this.createTag(version);
  }
  
  async updateExtensionVersion(name, type) {
    // Update package.json
    const packagePath = `extensions/semantest-${name}/package.json`;
    const pkg = JSON.parse(fs.readFileSync(packagePath));
    pkg.version = this.incrementVersion(pkg.version, type);
    
    // Update manifest.json
    const manifestPath = `extensions/semantest-${name}/manifest.json`;
    const manifest = JSON.parse(fs.readFileSync(manifestPath));
    manifest.version = pkg.version;
    
    // Save files
    fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2));
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  }
}
```

### 2. Automated Release Notes

```yaml
# .github/workflows/release-notes.yml
name: Generate Release Notes

on:
  push:
    tags:
      - 'v*.*.*'

jobs:
  release-notes:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      
      - name: Generate changelog
        id: changelog
        uses: mikepenz/release-changelog-builder-action@v3
        with:
          configuration: ".github/changelog-config.json"
      
      - name: Create Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          body: |
            ## What's Changed
            ${{ steps.changelog.outputs.changelog }}
            
            ## Extension Downloads
            - [ChatGPT Extension](https://chrome.google.com/webstore/detail/semantest-chatgpt)
            - [Claude Extension](https://chrome.google.com/webstore/detail/semantest-claude)
            - [Gemini Extension](https://chrome.google.com/webstore/detail/semantest-gemini)
```

## Security Considerations

### 1. Secret Management

```yaml
# GitHub Secrets Required
CHROME_CLIENT_ID
CHROME_CLIENT_SECRET
CHROME_REFRESH_TOKEN
FIREFOX_API_KEY
FIREFOX_API_SECRET
CHATGPT_EXTENSION_ID
CLAUDE_EXTENSION_ID
GEMINI_EXTENSION_ID
```

### 2. Code Signing

```javascript
// scripts/sign-extensions.js
const crypto = require('crypto');
const fs = require('fs');

async function signExtension(extensionPath, privateKey) {
  const content = fs.readFileSync(extensionPath);
  const signature = crypto.sign('sha256', content, privateKey);
  
  // Save signature
  fs.writeFileSync(`${extensionPath}.sig`, signature);
  
  // Verify signature
  const isValid = crypto.verify(
    'sha256',
    content,
    publicKey,
    signature
  );
  
  if (!isValid) {
    throw new Error('Signature verification failed');
  }
}
```

## Rollback Strategy

### Automated Rollback

```yaml
# .github/workflows/rollback.yml
name: Extension Rollback

on:
  workflow_dispatch:
    inputs:
      extension:
        description: 'Extension to rollback'
        required: true
        type: choice
        options:
          - chatgpt
          - claude
          - gemini
          - all
      version:
        description: 'Version to rollback to'
        required: true

jobs:
  rollback:
    runs-on: ubuntu-latest
    steps:
      - name: Rollback Extension
        run: |
          # Download previous version
          # Re-upload to store
          # Update monitoring
```

## Next Steps

1. **Infrastructure Setup** (Dana)
   - Configure Kubernetes deployments
   - Set up staging environments
   - Configure monitoring stack

2. **Pipeline Implementation** (Aria + Dana)
   - Create GitHub Actions workflows
   - Set up secret management
   - Configure deployment scripts

3. **Testing Integration** (Quinn)
   - Implement E2E test suites
   - Set up performance benchmarks
   - Create regression tests

4. **Documentation** (Sam)
   - Create deployment runbooks
   - Document rollback procedures
   - Write troubleshooting guides

---

*Ready for implementation with Dana's infrastructure excellence!*