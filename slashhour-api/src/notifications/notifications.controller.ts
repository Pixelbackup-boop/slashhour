import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RegisterDeviceTokenDto } from './dto/register-device-token.dto';
import { SendNotificationDto } from './dto/send-notification.dto';
import { MarkAsReadDto } from './dto/mark-as-read.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * Register device token for push notifications
   * POST /notifications/device-token
   */
  @Post('device-token')
  @HttpCode(HttpStatus.OK)
  async registerDeviceToken(@Req() req: any, @Body() dto: RegisterDeviceTokenDto) {
    const userId = req.user.id;
    return this.notificationsService.registerDeviceToken(userId, dto);
  }

  /**
   * Deactivate device token
   * DELETE /notifications/device-token/:token
   */
  @Delete('device-token/:token')
  @HttpCode(HttpStatus.OK)
  async deactivateDeviceToken(@Req() req: any, @Param('token') token: string) {
    const userId = req.user.id;
    return this.notificationsService.deactivateDeviceToken(userId, token);
  }

  /**
   * Get user notifications (paginated)
   * GET /notifications?page=1&limit=20
   */
  @Get()
  async getUserNotifications(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = req.user.id;
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;

    return this.notificationsService.getUserNotifications(userId, pageNum, limitNum);
  }

  /**
   * Get unread notification count
   * GET /notifications/unread-count
   */
  @Get('unread-count')
  async getUnreadCount(@Req() req: any) {
    const userId = req.user.id;
    const count = await this.notificationsService.getUnreadCount(userId);
    return { count };
  }

  /**
   * Mark notifications as read
   * POST /notifications/mark-as-read
   */
  @Post('mark-as-read')
  @HttpCode(HttpStatus.OK)
  async markAsRead(@Req() req: any, @Body() dto: MarkAsReadDto) {
    const userId = req.user.id;
    return this.notificationsService.markAsRead(userId, dto);
  }

  /**
   * Mark all notifications as read
   * POST /notifications/mark-all-as-read
   */
  @Post('mark-all-as-read')
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(@Req() req: any) {
    const userId = req.user.id;
    return this.notificationsService.markAllAsRead(userId);
  }

  /**
   * Delete a notification
   * DELETE /notifications/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteNotification(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.id;
    return this.notificationsService.deleteNotification(userId, id);
  }

  /**
   * Send notification (Testing endpoint only)
   * POST /notifications/send
   * WARNING: This endpoint should be protected with admin guard or disabled in production
   * Consider using @UseGuards(AdminGuard) when admin system is implemented
   */
  @Post('send')
  @HttpCode(HttpStatus.OK)
  async sendNotification(@Body() dto: SendNotificationDto) {
    return this.notificationsService.sendNotification(dto);
  }
}
