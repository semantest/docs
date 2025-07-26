# ChatGPT Extension Enhanced Test Suite

## Overview
Comprehensive test suite for @semantest/chatgpt.com package based on actual codebase implementation. The test suite covers domain entities, value objects, events, application services, infrastructure adapters, and API controllers.

## Test Framework Configuration

### Jest Configuration
```typescript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^typescript-eda-domain$': '<rootDir>/__mocks__/typescript-eda-domain.ts'
  },
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/index.ts'
  ]
};
```

## 1. Domain Entity Tests

### 1.1 ChatGPTProject Entity Tests

```typescript
// tests/domain/entities/chatgpt-project.entity.test.ts
import { ChatGPTProject, ProjectSettings } from '@/domain/entities/chatgpt-project.entity';
import { ChatGPTConversation } from '@/domain/entities/chatgpt-conversation.entity';
import { ProjectId } from '@/domain/value-objects/project-id.value-object';

describe('ChatGPTProject Entity', () => {
  describe('Creation', () => {
    test('should create project with valid name', () => {
      const project = ChatGPTProject.create('Test Automation Project', {
        description: 'Automated testing for Semantest',
        settings: {
          defaultModel: 'gpt-4',
          customInstructions: 'You are a QA assistant'
        }
      });

      expect(project.getName()).toBe('Test Automation Project');
      expect(project.getDescription()).toBe('Automated testing for Semantest');
      expect(project.getDefaultModel()).toBe('gpt-4');
      expect(project.isActiveProject()).toBe(true);
    });

    test('should generate ID from project name', () => {
      const project = ChatGPTProject.create('My Test Project!');
      const id = project.getId();
      
      expect(id).toBe('my-test-project');
    });

    test('should use provided ID if given', () => {
      const customId = 'custom-project-id';
      const project = ChatGPTProject.create('Test Project', { id: customId });
      
      expect(project.getId()).toBe(customId);
    });

    test('should set default settings', () => {
      const project = ChatGPTProject.create('Test Project');
      const settings = project.getSettings();

      expect(settings.defaultModel).toBe('gpt-4');
      expect(settings.autoSave).toBe(true);
      expect(settings.conversationLimit).toBe(100);
      expect(settings.allowFileUploads).toBe(true);
    });
  });

  describe('Conversation Management', () => {
    let project: ChatGPTProject;
    let conversation: ChatGPTConversation;

    beforeEach(() => {
      project = ChatGPTProject.create('Test Project');
      conversation = ChatGPTConversation.create('conv-1', 'Test Conversation');
    });

    test('should add conversation to project', () => {
      project.addConversation(conversation);

      expect(project.getConversationCount()).toBe(1);
      expect(project.getConversation('conv-1')).toBeDefined();
    });

    test('should throw error when exceeding conversation limit', () => {
      project.updateSettings({ conversationLimit: 2 });
      
      const conv1 = ChatGPTConversation.create('conv-1', 'Conv 1');
      const conv2 = ChatGPTConversation.create('conv-2', 'Conv 2');
      const conv3 = ChatGPTConversation.create('conv-3', 'Conv 3');

      project.addConversation(conv1);
      project.addConversation(conv2);

      expect(() => project.addConversation(conv3))
        .toThrow('Project has reached conversation limit of 2');
    });

    test('should remove conversation from project', () => {
      project.addConversation(conversation);
      expect(project.getConversationCount()).toBe(1);

      project.removeConversation('conv-1');
      expect(project.getConversationCount()).toBe(0);
    });

    test('should get latest conversation', () => {
      const conv1 = ChatGPTConversation.create('conv-1', 'Old Conversation');
      const conv2 = ChatGPTConversation.create('conv-2', 'New Conversation');

      // Simulate time difference
      jest.useFakeTimers();
      project.addConversation(conv1);
      jest.advanceTimersByTime(1000);
      project.addConversation(conv2);

      const latest = project.getLatestConversation();
      expect(latest?.getId()).toBe('conv-2');

      jest.useRealTimers();
    });
  });

  describe('Search Functionality', () => {
    let project: ChatGPTProject;

    beforeEach(() => {
      project = ChatGPTProject.create('Test Project');
      
      const conv1 = ChatGPTConversation.create('conv-1', 'Python Tutorial');
      const conv2 = ChatGPTConversation.create('conv-2', 'JavaScript Guide');
      const conv3 = ChatGPTConversation.create('conv-3', 'TypeScript Basics');

      project.addConversation(conv1);
      project.addConversation(conv2);
      project.addConversation(conv3);
    });

    test('should search conversations by title', () => {
      const results = project.searchConversations('Script');
      
      expect(results).toHaveLength(2);
      expect(results[0].getTitle()).toBe('JavaScript Guide');
      expect(results[1].getTitle()).toBe('TypeScript Basics');
    });

    test('should perform case-sensitive search when specified', () => {
      const results = project.searchConversations('typescript', true);
      expect(results).toHaveLength(0);

      const caseSensitiveResults = project.searchConversations('TypeScript', true);
      expect(caseSensitiveResults).toHaveLength(1);
    });
  });

  describe('Validation', () => {
    test('should validate project with valid data', () => {
      const project = ChatGPTProject.create('Valid Project');
      const validation = project.validate();

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('should detect empty project name', () => {
      const project = ChatGPTProject.create('Test');
      // Force empty name for testing
      project['props'].name = '';
      
      const validation = project.validate();
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Project name is required');
    });

    test('should warn about long project names', () => {
      const longName = 'A'.repeat(101);
      const project = ChatGPTProject.create(longName);
      
      const validation = project.validate();
      
      expect(validation.valid).toBe(true);
      expect(validation.warnings).toContain('Project name is very long (>100 characters)');
    });
  });

  describe('Statistics', () => {
    test('should calculate project statistics correctly', () => {
      const project = ChatGPTProject.create('Test Project');
      const conv1 = ChatGPTConversation.create('conv-1', 'Conv 1');
      const conv2 = ChatGPTConversation.create('conv-2', 'Conv 2');
      
      project.addConversation(conv1);
      project.addConversation(conv2);

      const stats = project.getStatistics();

      expect(stats.conversationCount).toBe(2);
      expect(stats.activeConversationCount).toBe(2);
      expect(stats.totalMessageCount).toBe(0);
      expect(stats.averageMessagesPerConversation).toBe(0);
      expect(stats.isAtLimit).toBe(false);
    });
  });

  describe('JSON Serialization', () => {
    test('should serialize to JSON correctly', () => {
      const project = ChatGPTProject.create('Test Project', {
        description: 'Test Description',
        settings: { defaultModel: 'gpt-4-turbo' }
      });

      const json = project.toJSON();

      expect(json.name).toBe('Test Project');
      expect(json.description).toBe('Test Description');
      expect(json.settings.defaultModel).toBe('gpt-4-turbo');
      expect(json.statistics).toBeDefined();
    });

    test('should deserialize from JSON', () => {
      const projectData = {
        id: 'test-project-id',
        name: 'Restored Project',
        description: 'From JSON',
        conversations: [],
        isActive: true,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-02T00:00:00Z',
        settings: {
          defaultModel: 'gpt-3.5-turbo'
        }
      };

      const project = ChatGPTProject.fromJSON(projectData);

      expect(project.getId()).toBe('test-project-id');
      expect(project.getName()).toBe('Restored Project');
      expect(project.getDefaultModel()).toBe('gpt-3.5-turbo');
    });
  });
});
```

