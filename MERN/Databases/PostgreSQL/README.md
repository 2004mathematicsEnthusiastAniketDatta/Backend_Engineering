## What is a Database?
Ans: An organised collection of data. A method to manipulate and access the data.


## App -> DBMS-> DBs
DBMS + DBs is PostgreSQL 

## What is RDBMS?
Ans: A type of database System that stores data in structured tables (with rows and columns) and requires SQL for managing and querying data. Relations -> RDBMS
## NoSQL databases like MongoDB stores data in the form of binary encoded JSON documents:
### BSON (Binary JSON)
- BSON is the binary-encoded serialization format MongoDB uses to represent documents on disk and over the wire.
- It extends JSON with additional data types (binary, ObjectId, int32/int64, Decimal128, Date, Regex, Timestamp, Min/Max key) and preserves type information.
- Benefits: compact binary representation, fast parsing, rich type system (esp. numeric and binary types), and efficient traversal.

Common BSON types and how they map from JSON-like documents:
- String -> UTF-8 string
- Int32 / Int64 / Double -> numeric types (choose smallest that fits)
- Decimal128 -> high-precision decimal for financial/app data
- ObjectId -> 12-byte unique id (timestamp + machine + pid + counter)
- Date -> milliseconds since epoch (BSON date)
- Binary -> raw bytes (files, UUIDs)
- Array -> serialized as embedded document with integer keys
- Embedded document -> nested object
- Boolean / Null / Regex / Timestamp / MinKey / MaxKey

Example document (JSON-like):
```json
{
    "_id": ObjectId("6512d9c0a1b2c3d4e5f67890"),
    "name": "Alice",
    "age": 30,
    "balance": Decimal128("12345.67"),
    "createdAt": ISODate("2024-01-01T12:00:00Z"),
    "tags": ["premium", "beta"],
    "meta": { "views": 1024, "referrer": null },
    "avatar": BinData(0, "…base64…"),
    "active": true
}
```
How BSON represents key fields (conceptually):
- _id -> ObjectId (12 bytes)
- name -> cstring length + UTF-8 bytes
- age -> 32-bit int (4 bytes)
- balance -> 16-byte Decimal128
- createdAt -> 64-bit signed integer (millis)
- tags -> embedded doc with keys "0","1"
- meta -> nested document with its own typed fields
- avatar -> subtype + binary blob length + bytes

A small hex illustration (conceptual, not full valid encoding):
- [totalLen][0x02 "name" len str bytes][0x10 "age" int32][0x12 "balance" decimal128 bytes]...[0x00 terminator]

Why this matters:
- Precise types avoid ambiguity (e.g., ints vs doubles vs decimals).
- ObjectId encodes creation time enabling efficient range queries by time.
- BSON size limits (document size default 16MB) and indexes must be considered.

### MongoDB examples (node + shell)
Insert and query with Node.js driver:
```js
// Node.js (mongodb driver)
import { MongoClient, ObjectId, Decimal128 } from "mongodb";
const client = new MongoClient("mongodb://localhost:27017");
await client.connect();
const db = client.db("app");
const users = db.collection("users");

const doc = {
    _id: new ObjectId(),
    name: "Alice",
    age: 30,
    balance: Decimal128.fromString("12345.67"),
    createdAt: new Date(),
    tags: ["premium","beta"],
    meta: { views: 1024 }
};

await users.insertOne(doc);
const res = await users.findOne({ name: "Alice" }, { projection: { balance: 1, _id: 0 } });
console.log(res); // balance is Decimal128 in driver
await client.close();
```

Shell examples:
- Insert:
    db.users.insertOne({ name: "Alice", age: 30 })
- Find:
    db.users.find({ age: { $gte: 18 } }).sort({ createdAt: -1 }).limit(10)
- Index:
    db.users.createIndex({ name: 1 }) // speeds up equality/lookup on name

Design considerations:
- Choose correct numeric type: use Decimal128 for money, Int32/Int64 for counters.
- Avoid very large documents; keep frequently accessed fields top-level for projection.
- Use ObjectId for compact unique ids; you can derive creation time from it.
- Index fields that are frequent in queries; consider compound and TTL indexes for time series data.

Further reading (useful to open in host): "$BROWSER" https://www.mongodb.com/docs/manual/reference/bson-types/

## Some othe Databases are:
1. MongoDB
2. Oracle
3. MySQL
4. NoSQL DBs
5. SQLite
6. PostgreSQL
7. MaxDB
8. DynamoDB
9. Firebird
10. Redis-DB :Key-Value Memory-Store based Store that helps in Caching 
## Data Warehouse :

11. Snowflake, Google BigQuery, and Amazon Redshift 

## SQL vs. PostgreSQL

### SQL: Structured Query Language: 
language required to talk to databases.


