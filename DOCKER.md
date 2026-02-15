# Docker Setup & Security Best Practices

This document explains the Docker configuration for the DCR Builder application and the security measures implemented.

## Quick Start

### Build and Run
```bash
# Build the Docker image
docker-compose build

# Run the application
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop the application
docker-compose down
```

### Access the Application
The application will be available at `http://localhost:3000`

## Security Features Implemented

### 1. Multi-Stage Build
- **Builder stage**: Compiles TypeScript, installs all dependencies
- **Runtime stage**: Contains only production dependencies and built application
- **Benefit**: Significantly reduces final image size (70-80% smaller) and eliminates build tools from production environment

### 2. Non-Root User
- Application runs as `nodejs` user (UID: 1001, GID: 1001)
- Prevents container escape attacks from escalating to root
- Reduces attack surface for privilege escalation exploits

### 3. Minimal Base Image
- Uses `node:22-alpine3.20` - lightweight, hardened Linux distribution
- Alpine Linux is audited for security vulnerabilities
- Regularly updated with security patches

### 4. Capability Dropping
- Drops ALL unnecessary Linux capabilities via `cap_drop: ALL`
- Only adds back `NET_BIND_SERVICE` for binding to port 3000
- Prevents container from performing privileged operations

### 5. Resource Limits
- CPU limit: 1 core (prevent DoS through CPU exhaustion)
- Memory limit: 512MB (prevent OOM attacks)
- Memory reservation: 256MB (guaranteed minimum)
- Prevents resource exhaustion attacks

### 6. Read-Only Filesystem
- Root filesystem is read-only (`read_only: true`)
- Application granted writable `/tmp` and `/app/tmp` via tmpfs
- tmpfs has default size limits preventing disk exhaustion
- Any attempt to write outside allowed directories fails

### 7. No New Privileges
- Security option prevents child processes from gaining additional privileges
- Prevents privilege escalation through process creation

### 8. Health Checks
- Verifies application is responding to HTTP requests every 30 seconds
- Automatically restarts container if health checks fail
- Includes start period to allow application initialization

### 9. Signal Handling
- Uses `dumb-init` to properly handle Unix signals (SIGTERM, SIGINT)
- Ensures graceful shutdown and proper process cleanup
- Essential for multi-process applications

### 10. Logging Configuration
- Limited log size (10MB per file, max 3 files)
- Prevents disk exhaustion through excessive logging
- JSON format for structured logs

### 11. Network Isolation
- Custom bridge network `dcr-network` isolates containers
- IP range configured for predictability
- Limits unnecessary network exposure

### 12. Package Management
- Uses `npm ci` (clean install) instead of `npm install`
- Ensures reproducible builds
- npm cache cleaned after install to reduce image size
- No optional dependencies included

### 13. Security Updates
- Base image updated during build (`apk update && apk upgrade`)
- Alpine package cache cleared to reduce image size and attack surface
- Done in separate RUN commands for better caching and security

## Configuration

### Environment Variables

All environment variables are documented in [.env.example](.env.example). Copy this file to `.env.docker` and customize:

```bash
cp .env.example .env.docker
```

Key variables for development:
```env
NODE_ENV=development
APP_PORT_HOST=3000          # Direct access to port 3000
APP_HOST=localhost
TRAEFIK_ENABLED=false       # Traefik disabled for dev
RESOURCES_CPU_LIMIT=2
RESOURCES_MEMORY_LIMIT=1G
```

Key variables for production:
```env
NODE_ENV=production
APP_PORT_HOST=127.0.0.1     # Internal only (Traefik handles external)
APP_HOST=your-domain.com    # Your domain name
TRAEFIK_ENABLED=true        # Traefik reverse proxy enabled
LETSENCRYPT_EMAIL=your@email # For Let's Encrypt certificates
RESOURCES_CPU_LIMIT=1
RESOURCES_MEMORY_LIMIT=512M
```

### Service Configuration

For development, the application is accessed directly:
```bash
docker-compose up -d
# Access at http://localhost:3000
```

For production, use Traefik reverse proxy with HTTPS:
```bash
docker-compose --profile prod up -d
# Access at https://your-domain.com (automatic Let's Encrypt certificate)
```

## Deployment Recommendations

