import { z } from 'zod';

import {
  createListSchema,
  dateSchema,
  generateZodSchema,
} from 'src/modules/app/dto';
import { origin } from './interfaces';

export const schema = generateZodSchema(origin);

export const media = z.object({
  id: z.string().trim(),
});

export const createSchema = z.object({
  userId: z.string().trim(),
  name: z.string(),
  addMedias: z.array(media).optional(),
  removeMedias: z.array(media).optional(),
});

export const listSchema = createListSchema({
  id: z.string().trim().optional(),
  name: z.string().trim().optional(),
  createdAt: dateSchema.optional(),
});

export const findSchema = z.object({
  id: z.string().trim(),
  userId: z.string().trim(),
});

export const updateSchema = z.object({
  id: z.string().trim(),
  userId: z.string().trim(),
  name: z.string().trim().optional(),
  addMedias: z.array(media).optional(),
  removeMedias: z.array(media).optional(),
});

export const removeSchema = z.object({
  id: z.string().trim(),
  userId: z.string().trim(),
});
