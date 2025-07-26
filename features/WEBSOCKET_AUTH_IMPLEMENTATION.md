# WebSocket Authentication Implementation for Semantest

## Overview

This document provides a comprehensive implementation guide for modern WebSocket authentication in the Semantest project, following 2025 best practices. The implementation focuses on security, performance, and maintainability while supporting long-lived connections with automatic token refresh.

## Authentication Architecture

### 1. Token-Based Authentication (JWT)

#### Client-Side WebSocket Adapter with Authentication

```typescript
// infrastructure/src/infrastructure/semantic-automation/authenticated-websocket-communication.adapter.ts

import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { Event } from '@typescript-eda/domain';
import { WebSocketCommunicationAdapter, WebSocketMessage, ConnectionState } from './websocket-communication.adapter';

export interface AuthenticationConfig {
  getAccessToken: () => Promise<string | null>;
  refreshToken: () => Promise<{ accessToken: string; expiresIn: number }>;
  onAuthError?: (error: Error) => void;
}

export interface AuthenticatedWebSocketMessage extends WebSocketMessage {
  auth?: {
    token?: string;
    sessionId?: string;
  };
}

/**
 * Enhanced WebSocket adapter with JWT authentication support
 * Implements automatic token refresh and secure authentication flow
 */
export class AuthenticatedWebSocketCommunicationAdapter extends WebSocketCommunicationAdapter {
  private authConfig: AuthenticationConfig;
  private currentToken: string | null = null;
  private tokenExpiryTime: number | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;
  private isAuthenticated = false;
  private sessionId: string = uuidv4();
  private authRetryCount = 0;
  private readonly maxAuthRetries = 3;

  constructor(
    url: string,
    authConfig: AuthenticationConfig,
    protocols?: string | string[]
  ) {
    super(url, protocols);
    this.authConfig = authConfig;
  }

  /**
   * Override connect to include authentication
   */
  async connect(): Promise<void> {
    // Get initial token
    const token = await this.authConfig.getAccessToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    this.currentToken = token;
    
    // Connect to WebSocket
    await super.connect();
    
    // Authenticate after connection
    await this.authenticate();
    
    // Setup token refresh
    this.setupTokenRefresh();
  }

  /**
   * Authenticate the WebSocket connection
   */
  private async authenticate(): Promise<void> {
    if (!this.currentToken) {
      throw new Error('No token available for authentication');
    }

    return new Promise((resolve, reject) => {
      const authTimeout = setTimeout(() => {
        reject(new Error('Authentication timeout'));
      }, 10000);

      // Register one-time handler for auth response
      this.once('authentication_success', () => {
        clearTimeout(authTimeout);
        this.isAuthenticated = true;
        this.authRetryCount = 0;
        resolve();
      });

      this.once('authentication_error', (error) => {
        clearTimeout(authTimeout);
        this.handleAuthError(error);
        reject(new Error(error.message || 'Authentication failed'));
      });

      // Send authentication message
      this.send({
        type: 'authenticate',
        payload: {
          token: this.currentToken,
          sessionId: this.sessionId,
          extensionId: this.getExtensionId(),
          timestamp: new Date().toISOString()
        }
      });
    });
  }

  /**
   * Handle authentication errors with retry logic
   */
  private async handleAuthError(error: any): Promise<void> {
    console.error('Authentication error:', error);
    
    if (this.authRetryCount < this.maxAuthRetries) {
      this.authRetryCount++;
      
      try {
        // Try to refresh token
        const tokenData = await this.authConfig.refreshToken();
        this.currentToken = tokenData.accessToken;
        this.tokenExpiryTime = Date.now() + (tokenData.expiresIn * 1000);
        
        // Retry authentication
        await this.authenticate();
      } catch (refreshError) {
        this.authConfig.onAuthError?.(refreshError as Error);
        this.disconnect();
      }
    } else {
      this.authConfig.onAuthError?.(new Error('Max authentication retries exceeded'));
      this.disconnect();
    }
  }

  /**
   * Setup automatic token refresh
   */
  private setupTokenRefresh(): void {
    // Clear existing timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    // Calculate refresh time (5 minutes before expiry)
    const refreshBuffer = 5 * 60 * 1000; // 5 minutes
    const tokenLifetime = 15 * 60 * 1000; // 15 minutes (default)
    const refreshIn = tokenLifetime - refreshBuffer;

    this.refreshTimer = setTimeout(async () => {
      await this.refreshTokenAndReauthenticate();
    }, refreshIn);
  }

  /**
   * Refresh token and re-authenticate without closing connection
   */
  private async refreshTokenAndReauthenticate(): Promise<void> {
    try {
      console.log('Refreshing WebSocket authentication token...');
      
      // Get new token
      const tokenData = await this.authConfig.refreshToken();
      this.currentToken = tokenData.accessToken;
      this.tokenExpiryTime = Date.now() + (tokenData.expiresIn * 1000);
      
      // Re-authenticate with new token
      await this.authenticate();
      
      // Setup next refresh
      this.setupTokenRefresh();
      
      console.log('WebSocket token refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh WebSocket token:', error);
      this.authConfig.onAuthError?.(error as Error);
      
      // Attempt reconnection
      this.scheduleReconnect();
    }
  }

  /**
   * Override send to check authentication
   */
  send(message: WebSocketMessage): void {
    if (!this.isAuthenticated && message.type !== 'authenticate') {
      console.warn('Attempting to send message before authentication');
      this.messageQueue.push(message);
      return;
    }

    super.send(message);
  }

  /**
   * Override disconnect to cleanup auth state
   */
  disconnect(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    
    this.isAuthenticated = false;
    this.currentToken = null;
    this.tokenExpiryTime = null;
    
    super.disconnect();
  }

  /**
   * Get extension ID (could be from browser API or generated)
   */
  private getExtensionId(): string {
    // In browser extension context:
    // return chrome?.runtime?.id || 'unknown';
    
    // For other contexts, use a persistent ID
    return 'semantest-client-' + this.sessionId.substring(0, 8);
  }

  /**
   * Register one-time event handler
   */
  private once(event: string, handler: Function): void {
    const wrappedHandler = (data: any) => {
      handler(data);
      this.removeEventListener(event, wrappedHandler);
    };
    this.addEventListener(event, wrappedHandler);
  }

  /**
   * Remove event handler
   */
  private removeEventListener(event: string, handler: Function): void {
    const handlers = this.eventHandlers.get(event) || [];
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }
}
```

