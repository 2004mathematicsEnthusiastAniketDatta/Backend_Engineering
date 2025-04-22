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
// key_t ftok (const char *pathname, int proj_id);
// This function generates a unique key for the message queue using the specified pathname and project identifier.
// The pathname is typically a file that exists in the filesystem, and proj_id is an integer that helps to create a unique key.
// The generated key can be used with msgget() to create or access a message queue.
int main() {
  // Creating or Opening a message Queue
  int msgid = msgget((key_t)MESSAGE_KEY, PERMISSIONS | IPC_CREAT); //the second arguement msgflag is normally IPC_CREAT |0666
  // on success , msgget(...) returns a message queue identifier
  // on failure, -1 is returned
  //IPC_PRIVATE constant can be placed as first arguement/
  if (msgid == -1) {
    perror("msgget failed");
    exit(EXIT_FAILURE);
  }
  // A parent process creates message queue prior to performing a fork() , and the child inherits the returned message queue identifier.
  //For unrelated processes we can use this constant , the creator process has to write the returned 
  //message queue identifier in a file that can be read by the other process.
  struct message_struct message; // Define a message structure to hold the message type and body
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
    // The msgsnd system call  is used to send a message tp the message queue identified by the first arguement, 
    //which is the message queue identifier returned by msgget.
    //The second identifier is a pointer to the message structure that contains the message to be sent.
    //The third arguement is the size of the message to be sent, and the last arguement is a flag that can be used to specify
    //whether the message should be sent immediately or if it should block until space is available in the queue.
    // If the message queue is full, the process will block until space becomes available.
    // If the message is sent successfully, msgsnd returns 0. If it fails, it returns -1.
    //The fourth arguement msgflag  can be 0 or IPC_NOWAIT.
    // If it is 0, the message is sent immediately. If it is IPC_NOWAIT, the function returns -1 if the queue is full.
    // the msgflag is a flag that can be used to specify whether the message should be sent immediately 
    //or if it should block until space is available in the queue.
    // int msgrcv (int msqid, void *msgp, size_t msgsz, long msgtyp, int msgflg);
    // The msgrcv system call is used to receive a message from the message queue identified by the first arguement,
    // which is the message queue identifier returned by msgget.
    // The second arguement is a pointer to the message structure that will receive the message.
    // The third arguement is the size of the message to be received, and the fourth arguement is the message type to receive.
    // The fifth arguement is a flag that can be used to specify whether the message should be received immediately or if it should block until a message of the specified type is available.
    // If the message is received successfully, msgrcv returns the size of the message received. If it fails, it returns -1.
    // The message type can be a specific value or 0 to receive any message.
        //msgtype == 0 means that the first message from the queue is removed and returned.
    //msgtype > 0 means that the first message from the queue with the mtype field equals to msgtype is removed 
    //and returned to the calling process.
    //msgtype < 0 means that the first message from the queue with the mtype field less than or equal to absolute value of msgtype 
    //is removed & returned .
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
