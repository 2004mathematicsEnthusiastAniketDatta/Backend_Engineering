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

# DOCKER NETWORK BRIDGE ARCHITECTURE - COMPREHENSIVE OVERVIEW

# =============================================================================
# DOCKER BRIDGE NETWORK FUNDAMENTALS
# =============================================================================

# Docker creates a virtual bridge (docker0) that acts as a software switch
# Default bridge network: 172.17.0.0/16 (65,534 possible container IPs)
# Bridge interface: docker0 (typically 172.17.0.1)
# Container networking stack: veth pairs + namespaces + iptables

# Network Namespace Isolation:
# Each container gets its own network namespace with:
# - Private network interface (eth0 inside container)
# - Private routing table
# - Private iptables rules
# - Private /etc/hosts and /etc/resolv.conf

# =============================================================================
# CONTAINER NETWORK INTERFACE ARCHITECTURE
# =============================================================================

# Virtual Ethernet (veth) Pairs:
# Container Side: eth0 (e.g., 172.17.0.2/16)
# Host Side: vethXXXXXX (random identifier)
# Bridge Connection: vethXXXXXX attached to docker0 bridge

# Example Container Network Configuration:
# Container IP: 172.17.0.2
# Gateway: 172.17.0.1 (docker0 bridge)
# Subnet Mask: 255.255.0.0 (/16)
# DNS: Typically inherits from host or Docker daemon config

# =============================================================================
# BRIDGE NETWORK COMMUNICATION FLOWS
# =============================================================================

# 1. Container-to-Container Communication (Same Bridge):
#    Container A (172.17.0.2) -> docker0 -> Container B (172.17.0.3)
#    - Traffic stays within bridge, no host routing needed
#    - Layer 2 switching via MAC address tables

# 2. Container-to-Host Communication:
#    Container (172.17.0.2) -> docker0 (172.17.0.1) -> Host interfaces
#    - NAT/Masquerade rules translate container IP to host IP

# 3. Container-to-External Communication:
#    Container (172.17.0.2) -> docker0 -> Host routing -> External network
#    - SNAT (Source NAT) replaces container IP with host IP
#    - Return traffic uses connection tracking

# 4. External-to-Container Communication:
#    External -> Host IP:Published Port -> DNAT -> Container IP:Container Port
#    - Port publishing creates DNAT rules in iptables
#    - Only works for explicitly published ports

# =============================================================================
# IPTABLES RULES AND NAT CONFIGURATION
# =============================================================================

# Docker automatically creates iptables rules for:
# 
# POSTROUTING Chain (MASQUERADE):
# -A POSTROUTING -s 172.17.0.0/16 ! -o docker0 -j MASQUERADE
# 
# DOCKER Chain (Port Publishing):
# -A DOCKER -d 172.17.0.2/32 ! -i docker0 -o docker0 -p tcp --dport 3000 -j ACCEPT
# 
# FORWARD Chain (Container Traffic):
# -A FORWARD -o docker0 -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT
# -A FORWARD -i docker0 ! -o docker0 -j ACCEPT

# =============================================================================
# CUSTOM BRIDGE NETWORKS VS DEFAULT BRIDGE
# =============================================================================

# Default Bridge Network (docker0):
# - Legacy behavior, limited DNS resolution
# - Containers communicate via IP addresses
# - All containers share same broadcast domain

# Custom Bridge Networks:
# - Built-in DNS resolution by container name
# - Network isolation between different bridge networks
# - Better security and organization
# - Example: docker network create --driver bridge mynetwork

# =============================================================================
# CONTAINER NETWORK TROUBLESHOOTING COMMANDS
# =============================================================================

# Network debugging tools to add to containers:
# RUN apk add --no-cache \
#     iproute2 \
#     iptables \
#     tcpdump \
#     nmap \
#     bind-tools \
#     bridge-utils

