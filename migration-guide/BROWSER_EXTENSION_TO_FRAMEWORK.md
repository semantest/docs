# Migration Guide: Browser Extension to Semantest Framework

This guide helps users transition from the ChatGPT browser extension to the full Semantest distributed testing framework.

## Overview

The Semantest project has evolved from a browser extension into a comprehensive distributed testing framework. While the browser extension focused on enhancing ChatGPT interactions, the framework provides enterprise-grade test automation across multiple domains.

## Key Differences

### Architecture Evolution

| Aspect | Browser Extension | Semantest Framework |
|--------|------------------|-------------------|
| **Purpose** | ChatGPT enhancement | Distributed test automation |
| **Architecture** | Monolithic extension | Modular, domain-driven design |
| **Communication** | Direct DOM manipulation | WebSocket protocol |
| **Scalability** | Single browser instance | Multiple distributed nodes |
| **Domains** | ChatGPT only | Any web application |
| **Deployment** | Chrome Web Store | NPM packages / Docker |

### Technology Stack

**Browser Extension:**
- Chrome Extension Manifest V3
- Content scripts
- Background service worker
- Local storage

**Semantest Framework:**
- TypeScript SDK
- WebSocket communication
- Domain-driven modules
- Distributed architecture
- CLI tools
- Real-time monitoring

## Migration Path

### Phase 1: Understanding the New Architecture

The framework follows Domain-Driven Design (DDD) principles:

```
semantest/
├── core/                 # Shared utilities
├── browser/             # Browser automation
├── cli/                 # Command-line tools
├── sdk/                 # TypeScript libraries
├── chatgpt.com/         # ChatGPT domain module
├── google.com/          # Google domain module
└── [domain].com/        # Custom domain modules
```

### Phase 2: Setting Up the Framework

1. **Install the CLI:**
   ```bash
   npm install -g @semantest/cli
   ```

2. **Initialize a project:**
   ```bash
   semantest init my-automation-project
   ```

3. **Install domain modules:**
   ```bash
   npm install @semantest/chatgpt.com @semantest/core
   ```

### Phase 3: Migrating Extension Features

#### Project Organization (Extension) → Test Suites (Framework)

**Extension approach:**
```javascript
// Browser extension - folder structure
chrome.storage.local.set({
  folders: {
    'research': ['chat1', 'chat2'],
    'development': ['chat3', 'chat4']
  }
});
```

**Framework approach:**
```typescript
import { TestSuite } from '@semantest/client';

const researchSuite = new TestSuite('Research Tests');
researchSuite.addTest({
  name: 'Literature Review',
  fn: async (ctx) => {
    // Test implementation
  }
});

const developmentSuite = new TestSuite('Development Tests');
```

#### Custom Instructions → Test Context

**Extension approach:**
```javascript
// Stored in extension settings
const customInstructions = {
  role: "You are a helpful assistant",
  context: "Focus on technical accuracy"
};
```

**Framework approach:**
```typescript
import { ChatGPTClient } from '@semantest/chatgpt.com';

const client = new ChatGPTClient({
  defaultContext: {
    role: "You are a helpful assistant",
    instructions: "Focus on technical accuracy"
  }
});
```

#### Chat Management → Conversation API

**Extension approach:**
```javascript
// Direct DOM manipulation
document.querySelector('#new-chat-button').click();
```

**Framework approach:**
```typescript
const conversation = await client.startConversation('Technical Discussion');
await client.sendPrompt('Explain quantum computing');
const response = await client.getLatestResponse();
```

#### Image Downloads → Asset Management

**Extension approach:**
```javascript
// Browser download API
chrome.downloads.download({
  url: imageUrl,
  filename: 'chatgpt-image.png'
});
```

**Framework approach:**
```typescript
const result = await client.generateImage('A futuristic city');
await client.downloadAsset(result.imageUrl, {
  path: './assets/generated/',
  filename: 'futuristic-city.png'
});
```

### Phase 4: Leveraging New Capabilities

The framework offers capabilities beyond the extension:

#### 1. Distributed Test Execution

```typescript
// Run tests across multiple browsers
const runner = new TestRunner(client);
await runner.execute(testSuite, {
  browsers: ['chrome', 'firefox', 'safari'],
  parallel: true,
  maxConcurrency: 5
});
```

#### 2. Real-time Monitoring

```bash
# Monitor test execution in real-time
semantest monitor --dashboard
```

#### 3. WebSocket Events

```typescript
client.on('test:progress', (data) => {
  console.log(`Progress: ${data.progress}%`);
});

client.on('browser:console', (data) => {
  console.log(`Browser log: ${data.message}`);
});
```

#### 4. Cross-Domain Automation

```typescript
// Combine multiple domains in workflows
const googleClient = new GoogleClient();
const chatgptClient = new ChatGPTClient();

// Search and analyze
const searchResults = await googleClient.search('AI trends 2025');
const analysis = await chatgptClient.analyzeContent(searchResults);
```

## Feature Mapping

### Browser Extension Features → Framework Equivalents

| Extension Feature | Framework Equivalent | Enhancement |
|------------------|---------------------|-------------|
| Folder Organization | Test Suites | Hierarchical organization |
| Custom Instructions | Test Context | Programmable contexts |
| Quick Actions | CLI Commands | Scriptable automation |
| Chat Export | Conversation API | Multiple export formats |
| Privacy Settings | Server Configuration | Enterprise security |
| Local Storage | Distributed Storage | Scalable persistence |

