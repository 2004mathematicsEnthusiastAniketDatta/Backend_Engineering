# https://docs.docker.com/engine/install/debian/
# https://hub.docker.com
# Use a base image

FROM node:18-alpine

# # Create a non-root user
# RUN addgroup -S app && adduser -S app -G app

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]

# Docker Architecture Components:
# 1. Docker Engine: Core runtime that manages containers, images, networks, and volumes
# 2. Docker Hub: Cloud-based registry service for sharing container images
# 3. Local Docker Registry: Private registry for storing images locally
# 4. Docker Daemon: Background service that manages Docker objects
# 5. Docker CLI: Command-line interface for interacting with Docker daemon
# 6. containerd: High-level container runtime that manages container lifecycle
# 7. runc: Low-level container runtime that actually runs containers

# This Dockerfile will be built into an image and can be:
# - Stored locally in Docker Engine's image cache
# - Pushed to Docker Hub for public sharing
# - Pushed to a private registry for team/organization use
# Docker Behind the Scenes - In Depth:

# Image Layers & Union File System:
# - Each instruction creates a new layer in the image
# - Layers are read-only and cached for reuse
# - Union file system (OverlayFS) combines layers into single view
# - Copy-on-Write: containers get writable layer on top

# Container Runtime Process:
# 1. Docker CLI sends API calls to Docker daemon via REST API
# 2. Daemon pulls image layers from registry if not cached locally
# 3. containerd manages container lifecycle (create, start, stop)
# 4. runc creates container using Linux namespaces and cgroups
# 5. Container process runs isolated in its own namespace

# Linux Kernel Features Used:
# - Namespaces: Process isolation (PID, Network, Mount, User, IPC, UTS)
# - Cgroups: Resource limiting and monitoring (CPU, Memory, I/O)
# - Capabilities: Fine-grained privilege control
# - Seccomp: System call filtering for security
# - AppArmor/SELinux: Mandatory access control

# Networking:
# - Bridge network: Default isolated network per container
# - Host network: Container shares host's network stack
# - None network: No network access
# - Custom networks: User-defined networks with DNS resolution
# - Port mapping: iptables rules forward host ports to container

# Storage:
# - Volumes: Persistent data managed by Docker
# - Bind mounts: Direct host directory mounting
# - tmpfs: Temporary memory-based storage
# - Storage drivers: Device mapper, overlay2, btrfs, zfs

# Build Process Optimization:
# - Multi-stage builds reduce final image size
# - BuildKit: Enhanced build engine with parallel processing
# - Build cache: Reuses unchanged layers across builds
# - .dockerignore: Excludes files from build context

# Pull and run PostgreSQL database server
# Command to pull and run PostgreSQL container:
# docker pull postgres:15-alpine
# docker run -d \
#   --name postgres-db \
#   -e POSTGRES_DB=myapp \
#   -e POSTGRES_USER=admin \
#   -e POSTGRES_PASSWORD=password123 \
#   -p 5432:5432 \
#   -v postgres_data:/var/lib/postgresql/data \
#   postgres:15-alpine

# For docker-compose integration, create docker-compose.yml:
# version: '3.8'
# services:
#   postgres:
#     image: postgres:15-alpine
#     container_name: postgres-db
#     environment:
#       POSTGRES_DB: myapp
#       POSTGRES_USER: admin
#       POSTGRES_PASSWORD: password123
#     ports:
#       - "5432:5432"
#     volumes:
#       - postgres_data:/var/lib/postgresql/data
#     networks:
#       - app-network
# 
# volumes:
#   postgres_data:
# 
# networks:
#   app-network:
#     driver: bridge

# Multi-container setup with PostgreSQL database
# Create a separate Dockerfile for PostgreSQL or use docker-compose

# Option 1: Separate PostgreSQL Dockerfile (Dockerfile.postgres)
# FROM postgres:15-alpine
# ENV POSTGRES_DB=myapp
# ENV POSTGRES_USER=admin
# ENV POSTGRES_PASSWORD=password123
# EXPOSE 5432

# Option 2: Use docker-compose.yml for multi-service setup
# Build and run both services together:
# docker-compose up --build

# To run PostgreSQL alongside this Node.js app:
# 1. Build this Dockerfile: docker build -t node-app .
# 2. Create network: docker network create app-network
# 3. Run PostgreSQL: docker run -d --name postgres-db --network app-network -e POSTGRES_DB=myapp -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=password123 -p 5432:5432 postgres:15-alpine
# 4. Run Node app: docker run -d --name node-app --network app-network -p 3000:3000 node-app

# For production, use docker-compose.yml:
# docker-compose up -d

# Looking at your Dockerfile comments, I can see you're working with Docker containers for a Node.js app with PostgreSQL. Let me explain the key Docker lifecycle commands for managing containers:

# Docker Start, Stop, and Remove Commands
# docker start - Resume a stopped container
# docker stop - Gracefully stop a running container
# docker rm - Remove/delete containers
# Key Differences & Workflow:
# docker run <CONTAINER ID> → Creates AND starts a new container
# docker stop <CONTAINER ID> → Stops the container (data persists)
# docker start <CONTAINER ID> → Restarts an existing stopped container
# docker rm <CONTAINER ID> → Permanently deletes the container
# Common Workflow with Your Setup:
# Gotchas:
# You can't start a container that was never created with run
# rm permanently deletes containers - you'll lose any data not in volumes
# Use docker-compose down instead of individual stops when using compose files
# For your multi-service setup, docker-compose commands are usually more convenient than managing individual containers!
# docker --man : manual of docker

# A self-sufficient runtime for containers

# Common Commands:
#   run         Create and run a new container from an image
#   exec        Execute a command in a running container
#   ps          List containers
#   build       Build an image from a Dockerfile
#   pull        Download an image from a registry
#   push        Upload an image to a registry
#   images      List images
#   login       Authenticate to a registry
#   logout      Log out from a registry
#   search      Search Docker Hub for images
#   version     Show the Docker version information
#   info        Display system-wide information

# Management Commands:
#   builder     Manage builds
#   buildx*     Docker Buildx
#   compose*    Docker Compose
#   container   Manage containers
#   context     Manage contexts
#   image       Manage images
#   manifest    Manage Docker image manifests and manifest lists
#   network     Manage networks
#   plugin      Manage plugins
#   system      Manage Docker
#   trust       Manage trust on Docker images
#   volume      Manage volumes

# Swarm Commands:
#   swarm       Manage Swarm

# Commands:
#   attach      Attach local standard input, output, and error streams to a running container
#   commit      Create a new image from a container's changes
#   cp          Copy files/folders between a container and the local filesystem
#   create      Create a new container
#   diff        Inspect changes to files or directories on a container's filesystem
#   events      Get real time events from the server
#   export      Export a container's filesystem as a tar archive
#   history     Show the history of an image
#   import      Import the contents from a tarball to create a filesystem image
#   inspect     Return low-level information on Docker objects
#   kill        Kill one or more running containers
#   load        Load an image from a tar archive or STDIN
#   logs        Fetch the logs of a container
#   pause       Pause all processes within one or more containers
#   port        List port mappings or a specific mapping for the container
#   rename      Rename a container
#   restart     Restart one or more containers
#   rm          Remove one or more containers
#   rmi         Remove one or more images
#   save        Save one or more images to a tar archive (streamed to STDOUT by default)
#   start       Start one or more stopped containers
#   stats       Display a live stream of container(s) resource usage statistics
#   stop        Stop one or more running containers
#   tag         Create a tag TARGET_IMAGE that refers to SOURCE_IMAGE
#   top         Display the running processes of a container
#   unpause     Unpause all processes within one or more containers
#   update      Update configuration of one or more containers
#   wait        Block until one or more containers stop, then print their exit codes

# Global Options:
#       --config string      Location of client config files (default "/home/codespace/.docker")
#   -c, --context string     Name of the context to use to connect to the daemon (overrides DOCKER_HOST env var and default context
#                            set with "docker context use")
#   -D, --debug              Enable debug mode
#   -H, --host list          Daemon socket to connect to
#   -l, --log-level string   Set the logging level ("debug", "info", "warn", "error", "fatal") (default "info")
#       --tls                Use TLS; implied by --tlsverify
#       --tlscacert string   Trust certs signed only by this CA (default "/home/codespace/.docker/ca.pem")
#       --tlscert string     Path to TLS certificate file (default "/home/codespace/.docker/cert.pem")
#       --tlskey string      Path to TLS key file (default "/home/codespace/.docker/key.pem")
#       --tlsverify          Use TLS and verify the remote
#   -v, --version            Print version information and quit

# Run 'docker COMMAND --help' for more information on a command.

# For more help on how to use Docker, head to https://docs.docker.com/go/guides/
# docker --help

# docker run --help

# Use Ubuntu as base image
FROM ubuntu:22.04

