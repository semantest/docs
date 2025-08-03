# Comprehensive Testing Guide - Semantest API

## Overview

This guide covers testing strategies for the Semantest API, created in collaboration between Sam (Documentation) and Quinn (QA).

## Issue #23: NewChatRequested Testing

### Event Emission Tests

```typescript
describe('NewChatRequested Event Emission', () => {
  let eventBus: EventEmitter;
  let chatService: ChatService;
  
  beforeEach(() => {
    eventBus = new EventEmitter();
    chatService = new ChatService(eventBus);
  });
  
  it('should emit NewChatRequested event with correct payload', async () => {
    const eventSpy = jest.fn();
    eventBus.on('chat.new.requested', eventSpy);
    
    const chatData = {
      userId: 'test-user-123',
      prompt: 'Generate a sunset image',
      imageGeneration: { enabled: true }
    };
    
    await chatService.createChat(chatData);
    
    expect(eventSpy).toHaveBeenCalledWith({
      event: 'NewChatRequested',
      timestamp: expect.any(Number),
      chatId: expect.any(String),
      userId: chatData.userId,
      context: {
        sessionId: expect.any(String),
        previousChatId: null,
        metadata: expect.any(Object)
      }
    });
  });
  
  it('should include session context as Aria suggested', async () => {
    const sessionContext = {
      sessionId: 'session-456',
      previousChatId: 'chat-789',
      userPreferences: { theme: 'dark' }
    };
    
    const event = await chatService.createChatWithContext(data, sessionContext);
    
    expect(event.context).toMatchObject(sessionContext);
  });
});
```

### Platform-Specific Tests

```typescript
describe('Platform-Specific Behavior', () => {
  describe('Chrome Extension', () => {
    it('should handle chrome runtime messages', async () => {
      const mockChrome = {
        runtime: {
          sendMessage: jest.fn().mockResolvedValue({ success: true })
        }
      };
      
      global.chrome = mockChrome as any;
      
      await extensionClient.sendNewChatRequest(chatData);
      
      expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: 'NEW_CHAT_REQUESTED',
        payload: expect.objectContaining(chatData)
      });
    });
  });
  
  describe('Firefox Extension', () => {
    it('should use browser.runtime for Firefox', async () => {
      const mockBrowser = {
        runtime: {
          sendMessage: jest.fn().mockResolvedValue({ success: true })
        }
      };
      
      global.browser = mockBrowser as any;
      
      await extensionClient.sendNewChatRequest(chatData);
      
      expect(mockBrowser.runtime.sendMessage).toHaveBeenCalled();
    });
  });
});
```

### Error Handling Tests

```typescript
describe('Error Handling', () => {
  it('should handle rate limit errors gracefully', async () => {
    const rateLimitError = new RateLimitError(429, 45);
    mockApi.createChat.mockRejectedValue(rateLimitError);
    
    const result = await chatService.createChatWithRetry(chatData);
    
    expect(result.retryAfter).toBe(45);
    expect(result.error).toBe('RATE_LIMIT_EXCEEDED');
  });
  
  it('should circuit break after multiple failures', async () => {
    // Simulate 5 consecutive failures
    for (let i = 0; i < 5; i++) {
      mockApi.createChat.mockRejectedValue(new Error('Service unavailable'));
      await chatService.createChat(chatData).catch(() => {});
    }
    
    // Next call should fail immediately without calling API
    await expect(chatService.createChat(chatData))
      .rejects.toThrow('Circuit breaker is OPEN');
    
    expect(mockApi.createChat).toHaveBeenCalledTimes(5);
  });
});
```

### Performance Benchmarks

```typescript
describe('Performance Benchmarks', () => {
  it('should create chat within 200ms', async () => {
    const start = Date.now();
    await chatService.createChat(chatData);
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(200);
  });
  
  it('should handle 100 concurrent requests', async () => {
    const requests = Array(100).fill(null).map((_, i) => 
      chatService.createChat({ ...chatData, userId: `user-${i}` })
    );
    
    const start = Date.now();
    const results = await Promise.all(requests);
    const duration = Date.now() - start;
    
    expect(results).toHaveLength(100);
    expect(results.every(r => r.success)).toBe(true);
    expect(duration).toBeLessThan(5000); // 5 seconds for 100 requests
  });
});
```

## Issue #24: Image Restriction Testing

### Classification Tests

```typescript
describe('Image Classification', () => {
  it('should correctly classify inappropriate content', async () => {
    const testCases = [
      { prompt: 'violent scene', expected: 'blocked', category: 'violence' },
      { prompt: 'beautiful sunset', expected: 'allowed', category: null },
      { prompt: 'corporate logo', expected: 'blocked', category: 'trademark' }
    ];
    
    for (const testCase of testCases) {
      const result = await classifier.classify(testCase.prompt);
      expect(result.status).toBe(testCase.expected);
      expect(result.category).toBe(testCase.category);
    }
  });
  
  it('should handle edge cases in classification', async () => {
    const edgeCases = [
      'v10lent', // Leetspeak
      'VIOLENT', // Uppercase
      'viølent', // Unicode
      'vi olent' // Spaced
    ];
    
    for (const prompt of edgeCases) {
      const result = await classifier.classify(prompt);
      expect(result.status).toBe('blocked');
    }
  });
});
```

