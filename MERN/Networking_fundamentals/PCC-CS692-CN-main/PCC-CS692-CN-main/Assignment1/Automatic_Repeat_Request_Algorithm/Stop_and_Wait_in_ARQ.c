#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>
#include <time.h>
#include <unistd.h>
#include <sys/time.h>
#include <signal.h>
#include <errno.h>

/* Configuration parameters - now as global variables instead of #define */
int MAX_PKT_SIZE = 1024;
int TIMEOUT_MS = 1000;
int SIMULATION_DURATION_SEC = 60;
float PACKET_LOSS_RATE = 0.1;
float PACKET_CORRUPT_RATE = 0.05;
int NETWORK_DELAY_MS = 100;

/* Packet structure */
typedef struct {
    int seq_num;
    char *data;  // Dynamically allocated based on MAX_PKT_SIZE
    int data_size;
    unsigned int checksum;
} Packet;

/* Acknowledgment structure */
typedef struct {
    int seq_num;
    unsigned int checksum;
} Ack;

/* Statistics */
typedef struct {
    int packets_sent;
    int packets_retransmitted;
    int acks_received;
    int corrupted_packets_received;
    double total_rtt_ms;
    int rtt_samples;
} Statistics;

Statistics stats = {0};
bool timeout_occurred = false;
struct timeval send_time;

/* Function prototypes */
unsigned int calculate_checksum(void* data, int size);
bool is_corrupted(unsigned int received_checksum, void* data, int size);
void send_packet(Packet* packet);
bool receive_ack(Ack* ack, int expected_seq);
void receive_packet(Packet* packet);
void send_ack(int seq_num);
void handle_timeout(int sig);
void simulate_network_delay();
bool simulate_packet_loss();
bool simulate_packet_corruption(void* data, int size);
void print_statistics();
void stop_and_wait_arq_simulation();
void get_user_configuration();
int get_int_input(const char* prompt, int min_value, int max_value);
float get_float_input(const char* prompt, float min_value, float max_value);

/* Timer management */
void start_timer() {
    signal(SIGALRM, handle_timeout);
    struct itimerval timer;
    timer.it_value.tv_sec = TIMEOUT_MS / 1000;
    timer.it_value.tv_usec = (TIMEOUT_MS % 1000) * 1000;
    timer.it_interval.tv_sec = 0;
    timer.it_interval.tv_usec = 0;
    gettimeofday(&send_time, NULL);
    setitimer(ITIMER_REAL, &timer, NULL);
    timeout_occurred = false;
}

void stop_timer() {
    struct itimerval timer;
    timer.it_value.tv_sec = 0;
    timer.it_value.tv_usec = 0;
    timer.it_interval.tv_sec = 0;
    timer.it_interval.tv_usec = 0;
    setitimer(ITIMER_REAL, &timer, NULL);
}

