import { ApiProperty } from '@nestjs/swagger';
import { DefaultResponse, ListCursorDto, ListOffsetDto } from './classes';

// WRAPPER LISTA
export const GetListClass = <TModel extends new (...args: any[]) => any>(
  model: TModel,
  mode: 'offset' | 'cursor' = 'offset',
) => {
  if (mode === 'offset') {
    class OffsetList extends ListOffsetDto<InstanceType<TModel>> {
      @ApiProperty({ isArray: true, type: model })
      // @ts-expect-error: a
      data: InstanceType<TModel>[];
    }
    return OffsetList;
  }

  class CursorList extends ListCursorDto<InstanceType<TModel>> {
    @ApiProperty({ isArray: true, type: model })
    // @ts-expect-error: a
    data: InstanceType<TModel>[];
  }
  return CursorList;
};

// 🔑 WRAPPER DEFAULT RESPONSE + payload dinâmico
export const WithPayload = <TPayload extends new (...args: any[]) => any>(
  payloadClass: TPayload,
  suffix?: string,
) => {
  const className = `Response${suffix ?? ''}`;

  class ResponseClass extends DefaultResponse {
    // Aqui o tipo é simplesmente TPayload (classe concreta)
    @ApiProperty({ type: payloadClass })
    // @ts-expect-error: a
    payload!: InstanceType<TPayload>;
  }

  // Nome dinâmico para evitar conflito de Swagger
  Object.defineProperty(ResponseClass, 'name', { value: className });

  return ResponseClass;
};
