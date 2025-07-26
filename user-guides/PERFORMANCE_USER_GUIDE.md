# Semantest Performance Optimization User Guide

## Overview

Semantest provides advanced performance monitoring and optimization capabilities to ensure your applications run efficiently across all environments. This guide covers monitoring setup, optimization techniques, and best practices for achieving optimal performance.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Performance Monitoring](#performance-monitoring)
3. [Intelligent Caching](#intelligent-caching)
4. [Optimization Engine](#optimization-engine)
5. [Performance Tuning](#performance-tuning)
6. [API Reference](#api-reference)
7. [Troubleshooting](#troubleshooting)

## Getting Started

### Performance Metrics Overview

Semantest tracks comprehensive performance metrics:

**Web Performance**:
- Core Web Vitals (LCP, FID, CLS)
- First Contentful Paint (FCP)
- Time to Interactive (TTI)
- Cumulative Layout Shift (CLS)

**Node.js Performance**:
- CPU usage and event loop lag
- Memory consumption and GC patterns
- Request/response times
- Throughput metrics

**Custom Business Metrics**:
- User interaction timing
- API response times
- Database query performance
- Cache hit/miss rates

### Prerequisites

- Semantest platform v2.0.0+
- Node.js 18+ for server-side monitoring
- Modern browser for client-side metrics

### Quick Setup

1. **Install performance package**:
```bash
npm install @semantest/performance
```

2. **Initialize performance monitoring**:
```bash
npx semantest-perf init
```

3. **Basic configuration**:
```javascript
// semantest.performance.config.js
module.exports = {
  monitoring: {
    webVitals: true,
    nodeMetrics: true,
    customMetrics: true
  },
  caching: {
    strategy: 'hybrid',
    redis: {
      host: 'localhost',
      port: 6379
    }
  },
  optimization: {
    bundleAnalysis: true,
    codesplitting: true,
    compression: true
  }
};
```

## Performance Monitoring

### Web Vitals Tracking

#### Client-Side Implementation

```javascript
import { initWebVitals, reportMetric } from '@semantest/performance';

// Initialize Web Vitals tracking
initWebVitals({
  reportURL: '/api/metrics/web-vitals',
  sampleRate: 1.0, // Track 100% of page loads
  thresholds: {
    LCP: 2500,  // Largest Contentful Paint
    FID: 100,   // First Input Delay
    CLS: 0.1    // Cumulative Layout Shift
  }
});

// Custom performance marks
performance.mark('feature-start');
// ... feature code ...
performance.mark('feature-end');
performance.measure('feature-duration', 'feature-start', 'feature-end');

// Report custom metrics
reportMetric('custom-feature-time', performance.getEntriesByName('feature-duration')[0].duration);
```

#### React Integration

```jsx
import { useWebVitals, PerformanceProvider } from '@semantest/performance-react';

function App() {
  return (
    <PerformanceProvider config={{ 
      enableWebVitals: true,
      reportInterval: 30000 
    }}>
      <MyApp />
    </PerformanceProvider>
  );
}

function MyComponent() {
  const { metrics, isLoading } = useWebVitals();
  
  if (metrics.LCP > 2500) {
    console.warn('LCP threshold exceeded:', metrics.LCP);
  }
  
  return <div>Component content</div>;
}
```

### Node.js Performance Monitoring

#### Server-Side Setup

```javascript
import { NodePerformanceMonitor } from '@semantest/performance';

const monitor = new NodePerformanceMonitor({
  collectInterval: 5000, // Collect metrics every 5 seconds
  metrics: {
    cpu: true,
    memory: true,
    eventLoop: true,
    gc: true,
    http: true
  },
  thresholds: {
    cpuUsage: 80,        // Alert at 80% CPU
    memoryUsage: 85,     // Alert at 85% memory
    eventLoopLag: 100,   // Alert at 100ms lag
    responseTime: 1000   // Alert at 1s response time
  }
});

// Start monitoring
monitor.start();

// Custom metrics
monitor.recordMetric('database-query-time', queryDuration);
monitor.recordMetric('cache-hit-rate', hitRate);
```

#### Express.js Middleware

```javascript
import { performanceMiddleware } from '@semantest/performance';

app.use(performanceMiddleware({
  collectHeaders: true,
  collectBody: false,
  slowRequestThreshold: 1000,
  excludePaths: ['/health', '/metrics']
}));

// Custom timing middleware
app.use((req, res, next) => {
  const start = process.hrtime.bigint();
  
  res.on('finish', () => {
    const duration = Number(process.hrtime.bigint() - start) / 1000000;
    monitor.recordMetric('request-duration', duration, {
      method: req.method,
      route: req.route?.path,
      status: res.statusCode
    });
  });
  
  next();
});
```

### Real-Time Dashboards

#### Performance Dashboard Setup

```javascript
import { PerformanceDashboard } from '@semantest/performance-dashboard';

const dashboard = new PerformanceDashboard({
  port: 3001,
  updateInterval: 1000,
  metrics: [
    'webVitals',
    'nodeMetrics',
    'customMetrics'
  ],
  charts: {
    responseTime: { type: 'line', timeWindow: '5m' },
    cpuUsage: { type: 'gauge', threshold: 80 },
    memoryUsage: { type: 'area', timeWindow: '1h' }
  }
});

dashboard.start();
```

#### Custom Dashboard Widgets

```jsx
import { MetricWidget, ChartWidget, AlertWidget } from '@semantest/performance-dashboard';

function CustomDashboard() {
  return (
    <div className="performance-dashboard">
      <MetricWidget 
        metric="response-time"
        title="Avg Response Time"
        format="duration"
        threshold={1000}
      />
      
      <ChartWidget
        metric="memory-usage"
        type="line"
        timeWindow="1h"
        title="Memory Usage"
      />
      
      <AlertWidget
        conditions={[
          { metric: 'cpu-usage', operator: '>', value: 80 },
          { metric: 'error-rate', operator: '>', value: 5 }
        ]}
      />
    </div>
  );
}
```

### Threshold-Based Alerting

```javascript
import { AlertManager } from '@semantest/performance';

const alertManager = new AlertManager({
  rules: [
    {
      name: 'High CPU Usage',
      condition: 'cpu_usage > 80',
      duration: '5m',
      severity: 'warning',
      action: 'slack_notification'
    },
    {
      name: 'Memory Leak Detection',
      condition: 'memory_growth_rate > 10',
      duration: '10m',
      severity: 'critical',
      action: 'email_notification'
    },
    {
      name: 'Slow Response Time',
      condition: 'response_time_p95 > 2000',
      duration: '2m',
      severity: 'warning',
      action: 'log_warning'
    }
  ],
  
  notifications: {
    slack: {
      webhook: process.env.SLACK_WEBHOOK,
      channel: '#performance-alerts'
    },
    email: {
      smtp: process.env.SMTP_CONFIG,
      recipients: ['ops@company.com']
    }
  }
});

alertManager.start();
```

## Intelligent Caching

### Multi-Strategy Caching

#### Cache Configuration

```javascript
import { CacheManager } from '@semantest/performance';

const cacheManager = new CacheManager({
  strategies: {
    memory: {
      enabled: true,
      maxSize: 100 * 1024 * 1024, // 100MB
      ttl: 300000 // 5 minutes
    },
    redis: {
      enabled: true,
      host: 'localhost',
      port: 6379,
      ttl: 3600000 // 1 hour
    },
    file: {
      enabled: false,
      directory: './cache',
      ttl: 86400000 // 24 hours
    }
  },
  
  // Intelligent cache selection
  rules: [
    { size: '<1KB', strategy: 'memory' },
    { size: '<1MB', strategy: 'redis' },
    { size: '>=1MB', strategy: 'file' },
    { frequency: 'high', strategy: 'memory' },
    { frequency: 'medium', strategy: 'redis' },
    { frequency: 'low', strategy: 'file' }
  ]
});
```

#### Cache Usage Patterns

```javascript
// Basic caching
const cachedData = await cacheManager.get('user:123');
if (!cachedData) {
  const data = await fetchUserData(123);
  await cacheManager.set('user:123', data, { ttl: 300000 });
  return data;
}
return cachedData;

// Cache with tags for batch invalidation
await cacheManager.set('user:123', userData, { 
  ttl: 300000,
  tags: ['user', 'profile']
});

// Invalidate all user-related cache
await cacheManager.invalidateByTag('user');

// Cache with automatic refresh
await cacheManager.setWithRefresh('expensive-data', async () => {
  return await computeExpensiveData();
}, {
  ttl: 600000,        // 10 minutes
  refreshBuffer: 60000 // Refresh 1 minute before expiry
});
```

### Smart Eviction Policies

```javascript
const cacheConfig = {
  eviction: {
    // Least Recently Used
    lru: {
      enabled: true,
      maxEntries: 10000
    },
    
    // Least Frequently Used
    lfu: {
      enabled: true,
      trackingWindow: 3600000 // 1 hour
    },
    
    // Time-based eviction
    ttl: {
      enabled: true,
      checkInterval: 60000 // Check every minute
    },
    
    // Size-based eviction
    size: {
      enabled: true,
      maxMemory: 500 * 1024 * 1024 // 500MB
    }
  }
};
```

### Cache Warming Strategies

```javascript
import { CacheWarmer } from '@semantest/performance';

const warmer = new CacheWarmer({
  strategies: [
    {
      name: 'preload-popular-data',
      schedule: '0 */6 * * *', // Every 6 hours
      action: async () => {
        const popularItems = await getPopularItems();
        for (const item of popularItems) {
          await cacheManager.set(`item:${item.id}`, item);
        }
      }
    },
    {
      name: 'predictive-warming',
      trigger: 'cache-miss',
      action: async (key) => {
        // Warm related cache entries
        const relatedKeys = await getPredictedKeys(key);
        await Promise.all(
          relatedKeys.map(k => warmCacheEntry(k))
        );
      }
    }
  ]
});

warmer.start();
```

### Cache Analytics

```javascript
// Cache performance metrics
const cacheStats = await cacheManager.getStats();
console.log({
  hitRate: cacheStats.hitRate,           // 85.6%
  missRate: cacheStats.missRate,         // 14.4%
  memoryUsage: cacheStats.memoryUsage,   // 45.2MB
  keyCount: cacheStats.keyCount,         // 15,847
  avgResponseTime: cacheStats.avgResponseTime // 2.3ms
});

// Cache optimization recommendations
const recommendations = await cacheManager.getOptimizationRecommendations();
/*
{
  increaseTTL: ['user-profiles', 'product-catalog'],
  decreaseTTL: ['real-time-data'],
  moveToMemory: ['frequently-accessed-small-items'],
  moveToRedis: ['large-but-important-data']
}
*/
```

## Optimization Engine

### Bundle Optimization

#### Webpack Configuration

```javascript
// webpack.performance.config.js
const { PerformancePlugin } = require('@semantest/performance-webpack');

module.exports = {
  plugins: [
    new PerformancePlugin({
      analysis: {
        bundleSize: true,
        unusedCode: true,
        duplicateDependencies: true
      },
      optimization: {
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all'
            },
            common: {
              minChunks: 2,
              chunks: 'all',
              enforce: true
            }
          }
        },
        treeshaking: true,
        minification: {
          terser: {
            compress: {
              drop_console: true,
              drop_debugger: true
            }
          }
        }
      }
    })
  ]
};
```

#### Dynamic Code Splitting

```javascript
// Lazy loading with performance tracking
import { trackLoadTime } from '@semantest/performance';

const LazyComponent = React.lazy(() => 
  trackLoadTime('lazy-component', () => import('./HeavyComponent'))
);

// Route-based splitting
const routes = [
  {
    path: '/dashboard',
    component: () => trackLoadTime('dashboard', () => import('./Dashboard'))
  },
  {
    path: '/analytics',
    component: () => trackLoadTime('analytics', () => import('./Analytics'))
  }
];

// Conditional loading
async function loadFeature(featureName) {
  const start = performance.now();
  
  const module = await import(`./features/${featureName}`);
  
  const loadTime = performance.now() - start;
  reportMetric(`feature-load-time-${featureName}`, loadTime);
  
  return module;
}
```

### Resource Preloading

```javascript
import { ResourcePreloader } from '@semantest/performance';

const preloader = new ResourcePreloader({
  strategies: {
    // Preload critical resources
    critical: [
      { url: '/api/user-profile', priority: 'high' },
      { url: '/api/dashboard-data', priority: 'high' }
    ],
    
    // Prefetch likely-needed resources
    prefetch: [
      { url: '/api/analytics-data', condition: 'user.role === "admin"' },
      { url: '/images/next-page-hero.jpg', condition: 'route.includes("welcome")' }
    ],
    
    // Preload on user interaction
    interactive: [
      { 
        trigger: 'hover',
        selector: '.nav-item',
        action: 'prefetch-route'
      },
      {
        trigger: 'scroll',
        threshold: '75%',
        action: 'preload-next-section'
      }
    ]
  }
});

preloader.start();
```

### Compression and CDN Integration

```javascript
// Compression configuration
const compressionConfig = {
  gzip: {
    enabled: true,
    level: 6,
    threshold: 1024 // Only compress files > 1KB
  },
  brotli: {
    enabled: true,
    quality: 4,
    threshold: 1024
  },
  
  // Content-type specific compression
  rules: [
    { type: 'application/json', compression: 'gzip' },
    { type: 'text/css', compression: 'brotli' },
    { type: 'application/javascript', compression: 'brotli' },
    { type: 'image/*', compression: 'none' } // Images already compressed
  ]
};

// CDN integration
const cdnConfig = {
  provider: 'cloudflare', // or 'aws', 'azure', 'gcp'
  zones: {
    static: 'static.example.com',
    api: 'api.example.com',
    media: 'media.example.com'
  },
  caching: {
    static: '1y',
    api: '5m',
    media: '30d'
  },
  optimization: {
    minify: true,
    compression: true,
    imageOptimization: true
  }
};
```

## Performance Tuning

### Database Query Optimization

```javascript
import { QueryOptimizer } from '@semantest/performance';

const queryOptimizer = new QueryOptimizer({
  database: 'postgresql',
  monitoring: {
    slowQueryThreshold: 1000, // 1 second
    explainAnalyze: true,
    indexSuggestions: true
  }
});

// Automatic query analysis
const optimizedQuery = await queryOptimizer.optimize(`
  SELECT u.*, p.title, c.name as category
  FROM users u
  JOIN posts p ON u.id = p.author_id
  JOIN categories c ON p.category_id = c.id
  WHERE u.active = true AND p.published_at > $1
  ORDER BY p.published_at DESC
  LIMIT 20
`);

// Query performance tracking
const queryResult = await queryOptimizer.execute(optimizedQuery, [lastWeek], {
  trackPerformance: true,
  cacheKey: 'recent-posts',
  cacheTTL: 300000
});
```

### Memory Management

```javascript
import { MemoryManager } from '@semantest/performance';

const memoryManager = new MemoryManager({
  monitoring: {
    gcAnalysis: true,
    heapSnapshots: true,
    leakDetection: true
  },
  optimization: {
    objectPooling: true,
    weakReferences: true,
    automaticCleanup: true
  },
  thresholds: {
    heapUsed: 1024 * 1024 * 1024, // 1GB
    rss: 2 * 1024 * 1024 * 1024,  // 2GB
    external: 512 * 1024 * 1024   // 512MB
  }
});

// Object pooling for frequently created objects
const objectPool = memoryManager.createPool({
  create: () => ({ data: null, processed: false }),
  reset: (obj) => { obj.data = null; obj.processed = false; },
  maxSize: 1000
});

function processData(data) {
  const obj = objectPool.acquire();
  obj.data = data;
  obj.processed = true;
  
  // ... processing logic ...
  
  objectPool.release(obj);
}

// Memory leak detection
memoryManager.on('leak-detected', (leak) => {
  console.error('Memory leak detected:', leak);
  // Take heap snapshot for analysis
  memoryManager.takeHeapSnapshot();
});
```

### CPU Optimization

```javascript
import { CPUOptimizer } from '@semantest/performance';

const cpuOptimizer = new CPUOptimizer({
  profiling: {
    enabled: true,
    sampleRate: 100, // Sample every 100ms
    flameGraphs: true
  },
  optimization: {
    workerThreads: true,
    clustering: true,
    processScheduling: true
  }
});

// CPU-intensive task optimization
async function heavyComputation(data) {
  // Use worker threads for CPU-intensive tasks
  return await cpuOptimizer.runInWorker(
    './heavy-computation-worker.js',
    data,
    { timeout: 30000 }
  );
}

// Process scheduling optimization
cpuOptimizer.scheduleTask('data-processing', {
  priority: 'high',
  maxCPU: 80, // Use max 80% CPU
  batchSize: 100,
  processor: processDataBatch
});
```

### Network Optimization

```javascript
import { NetworkOptimizer } from '@semantest/performance';

const networkOptimizer = new NetworkOptimizer({
  connection: {
    pooling: true,
    keepAlive: true,
    timeout: 30000
  },
  optimization: {
    requestBatching: true,
    responseCompression: true,
    connectionReuse: true
  },
  monitoring: {
    latency: true,
    throughput: true,
    errorRate: true
  }
});

// Request batching
const batchedRequests = networkOptimizer.createBatch();
batchedRequests.add('/api/user/1');
batchedRequests.add('/api/user/2');
batchedRequests.add('/api/user/3');

const results = await batchedRequests.execute();

// Connection pooling
const httpAgent = networkOptimizer.createAgent({
  maxSockets: 50,
  maxFreeSockets: 10,
  timeout: 60000,
  keepAliveMsecs: 1000
});
```

## API Reference

### PerformanceMonitor Class

```typescript
class PerformanceMonitor {
  constructor(config: PerformanceConfig);
  
  // Monitoring control
  start(): void;
  stop(): void;
  pause(): void;
  resume(): void;
  
  // Metric collection
  recordMetric(name: string, value: number, tags?: Record<string, string>): void;
  incrementCounter(name: string, tags?: Record<string, string>): void;
  setGauge(name: string, value: number, tags?: Record<string, string>): void;
  recordHistogram(name: string, value: number, tags?: Record<string, string>): void;
  
  // Performance marks and measures
  mark(name: string): void;
  measure(name: string, startMark?: string, endMark?: string): number;
  
  // Data retrieval
  getMetrics(filter?: MetricFilter): Promise<Metric[]>;
  getStats(): Promise<PerformanceStats>;
  exportMetrics(format: 'json' | 'prometheus' | 'influx'): Promise<string>;
}
```

### CacheManager Class

```typescript
class CacheManager {
  constructor(config: CacheConfig);
  
  // Basic operations
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, options?: CacheOptions): Promise<void>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;
  
  // Advanced operations
  getMany<T>(keys: string[]): Promise<Record<string, T>>;
  setMany<T>(entries: Record<string, T>, options?: CacheOptions): Promise<void>;
  increment(key: string, amount?: number): Promise<number>;
  
  // Tag-based operations
  invalidateByTag(tag: string): Promise<void>;
  getByTag(tag: string): Promise<Record<string, any>>;
  
  // Statistics
  getStats(): Promise<CacheStats>;
  getHitRate(): Promise<number>;
}
```

### Configuration Interfaces

```typescript
interface PerformanceConfig {
  monitoring: {
    webVitals?: boolean;
    nodeMetrics?: boolean;
    customMetrics?: boolean;
    interval?: number;
  };
  thresholds: {
    [metricName: string]: number;
  };
  reporting: {
    endpoint?: string;
    interval?: number;
    batchSize?: number;
  };
}

interface CacheConfig {
  strategies: {
    memory?: MemoryCacheConfig;
    redis?: RedisCacheConfig;
    file?: FileCacheConfig;
  };
  rules?: CacheRule[];
  eviction?: EvictionConfig;
}

interface MetricFilter {
  name?: string;
  tags?: Record<string, string>;
  timeRange?: {
    start: Date;
    end: Date;
  };
}
```

## Troubleshooting

### Common Performance Issues

#### High Memory Usage

**Issue**: Memory usage continuously growing

**Diagnosis**:
```javascript
// Enable memory monitoring
const memoryMonitor = new MemoryManager({
  monitoring: { leakDetection: true }
});

// Take heap snapshots
memoryMonitor.takeHeapSnapshot();

// Analyze GC patterns
const gcStats = await memoryMonitor.getGCStats();
console.log('GC frequency:', gcStats.frequency);
console.log('GC duration:', gcStats.avgDuration);
```

**Solutions**:
```javascript
// Implement object pooling
const pool = memoryManager.createPool({
  create: () => new ExpensiveObject(),
  reset: (obj) => obj.reset(),
  maxSize: 100
});

// Use weak references for caches
const cache = new WeakMap();

// Implement proper cleanup
class Component {
  destroy() {
    this.removeAllListeners();
    this.clearIntervals();
    this.releaseResources();
  }
}
```

#### Slow Response Times

**Issue**: API responses taking too long

**Diagnosis**:
```javascript
// Enable request tracing
app.use(requestTracing({
  slowThreshold: 1000,
  includeQuery: true,
  includeBody: false
}));

// Database query analysis
const slowQueries = await queryOptimizer.getSlowQueries();
console.log('Slowest queries:', slowQueries);
```

**Solutions**:
```javascript
// Implement caching
app.get('/api/data', async (req, res) => {
  const cached = await cache.get('api-data');
  if (cached) return res.json(cached);
  
  const data = await fetchData();
  await cache.set('api-data', data, { ttl: 300000 });
  res.json(data);
});

// Database optimization
const optimizedQuery = `
  SELECT * FROM users 
  WHERE active = true 
  ORDER BY created_at DESC 
  LIMIT 10
`;
// Add index: CREATE INDEX idx_users_active_created ON users(active, created_at);
```

#### Bundle Size Issues

**Issue**: Large JavaScript bundles affecting load time

**Diagnosis**:
```bash
# Analyze bundle size
npx webpack-bundle-analyzer dist/main.js

# Check for duplicates
npx duplicate-package-checker-webpack-plugin
```

**Solutions**:
```javascript
// Code splitting
const LazyComponent = lazy(() => import('./HeavyComponent'));

// Tree shaking
import { specificFunction } from 'large-library';

// Dynamic imports
const feature = await import('./optional-feature');
```

### Performance Metrics Interpretation

#### Web Vitals Thresholds

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP | ≤ 2.5s | 2.5s - 4.0s | > 4.0s |
| FID | ≤ 100ms | 100ms - 300ms | > 300ms |
| CLS | ≤ 0.1 | 0.1 - 0.25 | > 0.25 |

#### Node.js Metrics Thresholds

| Metric | Good | Warning | Critical |
|--------|------|---------|----------|
| CPU Usage | < 70% | 70% - 85% | > 85% |
| Memory Usage | < 80% | 80% - 90% | > 90% |
| Event Loop Lag | < 10ms | 10ms - 50ms | > 50ms |
| Response Time | < 200ms | 200ms - 1000ms | > 1000ms |

### Best Practices

1. **Monitoring**:
   - Set up comprehensive monitoring early
   - Use real user monitoring (RUM)
   - Track both technical and business metrics

2. **Caching**:
   - Cache at multiple levels
   - Use appropriate TTL values
   - Implement cache warming strategies

3. **Optimization**:
   - Optimize critical rendering path
   - Minimize bundle sizes
   - Use lazy loading strategically

4. **Performance Culture**:
   - Include performance in code reviews
   - Set performance budgets
   - Regular performance audits

### Getting Help

1. **Documentation**: https://docs.semantest.com/performance
2. **Performance Forum**: https://community.semantest.com/performance
3. **GitHub Issues**: https://github.com/semantest/performance/issues
4. **Performance Consulting**: https://semantest.com/consulting
5. **Support Email**: performance-support@semantest.com

---

**Last Updated**: January 18, 2025  
**Version**: 1.0.0  
**Maintainer**: Semantest Performance Team