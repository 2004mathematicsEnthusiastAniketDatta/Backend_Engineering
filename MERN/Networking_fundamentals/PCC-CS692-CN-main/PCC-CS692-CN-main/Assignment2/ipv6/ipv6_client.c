#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>

#define PORT 8080
#define BUFFER_SIZE 1024

int main() {
    int sock = 0;
    struct sockaddr_in6 serv_addr;
    char *message = "Hello from IPv6 client";
    char buffer[BUFFER_SIZE] = {0};
    
    // Create socket
    if ((sock = socket(AF_INET6, SOCK_STREAM, 0)) < 0) {
        printf("Socket creation error\n");
        return -1;
    }
    
    // Initialize server address structure
    memset(&serv_addr, 0, sizeof(serv_addr));
    serv_addr.sin6_family = AF_INET6;
    serv_addr.sin6_port = htons(PORT);
    
    // Convert IPv6 address (using localhost ::1)
    if (inet_pton(AF_INET6, "::1", &serv_addr.sin6_addr) <= 0) {
        printf("Invalid address/Address not supported\n");
        close(sock);
        return -1;
    }
    
    // Connect to server
    if (connect(sock, (struct sockaddr *)&serv_addr, sizeof(serv_addr)) < 0) {
        printf("Connection failed\n");
        close(sock);
        return -1;
    }
    
    printf("Connected to IPv6 server\n");
    
    // Send message
    send(sock, message, strlen(message), 0);
    printf("Message sent: %s\n", message);
    
    // Read response
    int valread = read(sock, buffer, BUFFER_SIZE);
    if (valread > 0) {
        printf("Server response: %s\n", buffer);
    }
    
    // Close socket
    close(sock);
    printf("Connection closed\n");
    
    return 0;
}