# WebSocket Security Audit and Real-Time Threat Monitoring
**Enterprise-grade WebSocket security and streaming threat detection**

## Executive Summary

This framework provides comprehensive WebSocket security auditing and real-time threat monitoring for streaming data applications. It includes connection security validation, streaming threat detection algorithms, and intelligent rate limiting for AI service endpoints.

**Security Pillars:**
1. WebSocket connection security validation and hardening
2. Real-time threat detection for streaming data analysis
3. Adaptive rate limiting with AI-powered anomaly detection
4. Continuous monitoring and automated response systems

## 1. WebSocket Connection Security Framework

### WebSocket Security Audit Engine

```python
# WebSocket Security Audit Framework
import asyncio
import websockets
import ssl
import json
import hashlib
import hmac
import time
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from enum import Enum
import logging
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import jwt

class SecurityLevel(Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

@dataclass
class SecurityVulnerability:
    vuln_id: str
    category: str
    severity: SecurityLevel
    description: str
    remediation: str
    cwe_id: Optional[str] = None

class WebSocketSecurityAuditor:
    """Comprehensive WebSocket security auditing system"""
    
    def __init__(self):
        self.vulnerabilities: List[SecurityVulnerability] = []
        self.security_config = self._load_security_config()
        self.audit_logger = logging.getLogger('websocket_security')
        
    async def audit_websocket_security(self, websocket_url: str, 
                                     headers: Dict[str, str] = None) -> Dict[str, Any]:
        """Perform comprehensive WebSocket security audit"""
        
        audit_results = {
            "connection_security": await self._audit_connection_security(websocket_url, headers),
            "authentication_security": await self._audit_authentication(websocket_url, headers),
            "protocol_security": await self._audit_protocol_security(websocket_url),
            "transport_security": await self._audit_transport_security(websocket_url),
            "message_security": await self._audit_message_security(websocket_url),
            "origin_validation": await self._audit_origin_validation(websocket_url),
            "csrf_protection": await self._audit_csrf_protection(websocket_url),
            "vulnerabilities": self.vulnerabilities,
            "overall_score": 0.0
        }
        
        # Calculate overall security score
        audit_results["overall_score"] = self._calculate_security_score(audit_results)
        
        return audit_results
    
    async def _audit_connection_security(self, url: str, headers: Dict[str, str]) -> Dict[str, Any]:
        """Audit WebSocket connection security"""
        
        results = {
            "tls_enabled": False,
            "certificate_valid": False,
            "cipher_strength": "",
            "protocol_version": "",
            "connection_timeout": 0,
            "max_connections": 0,
            "connection_issues": []
        }
        
        try:
            # Check TLS configuration
            if url.startswith('wss://'):
                results["tls_enabled"] = True
                
                # Create SSL context for validation
                ssl_context = ssl.create_default_context()
                ssl_context.check_hostname = True
                ssl_context.verify_mode = ssl.CERT_REQUIRED
                
                # Test connection with TLS validation
                async with websockets.connect(
                    url,
                    ssl=ssl_context,
                    extra_headers=headers,
                    timeout=10
                ) as websocket:
                    
                    # Get SSL information
                    if hasattr(websocket, 'transport') and hasattr(websocket.transport, '_ssl_protocol'):
                        ssl_object = websocket.transport._ssl_protocol._sslpipe._sslobj
                        results["cipher_strength"] = ssl_object.cipher()[0]
                        results["protocol_version"] = ssl_object.version()
                        results["certificate_valid"] = True
                    
            else:
                # Unencrypted connection
                results["connection_issues"].append("Unencrypted WebSocket connection (ws://)")
                self.vulnerabilities.append(SecurityVulnerability(
                    vuln_id="WS001",
                    category="Transport Security",
                    severity=SecurityLevel.HIGH,
                    description="WebSocket connection uses unencrypted transport",
                    remediation="Use WSS (WebSocket Secure) protocol",
                    cwe_id="CWE-319"
                ))
                
                # Test basic connection
                async with websockets.connect(
                    url,
                    extra_headers=headers,
                    timeout=10
                ) as websocket:
                    pass
            
            # Test connection limits
            results["max_connections"] = await self._test_connection_limits(url, headers)
            
        except websockets.exceptions.InvalidHandshake as e:
            results["connection_issues"].append(f"Invalid handshake: {str(e)}")
        except ssl.SSLError as e:
            results["connection_issues"].append(f"SSL error: {str(e)}")
            results["certificate_valid"] = False
        except Exception as e:
            results["connection_issues"].append(f"Connection error: {str(e)}")
        
        return results
    
    async def _audit_authentication(self, url: str, headers: Dict[str, str]) -> Dict[str, Any]:
        """Audit WebSocket authentication mechanisms"""
        
        results = {
            "auth_required": False,
            "auth_method": "",
            "token_validation": False,
            "session_management": False,
            "auth_bypass_attempts": [],
            "auth_issues": []
        }
        
        # Test connection without authentication
        try:
            async with websockets.connect(url, timeout=5) as websocket:
                # If connection succeeds without auth, it's a security issue
                self.vulnerabilities.append(SecurityVulnerability(
                    vuln_id="WS002",
                    category="Authentication",
                    severity=SecurityLevel.MEDIUM,
                    description="WebSocket allows unauthenticated connections",
                    remediation="Implement proper authentication for WebSocket connections",
                    cwe_id="CWE-306"
                ))
                results["auth_issues"].append("No authentication required")
                
        except websockets.exceptions.ConnectionClosedError:
            results["auth_required"] = True
        except Exception as e:
            results["auth_issues"].append(f"Auth test error: {str(e)}")
        
        # Test with various authentication methods
        auth_tests = [
            self._test_bearer_token_auth(url),
            self._test_cookie_auth(url),
            self._test_query_param_auth(url),
            self._test_custom_header_auth(url)
        ]
        
        for auth_test in auth_tests:
            test_result = await auth_test
            if test_result["successful"]:
                results["auth_method"] = test_result["method"]
                results["token_validation"] = test_result.get("token_valid", False)
                break
        
        return results
    
    async def _audit_protocol_security(self, url: str) -> Dict[str, Any]:
        """Audit WebSocket protocol security"""
        
        results = {
            "subprotocol_validation": False,
            "extension_security": [],
            "frame_security": {},
            "protocol_issues": []
        }
        
        try:
            # Test with various subprotocols
            test_subprotocols = ["chat", "echo", "invalid_protocol", "../../../etc/passwd"]
            
            for subprotocol in test_subprotocols:
                try:
                    async with websockets.connect(
                        url,
                        subprotocols=[subprotocol],
                        timeout=5
                    ) as websocket:
                        if websocket.subprotocol == subprotocol:
                            if subprotocol in ["invalid_protocol", "../../../etc/passwd"]:
                                results["protocol_issues"].append(
                                    f"Accepts invalid subprotocol: {subprotocol}"
                                )
                                self.vulnerabilities.append(SecurityVulnerability(
                                    vuln_id="WS003",
                                    category="Protocol Security",
                                    severity=SecurityLevel.MEDIUM,
                                    description="WebSocket accepts invalid subprotocols",
                                    remediation="Implement subprotocol validation",
                                    cwe_id="CWE-20"
                                ))
                except:
                    # Expected for invalid protocols
                    if subprotocol not in ["invalid_protocol", "../../../etc/passwd"]:
                        results["subprotocol_validation"] = True
            
            # Test frame size limits
            await self._test_frame_limits(url, results)
            
        except Exception as e:
            results["protocol_issues"].append(f"Protocol test error: {str(e)}")
        
        return results
    
    async def _test_frame_limits(self, url: str, results: Dict[str, Any]):
        """Test WebSocket frame size limits"""
        
        try:
            async with websockets.connect(url, timeout=5) as websocket:
                # Test large frame
                large_payload = "A" * (1024 * 1024)  # 1MB
                
                try:
                    await websocket.send(large_payload)
                    results["frame_security"]["accepts_large_frames"] = True
                    
                    # This might indicate lack of proper size limits
                    self.vulnerabilities.append(SecurityVulnerability(
                        vuln_id="WS004",
                        category="Resource Management",
                        severity=SecurityLevel.MEDIUM,
                        description="WebSocket accepts very large frames",
                        remediation="Implement frame size limits",
                        cwe_id="CWE-770"
                    ))
                    
                except websockets.exceptions.ConnectionClosedError:
                    results["frame_security"]["has_size_limits"] = True
                except Exception as e:
                    results["frame_security"]["frame_test_error"] = str(e)
                    
        except Exception as e:
            results["frame_security"]["connection_error"] = str(e)

class WebSocketSecurityHardening:
    """WebSocket security hardening implementation"""
    
    def __init__(self):
        self.security_policies = self._load_security_policies()
        self.rate_limiter = ConnectionRateLimiter()
        
    def create_secure_websocket_server(self, host: str = "localhost", 
                                     port: int = 8765) -> Dict[str, Any]:
        """Create hardened WebSocket server configuration"""
        
        # SSL/TLS Configuration
        ssl_context = self._create_secure_ssl_context()
        
        # Authentication middleware
        auth_middleware = self._create_auth_middleware()
        
        # Rate limiting middleware
        rate_limit_middleware = self._create_rate_limit_middleware()
        
        # Input validation middleware
        validation_middleware = self._create_validation_middleware()
        
        # Server configuration
        server_config = {
            "ssl_context": ssl_context,
            "middleware": [
                auth_middleware,
                rate_limit_middleware,
                validation_middleware
            ],
            "max_size": 64 * 1024,  # 64KB max message size
            "max_queue": 32,        # Max queued messages
            "ping_interval": 20,    # Ping every 20 seconds
            "ping_timeout": 10,     # Timeout after 10 seconds
            "close_timeout": 10,    # Close timeout
            "compression": None,    # Disable compression to prevent attacks
            "origins": self._get_allowed_origins(),
            "logger": logging.getLogger('secure_websocket')
        }
        
        return server_config
    
    def _create_secure_ssl_context(self) -> ssl.SSLContext:
        """Create secure SSL context for WebSocket server"""
        
        context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        context.minimum_version = ssl.TLSVersion.TLSv1_2
        
        # Load certificates
        context.load_cert_chain(
            certfile="path/to/server.crt",
            keyfile="path/to/server.key"
        )
        
        # Security settings
        context.set_ciphers("ECDHE+AESGCM:ECDHE+CHACHA20:DHE+AESGCM:DHE+CHACHA20:!aNULL:!MD5:!DSS")
        context.options |= ssl.OP_NO_SSLv2 | ssl.OP_NO_SSLv3 | ssl.OP_NO_TLSv1 | ssl.OP_NO_TLSv1_1
        context.options |= ssl.OP_SINGLE_DH_USE | ssl.OP_SINGLE_ECDH_USE
        
        return context
    
    def _create_auth_middleware(self):
        """Create authentication middleware for WebSocket connections"""
        
        async def auth_middleware(websocket, path):
            """Authenticate WebSocket connection"""
            
            # Extract authentication token
            auth_header = websocket.request_headers.get('Authorization')
            
            if not auth_header:
                await websocket.close(code=4001, reason="Authentication required")
                return False
            
            # Validate token
            try:
                token = auth_header.replace('Bearer ', '')
                payload = jwt.decode(
                    token,
                    self.security_policies['jwt_secret'],
                    algorithms=['HS256']
                )
                
                # Store user info in websocket
                websocket.user_id = payload.get('user_id')
                websocket.roles = payload.get('roles', [])
                
                return True
                
            except jwt.InvalidTokenError:
                await websocket.close(code=4001, reason="Invalid token")
                return False
        
        return auth_middleware
    
    def _create_validation_middleware(self):
        """Create input validation middleware"""
        
        async def validation_middleware(websocket, path):
            """Validate WebSocket messages"""
            
            async def validate_message(message):
                """Validate incoming message"""
                
                # Size validation
                if len(message) > 64 * 1024:  # 64KB limit
                    await websocket.close(code=4002, reason="Message too large")
                    return False
                
                # JSON validation
                try:
                    data = json.loads(message)
                    
                    # Schema validation
                    if not self._validate_message_schema(data):
                        await websocket.close(code=4003, reason="Invalid message format")
                        return False
                    
                    # Content validation
                    if not self._validate_message_content(data):
                        await websocket.close(code=4004, reason="Invalid message content")
                        return False
                    
                    return True
                    
                except json.JSONDecodeError:
                    await websocket.close(code=4003, reason="Invalid JSON")
                    return False
            
            # Attach validator to websocket
            websocket.validate_message = validate_message
            return True
        
        return validation_middleware
```

