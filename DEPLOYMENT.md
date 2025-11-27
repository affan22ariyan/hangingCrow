# Production Deployment Guide

## Phase 1: Environment & Security Setup

### 1. Secure Credentials
Create a `.env.production` file in `apps/backend/` and `full_betting_frontend_ui/`.

**Backend (`apps/backend/.env.production`):**
```env
DATABASE_URL="postgresql://user:password@production-db-host:5432/betting_db?sslmode=require"
JWT_SECRET="your-very-long-secure-random-string"
PORT=3000
NODE_ENV=production
```

**Frontend (`full_betting_frontend_ui/.env.production`):**
```env
VITE_API_URL="https://api.yourdomain.com"
```

### 2. Infrastructure
Provision your infrastructure (AWS/DigitalOcean/etc.).
Ensure you have:
- Managed PostgreSQL Database (e.g., RDS)
- Redis (optional, for caching/queues)
- Container Registry (ECR/Docker Hub)
- Kubernetes Cluster or Docker Swarm

### 3. Security Checklist
- [ ] Change all default passwords
- [ ] Enable SSL/TLS (HTTPS)
- [ ] Set up WAF (Cloudflare/AWS WAF)
- [ ] Configure rate limiting in Nginx or Backend

## Phase 2: Build & Deploy

### 1. Build Docker Images

**Backend:**
```bash
cd apps/backend
docker build -t betting-backend:latest .
```

**Frontend:**
```bash
cd full_betting_frontend_ui
docker build -t betting-frontend:latest .
```

### 2. Run with Docker Compose (Production)

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'
services:
  backend:
    image: betting-backend:latest
    env_file: ./apps/backend/.env.production
    ports:
      - "3000:3000"
    restart: always

  frontend:
    image: betting-frontend:latest
    ports:
      - "80:80"
    restart: always
```

### 3. Kubernetes Deployment
Apply manifests from `ops/k8s/` (if available) or use Helm.

## Phase 3: Verification

1. **Health Check**: `curl https://api.yourdomain.com/`
2. **Login**: Test login with Admin and User accounts.
3. **RBAC**: Verify Admin can access `/admin/users` and User cannot.
4. **Features**: Check Match Management and Settings in Admin Dashboard.

## Monitoring
- Set up UptimeRobot or similar for health checks.
- Use CloudWatch or Prometheus for logs and metrics.
