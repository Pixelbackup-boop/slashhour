import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DealsService } from './deals.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';

@Controller('deals')
export class DealsController {
  constructor(private dealsService: DealsService) {}

  @Post('business/:businessId')
  @UseGuards(JwtAuthGuard)
  async create(
    @Request() req,
    @Param('businessId') businessId: string,
    @Body() createDealDto: CreateDealDto,
  ) {
    return this.dealsService.create(req.user.id, businessId, createDealDto);
  }

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.dealsService.findAll(page, limit);
  }

  @Get('active')
  async getActiveDeals() {
    return this.dealsService.getActiveDeals();
  }

  @Get('flash')
  async getFlashDeals() {
    return this.dealsService.getFlashDeals();
  }

  @Get('business/:businessId')
  async findByBusiness(@Param('businessId') businessId: string) {
    return this.dealsService.findByBusiness(businessId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.dealsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDealDto: UpdateDealDto,
  ) {
    return this.dealsService.update(id, req.user.id, updateDealDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Request() req, @Param('id') id: string) {
    return this.dealsService.delete(id, req.user.id);
  }

  @Post(':id/redeem')
  @UseGuards(JwtAuthGuard)
  async redeem(@Request() req, @Param('id') id: string) {
    return this.dealsService.redeemDeal(id, req.user.id);
  }
}