# Avoid interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install PostgreSQL and required packages
RUN apt-get update && apt-get install -y \
    postgresql \
    postgresql-contrib \
    sudo \
    && rm -rf /var/lib/apt/lists/*

# Switch to postgres user
USER postgres

# Initialize the database
RUN /etc/init.d/postgresql start && \
    psql --command "CREATE USER docker WITH SUPERUSER PASSWORD 'docker';" && \
    createdb -O docker docker

# Adjust PostgreSQL configuration
RUN echo "host all all 0.0.0.0/0 md5" >> /etc/postgresql/*/main/pg_hba.conf
RUN echo "listen_addresses='*'" >> /etc/postgresql/*/main/postgresql.conf

# Expose the PostgreSQL port
EXPOSE 5432

# Add a script to start PostgreSQL
USER root
RUN echo '#!/bin/bash\n\
service postgresql start\n\
tail -f /var/log/postgresql/postgresql-*-main.log' > /start-postgres.sh && \
chmod +x /start-postgres.sh

# Start PostgreSQL when container starts
CMD ["/start-postgres.sh"]

# Images
# docker images
# docker run -d hello-world : running containers  in detached mode
# docker ps : list running containers
# docker ps -a : list all containers (including stopped)
# docker rmi <imageid> : remove the image
# docker rmi -f <imageid> : remove an image forced
# docker exec -it <CONTAINER_ID> : execute container
# docker exec -it <CONTAINER_ID> /bin/bash : open interactive bash shell in running container
# docker logs <CONTAINER_ID> : view container logs
# docker logs -f <CONTAINER_ID> : follow/tail container logs in real-time
# docker stop <CONTAINER_ID> : stop a running container
# docker start <CONTAINER_ID> : start a stopped container
# docker restart <CONTAINER_ID> : restart a container
# docker rm <CONTAINER_ID> : remove a stopped container
# docker rm -f <CONTAINER_ID> : force remove a running container
# docker kill <CONTAINER_ID> : forcefully kill a running container
# docker inspect <CONTAINER_ID> : detailed container information
# docker stats <CONTAINER_ID> : real-time resource usage statistics
# docker top <CONTAINER_ID> : display running processes in container
# docker port <CONTAINER_ID> : list port mappings
# docker cp <CONTAINER_ID>:/path/to/file ./local/path : copy files from container to host
# docker cp ./local/file <CONTAINER_ID>:/path/to/destination : copy files from host to container
# docker commit <CONTAINER_ID> <new_image_name> : create new image from container changes
# docker export <CONTAINER_ID> > container.tar : export container filesystem as tar
# docker pause <CONTAINER_ID> : pause all processes in container
# docker unpause <CONTAINER_ID> : unpause all processes in container
# docker rename <CONTAINER_ID> <new_name> : rename a container
# docker update --memory=512m <CONTAINER_ID> : update container resource limits
# docker wait <CONTAINER_ID> : wait for container to stop and get exit code
# docker attach <CONTAINER_ID> : attach to running container's stdout/stdin
# docker diff <CONTAINER_ID> : show filesystem changes since container creation
# used /explain (rerun without)
# I can see you have a comprehensive Docker command reference in your Dockerfile. Let me break down the key Docker concepts and explain these commands in the context of your JavaScript/npm/yarn project.

# Core Docker Concepts
# 1. Docker Images 📦
# Think of images as read-only templates - like a recipe or blueprint:

# Contains your app code, dependencies, and runtime environment
# Immutable (unchangeable once built)
# Built from Dockerfiles using docker build
# 2. Docker Containers 🏃‍♂️
# Containers are running instances of images:

# Like a live process spawned from your image blueprint
# Writable layer on top of the image
# Can be started, stopped, modified, and deleted
# 3. Dockerfiles 📝
# Text files with build instructions:

# Define how to create your image
# Specify base image, copy files, install dependencies, set commands
# Command Breakdown by Category
# Container Lifecycle Management

# # Start/Stop containersdocker run <IMAGE>              # Create and start new containerdocker start <CONTAINER_ID>     # Start existing stopped containerdocker stop <CONTAINER_ID>      # Gracefully stop containerdocker restart <CONTAINER_ID>   # Stop then start containerdocker kill <CONTAINER_ID>      # Force kill (like SIGKILL)docker rm <CONTAINER_ID>        # Delete stopped container
# Monitoring & Debugging

# # Get container infodocker inspect <CONTAINER_ID>   # JSON metadata (IP, volumes, env vars)docker stats <CONTAINER_ID>     # Live CPU/memory/network usagedocker top <CONTAINER_ID>       # Running processes (like 'ps' command)docker logs <CONTAINER_ID>      # Container's stdout/stderr outputdocker port <CONTAINER_ID>      # Port mappings (container:host)
# File Operations

# # Copy files between host and containerdocker cp <CONTAINER_ID>:/app/dist ./build     # Container → Hostdocker cp ./package.json <CONTAINER_ID>:/app   # Host → Container
# Container State Control

# # Process managementdocker pause <CONTAINER_ID>     # Freeze all processes (SIGSTOP)docker unpause <CONTAINER_ID>   # Resume processes (SIGCONT)docker wait <CONTAINER_ID>      # Block until container exitsdocker attach <CONTAINER_ID>    # Connect to container's main process
# Advanced Operations

# # Create new images from containersdocker commit <CONTAINER_ID> my-app:v2    # Save container changes as imagedocker export <CONTAINER_ID> > backup.tar # Export entire filesystemdocker diff <CONTAINER_ID>                # Show file changes since startdocker update --memory=512m <CONTAINER_ID> # Modify resource limitsdocker rename <CONTAINER_ID> my-new-name   # Change container name
# JavaScript Project Context
# For your npm/yarn JavaScript project, here's a typical workflow:


# # Build image from Dockerfiledocker build -t my-js-app .# Run container with port mappingdocker run -d -p 3000:3000 --name my-app my-js-app# Check if it's runningdocker ps# View logs (useful for debugging)docker logs my-app# Copy built files outdocker cp my-app:/app/dist ./build# Update container resources if neededdocker update --memory=1g my-app
# Key Gotchas ⚠️
# Container vs Image: docker run creates NEW containers each time. Use docker start for existing ones.

# Data Persistence: Container changes are lost unless you:

# Use volumes (-v)
# Commit to new image
# Copy files out
# Port Mapping: Your app might run on port 3000 inside container, but you need -p 3000:3000 to access from host.

# Process Management: docker stop is graceful (SIGTERM), docker kill is forceful (SIGKILL).

# Docker images: A docker image is a lightweight, standalone, executable package 
# that includes everything needed to run a piece of software, including the code, runtime, libraries, environment variables,
# configuration files, and system tools. Images are immutable and can be versioned, making them ideal for consistent deployments.
# Layer : Each instruction in a Dockerfile creates a new layer in the image. Layers are stacked on top of each other, and
# only the layers that change need to be rebuilt, making the build process more efficient.
# Caching: Docker caches layers to speed up subsequent builds. If a layer hasn't changed, Docker reuses the cached version.
# Immutable: Docker images are immutable, meaning once they are created, they cannot be changed. 
# This ensures consistency and reliability in deployments.
# Images are portable: Docker images can be easily shared and run on any system that has Docker installed,
# regardless of the underlying infrastructure.
# Container: A container is a running instance of a Docker image. 
# It is an isolated environment that runs the software defined by the image.
# Isolation: Containers run in their own isolated environments, with their own filesystem, processes, and network interfaces.
# This ensures that applications running in containers do not interfere with each other or the host system.
# Ephemeral: Containers are ephemeral by nature, meaning they can be created and destroyed easily.
# This makes them ideal for microservices and scalable applications.
# Portable: Containers can run on any system that has Docker installed, making them highly portable across different environments.

# Write a docker file  and build a container image for my react application
# having the node 22 image 
FROM node:22-alpine

# Set working directory: directories in my container
WORKDIR /app

# Copy package files
COPY package*.json ./
# package*: regex for all files with package.lock.json and package.json
# Install dependencies 
RUN npm install
# RUN executes the command at the build time
# Copy application code
COPY . .
# copy all files and folders to the container . means current folder and second . is for folder
# Expose port
EXPOSE 5173
# via NGINX or vite.config.ts server object
# Start the application
CMD ["npm", "run", "dev"]
#CMD runs the command at  container run-time

# docker run --name application-db-container -e POSTGRES_DB=myapp -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=password123 -p 5432:5432 postgres:15-alpine
# Command Breakdown
# docker run - The base Docker command to create and start a new container from an image

# --name application-db-container - Sets a custom name for the container instead of Docker generating a random one. This makes it easier to reference later (e.g., docker stop application-db-container)

# -e POSTGRES_DB=myapp - Sets an environment variable inside the container. This tells PostgreSQL to create a database named "myapp" on startup

# -e POSTGRES_USER=admin - Sets another environment variable to create a PostgreSQL user named "admin"

# -e POSTGRES_PASSWORD=password123 - Sets the password for the PostgreSQL user to "password123"

# -p 5432:5432 - Maps ports between your host machine and the container. Format is host_port:container_port. This allows you to connect to the database on localhost:5432

# postgres:15-alpine - The Docker image to use. This is PostgreSQL version 15 running on Alpine Linux (a lightweight Linux distribution)

# Important Notes
# ⚠️ Security Gotcha: This command exposes database credentials in plain text. In production, use Docker secrets or environment files instead.

# 🔧 Missing Flag: You might want to add -d to run the container in detached mode (in the background):


# docker run -d --name application-db-container -e POSTGRES_DB=myapp -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=password123 -p 5432:5432 postgres:15-alpine
# This setup is typical for local development with JavaScript/Node.js applications that need a PostgreSQL database.

# docker run -v $(pwd):/app <file path> <image>: This mounts the current directory into the /app directory in the container
# docker stop $(docker ps -q )  : This stops all the running containers

# Basic Command

# docker stop $(docker ps -q)
# How It Works
# This command uses command substitution - let me break it down:

# docker ps -q - Lists only the container IDs of running containers (-q = quiet mode)
# $() - Command substitution that passes the output of docker ps -q as arguments
# docker stop - Stops each container ID provided
# Alternative Methods
# Stop and Remove All Containers

# # Stop all running containersdocker stop $(docker ps -q)# Remove all stopped containersdocker rm $(docker ps -aq)
# One-liner to Stop and Remove

# docker container prune -f
# Using Docker Compose (if applicable)
# If you're using Docker Compose for your JavaScript/npm project:


# docker-compose down
# Gotchas to Watch Out For
# ⚠️ Empty Result: If no containers are running, docker ps -q returns nothing, and docker stop will just do nothing (safe)

# ⚠️ Force Stop: If containers don't stop gracefully, use:


# docker kill $(docker ps -q)
# ⚠️ Specific Containers: To stop only your database container:


# docker stop application-db-container
# This is particularly useful during JavaScript development when you're frequently starting/stopping your PostgreSQL container for testing!

#  docker container prune -f : removing all the stopped containers permanently by force

# docker <container name> prune
# Git and Docker: Internals and Workflow
# Git Architecture and Data Model
# Git is a distributed version control system that stores snapshots of the project tree as immutable objects.
# At its core, Git is a content-addressable filesystem: every object (file contents, directories, commits, etc.) is
# hashed by its contents to produce a unique SHA-1 (soon SHA-256) identifier 1 2 . The object types are:
# • Blob: holds the contents of a file. Each unique file content yields a blob; identical content always
# produces the same blob hash 2 .
# • Tree: represents a directory. A tree object contains entries (mode, type, SHA, name) for files
# (blobs) and subdirectories (other trees) in that directory 3 2 .
# • Commit: records a snapshot. A commit object points to a tree (the project state at that commit) and
# includes metadata (author, committer, timestamp, message) and parent commit SHA(s) 4 5 . This
# links histories. Git creates a new commit by writing a tree of the staged files and then a commit
# object that references that tree and its parent(s) 6 4 .
# • Tag: names another object (usually a commit). A tag object can point to a commit (or another tag)
# and carries a human-readable name and message 7 8 (e.g. marking releases).
# Each object is stored with a header and its contents, then compressed (with zlib) and saved in .git/
# objects . The storage layout splits the 40-character SHA-1: the first two hex characters form a directory,
# and the remaining 38 are the filename 9 10 . For example, hashing and writing “hello world” yields a blob
# stored at .git/objects/3b/18e512... . The SHA-1 guarantee means it’s virtually impossible for two
# different contents to share an ID 11 , so Git can always verify object integrity by recomputing the hash.
# Objects on disk: Initially, each object is written as an individual file. Over time Git will pack these objects into
# compressed “packfiles” to save space and speed up network transfers. The git gc command repacks
# loose objects into .git/objects/pack/*.pack and an index .idx . Packfiles store many objects
# together, often using delta-compression between similar objects.
# References: Git stores branches, tags, and other refs as simple files containing a commit SHA. Branch
# pointers (in .git/refs/heads/ ) and tags (in .git/refs/tags/ ) are just names for specific commits.
# The special HEAD file is a symbolic ref that points to the current branch (or directly to a commit in
# “detached HEAD” mode). This makes branching very cheap – creating a branch just writes a new ref file, and
# switching branches updates HEAD .
# Index (Staging Area): The file .git/index is a binary table mapping file paths to blob hashes and
# metadata. When you run git add , Git writes the file’s blob and updates the index entry. At commit time,
# Git writes a tree from the index and then a commit. Under the hood, tools like git update-index , git
# write-tree , and git commit-tree manipulate this data. For example:
# 1git update-index --add --cacheinfo 100644,83baae6,test.txt
# # Writes 'test.txt' blob hash 83baae6 in the index, ready to commit.
# This low-level plumbing is what the porcelain commands ( git add , git commit ) ultimately do behind
# the scenes 12
# 4
# .
# Storage structure ( .git ): The .git directory holds everything:
# - objects/ (blobs, trees, commits, tags, and packfiles),
# - refs/ (branch/tag refs),
# - HEAD (current ref),
# - index (staging area),
# - config (repo settings),
# - logs/ (reflogs of refs),
# - packed-refs (optimized ref store), etc.
# This content-addressable, append-only design means history is immutable and verifiable – any corruption
# or change to an object changes its hash, so Git will detect errors 13 14 .
# Git Commit and Branch Mechanics
# A commit object ties a tree to a history. Its format (in git cat-file -p ) looks like:
# tree <tree-SHA>
# parent <parent-SHA>
# # one or more parent lines
# author <name> <email> <timestamp>
# committer <name> <email> <timestamp>
# <commit message>
# When you git commit , Git (via git write-tree and git commit-tree ) packages the current index
# into a tree and writes a commit object pointing to that tree and to the previous commit(s). The branch ref
# (e.g. main ) is then updated to point to this new commit, and HEAD follows the branch pointer. All
# referenced objects remain reachable; unreferenced objects become candidates for later garbage collection.
# Branching and merging are built on top of this model: a branch is simply a movable ref. A merge commit is
# a commit with two (or more) parents, combining histories. Git’s default merge is a three-way merge: it finds
# the most recent common ancestor of the two branch tips, compares both tips against that base, and
# combines changes. If files were changed in both branches, Git tries to merge them or marks conflicts for
# manual resolution 5 . A fast-forward merge (when one branch is ahead of another without divergence) is
# just pointer-moving without a new object. Otherwise, a new commit with two parents is created to tie the
# histories together 5 .
# Rebasing is another way to integrate changes: it rewrites history by taking commits from one branch and
# replaying them onto another base. Internally, Git performs each commit’s diff and makes a fresh commit on
# top of the target branch, changing the parent pointer. This produces new commit SHAs (history diverges),
# 2but a linear topology. In effect “your branch becomes as if it was branched from a different commit” 15 .
# Because rebasing creates new commits, one must force-push to update remote refs. Interactive rebase
# ( git rebase -i ) lets you squash, edit, or reorder commits: Git handles this by again making new commit
# objects for the edited sequence.
# Git Repository Workflow and Commands
# Git’s everyday workflow relies on moving data between three “trees”: the working directory, the index
# (staging area), and the HEAD commit. For example: - git status compares working files, index, and
# HEAD, showing changes staged ( git add ) or unstaged ( git diff ) 16 . - git add adds changes to
# the index (writing blobs in objects/ if needed).
# - git commit -m "msg" creates a new tree from the index and a commit object
# 6
# . - git branch and
# git checkout manage refs: creating, switching, deleting branches.
# Lower-level “plumbing” commands expose Git’s internals. For example:
# git rev-parse HEAD
# git cat-file -p <SHA>
# git ls-tree <commit-SHA>
# git reflog
# # Get SHA of current commit (HEAD)
# # Pretty-print an object (blob/tree/commit/tag)
# # List a tree’s contents (files in that commit)
# # Show history of HEAD (or other ref) movements
# 17
# These help visualize the object graph and repository state. Git also provides tools like git fsck (check
# integrity), git gc (garbage collect and repack), and git prune (remove unreachable objects) to
# maintain the repository.
# For distributed operations, Git treats every clone as a full copy of the repo. The git fetch and git
# pull commands retrieve missing objects from a remote. Under the hood, Git negotiates which commits/
# objects the remote has that you don’t, then transfers only the needed objects (often in a packfile) to fill in
# your database 18 19 . git push similarly sends your new objects to update remote refs. Because objects
# are content-addressed, only new or diverged data is sent.
# Common Git Commands (Summary)
# • Setup: git init (create repo), git config (user, editor, aliases, etc). Config files are in /etc/
# gitconfig , ~/.gitconfig , and .git/config per scope.
# • Clone/Clone: git clone <url> (copy remote repo, set up origin).
# • Work cycle: git status , git add <file> , git commit -m "msg" .
# • History: git log , git diff , git blame , git bisect (find commit introducing an issue).
# • Branching/Merging: git branch / git switch / git checkout , git merge , git rebase ,
# git cherry-pick .
# • Undoing: git revert <commit> (create a new commit that undoes changes; safe for shared
# history), git reset (move HEAD, alters index/working tree for local changes).
# • Remotes: git remote -v , git fetch , git pull , git push , git remote add .
# 3• Inspection: git show <obj> , git cat-file , git ls-tree , git rev-parse , git
# reflog .
# • Maintenance: git gc , git fsck , git prune .
# Always working on feature branches (not directly on main ) is a best practice: develop on a branch, then
# merge (via pull request or similar) into main. Before merging, you might clean up commit history by
# interactive rebase/squash, and use git push --force if rewriting a private branch. Once merged,
# delete the feature branch. This keeps main history linear and easy to audit.
# Docker Architecture and Components
# Docker is a containerization platform that wraps processes in isolated environments. It is built on Linux
# kernel features (namespaces, cgroups, union filesystems) but adds a user-friendly daemon and client. The
# core components are:
# • dockerd (Docker Daemon): runs as a system service, exposes a REST API (via UNIX socket or TCP) to
# manage containers, images, networks, volumes. All docker CLI commands communicate with
# dockerd . The daemon orchestrates container lifecycle and image management.
# • containerd: a specialized container runtime daemon (a graduated CNCF project). Dockerd delegates
# lower-level container operations to containerd. Containerd handles pulling images, managing
# content stores, and controlling containers via an API. It runs as a separate process under dockerd.
# • runc: a lightweight, OCI-compliant runtime (originating from Docker’s libcontainer). containerd uses
# runc to actually spawn and run container processes. Runc performs the final clone() / exec()
# into new namespaces with the proper environment (mounts, namespaces, cgroups, capabilities). It
# implements the OCI Runtime Specification for containers.
# • containerd-shim: for each container, containerd launches a shim process. This allows the container
# to continue running even if containerd or dockerd is restarted or crashes. The shim proxies the
# container’s stdio and exit code back to containerd.
# These components form a hierarchy: docker CLI → dockerd → containerd → runc → container
# processes . When you run a container, the CLI tells dockerd, which ensures the image is present (pulling
# from a registry if needed), then asks containerd to create the container (setting up filesystem, networking,
# namespaces, etc.) and hands it off to runc to exec the process in those namespaces 18 .
# Linux Primitives for Containers
# Namespaces and cgroups are the kernel features that enable containers:
# • Namespaces isolate what a container can see. Key types:
# • PID namespace: container processes have their own PID tree (init inside container is PID 1) 20 .
# • Network namespace: container has its own network stack (interfaces, IPs, routes, iptables) separate
# from host 21 .
# • Mount (mnt) namespace: container sees its own filesystem view – mounts made in the container
# don’t affect the host 22 .
# • UTS namespace: isolated hostname/domainname inside container 21 .
# • IPC namespace: isolated System V IPC (shared memory, semaphores) 23 .
# 4• User namespace: maps user IDs inside container to different IDs on host, allowing root inside
# container to be unprivileged on host 24 .
# • Cgroup namespace: virtualizes the container’s view of its cgroup, so it appears at the root.
# Docker uses these namespaces (via clone(2) / unshare(2) syscalls) to give each container its own
# “little world” 25 . For example, executing docker run effectively does something like:
# clone(CLONE_NEWPID | CLONE_NEWNS | CLONE_NEWNET | CLONE_NEWUTS | CLONE_NEWIPC |
# CLONE_NEWUSER, child_stack, callback);
# This ensures the container process cannot see or interfere with the host’s other processes, mounts, or
# network.
# • Control Groups (cgroups): control and limit resources. Cgroups let Docker bound containers to
# certain CPU, memory, I/O, etc. For example, a memory cgroup can cap RAM usage to 512 MB or
# trigger OOM kill if exceeded. A CPU cgroup can restrict a container to 50% of a CPU core. Each
# container’s processes are placed into cgroups, so resource usage is tracked and enforced 26 27 .
# Docker (via containerd/runc) typically creates cgroup v1 (or v2 on modern systems) controllers for
# CPU, memory, blkio, pids, etc. Example (manual):
# # Limit container to 512MB RAM (memory subsystem v1)
# echo "536870912" > /sys/fs/cgroup/memory/docker/<id>/memory.limit_in_bytes
# # Limit to 50% CPU (quota 50ms per 100ms period)
# echo "50000" > /sys/fs/cgroup/cpu/docker/<id>/cpu.cfs_quota_us
# echo "100000" > /sys/fs/cgroup/cpu/docker/<id>/cpu.cfs_period_us
# • Union Filesystem (OverlayFS): Docker images and containers use a layered filesystem. The default
# overlay2 driver uses Linux OverlayFS to stack image layers and provide copy-on-write. Each
# Docker image is built in layers (one per Dockerfile instruction). At runtime, these read-only layers are
# mounted (lowerdir) and a new writable layer (upperdir) is placed on top. The unified view ( merged
# directory) shows the combined filesystem 28 29 . Writes go into the top layer only (copy-on-write);
# reads go through layers from top to base. For example:
# • Base image layer (e.g. Debian)
# • Layer with installed packages (e.g. Node.js)
# • Layer with application files
# • Container's writable layer on top
# When you COPY or ADD or run commands in a Dockerfile, each produces a new layer. Thanks to layering,
# containers share common base layers efficiently. Only differences (new or changed files) occupy extra
# space. Docker’s overlay2 driver supports many lower layers (up to 128) 30 and creates a mount with
# lowerdir=…:… , upperdir=… , workdir=… .
# 5Container Lifecycle and Images
# Images are immutable sets of layers. When you run docker pull ubuntu:20.04 , Docker downloads a
# manifest and layer archives (tar files) from the registry, storing them by content hash under /var/lib/
# docker . Newer image formats use SHA-256 digests for identification. You can run an image by tag or by
# digest, e.g.:
# docker run ubuntu:20.04
# docker run alpine@sha256:<digest>
# # by tag (latest tag if omitted)
# # by content digest
# Image digests are content-addressable identifiers of the entire image manifest 31 . This ensures you get
# exactly the same image (all layers) when referring to a particular digest.
# docker run: When you execute docker run [OPTIONS] IMAGE [COMMAND] , the CLI sends a REST call to
# the Docker daemon. Internally: 1. Image resolution: Dockerd checks if the image is local. If not, it pulls
# from the registry (using HTTP, Docker Registry API v2). Each layer blob is fetched and stored locally. 2.
# Container creation: Docker generates a unique ID, creates metadata under /var/lib/docker/
# containers/<ID> , and prepares the filesystem by mounting the image layers with OverlayFS.
# 3. Namespace and cgroup setup: The daemon (via containerd/runc) creates new namespaces and
# cgroups. A veth pair (virtual ethernet) is created: one end in the container’s network namespace, the other
# bridged to docker0 . The container is assigned an IP from the Docker bridge (e.g. 172.17.0.2). IPTables
# rules (the DOCKER chain) are added to NAT any published ports from host to the container IP 25 . 4.
# Capability drop and exec: Docker drops many Linux capabilities (like CAP_NET_ADMIN ) for security. It
# then runs runc exec which does a clone() and execve() of the requested command inside the
# namespaces and cgroups. The container process (PID 1 in its namespace) starts with its own filesystem root,
# network, etc.
# 5. Monitoring: containerd (via shim) and dockerd keep track of the container state. Logs (stdout/stderr) are
# captured and can be retrieved with docker logs .
# Networking: By default, Docker uses the bridge network ( docker0 ). Containers can talk to each other
# by name/IP on that bridge. To expose ports, Docker uses NAT: for example, -p 8080:80 adds iptables
# rules so that connections to host port 8080 DNAT to container port 80 25 . Other modes:
# --network host shares the host’s network namespace (no isolation), and user-defined networks (bridge
# or overlay) for advanced connectivity. Each container’s
# /etc/resolv.conf
# points to the Docker
# embedded DNS server (usually at 127.0.0.11), so containers can resolve hostnames of other containers on
# the same network or external names via the host’s DNS.
# Volumes and Storage: Docker supports bind mounts ( -v /host/dir:/container/dir ) and named
# volumes ( docker volume create , then -v volume:/data ). Named volumes live under /var/lib/
# docker/volumes/<volume>/_data . These provide persistent storage independent of the container’s
# lifecycle. In contrast, the container’s filesystem (overlay) is ephemeral: it is destroyed when the container is
# removed. Storage drivers (overlay2, devicemapper, btrfs, etc.) determine how layers are stored; overlay2
# is default on modern kernels 28 .
# 6Common Docker Commands
# • docker run [OPTIONS] IMAGE [COMMAND] [ARG...] : Create and start a container. Options
# include port mappings ( -p host:container ), volume mounts ( -v ), environment variables ( -
# e ), resource limits ( --memory , --cpus ), etc.
# • docker ps : List running containers. Add -a to see all containers.
# • docker exec -it <container> <cmd> : Run a command inside an existing container. Internally,
# Docker uses the nsenter -like mechanism (via setns() syscalls) to enter the container’s
# namespaces and fork/exec the new process 18 .
# • docker stop <container> : Sends SIGTERM (graceful stop) to the container PID, waits (default
# 10s), then SIGKILL if still alive.
# • docker kill <container> : Sends SIGKILL immediately to abort.
# • docker pull <image> / docker push <image> : Download/upload images. Push only updates
# the registry if you have changes (new layers or tags).
# • docker images / docker rmi : List and remove images.
# • docker logs <container> : Fetch the stdout/stderr logs (depends on the logging driver; default
# is JSON-file).
# • docker network ls / docker network inspect : Show networks.
# • docker volume ls / inspect : Manage volumes.
# • docker inspect <container|image> : Show low-level JSON details of a container or image
# (namespaces, mounts, config, etc.).
# • docker stats : Live resource usage of running containers.
# Behind the scenes, Docker uses JSON config files (in
# /var/lib/docker/containers/<ID>/
# config.json ) to store each container’s settings and Linux namespace/cgroup parameters. The docker
# rm command cleans up containers (removing their writable layer and metadata).
# Security and Performance
# Security: Docker provides strong isolation, but not full VM-level security. It isolates processes (namespaces)
# and limits resources (cgroups). By default, Docker drops many Linux capabilities, runs containers as root
# inside the namespace but that can be mapped to a non-root host user (user namespaces), and applies a
# default seccomp and AppArmor/SELinux profile for syscalls. You can further harden containers by running
# them with --read-only , --cap-drop , and custom security options like AppArmor profiles or seccomp
# filters. However, all containers share the host kernel, so kernel exploits can affect containers. Best practices
# include using minimal base images (e.g. Alpine), running non-root users in containers, and keeping Docker
# up-to-date.
# Performance: Containers are lightweight. Typical overhead vs. bare-metal: CPU ~2-5%, memory few
# megabytes, and network ~10% due to virtual networking. I/O performance depends on the storage driver
# and filesystem. Using overlay2 on a modern filesystem (Ext4/XFS) usually has minimal overhead. Multi-
# stage Docker builds and caching layers can greatly speed up image builds. Clean up unused images
# ( docker image prune ) and containers ( docker container prune ) regularly.
# 7Putting It All Together
# By understanding these internals, you can effectively troubleshoot and optimize Git and Docker:
# • Git: Knowing about objects, trees, and commits helps in recovering lost commits ( git fsck ,
# reflog ) or crafting scripts (using plumbing commands like git cat-file , git commit-
# tree ). Recognizing that branches are cheap refs makes branching liberating and merging conflict
# resolution easier. You can optimize Git performance by controlling history size (prune unreachable
# refs, use shallow clones for large repos), and by understanding when and how packfiles are created
# ( git gc --aggressive ).
# • Docker: Knowing the namespace and cgroup setup explains why containers feel isolated yet
# lightweight. Understanding the overlay filesystem clarifies why container files persist only in the top
# layer. Networking internals explain why docker run -p uses NAT rules. You can troubleshoot by
# inspecting container details, examining cgroup settings, or checking journalctl -u docker .
# By mastering these low-level details along with standard commands, you gain full control over version
# control and containerization workflows, enabling sophisticated debugging, automation, and performance
# tuning.
# Sources: Official Git documentation and community guides
# blogs 18 25 28 31 .
# 8
# 1
# 2
# 5
# 15 ;
# Docker documentation and1
# 3
# 6
# 9
# 10
# 12
# 14
# Git - Git Objects
# https://git-scm.com/book/en/v2/Git-Internals-Git-Objects
# 2
# 4
# 11
# 13
# Git Book - The Git Object Model
# https://shafiul.github.io/gitbook/1_the_git_object_model.html
# 5
# Git Merge | Atlassian Git Tutorial
# https://www.atlassian.com/git/tutorials/using-branches/git-merge
# 7
# 8 What is the data structure of Git? Please introduce several basic object types of Git? | yifan-online
# web service yifan
# https://yifan-online.com/en/km/article/detail/11468
# 15
# git rebase | Atlassian Git Tutorial
# https://www.atlassian.com/git/tutorials/rewriting-history/git-rebase
# 16
# 31
# Running containers | Docker Docs
# https://docs.docker.com/engine/containers/run/
# 17
# Git Reflog Configuration | Atlassian Git Tutorial
# https://www.atlassian.com/git/tutorials/rewriting-history/git-reflog
# 18
# 27
# containerd vs. Docker | Docker
# https://www.docker.com/blog/containerd-vs-docker/
# 19
# Git - git-fetch Documentation
# https://git-scm.com/docs/git-fetch
# 20
# 21
# 22
# 23
# 24
# 25
# 26
# 29
# Docker Security: Dissecting Namespaces, cgroups, and the Art of
# Misconfiguration
# https://www.kayssel.com/post/docker-security-1/
# 28
# 30
# OverlayFS storage driver | Docker Docs
# https://docs.docker.com/engine/storage/drivers/overlayfs-driver/
# 9

# BACKENDENGINEERING
# Git Deep Dive: Low-Level System Mechanics

## 1. Git Basics: How Git Works Under the Hood

# Git is a distributed version control system built around snapshots, content-addressable storage, and efficient branching.

# ### Content-Addressable Storage

# - Every file, directory, and commit in Git is stored as an object.
# - Objects are identified by SHA-1 hash of their contents.
# - Four main object types: **blob** (file data), **tree** (directory structure), **commit** (snapshot metadata), **tag** (named reference).

# **Example: Storing a file**
# ```bash
# echo "hello world" | git hash-object -w --stdin
# # Output: SHA-1 hash (e.g., 3b18e512)
# ```
# - The file is compressed and stored in `.git/objects/3b/18e512...`

# ### Snapshots, Not Diffs

# - Each commit is a snapshot of the entire project tree.
# - Trees reference blobs (files) and other trees (subdirectories).
# - Commits reference trees and parent commits.

# **Commit Object Structure**
# ```text
# tree <tree_sha>
# parent <parent_sha>
# author <name> <email> <timestamp>
# committer <name> <email> <timestamp>

# <commit message>
# ```

# ### Branches and References

# - Branches are just pointers (refs) to commit objects.
# - Stored in `.git/refs/heads/branch_name`
# - HEAD is a symbolic ref to the current branch.

# ## 2. Git System Design and Implementation Thinking

# ### Data Model

# - **Immutable objects**: Once written, objects never change.
# - **Loose objects**: Individual files in `.git/objects/`
# - **Packfiles**: Compressed collections of objects for efficiency.

# **Packfile Example**
# ```bash
# git gc  # Packs loose objects into .git/objects/pack/*.pack
# ```

# ### Index (Staging Area)

# - `.git/index` is a binary file tracking the state of the working directory.
# - Maps file paths to blob hashes and metadata.
# - Used to build the next tree object for commit.

# **Low-Level Index Manipulation**
# ```bash
# git update-index --add --cacheinfo 100644 <blob_sha> <file_path>
# ```

# ### Efficient Branching and Merging

# - Branching is cheap: just create a new ref.
# - Merging uses the three-way merge algorithm:
#    - Finds common ancestor (merge base)
#    - Applies changes from both branches

# **Merge Base Example**
# ```bash
# git merge-base branchA branchB
# ```

# ### Distributed Design

# - Every clone is a full copy of the repository (all history, all objects).
# - Remotes are just named URLs; fetch/push exchanges objects and refs.

# **Fetching Objects**
# ```bash
# git fetch origin
# # Negotiates which objects are missing, transfers only those
# ```

# ### Garbage Collection

# - Unreferenced objects are periodically pruned.
# - `git gc` compresses objects and removes unreachable ones.

# ## 3. Low-Level Git Commands

# - `git cat-file -p <sha>`: Inspect object contents
# - `git ls-tree <commit_sha>`: List tree contents
# - `git rev-parse HEAD`: Get current commit SHA
# - `git reflog`: Show history of HEAD movements

# ## 4. Design Principles

# - **Atomicity**: All operations are atomic; corruption is rare.
# - **Efficiency**: Storage and branching are optimized for speed and space.
# - **Integrity**: SHA-1 ensures content integrity.
# - **Simplicity**: Core data model is simple, extensible, and robust.

# Understanding Git at this level helps explain its speed, reliability, and flexibility for modern software development.

# Git Internals & .git Directory
# Git is a content-addressable filesystem with a versioning layer. Its core is the .git directory, which contains all data and metadata for your repository. Understanding this structure is crucial for advanced troubleshooting, performance tuning, and custom tooling.

# Key Components of .git
# objects/
# Stores all data as objects: blobs (file contents), trees (directory structures), commits (snapshots), and tags. Each object is named by its SHA-1 hash, ensuring integrity and deduplication.

# refs/
# Contains pointers to commits:

# refs/heads/ for branches
# refs/tags/ for tags
# refs/remotes/ for remote-tracking branches
# HEAD
# A file pointing to the current branch or commit.

# index
# The staging area; a binary file tracking what will go into the next commit.

# config
# Repository-specific configuration.

# logs/
# Reflogs for branches and HEAD, recording movements for recovery.

# packed-refs
# Optimized storage for refs when there are many tags/branches.

# Core Git Objects
# Blob: Raw file data.
# Tree: Directory listing, mapping filenames to blobs/trees.
# Commit: Snapshot pointer, with metadata (author, message, parent(s)).
# Tag: Named pointer to an object, often a commit.
# Deep Dive: Key Git Commands
# Inspecting Objects
# git cat-file -p <sha>
# Print the contents of any object (blob, tree, commit, tag).
# Use case: Debugging, custom tooling, forensic analysis.

# git ls-tree <commit_sha>
# List the tree structure at a commit.
# Use case: Explore historical directory layouts.

# Navigating History
# git rev-parse HEAD
# Get the current commit SHA.
# Use case: Scripting, plumbing commands.

# git reflog
# Show the history of HEAD and branch movements.
# Use case: Recover lost commits, audit changes.

# Manipulating Objects Directly
# git hash-object <file>
# Create a blob object from a file, print its SHA.

# git update-index --add <file>
# Add a file to the index (staging area).

# git write-tree
# Create a tree object from the current index.

# git commit-tree <tree_sha> -p <parent_sha> -m "msg"
# Create a commit object manually.

# Advanced Branching & Tagging
# git branch <name> <commit_sha>
# Create a branch at a specific commit.

# git tag <name> <commit_sha>
# Create a tag at a specific commit.

# Maintenance & Optimization
# git gc
# Garbage collect unreachable objects, optimize storage.

# git fsck
# Verify repository integrity.

# git prune
# Remove unreachable objects.

# Expert Tips
# Atomicity: All object writes are atomic; corruption is rare due to append-only design.
# Efficiency: Objects are compressed and deduplicated; branching is just moving pointers.
# Integrity: SHA-1 hashes guarantee content integrity; any change alters the hash.
# Simplicity: The core model is simple—everything is an object, referenced by SHA.
# Example: Manual Commit Creation
# Summary
# Understanding Git’s internals empowers you to:

# Recover lost work
# Build custom workflows
# Optimize performance
# Debug complex issues
# Every high-level command (git add, git commit, etc.) is built on these plumbing commands and object manipulations. Mastery of these internals is essential for advanced Git usage in industry settings.

# # Git & GitHub: Practical Guide and Internal Mechanics

# ## What is VCS?

# **Version Control System (VCS)** is a tool for tracking changes to files over time, enabling collaboration, history, and recovery.  
# Popular VCS tools:
# - **Git**: Distributed, supports branching and workflows.
# - **Subversion (SVN)**: Centralized, used in enterprises.
# - **Mercurial**: Distributed, simple.
# - **Perforce**: Centralized, scalable for large projects.

# ### Why Use VCS?
# - **Track Changes**: See who changed what and when.
# - **Collaboration**: Multiple people work together safely.
# - **Branching & Merging**: Isolate features, merge when ready.
# - **Version History**: Revert to previous states.
# - **Conflict Resolution**: Manage simultaneous edits.
# - **Backup & Recovery**: Acts as a backup.

# ---

# ## Git: Core Concepts

# ### The Three Trees
# - **Working Directory**: Your project files.
# - **Staging Area (Index)**: Buffer for changes to be committed.
# - **Repository (.git)**: Stores all history and objects.

# ### Git Objects
# - **Blob**: File content.
# - **Tree**: Directory structure.
# - **Commit**: Snapshot pointer, metadata.
# - **Tag**: Named pointer.

# Objects are identified by SHA-1 hash (moving to SHA-256 for security).

# ---

# ## Git Workflow & Commands

# ### git init
# Initialize a new repository:
# ```sh
# git init
# ```
# Creates `.git` directory with config, HEAD, objects, refs, etc.

# ### git config
# Set configuration options:
# ```sh
# git config --global user.name "Your Name"
# git config --global user.email "your.email@example.com"
# git config --global core.editor "code --wait"
# git config --global alias.s "status -s"
# git config --global alias.lg "log --oneline --graph --decorate --all"
# ```
# Config scopes: system (`/etc/gitconfig`), global (`~/.gitconfig`), local (`.git/config`).

# ### git clone URL
# Clone a remote repository:
# ```sh
# git clone <url>
# ```
# - Initializes local repo.
# - Downloads all history and objects.
# - Sets up remote-tracking branches.

# ### git status
# Show working directory and staging area status:
# ```sh
# git status
# ```
# - Compares working directory, index (`.git/index`), and HEAD.
# - Shows staged, unstaged, and untracked files.

# ### git add .
# Stage all changes:
# ```sh
# git add .
# ```
# - Updates index (`.git/index`).
# - Creates new objects in `.git/objects` for new/modified files.

# ### git commit -m "message"
# Commit staged changes:
# ```sh
# git commit -m "message"
# ```
# - Reads staged changes from index.
# - Creates tree and commit objects in `.git/objects`.
# - Updates branch reference in `.git/refs/heads` and HEAD.

# ### git push
# Upload local commits to remote:
# ```sh
# git push
# ```
# - Authenticates with remote.
# - Transfers new objects.
# - Updates remote branch reference.

# ### git pull
# Fetch and integrate remote changes:
# ```sh
# git pull
# ```
# - Fetches new objects and refs.
# - Merges or rebases into current branch.

# ---

# ## Branching & Merging

# ### git branch
# Manage branches:
# ```sh
# git branch           # List branches
# git branch <name>    # Create branch
# git branch -d <name> # Delete merged branch
# git branch -D <name> # Force delete
# git branch -m <old> <new> # Rename
# git checkout <name>  # Switch branch
# git switch <name>    # Switch branch
# git checkout -b <name> # Create and switch
# ```
# Branches are pointers in `.git/refs/heads`.

# ### Always Work on Feature Branches
# - Main branch is protected/deployed.
# - Create feature branches from main.
# - Submit changes via Pull Request (PR).
# - Delete branch after merge.

# ---

# ## Squashing Commits

# Combine multiple commits into one for a clean history:
# ```sh
# git rebase -i HEAD~N
# # Change 'pick' to 'squash' for commits to combine
# git rebase --continue
# git push --force
# ```
# Squashing is often used before merging to main.

# ---

# ## Rebase

# Move or combine commits to a new base:
# ```sh
# git rebase <base-branch>
# git rebase -i <base-branch>
# git rebase --continue
# git rebase --abort
# git push --force
# ```
# - Rewrites history for a linear timeline.
# - Use for syncing feature branch with main.
# - Prefer squash merge for merging to main.

# ---

# ## git revert

# Undo a commit by creating a new commit that reverses changes:
# ```sh
# git revert <commit-hash>
# git revert --continue
# ```
# - Creates a new commit with reversed changes.
# - Safe for public/shared branches (preserves history).

# ---

# ## Conflict Resolution

# When multiple developers edit the same lines:
# - Git marks conflicts during merge/rebase.
# - Resolve manually or with `git mergetool`.
# - Stage resolved files and continue operation.

# ---

# ## Summary Table

# | Command         | Purpose                                      | Internal Mechanism                        |
# |-----------------|----------------------------------------------|-------------------------------------------|
# | git init        | Initialize repo                              | Creates `.git` directory                  |
# | git config      | Set config options                           | Updates config files                      |
# | git clone       | Clone remote repo                            | Downloads objects, sets up refs           |
# | git status      | Show status                                  | Compares working dir, index, HEAD         |
# | git add .       | Stage changes                                | Updates index, creates objects            |
# | git commit      | Commit staged changes                        | Creates tree/commit objects, updates refs |
# | git push        | Upload commits to remote                     | Transfers objects, updates remote refs    |
# | git pull        | Fetch & integrate remote changes             | Fetches objects, merges/rebases           |
# | git branch      | Manage branches                              | Manipulates refs in `.git/refs/heads`     |
# | git rebase      | Move commits to new base                     | Rewrites history                          |
# | git revert      | Undo commit (safe for shared history)        | Creates new commit with reversed changes  |
# | git merge       | Integrate changes from another branch        | Creates merge commit                      |

# ---

# ## Best Practices

# - Always work on feature branches, not directly on main.
# - Use squash and rebase for clean history.
# - Use revert for undoing public history, reset for local/private.
# - Resolve conflicts carefully and review before merging.
# - Delete feature branches after merging PRs.

# ---

# By understanding these commands and internal mechanics, you can use Git and GitHub efficiently for collaborative, reliable software development.

# ## Git Squashing and Rebase: In-Depth Internals

# ### Squashing Commits

# **Squashing** combines multiple commits into one, streamlining history before merging. Internally, squashing is performed via interactive rebase (`git rebase -i`):

# 1. **Interactive Rebase**:  
#    ```sh
#    git rebase -i HEAD~N
#    ```
#    - Git opens an editor listing the last N commits.
#    - Change `pick` to `squash` (or `s`) for commits to combine.

# 2. **Commit Combination**:  
#    - Git rewrites history by creating a new commit containing all changes.
#    - Old commits are replaced; only the squashed commit remains.

# 3. **Object Manipulation**:  
#    - Git creates a new tree object representing the combined state.
#    - A new commit object is written, referencing the new tree and parent.

# 4. **Force Push Required**:  
#    - Since history is rewritten, a force push (`git push --force`) is needed to update remote branches.

# **Example Workflow**:
# ```sh
# git rebase -i HEAD~3
# # Change second and third 'pick' to 'squash'
# git rebase --continue
# git push --force
# ```

# ### Rebase: How It Works Internally

# **Rebase** moves or rewrites commits onto a new base, creating a linear history.

# 1. **Identify Commits to Move**:  
#    - Git finds all commits on the current branch not in the target base.

# 2. **Apply Commits Sequentially**:  
#    - For each commit, Git:
#      - Checks out the base commit.
#      - Applies the diff (patch) from the original commit.
#      - Creates a new commit object with the same message and author, but a new parent.

# 3. **Conflict Handling**:  
#    - If a patch fails to apply cleanly, Git pauses for manual conflict resolution.
#    - After resolving, use `git rebase --continue`.

# 4. **History Rewriting**:  
#    - The original commits are replaced by new ones with different SHAs.
#    - The branch pointer is updated to the tip of the new commit chain.

# **Example Workflow**:
# ```sh
# git rebase main
# # Applies your branch commits onto latest main
# git rebase --continue
# git rebase --abort  # Cancel if needed
# ```

# ### Plumbing Commands Used

# - `git cherry-pick`: Applies individual commits during rebase.
# - `git commit-tree`: Creates new commit objects.
# - `git update-ref`: Moves branch pointers after rebase.

# ### When to Use

# - **Squash**: Clean up feature branch history before merging.
# - **Rebase**: Sync feature branch with updated main, or linearize history.

# ### Cautions

# - **Never rebase/squash shared/public branches** without coordination—rewriting history can break collaborators' clones.
# - Always force-push after rewriting history.

# ---

# **Summary**:  
# Squashing and rebasing are powerful tools for maintaining clean, readable Git history. Both work by rewriting commit objects and updating branch pointers, leveraging Git’s immutable object model and efficient snapshotting.















































































































































































































































































































































































































































































































# # Docker Deep Dive: Low-Level System Mechanics

# ## 1. Docker Architecture & Core Components

# ### Docker Engine: The Heart of the System

# Docker Engine is not a single binary but a collection of components:

# **dockerd (Docker Daemon)**
# - Runs as a systemd service on Linux
# - Listens on Unix socket `/var/run/docker.sock` by default
# - Manages Docker objects (containers, images, networks, volumes)
# - Communicates via REST API over HTTP
# - Process tree: `systemd → dockerd → containerd → runc → container process`

# **containerd**
# - High-level container runtime (graduated CNCF project)
# - Manages container lifecycle: create, start, stop, delete
# - Handles image management and storage
# - Communicates with runc via gRPC
# - Lives at `/var/lib/containerd/`

# **runc**
# - Low-level container runtime (OCI-compliant)
# - Actually creates and runs containers using Linux kernel features
# - Spawns container processes with proper isolation
# - Based on libcontainer (originally from Docker)

# ### Why This Separation?

# This modular design allows:
# - **Upgrades**: Update Docker daemon without stopping containers
# - **Debugging**: Each component can be monitored independently
# - **Standards**: OCI compliance through runc
# - **Performance**: Containerd optimized for container operations

# ## 2. Linux Kernel Features: The Foundation

# ### Namespaces: Process Isolation

# Docker containers use 7 types of Linux namespaces:

# **PID Namespace**
# ```bash
# # Container sees only its own processes
# # PID 1 in container ≠ PID 1 on host
# unshare --pid --fork --mount-proc /bin/bash
# ```

# **Network Namespace**
# ```bash
# # Container gets its own network stack
# # Separate interfaces, routing tables, iptables rules
# ip netns add container_ns
# ip netns exec container_ns ip link show
# ```

# **Mount Namespace**
# ```bash
# # Container has its own filesystem view
# # Changes to mounts don't affect host
# unshare --mount /bin/bash
# ```

# **UTS Namespace**
# ```bash
# # Container can have different hostname/domainname
# unshare --uts /bin/bash
# hostname container-host
# ```

# **IPC Namespace**
# ```bash
# # Isolated inter-process communication
# # Separate message queues, semaphores, shared memory
# unshare --ipc /bin/bash
# ```

# **User Namespace**
# ```bash
# # Maps container root to unprivileged host user
# # UID 0 in container → UID 1000 on host
# unshare --user --map-root-user /bin/bash
# ```

# **Cgroup Namespace**
# ```bash
# # Virtualizes /proc/self/cgroup view
# # Container sees itself at cgroup root
# ```

# ### Cgroups: Resource Control

# Cgroups (Control Groups) limit and monitor resources:

# **Memory Cgroup**
# ```bash
# # Limit container to 512MB RAM
# echo "512M" > /sys/fs/cgroup/memory/docker/container_id/memory.limit_in_bytes
# ```

# **CPU Cgroup**
# ```bash
# # Limit to 50% of one CPU core
# echo "50000" > /sys/fs/cgroup/cpu/docker/container_id/cpu.cfs_quota_us
# echo "100000" > /sys/fs/cgroup/cpu/docker/container_id/cpu.cfs_period_us
# ```

# **Block I/O Cgroup**
# ```bash
# # Limit disk read/write speeds
# echo "8:0 1048576" > /sys/fs/cgroup/blkio/docker/container_id/blkio.throttle.read_bps_device
# ```

# ### How Docker Creates Containers

# When you run `docker run`:

# 1. **Namespace Creation**
#    ```c
#    // Simplified syscall sequence
#    clone(CLONE_NEWPID | CLONE_NEWNS | CLONE_NEWNET | CLONE_NEWUTS | CLONE_NEWIPC)
#    ```

# 2. **Cgroup Assignment**
#    ```bash
#    echo $container_pid > /sys/fs/cgroup/memory/docker/container_id/cgroup.procs
#    ```

# 3. **Capability Dropping**
#    ```c
#    // Drop dangerous capabilities
#    cap_drop(CAP_SYS_ADMIN, CAP_NET_ADMIN, CAP_SYS_MODULE)
#    ```

# 4. **Process Execution**
#    ```c
#    execve("/usr/bin/node", ["node", "app.js"], env_vars)
#    ```

# ## 3. Image Layers & Union File Systems

# ### OverlayFS: How Layers Work

# Docker uses OverlayFS (or other union filesystems) to create a single view from multiple layers:

# **Layer Structure**
# ```bash
# /var/lib/docker/overlay2/
# ├── layer1-hash/
# │   ├── diff/          # Actual changes in this layer
# │   ├── work/          # Temporary work directory
# │   └── merged/        # Combined view (mount point)
# ├── layer2-hash/
# └── container-layer/   # Writable top layer
# ```

# **How Dockerfile Instructions Create Layers**
# ```dockerfile
# FROM node:18-alpine    # Layer 1: Base Alpine + Node.js
# WORKDIR /app          # Layer 2: Create /app directory
# COPY package*.json ./  # Layer 3: Add package files
# RUN npm install       # Layer 4: Install dependencies
# COPY . .              # Layer 5: Add application code
# ```

# **OverlayFS Mount Process**
# ```bash
# # Docker mounts layers using OverlayFS
# mount -t overlay overlay \
#   -o lowerdir=layer1:layer2:layer3:layer4,\
#      upperdir=container-writable-layer,\
#      workdir=container-work-dir \
#   /var/lib/docker/overlay2/container-merged
# ```

# **Copy-on-Write Mechanism**
# - Reading: Direct access to file in lower layers
# - Writing: Copy file to upper layer, then modify
# - Deleting: Create "whiteout" file in upper layer

# ### Why Layers Matter

# **Build Cache**
# ```bash
# # If package.json unchanged, reuse layer
# COPY package*.json ./  # ← This layer cached
# RUN npm install       # ← This layer reused from cache
# ```

# **Image Sharing**
# Multiple containers can share base layers:
# ```
# Container A: [Alpine][Node][App A]
# Container B: [Alpine][Node][App B]  # Shares Alpine + Node layers
# ```

# ## 4. Container Networking Deep Dive

# ### Default Bridge Network

# When Docker starts, it creates a bridge network:

# ```bash
# # Docker creates bridge interface
# brctl addbr docker0
# ip addr add 172.17.0.1/16 dev docker0
# ip link set docker0 up
# ```

# **Container Network Setup**
# 1. Create veth pair (virtual ethernet)
# 2. Move one end to container's network namespace
# 3. Connect other end to docker0 bridge
# 4. Assign IP from bridge subnet

# ```bash
# # What happens during docker run -p 8080:3000
# ip link add veth123 type veth peer name veth124
# ip link set veth124 netns container_namespace
# ip link set veth123 master docker0
# iptables -t nat -A DOCKER -p tcp --dport 8080 -j DNAT --to-destination 172.17.0.2:3000
# ```

# ### Port Mapping: iptables Magic

# Port mapping uses iptables NAT rules:

# ```bash
# # -p 8080:3000 creates these iptables rules:
# iptables -t nat -A DOCKER -p tcp --dport 8080 -j DNAT --to-destination 172.17.0.2:3000
# iptables -t filter -A DOCKER -d 172.17.0.2/32 -p tcp --dport 3000 -j ACCEPT
# ```

# ## 5. Storage Deep Dive

# ### Volume Management

# Docker volumes are managed directories on the host:

# ```bash
# # Volume location
# /var/lib/docker/volumes/volume_name/_data/
# ```

# **Bind Mount vs Volume vs tmpfs**
# ```bash
# # Bind mount: Direct host directory
# docker run -v /host/path:/container/path image

# # Named volume: Docker-managed storage
# docker run -v volume_name:/container/path image

# # tmpfs: Memory-based storage
# docker run --tmpfs /container/path image
# ```

# ### Storage Drivers

# Different storage drivers handle layers differently:

# **overlay2** (default on most systems)
# - Uses OverlayFS kernel feature
# - Efficient space usage through hard links
# - Good performance for read-heavy workloads

# **devicemapper**
# - Uses Linux device mapper
# - Copy-on-write at block level
# - Better for write-heavy workloads

# ## 6. Command Deep Dive

# ### docker run: The Complete Process

# ```bash
# docker run -d -p 3000:3000 --name myapp node:18-alpine npm start
# ```

# **Step-by-step execution:**

# 1. **Image Resolution**
#    ```bash
#    # Check local cache
#    ls /var/lib/docker/image/overlay2/repositories.json
#    # Pull if not found
#    GET https://registry.hub.docker.com/v2/library/node/manifests/18-alpine
#    ```

# 2. **Container Creation**
#    ```bash
#    # Generate container ID
#    container_id=$(openssl rand -hex 32)
   
#    # Create container metadata
#    mkdir -p /var/lib/docker/containers/$container_id
#    ```

# 3. **Namespace Setup**
#    ```c
#    // Create new namespaces
#    pid_t pid = clone(container_main, stack, CLONE_NEWPID|CLONE_NEWNS|CLONE_NEWNET, &config);
#    ```

# 4. **Network Configuration**
#    ```bash
#    # Create veth pair and configure
#    ip link add veth$container_id type veth peer name veth_peer
#    ip link set veth_peer netns $pid
#    ```

# 5. **Mount Preparation**
#    ```bash
#    # Mount container filesystem
#    mount -t overlay overlay -o lowerdir=...:upperdir=...:workdir=... /merged
#    ```

# 6. **Process Execution**
#    ```c
#    chroot("/var/lib/docker/overlay2/.../merged");
#    execve("/usr/local/bin/npm", ["npm", "start"], env);
#    ```

# ### docker stop vs docker kill

# **docker stop (SIGTERM → SIGKILL)**
# ```c
# // Graceful shutdown process
# kill(container_pid, SIGTERM);  // Give process chance to cleanup
# sleep(10);                     // Wait for grace period
# kill(container_pid, SIGKILL);  // Force kill if still running
# ```

# **docker kill (immediate SIGKILL)**
# ```c
# kill(container_pid, SIGKILL);  // Immediate termination
# ```

# ### docker exec: Process Injection

# ```bash
# docker exec -it container_id /bin/bash
# ```

# **How it works:**
# 1. Find container's namespaces: `/proc/$pid/ns/`
# 2. Enter all namespaces using setns() syscall
# 3. Execute process in container context

# ```c
# // Simplified exec process
# int fd = open("/proc/container_pid/ns/pid", O_RDONLY);
# setns(fd, CLONE_NEWPID);  // Enter PID namespace
# setns(net_fd, CLONE_NEWNET);  // Enter network namespace
# execve("/bin/bash", ["bash"], env);
# ```

# ## 7. Performance and Security Implications

# ### Security Boundaries

# **What Docker Provides:**
# - Process isolation through namespaces
# - Resource limits through cgroups
# - Reduced attack surface through capability dropping
# - Read-only root filesystems (when configured)

# **What Docker Doesn't Provide:**
# - Complete kernel isolation (containers share kernel)
# - Protection against kernel exploits
# - Guaranteed resource isolation under extreme load

# **Security Best Practices:**
# ```dockerfile
# # Run as non-root user
# USER 1000

# # Drop capabilities
# docker run --cap-drop=ALL --cap-add=NET_BIND_SERVICE app

# # Read-only root filesystem
# docker run --read-only --tmpfs /tmp app

# # Use security profiles
# docker run --security-opt apparmor=docker-default app
# ```

# ### Performance Characteristics

# **Container Overhead:**
# - CPU: ~2-5% overhead vs native
# - Memory: ~1-2MB per container base overhead
# - Network: ~10-15% overhead due to bridge/NAT
# - Storage: Depends on storage driver and layer depth

# **Optimization Strategies:**
# - Use multi-stage builds to reduce image size
# - Minimize layers by combining RUN commands
# - Use .dockerignore to reduce build context
# - Choose appropriate base images (Alpine vs Ubuntu)

# This deep dive shows that Docker is essentially an orchestrated collection of Linux kernel features, wrapped in a user-friendly API. Understanding these underlying mechanisms helps explain Docker's behavior, performance characteristics, and limitations.

# **Docker Application:**

# Docker is a popular open-source platform that makes it easy to build, test, deploy, and manage containerized applications in a consistent, portable, or virtual environment such as VPS.

# While a powerful tool in your development arsenal, learning the different Docker commands can take time and effort. New users often benefit from having a Docker cheat sheet readily at hand.

# In this tutorial, we will explain how Docker works and provide the most common Docker commands, along with a downloadable cheat sheet for you to use.

# **Docker High-level overview**
# Docker architecture consists of five main components: server, client, container, image, and registry.

# **Docker Server**

# A Docker server or Docker daemon is a program that runs in the background of your computer and manages Docker containers and images. When you use the Docker command line interface.

# (CLI) to create, run, or manage containers, you interact with the Docker daemon.

# The Docker daemon is an essential platform component that ensures containers can be started and stopped automatically when the system boots up.

# **Docker Client**

# The Docker client lets users interact with the Docker daemon with its command-line interface (CLI). In simple terms, it’s the main part of the Docker architecture for creating, managing, and running container applications.

# When you use the Docker CLI to pass a command, the Docker client sends the command to the Docker daemon running on your computer, which then carries out the requested operation. The Docker client can be installed on any machine that needs to interact with the Docker daemon, including your local machine, a remote server, or a virtual server.

# **Docker Container**

# A Docker container is a package that contains all the required prerequisites to run an application.

# Containers are designed to be highly portable, meaning that they can be easily moved from one environment to another, such as from a developer’s laptop to a testing environment or from a testing environment to a production environment.

# **Docker Image**

# A Docker image is a preconfigured template that specifies what should be included in a Docker container. Usually, images are downloaded from websites like Docker Hub. However, it’s also possible to create a custom image with the help of Dockerfile.

# **Docker Registry**

# The Docker registry is a central repository that stores and manages Docker images. It is a server-based system that lets users store and share Docker images with others, making it easy to distribute and deploy applications. The most notable Docker registry is Docker Hub.

# **Docker Commands** Cheat Sheet
# Now that you know how Docker functions, let’s look at some of the most popular Docker command examples.

# **Build Commands**
# Docker uses the build command for building images from a Docker file. Some of the most common commands include:

# Command	Explanation
# docker build	Builds an image from a Dockerfile in the current directory
# docker build https://github.com/docker/
# rootfs.git#container:docker	Builds an image from a remote GIT repository
# docker build -t imagename/tag	Builds and tags an image for easier tracking
# docker build https://yourserver/file.tar.gz	Builds an image from a remote tar archive
# docker build -t image:1.0
# -<<EOFFROM busyboxRUN echo “hello world”EOF	Builds an image via a Dockerfile that is passed through STDIN
# Clean Up Commands
# To keep your system clean and save disk space, it’s a great idea to clean up unused images, containers, and volumes. Check the commands below for more details:

# Command	Explanation
# docker image prune	Clears an unused image
# docker image prune -a	Clears all images that are not being used by containers
# docker system prune	Removes all stopped containers, all networks not used by containers, all dangling images, and all build cache
# docker image rm image	Removes an image
# docker rm container	Removes a running container
# docker swarm leave	Leaves a swarm
# docker stack rm stackname	Removes a swarm
# docker volume rm $(docker volume ls -f dangling=true -q)	Removes all dangling volumes
# docker rm $(docker ps -a -q)	Removes all stopped containers
# docker kill $ (docker ps -q)	Stops all running containers
# Container Interaction Commands
# Interact with your Docker container with the following common commands:

# Command	Explanation
# docker start container	Starts a new container
# docker stop container	Stops a container
# docker pause container	Pauses a container
# docker unpause container	Unpauses a container
# docker restart container	Restarts a container
# docker wait container	Blocks a container
# docker export container	Exports container contents to a tar archive
# docker attach container	Attaches to a running container
# docker wait container	Waits until the container is terminated and shows the exit code
# docker commit -m “commit message” -a “author” container username/image_name: tag	Saves a running container as an image
# docker logs -ft container	Follows container logs
# docker exec -ti container script.sh	Runs a command in a container
# docker commit container image	Creates a new image from a container
# docker create image	Creates a new container from an image
# Container Inspection Commands
# Sometimes, you need to inspect your containers for quality assurance or troubleshooting purposes. These commands help you get an overview of what different containers are doing:

# Command	Explanation
# docker ps	Lists all running containers
# docker -ps -a	Lists all containers
# docker diff container	Inspects changes to directories and files in the container filesystem
# docker top container	Shows all running processes in an existing container
# docker inspect container	Displays low-level information about a container
# docker logs container	Gathers the logs for a container
# docker stats container	Shows container resource usage statistics
# Manage Images Commands
# Some of the most common image management commands include:

# Command	Explanation
# docker image ls	Lists images
# docker image rm mysql	Removes an image
# docker tag image tag	Tags an image
# docker history image	Displays the image history
# docker inspect image	Displays low-level information about an image
# Run Commands
# Docker uses the run command to create containers from provided images. The default syntax for this command looks like this:

# docker run (options) image (command) (arg...)
# After the default syntax, use one of the following flags:

# Flag	Explanation
# --detach , -d	Runs a container in the background and prints the container ID
# --env , -e	Sets environment variables
# --hostname , -h	Sets a hostname to a container
# --label , -l	Creates a meta data label for a container
# --name	Assigns a name to a container
# --network	Connects a container to a network
# --rm	Removes container when it stops
# --read-only	Sets the container filesystem as read-only
# --workdir , -w	Sets a working directory in a container
# Registry Commands
# If you need to interact with Docker Hub, use the following commands:

# Command	Explanation
# docker login	Logs in to a registry
# docker logout	Logs out from a registry
# docker pull mysql	Pulls an image from a registry
# docker push repo/ rhel-httpd:latest	Pushes an image to a registry
# docker search term	Searches Docker Hub for images with the specified term
# Service Commands
# Manage all Docker services with these basic commands:

# Command	Explanation
# docker service ls	Lists all services running in a swarm
# docker stack services stackname	Lists all running services
# docker service ps servicename	Lists the tasks of a service
# docker service update servicename	Updates a service
# docker service create image	Creates a new service
# docker service scale servicename=10	Scales one or more replicated services
# docker service logs stackname servicename	Lists all service logs
# Network Commands
# If you need to interact with the Docker network, use one of the following commands:

# Command	Explanation
# docker network create networkname	Creates a new network
# docker network rm networkname	Removes a specified network
# docker network ls	Lists all networks
# docker network connect networkname container	Connects a container to a network
# docker network disconnect networkname container	Disconnects a container from a network
# docker network inspect networkname	Displays detailed information about a network



