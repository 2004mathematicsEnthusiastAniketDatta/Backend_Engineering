## What is a Database?
Ans: An organised collection of data. A method to manipulate and access the data.


## App/Backend/Models -> DBMS-> DBs
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
Structured Query Language is the language required to talk to databases.
Follow Notes
Example: SELECT * FROM Students;
### PostgreSQL: 
PostgreSQL is an object-relational database management system (ORDBMS) based on POSTGRES, Version 4.2, developed at the University of California at Berkeley Computer Science Department. POSTGRES pioneered many concepts that only became available in some commercial database systems much later.POSTGRES 4.2 was a Package developed at the University of California, Berkeley in the late 1980s and early 1990s.The POSTGRES project, led by Professor Michael Stonebraker, was sponsored by the Defense Advanced Research Projects Agency (DARPA), the Army Research Office (ARO), the National Science Foundation (NSF), and ESL, Inc. The implementation of POSTGRES began in 1986. The initial concepts for the system were presented in [ston86], and the definition of the initial data model appeared in [rowe87]. The design of the rule system at that time was described in [ston87a]. The rationale and architecture of the storage manager were detailed in [ston87b].

POSTGRES has undergone several major releases since then. The first “demoware” system became operational in 1987 and was shown at the 1988 ACM-SIGMOD Conference. Version 1, described in [ston90a], was released to a few external users in June 1989. In response to a critique of the first rule system ([ston89]), the rule system was redesigned ([ston90b]), and Version 2 was released in June 1990 with the new rule system. Version 3 appeared in 1991 and added support for multiple storage managers, an improved query executor, and a rewritten rule system. For the most part, subsequent releases until Postgres95 (see below) focused on portability and reliability.

POSTGRES has been used to implement many different research and production applications. These include: a financial data analysis system, a jet engine performance monitoring package, an asteroid tracking database, a medical information database, and several geographic information systems. POSTGRES has also been used as an educational tool at several universities. Finally, Illustra Information Technologies (later merged into Informix, which is now owned by IBM) picked up the code and commercialized it. In late 1992, POSTGRES became the primary data manager for the Sequoia 2000 scientific computing project described in [ston92].

The size of the external user community nearly doubled during 1993. It became increasingly obvious that maintenance of the prototype code and support was taking up large amounts of time that should have been devoted to database research. In an effort to reduce this support burden, the Berkeley POSTGRES project officially ended with Version 4.2. Postgres95 is the descendant of Postgres Project. In 1994, Andrew Yu and Jolly Chen added an SQL language interpreter to POSTGRES. Under a new name, Postgres95 was subsequently released to the web to find its own way in the world as an open-source descendant of the original POSTGRES Berkeley code.

Postgres95 code was completely ANSI C and trimmed in size by 25%. Many internal changes improved performance and maintainability. Postgres95 release 1.0.x ran about 30–50% faster on the Wisconsin Benchmark compared to POSTGRES, Version 4.2. Apart from bug fixes, the following were the major enhancements:

The query language PostQUEL was replaced with SQL (implemented in the server). (Interface library libpq was named after PostQUEL.) Subqueries were not supported until PostgreSQL (see below), but they could be imitated in Postgres95 with user-defined SQL functions. Aggregate functions were re-implemented. Support for the GROUP BY query clause was also added.

A new program (psql) was provided for interactive SQL queries, which used GNU Readline. This largely superseded the old monitor program.

A new front-end library, libpgtcl, supported Tcl-based clients. A sample shell, pgtclsh, provided new Tcl commands to interface Tcl programs with the Postgres95 server.

The large-object interface was overhauled. The inversion large objects were the only mechanism for storing large objects. (The inversion file system was removed.)

The instance-level rule system was removed. Rules were still available as rewrite rules.

A short tutorial introducing regular SQL features as well as those of Postgres95 was distributed with the source code

GNU make (instead of BSD make) was used for the build. Also, Postgres95 could be compiled with an unpatched GCC (data alignment of doubles was fixed).

