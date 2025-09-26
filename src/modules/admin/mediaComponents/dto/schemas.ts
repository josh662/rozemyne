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
  group: z.string().trim(),
  number: z.int(),
  title: z.string().trim().optional(),
  description: z.string().trim().optional(),
  duration: z.int(),
  releaseDate: dateSchema.optional(),
});

export const listSchema = createListSchema({
  id: z.string().trim().optional(),
  mediaId: z.string().trim().optional(),
  group: z.string().trim().optional(),
  number: z.int().optional(),
  title: z.string().trim().optional(),
  description: z.string().trim().optional(),
  duration: z.int().optional(),
  releaseDate: dateSchema.optional(),
  createdAt: dateSchema.optional(),
});

export const findSchema = z.object({
  id: z.string().trim(),
  mediaId: z.string().trim(),
});

export const updateSchema = z.object({
  id: z.string().trim(),
  mediaId: z.string().trim(),
  group: z.string().trim().optional(),
  number: z.int().optional(),
  title: z.string().trim().optional(),
  description: z.string().trim().optional(),
  duration: z.int().optional(),
  releaseDate: dateSchema.optional(),
});

export const removeSchema = z.object({
  id: z.string().trim(),
  mediaId: z.string().trim(),
});
