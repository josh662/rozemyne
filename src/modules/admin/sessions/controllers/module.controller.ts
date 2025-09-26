import { Controller, Get, Res, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import type { Request, Response } from 'express';

import { ModuleService } from '../services';
import { BaseDto, findSchema, ListDto, listSchema, origin } from '../dto';
import { IResponse } from 'src/interfaces';
import { Admin, Auth, SwaggerFind, SwaggerList } from 'src/decorators';
import { BaseModuleController } from 'src/shared/services';

@ApiTags(`admin ${origin}`)
@ApiBearerAuth()
@Auth()
@Admin()
@Controller({ path: `admin/:userId/${origin}` })
export class ModuleController extends BaseModuleController {
  constructor(private readonly moduleService: ModuleService) {
    super();
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
}
