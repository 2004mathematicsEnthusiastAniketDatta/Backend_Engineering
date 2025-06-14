#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <errno.h>

#define PORT 8080
#define BUFFER_SIZE 1024
#define BACKLOG 5

int main() {
    int server_fd, client_fd;
    struct sockaddr_in6 server_addr, client_addr;
    socklen_t client_len = sizeof(client_addr);
    char buffer[BUFFER_SIZE];
    char client_ip[INET6_ADDRSTRLEN];
    
    // Create IPv6 socket
    server_fd = socket(AF_INET6, SOCK_STREAM, 0);
    if (server_fd == -1) {
        perror("socket creation failed");
        exit(EXIT_FAILURE);
    }
    
    // Enable address reuse
    int opt = 1;
    if (setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt)) < 0) {
        perror("setsockopt failed");
        close(server_fd);
        exit(EXIT_FAILURE);
    }
    
    // Disable IPv4-mapped IPv6 addresses (IPv6 only)
    int ipv6only = 1;
    if (setsockopt(server_fd, IPPROTO_IPV6, IPV6_V6ONLY, &ipv6only, sizeof(ipv6only)) < 0) {
        perror("setsockopt IPV6_V6ONLY failed");
        close(server_fd);
        exit(EXIT_FAILURE);
    }
    
    // Configure server address
    memset(&server_addr, 0, sizeof(server_addr));
    server_addr.sin6_family = AF_INET6;
    server_addr.sin6_addr = in6addr_any;  // Listen on all IPv6 addresses
    server_addr.sin6_port = htons(PORT);
    
    // Bind socket
    if (bind(server_fd, (struct sockaddr*)&server_addr, sizeof(server_addr)) < 0) {
        perror("bind failed");
        close(server_fd);
        exit(EXIT_FAILURE);
    }
    
    // Listen for connections
    if (listen(server_fd, BACKLOG) < 0) {
        perror("listen failed");
        close(server_fd);
        exit(EXIT_FAILURE);
    }
    
    printf("IPv6 Server listening on port %d...\n", PORT);
    
    while (1) {
        // Accept client connection
        client_fd = accept(server_fd, (struct sockaddr*)&client_addr, &client_len);
        if (client_fd < 0) {
            perror("accept failed");
            continue;
        }
        
        // Get client IP address
        inet_ntop(AF_INET6, &client_addr.sin6_addr, client_ip, INET6_ADDRSTRLEN);
        printf("Connection accepted from [%s]:%d\n", client_ip, ntohs(client_addr.sin6_port));
        
        // Handle client communication
        ssize_t bytes_received = recv(client_fd, buffer, BUFFER_SIZE - 1, 0);
        if (bytes_received > 0) {
            buffer[bytes_received] = '\0';
            printf("Received: %s\n", buffer);
            
            // Echo response back to client
            const char* response = "Hello from IPv6 Server!\n";
            send(client_fd, response, strlen(response), 0);
        } else if (bytes_received == 0) {
            printf("Client disconnected\n");
        } else {
            perror("recv failed");
        }
        
        close(client_fd);
    }
    
    close(server_fd);
    return 0;
}