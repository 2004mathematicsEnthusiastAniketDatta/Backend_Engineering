# Web Real Time Communication
- Stands for Web Real-Time Communication
- Find a peer to peer path to exchange video and audio in efficient and low latency manner.
- Standardized API
- Enables rich Communication browsers , mobile ,IOT devices
- At a low level, WebRTC is a collection of protocols and APIs that enable direct, real-time communication between devices over the internet. It uses technologies like ICE (Interactive Connectivity Establishment) for NAT traversal, STUN/TURN servers for network discovery and relay, and SRTP (Secure Real-time Transport Protocol) for secure media transport. WebRTC handles signaling, media encoding/decoding, packet loss recovery, and encryption to ensure efficient and secure peer-to-peer data, audio, and video transmission without requiring plugins.
# Overview:
- A wants to connect to B
- A finds out all the possible ways the public can connect to this.
- B finds out all the possible ways the public can connect to this.
- A and B signal this session information via other means:-
 -  WhatsApp , QR , Tweet , WebSockets , HTTP Fetch, XHR ..
- A connects to B via the most optimal path
- A and B also exchange their supported media Security

# Network Address Translation
Network Address Translation (NAT) is a networking technique that allows devices on a private network to communicate with devices on external networks (like the internet) by translating their private IP addresses to public IP addresses.

## How NAT Works
- **Private Network**: Devices use private IP ranges (192.168.x.x, 10.x.x.x, 172.16.x.x)
- **Translation**: Router/NAT device maps private IPs to router's public IP
- **Port Mapping**: Uses different ports to distinguish between internal devices
- **State Tracking**: Maintains connection state tables for bidirectional communication

## Types of NAT
1. **Full Cone NAT**: Most permissive - external hosts can send data to mapped port
2. **Restricted Cone NAT**: External host must have received data from internal host first
3. **Port Restricted Cone NAT**: External host must match both IP and port of previous communication
4. **Symmetric NAT**: Most restrictive - different mapping for each external destination

## NAT Challenges for WebRTC
- **Peer Discovery**: Devices behind NAT can't directly find each other
- **Connection Establishment**: Direct P2P connections are blocked
- **Port Prediction**: Difficult to predict which ports will be opened
- **Firewall Traversal**: Additional security layers complicate connections

## Solutions
- **STUN Servers**: Help discover public IP and NAT type
- **TURN Servers**: Relay traffic when direct connection fails  
- **ICE Protocol**: Systematically tries different connection methods
- **Port Forwarding**: Manual configuration for specific applications
## NAT translation Methods:
1. **One to One NAT (Full-cone NAT)**: 
- Packets to external IP: port on the router always maps to internal IP: port without exceptions
- Most liberal type of NAT
- Creates a static mapping between internal and external addresses
- Once mapping is established, any external host can send packets to the mapped port
- Example: Internal 192.168.1.100:5000 always maps to Public 203.0.113.1:8080

2. **Address Restricted NAT (Restricted Cone NAT)**:
- Internal host can send packets to any external address
- External host can only send packets back if internal host sent packets to that specific IP first
- Port numbers don't matter - only IP addresses are restricted
- More secure than Full Cone but less restrictive than port-based filtering
- Packets to external IP: port on the router always maps to internal IP: port as long as source source address from the packet matches the table (regardless of port) Matches the Destination address in the NAT table
- Allow if we communicated with the host before.
3. **Port Restricted NAT (Port Restricted Cone NAT)**:
- Stricter version of Address Restricted NAT
- External host must match both the exact IP address AND port number
- Internal host must have previously sent packets to that specific IP:port combination
- Provides better security by filtering both address and port
- Packets to external IP : port on the router always maps to internal IP: port as long as source address and port from packet matches the table
- Allow if we communicated with the host:port before
4. **Symmetric NAT**:
- Most restrictive and complex type
- Creates different mappings for each unique external destination
- Internal 192.168.1.100:5000 might map to Public 203.0.113.1:8080 for one destination and 203.0.113.1:8081 for another
- Makes WebRTC connections very difficult as port prediction becomes nearly impossible
- Often requires TURN servers for successful peer connections
- Packets to external IP: port on the router always maps to internal IP: port as long as source address and port from packet matches the table
- Only Allow if the full pair External IP , External port , Destination IP, Destination Port match.
# Session Traversal Utilities for  Network Address Translation:
- Session Traversal Utilities for Network Address Translation is a server - STUN server
- Tell me my public IP address / port through NAT
- Works for Full-Cone , Port / Address restricted NAT 
- Doesn't work for symmetric NAT 
- Session Traversal Utilities for  Network Address Translation server Port 3478, 5349 for TLS
- cheap to maintain
## STUN request:
A STUN request is a message sent by a client to a STUN server to discover its public IP address and port as seen through NAT.

