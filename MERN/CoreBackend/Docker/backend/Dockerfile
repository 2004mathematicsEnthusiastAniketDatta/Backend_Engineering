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
# =============================================================================
# CONTAINER DNS RESOLUTION AND SERVICE DISCOVERY
# =============================================================================

# Install DNS utilities for container-to-container name resolution
# RUN apk add --no-cache \
#     bind-tools \
#     dnsutils \
#     iputils \
#     busybox-extras

# =============================================================================
# DNS RESOLUTION IN DOCKER NETWORKS
# =============================================================================

# Default Bridge Network Limitations:
# - No automatic DNS resolution between containers
# - Containers must communicate via IP addresses only
# - /etc/hosts contains only container's own hostname

# Custom Bridge Network Benefits:
# - Built-in DNS resolution by container name
# - Automatic service discovery
# - Container names act as hostnames

# =============================================================================
# ENABLING CONTAINER NAME RESOLUTION
# =============================================================================

# Method 1: Create Custom Bridge Network (Recommended)
# docker network create --driver bridge myapp-network
# docker run --network myapp-network --name container1 myimage
# docker run --network myapp-network --name container2 myimage
# 
# Then from container1:
# nslookup container2  # Resolves to container2's IP
# ping container2      # Works with container name
# curl http://container2:3000  # HTTP requests by name

# Method 2: Use Docker Compose (Automatic Custom Network)
# version: '3.8'
# services:
#   backend:
#     build: .
#     networks:
#       - app-network
#   frontend:
#     image: nginx
#     networks:
#       - app-network
# networks:
#   app-network:
#     driver: bridge

# Method 3: Link Containers (Legacy - Not Recommended)
# docker run --name db postgres
# docker run --link db:database myapp
# # Creates /etc/hosts entry: <db_ip> database db

# =============================================================================
# DNS TROUBLESHOOTING COMMANDS
# =============================================================================

# Test DNS resolution from within container:
# nslookup <container_name>           # Lookup container by name
# nslookup <container_name> 127.0.0.11  # Use Docker's internal DNS
# dig <container_name>                # Detailed DNS query
# cat /etc/resolv.conf               # Check DNS server configuration
# cat /etc/hosts                     # Check static hostname entries

# Docker's Internal DNS Server:
# - Default bridge: No DNS resolution
# - Custom networks: DNS server at 127.0.0.11
# - Resolves container names to current IP addresses
# - Handles container restarts and IP changes

# =============================================================================
# MIGRATION FROM DEFAULT TO CUSTOM BRIDGE
# =============================================================================

# Current State (Default Bridge - No DNS):
# docker run --name backend-container myapp
# docker run --name frontend-container nginx
# # Communication only via IP: curl http://172.17.0.2:3000

# Improved State (Custom Bridge - With DNS):
# docker network create app-bridge
# docker run --network app-bridge --name backend myapp
# docker run --network app-bridge --name frontend nginx
# # Communication via names: curl http://backend:3000

# =============================================================================
# DOCKER COMPOSE INTEGRATION
# =============================================================================

# Example docker-compose.yml for this backend:
# version: '3.8'
# services:
#   backend:
#     build: .
#     container_name: backend-app
#     ports:
#       - "3000:3000"
#     environment:
#       - NODE_ENV=production
#       - DATABASE_URL=postgresql://user:pass@postgres:5432/db
#     depends_on:
#       - postgres
#     networks:
#       - app-network
# 
#   postgres:
#     image: postgres:15-alpine
#     container_name: postgres-db
#     environment:
#       - POSTGRES_DB=myapp
#       - POSTGRES_USER=user
#       - POSTGRES_PASSWORD=password
#     networks:
#       - app-network
# 
# networks:
#   app-network:
#     driver: bridge
#     name: myapp-bridge

# =============================================================================
# NETWORK-AWARE APPLICATION CONFIGURATION
# =============================================================================

# Update application configuration to use container names:
# Database connection string: postgresql://user:pass@postgres-db:5432/myapp
# Redis connection: redis://redis-cache:6379
# Microservice URLs: http://user-service:8080/api/users

# Environment variables for service discovery:
# ENV DATABASE_HOST=postgres-db
# ENV REDIS_HOST=redis-cache
# ENV USER_SERVICE_URL=http://user-service:8080

# =============================================================================
# PRODUCTION BEST PRACTICES
# =============================================================================

