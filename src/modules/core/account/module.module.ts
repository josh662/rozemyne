import { Module } from '@nestjs/common';
import controllers from './controllers';
import { publicServices, services } from './services';

import { PrismaModule } from 'src/prisma/prisma.module';
import { SharedModule } from 'src/shared/shared.module';

import { UsersModule } from 'src/modules/admin/users/module.module';
import { SessionsModule } from 'src/modules/admin/sessions/module.module';
import { VerificationsModule } from 'src/modules/admin/verifications/module.module';

@Module({
  imports: [
    PrismaModule,
    SharedModule,
    UsersModule,
    SessionsModule,
    VerificationsModule,
  ],
  controllers,
  providers: services,
  exports: publicServices,
})
export class AccountModule {}