### 2. Server-Side Enhanced Authentication

#### Enhanced WebSocket Server Adapter

```typescript
// nodejs.server/src/coordination/adapters/enhanced-websocket-server-adapter.ts

import { WebSocket, Server as WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import { TokenManager } from '../../auth/infrastructure/token-manager';
import { RateLimitingService } from '../../security/rate-limiting-service';
import { AuditService } from '../../security/audit-service';
import { createWebSocketAuthHandler, AuthenticatedUser } from '../../auth/infrastructure/jwt-middleware';
import crypto from 'crypto';

export interface WebSocketAuthOptions {
  tokenManager: TokenManager;
  rateLimiter?: RateLimitingService;
  auditService?: AuditService;
  allowedOrigins?: string[];
  requireTLS?: boolean;
  maxConnectionsPerUser?: number;
  messageRateLimit?: {
    windowMs: number;
    maxMessages: number;
  };
}

export interface EnhancedExtensionConnection {
  connectionId: string;
  extensionId: string;
  websocket: WebSocket;
  connectedAt: Date;
  lastActivity: Date;
  messagesSent: number;
  messagesReceived: number;
  remoteAddress: string;
  userAgent: string;
  authenticated: boolean;
  user?: AuthenticatedUser;
  authenticationTime?: Date;
  messageRateLimit?: {
    count: number;
    resetTime: number;
  };
  origin?: string;
}

/**
 * Enhanced WebSocket server with comprehensive security features
 */
export class EnhancedWebSocketServerAdapter {
  private server?: WebSocketServer;
  private connections = new Map<string, EnhancedExtensionConnection>();
  private userConnections = new Map<string, Set<string>>(); // userId -> connectionIds
  private authHandler: ReturnType<typeof createWebSocketAuthHandler>;
  
  constructor(private options: WebSocketAuthOptions) {
    this.authHandler = createWebSocketAuthHandler(options.tokenManager);
  }

  /**
   * Start server with enhanced security
   */
  async startServer(port: number): Promise<void> {
    this.server = new WebSocketServer({
      port: port + 1,
      path: '/ws',
      verifyClient: this.verifyClient.bind(this),
      perMessageDeflate: {
        zlibDeflateOptions: {
          chunkSize: 1024,
          memLevel: 7,
          level: 3
        },
        zlibInflateOptions: {
          chunkSize: 10 * 1024
        },
        clientNoContextTakeover: true,
        serverNoContextTakeover: true,
        serverMaxWindowBits: 10,
        concurrencyLimit: 10,
        threshold: 1024
      }
    });

    this.setupServerListeners();
    console.log(`✅ Enhanced WebSocket server started on wss://localhost:${port + 1}/ws`);
  }

  /**
   * Enhanced client verification with multiple security checks
   */
  private async verifyClient(
    info: { origin: string; secure: boolean; req: IncomingMessage },
    callback: (result: boolean, code?: number, statusMessage?: string) => void
  ): Promise<void> {
    try {
      // 1. Origin validation
      if (this.options.allowedOrigins && this.options.allowedOrigins.length > 0) {
        if (!this.options.allowedOrigins.includes(info.origin)) {
          this.auditConnection('rejected', 'invalid_origin', { origin: info.origin });
          callback(false, 403, 'Origin not allowed');
          return;
        }
      }

      // 2. TLS check
      if (this.options.requireTLS && !info.secure) {
        this.auditConnection('rejected', 'insecure_connection', {});
        callback(false, 403, 'Secure connection required');
        return;
      }

      // 3. Rate limiting check
      const clientIp = this.getClientIp(info.req);
      if (this.options.rateLimiter) {
        const allowed = await this.options.rateLimiter.checkConnectionLimit(clientIp);
        if (!allowed) {
          this.auditConnection('rejected', 'rate_limit_exceeded', { ip: clientIp });
          callback(false, 429, 'Too many connections');
          return;
        }
      }

      // 4. Extract and verify token
      const token = this.extractToken(info.req);
      if (!token) {
        callback(false, 401, 'Authentication required');
        return;
      }

      const decoded = await this.options.tokenManager.verifyAccessToken(token);
      
      // 5. Check user connection limit
      if (this.options.maxConnectionsPerUser) {
        const userConnCount = this.userConnections.get(decoded.userId)?.size || 0;
        if (userConnCount >= this.options.maxConnectionsPerUser) {
          this.auditConnection('rejected', 'connection_limit_exceeded', { 
            userId: decoded.userId,
            currentConnections: userConnCount 
          });
          callback(false, 429, 'Connection limit exceeded');
          return;
        }
      }

      // All checks passed
      callback(true);
    } catch (error) {
      console.error('WebSocket verification failed:', error);
      callback(false, 401, 'Authentication failed');
    }
  }

  /**
   * Extract token from request
   */
  private extractToken(req: IncomingMessage): string | null {
    // 1. Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader) {
      return TokenManager.extractTokenFromHeader(authHeader);
    }

    // 2. Check cookie
    const cookies = this.parseCookies(req.headers.cookie || '');
    if (cookies.accessToken) {
      return cookies.accessToken;
    }

    // 3. Check query parameter (least secure, for backwards compatibility)
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    return url.searchParams.get('token');
  }

  /**
   * Handle new connection with post-connection authentication
   */
  private async handleNewConnection(websocket: WebSocket, request: IncomingMessage): Promise<void> {
    const connectionId = crypto.randomUUID();
    const remoteAddress = this.getClientIp(request);
    const userAgent = request.headers['user-agent'] || 'unknown';
    const origin = request.headers.origin;

    const connection: EnhancedExtensionConnection = {
      connectionId,
      extensionId: 'pending_auth',
      websocket,
      connectedAt: new Date(),
      lastActivity: new Date(),
      messagesSent: 0,
      messagesReceived: 0,
      remoteAddress,
      userAgent,
      authenticated: false,
      origin,
      messageRateLimit: this.options.messageRateLimit ? {
        count: 0,
        resetTime: Date.now() + this.options.messageRateLimit.windowMs
      } : undefined
    };

    // Setup listeners
    this.setupConnectionListeners(connection);

    // Store temporary connection
    this.connections.set(connectionId, connection);

    // Set authentication timeout
    const authTimeout = setTimeout(() => {
      if (!connection.authenticated) {
        console.log(`⏱️ Authentication timeout for connection ${connectionId}`);
        websocket.close(1008, 'Authentication timeout');
      }
    }, 30000); // 30 second timeout

    // Wait for authentication message
    websocket.once('message', async (data: WebSocket.Data) => {
      clearTimeout(authTimeout);
      await this.handleAuthenticationMessage(connection, data);
    });

    // Send authentication challenge
    this.sendMessage(connection, {
      type: 'authentication_required',
      connectionId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Handle authentication message
   */
  private async handleAuthenticationMessage(
    connection: EnhancedExtensionConnection, 
    data: WebSocket.Data
  ): Promise<void> {
    try {
      const message = JSON.parse(data.toString());
      
      if (message.type !== 'authenticate') {
        connection.websocket.close(1008, 'Authentication required');
        return;
      }

      const { token, sessionId, extensionId } = message.payload;
      
      // Verify token
      const decoded = await this.options.tokenManager.verifyAccessToken(token);
      
      // Create authenticated user
      const user: AuthenticatedUser = {
        userId: decoded.userId,
        extensionId: extensionId || decoded.extensionId,
        email: decoded.email,
        roles: decoded.roles || [],
        sessionId: sessionId || decoded.sessionId,
        tokenJTI: decoded.jti!,
        tokenExp: decoded.exp
      };

      // Update connection
      connection.authenticated = true;
      connection.user = user;
      connection.extensionId = extensionId || user.userId;
      connection.authenticationTime = new Date();

      // Update user connections map
      if (!this.userConnections.has(user.userId)) {
        this.userConnections.set(user.userId, new Set());
      }
      this.userConnections.get(user.userId)!.add(connection.connectionId);

      // Re-index connection with proper ID
      this.connections.delete(connection.connectionId);
      this.connections.set(connection.extensionId, connection);

      // Audit successful authentication
      this.auditConnection('authenticated', 'success', {
        userId: user.userId,
        extensionId: connection.extensionId,
        sessionId: user.sessionId
      });

      // Send success response
      this.sendMessage(connection, {
        type: 'authentication_success',
        connectionId: connection.connectionId,
        extensionId: connection.extensionId,
        userId: user.userId,
        sessionId: user.sessionId,
        timestamp: new Date().toISOString()
      });

      // Setup normal message handling
      connection.websocket.on('message', (data) => {
        this.handleMessage(connection, data);
      });

    } catch (error) {
      console.error('Authentication failed:', error);
      this.auditConnection('authentication_failed', 'error', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      connection.websocket.close(1008, 'Authentication failed');
    }
  }

  /**
   * Handle incoming messages with rate limiting
   */
  private async handleMessage(
    connection: EnhancedExtensionConnection, 
    data: WebSocket.Data
  ): Promise<void> {
    try {
      // Check message rate limit
      if (!this.checkMessageRateLimit(connection)) {
        this.sendErrorResponse(connection, 'Rate limit exceeded');
        return;
      }

      const message = JSON.parse(data.toString());
      connection.messagesReceived++;
      connection.lastActivity = new Date();

      // Message validation
      if (!this.validateMessage(message)) {
        this.sendErrorResponse(connection, 'Invalid message format');
        return;
      }

      // Handle different message types
      switch (message.type) {
        case 'heartbeat':
          this.handleHeartbeat(connection);
          break;
        
        case 're-authenticate':
          await this.handleReAuthentication(connection, message);
          break;
          
        default:
          // Route to application handlers
          this.routeMessage(connection, message);
      }

    } catch (error) {
      console.error('Message handling error:', error);
      this.sendErrorResponse(connection, 'Message processing failed');
    }
  }

  /**
   * Handle re-authentication for token refresh
   */
  private async handleReAuthentication(
    connection: EnhancedExtensionConnection,
    message: any
  ): Promise<void> {
    try {
      const { token } = message.payload;
      const decoded = await this.options.tokenManager.verifyAccessToken(token);
      
      // Update user info
      connection.user = {
        userId: decoded.userId,
        extensionId: connection.extensionId,
        email: decoded.email,
        roles: decoded.roles || [],
        sessionId: decoded.sessionId,
        tokenJTI: decoded.jti!,
        tokenExp: decoded.exp
      };
      
      connection.authenticationTime = new Date();
      
      this.sendMessage(connection, {
        type: 're-authentication_success',
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      this.sendErrorResponse(connection, 'Re-authentication failed');
    }
  }

  /**
   * Check message rate limit
   */
  private checkMessageRateLimit(connection: EnhancedExtensionConnection): boolean {
    if (!connection.messageRateLimit || !this.options.messageRateLimit) {
      return true;
    }

    const now = Date.now();
    
    // Reset window if expired
    if (now > connection.messageRateLimit.resetTime) {
      connection.messageRateLimit.count = 0;
      connection.messageRateLimit.resetTime = now + this.options.messageRateLimit.windowMs;
    }

    // Check limit
    if (connection.messageRateLimit.count >= this.options.messageRateLimit.maxMessages) {
      return false;
    }

    connection.messageRateLimit.count++;
    return true;
  }

  /**
   * Validate message structure
   */
  private validateMessage(message: any): boolean {
    return (
      message &&
      typeof message.type === 'string' &&
      message.type.length > 0 &&
      message.type.length < 100 &&
      (!message.payload || typeof message.payload === 'object')
    );
  }

  /**
   * Audit connection events
   */
  private auditConnection(event: string, result: string, details: any): void {
    if (this.options.auditService) {
      this.options.auditService.logSecurityEvent({
        event: `websocket_${event}`,
        result,
        details,
        timestamp: new Date()
      });
    }
  }

  /**
   * Get client IP address
   */
  private getClientIp(req: IncomingMessage): string {
    return (
      req.headers['x-forwarded-for']?.toString().split(',')[0] ||
      req.headers['x-real-ip']?.toString() ||
      req.socket.remoteAddress ||
      'unknown'
    );
  }

  /**
   * Parse cookies from header
   */
  private parseCookies(cookieHeader: string): Record<string, string> {
    const cookies: Record<string, string> = {};
    cookieHeader.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = decodeURIComponent(value);
      }
    });
    return cookies;
  }

  // ... rest of the implementation (message routing, cleanup, etc.)
}
```

### 3. Connection Upgrade Security

#### Secure WebSocket Upgrade Handler

```typescript
// nodejs.server/src/server/websocket-upgrade-handler.ts

import { IncomingMessage, ServerResponse } from 'http';
import { WebSocket } from 'ws';
import crypto from 'crypto';

export class WebSocketUpgradeHandler {
  private readonly WEBSOCKET_GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
  
  /**
   * Validate WebSocket upgrade request
   */
  validateUpgradeRequest(req: IncomingMessage): { valid: boolean; reason?: string } {
    // 1. Check upgrade header
    if (req.headers.upgrade !== 'websocket') {
      return { valid: false, reason: 'Invalid upgrade header' };
    }

    // 2. Check connection header
    const connection = req.headers.connection?.toLowerCase();
    if (!connection?.includes('upgrade')) {
      return { valid: false, reason: 'Invalid connection header' };
    }

    // 3. Check WebSocket version
    const version = req.headers['sec-websocket-version'];
    if (version !== '13') {
      return { valid: false, reason: 'Unsupported WebSocket version' };
    }

    // 4. Check WebSocket key
    const key = req.headers['sec-websocket-key'];
    if (!key || !this.isValidWebSocketKey(key)) {
      return { valid: false, reason: 'Invalid WebSocket key' };
    }

    // 5. Check origin (if configured)
    // This would be done in the verifyClient callback

    return { valid: true };
  }

  /**
   * Validate WebSocket key format
   */
  private isValidWebSocketKey(key: string): boolean {
    try {
      const decoded = Buffer.from(key, 'base64');
      return decoded.length === 16;
    } catch {
      return false;
    }
  }

  /**
   * Generate WebSocket accept header
   */
  generateAcceptHeader(key: string): string {
    return crypto
      .createHash('sha1')
      .update(key + this.WEBSOCKET_GUID)
      .digest('base64');
  }
}
```

### 4. Periodic Re-authentication

#### Token Refresh Manager

```typescript
// browser/src/security/websocket-token-refresh.ts

export class WebSocketTokenRefreshManager {
  private refreshTimer?: NodeJS.Timeout;
  private readonly REFRESH_BUFFER = 5 * 60 * 1000; // 5 minutes before expiry
  
  constructor(
    private tokenManager: {
      getTokenExpiry: () => number | null;
      refreshToken: () => Promise<{ accessToken: string; expiresIn: number }>;
    }
  ) {}

  /**
   * Start automatic token refresh
   */
  startAutoRefresh(onTokenRefreshed: (token: string) => void): void {
    this.scheduleNextRefresh(onTokenRefreshed);
  }

  /**
   * Schedule next token refresh
   */
  private scheduleNextRefresh(onTokenRefreshed: (token: string) => void): void {
    this.stopAutoRefresh();

    const expiry = this.tokenManager.getTokenExpiry();
    if (!expiry) return;

    const now = Date.now();
    const timeUntilExpiry = expiry - now;
    const refreshIn = Math.max(0, timeUntilExpiry - this.REFRESH_BUFFER);

    this.refreshTimer = setTimeout(async () => {
      try {
        const { accessToken, expiresIn } = await this.tokenManager.refreshToken();
        onTokenRefreshed(accessToken);
        
        // Schedule next refresh
        this.scheduleNextRefresh(onTokenRefreshed);
      } catch (error) {
        console.error('Token refresh failed:', error);
        // Implement retry logic or disconnect
      }
    }, refreshIn);
  }

  /**
   * Stop automatic refresh
   */
  stopAutoRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = undefined;
    }
  }
}
```

### 5. Origin Validation and CORS

#### CORS Configuration for WebSocket

```typescript
// nodejs.server/src/server/websocket-cors.ts

