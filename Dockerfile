# Multi-stage production build for VoltGrid OS
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install dependencies (supports projects with or without package-lock.json)
RUN npm install

# Copy source code and config files
COPY . .

# Build client Vite bundle and server bundle into dist/
RUN npm run build

# Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Cloud Run automatically sets PORT (usually 8080). Default to 8080 if not provided.
ENV PORT=8080

# Copy package descriptors and install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy compiled build output from builder stage
COPY --from=builder /app/dist ./dist

# Expose container port
EXPOSE 8080

# Start Express server
CMD ["node", "dist/server.cjs"]
