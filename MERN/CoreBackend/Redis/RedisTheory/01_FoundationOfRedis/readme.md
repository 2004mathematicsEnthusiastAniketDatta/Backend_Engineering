# Redis Docs: <br/> 
Go through Redis docs :https://redis.io/docs/latest/ <br/>


# What is Redis?
ans: Redis is an in-memory key value store that supports persistance and can flush data on disk but usually operates on Random Access Memory and all the data structures are in-memory. Redis supports eviction, replication, pipelining and queue operations. Redis is a popular cache. Redis is single-threaded and have event loop. They have extremely optimized memory layout with in-place data structure encodings, fast retrieval (as on RAM), zero-copy networking. they have deterministic sub-millisecond latency and supports atomic operations like INCR and SETNX.
# Redis as a session store:
ans: Redis is a popular choice for session storage. Here's a concise overview:

## Why Redis for Sessions?

- **Speed** — in-memory store, sub-millisecond reads/writes
- **TTL support** — keys auto-expire, perfect for session timeouts
- **Scalability** — shared store across multiple app servers (solves sticky session problem)
- **Persistence** — optional RDB/AOF snapshots if you need durability
## Common Patterns

### Node.js + Express
```javascript
import session from 'express-session';
import RedisStore from 'connect-redis';
import { createClient } from 'redis';

const redisClient = createClient({ url: 'redis://localhost:6379' });
await redisClient.connect();

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,       // HTTPS only
    httpOnly: true,     // no JS access
    maxAge: 1000 * 60 * 60 * 24  // 24h
  }
}));
```

### Python + Flask
```python
from flask import Flask
from flask_session import Session
import redis

app = Flask(__name__)
app.config['SESSION_TYPE'] = 'redis'
app.config['SESSION_REDIS'] = redis.from_url('redis://localhost:6379')
app.config['PERMANENT_SESSION_LIFETIME'] = 86400  # 24h
Session(app)
```

### Direct key pattern (framework-agnostic)
```
SET session:<session_id> <serialized_data> EX 86400
GET session:<session_id>
DEL session:<session_id>   # logout
```
## Key Design Decisions

| Decision | Recommendation |
|---|---|
| Key prefix | `session:` or `sess:` |
| Serialization | JSON (readable) or MessagePack (compact) |
| TTL | Sliding (refresh on access) vs. absolute |
| Eviction policy | `allkeys-lru` or `volatile-lru` |

### Sliding TTL (refresh on each request)
```javascript
// After reading session, reset expiry
await redis.expire(`session:${sessionId}`, 86400);
```

---

## Security Considerations

- **Never** store sensitive data (passwords, secrets) in the session payload
- Use a **cryptographically random** session ID (e.g. `crypto.randomUUID()`)
- Set `httpOnly` + `secure` + `SameSite=Strict` on the cookie
- Rotate the session ID on privilege escalation (login, sudo)
- Consider encrypting the payload at rest if it contains PII

---

## Production Tips

- Use **Redis Sentinel** or **Redis Cluster** for HA — a single Redis node is a SPOF
- Set `maxmemory-policy volatile-lru` so Redis evicts expired sessions first under memory pressure
- Monitor with `redis-cli info stats` — watch `keyspace_hits` vs `keyspace_misses`
- Separate session Redis from cache Redis (different DBs or instances) to avoid cross-contamination.

# Redis as a Message Broker

Redis offers **three distinct primitives** for messaging — each fits different use cases.

---

## 1. Pub/Sub — Fire and Forget

Simple broadcast, no persistence. Subscribers miss messages if offline.

```javascript
// Publisher
const pub = createClient();
await pub.publish('notifications', JSON.stringify({ userId: 1, msg: 'hello' }));

// Subscriber
const sub = createClient();
await sub.subscribe('notifications', (message) => {
  console.log(JSON.parse(message));
});

// Pattern subscribe
await sub.pSubscribe('orders.*', (message, channel) => {
  // matches orders.created, orders.shipped, etc.
});
```

**Use when:** live dashboards, chat, real-time notifications where message loss is acceptable.

---

## 2. Lists as Queues — Simple Work Queue

Reliable, persistent, FIFO. The classic Redis queue pattern.

```javascript
// Producer
await redis.lPush('jobs:email', JSON.stringify({ to: 'a@b.com', template: 'welcome' }));

// Consumer (blocking pop — no polling)
while (true) {
  const [, job] = await redis.brPop('jobs:email', 0); // 0 = block forever
  await processJob(JSON.parse(job));
}
```

