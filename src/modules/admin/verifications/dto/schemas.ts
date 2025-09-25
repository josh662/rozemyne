import { z } from 'zod';

import {
  createListSchema,
  dateSchema,
  generateZodSchema,
} from 'src/modules/app/dto';
import { origin } from './interfaces';
import { EVerificationType } from '@prisma/client';

export const schema = generateZodSchema(origin);

const verificationType = z.enum([
  EVerificationType.EMAIL,
  EVerificationType.PHONE,
  EVerificationType.PASSWORD,
]);

export const createSchema = z.object({
  userId: z.string().trim(),
  type: verificationType,
  value: z.string().trim(),
});

export const listSchema = createListSchema({
  id: z.string().trim().optional(),
  userId: z.string().trim().optional(),
  type: verificationType.optional(),
  value: z.string().trim().optional(),
  expiredAt: dateSchema.optional(),
  createdAt: dateSchema.optional(),
});

export const findSchema = z.object({
  id: z.string().trim(),
});

export const updateSchema = z.object({
  id: z.string().trim(),
});

export const removeSchema = z.object({
  id: z.string().trim(),
});
