/*
 * IPV4Spoofing.c - Demonstrates IP packet spoofing using raw sockets
 * 
 * This program creates and sends IP packets with a spoofed source address.
 * Must be run with root/administrator privileges.
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <netinet/ip.h>
#include <netinet/ip_icmp.h>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <errno.h>

// Calculate checksum
unsigned short calculate_checksum(unsigned short *buf, int nwords) {
    unsigned long sum = 0;
    
    for (sum = 0; nwords > 0; nwords--)
        sum += *buf++;
    
    sum = (sum >> 16) + (sum & 0xffff);
    sum += (sum >> 16);
    
    return (unsigned short)(~sum);
}

int main(int argc, char *argv[]) {
    if (argc != 3) {
        printf("Usage: %s <spoofed_source_ip> <destination_ip>\n", argv[0]);
        return 1;
    }
    
    // Create raw socket
    int sockfd = socket(AF_INET, SOCK_RAW, IPPROTO_ICMP);
    if (sockfd < 0) {
        perror("Socket creation failed");
        printf("Note: This program requires root privileges\n");
        return 1;
    }
    
    // Set socket options - IP_HDRINCL means we provide the IP header
    int one = 1;
    if (setsockopt(sockfd, IPPROTO_IP, IP_HDRINCL, &one, sizeof(one)) < 0) {
        perror("setsockopt failed");
        close(sockfd);
        return 1;
    }
    
    // Buffer for the packet
    char packet[sizeof(struct iphdr) + sizeof(struct icmphdr)];
    memset(packet, 0, sizeof(packet));
    
    // IP header pointer
    struct iphdr *ip = (struct iphdr *)packet;
    // ICMP header pointer
    struct icmphdr *icmp = (struct icmphdr *)(packet + sizeof(struct iphdr));
    
    // Fill in the IP header
    ip->version = 4;
    ip->ihl = 5;  // IP header length
    ip->tos = 0;
    ip->tot_len = htons(sizeof(struct iphdr) + sizeof(struct icmphdr));
    ip->id = htons(rand() % 65535);  // Random ID
    ip->frag_off = 0;
    ip->ttl = 64;  // Time To Live
    ip->protocol = IPPROTO_ICMP;
    ip->check = 0;  // Set to 0 before calculating checksum
    ip->saddr = inet_addr(argv[1]);  // Spoofed source IP
    ip->daddr = inet_addr(argv[2]);  // Destination IP
    
    // Calculate IP header checksum
    ip->check = calculate_checksum((unsigned short *)ip, sizeof(struct iphdr) / 2);
    
    // Fill in the ICMP header
    icmp->type = ICMP_ECHO;  // Echo Request
    icmp->code = 0;
    icmp->checksum = 0;
    icmp->un.echo.id = htons(getpid() & 0xFFFF);
    icmp->un.echo.sequence = htons(1);
    
    // Calculate ICMP checksum
    icmp->checksum = calculate_checksum((unsigned short *)icmp, sizeof(struct icmphdr) / 2);
    
    // Destination address
    struct sockaddr_in dest;
    memset(&dest, 0, sizeof(dest));
    dest.sin_family = AF_INET;
    dest.sin_addr.s_addr = inet_addr(argv[2]);
    
    printf("Sending spoofed packet:\n");
    printf("  Source IP      : %s\n", argv[1]);
    printf("  Destination IP : %s\n", argv[2]);
    
    // Send the packet
    if (sendto(sockfd, packet, sizeof(packet), 0, 
              (struct sockaddr *)&dest, sizeof(dest)) < 0) {
        perror("sendto failed");
        close(sockfd);
        return 1;
    }
    
    printf("Packet sent successfully\n");
    close(sockfd);
    
    return 0;
}