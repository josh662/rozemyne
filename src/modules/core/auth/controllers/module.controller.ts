import { Controller, Post, Res, Req } from '@nestjs/common';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { seconds, Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';

import { ModuleService } from '../services';
import {
  origin,
  registerSchema,
  loginSchema,
  RegisterDto,
  LoginDto,
  verifySchema,
  recoverySchema,
} from '../dto';
import { IResponse } from 'src/interfaces';
import { BaseModuleController } from 'src/shared/services';
import { SwaggerCustom, WithPayload, PayloadId } from 'src/decorators';

class AuthenticatedDto {
  @ApiProperty()
  loginNumber: number;

  @ApiProperty()
  expiresOn: Date;

  @ApiProperty()
  token: string;
}

@ApiTags(origin)
@Controller({ path: origin })
export class ModuleController extends BaseModuleController {
  constructor(private readonly moduleService: ModuleService) {
    super();
  }

  @Throttle({ default: { limit: 1000, ttl: seconds(60) } })
  @Post('register')
  @SwaggerCustom({
    origin,
    reqDto: RegisterDto,
    resDto: WithPayload(PayloadId, 'Id'),
  })
  async signup(@Req() req: Request, @Res() res: Response): Promise<IResponse> {
    const response: IResponse = await this.moduleService.register(
      this.validate(req, res, registerSchema),
    );
    return res.status(response.statusCode).json(response);
  }

  @Throttle({ default: { limit: 1000, ttl: seconds(60) } })
  @Post('login')
  @SwaggerCustom({
    origin,
    reqDto: LoginDto,
    resDto: WithPayload(AuthenticatedDto),
  })
  async login(@Req() req: Request, @Res() res: Response): Promise<IResponse> {
    const response: IResponse = await this.moduleService.login(
      this.validate(req, res, loginSchema),
    );
    return res.status(response.statusCode).json(response);
  }

  @Post('recovery')
  @SwaggerCustom({
    origin,
    reqDto: LoginDto,
    resDto: WithPayload(AuthenticatedDto),
  })
  async recovery(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<IResponse> {
    const response: IResponse = await this.moduleService.recovery(
      this.validate(req, res, recoverySchema),
    );
    return res.status(response.statusCode).json(response);
  }

  @Post('verify')
  @SwaggerCustom({
    origin,
    reqDto: LoginDto,
    resDto: WithPayload(AuthenticatedDto),
  })
  async verify(@Req() req: Request, @Res() res: Response): Promise<IResponse> {
    const response: IResponse = await this.moduleService.verify(
      this.validate(req, res, verifySchema),
    );
    return res.status(response.statusCode).json(response);
  }
}
