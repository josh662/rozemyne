import { Controller, Res, Req, Get, Delete, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';

import { ModuleService } from '../services';
import {
  AccountChangeTotpDto,
  AccountUpdateDto,
  accountUpdateSchema,
  changeTotpSchema,
  origin,
} from '../dto';
import { IResponse } from 'src/interfaces';
import { BaseModuleController } from 'src/shared/services';
import {
  Auth,
  SwaggerCustom,
  SwaggerRemove,
  SwaggerUpdate,
} from 'src/decorators';

@ApiTags(origin)
@ApiBearerAuth()
@Auth()
@Controller({ path: origin })
export class ModuleController extends BaseModuleController {
  constructor(private readonly moduleService: ModuleService) {
    super();
  }

  @Get()
  async findOne(@Req() req: Request, @Res() res: Response): Promise<IResponse> {
    const response: IResponse = await this.moduleService.findOne({
      req,
      res,
    });
    return res.status(response.statusCode).json(response);
  }

  @Patch()
  @SwaggerUpdate({ origin, reqDto: AccountUpdateDto })
  async update(@Req() req: Request, @Res() res: Response): Promise<IResponse> {
    const response: IResponse = await this.moduleService.update(
      this.validate(req, res, accountUpdateSchema),
    );
    return res.status(response.statusCode).json(response);
  }

  // MFA TOTP

  @Post('totp/generate')
  @SwaggerCustom({ origin })
  async generateTOTP(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<IResponse> {
    const response: IResponse = await this.moduleService.generateTOTP({
      req,
      res,
    });
    return res.status(response.statusCode).json(response);
  }

  @Post('totp')
  @SwaggerCustom({ origin, reqDto: AccountChangeTotpDto })
  async enableTOTP(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<IResponse> {
    const response: IResponse = await this.moduleService.enableTOTP(
      this.validate(req, res, changeTotpSchema),
    );
    return res.status(response.statusCode).json(response);
  }

  @Delete('totp')
  @SwaggerCustom({ origin, reqDto: AccountChangeTotpDto })
  async disableTOTP(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<IResponse> {
    const response: IResponse = await this.moduleService.disableTOTP(
      this.validate(req, res, changeTotpSchema),
    );
    return res.status(response.statusCode).json(response);
  }

  @Delete('logout')
  @SwaggerRemove({ origin })
  async logout(@Req() req: Request, @Res() res: Response): Promise<IResponse> {
    const response: IResponse = await this.moduleService.logout({
      req,
      res,
    });
    return res.status(response.statusCode).json(response);
  }

  @Delete()
  @SwaggerRemove({ origin })
  async remove(@Req() req: Request, @Res() res: Response): Promise<IResponse> {
    const response: IResponse = await this.moduleService.remove({
      req,
      res,
    });
    return res.status(response.statusCode).json(response);
  }
}
