# Prisma — In-Depth Guide (practical, concise)

This README gives a practical, opinionated, and in-depth walkthrough of Prisma for building reliable, maintainable data access layers in Node.js/TypeScript projects.

---

## What Prisma is (short)
- Type-safe ORM / query builder for Node.js (TypeScript-first).
- Single source of truth: the Prisma schema (.prisma) defines models, relations and generates a typed Prisma Client.
- Works well with PostgreSQL, MySQL, SQLite, SQL Server, CockroachDB.

---

## Quick start (minimal steps)
1. Install and init
    - npm: `npm install prisma @prisma/client --save-dev`
    - init: `npx prisma init` (creates schema.prisma, .env, prisma/ folder)
2. Define models in `prisma/schema.prisma`.
3. Generate client: `npx prisma generate`
4. Create migration and apply: `npx prisma migrate dev --name init`
5. Use in code:
```ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

await prisma.user.create({ data: { email: 'a@b.com', name: 'Alice' } });
```

---

## Prisma Schema essentials
- Model example:
```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  posts     Post[]
  createdAt DateTime @default(now())
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
  @@index([published, authorId])
}
```
- Key concepts: scalar fields, relations, @id, @unique, @default, enums, @@index, @@unique, composite indexes.

---

## Relations & Referential Actions
- Use explicit foreign keys with `fields` and `references`.
- Referential actions: `onDelete`, `onUpdate` (e.g., `onDelete: Cascade`).
- Relation scalar fields are first-class — avoid extra queries by including them.

---

## Migrations
- Local development: `npx prisma migrate dev --name <desc>`
- Production: `npx prisma migrate deploy`
- Inspect SQL: `npx prisma migrate diff` or `prisma migrate status`
- Keep migrations in VCS, use CI to run `prisma migrate deploy`.

---

## Type-safe Prisma Client
- Generated types for models, queries and selects.
- Select vs include:
  - `select` picks scalar fields.
  - `include` fetches related models.
```ts
// include
prisma.post.findMany({ include: { author: true } });
// select
prisma.user.findUnique({ select: { id: true, email: true } });
```
- Use `findFirst`, `findUnique`, `findMany`, `create`, `update`, `delete`, `upsert`.

---

## Query patterns & best practices
- Avoid N+1: use `include`, or batch queries in a single query.
- Pagination: cursor-based for scalability.
```ts
prisma.post.findMany({ take: 10, cursor: { id: lastId }, skip: 1 });
```
- Filtering/sorting: compose `where` and `orderBy` with typed fields.

---

## Transactions
- Simple transaction:
```ts
await prisma.$transaction([
  prisma.user.update(...),
  prisma.post.create(...)
]);
```
- Interactive transaction (callback) for automatic retries:
```ts
await prisma.$transaction(async (tx) => {
  await tx.user.update(...);
  await tx.post.create(...);
});
```
- Use transactions for multi-statement consistency; be careful with long-running transactions.

---

## Raw SQL
- For operations Prisma can't express:
```ts
await prisma.$queryRaw`SELECT * FROM "Post" WHERE "title" = ${title}`;
await prisma.$executeRaw`UPDATE "User" SET "active" = true WHERE "id" = ${id}`;
```
- Prefer parameterized queries (`$queryRaw` with template) to avoid SQL injection.

---

## Indexes & Performance
- Add database indexes in schema with `@@index` or `@index`.
- Use composite indexes for common multi-column filters/sorts.
- Monitor slow queries, EXPLAIN plans; adjust indexes accordingly.
- Connection pooling: use a pooler (PgBouncer) in serverless or high-concurrency environments to avoid connection limits.

---

## Seeding
- Add a script in package.json: `"seed": "ts-node prisma/seed.ts"`
- Example seed:
```ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.user.create({ data: { email: 'a@b.com', name: 'Seed' } });
}
main();
```
- Run with `npx prisma db seed` (configure `prisma.seed` in schema or package.json scripts).

---

## Testing strategies
- Use SQLite in-memory or ephemeral Docker DB for unit tests.
- Reset DB between tests: `prisma migrate reset` or truncate tables.
- For integration tests, create a fresh database per CI job.

---

## Deployment notes
- Set DATABASE_URL env var in production.
- Run `npx prisma generate` during build.
- Run `npx prisma migrate deploy` as part of deploy pipeline.
- Use a connection pooler (PgBouncer) for serverless / many-instance setups.
- Monitor connection count and query throughput.

---

## Error handling & retries
- Catch Prisma errors (PrismaClientKnownRequestError, PrismaClientValidationError).
- Handle unique constraint violations by code using error codes (e.g., P2002).
- Implement retries for transient DB errors with exponential backoff.

---

## Common pitfalls
- Using `findFirst` vs `findUnique`: `findUnique` requires a unique field or composite unique.
- Not handling large relations: avoid fetching huge arrays—use pagination.
- Long-lived PrismaClient instances: reuse a single client (avoid creating one per request).
- Failing to set proper connection pooler for serverless.

---

## Best practices summary
- Keep Prisma schema as the single source of truth.
- Keep client instantiation global/reused (e.g., attach to global in dev).
- Use migrations in VCS and run deploy migrations via CI/CD.
- Prefer typed Prisma Client queries & avoid raw SQL except when necessary.
- Design schema with indexes and relations that match query patterns.
- Use cursor pagination and transactions appropriately.
- Add observability: query logging, slow-query alerts.

---

## Useful commands
- Init: `npx prisma init`
- Generate client: `npx prisma generate`
- Dev migrate: `npx prisma migrate dev --name desc`
- Deploy migrate: `npx prisma migrate deploy`
- Studio UI: `npx prisma studio`
- Reset DB: `npx prisma migrate reset`

---

Further reading: Prisma docs, SQL indexing fundamentals, transaction isolation levels, and production connection pooling patterns.

This file is a compact reference. For examples, add a `prisma/` folder with schema, `prisma/seed.ts`, and a `src/db.ts` to instantiate the PrismaClient.
