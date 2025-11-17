import { Controller, Post, Body, UseGuards, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AdminAuthService } from '../services/admin-auth.service';
import { AdminActivityLogService } from '../services/admin-activity-log.service';
import { LoginAdminDto } from '../dto/login-admin.dto';
import { AdminJwtAuthGuard } from '../guards/admin-jwt-auth.guard';
import { CurrentAdmin } from '../decorators/admin.decorator';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(
    private adminAuthService: AdminAuthService,
    private activityLogService: AdminActivityLogService,
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginAdminDto, @Req() req: Request) {
    const result = await this.adminAuthService.login(loginDto);

    // Log login activity
    await this.activityLogService.logActivity(
      result.admin.id,
      'ADMIN_LOGIN',
      'admin',
      result.admin.id,
      { email: result.admin.email },
      req.ip,
      req.headers['user-agent'],
    );

    return result;
  }

  @UseGuards(AdminJwtAuthGuard)
  @Get('me')
  async getProfile(@CurrentAdmin() admin: any) {
    return admin;
  }
}