PostgreSQL is an open-source descendant of this original Berkeley code. It supports a large part of the SQL standard and offers many modern features:

1. complex queries
2. foreign keys
3. triggers
4. updatable views
5. transactional integrity
6. multiversion concurrency control
Also, PostgreSQL can be extended by the user in many ways, for example by adding new

1. data types
2. functions
3. operators
4. aggregate functions
5. index methods
6. procedural languages

### createdb <  Database Name >

The first test to see whether you can access the database server is to try to create a database. A running PostgreSQL server can manage many databases. Typically, a separate database is used for each project or for each user.

Possibly, your site administrator has already created a database for your use. In that case you can omit this step and skip ahead to the next section.

To create a new database from the command line, in this example named mydb, you use the following command:

$ createdb mydb
If this produces no response then this step was successful and you can skip over the remainder of this section.

If you see a message similar to:

createdb: command not found
then PostgreSQL was not installed properly. Either it was not installed at all or your shell's search path was not set to include it. Try calling the command with an absolute path instead:

$ /usr/local/pgsql/bin/createdb mydb
The path at your site might be different. Contact your site administrator or check the installation instructions to correct the situation.

Another response could be this:

createdb: error: connection to server on socket "/tmp/.s.PGSQL.5432" failed: No such file or directory
        Is the server running locally and accepting connections on that socket?
This means that the server was not started, or it is not listening where createdb expects to contact it. Again, check the installation instructions or consult the administrator.

Another response could be this:

createdb: error: connection to server on socket "/tmp/.s.PGSQL.5432" failed: FATAL:  role "joe" does not exist
where your own login name is mentioned. This will happen if the administrator has not created a PostgreSQL user account for you. (PostgreSQL user accounts are distinct from operating system user accounts.) If you are the administrator, see Chapter 21 for help creating accounts. You will need to become the operating system user under which PostgreSQL was installed (usually postgres) to create the first user account. It could also be that you were assigned a PostgreSQL user name that is different from your operating system user name; in that case you need to use the -U switch or set the PGUSER environment variable to specify your PostgreSQL user name.

If you have a user account but it does not have the privileges required to create a database, you will see the following:

createdb: error: database creation failed: ERROR:  permission denied to create database
Not every user has authorization to create new databases. If PostgreSQL refuses to create databases for you then the site administrator needs to grant you permission to create databases. Consult your site administrator if this occurs. If you installed PostgreSQL yourself then you should log in for the purposes of this tutorial under the user account that you started the server as. [1]

You can also create databases with other names. PostgreSQL allows you to create any number of databases at a given site. Database names must have an alphabetic first character and are limited to 63 bytes in length. A convenient choice is to create a database with the same name as your current user name. Many tools assume that database name as the default, so it can save you some typing. To create that database, simply type:

$ createdb
If you do not want to use your database anymore you can remove it. For example, if you are the owner (creator) of the database mydb, you can destroy it using the following command:

$ dropdb mydb
(For this command, the database name does not default to the user account name. You always need to specify it.) This action physically removes all files associated with the database and cannot be undone, so this should only be done with a great deal of forethought.

More about createdb and dropdb can be found in createdb and dropdb respectively.


[1] As an explanation for why this works: PostgreSQL user names are separate from operating system user accounts. When you connect to a database, you can choose what PostgreSQL user name to connect as; if you don't, it will default to the same name as your current operating system account. As it happens, there will always be a PostgreSQL user account that has the same name as the operating system user that started the server, and it also happens that that user always has permission to create databases. Instead of logging in as that user you can also specify the -U option everywhere to select a PostgreSQL user name to connect as.