# 1. Always use custom networks in production
# 2. Use Docker Compose or orchestration tools (Kubernetes, Docker Swarm)
# 3. Implement health checks for service discovery
# 4. Use consistent naming conventions for containers
# 5. Configure proper DNS timeouts and retries in applications
# 6. Monitor DNS resolution performance
# 7. Document service dependencies and communication patterns
# =============================================================================
# MULTI-NETWORK CONTAINER SCENARIOS
# =============================================================================

# When a container connects to a different network than other containers,
# it creates network isolation and affects communication patterns:

# Scenario 1: Container on Default Bridge + Custom Network
# docker network create app-network
# docker run --name backend --network app-network myapp
# docker run --name database postgres  # Uses default bridge (172.17.0.0/16)
# 
# Result: backend cannot reach database by name or IP
# Solution: Connect backend to both networks

# Scenario 2: Multi-Network Container (Bridge Pattern)
# docker network create frontend-network
# docker network create backend-network
# docker run --name api-gateway --network frontend-network nginx
# docker network connect backend-network api-gateway
# docker run --name backend --network backend-network myapp
# 
# Result: api-gateway can communicate with both networks
# frontend-network: Web traffic isolation
# backend-network: Internal API communication

# =============================================================================
# CONNECTING CONTAINERS TO MULTIPLE NETWORKS
# =============================================================================

# Method 1: Connect During Creation
# docker run --name multi-net-container \
#   --network network1 \
#   --network network2 \
#   myimage

# Method 2: Connect After Creation
# docker run --name container1 --network network1 myimage
# docker network connect network2 container1
# docker network connect network3 container1

# Method 3: Docker Compose Multi-Network
# version: '3.8'
# services:
#   api-gateway:
#     image: nginx
#     networks:
#       - frontend
#       - backend
#   backend:
#     build: .
#     networks:
#       - backend
#       - database
#   database:
#     image: postgres
#     networks:
#       - database
# 
# networks:
#   frontend:
#     driver: bridge
#   backend:
#     driver: bridge
#   database:
#     driver: bridge

# =============================================================================
# NETWORK ISOLATION IMPLICATIONS
# =============================================================================

# Different Networks = No Communication:
# Network A (172.18.0.0/16): Container1, Container2
# Network B (172.19.0.0/16): Container3, Container4
# Result: Container1 cannot reach Container3 directly

# Communication Paths with Network Isolation:
# 1. Via Host Port Publishing:
#    Container1 -> Host:published-port -> Container3
# 2. Via Multi-Network Bridge Container:
#    Container1 -> Bridge-Container -> Container3
# 3. Via External Load Balancer/Proxy:
#    Container1 -> External-LB -> Container3

# =============================================================================
# PRACTICAL NETWORK ARCHITECTURE EXAMPLES
# =============================================================================

# Example 1: Three-Tier Application with Network Segmentation
# 
# Frontend Network (DMZ):
# - Web servers, load balancers
# - Public-facing components
# - Network: 172.20.0.0/16
# 
# Backend Network (Application Tier):
# - API servers, business logic
# - Internal communication only
# - Network: 172.21.0.0/16
# 
# Database Network (Data Tier):
# - Database servers, cache
# - Highly restricted access
# - Network: 172.22.0.0/16
# 
# Bridge Container (API Gateway):
# - Connected to frontend + backend networks
# - Routes requests between tiers
# - Implements security policies

# Example 2: Microservices with Service Mesh
# 
# Public Network:
# - Ingress controllers, public APIs
# - Network: 172.25.0.0/16
# 
# Service Network:
# - Internal microservices
# - Service-to-service communication
# - Network: 172.26.0.0/16
# 
# Infrastructure Network:
# - Monitoring, logging, service discovery
# - Network: 172.27.0.0/16

# =============================================================================
# TROUBLESHOOTING MULTI-NETWORK SCENARIOS
# =============================================================================

# Check container network connections:
# docker inspect <container> | jq '.[0].NetworkSettings.Networks'
# docker network ls
# docker network inspect <network-name>

# Test connectivity between networks:
# docker exec container1 ping container2  # Same network
# docker exec container1 ping 172.19.0.2  # Different network (should fail)
# docker exec container1 netstat -rn      # Check routing table

# Common connectivity issues:
# 1. Containers on different networks cannot communicate
# 2. DNS resolution only works within same custom network
# 3. Default bridge has no DNS resolution
# 4. Port conflicts when bridging networks

# =============================================================================
# SECURITY CONSIDERATIONS
# =============================================================================

# Network Isolation Benefits:
# - Prevents lateral movement in security breaches
# - Separates concerns (web, app, data layers)
# - Enables fine-grained access controls
# - Simplifies compliance and auditing