export interface WebSocketCORSOptions {
  allowedOrigins: string[];
  allowCredentials: boolean;
  maxAge?: number;
}

export class WebSocketCORS {
  constructor(private options: WebSocketCORSOptions) {}

  /**
   * Validate origin for WebSocket connection
   */
  validateOrigin(origin: string | undefined): boolean {
    if (!origin) return false;
    
    // Check exact match
    if (this.options.allowedOrigins.includes(origin)) {
      return true;
    }

    // Check wildcard patterns
    return this.options.allowedOrigins.some(allowed => {
      if (allowed === '*') return true;
      
      // Convert wildcard pattern to regex
      const pattern = allowed
        .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
        .replace(/\*/g, '.*');
      
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(origin);
    });
  }

  /**
   * Get CORS headers for preflight requests
   */
  getCORSHeaders(origin: string): Record<string, string> {
    const headers: Record<string, string> = {};

    if (this.validateOrigin(origin)) {
      headers['Access-Control-Allow-Origin'] = origin;
      
      if (this.options.allowCredentials) {
        headers['Access-Control-Allow-Credentials'] = 'true';
      }
      
      if (this.options.maxAge) {
        headers['Access-Control-Max-Age'] = this.options.maxAge.toString();
      }
    }

    return headers;
  }
}
```

### 6. TLS/WSS Configuration

#### Secure WebSocket Server Setup

```typescript
// nodejs.server/src/server/secure-websocket-server.ts

