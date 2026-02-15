# Docker Deployment Quick Start

This guide covers deploying the DCR Builder application using Docker with security best practices.

## Prerequisites

- Docker 20.10+ installed
- Docker Compose 2.0+ installed
- At least 1GB of available disk space
- Port 3000 available (or modify in docker-compose.yml)

## Development Deployment

### 1. Build the Image

```bash
docker-compose build
```

### 2. Start the Application

```bash
docker-compose up -d
```

### 3. Access the Application

Open your browser and navigate to: `http://localhost:3000`

### 4. View Logs

```bash
docker-compose logs -f app
```

### 5. Stop the Application

```bash
docker-compose down
```

## Production Deployment with HTTPS

### 1. Prerequisites

- Domain name pointing to your server
- Docker and Docker Compose installed

### 2. Configure Environment

Copy the template and customize for production:
```bash
cp .env.example .env.docker
```

Edit `.env.docker` and update these values for production:
```env
NODE_ENV=production
APP_PORT_HOST=127.0.0.1       # Internal only (Traefik handles external)
APP_HOST=your-domain.com       # Your domain name
TRAEFIK_ENABLED=true           # Enable reverse proxy
LETSENCRYPT_EMAIL=your@email   # For Let's Encrypt certificates
RESOURCES_CPU_LIMIT=1          # Conservative for production
RESOURCES_MEMORY_LIMIT=512M    # Conservative for production
LOG_MAX_FILE=5                 # Keep more logs in production
```

### 3. Build and Run

```bash
docker-compose build
docker-compose --profile prod up -d
```

### 4. Verify Health

```bash
docker-compose ps
docker-compose logs app
docker-compose logs traefik
```

The application is now running behind Traefik with automatic HTTPS configured for your domain.

## Security Scanning

Run the security scanning script to validate your setup:
```bash
chmod +x scripts/docker-security-scan.sh
./scripts/docker-security-scan.sh
```

This will:
- Verify Docker installation
- Build the image
- Check image configuration
- Run vulnerability scanners (Trivy, Grype)
- Validate docker-compose files
- Display a security checklist

## Common Tasks

### View Real-Time Logs

```bash
docker-compose logs -f app
```

### Execute Command in Container

```bash
docker-compose exec app sh
```

### Rebuild Without Cache

```bash
docker-compose build --no-cache
```

### Remove All Resources

```bash
docker-compose down -v
```

### Scale Application (for production with load balancer)

```bash
docker-compose up -d --scale app=3
```
Note: Requires load balancer in front (Caddy, nginx, etc.)

### Check Container Resource Usage

```bash
docker stats
```

### Inspect Running Container

```bash
docker inspect dcr-builder-app
```

## Troubleshooting

### Port Already in Use

```bash
# Find what's using port 3000
lsof -i :3000
# Or change port in docker-compose.yml
```

### Container Exits Immediately

```bash
docker-compose logs app
```
Check for errors in logs. Common issues:
- Build errors - check Dockerfile syntax
- Missing environment variables
- Out of disk space

### Out of Memory

Container is limited to 512MB by default:
```bash
# Increase memory limit in docker-compose.yml
deploy:
  resources:
    limits:
      memory: 1G
```

### High CPU Usage

Check application logs and:
```bash
docker stats
```
Adjust CPU limits accordingly.

## Environment Variables

All environment variables are documented in [.env.example](.env.example).

Copy to `.env.docker` and customize:

```bash
cp .env.example .env.docker
```

Key variables:
- `NODE_ENV=production` - Set to production for production deployments
- `APP_PORT_HOST` - Port binding (3000 for dev, 127.0.0.1 for prod)
- `APP_HOST` - Hostname (localhost for dev, your-domain for prod)
- `TRAEFIK_ENABLED` - Enable reverse proxy (false for dev, true for prod)
- `LETSENCRYPT_EMAIL` - Your email for Let's Encrypt certificates (prod only)
- `RESOURCES_CPU_LIMIT/MEMORY_LIMIT` - Resource constraints
- `LOG_MAX_FILE` - Number of log files to retain

## Production Best Practices

### 1. Use Image Registry

```bash
# Tag image
docker tag dcr-builder:latest myregistry.azurecr.io/dcr-builder:1.0.0

# Push to registry
docker push myregistry.azurecr.io/dcr-builder:1.0.0

# Reference in docker-compose.yml:
# In the 'app' service, change:
# image: dcr-builder:latest
# to:
# image: myregistry.azurecr.io/dcr-builder:1.0.0
```

### 2. Scan for Vulnerabilities

```bash
# Using Trivy
trivy image dcr-builder:latest

# Using Grype
grype dcr-builder:latest

# Using Docker Scout
docker scout cves dcr-builder:latest
```

### 3. Monitor Application

```bash
# View real-time stats
docker stats

# View logs with timestamps
docker-compose logs --timestamps app

# Follow logs from multiple services
docker-compose logs -f
```

### 4. Regular Updates

Keep the base image updated:
```bash
# Rebuild to get latest base image patches
docker-compose build --no-cache

# Rebuild dependencies
rm package-lock.json  # Optional
docker-compose build --no-cache --pull
```

### 5. Backup Data

If using volumes:
```bash
docker run --rm -v dcr-builder-data:/data -v $(pwd):/backup \
  alpine tar czf /backup/backup.tar.gz -C / data
```

### 6. Secrets Management

Never commit secrets. Use:
```bash
# Docker Secrets (Swarm)
docker secret create db_password -

# Environment variables from secure source
source /secure/path/.env
docker-compose up -d

# Or mount secret files
volumes:
  - /secure/secrets:/run/secrets:ro
```

## Deployment Platforms

### Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack (uses docker-compose.yml with prod profile)
docker stack deploy -c docker-compose.yml dcr-builder
```

### Kubernetes

Convert using Kompose:
```bash
# Generate dev deployment manifests
kompose convert -f docker-compose.yml

# Or for production with profiles
kompose convert -f docker-compose.yml --profile prod
kubectl apply -f *.yaml
```

### Azure Container Instances

```bash
az container create \
  --resource-group mygroup \
  --name dcr-builder \
  --image myregistry.azurecr.io/dcr-builder:1.0.0 \
  --ports 3000 \
  --registry-login-server myregistry.azurecr.io
```

### AWS ECS

Use docker-compose to generate ECS task definition:
```bash
docker compose convert > ecs-task-def.json
```

## Security Checklist Before Production

- [ ] Image scanned with vulnerability scanner
- [ ] All secrets externalized (no hardcoded secrets)
- [ ] TLS/HTTPS configured on reverse proxy
- [ ] Health checks implemented and working
- [ ] Resource limits set appropriately
- [ ] Log aggregation configured
- [ ] Monitoring and alerting in place
- [ ] Backup and recovery plan documented
- [ ] Network policies configured
- [ ] Regular update schedule established

## Support & Documentation

- Full documentation: [DOCKER.md](DOCKER.md)
- Docker docs: https://docs.docker.com/
- Compose docs: https://docs.docker.com/compose/
- Security best practices: [CIS Docker Benchmark](https://www.cisecurity.org/benchmark/docker)

For issues, check logs first:
```bash
docker-compose logs -f app
```