# Multi-Network Security Patterns:
# 1. Zero-Trust Networking: No implicit trust between networks
# 2. Principle of Least Privilege: Minimal network access required
# 3. Network Policies: Explicit allow/deny rules
# 4. Traffic Inspection: Monitor inter-network communication

# Implementation in Docker:
# - Use custom networks instead of default bridge
# - Avoid connecting containers to multiple networks unless necessary
# - Implement reverse proxy/API gateway for controlled access
# - Use secrets management for cross-network authentication

# =============================================================================
# DOCKER COMPOSE MULTI-NETWORK EXAMPLE
# =============================================================================

# Complete example for this backend application:
# version: '3.8'
# services:
#   # Frontend network only
#   nginx:
#     image: nginx:alpine
#     ports:
#       - "80:80"
#     networks:
#       - frontend
# 
#   # Bridge between frontend and backend
#   api-gateway:
#     image: nginx:alpine
#     networks:
#       - frontend
#       - backend
#     depends_on:
#       - backend
# 
#   # Backend network only
#   backend:
#     build: .
#     networks:
#       - backend
#       - database
#     environment:
#       - DATABASE_URL=postgresql://postgres:password@postgres:5432/myapp
#     depends_on:
#       - postgres
# 
#   # Database network only
#   postgres:
#     image: postgres:15-alpine
#     networks:
#       - database
#     environment:
#       - POSTGRES_DB=myapp
#       - POSTGRES_USER=postgres
#       - POSTGRES_PASSWORD=password
#     volumes:
#       - postgres_data:/var/lib/postgresql/data
# 
# networks:
#   frontend:
#     driver: bridge
#     name: frontend-net
#   backend:
#     driver: bridge
#     name: backend-net
#   database:
#     driver: bridge
#     name: database-net
# 
# volumes:
#   postgres_data:

# Network connectivity in this setup:
# nginx (frontend) <-> api-gateway <-> backend <-> postgres
# Each connection uses a different network for isolation

# =============================================================================
# NETWORK BRIDGE CONTAINER EXAMPLE - DETAILED ANALYSIS
# =============================================================================

# Command Breakdown:

# Step 1: docker run --name gw --network backend -d nhttpd
# - Creates a container named "gw" (gateway)
# - Connects it to "backend" network during creation
# - Runs in detached mode (-d)
# - Uses nhttpd image (lightweight HTTP server)

# Step 2: docker network connect frontend gw
# - Connects existing "gw" container to "frontend" network
# - Container now has interfaces on BOTH networks
# - Acts as a bridge between frontend and backend networks

# =============================================================================
# MULTI-NETWORK CONTAINER ARCHITECTURE
# =============================================================================

# Container "gw" Network Configuration:
# Interface 1 (eth0): Connected to backend network
#   - IP: 172.21.0.x/16 (backend network CIDR)
#   - Gateway: 172.21.0.1 (backend bridge)
#   - Hostname resolution: backend network containers

# Interface 2 (eth1): Connected to frontend network  
#   - IP: 172.20.0.x/16 (frontend network CIDR)
#   - Gateway: 172.20.0.1 (frontend bridge)
#   - Hostname resolution: frontend network containers

# Routing Table in "gw" container:
# Destination     Gateway         Interface
# 172.20.0.0/16   0.0.0.0         eth1        # Frontend network (direct)
# 172.21.0.0/16   0.0.0.0         eth0        # Backend network (direct)
# 0.0.0.0/0       172.20.0.1      eth1        # Default route via frontend

# =============================================================================
# NETWORK BRIDGE FUNCTIONALITY
# =============================================================================

# The "gw" container can now:
# 1. Receive requests from frontend network containers
# 2. Forward/proxy requests to backend network containers
# 3. Act as a reverse proxy or API gateway
# 4. Implement load balancing between networks
# 5. Provide network-level security filtering

# Communication Flows:
# Frontend Container -> gw (172.20.0.x) -> Backend Container
# Backend Container -> gw (172.21.0.x) -> Frontend Container

# Example HTTP Proxy Configuration in "gw":
# upstream backend {
#     server backend-service:3000;
#     server backend-replica:3000;
# }
# server {
#     listen 80;
#     location /api/ {
#         proxy_pass http://backend;
#         proxy_set_header Host $host;
#         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#     }
# }

# =============================================================================
# PRACTICAL USE CASES FOR BRIDGE CONTAINERS
# =============================================================================

