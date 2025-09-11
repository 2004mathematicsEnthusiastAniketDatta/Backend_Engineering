# Apache Kafka

Apache Kafka is an open-source distributed event streaming platform used by thousands of companies for high-performance data pipelines, streaming analytics, data integration, and mission-critical applications. 

<img src='/home/aniketdatta/Backend_Engineering/MERN/CoreBackend/ApacheKafka/kafkaneed.png'/>


# Why Kafka?
## Database Throughput Challenges - Real-World Examples

## Core Concept: Database Throughput Bottlenecks

**Database Throughput** = Operations per second (combination of reads and writes) that a database can handle efficiently.

**Problem**: When applications generate operations faster than the database can process them, the system becomes overwhelmed and may crash.

---

## Example 1: Zomato/Food Delivery - Location Tracking System

### System Flow:
1. **Data Collection**: Delivery partners' locations are continuously fetched from GPS/mobile devices
2. **Server Processing**: Zomato servers receive location updates from thousands of delivery partners across the city
3. **Database Operations**: Each location update requires an INSERT operation in the database
4. **Read Replica**: A read-only database replica is maintained for serving customer applications
5. **Customer Experience**: Customers see real-time delivery partner locations in their apps

### Throughput Challenge:
- **High Volume**: Thousands of delivery partners updating locations every few seconds
- **Continuous INSERTs**: Each location update = one database INSERT operation
- **Scaling Issue**: As the number of delivery partners increases, INSERT operations per second grow exponentially
- **Performance Impact**: Database becomes overwhelmed with write operations, leading to:
  - Slower response times
  - Potential system crashes
  - Delayed location updates for customers

### Additional Complexity:
- **Analytics Processing**: Location data is also used for route optimization, delivery time estimation, and business analytics
- **Multiple Operations**: Each location update may trigger additional database operations for analytics and reporting

---

## Example 2: Discord - Real-Time Messaging System

### System Architecture:
1. **Large Groups**: Discord servers can have 60,000+ members
2. **WebSocket Connections**: Real-time messaging through persistent connections
3. **Message Broadcasting**: When one user sends a message, it's distributed to all active members
4. **Database Storage**: All messages are stored in the database for history and persistence

### Throughput Challenge Scenario:
- **Initial Message**: User A sends "Hi" through WebSocket
- **Broadcasting**: Server emits this message to all 60,000 active users
- **Response Flood**: Multiple users reply simultaneously with messages like "Hello"
- **Database Overload**: Each message requires:
  - INSERT operation to store the message
  - Potentially UPDATE operations for user activity tracking
  - READ operations to fetch user permissions and channel data

### Scaling Problems:
- **No Rate Limiting**: Without proper controls, users can send messages rapidly
- **Cascading Effect**: One popular message can trigger thousands of responses
- **Database Saturation**: Write operations can overwhelm the database capacity

---

## Example 3: Ola/Uber - Ride-Sharing Platform

### High-Volume Operations:
1. **Real-Time Tracking**: Continuous location updates from active drivers
2. **Ride Requests**: Customer booking requests and driver assignments
3. **Fare Calculations**: Dynamic pricing based on demand, distance, and time
4. **Analytics Processing**: Business intelligence operations on ride patterns, user behavior, and revenue

### Database Intensity:
- **Driver Locations**: Similar to Zomato, but with additional ride status updates
- **Customer Data**: Profile updates, payment processing, ride history
- **Fare Analytics**: Complex calculations requiring multiple database operations
- **Reporting**: Historical data analysis for business insights

### Throughput Challenges:
- **Multi-Table Operations**: Each ride involves updates across multiple database tables:
  - User profiles
  - Driver profiles  
  - Ride records
  - Payment transactions
  - Location history
- **Peak Hour Load**: During busy times, operations per second can exceed database capacity
- **Real-Time Requirements**: Delays in database operations directly impact user experience

---

## Common Solutions to Address These Challenges:

### 1. Database Optimization:
- **Read Replicas**: Separate read and write databases
- **Sharding**: Distribute data across multiple database instances
- **Caching**: Use Redis/Memcached to reduce database queries

### 2. Rate Limiting:
- **API Rate Limits**: Control how frequently clients can make requests
- **User Cooldowns**: Prevent message/action flooding
- **Queue Management**: Buffer high-volume operations

### 3. Asynchronous Processing:
- **Message Queues**: Process non-critical operations asynchronously
- **Batch Operations**: Group multiple updates into single database transactions
- **Background Jobs**: Handle analytics and reporting separately from real-time operations

### 4. Infrastructure Scaling:
- **Horizontal Scaling**: Add more database servers
- **Load Balancing**: Distribute traffic across multiple instances
- **CDN Integration**: Cache static content and reduce server load

## Kafka has High Throughput
<img src='/home/aniketdatta/Backend_Engineering/MERN/CoreBackend/ApacheKafka/lowthrougputofdb.png'/>

## Key Differences: Kafka vs Database

### 1. Kafka Characteristics:
- **High Throughput**: Designed to handle millions of events per second
- **Low Storage**: Optimized for temporary data retention (typically days to weeks)
- **Limited Retention**: Cannot keep data for extended periods due to storage constraints
- **Stream Processing**: Built for real-time data flow rather than persistent storage

### 2. Database Characteristics:
- **High Storage**: Designed for long-term data persistence and large storage capacity
- **Low Throughput**: Limited by complex data structures and ACID compliance requirements
- **Query Optimization**: Uses advanced data structures for efficient data retrieval:
    - **B+ Trees**: Balanced tree structures for fast range queries and sorting
    - **B- Trees**: Self-balancing tree data structures for efficient searches
    - **Database Indexing**: Creates additional data structures to speed up query performance
- **Persistent Storage**: Built to maintain data integrity over long periods

### 3. Complementary Architecture:
Kafka and databases work together - Kafka handles high-volume, real-time data streams while databases provide reliable, long-term storage with complex querying capabilities.  

<img src='MERN/CoreBackend/ApacheKafka/KafkaGeneralWorkFlow.png'/> 

## Kafka Overview:

<img src='MERN/CoreBackend/ApacheKafka/kafkaservice.png'/> 

### 1. Kafka Topic:
 <img src='MERN/CoreBackend/ApacheKafka/KafkaTopic.png'/> 


### 2. AutoBalancing even number of Consumer Nodes:    
 <img src='MERN/CoreBackend/ApacheKafka/AutobalancingconsumerNodesEven.png'/> 
<img src='MERN/CoreBackend/ApacheKafka/Autobalancingoddnumberofconsumers.png'>
 


