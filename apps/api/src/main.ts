import './instrument';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ApiExceptionFilter } from './common/filters/api-exception.filter';
import { registerOpenApi } from './config/openapi-document';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api/v1');
  app.useGlobalFilters(new ApiExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  registerOpenApi(app);

  app.enableCors({
    origin: [
      'http://localhost:3001',
      'http://127.0.0.1:3001',
    ],
  });

  const port = configService.get<number>('port', 3000);
  await app.listen(port);
}

bootstrap();