## STUN Request Process
1. **Client Binding Request**: Client sends a STUN Binding Request to STUN server
2. **NAT Translation**: Router/NAT translates client's private IP:port to public IP:port
3. **Server Response**: STUN server receives request and sees the translated public address
4. **Response Message**: Server sends back a STUN Binding Response containing the public IP:port
5. **NAT Type Detection**: Multiple requests help determine NAT behavior and type

## STUN Message Structure
- **Message Type**: Binding Request (0x0001)
- **Message Length**: Size of message body
- **Transaction ID**: Unique identifier for request/response matching
- **Attributes**: Optional data like SOFTWARE, FINGERPRINT

## Common STUN Request Flow
```
Client (192.168.1.100:5000) → NAT → STUN Server
                                ↓
Client ← NAT ← Response (Your public IP: 203.0.113.1:8080)
```

## Limitations
- Cannot traverse Symmetric NAT reliably
- Requires accessible STUN server
- Only provides discovery, not guaranteed connectivity
- May fail with strict firewalls

# Traversal Using Relays around NAT (TURN):
- In case of Symmetric NAT we require TURN
- This is just a server that relays packets
- Traversal Using Relays around NAT (TURN) default server port 3478, 5349 for TLS
- Expensive to maintain and run

# Interactive Connectivity Establishment:
- Internet Connectivity Establishment is a protocol that finds out all the possible ways the public can connect to this
- Interactive Connectivity Establishment  collects all available candidates: local IP addresses , reflexive addresses - STUN ones and relayed addresses - TURN ones known as Interactive Connectivity Establishment candidates
- All the collected addresses are then sent to the remote peer via Session Description Protocol.

# Session Description Protocol:
- A format that describes the Interactive Connective Establishment -> ICE , networking options , media options , security options and other stuff and is not a 
protocol.
- Not really a protocol , this is a format.
- Most important concept is WebRTC 
- The goal is to take the SDP i.e, Session Description Protocol generated by a user and send this "somehow" to the other party.

## SDP Example: 
```
v=0
o=- 4611731400430051336 2 IN IP4 127.0.0.1
s=-
t=0 0
a=group:BUNDLE 0 1
a=extmap-allow-mixed
a=msid-semantic: WMS

m=audio 9 UDP/TLS/RTP/SAVPF 111 103 104 9 0 8 106 105 13 110 112 113 126
c=IN IP4 0.0.0.0
a=rtcp:9 IN IP4 0.0.0.0
a=ice-ufrag:4ZcD
a=ice-pwd:2/1muCWoOi3uNCy+G/UUBhgx
a=ice-options:trickle
a=fingerprint:sha-256 75:74:5A:A6:A4:E5:52:F4:A7:67:4C:01:C7:EE:91:3F:21:3D:A2:E3:53:7B:6F:30:86:F2:30:FF:A6:22:D2:04
a=setup:actpass
a=mid:0
a=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level
a=sendrecv
a=msid:- {audio-track-id}
a=rtcp-mux
a=rtpmap:111 opus/48000/2

m=video 9 UDP/TLS/RTP/SAVPF 96 97 98 99 100 101 102 121 127 120 125 107 108 109 124 119 123
c=IN IP4 0.0.0.0
a=rtcp:9 IN IP4 0.0.0.0
a=ice-ufrag:4ZcD
a=ice-pwd:2/1muCWoOi3uNCy+G/UUBhgx
a=ice-options:trickle
a=fingerprint:sha-256 75:74:5A:A6:A4:E5:52:F4:A7:67:4C:01:C7:EE:91:3F:21:3D:A2:E3:53:7B:6F:30:86:F2:30:FF:A6:22:D2:04
a=setup:actpass
a=mid:1
a=extmap:14 urn:ietf:params:rtp-hdrext:toffset
a=sendrecv
a=msid:- {video-track-id}
a=rtcp-mux
a=rtpmap:96 VP8/90000
a=rtcp-fb:96 goog-remb
a=rtcp-fb:96 transport-cc
a=rtcp-fb:96 ccm fir
a=rtcp-fb:96 nack
a=rtcp-fb:96 nack pli
```

