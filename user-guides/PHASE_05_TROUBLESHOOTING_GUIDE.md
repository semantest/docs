# Phase 05 Features Troubleshooting Guide

## Overview

This comprehensive troubleshooting guide covers common issues, solutions, and best practices for all Phase 05 features: Marketplace, Internationalization (i18n), Performance Optimization, and Blockchain Certification.

## Table of Contents

1. [Marketplace Troubleshooting](#marketplace-troubleshooting)
2. [i18n Troubleshooting](#i18n-troubleshooting)
3. [Performance Troubleshooting](#performance-troubleshooting)
4. [Blockchain Troubleshooting](#blockchain-troubleshooting)
5. [Cross-Feature Issues](#cross-feature-issues)
6. [Emergency Procedures](#emergency-procedures)

## Marketplace Troubleshooting

### Package Installation Issues

#### Issue: Package installation fails with dependency conflicts

**Symptoms**:
```bash
npm ERR! peer dep missing: @semantest/core@^2.0.0
npm ERR! conflicting versions found
```

**Diagnosis**:
```bash
# Check dependency tree
npm ls --depth=0

# Check for peer dependency issues
npm ls --depth=1 | grep "UNMET DEPENDENCY"

# Verify package compatibility
semantest-marketplace compatibility-check @vendor/package
```

**Solutions**:

1. **Automatic Resolution**:
```bash
# Auto-resolve conflicts
semantest-marketplace resolve-deps --auto

# Force clean install
rm -rf node_modules package-lock.json
npm install --force
```

2. **Manual Resolution**:
```bash
# Install specific compatible versions
npm install @semantest/core@^2.1.0 @vendor/package@^1.2.0

# Override peer dependencies (use with caution)
npm install --legacy-peer-deps
```

3. **Alternative Package Selection**:
```bash
# Find alternative packages
semantest-marketplace search "similar functionality"

# Check package reviews and compatibility
semantest-marketplace info @alternative/package --detailed
```

#### Issue: Package not found or access denied

**Symptoms**:
```bash
404 Package not found: @vendor/private-package
403 Access denied: insufficient permissions
```

**Solutions**:

1. **Authentication Issues**:
```bash
# Re-authenticate
semantest-marketplace logout
semantest-marketplace login

# Check token validity
semantest-marketplace whoami

# Verify organization access
semantest-marketplace orgs
```

2. **Package Availability**:
```bash
# Search for similar packages
semantest-marketplace search "package-name"

# Check package status
semantest-marketplace status @vendor/package

# Contact package maintainer
semantest-marketplace contact @vendor/package
```

### Publishing Issues

#### Issue: Package upload fails or times out

**Symptoms**:
```bash
Upload timeout after 60 seconds
Package size exceeds limit (50MB)
Validation failed: missing required fields
```

**Solutions**:

1. **Size Optimization**:
```bash
# Analyze package size
semantest-marketplace analyze-size

# Exclude unnecessary files
echo "tests/\n*.test.js\ndocs/" >> .npmignore

# Compress artifacts
tar -czf package.tar.gz --exclude='node_modules' .
```

2. **Upload Optimization**:
```bash
# Increase timeout
semantest-marketplace publish --timeout 300000

# Upload with compression
semantest-marketplace publish --compress

# Resume interrupted upload
semantest-marketplace publish --resume
```

3. **Validation Fixes**:
```bash
# Validate manifest
semantest-marketplace validate --fix

# Generate missing fields
semantest-marketplace generate-manifest --interactive

# Check required documentation
semantest-marketplace check-docs
```

### Runtime Issues

#### Issue: Package fails to load or initialize

**Symptoms**:
- Package shows as installed but doesn't load
- Runtime errors during package initialization
- Missing configuration or permissions

**Diagnosis**:
```javascript
// Enable debug logging
process.env.DEBUG = 'semantest:marketplace';

// Check package status
const status = await marketplace.getPackageStatus('@vendor/package');
console.log('Package status:', status);

// Verify configuration
const config = await marketplace.getPackageConfig('@vendor/package');
console.log('Package config:', config);
```

**Solutions**:

1. **Configuration Issues**:
```javascript
// Update package configuration
await marketplace.updatePackageConfig('@vendor/package', {
  enabled: true,
  permissions: ['dom-manipulation', 'network-requests'],
  config: {
    apiKey: process.env.VENDOR_API_KEY,
    timeout: 30000
  }
});
```

2. **Permission Issues**:
```javascript
// Grant required permissions
await marketplace.grantPermissions('@vendor/package', [
  'file-system-read',
  'browser-automation'
]);

// Check permission conflicts
const conflicts = await marketplace.checkPermissionConflicts();
```

## i18n Troubleshooting

### Translation Loading Issues

#### Issue: Translations not loading or displaying

**Symptoms**:
- Keys showing instead of translated text
- Missing translations for specific locales
- Translation files not found

**Diagnosis**:
```javascript
// Check translation loading
import { i18n } from '@semantest/i18n';

console.log('Current locale:', i18n.getLocale());
console.log('Available locales:', i18n.getAvailableLocales());
console.log('Loaded namespaces:', i18n.getLoadedNamespaces());

// Test specific key
const exists = i18n.exists('common.buttons.save');
console.log('Key exists:', exists);
```

**Solutions**:

1. **File Path Issues**:
```javascript
// Verify translation file paths
const i18nConfig = {
  translationDir: './public/locales', // Ensure correct path
  loadPath: '/locales/{{lng}}/{{ns}}.json',
  
  // Add fallback paths
  fallbackLoadPaths: [
    '/locales/{{lng}}.json',
    '/locales/default/{{ns}}.json'
  ]
};
```

2. **Missing Translations**:
```bash
# Generate missing translations
npx semantest-i18n missing --locale es-ES

# Auto-translate missing keys
npx semantest-i18n auto-translate --locale es-ES --service google

# Copy from fallback locale
npx semantest-i18n copy-from --source en-US --target es-ES
```

3. **Loading Optimization**:
```javascript
// Preload critical translations
const criticalKeys = ['common.buttons', 'navigation', 'errors'];
await i18n.preload(criticalKeys);

// Enable caching
const i18nConfig = {
  caching: {
    enabled: true,
    storage: 'localStorage',
    ttl: 24 * 60 * 60 * 1000 // 24 hours
  }
};
```

### Formatting Issues

#### Issue: Date, number, or currency formatting incorrect

**Symptoms**:
- Dates showing in wrong format for locale
- Numbers not respecting locale conventions
- Currency symbols missing or incorrect

**Solutions**:

1. **Locale Configuration**:
```javascript
// Ensure proper locale setup
import { setLocale, formatDate, formatCurrency } from '@semantest/i18n';

// Set locale with region
await setLocale('de-DE');

// Verify formatting
console.log(formatDate(new Date(), 'de-DE')); // Should show DD.MM.YYYY
console.log(formatCurrency(99.99, 'EUR', 'de-DE')); // Should show 99,99 €
```

2. **Custom Formatters**:
```javascript
// Override default formatters
const customFormatters = {
  date: new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }),
  currency: new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  })
};

i18n.addFormatters(customFormatters);
```

### RTL Layout Issues

#### Issue: Right-to-left (RTL) layouts not working correctly

**Symptoms**:
- Text alignment issues in Arabic/Hebrew
- Icons and images not flipping correctly
- Layout breaks in RTL mode

**Solutions**:

1. **CSS Fixes**:
```css
/* Use logical properties */
.container {
  margin-inline-start: 20px; /* Instead of margin-left */
  padding-inline: 16px;      /* Instead of padding-left/right */
  border-inline-start: 1px solid #ccc; /* Instead of border-left */
}

/* RTL-specific overrides */
html[dir="rtl"] .icon {
  transform: scaleX(-1); /* Flip icons */
}

html[dir="rtl"] .arrow-right::before {
  content: "←"; /* Change arrow direction */
}
```

2. **JavaScript RTL Handling**:
```javascript
import { isRTL, getDirection } from '@semantest/i18n';

function Layout({ children }) {
  const { locale } = useI18n();
  const direction = getDirection(locale);
  
  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = locale;
  }, [locale, direction]);
  
  return (
    <div className={`layout layout--${direction}`}>
      {children}
    </div>
  );
}
```

## Performance Troubleshooting

### Monitoring Setup Issues

#### Issue: Performance metrics not collecting

**Symptoms**:
- Dashboard showing no data
- Metrics collection errors
- Missing performance insights

**Diagnosis**:
```javascript
// Check monitoring status
import { PerformanceMonitor } from '@semantest/performance';

const monitor = new PerformanceMonitor({
  debug: true // Enable debug logging
});

// Verify monitoring is active
console.log('Monitor active:', monitor.isActive());
console.log('Collected metrics:', await monitor.getMetrics());

// Check browser support
if (!('PerformanceObserver' in window)) {
  console.warn('PerformanceObserver not supported');
}
```

**Solutions**:

1. **Configuration Fix**:
```javascript
const monitorConfig = {
  // Ensure monitoring is enabled
  monitoring: {
    webVitals: true,
    nodeMetrics: true,
    customMetrics: true
  },
  
  // Fix collection intervals
  collection: {
    interval: 5000, // 5 seconds
    batchSize: 50,
    maxRetries: 3
  },
  
  // Verify endpoint
  reporting: {
    endpoint: '/api/metrics',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.METRICS_TOKEN}`
    }
  }
};
```

2. **Browser Compatibility**:
```javascript
// Polyfill for older browsers
if (!('PerformanceObserver' in window)) {
  await import('web-vitals/polyfill');
}

// Feature detection
const features = {
  performanceObserver: 'PerformanceObserver' in window,
  performanceMark: 'mark' in performance,
  performanceMeasure: 'measure' in performance
};

console.log('Browser support:', features);
```

### Cache Performance Issues

#### Issue: Cache not working or low hit rate

**Symptoms**:
- Cache hit rate below 50%
- Slow response times despite caching
- Cache misses for frequently accessed data

**Diagnosis**:
```javascript
// Analyze cache performance
const cacheStats = await cacheManager.getStats();
console.log({
  hitRate: cacheStats.hitRate,
  missRate: cacheStats.missRate,
  keyCount: cacheStats.keyCount,
  memoryUsage: cacheStats.memoryUsage
});

// Check cache configuration
const config = cacheManager.getConfig();
console.log('Cache config:', config);

// Monitor cache operations
cacheManager.on('hit', (key) => console.log('Cache hit:', key));
cacheManager.on('miss', (key) => console.log('Cache miss:', key));
```

**Solutions**:

1. **Cache Strategy Optimization**:
```javascript
// Optimize cache rules
const optimizedConfig = {
  strategies: {
    memory: {
      enabled: true,
      maxSize: 200 * 1024 * 1024, // Increase to 200MB
      ttl: 600000 // 10 minutes
    },
    redis: {
      enabled: true,
      ttl: 3600000, // 1 hour
      compression: true // Enable compression
    }
  },
  
  // Improve selection rules
  rules: [
    { size: '<10KB', frequency: 'high', strategy: 'memory' },
    { size: '<1MB', frequency: 'medium', strategy: 'redis' },
    { frequency: 'low', strategy: 'file' }
  ]
};
```

2. **Cache Warming**:
```javascript
// Implement cache warming
async function warmCache() {
  const popularKeys = await getPopularKeys();
  
  for (const key of popularKeys) {
    try {
      const data = await fetchData(key);
      await cacheManager.set(key, data, { 
        ttl: 3600000,
        tags: ['popular', 'warmed']
      });
    } catch (error) {
      console.warn(`Failed to warm cache for ${key}:`, error);
    }
  }
}

// Schedule regular warming
setInterval(warmCache, 6 * 60 * 60 * 1000); // Every 6 hours
```

### Memory and CPU Issues

#### Issue: High memory usage or CPU consumption

**Symptoms**:
- Memory leaks causing application crashes
- High CPU usage affecting performance
- Slow garbage collection

**Diagnosis**:
```javascript
// Monitor memory usage
const memoryUsage = process.memoryUsage();
console.log({
  heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
  heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
  rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB'
});

// CPU profiling
const v8Profiler = require('v8-profiler-next');
v8Profiler.startProfiling('CPU Profile');
// ... run problematic code ...
const profile = v8Profiler.stopProfiling('CPU Profile');
```

**Solutions**:

1. **Memory Optimization**:
```javascript
// Implement object pooling
class ObjectPool {
  constructor(createFn, resetFn, maxSize = 100) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.pool = [];
    this.maxSize = maxSize;
  }
  
  acquire() {
    return this.pool.length > 0 ? 
      this.pool.pop() : 
      this.createFn();
  }
  
  release(obj) {
    if (this.pool.length < this.maxSize) {
      this.resetFn(obj);
      this.pool.push(obj);
    }
  }
}

// Use WeakMap for caching
const cache = new WeakMap();
function getData(object) {
  if (cache.has(object)) {
    return cache.get(object);
  }
  const data = expensiveComputation(object);
  cache.set(object, data);
  return data;
}
```

2. **CPU Optimization**:
```javascript
// Use worker threads for CPU-intensive tasks
const { Worker, isMainThread, parentPort } = require('worker_threads');

if (isMainThread) {
  function heavyComputation(data) {
    return new Promise((resolve, reject) => {
      const worker = new Worker(__filename);
      worker.postMessage(data);
      worker.on('message', resolve);
      worker.on('error', reject);
    });
  }
} else {
  parentPort.on('message', (data) => {
    const result = performComputation(data);
    parentPort.postMessage(result);
  });
}
```

## Blockchain Troubleshooting

### Transaction Issues

#### Issue: Transactions failing or taking too long

**Symptoms**:
- Transaction reverted with unknown error
- Transaction stuck in pending state
- High gas costs making operations uneconomical

**Diagnosis**:
```javascript
// Check transaction status
const receipt = await web3.eth.getTransactionReceipt(txHash);
console.log('Status:', receipt ? receipt.status : 'Pending');

// Get revert reason
if (receipt && receipt.status === false) {
  const revertReason = await getRevertReason(txHash);
  console.log('Revert reason:', revertReason);
}

// Check gas price and network congestion
const gasPrice = await web3.eth.getGasPrice();
const blockNumber = await web3.eth.getBlockNumber();
console.log(`Gas price: ${gasPrice}, Block: ${blockNumber}`);
```

**Solutions**:

1. **Gas Optimization**:
```javascript
// Dynamic gas pricing
async function getOptimalGasPrice() {
  try {
    const gasStation = await fetch('https://gasstation-mainnet.matic.network/');
    const data = await gasStation.json();
    return web3.utils.toWei(data.fast.toString(), 'gwei');
  } catch (error) {
    // Fallback to network gas price
    return await web3.eth.getGasPrice();
  }
}

// Transaction retry with exponential backoff
async function sendTransactionWithRetry(transaction, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const gasPrice = await getOptimalGasPrice();
      const gasLimit = await web3.eth.estimateGas(transaction);
      
      return await web3.eth.sendTransaction({
        ...transaction,
        gasPrice: gasPrice,
        gasLimit: Math.floor(gasLimit * 1.2) // 20% buffer
      });
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await delay(2000 * Math.pow(2, i)); // Exponential backoff
    }
  }
}
```

2. **Network Switching**:
```javascript
// Automatic network fallback
const networkFallback = ['polygon', 'arbitrum', 'ethereum'];

