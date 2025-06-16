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
    /**
     * @file ipv4_client.c
     * @brief This segment of code is part of an IPv4 client application that connects to a server,
     * sends messages, and receives responses.
     *
     * Detailed explanation:
     *
     * 1.  `if (connect(sockfd, (struct sockaddr*)&server_addr, sizeof(server_addr)) < 0)`:
     *     This line attempts to establish a connection to the server.
     *     - `sockfd`: This is the socket file descriptor obtained earlier (presumably from a `socket()` call),
     *       representing the client's end of the communication channel.
     *     - `(struct sockaddr*)&server_addr`: This is a pointer to a `sockaddr` structure containing the
     *       destination server's address (IP address and port number). It's cast to `(struct sockaddr*)`
     *       because `connect()` expects a generic socket address structure. `server_addr` would have been
     *       populated with the server's IP and port before this call.
     *     - `sizeof(server_addr)`: This specifies the size of the `server_addr` structure.
     *     - `< 0`: The `connect()` function returns 0 on success and -1 on error. This condition checks
     *       if an error occurred during the connection attempt.
     *
     *     If `connect()` fails (returns a negative value):
     *     - `perror("Connection failed")`: This function prints a system error message to `stderr`
     *       (standard error output). The string "Connection failed" will be prepended to the
     *       system-specific error description (e.g., "Connection refused", "Network is unreachable").
     *     - `close(sockfd)`: The socket, even if not fully connected, should be closed to release
     *       system resources.
     *     - `exit(EXIT_FAILURE)`: The program terminates immediately, indicating an unsuccessful execution.
     *       `EXIT_FAILURE` is a standard macro (usually 1) indicating failure.
     *
     * 2.  `printf("Connected to server %s:%s\n", argv[1], argv[2]);`:
     *     If the `connect()` call was successful, this line prints a confirmation message to the console.
     *     - `argv[1]`: Assumed to be the server's IP address passed as a command-line argument to the program.
     *     - `argv[2]`: Assumed to be the server's port number passed as a command-line argument.
     *
     * 3.  `// Communication loop`
     *     `while (1)`: This creates an infinite loop, allowing the client to continuously send messages
     *     to the server and receive responses until explicitly broken.
     *
     * 4.  `printf("Enter message (or 'quit' to exit): ");`:
     *     Prompts the user to enter a message to send to the server. It also informs the user
     *     that typing "quit" will exit the communication loop.
     *
     * 5.  `if (fgets(message, sizeof(message), stdin) == NULL)`:
     *     Reads a line of text from standard input (`stdin`) and stores it in the `message` buffer.
     *     - `message`: The character array (buffer) where the input string will be stored.
     *     - `sizeof(message)`: The maximum number of characters to read, including the null terminator.
     *       This prevents buffer overflows.
     *     - `stdin`: The standard input stream (usually the keyboard).
     *     - `fgets()` returns `NULL` on error or if an end-of-file (EOF) condition is reached before
     *       any characters are read. If this happens, the `break;` statement exits the `while` loop.
     *
     * 6.  `message[strcspn(message, "\n")] = 0;`:
     *     Removes the newline character (`\n`) that `fgets()` typically includes at the end of the input string
     *     if there's enough space in the buffer.
     *     - `strcspn(message, "\n")`: This function searches for the first occurrence of any character
     *       from the string "\n" (i.e., the newline character) within the `message` string. It returns
     *       the length of the initial segment of `message` that does not contain `\n`.
     *     - `message[...] = 0;`: By setting the character at that returned index to `0` (the null terminator `\0`),
     *       the string is effectively truncated at that point, removing the newline. If no newline is found
     *       (e.g., input was longer than buffer size minus one), `strcspn` returns `strlen(message)`, and this
     *       line will correctly place the null terminator at the end of the existing string content if it was
     *       already null-terminated, or potentially overwrite the last character if the buffer was full without a newline.
     *
     * 7.  `if (strcmp(message, "quit") == 0)`:
     *     Compares the user's input message with the string "quit".
     *     - `strcmp()`: String comparison function. It returns 0 if the two strings are identical.
     *     - If the user typed "quit", the `break;` statement exits the `while` loop, ending the
     *       communication session.
     *
     * 8.  `if (send(sockfd, message, strlen(message), 0) < 0)`:
     *     Sends the entered message to the connected server.
     *     - `sockfd`: The client's socket file descriptor.
     *     - `message`: The buffer containing the null-terminated string to send.
     *     - `strlen(message)`: The length of the message to send (excluding the null terminator, as `send`
     *       deals with byte streams, not necessarily C strings, though here it's sending string data).
     *     - `0`: Flags for the `send` operation. `0` usually means no special flags.
     *     - `< 0`: `send()` returns the number of bytes sent on success, or -1 on error. This checks for errors.
     *
     *     If `send()` fails:
     *     - `perror("Send failed")`: Prints a system error message related to the send failure.
     *     - `break;`: Exits the `while` loop.
     *
     * 9.  `memset(buffer, 0, sizeof(buffer));`:
     *     Clears the `buffer` (presumably a character array used for receiving data) by filling it with zeros.
     *     This is important to ensure that previous data in the buffer doesn't interfere with the new
     *     data being received, and to ensure the received string is null-terminated if the server doesn't
     *     send one and the received data doesn't fill the buffer.
     *     - `buffer`: The buffer to be cleared.
     *     - `0`: The value to fill the buffer with (which is `\0`, the null character).
     *     - `sizeof(buffer)`: The total size of the buffer in bytes.
     *
     * 10. `int bytes_received = recv(sockfd, buffer, sizeof(buffer) - 1, 0);`:
     *     Receives data from the server.
     *     - `sockfd`: The client's socket file descriptor.
     *     - `buffer`: The buffer where the received data will be stored.
     *     - `sizeof(buffer) - 1`: The maximum number of bytes to receive. It's `sizeof(buffer) - 1` to
     *       leave space for a null terminator (`\0`) to ensure the received data can be treated as a
     *       C string.
     *     - `0`: Flags for the `recv` operation. `0` usually means no special flags.
     *     - `bytes_received`: Stores the return value of `recv()`.
     *
     * 11. `if (bytes_received < 0)`:
     *     Checks if an error occurred during `recv()`.
     *     - `recv()` returns -1 on error.
     *     - `perror("Receive failed")`: Prints a system error message.
     *     - `break;`: Exits the `while` loop.
     *
     * 12. `else if (bytes_received == 0)`:
     *     Checks if the server has closed the connection.
     *     - `recv()` returns 0 if the remote peer (server) has performed an orderly shutdown of the connection.
     *     - `printf("Server disconnected\n")`: Informs the user that the server has closed the connection.
     *     - `break;`: Exits the `while` loop.
     *
     * 13. `// buffer[bytes_received] = '\0'; // Ensure null-termination (already handled by sizeof(buffer)-1 and memset)`
     *     This line is commented out, but it would typically be used to explicitly null-terminate the
     *     received data. However, because `recv` was called with `sizeof(buffer) - 1` and `memset`
     *     cleared the buffer, the buffer will be null-terminated if `bytes_received` is less than
     *     `sizeof(buffer) - 1`. If `bytes_received` is exactly `sizeof(buffer) - 1`, the last byte
     *     is data, and the null terminator from `memset` at `buffer[sizeof(buffer)-1]` is still there.
     *
     * 14. `printf("Server response: %s\n", buffer);`:
     *     Prints the response received from the server to the console. Since `buffer` is null-terminated
     *     (due to `memset` and the `sizeof(buffer) - 1` limit in `recv`), `%s` can safely print it as a string.
     *
     * Loop continuation: If no `break` statement was encountered, the `while(1)` loop repeats,
     * prompting the user for another message.
     *
     * 15. `// Clean up`
     *     This section is executed after the `while` loop terminates (either by "quit" command,
     *     send/receive error, or server disconnection).
     *
     * 16. `close(sockfd);`:
     *     Closes the client's socket, releasing the associated system resources. This also informs
     *     the server (if still connected) that the client is closing its end of the connection.
     *
     * 17. `printf("Connection closed\n");`:
     *     Prints a message to the console indicating that the connection has been closed.
     *
     * 18. `return 0;`:
     *     Indicates that the `main` function (or the function this snippet is part of) has completed
     *     successfully.
     *
     * } // End of the function or code block
     */
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
