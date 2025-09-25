import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as speakeasy from 'speakeasy';

import { PrismaService, EUserStatus } from 'src/prisma';
import {
  EventService,
  CacheService,
  SearchService,
  BaseHelperService,
} from 'src/shared/services';

import { EFieldType, EPaginationMode, IProps, TList } from 'src/interfaces';
import {
  IDefault,
  origin,
  TCreateRequest,
  TFindRequest,
  TListRequest,
  TRemoveRequest,
  TTotpRequest,
  TUpdateRequest,
} from '../dto';
import { createId, hashPassword, verifyPhoneNumber } from 'src/utils';

@Injectable()
export class HelperService extends BaseHelperService {
  constructor(
    prisma: PrismaService,
    private readonly eventService: EventService,
    private readonly cacheService: CacheService,
    searchService: SearchService,
  ) {
    super(prisma, searchService);
  }
  private origin = origin;
  private logger = new Logger(`${this.origin}:helper`);
  private repository = this.prisma.user;

  async create(props: IProps, data: TCreateRequest): Promise<IDefault> {
    this.logger.log(`Creating a new record`);

    if (data.phoneNumber) {
      data.phoneNumber = verifyPhoneNumber(data.phoneNumber);
    }

    const hashPass = await hashPassword(data.password);

    const record = await this.repository.create({
      data: {
        id: createId(),
        status: data.status,
        firstName: data.firstName,
        lastName: data.lastName,
        email: String(data.email).toLowerCase(),
        emailVerifiedAt: data.emailVerifiedAt,
        phoneNumber: data.phoneNumber,
        phoneNumberVerifiedAt: data.phoneNumberVerifiedAt,
        password: hashPass,
      },
    });

    props = {
      userId: record.id,
    };

    this.eventService.create(this.origin, record, { props });
    this.logger.log(`New record created (ID: ${record.id})`);

    return record;
  }

  async list(
    props: IProps,
    data: TListRequest,
    restrictPaginationToMode?: EPaginationMode,
  ): Promise<TList<Partial<IDefault>>> {
    this.logger.log(`Listing records`);

    type R = typeof this.repository;
    type F = R['fields'];
    type P = Exclude<Parameters<R['findMany']>[0], undefined>;
    type W = P['where'];
    type S = P['select'];
    type O = P['orderBy'];

    const listed = await this.listing<R, F, W, S, O>(this.repository, data, {
      logger: this.logger,
      origin: this.origin,
      restrictPaginationToMode,
      searchableFields: {
        id: EFieldType.STRING,
        status: EFieldType.STRING,
        firstName: EFieldType.STRING,
        lastName: EFieldType.STRING,
        email: EFieldType.STRING,
        emailVerifiedAt: EFieldType.DATE,
        phoneNumber: EFieldType.STRING,
        phoneNumberVerifiedAt: EFieldType.DATE,
        totpEnabled: EFieldType.BOOLEAN,
        createdAt: EFieldType.DATE,
      },
      sortFields: ['id', 'firstName', 'lastName', 'email', 'createdAt'],
      mergeWhere: {},
      select: {
        id: true,
        status: true,
        firstName: true,
        lastName: true,
        email: true,
        emailVerifiedAt: true,
        phoneNumber: true,
        phoneNumberVerifiedAt: true,
        createdAt: true,
      },
    });

    return listed;
  }

  async findOne(
    props: IProps,
    data: TFindRequest,
    renew = false,
  ): Promise<Omit<IDefault, 'password' | 'totpSecret'>> {
    this.logger.log(`Retrieving a single record`);

    type R = typeof this.repository;
    type RType = NonNullable<Awaited<ReturnType<R['findUniqueOrThrow']>>>;
    let record: Omit<RType, 'password' | 'totpSecret'> | null | undefined =
      undefined;

    if (!renew) {
      record = await this.cacheService.get(this.origin, data.id);
    }

    if (!record) {
      record = await this.repository.findUniqueOrThrow({
        where: { id: data.id },
        omit: {
          password: true,
          totpSecret: true,
        },
      });

      if (!renew) {
        await this.cacheService.set(this.origin, record.id!, record);
      }
    }

    this.logger.log(`One record was retrieved (ID: ${record.id})`);

    return record;
  }