import { createServer as createHttpsServer } from 'https';
import { readFileSync } from 'fs';
import { WebSocketServer } from 'ws';

export interface TLSConfig {
  keyPath: string;
  certPath: string;
  caPath?: string;
  minVersion?: string;
  ciphers?: string;
}

export class SecureWebSocketServer {
  /**
   * Create secure WebSocket server with TLS
   */
  static create(port: number, tlsConfig: TLSConfig): WebSocketServer {
    const httpsServer = createHttpsServer({
      key: readFileSync(tlsConfig.keyPath),
      cert: readFileSync(tlsConfig.certPath),
      ca: tlsConfig.caPath ? readFileSync(tlsConfig.caPath) : undefined,
      minVersion: tlsConfig.minVersion || 'TLSv1.2',
      ciphers: tlsConfig.ciphers || [
        'ECDHE-RSA-AES128-GCM-SHA256',
        'ECDHE-RSA-AES256-GCM-SHA384',
        'ECDHE-RSA-AES128-SHA256',
        'ECDHE-RSA-AES256-SHA384'
      ].join(':')
    });

    const wss = new WebSocketServer({
      server: httpsServer,
      path: '/ws'
    });

    httpsServer.listen(port, () => {
      console.log(`🔐 Secure WebSocket server listening on wss://localhost:${port}/ws`);
    });

    return wss;
  }
}
```

### 7. Rate Limiting for WebSocket

#### WebSocket Rate Limiter

```typescript
// nodejs.server/src/security/websocket-rate-limiter.ts

