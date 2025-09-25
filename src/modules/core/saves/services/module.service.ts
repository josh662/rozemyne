import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';

import { BaseModuleService, ErrorService } from 'src/shared/services';
import {
  origin,
  TCreateRequest,
  TCreateResponse,
  TFindRequest,
  TFindResponse,
  TListRequest,
  TListResponse,
  TRemoveRequest,
  TRemoveResponse,
  TUpdateRequest,
  TUpdateResponse,
} from 'src/modules/admin/saves/dto';
import { HelperService } from 'src/modules/admin/saves/services';
import { IProps, ITxn } from 'src/interfaces';

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

  async verifyOwner(props: IProps, config: { id?: string; userId?: string }) {
    if (config.id) {
      const data = await this.helperService.findOne(props, {
        id: config.id,
      });

      config.userId = data.userId;
    }
    if (props.userId !== config.userId) {
      throw new HttpException('ERR_UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
    }
  }

  async create(txn: ITxn): Promise<TCreateResponse> {
    try {
      this.logger.debug(`Invoking "create" method...`);
      const { props, content } = this.extract<TCreateRequest>(txn);
      const payload = await this.helperService.create(props, {
        ...content,
        userId: props.userId,
      });
      this.logger.debug(`"create" method invoked!`);

      return {
        statusCode: HttpStatus.CREATED,
        payload: {
          id: payload.id,
        },
      };
    } catch (err) {
      return this.errorService.process(err, this.origin);
    }
  }

  async list(txn: ITxn): Promise<TListResponse> {
    try {
      this.logger.debug(`Invoking "list" method...`);
      const { props, content } = this.extract<TListRequest>(txn);
      const payload = await this.helperService.list(props, {
        ...content,
        'eql|userId': props.userId,
      });
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
      const payload = await this.helperService.findOne(props, {
        ...content,
      });
      this.logger.debug(`"find" method invoked!`);

      await this.verifyOwner(props, { userId: payload.userId });

      return {
        statusCode: HttpStatus.OK,
        payload,
      };
    } catch (err) {
      return this.errorService.process(err, this.origin);
    }
  }

  async update(txn: ITxn): Promise<TUpdateResponse> {
    try {
      this.logger.debug(`Invoking "update" method...`);
      const { props, content } = this.extract<TUpdateRequest>(txn);
      await this.verifyOwner(props, { id: content.id });
      await this.helperService.update(props, {
        ...content,
      });
      this.logger.debug(`"update" method invoked!`);

      return {
        statusCode: HttpStatus.OK,
      };
    } catch (err) {
      return this.errorService.process(err, this.origin);
    }
  }

  async remove(txn: ITxn): Promise<TRemoveResponse> {
    try {
      this.logger.debug(`Invoking "remove" method...`);
      const { props, content } = this.extract<TRemoveRequest>(txn);
      await this.verifyOwner(props, { id: content.id });
      await this.helperService.remove(props, {
        ...content,
      });
      this.logger.debug(`"remove" method invoked!`);

      return {
        statusCode: HttpStatus.NO_CONTENT,
      };
    } catch (err) {
      return this.errorService.process(err, this.origin);
    }
  }
}
