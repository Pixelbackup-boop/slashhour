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
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { DealsService } from './deals.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { CurrentUser, Public, UserType } from '../common/decorators';

@Controller('deals')
export class DealsController {
  constructor(private dealsService: DealsService) {}

  @Post('business/:businessId')
  @UseGuards(JwtAuthGuard)
  @UserType('business') // Only business users can create deals
  async create(
    @CurrentUser('id') userId: string,
    @Param('businessId') businessId: string,
    @Body() createDealDto: CreateDealDto,
  ) {
    return this.dealsService.create(userId, businessId, createDealDto);
  }

  /**
   * NEW 2025 API: Create deal with multipart/form-data (native-like upload)
   * This endpoint handles file uploads directly without base64 conversion
   * Much faster and more memory efficient than the JSON endpoint above
   */
  @Post('business/:businessId/multipart')
  @UseGuards(JwtAuthGuard)
  @UserType('business') // Only business users can create deals
  @UseInterceptors(FilesInterceptor('images', 10)) // Max 10 images
  async createWithMultipart(
    @CurrentUser('id') userId: string,
    @Param('businessId') businessId: string,
    @Body() body: any, // FormData fields
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.dealsService.createWithMultipart(userId, businessId, body, files);
  }

  @Get()
  @Public() // Public endpoint - no auth required
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.dealsService.findAll(page, limit);
  }

  @Get('active')
  @Public() // Public endpoint - no auth required
  async getActiveDeals() {
    return this.dealsService.getActiveDeals();
  }

  @Get('flash')
  @Public() // Public endpoint - no auth required
  async getFlashDeals() {
    return this.dealsService.getFlashDeals();
  }

  @Get('business/:businessId')
  async findByBusiness(@Param('businessId') businessId: string) {
    return this.dealsService.findByBusiness(businessId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.dealsService.findOne(id, userId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UserType('business')
  async update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() updateDealDto: UpdateDealDto,
  ) {
    return this.dealsService.update(id, userId, updateDealDto);
  }

  /**
   * NEW 2025 API: Update deal with multipart/form-data (native-like upload)
   * Allows adding new images during update
   */
  @Put(':id/multipart')
  @UseGuards(JwtAuthGuard)
  @UserType('business')
  @UseInterceptors(FilesInterceptor('images', 10)) // Max 10 images
  async updateWithMultipart(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() body: any, // FormData fields
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.dealsService.updateWithMultipart(id, userId, body, files);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @UserType('business')
  async delete(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.dealsService.delete(id, userId);
  }

  @Post(':id/redeem')
  @UseGuards(JwtAuthGuard)
  async redeem(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.dealsService.redeemDeal(id, userId);
  }
}
