#!/bin/bash
# Security scanning and validation script for Docker deployment
# This script helps validate the security posture of the Docker setup

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="${1:-dcr-builder}"
IMAGE_TAG="${2:-latest}"
FULL_IMAGE="${IMAGE_NAME}:${IMAGE_TAG}"

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}Docker Security Scanning Tool${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker is installed${NC}"

# Function to check if a tool is installed
check_tool() {
    local tool=$1
    local install_cmd=$2
    
    if command -v $tool &> /dev/null; then
        echo -e "${GREEN}✓ $tool is installed${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠ $tool is not installed${NC}"
        echo "  Install with: $install_cmd"
        return 1
    fi
}

echo ""
echo -e "${BLUE}Checking security scanning tools...${NC}"
echo ""

# Check for vulnerability scanners
trivy_available=false
grype_available=false
scout_available=false

check_tool "trivy" "brew install trivy (macOS) or visit https://github.com/aquasecurity/trivy" && trivy_available=true
check_tool "grype" "brew install grype (macOS) or visit https://github.com/anchore/grype" && grype_available=true

# Docker Scout check (built into docker cli)
if docker scout --version &> /dev/null; then
    echo -e "${GREEN}✓ docker scout is available${NC}"
    scout_available=true
else
    echo -e "${YELLOW}⚠ docker scout is not available${NC}"
    echo "  Install with: docker scout enroll"
    scout_available=false
fi

echo ""
echo -e "${BLUE}Building Docker image...${NC}"
echo ""

if docker build -t $FULL_IMAGE . 2>&1 | grep -q "error"; then
    echo -e "${RED}✗ Docker build failed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker image built successfully: $FULL_IMAGE${NC}"

echo ""
echo -e "${BLUE}Analyzing image...${NC}"
echo ""

# Get image info
image_size=$(docker images --format "table {{.Repository}}:{{.Tag}} {{.Size}}" | grep $FULL_IMAGE | awk '{print $2}')
echo "Image size: $image_size"

# Check image config
echo ""
echo -e "${BLUE}Checking image configuration security...${NC}"
echo ""

# Inspect image
docker inspect $FULL_IMAGE > /tmp/image_config.json 2>&1

# Check if running as root
user=$(jq -r '.[] | .Config.User' /tmp/image_config.json)
if [ "$user" = "0" ] || [ -z "$user" ]; then
    echo -e "${RED}✗ Image appears to run as root${NC}"
else
    echo -e "${GREEN}✓ Image runs as non-root user: $user${NC}"
fi

# Check exposed ports
ports=$(jq -r '.[] | .Config.ExposedPorts | keys[]' /tmp/image_config.json 2>/dev/null || echo "none")
echo "Exposed ports: $ports"

# Check for healthcheck
healthcheck=$(jq -r '.[] | .Config.Healthcheck' /tmp/image_config.json)
if [ "$healthcheck" != "null" ] && [ ! -z "$healthcheck" ]; then
    echo -e "${GREEN}✓ Healthcheck is configured${NC}"
else
    echo -e "${YELLOW}⚠ No healthcheck configured${NC}"
fi

# Run vulnerability scanners if available
echo ""
echo -e "${BLUE}Running vulnerability scans...${NC}"
echo ""

if [ "$trivy_available" = true ]; then
    echo -e "${BLUE}Running Trivy scan...${NC}"
    if trivy image --severity CRITICAL,HIGH $FULL_IMAGE; then
        echo -e "${GREEN}✓ Trivy scan completed (check output above)${NC}"
    else
        echo -e "${YELLOW}⚠ Trivy found vulnerabilities${NC}"
    fi
    echo ""
fi

if [ "$grype_available" = true ]; then
    echo -e "${BLUE}Running Grype scan...${NC}"
    grype db update > /dev/null 2>&1 || true
    if grype $FULL_IMAGE -q; then
        echo -e "${GREEN}✓ Grype scan completed${NC}"
    else
        echo -e "${YELLOW}⚠ Grype found vulnerabilities${NC}"
    fi
    echo ""
fi

if [ "$scout_available" = true ]; then
    echo -e "${BLUE}Running Docker Scout scan...${NC}"
    docker scout cves $FULL_IMAGE || echo -e "${YELLOW}⚠ Scout scan had issues${NC}"
    echo ""
fi

# Test docker-compose configuration
echo -e "${BLUE}Validating docker-compose.yml...${NC}"
if docker-compose config > /dev/null 2>&1; then
    echo -e "${GREEN}✓ docker-compose.yml is valid${NC}"
else
    echo -e "${RED}✗ docker-compose.yml validation failed${NC}"
fi

# Security checklist
echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}Security Checklist${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

checklist=(
    "Image runs as non-root user"
    "Healthcheck is configured"
    "Resource limits are set (check docker-compose.yml)"
    "Read-only filesystem is enabled"
    "Security options (cap_drop, no-new-privileges) are set"
    "Vulnerability scanner(s) have been run"
    "Image is stored in a private registry (not public Docker Hub)"
    "TLS/HTTPS is configured for reverse proxy"
    "Environment secrets are managed securely (not in image/compose)"
    "Log aggregation is configured"
    "Regular image updates are scheduled"
)

for i in "${!checklist[@]}"; do
    echo "[ ] ${checklist[$i]}"
done

echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}Next Steps${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo "1. Address any vulnerabilities found above"
echo "2. Complete the security checklist above"
echo "3. Test the deployment with: docker-compose up -d"
echo "4. Monitor logs: docker-compose logs -f app"
echo "5. Push image to private registry"
echo "6. Deploy to production"
echo ""
echo "For more info, read: DOCKER.md"
echo ""

# Cleanup
rm -f /tmp/image_config.json
