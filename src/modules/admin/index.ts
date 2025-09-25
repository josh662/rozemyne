import { AdminCommentsModule } from './comments/module.module';
import { AdminListsModule } from './lists/module.module';
import { AdminMediasModule } from './medias/module.module';
import { AdminMediaComponentsModule } from './mediaComponents/module.module';
import { AdminSavesModule } from './saves/module.module';
import { AdminUsersModule } from './users/module.module';
import { AdminVerificationsModule } from './verifications/module.module';

export const adminModules = [
  AdminCommentsModule,
  AdminListsModule,
  AdminMediaComponentsModule,
  AdminSavesModule,
  AdminMediasModule,
  AdminUsersModule,
  AdminVerificationsModule,
];