### Reliable queue with backup list
```javascript
// BRPOPLPUSH atomically moves job to a processing list
const job = await redis.brPopLPush('jobs:email', 'jobs:email:processing', 0);

// On success, remove from processing list
await redis.lRem('jobs:email:processing', 1, job);

// On crash, jobs stay in processing list for recovery
```

**Use when:** background jobs, task queues, simple producer/consumer pipelines.

---

## 3. Streams — Full-Featured Message Broker ⭐

Redis 5+ feature. Persistent log, consumer groups, acknowledgements — closest to Kafka.

```javascript
// Produce
await redis.xAdd('orders', '*', {   // * = auto ID
  orderId: '123',
  amount: '49.99',
  status: 'pending'
});

// Consume with consumer group
await redis.xGroupCreate('orders', 'billing-service', '$', { MKSTREAM: true });

while (true) {
  const results = await redis.xReadGroup(
    'billing-service',    // group
    'worker-1',           // consumer name
    [{ key: 'orders', id: '>' }],  // > = new messages only
    { COUNT: 10, BLOCK: 5000 }
  );

  for (const { id, message } of results?.[0]?.messages ?? []) {
    await processOrder(message);
    await redis.xAck('orders', 'billing-service', id); // ack = done
  }
}
```

### Handle unacknowledged (crashed) messages
```javascript
// Check pending messages older than 30s
const pending = await redis.xAutoClaim(
  'orders', 'billing-service', 'worker-1',
  30000,   // min idle ms
  '0-0'    // start from beginning
);
// Re-process pending.messages
```

---

## Comparison

| Feature | Pub/Sub | Lists | Streams |
|---|---|---|---|
| Persistence | ❌ | ✅ | ✅ |
| Consumer groups | ❌ | ❌ | ✅ |
| Acknowledgements | ❌ | Manual | ✅ Built-in |
| Replay messages | ❌ | ❌ | ✅ |
| Multiple consumers | Broadcast | Competing | Both |
| Backpressure | ❌ | ✅ `MAXLEN` | ✅ `MAXLEN` |
| Ordering | Per-channel | FIFO | Per-shard |

---

## Stream Trimming (Backpressure)

```javascript
// Cap stream at ~10k messages
await redis.xAdd('orders', { MAXLEN: { strategy: '~', threshold: 10000 } }, '*', payload);

// Or trim explicitly
await redis.xTrim('orders', 'MAXLEN', 10000);
```

---

## When to Use Redis vs Dedicated Brokers

| Scenario | Use |
|---|---|
| Already using Redis, moderate volume | Redis Streams ✅ |
| Need message replay / event sourcing | Kafka |
| Need complex routing / dead-letter queues | RabbitMQ |
| Millions of msgs/sec, multi-region | Kafka / Pulsar |
| Simple background jobs | Redis Lists ✅ |
| Ephemeral real-time events | Redis Pub/Sub ✅ |

---

## Production Tips

- Set `MAXLEN` on all streams — unbounded streams will OOM
- Use **consumer group per service**, not per instance
- Name consumers by hostname/pod for easy debugging
- Monitor `XPENDING` — a growing pending list means consumers are crashing
- Use **Redis Cluster** with care — streams aren't sharded across slots automatically

## Redis as a Cache

---

## Core Patterns

### 1. Cache-Aside (Lazy Loading) — Most Common
App checks cache first, loads from DB on miss.

```javascript
async function getUser(id) {
  const cached = await redis.get(`user:${id}`);
  if (cached) return JSON.parse(cached);          // cache hit

  const user = await db.users.findById(id);       // cache miss
  await redis.set(`user:${id}`, JSON.stringify(user), { EX: 3600 });
  return user;
}
```

**Pros:** only caches what's actually used, resilient to cache failure
**Cons:** first request always slow (cold start), potential stale data

---

### 2. Write-Through — Always in Sync
Write to cache and DB together on every update.

```javascript
async function updateUser(id, data) {
  const user = await db.users.update(id, data);
  await redis.set(`user:${id}`, JSON.stringify(user), { EX: 3600 });
  return user;
}
```

**Pros:** cache always fresh
**Cons:** write latency doubles, cache fills with rarely-read data

---

### 3. Write-Behind (Write-Back) — High Write Throughput
Write to cache immediately, flush to DB asynchronously.