import { RateLimitStore } from './rate-limit-stores';

export interface WebSocketRateLimitConfig {
  connectionLimit: {
    windowMs: number;
    max: number;
  };
  messageLimit: {
    windowMs: number;
    max: number;
  };
  authLimit: {
    windowMs: number;
    max: number;
  };
}

export class WebSocketRateLimiter {
  constructor(
    private store: RateLimitStore,
    private config: WebSocketRateLimitConfig
  ) {}

  /**
   * Check connection rate limit
   */
  async checkConnectionLimit(clientId: string): Promise<boolean> {
    const key = `ws_conn:${clientId}`;
    const { windowMs, max } = this.config.connectionLimit;
    
    const count = await this.store.increment(key, windowMs);
    return count <= max;
  }

  /**
   * Check message rate limit
   */
  async checkMessageLimit(connectionId: string): Promise<boolean> {
    const key = `ws_msg:${connectionId}`;
    const { windowMs, max } = this.config.messageLimit;
    
    const count = await this.store.increment(key, windowMs);
    return count <= max;
  }

  /**
   * Check authentication attempt limit
   */
  async checkAuthLimit(clientId: string): Promise<boolean> {
    const key = `ws_auth:${clientId}`;
    const { windowMs, max } = this.config.authLimit;
    
    const count = await this.store.increment(key, windowMs);
    return count <= max;
  }

