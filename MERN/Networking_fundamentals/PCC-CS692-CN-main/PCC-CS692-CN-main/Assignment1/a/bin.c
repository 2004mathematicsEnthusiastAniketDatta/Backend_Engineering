/**
 * @file sender.c
 * @brief Implementation of a message sending system using System V message queues.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/types.h>
#include <sys/ipc.h>
#include <sys/msg.h>

#define MESSAGE_KEY 2832
#define PERMISSIONS 0666

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
  message.message_type = 1;

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
