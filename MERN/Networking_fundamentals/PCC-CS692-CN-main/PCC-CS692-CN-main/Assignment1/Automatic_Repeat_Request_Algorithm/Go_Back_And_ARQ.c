#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>
#include <time.h>
#include <unistd.h>
#include <sys/time.h>
#include <signal.h>
#include <errno.h>
#include <math.h>

/* Configuration parameters - global variables for user configuration */
int WINDOW_SIZE = 4;
int SEQ_NUM_BITS = 3;  // Bits for sequence number (2^n-1 is max sequence number)
int MAX_PKT_SIZE = 1024;
int TIMEOUT_MS = 1000;
int SIMULATION_DURATION_SEC = 60;
float PACKET_LOSS_RATE = 0.1;
float PACKET_CORRUPT_RATE = 0.05;
int NETWORK_DELAY_MS = 100;

/* Derived values */
int MAX_SEQ_NUM;  // Will be calculated as (2^SEQ_NUM_BITS) - 1

/* Packet structure */
typedef struct {
    int seq_num;
    char *data;  // Dynamically allocated based on MAX_PKT_SIZE
    int data_size;
    unsigned int checksum;
    struct timeval send_time;  // Time when packet was sent
    bool acknowledged;         // Whether packet has been acknowledged
    bool is_timeout;           // Whether packet has timed out
} Packet;

/* Acknowledgment structure */
typedef struct {
    int seq_num;
    unsigned int checksum;
} Ack;

/* Statistics */
typedef struct {
    int packets_sent;
    int unique_packets_sent;
    int packets_retransmitted;
    int acks_received;
    int corrupted_packets_received;
    double total_rtt_ms;
    int rtt_samples;
    int window_full_events;
} Statistics;

Statistics stats = {0};
bool timeout_occurred = false;
struct itimerval timer_val;

/* Sender window */
Packet *send_window = NULL;  // Dynamic array for the send window
int send_base = 0;           // First unacknowledged packet
int next_seq_num = 0;        // Next sequence number to use

/* Function prototypes */
unsigned int calculate_checksum(void* data, int size);
bool is_corrupted(unsigned int received_checksum, void* data, int size);
void send_packet(Packet* packet);
bool receive_ack(Ack* ack);
void receive_packet(Packet* packet);
void send_ack(int seq_num);
void handle_timeout(int sig);
void simulate_network_delay();
bool simulate_packet_loss();
bool simulate_packet_corruption(void* data, int size);
void print_statistics();
void go_back_n_arq_simulation();
void get_user_configuration();
int get_int_input(const char* prompt, int min_value, int max_value);
float get_float_input(const char* prompt, float min_value, float max_value);
void initialize_send_window();
void free_send_window();
bool within_window(int seq_num);
bool is_between(int a, int b, int c);
void check_for_timeout();
void start_timer();
void stop_timer();

/* Timer management */
void start_timer() {
    signal(SIGALRM, handle_timeout);
    
    timer_val.it_value.tv_sec = TIMEOUT_MS / 1000;
    timer_val.it_value.tv_usec = (TIMEOUT_MS % 1000) * 1000;
    timer_val.it_interval.tv_sec = TIMEOUT_MS / 2000;  // Check for timeouts periodically
    timer_val.it_interval.tv_usec = (TIMEOUT_MS % 2000) * 500;
    
    setitimer(ITIMER_REAL, &timer_val, NULL);
    timeout_occurred = false;
}

void stop_timer() {
    timer_val.it_value.tv_sec = 0;
    timer_val.it_value.tv_usec = 0;
    timer_val.it_interval.tv_sec = 0;
    timer_val.it_interval.tv_usec = 0;
    setitimer(ITIMER_REAL, &timer_val, NULL);
}

