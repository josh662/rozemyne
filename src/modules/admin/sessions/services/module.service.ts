import { HttpStatus, Injectable, Logger } from '@nestjs/common';

import { BaseModuleService, ErrorService } from 'src/shared/services';
import {
  origin,
  TFindRequest,
  TFindResponse,
  TListRequest,
  TListResponse,
} from '../dto';
import { HelperService } from './helper.service';
import { ITxn } from 'src/interfaces';

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

  async list(txn: ITxn): Promise<TListResponse> {
    try {
      this.logger.debug(`Invoking "list" method...`);
      const { props, content } = this.extract<TListRequest>(txn);
      const payload = await this.helperService.list(props, content);
      this.logger.debug(`"list" method invoked!`);

      return {
        statusCode: HttpStatus.OK,
        payload,
      };
    } catch (err) {
      return this.errorService.process(err, this.origin);
    }
  }

  async findOne(txn: ITxn): Promise<TFindResponse> {
    try {
      this.logger.debug(`Invoking "find" method...`);
      const { props, content } = this.extract<TFindRequest>(txn);
      const payload = await this.helperService.findOne(props, content);
      this.logger.debug(`"find" method invoked!`);

      return {
        statusCode: HttpStatus.OK,
        payload,
      };
    } catch (err) {
      return this.errorService.process(err, this.origin);
    }
  }
}
