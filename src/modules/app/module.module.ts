import { ExecutionContext, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { Request } from 'express';

import { GracefulShutdownModule } from 'nestjs-graceful-shutdown';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import { JwtModule } from '@nestjs/jwt';
import { ZodValidationPipe } from 'nestjs-zod';
import { seconds, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';

import controllers from './controllers';
import { services } from './services';

// Utils
import { envSchema } from 'src/utils';

// Modules

import { SharedModule } from 'src/shared/shared.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { adminModules } from '../admin';
import { coreModules } from '../core';

@Module({
  imports: [
    GracefulShutdownModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['.env', '.env.production'],
      expandVariables: true,
      validate: (env) => envSchema.parse(env),
    }),
    CacheModule.register({
      isGlobal: true,
      stores: [createKeyv(`${process.env.REDIS_URL}`)],
    }),
    EventEmitterModule.forRoot({
      wildcard: true,
    }),
    ThrottlerModule.forRoot({
      throttlers: [{ name: 'default', ttl: seconds(10), limit: 5 }],
      errorMessage: 'Wow! Slow down there tiger 🐯',
      storage: new ThrottlerStorageRedisService(process.env.REDIS_URL),
      getTracker: (req: Request) => {
        return req.headers.authorization || 'default';
      },
      generateKey: (
        context: ExecutionContext,
        trackerString: string,
        throttlerName: string,
      ) => {
        return trackerString;
      },
    }),
    JwtModule.register({
      global: true,
      secret: process.env.SYSTEM_KEY,
      signOptions: { expiresIn: process.env.JWT_PERIOD },
    }),
    PrismaModule,
    SharedModule,
    ...adminModules,
    ...coreModules,
  ],
  controllers,
  providers: [
    ...services,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
