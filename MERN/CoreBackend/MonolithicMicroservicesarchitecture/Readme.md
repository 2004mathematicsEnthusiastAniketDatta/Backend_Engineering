# Horizontal Scaling in Monolithic Servers
In a monolithic server, all application logic—authentication, business logic, data access, and more—resides within a single codebase and is typically deployed as a single process.

**Horizontal scaling** in this context means running multiple instances of the same monolithic application behind a load balancer. This approach can handle increased traffic by distributing requests across these instances.

However, this model has significant drawbacks:

- **Single Point of Failure:** If a critical bug arises in a core module (e.g., authentication), it can crash the entire application. Since every instance runs the same code, the bug propagates across all horizontally scaled instances, leading to widespread outages.
- **Resource Contention:** All features compete for the same resources (CPU, memory), making it difficult to optimize or isolate performance bottlenecks.
- **Deployment Complexity:** Even a small change in one module requires redeploying the entire application, increasing risk and downtime.

## The Need for Microservices Architecture

To address these limitations, organizations transition to a **microservices architecture**. Here, the application is decomposed into small, independent services, each responsible for a specific business capability (e.g., authentication, user management, payments).

### Key Benefits

- **Fault Isolation:** If a bug occurs in the authentication service, only that service is affected. The rest of the application continues to function, improving overall resilience.
- **Independent Scaling:** Each microservice can be scaled horizontally based on its own load. For example, if authentication is heavily used, only that service needs more instances.
- **Autonomous Deployments:** Teams can deploy, update, or roll back individual services without impacting the entire system.
- **Technology Diversity:** Each service can use the most appropriate technology stack for its requirements.

### Scaling in Microservices

Scaling in microservices is granular and targeted. Services experiencing high demand can be scaled independently, optimizing resource usage and cost. Load balancers and service discovery mechanisms route requests to healthy instances, ensuring high availability.

## Illustration

### Monolithic Architecture

```
+-------------------------------+
|         Load Balancer         |
+-------------------------------+
            |
+-------------------------------+
|      Monolithic Server        |
|  [Auth | User | Payment | ...]|
+-------------------------------+
            |
        Database
```
- All modules are tightly coupled.
- A bug in any module (e.g., Auth) can crash the entire server.

### Microservices Architecture

```
+-------------------------------+
|         Load Balancer         |
+-------------------------------+
      |        |         |
+---------+ +---------+ +---------+
|  Auth   | |  User   | | Payment |
| Service | | Service | | Service |
+---------+ +---------+ +---------+
      |        |         |
   DB/Auth   DB/User   DB/Payment
```
- Each service is independent.
- A bug in Auth Service only affects authentication, not the entire system.
- Each service can be scaled and deployed independently.

---

**In summary:**  
Monolithic architectures struggle with horizontal scaling due to tight coupling and shared failure domains. Microservices architectures provide modularity, fault isolation, and targeted scaling, making them the preferred choice for building resilient, scalable systems at scale.


## UPI Payments:

### Google Pay System Design

Google Pay is a digital wallet and payment platform that enables users to make payments using their mobile devices. Here's a high-level system design:

#### Core Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │   Web Client    │    │  Merchant App   │
│   (Android/iOS) │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌─────────────────────────────────────────────────┐
         │              API Gateway                        │
         │         (Authentication & Routing)              │
         └─────────────────────────────────────────────────┘
                                 │
    ┌────────────────────────────┼────────────────────────────┐
    │                            │                            │
┌───▼───┐  ┌────────▼────────┐  ┌▼──────────┐  ┌─────────▼─────────┐
│ User  │  │   Payment       │  │ Merchant  │  │   Notification    │
│Service│  │   Service       │  │ Service   │  │   Service         │
└───────┘  └─────────────────┘  └───────────┘  └───────────────────┘
    │              │                   │                   │
┌───▼───┐  ┌───────▼────────┐  ┌───────▼───┐  ┌─────────▼─────────┐
│ User  │  │   Transaction   │  │ Merchant  │  │   Message Queue   │
│  DB   │  │      DB        │  │    DB     │  │   (Kafka/RabbitMQ)│
└───────┘  └────────────────┘  └───────────┘  └───────────────────┘
                    │
         ┌──────────▼──────────┐
         │   External Payment  │
         │   Processors        │
         │ (Banks, Card Networks,│
         │  UPI, etc.)         │
         └─────────────────────┘
