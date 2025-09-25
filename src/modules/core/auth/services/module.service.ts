import { HttpStatus, Injectable, Logger } from '@nestjs/common';

import { BaseModuleService, ErrorService } from 'src/shared/services';
import {
  origin,
  TRegisterRequest,
  TRegisterResponse,
  TLoginRequest,
  TLoginResponse,
  TVerifyResponse,
  TVerifyRequest,
  TRecoveryResponse,
  TRecoveryRequest,
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

  async register(txn: ITxn): Promise<TRegisterResponse> {
    try {
      this.logger.debug(`Invoking "register" method...`);
      const { content } = this.extract<TRegisterRequest>(txn);
      const payload = await this.helperService.register(content);
      this.logger.debug(`"register" method invoked!`);

      return {
        statusCode: HttpStatus.OK,
        payload: {
          id: payload.id,
          email: payload.email,
        },
      };
    } catch (err) {
      return this.errorService.process(err, this.origin);
    }
  }

  async login(txn: ITxn): Promise<TLoginResponse> {
    try {
      this.logger.debug(`Invoking "login" method...`);
      const { content } = this.extract<TLoginRequest>(txn);
      const payload = await this.helperService.login(content);
      this.logger.debug(`"login" method invoked!`);

      return {
        statusCode: HttpStatus.OK,
        payload,
      };
    } catch (err) {
      return this.errorService.process(err, this.origin);
    }
  }

  async recovery(txn: ITxn): Promise<TRecoveryResponse> {
    try {
      this.logger.debug(`Invoking "login" method...`);
      const { content } = this.extract<TRecoveryRequest>(txn);
      await this.helperService.recovery(content);
      this.logger.debug(`"login" method invoked!`);

      return {
        statusCode: HttpStatus.OK,
      };
    } catch (err) {
      return this.errorService.process(err, this.origin);
    }
  }

  async verify(txn: ITxn): Promise<TVerifyResponse> {
    try {
      this.logger.debug(`Invoking "verify" method...`);
      const { content } = this.extract<TVerifyRequest>(txn);
      await this.helperService.verify(content);
      this.logger.debug(`"verify" method invoked!`);

      return {
        statusCode: HttpStatus.OK,
      };
    } catch (err) {
      return this.errorService.process(err, this.origin);
    }
  }
}
