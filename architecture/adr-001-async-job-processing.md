# ADR-001: Async Job Processing with BullMQ and Redis

## Status
**Accepted** - December 2024

## Context
The Semantest platform needs to handle computationally intensive operations like AI image generation and dynamic addon loading without blocking the main application flow. These operations can take several seconds to minutes to complete.

## Decision
We will use BullMQ with Redis as our async job processing solution for both image generation and dynamic addon loading.

## Rationale

### Why BullMQ + Redis?
1. **Proven Scale**: Battle-tested in production environments
2. **Feature-Rich**: Built-in retry logic, job prioritization, rate limiting
3. **Observable**: Excellent monitoring and debugging capabilities
4. **Reliable**: Redis persistence ensures job durability
5. **Flexible**: Supports complex job workflows and dependencies

### Architecture Benefits
- **Non-blocking**: API returns immediately with job ID
- **Scalable**: Horizontal scaling with multiple workers
- **Resilient**: Automatic retries and dead letter queues
- **Real-time**: Webhook notifications for status updates

## Implementation

### Image Generation Flow
```typescript
// 1. API receives request
POST /api/v1/chat/new
{
  "prompt": "A serene garden",
  "imageGeneration": { "enabled": true }
}

// 2. Create job
const job = await imageQueue.add('generate', {
  prompt,
  provider: 'dalle3',
  userId
});

// 3. Return immediately
return { jobId: job.id, status: 'queued' };

// 4. Worker processes asynchronously
imageWorker.process(async (job) => {
  const result = await generateImage(job.data);
  await webhookService.notify(job.data.webhookUrl, result);
});
```

### Dynamic Addon Loading Pattern
```typescript
// Similar pattern for addons
const addonJob = await addonQueue.add('load', {
  addonId,
  userId,
  config
});
```

## Consequences

### Positive
- ✅ Improved API response times
- ✅ Better resource utilization
- ✅ Fault tolerance through retries
- ✅ Monitoring through Bull Board
- ✅ Consistent pattern across features

### Negative
- ❌ Additional infrastructure (Redis)
- ❌ Complexity of distributed systems
- ❌ Eventual consistency considerations

### Neutral
- 🔄 Requires webhook implementation
- 🔄 Client needs to handle async flow
- 🔄 Additional monitoring setup

## References
- [BullMQ Documentation](https://docs.bullmq.io/)
- [Redis Persistence](https://redis.io/topics/persistence)
- Alex's API Implementation: `/nodejs.server/src/api/v1/`

---
*Architecture Decision Record by Sam the Scribe*
*Reviewed by Aria the Architect*