### 1.2 ChatGPTConversation Entity Tests

```typescript
// tests/domain/entities/chatgpt-conversation.entity.test.ts
import { ChatGPTConversation } from '@/domain/entities/chatgpt-conversation.entity';
import { ConversationMessage } from '@/domain/entities/conversation-message.entity';

describe('ChatGPTConversation Entity', () => {
  describe('Creation', () => {
    test('should create conversation with valid data', () => {
      const conversation = ChatGPTConversation.create('conv-123', 'Test Chat', {
        projectId: 'proj-456',
        model: 'gpt-4-turbo'
      });

      expect(conversation.getId()).toBe('conv-123');
      expect(conversation.getTitle()).toBe('Test Chat');
      expect(conversation.getProjectId()).toBe('proj-456');
      expect(conversation.getModel()).toBe('gpt-4-turbo');
    });

    test('should set default model if not provided', () => {
      const conversation = ChatGPTConversation.create('conv-123', 'Test Chat');
      expect(conversation.getModel()).toBe('gpt-4');
    });
  });

  describe('Message Management', () => {
    let conversation: ChatGPTConversation;

    beforeEach(() => {
      conversation = ChatGPTConversation.create('conv-123', 'Test Chat');
    });

    test('should add messages to conversation', () => {
      const userMessage = ConversationMessage.createUserMessage('Hello, ChatGPT!');
      const assistantMessage = ConversationMessage.createAssistantMessage('Hello! How can I help?');

      conversation.addMessage(userMessage);
      conversation.addMessage(assistantMessage);

      expect(conversation.getMessageCount()).toBe(2);
      expect(conversation.getMessages()).toHaveLength(2);
    });

    test('should get latest message', () => {
      const msg1 = ConversationMessage.createUserMessage('First message');
      const msg2 = ConversationMessage.createAssistantMessage('Response');
      const msg3 = ConversationMessage.createUserMessage('Last message');

      conversation.addMessage(msg1);
      conversation.addMessage(msg2);
      conversation.addMessage(msg3);

      const latest = conversation.getLatestMessage();
      expect(latest?.getContent()).toBe('Last message');
      expect(latest?.getRole()).toBe('user');
    });

    test('should get latest assistant response', () => {
      const msg1 = ConversationMessage.createUserMessage('Question 1');
      const msg2 = ConversationMessage.createAssistantMessage('Answer 1');
      const msg3 = ConversationMessage.createUserMessage('Question 2');
      const msg4 = ConversationMessage.createAssistantMessage('Answer 2');

      conversation.addMessage(msg1);
      conversation.addMessage(msg2);
      conversation.addMessage(msg3);
      conversation.addMessage(msg4);

      const latestResponse = conversation.getLatestResponse();
      expect(latestResponse?.getContent()).toBe('Answer 2');
    });
  });

  describe('Export Functionality', () => {
    let conversation: ChatGPTConversation;

    beforeEach(() => {
      conversation = ChatGPTConversation.create('conv-123', 'Export Test');
      conversation.addMessage(ConversationMessage.createUserMessage('Hello'));
      conversation.addMessage(ConversationMessage.createAssistantMessage('Hi there!'));
    });

    test('should export as JSON', () => {
      const exported = conversation.exportAs('json');
      const parsed = JSON.parse(exported);

      expect(parsed.id).toBe('conv-123');
      expect(parsed.title).toBe('Export Test');
      expect(parsed.messages).toHaveLength(2);
    });

    test('should export as Markdown', () => {
      const markdown = conversation.exportAs('markdown');

      expect(markdown).toContain('# Export Test');
      expect(markdown).toContain('**Model:** gpt-4');
      expect(markdown).toContain('## User');
      expect(markdown).toContain('Hello');
      expect(markdown).toContain('## Assistant');
      expect(markdown).toContain('Hi there!');
    });

    test('should export as plain text', () => {
      const text = conversation.exportAs('text');

      expect(text).toContain('Conversation: Export Test');
      expect(text).toContain('USER:');
      expect(text).toContain('Hello');
      expect(text).toContain('ASSISTANT:');
      expect(text).toContain('Hi there!');
    });

    test('should throw error for unsupported format', () => {
      expect(() => conversation.exportAs('pdf' as any))
        .toThrow('Unsupported export format: pdf');
    });
  });

  describe('Validation', () => {
    test('should validate conversation with consecutive same-role messages', () => {
      const conversation = ChatGPTConversation.create('conv-123', 'Test');
      
      conversation.addMessage(ConversationMessage.createUserMessage('Message 1'));
      conversation.addMessage(ConversationMessage.createUserMessage('Message 2'));

      const validation = conversation.validate();

      expect(validation.valid).toBe(true);
      expect(validation.warnings).toContain('Consecutive user messages at position 1');
    });

    test('should warn about very long conversations', () => {
      const conversation = ChatGPTConversation.create('conv-123', 'Long Chat');
      const longContent = 'A'.repeat(50000);
      
      conversation.addMessage(ConversationMessage.createUserMessage(longContent));
      conversation.addMessage(ConversationMessage.createAssistantMessage(longContent));

      const validation = conversation.validate();

      expect(validation.valid).toBe(true);
      expect(validation.warnings).toContain('Conversation is very long and may affect performance');
    });
  });
});
```