```javascript
async function updateUser(id, data) {
  await redis.set(`user:${id}`, JSON.stringify(data), { EX: 3600 });
  await redis.lPush('db:write:queue', JSON.stringify({ id, data })); // flush async
  return data;
}

// Background worker flushes to DB
async function flushWorker() {
  while (true) {
    const [, item] = await redis.brPop('db:write:queue', 0);
    const { id, data } = JSON.parse(item);
    await db.users.update(id, data);
  }
}
```

**Pros:** very fast writes, absorbs write spikes
**Cons:** risk of data loss on crash, complex recovery

---

### 4. Read-Through — Cache Handles the Miss
Cache layer itself fetches from DB (common in libraries like Cacheable).

```javascript
// Using Keyv + cacheable pattern
import Keyv from 'keyv';
const cache = new Keyv('redis://localhost:6379');

const user = await cache.get(`user:${id}`) 
  ?? await (async () => {
    const u = await db.users.findById(id);
    await cache.set(`user:${id}`, u, 3600 * 1000);
    return u;
  })();
```

---

## TTL Strategies

```javascript
// Absolute TTL — expires at fixed time regardless of access
await redis.set('report:monthly', data, { EX: 86400 });

// Sliding TTL — reset on every access
const value = await redis.get(key);
if (value) await redis.expire(key, 3600);  // refresh window

// Conditional TTL — only set if key doesn't exist (cache-aside safe)
await redis.set(key, value, { EX: 3600, NX: true });

// Set with exact expiry timestamp
await redis.expireAt(key, Math.floor(Date.now() / 1000) + 3600);
```

---

## Cache Stampede Prevention

When a hot key expires, thousands of requests hit the DB simultaneously.

### Option A: Probabilistic Early Expiration
```javascript
async function getWithJitter(key, fetchFn, ttl) {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  // Add jitter to TTL to desynchronize expiries
  const jitter = Math.floor(Math.random() * 60);
  const value = await fetchFn();
  await redis.set(key, JSON.stringify(value), { EX: ttl + jitter });
  return value;
}
```

### Option B: Distributed Lock (Only One Fetches)
```javascript
async function getWithLock(key, fetchFn, ttl) {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  const lockKey = `lock:${key}`;
  const acquired = await redis.set(lockKey, '1', { NX: true, EX: 10 });

  if (!acquired) {
    await new Promise(r => setTimeout(r, 100)); // wait and retry
    return getWithLock(key, fetchFn, ttl);
  }

  try {
    const value = await fetchFn();
    await redis.set(key, JSON.stringify(value), { EX: ttl });
    return value;
  } finally {
    await redis.del(lockKey);
  }
}
```

---

## Eviction Policies

Set in `redis.conf` or via `CONFIG SET maxmemory-policy`:

| Policy | Behaviour | Best For |
|---|---|---|
| `noeviction` | Error on write when full | Not for cache |
| `allkeys-lru` | Evict least recently used (any key) | General cache ✅ |
| `volatile-lru` | LRU only on keys with TTL | Mixed cache+store |
| `allkeys-lfu` | Evict least frequently used | Skewed access patterns |
| `volatile-ttl` | Evict soonest-to-expire first | When TTL = priority |
| `allkeys-random` | Random eviction | Uniform access only |

```bash
CONFIG SET maxmemory 2gb
CONFIG SET maxmemory-policy allkeys-lru
```

---

## Key Naming Conventions

```
# Format: service:entity:id[:field]
user:profile:123
user:profile:123:avatar
product:details:sku-456
search:results:md5(query)
rate:limit:user:123
```

---

## Avoid These Cache Pitfalls

| Problem | Cause | Fix |
|---|---|---|
| **Cache stampede** | Hot key expires simultaneously | Locks or jitter |
| **Cache penetration** | Query for non-existent keys floods DB | Cache null values, bloom filter |
| **Cache avalanche** | Many keys expire at once | Stagger TTLs with jitter |
| **Big keys** | Storing huge blobs (>1MB) | Chunk data, compress, or use S3 |
| **Hot keys** | Single key gets millions of req/s | Local in-process L1 cache in front |

### Cache Null Values (Penetration Fix)
```javascript
const value = await redis.get(key);
if (value === 'NULL') return null;           // cached miss
if (value) return JSON.parse(value);

const result = await db.findById(id);
await redis.set(key, result ? JSON.stringify(result) : 'NULL', { EX: 300 });
return result;
```

---

## Monitoring Metrics to Watch

```bash
redis-cli info stats | grep -E 'keyspace_hits|keyspace_misses|evicted_keys'
redis-cli info memory | grep used_memory_human

# Hit rate = hits / (hits + misses) — aim for > 90%
```

