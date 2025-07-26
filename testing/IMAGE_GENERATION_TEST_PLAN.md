# Image Generation Test Plan

## Test Environment Setup

### Prerequisites
1. Node.js installed
2. Semantest server running on localhost:8080
3. Write permissions to ~/Downloads/
4. WebSocket client (`ws` npm package)

### Start Test Server
```bash
cd sdk/server
npm install
npm run dev  # or npm start
```

## Test Cases

### 1. Basic Image Generation
**Test**: Generate image with default settings
```bash
./generate-image.sh "a beautiful sunset over mountains"
```
**Expected**:
- ✅ WebSocket connection established
- ✅ ImageRequestReceived event sent
- ✅ New chat created (chat is null)
- ✅ Image downloaded to ~/Downloads/
- ✅ ImageDownloaded event received
- ✅ Success message with file path

### 2. Custom Download Folder
**Test**: Specify custom download location
```bash
mkdir -p ~/Pictures/test-images
./generate-image.sh "a futuristic city" ~/Pictures/test-images/
```
**Expected**:
- ✅ Image saved to ~/Pictures/test-images/
- ✅ Folder created if doesn't exist

### 3. Default Prompt
**Test**: Run without arguments
```bash
./generate-image.sh
```
**Expected**:
- ✅ Uses default prompt: "A futuristic robot coding at a holographic terminal"
- ✅ Shows usage instructions
- ✅ Proceeds with generation

### 4. WebSocket Server Not Running
**Test**: Run when server is down
```bash
# Stop the server first
./generate-image.sh "test"
```
**Expected**:
- ❌ WebSocket connection error
- ❌ Clear error message about server

### 5. Invalid Download Folder
**Test**: Use restricted folder
```bash
./generate-image.sh "test" /root/images/
```
**Expected**:
- ❌ Permission error
- ❌ Fallback to default ~/Downloads/

### 6. Multiple Concurrent Requests
**Test**: Run multiple scripts simultaneously
```bash
./generate-image.sh "cat 1" &
./generate-image.sh "cat 2" &
./generate-image.sh "cat 3" &
```
**Expected**:
- ✅ All requests processed
- ✅ Unique file names (no overwrites)
- ✅ All images downloaded

### 7. Event Payload Validation
**Test**: Check event structure
```bash
# Monitor WebSocket traffic while running
./generate-image.sh "test prompt"
```
**Expected Event Structure**:
```json
{
  "type": "semantest/custom/image/request/received",
  "payload": {
    "prompt": "test prompt",
    "metadata": {
      "requestId": "img-TIMESTAMP-PID",
      "downloadFolder": "/home/user/Downloads",
      "timestamp": 1234567890000
    }
  }
}
```

### 8. Integration with Existing Chat
**Test**: Modify handler to accept chat parameter
```bash
# Future enhancement
./generate-image.sh "test" --chat="existing-chat-id"
```

## Manual Testing Checklist

### Pre-Test
- [ ] Server is running on port 8080
- [ ] WebSocket endpoint is accessible
- [ ] Download folder has write permissions
- [ ] Node.js and npm are installed

### During Test
- [ ] Monitor server logs for errors
- [ ] Check WebSocket messages
- [ ] Verify file creation in real-time
- [ ] Monitor system resources

### Post-Test
- [ ] Verify image files exist
- [ ] Check file permissions
- [ ] Validate file content (valid images)
- [ ] Clean up test files

## Automated Test Script
```bash
#!/bin/bash
# test-image-generation.sh

echo "🧪 Running Image Generation Tests"

# Test 1: Basic generation
echo "Test 1: Basic generation..."
./generate-image.sh "test image 1"
[ $? -eq 0 ] && echo "✅ Test 1 passed" || echo "❌ Test 1 failed"

# Test 2: Custom folder
echo "Test 2: Custom folder..."
mkdir -p /tmp/test-images
./generate-image.sh "test image 2" /tmp/test-images/
[ -f /tmp/test-images/chatgpt_*.png ] && echo "✅ Test 2 passed" || echo "❌ Test 2 failed"

# Test 3: No arguments
echo "Test 3: Default prompt..."
./generate-image.sh
[ $? -eq 0 ] && echo "✅ Test 3 passed" || echo "❌ Test 3 failed"

echo "🏁 Tests completed"
```

## Performance Benchmarks
- Connection time: < 100ms
- Event round-trip: < 500ms
- Image download: Depends on size (typically < 5s)
- Total execution: < 10s

## Error Scenarios
1. **Network timeout**: 30s timeout configured
2. **Server crash**: Graceful error message
3. **Invalid JSON**: Error parsing handled
4. **Missing dependencies**: Auto-install ws module

## Success Metrics
- ✅ 100% success rate for valid requests
- ✅ < 10s average execution time
- ✅ Clear error messages for failures
- ✅ No file system pollution (cleanup)
- ✅ Unique file names (no overwrites)