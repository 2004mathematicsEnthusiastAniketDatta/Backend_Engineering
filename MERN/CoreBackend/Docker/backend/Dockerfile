# syntax=docker/dockerfile:1.7
FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# Install openssl for Prisma
RUN apk add --no-cache openssl

# Install dependencies separately for better layer caching
FROM base AS deps
COPY package.json package-lock.json* ./
COPY prisma ./prisma
# Install ALL dependencies (including dev) for the build stage
ENV NODE_ENV=development
RUN --mount=type=cache,target=/root/.npm npm ci

# Install only production dependencies
FROM base AS prod-deps
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev

# Build the app
FROM deps AS build
ENV NODE_ENV=development
COPY tsconfig.json ./
COPY src ./src
COPY prisma ./prisma
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
ENV PORT=3000
EXPOSE 3000
CMD ["node", "dist/server.js"]

# remember this

# 1. 192.168.7.185 (user)-> 192.168.7.179(Machine on which container is running) -> 172.17.0.2(postgres) 
# Telnet and networking configuration
# RUN apk add --no-cache telnet curl netcat-openbsd

# Configure networking for container communication
# Allow connections from host network to container
# Default Docker bridge network: 172.17.0.0/16
# Host can access container via: docker run -p 3000:3000
# Container can access other containers via their IP or service names

# For debugging network connectivity:
# - Use telnet to test port connectivity: telnet <host> <port>
# - Use curl for HTTP endpoints: curl http://<host>:<port>
# - Use nc (netcat) for port scanning: nc -zv <host> <port>
# sudo route -n add -net 172.17.0.2/32 gw 192.168.7.179:# Add a static route to reach a specific Docker container
# This command configures network routing on the host system

# sudo: Run with administrator privileges (required for network configuration)
# route: Network routing table manipulation command
# -n: Use numerical addresses instead of resolving hostnames (faster, more reliable)
# add: Add a new route to the routing table
# -net: Specify that we're adding a network route (not just a host route)
# 172.17.0.2/32: Target network/host
#   - 172.17.0.2: The specific IP address we want to reach
#   - /32: Subnet mask indicating this is a single host (not a network range)
#   - 172.17.x.x is Docker's default bridge network range
# gw: Specify the gateway (next hop) for this route
# 192.168.7.179: The gateway IP address that knows how to reach 172.17.0.2
#   - This is likely your host machine or another router in your network

# sudo route -n add -net 172.17.0.2/32 gw 192.168.7.179
# Key Points:

# This creates a route so traffic destined for 172.17.0.2 gets sent to 192.168.7.179
# Commonly used when Docker containers need to be accessible from external networks
# The /32 mask means this route applies to exactly one IP address
# This is typically run on the host system, not inside a Docker container