###
/**

 * Goals
 * -----
 * - Build a solid SQL and relational model foundation
 * - Learn production-grade PostgreSQL administration and operations
 * - Master performance tuning, indexing, partitioning, and query analysis
 * - Establish secure, resilient, and monitored PostgreSQL deployments
 * - Adopt professional workflows (migrations, backups, CI/CD, runbooks)
 *
 * Learning Path (staged)
 * ----------------------
 * 1) Beginner (0–4 weeks)
 *    - Objectives: Understand relational concepts, basic SQL, and local setup.
 *    - Topics:
 *      - RDBMS vs NoSQL basics, ACID principles
 *      - Installing PostgreSQL (local dev), psql basics
 *      - Basic SQL: CREATE, SELECT, INSERT, UPDATE, DELETE
 *      - Data types, NULL handling, simple JOINs, GROUP BY, ORDER BY
 *      - Simple constraints: PRIMARY KEY, UNIQUE, NOT NULL
 *      - Basic transactions: BEGIN/COMMIT/ROLLBACK
 *    - Exercises:
 *      - Model a simple blog schema and write CRUD queries
 *      - Use psql to import/export CSV
 *
 * 2) Intermediate (4–12 weeks)
 *    - Objectives: Become productive with schema design, indexing, and functions.
 *    - Topics:
 *      - Normalization vs controlled denormalization
 *      - Advanced JOINs, subqueries, window functions
 *      - Indexes: B-tree, Hash, GIN, GiST, BRIN basics
 *      - Constraints: FOREIGN KEY, CHECK
 *      - Views, materialized views
 *      - PL/pgSQL basics and server-side functions
 *      - Transactions isolation levels and MVCC behavior
 *      - EXPLAIN / EXPLAIN ANALYZE and reading query plans
 *    - Exercises:
 *      - Optimize queries with indexes and EXPLAIN
 *      - Implement audit triggers using PL/pgSQL
 *      - Build materialized view refresh strategies
 *
 * 3) Advanced (3–6 months)
 *    - Objectives: Operate and tune PostgreSQL at scale; design for performance.
 *    - Topics:
 *      - Advanced indexing strategies and partial indexes
 *      - Partitioning: declarative partitioning, strategies, maintenance
 *      - Vacuum, autovacuum, bloat, and statistics tuning
 *      - Query planning internals, planner cost parameters
 *      - Concurrency control, locking diagnostics, and deadlock resolution
 *      - Logical replication, WAL basics, physical streaming replication
 *      - Connection pooling (PgBouncer) and pooling modes
 *      - Backup strategies: pg_dump, pg_basebackup, PITR, WAL archiving
 *      - Security: roles, privileges, row-level security (RLS), SSL/TLS
 *    - Exercises:
 *      - Setup streaming replication and promote a replica
 *      - Simulate high-concurrency workload and diagnose contention
 *      - Implement partitioned tables and measure improvements
 *
 * 4) Professional / Production (ongoing)
 *    - Objectives: Build resilient, secure, observable, and maintainable systems.
 *    - Topics:
 *      - HA solutions: Patroni, repmgr, managed cloud offerings
 *      - Logical decoding, change data capture (Debezium) patterns
 *      - Advanced backups: Barman, pgBackRest, retention policies
 *      - Performance monitoring: pg_stat_statements, Prometheus, Grafana
 *      - Capacity planning and hardware sizing
 *      - Operational runbooks, incident management, disaster recovery
 *      - CI/CD for database schema: migrations, testing, zero-downtime deploys
 *      - Compliance, auditing, data masking, encryption at rest/in transit
 *    - Exercises / Projects:
 *      - Build a full CI pipeline that runs schema migrations and tests
 *      - Create DR plan, document RTO/RPO, and execute recovery drills
 *      - Harden a production instance: encryption, auditing, and RBAC
 *
 * Professional Practices & Best Practices
 * --------------------------------------
 * - Version control for schema and migrations; use tools (sqitch, Flyway,
 *   Liquibase, or framework migrations) and store SQL in git.
 * - Migration policies: small, reversible migrations; prefer non-blocking
 *   schema changes (avoid long table locks).
 * - Backups: Implement both logical (pg_dump) and physical (pg_basebackup)
 *   backups with tested recovery procedures. Regularly test restores.
 * - Monitoring & Alerting: Collect metrics (CPU, memory, I/O, connection
 *   counts, query latency, replication lag). Alert on high latency, bloat,
 *   autovacuum failures, replicas offline, high replication lag.
 * - Capacity & Performance: Monitor index hit ratio, buffer cache usage,
 *   and frequent sequential scans. Use EXPLAIN ANALYZE to tune high-cost queries.
 * - Security: Least privilege principle, separate roles for app/service/dbadmin,
 *   use SSL, rotate credentials, audit privileged actions, enable RLS where needed.
 * - Automation: Automate provisioning, configuration (Ansible, Terraform),
 *   backups, and failover procedures. Treat DB servers as cattle where appropriate.
 * - Observability: Enable pg_stat_statements, track long running queries,
 *   build dashboards for slow queries and top users.
 * - Incident Management: Maintain runbooks for common issues (promote replica,
 *   perform hot standby failover, restore from backup), and perform regular drills.
 *
 * Recommended Practical Tools
 * ---------------------------
 * - Client & Querying: psql, pgAdmin, DBeaver, DataGrip
 * - Connection Pooling: PgBouncer
 * - HA / Orchestration: Patroni, repmgr, pg_auto_failover
 * - Backups: pgBackRest, Barman, built-in pg_basebackup, wal-e/wal-g for cloud
 * - Monitoring: pg_stat_statements, pgwatch2, pganalyze, Percona Monitoring/PMM,
 *   Prometheus + Grafana exporters
 * - Migration & CI: Flyway, Liquibase, sqitch, GitHub Actions/GitLab CI to run
 *   tests and migrations in pre-prod pipelines
 * - CDC & Replication: Debezium, logical replication slots, wal2json formatter
 *
 * Key Commands & Patterns (reference)
 * -----------------------------------
 * - Start local psql: psql -h HOST -U USER -d DB
 * - Dump DB: pg_dump -Fc -f db.dump dbname
 * - Restore DB: pg_restore -d dbname db.dump
 * - Physical base backup: pg_basebackup -D /var/lib/postgresql/data -F tar -z
 * - Check active queries: SELECT pid, now()-pg_stat_activity.query_start AS duration, query FROM pg_stat_activity WHERE state <> 'idle';
 * - Show top queries: pg_stat_statements view after enabling extension
 *
 * Schema Design Principles
 * ------------------------
 * - Model data according to access patterns; optimize for read/write tradeoffs.
 * - Prefer explicit constraints and types to catch errors early.
 * - Use normalization to avoid anomalies; denormalize only for clear performance gains.
 * - Use JSONB for semi-structured data when flexibility is needed, but index carefully.
 * - Use appropriate keys and consider surrogate vs natural keys per domain needs.
 *
 * Performance Tuning Checklist
 * ---------------------------
 * - Ensure autovacuum is running and tuned for workload
 * - Analyze pg_stat_activity and pg_locks for contention
 * - Use EXPLAIN (ANALYZE, BUFFERS) to find expensive plan nodes
 * - Create appropriate indexes (including expression and partial indexes)
 * - Evaluate partitioning for massive tables
 * - Right-size maintenance_work_mem, shared_buffers, work_mem, effective_cache_size
 * - Monitor checkpoint settings and WAL usage; tune checkpoint_completion_target
 *
 * Security & Compliance
 * ---------------------
 * - Use TLS for client connections; enforce strong cipher suites
 * - Encrypt data at rest (disk encryption) and use cloud provider KMS where applicable
 * - Use role-based access control; avoid superuser access for applications
 * - Implement Row Level Security when multi-tenancy or per-row policies are required
 * - Audit: enable logging of DDL and critical operations; centralize logs
 * - Data protection: implement masking, pseudonymization for PII and comply with regulations
 *
 * Testing Strategies
 * ------------------
 * - Write unit tests for stored procedures and SQL logic (pgTAP)
 * - Integration tests in CI that run migrations and exercises against ephemeral DB
 * - Load and stress tests (pgbench or custom harness) to identify bottlenecks
 * - Chaos testing for HA and failover behavior
 *
 * Common Pitfalls & How to Avoid Them
 * ----------------------------------
 * - Long migrations that lock tables: use COPY/CREATE TABLE + swap, or online-schema-change patterns
 * - Unindexed foreign keys: index FK columns to avoid full table scans/deletes
 * - Ignoring autovacuum: leads to bloat and performance degradation
 * - Excessive connection count without pooling: use PgBouncer
 * - Blindly increasing RAM settings without measuring: benchmark and monitor
 *
 * Capstone Projects (real-world practice)
 * ---------------------------------------
 * - Build a multi-tenant SaaS schema with RLS, migrations, and load tests
 * - Implement a real-time change-data-capture pipeline to sink into search/index
 * - Migrate a MySQL/Postgres app between major versions with zero downtime
 * - Deploy a production-grade cluster with Patroni, PgBouncer, backups, and monitoring
 *
 * Timeline Suggestions
 * --------------------
 * - Beginners: 1–4 weeks (daily practice)
 * - Intermediate: 1–3 months (project-based learning)
 * - Advanced: 3–6 months (real systems, production practice)
 * - Professional: ongoing; continuous learning via on-call, incidents, and upgrades
 *
 * Community & Further Learning
 * ---------------------------
 * - Official docs: https://www.postgresql.org/docs/ (primary reference)
 * - Mailing lists and community channels; Stack Overflow; PostgreSQL IRC/Slack
 * - Books and courses: follow official docs and community tutorials; prioritize learning by doing
 *
 * Certification & Career Path
 * --------------------------
 * - There is no single dominant PostgreSQL certification, but show experience via:
 *   - Project portfolio (DB migrations, HA setups, performance tuning)
 *   - Contribution to open-source or community, writing articles, presenting talks
 *   - Employer-backed trainings/certifications for cloud-managed DBs (AWS, GCP)
 *
 * Final Notes
 * -----------
 * - Treat the database as a core system component: invest in backups, monitoring,
 *   and automations early.
 * - Focus on repeatable, tested operational procedures and continuous learning.
 * - Use small incremental exercises, then escalate to real-world projects that
 *   exercise deployment, backup/restore, scaling, and incident recovery.
 *
 * TODO / Suggested Exercises (short)
 * ----------------------------------
 * - Install PostgreSQL, create DB, and load sample dataset
 * - Write queries using JOINs and window functions; optimize them
 * - Enable pg_stat_statements and find the 10 slowest queries
 * - Configure pgBouncer for an application and measure latency improvements
 * - Perform a full PITR restore from base backup + WAL
 */

