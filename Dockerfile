# Multi-stage build for security and minimal image size
# Stage 1: Build - use full Node image for better npm compatibility
FROM node:22-bookworm-slim AS builder

# Set working directory
WORKDIR /build

# Copy package files first for better caching
COPY package.json package-lock.json ./

# Install dependencies with optional packages included
# npm install handles optional deps better than npm ci
RUN npm install && \
    npm cache clean --force

# Copy source code
COPY . .

# Build application
RUN npm run build

# Remove dev dependencies after build to reduce layer size
RUN npm prune --production

# Stage 2: Runtime
FROM node:22-alpine3.20

# Set working directory
WORKDIR /app

# Install runtime dependencies and security tools
RUN apk update && apk upgrade && \
    apk add --no-cache ca-certificates && \
    rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy built application from builder
COPY --from=builder --chown=nodejs:nodejs /build/package.json /build/package-lock.json ./
COPY --from=builder --chown=nodejs:nodejs /build/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /build/.output ./.output

# Create necessary directories with correct permissions
RUN mkdir -p /app/tmp && \
    chown -R nodejs:nodejs /app && \
    chmod 755 /app /app/tmp

# Switch to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Expose port
EXPOSE 3000

# Start application
CMD ["node", ".output/server/index.mjs"]
