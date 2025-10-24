import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import databaseConfig from './config/database.config';
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
import { LoggerService } from './common/services/logger.service';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    // Config Module
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      envFilePath: '.env',
    }),

    // Prisma Module (Global)
    PrismaModule,

    // TypeORM Module
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get('database');
        if (!dbConfig) {
          throw new Error('Database configuration not found');
        }
        return dbConfig;
      },
    }),

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
