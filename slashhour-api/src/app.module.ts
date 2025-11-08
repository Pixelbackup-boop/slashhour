import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { FeedModule } from './feed/feed.module';
import { FollowsModule } from './follows/follows.module';
import { BusinessesModule } from './businesses/businesses.module';
import { DealsModule } from './deals/deals.module';
import { SearchModule } from './search/search.module';
import { RedemptionsModule } from './redemptions/redemptions.module';
import { ConversationsModule } from './conversations/conversations.module';
import { UploadModule } from './upload/upload.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReviewsModule } from './reviews/reviews.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import { CronModule } from './cron/cron.module';
import { LoggerService } from './common/services/logger.service';
import { PrismaModule } from './prisma/prisma.module';
import { CacheModule } from './cache/cache.module';

@Module({
  imports: [
    // Config Module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate Limiting - 2025 Security Best Practice
    ThrottlerModule.forRoot([
      {
        ttl: 60000,  // Time window: 60 seconds
        limit: 100,  // Max 100 requests per minute per IP
      },
    ]),

    // Prisma Module (Global)
    PrismaModule,

    // Cache Module (Global)
    CacheModule,

    // Feature Modules
    UsersModule,
    AuthModule,
    FeedModule,
    FollowsModule,
    BusinessesModule,
    DealsModule,
    SearchModule,
    RedemptionsModule,
    ConversationsModule,
    UploadModule,
    NotificationsModule,
    ReviewsModule,
    BookmarksModule,

    // Cron Jobs
    CronModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: LoggerService,
      useValue: new LoggerService('AppModule'),
    },
    // Global rate limiting guard - 2025 Security Best Practice
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [LoggerService],
})
export class AppModule {}
