import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';

import { PrismaService } from 'src/prisma';
import {
  EventService,
  CacheService,
  SearchService,
  BaseHelperService,
} from 'src/shared/services';

import { EFieldType, EPaginationMode, IProps, TList } from 'src/interfaces';
import {
  media,
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
  private repository = this.prisma.list;

  async create(props: IProps, data: TCreateRequest): Promise<IDefault> {
    this.logger.log(`Creating a new record`);

    const record = await this.repository.create({
      data: {
        id: createId(),
        userId: data.userId,
        name: data.name,
      },
    });

    props = {
      userId: record.id,
    };

    if (data.addMedias) {
      await this.changeMedias(record.id, data.addMedias, 'add');
    }

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
        name: EFieldType.STRING,
        createdAt: EFieldType.DATE,
      },
      sortFields: ['id', 'name', 'createdAt'],
      mergeWhere: {
        userId: data.userId,
      },
      select: {
        id: true,
        name: true,
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
        where: { id: data.id, userId: data.userId },
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
      where: { id: data.id, userId: data.userId },
      data: {
        name: data.name,
      },
    });

    if (data.addMedias) {
      await this.changeMedias(record.id, data.addMedias, 'add');
    }

    if (data.removeMedias) {
      await this.changeMedias(record.id, data.removeMedias, 'remove');
    }

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

  // Auxiliary Methods

  async changeMedias(
    listId: string,
    medias: Array<z.infer<typeof media>>,
    action: 'add' | 'remove',
  ): Promise<void> {
    switch (action) {
      case 'add': {
        await this.prisma.listMedia.createMany({
          skipDuplicates: true,
          data: medias.map((media) => {
            return {
              listId,
              mediaId: media.id,
            };
          }),
        });
        break;
      }
      case 'remove': {
        await this.prisma.listMedia.deleteMany({
          where: {
            listId,
            mediaId: {
              in: medias.map((media) => media.id),
            },
          },
        });
        break;
      }
    }
  }
}
