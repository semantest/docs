# Staging Deployment Guide

## Overview

This guide covers the staging deployment process for Semantest, leveraging Dana's world-class infrastructure with blue-green deployment strategy.

## Infrastructure Overview

### Dana's Production-Grade Setup
- **6-node Redis HA cluster** for BullMQ job processing
- **Auto-scaling Kubernetes** with HPA (Horizontal Pod Autoscaler)
- **Blue-Green deployment** for zero-downtime releases
- **Full observability stack** with Prometheus, Grafana, and Jaeger
- **CDN optimization** for addon serving

## Blue-Green Deployment Strategy

### Architecture

```yaml
# k8s/staging/blue-green-config.yaml
apiVersion: v1
kind: Service
metadata:
  name: semantest-api
  namespace: staging
spec:
  selector:
    app: semantest-api
    version: $ACTIVE_COLOR  # blue or green
  ports:
    - port: 80
      targetPort: 3000
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: semantest-api-blue
  namespace: staging
spec:
  replicas: 3
  selector:
    matchLabels:
      app: semantest-api
      version: blue
  template:
    metadata:
      labels:
        app: semantest-api
        version: blue
    spec:
      containers:
      - name: api
        image: semantest/api:$BLUE_VERSION
        env:
        - name: REDIS_CLUSTER
          value: "redis-cluster.staging:6379"
        - name: NODE_ENV
          value: "staging"
```

### Deployment Process

```bash
#!/bin/bash
# deploy-staging.sh

# 1. Build and push new image
NEW_VERSION=$(git rev-parse --short HEAD)
docker build -t semantest/api:$NEW_VERSION .
docker push semantest/api:$NEW_VERSION

# 2. Deploy to inactive color
ACTIVE_COLOR=$(kubectl get service semantest-api -o jsonpath='{.spec.selector.version}')
INACTIVE_COLOR=$([[ "$ACTIVE_COLOR" == "blue" ]] && echo "green" || echo "blue")

echo "Deploying version $NEW_VERSION to $INACTIVE_COLOR environment..."
kubectl set image deployment/semantest-api-$INACTIVE_COLOR \
  api=semantest/api:$NEW_VERSION \
  --namespace=staging

# 3. Wait for rollout
kubectl rollout status deployment/semantest-api-$INACTIVE_COLOR \
  --namespace=staging

# 4. Run health checks
./scripts/health-check.sh $INACTIVE_COLOR

# 5. Switch traffic
if [ $? -eq 0 ]; then
  kubectl patch service semantest-api \
    -p '{"spec":{"selector":{"version":"'$INACTIVE_COLOR'"}}}' \
    --namespace=staging
  echo "✅ Deployment complete! Traffic switched to $INACTIVE_COLOR"
else
  echo "❌ Health checks failed! Traffic remains on $ACTIVE_COLOR"
  exit 1
fi
```

## Environment Configuration

### Staging Environment Variables

```yaml
# k8s/staging/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: semantest-config
  namespace: staging
data:
  API_URL: "https://staging-api.semantest.com"
  WEBSOCKET_URL: "wss://staging-realtime.semantest.com"
  CDN_URL: "https://staging-cdn.semantest.com"
  REDIS_CLUSTER: "redis-node-1:6379,redis-node-2:6379,redis-node-3:6379"
  BULLMQ_CONCURRENCY: "10"
  RATE_LIMIT_WINDOW: "60000"
  RATE_LIMIT_MAX: "100"
  LOG_LEVEL: "debug"
  ENABLE_METRICS: "true"
```

### Secrets Management

```yaml
# k8s/staging/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: semantest-secrets
  namespace: staging
type: Opaque
stringData:
  DALLE_API_KEY: ${DALLE_API_KEY}
  STABLE_DIFFUSION_KEY: ${STABLE_DIFFUSION_KEY}
  MIDJOURNEY_KEY: ${MIDJOURNEY_KEY}
  JWT_SECRET: ${JWT_SECRET}
  WEBHOOK_SECRET: ${WEBHOOK_SECRET}
```

## Redis HA Cluster Setup

### Redis Configuration

```yaml
# k8s/staging/redis-cluster.yaml
apiVersion: redis.io/v1alpha1
kind: RedisCluster
metadata:
  name: redis-cluster
  namespace: staging
spec:
  size: 6
  kubernetesConfig:
    image: redis:7-alpine
    resources:
      requests:
        cpu: 200m
        memory: 256Mi
      limits:
        cpu: 500m
        memory: 512Mi
  storage:
    persistentVolumeClaim:
      storageClassName: fast-ssd
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 10Gi
```

## Auto-Scaling Configuration

