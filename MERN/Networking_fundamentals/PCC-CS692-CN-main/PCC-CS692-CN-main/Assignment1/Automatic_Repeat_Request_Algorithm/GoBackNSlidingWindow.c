#include <stdio.h>                 // Include standard input/output library for functions like printf
#include <stdlib.h>                // Include standard library for functions like rand and srand              
#include <string.h>                // Include string manipulation functions

#include <time.h>                 // Include time library for random number generation
#include <stdbool.h>               // Include boolean data type (true/false)

#define TOTAL_FRAMES 10            // Define a constant for total number of frames (10)
#define WINDOW_SIZE 4              // Define a constant for window size in Go-Back-N protocol (4)

// Function to display which frames are being sent in the current window
void send_frames(bool received[], int base){
    printf("Sending Frames:");     // Print message indicating frames are being sent
    
    // Loop through the current window of frames
    for(int i = base; i < base + WINDOW_SIZE && i < TOTAL_FRAMES; i++) {
        if(received[i]) {          // If this frame has already been received (acknowledged)
            printf("[%d]", i);     // Print the frame number in brackets
        }
    }

    printf("\n");                  // Print a newline after listing the frames
}

// Function to simulate whether an acknowledgment is lost during transmission
bool isACKLost() {
    return rand() % 10 < 3;        // Return true (ACK lost) 30% of the time, false 70% of the time
}

int main(){
    srand(time(NULL));             // Initialize random number generator with current time as seed
    
    bool received[TOTAL_FRAMES] = { false }; // Create array to track which frames have been acknowledged, all initially false
    int base = 0;                  // Start with the first frame (index 0)
    
    while (base < TOTAL_FRAMES) {  // Continue until all frames have been sent and acknowledged
        send_frames(received, base); // Display the frames in the current window
        
        // Process each frame in the current window
        for (int i = base; i < base + WINDOW_SIZE && i < TOTAL_FRAMES; i++) {
            if (received[i])       // Skip frames that have already been acknowledged
                continue;
            printf("Waiting for ACK of Frame %d \n", (i+1)); // Display waiting message (note: frame numbers shown to user are 1-based)
            
            if (isACKLost()) {     // If the acknowledgment is lost
                printf("ACK lost for Frame %d! \n", (i+1)); // Inform that ACK was lost
            }
            else {                 // If the acknowledgment is received successfully
                printf("ACK received for Frame %d \n", (i+1)); // Inform that ACK was received
                received[i] = true; // Mark this frame as acknowledged
            }
        }
        
        // Move the window forward past all acknowledged frames
        while (base < TOTAL_FRAMES && received[base]) {
            base++;                // Advance the base of the window
        }
    }
    
    printf("All frames sent and acknowledged successfully!\n"); // Display completion message
    return 0;                      // End program with success code
}