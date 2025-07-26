# 🚨 URGENT: WebSocket Architecture Change - Smart Fallback Strategy

## ARCHITECTURAL DECISION FROM RYDNR

### New Architecture: Local-First with Public Fallback

```
Extension Logic:
1. Try localhost:3003 FIRST
2. Check for 'semantest' signature at specific URL
3. If local fails → fallback to api.extension.semantest.com
4. Seamless user experience!
```

## IMMEDIATE ACTIONS REQUIRED:

### 1. Eva (Extension) - Update Connection Logic
```javascript
async function connectWebSocket() {
  // Step 1: Try local server
  if (await checkLocalServer()) {
    ws = new WebSocket('ws://localhost:3003');
    console.log('Connected to local server');
    return;
  }
  
  // Step 2: Fallback to public server
  ws = new WebSocket('wss://api.extension.semantest.com');
  console.log('Connected to public server');
}

async function checkLocalServer() {
  try {
    const response = await fetch('http://localhost:3003/semantest-signature');
    const data = await response.json();
    return data.service === 'semantest';
  } catch {
    return false;
  }
}
```

### 2. Alex (Backend) - Add Signature Endpoint
```typescript
// Add to server.ts
app.get('/semantest-signature', (req, res) => {
  res.json({
    service: 'semantest',
    version: '1.0.0',
    type: 'local'
  });
});
```

### 3. Dana (DevOps) - CRITICAL DEPLOYMENT
**Requirements for Public WebSocket Server:**

#### Infrastructure Choice:
- **AWS Lambda** with WebSocket API Gateway
- OR **Azure Functions** with SignalR Service
- Use **Pulumi** for infrastructure as code

#### Server Requirements:
- WebSocket support for real-time events
- CORS enabled for extension domain
- SSL/TLS required (wss://)
- Auto-scaling for load
- Health monitoring

#### Endpoints Needed:
```
wss://api.extension.semantest.com/
https://api.extension.semantest.com/health
https://api.extension.semantest.com/semantest-signature
```

## BENEFITS OF THIS APPROACH:

1. **Power Users**: Use local server (faster, private)
2. **Casual Users**: Automatic public fallback
3. **No Configuration**: Works out of the box
4. **Best of Both**: Privacy + convenience

## IMPLEMENTATION PRIORITY:

1. **Dana**: Start Pulumi configuration NOW
2. **Eva**: Implement fallback logic
3. **Alex**: Add signature endpoint
4. **Sam**: Document dual-mode operation

## Timeline:
- Local signature: TODAY
- Fallback logic: TODAY
- Public deployment: TOMORROW
- Full testing: 48 hours

This solves the UX issue permanently!

---
**Decision by**: rydnr
**Priority**: CRITICAL
**Blocks**: User adoption