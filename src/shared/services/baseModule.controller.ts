import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { z } from 'zod';

@Injectable()
export class BaseModuleController {
  validate(
    req: Request,
    res: Response,
    schema?: z.ZodObject<any>,
  ): { req: Request; res: Response } {
    const content = {
      ...req.query,
      ...req.body,
      ...req.params,
    };

    // Pega o schema passado na requisição (que pode ser definido no authGuard)
    // ou o schema opcionalmente passado direto no método como fallback
    schema = req['schema'] || schema;

    // Se nenhum schema for fornecido gera um erro
    if (!schema) {
      throw new HttpException(
        'ERR_SCHEMA_NOT_CONFIGURED',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const parsed = schema.safeParse(content);
    if (!parsed.success) {
      throw new HttpException(
        {
          message: 'ERR_INVALID_FORMAT',
          payload: {
            name: parsed.error.name,
            issues: parsed.error.issues,
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    req['content'] = { ...parsed.data };
    return { req, res };
  }
}
