#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>


void error(const char *msg)
{
    perror(msg);
    exit(1);
}


int main(int argc, char *argv[])
{
   if (argc < 2){
     fprintf(stderr, "Port number not provided. Program terminated. \n");
     exit(1);
   }


   int sockfd , newsockfd , portno;
   char buffer[256];
   struct sockaddr_in serv_addr, cli_addr;
   socklen_t clilen;

   sockfd = socket(AF_INET , SOCK_STREAM , 0 );
   if (sockfd < 0)
   {
        error("Error opening socket. Socket creation failed.");
   }
   bzero((char *) &serv_addr , sizeof(serv_addr));
   portno = atoi(argv[1]);
   serv_addr.sin_family = AF_INET;
   serv_addr.sin_addr.s_addr = INADDR_ANY; // Bind to any available address
   serv_addr.sin_port = htons(portno);
   if (bind(sockfd , (struct sockaddr *) &serv_addr , sizeof(serv_addr)) < 0)
   {
        error("Error on binding. Binding failed.");
   }
    listen(sockfd , 10); //10 is the maximum number of pending connections
    clilen = sizeof(cli_addr);


    newsockfd = accept(sockfd , (struct sockaddr *) &cli_addr , &clilen);
    if (newsockfd < 0)
    {
        error("Error on accept. Accepting connection failed.");
    }
    while (1)
    {
        bzero(buffer , 256);
        int n = read(newsockfd , buffer , 256);
        if (n < 0)
        {
            error("Error reading from socket. Reading failed.");
        }
        printf("Client: %s\n", buffer);
        bzero(buffer, 256);
        fgets(buffer, 256, stdin);

        
        
        // Echo the message back to the client
        n = write(newsockfd , buffer , strlen(buffer));
        if (n < 0)
        {
            error("Error writing to socket. Writing failed.");
        }
        int i =strncmp("Quit", buffer , 4);
        if (i == 0)
        {
            printf("Server: Quit command received. Closing connection.\n");
            break;
        }
    }
    close(newsockfd);
    close(sockfd);
    return 0;
}