import { z } from 'zod';

import {
  createListSchema,
  dateSchema,
  generateZodSchema,
} from 'src/modules/app/dto';
import { origin } from './interfaces';

export const schema = generateZodSchema(origin);

export const createSchema = z.object({
  mediaId: z.string().trim(),
  userId: z.string().trim(),
  mediaComponentId: z.string().trim().optional(),
  content: z.string(),
  spoiler: z.boolean().optional(),
});

export const listSchema = createListSchema({
  id: z.string().trim().optional(),
  userId: z.string().trim().optional(),
  mediaComponentId: z.string().trim().optional(),
  content: z.string().trim().optional(),
  spoiler: z.boolean().optional(),
  createdAt: dateSchema.optional(),
});

export const findSchema = z.object({
  id: z.string().trim(),
  mediaId: z.string().trim(),
});

export const updateSchema = z.object({
  id: z.string().trim(),
  mediaId: z.string().trim(),
  content: z.string().trim().optional(),
  spoiler: z.boolean().optional(),
});

export const removeSchema = z.object({
  id: z.string().trim(),
  mediaId: z.string().trim(),
});
