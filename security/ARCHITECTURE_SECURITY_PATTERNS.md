# Security Patterns for Domain-Driven Architecture

**Version**: 2.0.0  
**Date**: July 18, 2025  
**Classification**: Internal Use

---

## 🛡️ Overview

This document outlines security patterns and best practices for the Semantest domain-driven architecture. Security is implemented at multiple layers with clear boundaries and responsibilities.

## 🏗️ Security Architecture Layers

### Layer 1: Domain Security
- **Pure Domain Logic**: Security-agnostic business rules
- **Domain Events**: Carry security metadata but no enforcement
- **Value Objects**: Input validation and sanitization
- **Domain Services**: Business rule validation

### Layer 2: Application Security
- **Authentication**: User identity verification
- **Authorization**: Access control to use cases
- **Input Validation**: Application-level validation
- **Rate Limiting**: Application-level throttling

### Layer 3: Infrastructure Security
- **Network Security**: TLS, firewall rules
- **Data Protection**: Encryption at rest and in transit
- **Audit Logging**: Security event monitoring
- **Session Management**: Secure session handling

---

## 🔐 Domain Security Patterns

### 1. Security-Aware Domain Events

```typescript
// Domain events carry security context
export class GoogleImageDownloadRequested extends BaseDomainEvent {
  constructor(
    public readonly imageUrl: string,
    public readonly searchQuery: string,
    public readonly options: DownloadOptions,
    correlationId?: string,
    // Security metadata
    public readonly securityContext?: {
      userId: string;
      sessionId: string;
      ipAddress: string;
      userAgent: string;
    }
  ) {
    super('google-images-download', correlationId);
  }
  
  validate(): boolean {
    // Business validation only
    return !!this.imageUrl && !!this.searchQuery;
  }
  
  // Security validation in separate method
  validateSecurity(): boolean {
    return this.securityContext?.userId !== undefined;
  }
}
```

### 2. Secure Value Objects

```typescript
// Value objects with built-in validation
export class ImageUrl {
  private readonly value: string;
  
  constructor(url: string) {
    if (!this.isValidUrl(url)) {
      throw new ValidationError('imageUrl', url, 'Must be valid HTTPS URL');
    }
    
    if (!this.isAllowedDomain(url)) {
      throw new SecurityError('imageUrl', url, 'Domain not in allowlist');
    }
    
    this.value = this.sanitizeUrl(url);
  }
  
  private isValidUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }
  
  private isAllowedDomain(url: string): boolean {
    const allowedDomains = [
      'images.google.com',
      'lh3.googleusercontent.com',
      'encrypted-tbn0.gstatic.com'
    ];
    
    const domain = new URL(url).hostname;
    return allowedDomains.includes(domain);
  }
  
  private sanitizeUrl(url: string): string {
    // Remove tracking parameters
    const parsed = new URL(url);
    parsed.searchParams.delete('utm_source');
    parsed.searchParams.delete('utm_medium');
    return parsed.toString();
  }
}
```

### 3. Domain Service Security

```typescript
// Domain services with security validation
export class ImageDownloadSecurityService {
  validateDownloadRequest(request: GoogleImageDownloadRequested): SecurityValidationResult {
    const results: SecurityCheck[] = [];
    
    // URL security check
    results.push(this.validateImageUrl(request.imageUrl));
    
    // Content policy check
    results.push(this.validateContentPolicy(request.searchQuery));
    
    // Size/resource limits
    results.push(this.validateResourceLimits(request.options));
    
    return {
      isValid: results.every(r => r.passed),
      checks: results,
      riskScore: this.calculateRiskScore(results)
    };
  }
  
  private validateImageUrl(url: string): SecurityCheck {
    try {
      const imageUrl = new ImageUrl(url);
      return { name: 'url_validation', passed: true };
    } catch (error) {
      return { 
        name: 'url_validation', 
        passed: false, 
        reason: error.message 
      };
    }
  }
  
  private validateContentPolicy(query: string): SecurityCheck {
    const forbiddenTerms = ['adult', 'explicit', 'violence'];
    const hasForbiddenContent = forbiddenTerms.some(term => 
      query.toLowerCase().includes(term)
    );
    
    return {
      name: 'content_policy',
      passed: !hasForbiddenContent,
      reason: hasForbiddenContent ? 'Contains forbidden content' : undefined
    };
  }
}
```

