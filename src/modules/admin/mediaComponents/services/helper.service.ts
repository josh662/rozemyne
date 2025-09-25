import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from 'src/prisma';
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
  TUpdateRequest,
} from '../dto';
import { createId } from 'src/utils';

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
  private repository = this.prisma.mediaComponent;

  async create(props: IProps, data: TCreateRequest): Promise<IDefault> {
    this.logger.log(`Creating a new record`);

    const record = await this.repository.create({
      data: {
        id: createId(),
        mediaId: data.mediaId,
        group: data.group,
        number: data.number,
        title: data.title,
        description: data.description,
        duration: data.duration,
        releaseDate: data.releaseDate,
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
        mediaId: EFieldType.STRING,
        group: EFieldType.STRING,
        number: EFieldType.NUMBER,
        title: EFieldType.STRING,
        description: EFieldType.STRING,
        duration: EFieldType.NUMBER,
        releaseDate: EFieldType.DATE,
        createdAt: EFieldType.DATE,
      },
      sortFields: [
        'id',
        'group',
        'number',
        'title',
        'description',
        'releaseDate',
        'createdAt',
      ],
      mergeWhere: {},
      select: {
        id: true,
        mediaId: true,
        title: true,
        description: true,
        duration: true,
        releaseDate: true,
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
        where: { id: data.id, mediaId: data.mediaId },
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
      where: { id: data.id, mediaId: data.mediaId },
      data: {
        group: data.group,
        number: data.number,
        title: data.title,
        description: data.description,
        duration: data.duration,
        releaseDate: data.releaseDate,
      },
    });

    this.eventService.update(this.origin, record, { props });
    await this.cacheService.del(this.origin, record.id);
    this.logger.log(`One record was updated (ID: ${record.id})`);

    return record;
  }

  async remove(props: IProps, data: TRemoveRequest): Promise<void> {
    this.logger.log(`Deleting a record`);
    const record = await this.repository.delete({
      where: {
        id: data.id,
      },
    });

    this.eventService.remove(this.origin, record, { props });
    await this.cacheService.del(this.origin, record.id);
    this.logger.log(`One record was deleted (ID: ${record.id})`);
  }
}