void handle_timeout(int sig) {
    timeout_occurred = true;
    printf("TIMEOUT: Packet timeout detected\n");
    
    // Mark all unacknowledged packets as timed out
    for (int i = 0; i < WINDOW_SIZE; i++) {
        int idx = (send_base + i) % (MAX_SEQ_NUM + 1);
        if (send_window[idx].seq_num != -1 && !send_window[idx].acknowledged) {
            struct timeval now;
            gettimeofday(&now, NULL);
            
            // Calculate elapsed time
            double elapsed = (now.tv_sec - send_window[idx].send_time.tv_sec) * 1000.0 +
                            (now.tv_usec - send_window[idx].send_time.tv_usec) / 1000.0;
                            
            if (elapsed >= TIMEOUT_MS) {
                send_window[idx].is_timeout = true;
                printf("SENDER: Packet with seq_num=%d timed out after %.2f ms\n", 
                       idx, elapsed);
            }
        }
    }
}

/* Utility functions */
unsigned int calculate_checksum(void* data, int size) {
    unsigned char* buf = (unsigned char*)data;
    unsigned int sum = 0;
    
    for (int i = 0; i < size; i++) {
        sum += buf[i];
    }
    
    return sum;
}

bool is_corrupted(unsigned int received_checksum, void* data, int size) {
    return received_checksum != calculate_checksum(data, size);
}

void simulate_network_delay() {
    usleep(NETWORK_DELAY_MS * 1000);
}

bool simulate_packet_loss() {
    return ((double)rand() / RAND_MAX) < PACKET_LOSS_RATE;
}

bool simulate_packet_corruption(void* data, int size) {
    if (((double)rand() / RAND_MAX) < PACKET_CORRUPT_RATE) {
        // Corrupt a random byte in the data
        unsigned char* buf = (unsigned char*)data;
        int pos = rand() % size;
        buf[pos] = buf[pos] ^ 0xFF;  // Flip all bits in a byte
        return true;
    }
    return false;
}

double get_elapsed_ms(struct timeval start) {
    struct timeval now;
    gettimeofday(&now, NULL);
    return (now.tv_sec - start.tv_sec) * 1000.0 + 
           (now.tv_usec - start.tv_usec) / 1000.0;
}

// Check if seq_num is between send_base and send_base+WINDOW_SIZE-1
bool within_window(int seq_num) {
    return is_between(send_base, seq_num, (send_base + WINDOW_SIZE - 1) % (MAX_SEQ_NUM + 1));
}

// Check if b is between a and c in circular sequence number space
bool is_between(int a, int b, int c) {
    if (a <= c)
        return (a <= b && b <= c);
    else
        return (a <= b || b <= c);
}

// Initialize the sender window
void initialize_send_window() {
    send_window = (Packet*)malloc((MAX_SEQ_NUM + 1) * sizeof(Packet));
    if (!send_window) {
        printf("ERROR: Failed to allocate memory for send window\n");
        exit(1);
    }
    
    for (int i = 0; i <= MAX_SEQ_NUM; i++) {
        send_window[i].seq_num = -1;  // -1 means empty slot
        send_window[i].data = NULL;
        send_window[i].data_size = 0;
        send_window[i].acknowledged = false;
        send_window[i].is_timeout = false;
    }
}

void free_send_window() {
    if (send_window) {
        for (int i = 0; i <= MAX_SEQ_NUM; i++) {
            if (send_window[i].data != NULL) {
                free(send_window[i].data);
            }
        }
        free(send_window);
        send_window = NULL;
    }
}

/* Input validation functions */
int get_int_input(const char* prompt, int min_value, int max_value) {
    int value;
    char input[100];
    bool valid = false;
    
    do {
        printf("%s [%d-%d]: ", prompt, min_value, max_value);
        if (fgets(input, sizeof(input), stdin)) {
            if (sscanf(input, "%d", &value) == 1) {
                if (value >= min_value && value <= max_value) {
                    valid = true;
                } else {
                    printf("Error: Value must be between %d and %d\n", min_value, max_value);
                }
            } else {
                printf("Error: Please enter a valid number\n");
            }
        }
    } while (!valid);
    
    return value;
}

float get_float_input(const char* prompt, float min_value, float max_value) {
    float value;
    char input[100];
    bool valid = false;
    
    do {
        printf("%s [%.2f-%.2f]: ", prompt, min_value, max_value);
        if (fgets(input, sizeof(input), stdin)) {
            if (sscanf(input, "%f", &value) == 1) {
                if (value >= min_value && value <= max_value) {
                    valid = true;
                } else {
                    printf("Error: Value must be between %.2f and %.2f\n", min_value, max_value);
                }
            } else {
                printf("Error: Please enter a valid number\n");
            }
        }
    } while (!valid);
    
    return value;
}