---

## 🔑 Application Security Patterns

### 1. Authentication Service

```typescript
// Application-layer authentication
export class AuthenticationService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
    private readonly auditService: AuditService
  ) {}
  
  async authenticateUser(credentials: LoginCredentials): Promise<AuthenticationResult> {
    // Rate limiting
    await this.enforceRateLimit(credentials.email);
    
    // Validate credentials
    const user = await this.validateCredentials(credentials);
    if (!user) {
      await this.auditService.recordFailedLogin(credentials.email);
      throw new AuthenticationError('Invalid credentials');
    }
    
    // Generate session
    const token = await this.tokenService.generateToken(user);
    const session = await this.createSession(user, token);
    
    // Audit successful login
    await this.auditService.recordSuccessfulLogin(user.id, session.id);
    
    return {
      user,
      token,
      session,
      expiresAt: session.expiresAt
    };
  }
  
  private async validateCredentials(credentials: LoginCredentials): Promise<User | null> {
    const user = await this.userRepository.findByEmail(credentials.email);
    if (!user) return null;
    
    const isValid = await this.verifyPassword(credentials.password, user.passwordHash);
    return isValid ? user : null;
  }
  
  private async enforceRateLimit(email: string): Promise<void> {
    const attempts = await this.getRecentLoginAttempts(email);
    if (attempts >= 5) {
      throw new RateLimitError('Too many login attempts');
    }
  }
}
```

### 2. Authorization Service

```typescript
// Application-layer authorization
export class AuthorizationService {
  constructor(
    private readonly permissionRepository: PermissionRepository,
    private readonly roleRepository: RoleRepository
  ) {}
  
  async authorizeAction(
    userId: string,
    action: string,
    resource: string,
    context?: AuthorizationContext
  ): Promise<boolean> {
    // Get user permissions
    const userPermissions = await this.getUserPermissions(userId);
    
    // Check direct permission
    if (userPermissions.includes(`${action}:${resource}`)) {
      return true;
    }
    
    // Check role-based permission
    const userRoles = await this.getUserRoles(userId);
    for (const role of userRoles) {
      const rolePermissions = await this.getRolePermissions(role);
      if (rolePermissions.includes(`${action}:${resource}`)) {
        return true;
      }
    }
    
    // Check context-based permission
    if (context) {
      return this.checkContextualPermission(userId, action, resource, context);
    }
    
    return false;
  }
  
  private async checkContextualPermission(
    userId: string,
    action: string,
    resource: string,
    context: AuthorizationContext
  ): Promise<boolean> {
    // Owner-based access
    if (context.resourceOwnerId === userId) {
      return this.checkOwnerPermission(action, resource);
    }
    
    // Project-based access
    if (context.projectId) {
      const isProjectMember = await this.isProjectMember(userId, context.projectId);
      if (isProjectMember) {
        return this.checkProjectPermission(action, resource);
      }
    }
    
    return false;
  }
}
```

### 3. Security Middleware

```typescript
// Express middleware for security
export function createSecurityMiddleware(
  authService: AuthenticationService,
  authzService: AuthorizationService
) {
  return {
    // Authentication middleware
    authenticate: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const token = extractToken(req);
        if (!token) {
          return res.status(401).json({ error: 'No token provided' });
        }
        
        const session = await authService.validateToken(token);
        if (!session) {
          return res.status(401).json({ error: 'Invalid token' });
        }
        
        req.user = session.user;
        req.session = session;
        next();
      } catch (error) {
        res.status(401).json({ error: 'Authentication failed' });
      }
    },
    
    // Authorization middleware
    authorize: (action: string, resource: string) => {
      return async (req: Request, res: Response, next: NextFunction) => {
        try {
          const authorized = await authzService.authorizeAction(
            req.user.id,
            action,
            resource,
            {
              resourceOwnerId: req.params.userId,
              projectId: req.params.projectId
            }
          );
          
          if (!authorized) {
            return res.status(403).json({ error: 'Forbidden' });
          }
          
          next();
        } catch (error) {
          res.status(403).json({ error: 'Authorization failed' });
        }
      };
    }
  };
}
```

