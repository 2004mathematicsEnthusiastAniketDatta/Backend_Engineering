#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <netinet/ip.h>
#include <arpa/inet.h>
#include <errno.h>

#define BUFFER_SIZE 1024

int main(int argc, char *argv[]) {
    int sockfd;//socket file descriptor, which is an integer that uniquely identifies a socket in the system. 
    //It is used for communication between processes over a network.
    //The sockaddr_in structure describes an Internet socket address, including fields for the port number (sin_port), the Internet address (sin_addr), 
    //and padding (sin_zero) to match the size of a generic sockaddr structure. 
    //It also includes common socket address fields defined by __SOCKADDR_COMMON.
    struct sockaddr_in server_addr; 
    char buffer[BUFFER_SIZE];
    char message[BUFFER_SIZE];
    
    // Check command line arguments
 
    if (argc != 3) {
        fprintf(stderr, "Usage: %s <server_ip> <port>\n", argv[0]);
        exit(EXIT_FAILURE);
    }
    
    // Create IPv4 socket
    sockfd = socket(AF_INET, SOCK_STREAM, 0);
    if (sockfd < 0) {
        perror("Socket creation failed");
        exit(EXIT_FAILURE);
    }
    
    // Configure server address
    memset(&server_addr, 0, sizeof(server_addr));
    //AF_INET is a macro in C++ that is defined as an alias for PF_INET. 
    //It is commonly used in socket programming to specify the IPv4 address family for network communication.
    server_addr.sin_family = AF_INET;
    //htons is a function in C++ that converts a 16-bit integer from host byte order to network byte order (big-endian).
    //It is commonly used in socket programming to ensure that port numbers are correctly formatted for network communication.
    //atoi is a function in C++ that converts a string to an integer.
    //In this case, it converts the second command line argument (port number) from a string to an integer.
    server_addr.sin_port = htons(atoi(argv[2])); 
    //port number is converted to network byte order using htons (host to network short) to ensure proper transmission over the network.
    //server_addr.sin_addr is a field in the sockaddr_in structure that holds the IP address of the server.
    //port number is stored in the sin_port field of the sockaddr_in structure, which is used to specify the port number for the socket connection.
    // Convert IP address from text to binary
    //Convert from presentation format of an Internet number in buffer
    //starting at CP to the binary network format and store result for
    //interface type AF in buffer starting at BUF.
    /**
     * @brief Converts the server IP address from text to binary form.
     * 
     * The `inet_pton` function converts the character string `argv[1]` (expected to be
     * the server's IP address) into a network address structure in the `AF_INET`
     * family, then stores it in `server_addr.sin_addr`.
     * 
     * If `inet_pton` returns a value less than or equal to 0, it indicates an error:
     * - A return value of `0` means the input string `argv[1]` is not a valid
     *   IP address in the `AF_INET` family.
     * - A return value less than `0` (i.e., -1) means an error occurred, and `errno`
     *   is set to indicate the error.
     * 
     * In either error case, this block:
     * 1. Prints an error message to `stderr` using `perror`, which describes the
     *    error indicated by `errno` (if `inet_pton` returned -1) or a generic
     *    message if the address was just invalid.
     * 2. Closes the socket `sockfd` to release system resources.
     * 3. Terminates the program with an exit status of `EXIT_FAILURE`.
     */
    if (inet_pton(AF_INET, argv[1], &server_addr.sin_addr) <= 0) {
        perror("Invalid address");
        close(sockfd);
        exit(EXIT_FAILURE);
    }
    
    // Connect to server
    //int connect(int __fd, const struct sockaddr *__addr, socklen_t __len)
    //pen a connection on socket FD to peer at ADDR (which LEN bytes long).
    //For connectionless socket types, just set the default address to send to
    //and the only address from which to accept transmissions.
    //Return 0 on success, -1 for errors.
    //This function is a cancellation point and therefore not marked with
    //__THROW.
    if (connect(sockfd, (struct sockaddr*)&server_addr, sizeof(server_addr)) < 0) {
        perror("Connection failed");
        close(sockfd);
        exit(EXIT_FAILURE);
    }
    
    printf("Connected to server %s:%s\n", argv[1], argv[2]);
    
    // Communication loop
    while (1) {
        printf("Enter message (or 'quit' to exit): ");
        if (fgets(message, sizeof(message), stdin) == NULL) {
            break;
        }
        
        // Remove newline character
        message[strcspn(message, "\n")] = 0;
        
        // Check for quit command
        if (strcmp(message, "quit") == 0) {
            break;
        }
        
        // Send message to server
        if (send(sockfd, message, strlen(message), 0) < 0) {
            perror("Send failed");
            break;
        }
        
        // Receive response from server
        memset(buffer, 0, sizeof(buffer));
        int bytes_received = recv(sockfd, buffer, sizeof(buffer) - 1, 0);
        if (bytes_received < 0) {
            perror("Receive failed");
            break;
        } else if (bytes_received == 0) {
            printf("Server disconnected\n");
            break;
        }
        
        printf("Server response: %s\n", buffer);
    }
    
    // Clean up
    close(sockfd);
    printf("Connection closed\n");
    
    return 0;
}
