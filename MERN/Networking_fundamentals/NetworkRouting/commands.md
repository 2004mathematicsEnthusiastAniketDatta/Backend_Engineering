# Network Routing Documentation

## Overview
Network routing is the process of selecting paths in a network along which to send network traffic. Routers examine the destination IP address of packets and determine the best path to forward them based on routing tables.

## Routing Table Fundamentals

### What is a Routing Table?
A routing table is a data structure stored in a router or networked device that lists the routes to particular network destinations. It contains information about network topology and helps determine the best path for packet forwarding.

### Key Components of Routing Table Entries
- **Destination Network**: The target network or host IP address
- **Subnet Mask/Prefix**: Defines the network portion of the address
- **Gateway/Next Hop**: The IP address of the next router in the path
- **Interface**: The local network interface to use for forwarding
- **Metric**: Cost or preference value for route selection
- **Route Source**: How the route was learned (static, dynamic, connected)

## Essential Network Routing Commands

### netstat -rn
**Purpose**: Display the kernel IP routing table in numerical format

**Syntax**: `netstat -rn`

**Output Columns**:
- **Destination**: Target network or host address
- **Gateway**: Next hop router IP address (0.0.0.0 means directly connected)
- **Genmask**: Subnet mask for the destination network
- **Flags**: Route characteristics
    - `U` = Route is up
    - `G` = Route uses gateway
    - `H` = Target is a host
    - `D` = Route created by ICMP redirect
    - `M` = Route modified by ICMP redirect
- **Metric**: Route cost/priority
- **Ref**: Number of references to this route
- **Use**: Number of packets sent via this route
- **Iface**: Network interface name

## Data Links: 
1. Each Device has a link address or MAC address
2. Devices that directly reachable devices can communicate with link address
3. requires layer 2 frames
4. **Frame Serialization**: Layer 2 frames are serialized into bit streams for transmission
5. **Physical Layer Conversion**: Bits are converted to electrical, optical, or radio signals
6. **Signal Encoding**: Digital bits are encoded using methods like NRZ, Manchester, or differential encoding
7. **Medium Transmission**: Signals travel through copper, fiber optic cables, or wireless channels
8. **Signal Recovery**: Receiving devices convert physical signals back to digital bits and deserialize frames
9. Switch/ any layer two device gets the frames from which MAC address is obtained and Switch/ any layer two device gets the frames from which MAC address is obtained and forwards the frame to the appropriate port based on the MAC address table (CAM table).
10. Hub has no memory so that broadcasts the message and the devices have knowledge of which frames to drop or accept.The target will accept the frame and others have to drop.
11. Switch has memory and IP routing table information  and Routing IP where MAC addresses and the ports are mentioned from where you get to know which devices will recieve the signals.

