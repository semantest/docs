# Semantest Enterprise Troubleshooting Playbooks

## Overview

Comprehensive troubleshooting playbooks for Semantest Enterprise deployments. These playbooks provide step-by-step resolution procedures for common issues, performance problems, and system failures.

## Table of Contents

1. [Quick Diagnostic Tools](#quick-diagnostic-tools)
2. [Authentication & Access Issues](#authentication--access-issues)
3. [Test Execution Problems](#test-execution-problems)
4. [Performance Issues](#performance-issues)
5. [Infrastructure Problems](#infrastructure-problems)
6. [Database Issues](#database-issues)
7. [Network & Connectivity](#network--connectivity)
8. [API & Integration Issues](#api--integration-issues)
9. [Browser & Device Problems](#browser--device-problems)
10. [Monitoring & Alerting](#monitoring--alerting)
11. [Data & Security Issues](#data--security-issues)
12. [Emergency Procedures](#emergency-procedures)

## Quick Diagnostic Tools

### Health Check Script

```bash
#!/bin/bash
# semantest-health-check.sh

echo "🔍 Semantest Enterprise Health Check"
echo "===================================="

# API Health
echo "📡 API Health:"
curl -s -o /dev/null -w "Status: %{http_code}, Time: %{time_total}s\n" \
  https://api.semantest.com/health

# Database Connectivity
echo "🗄️ Database Health:"
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT 1;" > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✅ Database: Connected"
else
  echo "❌ Database: Connection Failed"
fi

# Redis Cache
echo "💾 Cache Health:"
redis-cli -h $REDIS_HOST -p $REDIS_PORT ping > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✅ Redis: Connected"
else
  echo "❌ Redis: Connection Failed"
fi

# Queue Status
echo "📋 Queue Status:"
QUEUE_LENGTH=$(redis-cli -h $REDIS_HOST -p $REDIS_PORT llen semantest:queue)
echo "Queue Length: $QUEUE_LENGTH jobs"

# Disk Space
echo "💿 Disk Usage:"
df -h | grep -E '(Filesystem|/dev/)'

# Memory Usage
echo "🧠 Memory Usage:"
free -h

# Active Processes
echo "⚙️ Active Processes:"
ps aux | grep semantest | grep -v grep | wc -l | xargs echo "Processes:"
```

### Log Analysis Tool

```bash
#!/bin/bash
# log-analyzer.sh

LOG_FILE="/var/log/semantest/application.log"
TIME_WINDOW="1h"

echo "📊 Log Analysis - Last $TIME_WINDOW"
echo "================================="

# Error Count
ERROR_COUNT=$(journalctl --since="$TIME_WINDOW ago" -u semantest | grep -c ERROR)
echo "❌ Errors: $ERROR_COUNT"

# Warning Count
WARNING_COUNT=$(journalctl --since="$TIME_WINDOW ago" -u semantest | grep -c WARN)
echo "⚠️ Warnings: $WARNING_COUNT"

# Top Error Messages
echo "🔝 Top Error Messages:"
journalctl --since="$TIME_WINDOW ago" -u semantest | \
  grep ERROR | \
  awk '{for(i=6;i<=NF;i++) printf "%s ", $i; print ""}' | \
  sort | uniq -c | sort -nr | head -5

# Performance Metrics
echo "⚡ Performance Issues:"
journalctl --since="$TIME_WINDOW ago" -u semantest | \
  grep -E "(slow|timeout|performance)" | wc -l | \
  xargs echo "Performance-related entries:"
```

## Authentication & Access Issues

### Playbook: User Cannot Login

**Symptoms:**
- Login failures with valid credentials
- "Invalid credentials" error messages
- Authentication timeouts

**Diagnostic Steps:**

```bash
# 1. Check user account status
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "https://api.semantest.com/api/v1/admin/users?email=user@company.com"

# 2. Verify SSO configuration
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "https://api.semantest.com/api/v1/admin/sso/config"

# 3. Check authentication logs
journalctl -u semantest --since="1h ago" | grep -E "(login|auth|failed)"
```

**Resolution Steps:**

1. **Verify User Account**
   ```bash
   # Check if user exists and is active
   psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c \
     "SELECT id, email, status, last_login FROM users WHERE email = 'user@company.com';"
   ```

2. **Reset User Session**
   ```bash
   # Clear user sessions
   redis-cli -h $REDIS_HOST DEL "session:user@company.com"
   ```

3. **Verify SSO Configuration**
   ```bash
   # Test SSO endpoint
   curl -X POST https://sso.company.com/api/validate \
     -H "Content-Type: application/json" \
     -d '{"username": "testuser", "password": "testpass"}'
   ```

4. **Check Certificate Validity**
   ```bash
   # Verify SAML certificate
   openssl x509 -in /etc/ssl/certs/saml.crt -text -noout | grep -E "(Not Before|Not After)"
   ```

**Prevention:**
- Set up SSO health monitoring
- Implement automated certificate renewal
- Configure authentication failure alerts

### Playbook: API Authentication Failures

**Symptoms:**
- 401 Unauthorized responses
- Invalid API key errors
- Token expiration issues

**Diagnostic Steps:**

```bash
# 1. Validate API key format
echo $API_KEY | grep -E '^sk_[a-zA-Z0-9]{32}$'

# 2. Check API key status
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "https://api.semantest.com/api/v1/admin/api-keys" | \
  jq '.data[] | select(.key_prefix == "'$(echo $API_KEY | cut -c1-8)'")'

# 3. Test token validation
curl -H "Authorization: Bearer $API_KEY" \
  "https://api.semantest.com/api/v1/auth/validate"
```

**Resolution Steps:**

1. **Regenerate API Key**
   ```bash
   # Generate new API key
   curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" \
     "https://api.semantest.com/api/v1/admin/api-keys" \
     -d '{"name": "New API Key", "permissions": ["read:tests", "write:tests"]}'
   ```

2. **Update Token Expiration**
   ```bash
   # Extend token expiration
   redis-cli -h $REDIS_HOST EXPIRE "token:$TOKEN_ID" 86400
   ```

## Test Execution Problems

### Playbook: Tests Stuck in Queue

**Symptoms:**
- Tests remain in "queued" status
- No test execution progress
- Queue backup

**Diagnostic Steps:**

```bash
# 1. Check queue status
redis-cli -h $REDIS_HOST -p $REDIS_PORT info replication
redis-cli -h $REDIS_HOST -p $REDIS_PORT llen semantest:queue

# 2. Check worker processes
ps aux | grep semantest-worker | grep -v grep

# 3. Monitor queue processing
redis-cli -h $REDIS_HOST -p $REDIS_PORT monitor | grep semantest:queue
```

**Resolution Steps:**

1. **Restart Queue Workers**
   ```bash
   # Restart worker processes
   sudo systemctl restart semantest-workers
   
   # Verify workers are running
   ps aux | grep semantest-worker | wc -l
   ```

2. **Clear Stuck Jobs**
   ```bash
   # List stuck jobs
   redis-cli -h $REDIS_HOST LRANGE semantest:queue 0 -1
   
   # Remove specific stuck job
   redis-cli -h $REDIS_HOST LREM semantest:queue 1 "job_id_here"
   ```

3. **Scale Workers**
   ```bash
   # Add more workers (Kubernetes)
   kubectl scale deployment semantest-workers --replicas=10
   
   # Docker Swarm
   docker service scale semantest_workers=10
   ```

### Playbook: Test Failures Due to Browser Issues

**Symptoms:**
- Browser crashes during test execution
- "Browser not found" errors
- Selenium/WebDriver timeouts

**Diagnostic Steps:**

```bash
# 1. Check browser installation
google-chrome --version
firefox --version
which chromedriver
which geckodriver

# 2. Test browser launch
google-chrome --headless --no-sandbox --dump-dom https://example.com

# 3. Check Selenium grid status
curl http://selenium-hub:4444/grid/api/hub/status
```

**Resolution Steps:**

1. **Update Browser Drivers**
   ```bash
   # Update ChromeDriver
   CHROME_VERSION=$(google-chrome --version | cut -d' ' -f3 | cut -d'.' -f1)
   wget -O /usr/local/bin/chromedriver \
     "https://chromedriver.storage.googleapis.com/LATEST_RELEASE_$CHROME_VERSION/chromedriver_linux64.zip"
   chmod +x /usr/local/bin/chromedriver
   ```

2. **Fix Browser Permissions**
   ```bash
   # Set proper permissions
   sudo chown -R semantest:semantest /opt/google/chrome
   sudo chmod 755 /opt/google/chrome/chrome
   ```

3. **Restart Selenium Grid**
   ```bash
   # Docker Compose
   docker-compose restart selenium-hub selenium-chrome selenium-firefox
   
   # Kubernetes
   kubectl rollout restart deployment/selenium-hub
   kubectl rollout restart deployment/selenium-chrome
   ```

## Performance Issues

### Playbook: Slow Test Execution

**Symptoms:**
- Tests taking longer than expected
- Timeout errors
- High resource usage

**Diagnostic Steps:**

```bash
# 1. Monitor system resources
top -p $(pgrep -d',' semantest)
iostat -x 1 5
netstat -i

# 2. Check database performance
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c \
  "SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"

# 3. Analyze test execution times
curl -H "Authorization: Bearer $API_KEY" \
  "https://api.semantest.com/api/v1/analytics/performance?start_date=2025-01-18"
```

**Resolution Steps:**

1. **Optimize Database Queries**
   ```sql
   -- Add missing indexes
   CREATE INDEX CONCURRENTLY idx_test_results_execution_id 
   ON test_results(execution_id);
   
   -- Update statistics
   ANALYZE;
   
   -- Check slow queries
   SELECT query, mean_time, calls 
   FROM pg_stat_statements 
   WHERE mean_time > 1000 
   ORDER BY mean_time DESC;
   ```

2. **Scale Resources**
   ```bash
   # Increase worker memory (Kubernetes)
   kubectl patch deployment semantest-workers -p \
     '{"spec":{"template":{"spec":{"containers":[{"name":"worker","resources":{"requests":{"memory":"4Gi"},"limits":{"memory":"8Gi"}}}]}}}}'
   
   # Scale horizontally
   kubectl scale deployment semantest-workers --replicas=20
   ```

3. **Enable Caching**
   ```bash
   # Configure Redis caching
   redis-cli -h $REDIS_HOST CONFIG SET maxmemory 4gb
   redis-cli -h $REDIS_HOST CONFIG SET maxmemory-policy allkeys-lru
   ```

### Playbook: Database Performance Issues

**Symptoms:**
- Slow query responses
- Database connection timeouts
- High CPU usage on database server

**Diagnostic Steps:**

```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Identify slow queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query 
FROM pg_stat_activity 
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';

-- Check table sizes
SELECT schemaname,tablename,attname,n_distinct,correlation 
FROM pg_stats 
WHERE schemaname='public' 
ORDER BY n_distinct DESC;
```

**Resolution Steps:**

1. **Kill Long-Running Queries**
   ```sql
   -- Identify and kill blocking queries
   SELECT pg_terminate_backend(pid) 
   FROM pg_stat_activity 
   WHERE (now() - pg_stat_activity.query_start) > interval '10 minutes';
   ```

2. **Optimize Database Configuration**
   ```bash
   # Update postgresql.conf
   echo "shared_buffers = 4GB" >> /etc/postgresql/13/main/postgresql.conf
   echo "work_mem = 256MB" >> /etc/postgresql/13/main/postgresql.conf
   echo "maintenance_work_mem = 2GB" >> /etc/postgresql/13/main/postgresql.conf
   
   # Restart PostgreSQL
   sudo systemctl restart postgresql
   ```

3. **Implement Connection Pooling**
   ```bash
   # Configure PgBouncer
   cat > /etc/pgbouncer/pgbouncer.ini << EOF
   [databases]
   semantest = host=localhost port=5432 dbname=semantest
   
   [pgbouncer]
   pool_mode = transaction
   max_client_conn = 1000
   default_pool_size = 50
   EOF
   
   sudo systemctl restart pgbouncer
   ```

## Infrastructure Problems

### Playbook: Container/Pod Crashes

**Symptoms:**
- Services restarting frequently
- Out of memory errors
- Pod evictions

**Diagnostic Steps:**

```bash
# Kubernetes diagnostics
kubectl get pods -n semantest-production
kubectl describe pod <pod-name> -n semantest-production
kubectl logs <pod-name> -n semantest-production --previous

# Docker diagnostics
docker ps -a | grep semantest
docker logs <container-id>
docker stats <container-id>
```

**Resolution Steps:**

1. **Increase Resource Limits**
   ```yaml
   # Update deployment.yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: semantest-api
   spec:
     template:
       spec:
         containers:
         - name: api
           resources:
             requests:
               memory: "2Gi"
               cpu: "1000m"
             limits:
               memory: "4Gi"
               cpu: "2000m"
   ```

2. **Fix Memory Leaks**
   ```bash
   # Monitor memory usage
   kubectl top pods -n semantest-production
   
   # Enable heap dumps for Node.js apps
   kubectl set env deployment/semantest-api NODE_OPTIONS="--max-old-space-size=4096 --heapsnapshot-signal=SIGUSR2"
   ```

3. **Implement Health Checks**
   ```yaml
   # Add liveness and readiness probes
   livenessProbe:
     httpGet:
       path: /health
       port: 8080
     initialDelaySeconds: 30
     periodSeconds: 10
   
   readinessProbe:
     httpGet:
       path: /ready
       port: 8080
     initialDelaySeconds: 5
     periodSeconds: 5
   ```

### Playbook: Load Balancer Issues

**Symptoms:**
- 502/503 gateway errors
- Uneven traffic distribution
- Health check failures

**Diagnostic Steps:**

```bash
# Check load balancer status
kubectl get ingress -n semantest-production
kubectl describe ingress semantest-ingress -n semantest-production

# Test backend health
for backend in $(kubectl get endpoints semantest-api -o jsonpath='{.subsets[*].addresses[*].ip}'); do
  curl -f http://$backend:8080/health || echo "Backend $backend failed"
done

# Check certificates
openssl s_client -connect api.semantest.com:443 -servername api.semantest.com
```

**Resolution Steps:**

1. **Fix Backend Health**
   ```bash
   # Restart unhealthy pods
   kubectl delete pods -l app=semantest-api -n semantest-production
   
   # Check pod readiness
   kubectl get pods -l app=semantest-api -n semantest-production -w
   ```

2. **Update Load Balancer Configuration**
   ```yaml
   # nginx.conf
   upstream semantest_backend {
     least_conn;
     server 10.0.1.10:8080 max_fails=3 fail_timeout=30s;
     server 10.0.1.11:8080 max_fails=3 fail_timeout=30s;
     server 10.0.1.12:8080 max_fails=3 fail_timeout=30s;
   }
   
   server {
     location / {
       proxy_pass http://semantest_backend;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_connect_timeout 5s;
       proxy_read_timeout 60s;
     }
   }
   ```

## Network & Connectivity

### Playbook: External Service Integration Failures

**Symptoms:**
- GitHub webhook failures
- Slack notification errors
- Third-party API timeouts

**Diagnostic Steps:**

```bash
# Test external connectivity
curl -v https://api.github.com
curl -v https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX

# Check DNS resolution
nslookup api.github.com
dig +short api.github.com

# Test from inside containers
kubectl exec -it <pod-name> -- curl -v https://api.github.com
```

**Resolution Steps:**

1. **Fix DNS Configuration**
   ```bash
   # Update DNS servers
   echo "nameserver 8.8.8.8" >> /etc/resolv.conf
   echo "nameserver 8.8.4.4" >> /etc/resolv.conf
   
   # Restart network service
   sudo systemctl restart networking
   ```

2. **Configure Proxy Settings**
   ```bash
   # Set proxy environment variables
   export HTTP_PROXY=http://proxy.company.com:8080
   export HTTPS_PROXY=http://proxy.company.com:8080
   export NO_PROXY=localhost,127.0.0.1,.company.com
   
   # Update container configuration
   kubectl set env deployment/semantest-api HTTP_PROXY=$HTTP_PROXY
   ```

3. **Update Firewall Rules**
   ```bash
   # Allow outbound HTTPS
   sudo ufw allow out 443/tcp
   sudo ufw allow out 80/tcp
   
   # Allow specific webhook endpoints
   sudo iptables -A OUTPUT -d api.github.com -p tcp --dport 443 -j ACCEPT
   ```

## Browser & Device Problems

### Playbook: Cross-Browser Test Failures

**Symptoms:**
- Tests passing in Chrome but failing in Firefox
- Safari-specific issues
- Mobile browser problems

**Diagnostic Steps:**

```bash
# Check browser versions
google-chrome --version
firefox --version
/Applications/Safari.app/Contents/MacOS/Safari --version

# Test browser capabilities
curl http://selenium-hub:4444/grid/api/hub/status | jq '.value.nodes'

# Check mobile browser grid
adb devices
xcrun simctl list devices
```

**Resolution Steps:**

1. **Update Browser Grid**
   ```yaml
   # docker-compose.yml for Selenium Grid
   version: '3.8'
   services:
     selenium-hub:
       image: selenium/hub:4.15.0
       ports:
         - "4444:4444"
     
     chrome:
       image: selenium/node-chrome:4.15.0
       environment:
         - HUB_HOST=selenium-hub
         - NODE_MAX_INSTANCES=3
     
     firefox:
       image: selenium/node-firefox:4.15.0
       environment:
         - HUB_HOST=selenium-hub
         - NODE_MAX_INSTANCES=3
     
     safari:
       image: selenium/node-safari:4.15.0
       environment:
         - HUB_HOST=selenium-hub
   ```

2. **Fix Browser-Specific Issues**
   ```javascript
   // Handle browser differences in test code
   const browserSpecificConfig = {
     chrome: {
       args: ['--no-sandbox', '--disable-dev-shm-usage'],
       prefs: { 'profile.default_content_setting_values.notifications': 2 }
     },
     firefox: {
       prefs: { 'dom.webnotifications.enabled': false },
       args: ['--headless']
     },
     safari: {
       safariOptions: { 'webkit:WebRTC': { DisableInsecureMediaCapture: true } }
     }
   };
   ```

## API & Integration Issues

### Playbook: Webhook Delivery Failures

**Symptoms:**
- Missing webhook notifications
- Webhook timeout errors
- Failed delivery attempts

**Diagnostic Steps:**

```bash
# Check webhook configuration
curl -H "Authorization: Bearer $API_KEY" \
  "https://api.semantest.com/api/v1/webhooks"

# Test webhook endpoint
curl -X POST https://your-app.com/semantest-webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "webhook"}'

# Check delivery logs
journalctl -u semantest --since="1h ago" | grep webhook
```

**Resolution Steps:**

1. **Verify Endpoint Accessibility**
   ```bash
   # Test from Semantest servers
   curl -X POST https://your-app.com/semantest-webhook \
     -H "Content-Type: application/json" \
     -H "X-Semantest-Signature: sha256=test" \
     -d '{"event": "test", "data": {}}'
   ```

2. **Update Webhook Configuration**
   ```bash
   # Update webhook URL
   curl -X PATCH \
     -H "Authorization: Bearer $API_KEY" \
     -H "Content-Type: application/json" \
     "https://api.semantest.com/api/v1/webhooks/hook_123" \
     -d '{"url": "https://new-endpoint.com/webhook", "active": true}'
   ```

3. **Implement Retry Logic**
   ```javascript
   // Webhook handler with retry
   app.post('/semantest-webhook', async (req, res) => {
     try {
       await processWebhook(req.body);
       res.status(200).send('OK');
     } catch (error) {
       console.error('Webhook processing failed:', error);
       res.status(500).send('Internal Server Error');
     }
   });
   ```

## Emergency Procedures

### Emergency Response Checklist

**Severity 1 - Critical System Outage**

```bash
# Immediate Response (0-15 minutes)
1. Acknowledge incident
2. Activate incident response team
3. Check system status dashboard
4. Verify external dependencies

# Investigation (15-30 minutes)
1. Review recent deployments
2. Check infrastructure metrics
3. Analyze error logs
4. Identify root cause

# Mitigation (30-60 minutes)
1. Implement immediate fix or rollback
2. Communicate status to stakeholders
3. Monitor system recovery
4. Document actions taken
```

### Rollback Procedures

**Application Rollback (Kubernetes)**

```bash
# Check deployment history
kubectl rollout history deployment/semantest-api -n semantest-production

# Rollback to previous version
kubectl rollout undo deployment/semantest-api -n semantest-production

# Rollback to specific revision
kubectl rollout undo deployment/semantest-api --to-revision=3 -n semantest-production

# Monitor rollback progress
kubectl rollout status deployment/semantest-api -n semantest-production
```

**Database Rollback**

```bash
# Stop application
kubectl scale deployment semantest-api --replicas=0 -n semantest-production

# Restore from backup
pg_restore -h $DB_HOST -U $DB_USER -d semantest_backup /backups/semantest_20250119.dump

# Verify data integrity
psql -h $DB_HOST -U $DB_USER -d semantest -c "SELECT COUNT(*) FROM tests;"

# Restart application
kubectl scale deployment semantest-api --replicas=5 -n semantest-production
```

### Communication Templates

**Incident Notification Template**

```
🚨 INCIDENT ALERT - Semantest Enterprise

Status: INVESTIGATING
Severity: High
Impact: Test execution unavailable
Started: 2025-01-19 10:30 UTC

We are investigating reports of test execution failures. 
New test runs are currently queued and will execute once resolved.

Next Update: 11:00 UTC
Status Page: https://status.semantest.com
```

**Resolution Notification Template**

```
✅ RESOLVED - Semantest Enterprise

The issue with test execution has been resolved.
All queued tests are now processing normally.

Root Cause: Database connection pool exhaustion
Fix Applied: Increased connection pool size and added monitoring

Duration: 45 minutes
Affected: Test execution service
Post-Mortem: Will be published within 24 hours
```

This comprehensive troubleshooting guide provides systematic approaches to diagnosing and resolving common Semantest Enterprise issues, with emphasis on quick resolution and prevention strategies.

---

**Last Updated**: January 19, 2025  
**Version**: 1.0.0  
**Maintainer**: Semantest Enterprise Support Team  
**Support**: enterprise-support@semantest.com