# Use Case 1: API Gateway Pattern
# - Frontend apps connect to gateway on frontend network
# - Gateway routes requests to appropriate backend services
# - Implements authentication, rate limiting, SSL termination

# Use Case 2: Database Proxy
# - Applications connect to proxy on app network
# - Proxy manages connections to database on secure network
# - Implements connection pooling, query caching, monitoring

# Use Case 3: Service Mesh Sidecar
# - Each service has a proxy sidecar on multiple networks
# - Handles service discovery, load balancing, circuit breaking
# - Provides observability and security policies

# Use Case 4: Network Security Gateway
# - Filters traffic between network segments
# - Implements firewall rules, intrusion detection
# - Logs and monitors cross-network communication

# =============================================================================
# CONTAINER INSPECTION COMMANDS
# =============================================================================

# Inspect multi-network container configuration:
# docker inspect gw | jq '.[0].NetworkSettings.Networks'
# 
# Expected output shows two network interfaces:
# {
#   "backend": {
#     "IPAddress": "172.21.0.3",
#     "Gateway": "172.21.0.1",
#     "NetworkID": "backend-network-id"
#   },
#   "frontend": {
#     "IPAddress": "172.20.0.4", 
#     "Gateway": "172.20.0.1",
#     "NetworkID": "frontend-network-id"
#   }
# }

# Test connectivity from within the gateway container:
# docker exec -it gw sh
# ip addr show                    # Shows both eth0 and eth1 interfaces
# ip route show                   # Shows routing table
# ping backend-service            # Test backend network connectivity
# ping frontend-app               # Test frontend network connectivity
# netstat -tuln                   # Show listening ports

# =============================================================================
# TRAFFIC FLOW EXAMPLES
# =============================================================================

# Example 1: Frontend to Backend via Gateway
# 1. frontend-app (172.20.0.2) -> gw (172.20.0.4:80)
# 2. gw processes request, forwards to backend
# 3. gw (172.21.0.3) -> backend-service (172.21.0.5:3000)
# 4. Response flows back: backend -> gw -> frontend

# Example 2: Direct Backend Communication (if gw allows)
# 1. backend-auth (172.21.0.6) -> gw (172.21.0.3:8080)
# 2. gw validates request, forwards to another backend service
# 3. gw (172.21.0.3) -> backend-user (172.21.0.7:3001)

# =============================================================================
# SECURITY IMPLICATIONS
# =============================================================================

# Benefits:
# - Centralized access control between network segments
# - Traffic inspection and logging capabilities
# - Prevents direct container-to-container communication
# - Enables network-level authentication and authorization

# Risks:
# - Single point of failure for cross-network communication
# - Potential performance bottleneck
# - Increased attack surface if gateway is compromised
# - Complex configuration and maintenance

# Mitigation Strategies:
# - Deploy multiple gateway instances for high availability
# - Implement health checks and automatic failover
# - Use least-privilege principles for gateway access
# - Regular security updates and monitoring

# =============================================================================
# ALTERNATIVE NETWORKING APPROACHES
# =============================================================================

# Alternative 1: Host Networking
# docker run --network host myapp
# - Container shares host network stack
# - No network isolation, direct host access
# - Higher performance, simplified networking
# - Security trade-offs

# Alternative 2: Macvlan Networks
# docker network create -d macvlan --subnet=192.168.1.0/24 --gateway=192.168.1.1 -o parent=eth0 macvlan-net
# - Containers get direct IP addresses on host network
# - Appears as separate devices on network
# - No NAT overhead, direct external access

# Alternative 3: Overlay Networks (Swarm/Kubernetes)
# docker network create --driver overlay multi-host-network
# - Spans multiple Docker hosts
# - Encrypted communication between hosts
# - Service discovery across hosts

# =============================================================================
# MONITORING AND OBSERVABILITY
# =============================================================================

# Network monitoring for bridge containers:
# docker stats gw                    # Resource usage
# docker logs gw                     # Application logs
# docker exec gw ss -tuln           # Network connections
# docker exec gw iftop              # Real-time traffic monitoring

# Network flow analysis:
# tcpdump -i docker0                # Bridge traffic capture
# docker exec gw tcpdump -i eth0    # Backend network traffic
# docker exec gw tcpdump -i eth1    # Frontend network traffic

# Performance metrics to monitor:
# - Network throughput between segments
# - Connection count and duration
# - Error rates and latency
# - Resource utilization (CPU, memory, network I/O)

# =============================================================================
# DOCKER COMPOSE EQUIVALENT
# =============================================================================