### 1.3 ConversationMessage Entity Tests

```typescript
// tests/domain/entities/conversation-message.entity.test.ts
import { ConversationMessage, MessageAttachment } from '@/domain/entities/conversation-message.entity';

describe('ConversationMessage Entity', () => {
  describe('Creation', () => {
    test('should create user message', () => {
      const message = ConversationMessage.createUserMessage('Hello, world!');

      expect(message.getRole()).toBe('user');
      expect(message.getContent()).toBe('Hello, world!');
      expect(message.isUserMessage()).toBe(true);
    });

    test('should create assistant message', () => {
      const message = ConversationMessage.createAssistantMessage('Hello! How can I help?');

      expect(message.getRole()).toBe('assistant');
      expect(message.isAssistantMessage()).toBe(true);
    });

    test('should create system message', () => {
      const message = ConversationMessage.createSystemMessage('You are a helpful assistant');

      expect(message.getRole()).toBe('system');
      expect(message.isSystemMessage()).toBe(true);
    });

    test('should throw error for empty content', () => {
      expect(() => ConversationMessage.create('user', ''))
        .toThrow('Message content cannot be empty');
      
      expect(() => ConversationMessage.create('user', '   '))
        .toThrow('Message content cannot be empty');
    });
  });

  describe('Attachments', () => {
    test('should create message with attachments', () => {
      const attachments: MessageAttachment[] = [
        {
          id: 'att-1',
          name: 'image.png',
          type: 'image/png',
          size: 1024,
          url: 'https://example.com/image.png'
        }
      ];

      const message = ConversationMessage.createUserMessage('Check this image', {
        attachments
      });

      expect(message.hasAttachments()).toBe(true);
      expect(message.getAttachments()).toHaveLength(1);
      expect(message.getAttachments()[0].name).toBe('image.png');
    });

    test('should add attachment to existing message', () => {
      const message = ConversationMessage.createUserMessage('Test message');
      
      const attachment: MessageAttachment = {
        id: 'att-2',
        name: 'document.pdf',
        type: 'application/pdf',
        size: 2048
      };

      message.addAttachment(attachment);

      expect(message.hasAttachments()).toBe(true);
      expect(message.getAttachments()).toHaveLength(1);
    });

    test('should remove attachment', () => {
      const attachments: MessageAttachment[] = [
        { id: 'att-1', name: 'file1.txt', type: 'text/plain' },
        { id: 'att-2', name: 'file2.txt', type: 'text/plain' }
      ];

      const message = ConversationMessage.createUserMessage('Files attached', {
        attachments
      });

      message.removeAttachment('att-1');

      expect(message.getAttachments()).toHaveLength(1);
      expect(message.getAttachments()[0].id).toBe('att-2');
    });
  });

  describe('Content Analysis', () => {
    test('should calculate word count', () => {
      const message = ConversationMessage.createUserMessage('This is a test message with seven words');
      expect(message.getWordCount()).toBe(8);
    });

    test('should detect code blocks', () => {
      const content = `
Here's some code:
\`\`\`javascript
console.log('Hello, world!');
\`\`\`

And some Python:
\`\`\`python
print("Hello, world!")
\`\`\`
      `;

      const message = ConversationMessage.createUserMessage(content);

      expect(message.hasCodeBlocks()).toBe(true);
      
      const codeBlocks = message.getCodeBlocks();
      expect(codeBlocks).toHaveLength(2);
      expect(codeBlocks[0].language).toBe('javascript');
      expect(codeBlocks[0].code).toBe("console.log('Hello, world!');");
      expect(codeBlocks[1].language).toBe('python');
    });

    test('should search content', () => {
      const message = ConversationMessage.createUserMessage('This is a Test Message');

      expect(message.contains('test')).toBe(true);
      expect(message.contains('test', true)).toBe(false);
      expect(message.contains('Test', true)).toBe(true);
    });

    test('should generate preview', () => {
      const longContent = 'A'.repeat(150);
      const message = ConversationMessage.createUserMessage(longContent);

      const preview = message.getPreview(50);
      expect(preview).toBe('A'.repeat(47) + '...');
      expect(preview.length).toBe(50);
    });
  });

  describe('Validation', () => {
    test('should validate message content length', () => {
      const longContent = 'A'.repeat(100001);
      const message = ConversationMessage.create('user', longContent);

      const validation = message.validate();

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Message content is too long (max 100,000 characters)');
    });

    test('should validate timestamp not in future', () => {
      const futureDate = new Date(Date.now() + 86400000); // Tomorrow
      const message = ConversationMessage.create('user', 'Test', {
        timestamp: futureDate
      });

      const validation = message.validate();

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Message timestamp cannot be in the future');
    });
  });
});
```

## 2. Value Object Tests

### 2.1 ProjectId Value Object Tests

```typescript
// tests/domain/value-objects/project-id.value-object.test.ts
import { ProjectId } from '@/domain/value-objects/project-id.value-object';

