import { Router } from 'express';
import { prisma } from '../lib/context';
import { TodoCreateSchema, TodoUpdateSchema } from '../schemas/todo';

const router = Router();

router.get('/todos', async (_req, res, next) => {
  try {
    const todos = await prisma.todo.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(todos);
  } catch (err) { next(err); }
});

router.post('/todos', async (req, res, next) => {
  try {
    const data = TodoCreateSchema.parse(req.body);
    const todo = await prisma.todo.create({ data });
    res.status(201).json(todo);
  } catch (err) { next(err); }
});

router.get('/todos/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const todo = await prisma.todo.findUnique({ where: { id } });
    if (!todo) return res.status(404).json({ message: 'Not found' });
    res.json(todo);
  } catch (err) { next(err); }
});

router.patch('/todos/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const data = TodoUpdateSchema.parse(req.body);
    const todo = await prisma.todo.update({ where: { id }, data });
    res.json(todo);
  } catch (err) { next(err); }
});

router.delete('/todos/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.todo.delete({ where: { id } });
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
