#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <arpa/inet.h>
#include <netinet/in.h>
#include <sys/socket.h>

#define PORT 8888
#define BUFFER_SIZE 1024
#define KEY 0x2F // Simple XOR key for basic encryption

// Function to encrypt/decrypt data using XOR
void encrypt_decrypt(char *data, int length) {
    for (int i = 0; i < length; i++) {
        data[i] = data[i] ^ KEY;
    }
}

// Server function
void run_server() {
    int sockfd;
    struct sockaddr_in server_addr, client_addr;
    char buffer[BUFFER_SIZE];
    socklen_t addr_len = sizeof(client_addr);

    // Create UDP socket
    if ((sockfd = socket(AF_INET, SOCK_DGRAM, 0)) < 0) {
        perror("Socket creation failed");
        exit(EXIT_FAILURE);
    }

    memset(&server_addr, 0, sizeof(server_addr));
    memset(&client_addr, 0, sizeof(client_addr));

    // Configure server address
    server_addr.sin_family = AF_INET;
    server_addr.sin_addr.s_addr = INADDR_ANY;
    server_addr.sin_port = htons(PORT);

    // Bind socket
    if (bind(sockfd, (struct sockaddr *)&server_addr, sizeof(server_addr)) < 0) {
        perror("Bind failed");
        exit(EXIT_FAILURE);
    }

    printf("Server is running on port %d...\n", PORT);

    while (1) {
        int n = recvfrom(sockfd, buffer, BUFFER_SIZE - 1, 0,
                        (struct sockaddr *)&client_addr, &addr_len);
        if (n < 0) {
            perror("recvfrom failed");
            break;
        }
        buffer[n] = '\0';

        // Decrypt received message
        encrypt_decrypt(buffer, n);
        printf("Received (decrypted): %s\n", buffer);

        // Prepare and encrypt response
        char response[] = "Message received securely";
        encrypt_decrypt(response, strlen(response));
        
        sendto(sockfd, response, strlen(response), 0,
               (struct sockaddr *)&client_addr, addr_len);
    }
    
    close(sockfd);
}

// Client function
void run_client() {
    int sockfd;
    struct sockaddr_in server_addr;
    char buffer[BUFFER_SIZE];

    // Create UDP socket
    if ((sockfd = socket(AF_INET, SOCK_DGRAM, 0)) < 0) {
        perror("Socket creation failed");
        exit(EXIT_FAILURE);
    }

    memset(&server_addr, 0, sizeof(server_addr));

    // Configure server address
    server_addr.sin_family = AF_INET;
    server_addr.sin_port = htons(PORT);
    if (inet_pton(AF_INET, "127.0.0.1", &server_addr.sin_addr) <= 0) {
        perror("Invalid address");
        exit(EXIT_FAILURE);
    }

    while (1) {
        printf("Enter message: ");
        fgets(buffer, BUFFER_SIZE, stdin);
        buffer[strcspn(buffer, "\n")] = 0; // Remove trailing newline

        // Encrypt the message before sending
        encrypt_decrypt(buffer, strlen(buffer));

        sendto(sockfd, buffer, strlen(buffer), 0,
               (struct sockaddr *)&server_addr, sizeof(server_addr));

        int n = recvfrom(sockfd, buffer, BUFFER_SIZE - 1, 0, NULL, NULL);
        if (n < 0) {
            perror("recvfrom failed");
            break;
        }
        buffer[n] = '\0';
        
        // Decrypt server response
        encrypt_decrypt(buffer, n);
        printf("Server response: %s\n", buffer);
    }
    close(sockfd);
}

int main(int argc, char *argv[]) {
    if (argc != 2) {
        printf("Usage: %s [-s|-c]\n", argv[0]);
        printf("-s for server mode\n-c for client mode\n");
        return 1;
    }

    if (strcmp(argv[1], "-s") == 0) {
        run_server();
    } else if (strcmp(argv[1], "-c") == 0) {
        run_client();
    } else {
        printf("Invalid argument. Use -s for server or -c for client\n");
        return 1;
    }

    return 0;
}