### WebSocket Connection Monitor

```python
class WebSocketConnectionMonitor:
    """Real-time WebSocket connection monitoring"""
    
    def __init__(self):
        self.active_connections: Dict[str, Dict[str, Any]] = {}
        self.connection_metrics = ConnectionMetrics()
        self.threat_detector = WebSocketThreatDetector()
        
    async def monitor_connection(self, websocket, connection_id: str):
        """Monitor WebSocket connection for security threats"""
        
        connection_info = {
            "id": connection_id,
            "remote_address": websocket.remote_address,
            "user_agent": websocket.request_headers.get('User-Agent'),
            "origin": websocket.request_headers.get('Origin'),
            "connect_time": time.time(),
            "message_count": 0,
            "bytes_received": 0,
            "bytes_sent": 0,
            "last_activity": time.time(),
            "security_events": [],
            "rate_limit_violations": 0
        }
        
        self.active_connections[connection_id] = connection_info
        
        try:
            # Monitor message flow
            async for message in websocket:
                await self._process_message(websocket, connection_id, message)
                
        except websockets.exceptions.ConnectionClosed:
            self._log_connection_closed(connection_id, "normal")
        except Exception as e:
            self._log_connection_closed(connection_id, f"error: {str(e)}")
        finally:
            # Cleanup connection info
            if connection_id in self.active_connections:
                del self.active_connections[connection_id]
    
    async def _process_message(self, websocket, connection_id: str, message: str):
        """Process and analyze incoming message"""
        
        connection_info = self.active_connections[connection_id]
        
        # Update connection metrics
        connection_info["message_count"] += 1
        connection_info["bytes_received"] += len(message.encode('utf-8'))
        connection_info["last_activity"] = time.time()
        
        # Threat detection
        threat_analysis = await self.threat_detector.analyze_message(
            message, connection_info
        )
        
        if threat_analysis["threats_detected"]:
            connection_info["security_events"].extend(threat_analysis["threats"])
            await self._handle_security_threat(websocket, connection_id, threat_analysis)
        
        # Rate limiting check
        if self._check_rate_limit_violation(connection_info):
            connection_info["rate_limit_violations"] += 1
            await self._handle_rate_limit_violation(websocket, connection_id)
    
    def get_connection_stats(self) -> Dict[str, Any]:
        """Get real-time connection statistics"""
        
        stats = {
            "active_connections": len(self.active_connections),
            "total_messages": sum(conn["message_count"] for conn in self.active_connections.values()),
            "total_bytes": sum(conn["bytes_received"] for conn in self.active_connections.values()),
            "security_events": sum(len(conn["security_events"]) for conn in self.active_connections.values()),
            "connections_by_origin": self._group_by_origin(),
            "rate_limit_violations": sum(conn["rate_limit_violations"] for conn in self.active_connections.values())
        }
        
        return stats
```

