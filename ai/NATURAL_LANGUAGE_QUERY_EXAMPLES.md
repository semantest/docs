# Semantest Natural Language Query Examples

## Overview

Comprehensive collection of natural language query examples for Semantest's AI-powered testing platform. This guide demonstrates how to interact with the system using conversational English to create tests, analyze results, manage test suites, and extract insights from your testing data.

## Table of Contents

1. [Basic Query Patterns](#basic-query-patterns)
2. [Test Creation Queries](#test-creation-queries)
3. [Test Analysis Queries](#test-analysis-queries)
4. [Data Extraction Queries](#data-extraction-queries)
5. [Performance Analysis Queries](#performance-analysis-queries)
6. [Troubleshooting Queries](#troubleshooting-queries)
7. [Advanced Query Patterns](#advanced-query-patterns)
8. [Domain-Specific Examples](#domain-specific-examples)
9. [Multi-Language Support](#multi-language-support)
10. [Query Optimization Tips](#query-optimization-tips)

## Basic Query Patterns

### Simple Information Queries

#### Getting Started Queries
```yaml
basic_information:
  project_overview:
    examples:
      - "Show me all my projects"
      - "What tests are in the shopping cart project?"
      - "How many test suites do I have?"
      - "Which projects have the most tests?"
    
    responses:
      structured_data: "Table or list format with key metrics"
      natural_language: "Conversational summary with highlights"
      visual_elements: "Charts and graphs when applicable"
  
  test_status:
    examples:
      - "What tests are currently running?"
      - "Show me failed tests from yesterday"
      - "Are there any flaky tests in my suite?"
      - "Which tests haven't run in the last week?"
    
    context_awareness:
      - Current user's projects and permissions
      - Recent activity and test execution history
      - Team assignments and responsibilities
      - Time zone and locale preferences
```

#### Navigation and Discovery
```yaml
navigation_queries:
  content_discovery:
    - "Find tests related to user login"
    - "Show me all API tests"
    - "What mobile tests do we have for iOS?"
    - "Find tests that use the database"
    - "Show me tests tagged as 'critical'"
  
  relationship_exploration:
    - "Which tests depend on the user registration test?"
    - "Show me all tests that interact with the payment API"
    - "Find tests that cover the checkout process"
    - "What tests share the same test data?"
  
  temporal_queries:
    - "Show me tests created this week"
    - "What tests were modified by John yesterday?"
    - "Find tests that started failing after the last deployment"
    - "Show me the test execution history for the past month"
```

### Query Response Examples

#### Formatted Response Structure
```json
{
  "query": "Show me all failed tests from yesterday",
  "interpretation": {
    "intent": "test_status_query",
    "timeframe": "yesterday",
    "status_filter": "failed",
    "scope": "all_accessible_projects"
  },
  "response": {
    "summary": "Found 8 failed tests from yesterday across 3 projects",
    "data": [
      {
        "test_name": "User Login Flow",
        "project": "E-commerce Platform",
        "failure_reason": "Element not found: #login-button",
        "execution_time": "2025-01-18T14:30:00Z",
        "duration": "45.2s"
      }
    ],
    "insights": [
      "Login-related tests account for 50% of failures",
      "Mobile tests have 3x higher failure rate than web tests"
    ],
    "suggested_actions": [
      "Review login page UI changes",
      "Check mobile test environment configuration"
    ]
  }
}
```

## Test Creation Queries

### Natural Language Test Generation

#### User Story to Test Conversion
```yaml
user_story_examples:
  e_commerce_scenarios:
    - query: "Create a test for a user adding items to their shopping cart"
      generated_test:
        name: "Add Items to Shopping Cart"
        steps:
          - "Navigate to product catalog"
          - "Select first product"
          - "Click 'Add to Cart' button"
          - "Verify cart counter increases"
          - "Open shopping cart"
          - "Verify product appears in cart"
    
    - query: "Test that users can checkout with a credit card and receive confirmation"
      generated_test:
        name: "Credit Card Checkout Flow"
        steps:
          - "Add product to cart"
          - "Navigate to checkout"
          - "Enter shipping information"
          - "Select credit card payment"
          - "Enter card details"
          - "Complete purchase"
          - "Verify confirmation page displays"
          - "Verify confirmation email sent"
  
  authentication_scenarios:
    - query: "Create a test that verifies password reset functionality"
      generated_test:
        name: "Password Reset Functionality"
        steps:
          - "Navigate to login page"
          - "Click 'Forgot Password' link"
          - "Enter email address"
          - "Click 'Send Reset Email'"
          - "Verify confirmation message"
          - "Check email for reset link"
          - "Click reset link in email"
          - "Enter new password"
          - "Confirm password change"
          - "Login with new password"
```

#### API Test Generation
```yaml
api_test_examples:
  rest_api_scenarios:
    - query: "Create a test that validates the user registration API"
      generated_test:
        name: "User Registration API Validation"
        type: "api_test"
        endpoints:
          - method: "POST"
            url: "/api/users/register"
            headers:
              Content-Type: "application/json"
            body:
              email: "test@example.com"
              password: "SecurePass123"
              firstName: "Test"
              lastName: "User"
        validations:
          - "Response status is 201"
          - "Response contains user ID"
          - "Response includes authentication token"
          - "Database contains new user record"
    
    - query: "Test the product search API with various search terms"
      generated_test:
        name: "Product Search API Comprehensive Test"
        type: "api_test"
        test_cases:
          - description: "Search with valid product name"
            request:
              method: "GET"
              url: "/api/products/search?q=laptop"
            expectations:
              status: 200
              response_structure: "array of products"
              minimum_results: 1
          
          - description: "Search with partial product name"
            request:
              method: "GET"
              url: "/api/products/search?q=lap"
            expectations:
              status: 200
              response_structure: "array of products"
          
          - description: "Search with non-existent product"
            request:
              method: "GET"
              url: "/api/products/search?q=nonexistentproduct123"
            expectations:
              status: 200
              response_structure: "empty array"
```

#### Mobile Test Generation
```yaml
mobile_test_examples:
  cross_platform_scenarios:
    - query: "Create a mobile test that verifies push notifications work on both iOS and Android"
      generated_test:
        name: "Cross-Platform Push Notification Test"
        platforms: ["iOS", "Android"]
        steps:
          - platform: "both"
            action: "Launch app"
          - platform: "both"
            action: "Enable push notifications if prompted"
          - platform: "both"
            action: "Login to user account"
          - platform: "both"
            action: "Navigate to notification settings"
          - platform: "both"
            action: "Enable all notification types"
          - platform: "both"
            action: "Trigger notification from admin panel"
          - platform: "iOS"
            action: "Verify notification appears in Notification Center"
          - platform: "Android"
            action: "Verify notification appears in notification panel"
          - platform: "both"
            action: "Tap notification to open app"
          - platform: "both"
            action: "Verify correct screen opens"
  
  device_specific_scenarios:
    - query: "Test tablet layout adaptation for the dashboard on iPad"
      generated_test:
        name: "iPad Dashboard Layout Test"
        device: "iPad Pro 12.9"
        orientation: ["portrait", "landscape"]
        steps:
          - "Launch app on iPad"
          - "Navigate to dashboard"
          - "Verify landscape layout uses two-column design"
          - "Rotate to portrait orientation"
          - "Verify layout adapts to single-column design"
          - "Check that all widgets are visible"
          - "Verify touch targets are appropriately sized"
          - "Test swipe gestures work correctly"
```

### Advanced Test Creation Scenarios

#### Complex Workflow Testing
```javascript
// Example: Natural language to complex test conversion
const complexTestExamples = {
  "Create a test for the complete e-commerce user journey from registration to post-purchase": {
    generatedSuite: {
      name: "Complete E-commerce User Journey",
      description: "End-to-end test covering full user lifecycle",
      tests: [
        {
          name: "User Registration",
          dependencies: [],
          steps: [
            "Navigate to registration page",
            "Fill registration form with valid data",
            "Verify email confirmation sent",
            "Activate account via email link"
          ]
        },
        {
          name: "Profile Setup",
          dependencies: ["User Registration"],
          steps: [
            "Login with new account",
            "Complete profile information",
            "Add profile picture",
            "Set preferences"
          ]
        },
        {
          name: "Product Purchase",
          dependencies: ["Profile Setup"],
          steps: [
            "Browse product catalog",
            "Add multiple items to cart",
            "Apply discount code",
            "Complete checkout process",
            "Verify order confirmation"
          ]
        },
        {
          name: "Post-Purchase Activities",
          dependencies: ["Product Purchase"],
          steps: [
            "Check order status",
            "Track shipment",
            "Leave product review",
            "Add items to wishlist"
          ]
        }
      ],
      estimatedDuration: "25-30 minutes",
      testData: {
        users: "3 test users with different profiles",
        products: "5 products across different categories",
        paymentMethods: "Credit card, PayPal, and store credit"
      }
    }
  }
};
```

## Test Analysis Queries

### Performance Analysis

#### Response Time Analysis
```yaml
performance_queries:
  response_time_analysis:
    - query: "Show me the slowest API endpoints from last week's tests"
      analysis:
        data_points: "Average, median, 95th percentile response times"
        trending: "Week-over-week performance changes"
        outlier_detection: "Identify unusually slow requests"
        recommendations: "Optimization suggestions"
    
    - query: "Which pages take longer than 3 seconds to load?"
      analysis:
        threshold_violation: "Pages exceeding 3-second limit"
        contributing_factors: "Large assets, slow database queries, third-party services"
        impact_assessment: "User experience and conversion impact"
        optimization_priorities: "Ranked list of improvement opportunities"
  
  resource_utilization:
    - query: "What's the memory usage pattern during our stress tests?"
      analysis:
        memory_trends: "Usage patterns over test duration"
        leak_detection: "Potential memory leak identification"
        gc_analysis: "Garbage collection impact"
        capacity_planning: "Resource requirement recommendations"
```

#### Load Testing Analysis
```yaml
load_testing_queries:
  capacity_analysis:
    - query: "At what point does our system start to fail under load?"
      analysis:
        breaking_point: "User load threshold where failures begin"
        failure_modes: "Types of failures observed"
        degradation_curve: "Performance degradation patterns"
        bottleneck_identification: "System components causing limitations"
    
    - query: "How does response time change as we increase concurrent users?"
      analysis:
        scalability_curve: "Response time vs. user load relationship"
        linear_scaling_range: "Range where system scales linearly"
        inflection_points: "Points where performance degrades significantly"
        optimization_recommendations: "Scaling strategies and improvements"
  
  comparative_analysis:
    - query: "Compare this week's load test results with last month's"
      analysis:
        performance_delta: "Quantified changes in key metrics"
        improvement_areas: "Areas showing performance gains"
        regression_areas: "Areas showing performance degradation"
        change_attribution: "Likely causes of performance changes"
```

### Quality Metrics Analysis

#### Test Coverage Analysis
```yaml
coverage_queries:
  code_coverage:
    - query: "What parts of our codebase have the lowest test coverage?"
      analysis:
        coverage_heatmap: "Visual representation of coverage by module"
        risk_assessment: "High-risk low-coverage areas"
        coverage_trends: "Coverage changes over time"
        targeted_testing: "Specific areas needing additional tests"
    
    - query: "Show me untested code paths in the payment module"
      analysis:
        uncovered_paths: "Specific code paths without test coverage"
        complexity_analysis: "Complexity of uncovered code"
        business_impact: "Risk assessment for uncovered functionality"
        test_recommendations: "Suggested tests to improve coverage"
  
  functional_coverage:
    - query: "Which user workflows are not covered by our tests?"
      analysis:
        workflow_mapping: "Complete user journey analysis"
        gap_identification: "Missing workflow coverage"
        priority_ranking: "Critical workflows needing coverage"
        test_suite_recommendations: "Tests needed to close gaps"
```

#### Bug Pattern Analysis
```yaml
bug_analysis_queries:
  failure_patterns:
    - query: "What are the most common reasons our tests fail?"
      analysis:
        failure_categorization: "Grouped by root cause"
        frequency_analysis: "Most common failure types"
        trend_analysis: "Changes in failure patterns over time"
        prevention_strategies: "Recommendations to reduce failures"
    
    - query: "Are there patterns in when our tests become flaky?"
      analysis:
        flakiness_triggers: "Environmental or code changes causing flakiness"
        temporal_patterns: "Time-based flakiness correlations"
        environmental_factors: "Infrastructure impacts on test stability"
        stabilization_recommendations: "Actions to reduce flakiness"
  
  regression_analysis:
    - query: "Which features regress most often after deployments?"
      analysis:
        regression_frequency: "Areas with highest regression rates"
        deployment_impact: "Features affected by recent deployments"
        risk_prediction: "Likelihood of future regressions"
        preventive_measures: "Testing strategies to catch regressions early"
```

## Data Extraction Queries

### Historical Data Analysis

#### Trend Analysis Queries
```yaml
trend_analysis:
  temporal_trends:
    - query: "Show me test execution trends over the past quarter"
      data_extraction:
        execution_volume: "Number of tests run per day/week/month"
        success_rates: "Pass/fail ratios over time"
        duration_trends: "Average execution time changes"
        resource_usage: "Computing resource consumption trends"
    
    - query: "How has our test suite quality changed since last year?"
      data_extraction:
        quality_metrics: "Flakiness rates, coverage improvements, bug detection"
        maintenance_burden: "Time spent on test maintenance"
        productivity_impact: "Developer velocity changes"
        roi_analysis: "Return on investment in testing"
  
  comparative_analysis:
    - query: "Compare test performance between staging and production environments"
      data_extraction:
        environment_differences: "Performance gaps between environments"
        configuration_impact: "How environment differences affect tests"
        reliability_comparison: "Stability differences across environments"
        optimization_opportunities: "Environment-specific improvements"
```

#### Team Performance Analysis
```yaml
team_analysis_queries:
  productivity_metrics:
    - query: "Which team members are most effective at writing stable tests?"
      data_extraction:
        test_stability_scores: "Flakiness rates by author"
        maintenance_requirements: "Time needed to maintain tests by author"
        coverage_contributions: "Coverage improvements by team member"
        best_practices_adherence: "Compliance with testing standards"
    
    - query: "How does test creation time vary across different types of tests?"
      data_extraction:
        creation_time_analysis: "Time to create different test types"
        complexity_correlation: "Relationship between test complexity and creation time"
        tool_effectiveness: "Impact of testing tools on productivity"
        skill_development_needs: "Training opportunities identified"
  
  collaboration_patterns:
    - query: "Show me how teams collaborate on test maintenance"
      data_extraction:
        cross_team_contributions: "Tests maintained by multiple teams"
        knowledge_sharing: "Documentation and review patterns"
        expertise_distribution: "Domain knowledge across team members"
        mentorship_opportunities: "Senior-junior collaboration patterns"
```

### Business Intelligence Queries

#### ROI and Value Analysis
```yaml
business_intelligence:
  roi_analysis:
    - query: "What's the cost savings from our automated testing compared to manual testing?"
      calculation:
        time_savings: "Hours saved through automation"
        cost_per_hour: "Developer/QA hourly rates"
        defect_prevention: "Bugs caught before production"
        customer_impact_prevention: "Estimated customer satisfaction preservation"
    
    - query: "How much faster do we deploy with our current test suite?"
      analysis:
        deployment_frequency: "Releases per month before/after test automation"
        deployment_confidence: "Rollback rates and deployment success"
        time_to_market: "Feature delivery speed improvements"
        competitive_advantage: "Market responsiveness improvements"
  
  quality_impact:
    - query: "Show me the relationship between test coverage and production bugs"
      correlation_analysis:
        coverage_vs_bugs: "Statistical correlation between coverage and defects"
        high_value_tests: "Tests that catch the most critical issues"
        coverage_roi: "Return on investment for different coverage levels"
        optimal_coverage: "Recommended coverage targets by module"
```

## Performance Analysis Queries

### System Performance Monitoring

#### Real-time Performance Queries
```yaml
realtime_performance:
  current_status:
    - query: "What's the current performance of our API endpoints?"
      monitoring:
        response_times: "Real-time latency measurements"
        throughput: "Requests per second handling capacity"
        error_rates: "Current failure percentages"
        resource_utilization: "CPU, memory, and disk usage"
    
    - query: "Are there any performance anomalies in the last hour?"
      detection:
        anomaly_identification: "Statistical outliers in performance metrics"
        baseline_comparison: "Deviation from normal performance patterns"
        impact_assessment: "Severity and scope of performance issues"
        automated_alerts: "Threshold violations and alert triggers"
  
  predictive_analysis:
    - query: "Based on current trends, when will we hit capacity limits?"
      forecasting:
        capacity_modeling: "Resource usage growth projections"
        bottleneck_prediction: "Components likely to fail first"
        scaling_recommendations: "Infrastructure improvements needed"
        timeline_estimates: "When action is required"
```

#### Performance Optimization Insights
```yaml
optimization_queries:
  bottleneck_identification:
    - query: "What are the slowest parts of our application during peak usage?"
      analysis:
        performance_profiling: "Detailed breakdown of request processing time"
        database_optimization: "Slow queries and indexing opportunities"
        frontend_optimization: "Client-side performance bottlenecks"
        infrastructure_tuning: "Server and network optimization opportunities"
    
    - query: "Which optimizations would have the biggest impact on user experience?"
      prioritization:
        user_impact_scoring: "Performance improvements ranked by user benefit"
        implementation_effort: "Development time required for optimizations"
        roi_calculation: "Cost-benefit analysis of different optimizations"
        quick_wins: "High-impact, low-effort improvements"
  
  comparative_performance:
    - query: "How does our performance compare to industry benchmarks?"
      benchmarking:
        industry_standards: "Performance metrics vs. industry averages"
        competitor_analysis: "Performance comparison with known competitors"
        best_practice_gaps: "Areas where industry best practices aren't followed"
        improvement_roadmap: "Steps to achieve industry-leading performance"
```

## Troubleshooting Queries

### Failure Investigation

#### Root Cause Analysis
```yaml
failure_investigation:
  immediate_troubleshooting:
    - query: "Why did the checkout test fail in the last run?"
      analysis:
        failure_timeline: "Sequence of events leading to failure"
        error_messages: "Complete error logs and stack traces"
        environmental_factors: "System state and configuration at failure time"
        reproducibility: "Steps to reproduce the failure consistently"
    
    - query: "What changed between the last successful run and the current failure?"
      change_analysis:
        code_changes: "Recent commits that might impact the test"
        environment_changes: "Infrastructure or configuration modifications"
        data_changes: "Test data or database state modifications"
        dependency_updates: "Third-party service or library changes"
  
  pattern_recognition:
    - query: "Are there patterns in when the login tests fail?"
      pattern_analysis:
        temporal_patterns: "Time-based failure correlations"
        environmental_correlations: "Failure rates by browser, device, or environment"
        load_correlations: "Relationship between system load and failures"
        configuration_dependencies: "Settings that influence failure rates"
```

#### System Health Diagnostics
```yaml
health_diagnostics:
  comprehensive_health_check:
    - query: "Give me a complete health assessment of our testing infrastructure"
      assessment:
        resource_utilization: "CPU, memory, disk, and network usage"
        service_availability: "Status of all testing services and dependencies"
        performance_baselines: "Current metrics vs. historical baselines"
        capacity_analysis: "Current usage vs. maximum capacity"
    
    - query: "What infrastructure issues might be affecting test reliability?"
      investigation:
        infrastructure_monitoring: "Server health and performance metrics"
        network_analysis: "Connectivity and latency issues"
        database_health: "Database performance and connection pooling"
        external_dependencies: "Third-party service availability and performance"
  
  predictive_maintenance:
    - query: "What potential issues should we watch out for next week?"
      prediction:
        capacity_forecasting: "Resource usage projections"
        failure_prediction: "Components at risk of failure"
        maintenance_scheduling: "Recommended maintenance windows"
        risk_mitigation: "Preventive measures to avoid issues"
```

### Environmental Troubleshooting

#### Cross-Environment Analysis
```yaml
environment_troubleshooting:
  environment_comparison:
    - query: "Why do tests pass in staging but fail in production?"
      analysis:
        configuration_differences: "Environment-specific settings comparison"
        data_differences: "Test data availability and quality differences"
        performance_differences: "Resource and performance variations"
        security_differences: "Security policies affecting test execution"
    
    - query: "Which environment configurations cause the most test instability?"
      stability_analysis:
        environment_reliability: "Failure rates by environment"
        configuration_impact: "Settings that correlate with failures"
        resource_constraints: "Environment limitations affecting tests"
        optimization_recommendations: "Environment improvements for stability"
  
  cross_browser_troubleshooting:
    - query: "Why does this test work in Chrome but fail in Safari?"
      browser_analysis:
        browser_compatibility: "Feature support differences"
        rendering_differences: "Layout and styling variations"
        javascript_differences: "API availability and behavior differences"
        timing_differences: "Performance and timing variations"
```

## Advanced Query Patterns

### Complex Multi-Dimensional Queries

#### Multi-Factor Analysis
```yaml
complex_analysis:
  multi_dimensional_queries:
    - query: "Show me test failures broken down by browser, environment, and time of day for the past month"
      analysis:
        dimensional_breakdown: "3D analysis of failure patterns"
        correlation_analysis: "Relationships between different factors"
        statistical_significance: "Confidence levels for observed patterns"
        actionable_insights: "Specific recommendations based on patterns"
    
    - query: "Which combination of test conditions leads to the highest success rate?"
      optimization:
        condition_combinations: "All possible factor combinations"
        success_rate_analysis: "Performance metrics for each combination"
        optimal_configuration: "Best-performing test conditions"
        trade_off_analysis: "Cost vs. benefit of different configurations"
  
  predictive_modeling:
    - query: "Based on current trends, what will our test coverage look like in 6 months?"
      forecasting:
        trend_extrapolation: "Current growth patterns extended"
        scenario_modeling: "Different development pace scenarios"
        resource_requirements: "Testing infrastructure needs"
        risk_assessment: "Potential challenges and mitigation strategies"
```

#### Conditional and Comparative Queries
```yaml
conditional_queries:
  if_then_analysis:
    - query: "If we increase our test coverage by 20%, how much would it reduce production bugs?"
      modeling:
        coverage_impact_model: "Statistical relationship between coverage and defects"
        scenario_simulation: "Projected outcomes of coverage increases"
        cost_benefit_analysis: "Investment required vs. expected benefits"
        implementation_strategy: "Roadmap to achieve coverage goals"
    
    - query: "What would happen to our deployment frequency if we added these performance tests?"
      impact_analysis:
        deployment_pipeline_modeling: "Effect on CI/CD execution time"
        confidence_impact: "Increased deployment confidence benefits"
        risk_reduction: "Production issues prevented"
        team_productivity: "Overall development velocity impact"
  
  comparative_scenarios:
    - query: "Compare the effectiveness of our mobile tests vs. web tests in catching bugs"
      effectiveness_comparison:
        bug_detection_rates: "Defects found per test by platform"
        severity_analysis: "Critical vs. minor bugs found"
        maintenance_overhead: "Effort required to maintain tests"
        roi_comparison: "Return on investment for each platform"
```

### AI-Powered Insights

#### Machine Learning-Enhanced Queries
```javascript
// Example: AI-enhanced query processing
const aiEnhancedQueries = {
  "Find tests that are likely to become flaky": {
    aiProcessing: {
      modelType: "predictive_classification",
      features: [
        "historical_stability",
        "code_complexity",
        "environmental_dependencies",
        "execution_patterns"
      ],
      prediction: {
        flakiness_probability: "0.0 to 1.0 score",
        confidence_interval: "statistical confidence bounds",
        contributing_factors: "ranked list of risk factors",
        prevention_recommendations: "actions to prevent flakiness"
      }
    }
  },
  
  "What are the hidden patterns in our test failures?": {
    aiProcessing: {
      modelType: "unsupervised_clustering",
      techniques: [
        "pattern_mining",
        "anomaly_detection",
        "correlation_analysis",
        "time_series_analysis"
      ],
      insights: {
        discovered_patterns: "previously unknown failure correlations",
        anomalies: "unusual failure occurrences",
        root_causes: "inferred underlying causes",
        actionable_recommendations: "specific improvement actions"
      }
    }
  }
};
```

## Domain-Specific Examples

### E-commerce Testing Queries

#### Shopping Cart and Checkout
```yaml
ecommerce_queries:
  shopping_cart:
    - query: "Test the shopping cart with different product combinations and discount codes"
      test_generation:
        scenarios:
          - "Single product with percentage discount"
          - "Multiple products with fixed amount discount"
          - "Mixed digital and physical products"
          - "Products with quantity limits"
          - "Invalid or expired discount codes"
        validations:
          - "Cart total calculations"
          - "Discount applications"
          - "Tax calculations"
          - "Shipping cost calculations"
    
    - query: "Verify abandoned cart recovery emails work correctly"
      test_workflow:
        steps:
          - "Add products to cart"
          - "Start checkout process"
          - "Abandon cart before completion"
          - "Wait for abandonment trigger (30 minutes)"
          - "Verify recovery email sent"
          - "Test email links functionality"
          - "Complete purchase from email"
  
  payment_processing:
    - query: "Test all payment methods with edge cases"
      comprehensive_testing:
        payment_methods:
          - "Credit cards (Visa, MasterCard, Amex)"
          - "Digital wallets (PayPal, Apple Pay, Google Pay)"
          - "Buy now, pay later services"
          - "Store credit and gift cards"
        edge_cases:
          - "Declined transactions"
          - "Partial payments"
          - "Refunds and chargebacks"
          - "Currency conversions"
```

#### Inventory Management
```yaml
inventory_testing:
  stock_management:
    - query: "Test inventory updates when products are purchased simultaneously"
      concurrency_testing:
        scenario: "Multiple users purchasing last item in stock"
        validations:
          - "Only one purchase succeeds"
          - "Other purchases receive out-of-stock message"
          - "Inventory count remains accurate"
          - "No overselling occurs"
    
    - query: "Verify back-in-stock notifications work properly"
      notification_testing:
        workflow:
          - "Customer requests notification for out-of-stock item"
          - "Inventory is replenished"
          - "Notification is triggered"
          - "Customer receives email/SMS"
          - "Notification link works correctly"
```

### Financial Services Testing

#### Banking and Finance Queries
```yaml
financial_services:
  transaction_processing:
    - query: "Test money transfer between accounts with various amounts and currencies"
      transaction_testing:
        scenarios:
          - "Domestic transfers"
          - "International transfers"
          - "Same-currency transfers"
          - "Cross-currency transfers"
          - "Micro-transactions"
          - "Large-amount transfers"
        validations:
          - "Account balance updates"
          - "Transaction history records"
          - "Audit trail creation"
          - "Compliance checks"
    
    - query: "Verify fraud detection systems catch suspicious activities"
      fraud_testing:
        suspicious_patterns:
          - "Multiple large withdrawals"
          - "Unusual geographical activity"
          - "Rapid successive transactions"
          - "New device login patterns"
        expected_responses:
          - "Transaction blocking"
          - "User notification"
          - "Manual review triggering"
          - "Additional verification requirements"
  
  compliance_testing:
    - query: "Test KYC verification process for different user types"
      kyc_testing:
        user_types:
          - "Individual customers"
          - "Business accounts"
          - "High-net-worth individuals"
          - "International customers"
        verification_steps:
          - "Identity document upload"
          - "Address verification"
          - "Source of funds verification"
          - "Ongoing monitoring"
```

### Healthcare Application Testing

#### Patient Management Queries
```yaml
healthcare_testing:
  patient_data:
    - query: "Test patient record access with different permission levels"
      access_control_testing:
        user_roles:
          - "Attending physician"
          - "Nurse"
          - "Administrative staff"
          - "Patient (self-access)"
        data_sensitivity_levels:
          - "General medical information"
          - "Mental health records"
          - "Sensitive diagnoses"
          - "Billing information"
        access_patterns:
          - "Read access validation"
          - "Write access restrictions"
          - "Audit log creation"
          - "Emergency access procedures"
    
    - query: "Verify HIPAA compliance in all patient data handling"
      compliance_testing:
        hipaa_requirements:
          - "Data encryption at rest and in transit"
          - "Access logging and monitoring"
          - "Data retention policies"
          - "Breach notification procedures"
        test_scenarios:
          - "Unauthorized access attempts"
          - "Data export and sharing"
          - "System backup and recovery"
          - "Third-party integrations"
  
  appointment_scheduling:
    - query: "Test appointment scheduling with various constraints and conflicts"
      scheduling_testing:
        constraints:
          - "Provider availability"
          - "Room/equipment availability"
          - "Patient preferences"
          - "Insurance requirements"
        conflict_scenarios:
          - "Double booking attempts"
          - "Emergency rescheduling"
          - "Cancellation workflows"
          - "Waitlist management"
```

## Multi-Language Support

### Internationalization Query Examples

#### Non-English Query Support
```yaml
multi_language_support:
  spanish_examples:
    - query: "Muéstrame todas las pruebas que fallaron ayer"
      translation: "Show me all tests that failed yesterday"
      response_language: "Spanish"
      cultural_adaptations:
        - "Date format: DD/MM/YYYY"
        - "Time format: 24-hour"
        - "Number format: 1.234,56"
    
    - query: "Crear una prueba para el proceso de registro de usuario"
      translation: "Create a test for the user registration process"
      generated_test_language: "Spanish comments and descriptions"
      localization_considerations:
        - "Form validation messages in Spanish"
        - "Error messages in Spanish"
        - "Success confirmations in Spanish"
  
  french_examples:
    - query: "Quels sont les tests les plus lents de la semaine dernière?"
      translation: "What are the slowest tests from last week?"
      response_adaptations:
        - "Metric units (milliseconds, seconds)"
        - "French date/time formatting"
        - "Localized performance terminology"
    
    - query: "Analyser les performances de l'API de paiement"
      translation: "Analyze the payment API performance"
      analysis_localization:
        - "French technical terminology"
        - "European compliance considerations"
        - "Currency formatting (€)"
  
  chinese_examples:
    - query: "显示所有移动端测试的执行结果"
      translation: "Show execution results for all mobile tests"
      cultural_considerations:
        - "Traditional vs. Simplified Chinese"
        - "Right-to-left vs. left-to-right layouts"
        - "Chinese mobile app conventions"
    
    - query: "创建一个测试用户登录流程的测试用例"
      translation: "Create a test case for user login flow"
      localization_specifics:
        - "Chinese input methods testing"
        - "Character encoding validation"
        - "Local social login providers (WeChat, QQ)"
```

### Cultural and Regional Adaptations

#### Region-Specific Testing Considerations
```yaml
regional_adaptations:
  european_union:
    compliance_queries:
      - query: "Test GDPR consent management across all user flows"
        gdpr_specific_testing:
          consent_scenarios:
            - "Initial consent collection"
            - "Consent withdrawal"
            - "Data portability requests"
            - "Right to be forgotten"
          validation_points:
            - "Clear consent language"
            - "Granular consent options"
            - "Consent audit trails"
            - "Cross-border data handling"
    
    accessibility_queries:
      - query: "Verify EN 301 549 accessibility compliance"
        accessibility_testing:
          standards_compliance:
            - "Keyboard navigation"
            - "Screen reader compatibility"
            - "Color contrast ratios"
            - "Focus management"
  
  asia_pacific:
    mobile_first_queries:
      - query: "Test mobile payment integration with local providers"
        regional_payment_testing:
          payment_providers:
            - "Alipay (China)"
            - "GrabPay (Southeast Asia)"
            - "Paytm (India)"
            - "LINE Pay (Japan/Korea)"
          testing_considerations:
            - "QR code payments"
            - "Mobile wallet integration"
            - "Currency conversions"
            - "Local banking regulations"
  
  north_america:
    accessibility_queries:
      - query: "Test Section 508 compliance for government accessibility"
        section_508_testing:
          compliance_areas:
            - "Federal accessibility standards"
            - "Assistive technology compatibility"
            - "Alternative format support"
            - "Accessible documentation"
```

## Query Optimization Tips

### Best Practices for Natural Language Queries

#### Query Clarity and Specificity
```yaml
optimization_guidelines:
  clarity_best_practices:
    specific_over_general:
      good_examples:
        - "Show me API tests that failed in the last 24 hours"
        - "Find performance tests with response times over 2 seconds"
        - "Create a test for user password reset via email"
      poor_examples:
        - "Show me some tests"
        - "Find slow stuff"
        - "Make a test for login"
    
    include_context:
      good_examples:
        - "In the e-commerce project, show checkout tests that failed after the last deployment"
        - "For mobile iOS tests, find those with memory usage over 100MB"
        - "Create an API test for the user registration endpoint with validation"
      context_elements:
        - "Project or module name"
        - "Platform or environment"
        - "Time frame or version"
        - "Specific criteria or thresholds"
  
  effective_query_structure:
    action_verb_patterns:
      - "Show/Display/List: For viewing information"
      - "Find/Search/Locate: For discovering specific items"
      - "Create/Generate/Build: For creating new tests"
      - "Analyze/Compare/Evaluate: For analysis tasks"
      - "Predict/Forecast/Estimate: For predictive insights"
    
    filter_patterns:
      - "Time-based: last week, yesterday, since deployment"
      - "Status-based: failed, passing, flaky, disabled"
      - "Category-based: API tests, mobile tests, integration tests"
      - "Performance-based: slow, fast, resource-intensive"
      - "Quality-based: high coverage, critical, edge cases"
```

#### Advanced Query Techniques

#### Compound and Conditional Queries
```yaml
advanced_techniques:
  compound_queries:
    combining_conditions:
      - query: "Show me tests that are both flaky and critical, or have failed more than 3 times this week"
        logic: "(flaky AND critical) OR (failures > 3 AND timeframe = this_week)"
        processing: "Boolean logic with multiple conditions"
      
      - query: "Find API tests in the payment module that either take longer than 5 seconds or have a success rate below 95%"
        logic: "(type = API AND module = payment) AND (duration > 5s OR success_rate < 95%)"
        processing: "Nested conditions with performance thresholds"
  
  contextual_queries:
    follow_up_patterns:
      - initial_query: "Show me all failed tests from yesterday"
        follow_up: "Why did the login test fail?"
        context_retention: "AI remembers previous query results"
        enhanced_response: "Detailed analysis of specific test from previous results"
      
      - initial_query: "Create a test for user registration"
        follow_up: "Add validation for duplicate email addresses"
        context_application: "Modifies the previously created test"
        incremental_building: "Builds upon previous test creation"
  
  parameterized_queries:
    dynamic_parameters:
      - template: "Show me {test_type} tests that {condition} in the {time_frame}"
        examples:
          - "Show me API tests that failed in the last 24 hours"
          - "Show me mobile tests that passed in the current sprint"
          - "Show me integration tests that are flaky in the past week"
      
      - template: "Create a test for {functionality} with {validation_type} validation"
        examples:
          - "Create a test for user login with security validation"
          - "Create a test for file upload with size validation"
          - "Create a test for payment processing with fraud validation"
```

#### Performance Optimization for Complex Queries
```javascript
// Query optimization techniques
const queryOptimization = {
  cachingStrategies: {
    "repetitive_queries": {
      example: "Show me test results from today",
      optimization: "Cache results and update incrementally",
      performance_gain: "80% faster response time"
    },
    
    "expensive_aggregations": {
      example: "Calculate test coverage across all projects",
      optimization: "Pre-compute aggregations, refresh periodically",
      performance_gain: "95% faster for large datasets"
    }
  },
  
  querySimplification: {
    "complex_filters": {
      original: "Show me tests that failed in projects A, B, or C, between dates X and Y, with duration over Z seconds",
      optimized: "Break into smaller, focused queries with progressive refinement",
      benefit: "Better user experience with iterative results"
    },
    
    "natural_language_parsing": {
      technique: "Intent recognition with entity extraction",
      example: "Parse 'slow API tests from last week' into structured query",
      components: {
        intent: "search/filter",
        entities: ["API tests", "performance criteria", "time range"],
        parameters: ["test_type=API", "performance=slow", "timeframe=last_week"]
      }
    }
  }
};
```

### Common Query Patterns and Templates

#### Template Library for Common Scenarios
```yaml
query_templates:
  test_creation_templates:
    - pattern: "Create a {test_type} test for {functionality}"
      variables:
        test_type: ["unit", "integration", "end-to-end", "API", "mobile", "performance"]
        functionality: ["user login", "data validation", "file upload", "payment processing"]
    
    - pattern: "Generate tests for {user_story} with {coverage_type} coverage"
      variables:
        user_story: "As a [role], I want [goal] so that [benefit]"
        coverage_type: ["happy path", "edge cases", "error handling", "comprehensive"]
  
  analysis_templates:
    - pattern: "Analyze {metric} for {scope} over {timeframe}"
      variables:
        metric: ["performance", "success rate", "coverage", "flakiness"]
        scope: ["all tests", "project X", "team Y", "critical tests"]
        timeframe: ["last week", "current sprint", "since deployment", "this month"]
    
    - pattern: "Compare {aspect} between {baseline} and {comparison}"
      variables:
        aspect: ["performance", "stability", "coverage", "execution time"]
        baseline: ["last release", "previous month", "staging environment"]
        comparison: ["current release", "this month", "production environment"]
  
  troubleshooting_templates:
    - pattern: "Why did {test_identifier} fail {when}?"
      variables:
        test_identifier: ["test name", "test suite", "all login tests"]
        when: ["in the last run", "after deployment", "yesterday", "repeatedly"]
    
    - pattern: "What changed that might cause {symptom}?"
      variables:
        symptom: ["test failures", "performance degradation", "flaky behavior"]
```

This comprehensive guide provides extensive examples of natural language queries for Semantest's AI-powered testing platform, covering everything from basic information retrieval to complex multi-dimensional analysis and domain-specific testing scenarios.

---

**Last Updated**: January 19, 2025  
**Version**: 1.0.0  
**Maintainer**: Semantest AI Language Processing Team  
**Support**: ai-language@semantest.com