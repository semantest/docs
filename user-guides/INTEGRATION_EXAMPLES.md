# Semantest Integration Examples

## Overview

This guide provides comprehensive integration examples for connecting Semantest with popular development tools, frameworks, and platforms. Learn how to seamlessly integrate testing workflows with your existing development stack.

## Table of Contents

1. [CI/CD Integrations](#cicd-integrations)
2. [Framework Integrations](#framework-integrations)
3. [Database Integrations](#database-integrations)
4. [Cloud Platform Integrations](#cloud-platform-integrations)
5. [Monitoring & Analytics](#monitoring--analytics)
6. [Communication Tools](#communication-tools)
7. [Version Control Systems](#version-control-systems)
8. [IDE & Editor Integrations](#ide--editor-integrations)

## CI/CD Integrations

### GitHub Actions

```yaml
# .github/workflows/semantest.yml
name: Semantest Testing Pipeline
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Setup Semantest
        run: |
          npm install -g @semantest/cli
          semantest init --ci
      
      - name: Run Semantest tests
        env:
          SEMANTEST_API_KEY: ${{ secrets.SEMANTEST_API_KEY }}
          DATABASE_URL: postgres://postgres:postgres@localhost:5432/test
        run: |
          semantest test --coverage --parallel --reporter github-actions
          semantest report --upload
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: semantest-results
          path: |
            test-results/
            coverage/
      
      - name: Comment PR
        uses: actions/github-script@v6
        if: github.event_name == 'pull_request'
        with:
          script: |
            const fs = require('fs');
            const results = JSON.parse(fs.readFileSync('test-results/summary.json'));
            const comment = `
            ## 🧪 Semantest Test Results
            
            ✅ **${results.passed}** tests passed  
            ❌ **${results.failed}** tests failed  
            📊 **${results.coverage}%** coverage
            
            [View detailed results](${results.reportUrl})
            `;
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
```

### GitLab CI

```yaml
# .gitlab-ci.yml
stages:
  - test
  - deploy
  - report

variables:
  POSTGRES_DB: test_db
  POSTGRES_USER: postgres
  POSTGRES_PASSWORD: postgres

test:semantest:
  stage: test
  image: node:18-alpine
  services:
    - postgres:13-alpine
  
  before_script:
    - npm ci
    - npm install -g @semantest/cli
    - semantest init --ci
  
  script:
    - semantest test --coverage --parallel --reporter gitlab
    - semantest blockchain --certify-results
  
  artifacts:
    when: always
    reports:
      junit: test-results/junit.xml
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
    paths:
      - test-results/
      - coverage/
    expire_in: 1 week
  
  coverage: '/Statements\s*:\s*([^%]+)/'

deploy:staging:
  stage: deploy
  script:
    - semantest deploy --environment staging
    - semantest test --smoke-tests --environment staging
  only:
    - develop

report:semantest:
  stage: report
  script:
    - semantest report --generate-insights
    - semantest marketplace --publish-results
  when: always
```

### Jenkins Pipeline

```groovy
// Jenkinsfile
pipeline {
    agent any
    
    environment {
        SEMANTEST_API_KEY = credentials('semantest-api-key')
        NODE_VERSION = '18'
    }
    
    stages {
        stage('Setup') {
            steps {
                script {
                    // Setup Node.js
                    sh "nvm use ${NODE_VERSION}"
                    sh 'npm ci'
                    sh 'npm install -g @semantest/cli'
                }
            }
        }
        
        stage('Lint & Type Check') {
            parallel {
                stage('ESLint') {
                    steps {
                        sh 'npm run lint'
                    }
                }
                stage('TypeScript') {
                    steps {
                        sh 'npm run type-check'
                    }
                }
                stage('Semantest Analyze') {
                    steps {
                        sh 'semantest analyze --code-quality'
                    }
                }
            }
        }
        
        stage('Test') {
            parallel {
                stage('Unit Tests') {
                    steps {
                        sh 'semantest test --unit --coverage'
                    }
                }
                stage('Integration Tests') {
                    steps {
                        sh 'semantest test --integration --docker'
                    }
                }
                stage('E2E Tests') {
                    steps {
                        sh 'semantest test --e2e --browser chrome,firefox'
                    }
                }
            }
        }
        
        stage('Security Scan') {
            steps {
                sh 'semantest security --scan --block-on-critical'
            }
        }
        
        stage('Performance Tests') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                sh 'semantest performance --load-test --baseline'
            }
        }
        
        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                sh 'semantest deploy --production --wait-for-health'
                sh 'semantest test --smoke --production'
            }
        }
    }
    
    post {
        always {
            publishHTML([
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'test-results',
                reportFiles: 'index.html',
                reportName: 'Semantest Test Report'
            ])
            
            publishCoverage(
                adapters: [istanbulCoberturaAdapter('coverage/cobertura-coverage.xml')],
                sourceFileResolver: sourceFiles('STORE_LAST_BUILD')
            )
        }
        
        failure {
            script {
                sh 'semantest report --failure-analysis'
                slackSend(
                    color: 'danger',
                    message: "❌ Build Failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
                )
            }
        }
        
        success {
            script {
                sh 'semantest report --success-metrics'
                slackSend(
                    color: 'good',
                    message: "✅ Build Successful: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
                )
            }
        }
    }
}
```

## Framework Integrations

### React Integration

```javascript
// semantest.react.config.js
module.exports = {
  framework: 'react',
  
  testEnvironment: 'jsdom',
  
  setupFilesAfterEnv: [
    '@testing-library/jest-dom',
    '<rootDir>/src/setupTests.js'
  ],
  
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
    '^.+\\.css$': 'jest-css-modules-transform'
  },
  
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  
  semantest: {
    reactTesting: {
      renderOptions: {
        wrapper: 'providers/TestWrapper',
        queries: '@testing-library/react'
      },
      
      mockComponents: [
        'react-router-dom',
        'react-redux',
        '@apollo/client'
      ],
      
      coverage: {
        collectCoverageFrom: [
          'src/components/**/*.{js,jsx,ts,tsx}',
          'src/hooks/**/*.{js,jsx,ts,tsx}',
          '!src/**/*.stories.{js,jsx,ts,tsx}'
        ]
      }
    }
  }
};

// Component test example
import { render, screen, userEvent } from '@semantest/react-testing';
import { TodoApp } from './TodoApp';

describe('TodoApp Integration', () => {
  test('should add and complete todos', async () => {
    const user = userEvent.setup();
    
    render(<TodoApp />, {
      withProviders: ['redux', 'router'],
      initialState: { todos: [] }
    });
    
    // Add todo
    const input = screen.getByLabelText('Add todo');
    await user.type(input, 'Learn Semantest');
    await user.click(screen.getByRole('button', { name: 'Add' }));
    
    // Verify todo appears
    expect(screen.getByText('Learn Semantest')).toBeInTheDocument();
    
    // Complete todo
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    
    expect(checkbox).toBeChecked();
    
    // Verify in analytics
    expect(screen.getByTestId('completed-count')).toHaveTextContent('1');
  });
});
```

### Vue.js Integration

```javascript
// semantest.vue.config.js
module.exports = {
  framework: 'vue',
  
  testEnvironment: '@vue/test-utils/environment',
  
  transform: {
    '^.+\\.vue$': '@vue/vue3-jest',
    '^.+\\.(js|ts)$': 'babel-jest'
  },
  
  moduleFileExtensions: ['js', 'ts', 'json', 'vue'],
  
  semantest: {
    vueTesting: {
      global: {
        plugins: ['vuex', 'vue-router', 'vue-i18n'],
        mocks: {
          $t: (msg) => msg,
          $router: { push: jest.fn() }
        }
      },
      
      coverage: {
        collectCoverageFrom: [
          'src/components/**/*.vue',
          'src/views/**/*.vue',
          'src/composables/**/*.{js,ts}'
        ]
      }
    }
  }
};

// Vue component test
import { mount } from '@vue/test-utils';
import { createStore } from 'vuex';
import UserProfile from './UserProfile.vue';

describe('UserProfile Component', () => {
  let store;
  
  beforeEach(() => {
    store = createStore({
      state: {
        user: { name: 'John Doe', email: 'john@example.com' }
      },
      actions: {
        updateProfile: jest.fn()
      }
    });
  });
  
  test('should update user profile', async () => {
    const wrapper = mount(UserProfile, {
      global: {
        plugins: [store]
      }
    });
    
    // Update name
    await wrapper.find('[data-testid="name-input"]').setValue('Jane Doe');
    await wrapper.find('[data-testid="save-button"]').trigger('click');
    
    expect(store.dispatch).toHaveBeenCalledWith('updateProfile', {
      name: 'Jane Doe',
      email: 'john@example.com'
    });
  });
});
```

### Angular Integration

```typescript
// semantest.angular.config.ts
import { Config } from '@semantest/angular';

export const config: Config = {
  framework: 'angular',
  
  testEnvironment: '@angular/platform-browser-dynamic/testing',
  
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  
  semantest: {
    angularTesting: {
      imports: [
        'HttpClientTestingModule',
        'RouterTestingModule',
        'ReactiveFormsModule'
      ],
      
      providers: [
        'AuthService',
        'DataService'
      ],
      
      coverage: {
        collectCoverageFrom: [
          'src/app/**/*.ts',
          '!src/app/**/*.module.ts',
          '!src/app/**/*.spec.ts'
        ]
      }
    }
  }
};

// Angular service test
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });
    
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  
  test('should fetch user data', () => {
    const mockUser = { id: 1, name: 'John Doe' };
    
    service.getUser(1).subscribe(user => {
      expect(user).toEqual(mockUser);
    });
    
    const req = httpMock.expectOne('/api/users/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockUser);
  });
  
  afterEach(() => {
    httpMock.verify();
  });
});
```

## Database Integrations

### PostgreSQL Integration

```javascript
// semantest.database.config.js
module.exports = {
  databases: {
    postgres: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'test_db',
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || 'postgres',
      
      testDatabase: 'semantest_test',
      
      migrations: {
        directory: './migrations',
        autoRun: true
      },
      
      seeds: {
        directory: './seeds',
        autoRun: true
      }
    }
  }
};

// Database test helper
import { Pool } from 'pg';
import { migrate } from 'postgres-migrations';

class DatabaseTestHelper {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.TEST_DATABASE_URL
    });
  }
  
  async setup() {
    // Run migrations
    await migrate({ client: this.pool }, './migrations');
    
    // Seed test data
    await this.seedTestData();
  }
  
  async cleanup() {
    // Truncate all tables
    const client = await this.pool.connect();
    try {
      await client.query('TRUNCATE TABLE users, posts, comments CASCADE');
    } finally {
      client.release();
    }
  }
  
  async seedTestData() {
    const client = await this.pool.connect();
    try {
      await client.query(`
        INSERT INTO users (email, name) VALUES 
        ('test@example.com', 'Test User'),
        ('admin@example.com', 'Admin User')
      `);
    } finally {
      client.release();
    }
  }
}

// Database integration test
describe('User Repository', () => {
  let dbHelper;
  let userRepo;
  
  beforeAll(async () => {
    dbHelper = new DatabaseTestHelper();
    await dbHelper.setup();
    userRepo = new UserRepository(dbHelper.pool);
  });
  
  beforeEach(async () => {
    await dbHelper.cleanup();
    await dbHelper.seedTestData();
  });
  
  test('should create user with profile', async () => {
    const userData = {
      email: 'newuser@example.com',
      name: 'New User',
      profile: {
        bio: 'Test bio',
        avatar: 'avatar.jpg'
      }
    };
    
    const user = await userRepo.create(userData);
    
    expect(user.id).toBeDefined();
    expect(user.email).toBe(userData.email);
    
    // Verify in database
    const dbUser = await userRepo.findById(user.id);
    expect(dbUser.profile.bio).toBe('Test bio');
  });
});
```

### MongoDB Integration

```javascript
// MongoDB test setup
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

class MongoTestHelper {
  constructor() {
    this.mongod = null;
  }
  
  async connect() {
    this.mongod = await MongoMemoryServer.create();
    const uri = this.mongod.getUri();
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  }
  
  async disconnect() {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await this.mongod.stop();
  }
  
  async clearDatabase() {
    const collections = mongoose.connection.collections;
    
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
}

// MongoDB integration test
import { User } from '../models/User';

describe('User Model Integration', () => {
  let mongoHelper;
  
  beforeAll(async () => {
    mongoHelper = new MongoTestHelper();
    await mongoHelper.connect();
  });
  
  afterAll(async () => {
    await mongoHelper.disconnect();
  });
  
  beforeEach(async () => {
    await mongoHelper.clearDatabase();
  });
  
  test('should save user with encrypted password', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'plaintext',
      profile: {
        firstName: 'John',
        lastName: 'Doe'
      }
    };
    
    const user = new User(userData);
    await user.save();
    
    // Password should be encrypted
    expect(user.password).not.toBe('plaintext');
    expect(user.password).toMatch(/^\$2[aby]\$\d+\$/);
    
    // Should authenticate with original password
    const isValid = await user.comparePassword('plaintext');
    expect(isValid).toBe(true);
  });
});
```

## Cloud Platform Integrations

### AWS Integration

```javascript
// AWS test configuration
import AWS from 'aws-sdk';
import { LocalStack } from '@semantest/localstack';

// AWS service mocking
AWS.config.update({
  region: 'us-east-1',
  endpoint: 'http://localhost:4566', // LocalStack
  accessKeyId: 'test',
  secretAccessKey: 'test'
});

describe('AWS Services Integration', () => {
  let localstack;
  
  beforeAll(async () => {
    localstack = new LocalStack();
    await localstack.start();
  });
  
  afterAll(async () => {
    await localstack.stop();
  });
  
  test('should upload file to S3', async () => {
    const s3 = new AWS.S3();
    const bucketName = 'test-bucket';
    
    // Create bucket
    await s3.createBucket({ Bucket: bucketName }).promise();
    
    // Upload file
    const uploadParams = {
      Bucket: bucketName,
      Key: 'test-file.txt',
      Body: 'Test content'
    };
    
    const result = await s3.upload(uploadParams).promise();
    
    expect(result.Location).toContain(bucketName);
    expect(result.Key).toBe('test-file.txt');
    
    // Verify file exists
    const object = await s3.getObject({
      Bucket: bucketName,
      Key: 'test-file.txt'
    }).promise();
    
    expect(object.Body.toString()).toBe('Test content');
  });
  
  test('should send SQS message', async () => {
    const sqs = new AWS.SQS();
    const queueName = 'test-queue';
    
    // Create queue
    const createResult = await sqs.createQueue({
      QueueName: queueName
    }).promise();
    
    // Send message
    await sqs.sendMessage({
      QueueUrl: createResult.QueueUrl,
      MessageBody: JSON.stringify({ test: 'data' })
    }).promise();
    
    // Receive message
    const messages = await sqs.receiveMessage({
      QueueUrl: createResult.QueueUrl,
      MaxNumberOfMessages: 1
    }).promise();
    
    expect(messages.Messages).toHaveLength(1);
    const messageBody = JSON.parse(messages.Messages[0].Body);
    expect(messageBody.test).toBe('data');
  });
});
```

### Azure Integration

```javascript
// Azure integration testing
import { BlobServiceClient } from '@azure/storage-blob';
import { ServiceBusClient } from '@azure/service-bus';

// Use Azurite for local Azure emulation
const STORAGE_CONNECTION_STRING = 'UseDevelopmentStorage=true';
const SERVICE_BUS_CONNECTION = process.env.AZURE_SERVICE_BUS_CONNECTION_STRING;

describe('Azure Services Integration', () => {
  test('should store blob in Azure Storage', async () => {
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      STORAGE_CONNECTION_STRING
    );
    
    const containerName = 'test-container';
    const containerClient = blobServiceClient.getContainerClient(containerName);
    
    // Create container
    await containerClient.createIfNotExists();
    
    // Upload blob
    const blobName = 'test-blob.txt';
    const blobClient = containerClient.getBlockBlobClient(blobName);
    
    const uploadData = 'Test blob content';
    await blobClient.upload(uploadData, uploadData.length);
    
    // Download and verify
    const downloadResponse = await blobClient.download();
    const downloadedContent = await streamToString(downloadResponse.readableStreamBody);
    
    expect(downloadedContent).toBe(uploadData);
  });
  
  test('should send message to Service Bus', async () => {
    const serviceBusClient = new ServiceBusClient(SERVICE_BUS_CONNECTION);
    
    const queueName = 'test-queue';
    const sender = serviceBusClient.createSender(queueName);
    
    // Send message
    await sender.sendMessages({
      body: { orderId: 123, status: 'processed' }
    });
    
    // Receive message
    const receiver = serviceBusClient.createReceiver(queueName);
    const messages = await receiver.receiveMessages(1, { maxWaitTimeInMs: 5000 });
    
    expect(messages).toHaveLength(1);
    expect(messages[0].body.orderId).toBe(123);
    
    // Complete message
    await receiver.completeMessage(messages[0]);
    
    await sender.close();
    await receiver.close();
    await serviceBusClient.close();
  });
});
```

### Google Cloud Integration

```javascript
// Google Cloud integration
import { Storage } from '@google-cloud/storage';
import { PubSub } from '@google-cloud/pubsub';

// Use Cloud Storage and Pub/Sub emulators
process.env.STORAGE_EMULATOR_HOST = 'localhost:9023';
process.env.PUBSUB_EMULATOR_HOST = 'localhost:8085';

describe('Google Cloud Services Integration', () => {
  test('should upload file to Cloud Storage', async () => {
    const storage = new Storage({
      projectId: 'test-project'
    });
    
    const bucketName = 'test-bucket';
    const bucket = storage.bucket(bucketName);
    
    // Create bucket
    await bucket.create();
    
    // Upload file
    const file = bucket.file('test-file.txt');
    await file.save('Test file content');
    
    // Download and verify
    const [contents] = await file.download();
    expect(contents.toString()).toBe('Test file content');
    
    // Check metadata
    const [metadata] = await file.getMetadata();
    expect(metadata.name).toBe('test-file.txt');
  });
  
  test('should publish and subscribe to Pub/Sub topic', async () => {
    const pubsub = new PubSub({
      projectId: 'test-project'
    });
    
    const topicName = 'test-topic';
    const subscriptionName = 'test-subscription';
    
    // Create topic and subscription
    const [topic] = await pubsub.createTopic(topicName);
    const [subscription] = await topic.createSubscription(subscriptionName);
    
    // Publish message
    const messageData = JSON.stringify({ event: 'test', data: 'value' });
    await topic.publishMessage({ data: Buffer.from(messageData) });
    
    // Receive message
    const receivedMessages = [];
    const messageHandler = (message) => {
      receivedMessages.push(JSON.parse(message.data.toString()));
      message.ack();
    };
    
    subscription.on('message', messageHandler);
    
    // Wait for message
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    expect(receivedMessages).toHaveLength(1);
    expect(receivedMessages[0].event).toBe('test');
    
    subscription.close();
  });
});
```

## Communication Tools

### Slack Integration

```javascript
// Slack notification integration
import { WebClient } from '@slack/web-api';

class SlackNotifier {
  constructor(token) {
    this.slack = new WebClient(token);
  }
  
  async sendTestResults(results) {
    const { passed, failed, coverage, reportUrl } = results;
    
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🧪 Test Results'
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Passed:* ${passed}`
          },
          {
            type: 'mrkdwn',
            text: `*Failed:* ${failed}`
          },
          {
            type: 'mrkdwn',
            text: `*Coverage:* ${coverage}%`
          }
        ]
      }
    ];
    
    if (failed > 0) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `❌ *${failed} tests failed* - <${reportUrl}|View Report>`
        }
      });
    } else {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `✅ *All tests passed!* - <${reportUrl}|View Report>`
        }
      });
    }
    
    await this.slack.chat.postMessage({
      channel: '#testing',
      blocks
    });
  }
}