| Metric | Target |
|---|---|
| Hit rate | > 90% |
| `evicted_keys` | Near 0 (size your cache) |
| `used_memory` | < 80% of `maxmemory` |
| Latency p99 | < 5ms |



## Redis as a Primary Data Store

Redis isn't just a cache — its rich data structures make it viable as a primary or secondary database for the right workloads.

---

## Data Structures & When to Use Them

### Strings — Counters, Flags, Simple Values
```javascript
// Atomic counter
await redis.incr('stats:pageviews');
await redis.incrBy('user:123:credits', 50);
await redis.decrBy('user:123:credits', 10);

// Compare-and-swap (optimistic lock)
const val = await redis.get('config:version');
// ... modify ...
const ok = await redis.set('config:version', newVal, { XX: true }); // only if exists

// Bit flags — store 1 billion booleans in 128MB
await redis.setBit('users:active:2024-01-01', userId, 1);
await redis.getBit('users:active:2024-01-01', userId);
await redis.bitCount('users:active:2024-01-01'); // total active users
```

---

### Hashes — Objects / Records
Ideal for entities with multiple fields. More memory-efficient than JSON strings.

```javascript
// Store user object
await redis.hSet('user:123', {
  name: 'Alice',
  email: 'alice@example.com',
  role: 'admin',
  createdAt: Date.now()
});

// Read single field (no deserialization cost)
const email = await redis.hGet('user:123', 'email');

// Read all fields
const user = await redis.hGetAll('user:123');

// Atomic field update
await redis.hIncrBy('user:123', 'loginCount', 1);

// Partial update — only touch what changed
await redis.hSet('user:123', { lastSeen: Date.now() });
```

---

### Sets — Unique Collections, Relationships
```javascript
// Tags, roles, memberships
await redis.sAdd('user:123:roles', 'editor', 'publisher');
await redis.sAdd('post:456:tags', 'redis', 'database', 'cache');

// Membership check — O(1)
const isAdmin = await redis.sIsMember('user:123:roles', 'admin');

// Set operations — followers/following graph
await redis.sAdd('user:123:following', '456', '789');
await redis.sAdd('user:456:following', '123', '789');

const mutualFriends = await redis.sInter('user:123:following', 'user:456:following');
const allConnections = await redis.sUnion('user:123:following', 'user:456:following');
```

---

### Sorted Sets — Ranked Data, Leaderboards, Timelines
```javascript
// Leaderboard
await redis.zAdd('leaderboard:global', [
  { score: 9850, value: 'user:alice' },
  { score: 7200, value: 'user:bob' },
  { score: 12100, value: 'user:carol' },
]);

// Top 10
const top10 = await redis.zRangeWithScores('leaderboard:global', 0, 9, { REV: true });

// User rank (0-indexed)
const rank = await redis.zRevRank('leaderboard:global', 'user:alice');

// Score update
await redis.zIncrBy('leaderboard:global', 500, 'user:alice');

// Range by score — activity in last 24h
const since = Date.now() - 86400 * 1000;
const recent = await redis.zRangeByScore('events:user:123', since, '+inf');
```

---

### HyperLogLog — Approximate Unique Counts
Counts unique values using ~12KB regardless of cardinality.

```javascript
// Track unique visitors
await redis.pfAdd(`visitors:${today}`, userId);
await redis.pfAdd(`visitors:${today}`, ipAddress);

// Count uniques (~0.81% error rate)
const uniqueVisitors = await redis.pfCount(`visitors:${today}`);

// Merge multiple days
await redis.pfMerge('visitors:week', 
  'visitors:mon', 'visitors:tue', 'visitors:wed'
);
```

---

### Geospatial — Location Queries
```javascript
// Store locations
await redis.geoAdd('restaurants', [
  { longitude: 88.3639, latitude: 22.5726, member: 'restaurant:1' },
  { longitude: 88.3711, latitude: 22.5800, member: 'restaurant:2' },
]);

// Find within 2km
const nearby = await redis.geoRadius(
  'restaurants', 88.3639, 22.5726, 2, 'km',
  { SORT: 'ASC', COUNT: 10 }
);

// Distance between two points
const dist = await redis.geoDist('restaurants', 'restaurant:1', 'restaurant:2', 'km');

// Get coordinates
const pos = await redis.geoPos('restaurants', 'restaurant:1');
```

---

## Transactions