### Custom SQL types:
1. CREATE DOMAIN:

-- Email type with validation
CREATE DOMAIN email AS VARCHAR(255)
CHECK (VALUE ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Positive integer
CREATE DOMAIN positive_int AS INTEGER
CHECK (VALUE > 0);

-- US ZIP code
CREATE DOMAIN us_zipcode AS VARCHAR(10)
CHECK (VALUE ~ '^\d{5}(-\d{4})?$');

-- Use it in a table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    user_email email,
    age positive_int
);
2. Create a type that groups multiple fields together

-- Create an address type
CREATE TYPE address AS (
    street VARCHAR(100),
    city VARCHAR(50),
    state VARCHAR(2),
    zipcode VARCHAR(10)
);

-- Use it in a table
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    home_address address,
    work_address address
);

-- Insert data
INSERT INTO customers (name, home_address) 
VALUES ('John Doe', ROW('123 Main St', 'Boston', 'MA', '02101'));

-- Query composite type
SELECT name, (home_address).city FROM customers;

3. Create a enum type with a fixed set of values

-- Create enum type
CREATE TYPE order_status AS ENUM (
    'pending', 
    'processing', 
    'shipped', 
    'delivered', 
    'cancelled'
);

-- Use it
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    status order_status DEFAULT 'pending'
);