void handle_timeout(int sig) {
    timeout_occurred = true;
    printf("TIMEOUT: Packet acknowledgment not received within %d ms\n", TIMEOUT_MS);
    stats.packets_retransmitted++;
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

double get_elapsed_ms() {
    struct timeval now;
    gettimeofday(&now, NULL);
    return (now.tv_sec - send_time.tv_sec) * 1000.0 + 
           (now.tv_usec - send_time.tv_usec) / 1000.0;
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
    printf("\nEnter simulation configuration parameters:\n");
    printf("----------------------------------------\n");
    
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
}

bool receive_ack(Ack* ack, int expected_seq) {
    // Simulate network delay
    simulate_network_delay();
    
    // Simulate ACK loss
    if (simulate_packet_loss()) {
        printf("NETWORK: ACK with seq_num=%d lost in transmission\n", expected_seq);
        return false;
    }
    
    // Simulate network conditions for ACK
    ack->seq_num = expected_seq;
    ack->checksum = calculate_checksum(&ack->seq_num, sizeof(ack->seq_num));
    
    if (simulate_packet_corruption(&ack->seq_num, sizeof(ack->seq_num))) {
        printf("NETWORK: ACK corrupted in transmission\n");
        return false;
    }
    
    // Check if ACK is corrupted
    if (is_corrupted(ack->checksum, &ack->seq_num, sizeof(ack->seq_num))) {
        printf("SENDER: Received corrupted ACK\n");
        return false;
    }
    
    // Check if ACK has correct sequence number
    if (ack->seq_num != expected_seq) {
        printf("SENDER: Received ACK with wrong sequence number. Expected: %d, Got: %d\n", 
               expected_seq, ack->seq_num);
        return false;
    }
    
    double rtt = get_elapsed_ms();
    stats.total_rtt_ms += rtt;
    stats.rtt_samples++;
    stats.acks_received++;
    
    printf("SENDER: Received valid ACK with seq_num=%d, RTT=%.2f ms\n", 
           ack->seq_num, rtt);
    
    return true;
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
    
    // Send acknowledgment
    send_ack(packet->seq_num + 1);
}

void send_ack(int seq_num) {
    Ack ack;
    ack.seq_num = seq_num;
    ack.checksum = calculate_checksum(&ack.seq_num, sizeof(ack.seq_num));
    
    printf("RECEIVER: Sending ACK with seq_num=%d\n", seq_num);
    
    // In a real implementation, this would send over network
}

/* Statistics */
void print_statistics() {
    printf("\n--- Stop-and-Wait ARQ Statistics ---\n");
    printf("Packets sent: %d\n", stats.packets_sent);
    printf("Packets retransmitted: %d (%.2f%%)\n", 
           stats.packets_retransmitted, 
           stats.packets_sent > 0 ? (double)stats.packets_retransmitted / stats.packets_sent * 100 : 0);
    printf("ACKs received: %d\n", stats.acks_received);
    printf("Corrupted packets received: %d\n", stats.corrupted_packets_received);
    
    if (stats.rtt_samples > 0) {
        printf("Average RTT: %.2f ms\n", stats.total_rtt_ms / stats.rtt_samples);
    }
    
    printf("Effective throughput: %.2f packets/second\n", 
           (double)(stats.packets_sent - stats.packets_retransmitted) / SIMULATION_DURATION_SEC);
}

/* Stop-and-Wait ARQ protocol simulation */
void stop_and_wait_arq_simulation() {
    srand(time(NULL));
    Packet packet;
    Ack ack;
    int seq_num = 0;
    time_t start_time = time(NULL);
    int packet_count = 0;
    
    // Allocate memory for packet data based on MAX_PKT_SIZE
    packet.data = (char*)malloc(MAX_PKT_SIZE);
    if (!packet.data) {
        printf("ERROR: Failed to allocate memory for packet data\n");
        return;
    }
    
    printf("Starting Stop-and-Wait ARQ simulation for %d seconds...\n", SIMULATION_DURATION_SEC);
    
    while (time(NULL) - start_time < SIMULATION_DURATION_SEC) {
        // Prepare packet with sample data
        packet.seq_num = seq_num;
        packet.data_size = 100 + rand() % (MAX_PKT_SIZE - 100);
        memset(packet.data, 'A' + (packet_count % 26), packet.data_size);
        
        bool ack_received = false;
        int retries = 0;
        
        while (!ack_received) {
            // Send packet
            send_packet(&packet);
            
            // Start timer
            start_timer();
            
            // Wait for ACK
            ack_received = receive_ack(&ack, (seq_num + 1) % 2);
            
            // If timeout or invalid ACK, retransmit
            if (timeout_occurred || !ack_received) {
                retries++;
                if (retries > 10) {
                    printf("SENDER: Max retries reached for packet with seq_num=%d, aborting\n", seq_num);
                    break;
                }
                printf("SENDER: Retransmitting packet with seq_num=%d (retry %d)\n", seq_num, retries);
                continue;
            }
            
            // Stop timer
            stop_timer();
        }
        
        if (ack_received) {
            // Move to next packet
            seq_num = (seq_num + 1) % 2;  // Toggle between 0 and 1
            packet_count++;
            
            // Add some delay between packets
            usleep(10000);  // 10ms
        }
    }
    
    // Free allocated memory
    free(packet.data);
    
    printf("Simulation completed. Sent %d packets successfully.\n", packet_count);
    print_statistics();
}

int main() {
    printf("Stop-and-Wait ARQ Protocol Simulation\n");
    printf("======================================\n");
    
    // Get user configuration
    get_user_configuration();
    
    // Display the configuration
    printf("Configuration:\n");
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
        stop_and_wait_arq_simulation();
    } else {
        printf("Simulation cancelled.\n");
    }
    
    return 0;
}