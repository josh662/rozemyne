import { z } from 'zod';

import {
  createListSchema,
  dateSchema,
  generateZodSchema,
} from 'src/modules/app/dto';
import { origin } from './interfaces';
import { ESaveStatus } from '@prisma/client';

export const schema = generateZodSchema(origin);

export const saveStatus = z.enum([
  ESaveStatus.INTERESTED,
  ESaveStatus.SEEING,
  ESaveStatus.ABANDONED,
]);

export const createSchema = z.object({
  mediaId: z.string().trim(),
  userId: z.string().trim(),
  mediaComponentId: z.string().trim().optional(),
  mediaComponentIn: z.int().optional(),
  status: saveStatus,
});

export const listSchema = createListSchema({
  id: z.string().trim().optional(),
  mediaId: z.string().trim().optional(),
  userId: z.string().trim().optional(),
  mediaComponentId: z.string().trim().optional(),
  status: saveStatus.optional(),
  createdAt: dateSchema.optional(),
});

export const findSchema = z.object({
  id: z.string().trim(),
});

export const updateSchema = z.object({
  id: z.string().trim(),
  mediaComponentId: z.string().trim().optional(),
  mediaComponentIn: z.int().optional(),
  status: saveStatus.optional(),
});

export const removeSchema = z.object({
  id: z.string().trim(),
});
