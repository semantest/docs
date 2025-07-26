# 🚨 Dana - Priority Redirect to Image Download Feature

Hi Dana! Thanks for the comprehensive infrastructure analysis - that's excellent work! However, we have an URGENT priority:

## 🎯 IMMEDIATE PRIORITY: Image Download Shell Script

### Current Situation:
- Eva just fixed the WebSocket port (now 3003)
- Quinn is testing the extension connection
- Alex is integrating the image handler
- **YOU are needed for the shell script implementation!**

### Your Critical Task: `generate-image.sh`

The script needs to:
1. **Send ImageRequestReceived event via WebSocket**
   ```bash
   # Example structure:
   EVENT_JSON='{
     "type": "chatgpt:image/request-received",
     "payload": {
       "prompt": "$1",
       "metadata": {
         "downloadFolder": "$2"
       }
     }
   }'
   
   # Send to WebSocket on port 3003
   echo "$EVENT_JSON" | websocat ws://localhost:3003
   ```

2. **Listen for ImageDownloaded response**
3. **Display the downloaded file path to user**

### Quick Implementation Guide:
- Use `websocat` or `wscat` for WebSocket communication
- Default download folder: `~/Downloads`
- Accept prompt as first argument
- Optional: folder as second argument

### Test Command:
```bash
./generate-image.sh "cute robot" ~/Pictures/
```

## Infrastructure Work (Important but Later):
Your infrastructure analysis is EXCELLENT and we'll definitely need:
- CI/CD pipeline ✅
- Security configs ✅
- Load testing ✅

But first, let's get this image download feature working end-to-end!

### Time Estimate:
- Shell script: 1-2 hours
- Testing with team: 30 minutes

Please focus on the shell script first. The team is waiting on this to complete the feature!

Let me know if you need any clarification on the event formats or WebSocket implementation.

- PM