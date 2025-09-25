import { HttpStatus, Injectable, Logger } from '@nestjs/common';

import { BaseModuleService, ErrorService } from 'src/shared/services';
import { origin } from '../dto';
import { HelperService } from './helper.service';
import { IResponse, ITxn } from 'src/interfaces';

@Injectable()
export class ModuleService extends BaseModuleService {
  constructor(
    private readonly errorService: ErrorService,
    private readonly helperService: HelperService,
  ) {
    super();
  }
  private origin = origin;
  private logger = new Logger(`${this.origin}:module`);

  healthCheck(txn: ITxn): IResponse {
    try {
      this.logger.debug(`Invoking "healthCheck" method...`);
      const message = this.helperService.healthCheck();
      this.logger.debug(`"healthCheck" method invoked!`);

      return {
        statusCode: HttpStatus.OK,
        message,
      };
    } catch (err) {
      return this.errorService.process(err, this.origin);
    }
  }
}
