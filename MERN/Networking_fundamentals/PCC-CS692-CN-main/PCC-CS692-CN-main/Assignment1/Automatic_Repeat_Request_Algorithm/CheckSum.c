#include <stdio.h>
#include <string.h>

#define MAXSIZE 100

unsigned short calculateChecksum(unsigned short *buffer, int size) {
  unsigned int sum = 0;
  
  // Sum up all 16-bit words
  while (size > 1) {
    sum += *buffer++;
    size -= 2;
  }
  
  // Add left-over byte, if any
  if (size > 0) {
    sum += *(unsigned char *)buffer;
  }
  
  // Fold 32-bit sum into 16 bits
  while (sum >> 16) {
    sum = (sum & 0xFFFF) + (sum >> 16);
  }
  
  // Take one's complement
  return ~sum;
}

int main() {
  char input[MAXSIZE];
  unsigned short buffer[MAXSIZE/2];
  int i, length;
  
  printf("Enter the data string: ");
  fgets(input, MAXSIZE, stdin);
  
  // Remove newline if present
  input[strcspn(input, "\n")] = 0;
  
  length = strlen(input);
  
  // Convert character array to 16-bit words
  memset(buffer, 0, MAXSIZE);
  for(i = 0; i < length; i += 2) {
    buffer[i/2] = (input[i] << 8);
    if (i + 1 < length) {
      buffer[i/2] |= input[i+1];
    }
  }
  
  // Calculate checksum
  unsigned short checksum = calculateChecksum(buffer, length);
  
  printf("Generated Checksum: 0x%04X\n", checksum);
  
  // Verify checksum
  buffer[length/2] = checksum;
  unsigned short verification = calculateChecksum(buffer, length + 2);
  
  printf("Verification Checksum: 0x%04X\n", verification);
  if(verification == 0) {
    printf("Checksum verification successful!\n");
  } else {
    printf("Checksum verification failed!\n");
  }
  
  return 0;
}