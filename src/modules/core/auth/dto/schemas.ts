import { z } from 'zod';

import { password } from 'src/modules/admin/users/dto';
import { ipAddress, userAgent } from 'src/modules/admin/sessions/dto';

export const registerSchema = z.object({
  firstName: z.string().trim(),
  lastName: z.string().trim(),
  email: z.email().trim(),
  phoneNumber: z.string().trim().optional(),
  password,
});

export const loginSchema = z.object({
  email: z.email().trim(),
  password,
  totp: z
    .string()
    .regex(/^\d{6}$/, 'O código MFA deve ter exatamente 6 dígitos numéricos')
    .optional(),
  ipAddress: ipAddress.optional(),
  userAgent: userAgent.optional(),
});

export const recoverySchema = z.object({
  email: z.email().trim(),
});

export const verifySchema = z.object({
  code: z.string().length(6).trim(),
  newPassword: password.optional(),
});