INSERT INTO orders (status) VALUES ('processing');

4. Null types
### Null types in SQL

- NULL represents "unknown / missing" — not the same as zero or empty string.
- SQL uses three-valued logic: TRUE, FALSE, UNKNOWN. Any comparison with NULL yields UNKNOWN (treated like false in WHERE filtering).

Key points and usage
- Test for null explicitly:
    - Use IS NULL / IS NOT NULL
    - Do not use `= NULL` or `<> NULL` (they return NULL/UNKNOWN).
- Treat NULLs as equal:
    - `IS NOT DISTINCT FROM` / `IS DISTINCT FROM` — useful for safe equality that treats NULL = NULL.
- Coalescing and null-producing functions:
    - COALESCE(a, b, ...) → first non-null
    - NULLIF(a, b) → returns NULL when a = b, else a
- Aggregates:
    - COUNT(*) counts rows; COUNT(column) counts non-null values
    - SUM/AVG/MIN/MAX ignore NULLs
    - Use FILTER or COALESCE to control behavior: `COUNT(col) FILTER (WHERE col IS NOT NULL)` or `SUM(coalesce(x,0))`
- Constraints:
    - NOT NULL prevents nulls at column level
    - UNIQUE allows multiple NULLs (NULLs are not considered equal); use partial unique index `CREATE UNIQUE INDEX ON t(col) WHERE col IS NOT NULL` to enforce uniqueness only for non-null values.
    - CHECK can validate NULLs explicitly (`CHECK (col IS NOT NULL AND ...)`)
