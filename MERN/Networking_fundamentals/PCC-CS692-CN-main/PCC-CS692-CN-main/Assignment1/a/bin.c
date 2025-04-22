/**
 * @file sender.c
 * @brief Implementation of a message sending system using System V message queues.
 */
#include <stdio.h> // Include standard input/output library for functions like printf and fgets
#include <stdlib.h> // Include standard library for general purpose functions
#include <string.h> // Include string library for string manipulation functions like strlen
#include <sys/types.h> // Include system types for data types like key_t
#include <sys/ipc.h> // Include System V IPC library for inter-process communication
#include <sys/msg.h> // Include System V message queue library for message queue functions

#define MESSAGE_KEY 2832  // Unique key for the message queue
#define PERMISSIONS 0666  // Read and write permissions for the owner, group, and others

struct message_struct {
  long int message_type; 
  char message_body[BUFSIZ];
};

int main() {
  int msgid = msgget((key_t)MESSAGE_KEY, PERMISSIONS | IPC_CREAT);
  if (msgid == -1) {
    perror("msgget failed");
    exit(EXIT_FAILURE);
  }

  struct message_struct message;
  message.message_type = 1; // Set message type to 1 for sending messages

  while(1) {
    printf("Enter message (type 'end' to quit): ");
    fgets(message.message_body, BUFSIZ, stdin);
    
    // Remove trailing newline
    size_t len = strlen(message.message_body);
    if (len > 0 && message.message_body[len-1] == '\n') {
      message.message_body[len-1] = '\0';
    }

    // Send the message
    if (msgsnd(msgid, (void *)&message, BUFSIZ, 0) == -1) {
      perror("msgsnd failed");
      exit(EXIT_FAILURE);
    }

    if (strcmp(message.message_body, "end") == 0) {
      break;
    }
  }

  return 0;
}