---

## 🔒 Infrastructure Security Patterns

### 1. Data Encryption

```typescript
// Encryption service
export class EncryptionService {
  constructor(
    private readonly encryptionKey: string,
    private readonly signingKey: string
  ) {}
  
  async encryptSensitiveData(data: string): Promise<EncryptedData> {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-gcm', this.encryptionKey, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      algorithm: 'aes-256-gcm'
    };
  }
  
  async decryptSensitiveData(encryptedData: EncryptedData): Promise<string> {
    const decipher = crypto.createDecipher(
      encryptedData.algorithm,
      this.encryptionKey,
      Buffer.from(encryptedData.iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
  
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  }
  
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
```

### 2. Audit Logging

```typescript
// Security audit service
export class SecurityAuditService {
  constructor(
    private readonly auditRepository: AuditRepository,
    private readonly alertService: AlertService
  ) {}
  
  async recordSecurityEvent(event: SecurityEvent): Promise<void> {
    const auditEntry = new AuditEntry({
      id: crypto.randomUUID(),
      timestamp: new Date(),
      eventType: event.type,
      userId: event.userId,
      sessionId: event.sessionId,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      action: event.action,
      resource: event.resource,
      outcome: event.outcome,
      riskScore: event.riskScore,
      metadata: event.metadata
    });
    
    await this.auditRepository.save(auditEntry);
    
    // Alert on high-risk events
    if (event.riskScore >= 0.8) {
      await this.alertService.sendSecurityAlert(event);
    }
  }
  
  async detectAnomalies(userId: string, timeWindow: number = 3600): Promise<SecurityAnomaly[]> {
    const recentEvents = await this.auditRepository.findRecentEvents(userId, timeWindow);
    const anomalies: SecurityAnomaly[] = [];
    
    // Detect unusual login patterns
    const loginEvents = recentEvents.filter(e => e.eventType === 'login');
    const uniqueIPs = new Set(loginEvents.map(e => e.ipAddress));
    
    if (uniqueIPs.size > 3) {
      anomalies.push({
        type: 'multiple_ip_logins',
        severity: 'high',
        description: `User logged in from ${uniqueIPs.size} different IP addresses`,
        evidence: Array.from(uniqueIPs)
      });
    }
    
    // Detect unusual download patterns
    const downloadEvents = recentEvents.filter(e => e.action === 'download');
    if (downloadEvents.length > 100) {
      anomalies.push({
        type: 'excessive_downloads',
        severity: 'medium',
        description: `User performed ${downloadEvents.length} downloads in ${timeWindow} seconds`,
        evidence: downloadEvents.slice(0, 10)
      });
    }
    
    return anomalies;
  }
}
```

### 3. Network Security

```typescript
// Network security configuration
export class NetworkSecurityConfig {
  static createSecurityHeaders(): SecurityHeaders {
    return {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https://images.google.com https://lh3.googleusercontent.com",
        "connect-src 'self'",
        "font-src 'self'",
        "object-src 'none'",
        "media-src 'self'",
        "frame-src 'none'"
      ].join('; ')
    };
  }
  
  static createCorsConfig(): CorsConfig {
    return {
      origin: (origin, callback) => {
        const allowedOrigins = [
          'https://semantest.com',
          'https://app.semantest.com',
          'https://localhost:3000' // Development only
        ];
        
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      exposedHeaders: ['X-Total-Count'],
      maxAge: 86400 // 24 hours
    };
  }
}
```

---

## 🚨 Security Monitoring

### 1. Real-time Threat Detection