# version: '3.8'
# services:
#   gateway:
#     image: nhttpd
#     container_name: gw
#     networks:
#       - frontend
#       - backend
#     ports:
#       - "80:80"
#     deploy:
#       replicas: 2        # High availability
#       restart_policy:
#         condition: on-failure
# 
#   frontend-app:
#     image: myapp/frontend
#     networks:
#       - frontend
#     depends_on:
#       - gateway
# 
#   backend-service:
#     build: .
#     networks:
#       - backend
#     depends_on:
#       - database
# 
#   database:
#     image: postgres:15
#     networks:
#       - backend     # Isolated from frontend
# 
# networks:
#   frontend:
#     driver: bridge
#     ipam:
#       config:
#         - subnet: 172.20.0.0/16
#   backend:
#     driver: bridge  
#     ipam:
#       config:
#         - subnet: 172.21.0.0/16

# =============================================================================
# STATIC ROUTING CONFIGURATION FOR MULTI-NETWORK COMMUNICATION
# =============================================================================

# Install network routing utilities
# RUN apk add --no-cache \
#     iproute2 \
#     iptables \
#     net-tools
#
# be a --cap-admin while running docker containers before doing this 
# Static routing examples for container-to-container communication
# Format: ip route add <destination_network> via <gateway_ip> [dev <interface>]

# Example 1: Route traffic to backend network via gateway container
# ip route add 172.21.0.0/16 via 172.20.0.4 dev eth0
# - Routes all backend network traffic through gateway at 172.20.0.4
# - Uses eth0 interface (frontend network interface)
# - Enables frontend containers to reach backend services

# Example 2: Route specific service subnet via dedicated gateway
# ip route add 172.22.0.0/24 via 172.21.0.3 dev eth1
# - Routes database subnet traffic through database gateway
# - Uses eth1 interface (backend network interface)
# - Provides controlled access to database tier

# Example 3: Route external traffic via host gateway
# ip route add 0.0.0.0/0 via 172.17.0.1 dev eth0
# - Default route for external internet access
# - Routes through Docker bridge gateway
# - Standard configuration for outbound traffic

# =============================================================================
# DYNAMIC ROUTING CONFIGURATION
# =============================================================================

# Container startup script to configure custom routes
# COPY routing-config.sh /usr/local/bin/
# RUN chmod +x /usr/local/bin/routing-config.sh

# Example routing-config.sh:
# #!/bin/sh
# 
# # Wait for network interfaces to be ready
# sleep 2
# 
# # Add route to backend services via gateway
# if ip addr show eth0 | grep -q "172.20."; then
#     ip route add 172.21.0.0/16 via 172.20.0.4 2>/dev/null || true
# fi
# 
# # Add route to database services via backend gateway  
# if ip addr show eth1 | grep -q "172.21."; then
#     ip route add 172.22.0.0/16 via 172.21.0.5 2>/dev/null || true
# fi
# 
# # Start main application
# exec "$@"

# =============================================================================
# ROUTING TABLE VERIFICATION COMMANDS
# =============================================================================

# Verify routing configuration:
# ip route show                    # Display current routing table
# ip route get 172.21.0.5         # Test route to specific destination
# traceroute 172.21.0.5           # Trace packet path to destination
# ping -c 3 172.21.0.5            # Test connectivity via configured route

# Common routing table entries:
# 172.20.0.0/16 dev eth0 proto kernel scope link src 172.20.0.2
# 172.21.0.0/16 via 172.20.0.4 dev eth0
# default via 172.20.0.1 dev eth0

# =============================================================================
# PERSISTENT ROUTING WITH NETWORK NAMESPACES
# =============================================================================

# For containers requiring complex routing that persists across restarts:
# 
# Method 1: Init script approach
# ENTRYPOINT ["/usr/local/bin/routing-config.sh"]
# CMD ["node", "dist/server.js"]
# 
# Method 2: Supervisor approach for multiple processes
# RUN apk add --no-cache supervisor
# COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
# CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

# =============================================================================
# SECURITY CONSIDERATIONS FOR CUSTOM ROUTING
# =============================================================================

# Required capabilities for route manipulation:
# docker run --cap-add=NET_ADMIN mycontainer
# 
# Or in docker-compose:
# services:
#   myservice:
#     cap_add:
#       - NET_ADMIN
#     build: .

# Network policy implications:
# - Custom routes can bypass network isolation
# - Requires careful security review
# - Should be used with proper access controls
# - Monitor for route table modifications
