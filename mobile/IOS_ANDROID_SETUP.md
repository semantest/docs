# iOS & Android Setup Instructions

## Overview

Comprehensive setup instructions for installing and configuring the Semantest mobile application on iOS and Android devices. This guide covers platform-specific installation methods, configuration requirements, and enterprise deployment scenarios.

## Table of Contents

1. [iOS Setup Instructions](#ios-setup-instructions)
2. [Android Setup Instructions](#android-setup-instructions)
3. [Enterprise Deployment](#enterprise-deployment)
4. [Network Configuration](#network-configuration)
5. [Security Configuration](#security-configuration)
6. [Device Management](#device-management)
7. [Troubleshooting Setup Issues](#troubleshooting-setup-issues)
8. [Post-Installation Verification](#post-installation-verification)

## iOS Setup Instructions

### System Requirements

#### Device Compatibility
```yaml
ios_requirements:
  minimum_ios_version: "14.0"
  recommended_ios_version: "16.0+"
  
  supported_devices:
    iphone:
      - iPhone 8 and later (A11 Bionic chip or newer)
      - iPhone SE (2nd generation) and later
      - Minimum 3GB RAM recommended
    
    ipad:
      - iPad (6th generation) and later
      - iPad Pro (all models)
      - iPad Air (3rd generation) and later
      - iPad mini (5th generation) and later
      - Minimum 3GB RAM recommended
  
  storage_requirements:
    minimum: "150 MB free space"
    recommended: "500 MB free space"
    additional: "200 MB for offline content"
```

#### Prerequisites Checklist
- [ ] iOS 14.0 or later installed
- [ ] Apple ID configured and signed in
- [ ] Sufficient storage space available
- [ ] Active internet connection (Wi-Fi or cellular)
- [ ] Valid Semantest Enterprise license
- [ ] Organization domain information

### Installation Methods

#### Method 1: App Store Installation

**Step 1: Access App Store**
1. Locate and open the **App Store** app on your iOS device
2. Ensure you're signed in with your Apple ID
3. Check that your device has sufficient storage space

**Step 2: Search and Download**
1. Tap the **Search** tab at the bottom of the App Store
2. Type "**Semantest Enterprise**" in the search bar
3. Tap **Search** on the keyboard
4. Locate the official Semantest Enterprise app (published by Semantest Inc.)
5. Tap **GET** or the cloud download icon if previously downloaded
6. Authenticate using Face ID, Touch ID, or Apple ID password

**Step 3: Installation Verification**
1. Wait for the download and installation to complete
2. The app icon will appear on your home screen
3. Tap the app icon to launch Semantest Enterprise
4. Proceed to [Initial Configuration](#initial-configuration)

#### Method 2: TestFlight Beta Installation

**Prerequisites:**
- TestFlight app installed from App Store
- Beta invitation link from your IT administrator
- Valid beta testing group membership

**Step 1: Install TestFlight**
```bash
# If TestFlight is not installed:
1. Open App Store
2. Search for "TestFlight"
3. Install the official Apple TestFlight app
```

**Step 2: Join Beta Program**
1. Open the beta invitation link provided by your administrator
   - Link format: `https://testflight.apple.com/join/[invitation-code]`
2. Tap **Accept** to join the beta testing program
3. If prompted, install TestFlight or open in TestFlight
4. Tap **Install** in TestFlight to download the beta version

**Step 3: Beta App Management**
1. Open TestFlight to manage beta installations
2. View app information, version notes, and feedback options
3. Enable automatic updates for beta versions
4. Provide feedback through TestFlight if issues occur

#### Method 3: Enterprise Distribution (MDM)

**For IT Administrators:**

**Prerequisites:**
- Apple Business Manager account
- MDM solution (Jamf, Microsoft Intune, etc.)
- iOS Developer Enterprise Program membership
- Signed IPA file from Semantest

**Step 1: Prepare Distribution**
```bash
# Upload IPA to MDM console
1. Log into your MDM solution
2. Navigate to App Distribution section
3. Upload Semantest Enterprise IPA file
4. Configure app metadata and permissions
```

**Step 2: Deploy to Devices**
```yaml
mdm_deployment:
  deployment_method: "Silent installation"
  target_devices: "Managed iOS devices"
  installation_behavior: "Required" or "Available"
  configuration_profile: "Semantest-iOS-Config.mobileconfig"
```

**Step 3: Configuration Profile**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>PayloadContent</key>
    <array>
        <dict>
            <key>PayloadType</key>
            <string>com.semantest.enterprise.configuration</string>
            <key>PayloadDisplayName</key>
            <string>Semantest Enterprise Configuration</string>
            <key>PayloadDescription</key>
            <string>Configures Semantest Enterprise app settings</string>
            <key>PayloadIdentifier</key>
            <string>com.company.semantest.config</string>
            <key>PayloadUUID</key>
            <string>12345678-1234-1234-1234-123456789012</string>
            <key>PayloadVersion</key>
            <integer>1</integer>
            <key>SemantestConfiguration</key>
            <dict>
                <key>APIEndpoint</key>
                <string>https://api.company.semantest.com</string>
                <key>OrganizationDomain</key>
                <string>company.semantest.com</string>
                <key>DefaultProject</key>
                <string>mobile-testing</string>
                <key>BiometricAuthRequired</key>
                <true/>
            </dict>
        </dict>
    </array>
    <key>PayloadDisplayName</key>
    <string>Semantest Enterprise</string>
    <key>PayloadIdentifier</key>
    <string>com.company.semantest</string>
    <key>PayloadType</key>
    <string>Configuration</string>
    <key>PayloadUUID</key>
    <string>87654321-4321-4321-4321-210987654321</string>
    <key>PayloadVersion</key>
    <integer>1</integer>
</dict>
</plist>
```

### iOS-Specific Configuration

#### App Permissions Setup
```yaml
ios_permissions:
  required_permissions:
    - Notifications: "Test completion alerts and team updates"
    - Network: "API communication and test execution"
    - Keychain: "Secure credential storage"
  
  optional_permissions:
    - Camera: "QR code scanning for quick setup"
    - Photos: "Screenshot capture and sharing"
    - Location: "Geolocation-based testing (if needed)"
    - Contacts: "Team member discovery and sharing"
```

**Configuring Permissions:**
1. Launch **Semantest Enterprise** app
2. Grant permissions when prompted during first launch
3. For missed permissions, go to iOS **Settings** → **Semantest Enterprise**
4. Toggle required permissions to **ON**

#### iOS Security Settings

**App Transport Security (ATS) Configuration:**
```xml
<!-- For enterprise deployments with custom certificates -->
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSExceptionDomains</key>
    <dict>
        <key>company.semantest.com</key>
        <dict>
            <key>NSExceptionAllowsInsecureHTTPLoads</key>
            <false/>
            <key>NSExceptionMinimumTLSVersion</key>
            <string>TLSv1.2</string>
            <key>NSExceptionRequiresForwardSecrecy</key>
            <true/>
        </dict>
    </dict>
</dict>
```

#### Background App Refresh
1. Open iOS **Settings** → **General** → **Background App Refresh**
2. Ensure **Background App Refresh** is enabled globally
3. Find **Semantest Enterprise** in the app list
4. Toggle to **ON** for real-time notifications and sync

## Android Setup Instructions

### System Requirements

#### Device Compatibility
```yaml
android_requirements:
  minimum_android_version: "8.0 (API level 26)"
  recommended_android_version: "12.0 (API level 31)+"
  
  hardware_requirements:
    ram: "Minimum 3GB, recommended 4GB+"
    storage: "Minimum 200MB free space"
    processor: "ARMv7 or ARM64 architecture"
    screen: "Minimum 720p resolution"
  
  supported_architectures:
    - arm64-v8a (recommended)
    - armeabi-v7a
    - x86_64 (for emulators)
```

#### Prerequisites Checklist
- [ ] Android 8.0+ installed
- [ ] Google account configured
- [ ] Google Play Services updated
- [ ] Sufficient storage space
- [ ] Active internet connection
- [ ] Valid Semantest Enterprise license

### Installation Methods

#### Method 1: Google Play Store Installation

**Step 1: Access Google Play Store**
1. Open the **Google Play Store** app
2. Ensure you're signed in with your Google account
3. Verify sufficient storage space is available

**Step 2: Search and Install**
1. Tap the **Search** bar at the top
2. Type "**Semantest Enterprise**"
3. Tap the **Search** icon or press Enter
4. Select the official Semantest Enterprise app
5. Tap **Install**
6. Review and accept app permissions
7. Wait for download and installation to complete

**Step 3: Launch Application**
1. Tap **Open** from Google Play Store
2. Or find the app icon in your app drawer
3. Launch and proceed to [Initial Configuration](#initial-configuration)

#### Method 2: APK Sideloading (Enterprise)

**Prerequisites:**
- APK file provided by IT administrator
- Developer options enabled
- USB debugging enabled (if installing via ADB)

**Step 1: Enable Unknown Sources**
```yaml
android_versions:
  android_8_plus:
    path: "Settings → Apps & notifications → Special app access → Install unknown apps"
    action: "Select browser/file manager → Allow from this source"
  
  android_7_minus:
    path: "Settings → Security → Unknown sources"
    action: "Toggle to enable unknown sources"
```

**Step 2: Install APK**

**Option A: Direct APK Installation**
1. Download APK file to device storage
2. Open **File Manager** and navigate to APK location
3. Tap the APK file to begin installation
4. Confirm installation when prompted
5. Tap **Install** and wait for completion

**Option B: ADB Installation**
```bash
# Connect device via USB and install via ADB
adb devices  # Verify device connection
adb install semantest-enterprise.apk
adb shell am start -n com.semantest.enterprise/.MainActivity
```

**Step 3: Security Cleanup**
1. After installation, disable **Unknown Sources** for security
2. Return to **Settings** → **Security**
3. Toggle **Unknown sources** to **OFF**

#### Method 3: Enterprise Managed Deployment

**For IT Administrators using EMM/MDM:**

**Prerequisites:**
- Enterprise Mobility Management (EMM) solution
- Managed Google Play account
- Android Enterprise enrollment

**Step 1: Managed Google Play Setup**
```bash
# Upload private app to Managed Google Play
1. Log into Google Play Console
2. Navigate to Managed Google Play
3. Upload Semantest Enterprise APK
4. Configure app metadata and permissions
5. Publish to organization
```

**Step 2: EMM Configuration**
```yaml
emm_deployment:
  app_configuration:
    package_name: "com.semantest.enterprise"
    deployment_type: "Required" # or "Available"
    auto_update: true
    configuration_policy: "semantest-android-config.json"
  
  device_restrictions:
    disable_app_uninstall: true
    force_app_permissions: true
    background_data_allowed: true
```

**Step 3: App Configuration Schema**
```json
{
  "kind": "androidenterprise#managedConfiguration",
  "managedConfigurationTemplate": {
    "configurationVariables": {
      "API_ENDPOINT": {
        "type": "STRING",
        "defaultValue": "https://api.company.semantest.com"
      },
      "ORGANIZATION_DOMAIN": {
        "type": "STRING",
        "defaultValue": "company.semantest.com"
      },
      "DEFAULT_PROJECT": {
        "type": "STRING",
        "defaultValue": "android-testing"
      },
      "BIOMETRIC_AUTH_REQUIRED": {
        "type": "BOOL",
        "defaultValue": true
      },
      "OFFLINE_SYNC_ENABLED": {
        "type": "BOOL",
        "defaultValue": true
      }
    }
  }
}
```

### Android-Specific Configuration

#### App Permissions Management
```yaml
android_permissions:
  required_permissions:
    INTERNET: "Network communication"
    ACCESS_NETWORK_STATE: "Network status monitoring"
    WAKE_LOCK: "Background processing"
    RECEIVE_BOOT_COMPLETED: "Auto-start capability"
  
  optional_permissions:
    CAMERA: "QR code scanning"
    READ_EXTERNAL_STORAGE: "File import/export"
    WRITE_EXTERNAL_STORAGE: "Local data storage"
    ACCESS_FINE_LOCATION: "Location-based testing"
    USE_FINGERPRINT: "Biometric authentication"
    USE_BIOMETRIC: "Modern biometric authentication"
```

**Managing Permissions:**
1. Open **Settings** → **Apps** → **Semantest Enterprise**
2. Tap **Permissions**
3. Configure permissions as needed:
   - **Allow** for required permissions
   - **Allow** or **Deny** for optional permissions based on usage

#### Battery Optimization
```yaml
battery_optimization:
  purpose: "Ensure app runs reliably in background"
  
  configuration_steps:
    doze_mode_exemption:
      - "Settings → Battery → Battery optimization"
      - "Find Semantest Enterprise"
      - "Select 'Don't optimize'"
    
    adaptive_battery:
      - "Settings → Battery → Adaptive Battery"
      - "Add Semantest Enterprise to unrestricted apps"
    
    background_restrictions:
      - "Settings → Apps → Semantest Enterprise → Battery"
      - "Select 'Remove restrictions'"
```

#### Notification Configuration
1. Open **Settings** → **Apps & notifications** → **Notifications**
2. Find **Semantest Enterprise** in the app list
3. Configure notification settings:
   - **Allow notifications**: ON
   - **Show on lock screen**: Recommended
   - **Override Do Not Disturb**: For critical alerts
   - **Notification categories**: Configure by type

## Enterprise Deployment

### MDM/EMM Integration

#### Supported EMM Solutions
```yaml
supported_emm_platforms:
  microsoft_intune:
    app_wrapping: "Intune App SDK integration"
    app_protection: "MAM policies supported"
    conditional_access: "Azure AD integration"
  
  jamf_pro:
    app_distribution: "Volume Purchase Program"
    configuration_profiles: "Custom payload support"
    compliance_policies: "Device compliance integration"
  
  google_workspace:
    managed_google_play: "Private app distribution"
    android_enterprise: "Work profile support"
    admin_console: "Centralized management"
  
  vmware_workspace_one:
    app_catalog: "Internal app distribution"
    device_profiles: "Configuration management"
    security_policies: "App-level security"
```

#### Enterprise Configuration Template
```yaml
enterprise_config:
  server_settings:
    api_endpoint: "https://api.company.semantest.com"
    websocket_endpoint: "wss://ws.company.semantest.com"
    cdn_endpoint: "https://cdn.company.semantest.com"
  
  authentication:
    sso_provider: "Azure AD" # or "Okta", "ADFS", etc.
    sso_domain: "company.com"
    require_mfa: true
    session_timeout: 480 # minutes
  
  security_policies:
    require_biometric: true
    allow_screenshots: false
    require_vpn: true
    certificate_pinning: true
  
  feature_flags:
    offline_mode: true
    beta_features: false
    debug_logging: false
    crash_reporting: true
```

### Corporate Network Setup

#### Proxy Configuration
```yaml
proxy_settings:
  http_proxy:
    host: "proxy.company.com"
    port: 8080
    authentication: "NTLM" # or "Basic", "Digest"
    bypass_list: 
      - "*.company.com"
      - "localhost"
      - "127.0.0.1"
  
  pac_file:
    url: "http://proxy.company.com/proxy.pac"
    auto_detect: true
```

#### Certificate Management
```yaml
certificate_configuration:
  root_ca:
    - Install corporate root CA certificates
    - Configure certificate pinning for app
    - Validate certificate chain during setup
  
  client_certificates:
    - Deploy client certificates via MDM
    - Configure mutual TLS authentication
    - Set up certificate renewal automation
```

## Network Configuration

### Firewall Requirements

#### Required Network Access
```yaml
network_requirements:
  outbound_connections:
    api_server:
      protocol: "HTTPS"
      port: 443
      destination: "api.company.semantest.com"
      purpose: "Main API communication"
    
    websocket_server:
      protocol: "WSS"
      port: 443
      destination: "ws.company.semantest.com"
      purpose: "Real-time updates"
    
    cdn_server:
      protocol: "HTTPS"
      port: 443
      destination: "cdn.company.semantest.com"
      purpose: "Static content and downloads"
    
    auth_server:
      protocol: "HTTPS"
      port: 443
      destination: "auth.company.semantest.com"
      purpose: "Authentication services"
  
  optional_connections:
    analytics:
      protocol: "HTTPS"
      port: 443
      destination: "analytics.semantest.com"
      purpose: "Usage analytics (opt-out available)"
    
    crash_reporting:
      protocol: "HTTPS"
      port: 443
      destination: "crash.semantest.com"
      purpose: "Crash report collection"
```

#### Network Testing Script
```bash
#!/bin/bash
# network-connectivity-test.sh

echo "Testing Semantest Enterprise network connectivity..."

# Test API endpoint
echo "Testing API endpoint..."
curl -I https://api.company.semantest.com/health || echo "❌ API endpoint failed"

# Test WebSocket endpoint
echo "Testing WebSocket endpoint..."
curl -I https://ws.company.semantest.com/health || echo "❌ WebSocket endpoint failed"

# Test CDN endpoint
echo "Testing CDN endpoint..."
curl -I https://cdn.company.semantest.com/health || echo "❌ CDN endpoint failed"

# Test authentication endpoint
echo "Testing authentication endpoint..."
curl -I https://auth.company.semantest.com/health || echo "❌ Auth endpoint failed"

echo "Network connectivity test completed."
```

### VPN Configuration

#### VPN Requirements
```yaml
vpn_setup:
  supported_protocols:
    - "OpenVPN"
    - "IPSec/IKEv2"
    - "WireGuard"
    - "Cisco AnyConnect"
  
  configuration_requirements:
    split_tunneling: "Required for optimal performance"
    dns_settings: "Corporate DNS servers"
    routes: "Access to corporate subnets"
    certificates: "Corporate PKI certificates"
```

## Security Configuration

### Biometric Authentication

#### iOS Face ID/Touch ID Setup
```yaml
ios_biometric:
  face_id:
    requirements:
      - "iPhone X or later with TrueDepth camera"
      - "iOS 11.0 or later"
      - "Face ID enabled in device settings"
    
    configuration:
      - "Settings → Face ID & Passcode"
      - "Enable 'iPhone Unlock'"
      - "Test Face ID functionality"
      - "Configure app-specific Face ID in Semantest"
  
  touch_id:
    requirements:
      - "iPhone 5s or later with Touch ID sensor"
      - "iOS 7.0 or later"
      - "Touch ID enabled in device settings"
    
    configuration:
      - "Settings → Touch ID & Passcode"
      - "Add fingerprints (recommended: 2-3)"
      - "Enable 'iPhone Unlock'"
      - "Configure app-specific Touch ID in Semantest"
```

#### Android Biometric Setup
```yaml
android_biometric:
  fingerprint:
    requirements:
      - "Android 6.0+ with fingerprint sensor"
      - "Device security (PIN/Pattern/Password) enabled"
    
    configuration:
      - "Settings → Security → Fingerprint"
      - "Add fingerprints (recommended: 2-3)"
      - "Enable fingerprint unlock"
      - "Configure in Semantest app"
  
  face_unlock:
    requirements:
      - "Android 9.0+ with front camera"
      - "Device security enabled"
    
    configuration:
      - "Settings → Security → Face Unlock"
      - "Complete face enrollment"
      - "Test face unlock functionality"
      - "Configure in Semantest app"
```

### Data Encryption

#### Encryption Settings
```yaml
encryption_configuration:
  data_at_rest:
    ios: "iOS hardware encryption (enabled by default with passcode)"
    android: "Android file-based encryption (Android 7.0+)"
  
  data_in_transit:
    protocol: "TLS 1.3"
    certificate_pinning: true
    perfect_forward_secrecy: true
  
  app_level_encryption:
    local_database: "AES-256 encryption"
    cached_data: "Encrypted with device keystore"
    authentication_tokens: "Secure keychain/keystore storage"
```

## Device Management

### iOS Device Management

#### Device Enrollment
```yaml
ios_enrollment:
  apple_business_manager:
    - Automated device enrollment (DEP)
    - Volume purchase program (VPP)
    - Managed Apple ID distribution
  
  manual_enrollment:
    - Configuration profile installation
    - MDM agent installation
    - Corporate app catalog access
```

#### iOS Restrictions
```xml
<!-- Sample iOS restriction configuration -->
<key>restrictions</key>
<dict>
    <key>allowAppInstallation</key>
    <false/>
    <key>allowAppRemoval</key>
    <false/>
    <key>allowUIConfigurationProfileInstallation</key>
    <false/>
    <key>forceEncryptedBackup</key>
    <true/>
    <key>allowScreenShot</key>
    <true/>
    <key>allowVideoConferencing</key>
    <true/>
</dict>
```

### Android Device Management

#### Android Enterprise Enrollment
```yaml
android_enterprise:
  work_profile:
    - Personal and work data separation
    - Work-specific app installation
    - Policy-based management
  
  fully_managed:
    - Complete device control
    - Corporate-owned device management
    - Enhanced security policies
  
  dedicated_device:
    - Kiosk mode operation
    - Single-app deployment
    - Specialized use cases
```

#### Device Policy Configuration
```json
{
  "applications": [
    {
      "packageName": "com.semantest.enterprise",
      "installType": "REQUIRED_FOR_SETUP",
      "lockTaskAllowed": true,
      "permissionGrants": [
        {
          "permission": "android.permission.CAMERA",
          "policy": "GRANT"
        }
      ]
    }
  ],
  "systemUpdate": {
    "type": "AUTOMATIC"
  },
  "keyguardDisabled": false,
  "statusBarDisabled": false
}
```

## Troubleshooting Setup Issues

### Common Installation Problems

#### iOS Installation Issues
```yaml
ios_troubleshooting:
  app_store_download_failed:
    symptoms: "Download stops or fails to start"
    solutions:
      - "Check Apple ID payment method"
      - "Verify sufficient storage space"
      - "Restart device and retry"
      - "Sign out and back into Apple ID"
  
  testflight_invitation_expired:
    symptoms: "Cannot accept TestFlight invitation"
    solutions:
      - "Request new invitation from administrator"
      - "Check email for updated invitation link"
      - "Verify TestFlight app is installed"
  
  enterprise_app_untrusted:
    symptoms: "Untrusted Enterprise Developer warning"
    solutions:
      - "Settings → General → VPN & Device Management"
      - "Trust enterprise developer certificate"
      - "Verify certificate is valid and not expired"
```

#### Android Installation Issues
```yaml
android_troubleshooting:
  play_store_installation_failed:
    symptoms: "Installation fails with error message"
    solutions:
      - "Clear Google Play Store cache and data"
      - "Check available storage space"
      - "Verify Google account permissions"
      - "Update Google Play Services"
  
  apk_installation_blocked:
    symptoms: "APK installation prevented by security"
    solutions:
      - "Enable 'Unknown sources' for installer app"
      - "Check if device policy allows sideloading"
      - "Verify APK file integrity and signature"
  
  insufficient_permissions:
    symptoms: "App crashes or features don't work"
    solutions:
      - "Review and grant required permissions"
      - "Check battery optimization settings"
      - "Verify background app restrictions"
```

### Network Connectivity Issues

#### Connectivity Troubleshooting
```bash
# Network diagnostic script
#!/bin/bash

echo "Semantest Mobile App Network Diagnostics"
echo "======================================="

# Test basic connectivity
ping -c 4 8.8.8.8 > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Internet connectivity: OK"
else
    echo "❌ Internet connectivity: FAILED"
fi

# Test DNS resolution
nslookup api.company.semantest.com > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ DNS resolution: OK"
else
    echo "❌ DNS resolution: FAILED"
fi

# Test HTTPS connectivity
curl -s -o /dev/null -w "%{http_code}" https://api.company.semantest.com/health
if [ $? -eq 0 ]; then
    echo "✅ HTTPS connectivity: OK"
else
    echo "❌ HTTPS connectivity: FAILED"
fi
```

## Post-Installation Verification

### Functionality Testing

#### Basic Feature Verification
```yaml
verification_checklist:
  authentication:
    - [ ] SSO login successful
    - [ ] Biometric authentication working
    - [ ] Session persistence across app restarts
    - [ ] Logout functionality working
  
  core_features:
    - [ ] Project list loads correctly
    - [ ] Test execution can be initiated
    - [ ] Real-time progress updates working
    - [ ] Test results display properly
  
  connectivity:
    - [ ] Online/offline status detection
    - [ ] Sync functionality working
    - [ ] Push notifications received
    - [ ] Background operations functioning
  
  performance:
    - [ ] App launches within 3 seconds
    - [ ] Navigation is responsive
    - [ ] No memory leaks or crashes
    - [ ] Battery usage is reasonable
```

#### Comprehensive Testing Script
```javascript
// Automated post-installation test script
const SemantestMobile = require('@semantest/mobile-testing');

async function runPostInstallationTests() {
  const tester = new SemantestMobile.AppTester();
  
  console.log('Starting post-installation verification...');
  
  // Test 1: App Launch
  await tester.testAppLaunch({
    maxLaunchTime: 3000, // 3 seconds
    expectSplashScreen: true
  });
  
  // Test 2: Authentication Flow
  await tester.testAuthentication({
    method: 'SSO',
    domain: 'company.semantest.com',
    expectedRedirect: true
  });
  
  // Test 3: Core Navigation
  await tester.testNavigation([
    'Home', 'Tests', 'Analytics', 'Settings'
  ]);
  
  // Test 4: Network Connectivity
  await tester.testNetworkOperations({
    testAPICall: true,
    testWebSocket: true,
    testFileDownload: true
  });
  
  // Test 5: Device Features
  await tester.testDeviceIntegration({
    notifications: true,
    biometrics: true,
    backgroundSync: true
  });
  
  console.log('Post-installation verification completed successfully!');
}

runPostInstallationTests().catch(console.error);
```

### Performance Baseline

#### Performance Metrics Collection
```yaml
performance_baseline:
  app_startup:
    cold_start: "< 3 seconds"
    warm_start: "< 1 second"
    memory_usage: "< 100 MB initial"
  
  user_interactions:
    tap_response: "< 100 ms"
    page_transitions: "< 500 ms"
    data_loading: "< 2 seconds"
  
  network_operations:
    api_response: "< 1 second"
    file_download: "10 MB/s minimum"
    sync_completion: "< 30 seconds"
  
  battery_usage:
    background_usage: "< 2% per hour"
    active_usage: "< 10% per hour"
    standby_impact: "< 1% per day"
```

This comprehensive setup guide provides detailed instructions for successfully installing and configuring the Semantest mobile application on both iOS and Android platforms, with extensive coverage of enterprise deployment scenarios and troubleshooting procedures.

---

**Last Updated**: January 19, 2025  
**Version**: 1.0.0  
**Maintainer**: Semantest Mobile Setup Team  
**Support**: mobile-setup@semantest.com