import { Controller, Post, Get, Param, Query, UseGuards, Req } from '@nestjs/common';
import { RedemptionsService } from './redemptions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('redemptions')
@UseGuards(JwtAuthGuard)
export class RedemptionsController {
  constructor(private readonly redemptionsService: RedemptionsService) {}

  @Post(':dealId')
  async redeemDeal(@Req() req, @Param('dealId') dealId: string) {
    const userId = req.user.sub;
    return this.redemptionsService.redeemDeal(userId, dealId);
  }

  @Get()
  async getUserRedemptions(
    @Req() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const userId = req.user.sub;
    return this.redemptionsService.getUserRedemptions(userId, page, limit);
  }

  @Get(':redemptionId')
  async getRedemptionDetails(@Req() req, @Param('redemptionId') redemptionId: string) {
    const userId = req.user.sub;
    return this.redemptionsService.getRedemptionDetails(userId, redemptionId);
  }
}