// Usage in test pipeline
afterAll(async () => {
  if (process.env.CI && process.env.SLACK_TOKEN) {
    const notifier = new SlackNotifier(process.env.SLACK_TOKEN);
    await notifier.sendTestResults(globalTestResults);
  }
});
```

### Microsoft Teams Integration

```javascript
// Teams webhook integration
import axios from 'axios';

class TeamsNotifier {
  constructor(webhookUrl) {
    this.webhookUrl = webhookUrl;
  }
  
  async sendTestResults(results) {
    const { passed, failed, coverage, reportUrl, branch, commit } = results;
    
    const color = failed > 0 ? 'attention' : 'good';
    const status = failed > 0 ? 'Failed' : 'Passed';
    
    const card = {
      type: 'message',
      attachments: [{
        contentType: 'application/vnd.microsoft.card.adaptive',
        content: {
          type: 'AdaptiveCard',
          version: '1.2',
          body: [
            {
              type: 'TextBlock',
              text: `Test Results - ${status}`,
              weight: 'Bolder',
              size: 'Medium',
              color: color
            },
            {
              type: 'FactSet',
              facts: [
                { title: 'Branch:', value: branch },
                { title: 'Commit:', value: commit.substring(0, 8) },
                { title: 'Passed:', value: passed.toString() },
                { title: 'Failed:', value: failed.toString() },
                { title: 'Coverage:', value: `${coverage}%` }
              ]
            }
          ],
          actions: [
            {
              type: 'Action.OpenUrl',
              title: 'View Report',
              url: reportUrl
            }
          ]
        }
      }]
    };
    
    await axios.post(this.webhookUrl, card);
  }
}
```

## Monitoring & Analytics

### DataDog Integration

```javascript
// DataDog monitoring integration
import { StatsD } from 'node-statsd';

