import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Request } from 'express';

import { IProps } from 'src/interfaces';
import { EUserRole } from 'src/prisma';
import { EOriginRoutes } from 'src/routes';
import { ErrorService, AuthService } from 'src/shared/services';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly authService: AuthService,
    private readonly errorService: ErrorService,
  ) {}
  private origin = EOriginRoutes.AUTH_GUARD;
  private logger = new Logger(this.origin);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request: Request = context.switchToHttp().getRequest();
      const adminConfig: { isAdmin: true } =
        this.reflector.get('authConfig', context.getHandler()) ||
        this.reflector.get('authConfig', context.getClass());
      const authorization = request.headers['authorization'] as string;

      this.logger.debug(`New request in authenticated route`);
      this.logger.debug(
        `Is admin route? ${adminConfig?.isAdmin ? 'Yes' : 'No'}`,
      );

      this.logger.debug(`Verifying auth token...`);

      this.logger.debug(`Auth token provided? ${authorization ? 'Yes' : 'No'}`);

      const auth = await this.authService.authenticate(authorization);

      this.logger.debug(
        `Authentication status: ${auth.success ? `Success` : 'Failure'}`,
      );

      if (!auth.success) {
        return false;
      }

      const props: IProps = {
        userId: auth.userId,
      };

      request['props'] = props;

      if (!adminConfig) {
        return true;
      }

      if (adminConfig?.isAdmin && auth.userRole === EUserRole.ADMIN) {
        return true;
      }

      return false;
    } catch (error) {
      this.errorService.process(error, this.origin, false);
      return false;
    }
  }
}
