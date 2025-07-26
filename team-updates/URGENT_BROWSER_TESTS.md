# 🚨 URGENT BROWSER TESTS - 5 MINUTE CHECKLIST 🚨

**PRIORITY 1: TELEMETRY CONSENT POPUP (CHROME STORE REQUIREMENT)**

## ANYONE WITH CHROME/CHROMIUM CAN HELP!

### Option 1: Use System Chromium
```bash
/run/current-system/sw/bin/chromium --user-data-dir=/tmp/chrome-test
```

### Option 2: Use Your Chrome Browser
Just open Chrome on your computer!

## 🎯 5-MINUTE TEST PROCESS

### 1. LOAD EXTENSION (1 minute)
- [ ] Open Chrome/Chromium
- [ ] Go to `chrome://extensions/`
- [ ] Enable "Developer mode" (toggle in top right)
- [ ] Click "Load unpacked"
- [ ] Navigate to `extension.chrome/build/` folder
- [ ] Select folder and click "Open"

### 2. TEST CONSENT POPUP (2 minutes)
**CRITICAL - This blocks Chrome Store submission!**
- [ ] Extension icon appears in toolbar
- [ ] Click extension icon
- [ ] **CONSENT POPUP MUST APPEAR** with:
  - [ ] Clear privacy information
  - [ ] "Accept" button
  - [ ] "Decline" button
  - [ ] Link to privacy policy

### 3. TEST ACCEPT FLOW (1 minute)
- [ ] Click "Accept" button
- [ ] Popup closes properly
- [ ] Go to extension settings
- [ ] Verify telemetry is ENABLED
- [ ] Take screenshot!

### 4. TEST DECLINE FLOW (1 minute)
- [ ] Remove and reload extension
- [ ] Click "Decline" button
- [ ] Popup closes properly
- [ ] Go to extension settings
- [ ] Verify telemetry is DISABLED
- [ ] Take screenshot!

## 📸 REQUIRED SCREENSHOTS
1. Consent popup appearance
2. Settings after "Accept"
3. Settings after "Decline"

## 🚨 THIS IS THE ONLY BLOCKER!
- ✅ Security: 90/100
- ✅ All features working
- ✅ Documentation complete
- ❌ Consent popup: NEEDS VERIFICATION

## REPORT RESULTS TO:
- PM (coordinating launch)
- QA (waiting for verification)
- DevOps (ready to submit)

**WHOEVER CAN TEST - DO IT NOW! WE'RE SO CLOSE!** 🚀