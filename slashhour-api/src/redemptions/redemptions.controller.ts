import { Controller, Post, Get, Param, Query, UseGuards, Req, Body } from '@nestjs/common';
import { RedemptionsService } from './redemptions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ValidateRedemptionDto } from './dto/validate-redemption.dto';
import { BusinessRedemptionQueryDto } from './dto/business-redemption.dto';

@Controller('redemptions')
@UseGuards(JwtAuthGuard)
export class RedemptionsController {
  constructor(private readonly redemptionsService: RedemptionsService) {}

  @Post(':dealId')
  async redeemDeal(@Req() req, @Param('dealId') dealId: string) {
    const userId = req.user.id;
    return this.redemptionsService.redeemDeal(userId, dealId);
  }

  @Get()
  async getUserRedemptions(
    @Req() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const userId = req.user.id;
    return this.redemptionsService.getUserRedemptions(userId, page, limit);
  }

  /**
   * POST /redemptions/validate
   * Validate a redemption (for business owners)
   */
  @Post('validate')
  async validateRedemption(
    @Req() req,
    @Body() validateDto: ValidateRedemptionDto,
  ) {
    const validatorId = req.user.id;
    return this.redemptionsService.validateRedemption(
      validateDto.redemption_id,
      validatorId,
      validateDto.status,
    );
  }

  /**
   * GET /redemptions/business/:businessId
   * Get all redemptions for a business (with optional status filter)
   */
  @Get('business/:businessId')
  async getBusinessRedemptions(
    @Req() req,
    @Param('businessId') businessId: string,
    @Query() query: BusinessRedemptionQueryDto,
  ) {
    const userId = req.user.id;
    return this.redemptionsService.getBusinessRedemptions(
      businessId,
      userId,
      query,
    );
  }

  @Get(':redemptionId')
  async getRedemptionDetails(@Req() req, @Param('redemptionId') redemptionId: string) {
    const userId = req.user.id;
    return this.redemptionsService.getRedemptionDetails(userId, redemptionId);
  }
}
