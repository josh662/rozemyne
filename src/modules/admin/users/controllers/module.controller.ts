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
  totpSchema,
  TotpDto,
} from '../dto';
import { IResponse } from 'src/interfaces';
import {
  Admin,
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
@Admin()
@Controller({ path: `admin/${origin}` })
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

  // MFA TOTP

  @Post('totp/generate')
  @SwaggerCreate({ origin: `${origin}Totp`, reqDto: TotpDto })
  async generateTOTP(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<IResponse> {
    const response: IResponse = await this.moduleService.generateTOTP(
      this.validate(req, res, totpSchema),
    );
    return res.status(response.statusCode).json(response);
  }

  @Post('totp')
  @SwaggerCreate({ origin: `${origin}Totp`, reqDto: TotpDto })
  async enableTOTP(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<IResponse> {
    const response: IResponse = await this.moduleService.enableTOTP(
      this.validate(req, res, totpSchema),
    );
    return res.status(response.statusCode).json(response);
  }

  @Delete('totp')
  @SwaggerRemove({ origin: `${origin}Totp`, reqDto: TotpDto })
  async disableTOTP(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<IResponse> {
    const response: IResponse = await this.moduleService.disableTOTP(
      this.validate(req, res, totpSchema),
    );
    return res.status(response.statusCode).json(response);
  }
}
