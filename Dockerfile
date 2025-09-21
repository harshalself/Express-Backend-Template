# Use Node.js 18 Alpine as base image
FROM node:18-alpine AS builder

# Add security updates and tools
RUN apk add --no-cache wget && \
    apk update && apk upgrade

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for building)
RUN npm ci --include=dev

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Add security updates and health check tool
RUN apk add --no-cache wget && \
    apk update && apk upgrade

# Set working directory
WORKDIR /app

# Copy package files
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev && npm cache clean --force

# Copy built application
COPY --from=builder /app/build ./build

# Copy docs (copied during build)
COPY --from=builder /app/docs ./docs

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Change ownership of app directory
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose correct port (app uses 8000)
EXPOSE 8000

# Health check using app's built-in endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8000/health || exit 1

# Start the application
CMD ["npm", "start"]