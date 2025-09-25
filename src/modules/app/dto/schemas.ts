import { z } from 'zod';
import { Prisma, PrismaClient } from '@prisma/client';
import * as prismaOptions from '@prisma/client';
import { originToSingular } from 'src/routes';

const prisma = new PrismaClient();

export type ModelName = Prisma.ModelName;

interface IPrismaField {
  modelName: string;
  name: string;
  typeName: string;
  isList: boolean;
  isEnum: boolean;
}

export function getModelFields(model: ModelName): Array<IPrismaField> {
  const fields: Array<IPrismaField> = [];

  for (const field in prisma[model].fields) {
    const fieldRef = prisma[model].fields[field] as IPrismaField;
    fields.push(fieldRef);
  }
  return fields;
}

export function generateZodSchema(origin: string, ignoreFields: string[] = []) {
  const modelName = originToSingular(origin) as ModelName;
  const model = prisma[modelName];
  if (!model) throw new Error(`Model ${modelName} não encontrado`);

  const shape: Record<string, any> = {};
  const fields = getModelFields(modelName);

  for (const field of fields) {
    if (ignoreFields.includes(field.name)) {
      continue;
    }

    let schema;

    if (field.isEnum) {
      const enumValues: Array<string> = Object.values(
        prismaOptions[field.typeName],
      );
      schema = z.enum(enumValues);
    } else {
      switch (field.typeName) {
        case 'String':
          schema = z.string();
          break;
        case 'Int':
        case 'BigInt':
          schema = z.number();
          break;
        case 'Float':
        case 'Decimal':
          schema = z.number();
          break;
        case 'Boolean':
          schema = z.boolean();
          break;
        case 'DateTime':
          schema = z.iso.date();
          break;
        case 'Json':
          schema = z.record(z.string(), z.any());
          break;
        default:
          schema = z.any();
          break;
      }
    }

    if (schema) {
      shape[field.name] = schema;
    }
  }

  return z.object(shape);
}

// Métodos de filtro permitidos
const methods = [
  'eql',
  'not',
  'ctn',
  'edw',
  'stw',
  'gt0',
  'gte',
  'lt0',
  'lte',
] as const;

// Schema base
export const baseListSchema = z.object({
  cursorKey: z.enum(['id']).optional(),
  cursor: z.string().optional(),
  page: z.coerce.number().min(0).optional(),
  take: z.coerce
    .number()
    .min(0)
    .max(+(process.env.FETCH_LIMIT || 50))
    .optional(),
  orderBy: z.string().optional(),
  desc: z.any().optional(),
  search: z.string().optional(),
});

export function createListSchema<T extends Record<string, z.ZodTypeAny>>(
  validKeys: T,
) {
  const dynamicFilters = Object.fromEntries(
    Object.entries(validKeys).flatMap(([key, schema]) =>
      methods.map((method) => [`${method}|${key}`, schema]),
    ),
  ) as {
    [K in `${(typeof methods)[number]}|${Extract<keyof T, string>}`]: T[Extract<
      K,
      string
    > extends `${string}|${infer Key}`
      ? Key
      : never];
  };

  return baseListSchema.extend(dynamicFilters);
}

// Regex para string ISO 8601 (UTC com Z)
const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;

export const dateSchema = z
  .union([
    z.iso.date(), // já é Date válido
    z
      .string()
      .trim()
      .refine((val) => isoDateRegex.test(val), {
        message: 'Data inválida, deve estar no formato ISO 8601',
      }),
  ])
  .transform((val) => (typeof val === 'string' ? new Date(val) : val));
