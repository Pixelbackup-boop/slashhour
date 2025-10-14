import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { initSentry } from './config/sentry.config';
import { SentryExceptionFilter } from './common/filters/sentry-exception.filter';
import { LoggerService } from './common/services/logger.service';

// Initialize Sentry error tracking before anything else
initSentry();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Use custom logger
  const logger = new LoggerService('Bootstrap');
  app.useLogger(logger);

  // Global exception filter for Sentry
  app.useGlobalFilters(new SentryExceptionFilter());

  // Global prefix for API
  app.setGlobalPrefix(process.env.API_PREFIX || 'api/v1');

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:19006'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Slashhour API')
    .setDescription('Essential deals platform API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('businesses', 'Business management endpoints')
    .addTag('deals', 'Deal management endpoints')
    .addTag('follows', 'Follow/Unfollow businesses')
    .addTag('feed', 'User feeds')
    .addTag('search', 'Search and filter endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`
  🚀 Slashhour API is running!
  📍 URL: http://localhost:${port}/${process.env.API_PREFIX || 'api/v1'}
  📚 Swagger Docs: http://localhost:${port}/api/docs
  🌍 Environment: ${process.env.NODE_ENV || 'development'}
  `);
}
bootstrap();