```

#### Key Microservices

**1. User Service**
- User registration and authentication
- Profile management
- KYC verification
- Security settings (PIN, biometrics)

**2. Payment Service**
- Payment method management (cards, bank accounts, UPI)
- Payment processing and orchestration
- Fraud detection and risk assessment
- Currency conversion

**3. Transaction Service**
- Transaction history and tracking
- Real-time transaction status
- Settlement and reconciliation
- Dispute management

**4. Merchant Service**
- Merchant onboarding and verification
- QR code generation
- Transaction analytics for merchants
- Settlement reporting

**5. Notification Service**
- Push notifications
- SMS/Email alerts
- Transaction confirmations
- Security alerts

#### Security & Compliance

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Layer                           │
├─────────────────────────────────────────────────────────────┤
│ • Multi-factor Authentication                               │
│ • End-to-end Encryption                                     │
│ • Tokenization of Payment Data                              │
│ • Fraud Detection ML Models                                 │
│ • PCI DSS Compliance                                        │
│ • Rate Limiting & DDoS Protection                           │
└─────────────────────────────────────────────────────────────┘
```

#### Data Flow (Payment Transaction)

1. **Initiation**: User initiates payment via app/web
2. **Authentication**: Multi-factor authentication verification
3. **Authorization**: Payment service validates transaction
4. **Processing**: Route to appropriate payment processor
5. **Settlement**: Funds transfer between accounts
6. **Notification**: Real-time status updates to user/merchant
7. **Recording**: Transaction logged for audit and analytics

#### Scalability Features

- **Horizontal scaling** of individual services based on load
- **Database sharding** for user and transaction data
- **CDN** for static content and app distribution
- **Caching layer** (Redis) for frequently accessed data
- **Load balancers** at multiple tiers
- **Auto-scaling** based on traffic patterns

This microservices architecture ensures high availability, security, and scalability while maintaining compliance with financial regulations.

##  Microservices sharing a Database:
One of the Simplest ways to integrate a couple of Microservices is to let them share a database.
e.g.: Blogs service stores the published blog. In blogs DB , while the analytics service also updates the total views of a blog joins the same Database.
This is the simplest approach to integrate microservices . Anyone who wants to read or change anything can just read or update the database directly.
<img src='/home/aniketdatta/Backend_Engineering/MERN/CoreBackend/MonolithicMicroservicesarchitecture/SharingDBwithServices.png'/>
  {
    "id": "sharing-a-db",
    "title": "_______________________________________",
    "totalviews": 1729
  }

### Advantages of this approach: 
 - Simplest Way of Integration
 - no middleman needed
 - no latency needed
 - no latency overhead
 - quick development time
 - Simpler Operation
 - Better performance-No middle Man

### Disadvantages :
##### Challenges 1: External Parties are getting internal details:

 By sharing a database an external party , analytics , gets the internal schema and other information details of blog service.


 - what's the schema
 - design decisions
     - soft delete vs hard deletes
     - normalization 
     - redundancy
* Given that an external service has access to the database. 
- What if the blogs  service thinks of changing the schema ?
- better performance 

- better maintainability
- The analytics service would need to change the logic accordingly or the changes made by the blogs service should always be backward compatible.

- What if the  Blogs service wants to move from relational to non-relational?
 - Bacause of this tight coupling , Blogs Service cannot take an independent call.
 - So autonomy of blogs team on their service is gone.
 - So we now have tight coupling
 ##### Sharing DB = Sharing Business Logic 

 <img src='/home/aniketdatta/Backend_Engineering/MERN/CoreBackend/MonolithicMicroservicesarchitecture/SharingDBandSharingLogic.png'/>
 
 - Say to render a particular data there are a few specific tables to fetch data from : T1,T2,T3 and T4
 - The logic to fetch the information is implemented by all the dependent services
 - What if  Blogs team change the logic and now requires T1,T2,T3,T4?
 - All the dependent services will have to change the logic . So we lose cohesion

##### Core principle behind microservices are:
 - Loose Coupling
 - High Cohesion 

##### We are losing the core principles of microservices by sharing db

## Solutions to Database Sharing Problems

### 1. API-First Communication
Instead of direct database access, services should communicate through well-defined APIs:

```
┌─────────────┐    HTTP/REST API    ┌─────────────┐
│  Analytics  │ ◄─────────────────► │    Blogs    │
│  Service    │                     │   Service   │
└─────────────┘                     └─────────────┘
    │                                   │
    ▼                                   ▼
┌─────────────┐                     ┌─────────────┐
│ Analytics   │                     │   Blogs     │
│     DB      │                     │     DB      │
└─────────────┘                     └─────────────┘
```

**Benefits:**
- Encapsulation of internal schema
- Service autonomy for database changes
- Clear service boundaries
- Version control of APIs

### 2. Event-Driven Architecture
Implement asynchronous communication using events:

```
┌─────────────┐    Event Bus     ┌─────────────┐
│    Blogs    │ ───────────────► │  Analytics  │
│   Service   │                  │   Service   │
└─────────────┘                  └─────────────┘
    │                                │
    ▼         BlogViewEvent          ▼
┌─────────────┐   {id, views}    ┌─────────────┐
│   Blogs     │                  │ Analytics   │
│     DB      │                  │     DB      │
└─────────────┘                  └─────────────┘
```