### UI Filtering Tests

```typescript
describe('UI Filtering', () => {
  it('should show appropriate error message for blocked content', async () => {
    const { getByText, queryByText } = render(
      <ImageGenerator onGenerate={mockGenerate} />
    );
    
    const input = getByPlaceholderText('Enter prompt...');
    const button = getByText('Generate');
    
    fireEvent.change(input, { target: { value: 'inappropriate content' } });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(getByText(/content policy violation/i)).toBeInTheDocument();
      expect(queryByText(/generating/i)).not.toBeInTheDocument();
    });
  });
  
  it('should disable generate button during processing', async () => {
    const { getByText } = render(<ImageGenerator />);
    const button = getByText('Generate');
    
    fireEvent.click(button);
    
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Generating...');
  });
});
```

### Download Queue Validation

```typescript
describe('Download Queue Management', () => {
  it('should respect rate limits for downloads', async () => {
    const queue = new DownloadQueue({ 
      maxConcurrent: 2,
      rateLimitPerMinute: 10 
    });
    
    // Add 5 download tasks
    const tasks = Array(5).fill(null).map((_, i) => 
      queue.add(`image-${i}.png`)
    );
    
    // Only 2 should be processing
    expect(queue.processing).toBe(2);
    expect(queue.pending).toBe(3);
    
    // Complete one
    await queue.complete(tasks[0].id);
    
    // Another should start
    expect(queue.processing).toBe(2);
    expect(queue.pending).toBe(2);
  });
  
  it('should handle download failures with retry', async () => {
    const queue = new DownloadQueue({ maxRetries: 3 });
    const mockDownload = jest.fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValue({ success: true });
    
    queue.setDownloader(mockDownload);
    
    const result = await queue.add('image.png');
    
    expect(mockDownload).toHaveBeenCalledTimes(3);
    expect(result.success).toBe(true);
  });
});
```

## WebSocket Event Testing

```typescript
describe('WebSocket Real-time Updates', () => {
  let wsClient: WebSocketClient;
  let mockServer: WS;
  
  beforeEach(() => {
    mockServer = new WS('ws://localhost:8080');
    wsClient = new WebSocketClient('ws://localhost:8080');
  });
  
  it('should receive job status updates', async () => {
    const updates: any[] = [];
    wsClient.on('job.status', (data) => updates.push(data));
    
    await wsClient.connect();
    
    // Simulate server sending updates
    mockServer.send(JSON.stringify({
      event: 'job.status',
      data: { jobId: 'job-123', status: 'processing' }
    }));
    
    mockServer.send(JSON.stringify({
      event: 'job.status',
      data: { jobId: 'job-123', status: 'completed' }
    }));
    
    await sleep(100);
    
    expect(updates).toHaveLength(2);
    expect(updates[0].status).toBe('processing');
    expect(updates[1].status).toBe('completed');
  });
});
```

## Integration Testing

```typescript
describe('End-to-End Flow', () => {
  it('should complete full image generation flow', async () => {
    // 1. Create chat
    const chatResponse = await api.post('/chat/new', {
      prompt: 'A beautiful mountain landscape',
      imageGeneration: { enabled: true }
    });
    
    expect(chatResponse.status).toBe(201);
    const { jobId } = chatResponse.data;
    
    // 2. Check job status
    let jobStatus;
    for (let i = 0; i < 10; i++) {
      const statusResponse = await api.get(`/jobs/${jobId}`);
      jobStatus = statusResponse.data.status;
      
      if (jobStatus === 'completed') break;
      await sleep(1000);
    }
    
    expect(jobStatus).toBe('completed');
    
    // 3. Verify webhook was called
    expect(mockWebhookServer.receivedCalls).toContainEqual(
      expect.objectContaining({
        event: 'job.completed',
        jobId
      })
    );
  });
});
```

## Test Data Management

```typescript
// Test data factory
export const TestDataFactory = {
  createUser: (overrides = {}) => ({
    id: faker.datatype.uuid(),
    email: faker.internet.email(),
    quota: { remaining: 100, total: 100 },
    ...overrides
  }),
  
  createChatRequest: (overrides = {}) => ({
    userId: faker.datatype.uuid(),
    prompt: faker.lorem.sentence(),
    imageGeneration: { enabled: true, provider: 'dalle3' },
    ...overrides
  }),
  
  createMockProvider: () => ({
    generate: jest.fn().mockResolvedValue({
      jobId: faker.datatype.uuid(),
      images: [{ url: faker.image.imageUrl() }]
    })
  })
};
```

## Continuous Testing Strategy

1. **Unit Tests**: Run on every commit
2. **Integration Tests**: Run on PR creation
3. **E2E Tests**: Run before deployment
4. **Performance Tests**: Run nightly
5. **Load Tests**: Run weekly

---
*Testing Guide by Sam the Scribe and Quinn the QA*
*Following test patterns from Quinn's expertise*