class DataDogReporter {
  constructor() {
    this.statsd = new StatsD({
      host: process.env.DD_AGENT_HOST || 'localhost',
      port: 8125,
      prefix: 'semantest.'
    });
  }
  
  reportTestMetrics(results) {
    const { passed, failed, duration, coverage } = results;
    
    // Test counts
    this.statsd.gauge('tests.passed', passed);
    this.statsd.gauge('tests.failed', failed);
    this.statsd.gauge('tests.total', passed + failed);
    
    // Test duration
    this.statsd.timing('tests.duration', duration);
    
    // Coverage
    this.statsd.gauge('coverage.percentage', coverage);
    
    // Success rate
    const successRate = (passed / (passed + failed)) * 100;
    this.statsd.gauge('tests.success_rate', successRate);
    
    // Custom events
    if (failed > 0) {
      this.statsd.increment('tests.failures');
    }
  }
  
  reportPerformanceMetrics(metrics) {
    Object.entries(metrics).forEach(([key, value]) => {
      this.statsd.timing(`performance.${key}`, value);
    });
  }
}

// Usage in tests
const ddReporter = new DataDogReporter();

afterEach(() => {
  ddReporter.reportTestMetrics(currentTestResults);
});
```

### New Relic Integration

```javascript
// New Relic custom metrics
import newrelic from 'newrelic';

