/*
filename server_ipaddress portno


argv[0] filename
argv[1] server_ipaddress
argv[2] portno


*/













#include <stdio.h> // the header file contains declarations used in most input and output  and is typically included in all C programs
//example: printf, scanf, fopen, fclose, etc.
#include <stdlib.h> // the header file contains declarations for memory allocation, process control, conversions, and other utility functions
//example: malloc, free, exit, atoi, etc.
#include <string.h> // the header file contains declarations for string handling functions, such as string manipulation, searching, and comparison
//example: strcpy, strlen, strcat, strcmp, etc.
#include <unistd.h> // the header file contains declarations for POSIX operating system API functions, such as file and process control, and is commonly used in Unix-like systems
//example: read, write, close, fork, exec, etc.
#include <sys/socket.h> // the header file contains declarations for socket programming functions and data structures, such as creating, binding, and managing sockets
//example: socket, bind, listen, accept, connect, send, recv, etc.
#include <netinet/in.h> // the header file contains declarations for Internet address family structures and functions, such as sockaddr_in, htons, and ntohs
//example: struct sockaddr_in, htons, ntohs, inet_ntoa, etc.
#include <arpa/inet.h> // the header file contains declarations for Internet protocol functions, such as converting between text and binary IP addresses
//example: inet_pton, inet_ntop, ntohl, htonl, etc.
#include <errno.h> // the header file contains declarations for error handling functions and macros, such as errno, perror, and strerror
//example: errno, perror, strerror, EAGAIN, EINTR, etc.
#include <fcntl.h>// the header file contains declarations for file control operations, such as opening, closing, and manipulating file descriptors
//example: open, close, fcntl, O_RDONLY, O_WRONLY, O_RDWR, etc.
#include <netdb.h> // the header file contains declarations for network database operations, such as hostname resolution and service lookup
//example: gethostbyname, getservbyname, getaddrinfo, freeaddrinfo, etc.
#include <sys/types.h> // the header file contains declarations for data types used in system calls and library functions, such as size_t, ssize_t, pid_t, and off_t
//example: size_t, ssize_t, pid_t, off_t, etc.
//#include <sys/stat.h>
//#include <sys/un.h>
void handle_error(const char *msg) {
    perror(msg);
    exit(1);
}
int main(int argc, char *argv[]){
    
    int sockfd,  portno , n;
    struct sockaddr_in serv_addr;
    struct hostent *server;

    char buffer[256];
    if (argc < 3){
        fprintf(stderr, "Usage: %s <server_ip> <port>\n", argv[0]);
        exit(1);
    }
    portno = atoi(argv[2]);
    sockfd = socket(AF_INET, SOCK_STREAM, 0);
    if (sockfd < 0) {
        handle_error("Error opening socket");
    }
    server = gethostbyname(argv[1]);
    if (server == NULL) {
        fprintf(stderr, "Error, no such host\n");
        exit(1);
    }
    bzero((char *) &serv_addr, sizeof(serv_addr));
    serv_addr.sin_family = AF_INET;
    bcopy((char *)server->h_addr_list[0], (char *)&serv_addr.sin_addr.s_addr, server->h_length);
    serv_addr.sin_port = htons(portno);
    if (connect(sockfd, (struct sockaddr *) &serv_addr, sizeof(serv_addr)) < 0) {
        handle_error("Error connecting");
    }
    while (1) {
        bzero(buffer, 256);
        printf("Enter message: ");
        fgets(buffer, 256, stdin);
        n = write(sockfd, buffer, strlen(buffer));
        if (n < 0) {
            handle_error("Error writing to socket");
        }
        bzero(buffer, 256);
        n = read(sockfd, buffer, 256);
        if (n < 0) {
            handle_error("Error reading from socket");
        }
        printf("Server reply: %s\n", buffer);
        if (strncmp(buffer, "Quit", 4) == 0) {
            printf("Exiting client.\n");
            break;
        }
    }
    close(sockfd);
    return 0;
}
