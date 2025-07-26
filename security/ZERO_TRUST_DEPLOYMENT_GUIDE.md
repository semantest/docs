# Zero-Trust Security Framework Deployment Guide
**Production Deployment & Configuration Manual**

## Overview

This guide provides step-by-step instructions for deploying the Zero-Trust Security Framework in production environments with high availability, scalability, and security.

### Architecture Deployment

```
┌─────────────────────────────────────────────────────────────┐
│                    LOAD BALANCER (HAProxy/NGINX)            │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                ZERO-TRUST GATEWAY CLUSTER                   │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │   Gateway 1  │ │   Gateway 2  │ │   Gateway 3  │        │
│  │              │ │              │ │              │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                  REDIS CLUSTER                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │   Master 1   │ │   Master 2   │ │   Master 3   │        │
│  │   Slave 1    │ │   Slave 2    │ │   Slave 3    │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                MICROSERVICES CLUSTER                        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │   Service A  │ │   Service B  │ │   Service C  │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

### System Requirements
```yaml
minimum_requirements:
  cpu: "4 cores"
  memory: "8GB RAM"
  storage: "100GB SSD"
  network: "1Gbps"

recommended_requirements:
  cpu: "8 cores"
  memory: "32GB RAM"
  storage: "500GB NVMe SSD"
  network: "10Gbps"

high_availability:
  instances: 3
  load_balancer: "required"
  database_cluster: "required"
  monitoring: "required"
```

### Dependencies
```bash
# Required software
- Node.js 18+ or Docker
- Redis 6.0+
- PostgreSQL 13+ (optional, for persistent storage)
- Nginx or HAProxy (for load balancing)
- Prometheus + Grafana (for monitoring)
- ELK Stack or similar (for logging)
```

---

## Installation Methods

### Method 1: Docker Deployment (Recommended)

#### 1. Clone Repository and Prepare Environment
```bash
# Clone the security framework
git clone https://github.com/your-org/zero-trust-security-framework.git
cd zero-trust-security-framework

# Create environment configuration
cp .env.example .env.production
```

#### 2. Configure Environment Variables
```bash
# .env.production
NODE_ENV=production

# JWT Configuration
JWT_ACCESS_SECRET=your-super-secure-access-secret-here-256-bits
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-here-256-bits

# Redis Configuration
REDIS_HOST=redis-cluster.internal
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_CLUSTER_ENABLED=true

# Database Configuration (Optional)
DATABASE_URL=postgresql://user:password@postgres-cluster.internal:5432/security_framework
DATABASE_POOL_SIZE=10

# Security Configuration
ENABLE_RATE_LIMITING=true
ENABLE_DDOS_PROTECTION=true
ENABLE_INTRUSION_DETECTION=true
ENABLE_THREAT_RESPONSE=true

# DDoS Protection Settings
DDOS_DETECTION_THRESHOLD=100
DDOS_BLOCK_DURATION=3600
DDOS_WHITELIST_ENABLED=true
DDOS_GEO_BLOCKING=true

# Rate Limiting Settings
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_SKIP_SUCCESSFUL=false

# Monitoring Configuration
ENABLE_PROMETHEUS_METRICS=true
ENABLE_GRAFANA_DASHBOARDS=true
SIEM_INTEGRATION_ENABLED=true
SIEM_TYPE=elastic
SIEM_ENDPOINT=https://elasticsearch.internal:9200
SIEM_API_KEY=your-siem-api-key

# Notification Configuration
NOTIFICATION_EMAIL_ENABLED=true
NOTIFICATION_SLACK_ENABLED=true
NOTIFICATION_WEBHOOK_ENABLED=true
SMTP_HOST=smtp.company.com
SMTP_PORT=587
SMTP_USER=security-alerts@company.com
SMTP_PASS=your-smtp-password
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# TLS Configuration
TLS_CERT_PATH=/etc/ssl/certs/server.crt
TLS_KEY_PATH=/etc/ssl/private/server.key
FORCE_HTTPS=true