### MULTI/EXEC — Atomic Batch
```javascript
// All commands execute atomically — no interleaving
const results = await redis.multi()
  .hSet('user:123', { lastLogin: Date.now() })
  .incrBy('user:123:loginCount', 1)
  .zAdd('active:users', [{ score: Date.now(), value: 'user:123' }])
  .exec();
```

### WATCH — Optimistic Locking
```javascript
async function transferCredits(fromId, toId, amount) {
  const fromKey = `user:${fromId}:credits`;

  await redis.watch(fromKey);
  const balance = parseInt(await redis.get(fromKey));

  if (balance < amount) {
    await redis.unwatch();
    throw new Error('Insufficient credits');
  }

  const result = await redis.multi()
    .decrBy(fromKey, amount)
    .incrBy(`user:${toId}:credits`, amount)
    .exec();                   // returns null if WATCH key changed

  if (!result) throw new Error('Conflict — retry');
}
```

---

## Lua Scripts — Complex Atomic Operations

```javascript
// Rate limiter as atomic Lua script
const rateLimiter = `
  local key = KEYS[1]
  local limit = tonumber(ARGV[1])
  local window = tonumber(ARGV[2])
  
  local count = redis.call('INCR', key)
  if count == 1 then
    redis.call('EXPIRE', key, window)
  end
  
  if count > limit then
    return 0
  end
  return 1
`;

const allowed = await redis.eval(rateLimiter, {
  keys: [`ratelimit:user:${userId}`],
  arguments: ['100', '60']   // 100 req/min
});
```

---

## Persistence Options

| Mode | Config | Durability | Performance |
|---|---|---|---|
| No persistence | `save ""` | None | Fastest |
| RDB snapshots | `save 900 1` | Last snapshot | Fast |
| AOF logging | `appendonly yes` | Near real-time | Moderate |
| AOF + fsync always | `appendfsync always` | Every write | Slowest |
| RDB + AOF (hybrid) | Both enabled | Best of both | Balanced ✅ |

```bash
# Recommended for primary data store
appendonly yes
appendfsync everysec          # flush every second
auto-aof-rewrite-percentage 100
save 3600 1                   # RDB snapshot fallback
```

---

## Data Modelling Example — Social Feed

```javascript
// Post storage
await redis.hSet('post:789', {
  authorId: '123', body: 'Hello Redis!', createdAt: Date.now()
});

// Author's post list (sorted by time)
await redis.zAdd('user:123:posts', [{ score: Date.now(), value: 'post:789' }]);

// Fan-out to follower feeds on publish
const followers = await redis.sMembers('user:123:followers');
const pipeline = redis.multi();
for (const followerId of followers) {
  pipeline.zAdd(`user:${followerId}:feed`, [{ score: Date.now(), value: 'post:789' }]);
}
await pipeline.exec();

// Read feed (paginated)
const feed = await redis.zRange('user:456:feed', 0, 19, { REV: true }); // latest 20
const posts = await Promise.all(feed.map(id => redis.hGetAll(id)));
```

---

## When Redis as Primary Store Makes Sense

| ✅ Good fit | ❌ Poor fit |
|---|---|
| Leaderboards, rankings | Complex relational queries |
| Real-time counters & stats | Large blobs (images, files) |
| Social graphs | Ad-hoc reporting / analytics |
| Session & token storage | Multi-table transactions |
| Rate limiting | Schema-heavy normalized data |
| Geospatial lookups | Full-text search (use Elasticsearch) |
| Time-series events | Data > available RAM |

# Redis applications:
Some data structures that redis provides like hash, list, set, sorted list, bitmap, hyperloglog, geospatial indexes, streams. These data structures can be required to build variety of applications:
- Realtime chat
- Authentication Session store
- Message buffers
- temporary data saver
- media streaming
- leaderboards
- real-time analytics

# What makes Redis special?
ans: Every operation on Redis is atomic , i.e. , when command is executing , Redis does not context switch and start executing other commands: Media , Blob , Tables Images files, JSON etc.
- Putting a key
- adding this to the list 
- Set Union / Intersection
- setnx
- Reading 
- Increamenting the value
- Durability
- adaptability
- extensibility
- caching
- scalability

# Redis provides configurable persistance
Redis may periodically dump data on disks and there is proper write ahead log of all comments. 
no persistance at all.

Redis have persistance  on two types of files:
a. Redis Database file(RDB file) <br>
b. Append only files<br>

## FOLLOW THE NOTES IN REDIS COPY
