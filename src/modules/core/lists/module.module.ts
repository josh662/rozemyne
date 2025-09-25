import { Module } from '@nestjs/common';
import controllers from './controllers';
import { publicServices, services } from './services';

import { PrismaModule } from 'src/prisma/prisma.module';
import { SharedModule } from 'src/shared/shared.module';

import { AdminListsModule } from 'src/modules/admin/lists/module.module';

@Module({
  imports: [PrismaModule, SharedModule, AdminListsModule],
  controllers,
  providers: services,
  exports: publicServices,
})
export class ListsModule {}
