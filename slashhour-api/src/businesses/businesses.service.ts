import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { Business } from './entities/business.entity';
import { DealStatus } from '../deals/entities/deal.entity';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { UploadService } from '../upload/upload.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BusinessesService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
  ) {}

  async create(userId: string, createBusinessDto: CreateBusinessDto) {
    // Check if slug is already taken
    const existingBusiness = await this.prisma.businesses.findUnique({
      where: { slug: createBusinessDto.slug },
    });

    if (existingBusiness) {
      throw new ConflictException('Business slug already exists');
    }

    const business = await this.prisma.businesses.create({
      data: {
        ...createBusinessDto,
        owner_id: userId,
      } as any,
    });

    return {
      message: 'Business created successfully',
      business: {
        id: business.id,
        business_name: business.business_name,
        slug: business.slug,
        category: business.category,
        location: business.location,
        address: business.address,
        created_at: business.created_at,
      },
    };
  }

  async findAll(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [businesses, total] = await Promise.all([
      this.prisma.businesses.findMany({
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.businesses.count(),
    ]);

    return {
      total,
      page,
      limit,
      businesses,
    };
  }

  async findOne(id: string) {
    const business = await this.prisma.businesses.findUnique({
      where: { id },
      include: { users: true },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    return business;
  }

  async findBySlug(slug: string) {
    const business = await this.prisma.businesses.findUnique({
      where: { slug },
      include: { users: true },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    return business;
  }

  async findByOwner(userId: string) {
    const businesses = await this.prisma.businesses.findMany({
      where: { owner_id: userId },
      orderBy: { created_at: 'desc' },
    });

    return {
      total: businesses.length,
      businesses,
    };
  }

  async update(id: string, userId: string, updateBusinessDto: UpdateBusinessDto) {
    const business = await this.prisma.businesses.findUnique({
      where: { id },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    // Check ownership
    if (business.owner_id !== userId) {
      throw new ForbiddenException('You do not have permission to update this business');
    }

    // Check slug uniqueness if updating
    if (updateBusinessDto.slug && updateBusinessDto.slug !== business.slug) {
      const existingBusiness = await this.prisma.businesses.findUnique({
        where: { slug: updateBusinessDto.slug },
      });

      if (existingBusiness) {
        throw new ConflictException('Business slug already exists');
      }
    }

    // Prepare update data
    const updateData: any = { ...updateBusinessDto };

    // Check if category is being changed and enforce one-month restriction
    if (updateBusinessDto.category && updateBusinessDto.category !== business.category) {
      if (business.category_last_changed_at) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        if (business.category_last_changed_at > thirtyDaysAgo) {
          // Calculate days remaining
          const daysUntilCanChange = Math.ceil(
            (business.category_last_changed_at.getTime() + 30 * 24 * 60 * 60 * 1000 - Date.now()) / (24 * 60 * 60 * 1000)
          );
          throw new ForbiddenException(
            `Category can only be changed once per month. You can change it again in ${daysUntilCanChange} day(s).`
          );
        }
      }

      // Update the timestamp when category is changed
      updateData.category_last_changed_at = new Date();
    }

    const updatedBusiness = await this.prisma.businesses.update({
      where: { id },
      data: updateData,
    });

    return {
      message: 'Business updated successfully',
      business: updatedBusiness,
    };
  }

  async delete(id: string, userId: string) {
    const business = await this.prisma.businesses.findUnique({
      where: { id },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    // Check ownership
    if (business.owner_id !== userId) {
      throw new ForbiddenException('You do not have permission to delete this business');
    }

    await this.prisma.businesses.delete({
      where: { id },
    });

    return {
      message: 'Business deleted successfully',
    };
  }

  async updateStats(businessId: string, stats: Partial<Business>) {
    await this.prisma.businesses.update({
      where: { id: businessId },
      data: stats as any,
    });
  }

  async searchByLocation(lat: number, lng: number, radius: number = 5, category?: string) {
    // Use Prisma's $queryRaw for complex geospatial query
    let businesses: any[];

    if (category) {
      businesses = await this.prisma.$queryRaw`
        SELECT *
        FROM businesses
        WHERE (
          6371 * acos(
            cos(radians(${lat})) *
            cos(radians((location->>'lat')::float)) *
            cos(radians((location->>'lng')::float) - radians(${lng})) +
            sin(radians(${lat})) *
            sin(radians((location->>'lat')::float))
          )
        ) <= ${radius}
        AND category = ${category}
        ORDER BY follower_count DESC
      `;
    } else {
      businesses = await this.prisma.$queryRaw`
        SELECT *
        FROM businesses
        WHERE (
          6371 * acos(
            cos(radians(${lat})) *
            cos(radians((location->>'lat')::float)) *
            cos(radians((location->>'lng')::float) - radians(${lng})) +
            sin(radians(${lat})) *
            sin(radians((location->>'lat')::float))
          )
        ) <= ${radius}
        ORDER BY follower_count DESC
      `;
    }

    return {
      total: businesses.length,
      businesses,
    };
  }

  async getBusinessDeals(businessId: string) {
    // Verify business exists
    const business = await this.prisma.businesses.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    // Get all active deals for this business - SIMPLE & CLEAN with business relation
    const now = new Date();
    const deals = await this.prisma.deals.findMany({
      where: {
        business_id: businessId,
        status: DealStatus.ACTIVE as any,
      },
      include: { businesses: true }, // ← ALWAYS load business data
      orderBy: { created_at: 'desc' },
    });

    // Filter by date in memory (simpler than complex query)
    const activeDeals = deals.filter(
      deal => deal.starts_at <= now && deal.expires_at > now
    );

    return {
      deals: activeDeals,
    };
  }

  async getBusinessStats(businessId: string) {
    // Verify business exists
    const business = await this.prisma.businesses.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    const now = new Date();

    // Get active deal count
    const activeDealCount = await this.prisma.deals.count({
      where: {
        business_id: businessId,
        status: DealStatus.ACTIVE as any,
        starts_at: { lte: now },
        expires_at: { gt: now },
      },
    });

    // Get total deals sold (count of all redemptions for this business's deals)
    const totalDealsSold = await this.prisma.user_redemptions.count({
      where: {
        business_id: businessId,
      },
    });

    return {
      activeDealCount,
      followerCount: business.follower_count,
      totalDealsSold,
    };
  }

  async uploadLogo(businessId: string, userId: string, file: Express.Multer.File): Promise<Business> {
    const business = await this.prisma.businesses.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    // Check ownership
    if (business.owner_id !== userId) {
      throw new ForbiddenException('You do not have permission to update this business');
    }

    // Save file to disk and get public URL
    const logoUrl = await this.uploadService.saveFile(file, 'businesses/logos');

    return await this.prisma.businesses.update({
      where: { id: businessId },
      data: { logo_url: logoUrl },
    }) as any;
  }

  async uploadCoverImage(businessId: string, userId: string, file: Express.Multer.File): Promise<Business> {
    const business = await this.prisma.businesses.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    // Check ownership
    if (business.owner_id !== userId) {
      throw new ForbiddenException('You do not have permission to update this business');
    }

    // Save file to disk and get public URL
    const coverUrl = await this.uploadService.saveFile(file, 'businesses/covers');

    return await this.prisma.businesses.update({
      where: { id: businessId },
      data: { cover_image_url: coverUrl },
    }) as any;
  }
}
