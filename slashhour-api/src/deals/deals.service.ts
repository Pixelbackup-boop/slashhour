import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { DealStatus } from './entities/deal.entity';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { UploadService } from '../upload/upload.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { DealMapper } from '../common/mappers/deal.mapper';
import { CacheService, CacheTTL, CachePrefix } from '../cache/cache.service';

@Injectable()
export class DealsService {
  private readonly logger = new Logger(DealsService.name);

  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
    private notificationsService: NotificationsService,
    private cacheService: CacheService,
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
      data: DealMapper.toPrismaCreate(createDealDto, businessId),
    });

    // Send notification to followers asynchronously (don't wait for it)
    this.notificationsService
      .sendNewDealNotification(deal.id, businessId)
      .catch(() => {
        // Silently fail - notification is non-critical
      });

    // Invalidate related caches
    await Promise.all([
      this.cacheService.invalidateDeal(deal.id),
      this.cacheService.invalidateBusiness(businessId),
    ]);

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
    // DEBUG: Log method entry
    this.logger.debug('createWithMultipart called');
    this.logger.debug(`userId: ${userId}, businessId: ${businessId}, files: ${files?.length || 0}`);
    if (files && files.length > 0) {
      this.logger.debug(`File[0] - mimetype: ${files[0].mimetype}, size: ${files[0].size || files[0].buffer?.length || 'unknown'}`);
    }

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
      data: DealMapper.toPrismaCreate(createDealDto, businessId),
    });

    // Send notification to followers asynchronously (don't wait for it)
    this.notificationsService
      .sendNewDealNotification(deal.id, businessId)
      .catch(() => {
        // Silently fail - notification is non-critical
      });

    // Invalidate related caches
    await Promise.all([
      this.cacheService.invalidateDeal(deal.id),
      this.cacheService.invalidateBusiness(businessId),
    ]);

    return {
      message: 'Deal created successfully',
      deal,
    };
  }

  async findAll(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [deals, total] = await Promise.all([
      this.prisma.deals.findMany({
        where: { status: DealStatus.ACTIVE },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: { businesses: true },
      }),
      this.prisma.deals.count({
        where: { status: DealStatus.ACTIVE },
      }),
    ]);

    return {
      total,
      page,
      limit,
      deals,
    };
  }

  async findOne(id: string, userId?: string) {
    // Cache key for base deal data (without user-specific fields)
    const cacheKey = this.cacheService.buildKey(CachePrefix.DEAL, id);

    // Try to get from cache first
    const deal = await this.cacheService.wrap(
      cacheKey,
      async () => {
        const result = await this.prisma.deals.findUnique({
          where: { id },
          include: { businesses: true },
        });

        if (!result) {
          return null;
        }

        return result;
      },
      CacheTTL.TWO_MINUTES,
    );

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    // Transform deal to match frontend interface
    const { businesses, ...dealData } = deal;
    const transformedDeal = {
      ...dealData,
      business: businesses, // Rename from 'businesses' to 'business'
      isBookmarked: false, // Default value
    };

    // Include bookmark status if userId is provided (don't cache this part)
    if (userId) {
      const bookmark = await this.prisma.bookmarks.findUnique({
        where: {
          user_id_deal_id: {
            user_id: userId,
            deal_id: id,
          },
        },
      });
      transformedDeal.isBookmarked = !!bookmark;
    }

    return transformedDeal;
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
      data: DealMapper.toPrismaUpdate(updateDealDto),
    });

    // Invalidate related caches
    await Promise.all([
      this.cacheService.invalidateDeal(id),
      this.cacheService.invalidateBusiness(deal.business_id),
    ]);

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
      data: DealMapper.toPrismaUpdate(updateDealDto),
    });

    // Invalidate related caches
    await Promise.all([
      this.cacheService.invalidateDeal(id),
      this.cacheService.invalidateBusiness(deal.business_id),
    ]);

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

    // Soft delete: Mark as deleted instead of removing from database
    await this.prisma.deals.update({
      where: { id },
      data: DealMapper.createStatusUpdate('deleted' as DealStatus),
    });

    // Invalidate related caches
    await Promise.all([
      this.cacheService.invalidateDeal(id),
      this.cacheService.invalidateBusiness(deal.business_id),
    ]);

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
        data: DealMapper.createStatusUpdate(DealStatus.EXPIRED),
      });
      throw new BadRequestException('Deal has expired');
    }

    // Check if deal has started
    if (new Date() < deal.starts_at) {
      throw new BadRequestException('Deal has not started yet');
    }

    // Check inventory BEFORE redemption
    if (deal.quantity_available !== null && deal.quantity_available !== undefined) {
      if (deal.quantity_redeemed >= deal.quantity_available) {
        // Already sold out
        await this.prisma.deals.update({
          where: { id: dealId },
          data: DealMapper.createStatusUpdate(DealStatus.SOLD_OUT),
        });
        throw new BadRequestException('Deal is sold out');
      }
    }

    // Increment redemption count
    const newQuantityRedeemed = deal.quantity_redeemed + 1;
    await this.prisma.deals.update({
      where: { id: dealId },
      data: { quantity_redeemed: newQuantityRedeemed },
    });

    // Check if this redemption made it sold out
    if (deal.quantity_available !== null && deal.quantity_available !== undefined) {
      if (newQuantityRedeemed >= deal.quantity_available) {
        await this.prisma.deals.update({
          where: { id: dealId },
          data: DealMapper.createStatusUpdate(DealStatus.SOLD_OUT),
        });
      }
    }

    return {
      message: 'Deal redeemed successfully',
      redemption: {
        deal_id: dealId,
        redeemed_at: new Date(),
      },
    };
  }

  async getActiveDeals() {
    const cacheKey = this.cacheService.buildKey(CachePrefix.DEAL, 'active');

    return this.cacheService.wrap(
      cacheKey,
      async () => {
        const now = new Date();
        const deals = await this.prisma.deals.findMany({
          where: {
            status: DealStatus.ACTIVE,
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
      },
      CacheTTL.TWO_MINUTES,
    );
  }

  async getFlashDeals() {
    const cacheKey = this.cacheService.buildKey(CachePrefix.DEAL, 'flash');

    return this.cacheService.wrap(
      cacheKey,
      async () => {
        const now = new Date();
        const deals = await this.prisma.deals.findMany({
          where: {
            status: DealStatus.ACTIVE,
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
      },
      CacheTTL.TWO_MINUTES,
    );
  }
}