## Switch:
- Each device advertises their presence 
- Switches in the middle remember which port device is at
- This is critical for Performance
- A wants to send to B (How does A know B's MAC ? Will come to that)
- Sends this across the network

## Links: 
- In networking, a link at the Data Link Layer (Layer 2 of the OSI model) is a direct communication path connecting two adjacent nodes on a network, like two computers on a local network or a computer and a router. The Data Link Layer manages these links by organizing data into frames, ensuring reliable delivery with error detection and flow control, and regulating access to the physical medium through its two sublayers: Media Access Control (MAC) and Logical Link Control (LLC).
 - In a point-to-point link, the connection is dedicated to just two devices. This is a simple link where a single sender and a single receiver are connected. Since there are no other devices on the link, there is no need to coordinate access to the medium. 

    Example: A direct cable connection between a user's computer and a modem.
    Protocols: The Point-to-Point Protocol (PPP) is a common example used to establish a direct connection between two nodes, such as a client and a server over a dial-up or broadband link. 
 - Broadcast links
In a broadcast link, the communication medium is shared among multiple devices. The data link layer manages how these devices access the shared medium to prevent collisions, which occur when two or more devices attempt to transmit at the same time. 

    Example: A traditional Ethernet network where multiple computers are connected to a shared cable or a wireless Wi-Fi network where all devices share the same radio frequency.
    Protocols: The Media Access Control (MAC) sublayer of the data link layer governs how devices share the medium. Examples include:
        Carrier Sense Multiple Access with Collision Detection (CSMA/CD): Used in wired Ethernet, where a device listens to the network to check for traffic. If the medium is idle, it sends data. If a collision occurs, it stops, waits a random amount of time, and retransmits.
        Carrier Sense Multiple Access with Collision Avoidance (CSMA/CA): Used in wireless networks (Wi-Fi), where devices attempt to avoid collisions before they happen.

- Data link layer functions over links
Regardless of the link type, the data link layer performs several key functions to ensure reliable and efficient data transfer across a link: 

    Framing: The data link layer encapsulates network layer packets into frames by adding a header and a trailer to distinguish the start and end of the data unit.
    Physical Addressing: Each frame contains the MAC (Media Access Control) address of the source and destination devices. This physical address is a unique, hard-coded identifier for each network interface card (NIC) and is used to deliver the frame to the correct device on the local network segment.
    Error Control: Mechanisms like Cyclic Redundancy Check (CRC) are used to detect and sometimes correct errors that can occur during transmission over a link.
    Flow Control: This regulates the rate at which data is sent to prevent a fast sender from overwhelming a slow receiver.
    
## Where Links Break:

- MAC Addresses are unique but random
- They don't scale on large networks with millions of devices
- Need a new address system a "routable" one
- Internet Protocol
- Very Similar to an Index in DataBases

## MAC Addresses and IP Addresses
- MAC Addresses (Media Access Control)

- Unique but random: Every network device has a unique MAC address burned into its hardware, but they're assigned randomly by manufacturers
- Local scope: MAC addresses only work within the same network segment (like your home WiFi)
- Not routable: Routers can't use MAC addresses to send data across the internet
- Scalability Problem

- With millions/billions of devices globally, MAC addresses create chaos
Think of it like trying to deliver mail using only random serial numbers instead of organized street addresses
- Internet Protocol (IP) Solution
- Hierarchical Structure

- IP addresses are organized like postal addresses: Country → State → City → Street → House
Example: 192.168.1.100 - the first parts identify the network, last part identifies the device
   1. Internet Protocol
   2. 4 bytes 32 bit (IPv4)
   3. Network and Host sections
   4. Eg.24 bit network , 8 bit for host
   5. RULE: Hosts within the same networks can require link address
- Database Index Analogy This is a great comparison! Just like database indexes:

- MAC addresses = Primary keys (unique but not organized for searching)
- IP addresses = Indexed fields (organized hierarchically for efficient routing)
## Real-World Example
Routers use this hierarchical structure to efficiently forward packets across the internet, just like a database uses indexes to quickly find records.

## How to check if an IP is in my network?
 - We require the network mask or the Subnet mask
 - E.g. 192.168.1.4 is in network 192.168.1.0/24 or 255.255.255.0
 - 192.168.1.5 AND with 255.255.255.0 = 192.168.1.0 (same network)
 - 10.0.0.6 AND 255.255.255.0 = 10.0.0.0 (not same as 192.168.1.0 )

## ARP (Address Resolution Protocol)
The Problem ARP Solves
Remember your note: "A wants to send to B (How does A know B's MAC? Will come to that)" - ARP is the answer to that question.

When a device knows an IP address but needs the corresponding MAC address for Layer 2 frame delivery, ARP bridges this gap.

## ARP Process 
1. ARP Packet Structure (28 bytes)
2. ARP Cache Management
3. Low-Level ARP States
4. INCOMPLETE: ARP request sent, waiting for reply
5. COMPLETE: Valid MAC address cached
6. STALE: Entry aged out but not yet removed
7. PERMANENT: Static ARP entry (manually configured)
8. ARP only works on the same subnet.
9. 192.168.1.4 cannot ask for 10.0.0.2's MAC
10. No ARP request will be sent 
## How do we talk to different Networks: Gateway
1. We always need a Gateway to act as a proxy like device between two different networks.
2. For a device to talk on a device on another netwrok needs a gateway.
3. The Gateway belongs to both the networks
4. Devices are aware of their Gateway(cobfigured) 
5. Next Hop
6. Router has two network cards 
-> Switches get Updated

## RARP (Reverse Address Resolution Protocol)
The Problem RARP Solves
RARP addresses the opposite scenario: a device knows its MAC address but needs to discover its IP address. This was crucial for diskless workstations that couldn't store their IP configuration.

## RARP Process
RARP vs Modern Alternatives
RARP has largely been replaced by:

1. DHCP: More feature-rich, provides IP, subnet mask, gateway, DNS
2. BOOTP: Bootstrap Protocol, RARP's successor
3. ARP Security Considerations
4. ARP Spoofing Attack
5. ARP Defense Mechanisms
6. Real-World Integration


## DHCP (Dynamic Host Configuration Protocol)

### Overview
DHCP is a network service that automatically assigns IP addresses and other network configuration parameters to devices when they connect to a network. It operates on a client-server model and has largely replaced manual IP configuration and older protocols like RARP.

### DHCP Process (DORA)
The DHCP process follows a four-step sequence known as DORA:

1. **Discover**: Client broadcasts DHCP Discover message to find available DHCP servers
2. **Offer**: DHCP server responds with an IP address offer and configuration parameters
3. **Request**: Client formally requests the offered IP address from the server
4. **Acknowledge**: Server confirms the lease and provides final configuration

### DHCP Message Types
- **DHCPDISCOVER**: Client seeks available DHCP servers
- **DHCPOFFER**: Server offers IP address and parameters
- **DHCPREQUEST**: Client requests specific IP configuration
- **DHCPACK**: Server acknowledges and confirms lease
- **DHCPNAK**: Server denies request (IP unavailable/invalid)
- **DHCPRELEASE**: Client releases IP address back to pool
- **DHCPINFORM**: Client requests additional configuration parameters

### DHCP Configuration Parameters
Beyond IP addresses, DHCP can provide:
- Subnet mask
- Default gateway
- DNS server addresses
- Domain name
- NTP (time) servers
- TFTP server for network booting
- Lease duration

### DHCP Lease Management
- **Lease Time**: Duration an IP address is assigned to a client
- **Renewal**: Client attempts to renew lease at 50% of lease time
- **Rebinding**: If renewal fails, client attempts rebinding at 87.5% of lease time
- **Lease Expiration**: Client must restart DHCP process if lease expires

### DHCP Relay Agents
DHCP relay agents forward DHCP messages between clients and servers across different network segments, enabling centralized DHCP management in multi-subnet environments.


## Switches get Updated:
1. Router / Gateway is just another device with a MAC
2. Switches get updated with the MACs of the connected devices.

## Link Networking Example:
1. 192.168.1.4 wants to talk to 192.168.1.5 (this only knows the IP)
2. Checks if this is in the same network:
- 192.168.1.5 x 255.255.255.0 = 192.168.1.0,*same network
- Means we can directly communicate with data link ( MAC Addresses )
- 192.168.1.4 needs the MAC address of 192.168.1.5(Sends ARP)  
3. ARP gets to the switches , sends this to all the ports
4. The router is a device and this is not 192.168.1.5 so didn't respond
5. The ARP request is not sent through the other network (saving bandwidth).
6. B replies back , switch sends the message only to A(why?)
7. Now that we know the direct link address we send an IP packet
8. Source IP : 192.168.1.4 , Destination IP: 192.168.1.5
9. Encapsulated in a Data Link Frame
10. Source MAC: A , Destination MAC: B
11. The frame goes to the switch , switch writes this to P2 only
12. Local Link Delivery and recieving the frame  
## B replies back , switch sends the message only to A. why?
- Switch Behavior: Why B's Reply Only Goes to A
- Routing Table & MAC Address Learning:
When you ask "B replies back, switch sends the message only to A. why?" - this is about how network switches learn and maintain their MAC address table (also called a forwarding table or CAM table).

- Step-by-Step Process:
1. Initial State: Switch's MAC table is empty
2. A sends to B: Switch receives frame from A on port 1
3. Switch learns: "MAC address of A is on port 1"
4. Since B's location is unknown, switch floods the frame to all ports except port 1
5. B receives and replies: Switch receives B's reply on port 2
6. Switch learns: "MAC address of B is on port 2"
7. Switch already knows A is on port 1, so it sends only to port 1
8. MAC Address Table Example:
9. Key Concepts:
   - Flooding: When destination MAC is unknown, send to all ports
   - Learning: Record source MAC and incoming port for each frame
   - Forwarding: When destination MAC is known, send only to that specific port
   - Aging: Entries expire (typically 300 seconds) to handle device moves
This creates efficient unicast forwarding - traffic only goes where it needs to go, reducing network congestion.


## Inter-Network Communication:
1. 192.168.1.5 wants to send a message to 10.0.0.2
2. Can't do ARP , because this is not in the same network.(No direct Link).
       - 192.168.1.0!=10.0.0.0
3.  Only way is the gateway (default)*
4. 192.168.1.5 needs to talk to the gateway which is 192.168.1.1
5. We do ARP to get the gateway's MAC
6. The IP packet is destined to gateway (X)
7. Gateway understands the frame ,gets inside  the Frame and sees the IP packet.
8. The destination IP is not same as his
9. IP 10.0.0.2 is not 10.0.0.1 nor 192.168.1.1 , IP forwarding comes inside.
10. net.ipv4.ip_forward=1 
## IP Forwarding:
1. In normal situation the packet is dropped (nothing is there).
2. The OS kernel has a feature to enable IP forwarding,i.e. if we receive a frame that is for you but the IP is not for you
3. We can foreward the IP packets to other interfaces with the help of MAC addresses
4. ARP on the other network.
5. The gateway now has to do an ARP on the basic network.
6. Who has 10.0.0.2? Note that Z is our MAC now.
7. We get D!
8. The router asks who has 10.0.0.2 or the value may be cached
9. D replies back to the ARP
10. Goes through port P1 on switch.
11. Gateway keeps the source ip (unless NAT)
12. Switch sends the frame on port P2
## Machine receiving the frame:
1. 10.0.0.2 receives the frame that is destined for D so accepts this.
2. Opens up the IP packet , the IP is also destined to 10.0.0.2
3. Kernel delivers this to the application

## Inter-network reply:

1. 10.0.0.2 processes the received data and prepares a reply
2. Reply packet: Source IP: 10.0.0.2, Destination IP: 192.168.1.5
3. 10.0.0.2 checks if destination is in same network:
    - 192.168.1.5 & 255.255.255.0 = 192.168.1.0
    - 10.0.0.0 ≠ 192.168.1.0 (different networks)
4. Must use gateway: 10.0.0.1 (default gateway for 10.0.0.0/24 network)
5. 10.0.0.2 needs MAC address of gateway 10.0.0.1
6. ARP request: "Who has 10.0.0.1?" (may be cached)
7. Gateway responds with its MAC address on 10.0.0.0/24 interface
8. Frame created: Source MAC: D, Destination MAC: Z (gateway's MAC)
9. IP packet: Source: 10.0.0.2, Destination: 192.168.1.5
10. Switch forwards frame to gateway on appropriate port

## Gateway Processing Return Traffic:
1. Gateway receives frame destined for its MAC (Z)
2. Examines IP packet - destination 192.168.1.5 is not gateway's IP
3. IP forwarding enabled - gateway will route packet
4. Gateway checks routing table for 192.168.1.0/24 network
5. Knows 192.168.1.5 is reachable via 192.168.1.0 interface
6. Gateway needs MAC of 192.168.1.5 (likely cached from original communication)
7. If not cached, performs ARP: "Who has 192.168.1.5?"
8. Creates new frame: Source MAC: Y (gateway's 192.168.1.0 interface), Destination MAC: B
9. IP packet remains: Source: 10.0.0.2, Destination: 192.168.1.5
10. Switch forwards frame to 192.168.1.5 on port P2

## Final Delivery:
1. 192.168.1.5 receives frame with its MAC address
2. Accepts frame and processes IP packet
3. IP destination matches device IP (192.168.1.5)
4. Kernel delivers data to the requesting application
5. Round-trip communication complete

## Key Observations:
- **MAC addresses change** at each network hop (local significance only)
- **IP addresses remain constant** throughout the journey (end-to-end significance)
- **Gateway performs MAC address translation** between network segments
- **ARP caching** improves efficiency for subsequent communications
- **Symmetric routing** - return path follows same network topology

## Multiple Gateways and Paths

### Overview
In complex network environments, devices often have access to multiple gateways and routing paths. This redundancy provides fault tolerance, load distribution, and optimized routing based on various metrics and policies.

### Default Gateway vs Multiple Gateways

#### Single Default Gateway Limitation
- Most basic network configurations use a single default gateway
- All inter-network traffic flows through one router
- Creates single point of failure
- Can lead to bottlenecks and suboptimal routing
- granularity 
#### Multiple Gateway Scenarios
1. **Multi-homed Networks**: Networks connected to multiple ISPs
2. **Redundant Infrastructure**: Backup gateways for fault tolerance
3. **Load Balancing**: Distributing traffic across multiple paths
4. **Policy-based Routing**: Different gateways for different traffic types

### Routing Table with Multiple Paths

#### Route Metrics and Priority
```
Destination     Gateway         Metric  Interface
0.0.0.0         192.168.1.1     1       eth0     (Primary)
0.0.0.0         192.168.1.2     10      eth0     (Backup)
10.0.0.0/8      192.168.1.1     1       eth0
172.16.0.0/16   192.168.1.2     1       eth0
```

#### Metric-based Selection
- **Lower metric = Higher priority**
- Common metrics: Hop count, bandwidth, delay, reliability
- Administrative distance determines route preference
- Manual metric assignment for policy control

### Dynamic Routing Protocols

#### Distance Vector Protocols
- **RIP (Routing Information Protocol)**
    - Uses hop count as metric (max 15 hops)
    - Periodic routing table exchanges
    - Simple but limited scalability
    
#### Link State Protocols
- **OSPF (Open Shortest Path First)**
    - Builds complete network topology map
    - Calculates shortest path using Dijkstra's algorithm
    - Faster convergence than distance vector
    - Supports multiple equal-cost paths

#### Path Vector Protocols
- **BGP (Border Gateway Protocol)**
    - Used for inter-domain routing on internet
    - Considers AS (Autonomous System) paths
    - Policy-based routing decisions
    - Prevents routing loops through path information

### Load Balancing Strategies

#### Equal-Cost Multi-Path (ECMP)
- Multiple routes with identical metrics
- Traffic distributed across available paths
- Per-flow or per-packet load balancing
- Maintains packet ordering within flows

#### Weighted Load Balancing
- Unequal cost paths with different weights
- Traffic proportionally distributed
- Accounts for link capacity differences
- Example: 70% via high-speed link, 30% via backup

### Failover Mechanisms

#### Primary/Backup Configuration
```
Primary:   192.168.1.5 → Gateway1 (192.168.1.1) → Internet
Backup:    192.168.1.5 → Gateway2 (192.168.1.2) → Internet
```

#### Automatic Failover Process
1. **Health Monitoring**: Regular gateway reachability checks
2. **Failure Detection**: Timeout-based or active probing
3. **Route Withdrawal**: Remove failed gateway from routing table
4. **Traffic Redirection**: Automatic switch to backup path
5. **Recovery Detection**: Monitor for primary path restoration

### Advanced Multi-Path Scenarios

#### Multi-ISP Environment
```
Enterprise Network: 192.168.0.0/16
├── ISP-A Gateway: 192.168.1.1 (Fiber - High Speed)
├── ISP-B Gateway: 192.168.1.2 (Cable - Medium Speed)
└── ISP-C Gateway: 192.168.1.3 (Satellite - Backup)
```

#### Traffic Engineering Examples
- **Critical Applications**: Always use ISP-A (lowest latency)
- **Bulk Transfers**: Load balance between ISP-A and ISP-B
- **Emergency Backup**: ISP-C only when others fail

### Path Selection Algorithms

#### Shortest Path First (SPF)
- Calculates optimal path based on cumulative link costs
- Considers bandwidth, delay, reliability metrics
- Updates paths dynamically as network changes
- Used by OSPF and IS-IS protocols

#### Policy-Based Routing (PBR)
```
Source Network      Gateway         Policy
192.168.10.0/24  → 192.168.1.1     (Management traffic)
192.168.20.0/24  → 192.168.1.2     (Guest traffic)
192.168.30.0/24  → 192.168.1.3     (IoT devices)
```

### Multi-Gateway Configuration Examples

#### Linux Multiple Default Routes
```bash
# Add multiple default routes with different metrics
ip route add default via 192.168.1.1 dev eth0 metric 100
ip route add default via 192.168.1.2 dev eth0 metric 200

# View routing table
ip route show
```

#### Windows Multiple Gateways
```cmd
# Add routes with different metrics
route add 0.0.0.0 mask 0.0.0.0 192.168.1.1 metric 1
route add 0.0.0.0 mask 0.0.0.0 192.168.1.2 metric 10
```

### Gateway Selection Process

#### Longest Prefix Match
1. **Specific Routes First**: More specific network masks take precedence
2. **Default Route Last**: 0.0.0.0/0 used when no specific match
3. **Administrative Distance**: Protocol preference (lower = better)
4. **Metric Comparison**: Among same-protocol routes

#### Example Route Selection
```
Destination: 10.1.1.100
Available Routes:
- 10.1.1.0/24 via 192.168.1.1    (Most specific - SELECTED)
- 10.1.0.0/16 via 192.168.1.2    (Less specific)
- 0.0.0.0/0   via 192.168.1.3    (Default route)
```

### Monitoring and Troubleshooting

#### Gateway Reachability Testing
```bash
# Test primary gateway
ping 192.168.1.1

# Trace route to destination
traceroute 8.8.8.8

# Monitor route changes
ip monitor route
```

#### Common Issues
- **Asymmetric routing**: Outbound and return paths differ
- **Route flapping**: Unstable routes causing frequent changes
- **Black holes**: Routes pointing to unreachable gateways
- **Suboptimal paths**: Traffic taking longer routes due to misconfiguration

### Best Practices

#### Design Considerations
1. **Redundancy Planning**: Always have backup paths
2. **Metric Tuning**: Properly configure route preferences
3. **Monitoring**: Implement gateway health checks
4. **Documentation**: Maintain routing topology records
5. **Testing**: Regular failover testing procedures

#### Security Implications
- **Route Authentication**: Prevent route poisoning attacks
- **Access Control**: Limit routing protocol participation
- **Monitoring**: Detect unexpected route changes
- **Segmentation**: Isolate routing domains appropriately


### ip route show Command

The `ip route show` command displays the current IP routing table on Linux systems. It's part of the iproute2 package and provides detailed information about how packets are routed.

**Basic Syntax:**
```bash
ip route show
ip route list
ip r s  # Short form
```

**Sample Output:**
```
default via 192.168.1.1 dev wlan0 proto dhcp metric 600
169.254.0.0/16 dev wlan0 scope link metric 1000
192.168.1.0/24 dev wlan0 proto kernel scope link src 192.168.1.100 metric 600
```

**Output Field Explanations:**
- **default**: Default route (0.0.0.0/0)
- **via**: Next hop gateway IP address
- **dev**: Network interface device name
- **proto**: Route protocol (kernel, dhcp, static, etc.)
- **scope**: Route scope (global, link, host)
- **src**: Preferred source IP for this route
- **metric**: Route priority (lower = higher priority)

### Advanced ip route Commands

#### Adding Routes
```bash
# Add default route
ip route add default via 192.168.1.1

# Add specific network route
ip route add 10.0.0.0/8 via 192.168.1.2

# Add route with metric
ip route add 172.16.0.0/16 via 192.168.1.3 metric 100
```

#### Deleting Routes
```bash
# Delete specific route
ip route del 10.0.0.0/8 via 192.168.1.2

# Delete default route
ip route del default via 192.168.1.1
```

#### Route Filtering
```bash
# Show only default routes
ip route show default

# Show routes for specific destination
ip route show 192.168.1.0/24

# Show routes via specific gateway
ip route show via 192.168.1.1
```

## Essential Network Commands Reference

### Routing Information Commands

#### netstat Commands
```bash
# Display routing table
netstat -rn           # Numerical addresses
netstat -r            # Resolve hostnames

# Display network connections
netstat -tuln         # TCP/UDP listening ports
netstat -an           # All connections
```

#### route Command (Legacy)
```bash
# Display routing table
route -n              # Numerical format

# Add/delete routes
route add default gw 192.168.1.1
route del -net 10.0.0.0/8
```

### Interface Configuration Commands

#### ip Commands for Interfaces
```bash
# Show all interfaces
ip link show
ip addr show

# Configure interface
ip addr add 192.168.1.100/24 dev eth0
ip link set eth0 up

# Show interface statistics
ip -s link show eth0
```

#### ifconfig Command (Legacy)
```bash
# Display interfaces
ifconfig              # All interfaces
ifconfig eth0         # Specific interface

# Configure interface
ifconfig eth0 192.168.1.100 netmask 255.255.255.0 up
```

### ARP Table Management

#### arp Command
```bash
# Display ARP table
arp -a                # All entries
arp -n                # Numerical addresses

# Add/delete ARP entries
arp -s 192.168.1.5 aa:bb:cc:dd:ee:ff
arp -d 192.168.1.5
```

#### ip neighbor Command
```bash
# Show ARP/neighbor table
ip neighbor show
ip neigh show

# Add/delete neighbor entries
ip neighbor add 192.168.1.5 lladdr aa:bb:cc:dd:ee:ff dev eth0
ip neighbor del 192.168.1.5 dev eth0
```

### Network Connectivity Testing

#### ping Command
```bash
# Basic connectivity test
ping 8.8.8.8

# Specify interface
ping -I eth0 192.168.1.1

# Set packet count and interval
ping -c 4 -i 0.5 google.com
```

#### traceroute/tracepath
```bash
# Trace packet path
traceroute 8.8.8.8
tracepath 8.8.8.8

# UDP/ICMP/TCP tracing
traceroute -U 8.8.8.8    # UDP
traceroute -I 8.8.8.8    # ICMP
traceroute -T 8.8.8.8    # TCP
```

### DNS Resolution Commands

#### nslookup
```bash
# Basic DNS lookup
nslookup google.com

# Specify DNS server
nslookup google.com 8.8.8.8

# Reverse DNS lookup
nslookup 8.8.8.8
```

#### dig Command
```bash
# DNS query
dig google.com

# Specific record types
dig google.com MX      # Mail exchange
dig google.com AAAA    # IPv6 address

# Trace DNS resolution
dig +trace google.com
```

### Network Statistics and Monitoring

#### ss Command (Modern netstat)
```bash
# Show all sockets
ss -tuln              # TCP/UDP listening

# Show established connections
ss -tun state established

# Show process information
ss -tulnp
```

#### Network Interface Statistics
```bash
# Interface statistics
cat /proc/net/dev

# Detailed interface info
ethtool eth0

# Network namespace info
ip netns list
```

### Firewall and NAT Commands

#### iptables
```bash
# List rules
iptables -L -n -v

# NAT table
iptables -t nat -L

# Add simple rule
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
```

### DHCP Client Commands

#### dhclient
```bash
# Request new IP
dhclient eth0

# Release current lease
dhclient -r eth0

# Show lease information
cat /var/lib/dhcp/dhclient.leases
```

### Advanced Network Analysis

#### tcpdump
```bash
# Capture packets
tcpdump -i eth0

# Capture specific traffic
tcpdump -i any host 192.168.1.5
tcpdump -i any port 80

# Save to file
tcpdump -i eth0 -w capture.pcap
```

#### netcat (nc)
```bash
# Port scanning
nc -zv 192.168.1.1 80

# Simple server
nc -l 8080

# Transfer files
nc -l 8080 < file.txt    # Sender
nc 192.168.1.5 8080 > file.txt  # Receiver
```

### Network Namespace Commands

#### ip netns
```bash
# Create namespace
ip netns add test-ns

# Execute command in namespace
ip netns exec test-ns ip addr show

# Move interface to namespace
ip link set eth1 netns test-ns
```
