import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Query,
} from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminActivityLogService } from '../services/admin-activity-log.service';
import { AdminJwtAuthGuard } from '../guards/admin-jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CurrentAdmin } from '../decorators/admin.decorator';
import { admin_role_enum } from '../../../generated/prisma';
import { LinkDetectorUtil } from '../utils/link-detector.util';

interface BroadcastMessageDto {
  message: string;
  target_group?: 'all' | 'new_users' | 'active_users' | 'business_owners' | 'consumers';
  scheduled_at?: string; // ISO datetime string for scheduled broadcasts
}

interface DeliveryStatsDto {
  total_sent: number;
  total_delivered: number;
  total_read: number;
  failed: number;
}

interface DetectedLink {
  url: string;
  position?: number;
}

interface LinkClick {
  id: string;
  broadcast_id: string;
  user_id: string;
  link_url: string;
  clicked_at: Date;
  users: {
    id: string;
    username: string;
    email: string | null;
  };
}

interface AdminUser {
  id: string;
  email: string;
  role: string;
}

@Controller('admin/messages')
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles(admin_role_enum.super_admin, admin_role_enum.moderator)
export class AdminMessagesController {
  private readonly SYSTEM_USER_ID = 'b7b0ae24-b87c-4024-a975-2e371c580336';

  constructor(
    private prisma: PrismaService,
    private activityLogService: AdminActivityLogService,
  ) {}

  /**
   * Get user count for each target group
   */
  @Get('broadcast/user-count')
  async getUserCount(@Query('group') group?: string) {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const counts = {
      all: await this.prisma.users.count({
        where: { user_type: { in: ['consumer', 'business'] } },
      }),
      new_users: await this.prisma.users.count({
        where: {
          user_type: { in: ['consumer', 'business'] },
          created_at: { gte: sevenDaysAgo },
        },
      }),
      active_users: await this.prisma.users.count({
        where: {
          user_type: { in: ['consumer', 'business'] },
          last_active_at: { gte: thirtyDaysAgo },
        },
      }),
      business_owners: await this.prisma.users.count({
        where: { user_type: 'business' },
      }),
      consumers: await this.prisma.users.count({
        where: { user_type: 'consumer' },
      }),
    };

    return group ? { count: counts[group] || 0 } : counts;
  }