async function certifyWithFallback(testData) {
  for (const network of networkFallback) {
    try {
      const certifier = new BlockchainCertifier({ network });
      return await certifier.certifyTest(testData);
    } catch (error) {
      console.warn(`Certification failed on ${network}:`, error.message);
      if (network === 'ethereum') throw error; // Last resort failed
    }
  }
}
```

### IPFS Connectivity Issues

#### Issue: IPFS uploads failing or slow

**Symptoms**:
- Upload timeouts
- Gateway not responding
- Pinning service errors

**Solutions**:

1. **Multiple Gateway Strategy**:
```javascript
const ipfsGateways = [
  'https://ipfs.infura.io:5001',
  'https://ipfs.fleek.co',
  'https://gateway.pinata.cloud',
  'https://dweb.link'
];

async function uploadWithFailover(data) {
  const errors = [];
  
  for (const gateway of ipfsGateways) {
    try {
      const result = await uploadToGateway(data, gateway);
      console.log(`Upload successful via ${gateway}`);
      return result;
    } catch (error) {
      errors.push({ gateway, error: error.message });
      console.warn(`Upload failed for ${gateway}:`, error.message);
    }
  }
  
  throw new Error(`All IPFS gateways failed: ${JSON.stringify(errors)}`);
}
```

2. **Upload Optimization**:
```javascript
// Compress large data before upload
function compressForIPFS(data) {
  const compressed = {
    metadata: data.metadata, // Keep essential data uncompressed
    results: data.results,
    artifacts: data.artifacts ? 
      LZString.compressToBase64(JSON.stringify(data.artifacts)) : 
      null
  };
  return compressed;
}

