import { Module } from '@nestjs/common';
import controllers from './controllers';
import { publicServices, services } from './services';

import { PrismaModule } from 'src/prisma/prisma.module';
import { SharedModule } from 'src/shared/shared.module';

import { AdminSavesModule } from 'src/modules/admin/saves/module.module';

@Module({
  imports: [PrismaModule, SharedModule, AdminSavesModule],
  controllers,
  providers: services,
  exports: publicServices,
})
export class SavesModule {}
