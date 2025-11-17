import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { initSentry } from './config/sentry.config';
import { SentryExceptionFilter } from './common/filters/sentry-exception.filter';
import { LoggerService } from './common/services/logger.service';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as bodyParser from 'body-parser';
import helmet from 'helmet';
import cors = require('cors');

// Initialize Sentry error tracking before anything else
initSentry();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
    bodyParser: false, // Disable default body parser so we can configure it
  });

  // Security headers - 2025 Security Best Practice
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      crossOriginEmbedderPolicy: false, // Allow Swagger to work
    }),
  );

  // Configure body parser with increased limits for image uploads
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  // Serve static files from uploads directory
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  // Use custom logger
  const logger = new LoggerService('Bootstrap');
  app.useLogger(logger);

  // Global exception filter for Sentry
  app.useGlobalFilters(new SentryExceptionFilter());

  // Enable CORS using express cors middleware
  const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [
    'http://localhost:19006',  // React Native app
    'http://localhost:2222',    // Admin panel
    'http://localhost:3000',    // Development
  ];

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) {
        return callback(null, true);
      }

      console.log('CORS Check - Origin:', origin, 'Allowed:', allowedOrigins);

      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      } else {
        return callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Authorization'],
  }));

  // Global prefix for API
  app.setGlobalPrefix(process.env.API_PREFIX || 'api/v1');

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
