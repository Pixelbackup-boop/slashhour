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

@Controller('admin/businesses')
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles(admin_role_enum.super_admin, admin_role_enum.moderator)
export class AdminBusinessesController {
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
        { business_name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [businesses, total] = await Promise.all([
      this.prisma.businesses.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          users: {
            select: {
              id: true,
              email: true,
              username: true,
              name: true,
            },
          },
          _count: {
            select: {
              deals: true,
              follows: true,
              user_redemptions: true,
            },
          },
        },
      }),
      this.prisma.businesses.count({ where }),
    ]);

    return {
      data: businesses,
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
    const business = await this.prisma.businesses.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            username: true,
            name: true,
          },
        },
        deals: {
          select: {
            id: true,
            title: true,
            status: true,
            original_price: true,
            discounted_price: true,
            created_at: true,
            expires_at: true,
          },
          take: 10,
          orderBy: { created_at: 'desc' },
        },
        _count: {
          select: {
            deals: true,
            follows: true,
            user_redemptions: true,
            business_reviews: true,
          },
        },
      },
    });

    return business;
  }

  @Put(':id/verify')
  @Roles(admin_role_enum.super_admin, admin_role_enum.moderator)
  async verifyBusiness(
    @Param('id') id: string,
    @CurrentAdmin() admin: any,
    @Req() req: Request,
  ) {
    const business = await this.prisma.businesses.update({
      where: { id },
      data: {
        is_verified: true,
        verification_date: new Date(),
        updated_at: new Date(),
      },
      select: {
        id: true,
        business_name: true,
        is_verified: true,
        verification_date: true,
      },
    });

    await this.activityLogService.logActivity(
      admin.id,
      'VERIFY_BUSINESS',
      'business',
      id,
      { business_name: business.business_name },
      req.ip,
      req.headers['user-agent'],
    );

    return business;
  }

  @Put(':id/unverify')
  @Roles(admin_role_enum.super_admin, admin_role_enum.moderator)
  async unverifyBusiness(
    @Param('id') id: string,
    @CurrentAdmin() admin: any,
    @Req() req: Request,
  ) {
    const business = await this.prisma.businesses.update({
      where: { id },
      data: {
        is_verified: false,
        verification_date: null,
        updated_at: new Date(),
      },
      select: {
        id: true,
        business_name: true,
        is_verified: true,
      },
    });

    await this.activityLogService.logActivity(
      admin.id,
      'UNVERIFY_BUSINESS',
      'business',
      id,
      { business_name: business.business_name },
      req.ip,
      req.headers['user-agent'],
    );

    return business;
  }

  @Put(':id/subscription')
  @Roles(admin_role_enum.super_admin)
  async updateSubscription(
    @Param('id') id: string,
    @Body() body: { subscription_tier: string; expires_at?: Date },
    @CurrentAdmin() admin: any,
    @Req() req: Request,
  ) {
    const business = await this.prisma.businesses.update({
      where: { id },
      data: {
        subscription_tier: body.subscription_tier as any,
        subscription_expires_at: body.expires_at,
        updated_at: new Date(),
      },
      select: {
        id: true,
        business_name: true,
        subscription_tier: true,
        subscription_expires_at: true,
      },
    });

    await this.activityLogService.logActivity(
      admin.id,
      'UPDATE_BUSINESS_SUBSCRIPTION',
      'business',
      id,
      body,
      req.ip,
      req.headers['user-agent'],
    );

    return business;
  }

  @Delete(':id')
  @Roles(admin_role_enum.super_admin)
  async delete(
    @Param('id') id: string,
    @CurrentAdmin() admin: any,
    @Req() req: Request,
  ) {
    const business = await this.prisma.businesses.findUnique({
      where: { id },
      select: { business_name: true },
    });

    await this.prisma.businesses.delete({
      where: { id },
    });

    await this.activityLogService.logActivity(
      admin.id,
      'DELETE_BUSINESS',
      'business',
      id,
      { business_name: business?.business_name },
      req.ip,
      req.headers['user-agent'],
    );

    return { message: 'Business deleted successfully' };
  }
}
