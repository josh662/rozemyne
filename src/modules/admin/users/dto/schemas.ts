import { z } from 'zod';

import { EUserStatus } from 'src/prisma';
import {
  createListSchema,
  dateSchema,
  generateZodSchema,
} from 'src/modules/app/dto';
import { origin } from './interfaces';

export const schema = generateZodSchema(origin, ['password', 'mfaSecret']);

export const password = z
  .string()
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9\s])\S{8,}$/,
    'Senha deve ter no mínimo 8 caracteres, incluindo uma letra maiúscula, uma letra minúscula e um caractere especial.',
  )
  .trim();

export const status = z.enum([
  EUserStatus.ACTIVE,
  EUserStatus.SUSPENDED,
  EUserStatus.DELETED,
]);

export const createSchema = z.object({
  status: status.optional(),
  firstName: z.string().trim(),
  lastName: z.string().trim(),
  email: z.email().trim(),
  emailVerifiedAt: z.iso.date().optional(),
  phoneNumber: z.string().trim().optional(),
  phoneNumberVerifiedAt: z.iso.date().optional(),
  cpfCnpj: z.string().trim().optional(),
  password,
  metadata: z.record(z.string(), z.any()).optional(),
});

export const listSchema = createListSchema({
  id: z.string().trim().optional(),
  status: z.string().trim().optional(),
  firstName: z.string().trim().optional(),
  lastName: z.string().trim().optional(),
  email: z.string().trim().optional(),
  emailVerifiedAt: dateSchema.nullable().optional(),
  phoneNumber: z.string().trim().optional(),
  phoneNumberVerifiedAt: dateSchema.nullable().optional(),
  cpfCnpj: z.string().trim().optional(),
  totpEnabled: z.coerce.boolean().optional(),
  createdAt: dateSchema.optional(),
});

export const findSchema = z.object({
  id: z.string().trim(),
});

export const updateSchema = z.object({
  id: z.string().trim(),
  status: status.optional(),
  firstName: z.string().trim().optional(),
  lastName: z.string().trim().optional(),
  email: z.email().trim().optional(),
  emailVerifiedAt: z.iso.date().nullable().optional(),
  phoneNumber: z.string().trim().optional(),
  phoneNumberVerifiedAt: z.iso.date().nullable().optional(),
  cpfCnpj: z.string().trim().optional(),
  password: password.optional(),
  totpEnabled: z.boolean().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const removeSchema = z.object({
  id: z.string().trim(),
});

export const totpSchema = z.object({
  userId: z.string().trim(),
});
