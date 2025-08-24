import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/context';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(err);
  if (err?.name === 'ZodError') {
    return res.status(400).json({ message: 'Invalid request', errors: err.errors });
  }
  if (err?.code === 'P2025') {
    return res.status(404).json({ message: 'Not found' });
  }
  res.status(500).json({ message: 'Internal server error' });
};