```typescript
// Threat detection service
export class ThreatDetectionService {
  constructor(
    private readonly auditService: SecurityAuditService,
    private readonly alertService: AlertService,
    private readonly blacklistService: BlacklistService
  ) {}
  
  async analyzeRequest(request: SecurityRequest): Promise<ThreatAnalysis> {
    const analysis = new ThreatAnalysis();
    
    // Check IP reputation
    const ipThreat = await this.checkIpReputation(request.ipAddress);
    analysis.addCheck('ip_reputation', ipThreat);
    
    // Check request patterns
    const patternThreat = await this.checkRequestPatterns(request);
    analysis.addCheck('request_patterns', patternThreat);
    
    // Check user behavior
    const behaviorThreat = await this.checkUserBehavior(request);
    analysis.addCheck('user_behavior', behaviorThreat);
    
    // Calculate overall risk score
    analysis.calculateRiskScore();
    
    // Take action based on risk score
    if (analysis.riskScore >= 0.9) {
      await this.blockRequest(request);
    } else if (analysis.riskScore >= 0.7) {
      await this.flagRequest(request);
    }
    
    return analysis;
  }
  
  private async checkIpReputation(ipAddress: string): Promise<ThreatCheck> {
    // Check against known bad IPs
    const isBlacklisted = await this.blacklistService.isBlacklisted(ipAddress);
    if (isBlacklisted) {
      return { severity: 'high', description: 'IP is blacklisted' };
    }
    
    // Check geolocation
    const location = await this.getIpLocation(ipAddress);
    if (location.country === 'XX') { // Suspicious country
      return { severity: 'medium', description: 'Suspicious geolocation' };
    }
    
    return { severity: 'low', description: 'IP appears legitimate' };
  }
  
  private async checkRequestPatterns(request: SecurityRequest): Promise<ThreatCheck> {
    const recentRequests = await this.auditService.getRecentRequests(
      request.ipAddress,
      300 // 5 minutes
    );
    
    // Check for rate limiting violations
    if (recentRequests.length > 100) {
      return { severity: 'high', description: 'Excessive request rate' };
    }
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /[<>\"']/,  // XSS attempts
      /union.*select/i,  // SQL injection
      /\.\./,  // Path traversal
    ];
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(request.url) || pattern.test(request.body)) {
        return { severity: 'high', description: 'Suspicious request pattern' };
      }
    }
    
    return { severity: 'low', description: 'Request patterns appear normal' };
  }
}
```

### 2. Automated Response System

```typescript
// Security response automation
export class SecurityResponseService {
  constructor(
    private readonly blacklistService: BlacklistService,
    private readonly sessionService: SessionService,
    private readonly notificationService: NotificationService
  ) {}
  
  async respondToThreat(threat: ThreatAnalysis): Promise<SecurityResponse> {
    const response = new SecurityResponse();
    
    switch (threat.severity) {
      case 'critical':
        response.actions.push(await this.blockUserPermanently(threat.userId));
        response.actions.push(await this.blacklistIP(threat.ipAddress));
        response.actions.push(await this.alertSecurityTeam(threat));
        break;
        
      case 'high':
        response.actions.push(await this.blockUserTemporarily(threat.userId, 3600));
        response.actions.push(await this.requireMFA(threat.userId));
        response.actions.push(await this.notifyUser(threat.userId));
        break;
        
      case 'medium':
        response.actions.push(await this.flagUser(threat.userId));
        response.actions.push(await this.increaseMonitoring(threat.userId));
        break;
        
      case 'low':
        response.actions.push(await this.logIncident(threat));
        break;
    }
    
    return response;
  }
  
  private async blockUserPermanently(userId: string): Promise<SecurityAction> {
    await this.sessionService.terminateAllSessions(userId);
    await this.blacklistService.blockUser(userId, 'permanent');
    
    return {
      type: 'block_user',
      target: userId,
      duration: 'permanent',
      reason: 'Critical security threat detected'
    };
  }
  
  private async requireMFA(userId: string): Promise<SecurityAction> {
    await this.sessionService.flagForMFA(userId);
    
    return {
      type: 'require_mfa',
      target: userId,
      reason: 'Additional authentication required'
    };
  }
}
```