- Indexes and NULL:
    - B-tree indexes include entries for NULLs; use partial indexes to index only non-null values for space/performance.
- Ordering:
    - ORDER BY ... NULLS FIRST / NULLS LAST controls sort position of NULLs.
- Comparisons and joins:
    - NULL in JOIN keys behaves like any other value but two NULLs do not match in an equijoin (`ON a.col = b.col` will not match NULL to NULL)
    - Use `IS NOT DISTINCT FROM` in join condition if you want NULL= NULL matching.
- JSON/JSONB:
    - Missing key vs explicit JSON null: `jsonb` may return SQL NULL for missing keys; an explicit `null` value inside JSON is distinct. Use existence operators (`?`, `?&`) to detect key presence.
- Storage/performance:
    - Nullability has small storage overhead (null bitmap). Prefer NOT NULL for frequently queried columns to allow optimizer assumptions and fewer checks.
- Best practices
    - Declare NOT NULL whenever a value is required.
    - Use domain constraints or migrations to transition nullable columns to NOT NULL with a default and backfill.
    - Prefer COALESCE at read-time for presentation defaults; prefer constraints for data integrity.
    - Be explicit in predicates: `IS NULL`, `IS NOT NULL`, `IS NOT DISTINCT FROM` to avoid surprises from three-valued logic.

Examples

-- explicit null check
SELECT * FROM users WHERE last_login IS NULL;

-- coalesce for defaults
SELECT id, COALESCE(display_name, username, 'anonymous') AS name FROM users;

-- safe equality (treat NULL = NULL)
SELECT * FROM a JOIN b ON a.x IS NOT DISTINCT FROM b.x;

-- enforce uniqueness for non-null values
CREATE UNIQUE INDEX users_email_unique_not_null ON users (email) WHERE email IS NOT NULL;

-- count behavior
SELECT COUNT(*) AS rows, COUNT(email) AS emails_present FROM users;

-- prevent nulls at schema level
ALTER TABLE orders ALTER COLUMN total SET NOT NULL;

5. BASE TYPES: create with C language

CREATE TYPE complex_number (
    INPUT = complex_in,
    OUTPUT = complex_out,
    INTERNALLENGTH = 16,
    ALIGNMENT = double
);
6. RANGE TYPES:

-- Create a custom range type for dates
CREATE TYPE daterange AS RANGE (
    subtype = date
);

-- Use it
CREATE TABLE reservations (
    id SERIAL PRIMARY KEY,
    room_number INTEGER,
    booking_period daterange
);

INSERT INTO reservations (room_number, booking_period)
VALUES (101, '[2025-11-01, 2025-11-05)');