describe('ProjectId Value Object', () => {
  describe('Creation Methods', () => {
    test('should create from UUID', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const projectId = ProjectId.create(uuid);

      expect(projectId.getValue()).toBe(uuid);
      expect(projectId.isUUID()).toBe(true);
    });

    test('should generate new UUID if not provided', () => {
      const projectId = ProjectId.generate();
      
      expect(projectId.getValue()).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    test('should create from project name', () => {
      const projectId = ProjectId.fromName('My Test Project!');
      
      expect(projectId.getValue()).toBe('my-test-project');
      expect(projectId.isNormalizedName()).toBe(true);
    });

    test('should handle special characters in name', () => {
      const projectId = ProjectId.fromName('Test@#$%Project---123');
      
      expect(projectId.getValue()).toBe('test-project-123');
    });

    test('should throw error for empty name', () => {
      expect(() => ProjectId.fromName(''))
        .toThrow('Project name cannot be empty');
      
      expect(() => ProjectId.fromName('   '))
        .toThrow('Project name cannot be empty');
    });

    test('should throw error for non-alphanumeric name', () => {
      expect(() => ProjectId.fromName('@#$%'))
        .toThrow('Project name must contain alphanumeric characters');
    });
  });

  describe('Validation', () => {
    test('should accept valid ChatGPT-style IDs', () => {
      const validIds = [
        'my-project',
        'test_project_123',
        'Project-Name-2025',
        'abc123'
      ];

      validIds.forEach(id => {
        expect(() => ProjectId.create(id)).not.toThrow();
      });
    });

    test('should reject invalid IDs', () => {
      const invalidIds = [
        '',
        'a', // Too short
        'a'.repeat(101), // Too long
        'invalid id with spaces',
        'invalid!@#$'
      ];

      invalidIds.forEach(id => {
        expect(() => ProjectId.create(id))
          .toThrow(`Invalid project ID format: ${id}`);
      });
    });
  });

  describe('Display Methods', () => {
    test('should get display name from normalized ID', () => {
      const projectId = ProjectId.fromName('test automation project');
      
      expect(projectId.getDisplayName()).toBe('Test Automation Project');
    });

    test('should return original value for non-normalized IDs', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const projectId = ProjectId.create(uuid);
      
      expect(projectId.getDisplayName()).toBe(uuid);
    });

    test('should get shortened ID', () => {
      const longId = 'this-is-a-very-long-project-id-that-needs-shortening';
      const projectId = ProjectId.create(longId);
      
      expect(projectId.getShortId()).toBe('this-is-a-very-lo...');
      expect(projectId.getShortId().length).toBe(20);
    });
  });
});
```

## 3. Event Tests

### 3.1 Domain Event Tests

```typescript
// tests/domain/events/chatgpt-events.test.ts
import {
  ProjectSelectedEvent,
  ConversationStartedEvent,
  PromptSubmittedEvent,
  ResponseReceivedEvent,
  ConversationExportedEvent,
  FileUploadedEvent,
  createChatGPTEvent
} from '@/domain/events/chatgpt-events';

describe('ChatGPT Domain Events', () => {
  describe('ProjectSelectedEvent', () => {
    test('should create project selected event', () => {
      const event = new ProjectSelectedEvent({
        correlationId: 'corr-123',
        timestamp: new Date('2025-01-01T00:00:00Z'),
        domain: 'chatgpt.com',
        projectId: 'proj-123',
        projectName: 'Test Project',
        previousProjectId: 'proj-old',
        userId: 'user-123',
        sessionId: 'session-456'
      });

      expect(event.type).toBe('ProjectSelectedEvent');
      expect(event.getProjectId()).toBe('proj-123');
      expect(event.getProjectName()).toBe('Test Project');
      expect(event.getPreviousProjectId()).toBe('proj-old');
    });

    test('should serialize to JSON correctly', () => {
      const event = createChatGPTEvent(ProjectSelectedEvent, {
        projectId: 'proj-123',
        projectName: 'Test Project'
      });

      const json = event.toJSON();

      expect(json.type).toBe('ProjectSelectedEvent');
      expect(json.projectId).toBe('proj-123');
      expect(json.domain).toBe('chatgpt.com');
      expect(json.correlationId).toBeDefined();
    });
  });

  describe('PromptSubmittedEvent', () => {
    test('should create prompt submitted event with attachments', () => {
      const event = createChatGPTEvent(PromptSubmittedEvent, {
        conversationId: 'conv-123',
        messageId: 'msg-456',
        prompt: 'Analyze this image',
        model: 'gpt-4-vision',
        attachments: ['image1.png', 'image2.jpg']
      });

      expect(event.getPrompt()).toBe('Analyze this image');
      expect(event.getModel()).toBe('gpt-4-vision');
      expect(event.hasAttachments()).toBe(true);
      expect(event.getAttachments()).toHaveLength(2);
      expect(event.getPromptLength()).toBe(18);
    });
  });

  describe('ResponseReceivedEvent', () => {
    test('should create response received event with metrics', () => {
      const responseContent = 'Here is my analysis of the images...';
      
      const event = createChatGPTEvent(ResponseReceivedEvent, {
        conversationId: 'conv-123',
        messageId: 'msg-789',
        responseContent,
        model: 'gpt-4',
        responseTime: 2500,
        tokenCount: 150
      });

      expect(event.getResponseContent()).toBe(responseContent);
      expect(event.getResponseTime()).toBe(2500);
      expect(event.getTokenCount()).toBe(150);
      expect(event.getResponseLength()).toBe(responseContent.length);
    });
  });

  describe('ConversationExportedEvent', () => {
    test('should create conversation exported event', () => {
      const event = createChatGPTEvent(ConversationExportedEvent, {
        conversationId: 'conv-123',
        exportFormat: 'markdown',
        exportSize: 15360,
        messageCount: 42
      });

      expect(event.getExportFormat()).toBe('markdown');
      expect(event.getExportSize()).toBe(15360);
      expect(event.getMessageCount()).toBe(42);
    });
  });

  describe('FileUploadedEvent', () => {
    test('should create file uploaded event', () => {
      const event = createChatGPTEvent(FileUploadedEvent, {
        conversationId: 'conv-123',
        fileName: 'test-data.csv',
        fileSize: 2048000,
        fileType: 'text/csv',
        uploadId: 'upload-789'
      });

      expect(event.getFileName()).toBe('test-data.csv');
      expect(event.getFileSize()).toBe(2048000);
      expect(event.getFileType()).toBe('text/csv');
      expect(event.getUploadId()).toBe('upload-789');
    });
  });
});
```

## 4. Application Service Tests

### 4.1 Project Service Tests

```typescript
// tests/application/services/project.service.test.ts
import { ProjectService } from '@/application/services/project.service';
import { ProjectRepository } from '@/infrastructure/repositories/project.repository';
import { ChatGPTProject } from '@/domain/entities/chatgpt-project.entity';
import { EventBus } from 'typescript-eda-domain';

jest.mock('@/infrastructure/repositories/project.repository');
jest.mock('typescript-eda-domain');

