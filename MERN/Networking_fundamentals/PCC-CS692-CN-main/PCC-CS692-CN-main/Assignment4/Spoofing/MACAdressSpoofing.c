#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/ioctl.h>
#include <sys/socket.h>
#include <linux/if.h>
#include <linux/if_arp.h>
#include <netinet/in.h>
#include <errno.h>

// Parse MAC address string into bytes
int parse_mac(const char *mac_str, unsigned char *mac_bytes) {
    int values[6];
    
    if (sscanf(mac_str, "%x:%x:%x:%x:%x:%x", &values[0], &values[1],
               &values[2], &values[3], &values[4], &values[5]) != 6) {
        return -1;
    }
    
    for (int i = 0; i < 6; i++) {
        if (values[i] < 0 || values[i] > 255) {
            return -1;
        }
        mac_bytes[i] = (unsigned char) values[i];
    }
    
    return 0;
}

// Change MAC address of network interface
int change_mac(const char *interface, const char *new_mac) {
    int sockfd;
    struct ifreq ifr;
    unsigned char mac[6];
    
    // Parse the MAC address
    if (parse_mac(new_mac, mac) < 0) {
        fprintf(stderr, "Invalid MAC address format. Use XX:XX:XX:XX:XX:XX\n");
        return -1;
    }
    
    // Open socket
    sockfd = socket(AF_INET, SOCK_DGRAM, 0);
    if (sockfd < 0) {
        perror("socket");
        return -1;
    }
    
    // Get current interface configuration
    memset(&ifr, 0, sizeof(ifr));
    strncpy(ifr.ifr_name, interface, IFNAMSIZ - 1);
    
    if (ioctl(sockfd, SIOCGIFFLAGS, &ifr) < 0) {
        perror("SIOCGIFFLAGS");
        close(sockfd);
        return -1;
    }
    
    // Store flags and bring interface down
    int flags = ifr.ifr_flags;
    ifr.ifr_flags &= ~IFF_UP;
    
    if (ioctl(sockfd, SIOCSIFFLAGS, &ifr) < 0) {
        perror("SIOCSIFFLAGS");
        close(sockfd);
        return -1;
    }
    
    // Set the new MAC address
    ifr.ifr_hwaddr.sa_family = ARPHRD_ETHER;
    memcpy(ifr.ifr_hwaddr.sa_data, mac, 6);
    
    if (ioctl(sockfd, SIOCSIFHWADDR, &ifr) < 0) {
        perror("SIOCSIFHWADDR");
        // Restore interface
        ifr.ifr_flags = flags;
        ioctl(sockfd, SIOCSIFFLAGS, &ifr);
        close(sockfd);
        return -1;
    }
    
    // Bring interface back up
    ifr.ifr_flags = flags;
    if (ioctl(sockfd, SIOCSIFFLAGS, &ifr) < 0) {
        perror("SIOCSIFFLAGS");
        close(sockfd);
        return -1;
    }
    
    close(sockfd);
    return 0;
}

// Display current MAC address
void display_mac(const char *interface) {
    int sockfd;
    struct ifreq ifr;
    
    sockfd = socket(AF_INET, SOCK_DGRAM, 0);
    if (sockfd < 0) {
        perror("socket");
        return;
    }
    
    memset(&ifr, 0, sizeof(ifr));
    strncpy(ifr.ifr_name, interface, IFNAMSIZ - 1);
    
    if (ioctl(sockfd, SIOCGIFHWADDR, &ifr) < 0) {
        perror("SIOCGIFHWADDR");
        close(sockfd);
        return;
    }
    
    unsigned char *mac = (unsigned char *)ifr.ifr_hwaddr.sa_data;
    printf("MAC address for %s: %02x:%02x:%02x:%02x:%02x:%02x\n", 
           interface, mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
    
    close(sockfd);
}

int main(int argc, char *argv[]) {
    // Check if running as root
    if (geteuid() != 0) {
        fprintf(stderr, "This program must be run as root (use sudo)\n");
        return EXIT_FAILURE;
    }
    
    if (argc != 3) {
        printf("Usage: %s <interface> <new_mac_address>\n", argv[0]);
        printf("Example: %s eth0 00:11:22:33:44:55\n", argv[0]);
        return EXIT_FAILURE;
    }
    
    const char *interface = argv[1];
    const char *new_mac = argv[2];
    
    printf("Current MAC address:\n");
    display_mac(interface);
    
    printf("Changing MAC address of %s to %s\n", interface, new_mac);
    
    if (change_mac(interface, new_mac) == 0) {
        printf("MAC address changed successfully\n");
        display_mac(interface);
        return EXIT_SUCCESS;
    } else {
        fprintf(stderr, "Failed to change MAC address\n");
        return EXIT_FAILURE;
    }
}