## Code Examples

### Example 1: Simple ChatGPT Automation

**Extension (content script):**
```javascript
// Click new chat button
document.querySelector('[data-testid="new-chat"]').click();

// Type message
const textarea = document.querySelector('textarea');
textarea.value = "Hello, ChatGPT!";
textarea.dispatchEvent(new Event('input', { bubbles: true }));

// Submit
document.querySelector('[data-testid="send-button"]').click();
```

**Framework:**
```typescript
import { ChatGPTClient } from '@semantest/chatgpt.com';

async function automateChat() {
  const client = new ChatGPTClient();
  await client.initialize();
  
  const conversation = await client.startConversation();
  const response = await client.sendPrompt("Hello, ChatGPT!");
  
  console.log('Response:', response);
  await client.cleanup();
}
```

### Example 2: Batch Operations

**Extension (limited to sequential):**
```javascript
const prompts = ['Question 1', 'Question 2', 'Question 3'];
for (const prompt of prompts) {
  // Manual sequential execution
  await sendPrompt(prompt);
  await waitForResponse();
}
```

**Framework (parallel execution):**
```typescript
const tests = prompts.map(prompt => ({
  name: `Test: ${prompt}`,
  fn: async (ctx) => {
    const response = await ctx.client.sendPrompt(prompt);
    ctx.log(`Response received: ${response.substring(0, 50)}...`);
  }
}));

// Execute in parallel
const results = await runner.execute(tests, {
  parallel: true,
  maxConcurrency: 3
});
```

### Example 3: Advanced Monitoring

**Extension (basic logging):**
```javascript
console.log('Action completed');
```

**Framework (comprehensive monitoring):**
```typescript
// Real-time event monitoring
client.on('test:started', ({ testId, name }) => {
  console.log(`Test started: ${name}`);
});

client.on('test:progress', ({ progress, message }) => {
  console.log(`Progress: ${progress}% - ${message}`);
});

client.on('browser:screenshot', ({ data }) => {
  // Save screenshot for debugging
  fs.writeFileSync(`screenshot-${Date.now()}.png`, data, 'base64');
});

// Performance metrics
client.on('metrics:collected', ({ metrics }) => {
  console.log('Performance:', metrics);
});
```

## Migration Checklist

- [ ] **Install Semantest CLI** - `npm install -g @semantest/cli`
- [ ] **Create project structure** - `semantest init`
- [ ] **Install required packages** - Domain modules and SDK
- [ ] **Convert folder structure** - To test suites
- [ ] **Migrate custom instructions** - To test contexts
- [ ] **Update automation scripts** - Use framework APIs
- [ ] **Implement error handling** - Use framework error types
- [ ] **Add monitoring** - WebSocket event listeners
- [ ] **Test in development** - Use `semantest test run`
- [ ] **Deploy to production** - Configure server settings

## Common Pitfalls and Solutions

### 1. Direct DOM Manipulation

**Problem:** Extension uses direct DOM selectors
**Solution:** Use semantic methods provided by domain modules

```typescript
// Bad: Direct selector
await page.click('#some-generated-id-12345');

// Good: Semantic action
await client.clickButton('Submit');
```

### 2. Synchronous Storage

**Problem:** Extension uses synchronous Chrome storage
**Solution:** Use async framework storage

```typescript
// Extension
const data = chrome.storage.local.get('settings');

// Framework
const data = await client.storage.get('settings');
```

### 3. Single Browser Instance

**Problem:** Extension limited to current browser
**Solution:** Leverage distributed execution

```typescript
// Run on multiple browsers simultaneously
const results = await runner.execute(tests, {
  browsers: ['chrome', 'firefox', 'webkit'],
  parallel: true
});
```

## Getting Help

### Documentation Resources

- **API Reference**: `/docs/api-reference/`
- **CLI Guide**: `/docs/api-reference/cli/`
- **SDK Documentation**: `/docs/api-reference/sdk/`
- **WebSocket Protocol**: `/docs/api-reference/websocket-protocol/`

### Community Support

- GitHub Issues: Report bugs and request features
- Discord Community: Real-time help and discussions
- Stack Overflow: Tagged questions with `semantest`

### Professional Support

- Enterprise Support: Available for production deployments
- Training: Workshops and certification programs
- Consulting: Architecture and migration assistance

## Next Steps

1. **Start Small**: Migrate a single automation workflow
2. **Learn the SDK**: Explore the TypeScript client library
3. **Experiment**: Try distributed execution features
4. **Optimize**: Use monitoring to improve performance
5. **Scale**: Expand to multiple domains and workflows

## Conclusion

The migration from browser extension to the Semantest framework opens up new possibilities for automation at scale. While the extension served well for ChatGPT enhancement, the framework provides the foundation for enterprise-grade test automation across any web application.

Take advantage of:
- **Distributed execution** for faster testing
- **Real-time monitoring** for better insights
- **Domain modules** for semantic automation
- **WebSocket protocol** for event-driven workflows
- **CLI tools** for automation and CI/CD integration

Welcome to the future of web automation with Semantest!