import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { EVerificationType, PrismaService } from 'src/prisma';
import {
  EventService,
  CacheService,
  SearchService,
  BaseHelperService,
} from 'src/shared/services';

import { IProps, JwtDto } from 'src/interfaces';
import {
  IDefault,
  origin,
  TAccountChangeTotpRequest,
  TAccountRequest,
  TAccountUpdateRequest,
} from '../dto';

import { HelperService as UserHelperService } from 'src/modules/admin/users/services';
import { HelperService as SessionHelperService } from 'src/modules/admin/sessions/services';
import { HelperService as VerificationService } from 'src/modules/admin/verifications/services';
import { verifyPassword, verifyPhoneNumber } from 'src/utils';

@Injectable()
export class HelperService extends BaseHelperService {
  constructor(
    prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly eventService: EventService,
    private readonly cacheService: CacheService,
    private readonly userService: UserHelperService,
    private readonly sessionService: SessionHelperService,
    private readonly verificationService: VerificationService,
    searchService: SearchService,
  ) {
    super(prisma, searchService);
  }
  private origin = origin;
  private logger = new Logger(`${this.origin}:helper`);
  private repository = this.prisma.user;

  async findOne(
    props: IProps,
    data: TAccountRequest,
  ): Promise<Partial<IDefault>> {
    this.logger.log(`Retrieving a single record`);

    let record: any = await this.cacheService.get(this.origin, data.id);

    if (!record) {
      record = await this.repository.findUniqueOrThrow({
        where: {
          id: props.userId,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          emailVerifiedAt: true,
          phoneNumber: true,
          phoneNumberVerifiedAt: true,
          totpEnabled: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      await this.cacheService.set(this.origin, record.id!, record);
    }

    this.logger.log(`One record was retrieved (ID: ${record.id})`);

    return record;
  }

  async update(
    props: IProps,
    data: TAccountUpdateRequest,
  ): Promise<Omit<IDefault, 'password' | 'totpSecret'>> {
    this.logger.log(`Updating user account...`);

    if (data.email || data.phoneNumber) {
      const user = await this.userService.findOne(props, {
        id: String(props.userId),
      });

      // Se o usuário deseja alterar o email mas o atual está verificado é necessário confirmação do novo antes da mudança
      if (data.email && user.emailVerifiedAt) {
        await this.verificationService.create(props, {
          userId: String(user.id),
          type: EVerificationType.EMAIL,
          value: data.email,
        });
        delete data.email;
      }

      // Se o usuário deseja alterar o telefone mas o atual está verificado é necessário confirmação do novo antes da mudança
      if (data.phoneNumber) {
        data.phoneNumber = verifyPhoneNumber(data.phoneNumber);
        if (user.phoneNumberVerifiedAt) {
          await this.verificationService.create(props, {
            userId: String(user.id),
            type: EVerificationType.PHONE,
            value: data.phoneNumber,
          });
          delete data.phoneNumber;
        }
      }
    }

    let password: string | undefined;

    // Se existe intenção de troca de senha, a senha atual é verificada
    if (data.newPassword) {
      if (!data.password) {
        throw new HttpException(
          'ERR_CURRENT_PASSWORD_NOT_PROVIDED',
          HttpStatus.BAD_REQUEST,
        );
      }

      const user = await this.prisma.user.findUniqueOrThrow({
        where: {
          id: String(props.userId),
        },
        select: {
          password: true,
        },
      });

      const verifyPass = await verifyPassword(data.password, user.password);
      if (!verifyPass) {
        throw new HttpException(
          'ERR_INCORRECT_PASSWORD',
          HttpStatus.BAD_REQUEST,
        );
      }

      password = data.newPassword;
    }

    const record = await this.userService.update(props, {
      id: String(props.userId),
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      cpfCnpj: data.cpfCnpj,
      password,
    });

    this.eventService.update(this.origin, record, { props });
    await this.cacheService.del(this.origin, record.id!);
    this.logger.log(`User account updated (ID: ${record.id})`);

    return record;
  }

  // MFA TOTP

  async generateTOTP(props: IProps): Promise<{ totp: string }> {
    const data = await this.userService.generateTOTP(props, {
      userId: String(props.userId),
    });

    return { totp: data.totp };
  }

  async enableTOTP(
    props: IProps,
    data: TAccountChangeTotpRequest,
  ): Promise<void> {
    await this.userService.enableTOTP(
      props,
      {
        userId: String(props.userId),
      },
      data.totp,
    );
  }

  async disableTOTP(
    props: IProps,
    data: TAccountChangeTotpRequest,
  ): Promise<void> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: {
        id: String(props.userId),
      },
      select: {
        totpEnabled: true,
        totpSecret: true,
      },
    });

    if (!user.totpEnabled) {
      throw new HttpException(
        'ERR_TOTP_ALREADY_DISABLED',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!user.totpSecret) {
      throw new HttpException(
        'ERR_TOTP_NOT_DEFINED',
        HttpStatus.PRECONDITION_FAILED,
      );
    }

    const verify = this.userService.verifyTOTP(user.totpSecret, data.totp);

    if (!verify) {
      throw new HttpException('ERR_TOTP_INVALID', HttpStatus.BAD_REQUEST);
    }

    await this.userService.disableTOTP(props, {
      userId: String(props.userId),
    });
  }

  async logout(props: IProps, headers: Record<string, any>) {
    const authorization = headers['authorization'] as string;
    const splitted = authorization.split(' ');
    const token = splitted.length > 1 ? splitted[1] : splitted[0];

    const decoded = this.jwtService.decode<JwtDto>(token);

    await this.sessionService.endSessions(String(props.userId), decoded['jti']);
  }

  async remove(props: IProps): Promise<void> {
    await this.userService.remove(props, {
      id: String(props.userId),
    });

    await this.sessionService.endSessions(String(props.userId));
  }
}
