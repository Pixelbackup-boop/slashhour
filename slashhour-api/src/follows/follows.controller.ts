import { Controller, Post, Delete, Get, Param, UseGuards, Request, Body, Patch } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';

@Controller('follows')
@UseGuards(JwtAuthGuard)
export class FollowsController {
  constructor(private followsService: FollowsService) {}

  @Post(':businessId')
  async followBusiness(@Request() req, @Param('businessId') businessId: string) {
    return this.followsService.followBusiness(req.user.id, businessId);
  }

  @Delete(':businessId')
  async unfollowBusiness(@Request() req, @Param('businessId') businessId: string) {
    return this.followsService.unfollowBusiness(req.user.id, businessId);
  }

  @Patch(':businessId/mute')
  async muteBusiness(@Request() req, @Param('businessId') businessId: string) {
    return this.followsService.muteBusiness(req.user.id, businessId);
  }

  @Patch(':businessId/unmute')
  async unmuteBusiness(@Request() req, @Param('businessId') businessId: string) {
    return this.followsService.unmuteBusiness(req.user.id, businessId);
  }

  @Patch(':businessId/notifications')
  async updateNotificationPreferences(
    @Request() req,
    @Param('businessId') businessId: string,
    @Body() updateDto: UpdateNotificationPreferencesDto,
  ) {
    return this.followsService.updateNotificationPreferences(
      req.user.id,
      businessId,
      updateDto,
    );
  }

  @Get()
  async getFollowedBusinesses(@Request() req) {
    return this.followsService.getFollowedBusinesses(req.user.id);
  }

  @Get(':businessId/followers')
  async getBusinessFollowers(@Param('businessId') businessId: string) {
    return this.followsService.getBusinessFollowers(businessId);
  }

  @Get(':businessId')
  async getFollowStatus(@Request() req, @Param('businessId') businessId: string) {
    return this.followsService.getFollowStatus(req.user.id, businessId);
  }
}
