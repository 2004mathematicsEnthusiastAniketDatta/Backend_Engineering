# Real Time Communication

1. Chat Application.

2. Real-Time Dashboard.


3. Trading- Stocks, Team ,Sports.

# Polling 
Polling is a technique where a client repeatedly sends requests to a server at regular intervals to check for updates or new data. The server responds immediately, either with new data if available or with an indication that no new data exists.A technique where a client repeatedly requests information from a server at regular intervals to check for updates.
A polling backend is a method used in software systems and networking to regularly check for updates or changes in the state of a resource or service. This is commonly used in server-side (application layer) of various applications, especially in real-time data processing, user interfaces, and asynchronous programming.What is Backend Polling?
...
A polling backend is a method used in software systems and networking to regularly check for updates or changes in the state of a resource or service. This is commonly used in server-side (application layer) of various applications, especially in real-time data processing, user interfaces, and asynchronous programming.

## Key components and functionalities of a polling backend:

#### Polling Mechanism:

1. The system sends regular requests to a server or a resource to check if there are any updates or new data available.

2. The interval between these requests can be fixed or adaptive, depending on the requirements of the application.

#### Applications:

1. **User Interfaces** To refresh data displayed to users, such as new messages in a chat application, without requiring the user to manually refresh the page.

2. **Monitoring Systems** To track changes in system metrics or performance indicators.

3. **IoT Devices Control** To gather data from sensors or devices at regular intervals.

#### Polling Strategies:

**Short Polling Requests**: are sent at regular, short intervals. This can lead to high resource usage if the intervals are too short.

**Long Polling**: The server holds the request open until new data is available or a timeout occurs. This reduces the number of requests but can tie up server resources.

**Adaptive Polling** The interval between requests changes based on the activity level or the rate of data changes.

Challenges:

1. Latency: There is always a delay between when the data changes and when the polling request detects the change.

2. Resource Usage : Frequent polling can lead to high resource consumption on both the client and server sides.

3. Scalability : As the number of clients increases, the load on the server also increases, potentially leading to performance issues.

Alternatives:

1. WebSockets Provides a full-duplex communication channel over a single, long-lived connection, allowing for real-time updates without the need for polling.

2. Server-Sent Events (SSE): A server-side technology that pushes updates to the client over a single HTTP connection.The SSE is lightweight and proxies works on Server Sent Events.Here server is the control.

3. Push Notifications: Used in mobile and web applications to deliver updates directly to the user without relying on continuous polling.
## 1. Long Polling : 
Client asks the server by sending requests to a server at regular intervals to check for updates or new data. Client and server communicates with eache other ,maybe in some three way communication fashion. Here REST is implemented. Along with REST implementation the focus should also be on client-server technologies. Works evertwhere. We have high latency and there is wastage.

##  2. Web Sockets:
WebSockets provide a full-duplex communication channel over a single, long-lived TCP connection. Unlike traditional HTTP request-response cycles, WebSockets allow both the client and the server to send messages to each other independently at any time after an initial handshake.

### Key Characteristics:

1.  **Persistent Connection**: After an initial HTTP-based handshake, the connection is upgraded from HTTP to the WebSocket protocol (ws:// or wss:// for secure connections). This connection remains open, allowing for continuous data exchange.
2.  **Full-Duplex Communication**: Both the client and server can send data simultaneously without waiting for the other party. This enables true real-time interaction.
3.  **Low Latency**: By eliminating the overhead of establishing new connections for each message (as in short polling) or holding connections open unnecessarily (as in long polling), WebSockets significantly reduce latency.
4.  **Efficiency**: Reduces network traffic and server load compared to polling techniques, as headers are sent only once during the initial handshake. Subsequent messages have minimal framing overhead.

### Handshake Process:

1.  The client initiates the connection with an HTTP GET request that includes specific headers like `Upgrade: websocket` and `Connection: Upgrade`.
2.  If the server supports WebSockets and agrees to upgrade, it responds with an HTTP 101 Switching Protocols status code, along with corresponding `Upgrade` and `Connection` headers.
3.  Once the handshake is complete, the TCP connection transitions to the WebSocket protocol, and bidirectional communication can begin.

### Use Cases:

1.  **Real-Time Applications**: Chat applications, live sports updates, collaborative editing tools, multiplayer online games.
2.  **Financial Data Streaming**: Real-time stock tickers, trading platforms.
3.  **Monitoring Dashboards**: Live updates of system metrics or application performance.
4.  **IoT**: Communication between servers and connected devices.

### Advantages:

*   **Real-Time Interaction**: Enables immediate data transfer in both directions.
*   **Reduced Latency**: Significantly faster than polling methods.
*   **Lower Overhead**: Less network traffic and server resource consumption after the initial connection.
*   **Scalability**: Can handle a large number of concurrent connections efficiently.

### Challenges:

*   **Stateful Connections**: Servers need to maintain the state for each open WebSocket connection, which can consume memory.
*   **Proxy/Firewall Traversal**: Some older proxies or misconfigured firewalls might not support WebSocket connections or might interfere with them. Secure WebSockets (WSS) over port 443 often mitigate this.
*   **Complexity**: Implementing and managing WebSocket connections can be more complex than simple HTTP requests. Libraries and frameworks (like Socket.IO, ws) often abstract this complexity.

### Comparison:

*   **vs. Polling**: WebSockets are significantly more efficient and provide lower latency for real-time updates.
*   **vs. Long Polling**: Avoids the overhead of repeatedly establishing connections and reduces latency.
*   **vs. Server-Sent Events (SSE)**: SSE is unidirectional (server-to-client only), whereas WebSockets are bidirectional. WebSockets are generally preferred when client-to-server communication is also required in real-time.

 2. Web Sockets are bidirectional and scalable with brokers : Kafka , Redis
