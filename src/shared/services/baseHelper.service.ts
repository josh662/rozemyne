import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';

import { SearchService } from '../services';

import { EFieldType, EPaginationMode } from 'src/interfaces';
import { PrismaService } from 'src/prisma';

@Injectable()
export class BaseHelperService {
  constructor(
    readonly prisma: PrismaService,
    readonly searchService: SearchService,
  ) {}

  async listing<
    Repository extends {
      findMany: (args: any) => Promise<any>;
      count: (args: any) => Promise<number>;
    },
    Fields,
    Where extends Record<string, any> | undefined,
    Select,
    OrderBy,
  >(
    repo: Repository,
    query: {
      mode?: EPaginationMode;
      cursor?: string;
      cursorKey?: string;
      skip?: number;
      take?: number;
      page?: number;
      search?: string;
      orderByField?: string;
      orderByDirection?: string;
    } & Record<string, any>,
    config: {
      logger: Logger;
      origin: string;
      restrictPaginationToMode?: EPaginationMode;
      searchableFields: Partial<Record<keyof Fields, EFieldType>>;
      sortFields?: Array<keyof Fields>;
      orderByFields?: OrderBy;
      mergeWhere?: Where;
      select?: Select;
    },
    modify?: (
      elements: Array<Record<string, string | number | boolean>>,
    ) => Array<Record<string, string | number | boolean>>,
  ) {
    type TContent = Array<Record<string, string | number | boolean>>;

    const {
      mode,
      cursor,
      cursorKey,
      skip,
      take,
      page,
      search,
      orderByField,
      orderByDirection,
    } = this.searchService.processListQuery(query);

    if (
      config.restrictPaginationToMode &&
      mode !== config.restrictPaginationToMode
    ) {
      throw new HttpException(
        {
          message: 'ERR_INVALID_PAGINATION_MODE',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const { where, orderBy } = this.searchService.search({
      mode,
      search,
      orderByField,
      orderByDirection,
      searchableFields: config.searchableFields,
      sortFields: config.sortFields as string[],
      merge: config.mergeWhere,
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    let content: TContent = await repo.findMany({
      skip,
      take,
      where,
      orderBy,
      cursor,
      select: config.select,
    });

    // console.log(skip);
    // console.log(take);
    // console.log(where);
    // console.log(orderBy);
    // console.log(cursor);
    // console.log(config.select);
    // console.log(content);

    // Verifica se deve aplicar uma função de modificação
    if (modify) {
      content = modify(content);
    }

    const current = content.length;

    if (mode === EPaginationMode.OFFSET) {
      const count = await repo.count({ where });

      const { currentPage, lastPage } = this.searchService.pagination(
        page,
        take,
        count,
      );

      config.logger.log(
        `Some "${config.origin}" were listed using offset-pagination mode`,
      );

      return {
        currentPage,
        lastPage,
        count,
        take,
        current,
        data: content,
      };
    }

    const nextCursor = cursor
      ? take === current // Verifica se a quantidade que elementos que queria se obtida é igual a retornada, se for então pode ser que haja uma próxima pagina por curso, se não, então é a última
        ? content[current - 1][cursorKey]
        : null
      : undefined;

    config.logger.log(
      `Some "${config.origin}" were listed using cursor-pagination mode`,
    );

    return {
      nextCursor,
      take,
      current,
      data: content,
    };
  }
}
