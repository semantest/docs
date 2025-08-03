# API Integration Testing Guide

## Overview

This guide provides comprehensive testing strategies for the Semantest API integration, building on Quinn's test coordination and Alex's API design.

## BullMQ Async Job Testing

### Basic Job Queue Testing

```typescript
import { Queue, Worker, QueueEvents } from 'bullmq';
import { ImageGenerationJobService } from '@semantest/api';

describe('BullMQ Image Generation Jobs', () => {
  let queue: Queue;
  let worker: Worker;
  let queueEvents: QueueEvents;
  
  beforeAll(() => {
    // Setup test queue with Redis connection
    const connection = {
      host: 'localhost',
      port: 6379,
      db: 1 // Use separate DB for tests
    };
    
    queue = new Queue('image-generation-test', { connection });
    queueEvents = new QueueEvents('image-generation-test', { connection });
  });
  
  afterAll(async () => {
    await queue.close();
    await queueEvents.close();
    if (worker) await worker.close();
  });
  
  it('should process image generation job successfully', async () => {
    const jobData = {
      userId: 'test-user',
      prompt: 'A beautiful sunset',
      provider: 'dalle3',
      webhookUrl: 'https://test.webhook.com/callback'
    };
    
    // Add job to queue
    const job = await queue.add('generate', jobData);
    
    // Wait for job completion
    const result = await job.waitUntilFinished(queueEvents);
    
    expect(result).toMatchObject({
      success: true,
      images: expect.arrayContaining([
        expect.objectContaining({
          url: expect.stringMatching(/^https:\/\//),
          size: '1024x1024'
        })
      ])
    });
  });
  
  it('should handle job failures with retry', async () => {
    const mockProvider = jest.fn()
      .mockRejectedValueOnce(new Error('Provider timeout'))
      .mockResolvedValueOnce({ images: ['test.jpg'] });
    
    worker = new Worker('image-generation-test', async (job) => {
      return await mockProvider(job.data);
    }, {
      connection,
      autorun: false
    });
    
    const job = await queue.add('generate', {}, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000
      }
    });
    
    worker.run();
    
    await expect(job.waitUntilFinished(queueEvents))
      .resolves.toMatchObject({ images: ['test.jpg'] });
    
    expect(mockProvider).toHaveBeenCalledTimes(2);
  });
});
```

### Advanced Queue Testing

```typescript
describe('Advanced Queue Scenarios', () => {
  it('should respect rate limiting', async () => {
    // Create rate limited queue
    const rateLimitedQueue = new Queue('rate-limited', {
      defaultJobOptions: {
        rateLimiterKey: 'provider',
        rateLimiter: {
          max: 5,
          duration: 60000 // 5 per minute
        }
      }
    });
    
    // Add 10 jobs
    const jobs = await Promise.all(
      Array(10).fill(null).map((_, i) => 
        rateLimitedQueue.add('job', { index: i })
      )
    );
    
    // Check that only 5 are active
    const activeCounts = await rateLimitedQueue.getJobCounts('active');
    expect(activeCounts).toBeLessThanOrEqual(5);
  });
  
  it('should handle job priorities correctly', async () => {
    const results: number[] = [];
    
    const priorityWorker = new Worker('priority-test', async (job) => {
      results.push(job.data.value);
      return job.data.value;
    });
    
    // Add jobs with different priorities
    await queue.add('job', { value: 1 }, { priority: 1 });
    await queue.add('job', { value: 2 }, { priority: 10 });
    await queue.add('job', { value: 3 }, { priority: 5 });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Higher priority jobs should process first
    expect(results).toEqual([2, 3, 1]);
  });
});
```

## Multi-Provider Validation

```typescript
describe('Multi-Provider Image Generation', () => {
  const providers = ['dalle3', 'stable-diffusion', 'midjourney'];
  
  providers.forEach(provider => {
    describe(`${provider} Provider`, () => {
      it('should generate images with provider-specific options', async () => {
        const options = getProviderOptions(provider);
        
        const response = await api.post('/api/v1/images/generate', {
          prompt: 'Test prompt',
          provider,
          options
        });
        
        expect(response.status).toBe(202);
        expect(response.data.jobId).toBeTruthy();
        
        // Validate provider-specific response
        switch (provider) {
          case 'dalle3':
            expect(response.data.estimatedTime).toBeLessThan(30000);
            break;
          case 'stable-diffusion':
            expect(response.data.creditsRequired).toBe(1);
            break;
          case 'midjourney':
            expect(response.data.queuePosition).toBeGreaterThan(0);
            break;
        }
      });
      
      it('should validate provider-specific parameters', async () => {
        const invalidOptions = getInvalidProviderOptions(provider);
        
        const response = await api.post('/api/v1/images/generate', {
          prompt: 'Test',
          provider,
          options: invalidOptions
        });
        
        expect(response.status).toBe(400);
        expect(response.data.error).toContain('Invalid options');
      });
    });
  });
  
  function getProviderOptions(provider: string) {
    switch (provider) {
      case 'dalle3':
        return { size: '1024x1024', quality: 'hd' };
      case 'stable-diffusion':
        return { steps: 50, cfgScale: 7.5 };
      case 'midjourney':
        return { version: 'v6', chaos: 50 };
    }
  }
});
```

