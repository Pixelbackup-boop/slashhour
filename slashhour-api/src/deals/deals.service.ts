import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { DealStatus } from './entities/deal.entity';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { UploadService } from '../upload/upload.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class DealsService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
    private notificationsService: NotificationsService,
  ) {}

  async create(userId: string, businessId: string, createDealDto: CreateDealDto) {
    // Verify business exists and user is owner
    const business = await this.prisma.businesses.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    if (business.owner_id !== userId) {
      throw new ForbiddenException('You do not have permission to create deals for this business');
    }

    // Validate dates
    if (createDealDto.starts_at >= createDealDto.expires_at) {
      throw new BadRequestException('Start date must be before expiration date');
    }

    // Validate pricing
    if (createDealDto.discounted_price >= createDealDto.original_price) {
      throw new BadRequestException('Discounted price must be less than original price');
    }

    const deal = await this.prisma.deals.create({
      data: {
        ...createDealDto,
        business_id: businessId,
      } as any,
    });

    // Send notification to followers asynchronously (don't wait for it)
    this.notificationsService
      .sendNewDealNotification(deal.id, businessId)
      .catch(() => {
        // Silently fail - notification is non-critical
      });

    return {
      message: 'Deal created successfully',
      deal: {
        id: deal.id,
        title: deal.title,
        original_price: deal.original_price,
        discounted_price: deal.discounted_price,
        starts_at: deal.starts_at,
        expires_at: deal.expires_at,
        status: deal.status,
        created_at: deal.created_at,
      },
    };
  }

  /**
   * NEW 2025 API: Create deal with multipart/form-data (native-like upload)
   * Handles file uploads directly - much faster than base64 conversion on client
   */
  async createWithMultipart(
    userId: string,
    businessId: string,
    body: any,
    files: Express.Multer.File[],
  ) {
    // Verify business exists and user is owner
    const business = await this.prisma.businesses.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    if (business.owner_id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to create deals for this business',
      );
    }

    // Parse FormData fields
    const createDealDto: CreateDealDto = {
      title: body.title,
      description: body.description || undefined,
      original_price: parseFloat(body.original_price),
      discounted_price: parseFloat(body.discounted_price),
      category: body.category,
      tags: body.tags ? JSON.parse(body.tags) : undefined,
      starts_at: new Date(body.starts_at),
      expires_at: new Date(body.expires_at),
      is_flash_deal: body.is_flash_deal === 'true',
      visibility_radius_km: body.visibility_radius_km
        ? parseFloat(body.visibility_radius_km)
        : undefined,
      quantity_available: body.quantity_available
        ? parseInt(body.quantity_available, 10)
        : undefined,
      max_per_user: body.max_per_user
        ? parseInt(body.max_per_user, 10)
        : undefined,
      terms_conditions: body.terms_conditions
        ? JSON.parse(body.terms_conditions)
        : undefined,
    };

    // Save uploaded files to disk and get public URLs
    if (files && files.length > 0) {
      const imageUrls = await this.uploadService.saveFiles(files, 'deals');
      const images = imageUrls.map((url, index) => ({
        url,
        order: index,
      }));
      createDealDto.images = images;
    }

    // Validate dates
    if (createDealDto.starts_at >= createDealDto.expires_at) {
      throw new BadRequestException(
        'Start date must be before expiration date',
      );
    }

    // Validate pricing
    if (createDealDto.discounted_price >= createDealDto.original_price) {
      throw new BadRequestException(
        'Discounted price must be less than original price',
      );
    }

    const deal = await this.prisma.deals.create({
      data: {
        ...createDealDto,
        business_id: businessId,
      } as any,
    });

    // Send notification to followers asynchronously (don't wait for it)
    this.notificationsService
      .sendNewDealNotification(deal.id, businessId)
      .catch(() => {
        // Silently fail - notification is non-critical
      });

    return {
      message: 'Deal created successfully',
      deal,
    };
  }

  async findAll(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [deals, total] = await Promise.all([
      this.prisma.deals.findMany({
        where: { status: DealStatus.ACTIVE as any },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: { businesses: true },
      }),
      this.prisma.deals.count({
        where: { status: DealStatus.ACTIVE as any },
      }),
    ]);

    return {
      total,
      page,
      limit,
      deals,
    };
  }

  async findOne(id: string) {
    const deal = await this.prisma.deals.findUnique({
      where: { id },
      include: { businesses: true },
    });

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    return deal;
  }

  async findByBusiness(businessId: string) {
    const deals = await this.prisma.deals.findMany({
      where: { business_id: businessId },
      orderBy: { created_at: 'desc' },
    });

    return {
      total: deals.length,
      deals,
    };
  }

  async update(id: string, userId: string, updateDealDto: UpdateDealDto) {
    const deal = await this.prisma.deals.findUnique({
      where: { id },
      include: { businesses: true },
    });

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    // Check ownership
    if (deal.businesses.owner_id !== userId) {
      throw new ForbiddenException('You do not have permission to update this deal');
    }

    // Validate dates if updating
    if (updateDealDto.starts_at && updateDealDto.expires_at) {
      if (updateDealDto.starts_at >= updateDealDto.expires_at) {
        throw new BadRequestException('Start date must be before expiration date');
      }
    }

    // Validate pricing if updating
    if (updateDealDto.discounted_price && updateDealDto.original_price) {
      if (updateDealDto.discounted_price >= updateDealDto.original_price) {
        throw new BadRequestException('Discounted price must be less than original price');
      }
    }

    const updatedDeal = await this.prisma.deals.update({
      where: { id },
      data: updateDealDto as any,
    });

    return {
      message: 'Deal updated successfully',
      deal: updatedDeal,
    };
  }

  /**
   * NEW 2025 API: Update deal with multipart/form-data (native-like upload)
   * Allows adding new images during update
   */
  async updateWithMultipart(
    id: string,
    userId: string,
    body: any,
    files: Express.Multer.File[],
  ) {
    const deal = await this.prisma.deals.findUnique({
      where: { id },
      include: { businesses: true },
    });

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    // Check ownership
    if (deal.businesses.owner_id !== userId) {
      throw new ForbiddenException('You do not have permission to update this deal');
    }

    // Parse FormData fields
    const updateDealDto: UpdateDealDto = {};

    if (body.title) updateDealDto.title = body.title;
    if (body.description !== undefined) updateDealDto.description = body.description;
    if (body.original_price) updateDealDto.original_price = parseFloat(body.original_price);
    if (body.discounted_price) updateDealDto.discounted_price = parseFloat(body.discounted_price);
    if (body.category) updateDealDto.category = body.category;
    if (body.tags) updateDealDto.tags = JSON.parse(body.tags);
    if (body.starts_at) updateDealDto.starts_at = new Date(body.starts_at);
    if (body.expires_at) updateDealDto.expires_at = new Date(body.expires_at);
    if (body.is_flash_deal !== undefined) updateDealDto.is_flash_deal = body.is_flash_deal === 'true';
    if (body.visibility_radius_km) updateDealDto.visibility_radius_km = parseFloat(body.visibility_radius_km);
    if (body.quantity_available) updateDealDto.quantity_available = parseInt(body.quantity_available, 10);
    if (body.max_per_user) updateDealDto.max_per_user = parseInt(body.max_per_user, 10);
    if (body.terms_conditions) updateDealDto.terms_conditions = JSON.parse(body.terms_conditions);

    // Handle existing images (parse JSON array of image URLs to keep)
    let existingImages: Array<{ url: string; order: number }> = [];
    if (body.existingImages) {
      existingImages = JSON.parse(body.existingImages);
    }

    // Save new uploaded files to disk and get public URLs
    let newImages: Array<{ url: string; order: number }> = [];
    if (files && files.length > 0) {
      const imageUrls = await this.uploadService.saveFiles(files, 'deals');
      newImages = imageUrls.map((url, index) => ({
        url,
        order: existingImages.length + index,
      }));
    }

    // Combine existing and new images
    if (existingImages.length > 0 || newImages.length > 0) {
      updateDealDto.images = [...existingImages, ...newImages];
    }

    // Validate dates if updating
    const finalStartsAt = updateDealDto.starts_at || deal.starts_at;
    const finalExpiresAt = updateDealDto.expires_at || deal.expires_at;
    if (finalStartsAt >= finalExpiresAt) {
      throw new BadRequestException('Start date must be before expiration date');
    }

    // Validate pricing if updating
    const finalOriginalPrice = updateDealDto.original_price || deal.original_price;
    const finalDiscountedPrice = updateDealDto.discounted_price || deal.discounted_price;
    if (Number(finalDiscountedPrice) >= Number(finalOriginalPrice)) {
      throw new BadRequestException('Discounted price must be less than original price');
    }

    const updatedDeal = await this.prisma.deals.update({
      where: { id },
      data: updateDealDto as any,
    });

    return {
      message: 'Deal updated successfully',
      deal: updatedDeal,
    };
  }

  async delete(id: string, userId: string) {
    const deal = await this.prisma.deals.findUnique({
      where: { id },
      include: { businesses: true },
    });

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    // Check ownership
    if (deal.businesses.owner_id !== userId) {
      throw new ForbiddenException('You do not have permission to delete this deal');
    }

    await this.prisma.deals.delete({
      where: { id },
    });

    return {
      message: 'Deal deleted successfully',
    };
  }

  async redeemDeal(dealId: string, userId: string) {
    const deal = await this.prisma.deals.findUnique({
      where: { id: dealId },
    });

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    if (deal.status !== DealStatus.ACTIVE) {
      throw new BadRequestException('Deal is not active');
    }

    // Check if deal has expired
    if (new Date() > deal.expires_at) {
      await this.prisma.deals.update({
        where: { id: dealId },
        data: { status: DealStatus.EXPIRED as any },
      });
      throw new BadRequestException('Deal has expired');
    }

    // Check if deal has started
    if (new Date() < deal.starts_at) {
      throw new BadRequestException('Deal has not started yet');
    }

    // Check inventory
    if (deal.quantity_available !== null && deal.quantity_available !== undefined) {
      if (deal.quantity_redeemed >= deal.quantity_available) {
        await this.prisma.deals.update({
          where: { id: dealId },
          data: { status: DealStatus.SOLD_OUT as any },
        });
        throw new BadRequestException('Deal is sold out');
      }
    }

    // Increment redemption count
    await this.prisma.deals.update({
      where: { id: dealId },
      data: { quantity_redeemed: deal.quantity_redeemed + 1 },
    });

    return {
      message: 'Deal redeemed successfully',
      redemption: {
        deal_id: dealId,
        redeemed_at: new Date(),
      },
    };
  }

  async getActiveDeals() {
    const now = new Date();
    const deals = await this.prisma.deals.findMany({
      where: {
        status: DealStatus.ACTIVE as any,
        starts_at: { lte: now },
        expires_at: { gt: now },
      },
      include: { businesses: true },
      orderBy: { created_at: 'desc' },
    });

    return {
      total: deals.length,
      deals,
    };
  }

  async getFlashDeals() {
    const now = new Date();
    const deals = await this.prisma.deals.findMany({
      where: {
        status: DealStatus.ACTIVE as any,
        is_flash_deal: true,
        starts_at: { lte: now },
        expires_at: { gt: now },
      },
      include: { businesses: true },
      orderBy: { created_at: 'desc' },
    });

    return {
      total: deals.length,
      deals,
    };
  }
}