class NewRelicReporter {
  reportTestExecution(testName, duration, status) {
    // Custom event
    newrelic.recordCustomEvent('TestExecution', {
      testName,
      duration,
      status,
      timestamp: Date.now()
    });
    
    // Custom metric
    newrelic.recordMetric('Custom/Test/Duration', duration);
    newrelic.recordMetric(`Custom/Test/${status}`, 1);
  }
  
  reportCoverageMetrics(coverage) {
    newrelic.recordMetric('Custom/Coverage/Statements', coverage.statements);
    newrelic.recordMetric('Custom/Coverage/Branches', coverage.branches);
    newrelic.recordMetric('Custom/Coverage/Functions', coverage.functions);
    newrelic.recordMetric('Custom/Coverage/Lines', coverage.lines);
  }
  
  reportFlakiness(testName, flakinessScore) {
    newrelic.recordCustomEvent('TestFlakiness', {
      testName,
      flakinessScore,
      timestamp: Date.now()
    });
  }
}
```

This comprehensive integration guide provides practical examples for connecting Semantest with your entire development ecosystem. Each integration is designed to enhance your testing workflow while maintaining consistency and reliability across platforms.

---

**Last Updated**: January 19, 2025  
**Version**: 1.0.0  
**Maintainer**: Semantest Integration Team  
**Support**: integrations@semantest.com