#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>
//Flow of data
// Network Visibility: ISPs , Routers, Switches ,
// Hubs , Proxies , Servers,Visibility of network
// Ransome
// Bandwidth and Physical Layer
//Cables
//Ransomeware attacks
//The main organizations responsible for coordinating the global Internet Protocol (IP) address
// space, Domain Name System (DNS) data, and issuing IPs are the Internet Corporation for Assigned Names 
//and Numbers (ICANN) and its functional body, the Internet Assigned Numbers Authority (IANA).
//ARPANET is a govt. like authority to internet presently
// Multi task communication in networks as in video call where you can video call a friend and message another person
//surf internet and browse alongwith
//careful management
//Simplex Network : One way Network , Half Duplex Network: Sender can send only at a time and 
//reciever will recieve only at another point of time.
//Duplex Network: Sender can send and reciever simaltaneosuly at the same time 
//Types of network: Local Area Network , Metropolitan Area Network, Wide Area Network, Personal Area Network.
//Data Transfer terms: 
//Latency:the time delay for a data packet to travel from its source to its destination across a network ,
//Bandwidth:the maximum rate at which data can be transferred over a network connection in a specific time, measured in bits per second (bps),
//Throughput:the actual rate at which data successfully travels across a network in a given time, measured in bits or bytes per second, 
//Jitter: inconsistent delay or variation in arrival time between data packets sent over a network
//Client-Server model
// Peer to Peer P2P connections
//Encapsulation: the process of adding control information, in the form of headers and sometimes trailers, to data as it moves down the layers of a protocol stack (like the TCP/IP or OSI model)
//Deencapsulation: The process of unwrapping and stripping control information headers and trailers
//Copper Wire: 100MB data transfer smooth latency
//Fiber cables: 10GB data transfer Total Internal Reflection
//Coaxial Cables:10-100GB data transfer
//Transceivers: RJ45 Port LAN ports, RJ11, SPF connector, SFP , SFP+, QSFP
//Link Speeds: a technology that sends both electrical power and data over a single Ethernet cable.
//Power Over Ethernet:a technology that sends both electrical power and data over a single Ethernet cable.
// cat 6e cables:2000-3000 systems,cat 6 cables: 1500-2500 systems,cat 5 cables,cat cables
//Ethernet Frame and MAC address: Destination MAC , Source MAC, Payload: Data in chunks and streams encrypted over network
//CRC - error check, Errror detection and correction
//Switching Logic-Smart Traffic Control : CAM tables: MAC address- Port Tables, Learning, Flooding
//Spanning Tree Protocol (STP): In computer networking, STP primarily refers to the Spanning Tree Protocol, a Layer 2 protocol (IEEE 802.1D) that prevents network loops in Ethernet networks by creating a single, loop-free logical path, even with redundant physical links, stopping broadcast storms and ensuring stable data flow, while modern networks often use faster variations like Rapid STP (RSTP).
// VLANs: a way to logically segment a physical network into separate broadcast domains, allowing devices to be grouped by function or security requirements regardless of their physical location.
//1Q tagging: the standard method for implementing Virtual LANs (VLANs) by adding a 4-byte "tag" to Ethernet frames, allowing switches to identify and separate traffic for different VLANs over a single physical link (trunk).
//Collision: Network Collisions
//Broadcasting and Broadcast Domains. 
/**
 * Adds two binary strings and returns the result
 * @param binary1 - First binary string
 * @param binary2 - Second binary string
 * @param result - Output parameter to store the result
 * @param length - Length of the binary strings
 */