  /**
   * Reset limits for a client
   */
  async resetLimits(clientId: string): Promise<void> {
    await Promise.all([
      this.store.reset(`ws_conn:${clientId}`),
      this.store.reset(`ws_auth:${clientId}`)
    ]);
  }
}
```

### 8. Message-Level Authentication

#### Authenticated Message Handler

```typescript
// nodejs.server/src/coordination/message-authenticator.ts

import { TokenManager } from '../auth/infrastructure/token-manager';
import crypto from 'crypto';

export interface AuthenticatedMessage {
  type: string;
  payload: any;
  auth: {
    signature: string;
    timestamp: number;
    nonce: string;
  };
}

export class MessageAuthenticator {
  constructor(
    private tokenManager: TokenManager,
    private maxClockSkew: number = 60000 // 1 minute
  ) {}

  /**
   * Sign a message
   */
  async signMessage(message: any, secret: string): Promise<AuthenticatedMessage> {
    const timestamp = Date.now();
    const nonce = crypto.randomBytes(16).toString('hex');
    
    const dataToSign = JSON.stringify({
      ...message,
      timestamp,
      nonce
    });

    const signature = crypto
      .createHmac('sha256', secret)
      .update(dataToSign)
      .digest('hex');

    return {
      ...message,
      auth: {
        signature,
        timestamp,
        nonce
      }
    };
  }

  /**
   * Verify message signature
   */
  async verifyMessage(
    message: AuthenticatedMessage, 
    secret: string
  ): Promise<boolean> {
    // Check timestamp
    const now = Date.now();
    const messageAge = now - message.auth.timestamp;
    
    if (Math.abs(messageAge) > this.maxClockSkew) {
      console.warn('Message timestamp outside acceptable range');
      return false;
    }

    // Recreate signature
    const dataToSign = JSON.stringify({
      type: message.type,
      payload: message.payload,
      timestamp: message.auth.timestamp,
      nonce: message.auth.nonce
    });

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(dataToSign)
      .digest('hex');

    // Constant-time comparison
    return crypto.timingSafeEqual(
      Buffer.from(message.auth.signature),
      Buffer.from(expectedSignature)
    );
  }
}
```

### 9. Connection State Management

#### WebSocket Connection Manager

```typescript
// nodejs.server/src/coordination/websocket-connection-manager.ts

import { EventEmitter } from 'events';

export enum ConnectionState {
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  AUTHENTICATED = 'AUTHENTICATED',
  DISCONNECTING = 'DISCONNECTING',
  DISCONNECTED = 'DISCONNECTED',
  ERROR = 'ERROR'
}

export interface ConnectionMetrics {
  connectedAt: Date;
  authenticatedAt?: Date;
  lastActivity: Date;
  messagesSent: number;
  messagesReceived: number;
  errors: number;
  latency: number[];
}

export class WebSocketConnectionManager extends EventEmitter {
  private connections = new Map<string, ConnectionInfo>();
  private stateTransitions = new Map<string, ConnectionState[]>();

  /**
   * Register new connection
   */
  registerConnection(connectionId: string, info: Partial<ConnectionInfo>): void {
    const connection: ConnectionInfo = {
      id: connectionId,
      state: ConnectionState.CONNECTING,
      metrics: {
        connectedAt: new Date(),
        lastActivity: new Date(),
        messagesSent: 0,
        messagesReceived: 0,
        errors: 0,
        latency: []
      },
      ...info
    };

    this.connections.set(connectionId, connection);
    this.recordStateTransition(connectionId, ConnectionState.CONNECTING);
    
    this.emit('connection:registered', connection);
  }

  /**
   * Update connection state
   */
  updateConnectionState(
    connectionId: string, 
    newState: ConnectionState
  ): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    const oldState = connection.state;
    connection.state = newState;
    
    this.recordStateTransition(connectionId, newState);
    
    // Update timestamps
    if (newState === ConnectionState.AUTHENTICATED) {
      connection.metrics.authenticatedAt = new Date();
    }

