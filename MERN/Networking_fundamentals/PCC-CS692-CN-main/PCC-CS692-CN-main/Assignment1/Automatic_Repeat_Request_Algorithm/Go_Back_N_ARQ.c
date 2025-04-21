// Standard input/output functions (printf, scanf, etc.)
#include <stdio.h>                 
// Standard library functions (memory allocation, random numbers, etc.)
#include <stdlib.h>                
// String manipulation functions
#include <string.h>                
// Time functions for random seed
#include <time.h>                  
// Boolean data type support
#include <stdbool.h>               

// Total number of frames to be sent
#define TOTAL_FRAMES 10            
// Size of the sliding window
#define WINDOW_SIZE 4              

// Function to display frames being sent in current window
void send_frames(int start , int window_size){
    // Print header for frame sending
    printf("Sending Frames:");     
    // Loop through frames in current window
    for(int i = start; i < start + window_size && i < TOTAL_FRAMES; i++) {
        // Display each frame number
        printf("[%d]", i);         
    }
    // New line after frame list
    printf("\n");                  
}

// Function to simulate random ACK loss
bool isACKLost(){
    // 30% chance of ACK loss (returns true if random number is 0, 1, or 2)
    return rand() % 10 < 3;        
}

int main(){
    // Initialize random number generator with current time
    srand(time(NULL));             
    // Array to track received acknowledgments
    bool received[TOTAL_FRAMES] = { false }; 
    // Starting position of the window
    int base = 0;                  
    
    // Continue until all frames are sent and acknowledged
    while (base < TOTAL_FRAMES) {  
        // Show current window of frames
        send_frames(base, WINDOW_SIZE); 
        int i;
        // Process each frame in current window
        for (i = base; i < base + WINDOW_SIZE && i < TOTAL_FRAMES; i++) { 
            // Show waiting message for current frame
            printf("Waiting for ACK of Frame %d \n", (i+1)); 
            
            // Check if ACK is lost
            if (isACKLost()) {     
                // Display ACK loss message
                printf("ACK lost for Frame %d! \n", (i+1)); 
                // Show resending message
                printf("Resending from Frame:%d \n",i);
                // Exit loop to resend frames
                break;             
            }
            else {                 
                // Show successful ACK message
                printf("ACK received for Frame %d \n", (i+1)); 
                // Mark frame as acknowledged
                received[i] = true; 
            }
        }
        
        // Window movement logic
        if (i == base + WINDOW_SIZE || i == TOTAL_FRAMES) {
            // Move window by full window size if all ACKs received
            base += WINDOW_SIZE; 
        }
        else{
            // Move window to last unacknowledged frame
            base = i; 
        }
    }
    
    // Final success message
    printf("All frames sent and acknowledged successfully!\n"); 
    return 0;
}
