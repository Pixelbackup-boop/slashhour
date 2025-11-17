import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminActivityLogService } from '../services/admin-activity-log.service';
import { PaginationDto } from '../dto/query-params.dto';
import { AdminJwtAuthGuard } from '../guards/admin-jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CurrentAdmin } from '../decorators/admin.decorator';
import { admin_role_enum } from '../../../generated/prisma';

@Controller('admin/users')
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles(admin_role_enum.super_admin, admin_role_enum.moderator, admin_role_enum.support)
export class AdminUsersController {
  constructor(
    private prisma: PrismaService,
    private activityLogService: AdminActivityLogService,
  ) {}

  @Get()
  async findAll(@Query() query: PaginationDto) {
    const { page = 1, limit = 20, search, sortBy = 'created_at', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.users.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          user_type: true,
          status: true,
          email_verified: true,
          phone_verified: true,
          created_at: true,
          last_active_at: true,
          _count: {
            select: {
              businesses: true,
              user_redemptions: true,
              follows: true,
            },
          },
        },
      }),
      this.prisma.users.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.prisma.users.findUnique({
      where: { id },
      include: {
        businesses: {
          select: {
            id: true,
            business_name: true,
            slug: true,
            category: true,
            is_verified: true,
            subscription_tier: true,
            created_at: true,
          },
        },
        _count: {
          select: {
            user_redemptions: true,
            follows: true,
            business_reviews: true,
            bookmarks: true,
          },
        },
      },
    });

    if (!user) {
      return { error: 'User not found' };
    }

    // Remove sensitive data
    const { password, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }

  @Put(':id/status')
  @Roles(admin_role_enum.super_admin, admin_role_enum.moderator)
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
    @CurrentAdmin() admin: any,
    @Req() req: Request,
  ) {
    const user = await this.prisma.users.update({
      where: { id },
      data: { status: body.status, updated_at: new Date() },
      select: {
        id: true,
        email: true,
        username: true,
        status: true,
      },
    });

    await this.activityLogService.logActivity(
      admin.id,
      'UPDATE_USER_STATUS',
      'user',
      id,
      { status: body.status },
      req.ip,
      req.headers['user-agent'],
    );

    return user;
  }

  @Put(':id/verify-email')
  @Roles(admin_role_enum.super_admin, admin_role_enum.moderator)
  async verifyEmail(
    @Param('id') id: string,
    @CurrentAdmin() admin: any,
    @Req() req: Request,
  ) {
    const user = await this.prisma.users.update({
      where: { id },
      data: { email_verified: true, updated_at: new Date() },
      select: { id: true, email: true, email_verified: true },
    });

    await this.activityLogService.logActivity(
      admin.id,
      'VERIFY_USER_EMAIL',
      'user',
      id,
      {},
      req.ip,
      req.headers['user-agent'],
    );

    return user;
  }

  @Delete(':id')
  @Roles(admin_role_enum.super_admin)
  async delete(
    @Param('id') id: string,
    @CurrentAdmin() admin: any,
    @Req() req: Request,
  ) {
    await this.prisma.users.delete({
      where: { id },
    });

    await this.activityLogService.logActivity(
      admin.id,
      'DELETE_USER',
      'user',
      id,
      {},
      req.ip,
      req.headers['user-agent'],
    );

    return { message: 'User deleted successfully' };
  }

  @Get(':id/activity')
  async getUserActivity(@Param('id') id: string, @Query() query: PaginationDto) {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const [redemptions, follows, reviews] = await Promise.all([
      this.prisma.user_redemptions.findMany({
        where: { user_id: id },
        take: limit,
        skip,
        orderBy: { redeemed_at: 'desc' },
        include: {
          deals: { select: { title: true } },
          businesses: { select: { business_name: true } },
        },
      }),
      this.prisma.follows.findMany({
        where: { user_id: id },
        take: limit,
        orderBy: { followed_at: 'desc' },
        include: {
          businesses: { select: { business_name: true, slug: true } },
        },
      }),
      this.prisma.business_reviews.findMany({
        where: { user_id: id },
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          businesses: { select: { business_name: true } },
        },
      }),
    ]);

    return {
      redemptions,
      follows,
      reviews,
    };
  }
}
