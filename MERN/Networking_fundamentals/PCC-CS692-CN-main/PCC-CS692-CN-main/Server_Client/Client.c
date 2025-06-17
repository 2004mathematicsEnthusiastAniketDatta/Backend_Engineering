#include <stdio.h>
#include <stdlib.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <string.h>
#include <unistd.h>
#include <netdb.h>

void error(const char *msg) {
    perror(msg);
    exit(1);
}

int main(int argc , char **argv){
    int sockfd ,portno,n;
    struct sockaddr_in serv_addr;
    struct hostent *server;

    char buffer[1024];

    if (argc != 3){
        fprintf(stderr , "Usage: %s <server_ip> <port>\n", argv[0]);
        exit(1);
    }
    portno = atoi(argv[2]);
    sockfd = socket(AF_INET, SOCK_STREAM, 0);
    if (sockfd < 0) {
        error("Error opening socket");
    }
    server = gethostbyname(argv[1]);
    if (server == NULL) {
        fprintf(stderr, "Error, no such host\n");
        exit(1);
    }
    serv_addr.sin_family = AF_INET;
    serv_addr.sin_port = htons(portno);
    inet_pton(AF_INET, argv[1], &serv_addr.sin_addr);
    if (connect(sockfd, (struct sockaddr *) &serv_addr, sizeof(serv_addr)) < 0) {
        error("Error connecting");
    }
   printf("Message sent to server: Hello from the client :)\n");

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
    close(sockfd);
    return 0;

            

}