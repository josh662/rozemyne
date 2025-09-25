import { MediasModule } from './medias/module.module';
import { MediaComponentsModule } from './mediaComponents/module.module';
import { UsersModule } from './users/module.module';
import { VerificationsModule } from './verifications/module.module';

export const adminModules = [
  MediaComponentsModule,
  MediasModule,
  UsersModule,
  VerificationsModule,
];
