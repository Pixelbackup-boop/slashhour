import {
  Controller,
  Get,
  Put,
  Delete,
  Post,
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

@Controller('admin/content')
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles(admin_role_enum.super_admin, admin_role_enum.moderator, admin_role_enum.support)
export class AdminContentController {
  constructor(
    private prisma: PrismaService,
    private activityLogService: AdminActivityLogService,
  ) {}

  // Reviews Management
  @Get('reviews')
  async getReviews(@Query() query: PaginationDto) {
    const { page = 1, limit = 20, sortBy = 'created_at', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.prisma.business_reviews.findMany({
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          users: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          businesses: {
            select: {
              id: true,
              business_name: true,
              slug: true,
            },
          },
        },
      }),
      this.prisma.business_reviews.count(),
    ]);

    return {
      data: reviews,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Put('reviews/:id/status')
  @Roles(admin_role_enum.super_admin, admin_role_enum.moderator)
  async updateReviewStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
    @CurrentAdmin() admin: any,
    @Req() req: Request,
  ) {
    const review = await this.prisma.business_reviews.update({
      where: { id },
      data: { status: body.status, updated_at: new Date() },
    });

    await this.activityLogService.logActivity(
      admin.id,
      'UPDATE_REVIEW_STATUS',
      'review',
      id,
      { status: body.status },
      req.ip,
      req.headers['user-agent'],
    );

    return review;
  }

  @Delete('reviews/:id')
  @Roles(admin_role_enum.super_admin, admin_role_enum.moderator)
  async deleteReview(
    @Param('id') id: string,
    @CurrentAdmin() admin: any,
    @Req() req: Request,
  ) {
    await this.prisma.business_reviews.delete({
      where: { id },
    });

    await this.activityLogService.logActivity(
      admin.id,
      'DELETE_REVIEW',
      'review',
      id,
      {},
      req.ip,
      req.headers['user-agent'],
    );

    return { message: 'Review deleted successfully' };
  }

  // Reported Content Management
  @Get('reports')
  async getReports(@Query() query: PaginationDto & { status?: string }) {
    const page = parseInt(query.page as any) || 1;
    const limit = parseInt(query.limit as any) || 20;
    const { status, sortBy = 'created_at', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [reports, total] = await Promise.all([
      this.prisma.reported_content.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.reported_content.count({ where }),
    ]);

    return {
      data: reports,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Put('reports/:id/review')
  @Roles(admin_role_enum.super_admin, admin_role_enum.moderator)
  async reviewReport(
    @Param('id') id: string,
    @Body() body: { status: string; resolution?: string },
    @CurrentAdmin() admin: any,
    @Req() req: Request,
  ) {
    const report = await this.prisma.reported_content.update({
      where: { id },
      data: {
        status: body.status as any,
        resolution: body.resolution,
        reviewed_by: admin.id,
        reviewed_at: new Date(),
      },
    });

    await this.activityLogService.logActivity(
      admin.id,
      'REVIEW_REPORT',
      'reported_content',
      id,
      { status: body.status, resolution: body.resolution },
      req.ip,
      req.headers['user-agent'],
    );

    // Get content title for message
    let contentTitle = 'your report';
    try {
      if (report.content_type === 'deal') {
        const deal = await this.prisma.deals.findUnique({
          where: { id: report.content_id },
          select: { title: true },
        });
        if (deal) contentTitle = `"${deal.title}"`;
      } else if (report.content_type === 'business') {
        const business = await this.prisma.businesses.findUnique({
          where: { id: report.content_id },
          select: { business_name: true },
        });
        if (business) contentTitle = `"${business.business_name}"`;
      }
    } catch (error) {
      console.log('Could not fetch content title for message:', error);
    }

    // Send status update message to the reporter
    const SYSTEM_USER_ID = 'b7b0ae24-b87c-4024-a975-2e371c580336'; // Slashhour system user

    let messageText = '';
    if (body.status === 'reviewed') {
      messageText = `📋 Report Update\n\nYour report about ${contentTitle} has been reviewed by our team.\n\n${body.resolution || 'We are taking appropriate action.'}\n\nReport ID: ${report.id.slice(0, 8)}`;
    } else if (body.status === 'resolved') {
      messageText = `✅ Report Resolved\n\nYour report about ${contentTitle} has been resolved.\n\n${body.resolution || 'Thank you for helping keep Slashhour safe!'}\n\nReport ID: ${report.id.slice(0, 8)}`;
    } else if (body.status === 'dismissed') {
      messageText = `ℹ️ Report Reviewed\n\nYour report about ${contentTitle} has been reviewed.\n\n${body.resolution || 'No violation was found at this time.'}\n\nReport ID: ${report.id.slice(0, 8)}`;
    }

    if (messageText) {
      // Get or create conversation with reporter
      let conversation = await this.prisma.conversations.findFirst({
        where: {
          business_id: SYSTEM_USER_ID,
          customer_id: report.reporter_id,
        },
      });

      if (!conversation) {
        conversation = await this.prisma.conversations.create({
          data: {
            business_id: SYSTEM_USER_ID,
            customer_id: report.reporter_id,
            last_message_at: new Date(),
            last_message_text: 'Report update',
          },
        });
      }

      // Send message from Slashhour
      await this.prisma.messages.create({
        data: {
          conversation_id: conversation.id,
          sender_id: SYSTEM_USER_ID,
          message_text: messageText,
          message_type: 'system',
          is_read: false,
        },
      });

      // Update conversation last message
      await this.prisma.conversations.update({
        where: { id: conversation.id },
        data: {
          last_message_at: new Date(),
          last_message_text: messageText.substring(0, 100),
          unread_count: { increment: 1 },
        },
      });
    }

    return report;
  }

  @Post('reports')
  async createReport(
    @Body() body: {
      reporter_id: string;
      content_type: string;
      content_id: string;
      reason: string;
      description?: string;
    },
  ) {
    const report = await this.prisma.reported_content.create({
      data: {
        reporter_id: body.reporter_id,
        content_type: body.content_type as any,
        content_id: body.content_id,
        reason: body.reason,
        description: body.description,
      },
    });

    return report;
  }

  // Notifications Management
  @Post('notifications/broadcast')
  @Roles(admin_role_enum.super_admin)
  async broadcastNotification(
    @Body() body: {
      title: string;
      body: string;
      image_url?: string;
      action_url?: string;
      user_ids?: string[];
    },
    @CurrentAdmin() admin: any,
    @Req() req: Request,
  ) {
    const targetUserIds = body.user_ids && body.user_ids.length > 0
      ? body.user_ids
      : (await this.prisma.users.findMany({ select: { id: true } })).map(u => u.id);

    const notifications = targetUserIds.map(userId => ({
      user_id: userId,
      type: 'system' as any,
      title: body.title,
      body: body.body,
      image_url: body.image_url,
      action_url: body.action_url,
    }));

    await this.prisma.notifications.createMany({
      data: notifications,
    });

    await this.activityLogService.logActivity(
      admin.id,
      'BROADCAST_NOTIFICATION',
      'notification',
      undefined,
      { title: body.title, recipientCount: targetUserIds.length },
      req.ip,
      req.headers['user-agent'],
    );

    return {
      message: `Notification sent to ${targetUserIds.length} users`,
      count: targetUserIds.length,
    };
  }
}
