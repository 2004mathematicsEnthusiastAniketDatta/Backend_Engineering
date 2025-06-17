#include <stdio.h>
#include <stdlib.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <string.h>
#include <unistd.h>
#include <arpa/inet.h>

#define PORT 5500

int main(){
    int sock_fd,new_socketfd;
    char buffer[1024]= {0};
    char *message = "Hello from the server :)";
    struct sockaddr_in server_addr,client_addr;
    socklen_t len;
    int addrlen = sizeof(client_addr);

    sock_fd = socket(AF_INET, SOCK_STREAM , 0);
    if(sock_fd < 0) {
        perror("Socket creation failed");
        exit(EXIT_FAILURE);
    }
    server_addr.sin_family = AF_INET;
    server_addr.sin_addr.s_addr = INADDR_ANY; // Bind to any available address
    server_addr.sin_port = htons(PORT);
    
    if(bind(sock_fd, (struct sockaddr *) &server_addr , sizeof(server_addr)) < 0){
        perror("Binding failed");
        exit(EXIT_FAILURE);
    }
    if(listen(sock_fd, 3) < 0){
        perror("Listening failed");
        exit(EXIT_FAILURE);
    }
    printf("Server is listening on port %d \n",PORT);
    len = sizeof(client_addr);
    new_socketfd = accept(sock_fd, (struct sockaddr *) &client_addr, &len);
    if(new_socketfd < 0){
        perror("Accepting connection failed");
        exit(EXIT_FAILURE); 
    }
    printf("Connection established with client\n");
    while(1){
        bzero(buffer, 1024);
        int n = read(new_socketfd, buffer, 1024);
        if(n < 0){
            perror("Reading from socket failed");
            exit(EXIT_FAILURE);
        }
        printf("Client: %s\n", buffer);
        printf("Received from client: %s\n", buffer);
        send(new_socketfd, message, strlen(message), 0);
        printf("Message sent to client: %s\n", message);
    }
        close (new_socketfd);
        printf("Connection closed\n");
        close(sock_fd);
        return 0;
}