## Signaling:
1. SDP signaling
2. Send the SDP that we just generated somehow to the other party we wish to communicate with 
3. Signalling can be done via WebSockets , QR code , Whatsapp , HTTP requests -> just we have to get the large SDP string to the other party

# What's Happening?
1. A wants to connect to B
2. A creates an "offer", this finds all ICE candidates , security options , audio/video options and generates SDP , the offer is basically the SDP
3. A signals the offer somehow to B (whatsapp)
4. B creates the "answer" after setting A's offer
5. B signals the "answer" to A
6. Connection is created

# Local SDP and Remote SDP

## Local SDP (Session Description Protocol)
Local SDP is the session description generated by the local peer (your device/application) that describes:
- **Media Capabilities**: What audio/video codecs the local peer supports
- **Network Information**: ICE candidates (local IP addresses, STUN reflexive addresses, TURN relay addresses)
- **Security Parameters**: Encryption keys, fingerprints for DTLS
- **Transport Details**: Protocols, ports, and connection methods

### Local SDP Creation Process:
1. **Media Enumeration**: Gather available audio/video devices and supported codecs
2. **ICE Gathering**: Collect all possible network addresses (host, reflexive, relay candidates)
3. **Security Setup**: Generate encryption keys and certificates
4. **SDP Generation**: Format all information into standard SDP structure

### Local SDP Example Structure:
```sdp
v=0
o=- 123456789 1 IN IP4 192.168.1.100
s=-
m=video 9 UDP/TLS/RTP/SAVPF 96 97
a=ice-ufrag:localUser123
a=ice-pwd:localPassword456
a=fingerprint:sha-256 AA:BB:CC:DD...
a=rtpmap:96 VP8/90000
```

## Remote SDP (Session Description Protocol)
Remote SDP is the session description received from the remote peer that describes:
- **Remote Media Capabilities**: What the other peer can send/receive
- **Remote Network Information**: How to reach the remote peer
- **Negotiated Parameters**: Agreed-upon codecs, security settings
- **Connection Instructions**: Ports, protocols, and addressing information

### Remote SDP Processing:
1. **Validation**: Ensure SDP format is correct and compatible
2. **Codec Negotiation**: Match supported codecs between local and remote
3. **ICE Processing**: Extract remote ICE candidates for connectivity checks
4. **Security Validation**: Verify certificates and encryption parameters

## SDP Exchange Flow in WebRTC:

### Offer/Answer Model:
1. **Caller Creates Offer (Local SDP)**:
    ```javascript
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    // Send offer.sdp to remote peer via signaling
    ```

2. **Callee Receives Offer (Remote SDP)**:
    ```javascript
    await peerConnection.setRemoteDescription(receivedOffer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    // Send answer.sdp back to caller via signaling
    ```

3. **Caller Receives Answer (Remote SDP)**:
    ```javascript
    await peerConnection.setRemoteDescription(receivedAnswer);
    // Connection establishment begins
    ```

## Key Differences:

| Aspect | Local SDP | Remote SDP |
|--------|-----------|------------|
| **Origin** | Generated by your device | Received from peer |
| **Purpose** | Describes your capabilities | Describes peer's capabilities |
| **Content** | Your ICE candidates, codecs | Peer's ICE candidates, codecs |
| **Usage** | Set with `setLocalDescription()` | Set with `setRemoteDescription()` |
| **Timing** | Created during offer/answer | Received via signaling |

## SDP Negotiation Process:
1. **Capability Advertisement**: Each peer lists what it can support
2. **Intersection Finding**: Find common supported features
3. **Parameter Agreement**: Agree on specific codecs, bitrates, etc.
4. **Connection Establishment**: Use negotiated parameters for media flow

## Important Notes:
- **Order Matters**: Must set local description before sending SDP
- **State Management**: WebRTC tracks signaling state through SDP exchange
- **ICE Candidates**: Can be exchanged separately via ICE trickling
- **Renegotiation**: Can create new offers to change session parameters
- **Compatibility**: Both peers must understand the SDP format for successful connection

# WebRTC Demo
- We will connect two browsers (Browser A and Browser B)
- A will create an offer: sdp and set this as local description
- B will get the offer and set this as remote description
- B creates an answer sets this as local description of B and signal the answer (sdp) to a
- A sets the answer as this is the remote description
- Connection established , exchanged data channel.
 
