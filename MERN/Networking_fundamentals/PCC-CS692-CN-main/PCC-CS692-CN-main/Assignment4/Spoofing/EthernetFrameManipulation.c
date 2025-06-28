#include <stdio.h>
#include <string.h>
#include <stdint.h>
#include <arpa/inet.h>

#define ETHER_ADDR_LEN 6
#define ETHER_TYPE_IPv4 0x0800
#define ETHER_TYPE_ARP  0x0806
#define ETHER_FRAME_MAX 1518

// Ethernet frame header structure
struct ethernet_header {
    uint8_t dest_mac[ETHER_ADDR_LEN];
    uint8_t src_mac[ETHER_ADDR_LEN];
    uint16_t ethertype;
};

// Print MAC address in readable format
void print_mac(const uint8_t *mac) {
    for (int i = 0; i < ETHER_ADDR_LEN; i++) {
        printf("%02x", mac[i]);
        if (i != ETHER_ADDR_LEN - 1) printf(":");
    }
}

// Create an Ethernet frame
size_t create_ethernet_frame(
    uint8_t *frame,
    const uint8_t *dest_mac,
    const uint8_t *src_mac,
    uint16_t ethertype,
    const uint8_t *payload,
    size_t payload_len
) {
    struct ethernet_header *hdr = (struct ethernet_header *)frame;
    memcpy(hdr->dest_mac, dest_mac, ETHER_ADDR_LEN);
    memcpy(hdr->src_mac, src_mac, ETHER_ADDR_LEN);
    hdr->ethertype = htons(ethertype);

    memcpy(frame + sizeof(struct ethernet_header), payload, payload_len);

    size_t frame_len = sizeof(struct ethernet_header) + payload_len;
    if (frame_len < 60) frame_len = 60; // Pad to minimum Ethernet frame size
    return frame_len;
}

// Parse and print Ethernet frame
void parse_ethernet_frame(const uint8_t *frame, size_t frame_len) {
    if (frame_len < sizeof(struct ethernet_header)) {
        printf("Frame too short\n");
        return;
    }
    const struct ethernet_header *hdr = (const struct ethernet_header *)frame;
    printf("Destination MAC: ");
    print_mac(hdr->dest_mac);
    printf("\nSource MAC: ");
    print_mac(hdr->src_mac);
    printf("\nEthertype: 0x%04x\n", ntohs(hdr->ethertype));
    printf("Payload length: %zu bytes\n", frame_len - sizeof(struct ethernet_header));
}

int main() {
    uint8_t dest_mac[ETHER_ADDR_LEN] = {0xFF,0xFF,0xFF,0xFF,0xFF,0xFF};
    uint8_t src_mac[ETHER_ADDR_LEN]  = {0x00,0x0A,0x95,0x9D,0x68,0x16};
    uint8_t payload[] = "Hello, Ethernet!";
    uint8_t frame[ETHER_FRAME_MAX];

    size_t frame_len = create_ethernet_frame(
        frame, dest_mac, src_mac, ETHER_TYPE_IPv4, payload, sizeof(payload)-1
    );

    printf("Created Ethernet frame (%zu bytes):\n", frame_len);
    parse_ethernet_frame(frame, frame_len);

    return 0;
}