  async update(
    props: IProps,
    data: TUpdateRequest,
  ): Promise<Omit<IDefault, 'password' | 'totpSecret'>> {
    this.logger.log(`Updating a record`);

    if (data.password) {
      data.password = await hashPassword(data.password);
    }

    if (data.phoneNumber) {
      data.phoneNumber = verifyPhoneNumber(data.phoneNumber);
    }

    const record = await this.repository.update({
      where: { id: data.id },
      data: {
        status: data.status,
        firstName: data.firstName,
        lastName: data.lastName,
        email: String(data.email).toLowerCase(),
        emailVerifiedAt: data.emailVerifiedAt,
        phoneNumber: data.phoneNumber,
        phoneNumberVerifiedAt: data.phoneNumberVerifiedAt,
        password: data.password,
        totpEnabled: data.totpEnabled,
      },
      omit: {
        password: true,
        totpSecret: true,
      },
    });

    this.eventService.update(this.origin, record, { props });
    await this.cacheService.del(this.origin, record.id);
    this.logger.log(`One record was updated (ID: ${record.id})`);

    return record;
  }

  async remove(props: IProps, data: TRemoveRequest): Promise<void> {
    this.logger.log(`Deleting a record`);
    const record = await this.repository.update({
      where: {
        id: data.id,
        status: {
          not: EUserStatus.DELETED,
        },
      },
      data: {
        status: EUserStatus.DELETED,
      },
    });

    this.eventService.remove(this.origin, record, { props });
    await this.cacheService.del(this.origin, record.id);
    this.logger.log(`One record was deleted (ID: ${record.id})`);
  }

  // MFA TOTP

  async generateTOTP(
    props: IProps,
    data: TTotpRequest,
  ): Promise<{ totp: string }> {
    const record = await this.repository.findUniqueOrThrow({
      where: {
        id: data.userId,
        totpEnabled: false,
      },
      select: {
        id: true,
        email: true,
      },
    });

    // const key: string = authenticator.generateKey();
    const secret = speakeasy.generateSecret({
      name: `${String(process.env.PUBLIC_NAME)}: ${record.email}`,
      issuer: String(process.env.PUBLIC_NAME),
    });

    await this.repository.update({
      where: {
        id: record.id,
      },
      data: {
        totpSecret: secret.base32,
      },
      select: {
        id: true,
      },
    });

    this.eventService.custom(this.origin, 'totp_generated', record, { props });
    await this.cacheService.del(this.origin, record.id);
    this.logger.log(`TOTP generated (ID: ${record.id})`);

    return { totp: String(secret.otpauth_url) };
  }

  async enableTOTP(
    props: IProps,
    data: TTotpRequest,
    token?: string,
  ): Promise<void> {
    const record = await this.repository.findUniqueOrThrow({
      where: {
        id: data.userId,
      },
      select: {
        id: true,
        totpEnabled: true,
        totpSecret: true,
      },
    });

    if (record.totpEnabled) {
      throw new HttpException(
        'ERR_TOTP_ALREADY_ENABLED',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!record.totpSecret) {
      throw new HttpException(
        'ERR_TOTP_SECRET_NOT_GENERATED',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Se o token for fornecido, então ele é verificado antes de ativar
    if (token) {
      const verify = this.verifyTOTP(record.totpSecret, token);
      if (!verify) {
        throw new HttpException('ERR_TOTP_INVALID', HttpStatus.BAD_REQUEST);
      }
    }

    await this.repository.update({
      where: {
        id: record.id,
      },
      data: {
        totpEnabled: true,
      },
      select: {
        id: true,
      },
    });

    this.eventService.custom(this.origin, 'totp_enabled', record, { props });
    await this.cacheService.del(this.origin, record.id);
    this.logger.log(`TOTP enabled (ID: ${record.id})`);
  }

  async disableTOTP(props: IProps, data: TTotpRequest): Promise<void> {
    const record = await this.repository.update({
      where: {
        id: data.userId,
      },
      data: {
        totpEnabled: false,
        totpSecret: null,
      },
      select: {
        id: true,
      },
    });

    this.eventService.custom(this.origin, 'totp_disabled', record, { props });
    await this.cacheService.del(this.origin, record.id);
    this.logger.log(`TOTP disabled (ID: ${record.id})`);
  }

  verifyTOTP(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 1,
    });
  }
}