# High Availability Settings
CLUSTER_MODE=true
CLUSTER_INSTANCES=3
HEALTH_CHECK_INTERVAL=30000
```

#### 3. Docker Compose Setup
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  # Load Balancer
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
    depends_on:
      - security-gateway-1
      - security-gateway-2
      - security-gateway-3
    restart: unless-stopped

  # Security Gateway Cluster
  security-gateway-1:
    build: .
    environment:
      - NODE_ENV=production
      - INSTANCE_ID=gateway-1
      - PORT=3000
    env_file:
      - .env.production
    depends_on:
      - redis-master-1
      - redis-master-2
      - redis-master-3
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 4G
          cpus: '2'

  security-gateway-2:
    build: .
    environment:
      - NODE_ENV=production
      - INSTANCE_ID=gateway-2
      - PORT=3000
    env_file:
      - .env.production
    depends_on:
      - redis-master-1
      - redis-master-2
      - redis-master-3
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 4G
          cpus: '2'

  security-gateway-3:
    build: .
    environment:
      - NODE_ENV=production
      - INSTANCE_ID=gateway-3
      - PORT=3000
    env_file:
      - .env.production
    depends_on:
      - redis-master-1
      - redis-master-2
      - redis-master-3
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 4G
          cpus: '2'

  # Redis Cluster
  redis-master-1:
    image: redis:7-alpine
    command: redis-server --port 7001 --cluster-enabled yes --cluster-config-file nodes.conf --cluster-node-timeout 5000 --appendonly yes
    ports:
      - "7001:7001"
    volumes:
      - redis-data-1:/data
    restart: unless-stopped

  redis-master-2:
    image: redis:7-alpine
    command: redis-server --port 7002 --cluster-enabled yes --cluster-config-file nodes.conf --cluster-node-timeout 5000 --appendonly yes
    ports:
      - "7002:7002"
    volumes:
      - redis-data-2:/data
    restart: unless-stopped

  redis-master-3:
    image: redis:7-alpine
    command: redis-server --port 7003 --cluster-enabled yes --cluster-config-file nodes.conf --cluster-node-timeout 5000 --appendonly yes
    ports:
      - "7003:7003"
    volumes:
      - redis-data-3:/data
    restart: unless-stopped

  # Monitoring Stack
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
    restart: unless-stopped

  # Elasticsearch for SIEM
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms1g -Xmx1g"
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch-data:/usr/share/elasticsearch/data
    restart: unless-stopped

  # Kibana for SIEM Visualization
  kibana:
    image: docker.elastic.co/kibana/kibana:8.11.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch
    restart: unless-stopped

volumes:
  redis-data-1:
  redis-data-2:
  redis-data-3:
  prometheus-data:
  grafana-data:
  elasticsearch-data:

networks:
  default:
    driver: bridge
```

#### 4. Nginx Configuration
```nginx
# nginx/nginx.conf
upstream security_gateway {
    least_conn;
    server security-gateway-1:3000 max_fails=3 fail_timeout=30s;
    server security-gateway-2:3000 max_fails=3 fail_timeout=30s;
    server security-gateway-3:3000 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/ssl/server.crt;
    ssl_certificate_key /etc/ssl/server.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
    limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;

    location / {
        proxy_pass http://security_gateway;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
    }

    location /auth/login {
        limit_req zone=login burst=3 nodelay;
        proxy_pass http://security_gateway;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        limit_req zone=api burst=50 nodelay;
        proxy_pass http://security_gateway;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check endpoint
    location /health {
        access_log off;
        proxy_pass http://security_gateway/health;
    }
}
```

#### 5. Deploy the Stack
```bash
# Start the complete stack
docker-compose -f docker-compose.prod.yml up -d

# Initialize Redis cluster
docker exec -it redis-master-1 redis-cli --cluster create \
  redis-master-1:7001 redis-master-2:7002 redis-master-3:7003 \
  --cluster-replicas 0 --cluster-yes

# Verify deployment
docker-compose -f docker-compose.prod.yml ps
curl -k https://your-domain.com/health
```

---

### Method 2: Kubernetes Deployment

#### 1. Kubernetes Manifests
```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: zero-trust-security
---
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: security-config
  namespace: zero-trust-security
data:
  NODE_ENV: "production"
  REDIS_HOST: "redis-service"
  REDIS_PORT: "6379"
  ENABLE_RATE_LIMITING: "true"
  ENABLE_DDOS_PROTECTION: "true"
  ENABLE_INTRUSION_DETECTION: "true"
---
# k8s/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: security-secrets
  namespace: zero-trust-security
type: Opaque
stringData:
  JWT_ACCESS_SECRET: "your-super-secure-access-secret"
  JWT_REFRESH_SECRET: "your-super-secure-refresh-secret"
  REDIS_PASSWORD: "your-redis-password"
---
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: security-gateway
  namespace: zero-trust-security
spec:
  replicas: 3
  selector:
    matchLabels:
      app: security-gateway
  template:
    metadata:
      labels:
        app: security-gateway
    spec:
      containers:
      - name: security-gateway
        image: your-registry/zero-trust-security:latest
        ports:
        - containerPort: 3000
        envFrom:
        - configMapRef:
            name: security-config
        - secretRef:
            name: security-secrets
        resources:
          requests:
            memory: "2Gi"
            cpu: "1"
          limits:
            memory: "4Gi"
            cpu: "2"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: security-gateway-service
  namespace: zero-trust-security
spec:
  selector:
    app: security-gateway
  ports:
  - port: 80
    targetPort: 3000
  type: ClusterIP
---
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: security-gateway-ingress
  namespace: zero-trust-security
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - your-domain.com
    secretName: security-gateway-tls
  rules:
  - host: your-domain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: security-gateway-service
            port:
              number: 80
```

