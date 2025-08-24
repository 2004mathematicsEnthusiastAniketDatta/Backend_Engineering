import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { pino } from 'pino';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const logger = pino({ transport: { target: 'pino-pretty' } });
const prisma = new PrismaClient();

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] }));
app.use(compression());
app.use(express.json());
app.use(rateLimit({ windowMs: 60_000, max: 120 }));

// Health
app.get('/health', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ status: 'error' });
  }
});

// Todo validation
const TodoCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional().default(''),
});

const TodoUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  completed: z.boolean().optional(),
});

// CRUD routes
app.get('/api/todos', async (_req, res, next) => {
  try {
    const todos = await prisma.todo.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(todos);
  } catch (err) { next(err); }
});

app.post('/api/todos', async (req, res, next) => {
  try {
    const data = TodoCreateSchema.parse(req.body);
    const todo = await prisma.todo.create({ data });
    res.status(201).json(todo);
  } catch (err) { next(err); }
});

app.get('/api/todos/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const todo = await prisma.todo.findUnique({ where: { id } });
    if (!todo) return res.status(404).json({ message: 'Not found' });
    res.json(todo);
  } catch (err) { next(err); }
});

app.patch('/api/todos/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const data = TodoUpdateSchema.parse(req.body);
    const todo = await prisma.todo.update({ where: { id }, data });
    res.json(todo);
  } catch (err) { next(err); }
});

app.delete('/api/todos/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.todo.delete({ where: { id } });
    res.status(204).send();
  } catch (err) { next(err); }
});

// Error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(err);
  if (err?.name === 'ZodError') {
    return res.status(400).json({ message: 'Invalid request', errors: err.errors });
  }
  if (err?.code === 'P2025') {
    return res.status(404).json({ message: 'Not found' });
  }
  res.status(500).json({ message: 'Internal server error' });
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  logger.info(`Server listening on http://localhost:${port}`);
});