### 1. Registry Security
```bash
# Use a private Docker registry
docker tag dcr-builder:latest myregistry.azurecr.io/dcr-builder:1.0.0
docker push myregistry.azurecr.io/dcr-builder:1.0.0
```

### 2. Image Scanning
Before deploying to production, scan images for vulnerabilities:
```bash
# Using Trivy
trivy image dcr-builder:latest

# Using Docker Scout
docker scout cves dcr-builder:latest
```

### 3. Runtime Security Monitoring
Consider adding container security monitoring:
- Falco (runtime threat detection)
- AppArmor or SELinux profiles
- Network policies in Kubernetes environments

### 4. Reverse Proxy
Deploy behind a reverse proxy (nginx, caddy) for:
- TLS/HTTPS termination
- Rate limiting
- Request validation
- Additional security headers

Example nginx configuration:
```nginx
server {
    listen 443 ssl http2;
    server_name example.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 5. Secrets Management
Never commit sensitive data in images:
```bash
# Good: Use Docker secrets in Swarm or mounted volumes
docker run --secret db_password ...

# For Kubernetes: Use secrets
kubectl create secret generic app-secrets --from-literal=API_KEY=xxx
```

### 6. Log Aggregation
In production, aggregate logs from containers:
```yaml
logging:
  driver: "splunk"  # or awslog, gcplogs, sumologic, etc.
  options:
    splunk-token: ${SPLUNK_TOKEN}
    splunk-url: https://your-splunk-instance.com
```

## Vulnerability Scanning

### Common Tools
- **Trivy**: Fast, low false-positive vulnerability scanner
- **Grype**: Syft-powered multi-source vulnerability scanner
- **Scout**: Docker's official vulnerability scanning
- **Snyk**: Developer-first security platform

### Example Trivy Scan
```bash
# Scan image
trivy image dcr-builder:latest

# Only fail on critical severity
trivy image --severity CRITICAL dcr-builder:latest

# Generate JSON report
trivy image -f json -o report.json dcr-builder:latest
```

## Updates and Patches

### Base Image Updates
When Node/Alpine releases security updates:
```bash
# Rebuild the image to get latest base image layer
docker-compose build --no-cache

# Test the new image
docker-compose up -d

# Push to registry
docker push your-registry/dcr-builder:latest
```

### Dependency Updates
Keep application dependencies updated:
```bash
# Check for outdated packages
npm outdated

# Update packages
npm audit fix

# Rebuild Docker image
docker-compose build --no-cache
```

## Troubleshooting

### Container Won't Start
```bash
# Check logs
docker-compose logs app

# Check health status
docker-compose ps

# Inspect running process
docker-compose exec app ps aux
```

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Or change port in docker-compose.yml
ports:
  - "3001:3000"
```

### Resource Limits Issues
If the application is being killed due to memory limits:
1. Check current usage: `docker stats`
2. Increase limit in docker-compose.yml
3. Monitor logs for memory leaks

### Health Check Failures
```bash
# Test health endpoint manually
curl -v http://localhost:3000/

# Check health check output
docker inspect --format='{{.State.Health}}' container_name
```

## Security Checklist for Production

- [ ] Image scanned for vulnerabilities (Trivy, Snyk, etc.)
- [ ] Running behind TLS reverse proxy
- [ ] Environment variables not exposed in logs
- [ ] Resource limits configured appropriately
- [ ] Log aggregation configured
- [ ] Proper restart policy set
- [ ] Read-only filesystem enabled
- [ ] Non-root user enforced
- [ ] Secrets managed through secure mechanism
- [ ] Regular backup and disaster recovery plan
- [ ] Monitoring and alerting configured
- [ ] Network policies restrict traffic to/from container

## Additional Documentation

- [CIS Docker Security Benchmark](https://www.cisecurity.org/benchmark/docker)
- [Docker Security Best Practices](https://docs.docker.com/build/building/best-practices/)
- [OWASP Container Security](https://cheatsheetseries.owasp.org/cheatsheets/Container_Security_Cheat_Sheet.html)
- [Alpine Security](https://wiki.alpinelinux.org/wiki/Security)

## Support

For issues or questions about the Docker setup, please refer to:
1. Application logs: `docker-compose logs app`
2. Docker documentation: https://docs.docker.com/
3. security advisories: Check Alpine packages database