**Implementation:**
- Use message queues (Kafka, RabbitMQ)
- Publish events when blog views change
- Analytics service subscribes to relevant events
- Eventually consistent data

### 3. Database Per Service Pattern
Each microservice owns its data completely:

```
Service A ◄─── API ───► Service B
    │                      │
    ▼                      ▼
Database A            Database B
```

**Benefits:**
- Complete data ownership
- Independent scaling
- Technology diversity
- Fault isolation

### 4. CQRS (Command Query Responsibility Segregation)
Separate read and write operations:

```
┌─────────────┐ Commands ┌─────────────┐
│   Blogs     │ ────────► │   Write     │
│   Service   │          │   Model     │
└─────────────┘          └─────────────┘
                    │
                    ▼ Events
                ┌─────────────┐
                │    Read     │
                │   Models    │ ◄─── Analytics
                └─────────────┘      Service
```

### 5. API Gateway Pattern
Centralize external communication:

```
┌─────────────┐
│ API Gateway │
└─────────────┘
    │
   ┌───┼───┐
   ▼       ▼
┌─────┐ ┌─────────┐
│Blogs│ │Analytics│
└─────┘ └─────────┘
```

### 6. Data Synchronization Strategies

**A. Change Data Capture (CDC):**
- Monitor database changes
- Stream changes to interested services
- Near real-time synchronization

**B. Saga Pattern:**
- Manage distributed transactions
- Compensating actions for failures
- Maintain data consistency across services

### Implementation Recommendation

For the blog/analytics example:

1. **Immediate Solution:** Implement REST API endpoints in Blogs service
2. **Long-term:** Migrate to event-driven architecture
3. **Data Strategy:** Use eventual consistency with proper error handling
4. **Monitoring:** Implement distributed tracing and logging

This approach maintains microservices principles while ensuring scalability and maintainability.

###### Challenge 3: Risk of data corruption and deletion
This challenge typically involves several scenarios where valuable data can be lost or corrupted:

Common Causes:
- Concurrent access: Multiple processes/users modifying data simultaneously
- Incomplete transactions: Operations that fail partway through execution
- Hardware failures: Disk crashes, power outages, network interruptions
- Software bugs: Logic errors that overwrite or delete data incorrectly
- Human error: Accidental deletions or modifications
- Race conditions: Timing issues in multi-threaded applications
Solutions
1. Database Transactions & ACID Properties
2. Backup Strategies
Regular automated backups
Point-in-time recovery capabilities
Offsite backup storage
3. Data Validation & Constraints
4. Locking Mechanisms
5. Soft Deletes
Instead of permanently deleting data, mark it as deleted:



- Now that all the dependent services have write access for the same database , there are massive chances of someone 
- Corrupting the data with wrong script and limited knowledge
- accidentally deleting all the data
- DB ACL has to be managed well so as to prevent this

##### Say Analytics service wrote a few new queries to render some new user facing dashboards and these queries are super-heavy this will affect the services on the same DB.

No way to automatically throttle the DB queries

##### where do we need shared DB?

Despite the disadvantages, sharing a database between microservices can be acceptable in specific scenarios:

## When Shared Database Makes Sense

### 1. Time-Critical Development
When you're under tight deadlines and need to deliver functionality quickly:
- **MVP Development**: Getting a minimum viable product to market fast
- **Proof of Concept**: Validating business ideas before investing in proper architecture
- **Startup Phase**: Limited resources and need for rapid iteration
- **Legacy Migration**: Gradual transition from monolith to microservices

### 2. Stable Schema Requirements
When the database schema is well-established and rarely changes:
- **Mature Domain Models**: Business entities that have stabilized over time
- **Read-Heavy Services**: Analytics, reporting, and dashboard services
- **Reference Data**: Lookup tables, configuration data that changes infrequently
- **Regulatory Compliance**: Data structures mandated by external requirements

### 3. Read Replica Strategy
Distribute read load to separate database replicas:

```
┌─────────────┐    Write    ┌─────────────┐
│    Blogs    │ ──────────► │   Master    │
│   Service   │             │     DB      │
└─────────────┘             └─────────────┘
                                   │
                            Replication
                                   │
                                   ▼
┌─────────────┐    Read     ┌─────────────┐
│  Analytics  │ ──────────► │   Read      │
│   Service   │             │  Replica    │
└─────────────┘             └─────────────┘
```

**Benefits of Read Replicas:**
- **Performance Isolation**: Read queries don't impact write performance
- **Horizontal Scaling**: Multiple read replicas for high read loads
- **Reduced Contention**: Write service maintains exclusive write access
- **Cost Effective**: Cheaper than implementing full service APIs initially

### 4. Temporary Solution
Use shared database as a stepping stone:
- **Phase 1**: Shared database for quick delivery
- **Phase 2**: Implement proper APIs and event-driven communication
- **Phase 3**: Migrate to database-per-service pattern

This approach allows teams to deliver value quickly while planning for proper microservices architecture in the future.