# Container network inspection commands:
# ip addr show                     # Show container interfaces
# ip route show                    # Show container routing table
# ss -tuln                         # Show listening ports
# netstat -rn                      # Show routing table (if available)
# dig @8.8.8.8 google.com         # Test DNS resolution
# ping -c 3 172.17.0.1            # Test gateway connectivity
# tcpdump -i eth0                 # Packet capture on container interface

# =============================================================================
# HOST-SIDE NETWORK INSPECTION
# =============================================================================

# Host commands to understand bridge networking:
# docker network ls                           # List Docker networks
# docker network inspect bridge              # Inspect default bridge
# brctl show                                 # Show bridge interfaces
# ip link show type bridge                  # Show bridge interfaces
# iptables -t nat -L -n                     # Show NAT rules
# docker exec <container> ip addr show      # Show container network config

# =============================================================================
# PRODUCTION CONSIDERATIONS
# =============================================================================

# 1. Network Segmentation:
#    - Use custom networks to isolate application tiers
#    - Frontend network, backend network, database network

# 2. Security Hardening:
#    - Disable inter-container communication if not needed
#    - Use host networking sparingly (breaks container isolation)
#    - Implement network policies for multi-host deployments

# 3. Performance Optimization:
#    - Consider host networking for high-performance applications
#    - Use macvlan/ipvlan for containers that need direct network access
#    - Monitor bridge network performance with tools like iftop

# 4. Multi-Host Networking:
#    - Docker Swarm overlay networks for multi-host communication
#    - External tools: Flannel, Calico, Weave for Kubernetes
#    - Service discovery and load balancing considerations
# =============================================================================
# DOCKER CONTAINER NETWORK COMMUNICATION EXAMPLE
# =============================================================================

# The following commands demonstrate inter-container communication within 
# Docker's default bridge network:

# Command Breakdown:
# docker exec -it s1 bash
# - docker exec: Execute a command in a running container
# - -it: Interactive terminal (stdin + tty allocation)
# - s1: Container name or ID
# - bash: Command to execute (opens bash shell)

# From inside container 's1', the following curl commands were executed:

# curl 172.17.0.3
# <html><body><h1>It works!</h1></body></html>
# 
# Analysis:
# - Source: Container 's1' (likely 172.17.0.1 or different IP)
# - Target: Container at 172.17.0.3 running HTTP server (Apache/Nginx)
# - Result: Successfully received HTTP response
# - Network Path: Container -> docker0 bridge -> Target container
# - This demonstrates Layer 2 switching within the bridge network

# curl 172.17.0.2  
# <html><body><h1>It works!</h1></body></html>
#
# Analysis:
# - Source: Same container 's1'
# - Target: Container at 172.17.0.2 running HTTP server
# - Result: Successfully received identical HTTP response
# - Network Flow: Both containers are on same bridge network (172.17.0.0/16)

# =============================================================================
# NETWORK TOPOLOGY IMPLICATIONS
# =============================================================================

# This demonstrates that:
# 1. Multiple containers can run identical services on same bridge network
# 2. Containers can communicate directly using IP addresses
# 3. No port conflicts because each container has its own network namespace
# 4. Both containers (172.17.0.2 and 172.17.0.3) are serving HTTP on port 80
# 5. The bridge network (docker0) facilitates seamless container-to-container communication

# Network Layout:
# ┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌─────────────┐
# │   Host OS   │    │ Container s1 │    │172.17.0.2   │    │172.17.0.3   │
# │             │    │              │    │(HTTP Server)│    │(HTTP Server)│
# └─────────────┘    └──────────────┘    └─────────────┘    └─────────────┘
#        │                   │                   │                   │
#        └───────────────────┼───────────────────┼───────────────────┘
#                           │                   │
#                    ┌─────────────────────────────────┐
#                    │     docker0 Bridge Network     │
#                    │        172.17.0.1/16           │
#                    └─────────────────────────────────┘

# Key Observations:
# - No DNS resolution used (direct IP addressing)
# - Both targets respond identically (likely same container image)
# - Communication is instantaneous (local bridge network)
# - No external network traffic (stays within Docker host)