// Chunked upload for large files
async function chunkedUpload(largeData, chunkSize = 1024 * 1024) {
  const chunks = [];
  const totalSize = JSON.stringify(largeData).length;
  
  for (let i = 0; i < totalSize; i += chunkSize) {
    const chunk = JSON.stringify(largeData).slice(i, i + chunkSize);
    const chunkHash = await uploadChunk(chunk);
    chunks.push(chunkHash);
  }
  
  // Upload manifest with chunk references
  const manifest = {
    chunks: chunks,
    totalSize: totalSize,
    chunkSize: chunkSize
  };
  
  return await uploadToIPFS(manifest);
}
```

## Cross-Feature Issues

### Integration Problems

#### Issue: Features not working together properly

**Common Integration Issues**:

1. **Marketplace + i18n**: Package translations not loading
```javascript
// Ensure package includes i18n resources
const packageI18n = await marketplace.getPackageI18n('@vendor/package');
await i18n.addResourceBundle('en', 'vendor-package', packageI18n.en);
```

2. **Performance + Blockchain**: High latency affecting certification
```javascript
// Implement async certification
async function optimizedCertification(testData) {
  // Start certification in background
  const certificationPromise = certifyTest(testData);
  
  // Continue with other operations
  const otherOperations = performOtherTasks();
  
  // Wait for both to complete
  const [certification, results] = await Promise.all([
    certificationPromise,
    otherOperations
  ]);
  
  return { certification, results };
}
```

3. **i18n + Performance**: Translation loading affecting performance
```javascript
// Lazy load translations
const i18nConfig = {
  lazyLoading: true,
  preload: ['en'], // Only preload default language
  loadPath: '/locales/{{lng}}/{{ns}}.json',
  
  // Cache translated content
  caching: {
    enabled: true,
    versions: { en: '1.0', es: '1.0' }
  }
};
```

### Configuration Conflicts

#### Issue: Feature configurations conflicting

**Detection**:
```javascript
// Configuration validation
function validateConfigurations() {
  const configs = {
    marketplace: require('./semantest.marketplace.config.js'),
    i18n: require('./semantest.i18n.config.js'),
    performance: require('./semantest.performance.config.js'),
    blockchain: require('./semantest.blockchain.config.js')
  };
  
  // Check for conflicts
  const conflicts = [];
  
  // Port conflicts
  const ports = [
    configs.marketplace.port,
    configs.performance.dashboardPort,
    configs.blockchain.localNodePort
  ].filter(Boolean);
  
  if (new Set(ports).size !== ports.length) {
    conflicts.push('Port conflicts detected');
  }
  
  // Resource conflicts
  if (configs.performance.caching.redis && 
      configs.marketplace.caching.redis &&
      configs.performance.caching.redis.host === configs.marketplace.caching.redis.host) {
    conflicts.push('Redis instance shared - ensure database separation');
  }
  
  return conflicts;
}
```

**Resolution**:
```javascript
// Unified configuration management
const unifiedConfig = {
  // Shared settings
  shared: {
    redis: {
      host: 'localhost',
      port: 6379,
      databases: {
        marketplace: 0,
        performance: 1,
        i18n: 2,
        blockchain: 3
      }
    }
  },
  
  // Feature-specific ports
  ports: {
    marketplace: 3001,
    performance: 3002,
    blockchain: 3003
  }
};
```

## Emergency Procedures

### Critical Issues Response

#### Complete System Failure

1. **Immediate Assessment**:
```bash
# Check system status
semantest status --all