describe('ProjectService', () => {
  let service: ProjectService;
  let mockRepository: jest.Mocked<ProjectRepository>;
  let mockEventBus: jest.Mocked<EventBus>;

  beforeEach(() => {
    mockRepository = new ProjectRepository() as jest.Mocked<ProjectRepository>;
    mockEventBus = new EventBus() as jest.Mocked<EventBus>;
    service = new ProjectService(mockRepository, mockEventBus);
  });

  describe('createProject', () => {
    test('should create and save new project', async () => {
      const projectData = {
        name: 'New Project',
        description: 'Test project',
        settings: {
          defaultModel: 'gpt-4-turbo'
        }
      };

      mockRepository.save.mockResolvedValue(undefined);

      const project = await service.createProject(projectData);

      expect(project.getName()).toBe('New Project');
      expect(project.getDescription()).toBe('Test project');
      expect(mockRepository.save).toHaveBeenCalledWith(project);
      expect(mockEventBus.publish).toHaveBeenCalled();
    });

    test('should handle repository errors', async () => {
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.createProject({ name: 'Test' }))
        .rejects.toThrow('Database error');
    });
  });

  describe('getProject', () => {
    test('should retrieve project by ID', async () => {
      const mockProject = ChatGPTProject.create('Test Project');
      mockRepository.findById.mockResolvedValue(mockProject);

      const project = await service.getProject('test-project');

      expect(project).toBe(mockProject);
      expect(mockRepository.findById).toHaveBeenCalledWith('test-project');
    });

    test('should throw error if project not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.getProject('non-existent'))
        .rejects.toThrow('Project not found: non-existent');
    });
  });

  describe('updateProjectSettings', () => {
    test('should update project settings', async () => {
      const mockProject = ChatGPTProject.create('Test Project');
      mockRepository.findById.mockResolvedValue(mockProject);
      mockRepository.save.mockResolvedValue(undefined);

      const newSettings = {
        defaultModel: 'gpt-3.5-turbo',
        autoSave: false
      };

      await service.updateProjectSettings('test-project', newSettings);

      expect(mockProject.getSettings()).toMatchObject(newSettings);
      expect(mockRepository.save).toHaveBeenCalledWith(mockProject);
    });
  });

  describe('deleteProject', () => {
    test('should delete project and emit event', async () => {
      const mockProject = ChatGPTProject.create('Test Project');
      mockRepository.findById.mockResolvedValue(mockProject);
      mockRepository.delete.mockResolvedValue(undefined);

      await service.deleteProject('test-project');

      expect(mockRepository.delete).toHaveBeenCalledWith('test-project');
      expect(mockEventBus.publish).toHaveBeenCalled();
    });
  });

  describe('searchProjects', () => {
    test('should search projects by query', async () => {
      const projects = [
        ChatGPTProject.create('JavaScript Tutorial'),
        ChatGPTProject.create('TypeScript Guide')
      ];

      mockRepository.findAll.mockResolvedValue(projects);

      const results = await service.searchProjects('script');

      expect(results).toHaveLength(2);
      expect(results[0].getName()).toBe('JavaScript Tutorial');
    });

    test('should return empty array for no matches', async () => {
      mockRepository.findAll.mockResolvedValue([
        ChatGPTProject.create('Python Tutorial')
      ]);

      const results = await service.searchProjects('javascript');

      expect(results).toHaveLength(0);
    });
  });
});
```

## 5. Infrastructure Tests

### 5.1 Repository Tests

```typescript
// tests/infrastructure/repositories/project.repository.test.ts
import { ProjectRepository } from '@/infrastructure/repositories/project.repository';
import { ChatGPTProject } from '@/domain/entities/chatgpt-project.entity';
import { ChatGPTDOMAdapter } from '@/infrastructure/adapters/chatgpt-dom.adapter';

jest.mock('@/infrastructure/adapters/chatgpt-dom.adapter');

describe('ProjectRepository', () => {
  let repository: ProjectRepository;
  let mockDOMAdapter: jest.Mocked<ChatGPTDOMAdapter>;

  beforeEach(() => {
    mockDOMAdapter = new ChatGPTDOMAdapter() as jest.Mocked<ChatGPTDOMAdapter>;
    repository = new ProjectRepository(mockDOMAdapter);
  });

  describe('save', () => {
    test('should persist project to storage', async () => {
      const project = ChatGPTProject.create('Test Project');
      mockDOMAdapter.saveToLocalStorage.mockResolvedValue(undefined);

      await repository.save(project);

      expect(mockDOMAdapter.saveToLocalStorage).toHaveBeenCalledWith(
        `project:${project.getId()}`,
        project.toJSON()
      );
    });

    test('should handle save errors', async () => {
      const project = ChatGPTProject.create('Test Project');
      mockDOMAdapter.saveToLocalStorage.mockRejectedValue(
        new Error('Storage quota exceeded')
      );

      await expect(repository.save(project))
        .rejects.toThrow('Storage quota exceeded');
    });
  });

  describe('findById', () => {
    test('should retrieve project from storage', async () => {
      const projectData = {
        id: 'test-project',
        name: 'Test Project',
        conversations: [],
        isActive: true,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      };

      mockDOMAdapter.getFromLocalStorage.mockResolvedValue(projectData);

      const project = await repository.findById('test-project');

      expect(project).toBeDefined();
      expect(project?.getName()).toBe('Test Project');
      expect(mockDOMAdapter.getFromLocalStorage).toHaveBeenCalledWith('project:test-project');
    });

    test('should return null if project not found', async () => {
      mockDOMAdapter.getFromLocalStorage.mockResolvedValue(null);

      const project = await repository.findById('non-existent');

      expect(project).toBeNull();
    });
  });

  describe('findAll', () => {
    test('should retrieve all projects', async () => {
      const projectKeys = ['project:proj-1', 'project:proj-2'];
      const projectData1 = {
        id: 'proj-1',
        name: 'Project 1',
        conversations: [],
        isActive: true,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      };
      const projectData2 = {
        id: 'proj-2',
        name: 'Project 2',
        conversations: [],
        isActive: true,
        createdAt: '2025-01-02T00:00:00Z',
        updatedAt: '2025-01-02T00:00:00Z'
      };

      mockDOMAdapter.getAllKeys.mockResolvedValue(projectKeys);
      mockDOMAdapter.getFromLocalStorage
        .mockResolvedValueOnce(projectData1)
        .mockResolvedValueOnce(projectData2);

      const projects = await repository.findAll();

      expect(projects).toHaveLength(2);
      expect(projects[0].getName()).toBe('Project 1');
      expect(projects[1].getName()).toBe('Project 2');
    });
  });

  describe('delete', () => {
    test('should remove project from storage', async () => {
      mockDOMAdapter.removeFromLocalStorage.mockResolvedValue(undefined);

      await repository.delete('test-project');

      expect(mockDOMAdapter.removeFromLocalStorage).toHaveBeenCalledWith('project:test-project');
    });
  });
});
```

### 5.2 DOM Adapter Tests

```typescript
// tests/infrastructure/adapters/chatgpt-dom.adapter.test.ts
import { ChatGPTDOMAdapter } from '@/infrastructure/adapters/chatgpt-dom.adapter';