---

## 🔄 Security Testing Patterns

### 1. Security Unit Tests

```typescript
// Security-focused unit tests
describe('SecurityValidation', () => {
  describe('ImageUrl validation', () => {
    test('should reject non-HTTPS URLs', () => {
      expect(() => new ImageUrl('http://example.com/image.jpg'))
        .toThrow('Must be valid HTTPS URL');
    });
    
    test('should reject URLs from disallowed domains', () => {
      expect(() => new ImageUrl('https://malicious.com/image.jpg'))
        .toThrow('Domain not in allowlist');
    });
    
    test('should sanitize tracking parameters', () => {
      const url = new ImageUrl('https://images.google.com/image.jpg?utm_source=test');
      expect(url.toString()).not.toContain('utm_source');
    });
  });
  
  describe('Authentication', () => {
    test('should enforce rate limiting', async () => {
      const authService = new AuthenticationService(mockUserRepo, mockTokenService, mockAuditService);
      
      // Simulate multiple failed attempts
      for (let i = 0; i < 5; i++) {
        try {
          await authService.authenticateUser({ email: 'test@example.com', password: 'wrong' });
        } catch (error) {
          // Expected to fail
        }
      }
      
      // 6th attempt should be rate limited
      await expect(authService.authenticateUser({ email: 'test@example.com', password: 'correct' }))
        .rejects.toThrow('Too many login attempts');
    });
  });
});
```

### 2. Security Integration Tests

```typescript
// Security integration tests
describe('Cross-module security', () => {
  test('should enforce domain boundaries', async () => {
    // Attempt to access images domain from chatgpt domain
    const chatgptService = new ChatGPTApplication(mockRepos);
    
    // This should fail due to domain boundary enforcement
    await expect(chatgptService.accessImageDownload('download-123'))
      .rejects.toThrow('Cross-domain access not allowed');
  });
  
  test('should validate event security context', async () => {
    const eventBus = new EventBus();
    const securityService = new SecurityService();
    
    // Event without security context should be rejected
    const event = new GoogleImageDownloadRequested(
      'https://images.google.com/image.jpg',
      'test query',
      { quality: 'high' }
      // No security context
    );
    
    await expect(eventBus.publish(event))
      .rejects.toThrow('Security context required');
  });
});
```

---

## 📋 Security Checklist

### Pre-deployment Security Checks

- [ ] **Authentication**: All endpoints require valid authentication
- [ ] **Authorization**: Role-based access control implemented
- [ ] **Input Validation**: All user inputs validated and sanitized
- [ ] **Output Encoding**: All outputs properly encoded
- [ ] **SQL Injection**: Parameterized queries used
- [ ] **XSS Prevention**: Content Security Policy implemented
- [ ] **CSRF Protection**: CSRF tokens on state-changing operations
- [ ] **Rate Limiting**: API rate limiting implemented
- [ ] **Encryption**: Sensitive data encrypted at rest and in transit
- [ ] **Audit Logging**: Security events logged and monitored
- [ ] **Error Handling**: No sensitive information in error messages
- [ ] **Session Management**: Secure session handling
- [ ] **Dependency Scanning**: All dependencies scanned for vulnerabilities
- [ ] **Security Headers**: Appropriate security headers set
- [ ] **HTTPS**: All communication over HTTPS

### Runtime Security Monitoring

- [ ] **Anomaly Detection**: Unusual behavior patterns detected
- [ ] **Threat Intelligence**: Known threats blocked
- [ ] **Incident Response**: Automated response to threats
- [ ] **Compliance Monitoring**: Regulatory compliance maintained
- [ ] **Performance Impact**: Security measures don't impact performance
- [ ] **Alerting**: Critical security events trigger alerts
- [ ] **Forensics**: Detailed logs for incident investigation

---

**Security Documentation Version**: 2.0.0  
**Classification**: Internal Use  
**Last Updated**: July 18, 2025  
**Next Review**: August 18, 2025