    this.emit('connection:stateChanged', {
      connectionId,
      oldState,
      newState,
      connection
    });
  }

  /**
   * Update connection metrics
   */
  updateMetrics(
    connectionId: string,
    update: Partial<ConnectionMetrics>
  ): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    Object.assign(connection.metrics, update);
    connection.metrics.lastActivity = new Date();
  }

  /**
   * Get connection health status
   */
  getConnectionHealth(connectionId: string): ConnectionHealth {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return { healthy: false, reason: 'Connection not found' };
    }

    const now = Date.now();
    const lastActivityAge = now - connection.metrics.lastActivity.getTime();
    
    // Check various health indicators
    if (connection.state === ConnectionState.ERROR) {
      return { healthy: false, reason: 'Connection in error state' };
    }

    if (lastActivityAge > 60000) { // 1 minute
      return { healthy: false, reason: 'Connection inactive' };
    }

    if (connection.metrics.errors > 10) {
      return { healthy: false, reason: 'Too many errors' };
    }

    const avgLatency = this.calculateAverageLatency(connection.metrics.latency);
    if (avgLatency > 1000) { // 1 second
      return { healthy: false, reason: 'High latency' };
    }

    return { healthy: true };
  }

  /**
   * Clean up dead connections
   */
  cleanupDeadConnections(maxInactivity: number = 300000): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [connectionId, connection] of this.connections) {
      const inactivityTime = now - connection.metrics.lastActivity.getTime();
      
      if (
        connection.state === ConnectionState.DISCONNECTED ||
        (connection.state !== ConnectionState.AUTHENTICATED && inactivityTime > 60000) ||
        inactivityTime > maxInactivity
      ) {
        this.removeConnection(connectionId);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Remove connection
   */
  private removeConnection(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    this.connections.delete(connectionId);
    this.stateTransitions.delete(connectionId);
    
    this.emit('connection:removed', connection);
  }

  /**
   * Record state transition
   */
  private recordStateTransition(
    connectionId: string, 
    state: ConnectionState
  ): void {
    const transitions = this.stateTransitions.get(connectionId) || [];
    transitions.push(state);
    
    // Keep last 10 transitions
    if (transitions.length > 10) {
      transitions.shift();
    }
    
    this.stateTransitions.set(connectionId, transitions);
  }

  /**
   * Calculate average latency
   */
  private calculateAverageLatency(latencies: number[]): number {
    if (latencies.length === 0) return 0;
    
    const sum = latencies.reduce((a, b) => a + b, 0);
    return sum / latencies.length;
  }

  /**
   * Get connection statistics
   */
  getStatistics(): ConnectionStatistics {
    const states = new Map<ConnectionState, number>();
    let totalMessages = 0;
    let totalErrors = 0;

    for (const connection of this.connections.values()) {
      const count = states.get(connection.state) || 0;
      states.set(connection.state, count + 1);
      
      totalMessages += connection.metrics.messagesSent + connection.metrics.messagesReceived;
      totalErrors += connection.metrics.errors;
    }

    return {
      total: this.connections.size,
      byState: Object.fromEntries(states),
      totalMessages,
      totalErrors,
      timestamp: new Date()
    };
  }
}

// Supporting interfaces
interface ConnectionInfo {
  id: string;
  state: ConnectionState;
  userId?: string;
  extensionId?: string;
  metrics: ConnectionMetrics;
}

interface ConnectionHealth {
  healthy: boolean;
  reason?: string;
}

interface ConnectionStatistics {
  total: number;
  byState: Record<string, number>;
  totalMessages: number;
  totalErrors: number;
  timestamp: Date;
}
```

### 10. Graceful Disconnection and Reconnection

#### Reconnection Manager

```typescript
// browser/src/security/websocket-reconnection-manager.ts

export interface ReconnectionConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
}

export class WebSocketReconnectionManager {
  private attemptCount = 0;
  private reconnectTimer?: NodeJS.Timeout;
  private isReconnecting = false;

  constructor(
    private config: ReconnectionConfig = {
      maxAttempts: 5,
      initialDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 2,
      jitter: true
    }
  ) {}

  /**
   * Schedule reconnection attempt
   */
  scheduleReconnect(
    onReconnect: () => Promise<void>,
    onGiveUp?: () => void
  ): void {
    if (this.isReconnecting) return;

    if (this.attemptCount >= this.config.maxAttempts) {
      console.error('Max reconnection attempts reached');
      onGiveUp?.();
      return;
    }

    this.isReconnecting = true;
    this.attemptCount++;

    const delay = this.calculateDelay();
    console.log(`Scheduling reconnection attempt ${this.attemptCount}/${this.config.maxAttempts} in ${delay}ms`);

    this.reconnectTimer = setTimeout(async () => {
      try {
        await onReconnect();
        // Success - reset state
        this.reset();
      } catch (error) {
        console.error('Reconnection attempt failed:', error);
        this.isReconnecting = false;
        // Schedule next attempt
        this.scheduleReconnect(onReconnect, onGiveUp);
      }
    }, delay);
  }

  /**
   * Calculate reconnection delay with exponential backoff
   */
  private calculateDelay(): number {
    let delay = this.config.initialDelay * 
      Math.pow(this.config.backoffMultiplier, this.attemptCount - 1);

    // Cap at max delay
    delay = Math.min(delay, this.config.maxDelay);

    // Add jitter to prevent thundering herd
    if (this.config.jitter) {
      const jitter = delay * 0.2 * (Math.random() - 0.5);
      delay += jitter;
    }

    return Math.floor(delay);
  }

  /**
   * Cancel reconnection
   */
  cancel(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }
    this.isReconnecting = false;
  }

  /**
   * Reset reconnection state
   */
  reset(): void {
    this.cancel();
    this.attemptCount = 0;
  }

  /**
   * Get current attempt count
   */
  getAttemptCount(): number {
    return this.attemptCount;
  }

  /**
   * Check if currently reconnecting
   */
  isCurrentlyReconnecting(): boolean {
    return this.isReconnecting;
  }
}

/**
 * Graceful disconnection handler
 */
export class GracefulDisconnectionHandler {
  /**
   * Perform graceful disconnection
   */
  static async disconnect(
    websocket: WebSocket,
    options: {
      timeout?: number;
      reason?: string;
      code?: number;
    } = {}
  ): Promise<void> {
    const { 
      timeout = 5000, 
      reason = 'Client disconnect', 
      code = 1000 
    } = options;

    return new Promise((resolve) => {
      let timeoutHandle: NodeJS.Timeout;

      // Set up close handler
      const onClose = () => {
        clearTimeout(timeoutHandle);
        resolve();
      };

      websocket.once('close', onClose);

      // Send close frame
      websocket.close(code, reason);

      // Timeout fallback
      timeoutHandle = setTimeout(() => {
        websocket.removeListener('close', onClose);
        websocket.terminate();
        resolve();
      }, timeout);
    });
  }
}
```

## Integration Example

### Complete Client Setup

```typescript
// browser/src/websocket-client-setup.ts

