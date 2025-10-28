import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
import { LoggerService } from './common/services/logger.service';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    // Config Module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Prisma Module (Global)
    PrismaModule,

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
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: LoggerService,
      useValue: new LoggerService('AppModule'),
    },
  ],
  exports: [LoggerService],
})
export class AppModule {}