  /**
   * Broadcast message to users
   */
  @Post('broadcast')
  @Roles(admin_role_enum.super_admin)
  async broadcastMessage(
    @Body() body: BroadcastMessageDto,
    @CurrentAdmin() admin: AdminUser,
    @Req() req: Request,
  ) {
    const { message, target_group = 'all', scheduled_at } = body;

    // Validate message
    if (!message || message.trim().length === 0) {
      throw new Error('Message cannot be empty');
    }

    if (message.length > 1000) {
      throw new Error('Message cannot exceed 1000 characters');
    }

    // Detect links in message
    const detectedLinks = LinkDetectorUtil.getUniqueLinks(message);
    const hasLinks = detectedLinks.length > 0;

    // Get target users based on group
    const targetUsers = await this.getTargetUsers(target_group);

    if (targetUsers.length === 0) {
      return {
        success: false,
        message: 'No users match the target group',
        stats: {
          total_targeted: 0,
          messages_sent: 0,
          conversations_created: 0,
        },
      };
    }

    // Create broadcast record
    const broadcast = await this.prisma.broadcast_messages.create({
      data: {
        admin_id: admin.id,
        message: message.trim(),
        target_group,
        users_targeted: targetUsers.length,
        contains_links: hasLinks,
        links: hasLinks ? JSON.parse(JSON.stringify(detectedLinks)) : null,
        scheduled_at: scheduled_at ? new Date(scheduled_at) : null,
        status: scheduled_at ? 'scheduled' : 'sending',
      },
    });

    // If scheduled, save for later processing
    if (scheduled_at) {
      // TODO: Implement scheduling with a job queue
      // For now, we'll send immediately
    }

    // Send messages
    let conversationsCreated = 0;
    let messagesSent = 0;
    const errors: Array<{ user_id: string; error: string }> = [];

    for (const user of targetUsers) {
      try {
        // Get or create conversation
        let conversation = await this.prisma.conversations.findFirst({
          where: {
            business_id: this.SYSTEM_USER_ID,
            customer_id: user.id,
          },
        });

        if (!conversation) {
          conversation = await this.prisma.conversations.create({
            data: {
              business_id: this.SYSTEM_USER_ID,
              customer_id: user.id,
              last_message_at: new Date(),
              last_message_text: message.substring(0, 100),
            },
          });
          conversationsCreated++;
        }

        // Send message with broadcast_id link
        await this.prisma.messages.create({
          data: {
            conversation_id: conversation.id,
            sender_id: this.SYSTEM_USER_ID,
            message_text: message,
            message_type: 'system',
            is_read: false,
            broadcast_id: broadcast.id, // Link to broadcast
          },
        });

        // Update conversation
        await this.prisma.conversations.update({
          where: { id: conversation.id },
          data: {
            last_message_at: new Date(),
            last_message_text: message.substring(0, 100),
            unread_count: { increment: 1 },
          },
        });

        messagesSent++;
      } catch (error) {
        errors.push({
          user_id: user.id,
          error: error.message,
        });
      }
    }

    // Update broadcast record with final stats
    await this.prisma.broadcast_messages.update({
      where: { id: broadcast.id },
      data: {
        messages_sent: messagesSent,
        messages_delivered: messagesSent, // Assume all sent are delivered
        conversations_created: conversationsCreated,
        errors_count: errors.length,
        sent_at: new Date(),
        status: 'sent',
      },
    });

    // Log activity
    await this.activityLogService.logActivity(
      admin.id,
      'BROADCAST_MESSAGE',
      'messages',
      broadcast.id,
      {
        target_group,
        total_targeted: targetUsers.length,
        messages_sent: messagesSent,
        conversations_created: conversationsCreated,
        message_preview: message.substring(0, 100),
        broadcast_id: broadcast.id,
      },
      req.ip,
      req.headers['user-agent'],
    );

    return {
      success: true,
      message: 'Broadcast sent successfully',
      broadcast_id: broadcast.id, // Return broadcast ID
      stats: {
        total_targeted: targetUsers.length,
        messages_sent: messagesSent,
        conversations_created: conversationsCreated,
        errors: errors.length,
      },
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Get broadcast delivery statistics (legacy - overall stats)
   */
  @Get('broadcast/stats')
  async getBroadcastStats(): Promise<DeliveryStatsDto> {
    // Get all system messages
    const systemMessages = await this.prisma.messages.findMany({
      where: {
        sender_id: this.SYSTEM_USER_ID,
        message_type: 'system',
      },
      select: {
        is_read: true,
      },
    });

    const totalSent = systemMessages.length;
    const totalRead = systemMessages.filter(m => m.is_read).length;

    return {
      total_sent: totalSent,
      total_delivered: totalSent, // Assuming all sent are delivered for now
      total_read: totalRead,
      failed: 0, // Track failures in production
    };
  }

  /**
   * Get all broadcasts (history)
   */
  @Get('broadcasts')
  async getBroadcasts(
    @Query('page') pageParam?: string,
    @Query('limit') limitParam?: string,
    @Query('status') status?: string,
  ) {
    const page = parseInt(pageParam || '1', 10);
    const limit = parseInt(limitParam || '20', 10);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [broadcasts, total] = await Promise.all([
      this.prisma.broadcast_messages.findMany({
        where,
        include: {
          admins: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.broadcast_messages.count({ where }),
    ]);

    return {
      broadcasts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get specific broadcast with detailed analytics
   */
  @Get('broadcasts/:id')
  async getBroadcast(@Query('id') id: string) {
    const broadcast = await this.prisma.broadcast_messages.findUnique({
      where: { id },
      include: {
        admins: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        messages: {
          select: {
            id: true,
            is_read: true,
            read_at: true,
            created_at: true,
          },
        },
      },
    });

    if (!broadcast) {
      throw new Error('Broadcast not found');
    }

    // Calculate real-time stats from messages
    const messagesRead = broadcast.messages.filter(m => m.is_read).length;

    // Get link clicks if broadcast has links
    let linkClicks: LinkClick[] = [];
    if (broadcast.contains_links) {
      linkClicks = await this.prisma.broadcast_link_clicks.findMany({
        where: { broadcast_id: id },
        include: {
          users: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
        orderBy: {
          clicked_at: 'desc',
        },
      }) as LinkClick[];
    }

    // Calculate link click stats
    const linkStats = broadcast.contains_links && broadcast.links
      ? (broadcast.links as unknown as DetectedLink[]).map((link) => {
          const clicks = linkClicks.filter((c) => c.link_url === link.url);
          return {
            url: link.url,
            total_clicks: clicks.length,
            unique_users: new Set(clicks.map((c) => c.user_id)).size,
            recent_clicks: clicks.slice(0, 5),
          };
        })
      : [];

    return {
      ...broadcast,
      analytics: {
        messages_read: messagesRead,
        read_rate: broadcast.messages_sent > 0
          ? Math.round((messagesRead / broadcast.messages_sent) * 100)
          : 0,
        link_stats: linkStats,
        total_link_clicks: linkClicks.length,
      },
    };
  }

  /**
   * Track link click
   */
  @Post('broadcasts/:id/track-click')
  async trackLinkClick(
    @Query('id') broadcastId: string,
    @Body() body: { user_id: string; link_url: string },
    @Req() req: Request,
  ) {
    const { user_id, link_url } = body;

    // Verify broadcast exists
    const broadcast = await this.prisma.broadcast_messages.findUnique({
      where: { id: broadcastId },
    });

    if (!broadcast) {
      throw new Error('Broadcast not found');
    }

    // Record click
    await this.prisma.broadcast_link_clicks.create({
      data: {
        broadcast_id: broadcastId,
        user_id,
        link_url,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      },
    });

    // Update broadcast total link clicks
    await this.prisma.broadcast_messages.update({
      where: { id: broadcastId },
      data: {
        total_link_clicks: {
          increment: 1,
        },
      },
    });

    return {
      success: true,
      message: 'Link click tracked',
    };
  }

  /**
   * Get target users based on group filter
   */
  private async getTargetUsers(group: string) {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let where: any = {
      user_type: { in: ['consumer', 'business'] },
    };

    switch (group) {
      case 'new_users':
        where = {
          user_type: { in: ['consumer', 'business'] },
          created_at: { gte: sevenDaysAgo },
        };
        break;
      case 'active_users':
        where = {
          user_type: { in: ['consumer', 'business'] },
          last_active_at: { gte: thirtyDaysAgo },
        };
        break;
      case 'business_owners':
        where = { user_type: 'business' };
        break;
      case 'consumers':
        where = { user_type: 'consumer' };
        break;
      case 'all':
      default:
        // Use base where
        break;
    }

    return this.prisma.users.findMany({
      where,
      select: {
        id: true,
        username: true,
        email: true,
      },
    });
  }
}
