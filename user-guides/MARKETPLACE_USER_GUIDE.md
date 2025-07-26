# Semantest Marketplace User Guide

## Overview

The Semantest Marketplace is a comprehensive ecosystem for discovering, publishing, and managing extensions, plugins, and integrations for the Semantest platform. This guide covers everything you need to know to effectively use the marketplace as both a consumer and publisher.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Browsing and Installing Packages](#browsing-and-installing-packages)
3. [Publishing Your Own Packages](#publishing-your-own-packages)
4. [Package Management](#package-management)
5. [API Reference](#api-reference)
6. [Troubleshooting](#troubleshooting)

## Getting Started

### Prerequisites

- Semantest platform installed (v2.0.0 or higher)
- Node.js 18+ and npm 8+
- Valid Semantest account

### Initial Setup

1. **Install the Marketplace CLI**:
```bash
npm install -g @semantest/marketplace-cli
```

2. **Authenticate with your account**:
```bash
semantest-marketplace login
```

3. **Verify installation**:
```bash
semantest-marketplace --version
```

### Account Configuration

Create your marketplace profile:

```bash
semantest-marketplace profile setup
```

This will prompt you for:
- Display name
- Organization (optional)
- Contact email
- Developer bio
- Payment preferences (for revenue sharing)

## Browsing and Installing Packages

### Web Interface

Access the marketplace at `https://marketplace.semantest.com`

**Key Features**:
- **Category Browsing**: Filter by package type (plugins, themes, templates, AI models)
- **Search**: Full-text search with filters
- **Reviews**: Community ratings and feedback
- **Compatibility**: Version compatibility checking
- **Trending**: Popular and recently updated packages

### CLI Browsing

Search for packages from the command line:

```bash
# Search for packages
semantest-marketplace search "image processing"

# Browse by category
semantest-marketplace browse --category plugins

# List trending packages
semantest-marketplace trending

# Show package details
semantest-marketplace info @vendor/package-name
```

### Installing Packages

#### Via CLI

```bash
# Install a package
semantest-marketplace install @vendor/package-name

# Install specific version
semantest-marketplace install @vendor/package-name@1.2.0

# Install with dependencies
semantest-marketplace install @vendor/package-name --include-deps

# Install globally
semantest-marketplace install @vendor/package-name --global
```

#### Via Web Interface

1. Navigate to the package page
2. Click "Install" button
3. Choose installation method:
   - **Direct Install**: Automatic installation
   - **CLI Command**: Copy command for manual installation
   - **Download**: Download package for manual installation

#### Via API

```typescript
import { MarketplaceClient } from '@semantest/marketplace-client';

const client = new MarketplaceClient({
  apiKey: 'your-api-key',
  endpoint: 'https://api.marketplace.semantest.com'
});

// Install package
await client.packages.install({
  name: '@vendor/package-name',
  version: '1.2.0',
  target: 'local' // or 'global'
});
```

### Package Configuration

After installation, configure packages in your `semantest.config.js`:

```javascript
module.exports = {
  marketplace: {
    packages: {
      '@vendor/image-processor': {
        enabled: true,
        config: {
          quality: 'high',
          format: 'webp'
        }
      },
      '@vendor/ai-analyzer': {
        enabled: true,
        config: {
          model: 'gpt-4',
          apiKey: process.env.OPENAI_API_KEY
        }
      }
    }
  }
};
```

## Publishing Your Own Packages

### Package Structure

Create a standard package structure:

```
my-semantest-package/
├── package.json
├── semantest.manifest.json
├── src/
│   ├── index.ts
│   ├── components/
│   └── services/
├── docs/
│   ├── README.md
│   └── USAGE.md
├── tests/
└── examples/
```

### Package Manifest

Create `semantest.manifest.json`:

```json
{
  "name": "@your-org/your-package",
  "version": "1.0.0",
  "type": "plugin",
  "category": "automation",
  "semantestVersion": "^2.0.0",
  "entry": "dist/index.js",
  "description": "Brief description of your package",
  "keywords": ["automation", "testing", "ai"],
  "author": {
    "name": "Your Name",
    "email": "your.email@example.com"
  },
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-org/your-package"
  },
  "capabilities": {
    "browserAutomation": true,
    "aiIntegration": false,
    "dataProcessing": true
  },
  "permissions": [
    "dom-manipulation",
    "network-requests",
    "file-system-read"
  ],
  "configuration": {
    "schema": "./config-schema.json",
    "defaults": "./config-defaults.json"
  }
}
```

### Package Development

#### Basic Plugin Structure

```typescript
// src/index.ts
import { Plugin, PluginContext } from '@semantest/core';

export class MyPlugin extends Plugin {
  constructor(private config: MyPluginConfig) {
    super();
  }

  async initialize(context: PluginContext): Promise<void> {
    // Plugin initialization logic
    console.log('MyPlugin initialized');
  }

  async execute(input: any): Promise<any> {
    // Main plugin logic
    return this.processInput(input);
  }

  private processInput(input: any): any {
    // Implementation details
    return {
      processed: true,
      result: input,
      timestamp: new Date()
    };
  }
}

export interface MyPluginConfig {
  enabled: boolean;
  timeout: number;
  retries: number;
}
```

#### Configuration Schema

Create `config-schema.json`:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "enabled": {
      "type": "boolean",
      "default": true,
      "description": "Enable/disable the plugin"
    },
    "timeout": {
      "type": "number",
      "minimum": 1000,
      "maximum": 30000,
      "default": 5000,
      "description": "Timeout in milliseconds"
    },
    "retries": {
      "type": "number",
      "minimum": 0,
      "maximum": 10,
      "default": 3,
      "description": "Number of retry attempts"
    }
  },
  "required": ["enabled"]
}
```

### Publishing Workflow

#### 1. Prepare for Publishing

```bash
# Build your package
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Generate documentation
npm run docs
```

#### 2. Package Validation

```bash
# Validate package structure
semantest-marketplace validate

# Check compatibility
semantest-marketplace compatibility-check

# Security scan
semantest-marketplace security-scan
```

#### 3. Publish to Marketplace

```bash
# Publish package
semantest-marketplace publish

# Publish with specific tag
semantest-marketplace publish --tag beta

# Publish dry run
semantest-marketplace publish --dry-run
```

#### 4. Post-Publishing

```bash
# Update package information
semantest-marketplace update-info

# Add screenshots/media
semantest-marketplace add-media ./screenshots/

# Set up automated publishing
semantest-marketplace setup-ci
```

## Package Management

### Version Management

```bash
# List installed packages
semantest-marketplace list

# Update package
semantest-marketplace update @vendor/package-name

# Update all packages
semantest-marketplace update-all

# Downgrade package
semantest-marketplace install @vendor/package-name@1.0.0 --force
```

### Dependency Management

```bash
# Show package dependencies
semantest-marketplace deps @vendor/package-name

# Check for dependency conflicts
semantest-marketplace check-conflicts

# Resolve dependency issues
semantest-marketplace resolve-deps
```

### License Management

```bash
# View package licenses
semantest-marketplace licenses

# Check license compatibility
semantest-marketplace license-check

# Export license report
semantest-marketplace license-report --format json
```

## API Reference

### MarketplaceClient

#### Constructor

```typescript
new MarketplaceClient(options: MarketplaceClientOptions)
```

**Options**:
```typescript
interface MarketplaceClientOptions {
  apiKey: string;
  endpoint?: string;
  timeout?: number;
  retries?: number;
}
```

#### Methods

##### packages.search()

```typescript
async search(query: SearchQuery): Promise<PackageSearchResult[]>
```

**Parameters**:
```typescript
interface SearchQuery {
  q: string;
  category?: string;
  tags?: string[];
  author?: string;
  license?: string;
  limit?: number;
  offset?: number;
}
```

**Example**:
```typescript
const results = await client.packages.search({
  q: 'image processing',
  category: 'plugins',
  limit: 20
});
```

##### packages.install()

```typescript
async install(options: InstallOptions): Promise<InstallResult>
```

**Parameters**:
```typescript
interface InstallOptions {
  name: string;
  version?: string;
  target?: 'local' | 'global';
  force?: boolean;
}
```

##### packages.publish()

```typescript
async publish(packagePath: string, options?: PublishOptions): Promise<PublishResult>
```

**Parameters**:
```typescript
interface PublishOptions {
  tag?: string;
  access?: 'public' | 'private';
  dryRun?: boolean;
}
```

### REST API Endpoints

#### Authentication

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "your-username",
  "password": "your-password"
}
```

#### Package Operations

##### Search Packages

```http
GET /api/v1/packages/search?q=image&category=plugins&limit=20
Authorization: Bearer your-jwt-token
```

##### Get Package Details

```http
GET /api/v1/packages/{packageName}
Authorization: Bearer your-jwt-token
```

##### Install Package

```http
POST /api/v1/packages/{packageName}/install
Authorization: Bearer your-jwt-token
Content-Type: application/json

{
  "version": "1.2.0",
  "target": "local"
}
```

##### Publish Package

```http
POST /api/v1/packages
Authorization: Bearer your-jwt-token
Content-Type: multipart/form-data

package: (binary data)
manifest: (JSON)
```

## Troubleshooting

### Common Issues

#### Installation Problems

**Issue**: Package installation fails with dependency conflicts

**Solution**:
```bash
# Check for conflicts
semantest-marketplace check-conflicts

# Resolve automatically
semantest-marketplace resolve-deps --auto

# Manual resolution
semantest-marketplace install @vendor/package@version --force
```

**Issue**: Permission denied during installation

**Solution**:
```bash
# Install with elevated permissions
sudo semantest-marketplace install @vendor/package

# Or install to user directory
semantest-marketplace install @vendor/package --user
```

#### Publishing Problems

**Issue**: Package validation fails

**Solution**:
1. Check manifest file format:
```bash
semantest-marketplace validate --verbose
```

2. Verify required fields:
```bash
semantest-marketplace check-manifest
```

3. Fix common issues:
```bash
semantest-marketplace fix-manifest
```

**Issue**: Upload timeout

**Solution**:
```bash
# Increase timeout
semantest-marketplace publish --timeout 300000

# Upload with compression
semantest-marketplace publish --compress
```

#### Runtime Issues

**Issue**: Package not loading properly

**Solution**:
1. Check configuration:
```javascript
// semantest.config.js
module.exports = {
  debug: true,
  marketplace: {
    packages: {
      '@vendor/package': {
        enabled: true,
        logLevel: 'debug'
      }
    }
  }
};
```

2. Enable debug logging:
```bash
DEBUG=semantest:marketplace semantest run
```

3. Verify compatibility:
```bash
semantest-marketplace compatibility-check @vendor/package
```

### Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| MP001 | Invalid package manifest | Check manifest syntax and required fields |
| MP002 | Version conflict | Update dependencies or use --force |
| MP003 | Authentication failed | Re-run `semantest-marketplace login` |
| MP004 | Package not found | Verify package name and availability |
| MP005 | Insufficient permissions | Check package permissions and user access |
| MP006 | Upload size exceeded | Reduce package size or contact support |
| MP007 | Invalid license | Use a valid SPDX license identifier |
| MP008 | Security scan failed | Address security vulnerabilities |

### Getting Help

1. **Documentation**: https://docs.semantest.com/marketplace
2. **Community Forum**: https://community.semantest.com
3. **GitHub Issues**: https://github.com/semantest/marketplace/issues
4. **Support Email**: marketplace-support@semantest.com
5. **Discord**: https://discord.gg/semantest

### Best Practices

1. **Version Management**:
   - Use semantic versioning
   - Maintain changelog
   - Test before publishing

2. **Security**:
   - Regular security scans
   - Minimal permissions
   - Secure dependencies

3. **Documentation**:
   - Clear README
   - Usage examples
   - API documentation

4. **Testing**:
   - Unit tests
   - Integration tests
   - Compatibility testing

---

**Last Updated**: January 18, 2025  
**Version**: 1.0.0  
**Maintainer**: Semantest Documentation Team