## 2. Real-Time Threat Detection for Streaming Data

### Streaming Threat Detection Engine

```python
class StreamingThreatDetector:
    """Real-time threat detection for streaming data"""
    
    def __init__(self):
        self.threat_models = self._load_threat_models()
        self.pattern_matcher = PatternMatcher()
        self.anomaly_detector = AnomalyDetector()
        self.ml_classifier = MLThreatClassifier()
        self.threat_cache = ThreatCache()
        
    async def analyze_stream(self, data_stream: Any) -> Dict[str, Any]:
        """Analyze streaming data for security threats"""
        
        threat_analysis = {
            "timestamp": time.time(),
            "data_volume": 0,
            "threats_detected": [],
            "anomalies": [],
            "risk_score": 0.0,
            "analysis_time": 0.0
        }
        
        start_time = time.time()
        
        # Multi-layer threat detection
        async for data_chunk in data_stream:
            chunk_analysis = await self._analyze_data_chunk(data_chunk)
            
            threat_analysis["data_volume"] += len(data_chunk) if isinstance(data_chunk, (str, bytes)) else 1
            threat_analysis["threats_detected"].extend(chunk_analysis["threats"])
            threat_analysis["anomalies"].extend(chunk_analysis["anomalies"])
        
        # Calculate overall risk score
        threat_analysis["risk_score"] = self._calculate_risk_score(threat_analysis)
        threat_analysis["analysis_time"] = time.time() - start_time
        
        return threat_analysis
    
    async def _analyze_data_chunk(self, data_chunk: Any) -> Dict[str, Any]:
        """Analyze individual data chunk for threats"""
        
        analysis_results = {
            "threats": [],
            "anomalies": [],
            "patterns_matched": []
        }
        
        # Pattern-based detection
        pattern_results = await self.pattern_matcher.match_patterns(data_chunk)
        analysis_results["patterns_matched"] = pattern_results
        
        # Statistical anomaly detection
        anomaly_results = await self.anomaly_detector.detect_anomalies(data_chunk)
        analysis_results["anomalies"] = anomaly_results
        
        # ML-based threat classification
        ml_results = await self.ml_classifier.classify_threats(data_chunk)
        analysis_results["threats"].extend(ml_results)
        
        # Content-specific analysis
        if isinstance(data_chunk, str):
            # Text-based threats
            text_threats = await self._detect_text_threats(data_chunk)
            analysis_results["threats"].extend(text_threats)
        
        elif isinstance(data_chunk, dict):
            # JSON/structured data threats
            json_threats = await self._detect_json_threats(data_chunk)
            analysis_results["threats"].extend(json_threats)
        
        return analysis_results
    
    async def _detect_text_threats(self, text: str) -> List[Dict[str, Any]]:
        """Detect threats in text data"""
        
        threats = []
        
        # SQL injection patterns
        sql_patterns = [
            r"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION)\b.*\b(FROM|INTO|SET|WHERE)\b)",
            r"(\b(OR|AND)\s+\d+\s*=\s*\d+)",
            r"(';.*--)",
            r"(\bUNION\b.*\bSELECT\b)"
        ]
        
        for pattern in sql_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                threats.append({
                    "type": "sql_injection",
                    "severity": "high",
                    "pattern": pattern,
                    "description": "Potential SQL injection attempt detected"
                })
        
        # XSS patterns
        xss_patterns = [
            r"<script[^>]*>.*?</script>",
            r"javascript:",
            r"on\w+\s*=\s*['\"].*?['\"]",
            r"<iframe[^>]*src\s*="
        ]
        
        for pattern in xss_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                threats.append({
                    "type": "xss_attempt",
                    "severity": "high",
                    "pattern": pattern,
                    "description": "Potential XSS attempt detected"
                })
        
        # Command injection patterns
        cmd_patterns = [
            r"(\||;|&|`|\$\(|\${).*?(ls|cat|rm|wget|curl|nc|sh|bash)",
            r"\.\.\/",
            r"\/etc\/passwd",
            r"\/proc\/self\/"
        ]
        
        for pattern in cmd_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                threats.append({
                    "type": "command_injection",
                    "severity": "critical",
                    "pattern": pattern,
                    "description": "Potential command injection attempt detected"
                })
        
        # Sensitive data exposure
        sensitive_patterns = [
            (r"\b\d{4}-\d{4}-\d{4}-\d{4}\b", "credit_card"),
            (r"\b\d{3}-\d{2}-\d{4}\b", "ssn"),
            (r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b", "email"),
            (r"(?:password|pwd|pass)\s*[:=]\s*['\"]?([^'\"\s]+)", "password")
        ]
        
        for pattern, data_type in sensitive_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                threats.append({
                    "type": "sensitive_data_exposure",
                    "severity": "medium",
                    "data_type": data_type,
                    "description": f"Potential {data_type} exposure detected"
                })
        
        return threats
    
    async def _detect_json_threats(self, json_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Detect threats in JSON data"""
        
        threats = []
        
        # Check for deeply nested structures (potential DoS)
        max_depth = self._calculate_json_depth(json_data)
        if max_depth > 20:
            threats.append({
                "type": "json_bomb",
                "severity": "medium",
                "depth": max_depth,
                "description": "Deeply nested JSON structure detected"
            })
        
        # Check for extremely large arrays
        for key, value in json_data.items():
            if isinstance(value, list) and len(value) > 10000:
                threats.append({
                    "type": "large_array",
                    "severity": "medium",
                    "key": key,
                    "size": len(value),
                    "description": "Extremely large array detected"
                })
        
        # Check for prototype pollution attempts
        dangerous_keys = ["__proto__", "constructor", "prototype"]
        for key in self._get_all_keys(json_data):
            if key in dangerous_keys:
                threats.append({
                    "type": "prototype_pollution",
                    "severity": "high",
                    "key": key,
                    "description": "Potential prototype pollution attempt"
                })
        
        return threats

class RealTimeThreatMonitor:
    """Real-time threat monitoring system"""
    
    def __init__(self):
        self.threat_detector = StreamingThreatDetector()
        self.alert_system = AlertSystem()
        self.threat_database = ThreatDatabase()
        self.metrics_collector = MetricsCollector()
        
    async def start_monitoring(self, websocket_server):
        """Start real-time threat monitoring"""
        
        # Create monitoring tasks
        tasks = [
            asyncio.create_task(self._monitor_connections(websocket_server)),
            asyncio.create_task(self._monitor_traffic_patterns()),
            asyncio.create_task(self._monitor_system_health()),
            asyncio.create_task(self._generate_reports())
        ]
        
        # Run monitoring tasks
        await asyncio.gather(*tasks)
    
    async def _monitor_connections(self, websocket_server):
        """Monitor WebSocket connections for threats"""
        
        while True:
            try:
                # Get current connections
                active_connections = websocket_server.get_active_connections()
                
                for connection in active_connections:
                    # Analyze connection for threats
                    threat_analysis = await self.threat_detector.analyze_connection(connection)
                    
                    if threat_analysis["risk_score"] > 0.7:
                        await self._handle_high_risk_connection(connection, threat_analysis)
                    
                    # Update metrics
                    self.metrics_collector.update_connection_metrics(connection, threat_analysis)
                
                await asyncio.sleep(1)  # Check every second
                
            except Exception as e:
                logging.error(f"Error in connection monitoring: {e}")
                await asyncio.sleep(5)
    
    async def _handle_high_risk_connection(self, connection, threat_analysis):
        """Handle high-risk connection"""
        
        # Log threat
        await self.threat_database.log_threat(connection.id, threat_analysis)
        
        # Send alert
        await self.alert_system.send_alert(
            level="high",
            message=f"High-risk connection detected: {connection.remote_address}",
            details=threat_analysis
        )
        
        # Take action based on threat type
        if threat_analysis["risk_score"] > 0.9:
            # Block connection immediately
            await connection.close(code=4005, reason="Security violation")
            
        elif threat_analysis["risk_score"] > 0.8:
            # Rate limit connection
            await self._apply_strict_rate_limit(connection)
```

## 3. Rate Limiting for AI Service Endpoints

### Intelligent Rate Limiting System

```python
class AIServiceRateLimiter:
    """Intelligent rate limiting for AI service endpoints"""
    
    def __init__(self):
        self.rate_limiters = {}
        self.anomaly_detector = AnomalyDetector()
        self.threat_analyzer = ThreatAnalyzer()
        self.adaptive_config = AdaptiveConfiguration()
        
    def create_rate_limiter(self, endpoint: str, config: Dict[str, Any]) -> RateLimiter:
        """Create rate limiter for specific AI endpoint"""
        
        # Determine rate limiting strategy based on endpoint type
        if "chat" in endpoint.lower():
            limiter = ChatEndpointRateLimiter(config)
        elif "image" in endpoint.lower():
            limiter = ImageEndpointRateLimiter(config)
        elif "audio" in endpoint.lower():
            limiter = AudioEndpointRateLimiter(config)
        elif "embedding" in endpoint.lower():
            limiter = EmbeddingEndpointRateLimiter(config)
        else:
            limiter = GenericAIRateLimiter(config)
        
        self.rate_limiters[endpoint] = limiter
        return limiter
    
    async def check_rate_limit(self, request: Dict[str, Any]) -> RateLimitResult:
        """Check if request should be rate limited"""
        
        endpoint = request.get("endpoint")
        client_id = request.get("client_id")
        
        if endpoint not in self.rate_limiters:
            return RateLimitResult(allowed=True, reason="No rate limit configured")
        
        limiter = self.rate_limiters[endpoint]
        
        # Basic rate limit check
        basic_result = await limiter.check_limit(client_id, request)
        
        if not basic_result.allowed:
            return basic_result
        
        # Adaptive rate limiting based on system load
        adaptive_result = await self._check_adaptive_limits(request)
        
        if not adaptive_result.allowed:
            return adaptive_result
        
        # Threat-based rate limiting
        threat_result = await self._check_threat_based_limits(request)
        
        return threat_result
    
    async def _check_adaptive_limits(self, request: Dict[str, Any]) -> RateLimitResult:
        """Check adaptive rate limits based on system conditions"""
        
        # Get current system metrics
        system_metrics = await self._get_system_metrics()
        
        # Calculate adaptive rate limit
        base_limit = request.get("base_rate_limit", 100)
        
        # Adjust based on CPU usage
        cpu_factor = max(0.1, 1.0 - (system_metrics["cpu_usage"] - 70) / 30)
        
        # Adjust based on memory usage
        memory_factor = max(0.1, 1.0 - (system_metrics["memory_usage"] - 80) / 20)
        
        # Adjust based on queue length
        queue_factor = max(0.1, 1.0 - (system_metrics["queue_length"] - 100) / 100)
        
        # Calculate final limit
        adaptive_limit = base_limit * cpu_factor * memory_factor * queue_factor
        
        # Check current usage
        current_usage = await self._get_current_usage(request["client_id"])
        
        if current_usage > adaptive_limit:
            return RateLimitResult(
                allowed=False,
                reason="Adaptive rate limit exceeded",
                limit=adaptive_limit,
                current_usage=current_usage,
                retry_after=self._calculate_retry_time(current_usage, adaptive_limit)
            )
        
        return RateLimitResult(allowed=True)
    
    async def _check_threat_based_limits(self, request: Dict[str, Any]) -> RateLimitResult:
        """Apply rate limits based on threat assessment"""
        
        # Analyze request for threats
        threat_score = await self.threat_analyzer.analyze_request(request)
        
        if threat_score > 0.8:
            # High threat - strict limiting
            return RateLimitResult(
                allowed=False,
                reason="High threat score detected",
                threat_score=threat_score,
                retry_after=300  # 5 minutes
            )
        
        elif threat_score > 0.6:
            # Medium threat - reduced limits
            base_limit = request.get("base_rate_limit", 100)
            threat_limit = base_limit * 0.5  # 50% reduction
            
            current_usage = await self._get_current_usage(request["client_id"])
            
            if current_usage > threat_limit:
                return RateLimitResult(
                    allowed=False,
                    reason="Threat-based rate limit exceeded",
                    limit=threat_limit,
                    current_usage=current_usage,
                    threat_score=threat_score,
                    retry_after=60
                )
        
        return RateLimitResult(allowed=True)

class ChatEndpointRateLimiter(RateLimiter):
    """Specialized rate limiter for chat AI endpoints"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.conversation_tracker = ConversationTracker()
        self.prompt_analyzer = PromptAnalyzer()
        
    async def check_limit(self, client_id: str, request: Dict[str, Any]) -> RateLimitResult:
        """Check rate limits for chat requests"""
        
        # Basic rate limiting
        basic_result = await super().check_limit(client_id, request)
        if not basic_result.allowed:
            return basic_result
        
        # Conversation-based limiting
        conversation_result = await self._check_conversation_limits(client_id, request)
        if not conversation_result.allowed:
            return conversation_result
        
        # Prompt complexity limiting
        prompt_result = await self._check_prompt_complexity(client_id, request)
        if not prompt_result.allowed:
            return prompt_result
        
        # Token usage limiting
        token_result = await self._check_token_limits(client_id, request)
        
        return token_result
    
    async def _check_conversation_limits(self, client_id: str, request: Dict[str, Any]) -> RateLimitResult:
        """Check conversation-based rate limits"""
        
        # Get conversation context
        conversation = await self.conversation_tracker.get_conversation(client_id)
        
        # Check conversation frequency
        if conversation.message_count > 100:  # Too many messages
            time_window = conversation.end_time - conversation.start_time
            if time_window < 300:  # Less than 5 minutes
                return RateLimitResult(
                    allowed=False,
                    reason="Conversation frequency too high",
                    retry_after=300 - time_window
                )
        
        # Check for prompt injection attempts
        prompt = request.get("prompt", "")
        if await self.prompt_analyzer.detect_injection(prompt):
            return RateLimitResult(
                allowed=False,
                reason="Prompt injection detected",
                retry_after=900  # 15 minutes
            )
        
        return RateLimitResult(allowed=True)
    
    async def _check_token_limits(self, client_id: str, request: Dict[str, Any]) -> RateLimitResult:
        """Check token-based rate limits"""
        
        # Estimate token usage
        prompt = request.get("prompt", "")
        estimated_tokens = self._estimate_tokens(prompt)
        
        # Check daily token limit
        daily_usage = await self._get_daily_token_usage(client_id)
        daily_limit = self.config.get("daily_token_limit", 100000)
        
        if daily_usage + estimated_tokens > daily_limit:
            return RateLimitResult(
                allowed=False,
                reason="Daily token limit exceeded",
                limit=daily_limit,
                current_usage=daily_usage,
                retry_after=self._time_until_reset()
            )
        
        # Check hourly token limit
        hourly_usage = await self._get_hourly_token_usage(client_id)
        hourly_limit = self.config.get("hourly_token_limit", 10000)
        
        if hourly_usage + estimated_tokens > hourly_limit:
            return RateLimitResult(
                allowed=False,
                reason="Hourly token limit exceeded",
                limit=hourly_limit,
                current_usage=hourly_usage,
                retry_after=3600 - (time.time() % 3600)
            )
        
        return RateLimitResult(allowed=True)

class ImageEndpointRateLimiter(RateLimiter):
    """Specialized rate limiter for image AI endpoints"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.image_analyzer = ImageAnalyzer()
        
    async def check_limit(self, client_id: str, request: Dict[str, Any]) -> RateLimitResult:
        """Check rate limits for image requests"""
        
        # Basic rate limiting
        basic_result = await super().check_limit(client_id, request)
        if not basic_result.allowed:
            return basic_result
        
        # Image-specific checks
        image_result = await self._check_image_limits(client_id, request)
        
        return image_result
    
    async def _check_image_limits(self, client_id: str, request: Dict[str, Any]) -> RateLimitResult:
        """Check image-specific rate limits"""
        
        # Check image dimensions
        width = request.get("width", 512)
        height = request.get("height", 512)
        
        # Limit very large images
        max_pixels = self.config.get("max_pixels", 2048 * 2048)
        if width * height > max_pixels:
            return RateLimitResult(
                allowed=False,
                reason="Image resolution too high",
                retry_after=60
            )
        
        # Check generation count per hour
        hourly_count = await self._get_hourly_generation_count(client_id)
        hourly_limit = self.config.get("hourly_generation_limit", 50)
        
        if hourly_count >= hourly_limit:
            return RateLimitResult(
                allowed=False,
                reason="Hourly generation limit exceeded",
                limit=hourly_limit,
                current_usage=hourly_count,
                retry_after=3600 - (time.time() % 3600)
            )
        
        return RateLimitResult(allowed=True)

# Rate Limiting Middleware
class RateLimitingMiddleware:
    """WebSocket middleware for rate limiting"""
    
    def __init__(self, rate_limiter: AIServiceRateLimiter):
        self.rate_limiter = rate_limiter
        
    async def __call__(self, websocket, path):
        """Rate limiting middleware for WebSocket connections"""
        
        client_id = self._extract_client_id(websocket)
        
        # Check connection rate limit
        connection_limit_result = await self.rate_limiter.check_connection_limit(client_id)
        
        if not connection_limit_result.allowed:
            await websocket.close(
                code=4008,
                reason=f"Rate limit exceeded: {connection_limit_result.reason}"
            )
            return
        
        # Message rate limiting
        async def rate_limited_handler(websocket):
            async for message in websocket:
                # Parse request
                try:
                    request = json.loads(message)
                    request["client_id"] = client_id
                    
                    # Check rate limit
                    rate_limit_result = await self.rate_limiter.check_rate_limit(request)
                    
                    if not rate_limit_result.allowed:
                        # Send rate limit response
                        await websocket.send(json.dumps({
                            "error": "rate_limit_exceeded",
                            "message": rate_limit_result.reason,
                            "retry_after": rate_limit_result.retry_after
                        }))
                        continue
                    
                    # Process request normally
                    await self._process_request(websocket, request)
                    
                except json.JSONDecodeError:
                    await websocket.send(json.dumps({
                        "error": "invalid_json",
                        "message": "Invalid JSON format"
                    }))
                except Exception as e:
                    await websocket.send(json.dumps({
                        "error": "processing_error",
                        "message": str(e)
                    }))
        
        await rate_limited_handler(websocket)
```

### Rate Limiting Dashboard

```python
class RateLimitingDashboard:
    """Real-time dashboard for rate limiting metrics"""
    
    def __init__(self, rate_limiter: AIServiceRateLimiter):
        self.rate_limiter = rate_limiter
        self.metrics_collector = MetricsCollector()
        
    def generate_dashboard(self) -> Dict[str, Any]:
        """Generate rate limiting dashboard data"""
        
        dashboard_data = {
            "overview": self._get_overview_metrics(),
            "endpoints": self._get_endpoint_metrics(),
            "clients": self._get_client_metrics(),
            "threats": self._get_threat_metrics(),
            "alerts": self._get_recent_alerts()
        }
        
        return dashboard_data
    
    def _get_overview_metrics(self) -> Dict[str, Any]:
        """Get overview metrics for dashboard"""
        
        metrics = self.metrics_collector.get_summary_metrics()
        
        return {
            "total_requests": metrics.get("total_requests", 0),
            "blocked_requests": metrics.get("blocked_requests", 0),
            "success_rate": metrics.get("success_rate", 0.0),
            "avg_response_time": metrics.get("avg_response_time", 0.0),
            "active_connections": metrics.get("active_connections", 0),
            "threat_score": metrics.get("threat_score", 0.0)
        }
```

This comprehensive WebSocket Security and Real-Time Threat Monitoring framework provides:

1. **WebSocket Security Auditing** - Complete security assessment and hardening
2. **Real-Time Threat Detection** - Streaming data analysis with ML-based classification
3. **Intelligent Rate Limiting** - Adaptive limits based on AI endpoint types and threat levels
4. **Continuous Monitoring** - Real-time security metrics and automated response

The system integrates seamlessly with existing infrastructure while providing enterprise-grade security for WebSocket and streaming AI services.