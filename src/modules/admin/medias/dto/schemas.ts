import { z } from 'zod';

import { EMediaType } from 'src/prisma';
import {
  createListSchema,
  dateSchema,
  generateZodSchema,
} from 'src/modules/app/dto';
import { origin } from './interfaces';

export const schema = generateZodSchema(origin);

export const mediaType = z.enum([
  EMediaType.MOVIE,
  EMediaType.SERIES,
  EMediaType.MANGA,
  EMediaType.COMICS,
]);

export const createSchema = z.object({
  name: z.string().trim(),
  description: z.string().trim().optional(),
  type: mediaType,
  rating: z.float32().optional(),
  releaseDate: z.iso.date().optional(),
});

export const listSchema = createListSchema({
  id: z.string().trim().optional(),
  name: z.string().trim().optional(),
  description: z.string().trim().optional(),
  type: mediaType.optional(),
  rating: z.float32().optional(),
  releaseDate: z.iso.date().optional(),
  createdAt: dateSchema.optional(),
});

export const findSchema = z.object({
  id: z.string().trim(),
});

export const updateSchema = z.object({
  id: z.string().trim(),
  name: z.string().trim().optional(),
  description: z.string().trim().optional(),
  type: mediaType.optional(),
  rating: z.float32().optional(),
  releaseDate: z.iso.date().optional(),
});

export const removeSchema = z.object({
  id: z.string().trim(),
});
