import { createZodDto } from 'nestjs-zod';
import {
  accountSchema,
  accountUpdateSchema,
  changeTotpSchema,
} from './schemas';

export class AccountDto extends createZodDto(accountSchema) {}
export class AccountUpdateDto extends createZodDto(accountUpdateSchema) {}
export class AccountChangeTotpDto extends createZodDto(changeTotpSchema) {}
