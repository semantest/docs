# Real-time Dashboard Integration Examples

## Overview

Complete integration examples for building real-time dashboards with Semantest's WebSocket streaming and AI services. This guide provides production-ready code examples, best practices, and implementation patterns for creating responsive, intelligent dashboards.

## Table of Contents

1. [Dashboard Architecture](#dashboard-architecture)
2. [Live Metrics Dashboard](#live-metrics-dashboard)
3. [Real-time Test Monitoring](#real-time-test-monitoring)
4. [AI-Powered Analytics Dashboard](#ai-powered-analytics-dashboard)
5. [Performance Monitoring Dashboard](#performance-monitoring-dashboard)
6. [Multi-Environment Dashboard](#multi-environment-dashboard)
7. [Mobile-Responsive Dashboard](#mobile-responsive-dashboard)
8. [Enterprise Dashboard Suite](#enterprise-dashboard-suite)

## Dashboard Architecture

### Core Components Architecture

```javascript
// Dashboard architecture overview
class SemantestDashboardSystem {
    constructor(config) {
        this.config = config;
        this.wsClient = null;
        this.aiClient = null;
        this.dataStore = new DataStore();
        this.widgets = new Map();
        this.layouts = new Map();
        
        // Dashboard services
        this.metricsService = new MetricsService();
        this.alertingService = new AlertingService();
        this.visualizationService = new VisualizationService();
        this.exportService = new ExportService();
    }
    
    async initialize() {
        // Initialize WebSocket connection
        this.wsClient = new SemantestWebSocketClient(
            this.config.apiKey,
            this.config.environment
        );
        await this.wsClient.connect();
        
        // Initialize AI services
        this.aiClient = new SemantestAIServiceClient(this.config);
        await this.aiClient.initialize();
        
        // Set up data streaming
        this.setupDataStreaming();
        
        // Initialize widgets
        this.initializeWidgets();
        
        console.log('✅ Dashboard system initialized');
    }
    
    setupDataStreaming() {
        // Real-time metrics streaming
        this.wsClient.subscribe('dashboard_metrics', {}, (message) => {
            this.handleMetricsUpdate(message);
        });
        
        // Test execution events
        this.wsClient.subscribe('test_execution', {}, (message) => {
            this.handleTestExecutionUpdate(message);
        });
        
        // AI analysis updates
        this.wsClient.subscribe('ai_analysis', {}, (message) => {
            this.handleAIAnalysisUpdate(message);
        });
    }
}
```

### Data Flow Pattern

```javascript
// Real-time data flow management
class DashboardDataFlow {
    constructor(wsClient, dataStore) {
        this.wsClient = wsClient;
        this.dataStore = dataStore;
        this.processors = new Map();
        this.aggregators = new Map();
        this.publishers = new Map();
    }
    
    // Data processing pipeline
    setupDataPipeline() {
        // Raw data processor
        this.processors.set('raw', new RawDataProcessor());
        
        // Aggregation processors
        this.processors.set('metrics', new MetricsAggregator());
        this.processors.set('trends', new TrendAnalyzer());
        this.processors.set('alerts', new AlertProcessor());
        
        // Output publishers
        this.publishers.set('widgets', new WidgetPublisher());
        this.publishers.set('exports', new ExportPublisher());
        this.publishers.set('notifications', new NotificationPublisher());
    }
    
    processIncomingData(message) {
        // 1. Raw data processing
        const processed = this.processors.get('raw').process(message);
        
        // 2. Store in data store
        this.dataStore.store(processed);
        
        // 3. Trigger aggregations
        this.triggerAggregations(processed);
        
        // 4. Publish to widgets
        this.publishToWidgets(processed);
        
        // 5. Check for alerts
        this.checkAlerts(processed);
    }
}
```

## Live Metrics Dashboard

### Real-time Metrics Widget

```javascript
// Live metrics dashboard implementation
class LiveMetricsDashboard extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            metrics: {
                testSuccessRate: 0,
                averageExecutionTime: 0,
                activeTests: 0,
                totalTestsToday: 0,
                failureRate: 0,
                performanceScore: 0
            },
            trends: {},
            alerts: [],
            isConnected: false,
            lastUpdate: null
        };
        
        this.wsClient = null;
        this.metricsStreamer = null;
        this.updateInterval = null;
    }
    
    async componentDidMount() {
        await this.initializeDashboard();
        this.startPeriodicUpdates();
    }
    
    async initializeDashboard() {
        try {
            // Initialize WebSocket connection
            this.wsClient = new SemantestWebSocketClient(
                this.props.apiKey,
                this.props.environment
            );
            
            await this.wsClient.connect();
            this.setState({ isConnected: true });
            
            // Initialize metrics streaming
            this.metricsStreamer = new DashboardMetricsStreamer(this.wsClient);
            
            // Subscribe to real-time metrics
            await this.metricsStreamer.subscribeToDashboard('main-dashboard', [
                'test_success_rate',
                'execution_time',
                'active_tests',
                'failure_rate',
                'performance_score'
            ]);
            
            // Set up event handlers
            this.setupEventHandlers();
            
        } catch (error) {
            console.error('Dashboard initialization failed:', error);
            this.setState({ isConnected: false });
        }
    }
    
    setupEventHandlers() {
        // Real-time metrics updates
        this.metricsStreamer.on('metricsUpdate', (update) => {
            this.handleMetricsUpdate(update);
        });
        
        // Dashboard-wide updates
        this.metricsStreamer.on('dashboardUpdate', (update) => {
            this.handleDashboardUpdate(update);
        });
        
        // Connection status changes
        this.wsClient.on('connectionChange', (status) => {
            this.setState({ isConnected: status === 'connected' });
        });
    }
    
    handleMetricsUpdate(update) {
        const { metricType, currentValue, trend, metadata } = update;
        
        this.setState(prevState => ({
            metrics: {
                ...prevState.metrics,
                [metricType]: currentValue
            },
            trends: {
                ...prevState.trends,
                [metricType]: trend
            },
            lastUpdate: Date.now()
        }));
        
        // Check for alert conditions
        this.checkAlertConditions(metricType, currentValue, metadata);
    }
    
    checkAlertConditions(metricType, value, metadata) {
        const alertRules = {
            testSuccessRate: { threshold: 0.9, operator: 'less_than' },
            failureRate: { threshold: 0.1, operator: 'greater_than' },
            averageExecutionTime: { threshold: 300000, operator: 'greater_than' } // 5 minutes
        };
        
        const rule = alertRules[metricType];
        if (!rule) return;
        
        let shouldAlert = false;
        
        if (rule.operator === 'less_than' && value < rule.threshold) {
            shouldAlert = true;
        } else if (rule.operator === 'greater_than' && value > rule.threshold) {
            shouldAlert = true;
        }
        
        if (shouldAlert) {
            this.triggerAlert({
                type: 'metric_threshold',
                metric: metricType,
                value: value,
                threshold: rule.threshold,
                severity: this.calculateAlertSeverity(metricType, value, rule),
                timestamp: Date.now()
            });
        }
    }
    
    render() {
        const { metrics, trends, alerts, isConnected, lastUpdate } = this.state;
        
        return (
            <div className="live-metrics-dashboard">
                {/* Connection Status */}
                <div className="dashboard-header">
                    <h1>Live Metrics Dashboard</h1>
                    <div className="connection-status">
                        <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`} />
                        {isConnected ? 'Live' : 'Disconnected'}
                        {lastUpdate && (
                            <span className="last-update">
                                Updated {this.formatTime(lastUpdate)}
                            </span>
                        )}
                    </div>
                </div>
                
                {/* Alert Bar */}
                {alerts.length > 0 && (
                    <div className="alert-bar">
                        {alerts.slice(0, 3).map(alert => (
                            <Alert key={alert.id} alert={alert} onDismiss={this.dismissAlert} />
                        ))}
                    </div>
                )}
                
                {/* Metrics Grid */}
                <div className="metrics-grid">
                    <MetricCard
                        title="Test Success Rate"
                        value={metrics.testSuccessRate}
                        format="percentage"
                        trend={trends.testSuccessRate}
                        target={0.95}
                        status={metrics.testSuccessRate >= 0.9 ? 'good' : 'warning'}
                    />
                    
                    <MetricCard
                        title="Average Execution Time"
                        value={metrics.averageExecutionTime}
                        format="duration"
                        trend={trends.averageExecutionTime}
                        target={120000} // 2 minutes
                        status={metrics.averageExecutionTime <= 180000 ? 'good' : 'warning'}
                    />
                    
                    <MetricCard
                        title="Active Tests"
                        value={metrics.activeTests}
                        format="number"
                        trend={trends.activeTests}
                        realTime={true}
                    />
                    
                    <MetricCard
                        title="Tests Today"
                        value={metrics.totalTestsToday}
                        format="number"
                        trend={trends.totalTestsToday}
                        subtitle="Total executions"
                    />
                    
                    <MetricCard
                        title="Failure Rate"
                        value={metrics.failureRate}
                        format="percentage"
                        trend={trends.failureRate}
                        target={0.05}
                        status={metrics.failureRate <= 0.1 ? 'good' : 'critical'}
                        inverted={true}
                    />
                    
                    <MetricCard
                        title="Performance Score"
                        value={metrics.performanceScore}
                        format="score"
                        trend={trends.performanceScore}
                        target={85}
                        max={100}
                        status={metrics.performanceScore >= 80 ? 'good' : 'warning'}
                    />
                </div>
                
                {/* Real-time Charts */}
                <div className="charts-section">
                    <div className="chart-container">
                        <LiveLineChart
                            title="Success Rate Trend"
                            dataSource="test_success_rate"
                            timeWindow={3600000} // 1 hour
                            updateInterval={5000} // 5 seconds
                        />
                    </div>
                    
                    <div className="chart-container">
                        <LiveBarChart
                            title="Test Execution Volume"
                            dataSource="test_execution_count"
                            timeWindow={86400000} // 24 hours
                            groupBy="hour"
                        />
                    </div>
                </div>
            </div>
        );
    }
}

// Metric Card Component
class MetricCard extends React.Component {
    render() {
        const { title, value, format, trend, target, status, realTime, inverted } = this.props;
        
        return (
            <div className={`metric-card ${status} ${realTime ? 'real-time' : ''}`}>
                <div className="metric-header">
                    <h3>{title}</h3>
                    {realTime && <span className="real-time-indicator">LIVE</span>}
                </div>
                
                <div className="metric-value">
                    <span className="value">{this.formatValue(value, format)}</span>
                    {trend && (
                        <span className={`trend ${trend.direction}`}>
                            {trend.direction === 'increasing' ? '↗' : trend.direction === 'decreasing' ? '↘' : '→'}
                            {Math.abs(trend.change).toFixed(1)}%
                        </span>
                    )}
                </div>
                
                {target && (
                    <div className="metric-target">
                        Target: {this.formatValue(target, format)}
                        <div className="progress-bar">
                            <div 
                                className="progress-fill"
                                style={{ width: `${Math.min(100, (value / target) * 100)}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    }
    
    formatValue(value, format) {
        switch (format) {
            case 'percentage':
                return `${(value * 100).toFixed(1)}%`;
            case 'duration':
                return this.formatDuration(value);
            case 'number':
                return value.toLocaleString();
            case 'score':
                return `${value}/100`;
            default:
                return value;
        }
    }
    
    formatDuration(ms) {
        if (ms < 1000) return `${ms}ms`;
        if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
        return `${(ms / 60000).toFixed(1)}m`;
    }
}
```

## Real-time Test Monitoring

### Test Execution Dashboard

```javascript
// Real-time test execution monitoring
class TestExecutionDashboard extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            activeTests: new Map(),
            recentCompletions: [],
            queuedTests: [],
            testMetrics: {},
            environmentStatus: {},
            filters: {
                environment: 'all',
                testType: 'all',
                status: 'all'
            }
        };
        
        this.testMonitor = null;
        this.wsClient = null;
    }
    
    async componentDidMount() {
        await this.initializeTestMonitoring();
    }
    
    async initializeTestMonitoring() {
        // Initialize WebSocket client
        this.wsClient = new SemantestWebSocketClient(
            this.props.apiKey,
            this.props.environment
        );
        await this.wsClient.connect();
        
        // Initialize test monitoring
        this.testMonitor = new TestExecutionMonitor(this.wsClient);
        
        // Subscribe to test execution events
        await this.testMonitor.startMonitoring('all', {
            includeDetails: true,
            includeMetrics: true,
            includeScreenshots: true
        });
        
        // Set up event handlers
        this.setupTestEventHandlers();
    }
    
    setupTestEventHandlers() {
        this.testMonitor.on('testStarted', (test) => {
            this.handleTestStarted(test);
        });
        
        this.testMonitor.on('testProgress', (progress) => {
            this.handleTestProgress(progress);
        });
        
        this.testMonitor.on('testCompleted', (result) => {
            this.handleTestCompleted(result);
        });
        
        this.testMonitor.on('testFailed', (failure) => {
            this.handleTestFailed(failure);
        });
    }
    
    handleTestStarted(test) {
        this.setState(prevState => {
            const newActiveTests = new Map(prevState.activeTests);
            newActiveTests.set(test.testId, {
                ...test,
                startTime: Date.now(),
                progress: 0,
                status: 'running'
            });
            
            return { activeTests: newActiveTests };
        });
    }
    
    handleTestProgress(progress) {
        this.setState(prevState => {
            const newActiveTests = new Map(prevState.activeTests);
            const test = newActiveTests.get(progress.testId);
            
            if (test) {
                newActiveTests.set(progress.testId, {
                    ...test,
                    progress: progress.percentage,
                    currentStep: progress.currentStep,
                    screenshot: progress.screenshot,
                    metrics: progress.metrics
                });
            }
            
            return { activeTests: newActiveTests };
        });
    }
    
    handleTestCompleted(result) {
        this.setState(prevState => {
            const newActiveTests = new Map(prevState.activeTests);
            const completedTest = newActiveTests.get(result.testId);
            newActiveTests.delete(result.testId);
            
            const newRecentCompletions = [
                {
                    ...completedTest,
                    ...result,
                    completedAt: Date.now(),
                    status: 'completed'
                },
                ...prevState.recentCompletions.slice(0, 19) // Keep last 20
            ];
            
            return {
                activeTests: newActiveTests,
                recentCompletions: newRecentCompletions
            };
        });
    }
    
    render() {
        const { activeTests, recentCompletions, filters } = this.state;
        
        return (
            <div className="test-execution-dashboard">
                <div className="dashboard-header">
                    <h1>Real-time Test Monitoring</h1>
                    <div className="dashboard-controls">
                        <FilterControls
                            filters={filters}
                            onChange={this.handleFilterChange}
                        />
                        <div className="view-controls">
                            <button onClick={this.exportResults}>Export</button>
                            <button onClick={this.refreshData}>Refresh</button>
                        </div>
                    </div>
                </div>
                
                {/* Active Tests Section */}
                <div className="active-tests-section">
                    <h2>Active Tests ({activeTests.size})</h2>
                    
                    {activeTests.size === 0 ? (
                        <div className="empty-state">
                            <p>No tests currently running</p>
                        </div>
                    ) : (
                        <div className="active-tests-grid">
                            {Array.from(activeTests.values()).map(test => (
                                <ActiveTestCard
                                    key={test.testId}
                                    test={test}
                                    onViewDetails={this.handleViewTestDetails}
                                    onCancel={this.handleCancelTest}
                                />
                            ))}
                        </div>
                    )}
                </div>
                
                {/* Recent Completions */}
                <div className="recent-completions-section">
                    <h2>Recent Completions</h2>
                    <div className="completions-list">
                        {recentCompletions.map(test => (
                            <CompletedTestCard
                                key={`${test.testId}-${test.completedAt}`}
                                test={test}
                                onViewDetails={this.handleViewTestDetails}
                                onRerun={this.handleRerunTest}
                            />
                        ))}
                    </div>
                </div>
                
                {/* Test Queue */}
                <div className="test-queue-section">
                    <h2>Test Queue</h2>
                    <TestQueue
                        queuedTests={this.state.queuedTests}
                        onPriorityChange={this.handleQueuePriorityChange}
                        onRemoveFromQueue={this.handleRemoveFromQueue}
                    />
                </div>
            </div>
        );
    }
}

// Active Test Card Component
class ActiveTestCard extends React.Component {
    render() {
        const { test } = this.props;
        const duration = Date.now() - test.startTime;
        
        return (
            <div className="active-test-card">
                <div className="test-header">
                    <h3>{test.testName}</h3>
                    <span className={`status-badge ${test.status}`}>
                        {test.status.toUpperCase()}
                    </span>
                </div>
                
                <div className="test-progress">
                    <div className="progress-bar">
                        <div 
                            className="progress-fill"
                            style={{ width: `${test.progress}%` }}
                        />
                    </div>
                    <span className="progress-text">{test.progress}%</span>
                </div>
                
                <div className="test-details">
                    <div className="detail-row">
                        <span>Current Step:</span>
                        <span>{test.currentStep || 'Initializing...'}</span>
                    </div>
                    <div className="detail-row">
                        <span>Duration:</span>
                        <span>{this.formatDuration(duration)}</span>
                    </div>
                    <div className="detail-row">
                        <span>Environment:</span>
                        <span>{test.environment}</span>
                    </div>
                </div>
                
                {test.metrics && (
                    <div className="test-metrics">
                        <div className="metric">
                            <span>Memory:</span>
                            <span>{test.metrics.memoryUsage}MB</span>
                        </div>
                        <div className="metric">
                            <span>CPU:</span>
                            <span>{test.metrics.cpuUsage}%</span>
                        </div>
                    </div>
                )}
                
                {test.screenshot && (
                    <div className="test-screenshot">
                        <img 
                            src={test.screenshot}
                            alt="Current test state"
                            onClick={() => this.props.onViewDetails(test)}
                        />
                    </div>
                )}
                
                <div className="test-actions">
                    <button 
                        onClick={() => this.props.onViewDetails(test)}
                        className="btn-secondary"
                    >
                        View Details
                    </button>
                    <button 
                        onClick={() => this.props.onCancel(test)}
                        className="btn-danger"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        );
    }
    
    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }
}
```

## AI-Powered Analytics Dashboard

### Intelligent Insights Dashboard

```javascript
// AI-powered analytics dashboard
class AIAnalyticsDashboard extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            insights: [],
            predictions: {},
            recommendations: [],
            patterns: [],
            anomalies: [],
            aiAnalysisStatus: 'idle',
            selectedTimeframe: '7d'
        };
        
        this.aiClient = null;
        this.analysisEngine = null;
    }
    
    async componentDidMount() {
        await this.initializeAIAnalytics();
        this.startContinuousAnalysis();
    }
    
    async initializeAIAnalytics() {
        // Initialize AI client
        this.aiClient = new SemantestAIServiceClient({
            apiKey: this.props.apiKey,
            environment: this.props.environment,
            enableRealTime: true
        });
        
        await this.aiClient.initialize();
        
        // Initialize analysis engine
        this.analysisEngine = new AnalyticsEngine(this.aiClient);
        
        // Set up AI event handlers
        this.setupAIEventHandlers();
        
        // Load initial insights
        await this.loadInitialInsights();
    }
    
    setupAIEventHandlers() {
        this.aiClient.on('analysisCompleted', (analysis) => {
            this.handleAnalysisCompleted(analysis);
        });
        
        this.aiClient.on('newRecommendation', (recommendation) => {
            this.handleNewRecommendation(recommendation);
        });
        
        this.aiClient.on('patternDetected', (pattern) => {
            this.handlePatternDetected(pattern);
        });
        
        this.aiClient.on('anomalyDetected', (anomaly) => {
            this.handleAnomalyDetected(anomaly);
        });
    }
    
    async loadInitialInsights() {
        this.setState({ aiAnalysisStatus: 'loading' });
        
        try {
            // Get historical test data
            const testData = await this.getTestData(this.state.selectedTimeframe);
            
            // Run comprehensive analysis
            const [
                failurePredictions,
                trendAnalysis,
                patternDetection,
                performanceInsights
            ] = await Promise.all([
                this.aiClient.prediction.predictTestFailures(testData),
                this.aiClient.prediction.analyzeTrends(testData.metrics),
                this.aiClient.analysis.detectPatterns(testData),
                this.aiClient.performance.analyzePerformance(testData.performance)
            ]);
            
            this.setState({
                predictions: failurePredictions,
                patterns: patternDetection.patterns,
                anomalies: patternDetection.anomalies,
                insights: this.generateInsights([
                    trendAnalysis,
                    performanceInsights,
                    patternDetection
                ]),
                aiAnalysisStatus: 'completed'
            });
            
        } catch (error) {
            console.error('AI analysis failed:', error);
            this.setState({ aiAnalysisStatus: 'error' });
        }
    }
    
    generateInsights(analysisResults) {
        const insights = [];
        
        analysisResults.forEach(result => {
            if (result.insights) {
                insights.push(...result.insights.map(insight => ({
                    ...insight,
                    id: this.generateId(),
                    timestamp: Date.now(),
                    source: result.analysisType || 'ai_analysis'
                })));
            }
        });
        
        // Sort by confidence and impact
        return insights.sort((a, b) => {
            const aScore = (a.confidence || 0) * (a.impact || 0);
            const bScore = (b.confidence || 0) * (b.impact || 0);
            return bScore - aScore;
        });
    }
    
    render() {
        const { 
            insights, 
            predictions, 
            recommendations, 
            patterns, 
            anomalies, 
            aiAnalysisStatus 
        } = this.state;
        
        return (
            <div className="ai-analytics-dashboard">
                <div className="dashboard-header">
                    <h1>AI-Powered Analytics</h1>
                    <div className="controls">
                        <TimeframeSelector
                            value={this.state.selectedTimeframe}
                            onChange={this.handleTimeframeChange}
                        />
                        <button 
                            onClick={this.triggerAnalysis}
                            disabled={aiAnalysisStatus === 'loading'}
                        >
                            {aiAnalysisStatus === 'loading' ? 'Analyzing...' : 'Refresh Analysis'}
                        </button>
                    </div>
                </div>
                
                {/* AI Status Indicator */}
                <div className="ai-status-bar">
                    <div className={`ai-status ${aiAnalysisStatus}`}>
                        <span className="status-icon">🤖</span>
                        <span>AI Analysis: {this.formatStatus(aiAnalysisStatus)}</span>
                        {aiAnalysisStatus === 'loading' && (
                            <div className="loading-spinner" />
                        )}
                    </div>
                </div>
                
                {/* Insights Overview */}
                <div className="insights-overview">
                    <div className="overview-grid">
                        <OverviewCard
                            title="High-Priority Insights"
                            value={insights.filter(i => i.priority === 'high').length}
                            total={insights.length}
                            icon="💡"
                            color="blue"
                        />
                        <OverviewCard
                            title="Predicted Failures"
                            value={predictions.predictions?.filter(p => p.riskLevel === 'high').length || 0}
                            total={predictions.predictions?.length || 0}
                            icon="⚠️"
                            color="orange"
                        />
                        <OverviewCard
                            title="Active Patterns"
                            value={patterns.filter(p => p.isActive).length}
                            total={patterns.length}
                            icon="🔍"
                            color="green"
                        />
                        <OverviewCard
                            title="Anomalies Detected"
                            value={anomalies.filter(a => a.severity === 'high').length}
                            total={anomalies.length}
                            icon="🚨"
                            color="red"
                        />
                    </div>
                </div>
                
                {/* Key Insights */}
                <div className="key-insights-section">
                    <h2>Key Insights</h2>
                    <div className="insights-grid">
                        {insights.slice(0, 6).map(insight => (
                            <InsightCard
                                key={insight.id}
                                insight={insight}
                                onViewDetails={this.handleViewInsightDetails}
                                onTakeAction={this.handleTakeAction}
                            />
                        ))}
                    </div>
                </div>
                
                {/* Failure Predictions */}
                <div className="predictions-section">
                    <h2>Failure Predictions</h2>
                    <FailurePredictionChart
                        predictions={predictions.predictions || []}
                        timeframe={this.state.selectedTimeframe}
                        onDrillDown={this.handlePredictionDrillDown}
                    />
                </div>
                
                {/* Pattern Analysis */}
                <div className="patterns-section">
                    <h2>Detected Patterns</h2>
                    <PatternVisualization
                        patterns={patterns}
                        onPatternSelect={this.handlePatternSelect}
                    />
                </div>
                
                {/* AI Recommendations */}
                <div className="recommendations-section">
                    <h2>AI Recommendations</h2>
                    <RecommendationsList
                        recommendations={recommendations}
                        onImplement={this.handleImplementRecommendation}
                        onDismiss={this.handleDismissRecommendation}
                    />
                </div>
                
                {/* Anomaly Detection */}
                <div className="anomalies-section">
                    <h2>Anomaly Detection</h2>
                    <AnomalyTimeline
                        anomalies={anomalies}
                        onAnomalySelect={this.handleAnomalySelect}
                    />
                </div>
            </div>
        );
    }
}

// Insight Card Component
class InsightCard extends React.Component {
    render() {
        const { insight } = this.props;
        
        return (
            <div className={`insight-card ${insight.priority} ${insight.category}`}>
                <div className="insight-header">
                    <div className="insight-icon">
                        {this.getInsightIcon(insight.type)}
                    </div>
                    <div className="insight-meta">
                        <span className="insight-category">{insight.category}</span>
                        <span className="insight-confidence">
                            {Math.round(insight.confidence * 100)}% confidence
                        </span>
                    </div>
                </div>
                
                <div className="insight-content">
                    <h3>{insight.title || insight.description}</h3>
                    <p>{insight.summary || insight.description}</p>
                    
                    {insight.evidence && (
                        <div className="insight-evidence">
                            <strong>Evidence:</strong>
                            <ul>
                                {insight.evidence.slice(0, 2).map((evidence, index) => (
                                    <li key={index}>{evidence}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
                
                <div className="insight-actions">
                    <button 
                        onClick={() => this.props.onViewDetails(insight)}
                        className="btn-secondary"
                    >
                        View Details
                    </button>
                    {insight.actionable && (
                        <button 
                            onClick={() => this.props.onTakeAction(insight)}
                            className="btn-primary"
                        >
                            Take Action
                        </button>
                    )}
                </div>
                
                <div className="insight-footer">
                    <span className="insight-impact">
                        Impact: {insight.impact || 'Medium'}
                    </span>
                    <span className="insight-timestamp">
                        {this.formatTimestamp(insight.timestamp)}
                    </span>
                </div>
            </div>
        );
    }
    
    getInsightIcon(type) {
        const icons = {
            performance: '⚡',
            reliability: '🛡️',
            optimization: '🔧',
            pattern: '🔍',
            anomaly: '🚨',
            prediction: '🔮',
            trend: '📈'
        };
        
        return icons[type] || '💡';
    }
}
```

## Performance Monitoring Dashboard

### System Performance Dashboard

```javascript
// Performance monitoring dashboard
class PerformanceMonitoringDashboard extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            systemMetrics: {
                cpu: { current: 0, trend: [] },
                memory: { current: 0, trend: [] },
                network: { current: 0, trend: [] },
                storage: { current: 0, trend: [] }
            },
            applicationMetrics: {
                responseTime: { current: 0, trend: [] },
                throughput: { current: 0, trend: [] },
                errorRate: { current: 0, trend: [] },
                activeConnections: { current: 0, trend: [] }
            },
            alerts: [],
            performanceScore: 0,
            bottlenecks: [],
            recommendations: []
        };
        
        this.performanceMonitor = null;
        this.updateInterval = null;
    }
    
    async componentDidMount() {
        await this.initializePerformanceMonitoring();
        this.startRealTimeUpdates();
    }
    
    async initializePerformanceMonitoring() {
        // Initialize performance monitoring
        this.performanceMonitor = new PerformanceMonitor({
            apiKey: this.props.apiKey,
            environment: this.props.environment,
            metrics: [
                'system_cpu',
                'system_memory', 
                'system_network',
                'system_storage',
                'app_response_time',
                'app_throughput',
                'app_error_rate',
                'app_connections'
            ],
            alertThresholds: {
                cpu: 80,
                memory: 85,
                responseTime: 1000,
                errorRate: 0.05
            }
        });
        
        await this.performanceMonitor.initialize();
        
        // Set up event handlers
        this.setupPerformanceEventHandlers();
        
        // Load initial performance data
        await this.loadInitialPerformanceData();
    }
    
    setupPerformanceEventHandlers() {
        this.performanceMonitor.on('metricsUpdate', (metrics) => {
            this.handleMetricsUpdate(metrics);
        });
        
        this.performanceMonitor.on('alertTriggered', (alert) => {
            this.handleAlertTriggered(alert);
        });
        
        this.performanceMonitor.on('bottleneckDetected', (bottleneck) => {
            this.handleBottleneckDetected(bottleneck);
        });
        
        this.performanceMonitor.on('performanceInsight', (insight) => {
            this.handlePerformanceInsight(insight);
        });
    }
    
    handleMetricsUpdate(metrics) {
        this.setState(prevState => {
            const newSystemMetrics = { ...prevState.systemMetrics };
            const newApplicationMetrics = { ...prevState.applicationMetrics };
            
            // Update system metrics
            Object.keys(metrics.system || {}).forEach(key => {
                if (newSystemMetrics[key]) {
                    newSystemMetrics[key] = {
                        current: metrics.system[key],
                        trend: [
                            ...newSystemMetrics[key].trend.slice(-59), // Keep last 60 points
                            {
                                value: metrics.system[key],
                                timestamp: Date.now()
                            }
                        ]
                    };
                }
            });
            
            // Update application metrics
            Object.keys(metrics.application || {}).forEach(key => {
                if (newApplicationMetrics[key]) {
                    newApplicationMetrics[key] = {
                        current: metrics.application[key],
                        trend: [
                            ...newApplicationMetrics[key].trend.slice(-59),
                            {
                                value: metrics.application[key],
                                timestamp: Date.now()
                            }
                        ]
                    };
                }
            });
            
            return {
                systemMetrics: newSystemMetrics,
                applicationMetrics: newApplicationMetrics,
                performanceScore: this.calculatePerformanceScore(newSystemMetrics, newApplicationMetrics)
            };
        });
    }
    
    calculatePerformanceScore(systemMetrics, applicationMetrics) {
        const weights = {
            cpu: 0.2,
            memory: 0.2,
            responseTime: 0.3,
            errorRate: 0.3
        };
        
        const scores = {
            cpu: Math.max(0, 100 - systemMetrics.cpu.current),
            memory: Math.max(0, 100 - systemMetrics.memory.current),
            responseTime: Math.max(0, 100 - (applicationMetrics.responseTime.current / 10)), // Scale response time
            errorRate: Math.max(0, 100 - (applicationMetrics.errorRate.current * 1000)) // Scale error rate
        };
        
        return Object.keys(weights).reduce((total, metric) => {
            return total + (scores[metric] * weights[metric]);
        }, 0);
    }
    
    render() {
        const { 
            systemMetrics, 
            applicationMetrics, 
            alerts, 
            performanceScore, 
            bottlenecks,
            recommendations 
        } = this.state;
        
        return (
            <div className="performance-monitoring-dashboard">
                <div className="dashboard-header">
                    <h1>Performance Monitoring</h1>
                    <div className="performance-score">
                        <div className="score-gauge">
                            <CircularProgress 
                                value={performanceScore} 
                                max={100}
                                color={this.getScoreColor(performanceScore)}
                            />
                            <span className="score-label">Performance Score</span>
                        </div>
                    </div>
                </div>
                
                {/* Active Alerts */}
                {alerts.length > 0 && (
                    <div className="alerts-section">
                        <h2>Active Alerts ({alerts.length})</h2>
                        <div className="alerts-list">
                            {alerts.map(alert => (
                                <AlertCard
                                    key={alert.id}
                                    alert={alert}
                                    onAcknowledge={this.handleAcknowledgeAlert}
                                    onResolve={this.handleResolveAlert}
                                />
                            ))}
                        </div>
                    </div>
                )}
                
                {/* System Metrics */}
                <div className="system-metrics-section">
                    <h2>System Metrics</h2>
                    <div className="metrics-grid">
                        <MetricChart
                            title="CPU Usage"
                            current={systemMetrics.cpu.current}
                            trend={systemMetrics.cpu.trend}
                            unit="%"
                            threshold={80}
                            type="gauge"
                        />
                        <MetricChart
                            title="Memory Usage"
                            current={systemMetrics.memory.current}
                            trend={systemMetrics.memory.trend}
                            unit="%"
                            threshold={85}
                            type="gauge"
                        />
                        <MetricChart
                            title="Network I/O"
                            current={systemMetrics.network.current}
                            trend={systemMetrics.network.trend}
                            unit="MB/s"
                            type="line"
                        />
                        <MetricChart
                            title="Storage I/O"
                            current={systemMetrics.storage.current}
                            trend={systemMetrics.storage.trend}
                            unit="MB/s"
                            type="line"
                        />
                    </div>
                </div>
                
                {/* Application Metrics */}
                <div className="application-metrics-section">
                    <h2>Application Metrics</h2>
                    <div className="metrics-grid">
                        <MetricChart
                            title="Response Time"
                            current={applicationMetrics.responseTime.current}
                            trend={applicationMetrics.responseTime.trend}
                            unit="ms"
                            threshold={1000}
                            type="line"
                        />
                        <MetricChart
                            title="Throughput"
                            current={applicationMetrics.throughput.current}
                            trend={applicationMetrics.throughput.trend}
                            unit="req/s"
                            type="area"
                        />
                        <MetricChart
                            title="Error Rate"
                            current={applicationMetrics.errorRate.current}
                            trend={applicationMetrics.errorRate.trend}
                            unit="%"
                            threshold={5}
                            type="line"
                            inverted={true}
                        />
                        <MetricChart
                            title="Active Connections"
                            current={applicationMetrics.activeConnections.current}
                            trend={applicationMetrics.activeConnections.trend}
                            unit=""
                            type="bar"
                        />
                    </div>
                </div>
                
                {/* Bottlenecks */}
                {bottlenecks.length > 0 && (
                    <div className="bottlenecks-section">
                        <h2>Performance Bottlenecks</h2>
                        <div className="bottlenecks-list">
                            {bottlenecks.map(bottleneck => (
                                <BottleneckCard
                                    key={bottleneck.id}
                                    bottleneck={bottleneck}
                                    onInvestigate={this.handleInvestigateBottleneck}
                                    onOptimize={this.handleOptimizeBottleneck}
                                />
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Performance Recommendations */}
                {recommendations.length > 0 && (
                    <div className="recommendations-section">
                        <h2>Performance Recommendations</h2>
                        <div className="recommendations-list">
                            {recommendations.map(rec => (
                                <RecommendationCard
                                    key={rec.id}
                                    recommendation={rec}
                                    onImplement={this.handleImplementRecommendation}
                                    onDismiss={this.handleDismissRecommendation}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }
    
    getScoreColor(score) {
        if (score >= 80) return '#10b981'; // green
        if (score >= 60) return '#f59e0b'; // yellow
        return '#ef4444'; // red
    }
}
```

This comprehensive real-time dashboard integration guide provides production-ready examples for building intelligent, responsive dashboards with Semantest's WebSocket streaming and AI services. The examples cover live metrics monitoring, test execution tracking, AI-powered analytics, and performance monitoring with complete implementation details.

---

**Last Updated**: January 19, 2025  
**Version**: 1.0.0  
**Maintainer**: Semantest Dashboard Team  
**Support**: dashboard-support@semantest.com