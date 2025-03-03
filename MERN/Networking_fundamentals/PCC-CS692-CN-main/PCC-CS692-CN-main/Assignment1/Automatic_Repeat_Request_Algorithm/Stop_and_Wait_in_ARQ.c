#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <unistd.h>
#include <stdbool.h>

// Configuration parameters
#define FRAME_LOSS_RATE 30     // Probability (%) of frame being lost
#define ACK_LOSS_RATE 20       // Probability (%) of ACK being lost
#define TIMEOUT 2              // Timeout duration in seconds
#define TOTAL_FRAMES 10        // Total number of frames to send
#define CORRUPT_RATE 10        // Probability (%) of frame being corrupted

// Statistics tracking
int frames_sent = 0;           // Total frames sent (including retransmissions)
int frames_retransmitted = 0;  // Number of retransmitted frames
int successful_frames = 0;     // Successfully acknowledged frames

/**
 * Simulates random frame loss based on predefined probability
 * Returns true if frame is lost, false otherwise
 */
bool is_frame_lost() {
    // Generate random number between 0-99 and check if it's below loss threshold
    return (rand() % 100) < FRAME_LOSS_RATE;
}

/**
 * Simulates random ACK loss based on predefined probability
 * Returns true if ACK is lost, false otherwise
 */
bool is_ack_lost() {
    // Generate random number between 0-99 and check if it's below loss threshold
    return (rand() % 100) < ACK_LOSS_RATE;
}

/**
 * Simulates random frame corruption based on predefined probability
 * Returns true if frame is corrupted, false otherwise
 */
bool is_frame_corrupted() {
    // Generate random number between 0-99 and check if it's below corruption threshold
    return (rand() % 100) < CORRUPT_RATE;
}

/**
 * Prints the transmission statistics
 */
void print_statistics() {
    printf("\n--- Stop-and-Wait ARQ Statistics ---\n");
    printf("Total frames sent: %d\n", frames_sent);
    printf("Frames retransmitted: %d (%.2f%%)\n", 
           frames_retransmitted, 
           (float)frames_retransmitted / frames_sent * 100);
    printf("Successfully delivered frames: %d\n", successful_frames);
    printf("Efficiency: %.2f%%\n", 
           (float)successful_frames / frames_sent * 100);
}

int main() {
    // Initialize random number generator with current time
    srand(time(NULL));
    
    // Current sequence number (alternates between 0 and 1)
    int seq_num = 0;
    
    printf("Stop-and-Wait ARQ Protocol Simulation\n");
    printf("=====================================\n\n");
    
    // Main loop - send frames until we've successfully sent TOTAL_FRAMES
    while (successful_frames < TOTAL_FRAMES) {
        bool frame_delivered = false;
        
        while (!frame_delivered) {
            // Send the frame with current sequence number
            printf("SENDER: Sending Frame %d\n", seq_num);
            frames_sent++;
            
            // Simulate network delay (1 second)
            sleep(1);
            
            // Check if frame is lost in transmission
            if (is_frame_lost()) {
                printf("NETWORK: Frame %d is lost in transmission!\n", seq_num);
                printf("SENDER: Timeout after %d seconds\n", TIMEOUT);
                
                // Wait for timeout period
                sleep(TIMEOUT);
                
                // Increment retransmission counter
                frames_retransmitted++;
                
                // Continue to next iteration (retry sending the frame)
                continue;
            }
            
            // Check if frame is corrupted
            if (is_frame_corrupted()) {
                printf("NETWORK: Frame %d is corrupted!\n", seq_num);
                printf("RECEIVER: Discarding corrupted frame\n");
                printf("SENDER: Timeout after %d seconds\n", TIMEOUT);
                
                // Wait for timeout period
                sleep(TIMEOUT);
                
                // Increment retransmission counter
                frames_retransmitted++;
                
                // Continue to next iteration (retry sending the frame)
                continue;
            }
            
            // Frame successfully received by receiver
            printf("RECEIVER: Frame %d received successfully\n", seq_num);
            
            // Receiver sends ACK
            printf("RECEIVER: Sending ACK %d\n", seq_num);
            
            // Check if ACK is lost in transmission
            if (is_ack_lost()) {
                printf("NETWORK: ACK %d is lost!\n", seq_num);
                printf("SENDER: Timeout after %d seconds\n", TIMEOUT);
                
                // Wait for timeout period
                sleep(TIMEOUT);
                
                // Increment retransmission counter
                frames_retransmitted++;
                
                // Continue to next iteration (retry sending the frame)
                continue;
            }
            
            // ACK successfully received by sender
            printf("SENDER: ACK %d received successfully\n\n", seq_num);
            
            // Mark current frame as successfully delivered
            frame_delivered = true;
            
            // Increment successfully delivered frames counter
            successful_frames++;
        }
        
        // Toggle sequence number (0 -> 1, 1 -> 0) for next frame
        seq_num = 1 - seq_num;
    }
    
    // Print final statistics
    printf("All %d frames sent successfully!\n", TOTAL_FRAMES);
    print_statistics();
    
    return 0;
}