void add_binary_strings(const char *binary1, const char *binary2, char *result, int length) {
    int carry = 0;
    
    // Process from right to left (least significant bit to most significant bit)
    for (int i = length - 1; i >= 0; i--) {
        // Convert character '0'/'1' to integer 0/1 and add
        int bit1 = binary1[i] - '0';
        int bit2 = binary2[i] - '0';
        int sum = bit1 + bit2 + carry;
        
        // Calculate result bit and carry
        result[i] = (sum % 2) + '0';  // Remainder is the result bit
        carry = sum / 2;               // Quotient is the carry bit
    }
    
    printf("Sum before handling overflow: %s (carry: %d)\n", result, carry);
    
    // Handle overflow (end-around carry)
    while (carry > 0) {
        carry = 0;
        // Add 1 to the result (end-around carry)
        for (int i = length - 1; i >= 0; i--) {
            if (result[i] == '0') {
                result[i] = '1';
                break;  // No further carry needed
            } else {
                result[i] = '0';  // This position generates a carry
                carry = 1;
            }
        }
        printf("Sum after handling overflow: %s (carry: %d)\n", result, carry);
    }
}

/**
 * Computes the one's complement of a binary string (flips all bits)
 * @param binary - Binary string to be complemented
 * @param length - Length of the binary string
 */
void ones_complement(char *binary, int length) {
    for (int i = 0; i < length; i++) {
        // Flip 0 to 1 and 1 to 0
        binary[i] = (binary[i] == '0') ? '1' : '0';
    }
    printf("One's complement: %s\n", binary);
}

/**
 * Validates if a string contains only binary digits ('0' and '1')
 * @param str - String to validate
 * @return true if string is binary, false otherwise
 */
bool is_binary(const char *str) {
    while (*str) {
        if (*str != '0' && *str != '1')
            return false;
        str++;
    }
    return true;
}

/**
 * Simulates the receiver's verification process
 * @param data1 - First data frame
 * @param data2 - Second data frame
 * @param checksum - Checksum received
 * @param length - Length of the binary strings
 */
void verify_checksum(const char *data1, const char *data2, const char *checksum, int length) {
    char sum[length + 1];       // To store sum of data1 and data2
    char final_sum[length + 1]; // To store final sum
    
    // Null terminate the strings
    sum[length] = '\0';
    final_sum[length] = '\0';
    
    printf("\n--- RECEIVER SIDE ---\n");
    
    // Step 1: Add the original data frames
    printf("Step 1: Adding the two data frames\n");
    add_binary_strings(data1, data2, sum, length);
    
    // Step 2: Add the checksum
    printf("\nStep 2: Adding the checksum to the sum\n");
    add_binary_strings(sum, checksum, final_sum, length);
    
    // Step 3: Take one's complement
    printf("\nStep 3: Computing one's complement of the final sum\n");
    ones_complement(final_sum, length);
    
    // Step 4: Check if result is all zeros (valid) or not (error detected)
    bool valid = true;
    for (int i = 0; i < length; i++) {
        if (final_sum[i] != '0') {
            valid = false;
            break;
        }
    }
    
    printf("\nVERIFICATION RESULT: ");
    if (valid) {
        printf("No errors detected! The data is valid.\n");
    } else {
        printf("Error detected! The data has been corrupted.\n");
    }
}

int main() {
    char data1[100], data2[100], checksum[100];
    int length;
    
    // Get input data
    printf("Enter first binary string: ");
    scanf("%s", data1);
    
    printf("Enter second binary string: ");
    scanf("%s", data2);
    
    // Validate input
    length = strlen(data1);
    if (strlen(data2) != length) {
        printf("Error: Both strings must have the same length.\n");
        return 1;
    }
    
    if (!is_binary(data1) || !is_binary(data2)) {
        printf("Error: Strings must contain only binary digits (0 and 1).\n");
        return 1;
    }
    
    // Initialize checksum
    strcpy(checksum, data1);  // Just to allocate the right size
    
    printf("\n--- SENDER SIDE ---\n");
    
    // Step 1: Add the data frames
    printf("Step 1: Adding the data frames\n");
    add_binary_strings(data1, data2, checksum, length);
    
    // Step 2: Generate the checksum by taking one's complement
    printf("\nStep 2: Computing the checksum (one's complement of the sum)\n");
    ones_complement(checksum, length);
    
    printf("\nGenerated checksum: %s\n", checksum);
    
    // Step 3: Simulate the receiver side verification
    verify_checksum(data1, data2, checksum, length);
    
    return 0;
}
