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

@Controller('admin/deals')
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles(admin_role_enum.super_admin, admin_role_enum.moderator)
export class AdminDealsController {
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
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [deals, total] = await Promise.all([
      this.prisma.deals.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          businesses: {
            select: {
              id: true,
              business_name: true,
              slug: true,
              category: true,
            },
          },
          _count: {
            select: {
              user_redemptions: true,
              bookmarks: true,
            },
          },
        },
      }),
      this.prisma.deals.count({ where }),
    ]);

    return {
      data: deals,
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
    const deal = await this.prisma.deals.findUnique({
      where: { id },
      include: {
        businesses: {
          select: {
            id: true,
            business_name: true,
            slug: true,
            category: true,
            owner_id: true,
          },
        },
        user_redemptions: {
          take: 10,
          orderBy: { redeemed_at: 'desc' },
          include: {
            users: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            user_redemptions: true,
            bookmarks: true,
          },
        },
      },
    });

    return deal;
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
    @CurrentAdmin() admin: any,
    @Req() req: Request,
  ) {
    const deal = await this.prisma.deals.update({
      where: { id },
      data: { status: body.status as any, updated_at: new Date() },
      select: {
        id: true,
        title: true,
        status: true,
      },
    });

    await this.activityLogService.logActivity(
      admin.id,
      'UPDATE_DEAL_STATUS',
      'deal',
      id,
      { status: body.status, title: deal.title },
      req.ip,
      req.headers['user-agent'],
    );

    return deal;
  }

  @Delete(':id')
  @Roles(admin_role_enum.super_admin, admin_role_enum.moderator)
  async delete(
    @Param('id') id: string,
    @CurrentAdmin() admin: any,
    @Req() req: Request,
  ) {
    const deal = await this.prisma.deals.findUnique({
      where: { id },
      select: { title: true },
    });

    await this.prisma.deals.delete({
      where: { id },
    });

    await this.activityLogService.logActivity(
      admin.id,
      'DELETE_DEAL',
      'deal',
      id,
      { title: deal?.title },
      req.ip,
      req.headers['user-agent'],
    );

    return { message: 'Deal deleted successfully' };
  }

  @Get('stats/overview')
  async getDealStats() {
    const [total, active, expired, flashDeals] = await Promise.all([
      this.prisma.deals.count(),
      this.prisma.deals.count({ where: { status: 'active' } }),
      this.prisma.deals.count({ where: { status: 'expired' } }),
      this.prisma.deals.count({ where: { is_flash_deal: true, status: 'active' } }),
    ]);

    return {
      total,
      active,
      expired,
      flashDeals,
    };
  }
}
