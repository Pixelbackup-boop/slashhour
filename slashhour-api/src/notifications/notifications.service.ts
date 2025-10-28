import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { getFirebaseApp } from '../config/firebase.config.js';
import * as admin from 'firebase-admin';
import { NotificationType } from './entities/notification.entity.js';
import { RegisterDeviceTokenDto } from './dto/register-device-token.dto.js';
import { SendNotificationDto } from './dto/send-notification.dto.js';
import { MarkAsReadDto } from './dto/mark-as-read.dto.js';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private firebaseApp: admin.app.App | null;

  constructor(private prisma: PrismaService) {
    this.firebaseApp = getFirebaseApp();
    if (!this.firebaseApp) {
      this.logger.warn('Firebase not initialized. Push notifications disabled.');
    }
  }

  /**
   * Register a device token for push notifications
   */
  async registerDeviceToken(userId: string, dto: RegisterDeviceTokenDto) {
    try {
      // Upsert device token (update if exists, create if not)
      const deviceToken = await this.prisma.device_tokens.upsert({
        where: {
          user_id_device_token: {
            user_id: userId,
            device_token: dto.device_token,
          },
        },
        update: {
          device_type: dto.device_type,
          device_name: dto.device_name,
          is_active: true,
          updated_at: new Date(),
        },
        create: {
          user_id: userId,
          device_token: dto.device_token,
          device_type: dto.device_type,
          device_name: dto.device_name,
          is_active: true,
        },
      });

      this.logger.log(`Device token registered for user ${userId}`);
      return deviceToken;
    } catch (error) {
      this.logger.error('Error registering device token:', error);
      throw error;
    }
  }

  /**
   * Deactivate a device token
   */
  async deactivateDeviceToken(userId: string, deviceToken: string) {
    try {
      await this.prisma.device_tokens.updateMany({
        where: {
          user_id: userId,
          device_token: deviceToken,
        },
        data: {
          is_active: false,
          updated_at: new Date(),
        },
      });

      this.logger.log(`Device token deactivated for user ${userId}`);
      return { success: true };
    } catch (error) {
      this.logger.error('Error deactivating device token:', error);
      throw error;
    }
  }

  /**
   * Send push notification to specific users
   */
  async sendNotification(dto: SendNotificationDto) {
    try {
      // Store notification in database for all users
      const notifications = await Promise.all(
        dto.user_ids.map((userId) =>
          this.prisma.notifications.create({
            data: {
              user_id: userId,
              type: dto.type as any,
              title: dto.title,
              body: dto.body,
              data: dto.data || {},
              image_url: dto.image_url,
              action_url: dto.action_url,
            },
          }),
        ),
      );

      // Send FCM push notifications if Firebase is configured
      if (this.firebaseApp) {
        await this.sendFCMNotifications(dto.user_ids, dto);
      } else {
        this.logger.warn('Skipping FCM push - Firebase not configured');
      }

      this.logger.log(`Sent notification to ${dto.user_ids.length} users`);
      return notifications;
    } catch (error) {
      this.logger.error('Error sending notification:', error);
      throw error;
    }
  }

  /**
   * Get Android notification channel based on notification type
   */
  private getAndroidChannel(type: string): string {
    const channelMap: Record<string, string> = {
      new_deal: 'new_deal',
      flash_deal: 'flash_deal',
      expiring_soon: 'expiring_soon',
      savings_milestone: 'savings_milestone',
    };
    return channelMap[type] || 'default';
  }

  /**
   * Get notification category for action buttons
   */
  private getNotificationCategory(type: string): string {
    if (type === 'new_deal' || type === 'flash_deal' || type === 'expiring_soon') {
      return 'deal_notification';
    }
    if (type === 'savings_milestone') {
      return 'savings_notification';
    }
    return 'default';
  }

  /**
   * Send FCM push notifications to devices
   */
  private async sendFCMNotifications(userIds: string[], dto: SendNotificationDto) {
    try {
      this.logger.log(`🔍 [FCM DEBUG] Sending FCM to user IDs: ${userIds.join(', ')}`);

      // Get all active device tokens for these users
      const deviceTokens = await this.prisma.device_tokens.findMany({
        where: {
          user_id: { in: userIds },
          is_active: true,
        },
      });

      this.logger.log(`🔍 [FCM DEBUG] Found ${deviceTokens.length} active device tokens`);
      deviceTokens.forEach(dt => {
        this.logger.log(`🔍 [FCM DEBUG] Token for user ${dt.user_id}: ${dt.device_token.substring(0, 20)}...`);
      });

      if (deviceTokens.length === 0) {
        this.logger.warn('No active device tokens found for users');
        return;
      }

      const tokens = deviceTokens.map((dt) => dt.device_token);

      // Get channel and category based on notification type
      const androidChannel = this.getAndroidChannel(dto.type);
      const category = this.getNotificationCategory(dto.type);

      // Prepare FCM message with enhanced Android support
      const message: admin.messaging.MulticastMessage = {
        tokens,
        notification: {
          title: dto.title,
          body: dto.body,
          imageUrl: dto.image_url, // Rich notification with image
        },
        data: {
          type: dto.type,
          category: category, // For action buttons
          ...dto.data,
          action_url: dto.action_url || '',
          // Include image URL in data as well for fallback
          image_url: dto.image_url || '',
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
              category: category, // iOS action buttons
            },
          },
        },
        android: {
          priority: 'high',
          notification: {
            channelId: androidChannel, // Route to specific Android channel
            sound: 'default',
            imageUrl: dto.image_url, // Ensure image is displayed
            tag: dto.type, // Group notifications by type
          },
        },
      };

      // Send via FCM
      const response = await this.firebaseApp!.messaging().sendEachForMulticast(message);

      this.logger.log(
        `FCM sent: ${response.successCount} success, ${response.failureCount} failures (channel: ${androidChannel})`,
      );

      // Handle failed tokens
      if (response.failureCount > 0) {
        await this.handleFailedTokens(response, deviceTokens);
      }
    } catch (error) {
      this.logger.error('Error sending FCM notifications:', error);
      // Don't throw - we already saved to database
    }
  }

  /**
   * Handle failed FCM tokens (deactivate invalid tokens)
   */
  private async handleFailedTokens(
    response: admin.messaging.BatchResponse,
    deviceTokens: any[],
  ) {
    const failedTokens: string[] = [];

    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        const errorCode = resp.error?.code;
        // Deactivate tokens that are invalid or unregistered
        if (
          errorCode === 'messaging/invalid-registration-token' ||
          errorCode === 'messaging/registration-token-not-registered'
        ) {
          failedTokens.push(deviceTokens[idx].device_token);
        }
      }
    });

    if (failedTokens.length > 0) {
      await this.prisma.device_tokens.updateMany({
        where: {
          device_token: { in: failedTokens },
        },
        data: {
          is_active: false,
          updated_at: new Date(),
        },
      });

      this.logger.log(`Deactivated ${failedTokens.length} invalid tokens`);
    }
  }

  /**
   * Send notification to followers when a business posts a new deal
   */
  async sendNewDealNotification(dealId: string, businessId: string) {
    try {
      // Get deal details
      const deal = await this.prisma.deals.findUnique({
        where: { id: dealId },
        include: { businesses: true },
      });

      if (!deal) {
        throw new NotFoundException('Deal not found');
      }

      // Get followers who want new deal notifications
      const followers = await this.prisma.follows.findMany({
        where: {
          business_id: businessId,
          status: 'active',
          notify_new_deals: true,
        },
        select: { user_id: true },
      });

      this.logger.log(`🔍 [NOTIFICATION DEBUG] Deal: ${dealId}, Business: ${deal.businesses.business_name}`);
      this.logger.log(`🔍 [NOTIFICATION DEBUG] Business Owner ID: ${deal.businesses.owner_id}`);
      this.logger.log(`🔍 [NOTIFICATION DEBUG] Total followers: ${followers.length}`);
      this.logger.log(`🔍 [NOTIFICATION DEBUG] Follower IDs: ${followers.map(f => f.user_id).join(', ')}`);

      if (followers.length === 0) {
        this.logger.log('No followers to notify for new deal');
        return;
      }

      // Exclude business owner from notifications (they shouldn't receive notifications for their own deals)
      const userIds = followers
        .map((f) => f.user_id)
        .filter((userId) => userId !== deal.businesses.owner_id);

      this.logger.log(`🔍 [NOTIFICATION DEBUG] After filtering out owner: ${userIds.length} users`);
      this.logger.log(`🔍 [NOTIFICATION DEBUG] Filtered User IDs: ${userIds.join(', ')}`);

      // If no users left after filtering, skip notification
      if (userIds.length === 0) {
        this.logger.log('No users to notify after filtering out business owner');
        return;
      }

      // Calculate discount percentage if not set or is 0
      let discountPercentage = deal.discount_percentage;
      if (!discountPercentage || discountPercentage === 0) {
        const original = Number(deal.original_price) || 0;
        const discounted = Number(deal.discounted_price) || 0;
        if (original > 0) {
          discountPercentage = Math.round(((original - discounted) / original) * 100);
        }
      }

      // Send notification
      await this.sendNotification({
        user_ids: userIds,
        type: deal.is_flash_deal ? NotificationType.FLASH_DEAL : NotificationType.NEW_DEAL,
        title: deal.is_flash_deal
          ? `⚡ Flash Deal from ${deal.businesses.business_name}!`
          : `New Deal from ${deal.businesses.business_name}`,
        body: `${deal.title} - Save ${discountPercentage}%!`,
        data: {
          deal_id: dealId,
          business_id: businessId,
        },
        image_url: Array.isArray(deal.images) && deal.images.length > 0
          ? (deal.images[0] as any).url
          : undefined,
        action_url: `/deals/${dealId}`,
      });

      this.logger.log(`New deal notification sent to ${userIds.length} followers`);
    } catch (error) {
      this.logger.error('Error sending new deal notification:', error);
      throw error;
    }
  }

  /**
   * Get user notifications (paginated)
   */
  async getUserNotifications(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      this.prisma.notifications.findMany({
        where: { user_id: userId },
        orderBy: { sent_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notifications.count({
        where: { user_id: userId },
      }),
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notifications.count({
      where: {
        user_id: userId,
        is_read: false,
      },
    });
  }

  /**
   * Mark notifications as read
   */
  async markAsRead(userId: string, dto: MarkAsReadDto) {
    await this.prisma.notifications.updateMany({
      where: {
        id: { in: dto.notification_ids },
        user_id: userId, // Ensure user owns these notifications
      },
      data: {
        is_read: true,
        read_at: new Date(),
      },
    });

    return { success: true, count: dto.notification_ids.length };
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string) {
    const result = await this.prisma.notifications.updateMany({
      where: {
        user_id: userId,
        is_read: false,
      },
      data: {
        is_read: true,
        read_at: new Date(),
      },
    });

    return { success: true, count: result.count };
  }

  /**
   * Delete a notification
   */
  async deleteNotification(userId: string, notificationId: string) {
    const notification = await this.prisma.notifications.findFirst({
      where: {
        id: notificationId,
        user_id: userId,
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.prisma.notifications.delete({
      where: { id: notificationId },
    });

    return { success: true };
  }
}
