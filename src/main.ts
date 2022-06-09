import * as dotenv from 'dotenv';
dotenv.config();

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SchedulerRegistry } from '@nestjs/schedule';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as Sentry from '@sentry/node';
import * as config from 'config';
import * as helmet from 'helmet';
import { I18nService } from 'nestjs-i18n';
import { join } from 'path';
import { RedisIoAdapter } from 'src/adapters/redis.adapter';
import { AppModule } from 'src/app.module';
import { HttpExceptionFilter } from 'src/shares/filters/http-exception.filter';
import { ResponseTransformInterceptor } from 'src/shares/interceptors/response.interceptor';
import { SentryInterceptor } from 'src/shares/interceptors/sentry.interceptor';
import { BodyValidationPipe } from 'src/shares/pipes/body.validation.pipe';

const appPort = config.get<number>('app.port');
const dnsSentry = config.get<string>('sentry_dns');
const appEnv = config.get<string>('app.env');
const prefix = config.get<string>('app.prefix');

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const i18nService = app.get(I18nService);

  Sentry.init({
    dsn: dnsSentry,
    environment: appEnv,
  });

  app.setGlobalPrefix(prefix);
  app.enableCors();
  app.useGlobalInterceptors(new SentryInterceptor());
  app.useGlobalInterceptors(new ResponseTransformInterceptor());
  app.useGlobalPipes(new BodyValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter(i18nService));
  app.useStaticAssets(join(__dirname, '..', 'src/static'));
  app.useWebSocketAdapter(new RedisIoAdapter(app));

  const appName = config.get<string>('app.name');
  const options = new DocumentBuilder()
    .addBearerAuth()
    .setTitle(appName)
    .setDescription(appName)
    .setVersion('3.0.1')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: appName,
    swaggerOptions: {
      docExpansion: 'list',
      filter: true,
      displayRequestDuration: true,
    },
  });

  app.use(helmet());

  await app.listen(appPort);
  if (!config.get<boolean>('cron.enable')) {
    // disable when cron enable is false
    const schedulerRegistry = app.get(SchedulerRegistry);
    const jobs = schedulerRegistry.getCronJobs();
    jobs.forEach((_, jobId) => {
      schedulerRegistry.deleteCronJob(jobId);
    });
  }

  const logger = app.get(Logger);
  logger.setContext('NestApplication');
  logger.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