/* Get user configuration */
void get_user_configuration() {
    printf("\nEnter Go-Back-N ARQ simulation configuration parameters:\n");
    printf("-----------------------------------------------------\n");
    
    // Get sequence number bits
    SEQ_NUM_BITS = get_int_input("Sequence number bits", 2, 16);
    MAX_SEQ_NUM = (1 << SEQ_NUM_BITS) - 1;
    
    // Get window size (must be less than or equal to half of sequence number space)
    int max_window = (MAX_SEQ_NUM + 1) / 2;
    WINDOW_SIZE = get_int_input("Window size", 1, max_window);
    
    // Get packet size
    MAX_PKT_SIZE = get_int_input("Maximum packet size (bytes)", 64, 10000);
    
    // Get timeout
    TIMEOUT_MS = get_int_input("Timeout duration (milliseconds)", 100, 10000);
    
    // Get simulation duration
    SIMULATION_DURATION_SEC = get_int_input("Simulation duration (seconds)", 5, 300);
    
    // Get packet loss rate
    PACKET_LOSS_RATE = get_float_input("Packet loss rate (0.0-1.0)", 0.0, 1.0);
    
    // Get packet corruption rate
    PACKET_CORRUPT_RATE = get_float_input("Packet corruption rate (0.0-1.0)", 0.0, 1.0);
    
    // Get network delay
    NETWORK_DELAY_MS = get_int_input("Network delay (milliseconds)", 0, 1000);
    
    printf("\nConfiguration set successfully!\n\n");
}

/* Sender functions */
void send_packet(Packet* packet) {
    packet->checksum = calculate_checksum(packet->data, packet->data_size);
    gettimeofday(&packet->send_time, NULL);
    packet->acknowledged = false;
    packet->is_timeout = false;
    
    printf("SENDER: Sending packet with seq_num=%d, size=%d bytes\n", 
           packet->seq_num, packet->data_size);
    
    // Simulate network delay
    simulate_network_delay();
    
    // Simulate packet loss
    if (simulate_packet_loss()) {
        printf("NETWORK: Packet with seq_num=%d lost in transmission\n", packet->seq_num);
        return;
    }
    
    // Simulate packet corruption
    if (simulate_packet_corruption(packet->data, packet->data_size)) {
        printf("NETWORK: Packet with seq_num=%d corrupted in transmission\n", packet->seq_num);
    }
    
    stats.packets_sent++;
    
    // Simulate packet reception at the receiver
    receive_packet(packet);
}

bool receive_ack(Ack* ack) {
    // Simulate network delay
    simulate_network_delay();
    
    // Simulate ACK loss
    if (simulate_packet_loss()) {
        printf("NETWORK: ACK with seq_num=%d lost in transmission\n", ack->seq_num);
        return false;
    }
    
    // Simulate ACK corruption
    if (simulate_packet_corruption(&ack->seq_num, sizeof(ack->seq_num))) {
        printf("NETWORK: ACK corrupted in transmission\n");
        return false;
    }
    
    // Check if ACK is corrupted
    if (is_corrupted(ack->checksum, &ack->seq_num, sizeof(ack->seq_num))) {
        printf("SENDER: Received corrupted ACK\n");
        return false;
    }
    
    printf("SENDER: Received valid ACK with seq_num=%d\n", ack->seq_num);
    
    // Cumulative ACK - acknowledge all packets up to ack->seq_num
    int next_expected = (ack->seq_num) % (MAX_SEQ_NUM + 1);
    bool moved_window = false;
    
    // Find the packet this ACK is for
    for (int i = 0; i < WINDOW_SIZE; i++) {
        int idx = (send_base + i) % (MAX_SEQ_NUM + 1);
        if (send_window[idx].seq_num != -1 && !send_window[idx].acknowledged) {
            // If this seq_num and all before it are being acknowledged
            if (!is_between(send_base, idx, next_expected)) {
                send_window[idx].acknowledged = true;
                
                double rtt = get_elapsed_ms(send_window[idx].send_time);
                stats.total_rtt_ms += rtt;
                stats.rtt_samples++;
                stats.acks_received++;
                
                printf("SENDER: Packet with seq_num=%d acknowledged, RTT=%.2f ms\n", 
                       idx, rtt);
                
                // If this is the send_base, slide window
                if (idx == send_base) {
                    // Slide window to next unacknowledged packet
                    int old_base = send_base;
                    while (send_window[send_base].acknowledged) {
                        send_window[send_base].seq_num = -1;  // Mark as empty
                        if (send_window[send_base].data) {
                            free(send_window[send_base].data);
                            send_window[send_base].data = NULL;
                        }
                        send_base = (send_base + 1) % (MAX_SEQ_NUM + 1);
                        if (send_base == old_base) break;  // Avoid infinite loop
                    }
                    moved_window = true;
                    printf("SENDER: Window slid to start at seq_num=%d\n", send_base);
                }
            }
        }
    }
    
    return moved_window;
}

