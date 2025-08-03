# ADR-004: CORS Strategy for Extension-Server Communication

## Status
**Accepted** - December 2024

## Context
Browser extensions need to communicate with the Semantest API server across different origins. We must implement a secure CORS (Cross-Origin Resource Sharing) strategy that balances security with functionality.

## Decision
We will implement a tiered CORS strategy with strict origin validation and preflight caching.

## Rationale

### Security Requirements
1. **Origin Validation**: Only trusted sources can access our API
2. **Credential Support**: Extensions need authenticated requests
3. **Method Restrictions**: Limit to necessary HTTP methods
4. **Header Control**: Specify allowed request/response headers
5. **CSP Compliance**: Work within Content Security Policy constraints

## Implementation

### CORS Configuration
```typescript
// Tiered origin strategy
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Tier 1: Extension origins (most trusted)
    const extensionOrigins = [
      'chrome-extension://*',
      'moz-extension://*',
      'safari-web-extension://*'
    ];
    
    // Tier 2: Development origins
    const devOrigins = process.env.NODE_ENV === 'development' ? [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://localhost:3000'
    ] : [];
    
    // Tier 3: Production domains
    const prodOrigins = [
      'https://semantest.com',
      'https://app.semantest.com',
      'https://api.semantest.com'
    ];
    
    const allowedOrigins = [
      ...extensionOrigins,
      ...devOrigins,
      ...prodOrigins
    ];
    
    // Dynamic validation for extensions
    if (!origin || isValidExtensionOrigin(origin, allowedOrigins)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation'));
    }
  },
  
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-API-Key',
    'X-Request-ID',
    'X-Extension-Version'
  ],
  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
    'X-Request-ID'
  ],
  maxAge: 86400 // 24 hour preflight cache
};
```

### Extension-Specific Headers
```typescript
// Custom headers for extension tracking
interface ExtensionHeaders {
  'X-Extension-ID': string;      // Unique extension identifier
  'X-Extension-Version': string; // Semantic version
  'X-Extension-Platform': 'chrome' | 'firefox' | 'safari';
}

// Middleware to validate extension requests
const validateExtension = (req: Request, res: Response, next: Next) => {
  const extensionId = req.headers['x-extension-id'];
  const version = req.headers['x-extension-version'];
  
  if (isExtensionRequest(req) && (!extensionId || !version)) {
    return res.status(400).json({
      error: 'MISSING_EXTENSION_HEADERS',
      message: 'Extension requests require ID and version headers'
    });
  }
  
  next();
};
```

### Dynamic Origin Validation
```typescript
// Validate extension origins with pattern matching
function isValidExtensionOrigin(origin: string, patterns: string[]): boolean {
  return patterns.some(pattern => {
    if (pattern.includes('*')) {
      // Convert wildcard to regex
      const regex = new RegExp(
        pattern.replace(/\*/g, '.*').replace(/\//g, '\\/')
      );
      return regex.test(origin);
    }
    return origin === pattern;
  });
}
```

### CSP Integration
```typescript
// Content Security Policy headers
const cspHeaders = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "connect-src 'self' https://api.semantest.com wss://realtime.semantest.com",
    "img-src 'self' data: https://cdn.semantest.com",
    "script-src 'self' 'unsafe-inline'", // Required for extensions
    "style-src 'self' 'unsafe-inline'"
  ].join('; ')
};
```

### Preflight Optimization
```typescript
// Cache preflight requests
app.options('*', cors(corsOptions)); // Handle all OPTIONS

// Specific endpoint preflight
app.options('/api/v1/images/generate', (req, res) => {
  res.header('Access-Control-Max-Age', '86400');
  res.header('Access-Control-Allow-Methods', 'POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');
  res.sendStatus(204);
});
```

## Security Considerations

### Rate Limiting by Origin
```typescript
const originRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: (req) => {
    const origin = req.headers.origin;
    if (isExtensionOrigin(origin)) return 100; // Higher for extensions
    if (isDevelopmentOrigin(origin)) return 50;
    return 10; // Strict for unknown origins
  }
});
```

### CORS Error Handling
```typescript
app.use((err: Error, req: Request, res: Response, next: Next) => {
  if (err.message === 'CORS policy violation') {
    logger.warn('CORS violation', {
      origin: req.headers.origin,
      method: req.method,
      path: req.path,
      ip: req.ip
    });
    
    res.status(403).json({
      error: 'CORS_POLICY_VIOLATION',
      message: 'Origin not allowed by CORS policy'
    });
  } else {
    next(err);
  }
});
```

## Consequences

### Positive
- ✅ Secure cross-origin communication
- ✅ Extension-friendly configuration
- ✅ Performance via preflight caching
- ✅ Clear origin tiering system
- ✅ CSP compliance maintained

### Negative
- ❌ Complex origin validation logic
- ❌ Potential for misconfiguration
- ❌ Debugging CORS issues can be challenging

### Neutral
- 🔄 Regular updates for new origins
- 🔄 Monitoring CORS violations
- 🔄 Extension version tracking overhead

## Testing Strategy
```typescript
// Test CORS configuration
describe('CORS Policy', () => {
  it('allows extension origins', async () => {
    const response = await request(app)
      .options('/api/v1/chat/new')
      .set('Origin', 'chrome-extension://abcdef123456')
      .set('Access-Control-Request-Method', 'POST');
      
    expect(response.status).toBe(204);
    expect(response.headers['access-control-allow-origin']).toBeTruthy();
  });
  
  it('blocks unauthorized origins', async () => {
    const response = await request(app)
      .post('/api/v1/chat/new')
      .set('Origin', 'https://malicious.com');
      
    expect(response.status).toBe(403);
  });
});
```

## References
- [MDN CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Chrome Extension Security](https://developer.chrome.com/docs/extensions/mv3/security/)
- Eva's Extension Requirements
- Dana's CSP Configuration

---
*Architecture Decision Record by Sam the Scribe*
*Reviewed by Aria the Architect*