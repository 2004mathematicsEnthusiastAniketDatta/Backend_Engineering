#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/types.h>
#include <sys/ipc.h>
#include <sys/msg.h>

#define MESSAGE_KEY 2832
#define PERMISSIONS 0666
#define END_MESSAGE "end"

struct message_struct {
  long int message_type;
  char message_body[BUFSIZ];
};

void process_messages(int msgid) {
  struct message_struct message;
  int running = 1;

  while (running) {
    if (msgrcv(msgid, (void *)&message, BUFSIZ, 1, 0) == -1) {
      perror("msgrcv failed");
      exit(EXIT_FAILURE);
    }

    if (strcmp(message.message_body, END_MESSAGE) == 0) {
      running = 0;
      printf("\nProcess Terminated...\n");
    } else {
      printf("%s\n", message.message_body);
    }
  }
}

int main() {
  int msgid = msgget((key_t)MESSAGE_KEY, PERMISSIONS | IPC_CREAT);
  if (msgid == -1) {
    perror("msgget failed");
    exit(EXIT_FAILURE);
  }

  process_messages(msgid);

  return 0;
}