## WebSocket Event Testing

```typescript
import { io, Socket } from 'socket.io-client';

describe('WebSocket Real-time Events', () => {
  let socket: Socket;
  
  beforeEach(async () => {
    socket = io('ws://localhost:3001', {
      auth: { apiKey: 'test-api-key' }
    });
    
    await new Promise(resolve => {
      socket.on('connect', resolve);
    });
  });
  
  afterEach(() => {
    socket.disconnect();
  });
  
  it('should receive job status updates via WebSocket', async () => {
    const updates: any[] = [];
    
    socket.on('job.status', (data) => {
      updates.push(data);
    });
    
    // Create a job
    const { data } = await api.post('/api/v1/images/generate', {
      prompt: 'Real-time test'
    });
    
    // Subscribe to job updates
    socket.emit('subscribe.job', { jobId: data.jobId });
    
    // Wait for updates
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    expect(updates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ status: 'queued' }),
        expect.objectContaining({ status: 'processing' }),
        expect.objectContaining({ status: 'completed' })
      ])
    );
  });
  
  it('should handle WebSocket reconnection', async () => {
    let reconnectCount = 0;
    
    socket.on('reconnect', () => {
      reconnectCount++;
    });
    
    // Force disconnect
    socket.io.engine.close();
    
    // Wait for auto-reconnect
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    expect(reconnectCount).toBeGreaterThan(0);
    expect(socket.connected).toBe(true);
  });
});
```

## Addon API Testing

```typescript
describe('Addon Serving API', () => {
  it('should serve addon manifest', async () => {
    const response = await api.get('/api/v1/addons/image-enhancer/manifest.json');
    
    expect(response.status).toBe(200);
    expect(response.data).toMatchObject({
      id: 'image-enhancer',
      version: expect.stringMatching(/^\d+\.\d+\.\d+$/),
      permissions: expect.arrayContaining(['images.enhance']),
      entryPoint: expect.stringMatching(/\.js$/)
    });
  });
  
  it('should validate addon version compatibility', async () => {
    const response = await api.get('/api/v1/addons/image-enhancer/bundle.js', {
      headers: {
        'X-Extension-Version': '1.0.0'
      }
    });
    
    expect(response.status).toBe(200);
    expect(response.headers['x-addon-compatible']).toBe('true');
  });
  
  it('should handle CDN caching correctly', async () => {
    const response1 = await api.get('/api/v1/addons/image-enhancer/bundle.js');
    const etag = response1.headers.etag;
    
    const response2 = await api.get('/api/v1/addons/image-enhancer/bundle.js', {
      headers: {
        'If-None-Match': etag
      }
    });
    
    expect(response2.status).toBe(304);
  });
});
```

## Rate Limiting & Health Check Testing

```typescript
describe('Rate Limiting', () => {
  it('should enforce rate limits per endpoint', async () => {
    const requests = Array(15).fill(null).map(() => 
      api.post('/api/v1/chat/new', { prompt: 'test' })
    );
    
    const results = await Promise.allSettled(requests);
    
    const successful = results.filter(r => r.status === 'fulfilled');
    const rateLimited = results.filter(r => 
      r.status === 'rejected' && 
      r.reason.response?.status === 429
    );
    
    expect(successful.length).toBe(10); // Limit is 10/min
    expect(rateLimited.length).toBe(5);
  });
});

describe('Health Checks', () => {
  it('should return detailed health status', async () => {
    const response = await api.get('/api/v1/health');
    
    expect(response.status).toBe(200);
    expect(response.data).toMatchObject({
      status: 'healthy',
      services: {
        redis: { status: 'up', latency: expect.any(Number) },
        database: { status: 'up', latency: expect.any(Number) },
        bullmq: { status: 'up', activeJobs: expect.any(Number) },
        providers: {
          dalle3: { status: 'up', healthy: true },
          'stable-diffusion': { status: 'up', healthy: true }
        }
      },
      uptime: expect.any(Number),
      version: expect.any(String)
    });
  });
});
```

## Integration Test Utilities

```typescript
// test-utils.ts
export class TestHelpers {
  static async waitForJobCompletion(jobId: string, timeout = 30000): Promise<any> {
    const start = Date.now();
    
    while (Date.now() - start < timeout) {
      const response = await api.get(`/api/v1/jobs/${jobId}`);
      
      if (response.data.status === 'completed') {
        return response.data;
      }
      
      if (response.data.status === 'failed') {
        throw new Error(`Job failed: ${response.data.error}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    throw new Error('Job timeout');
  }
  
  static async cleanupTestData(userId: string): Promise<void> {
    await Promise.all([
      api.delete(`/api/v1/test/users/${userId}`),
      api.delete(`/api/v1/test/jobs/user/${userId}`),
      api.delete(`/api/v1/test/images/user/${userId}`)
    ]);
  }
}
```

## Continuous Integration Setup

```yaml
# .github/workflows/integration-tests.yml
name: API Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run integration tests
        run: npm run test:integration
        env:
          REDIS_URL: redis://localhost:6379
          API_URL: http://localhost:3000
          
      - name: Upload test results
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: coverage/
```

---
*API Integration Testing Guide by Sam the Scribe*
*Test strategies from Quinn the QA*