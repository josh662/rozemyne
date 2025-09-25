import { Module } from '@nestjs/common';
import controllers from './controllers';
import { publicServices, services } from './services';

import { PrismaModule } from 'src/prisma/prisma.module';
import { SharedModule } from 'src/shared/shared.module';

import { AdminCommentsModule } from 'src/modules/admin/comments/module.module';

@Module({
  imports: [PrismaModule, SharedModule, AdminCommentsModule],
  controllers,
  providers: services,
  exports: publicServices,
})
export class CommentsModule {}
