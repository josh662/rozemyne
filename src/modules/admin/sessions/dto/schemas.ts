import { z } from 'zod';

import {
  createListSchema,
  dateSchema,
  generateZodSchema,
} from 'src/modules/app/dto';
import { origin } from './interfaces';

export const schema = generateZodSchema(origin);

export const ipAddress = z.union([z.ipv4(), z.ipv6()]);
export const userAgent = z.string();

export const createSchema = z.object({
  userId: z.string().trim(),
  success: z.boolean(),
  error: z.string().trim().optional(),
  ipAddress: ipAddress.optional(),
  userAgent: userAgent.optional(),
});

export const listSchema = createListSchema({
  id: z.string().trim().optional(),
  number: z.int().optional(),
  success: z.coerce.boolean().optional(),
  error: z.string().trim().optional(),
  ipAddress: z.string().trim().optional(),
  userAgent: z.string().trim().optional(),
  expiredAt: dateSchema.optional(),
  createdAt: dateSchema.optional(),
});

export const findSchema = z.object({
  id: z.string().trim(),
  userId: z.string().trim(),
});

export const updateSchema = z.object({
  id: z.string().trim(),
  userId: z.string().trim(),
});

export const removeSchema = z.object({
  id: z.string().trim(),
  userId: z.string().trim(),
});