# Check logs for errors
tail -f /var/log/semantest/*.log

# Verify network connectivity
ping api.semantest.com
```

2. **Emergency Rollback**:
```bash
# Rollback to last known good state
semantest rollback --to-tag stable-v2.0.0

# Disable problematic features
semantest disable --feature blockchain,marketplace

# Switch to safe mode
semantest start --safe-mode
```

3. **Data Recovery**:
```bash
# Restore from backup
semantest restore --backup latest --verify

# Check data integrity
semantest verify --all --repair

# Re-sync with external services
semantest sync --force
```

#### Performance Degradation

1. **Quick Mitigation**:
```javascript
// Enable emergency mode
process.env.SEMANTEST_EMERGENCY_MODE = 'true';

// Disable non-critical features
const emergencyConfig = {
  marketplace: { enabled: false },
  blockchain: { enabled: false },
  performance: { monitoring: 'minimal' },
  i18n: { locales: ['en'] } // English only
};
```

2. **Resource Cleanup**:
```bash
# Clear caches
semantest cache clear --all

# Restart services
semantest restart --services performance,monitoring

# Optimize database
semantest db optimize --vacuum
```

### Recovery Procedures

#### Data Consistency Issues

1. **Marketplace Data**:
```javascript
// Verify package integrity
const packages = await marketplace.getAllPackages();
for (const pkg of packages) {
  const integrity = await marketplace.verifyPackageIntegrity(pkg.id);
  if (!integrity.valid) {
    console.error(`Package ${pkg.id} corrupted:`, integrity.errors);
    await marketplace.repairPackage(pkg.id);
  }
}
```

2. **Blockchain Data**:
```javascript
// Verify blockchain records
const testRecords = await blockchain.getAllTestRecords();
for (const record of testRecords) {
  const verification = await blockchain.verifyTestRecord(record.id);
  if (!verification.valid) {
    console.error(`Test record ${record.id} invalid:`, verification.errors);
    // Re-certify if possible
    await blockchain.reCertifyTest(record.id);
  }
}
```

### Support Escalation

#### When to Escalate

1. **Critical Issues**:
   - Complete system outage > 15 minutes
   - Data corruption or loss
   - Security breaches
   - Blockchain transaction failures affecting compliance

2. **Major Issues**:
   - Performance degradation > 50%
   - Feature unavailability > 2 hours
   - Integration failures affecting workflows

#### Contact Information

**Emergency Support** (24/7):
- Phone: +1-800-SEMANTEST
- Email: emergency@semantest.com
- Slack: #emergency-support

**Feature-Specific Support**:
- Marketplace: marketplace-support@semantest.com
- i18n: i18n-support@semantest.com  
- Performance: performance-support@semantest.com
- Blockchain: blockchain-support@semantest.com

**Community Resources**:
- Forum: https://community.semantest.com
- GitHub Issues: https://github.com/semantest/semantest/issues
- Documentation: https://docs.semantest.com

---

**Last Updated**: January 18, 2025  
**Version**: 1.0.0  
**Maintainer**: Semantest Support Team