/* Receiver functions */
void receive_packet(Packet* packet) {
    // Check if packet is corrupted
    if (is_corrupted(packet->checksum, packet->data, packet->data_size)) {
        printf("RECEIVER: Received corrupted packet with seq_num=%d\n", packet->seq_num);
        stats.corrupted_packets_received++;
        return;
    }
    
    printf("RECEIVER: Received valid packet with seq_num=%d, size=%d bytes\n", 
           packet->seq_num, packet->data_size);
    
    // Process the packet data (in a real application)
    
    // Send acknowledgment - in Go-Back-N, we send cumulative ACKs
    send_ack(packet->seq_num);
}

void send_ack(int seq_num) {
    Ack ack;
    ack.seq_num = seq_num;
    ack.checksum = calculate_checksum(&ack.seq_num, sizeof(ack.seq_num));
    
    printf("RECEIVER: Sending ACK with seq_num=%d\n", seq_num);
    
    // Simulate sending the ACK back to sender
    receive_ack(&ack);
}

/* Check for timed out packets and retransmit */
void check_for_timeout() {
    if (!timeout_occurred) return;
    
    timeout_occurred = false;
    bool need_retransmit = false;
    
    // Check for any timed out packets in the window
    for (int i = 0; i < WINDOW_SIZE; i++) {
        int idx = (send_base + i) % (MAX_SEQ_NUM + 1);
        if (send_window[idx].seq_num != -1 && !send_window[idx].acknowledged && send_window[idx].is_timeout) {
            need_retransmit = true;
            break;
        }
    }
    
    if (need_retransmit) {
        printf("SENDER: Retransmitting all packets from seq_num=%d\n", send_base);
        
        // Retransmit all packets from send_base
        for (int i = 0; i < WINDOW_SIZE; i++) {
            int idx = (send_base + i) % (MAX_SEQ_NUM + 1);
            if (send_window[idx].seq_num != -1 && !send_window[idx].acknowledged) {
                send_packet(&send_window[idx]);
                stats.packets_retransmitted++;
            }
        }
    }
}

/* Statistics */
void print_statistics() {
    printf("\n--- Go-Back-N ARQ Statistics ---\n");
    printf("Total packets sent: %d\n", stats.packets_sent);
    printf("Unique packets sent: %d\n", stats.unique_packets_sent);
    printf("Packets retransmitted: %d (%.2f%%)\n", 
           stats.packets_retransmitted, 
           stats.packets_sent > 0 ? (double)stats.packets_retransmitted / stats.packets_sent * 100 : 0);
    printf("ACKs received: %d\n", stats.acks_received);
    printf("Corrupted packets received: %d\n", stats.corrupted_packets_received);
    printf("Window full events: %d\n", stats.window_full_events);
    
    if (stats.rtt_samples > 0) {
        printf("Average RTT: %.2f ms\n", stats.total_rtt_ms / stats.rtt_samples);
    }
    
    printf("Effective throughput: %.2f packets/second\n", 
           (double)stats.unique_packets_sent / SIMULATION_DURATION_SEC);
    
    double efficiency = stats.unique_packets_sent > 0 ? 
                      (double)stats.unique_packets_sent / stats.packets_sent * 100 : 0;
    printf("Transmission efficiency: %.2f%%\n", efficiency);
}

