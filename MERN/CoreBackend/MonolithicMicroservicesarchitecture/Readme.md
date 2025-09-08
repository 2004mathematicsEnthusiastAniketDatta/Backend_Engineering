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
