# Semantest Mobile App Migration Guide

## Overview

This guide covers migrating your Semantest web testing capabilities to mobile applications, including React Native, Flutter, and native iOS/Android apps. Transform your existing web tests into comprehensive mobile testing suites.

## Table of Contents

1. [Mobile Testing Fundamentals](#mobile-testing-fundamentals)
2. [Platform-Specific Migration](#platform-specific-migration)
3. [Test Adaptation Strategies](#test-adaptation-strategies)
4. [Mobile-Specific Features](#mobile-specific-features)
5. [Performance Considerations](#performance-considerations)
6. [Device Testing](#device-testing)
7. [Automation Setup](#automation-setup)
8. [Migration Checklist](#migration-checklist)

## Mobile Testing Fundamentals

### Understanding Mobile vs Web Testing

**Key Differences:**
- **Touch Interactions**: Taps, swipes, pinches instead of clicks
- **Screen Sizes**: Multiple resolutions and orientations
- **Performance**: Limited resources and battery constraints
- **Network**: Variable connectivity and offline scenarios
- **Platform APIs**: Native functionality access
- **App Lifecycle**: Background/foreground state management

### Mobile Testing Strategy

```javascript
// Mobile-first testing approach
const mobileTestStrategy = {
  platforms: ['iOS', 'Android', 'React Native', 'Flutter'],
  devices: ['phone', 'tablet', 'foldable'],
  orientations: ['portrait', 'landscape'],
  interactions: ['touch', 'voice', 'gestures'],
  scenarios: ['online', 'offline', 'poor-connection']
};
```

## Platform-Specific Migration

### React Native Migration

#### 1. Install Mobile Testing Dependencies
```bash
# Install React Native testing dependencies
npm install --save-dev @testing-library/react-native
npm install --save-dev react-native-testing-library
npm install --save-dev detox
npm install --save-dev appium

# Semantest mobile support
npm install @semantest/mobile-testing
```

#### 2. Adapt Web Tests to React Native
```javascript
// Web test (before migration)
import { render, fireEvent, screen } from '@testing-library/react';

test('should submit login form', () => {
  render(<LoginForm />);
  
  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: 'test@example.com' }
  });
  
  fireEvent.click(screen.getByRole('button', { name: 'Login' }));
  
  expect(screen.getByText('Welcome!')).toBeInTheDocument();
});

// React Native test (after migration)
import { render, fireEvent } from '@testing-library/react-native';
import { LoginScreen } from '../src/screens/LoginScreen';

test('should submit login form on mobile', async () => {
  const { getByTestId, getByText } = render(<LoginScreen />);
  
  // Use testID for mobile element selection
  fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
  fireEvent.changeText(getByTestId('password-input'), 'password123');
  
  // Mobile uses onPress instead of onClick
  fireEvent.press(getByTestId('login-button'));
  
  // Wait for navigation or state change
  await waitFor(() => {
    expect(getByText('Welcome!')).toBeTruthy();
  });
});
```

#### 3. Mobile-Specific Test Patterns
```javascript
// Testing mobile gestures
import { fireGestureHandler, Directions } from 'react-native-reanimated/lib/typescript/reanimated2/jestUtils';

test('should handle swipe gestures', () => {
  const { getByTestId } = render(<SwipeableCard />);
  
  const card = getByTestId('swipeable-card');
  
  // Test swipe left
  fireGestureHandler(card, [
    { translationX: -100, state: State.ACTIVE },
    { translationX: -200, state: State.END }
  ]);
  
  expect(getByTestId('delete-confirmation')).toBeTruthy();
});

// Testing device orientation
test('should adapt to orientation changes', () => {
  const { rerender } = render(<ResponsiveComponent />);
  
  // Mock orientation change
  Dimensions.set({
    window: { width: 812, height: 375 }, // Landscape
    screen: { width: 812, height: 375 }
  });
  
  rerender(<ResponsiveComponent />);
  
  expect(getByTestId('landscape-layout')).toBeTruthy();
});
```

### Flutter Migration

#### 1. Setup Flutter Testing
```yaml
# pubspec.yaml
dev_dependencies:
  flutter_test:
    sdk: flutter
  integration_test:
    sdk: flutter
  semantest_flutter: ^1.0.0
```

```dart
// Flutter test adaptation
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:myapp/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  
  group('Login Flow Tests', () {
    testWidgets('should login with valid credentials', (tester) async {
      app.main();
      await tester.pumpAndSettle();
      
      // Find widgets by key or text
      await tester.enterText(find.byKey(Key('email-field')), 'test@example.com');
      await tester.enterText(find.byKey(Key('password-field')), 'password123');
      
      // Tap login button
      await tester.tap(find.byKey(Key('login-button')));
      await tester.pumpAndSettle();
      
      // Verify navigation
      expect(find.text('Welcome!'), findsOneWidget);
    });
    
    testWidgets('should handle network errors', (tester) async {
      // Mock network failure
      await tester.binding.defaultBinaryMessenger.setMockMethodCallHandler(
        MethodChannel('flutter/connectivity'),
        (call) async => ConnectivityResult.none
      );
      
      app.main();
      await tester.pumpAndSettle();
      
      await tester.enterText(find.byKey(Key('email-field')), 'test@example.com');
      await tester.tap(find.byKey(Key('login-button')));
      await tester.pumpAndSettle();
      
      expect(find.text('Network error'), findsOneWidget);
    });
  });
}
```

### Native iOS Migration (XCTest)

```swift
// iOS native test migration
import XCTest
import SemantestMobile

class LoginTests: XCTestCase {
    var app: XCUIApplication!
    
    override func setUp() {
        super.setUp()
        app = XCUIApplication()
        app.launch()
    }
    
    func testLoginFlow() {
        // Navigate to login screen
        app.buttons["Login"].tap()
        
        // Fill login form
        let emailField = app.textFields["Email"]
        emailField.tap()
        emailField.typeText("test@example.com")
        
        let passwordField = app.secureTextFields["Password"]
        passwordField.tap()
        passwordField.typeText("password123")
        
        // Submit form
        app.buttons["Submit"].tap()
        
        // Verify success
        XCTAssertTrue(app.staticTexts["Welcome!"].waitForExistence(timeout: 5))
    }
    
    func testOfflineHandling() {
        // Simulate offline condition
        if #available(iOS 13.0, *) {
            let networkConditions = XCUIDevice.shared.networkConditions
            networkConditions.dataState = .disconnected
        }
        
        app.buttons["Login"].tap()
        
        // Should show offline message
        XCTAssertTrue(app.alerts["No Internet Connection"].exists)
    }
}
```

### Native Android Migration (Espresso)

```kotlin
// Android native test migration
import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.action.ViewActions.*
import androidx.test.espresso.assertion.ViewAssertions.matches
import androidx.test.espresso.matcher.ViewMatchers.*
import androidx.test.ext.junit.rules.ActivityScenarioRule
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class LoginActivityTest {
    
    @get:Rule
    val activityRule = ActivityScenarioRule(LoginActivity::class.java)
    
    @Test
    fun testLoginFlow() {
        // Enter email
        onView(withId(R.id.email_input))
            .perform(typeText("test@example.com"), closeSoftKeyboard())
        
        // Enter password
        onView(withId(R.id.password_input))
            .perform(typeText("password123"), closeSoftKeyboard())
        
        // Click login
        onView(withId(R.id.login_button))
            .perform(click())
        
        // Verify welcome message
        onView(withText("Welcome!"))
            .check(matches(isDisplayed()))
    }
    
    @Test
    fun testSwipeGesture() {
        onView(withId(R.id.swipeable_card))
            .perform(swipeLeft())
        
        onView(withText("Card swiped"))
            .check(matches(isDisplayed()))
    }
}
```

## Test Adaptation Strategies

### 1. Selector Migration

```javascript
// Web selectors → Mobile selectors
const selectorMigration = {
  web: {
    getElementById: '#login-button',
    getByClassName: '.form-input',
    getByText: 'Submit',
    getByRole: 'button'
  },
  
  mobile: {
    // React Native
    getByTestId: 'login-button',
    getByDisplayValue: 'test@example.com',
    getByText: 'Submit',
    
    // Flutter
    findByKey: 'Key("login-button")',
    findByText: 'find.text("Submit")',
    
    // Native iOS
    accessibility: 'app.buttons["Submit"]',
    
    // Native Android
    resourceId: 'onView(withId(R.id.login_button))'
  }
};
```

### 2. Interaction Migration

```javascript
// Web interactions → Mobile interactions
const interactionMigration = {
  click: {
    web: 'fireEvent.click(element)',
    reactNative: 'fireEvent.press(element)',
    flutter: 'await tester.tap(find.byKey(key))',
    ios: 'app.buttons["Submit"].tap()',
    android: 'onView(withId(id)).perform(click())'
  },
  
  input: {
    web: 'fireEvent.change(input, {target: {value: "text"}})',
    reactNative: 'fireEvent.changeText(input, "text")',
    flutter: 'await tester.enterText(find.byKey(key), "text")',
    ios: 'textField.typeText("text")',
    android: 'onView(withId(id)).perform(typeText("text"))'
  },
  
  swipe: {
    web: 'Not applicable',
    reactNative: 'fireEvent(element, "swipeLeft")',
    flutter: 'await tester.drag(find.byKey(key), Offset(-200, 0))',
    ios: 'app.swipeLeft()',
    android: 'onView(withId(id)).perform(swipeLeft())'
  }
};
```

### 3. Assertion Migration

```javascript
// Web assertions → Mobile assertions
const assertionMigration = {
  elementExists: {
    web: 'expect(element).toBeInTheDocument()',
    reactNative: 'expect(getByTestId("id")).toBeTruthy()',
    flutter: 'expect(find.byKey(key), findsOneWidget)',
    ios: 'XCTAssertTrue(element.exists)',
    android: 'onView(withId(id)).check(matches(isDisplayed()))'
  },
  
  textContent: {
    web: 'expect(element).toHaveTextContent("text")',
    reactNative: 'expect(getByText("text")).toBeTruthy()',
    flutter: 'expect(find.text("text"), findsOneWidget)',
    ios: 'XCTAssertTrue(app.staticTexts["text"].exists)',
    android: 'onView(withText("text")).check(matches(isDisplayed()))'
  }
};
```

## Mobile-Specific Features

### 1. Device Features Testing

```javascript
// Test device-specific features
describe('Device Features', () => {
  test('should access camera', async () => {
    // Mock camera permissions
    await mockPermissions('camera', 'granted');
    
    const { getByTestId } = render(<CameraComponent />);
    
    fireEvent.press(getByTestId('take-photo-button'));
    
    await waitFor(() => {
      expect(getByTestId('photo-preview')).toBeTruthy();
    });
  });
  
  test('should handle GPS location', async () => {
    // Mock location services
    const mockLocation = {
      latitude: 37.7749,
      longitude: -122.4194
    };
    
    jest.spyOn(navigator.geolocation, 'getCurrentPosition')
      .mockImplementation((success) => success({
        coords: mockLocation
      }));
    
    const { getByTestId } = render(<LocationComponent />);
    
    fireEvent.press(getByTestId('get-location-button'));
    
    await waitFor(() => {
      expect(getByTestId('location-display')).toHaveTextContent('37.7749');
    });
  });
  
  test('should work offline', async () => {
    // Mock offline state
    const mockNetworkState = { isConnected: false };
    jest.doMock('@react-native-community/netinfo', () => mockNetworkState);
    
    const { getByTestId, getByText } = render(<OfflineCapableComponent />);
    
    fireEvent.press(getByTestId('sync-button'));
    
    expect(getByText('Offline mode')).toBeTruthy();
  });
});
```

### 2. Performance Testing

```javascript
// Mobile performance testing
describe('Performance Tests', () => {
  test('should render within performance budget', async () => {
    const startTime = performance.now();
    
    const { getByTestId } = render(<ComplexListComponent />);
    
    await waitFor(() => {
      expect(getByTestId('list-container')).toBeTruthy();
    });
    
    const renderTime = performance.now() - startTime;
    expect(renderTime).toBeLessThan(100); // 100ms budget
  });
  
  test('should handle memory efficiently', () => {
    const initialMemory = performance.memory?.usedJSHeapSize || 0;
    
    const { unmount } = render(<MemoryIntensiveComponent />);
    
    unmount();
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    const finalMemory = performance.memory?.usedJSHeapSize || 0;
    const memoryIncrease = finalMemory - initialMemory;
    
    expect(memoryIncrease).toBeLessThan(10000000); // 10MB budget
  });
});
```

## Device Testing

### 1. Multi-Device Testing Setup

```javascript
// Configure device testing matrix
const deviceMatrix = {
  phones: [
    { name: 'iPhone 14', platform: 'iOS', resolution: '390x844' },
    { name: 'Samsung Galaxy S23', platform: 'Android', resolution: '360x780' },
    { name: 'Google Pixel 7', platform: 'Android', resolution: '393x851' }
  ],
  
  tablets: [
    { name: 'iPad Pro', platform: 'iOS', resolution: '1024x1366' },
    { name: 'Samsung Tab S8', platform: 'Android', resolution: '800x1280' }
  ],
  
  orientations: ['portrait', 'landscape'],
  
  networkConditions: ['4G', '3G', 'WiFi', 'offline']
};

// Run tests across device matrix
deviceMatrix.phones.forEach(device => {
  describe(`Tests on ${device.name}`, () => {
    beforeEach(() => {
      setupDevice(device);
    });
    
    test('should work on device', () => {
      // Device-specific test logic
    });
  });
});
```

### 2. Cloud Device Testing

```javascript
// Integrate with cloud testing services
const cloudTesting = {
  browserstack: {
    username: process.env.BROWSERSTACK_USERNAME,
    accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
    devices: [
      'iPhone 14-16',
      'Samsung Galaxy S23-13.0',
      'Google Pixel 7-13.0'
    ]
  },
  
  saucelabs: {
    username: process.env.SAUCE_USERNAME,
    accessKey: process.env.SAUCE_ACCESS_KEY,
    devices: ['iPhone 14 Simulator', 'Android GoogleAPI Emulator']
  }
};

// Configure cloud testing
async function runCloudTests() {
  const capabilities = {
    'browserstack.user': cloudTesting.browserstack.username,
    'browserstack.key': cloudTesting.browserstack.accessKey,
    'device': 'iPhone 14',
    'os_version': '16',
    'real_mobile': 'true'
  };
  
  const driver = await webdriver.remote({
    hostname: 'hub-cloud.browserstack.com',
    port: 80,
    capabilities
  });
  
  // Run tests on cloud device
  await runTestSuite(driver);
}
```

## Automation Setup

### 1. CI/CD Integration

```yaml
# .github/workflows/mobile-tests.yml
name: Mobile Tests
on: [push, pull_request]

jobs:
  test-react-native:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install
        
      - name: Run unit tests
        run: npm test
        
      - name: Setup iOS Simulator
        run: |
          xcrun simctl create TestDevice com.apple.CoreSimulator.SimDeviceType.iPhone-14
          xcrun simctl boot TestDevice
          
      - name: Run iOS E2E tests
        run: npm run test:ios
        
      - name: Setup Android Emulator
        uses: reactivecircus/android-emulator-runner@v2
        with:
          api-level: 29
          script: npm run test:android

  test-flutter:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: subosito/flutter-action@v2
        
      - name: Run Flutter tests
        run: flutter test
        
      - name: Run integration tests
        run: flutter test integration_test/
```

### 2. Test Reporting

```javascript
// Mobile test reporting configuration
const mobileTestConfig = {
  reporters: [
    'default',
    ['@semantest/mobile-reporter', {
      outputDir: './mobile-test-results',
      includeDeviceInfo: true,
      generateScreenshots: true,
      videoRecording: true
    }],
    ['jest-html-reporter', {
      pageTitle: 'Mobile Test Results',
      includeFailureMsg: true,
      includeSuiteFailure: true
    }]
  ],
  
  setupFilesAfterEnv: ['<rootDir>/mobile-test-setup.js'],
  
  testMatch: [
    '**/__tests__/**/*.(test|spec).(js|ts)',
    '**/*.(test|spec).(js|ts)',
    '**/__mobile_tests__/**/*.(test|spec).(js|ts)'
  ]
};
```

## Migration Checklist

### Pre-Migration Assessment
- [ ] Audit existing web tests for mobile compatibility
- [ ] Identify platform-specific features to test
- [ ] Define device testing matrix
- [ ] Set performance budgets
- [ ] Plan test data management strategy

### Platform Setup
- [ ] Install mobile testing frameworks
- [ ] Configure device simulators/emulators
- [ ] Set up cloud testing accounts
- [ ] Configure CI/CD pipelines
- [ ] Establish test environments

### Test Migration
- [ ] Convert web selectors to mobile equivalents
- [ ] Adapt interaction patterns for touch
- [ ] Update assertions for mobile platforms
- [ ] Add mobile-specific test scenarios
- [ ] Implement performance testing

### Mobile-Specific Testing
- [ ] Test device features (camera, GPS, etc.)
- [ ] Validate offline functionality
- [ ] Test across different screen sizes
- [ ] Verify orientation changes
- [ ] Test network condition variations

### Quality Assurance
- [ ] Run tests on real devices
- [ ] Verify test stability and reliability
- [ ] Validate test execution speed
- [ ] Ensure proper error handling
- [ ] Document mobile testing patterns

### Documentation & Training
- [ ] Update team documentation
- [ ] Create mobile testing guidelines
- [ ] Train team on mobile testing tools
- [ ] Establish maintenance procedures
- [ ] Set up monitoring and alerts

### Post-Migration Validation
- [ ] Compare test coverage between web and mobile
- [ ] Validate test execution in CI/CD
- [ ] Monitor test reliability metrics
- [ ] Gather team feedback
- [ ] Plan ongoing improvements

## Best Practices

1. **Start Small**: Begin with critical user flows before expanding coverage
2. **Use Real Devices**: Test on real devices whenever possible
3. **Optimize for Speed**: Mobile tests should be fast and reliable
4. **Handle Flakiness**: Implement retry mechanisms and stable selectors
5. **Monitor Performance**: Track test execution time and device resource usage
6. **Maintain Consistency**: Use consistent patterns across platforms
7. **Document Thoroughly**: Keep migration decisions and patterns documented

## Conclusion

Migrating from web to mobile testing requires careful planning and platform-specific adaptations. By following this guide, you can successfully transform your web test suite into comprehensive mobile testing coverage that ensures quality across all platforms and devices.

---

**Last Updated**: January 19, 2025  
**Version**: 1.0.0  
**Maintainer**: Semantest Mobile Team  
**Support**: mobile-support@semantest.com