import { Controller, Get, Req, Res, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';

import { ModuleService } from '../services';
import { origin } from '../dto';
import type { IResponse } from 'src/interfaces';

@ApiTags(origin)
@Controller({ version: VERSION_NEUTRAL })
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  @Get()
  healthCheck(@Req() req: Request, @Res() res: Response): IResponse {
    const response: IResponse = this.moduleService.healthCheck({
      req,
      res,
    });
    return res.status(response.statusCode).json(response);
  }
}
