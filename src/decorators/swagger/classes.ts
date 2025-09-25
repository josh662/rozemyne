import { ApiProperty } from '@nestjs/swagger';

import { IListCursor, IListOffset, IResponse } from 'src/interfaces';

export class DefaultResponse implements IResponse {
  @ApiProperty()
  statusCode: number;

  @ApiProperty({ required: false })
  message?: string;

  @ApiProperty({ required: false })
  error?: string;

  @ApiProperty()
  payload?: any;
}

export class PayloadId {
  @ApiProperty({
    description: 'The unique identifier of the resource',
    required: true,
    type: 'string',
    example: 'ulid',
  })
  id: string;
}

// MODELOS BASE
export class ListOffsetDto<T> implements IListOffset<T> {
  @ApiProperty({ required: false })
  currentPage?: number;

  @ApiProperty({ required: false })
  lastPage?: number;

  @ApiProperty({ required: false })
  count?: number;

  @ApiProperty()
  take: number;

  @ApiProperty()
  current: number;

  @ApiProperty({ isArray: true, type: () => Object })
  data: T[];
}

export class ListCursorDto<T> implements IListCursor<T> {
  @ApiProperty()
  nextCursor: string;

  @ApiProperty()
  take: number;

  @ApiProperty()
  current: number;

  @ApiProperty({ isArray: true, type: () => Object })
  data: T[];
}
