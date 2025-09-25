import { Module } from '@nestjs/common';
import controllers from './controllers';
import { publicServices, services } from './services';

import { PrismaModule } from 'src/prisma/prisma.module';
import { SharedModule } from 'src/shared/shared.module';

import { AdminUsersModule } from 'src/modules/admin/users/module.module';
import { AdminSessionsModule } from 'src/modules/admin/sessions/module.module';
import { AdminVerificationsModule } from 'src/modules/admin/verifications/module.module';

@Module({
  imports: [
    PrismaModule,
    SharedModule,
    AdminUsersModule,
    AdminSessionsModule,
    AdminVerificationsModule,
  ],
  controllers,
  providers: services,
  exports: publicServices,
})
export class AccountModule {}
