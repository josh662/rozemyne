import { CommentsModule } from './comments/module.module';
import { ListsModule } from './lists/module.module';
import { MediasModule } from './medias/module.module';
import { MediaComponentsModule } from './mediaComponents/module.module';
import { SavesModule } from './saves/module.module';
import { UsersModule } from './users/module.module';
import { VerificationsModule } from './verifications/module.module';

export const adminModules = [
  CommentsModule,
  ListsModule,
  MediaComponentsModule,
  SavesModule,
  MediasModule,
  UsersModule,
  VerificationsModule,
];
