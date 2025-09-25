import { NestFactory } from '@nestjs/core';
import { VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';

import { setupGracefulShutdown } from 'nestjs-graceful-shutdown';
import compression from 'compression';
import helmet from 'helmet';

import { AppModule } from './modules/app/module.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  setupGracefulShutdown({ app });

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: process.env.DEFAULT_SERVICE_VERSION,
  });

  if (process.env.CORS_ENABLED === 'true') {
    app.enableCors({
      origin: process.env.CORS_ORIGIN,
      methods: process.env.CORS_METHODS,
      credentials: process.env.CORS_CREDENTIALS === 'true',
    });
  }

  app.use(compression());
  app.use(helmet());

  const config = new DocumentBuilder()
    .setTitle(String(process.env.PUBLIC_NAME))
    .setDescription('Documentação Swagger da API')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'authorization',
      description: 'Insira o token',
      in: 'header',
    })
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory, {
    raw: ['json', 'yaml'],
  });

  const configService = app.get<ConfigService>(ConfigService);
  const PORT = configService.get<number>('SERVER_PORT', {
    infer: true,
  }) as number;

  await app.listen(PORT);
}
bootstrap();
