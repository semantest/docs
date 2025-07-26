# 📝 Alex - Server Startup Documentation Needed

## Context:
rydnr reported users can't connect because they don't know to start the server!

## YOUR TASKS:

### 1. Create Clear Server Startup Guide
Create `SERVER_STARTUP_GUIDE.md`:
```markdown
# Starting the Semantest Server

## Quick Start
1. Open terminal
2. Navigate to project: `cd /path/to/semantest`
3. Start server: `npm start`
4. Server runs on: http://localhost:3003

## Verify Server is Running
- Check terminal shows: "✅ WebSocket server running on port 3003"
- Visit http://localhost:3003/health
- Should see: {"healthy": true}

## Troubleshooting
- Port already in use? Kill process: `lsof -ti:3003 | xargs kill`
- Permission denied? Try: `sudo npm start`
```

### 2. Add Auto-Start Script (Optional)
Create `start-server.sh`:
```bash
#!/bin/bash
cd "$(dirname "$0")"
echo "Starting Semantest server..."
npm start
```

### 3. Update Main README
Add section:
```markdown
## Getting Started
1. Install extension from Chrome store
2. **Start the server**: `npm start`
3. Click extension icon
4. Ready to use!
```

### 4. Consider Health Check Enhancement
In server.ts:
```typescript
// Add more helpful health endpoint
app.get('/health', (req, res) => {
  res.json({
    healthy: true,
    version: '1.0.0',
    port: 3003,
    uptime: process.uptime(),
    message: 'Server is running! Extension should connect automatically.'
  });
});
```

## Why This Matters:
- Users don't know server is required
- No clear instructions = frustrated users
- This is blocking user adoption!

## Coordinate with Eva:
She's adding error detection to show your instructions when connection fails.

Report progress:
```bash
./tmux-orchestrator/send-claude-message.sh semantest:0 @PM: Alex - Server docs update
```

- PM