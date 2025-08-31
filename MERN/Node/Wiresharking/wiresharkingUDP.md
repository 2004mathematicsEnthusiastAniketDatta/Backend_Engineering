# Wiresharking UDP Traffic

## Overview
Wireshark is a powerful network protocol analyzer that can capture and analyze UDP (User Datagram Protocol) traffic in real-time.

## Capturing UDP Traffic

### Basic UDP Filter
```
udp
```

### Filter by Port
```
udp.port == 53
udp.srcport == 8080
udp.dstport == 443
```

### Filter by IP Address
```
udp and ip.addr == 192.168.1.100
udp and ip.src == 10.0.0.1
```

## UDP Packet Structure Analysis

### Key Fields to Monitor
- **Source Port**: Origin port number
- **Destination Port**: Target port number
- **Length**: UDP header + data length
- **Checksum**: Error detection mechanism
- **Data**: Actual payload

## Common UDP Applications
- DNS queries (port 53)
- DHCP (ports 67/68)
- SNMP (port 161)
- Streaming media (RTP)
- Gaming protocols

## Analysis Tips

### Performance Monitoring
- Check for packet loss
- Monitor response times
- Identify network congestion
- Analyze traffic patterns

### Troubleshooting
- Verify port accessibility
- Check packet fragmentation
- Monitor error rates
- Validate checksums

## Useful Wireshark Features
- Follow UDP Stream
- Statistics > Protocol Hierarchy
- IO Graphs for traffic visualization
- Expert Information for anomalies


## Deep Dive: UDP Packet Analysis at Binary Level

### UDP Header Structure (8 bytes)
```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|          Source Port          |       Destination Port        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|            Length             |           Checksum            |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                          Data octets ...
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

### Advanced Wireshark Filters for UDP Deep Analysis

#### Checksum Validation
```
udp.checksum_status == "Bad"
udp.checksum.status == 2
```

#### Fragment Analysis
```
udp and ip.frag_offset > 0
udp and ip.flags.mf == 1
```

#### Zero-Length UDP Packets
```
udp.length == 8
```

#### UDP Payload Size Analysis
```
udp.length > 1472
frame.len > 1518
```

### Binary-Level Packet Inspection

#### Hexadecimal Analysis Techniques
- **Byte Order**: Network byte order (big-endian)
- **Port Representation**: 16-bit unsigned integers
- **Length Calculation**: Header + payload (minimum 8 bytes)
- **Checksum Algorithm**: One's complement of 16-bit words

#### Manual Checksum Verification
```bash
# Pseudo-header construction for checksum:
# Source IP (4 bytes) + Dest IP (4 bytes) + 
# Protocol (1 byte, 0x11 for UDP) + UDP Length (2 bytes)
```

### Performance Metrics and Timing Analysis

#### Inter-Packet Timing
```
udp and frame.time_delta > 0.1
```

#### Burst Detection
```
udp and frame.time_delta < 0.001
```

#### Jitter Analysis (for RTP/media streams)
```
rtp.timestamp
```

### Socket Buffer Analysis

#### Buffer Overflow Detection
- Monitor `udp.length` vs actual frame size
- Check for truncated packets
- Analyze kernel buffer statistics

#### Memory Allocation Patterns
- Track socket creation/destruction
- Monitor buffer pool usage
- Analyze memory fragmentation

### Network Stack Deep Dive

#### Kernel-Level Processing
- **sk_buff** structure analysis
- **netfilter** hook points
- **iptables** rule interactions

#### Hardware Offloading
- **UDP checksum offload** detection
- **Large Send Offload (LSO)** for UDP
- **Receive Side Scaling (RSS)** impact

### Advanced Troubleshooting Scenarios

#### Packet Duplication Detection
```
udp and frame.number in {duplicate_frames}
```

#### Out-of-Order Analysis
```
udp and tcp.analysis.out_of_order
```

#### MTU Discovery Issues
```
icmp.type == 3 and icmp.code == 4
```

### Protocol-Specific Deep Analysis

#### DNS over UDP (DoU)
```
dns and udp.port == 53
dns.flags.response == 0
dns.qry.type == 1
```

#### DHCP Transaction Analysis
```
bootp.option.dhcp_message_type == 1
bootp.transaction_id
```

#### RTP Stream Analysis
```
rtp.seq
rtp.timestamp
rtp.ssrc
```

### Statistical Analysis Functions

#### Custom Lua Scripts for Deep Analysis
```lua
-- Example: UDP port entropy analysis
local udp_ports = {}
function tap.packet(pinfo, tvb)
    if pinfo.src_port then
        udp_ports[pinfo.src_port] = (udp_ports[pinfo.src_port] or 0) + 1
    end
end
```

#### Python Integration for Advanced Analytics
```python
# PyShark for programmatic analysis
import pyshark
cap = pyshark.LiveCapture(interface='eth0', bpf_filter='udp')
```

### Security Analysis Vectors

#### Amplification Attack Detection
```
udp.length > 1000 and dns
udp and frame.len > 1400
```

#### Covert Channel Analysis
- **Timing channels** in packet intervals
- **Size channels** in payload variations
- **Sequence channels** in port usage patterns

#### Traffic Fingerprinting
- **Packet size distributions**
- **Inter-arrival time patterns**
- **Port usage sequences**

### Hardware-Level Considerations

#### Network Interface Card (NIC) Behavior
- **Interrupt coalescing** effects on timestamps
- **Ring buffer** overflow indicators
- **Hardware timestamping** accuracy

#### CPU Cache Effects
- **Cache line alignment** of packet data
- **NUMA topology** impact on processing
- **CPU affinity** for packet processing threads

