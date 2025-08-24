import { PrismaClient } from '@prisma/client';
import { pino } from 'pino';

export const logger = pino({ transport: { target: 'pino-pretty' } });
export const prisma = new PrismaClient();
