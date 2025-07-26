# Semantest WebSocket API Reference

## Overview

Comprehensive API reference for Semantest's real-time WebSocket streaming services. This documentation provides detailed specifications for establishing connections, managing subscriptions, handling events, and implementing real-time features across the platform.

## Table of Contents

1. [Connection Management](#connection-management)
2. [Authentication & Authorization](#authentication--authorization)
3. [Event Types & Message Formats](#event-types--message-formats)
4. [Subscription Management](#subscription-management)
5. [Real-time Testing Events](#real-time-testing-events)
6. [AI Service Integration](#ai-service-integration)
7. [Dashboard Data Streaming](#dashboard-data-streaming)
8. [Error Handling & Recovery](#error-handling--recovery)
9. [Rate Limiting & Performance](#rate-limiting--performance)
10. [Code Examples & SDKs](#code-examples--sdks)

## Connection Management

### WebSocket Endpoint

```
Production: wss://api.semantest.com/ws/v1
Staging: wss://staging-api.semantest.com/ws/v1
Development: wss://dev-api.semantest.com/ws/v1
```

### Connection Lifecycle

```javascript
// Basic WebSocket connection setup
class SemantestWebSocketClient {
    constructor(apiKey, environment = 'production') {
        this.apiKey = apiKey;
        this.environment = environment;
        this.ws = null;
        this.connectionState = 'disconnected';
        this.subscriptions = new Map();
        this.messageQueue = [];
        this.heartbeatInterval = null;
        
        // Connection configuration
        this.config = {
            maxReconnectAttempts: 5,
            reconnectDelay: 1000,
            heartbeatInterval: 30000,
            messageTimeout: 10000,
        };
    }
    
    async connect() {
        const wsUrl = this.getWebSocketUrl();
        
        try {
            this.ws = new WebSocket(wsUrl);
            this.setupEventHandlers();
            
            await this.waitForConnection();
            await this.authenticate();
            
            this.connectionState = 'connected';
            this.startHeartbeat();
            this.processMessageQueue();
            
            console.log('✅ WebSocket connected and authenticated');
            
        } catch (error) {
            console.error('❌ Connection failed:', error);
            this.handleConnectionError(error);
        }
    }
    
    setupEventHandlers() {
        this.ws.onopen = () => {
            console.log('🔗 WebSocket connection opened');
            this.connectionState = 'authenticating';
        };
        
        this.ws.onmessage = (event) => {
            this.handleIncomingMessage(event.data);
        };
        
        this.ws.onclose = (event) => {
            console.log('🔌 WebSocket connection closed:', event.code, event.reason);
            this.handleConnectionClose(event);
        };
        
        this.ws.onerror = (error) => {
            console.error('🚨 WebSocket error:', error);
            this.handleConnectionError(error);
        };
    }
    
    getWebSocketUrl() {
        const baseUrls = {
            production: 'wss://api.semantest.com',
            staging: 'wss://staging-api.semantest.com',
            development: 'wss://dev-api.semantest.com',
        };
        
        return `${baseUrls[this.environment]}/ws/v1?apiKey=${this.apiKey}`;
    }
    
    async waitForConnection() {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Connection timeout'));
            }, 10000);
            
            const checkConnection = () => {
                if (this.ws.readyState === WebSocket.OPEN) {
                    clearTimeout(timeout);
                    resolve();
                } else if (this.ws.readyState === WebSocket.CLOSED) {
                    clearTimeout(timeout);
                    reject(new Error('Connection failed'));
                } else {
                    setTimeout(checkConnection, 100);
                }
            };
            
            checkConnection();
        });
    }
}
```

### Authentication Protocol

```javascript
// Authentication message format
const authMessage = {
    type: 'auth',
    payload: {
        apiKey: 'your-api-key',
        userId: 'user-id',
        sessionId: 'session-id',
        permissions: ['test:read', 'test:write', 'dashboard:read'],
        timestamp: Date.now(),
    }
};

// Authentication implementation
async authenticate() {
    const authMessage = {
        type: 'auth',
        payload: {
            apiKey: this.apiKey,
            timestamp: Date.now(),
        },
        id: this.generateMessageId(),
    };
    
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error('Authentication timeout'));
        }, this.config.messageTimeout);
        
        const messageHandler = (response) => {
            if (response.type === 'auth_response' && response.id === authMessage.id) {
                clearTimeout(timeout);
                
                if (response.payload.success) {
                    this.userContext = response.payload.user;
                    this.permissions = response.payload.permissions;
                    resolve(response.payload);
                } else {
                    reject(new Error(response.payload.error));
                }
            }
        };
        
        this.addMessageHandler(messageHandler);
        this.send(authMessage);
    });
}

// Authentication response format
{
    type: 'auth_response',
    payload: {
        success: true,
        user: {
            id: 'user-123',
            email: 'user@company.com',
            role: 'tester',
            organization: 'company-org'
        },
        permissions: ['test:read', 'test:write', 'dashboard:read'],
        sessionInfo: {
            sessionId: 'session-abc123',
            expiresAt: '2025-01-19T12:00:00Z',
            rateLimits: {
                messagesPerMinute: 1000,
                subscriptionsLimit: 50
            }
        }
    },
    id: 'msg-123',
    timestamp: 1642598400000
}
```

## Event Types & Message Formats

### Message Structure

```typescript
interface WebSocketMessage {
    type: string;                    // Message type identifier
    payload: object;                 // Message content
    id?: string;                     // Unique message identifier
    correlationId?: string;          // For request-response correlation
    timestamp: number;               // Unix timestamp
    metadata?: {
        source?: string;             // Origin of the message
        priority?: 'low' | 'normal' | 'high' | 'urgent';
        ttl?: number;                // Time to live in milliseconds
        retryable?: boolean;         // Whether message can be retried
    };
}
```

### Core Event Types

```javascript
// Event type definitions
const EventTypes = {
    // Connection events
    CONNECTION_ESTABLISHED: 'connection_established',
    CONNECTION_LOST: 'connection_lost',
    HEARTBEAT: 'heartbeat',
    
    // Authentication events
    AUTH_REQUEST: 'auth',
    AUTH_RESPONSE: 'auth_response',
    AUTH_REFRESH: 'auth_refresh',
    
    // Subscription events
    SUBSCRIBE: 'subscribe',
    UNSUBSCRIBE: 'unsubscribe',
    SUBSCRIPTION_CONFIRMED: 'subscription_confirmed',
    SUBSCRIPTION_ERROR: 'subscription_error',
    
    // Test execution events
    TEST_STARTED: 'test_started',
    TEST_PROGRESS: 'test_progress',
    TEST_COMPLETED: 'test_completed',
    TEST_FAILED: 'test_failed',
    TEST_CANCELLED: 'test_cancelled',
    
    // Real-time data events
    METRICS_UPDATE: 'metrics_update',
    DASHBOARD_DATA: 'dashboard_data',
    ALERT_TRIGGERED: 'alert_triggered',
    
    // AI service events
    AI_ANALYSIS_STARTED: 'ai_analysis_started',
    AI_ANALYSIS_PROGRESS: 'ai_analysis_progress',
    AI_ANALYSIS_COMPLETED: 'ai_analysis_completed',
    AI_RECOMMENDATION: 'ai_recommendation',
    
    // Error events
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
};
```

### Message Examples

```javascript
// Test execution started
{
    type: 'test_started',
    payload: {
        testId: 'test-789',
        testSuiteId: 'suite-456',
        testName: 'Login Flow Validation',
        testType: 'e2e',
        environment: 'staging',
        startedBy: 'user-123',
        estimatedDuration: 120000, // 2 minutes in milliseconds
        browser: 'chrome',
        deviceType: 'desktop'
    },
    id: 'msg-001',
    timestamp: 1642598400000,
    metadata: {
        source: 'test-engine',
        priority: 'normal'
    }
}

// Real-time test progress
{
    type: 'test_progress',
    payload: {
        testId: 'test-789',
        progress: {
            percentage: 45,
            currentStep: 'Filling login form',
            stepNumber: 3,
            totalSteps: 8,
            duration: 54000, // 54 seconds elapsed
            screenshot: 'https://cdn.semantest.com/screenshots/test-789-step3.png'
        },
        metrics: {
            memoryUsage: 156.7, // MB
            cpuUsage: 23.4,     // percentage
            networkRequests: 12,
            errors: 0
        }
    },
    id: 'msg-002',
    correlationId: 'test-789',
    timestamp: 1642598454000
}

// AI analysis recommendation
{
    type: 'ai_recommendation',
    payload: {
        testId: 'test-789',
        recommendation: {
            type: 'optimization',
            confidence: 0.92,
            title: 'Improve Form Input Efficiency',
            description: 'The login form interaction could be optimized by using direct element targeting instead of sequential navigation.',
            suggestedChanges: [
                {
                    step: 3,
                    current: 'cy.get("[data-cy=username]").type("{tab}").type("username")',
                    suggested: 'cy.get("[data-cy=username]").type("username")',
                    impact: 'Reduces execution time by ~200ms'
                }
            ],
            estimatedImprovement: {
                timeReduction: 200, // milliseconds
                reliabilityIncrease: 5 // percentage
            }
        }
    },
    id: 'msg-003',
    timestamp: 1642598460000,
    metadata: {
        source: 'ai-analyzer',
        priority: 'low'
    }
}
```

## Subscription Management

### Subscription Protocol

```javascript
// Subscription request format
{
    type: 'subscribe',
    payload: {
        channel: 'test_execution',     // Channel to subscribe to
        filters: {                     // Optional filters
            testSuiteIds: ['suite-456'],
            testTypes: ['e2e', 'integration'],
            environments: ['staging', 'production'],
            userId: 'user-123'
        },
        options: {
            includeHistory: false,     // Include recent messages
            bufferSize: 100,           // Client-side buffer size
            compression: true          // Enable message compression
        }
    },
    id: 'sub-req-001'
}

// Subscription implementation
class SubscriptionManager {
    constructor(wsClient) {
        this.wsClient = wsClient;
        this.subscriptions = new Map();
        this.messageHandlers = new Map();
    }
    
    async subscribe(channel, filters = {}, options = {}) {
        const subscriptionId = this.generateSubscriptionId();
        
        const subscription = {
            id: subscriptionId,
            channel: channel,
            filters: filters,
            options: options,
            state: 'pending',
            createdAt: Date.now()
        };
        
        this.subscriptions.set(subscriptionId, subscription);
        
        const subscribeMessage = {
            type: 'subscribe',
            payload: {
                channel: channel,
                filters: filters,
                options: options
            },
            id: subscriptionId
        };
        
        try {
            await this.wsClient.sendMessage(subscribeMessage);
            subscription.state = 'active';
            
            console.log(`✅ Subscribed to channel: ${channel}`);
            return subscriptionId;
            
        } catch (error) {
            this.subscriptions.delete(subscriptionId);
            throw error;
        }
    }
    
    async unsubscribe(subscriptionId) {
        const subscription = this.subscriptions.get(subscriptionId);
        
        if (!subscription) {
            throw new Error(`Subscription ${subscriptionId} not found`);
        }
        
        const unsubscribeMessage = {
            type: 'unsubscribe',
            payload: {
                subscriptionId: subscriptionId
            },
            id: this.wsClient.generateMessageId()
        };
        
        await this.wsClient.sendMessage(unsubscribeMessage);
        this.subscriptions.delete(subscriptionId);
        this.messageHandlers.delete(subscriptionId);
        
        console.log(`✅ Unsubscribed from: ${subscription.channel}`);
    }
    
    onMessage(subscriptionId, handler) {
        this.messageHandlers.set(subscriptionId, handler);
    }
    
    handleChannelMessage(message) {
        const { channel, subscriptionId } = message.payload;
        const handler = this.messageHandlers.get(subscriptionId);
        
        if (handler) {
            handler(message);
        }
    }
}
```

### Available Channels

```yaml
subscription_channels:
  test_execution:
    description: "Real-time test execution events"
    events:
      - test_started
      - test_progress
      - test_completed
      - test_failed
      - test_cancelled
    
    filters:
      testSuiteIds: "array of test suite IDs"
      testTypes: "array of test types (e2e, unit, integration)"
      environments: "array of environments (dev, staging, prod)"
      userId: "specific user ID"
      projectId: "specific project ID"
  
  dashboard_metrics:
    description: "Real-time dashboard data updates"
    events:
      - metrics_update
      - dashboard_data
      - alert_triggered
    
    filters:
      metricTypes: "array of metric types"
      timeRange: "time range for historical data"
      dashboardId: "specific dashboard ID"
  
  ai_analysis:
    description: "AI service analysis and recommendations"
    events:
      - ai_analysis_started
      - ai_analysis_progress
      - ai_analysis_completed
      - ai_recommendation
    
    filters:
      analysisTypes: "array of analysis types"
      confidence_threshold: "minimum confidence level"
      testIds: "array of test IDs"
  
  system_events:
    description: "System-wide events and notifications"
    events:
      - system_maintenance
      - service_status_change
      - quota_warning
      - security_alert
    
    filters:
      severity: "event severity level"
      serviceNames: "array of service names"
```

## Real-time Testing Events

### Test Execution Monitoring

```javascript
// Test execution event handler
class TestExecutionMonitor {
    constructor(wsClient) {
        this.wsClient = wsClient;
        this.activeTests = new Map();
        this.testMetrics = new Map();
    }
    
    async startMonitoring(testSuiteId) {
        const subscriptionId = await this.wsClient.subscribe('test_execution', {
            testSuiteIds: [testSuiteId]
        });
        
        this.wsClient.onMessage(subscriptionId, (message) => {
            this.handleTestEvent(message);
        });
        
        return subscriptionId;
    }
    
    handleTestEvent(message) {
        const { type, payload } = message;
        
        switch (type) {
            case 'test_started':
                this.onTestStarted(payload);
                break;
                
            case 'test_progress':
                this.onTestProgress(payload);
                break;
                
            case 'test_completed':
                this.onTestCompleted(payload);
                break;
                
            case 'test_failed':
                this.onTestFailed(payload);
                break;
                
            case 'test_cancelled':
                this.onTestCancelled(payload);
                break;
        }
    }
    
    onTestStarted(payload) {
        const { testId, testName, estimatedDuration } = payload;
        
        this.activeTests.set(testId, {
            id: testId,
            name: testName,
            startTime: Date.now(),
            estimatedDuration: estimatedDuration,
            status: 'running',
            progress: 0
        });
        
        console.log(`🚀 Test started: ${testName} (${testId})`);
        
        // Emit to UI
        this.emit('testStarted', payload);
    }
    
    onTestProgress(payload) {
        const { testId, progress, currentStep, metrics } = payload;
        
        const test = this.activeTests.get(testId);
        if (test) {
            test.progress = progress.percentage;
            test.currentStep = currentStep;
            test.lastUpdate = Date.now();
            
            // Store metrics
            this.testMetrics.set(testId, {
                ...this.testMetrics.get(testId),
                ...metrics,
                timestamp: Date.now()
            });
        }
        
        console.log(`📊 Test progress: ${test.name} - ${progress.percentage}%`);
        
        // Emit to UI
        this.emit('testProgress', payload);
    }
    
    onTestCompleted(payload) {
        const { testId, result, duration, artifacts } = payload;
        
        const test = this.activeTests.get(testId);
        if (test) {
            test.status = 'completed';
            test.result = result;
            test.duration = duration;
            test.artifacts = artifacts;
            test.completedAt = Date.now();
        }
        
        console.log(`✅ Test completed: ${test.name} - ${result.status}`);
        
        // Emit to UI
        this.emit('testCompleted', payload);
        
        // Move to completed tests
        this.activeTests.delete(testId);
    }
}
```

### Live Test Analytics

```javascript
// Real-time test analytics
class LiveTestAnalytics {
    constructor(wsClient) {
        this.wsClient = wsClient;
        this.analyticsBuffer = [];
        this.aggregatedMetrics = {};
    }
    
    async startAnalytics(filters = {}) {
        const subscriptionId = await this.wsClient.subscribe('test_execution', filters);
        
        this.wsClient.onMessage(subscriptionId, (message) => {
            this.processAnalyticsEvent(message);
        });
        
        // Set up periodic analytics processing
        this.analyticsInterval = setInterval(() => {
            this.processAnalyticsBuffer();
        }, 5000); // Process every 5 seconds
        
        return subscriptionId;
    }
    
    processAnalyticsEvent(message) {
        const { type, payload, timestamp } = message;
        
        // Add to analytics buffer
        this.analyticsBuffer.push({
            type,
            payload,
            timestamp
        });
        
        // Update real-time counters
        this.updateRealTimeCounters(type, payload);
    }
    
    updateRealTimeCounters(type, payload) {
        if (!this.aggregatedMetrics.counters) {
            this.aggregatedMetrics.counters = {
                testsStarted: 0,
                testsCompleted: 0,
                testsFailed: 0,
                totalDuration: 0
            };
        }
        
        switch (type) {
            case 'test_started':
                this.aggregatedMetrics.counters.testsStarted++;
                break;
                
            case 'test_completed':
                this.aggregatedMetrics.counters.testsCompleted++;
                this.aggregatedMetrics.counters.totalDuration += payload.duration;
                break;
                
            case 'test_failed':
                this.aggregatedMetrics.counters.testsFailed++;
                break;
        }
        
        // Calculate derived metrics
        this.calculateDerivedMetrics();
    }
    
    calculateDerivedMetrics() {
        const { counters } = this.aggregatedMetrics;
        
        this.aggregatedMetrics.derived = {
            successRate: counters.testsCompleted > 0 
                ? ((counters.testsCompleted - counters.testsFailed) / counters.testsCompleted) * 100 
                : 0,
            averageDuration: counters.testsCompleted > 0 
                ? counters.totalDuration / counters.testsCompleted 
                : 0,
            testsPerMinute: this.calculateTestsPerMinute(),
            currentLoad: this.calculateCurrentLoad()
        };
    }
    
    processAnalyticsBuffer() {
        if (this.analyticsBuffer.length === 0) return;
        
        // Process buffered events for detailed analytics
        const timeWindow = 60000; // 1 minute window
        const cutoff = Date.now() - timeWindow;
        
        const recentEvents = this.analyticsBuffer.filter(event => 
            event.timestamp > cutoff
        );
        
        // Generate analytics report
        const analyticsReport = {
            timeWindow: timeWindow,
            eventCount: recentEvents.length,
            eventsByType: this.groupEventsByType(recentEvents),
            metrics: this.aggregatedMetrics,
            trends: this.calculateTrends(recentEvents),
            timestamp: Date.now()
        };
        
        // Emit analytics update
        this.emit('analyticsUpdate', analyticsReport);
        
        // Clean old events from buffer
        this.analyticsBuffer = this.analyticsBuffer.filter(event => 
            event.timestamp > cutoff
        );
    }
}
```

## AI Service Integration

### AI Analysis Events

```javascript
// AI service event types and payloads
const AIEventTypes = {
    // Analysis lifecycle
    ANALYSIS_STARTED: {
        type: 'ai_analysis_started',
        payload: {
            analysisId: 'analysis-123',
            testId: 'test-789',
            analysisType: 'performance_optimization',
            estimatedDuration: 30000,
            configuration: {
                depth: 'comprehensive',
                includeRecommendations: true,
                confidenceThreshold: 0.7
            }
        }
    },
    
    ANALYSIS_PROGRESS: {
        type: 'ai_analysis_progress',
        payload: {
            analysisId: 'analysis-123',
            progress: {
                percentage: 65,
                currentPhase: 'pattern_analysis',
                phasesCompleted: ['data_collection', 'preprocessing'],
                remainingPhases: ['recommendation_generation', 'validation']
            },
            intermediateResults: {
                patternsFound: 12,
                issuesDetected: 3,
                optimizationsIdentified: 8
            }
        }
    },
    
    ANALYSIS_COMPLETED: {
        type: 'ai_analysis_completed',
        payload: {
            analysisId: 'analysis-123',
            testId: 'test-789',
            duration: 28500,
            results: {
                confidence: 0.89,
                issuesFound: [
                    {
                        type: 'performance',
                        severity: 'medium',
                        description: 'Excessive wait time in login flow',
                        location: 'step_3',
                        impact: 'Increases test duration by 15%'
                    }
                ],
                recommendations: [
                    {
                        type: 'optimization',
                        confidence: 0.92,
                        title: 'Optimize element selection',
                        implementation: 'Use more specific selectors',
                        estimatedImprovement: '200ms reduction'
                    }
                ],
                metrics: {
                    performanceScore: 78,
                    reliabilityScore: 92,
                    maintainabilityScore: 85
                }
            }
        }
    }
};

// AI service integration client
class AIServiceClient {
    constructor(wsClient) {
        this.wsClient = wsClient;
        this.activeAnalyses = new Map();
        this.analysisHistory = [];
    }
    
    async requestAnalysis(testId, analysisType, configuration = {}) {
        const analysisId = this.generateAnalysisId();
        
        const analysisRequest = {
            type: 'ai_analysis_request',
            payload: {
                analysisId: analysisId,
                testId: testId,
                analysisType: analysisType,
                configuration: {
                    depth: 'standard',
                    includeRecommendations: true,
                    confidenceThreshold: 0.7,
                    ...configuration
                }
            },
            id: this.wsClient.generateMessageId()
        };
        
        // Track analysis request
        this.activeAnalyses.set(analysisId, {
            id: analysisId,
            testId: testId,
            type: analysisType,
            status: 'requested',
            startTime: Date.now(),
            configuration: analysisRequest.payload.configuration
        });
        
        try {
            await this.wsClient.sendMessage(analysisRequest);
            console.log(`🤖 AI analysis requested: ${analysisType} for test ${testId}`);
            return analysisId;
            
        } catch (error) {
            this.activeAnalyses.delete(analysisId);
            throw error;
        }
    }
    
    async subscribeToAnalysisUpdates(analysisId) {
        const subscriptionId = await this.wsClient.subscribe('ai_analysis', {
            analysisIds: [analysisId]
        });
        
        this.wsClient.onMessage(subscriptionId, (message) => {
            this.handleAnalysisEvent(message);
        });
        
        return subscriptionId;
    }
    
    handleAnalysisEvent(message) {
        const { type, payload } = message;
        
        switch (type) {
            case 'ai_analysis_started':
                this.onAnalysisStarted(payload);
                break;
                
            case 'ai_analysis_progress':
                this.onAnalysisProgress(payload);
                break;
                
            case 'ai_analysis_completed':
                this.onAnalysisCompleted(payload);
                break;
                
            case 'ai_recommendation':
                this.onRecommendation(payload);
                break;
        }
    }
    
    onAnalysisStarted(payload) {
        const { analysisId, estimatedDuration } = payload;
        
        const analysis = this.activeAnalyses.get(analysisId);
        if (analysis) {
            analysis.status = 'running';
            analysis.estimatedDuration = estimatedDuration;
            analysis.actualStartTime = Date.now();
        }
        
        console.log(`🚀 AI analysis started: ${analysisId}`);
        this.emit('analysisStarted', payload);
    }
    
    onAnalysisProgress(payload) {
        const { analysisId, progress, intermediateResults } = payload;
        
        const analysis = this.activeAnalyses.get(analysisId);
        if (analysis) {
            analysis.progress = progress.percentage;
            analysis.currentPhase = progress.currentPhase;
            analysis.intermediateResults = intermediateResults;
            analysis.lastUpdate = Date.now();
        }
        
        console.log(`📊 AI analysis progress: ${analysisId} - ${progress.percentage}%`);
        this.emit('analysisProgress', payload);
    }
    
    onAnalysisCompleted(payload) {
        const { analysisId, results, duration } = payload;
        
        const analysis = this.activeAnalyses.get(analysisId);
        if (analysis) {
            analysis.status = 'completed';
            analysis.results = results;
            analysis.actualDuration = duration;
            analysis.completedAt = Date.now();
        }
        
        console.log(`✅ AI analysis completed: ${analysisId}`);
        this.emit('analysisCompleted', payload);
        
        // Move to history
        this.analysisHistory.push(analysis);
        this.activeAnalyses.delete(analysisId);
    }
}
```

### Smart Recommendations

```javascript
// Smart recommendation system
class SmartRecommendationEngine {
    constructor(wsClient) {
        this.wsClient = wsClient;
        this.recommendations = new Map();
        this.userFeedback = new Map();
    }
    
    async subscribeToRecommendations(filters = {}) {
        const subscriptionId = await this.wsClient.subscribe('ai_analysis', {
            ...filters,
            includeRecommendations: true
        });
        
        this.wsClient.onMessage(subscriptionId, (message) => {
            if (message.type === 'ai_recommendation') {
                this.handleRecommendation(message);
            }
        });
        
        return subscriptionId;
    }
    
    handleRecommendation(message) {
        const { payload } = message;
        const recommendation = payload.recommendation;
        
        // Store recommendation
        this.recommendations.set(recommendation.id, {
            ...recommendation,
            receivedAt: Date.now(),
            status: 'new'
        });
        
        // Apply smart filtering and prioritization
        const processedRecommendation = this.processRecommendation(recommendation);
        
        // Emit to UI
        this.emit('newRecommendation', processedRecommendation);
        
        console.log(`💡 New recommendation: ${recommendation.title}`);
    }
    
    processRecommendation(recommendation) {
        // Add contextual information
        const processed = {
            ...recommendation,
            priority: this.calculatePriority(recommendation),
            category: this.categorizeRecommendation(recommendation),
            estimatedEffort: this.estimateImplementationEffort(recommendation),
            relatedRecommendations: this.findRelatedRecommendations(recommendation)
        };
        
        return processed;
    }
    
    calculatePriority(recommendation) {
        // Priority calculation based on multiple factors
        let priority = 0;
        
        // Confidence weight (0-40 points)
        priority += recommendation.confidence * 40;
        
        // Impact weight (0-30 points)
        const impactScore = this.parseImpactValue(recommendation.estimatedImprovement);
        priority += Math.min(impactScore / 10, 30);
        
        // Frequency of similar issues (0-20 points)
        const frequencyScore = this.calculateFrequencyScore(recommendation);
        priority += frequencyScore;
        
        // Implementation difficulty (0-10 points, inverse)
        const difficultyScore = this.calculateDifficultyScore(recommendation);
        priority += (10 - difficultyScore);
        
        // Normalize to 0-100 scale
        return Math.min(Math.round(priority), 100);
    }
    
    async provideFeedback(recommendationId, feedback) {
        const feedbackData = {
            recommendationId: recommendationId,
            feedback: feedback, // 'helpful', 'not_helpful', 'implemented', 'dismissed'
            timestamp: Date.now(),
            userId: this.wsClient.userContext.id
        };
        
        // Store feedback locally
        this.userFeedback.set(recommendationId, feedbackData);
        
        // Send feedback to server
        const feedbackMessage = {
            type: 'ai_recommendation_feedback',
            payload: feedbackData,
            id: this.wsClient.generateMessageId()
        };
        
        await this.wsClient.sendMessage(feedbackMessage);
        
        console.log(`📝 Feedback provided for recommendation: ${recommendationId}`);
    }
}
```

## Dashboard Data Streaming

### Real-time Metrics

```javascript
// Dashboard metrics streaming
class DashboardMetricsStreamer {
    constructor(wsClient) {
        this.wsClient = wsClient;
        this.metricsBuffer = new Map();
        this.subscriptions = new Map();
        this.updateInterval = 1000; // 1 second updates
    }
    
    async subscribeToDashboard(dashboardId, metricTypes = []) {
        const subscriptionId = await this.wsClient.subscribe('dashboard_metrics', {
            dashboardId: dashboardId,
            metricTypes: metricTypes.length > 0 ? metricTypes : undefined
        });
        
        this.subscriptions.set(dashboardId, subscriptionId);
        
        this.wsClient.onMessage(subscriptionId, (message) => {
            this.handleMetricsUpdate(message);
        });
        
        console.log(`📊 Subscribed to dashboard metrics: ${dashboardId}`);
        return subscriptionId;
    }
    
    handleMetricsUpdate(message) {
        const { type, payload, timestamp } = message;
        
        if (type === 'metrics_update') {
            this.processMetricsUpdate(payload, timestamp);
        } else if (type === 'dashboard_data') {
            this.processDashboardData(payload, timestamp);
        }
    }
    
    processMetricsUpdate(payload, timestamp) {
        const { metricType, value, metadata } = payload;
        
        // Update metrics buffer
        if (!this.metricsBuffer.has(metricType)) {
            this.metricsBuffer.set(metricType, {
                values: [],
                lastUpdate: 0
            });
        }
        
        const metric = this.metricsBuffer.get(metricType);
        metric.values.push({
            value: value,
            timestamp: timestamp,
            metadata: metadata
        });
        
        // Keep only recent values (last 5 minutes)
        const cutoff = timestamp - (5 * 60 * 1000);
        metric.values = metric.values.filter(v => v.timestamp > cutoff);
        metric.lastUpdate = timestamp;
        
        // Emit update
        this.emit('metricsUpdate', {
            metricType: metricType,
            currentValue: value,
            trend: this.calculateTrend(metric.values),
            metadata: metadata
        });
    }
    
    processDashboardData(payload, timestamp) {
        const { dashboardId, widgets, aggregatedMetrics } = payload;
        
        // Process each widget's data
        widgets.forEach(widget => {
            this.processWidgetData(widget, timestamp);
        });
        
        // Update aggregated metrics
        this.updateAggregatedMetrics(aggregatedMetrics, timestamp);
        
        // Emit dashboard update
        this.emit('dashboardUpdate', {
            dashboardId: dashboardId,
            widgets: widgets,
            aggregatedMetrics: aggregatedMetrics,
            timestamp: timestamp
        });
    }
    
    processWidgetData(widget, timestamp) {
        const { widgetId, widgetType, data } = widget;
        
        switch (widgetType) {
            case 'line_chart':
                this.processLineChartData(widgetId, data, timestamp);
                break;
                
            case 'bar_chart':
                this.processBarChartData(widgetId, data, timestamp);
                break;
                
            case 'gauge':
                this.processGaugeData(widgetId, data, timestamp);
                break;
                
            case 'table':
                this.processTableData(widgetId, data, timestamp);
                break;
                
            case 'counter':
                this.processCounterData(widgetId, data, timestamp);
                break;
        }
    }
    
    processLineChartData(widgetId, data, timestamp) {
        // Real-time line chart data processing
        const { series, timeRange } = data;
        
        series.forEach(serie => {
            // Add new data point
            serie.data.push({
                x: timestamp,
                y: serie.currentValue
            });
            
            // Maintain time window
            const cutoff = timestamp - timeRange;
            serie.data = serie.data.filter(point => point.x > cutoff);
        });
        
        this.emit('widgetUpdate', {
            widgetId: widgetId,
            type: 'line_chart',
            data: data,
            timestamp: timestamp
        });
    }
    
    calculateTrend(values) {
        if (values.length < 2) return 'stable';
        
        const recent = values.slice(-10); // Last 10 values
        const first = recent[0].value;
        const last = recent[recent.length - 1].value;
        
        const change = ((last - first) / first) * 100;
        
        if (change > 5) return 'increasing';
        if (change < -5) return 'decreasing';
        return 'stable';
    }
}
```

### Live Dashboard Components

```javascript
// React component for live dashboard metrics
class LiveMetricsWidget extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            metrics: {},
            isConnected: false,
            lastUpdate: null
        };
        
        this.wsClient = null;
        this.metricsStreamer = null;
    }
    
    async componentDidMount() {
        await this.initializeWebSocket();
        await this.subscribeToMetrics();
    }
    
    async initializeWebSocket() {
        this.wsClient = new SemantestWebSocketClient(
            this.props.apiKey,
            this.props.environment
        );
        
        await this.wsClient.connect();
        
        this.setState({ isConnected: true });
        
        // Set up connection monitoring
        this.wsClient.onConnectionChange = (state) => {
            this.setState({ isConnected: state === 'connected' });
        };
    }
    
    async subscribeToMetrics() {
        this.metricsStreamer = new DashboardMetricsStreamer(this.wsClient);
        
        // Subscribe to dashboard
        await this.metricsStreamer.subscribeToDashboard(
            this.props.dashboardId,
            this.props.metricTypes
        );
        
        // Handle metrics updates
        this.metricsStreamer.on('metricsUpdate', (update) => {
            this.setState(prevState => ({
                metrics: {
                    ...prevState.metrics,
                    [update.metricType]: update
                },
                lastUpdate: Date.now()
            }));
        });
        
        // Handle dashboard updates
        this.metricsStreamer.on('dashboardUpdate', (update) => {
            this.handleDashboardUpdate(update);
        });
    }
    
    handleDashboardUpdate(update) {
        const { widgets, aggregatedMetrics } = update;
        
        this.setState({
            widgets: widgets,
            aggregatedMetrics: aggregatedMetrics,
            lastUpdate: Date.now()
        });
        
        // Trigger re-render of specific widgets
        widgets.forEach(widget => {
            this.updateWidget(widget);
        });
    }
    
    updateWidget(widget) {
        const { widgetId, widgetType, data } = widget;
        
        // Find widget component and update it
        const widgetComponent = this.refs[`widget_${widgetId}`];
        if (widgetComponent && widgetComponent.updateData) {
            widgetComponent.updateData(data);
        }
    }
    
    render() {
        const { metrics, isConnected, lastUpdate } = this.state;
        
        return (
            <div className="live-metrics-widget">
                <div className="connection-status">
                    <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`} />
                    {isConnected ? 'Connected' : 'Disconnected'}
                    {lastUpdate && (
                        <span className="last-update">
                            Last update: {new Date(lastUpdate).toLocaleTimeString()}
                        </span>
                    )}
                </div>
                
                <div className="metrics-grid">
                    {Object.entries(metrics).map(([metricType, metric]) => (
                        <MetricCard 
                            key={metricType}
                            metricType={metricType}
                            metric={metric}
                        />
                    ))}
                </div>
                
                {this.state.widgets && (
                    <div className="widgets-container">
                        {this.state.widgets.map(widget => (
                            <WidgetComponent
                                key={widget.widgetId}
                                ref={`widget_${widget.widgetId}`}
                                widget={widget}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    }
    
    componentWillUnmount() {
        if (this.metricsStreamer) {
            this.metricsStreamer.removeAllListeners();
        }
        
        if (this.wsClient) {
            this.wsClient.disconnect();
        }
    }
}
```

## Error Handling & Recovery

### Error Types and Handling

```javascript
// Error handling and recovery system
class WebSocketErrorHandler {
    constructor(wsClient) {
        this.wsClient = wsClient;
        this.errorHistory = [];
        this.recoveryStrategies = new Map();
        
        this.setupErrorHandlers();
        this.setupRecoveryStrategies();
    }
    
    setupErrorHandlers() {
        this.wsClient.on('error', (error) => {
            this.handleError(error);
        });
        
        this.wsClient.on('close', (event) => {
            this.handleConnectionClose(event);
        });
        
        this.wsClient.on('message_error', (error) => {
            this.handleMessageError(error);
        });
    }
    
    setupRecoveryStrategies() {
        // Connection errors
        this.recoveryStrategies.set('connection_lost', {
            strategy: 'reconnect',
            maxAttempts: 5,
            baseDelay: 1000,
            backoffMultiplier: 2,
            execute: async (attempt) => {
                const delay = this.calculateBackoffDelay(attempt);
                await this.sleep(delay);
                return this.wsClient.reconnect();
            }
        });
        
        // Authentication errors
        this.recoveryStrategies.set('auth_failed', {
            strategy: 'refresh_token',
            maxAttempts: 3,
            execute: async () => {
                await this.wsClient.refreshAuthentication();
                return this.wsClient.reconnect();
            }
        });
        
        // Message timeout errors
        this.recoveryStrategies.set('message_timeout', {
            strategy: 'resend',
            maxAttempts: 3,
            execute: async (context) => {
                return this.wsClient.resendMessage(context.messageId);
            }
        });
        
        // Subscription errors
        this.recoveryStrategies.set('subscription_failed', {
            strategy: 'resubscribe',
            maxAttempts: 3,
            execute: async (context) => {
                return this.wsClient.resubscribe(context.subscriptionId);
            }
        });
    }
    
    async handleError(error) {
        const errorInfo = {
            type: error.type || 'unknown',
            message: error.message,
            timestamp: Date.now(),
            context: error.context || {},
            severity: this.determineSeverity(error)
        };
        
        // Log error
        this.errorHistory.push(errorInfo);
        console.error('🚨 WebSocket error:', errorInfo);
        
        // Emit error event
        this.wsClient.emit('error_occurred', errorInfo);
        
        // Attempt recovery
        await this.attemptRecovery(errorInfo);
    }
    
    async attemptRecovery(errorInfo) {
        const recovery = this.recoveryStrategies.get(errorInfo.type);
        
        if (!recovery) {
            console.warn(`No recovery strategy for error type: ${errorInfo.type}`);
            return false;
        }
        
        let attempt = 1;
        
        while (attempt <= recovery.maxAttempts) {
            try {
                console.log(`🔄 Recovery attempt ${attempt}/${recovery.maxAttempts} for ${errorInfo.type}`);
                
                const result = await recovery.execute(attempt, errorInfo.context);
                
                if (result) {
                    console.log(`✅ Recovery successful for ${errorInfo.type}`);
                    this.wsClient.emit('recovery_successful', {
                        errorType: errorInfo.type,
                        attempt: attempt,
                        strategy: recovery.strategy
                    });
                    return true;
                }
                
            } catch (recoveryError) {
                console.error(`❌ Recovery attempt ${attempt} failed:`, recoveryError);
            }
            
            attempt++;
            
            if (attempt <= recovery.maxAttempts && recovery.baseDelay) {
                const delay = this.calculateBackoffDelay(attempt, recovery);
                await this.sleep(delay);
            }
        }
        
        console.error(`❌ All recovery attempts failed for ${errorInfo.type}`);
        this.wsClient.emit('recovery_failed', {
            errorType: errorInfo.type,
            attempts: recovery.maxAttempts,
            strategy: recovery.strategy
        });
        
        return false;
    }
    
    calculateBackoffDelay(attempt, recovery = { baseDelay: 1000, backoffMultiplier: 2 }) {
        return recovery.baseDelay * Math.pow(recovery.backoffMultiplier, attempt - 1);
    }
    
    determineSeverity(error) {
        const criticalTypes = ['auth_failed', 'connection_lost', 'server_error'];
        const warningTypes = ['message_timeout', 'subscription_failed'];
        
        if (criticalTypes.includes(error.type)) return 'critical';
        if (warningTypes.includes(error.type)) return 'warning';
        return 'info';
    }
}
```

## Rate Limiting & Performance

### Rate Limiting Implementation

```javascript
// Rate limiting and performance optimization
class RateLimitManager {
    constructor(wsClient) {
        this.wsClient = wsClient;
        this.limits = {
            messagesPerMinute: 1000,
            subscriptionsLimit: 50,
            concurrentRequests: 10
        };
        
        this.counters = {
            messagesThisMinute: 0,
            activeSubscriptions: 0,
            concurrentRequests: 0
        };
        
        this.messageQueue = [];
        this.requestQueue = [];
        
        this.setupRateTracking();
    }
    
    setupRateTracking() {
        // Reset message counter every minute
        setInterval(() => {
            this.counters.messagesThisMinute = 0;
        }, 60000);
        
        // Process queued messages
        setInterval(() => {
            this.processMessageQueue();
        }, 100);
    }
    
    async sendMessage(message) {
        // Check rate limits
        if (!this.canSendMessage()) {
            return this.queueMessage(message);
        }
        
        // Check concurrent request limit
        if (this.counters.concurrentRequests >= this.limits.concurrentRequests) {
            return this.queueRequest(message);
        }
        
        try {
            this.counters.messagesThisMinute++;
            this.counters.concurrentRequests++;
            
            const result = await this.wsClient.send(message);
            
            return result;
            
        } finally {
            this.counters.concurrentRequests--;
        }
    }
    
    canSendMessage() {
        return this.counters.messagesThisMinute < this.limits.messagesPerMinute;
    }
    
    queueMessage(message) {
        return new Promise((resolve, reject) => {
            this.messageQueue.push({
                message: message,
                resolve: resolve,
                reject: reject,
                timestamp: Date.now()
            });
        });
    }
    
    processMessageQueue() {
        while (this.messageQueue.length > 0 && this.canSendMessage()) {
            const queuedItem = this.messageQueue.shift();
            
            this.sendMessage(queuedItem.message)
                .then(queuedItem.resolve)
                .catch(queuedItem.reject);
        }
    }
    
    updateLimits(newLimits) {
        this.limits = { ...this.limits, ...newLimits };
        console.log('Rate limits updated:', this.limits);
    }
    
    getLimitStatus() {
        return {
            messagesPerMinute: {
                current: this.counters.messagesThisMinute,
                limit: this.limits.messagesPerMinute,
                remaining: this.limits.messagesPerMinute - this.counters.messagesThisMinute
            },
            subscriptions: {
                current: this.counters.activeSubscriptions,
                limit: this.limits.subscriptionsLimit,
                remaining: this.limits.subscriptionsLimit - this.counters.activeSubscriptions
            },
            concurrentRequests: {
                current: this.counters.concurrentRequests,
                limit: this.limits.concurrentRequests,
                remaining: this.limits.concurrentRequests - this.counters.concurrentRequests
            },
            queuedMessages: this.messageQueue.length
        };
    }
}
```

### Performance Optimization

```javascript
// Performance optimization utilities
class PerformanceOptimizer {
    constructor(wsClient) {
        this.wsClient = wsClient;
        this.performanceMetrics = {
            messageLatency: [],
            reconnectionTimes: [],
            subscriptionTimes: [],
            throughput: []
        };
        
        this.optimizations = {
            messageCompression: true,
            connectionPooling: true,
            messageBuffering: true,
            priorityQueue: true
        };
        
        this.setupPerformanceMonitoring();
    }
    
    setupPerformanceMonitoring() {
        // Monitor message latency
        this.wsClient.on('message_sent', (message) => {
            message.sentAt = Date.now();
        });
        
        this.wsClient.on('message_response', (response, originalMessage) => {
            if (originalMessage.sentAt) {
                const latency = Date.now() - originalMessage.sentAt;
                this.recordLatency(latency);
            }
        });
        
        // Monitor throughput
        setInterval(() => {
            this.calculateThroughput();
        }, 5000);
    }
    
    recordLatency(latency) {
        this.performanceMetrics.messageLatency.push({
            latency: latency,
            timestamp: Date.now()
        });
        
        // Keep only recent measurements
        const cutoff = Date.now() - (5 * 60 * 1000); // 5 minutes
        this.performanceMetrics.messageLatency = 
            this.performanceMetrics.messageLatency.filter(m => m.timestamp > cutoff);
    }
    
    calculateThroughput() {
        const oneMinuteAgo = Date.now() - 60000;
        const recentMessages = this.performanceMetrics.messageLatency
            .filter(m => m.timestamp > oneMinuteAgo);
        
        const throughput = recentMessages.length; // messages per minute
        
        this.performanceMetrics.throughput.push({
            throughput: throughput,
            timestamp: Date.now()
        });
    }
    
    getPerformanceReport() {
        const latencies = this.performanceMetrics.messageLatency
            .map(m => m.latency);
        
        return {
            messageLatency: {
                average: this.calculateAverage(latencies),
                median: this.calculateMedian(latencies),
                p95: this.calculatePercentile(latencies, 95),
                p99: this.calculatePercentile(latencies, 99)
            },
            throughput: {
                current: this.getCurrentThroughput(),
                average: this.getAverageThroughput(),
                peak: this.getPeakThroughput()
            },
            optimizations: this.optimizations,
            recommendations: this.generateOptimizationRecommendations()
        };
    }
    
    generateOptimizationRecommendations() {
        const recommendations = [];
        const latencies = this.performanceMetrics.messageLatency.map(m => m.latency);
        const avgLatency = this.calculateAverage(latencies);
        
        if (avgLatency > 1000) {
            recommendations.push({
                type: 'latency',
                message: 'High message latency detected. Consider enabling message compression.',
                action: 'enableCompression'
            });
        }
        
        const throughput = this.getCurrentThroughput();
        if (throughput > 800) {
            recommendations.push({
                type: 'throughput',
                message: 'High message throughput. Consider implementing message buffering.',
                action: 'enableBuffering'
            });
        }
        
        return recommendations;
    }
}
```

## Code Examples & SDKs

### Complete Integration Example

```javascript
// Complete integration example
class SemantestRealTimeIntegration {
    constructor(config) {
        this.config = {
            apiKey: config.apiKey,
            environment: config.environment || 'production',
            autoReconnect: config.autoReconnect !== false,
            debug: config.debug || false
        };
        
        this.wsClient = null;
        this.subscriptionManager = null;
        this.testMonitor = null;
        this.aiClient = null;
        this.metricsStreamer = null;
        
        this.eventHandlers = new Map();
    }
    
    async initialize() {
        try {
            // Initialize WebSocket client
            this.wsClient = new SemantestWebSocketClient(
                this.config.apiKey,
                this.config.environment
            );
            
            await this.wsClient.connect();
            
            // Initialize service clients
            this.subscriptionManager = new SubscriptionManager(this.wsClient);
            this.testMonitor = new TestExecutionMonitor(this.wsClient);
            this.aiClient = new AIServiceClient(this.wsClient);
            this.metricsStreamer = new DashboardMetricsStreamer(this.wsClient);
            
            // Set up error handling
            this.errorHandler = new WebSocketErrorHandler(this.wsClient);
            
            // Set up rate limiting
            this.rateLimiter = new RateLimitManager(this.wsClient);
            
            // Set up performance monitoring
            this.performanceOptimizer = new PerformanceOptimizer(this.wsClient);
            
            console.log('✅ Semantest real-time integration initialized');
            
        } catch (error) {
            console.error('❌ Initialization failed:', error);
            throw error;
        }
    }
    
    // Test execution monitoring
    async monitorTestExecution(testSuiteId, callbacks = {}) {
        const subscriptionId = await this.testMonitor.startMonitoring(testSuiteId);
        
        // Set up callbacks
        if (callbacks.onTestStarted) {
            this.testMonitor.on('testStarted', callbacks.onTestStarted);
        }
        
        if (callbacks.onTestProgress) {
            this.testMonitor.on('testProgress', callbacks.onTestProgress);
        }
        
        if (callbacks.onTestCompleted) {
            this.testMonitor.on('testCompleted', callbacks.onTestCompleted);
        }
        
        return subscriptionId;
    }
    
    // AI analysis integration
    async requestAIAnalysis(testId, analysisType, callbacks = {}) {
        const analysisId = await this.aiClient.requestAnalysis(testId, analysisType);
        
        // Subscribe to analysis updates
        const subscriptionId = await this.aiClient.subscribeToAnalysisUpdates(analysisId);
        
        // Set up callbacks
        if (callbacks.onAnalysisStarted) {
            this.aiClient.on('analysisStarted', callbacks.onAnalysisStarted);
        }
        
        if (callbacks.onAnalysisProgress) {
            this.aiClient.on('analysisProgress', callbacks.onAnalysisProgress);
        }
        
        if (callbacks.onAnalysisCompleted) {
            this.aiClient.on('analysisCompleted', callbacks.onAnalysisCompleted);
        }
        
        return { analysisId, subscriptionId };
    }
    
    // Dashboard metrics streaming
    async streamDashboardMetrics(dashboardId, callbacks = {}) {
        const subscriptionId = await this.metricsStreamer.subscribeToDashboard(dashboardId);
        
        // Set up callbacks
        if (callbacks.onMetricsUpdate) {
            this.metricsStreamer.on('metricsUpdate', callbacks.onMetricsUpdate);
        }
        
        if (callbacks.onDashboardUpdate) {
            this.metricsStreamer.on('dashboardUpdate', callbacks.onDashboardUpdate);
        }
        
        return subscriptionId;
    }
    
    // Generic event subscription
    async subscribeToEvents(channel, filters = {}, callback) {
        const subscriptionId = await this.subscriptionManager.subscribe(
            channel,
            filters
        );
        
        this.subscriptionManager.onMessage(subscriptionId, callback);
        
        return subscriptionId;
    }
    
    // Cleanup
    async disconnect() {
        if (this.wsClient) {
            await this.wsClient.disconnect();
        }
        
        console.log('🔌 Disconnected from Semantest real-time services');
    }
    
    // Health check
    getHealthStatus() {
        return {
            connected: this.wsClient?.connectionState === 'connected',
            subscriptions: this.subscriptionManager?.subscriptions.size || 0,
            performance: this.performanceOptimizer?.getPerformanceReport(),
            rateLimits: this.rateLimiter?.getLimitStatus()
        };
    }
}

// Usage example
const semantest = new SemantestRealTimeIntegration({
    apiKey: 'your-api-key',
    environment: 'production',
    debug: true
});

await semantest.initialize();

// Monitor test execution
await semantest.monitorTestExecution('test-suite-123', {
    onTestStarted: (test) => {
        console.log(`Test started: ${test.testName}`);
    },
    onTestProgress: (progress) => {
        updateProgressBar(progress.percentage);
    },
    onTestCompleted: (result) => {
        showTestResults(result);
    }
});

// Request AI analysis
await semantest.requestAIAnalysis('test-456', 'performance_optimization', {
    onAnalysisCompleted: (analysis) => {
        displayRecommendations(analysis.results.recommendations);
    }
});

// Stream dashboard metrics
await semantest.streamDashboardMetrics('dashboard-789', {
    onMetricsUpdate: (metrics) => {
        updateDashboardWidget(metrics);
    }
});
```

This comprehensive WebSocket API reference provides complete documentation for integrating with Semantest's real-time streaming services, including connection management, event handling, AI service integration, and performance optimization.

---

**Last Updated**: January 19, 2025  
**Version**: 1.0.0  
**Maintainer**: Semantest API Team  
**Support**: api-support@semantest.com