describe('ChatGPTDOMAdapter', () => {
  let adapter: ChatGPTDOMAdapter;

  beforeEach(() => {
    adapter = new ChatGPTDOMAdapter();
    // Clear localStorage
    localStorage.clear();
  });

  describe('Project Navigation', () => {
    test('should find project selector element', async () => {
      // Mock DOM structure
      document.body.innerHTML = `
        <div>
          <button data-testid="project-selector">Select Project</button>
          <div class="project-list">
            <div class="project-item" data-project-id="proj-1">Project 1</div>
            <div class="project-item" data-project-id="proj-2">Project 2</div>
          </div>
        </div>
      `;

      const selector = await adapter.findProjectSelector();
      expect(selector).toBeDefined();
      expect(selector?.getAttribute('data-testid')).toBe('project-selector');
    });

    test('should click on project', async () => {
      const projectElement = document.createElement('div');
      projectElement.classList.add('project-item');
      projectElement.setAttribute('data-project-id', 'test-project');
      
      const clickSpy = jest.fn();
      projectElement.addEventListener('click', clickSpy);
      
      document.body.appendChild(projectElement);

      await adapter.clickProject('test-project');

      expect(clickSpy).toHaveBeenCalled();
    });
  });

  describe('Message Input', () => {
    test('should find and fill message input', async () => {
      document.body.innerHTML = `
        <textarea 
          id="prompt-textarea" 
          placeholder="Send a message..."
        ></textarea>
      `;

      const textarea = document.getElementById('prompt-textarea') as HTMLTextAreaElement;
      
      await adapter.fillMessageInput('Test message');

      expect(textarea.value).toBe('Test message');
    });

    test('should trigger input event when filling message', async () => {
      document.body.innerHTML = `
        <textarea id="prompt-textarea"></textarea>
      `;

      const textarea = document.getElementById('prompt-textarea') as HTMLTextAreaElement;
      const inputSpy = jest.fn();
      textarea.addEventListener('input', inputSpy);

      await adapter.fillMessageInput('Test');

      expect(inputSpy).toHaveBeenCalled();
    });
  });

  describe('Send Button', () => {
    test('should find and click send button', async () => {
      document.body.innerHTML = `
        <button data-testid="send-button" aria-label="Send message">
          Send
        </button>
      `;

      const button = document.querySelector('[data-testid="send-button"]') as HTMLButtonElement;
      const clickSpy = jest.fn();
      button.addEventListener('click', clickSpy);

      await adapter.clickSendButton();

      expect(clickSpy).toHaveBeenCalled();
    });

    test('should wait for button to be enabled', async () => {
      document.body.innerHTML = `
        <button data-testid="send-button" disabled>Send</button>
      `;

      const button = document.querySelector('[data-testid="send-button"]') as HTMLButtonElement;
      
      // Simulate button becoming enabled after delay
      setTimeout(() => {
        button.disabled = false;
      }, 100);

      await adapter.clickSendButton();

      expect(button.disabled).toBe(false);
    });
  });

  describe('Conversation Messages', () => {
    test('should extract messages from conversation', async () => {
      document.body.innerHTML = `
        <div class="conversation">
          <div class="message user-message">
            <div class="message-content">Hello, ChatGPT!</div>
          </div>
          <div class="message assistant-message">
            <div class="message-content">Hello! How can I help you today?</div>
          </div>
        </div>
      `;

      const messages = await adapter.getConversationMessages();

      expect(messages).toHaveLength(2);
      expect(messages[0].role).toBe('user');
      expect(messages[0].content).toBe('Hello, ChatGPT!');
      expect(messages[1].role).toBe('assistant');
      expect(messages[1].content).toBe('Hello! How can I help you today?');
    });
  });

  describe('File Upload', () => {
    test('should trigger file upload', async () => {
      document.body.innerHTML = `
        <input type="file" id="file-upload" accept="image/*,.pdf,.txt" />
      `;

      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      const changeSpy = jest.fn();
      fileInput.addEventListener('change', changeSpy);

      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      
      await adapter.uploadFile(file);

      expect(changeSpy).toHaveBeenCalled();
      expect(fileInput.files?.[0]).toBe(file);
    });
  });

  describe('Download Response', () => {
    test('should download conversation as text file', async () => {
      const createElementSpy = jest.spyOn(document, 'createElement');
      const clickSpy = jest.fn();
      
      // Mock anchor element
      const mockAnchor = {
        href: '',
        download: '',
        click: clickSpy,
        remove: jest.fn()
      };
      
      createElementSpy.mockReturnValue(mockAnchor as any);

      const content = 'Conversation content here';
      await adapter.downloadResponse('conv-123', content, 'text');

      expect(mockAnchor.download).toBe('conversation-conv-123.txt');
      expect(mockAnchor.href).toContain('data:text/plain');
      expect(clickSpy).toHaveBeenCalled();
    });
  });

  describe('LocalStorage Operations', () => {
    test('should save and retrieve from localStorage', async () => {
      const testData = { name: 'Test Project', id: 'test-123' };
      
      await adapter.saveToLocalStorage('test-key', testData);
      const retrieved = await adapter.getFromLocalStorage('test-key');

      expect(retrieved).toEqual(testData);
    });

    test('should handle localStorage errors', async () => {
      // Mock localStorage to throw error
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = jest.fn(() => {
        throw new Error('QuotaExceededError');
      });

      await expect(adapter.saveToLocalStorage('key', { data: 'value' }))
        .rejects.toThrow('QuotaExceededError');

      Storage.prototype.setItem = originalSetItem;
    });

    test('should remove from localStorage', async () => {
      localStorage.setItem('test-key', 'test-value');
      
      await adapter.removeFromLocalStorage('test-key');
      
      expect(localStorage.getItem('test-key')).toBeNull();
    });

    test('should get all keys with prefix', async () => {
      localStorage.setItem('project:1', 'data1');
      localStorage.setItem('project:2', 'data2');
      localStorage.setItem('other:1', 'data3');

      const keys = await adapter.getAllKeys('project:');

      expect(keys).toHaveLength(2);
      expect(keys).toContain('project:1');
      expect(keys).toContain('project:2');
      expect(keys).not.toContain('other:1');
    });
  });

  describe('Wait Utilities', () => {
    test('should wait for element to appear', async () => {
      // Add element after delay
      setTimeout(() => {
        const div = document.createElement('div');
        div.className = 'delayed-element';
        document.body.appendChild(div);
      }, 100);

      const element = await adapter.waitForElement('.delayed-element');
      
      expect(element).toBeDefined();
      expect(element?.className).toBe('delayed-element');
    });

    test('should timeout waiting for element', async () => {
      await expect(adapter.waitForElement('.non-existent', 1000))
        .rejects.toThrow('Element .non-existent not found within timeout');
    });
  });
});
```

## 6. Integration Tests

### 6.1 End-to-End ChatGPT Workflow Tests

```typescript
// tests/integration/chatgpt-workflow.test.ts
import { ChatGPTClient } from '@/chatgpt.client';
import { ChatGPTDOMAdapter } from '@/infrastructure/adapters/chatgpt-dom.adapter';
import { ChatGPTCommunicationAdapter } from '@/infrastructure/adapters/chatgpt-communication.adapter';
import { EventBus } from 'typescript-eda-domain';

