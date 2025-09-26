import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';

import { PrismaService, EUserStatus, EVerificationType } from 'src/prisma';
import {
  EventService,
  CacheService,
  SearchService,
  BaseHelperService,
} from 'src/shared/services';

import {
  IDefault,
  origin,
  TRegisterRequest,
  TLoginRequest,
  TVerifyRequest,
  TRecoveryRequest,
} from '../dto';
import { verifyPassword } from 'src/utils';

import { HelperService as UserHelperService } from 'src/modules/admin/users/services';
import { HelperService as SessionHelperService } from 'src/modules/admin/sessions/services';
import { HelperService as VerificationHelperService } from 'src/modules/admin/verifications/services';

@Injectable()
export class HelperService extends BaseHelperService {
  constructor(
    prisma: PrismaService,
    private readonly eventService: EventService,
    private readonly cacheService: CacheService,
    private readonly userService: UserHelperService,
    private readonly sessionService: SessionHelperService,
    private readonly verificationService: VerificationHelperService,
    searchService: SearchService,
  ) {
    super(prisma, searchService);
  }
  private origin = origin;
  private logger = new Logger(`${this.origin}:helper`);
  private repository = this.prisma.user;

  async register(data: TRegisterRequest): Promise<IDefault> {
    this.logger.log(`Registering a new user...`);

    const record = await this.userService.create({ userId: '' }, data);

    await this.verificationService.create(
      { userId: record.id },
      {
        userId: record.id,
        type: EVerificationType.EMAIL,
        value: data.email,
      },
    );

    if (data.phoneNumber) {
      await this.verificationService.create(
        { userId: record.id },
        {
          userId: record.id,
          type: EVerificationType.PHONE,
          value: data.phoneNumber,
        },
      );
    }

    this.logger.log(`New user registered`);
    this.eventService.custom(this.origin, 'signup', record, {
      props: {
        userId: record.id,
      },
    });

    return record;
  }

  async login(data: TLoginRequest) {
    this.logger.log(`Performing user login...`);

    const user = await this.repository.findUnique({
      where: {
        email: data.email,
      },
      select: {
        id: true,
        status: true,
        firstName: true,
        lastName: true,
        email: true,
        password: true,
        totpEnabled: true,
        totpSecret: true,
      },
    });

    if (!user) {
      this.logger.warn(`User not found for email: ${data.email}`);
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'ERR_USER_NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (user.status !== EUserStatus.ACTIVE) {
      switch (user.status) {
        case EUserStatus.SUSPENDED:
          throw new HttpException(
            {
              statusCode: HttpStatus.UNAUTHORIZED,
              message: 'ERR_ACCOUNT_SUSPENDED',
            },
            HttpStatus.UNAUTHORIZED,
          );
        case EUserStatus.DELETED:
          throw new HttpException(
            {
              statusCode: HttpStatus.NOT_FOUND,
              message: 'ERR_USER_NOT_FOUND',
            },
            HttpStatus.NOT_FOUND,
          );
        default:
          throw new HttpException(
            {
              statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
              message: `ERR_UNKNOWN`,
            },
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
      }
    }

    let verifyTOTP = true;

    if (user.totpEnabled && user.totpSecret) {
      if (!data.totp) {
        throw new HttpException(
          'ERR_TOTP_NOT_PROVIDED',
          HttpStatus.UNAUTHORIZED,
        );
      }

      verifyTOTP = this.userService.verifyTOTP(user.totpSecret, data.totp);
    }

    const verifyPass = await verifyPassword(data.password, user.password);
    const verified = verifyPass && verifyTOTP;

    const props = {
      userId: user.id,
    };

    const newSession = await this.sessionService.create(props, {
      userId: user.id,
      success: verified,
      error: verified ? undefined : 'ERR_INVALID_CREDENTIALS',
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    });

    if (!verified) {
      this.logger.warn(`Invalid credentials for user: ${user.email}`);
      throw new HttpException(
        {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'ERR_INVALID_CREDENTIALS',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const payload = {
      loginNumber: newSession.number,
      expiresOn: newSession.expiredAt,
      token: newSession.token,
    };

    this.eventService.custom(
      this.origin,
      'login',
      { id: user.id },
      {
        props,
      },
    );

    this.logger.log(`Login successful (USER ID: ${user.id})`);

    return payload;
  }

  async recovery(data: TRecoveryRequest): Promise<void> {
    this.logger.log('Performing account recovery process...');

    const user = await this.prisma.user.findUniqueOrThrow({
      where: {
        email: data.email,
      },
    });

    const props = {
      userId: user.id,
    };

    await this.verificationService.create(props, {
      userId: user.id,
      type: EVerificationType.PASSWORD,
      value: data.email,
    });

    this.logger.log(`Account recovery request completed`);
  }

  async verify(data: TVerifyRequest): Promise<void> {
    this.logger.log('Performing verification code validation...');

    const verification = await this.verificationService.verify({
      code: data.code,
    });

    this.logger.log(
      `Verification found? ${verification ? `Yes (ID: ${verification.id})` : 'No'}`,
    );

    if (!verification) {
      throw new HttpException('ERR_INVALID_CODE', HttpStatus.BAD_REQUEST);
    }

    this.logger.log(
      `Verification not expired? ${verification.expiredAt < new Date() ? `Yes` : 'No'}`,
    );

    if (verification.expiredAt < new Date()) {
      await this.verificationService.remove(
        { userId: '' },
        { id: verification.id },
      );
      throw new HttpException('ERR_INVALID_CODE', HttpStatus.BAD_REQUEST);
    }

    this.logger.log(`Verification type: ${verification.type}`);

    const now = new Date().toISOString();

    if (verification.type === EVerificationType.PASSWORD && !data.newPassword) {
      this.logger.warn(`New password not provided for change`);
      throw new HttpException(
        'ERR_NEW_PASSWORD_NOT_PROVIDED',
        HttpStatus.BAD_REQUEST,
      );
    }

    this.logger.log(`Full checks, applying changes...`);

    await this.userService.update(
      { userId: '' },
      {
        id: verification.userId,
        ...(verification.type === EVerificationType.EMAIL
          ? {
              email: verification.value,
              emailVerifiedAt: new Date(now),
            }
          : verification.type === EVerificationType.PHONE
            ? {
                phoneNumber: verification.value,
                phoneNumberVerifiedAt: new Date(now),
              }
            : {
                password: String(data.newPassword),
              }),
      },
    );

    this.logger.log(`Changes applied, deleting verification record...`);

    await this.verificationService.remove(
      { userId: '' },
      { id: verification.id },
    );

    this.logger.log(`Verification process completed`);
  }
}
