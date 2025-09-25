import { Injectable, Logger } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import { PrismaService } from 'src/prisma';
import {
  EventService,
  CacheService,
  SearchService,
  BaseHelperService,
} from 'src/shared/services';

import {
  EFieldType,
  EPaginationMode,
  IProps,
  JwtDto,
  TList,
} from 'src/interfaces';
import {
  IDefault,
  origin,
  TCreateRequest,
  TFindRequest,
  TListRequest,
  TRemoveRequest,
  TUpdateRequest,
} from '../dto';
import { createId } from 'src/utils';
import { EOriginRoutes } from 'src/routes';

@Injectable()
export class HelperService extends BaseHelperService {
  constructor(
    prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly eventService: EventService,
    private readonly cacheService: CacheService,
    searchService: SearchService,
  ) {
    super(prisma, searchService);
  }
  private origin = origin;
  private logger = new Logger(`${this.origin}:helper`);
  private repository = this.prisma.session;

  async create(
    props: IProps,
    data: TCreateRequest,
  ): Promise<IDefault & { token: string }> {
    this.logger.log(`Creating a new record`);

    const lastSession = await this.repository.findFirst({
      where: {
        userId: data.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        number: true,
      },
    });

    const lastSessionNumber = lastSession?.number || 0;
    const sid = createId();

    let token = '';
    let decoded: JwtDto | null = null;

    if (data.success) {
      // Cria o jWT de acesso
      token = this.generateToken({
        userId: data.userId,
        sessionId: sid,
      });
      decoded = this.jwtService.decode<JwtDto>(token);
    }

    const record = await this.repository.create({
      data: {
        id: sid,
        userId: data.userId,
        success: !!data.success,
        error: data.error,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        number: lastSessionNumber + 1,
        expiredAt: decoded ? new Date(decoded.exp! * 1000) : null,
      },
    });

    this.eventService.create(this.origin, record, { props });
    this.logger.log(`New record created (ID: ${record.id})`);

    return { ...record, token };
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
        userId: EFieldType.STRING,
        number: EFieldType.NUMBER,
        success: EFieldType.BOOLEAN,
        error: EFieldType.STRING,
        ipAddress: EFieldType.STRING,
        userAgent: EFieldType.STRING,
        expiredAt: EFieldType.DATE,
        createdAt: EFieldType.DATE,
      },
      sortFields: ['id', 'number', 'success', 'expiredAt', 'createdAt'],
      mergeWhere: {},
      select: {
        id: true,
        userId: true,
        number: true,
        success: true,
        expiredAt: true,
      },
    });

    return listed;
  }

  async findOne(
    props: IProps,
    data: TFindRequest,
    renew = false,
  ): Promise<IDefault> {
    this.logger.log(`Retrieving a single record`);

    type R = typeof this.repository;
    type RType = NonNullable<Awaited<ReturnType<R['findUniqueOrThrow']>>>;
    let record: RType | null | undefined = undefined;

    if (!renew) {
      record = await this.cacheService.get(this.origin, data.id);
    }

    if (!record) {
      record = await this.repository.findUniqueOrThrow({
        where: { id: data.id },
      });

      if (!renew) {
        await this.cacheService.set(this.origin, record.id!, record);
      }
    }

    this.logger.log(`One record was retrieved (ID: ${record.id})`);

    return record;
  }

  async update(props: IProps, data: TUpdateRequest): Promise<IDefault> {
    this.logger.log(`Updating a record`);

    const record = await this.repository.update({
      where: { id: data.id },
      data: {},
    });

    this.eventService.update(this.origin, record, { props });
    await this.cacheService.del(this.origin, record.id);
    this.logger.log(`One record was updated (ID: ${record.id})`);

    return record;
  }

  async remove(props: IProps, data: TRemoveRequest): Promise<void> {
    this.logger.log(`Deleting a record`);
    const record = await this.repository.delete({
      where: { id: data.id },
    });

    this.eventService.remove(this.origin, record, { props });
    await this.cacheService.del(this.origin, record.id);
    this.logger.log(`One record was deleted (ID: ${record.id})`);
  }

  // Métodos auxiliares

  generateToken(config: {
    userId: string;
    sessionId: string;
    secret?: string;
    expiresIn?: string;
  }): string {
    const payload: JwtDto = {
      iss: String(process.env.PUBLIC_NAME),
      sub: config.userId,
      jti: config.sessionId,
      nbf: Math.floor(Date.now() / 1000),
    };
    return this.jwtService.sign(payload, {
      secret: config.secret || process.env.JWT_SECRET,
      expiresIn: config.expiresIn || process.env.JWT_PERIOD,
    });
  }

  async endSessions(userId: string, sessionId?: string) {
    const sessions = await this.prisma.session.updateManyAndReturn({
      where: {
        id: sessionId, // Se "sessionId" for fornecida então acessa apenas uma, senão acessa todas do respectivo usuário
        userId,
        success: true,
        expiredAt: {
          gte: new Date(),
        },
      },
      data: {
        expiredAt: new Date(),
      },
      select: {
        id: true,
      },
    });

    await this.cacheService.mdel(
      EOriginRoutes.AUTH_GUARD,
      sessions.map((s) => `user:${userId}:session:${s.id}`),
    );
  }
}