describe('ChatGPT Integration Tests', () => {
  let client: ChatGPTClient;
  let domAdapter: ChatGPTDOMAdapter;
  let commAdapter: ChatGPTCommunicationAdapter;
  let eventBus: EventBus;

  beforeEach(() => {
    domAdapter = new ChatGPTDOMAdapter();
    commAdapter = new ChatGPTCommunicationAdapter();
    eventBus = new EventBus();
    
    client = new ChatGPTClient({
      domAdapter,
      communicationAdapter: commAdapter,
      eventBus
    });
  });

  describe('Complete Conversation Flow', () => {
    test('should handle full conversation lifecycle', async () => {
      // 1. Create project
      const project = await client.createProject({
        name: 'Integration Test Project',
        settings: {
          defaultModel: 'gpt-4',
          customInstructions: 'You are a helpful test assistant'
        }
      });

      expect(project.getId()).toBeDefined();

      // 2. Start conversation
      const conversation = await client.startConversation({
        projectId: project.getId(),
        title: 'Test Conversation'
      });

      expect(conversation.getProjectId()).toBe(project.getId());

      // 3. Send message
      const prompt = 'Explain quantum computing in simple terms';
      const response = await client.sendMessage({
        conversationId: conversation.getId(),
        content: prompt
      });

      expect(response).toBeDefined();
      expect(response.role).toBe('assistant');
      expect(response.content.length).toBeGreaterThan(0);

      // 4. Export conversation
      const exported = await client.exportConversation(
        conversation.getId(),
        'markdown'
      );

      expect(exported).toContain('# Test Conversation');
      expect(exported).toContain(prompt);
      expect(exported).toContain(response.content);
    });
  });

  describe('File Upload Flow', () => {
    test('should upload file and process in conversation', async () => {
      const conversation = await client.startConversation({
        title: 'File Analysis'
      });

      const testFile = new File(
        ['Sample,Data\n1,2\n3,4'],
        'test-data.csv',
        { type: 'text/csv' }
      );

      const uploadResult = await client.uploadFile({
        conversationId: conversation.getId(),
        file: testFile
      });

      expect(uploadResult.uploadId).toBeDefined();
      expect(uploadResult.fileName).toBe('test-data.csv');

      const response = await client.sendMessage({
        conversationId: conversation.getId(),
        content: 'Analyze this CSV file',
        attachments: [uploadResult.uploadId]
      });

      expect(response.content).toContain('CSV');
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors gracefully', async () => {
      // Mock network failure
      jest.spyOn(commAdapter, 'sendRequest').mockRejectedValue(
        new Error('Network error')
      );

      await expect(client.sendMessage({
        conversationId: 'conv-123',
        content: 'Test message'
      })).rejects.toThrow('Network error');
    });

    test('should handle rate limiting', async () => {
      // Mock rate limit response
      jest.spyOn(commAdapter, 'sendRequest').mockRejectedValue({
        status: 429,
        message: 'Too many requests'
      });

      await expect(client.sendMessage({
        conversationId: 'conv-123',
        content: 'Test'
      })).rejects.toMatchObject({
        status: 429
      });
    });
  });

  describe('Event Publishing', () => {
    test('should publish events during workflow', async () => {
      const publishSpy = jest.spyOn(eventBus, 'publish');

      const project = await client.createProject({
        name: 'Event Test Project'
      });

      await client.selectProject(project.getId());

      const conversation = await client.startConversation({
        projectId: project.getId(),
        title: 'Event Test'
      });

      await client.sendMessage({
        conversationId: conversation.getId(),
        content: 'Test prompt'
      });

      expect(publishSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'ProjectSelectedEvent'
        })
      );

      expect(publishSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'ConversationStartedEvent'
        })
      );

      expect(publishSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'PromptSubmittedEvent'
        })
      );
    });
  });
});
```

## 7. Performance Tests

```typescript
// tests/performance/chatgpt-performance.test.ts
describe('ChatGPT Performance Tests', () => {
  test('should handle large conversations efficiently', async () => {
    const conversation = ChatGPTConversation.create('perf-test', 'Performance Test');
    
    const startTime = performance.now();
    
    // Add 1000 messages
    for (let i = 0; i < 1000; i++) {
      const message = i % 2 === 0
        ? ConversationMessage.createUserMessage(`Question ${i}`)
        : ConversationMessage.createAssistantMessage(`Answer ${i}`);
      
      conversation.addMessage(message);
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(100); // Should complete in under 100ms
    expect(conversation.getMessageCount()).toBe(1000);
  });

  test('should search large project collection quickly', async () => {
    const projects: ChatGPTProject[] = [];
    
    // Create 100 projects
    for (let i = 0; i < 100; i++) {
      const project = ChatGPTProject.create(`Project ${i}`, {
        description: `Description for project number ${i}`
      });
      
      // Add 10 conversations to each project
      for (let j = 0; j < 10; j++) {
        const conv = ChatGPTConversation.create(`conv-${i}-${j}`, `Conv ${j}`);
        project.addConversation(conv);
      }
      
      projects.push(project);
    }
    
    const startTime = performance.now();
    
    // Search through all projects
    const results = projects.filter(p => 
      p.searchConversations('Conv 5').length > 0
    );
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(50); // Should complete in under 50ms
    expect(results).toHaveLength(100); // All projects have a "Conv 5"
  });

  test('should export large conversations efficiently', async () => {
    const conversation = ChatGPTConversation.create('export-test', 'Export Test');
    
    // Add 500 messages with code blocks
    for (let i = 0; i < 500; i++) {
      const content = `
Message ${i}
\`\`\`javascript
function example${i}() {
  console.log('Example ${i}');
  return ${i};
}
\`\`\`
More text here...
      `;
      
      const message = i % 2 === 0
        ? ConversationMessage.createUserMessage(content)
        : ConversationMessage.createAssistantMessage(content);
      
      conversation.addMessage(message);
    }
    
    const startTime = performance.now();
    
    const markdown = conversation.exportAs('markdown');
    const json = conversation.exportAs('json');
    const text = conversation.exportAs('text');
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(200); // All exports in under 200ms
    expect(markdown.length).toBeGreaterThan(50000);
    expect(JSON.parse(json).messages).toHaveLength(500);
  });
});
```

## 8. Test Execution Plan

### Phase 1: Unit Tests (Week 1)
- Domain entities
- Value objects
- Domain events
- Utility functions

### Phase 2: Service Tests (Week 2)
- Application services
- Repository layer
- Infrastructure adapters

### Phase 3: Integration Tests (Week 3)
- End-to-end workflows
- Event publishing
- Error scenarios

### Phase 4: Performance & Edge Cases (Week 4)
- Performance benchmarks
- Memory usage tests
- Concurrency tests
- Edge case handling

## 9. CI/CD Integration

```yaml
# .github/workflows/chatgpt-tests.yml
name: ChatGPT Extension Tests

on:
  push:
    paths:
      - 'chatgpt.com/**'
      - '.github/workflows/chatgpt-tests.yml'
  pull_request:
    paths:
      - 'chatgpt.com/**'

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          cd chatgpt.com
          npm ci
          
      - name: Run linting
        run: |
          cd chatgpt.com
          npm run lint
          
      - name: Run type checking
        run: |
          cd chatgpt.com
          npm run typecheck
          
      - name: Run unit tests
        run: |
          cd chatgpt.com
          npm run test:unit
          
      - name: Run integration tests
        run: |
          cd chatgpt.com
          npm run test:integration
          
      - name: Run performance tests
        run: |
          cd chatgpt.com
          npm run test:performance
          
      - name: Generate coverage report
        run: |
          cd chatgpt.com
          npm run test:coverage
          
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./chatgpt.com/coverage/lcov.info
          flags: chatgpt-extension
          
      - name: Check coverage thresholds
        run: |
          cd chatgpt.com
          npm run test:coverage:check
```

## 10. Mock Utilities

```typescript
// tests/__mocks__/typescript-eda-domain.ts
export class Entity<T> {
  constructor(protected props: T) {}
  
  protected updateProps(updates: Partial<T>): void {
    Object.assign(this.props, updates);
  }
}

export class ValueObject<T> {
  constructor(protected props: T) {}
}

export abstract class Event {
  abstract type: string;
  abstract correlationId: string;
  abstract timestamp: Date;
  abstract toJSON(): Record<string, unknown>;
}

export class EventBus {
  publish = jest.fn();
  subscribe = jest.fn();
}

// tests/test-utils/builders.ts
export class ProjectBuilder {
  private name = 'Test Project';
  private settings: any = {};
  private conversations: any[] = [];

  withName(name: string): this {
    this.name = name;
    return this;
  }

  withSettings(settings: any): this {
    this.settings = settings;
    return this;
  }

  withConversations(conversations: any[]): this {
    this.conversations = conversations;
    return this;
  }

  build(): any {
    const project = ChatGPTProject.create(this.name, {
      settings: this.settings
    });

    this.conversations.forEach(conv => {
      project.addConversation(conv);
    });

    return project;
  }
}

export class ConversationBuilder {
  private id = 'conv-test';
  private title = 'Test Conversation';
  private messages: any[] = [];

  withId(id: string): this {
    this.id = id;
    return this;
  }

  withTitle(title: string): this {
    this.title = title;
    return this;
  }

  withMessages(messages: any[]): this {
    this.messages = messages;
    return this;
  }

  build(): any {
    const conversation = ChatGPTConversation.create(this.id, this.title);
    
    this.messages.forEach(msg => {
      conversation.addMessage(msg);
    });

    return conversation;
  }
}
```

## Summary

This enhanced test suite provides comprehensive coverage for the ChatGPT extension with:

1. **Complete domain coverage**: All entities, value objects, and events tested
2. **Real implementation testing**: Tests based on actual codebase structure
3. **Performance benchmarks**: Ensures scalability for large conversations
4. **Integration workflows**: End-to-end testing of real user scenarios
5. **Error handling**: Comprehensive error and edge case coverage
6. **CI/CD ready**: Full automation pipeline configuration
7. **85%+ coverage target**: Meets enterprise-grade quality standards

The test suite is designed to catch regressions, ensure reliability, and maintain code quality as the ChatGPT extension evolves.