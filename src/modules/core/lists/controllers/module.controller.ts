import { Controller, Get, Post, Patch, Delete, Res, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';

import { ModuleService } from '../services';
import {
  CreateDto,
  createSchema,
  BaseDto,
  findSchema,
  ListDto,
  listSchema,
  origin,
  removeSchema,
  UpdateDto,
  updateSchema,
} from 'src/modules/admin/lists/dto';
import { IResponse } from 'src/interfaces';
import {
  Auth,
  SwaggerCreate,
  SwaggerFind,
  SwaggerList,
  SwaggerRemove,
  SwaggerUpdate,
} from 'src/decorators';
import { BaseModuleController } from 'src/shared/services';

@ApiTags(origin)
@ApiBearerAuth()
@Auth()
@Controller({ path: origin })
export class ModuleController extends BaseModuleController {
  constructor(private readonly moduleService: ModuleService) {
    super();
  }

  @Post()
  @SwaggerCreate({ origin, reqDto: CreateDto })
  async create(@Req() req: Request, @Res() res: Response): Promise<IResponse> {
    const response: IResponse = await this.moduleService.create(
      this.validate(req, res, createSchema),
    );
    return res.status(response.statusCode).json(response);
  }

  @Get()
  @SwaggerList({ origin, reqDto: ListDto, resDto: BaseDto })
  async list(@Req() req: Request, @Res() res: Response): Promise<IResponse> {
    const response: IResponse = await this.moduleService.list(
      this.validate(req, res, listSchema),
    );
    return res.status(response.statusCode).json(response);
  }

  @Get(':id')
  @SwaggerFind({ origin, resDto: BaseDto })
  async findOne(@Req() req: Request, @Res() res: Response): Promise<IResponse> {
    const response: IResponse = await this.moduleService.findOne(
      this.validate(req, res, findSchema),
    );
    return res.status(response.statusCode).json(response);
  }

  @Patch(':id')
  @SwaggerUpdate({ origin, reqDto: UpdateDto })
  async update(@Req() req: Request, @Res() res: Response): Promise<IResponse> {
    const response: IResponse = await this.moduleService.update(
      this.validate(req, res, updateSchema),
    );
    return res.status(response.statusCode).json(response);
  }

  @Delete(':id')
  @SwaggerRemove({ origin })
  async remove(@Req() req: Request, @Res() res: Response): Promise<IResponse> {
    const response: IResponse = await this.moduleService.remove(
      this.validate(req, res, removeSchema),
    );
    return res.status(response.statusCode).json(response);
  }
}
