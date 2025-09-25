import { z } from 'zod';
import { password } from 'src/modules/admin/users/dto';

export const accountSchema = z.object({});

export const accountUpdateSchema = z.object({
  firstName: z.string().trim().optional(),
  lastName: z.string().trim().optional(),
  email: z.email().trim().optional(),
  phoneNumber: z.string().trim().optional(),
  cpfCnpj: z.string().trim().optional(),
  password: password.optional(),
  newPassword: password.optional(),
});

export const changeTotpSchema = z.object({
  totp: z.string().trim(),
});
