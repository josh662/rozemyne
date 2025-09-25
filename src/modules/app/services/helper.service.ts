import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';

import { EUserRole, PrismaService } from 'src/prisma';
import { SearchService, BaseHelperService } from 'src/shared/services';

import { origin } from '../dto';
import { createId, hashPassword } from 'src/utils';

@Injectable()
export class HelperService
  extends BaseHelperService
  implements OnApplicationBootstrap
{
  constructor(prisma: PrismaService, searchService: SearchService) {
    super(prisma, searchService);
  }
  private origin = origin;
  private logger = new Logger(`${this.origin}:helper`);

  async onApplicationBootstrap() {
    this.logger.log(`Initializing application.`);
    if (this.logger.localInstance.setLogLevels) {
      this.logger.debug(`Setting log levels.`);
      this.logger.localInstance.setLogLevels([
        'log',
        'error',
        'warn',
        'debug',
        'verbose',
      ]);
      this.logger.debug(`Log levels set.`);
    }

    this.logger.debug(`Running initial checks.`);

    this.logger.debug(`Looking for existing admin user.`);
    let user = await this.prisma.user.findFirst({
      where: {
        email: String(process.env.ADMIN_EMAIL),
      },
      select: { id: true },
    });
    if (!user) {
      this.logger.warn(`No admin user found.`);
      this.logger.warn(`Creating default admin user...`);
      user = await this.prisma.user.create({
        data: {
          id: createId(),
          firstName: 'Admin',
          lastName: 'User',
          email: String(process.env.ADMIN_EMAIL),
          password: await hashPassword(String(process.env.ADMIN_PASSWORD)),
          role: EUserRole.ADMIN,
        },
        select: { id: true },
      });
      this.logger.debug(`Default admin user created.`);
    } else {
      this.logger.debug(`Existing admin user found.`);
    }

    this.logger.debug(`Initial checks complete.`);
    this.logger.log(`App initialized complete.`);
  }

  healthCheck(): string {
    this.logger.debug('Health Check Verification');
    return `Hi there! ${process.env.PUBLIC_NAME} is healthy and running smoothly.`;
  }
}
