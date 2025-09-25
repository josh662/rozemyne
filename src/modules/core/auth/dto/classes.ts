import { createZodDto } from 'nestjs-zod';
import {
  registerSchema,
  loginSchema,
  verifySchema,
  recoverySchema,
} from './schemas';

export class RegisterDto extends createZodDto(registerSchema) {}
export class LoginDto extends createZodDto(loginSchema) {}
export class RecoveryDto extends createZodDto(recoverySchema) {}
export class VerifyDto extends createZodDto(verifySchema) {}