#### 2. Deploy to Kubernetes
```bash
# Apply manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml

# Verify deployment
kubectl get pods -n zero-trust-security
kubectl get services -n zero-trust-security
kubectl get ingress -n zero-trust-security
```

---

## Configuration

### Security Configuration

#### 1. JWT Token Configuration
```typescript
// config/jwt.config.ts
export const jwtConfig = {
  accessToken: {
    secret: process.env.JWT_ACCESS_SECRET,
    expiresIn: '15m',
    algorithm: 'HS256'
  },
  refreshToken: {
    secret: process.env.JWT_REFRESH_SECRET,
    expiresIn: '7d',
    algorithm: 'HS256'
  },
  keyRotation: {
    enabled: true,
    intervalDays: 30,
    gracePeriodDays: 7
  }
};
```

#### 2. Rate Limiting Configuration
```typescript
// config/rate-limit.config.ts
export const rateLimitConfig = {
  global: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 1000,
    skipSuccessfulRequests: false
  },
  authentication: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
    skipSuccessfulRequests: false
  },
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    skipSuccessfulRequests: true
  }
};
```

#### 3. DDoS Protection Configuration
```typescript
// config/ddos.config.ts
export const ddosConfig = {
  detection: {
    threshold: 100,
    window: 60000,
    enabled: true
  },
  blocking: {
    duration: 3600,
    enabled: true
  },
  whitelist: {
    enabled: true,
    ips: ['127.0.0.1', '::1']
  },
  geoblocking: {
    enabled: true,
    blockedCountries: ['CN', 'RU', 'KP']
  }
};
```

#### 4. Monitoring Configuration
```typescript
// config/monitoring.config.ts
export const monitoringConfig = {
  metrics: {
    enabled: true,
    interval: 30000,
    retention: 30 * 24 * 60 * 60 * 1000 // 30 days
  },
  alerts: {
    enabled: true,
    channels: {
      email: true,
      slack: true,
      webhook: true
    },
    thresholds: {
      critical: 1,
      high: 5,
      medium: 10
    }
  },
  siem: {
    enabled: true,
    type: 'elastic',
    endpoint: process.env.SIEM_ENDPOINT,
    apiKey: process.env.SIEM_API_KEY
  }
};
```

---

## Monitoring and Observability

### Prometheus Metrics Configuration
```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "security_alerts.yml"

scrape_configs:
  - job_name: 'security-gateway'
    static_configs:
      - targets: ['security-gateway-1:3000', 'security-gateway-2:3000', 'security-gateway-3:3000']
    metrics_path: /metrics
    scrape_interval: 10s

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-master-1:7001', 'redis-master-2:7002', 'redis-master-3:7003']

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
```

### Grafana Dashboards
```json
{
  "dashboard": {
    "title": "Zero-Trust Security Dashboard",
    "panels": [
      {
        "title": "Threat Detection Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(security_threats_detected_total[5m])",
            "legendFormat": "Threats/sec"
          }
        ]
      },
      {
        "title": "Authentication Success Rate",
        "type": "singlestat",
        "targets": [
          {
            "expr": "rate(auth_successful_total[5m]) / rate(auth_attempts_total[5m]) * 100",
            "legendFormat": "Success %"
          }
        ]
      },
      {
        "title": "Active Security Incidents",
        "type": "table",
        "targets": [
          {
            "expr": "security_incidents_active",
            "legendFormat": "Active Incidents"
          }
        ]
      }
    ]
  }
}
```

---

## Maintenance and Updates

### Backup Procedures
```bash
#!/bin/bash
# backup.sh - Automated backup script

BACKUP_DIR="/backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

# Backup Redis data
docker exec redis-master-1 redis-cli --rdb /data/backup.rdb
docker cp redis-master-1:/data/backup.rdb $BACKUP_DIR/redis-backup.rdb

# Backup configuration
cp -r config/ $BACKUP_DIR/
cp .env.production $BACKUP_DIR/

# Backup certificates
cp -r ssl/ $BACKUP_DIR/

# Create archive
tar -czf $BACKUP_DIR.tar.gz $BACKUP_DIR
rm -rf $BACKUP_DIR

echo "Backup completed: $BACKUP_DIR.tar.gz"
```

### Update Procedures
```bash
#!/bin/bash
# update.sh - Rolling update script

echo "Starting rolling update..."

# Pull new images
docker-compose -f docker-compose.prod.yml pull

# Update services one by one
for service in security-gateway-1 security-gateway-2 security-gateway-3; do
    echo "Updating $service..."
    
    # Stop service
    docker-compose -f docker-compose.prod.yml stop $service
    
    # Start with new image
    docker-compose -f docker-compose.prod.yml up -d $service
    
    # Wait for health check
    sleep 30
    
    # Verify service is healthy
    if ! curl -f http://localhost/health; then
        echo "Health check failed for $service"
        exit 1
    fi
    
    echo "$service updated successfully"
done

echo "Rolling update completed"
```

