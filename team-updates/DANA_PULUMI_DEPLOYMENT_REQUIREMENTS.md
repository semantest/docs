# 📋 Dana - Public WebSocket Server Deployment Requirements

## URGENT: Deploy api.extension.semantest.com

### Architecture Decision:
Local-first with automatic public fallback for better UX

## Infrastructure Requirements:

### Option A: AWS (Recommended)
```yaml
Resources:
  - API Gateway (WebSocket)
  - Lambda Functions
  - Route 53 (DNS)
  - ACM (SSL Certificate)
  - CloudWatch (Monitoring)
```

### Option B: Azure
```yaml
Resources:
  - Azure SignalR Service
  - Azure Functions
  - Azure DNS
  - Azure Monitor
```

## Pulumi Configuration Needed:

### 1. Domain & SSL
```typescript
// Create subdomain
const domain = "api.extension.semantest.com";

// SSL certificate
const certificate = new aws.acm.Certificate("websocket-cert", {
  domainName: domain,
  validationMethod: "DNS",
});
```

### 2. WebSocket API Gateway (AWS)
```typescript
const wsApi = new aws.apigatewayv2.Api("semantest-ws", {
  protocolType: "WEBSOCKET",
  routeSelectionExpression: "$request.body.action",
});

// Routes needed
const connectRoute = new aws.apigatewayv2.Route("connect", {
  apiId: wsApi.id,
  routeKey: "$connect",
  target: connectLambda.arn,
});
```

### 3. Lambda Functions
```typescript
// Connection handler
const connectLambda = new aws.lambda.Function("ws-connect", {
  runtime: "nodejs18.x",
  handler: "connect.handler",
  environment: {
    variables: {
      CONNECTIONS_TABLE: connectionsTable.name,
    },
  },
});
```

### 4. Required Endpoints:
- `wss://api.extension.semantest.com/` - WebSocket
- `https://api.extension.semantest.com/health` - Health check
- `https://api.extension.semantest.com/semantest-signature` - Signature

### 5. CORS Configuration:
```typescript
const corsConfig = {
  allowOrigins: ["chrome-extension://*"],
  allowMethods: ["GET", "POST"],
  allowHeaders: ["Content-Type"],
};
```

## Environment Variables:
```bash
PULUMI_ACCESS_TOKEN=xxx
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
DOMAIN_NAME=api.extension.semantest.com
```

## Deployment Steps:

1. **Initialize Pulumi**
   ```bash
   pulumi new aws-typescript
   cd semantest-websocket-public
   ```

2. **Create Infrastructure**
   ```bash
   npm install @pulumi/aws @pulumi/pulumi
   pulumi up
   ```

3. **Deploy Lambda Code**
   - Connection handler
   - Disconnect handler
   - Message handler
   - Health check

4. **Configure DNS**
   - Point api.extension.semantest.com to API Gateway
   - Verify SSL certificate

5. **Test Endpoints**
   ```bash
   wscat -c wss://api.extension.semantest.com
   curl https://api.extension.semantest.com/health
   ```

## Success Criteria:
- ✅ WebSocket connects from extension
- ✅ Handles imageDownloadRequested events
- ✅ Auto-scales with load
- ✅ SSL/TLS secured
- ✅ Health monitoring active

## Timeline:
- TODAY: Start Pulumi setup
- TOMORROW: Deploy to production
- 48 HOURS: Fully tested with extension

Report progress:
```bash
./tmux-orchestrator/send-claude-message.sh semantest:0 @PM: Dana - Pulumi deployment status
```

This enables seamless fallback for all users!

- PM