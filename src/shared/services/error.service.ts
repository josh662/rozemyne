import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';

// PRISMA
import { PrismaClientKnownRequestError, PrismaService } from 'src/prisma';

import { IResponse } from 'src/interfaces';
import { object } from 'src/utils';

@Injectable()
export class ErrorService {
  constructor(private readonly prisma: PrismaService) {}
  private readonly logger = new Logger(ErrorService.name);

  process(err: any, origin: any, throwError = true): IResponse {
    this.logger.error(`ERROR ORIGIN: ${origin}`);
    this.logger.error(err);
    if (!throwError) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
    if (err instanceof HttpException) {
      const res = err.getResponse();
      if (object(res) && typeof object(res) !== 'string') {
        return object(res) as IResponse;
      }
      return {
        statusCode: err.getStatus(),
        message: typeof res === 'string' ? res : 'ERROR',
      };
      // throw new HttpException(err.getResponse(), err.getStatus());
    } else if (err instanceof PrismaClientKnownRequestError && throwError) {
      this.logger.error(`ERROR INSTANCE TYPE: DBException`);
      this.prisma.DBErrorMessage(err);
    }
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'INTERNAL_ERROR',
    };
  }
}
