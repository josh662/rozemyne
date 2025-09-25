import { createZodDto } from 'nestjs-zod';
import {
  schema,
  createSchema,
  listSchema,
  findSchema,
  updateSchema,
  removeSchema,
} from './schemas';

export class BaseDto extends createZodDto(schema) {}
export class CreateDto extends createZodDto(createSchema) {}
export class ListDto extends createZodDto(listSchema) {}
export class FindDto extends createZodDto(findSchema) {}
export class UpdateDto extends createZodDto(updateSchema) {}
export class RemoveDto extends createZodDto(removeSchema) {}
