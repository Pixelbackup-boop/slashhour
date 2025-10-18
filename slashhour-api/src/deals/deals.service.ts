import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deal, DealStatus } from './entities/deal.entity';
import { Business } from '../businesses/entities/business.entity';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class DealsService {
  constructor(
    @InjectRepository(Deal)
    private dealRepository: Repository<Deal>,
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
    private uploadService: UploadService,
  ) {}

  async create(userId: string, businessId: string, createDealDto: CreateDealDto) {
    // Verify business exists and user is owner
    const business = await this.businessRepository.findOne({
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

    const deal = this.dealRepository.create({
      ...createDealDto,
      business_id: businessId,
    });

    await this.dealRepository.save(deal);

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
    const business = await this.businessRepository.findOne({
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

    const deal = this.dealRepository.create({
      ...createDealDto,
      business_id: businessId,
    });

    await this.dealRepository.save(deal);

    return {
      message: 'Deal created successfully',
      deal,
    };
  }

  async findAll(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [deals, total] = await this.dealRepository.findAndCount({
      where: { status: DealStatus.ACTIVE },
      skip,
      take: limit,
      order: { created_at: 'DESC' },
      relations: ['business'],
    });

    return {
      total,
      page,
      limit,
      deals,
    };
  }

  async findOne(id: string) {
    const deal = await this.dealRepository.findOne({
      where: { id },
      relations: ['business'],
    });

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    return deal;
  }

  async findByBusiness(businessId: string) {
    const deals = await this.dealRepository.find({
      where: { business_id: businessId },
      order: { created_at: 'DESC' },
    });

    return {
      total: deals.length,
      deals,
    };
  }

  async update(id: string, userId: string, updateDealDto: UpdateDealDto) {
    const deal = await this.dealRepository.findOne({
      where: { id },
      relations: ['business'],
    });

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    // Check ownership
    if (deal.business.owner_id !== userId) {
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

    Object.assign(deal, updateDealDto);
    await this.dealRepository.save(deal);

    return {
      message: 'Deal updated successfully',
      deal,
    };
  }

  async delete(id: string, userId: string) {
    const deal = await this.dealRepository.findOne({
      where: { id },
      relations: ['business'],
    });

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    // Check ownership
    if (deal.business.owner_id !== userId) {
      throw new ForbiddenException('You do not have permission to delete this deal');
    }

    await this.dealRepository.remove(deal);

    return {
      message: 'Deal deleted successfully',
    };
  }

  async redeemDeal(dealId: string, userId: string) {
    const deal = await this.dealRepository.findOne({
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
      deal.status = DealStatus.EXPIRED;
      await this.dealRepository.save(deal);
      throw new BadRequestException('Deal has expired');
    }

    // Check if deal has started
    if (new Date() < deal.starts_at) {
      throw new BadRequestException('Deal has not started yet');
    }

    // Check inventory
    if (deal.quantity_available !== null && deal.quantity_available !== undefined) {
      if (deal.quantity_redeemed >= deal.quantity_available) {
        deal.status = DealStatus.SOLD_OUT;
        await this.dealRepository.save(deal);
        throw new BadRequestException('Deal is sold out');
      }
    }

    // Increment redemption count
    deal.quantity_redeemed += 1;
    await this.dealRepository.save(deal);

    return {
      message: 'Deal redeemed successfully',
      redemption: {
        deal_id: deal.id,
        redeemed_at: new Date(),
      },
    };
  }

  async getActiveDeals() {
    const deals = await this.dealRepository
      .createQueryBuilder('deal')
      .leftJoinAndSelect('deal.business', 'business')
      .where('deal.status = :status', { status: DealStatus.ACTIVE })
      .andWhere('deal.starts_at <= :now', { now: new Date() })
      .andWhere('deal.expires_at > :now', { now: new Date() })
      .orderBy('deal.created_at', 'DESC')
      .getMany();

    return {
      total: deals.length,
      deals,
    };
  }

  async getFlashDeals() {
    const deals = await this.dealRepository
      .createQueryBuilder('deal')
      .leftJoinAndSelect('deal.business', 'business')
      .where('deal.status = :status', { status: DealStatus.ACTIVE })
      .andWhere('deal.is_flash_deal = :isFlash', { isFlash: true })
      .andWhere('deal.starts_at <= :now', { now: new Date() })
      .andWhere('deal.expires_at > :now', { now: new Date() })
      .orderBy('deal.created_at', 'DESC')
      .getMany();

    return {
      total: deals.length,
      deals,
    };
  }
}