import { AuthenticatedWebSocketCommunicationAdapter } from './authenticated-websocket-communication.adapter';
import { WebSocketTokenRefreshManager } from './websocket-token-refresh';
import { WebSocketReconnectionManager } from './websocket-reconnection-manager';

export class SecureWebSocketClient {
  private adapter?: AuthenticatedWebSocketCommunicationAdapter;
  private tokenRefreshManager?: WebSocketTokenRefreshManager;
  private reconnectionManager?: WebSocketReconnectionManager;

  async connect(config: {
    url: string;
    tokenManager: any;
    onMessage: (message: any) => void;
    onError?: (error: Error) => void;
  }): Promise<void> {
    // Create adapter with auth config
    this.adapter = new AuthenticatedWebSocketCommunicationAdapter(
      config.url,
      {
        getAccessToken: () => config.tokenManager.getAccessToken(),
        refreshToken: () => config.tokenManager.refreshToken(),
        onAuthError: (error) => {
          console.error('WebSocket auth error:', error);
          config.onError?.(error);
        }
      }
    );

    // Setup token refresh
    this.tokenRefreshManager = new WebSocketTokenRefreshManager(config.tokenManager);
    this.tokenRefreshManager.startAutoRefresh((newToken) => {
      console.log('WebSocket token refreshed');
    });

    // Setup reconnection manager
    this.reconnectionManager = new WebSocketReconnectionManager();

    // Setup event handlers
    this.adapter.addEventListener('message', config.onMessage);
    this.adapter.addEventListener('disconnected', () => {
      this.reconnectionManager.scheduleReconnect(
        () => this.adapter!.connect(),
        () => config.onError?.(new Error('Failed to reconnect'))
      );
    });

    // Connect
    await this.adapter.connect();
  }

  async disconnect(): Promise<void> {
    this.tokenRefreshManager?.stopAutoRefresh();
    this.reconnectionManager?.cancel();
    this.adapter?.disconnect();
  }

  send(message: any): void {
    this.adapter?.send(message);
  }
}
```

### Server Setup

```typescript
// nodejs.server/src/websocket-server-setup.ts

import { EnhancedWebSocketServerAdapter } from './enhanced-websocket-server-adapter';
import { TokenManager } from './auth/infrastructure/token-manager';
import { RateLimitingService } from './security/rate-limiting-service';
import { AuditService } from './security/audit-service';
import { WebSocketConnectionManager } from './websocket-connection-manager';

export async function setupSecureWebSocketServer(port: number): Promise<void> {
  // Initialize dependencies
  const tokenManager = new TokenManager();
  const rateLimiter = new RateLimitingService();
  const auditService = new AuditService();
  const connectionManager = new WebSocketConnectionManager();

  // Create server adapter
  const wsAdapter = new EnhancedWebSocketServerAdapter({
    tokenManager,
    rateLimiter,
    auditService,
    allowedOrigins: [
      'https://semantest.com',
      'chrome-extension://*',
      process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : ''
    ].filter(Boolean),
    requireTLS: process.env.NODE_ENV === 'production',
    maxConnectionsPerUser: 5,
    messageRateLimit: {
      windowMs: 60000, // 1 minute
      maxMessages: 100
    }
  });

  // Start server
  await wsAdapter.startServer(port);

  // Setup connection monitoring
  setInterval(() => {
    const stats = connectionManager.getStatistics();
    console.log('WebSocket statistics:', stats);
    
    // Cleanup dead connections
    const cleaned = connectionManager.cleanupDeadConnections();
    if (cleaned > 0) {
      console.log(`Cleaned up ${cleaned} dead connections`);
    }
  }, 60000); // Every minute

  console.log(`🔐 Secure WebSocket server ready on port ${port + 1}`);
}
```

## Security Checklist

- [x] JWT-based authentication with RS256 algorithm
- [x] Post-connection authentication (not in URL)
- [x] Automatic token refresh without disconnection
- [x] Origin validation and CORS support
- [x] TLS/WSS enforcement in production
- [x] Connection and message rate limiting
- [x] Message-level authentication for sensitive operations
- [x] Connection state management and health monitoring
- [x] Graceful disconnection and reconnection strategies
- [x] Audit logging for security events
- [x] Input validation and sanitization
- [x] Protection against common WebSocket attacks

## Best Practices Summary

1. **Always use WSS in production** - Never send tokens over unencrypted connections
2. **Implement post-connection authentication** - Send auth messages after connection establishment
3. **Keep connections alive during token refresh** - Avoid costly reconnections
4. **Validate all inputs** - Check message format, size, and content
5. **Implement rate limiting** - Protect against abuse at connection and message level
6. **Monitor connection health** - Detect and clean up dead connections
7. **Use exponential backoff for reconnections** - Prevent server overload
8. **Audit security events** - Track authentication attempts and failures
9. **Validate origins** - Only accept connections from trusted sources
10. **Handle errors gracefully** - Provide clear error messages without exposing sensitive data