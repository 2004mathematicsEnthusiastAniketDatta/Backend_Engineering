# PODMAN

Podman is a daemon-less, open-source, Linux-native tool designed to make it easy to find, run, build, share, and deploy applications using OCI (Open Container Initiative) containers and container images.

## Table of Contents
1. [Core Features](#core-features)
2. [Container Runtime Architecture](#container-runtime-architecture)
3. [Pod Management](#pod-management)
4. [Network Management](#network-management)
5. [Security Features](#security-features)
6. [Storage and Volumes](#storage-and-volumes)
7. [Command Reference](#command-reference)
8. [System Configuration](#system-configuration)
9. [Advanced Operations](#advanced-operations)
10. [Performance Tuning](#performance-tuning)
11. [Troubleshooting](#troubleshooting)
12. [Basic Commands](#basic-commands)
13. [Building Container Images](#building-container-images)

## Core Features

### 1. Daemon-less Architecture

A **daemon** is a background process that runs continuously on a system, typically providing core services or managing resources. Traditional container tools like Docker rely on a central daemon process (the Docker daemon) to manage containers.

Podman being **daemon-less** means it does not require a long-running background service to manage containers or pods. Instead, Podman runs as a standard process, executing commands directly and managing containers without a central daemon. This approach provides:

- **Improved Security**: No privileged daemon running continuously
- **Simplified Management**: Direct process execution without daemon dependencies
- **Rootless Operation**: Each container managed independently by user processes
- **Better Resource Utilization**: No overhead from persistent daemon processes

### 2. Rootless Containers

Rootless containers allow running and managing containers without root privileges. This adds an additional layer of security by preventing root access even if the container is compromised by an attacker.

**Low-level Implementation:**
- Uses **user namespaces** to map container root (UID 0) to unprivileged user on host
- Leverages **newuidmap** and **newgidmap** for subordinate UID/GID ranges
- Implements **cgroups v2** for resource management without root
- Utilizes **slirp4netns** or **pasta** for networking in user namespace

**Security Benefits:**
- Container escape attacks limited to user privileges
- No access to host root filesystem
- Kernel attack surface reduced
- Better multi-tenant security

## Container Runtime Architecture

### runc Runtime

[`runc`](https://github.com/opencontainers/runc) is a lightweight, portable container runtime that implements the Open Container Initiative (OCI) runtime specification. It serves as the reference implementation for running containers according to the OCI standard.

**Key Features:**
- **OCI Compliance**: Strictly follows OCI runtime spec for interoperability
- **Process Isolation**: Uses Linux kernel features (namespaces, cgroups)
- **No Daemon**: CLI tool that runs containers as direct child processes
- **Rootless Support**: Leverages user namespaces for enhanced security

**Low-level Operations:**
```bash
# Generate default OCI configuration
runc spec

# Create container from bundle
runc create mycontainer

# Start container process
runc start mycontainer

# Execute command in running container
runc exec mycontainer /bin/bash
```

**Namespace Isolation:**
- **PID Namespace**: Process isolation
- **Network Namespace**: Network stack isolation
- **Mount Namespace**: Filesystem isolation
- **IPC Namespace**: Inter-process communication isolation
- **UTS Namespace**: Hostname isolation
- **User Namespace**: UID/GID mapping
- **Cgroup Namespace**: Control group isolation

## Pod Management

### Understanding Pods

A Pod is a group of one or more containers with shared storage and network resources, and a specification for how to run the containers. Pods model an application-specific "logical host" containing tightly coupled application containers.

**Pod Characteristics:**
- **Co-location**: All containers scheduled on same node
- **Co-scheduling**: Containers start/stop together
- **Shared Context**: Common Linux namespaces and cgroups
- **Shared Networking**: Single IP address per pod
- **Shared Storage**: Volumes mounted across containers

### Single-Container Pods

The most common Kubernetes use case where a Pod wraps a single container:

```yaml
apiVersion: v1
kind: Pod
metadata:
    name: nginx-pod
spec:
    containers:
    - name: nginx
        image: nginx:1.14.2
        ports:
        - containerPort: 80
```

### Multi-Container Pods

Pods running multiple containers that need to work together, sharing resources and forming a cohesive unit:

```yaml
apiVersion: v1
kind: Pod
metadata:
    name: multi-container-pod
spec:
    containers:
    - name: app-container
        image: nginx
        volumeMounts:
        - name: shared-data
            mountPath: /usr/share/nginx/html
    - name: sidecar-container
        image: busybox
        command: ['sh', '-c', 'echo Hello from sidecar > /shared-data/index.html && sleep 3600']
        volumeMounts:
        - name: shared-data
            mountPath: /shared-data
    volumes:
    - name: shared-data
        emptyDir: {}
```

**Common Multi-Container Patterns:**

1. **Sidecar Pattern**: Supporting container providing auxiliary services
2. **Ambassador Pattern**: Proxy container managing external communications
3. **Adapter Pattern**: Container standardizing output from main application

### Pod Lifecycle Management

**Pod States:**
- **Pending**: Pod accepted but containers not yet created
- **Running**: At least one container running
- **Succeeded**: All containers terminated successfully
- **Failed**: All containers terminated, at least one failed
- **Unknown**: Pod state cannot be determined

**Container Restart Policies:**
- **Always**: Restart container regardless of exit status
- **OnFailure**: Restart only on failure
- **Never**: Never restart container

## Network Management

### Pod Networking

Each Pod receives a unique IP address for each address family. All containers within a Pod share the network namespace, including IP address and network ports.

**Low-level Networking:**
- **CNI (Container Network Interface)**: Standard for network plugins
- **netavark**: Podman's default network backend
- **aardvark-dns**: DNS resolution for containers
- **slirp4netns/pasta**: User-mode networking for rootless containers

### Network Commands

```bash
# Create custom network
podman network create --driver bridge --subnet 172.20.0.0/16 mynetwork

# List networks
podman network ls

# Inspect network configuration
podman network inspect mynetwork

# Connect container to network
podman network connect mynetwork mycontainer

# Remove network
podman network rm mynetwork
```

**Network Drivers:**
- **bridge**: Default bridged networking
- **macvlan**: Assign MAC address to container
- **ipvlan**: IP-based VLAN networking

## Security Features

### Security Context

Pod security settings control what containers can do:

```yaml
apiVersion: v1
kind: Pod
metadata:
    name: security-context-pod
spec:
    securityContext:
        runAsUser: 1000
        runAsGroup: 3000
        fsGroup: 2000
        runAsNonRoot: true
    containers:
    - name: secure-container
        image: nginx
        securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
                drop:
                - ALL
                add:
                - NET_BIND_SERVICE
```

**Security Mechanisms:**
- **SELinux/AppArmor**: Mandatory access controls
- **seccomp**: System call filtering
- **Capabilities**: Fine-grained privilege control
- **User Namespaces**: UID/GID mapping

### Container Probes

Health monitoring mechanisms:

**Probe Types:**
- **Liveness Probe**: Restart container if unhealthy
- **Readiness Probe**: Remove from service endpoints if not ready
- **Startup Probe**: Allow slow-starting containers

**Probe Mechanisms:**
- **ExecAction**: Execute command in container
- **TCPSocketAction**: TCP connection test
- **HTTPGetAction**: HTTP request test

## Storage and Volumes

### Volume Types

**Persistent Volumes:**
- **hostPath**: Mount host directory
- **emptyDir**: Temporary storage shared between containers
- **configMap**: Configuration data as files
- **secret**: Sensitive data as files

**Storage Commands:**
```bash
# Create volume
podman volume create myvolume

# List volumes
podman volume ls

# Inspect volume
podman volume inspect myvolume

# Remove volume
podman volume rm myvolume
```

## Command Reference

### Container Management
```bash
# Run container interactively
podman run -it ubuntu:latest /bin/bash

# Run container in background
podman run -d --name webserver nginx

# List containers
podman ps -a

# Stop container
podman stop webserver

# Remove container
podman rm webserver
```

### Image Management
```bash
# Pull image
podman pull ubuntu:latest

# List images
podman images

# Remove image
podman rmi ubuntu:latest

# Build image
podman build -t myapp .

# Tag image
podman tag myapp:latest myapp:v1.0
```

### Pod Operations
```bash
# Create pod
podman pod create --name mypod

# Run container in pod
podman run -d --pod mypod nginx

# List pods
podman pod ls

# Stop pod
podman pod stop mypod

# Remove pod
podman pod rm mypod
```

## System Configuration

### System Information
```bash
# Display system information
podman info

# Show version
podman version

# System events
podman events

# System statistics
podman stats
```

### Registry Configuration

Configuration file: `/etc/containers/registries.conf`

```toml
[registries.search]
registries = ['docker.io', 'quay.io']

[registries.insecure]
registries = ['localhost:5000']

[registries.block]
registries = ['badregistry.com']
```

### Storage Configuration

Configuration file: `/home/user/.config/containers/storage.conf`

Key storage backends:
- **overlay**: Layered filesystem (default)
- **vfs**: Simple directory-based storage
- **devicemapper**: Block-level storage

### Service Management

```bash
# Start API service
podman system service

# Enable remote access
podman system service --cors

# Add remote connection
podman system connection add remote ssh://user@host/tmp/podman.sock

# List connections
podman system connection list
```

## Advanced Operations

### 1. Container Inspection and Debugging

```bash
# Deep inspect container metadata
podman inspect container_name --format '{{.Config.Env}}'

# Real-time container logs with timestamps
podman logs -f --timestamps container_name

# Execute interactive shell in running container
podman exec -it container_name /bin/bash

# Copy files between host and container
podman cp file.txt container_name:/path/to/destination
podman cp container_name:/path/to/file.txt ./

# View container resource usage
podman stats container_name --no-stream

# Export container filesystem as tar
podman export container_name > container_backup.tar

# Import container from tar
podman import container_backup.tar new_image:tag
```

### 2. Image Operations and Management

```bash
# Save image to tar archive
podman save -o myimage.tar localhost/myapp:latest

# Load image from tar archive
podman load -i myimage.tar

# Commit running container to new image
podman commit container_name new_image:tag

# View image layers and history
podman history image_name

# Remove dangling images
podman image prune

# Remove all unused images
podman image prune -a

# Build multi-stage image with build arguments
podman build --build-arg VERSION=1.0 --target production -t app:prod .

# Build for different architectures
podman build --platform linux/amd64,linux/arm64 -t multiarch-app .
```

### 3. Advanced Networking

```bash
# Create macvlan network for direct host network access
podman network create -d macvlan \
    --subnet=192.168.1.0/24 \
    --gateway=192.168.1.1 \
    -o parent=eth0 \
    macvlan-network

# Port forwarding with specific protocols
podman run -d -p 127.0.0.1:8080:80/tcp -p 127.0.0.1:9090:9090/udp nginx

# Connect multiple networks to single container
podman run -d --network network1 --network network2 myapp

# Disable networking completely
podman run -d --network none isolated-app

# Custom DNS configuration
podman run -d --dns 8.8.8.8 --dns-search example.com myapp
```

### 4. Security Hardening

```bash
# Run with specific user/group IDs
podman run -d --user 1001:1001 --group-add 2001 myapp

# Drop all capabilities and add specific ones
podman run -d --cap-drop=all --cap-add=net_bind_service nginx

# Read-only root filesystem with tmpfs for writable areas
podman run -d --read-only --tmpfs /tmp --tmpfs /var/run nginx

# SELinux context isolation
podman run -d --security-opt label=type:container_runtime_t myapp

# Custom seccomp profile
podman run -d --security-opt seccomp=custom-profile.json myapp

# No new privileges
podman run -d --security-opt no-new-privileges myapp
```

### 5. Resource Management

```bash
# CPU limits and reservations
podman run -d --cpus="1.5" --cpu-shares=1024 cpu-intensive-app

# Memory limits with swap
podman run -d --memory=512m --memory-swap=1g memory-app

# Block I/O limits
podman run -d --device-read-bps /dev/sda:1mb \
             --device-write-bps /dev/sda:1mb \
             io-intensive-app

# PID limits
podman run -d --pids-limit=100 fork-bomb-protection

# Ulimit configurations
podman run -d --ulimit nofile=1024:2048 file-heavy-app
```

## Performance Tuning

### 1. Storage Optimization

```bash
# Use faster storage driver
podman info --format '{{.Store.GraphDriverName}}'

# Optimize overlay2 with metacopy
echo 'metacopy=on' >> /etc/containers/storage.conf

# Use tmpfs for temporary data
podman run -d --tmpfs /tmp:size=100M,noexec,nosuid,nodev myapp

# Volume performance tuning
podman volume create --opt type=tmpfs --opt device=tmpfs --opt o=size=1G fast-volume
```

### 2. Memory Management

```bash
# Enable memory accounting in cgroups v2
echo 'memory_accounting=1' >> /proc/cmdline

# Use memory mapping for large files
podman run -d --shm-size=2g --memory=4g database-app

# Configure swap behavior
podman run -d --memory=1g --memory-swappiness=10 memory-sensitive-app

# Monitor memory usage patterns
podman stats --format "table {{.Container}}\t{{.MemUsage}}\t{{.MemPerc}}"
```

### 3. CPU Optimization

```bash
# CPU affinity for dedicated cores
podman run -d --cpuset-cpus="0,1" --cpus="2" cpu-bound-app

# Real-time scheduling (requires privileges)
podman run -d --cpu-rt-runtime=950000 --cpu-rt-period=1000000 realtime-app

# NUMA topology awareness
podman run -d --cpuset-mems="0" --cpuset-cpus="0-3" numa-aware-app
```

### 4. Network Performance

```bash
# Use host networking for maximum performance
podman run -d --network host high-throughput-app

# Tune network buffer sizes
podman run -d --sysctl net.core.rmem_max=134217728 \
             --sysctl net.core.wmem_max=134217728 \
             network-intensive-app

# Enable multi-queue networking
podman run -d --device /dev/net/tun network-app
```

## Troubleshooting

### 1. Container Startup Issues

```bash
# Debug container startup with verbose logging
podman run --log-level debug problematic-image

# Check container exit codes and reasons
podman ps -a --format "table {{.Names}}\t{{.Status}}\t{{.ExitCode}}"

# Inspect container configuration
podman inspect container_name | jq '.[]|{State,Config,NetworkSettings}'

# Check for resource constraints
podman inspect container_name --format '{{.HostConfig.Memory}}'

# Verify image integrity
podman run --rm -it image_name /bin/sh -c "echo 'Image accessible'"
```

### 2. Network Connectivity Issues

```bash
# Test container network connectivity
podman exec container_name ping -c 3 8.8.8.8

# Check DNS resolution
podman exec container_name nslookup google.com

# Verify port bindings
podman port container_name

# Network interface inspection
podman exec container_name ip addr show

# Check iptables rules (rootful containers)
sudo iptables -L -n | grep podman

# Debug CNI network plugins
podman network inspect network_name
```

### 3. Storage and Volume Issues

```bash
# Check volume mount status
podman inspect container_name --format '{{.Mounts}}'

# Verify filesystem permissions
podman exec container_name ls -la /mounted/path

# Check disk space usage
podman system df

# Volume cleanup and troubleshooting
podman volume prune
podman volume ls --filter dangling=true

# SELinux context issues
podman run -v /host/path:/container/path:Z image_name
```

### 4. Performance Debugging

```bash
# CPU usage profiling
podman exec container_name top -bn1

# Memory usage analysis
podman exec container_name cat /proc/meminfo

# I/O statistics
podman exec container_name iostat 1 5

# Network traffic monitoring
podman exec container_name ss -tuln

# System call tracing
podman exec container_name strace -p 1 -c
```

### 5. Log Analysis

```bash
# Structured log parsing
podman logs container_name --since 1h | grep ERROR

# Log rotation and management
podman logs --tail 100 --timestamps container_name

# Export logs for analysis
podman logs container_name > /tmp/container.log 2>&1

# Real-time log monitoring with filtering
podman logs -f container_name | grep -E "(ERROR|WARN|FATAL)"

# Journal integration for systemd services
journalctl -u podman-container@service-name -f
```

### 6. System-Level Debugging

```bash
# Check Podman system status
podman system info | grep -E "(Version|Storage|Security)"

# Verify cgroups configuration
cat /proc/mounts | grep cgroup

# Check user namespace configuration
cat /proc/self/uid_map
cat /proc/self/gid_map

# Verify container runtime
podman system info --format '{{.Host.OCIRuntime.Name}}'

# Security module status
podman system info --format '{{.Host.Security}}'
```

## Production Best Practices

### 1. Container Lifecycle Management

```bash
# Health check implementation
podman run -d --health-cmd="curl -f http://localhost:8080/health" \
              --health-interval=30s \
              --health-timeout=10s \
              --health-retries=3 \
              webapp

# Graceful shutdown handling
podman run -d --stop-timeout=30 \
              --stop-signal=SIGTERM \
              graceful-app

# Restart policy configuration
podman run -d --restart=unless-stopped \
              --restart-policy=on-failure:3 \
              resilient-app
```

### 2. Monitoring and Observability

```bash
# Export metrics in Prometheus format
podman run -d -p 9090:9090 prom/prometheus

# Container resource monitoring
podman stats --format "json" | jq '.[]|{name,cpu,memory}'

# Event monitoring and alerting
podman events --filter type=container --format="{{.Time}} {{.Action}} {{.Actor.Attributes.name}}"

# Log aggregation setup
podman run -d --log-driver=journald \
              --log-opt tag="{{.ImageName}}" \
              application
```

## Basic Commands

```bash
# Basic container lifecycle
podman run --name <container_name> -p ext_port:int_port <container_image>
podman start <container_name>
podman inspect <container_name>

# Example: Running nginx
podman run --name nginx -p 8080:80 nginx
podman start nginx
podman inspect nginx

# Port mapping verification
podman port nginx  # Shows: 80/tcp -> 0.0.0.0:8080
# Test with: curl localhost:8080

# Container management
podman stop nginx
podman rm <container_id>

# Image management
podman images
podman rmi <image_id>

# Show all containers and images
podman ps -a && podman images

# Get help
podman --help
```

### Podman Help Overview

```
Manage pods, containers and images

Usage:
  podman [options] [command]

Available Commands:
  artifact    Manage OCI artifacts
  attach      Attach to a running container
  auto-update Auto update containers according to their auto-update policy
  build       Build an image using instructions from Containerfiles
  commit      Create new image based on the changed container
  compose     Run compose workloads via an external provider such as docker-compose or podman-compose
  container   Manage containers
  cp          Copy files/folders between a container and the local filesystem
  create      Create but do not start a container
  diff        Display the changes to the object's file system
  events      Show podman system events
  exec        Run a process in a running container
  export      Export container's filesystem contents as a tar archive
  farm        Farm out builds to remote machines
  generate    Generate structured data based on containers, pods or volumes
  healthcheck Manage health checks on containers
  help        Help about any command
  history     Show history of a specified image
  image       Manage images
  images      List images in local storage
  import      Import a tarball to create a filesystem image
  info        Display podman system information
  init        Initialize one or more containers
  inspect     Display the configuration of object denoted by ID
  kill        Kill one or more running containers with a specific signal
  kube        Play containers, pods or volumes from a structured file
  load        Load image(s) from a tar archive
  login       Log in to a container registry
  logout      Log out of a container registry
  logs        Fetch the logs of one or more containers
  machine     Manage a virtual machine
  manifest    Manipulate manifest lists and image indexes
  mount       Mount a working container's root filesystem
  network     Manage networks
  pause       Pause all the processes in one or more containers
  pod         Manage pods
  port        List port mappings or a specific mapping for the container
  ps          List containers
  pull        Pull an image from a registry
  push        Push an image to a specified destination
  rename      Rename an existing container
  restart     Restart one or more containers
  rm          Remove one or more containers
  rmi         Remove one or more images from local storage
  run         Run a command in a new container
  save        Save image(s) to an archive
  search      Search registry for image
  secret      Manage secrets
  start       Start one or more containers
  stats       Display a live stream of container resource usage statistics
  stop        Stop one or more containers
  system      Manage podman
  tag         Add an additional name to a local image
  top         Display the running processes of a container
  unmount     Unmount working container's root filesystem
  unpause     Unpause the processes in one or more containers
  unshare     Run a command in a modified user namespace
  untag       Remove a name from a local image
  update      Update an existing container
  version     Display the Podman version information
  volume      Manage volumes
  wait        Block on one or more containers
```

## Building Container Images

```bash
# Create Dockerfile
vim Dockerfile

# Build image
podman build -t <image_name> .

# Run with environment variables
podman run --name <container_name> -e <env_variables> -p 8080:8080 <image_name>:<tag>
```

This comprehensive structure provides deep technical understanding of Podman's architecture, features, and operations while maintaining practical examples and low-level implementation details for experienced DevOps and backend engineers.
