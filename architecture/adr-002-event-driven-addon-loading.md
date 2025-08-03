# ADR-002: Event-Driven Addon Loading Pattern

## Status
**Accepted** - December 2024

## Context
The Semantest platform needs to dynamically load browser addons without blocking the main extension or causing performance degradation. Addons can vary significantly in size and initialization time.

## Decision
We will implement an event-driven architecture for addon loading, using a publish-subscribe pattern with async message passing between components.

## Rationale

### Why Event-Driven?
1. **Decoupling**: Addons are independent of core extension
2. **Performance**: Non-blocking async loading
3. **Flexibility**: Easy to add/remove addons
4. **Resilience**: Addon failures don't crash the extension
5. **Observability**: Clear event flow for debugging

### Event Flow
```typescript
// 1. Extension startup
extensionCore.emit('extension.ready');

// 2. Addon manager listens
addonManager.on('extension.ready', async () => {
  const addons = await getEnabledAddons();
  addons.forEach(addon => {
    addonQueue.add('load', { addonId: addon.id });
  });
});

// 3. Addon loads asynchronously
addonLoader.on('addon.loading', (data) => {
  updateUI({ status: 'loading', addon: data.addonId });
});

// 4. Addon ready
addonLoader.on('addon.ready', (data) => {
  extensionCore.emit('addon.available', data);
  updateUI({ status: 'ready', addon: data.addonId });
});

// 5. Addon error handling
addonLoader.on('addon.error', (error) => {
  logger.error('Addon failed to load', error);
  updateUI({ status: 'error', addon: error.addonId });
});
```

## Implementation Details

### Event Types
```typescript
interface AddonEvents {
  'addon.requested': { addonId: string; userId: string };
  'addon.loading': { addonId: string; progress: number };
  'addon.ready': { addonId: string; api: AddonAPI };
  'addon.error': { addonId: string; error: Error };
  'addon.unloaded': { addonId: string };
}
```

### Type Safety with TypeScript
```typescript
class TypedEventEmitter<T extends Record<string, any>> {
  on<K extends keyof T>(event: K, handler: (data: T[K]) => void): void;
  emit<K extends keyof T>(event: K, data: T[K]): void;
}

const addonEvents = new TypedEventEmitter<AddonEvents>();
```

## Consequences

### Positive
- ✅ Improved extension startup time
- ✅ Graceful handling of addon failures
- ✅ Easy to implement new addons
- ✅ Clear separation of concerns
- ✅ TypeScript ensures event type safety

### Negative
- ❌ Increased complexity vs synchronous loading
- ❌ Potential race conditions
- ❌ Debugging async flows can be challenging

### Neutral
- 🔄 Requires event bus implementation
- 🔄 Need to handle event ordering
- 🔄 Memory management for event listeners

## Integration with BullMQ
This pattern complements ADR-001 by using the same queue infrastructure:
```typescript
// Addon loading job
await addonQueue.add('load', {
  addonId,
  priority: addon.priority || 0
});

// Emit events from worker
addonWorker.on('completed', (job) => {
  addonEvents.emit('addon.ready', job.returnvalue);
});
```

## References
- [EventEmitter3](https://github.com/primus/eventemitter3) - High performance EventEmitter
- Aria's Architecture: Addon separation Phase 1
- Alex's API: Addon serving endpoint

---
*Architecture Decision Record by Sam the Scribe*
*Reviewed by Aria the Architect*