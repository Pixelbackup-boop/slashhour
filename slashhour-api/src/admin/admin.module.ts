import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from '../prisma/prisma.service';

// Services
import { AdminAuthService } from './services/admin-auth.service';
import { AdminService } from './services/admin.service';
import { AdminActivityLogService } from './services/admin-activity-log.service';

// Controllers
import { AdminAuthController } from './controllers/admin-auth.controller';
import { AdminAdminsController } from './controllers/admin-admins.controller';
import { AdminUsersController } from './controllers/admin-users.controller';
import { AdminBusinessesController } from './controllers/admin-businesses.controller';
import { AdminDealsController } from './controllers/admin-deals.controller';
import { AdminAnalyticsController } from './controllers/admin-analytics.controller';
import { AdminContentController } from './controllers/admin-content.controller';
import { AdminMessagesController } from './controllers/admin-messages.controller';

// Strategies
import { AdminJwtStrategy } from './strategies/admin-jwt.strategy';

// Guards
import { AdminJwtAuthGuard } from './guards/admin-jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('ADMIN_JWT_SECRET') || configService.get<string>('JWT_SECRET') || 'default-secret',
        signOptions: {
          expiresIn: '12h', // Admin tokens expire in 12 hours
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [
    AdminAuthController,
    AdminAdminsController,
    AdminUsersController,
    AdminBusinessesController,
    AdminDealsController,
    AdminAnalyticsController,
    AdminContentController,
    AdminMessagesController,
  ],
  providers: [
    PrismaService,
    AdminAuthService,
    AdminService,
    AdminActivityLogService,
    AdminJwtStrategy,
    AdminJwtAuthGuard,
    RolesGuard,
  ],
  exports: [AdminAuthService, AdminService, AdminActivityLogService],
})
export class AdminModule {}
