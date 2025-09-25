import { HttpStatus, Injectable, Logger } from '@nestjs/common';

import { BaseModuleService, ErrorService } from 'src/shared/services';
import {
  origin,
  TAccountChangeTotpRequest,
  TAccountChangeTotpResponse,
  TAccountRequest,
  TAccountResponse,
  TAccountUpdateRequest,
  TAccountUpdateResponse,
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

  async findOne(txn: ITxn): Promise<TAccountResponse> {
    try {
      this.logger.debug(`Invoking "account" method...`);
      const { props, content } = this.extract<TAccountRequest>(txn);
      const payload = await this.helperService.findOne(props, content);
      this.logger.debug(`"account" method invoked!`);

      return {
        statusCode: HttpStatus.OK,
        payload,
      };
    } catch (err) {
      return this.errorService.process(err, this.origin);
    }
  }

  async update(txn: ITxn): Promise<TAccountUpdateResponse> {
    try {
      this.logger.debug(`Invoking "account update" method...`);
      const { props, content } = this.extract<TAccountUpdateRequest>(txn);
      await this.helperService.update(props, content);
      this.logger.debug(`"account update" method invoked!`);

      return {
        statusCode: HttpStatus.OK,
      };
    } catch (err) {
      return this.errorService.process(err, this.origin);
    }
  }

  async generateTOTP(txn: ITxn): Promise<TAccountChangeTotpResponse> {
    try {
      this.logger.debug(`Invoking "generateTOTP" method...`);
      const { props } = this.extract(txn);
      const payload = await this.helperService.generateTOTP(props);
      this.logger.debug(`"generateTOTP" method invoked!`);

      return {
        statusCode: HttpStatus.OK,
        payload,
      };
    } catch (err) {
      return this.errorService.process(err, this.origin);
    }
  }

  async enableTOTP(txn: ITxn): Promise<TAccountChangeTotpResponse> {
    try {
      this.logger.debug(`Invoking "generateTOTP" method...`);
      const { props, content } = this.extract<TAccountChangeTotpRequest>(txn);
      await this.helperService.enableTOTP(props, content);
      this.logger.debug(`"generateTOTP" method invoked!`);

      return {
        statusCode: HttpStatus.OK,
      };
    } catch (err) {
      return this.errorService.process(err, this.origin);
    }
  }

  async disableTOTP(txn: ITxn): Promise<TAccountChangeTotpResponse> {
    try {
      this.logger.debug(`Invoking "generateTOTP" method...`);
      const { props, content } = this.extract<TAccountChangeTotpRequest>(txn);
      await this.helperService.disableTOTP(props, content);
      this.logger.debug(`"generateTOTP" method invoked!`);

      return {
        statusCode: HttpStatus.OK,
      };
    } catch (err) {
      return this.errorService.process(err, this.origin);
    }
  }

  async logout(txn: ITxn): Promise<TAccountResponse> {
    try {
      this.logger.debug(`Invoking "logout" method...`);
      const { props, headers } = this.extract<TAccountRequest>(txn);
      await this.helperService.logout(props, headers);
      this.logger.debug(`"logout" method invoked!`);

      return {
        statusCode: HttpStatus.NO_CONTENT,
      };
    } catch (err) {
      return this.errorService.process(err, this.origin);
    }
  }

  async remove(txn: ITxn): Promise<TAccountResponse> {
    try {
      this.logger.debug(`Invoking "remove" method...`);
      const { props } = this.extract<TAccountRequest>(txn);
      await this.helperService.remove(props);
      this.logger.debug(`"remove" method invoked!`);

      return {
        statusCode: HttpStatus.NO_CONTENT,
      };
    } catch (err) {
      return this.errorService.process(err, this.origin);
    }
  }
}