### Health Checks
```bash
#!/bin/bash
# health-check.sh - Comprehensive health check

echo "🔍 Zero-Trust Security Framework Health Check"
echo "============================================="

# Check gateway services
for i in {1..3}; do
    if curl -sf http://security-gateway-$i:3000/health > /dev/null; then
        echo "✅ Gateway $i: Healthy"
    else
        echo "❌ Gateway $i: Unhealthy"
    fi
done

# Check Redis cluster
if docker exec redis-master-1 redis-cli cluster info | grep -q "cluster_state:ok"; then
    echo "✅ Redis Cluster: Healthy"
else
    echo "❌ Redis Cluster: Unhealthy"
fi

# Check monitoring
if curl -sf http://prometheus:9090/-/healthy > /dev/null; then
    echo "✅ Prometheus: Healthy"
else
    echo "❌ Prometheus: Unhealthy"
fi

if curl -sf http://grafana:3000/api/health > /dev/null; then
    echo "✅ Grafana: Healthy"
else
    echo "❌ Grafana: Unhealthy"
fi

# Check SIEM integration
if curl -sf http://elasticsearch:9200/_cluster/health > /dev/null; then
    echo "✅ Elasticsearch: Healthy"
else
    echo "❌ Elasticsearch: Unhealthy"
fi

echo "============================================="
echo "Health check completed"
```

---

## Security Hardening

### OS Level Hardening
```bash
#!/bin/bash
# harden-system.sh - System hardening script

# Update system
apt update && apt upgrade -y

# Install security tools
apt install -y fail2ban ufw rkhunter chkrootkit

# Configure firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# Configure fail2ban
cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
EOF

systemctl enable fail2ban
systemctl start fail2ban

# Disable unnecessary services
systemctl disable telnet
systemctl disable ftp
systemctl disable rsh
systemctl disable rlogin

# Set up automatic security updates
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades

echo "System hardening completed"
```

### Container Security
```dockerfile
# Dockerfile.security - Hardened Docker image
FROM node:18-alpine

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S security -u 1001

# Set working directory
WORKDIR /app

# Install dependencies first (for better caching)
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY --chown=security:nodejs . .

# Remove unnecessary packages
RUN apk del npm

# Switch to non-root user
USER security

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start application
CMD ["node", "server.js"]
```

---

## Troubleshooting

### Common Issues and Solutions

#### Issue: High Memory Usage
```bash
# Check memory usage
docker stats

# Solution: Adjust container memory limits
docker-compose -f docker-compose.prod.yml up -d --scale security-gateway-1=1 \
  --memory=2g --cpus=1
```

#### Issue: Redis Connection Errors
```bash
# Check Redis cluster status
docker exec redis-master-1 redis-cli cluster info

# Solution: Restart Redis cluster
docker-compose -f docker-compose.prod.yml restart redis-master-1 redis-master-2 redis-master-3
```

#### Issue: Authentication Failures
```bash
# Check JWT configuration
docker exec security-gateway-1 printenv | grep JWT

# Solution: Verify JWT secrets are properly set
kubectl get secret security-secrets -o yaml
```

### Log Analysis
```bash
# Centralized logging with ELK
docker logs security-gateway-1 | grep ERROR
docker logs security-gateway-2 | grep SECURITY
docker logs security-gateway-3 | grep ALERT

# Query Elasticsearch for security events
curl -X GET "elasticsearch:9200/security-logs/_search" -H 'Content-Type: application/json' -d'
{
  "query": {
    "range": {
      "timestamp": {
        "gte": "now-1h"
      }
    }
  },
  "sort": [
    {
      "timestamp": {
        "order": "desc"
      }
    }
  ]
}
'
```

---

## Performance Tuning

### Redis Optimization
```bash
# Redis cluster optimization
redis-cli config set maxmemory-policy allkeys-lru
redis-cli config set maxmemory 2gb
redis-cli config set save "900 1 300 10 60 10000"
```

### Node.js Optimization
```bash
# Environment variables for production
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=4096"
export UV_THREADPOOL_SIZE=32
```

### Load Balancer Optimization
```nginx
# Nginx performance tuning
worker_processes auto;
worker_connections 4096;
keepalive_timeout 65;
keepalive_requests 1000;

# Enable gzip compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain application/json application/javascript text/css;
```

---

This deployment guide provides a comprehensive foundation for deploying the Zero-Trust Security Framework in production environments. Customize the configurations based on your specific infrastructure requirements and security policies.