### Horizontal Pod Autoscaler

```yaml
# k8s/staging/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: semantest-api-hpa
  namespace: staging
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: semantest-api-$ACTIVE_COLOR
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  - type: Pods
    pods:
      metric:
        name: bullmq_queue_size
      target:
        type: AverageValue
        averageValue: "100"
```

## Health Checks

### Comprehensive Health Check Script

```bash
#!/bin/bash
# scripts/health-check.sh

COLOR=$1
BASE_URL="http://semantest-api-$COLOR.staging.svc.cluster.local"

echo "Running health checks for $COLOR environment..."

# 1. Basic health
HEALTH=$(curl -s "$BASE_URL/api/v1/health")
if [[ $(echo $HEALTH | jq -r '.status') != "healthy" ]]; then
  echo "❌ Basic health check failed"
  exit 1
fi

# 2. Redis connectivity
REDIS_STATUS=$(echo $HEALTH | jq -r '.services.redis.status')
if [[ $REDIS_STATUS != "up" ]]; then
  echo "❌ Redis connectivity failed"
  exit 1
fi

# 3. BullMQ workers
WORKER_COUNT=$(echo $HEALTH | jq -r '.services.bullmq.activeWorkers')
if [[ $WORKER_COUNT -lt 1 ]]; then
  echo "❌ No active BullMQ workers"
  exit 1
fi

# 4. Provider health
for provider in dalle3 stable-diffusion midjourney; do
  PROVIDER_STATUS=$(echo $HEALTH | jq -r ".services.providers.$provider.healthy")
  if [[ $PROVIDER_STATUS != "true" ]]; then
    echo "⚠️  Provider $provider is unhealthy (non-critical)"
  fi
done

# 5. Test API endpoint
TEST_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/test/echo" \
  -H "Content-Type: application/json" \
  -d '{"message":"health-check"}')

if [[ $(echo $TEST_RESPONSE | jq -r '.message') != "health-check" ]]; then
  echo "❌ API endpoint test failed"
  exit 1
fi

echo "✅ All health checks passed!"
exit 0
```

## Monitoring & Observability

### Prometheus Metrics

```yaml
# k8s/staging/prometheus-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: staging
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    scrape_configs:
    - job_name: 'semantest-api'
      kubernetes_sd_configs:
      - role: pod
        namespaces:
          names:
          - staging
      relabel_configs:
      - source_labels: [__meta_kubernetes_pod_label_app]
        action: keep
        regex: semantest-api
      - source_labels: [__meta_kubernetes_pod_name]
        target_label: pod
```

### Grafana Dashboards

Key metrics to monitor:
- **API Response Times**: p50, p95, p99
- **BullMQ Queue Depth**: Jobs waiting/processing
- **Redis Cluster Health**: Memory usage, connection count
- **Provider Success Rates**: Per-provider metrics
- **Error Rates**: 4xx, 5xx responses

## Rollback Procedure

```bash
#!/bin/bash
# rollback-staging.sh

# Quick rollback by switching traffic back
CURRENT_COLOR=$(kubectl get service semantest-api -o jsonpath='{.spec.selector.version}')
PREVIOUS_COLOR=$([[ "$CURRENT_COLOR" == "blue" ]] && echo "green" || echo "blue")

echo "⚠️  Rolling back from $CURRENT_COLOR to $PREVIOUS_COLOR..."

kubectl patch service semantest-api \
  -p '{"spec":{"selector":{"version":"'$PREVIOUS_COLOR'"}}}' \
  --namespace=staging

echo "✅ Rollback complete! Traffic switched to $PREVIOUS_COLOR"

# Optional: Scale down failed deployment
kubectl scale deployment semantest-api-$CURRENT_COLOR --replicas=0 \
  --namespace=staging
```

## Post-Deployment Validation

```bash
# Smoke tests
npm run test:staging

# Load test (controlled)
npm run load:staging -- --users 50 --duration 5m

# Check metrics
kubectl port-forward -n staging svc/grafana 3000:3000
# Visit http://localhost:3000
```

## CI/CD Integration

```yaml
# .github/workflows/deploy-staging.yml
name: Deploy to Staging

on:
  push:
    branches: [develop]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Build and push image
      run: |
        docker build -t semantest/api:${{ github.sha }} .
        docker push semantest/api:${{ github.sha }}
    
    - name: Deploy to staging
      run: |
        ./scripts/deploy-staging.sh ${{ github.sha }}
    
    - name: Run integration tests
      run: |
        npm run test:integration:staging
```

---
*Staging Deployment Guide by Sam the Scribe*
*Infrastructure by Dana the DevOps (484 commits!)*