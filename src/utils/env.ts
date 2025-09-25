import { z } from 'zod';

export const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'production']),
  SERVER_PORT: z.coerce.number(),
  SERVER_NAME: z.string().trim(),
  PUBLIC_NAME: z.string().trim(),
  SYSTEM_KEY: z.string().min(8).trim(),

  FETCH_LIMIT: z.coerce.number(),

  DEFAULT_SERVICE_VERSION: z.coerce.number().optional(),

  // Security
  CORS_ENABLED: z.coerce.boolean(),
  CORS_ORIGIN: z.string(),
  CORS_METHODS: z.string().trim(),
  CORS_CREDENTIALS: z.coerce.boolean(),

  JWT_PERIOD: z.string().trim(),

  // Database
  DATABASE_URL: z.url().trim(),

  REDIS_URL: z.url().trim(),

  CACHE_DEFAULT_TTL: z.coerce.number(),
});

function createZodDto<T extends z.ZodObject<any>>(schema: T) {
  class ZodDtoClass {}

  const shape = schema.shape;

  for (const key in shape) {
    Object.defineProperty(ZodDtoClass.prototype, key, {
      value: undefined,
      writable: true,
      enumerable: true,
    });
  }

  return ZodDtoClass as {
    new (): z.infer<T>;
  };
}

export class EnvDto extends createZodDto(envSchema) {}
export type TEnv = EnvDto;
