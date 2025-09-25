import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiBody,
  ApiExtraModels,
  ApiParam,
  ApiQuery,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';

import { GetListClass, WithPayload } from './functions';
import { PayloadId } from './classes';
import { formatted } from 'src/utils';

// Criação e atualização retornando o ID do recurso
export function ApiIdResponse(status: HttpStatus = HttpStatus.CREATED) {
  const Wrapped = WithPayload(PayloadId, 'Id');

  return applyDecorators(
    HttpCode(status),
    ApiExtraModels(Wrapped),
    ApiResponse({
      status,
      type: Wrapped,
    }),
  );
}

// Listagem com paginação (offset ou cursor)
export function ApiListResponse<TModel extends new (...args: any[]) => any>(
  origin: string,
  model: TModel,
  mode: 'offset' | 'cursor' = 'offset',
) {
  const Offset = GetListClass(model, 'offset');
  const Cursor = GetListClass(model, 'cursor');

  Object.defineProperty(Offset, 'name', {
    value: `${formatted(origin)}OffsetList`,
  });

  Object.defineProperty(Cursor, 'name', {
    value: `${formatted(origin)}CursorList`,
  });

  const Wrapped = WithPayload(
    mode === 'offset' ? Offset : Cursor,
    `${formatted(origin)}List`,
  );

  return applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiExtraModels(Offset, Cursor, Wrapped),
    ApiResponse({
      status: HttpStatus.OK,
      description: `Returning listing data from model "${origin}"`,
      type: Wrapped,
      schema: {
        oneOf: [
          { $ref: getSchemaPath(WithPayload(Offset)) },
          { $ref: getSchemaPath(WithPayload(Cursor)) },
        ],
      },
    }),
  );
}

export function ApiRecordResponse<TModel extends new (...args: any[]) => any>(
  origin: string,
  model: TModel,
) {
  const Wrapped = WithPayload(model, `${formatted(origin)}Record`);

  return applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiExtraModels(Wrapped),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Return of a single record',
      type: Wrapped,
    }),
  );
}

// Resposta sem conteúdo
export function ApiNoContentResponse() {
  return applyDecorators(
    HttpCode(HttpStatus.NO_CONTENT),
    ApiResponse({
      status: HttpStatus.NO_CONTENT,
      description: 'The request was successful but there is no response back',
    }),
  );
}

interface ISwaggerConfig {
  origin: string;
  reqDto?: Function;
  resDto?: new (...args: any[]) => any;
}

export function SwaggerCreate(config: ISwaggerConfig) {
  if (config.reqDto) {
    Object.defineProperty(config.reqDto, 'name', {
      value: `${formatted(config.origin)}CreateDto`,
    });
  }

  return applyDecorators(
    config.reqDto ? ApiBody({ type: config.reqDto }) : () => {},
    ApiIdResponse(),
  );
}

export function SwaggerList(config: ISwaggerConfig) {
  if (config.resDto) {
    Object.defineProperty(config.resDto, 'name', {
      value: `${formatted(config.origin)}Dto`,
    });
  }

  return applyDecorators(
    ApiQuery({ type: config.reqDto }),
    config.resDto ? ApiListResponse(config.origin, config.resDto) : () => {},
  );
}

export function SwaggerFind(config: ISwaggerConfig) {
  if (config.resDto) {
    Object.defineProperty(config.resDto, 'name', {
      value: `${formatted(config.origin)}Dto`,
    });
  }

  return applyDecorators(
    ApiParam({ name: 'id', type: String }),
    config.resDto ? ApiRecordResponse(config.origin, config.resDto) : () => {},
  );
}

export function SwaggerUpdate(config: ISwaggerConfig) {
  if (config.reqDto) {
    Object.defineProperty(config.reqDto, 'name', {
      value: `${formatted(config.origin)}UpdateDto`,
    });
  }

  return applyDecorators(
    ApiParam({ name: 'id', type: String }),
    ApiBody({ type: config.reqDto }),
    ApiIdResponse(HttpStatus.OK),
  );
}

export function SwaggerRemove(config: ISwaggerConfig) {
  return applyDecorators(
    ApiParam({ name: 'id', type: String }),
    ApiNoContentResponse(),
  );
}

export function SwaggerCustom(config: ISwaggerConfig) {
  if (config.resDto) {
    Object.defineProperty(config.resDto, 'name', {
      value: `${formatted(config.origin)}${config.resDto?.name}`,
    });
  }

  return applyDecorators(
    HttpCode(HttpStatus.OK),
    config.reqDto ? ApiBody({ type: config.reqDto }) : () => {},
    config.resDto
      ? (ApiExtraModels(config.resDto),
        ApiResponse({
          status: HttpStatus.OK,
          description: 'Request return',
          type: config.resDto,
        }))
      : () => {},
  );
}