/* Go-Back-N ARQ protocol simulation */
void go_back_n_arq_simulation() {
    srand(time(NULL));
    time_t start_time = time(NULL);
    int packet_count = 0;
    
    // Initialize sender window
    initialize_send_window();
    
    printf("Starting Go-Back-N ARQ simulation for %d seconds...\n", SIMULATION_DURATION_SEC);
    printf("Using window size = %d, sequence number range = 0-%d\n", WINDOW_SIZE, MAX_SEQ_NUM);
    
    // Start timer
    start_timer();
    
    while (time(NULL) - start_time < SIMULATION_DURATION_SEC) {
        // Check for timeout and handle retransmissions
        check_for_timeout();
        
        // Calculate number of free slots in the window
        int free_slots = 0;
        for (int i = 0; i < WINDOW_SIZE; i++) {
            int idx = (send_base + i) % (MAX_SEQ_NUM + 1);
            if (send_window[idx].seq_num == -1 || send_window[idx].acknowledged) {
                free_slots++;
            }
        }
        
        // If window is full, wait and check for ACKs/timeouts
        if (free_slots == 0) {
            stats.window_full_events++;
            printf("SENDER: Window full, waiting for ACKs...\n");
            usleep(TIMEOUT_MS * 500);  // Sleep for half the timeout period
            continue;
        }
        
        // Prepare new packets to fill the window
        for (int i = 0; i < WINDOW_SIZE && free_slots > 0; i++) {
            int idx = (send_base + i) % (MAX_SEQ_NUM + 1);
            
            if (send_window[idx].seq_num == -1 || send_window[idx].acknowledged) {
                // Create a new packet
                send_window[idx].seq_num = idx;
                
                // Allocate or reallocate data buffer if needed
                if (send_window[idx].data == NULL) {
                    send_window[idx].data = (char*)malloc(MAX_PKT_SIZE);
                    if (!send_window[idx].data) {
                        printf("ERROR: Failed to allocate memory for packet data\n");
                        continue;
                    }
                }
                
                // Fill with sample data
                send_window[idx].data_size = 100 + rand() % (MAX_PKT_SIZE - 100);
                memset(send_window[idx].data, 'A' + (packet_count % 26), send_window[idx].data_size);
                
                // Send the packet
                send_packet(&send_window[idx]);
                
                packet_count++;
                stats.unique_packets_sent++;
                free_slots--;
            }
        }
        
        // Add some delay between packets
        usleep(10000);  // 10ms
    }
    
    // Stop timer
    stop_timer();
    
    // Free allocated memory
    free_send_window();
    
    printf("Simulation completed. Sent %d packets successfully.\n", packet_count);
    print_statistics();
}

int main() {
    printf("Go-Back-N ARQ Protocol Simulation\n");
    printf("=================================\n");
    
    // Get user configuration
    get_user_configuration();
    
    // Display the configuration
    printf("Configuration:\n");
    printf("  - Sequence number bits: %d (range: 0-%d)\n", SEQ_NUM_BITS, MAX_SEQ_NUM);
    printf("  - Window size: %d\n", WINDOW_SIZE);
    printf("  - Max packet size: %d bytes\n", MAX_PKT_SIZE);
    printf("  - Timeout: %d ms\n", TIMEOUT_MS);
    printf("  - Packet loss rate: %.1f%%\n", PACKET_LOSS_RATE * 100);
    printf("  - Packet corruption rate: %.1f%%\n", PACKET_CORRUPT_RATE * 100);
    printf("  - Network delay: %d ms\n", NETWORK_DELAY_MS);
    printf("  - Simulation duration: %d seconds\n\n", SIMULATION_DURATION_SEC);
    
    // Ask user if they want to proceed
    char response;
    printf("Start simulation with these parameters? (y/n): ");
    scanf(" %c", &response);
    getchar(); // Clear the newline character
    
    if (response == 'y' || response == 'Y') {
        go_back_n_arq_simulation();
    } else {
        printf("Simulation cancelled.\n");
    }
    
    return 0;
}