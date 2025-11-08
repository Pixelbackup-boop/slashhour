import { Test, TestingModule } from '@nestjs/testing';
import { BusinessesService } from './businesses.service';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessCategory } from '../common/constants';
import { UploadService } from '../upload/upload.service';
import {
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { DealStatus } from '../deals/entities/deal.entity';

describe('BusinessesService', () => {
  let service: BusinessesService;
  let prismaService: PrismaService;
  let uploadService: UploadService;

  const mockUserId = 'owner-123';
  const mockBusinessId = 'business-123';

  const mockBusiness = {
    id: mockBusinessId,
    owner_id: mockUserId,
    business_name: 'Test Pizza Shop',
    slug: 'test-pizza-shop',
    description: 'Best pizza in town',
    category: BusinessCategory.RESTAURANT,
    subcategory: 'italian',
    location: { lat: 40.7128, lng: -74.0060 },
    address: '123 Main St',
    city: 'New York',
    state_province: 'NY',
    country: 'US',
    postal_code: '10001',
    phone: '+1234567890',
    email: 'contact@test pizza.com',
    website: 'https://testpizza.com',
    hours: {},
    logo_url: 'http://example.com/logo.png',
    cover_image_url: null,
    images: [],
    follower_count: 100,
    total_deals_posted: 50,
    total_redemptions: 200,
    average_rating: 4.5,
    subscription_tier: 'free',
    subscription_expires_at: null,
    is_verified: false,
    verification_date: null,
    stripe_account_id: null,
    payment_enabled: false,
    category_last_changed_at: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  // Type-safe mocks (2025 best practice)
  const mockPrismaService: {
    businesses: {
      findUnique: jest.Mock;
      findMany: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      count: jest.Mock<Promise<number>, unknown[]>;
    };
    deals: {
      findMany: jest.Mock;
      count: jest.Mock<Promise<number>, unknown[]>;
    };
    user_redemptions: {
      count: jest.Mock<Promise<number>, unknown[]>;
    };
    $queryRaw: jest.Mock;
  } = {
    businesses: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    deals: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    user_redemptions: {
      count: jest.fn(),
    },
    $queryRaw: jest.fn(),
  };

  const mockUploadService: {
    saveFile: jest.Mock<Promise<string>, [Express.Multer.File, string?]>;
  } = {
    saveFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessesService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: UploadService, useValue: mockUploadService },
      ],
    }).compile();

    service = module.get<BusinessesService>(BusinessesService);
    prismaService = module.get<PrismaService>(PrismaService);
    uploadService = module.get<UploadService>(UploadService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createBusinessDto = {
      business_name: 'New Pizza Shop',
      slug: 'new-pizza-shop',
      category: BusinessCategory.RESTAURANT,
      location: { lat: 40.7128, lng: -74.0060 },
      address: '456 Main St',
      city: 'New York',
      country: 'US',
    };

    it('should create a new business', async () => {
      mockPrismaService.businesses.findUnique.mockResolvedValue(null);
      mockPrismaService.businesses.create.mockResolvedValue({
        ...mockBusiness,
        ...createBusinessDto,
      });

      const result = await service.create(mockUserId, createBusinessDto);

      expect(result).toHaveProperty('message', 'Business created successfully');
      expect(result.business.slug).toBe(createBusinessDto.slug);
      expect(mockPrismaService.businesses.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          ...createBusinessDto,
          owner_id: mockUserId,
        }),
      });
    });

    it('should throw ConflictException if slug already exists', async () => {
      mockPrismaService.businesses.findUnique.mockResolvedValue(mockBusiness);

      await expect(
        service.create(mockUserId, createBusinessDto),
      ).rejects.toThrow(ConflictException);
      expect(mockPrismaService.businesses.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated businesses', async () => {
      const businesses = [mockBusiness];
      mockPrismaService.businesses.findMany.mockResolvedValue(businesses);
      mockPrismaService.businesses.count.mockResolvedValue(1);

      const result = await service.findAll(1, 20);

      expect(result).toEqual({
        total: 1,
        page: 1,
        limit: 20,
        businesses,
      });
    });

    it('should handle pagination correctly', async () => {
      mockPrismaService.businesses.findMany.mockResolvedValue([]);
      mockPrismaService.businesses.count.mockResolvedValue(0);

      await service.findAll(3, 20);

      expect(mockPrismaService.businesses.findMany).toHaveBeenCalledWith({
        skip: 40, // (3 - 1) * 20
        take: 20,
        orderBy: { created_at: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should find business by ID', async () => {
      const businessWithOwner = {
        ...mockBusiness,
        users: { id: mockUserId, email: 'owner@example.com' },
      };
      mockPrismaService.businesses.findUnique.mockResolvedValue(businessWithOwner);

      const result = await service.findOne(mockBusinessId);

      expect(result.id).toBe(mockBusinessId);
      expect(result).toHaveProperty('users');
    });

    it('should throw NotFoundException if business not found', async () => {
      mockPrismaService.businesses.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findBySlug', () => {
    it('should find business by slug', async () => {
      const businessWithOwner = {
        ...mockBusiness,
        users: { id: mockUserId },
      };
      mockPrismaService.businesses.findUnique.mockResolvedValue(businessWithOwner);

      const result = await service.findBySlug('test-pizza-shop');

      expect(result.slug).toBe('test-pizza-shop');
    });

    it('should throw NotFoundException if business not found', async () => {
      mockPrismaService.businesses.findUnique.mockResolvedValue(null);

      await expect(service.findBySlug('nonexistent-slug')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByOwner', () => {
    it('should return all businesses owned by user', async () => {
      const businesses = [mockBusiness, { ...mockBusiness, id: 'business-456' }];
      mockPrismaService.businesses.findMany.mockResolvedValue(businesses);

      const result = await service.findByOwner(mockUserId);

      expect(result.total).toBe(2);
      expect(result.businesses).toEqual(businesses);
      expect(mockPrismaService.businesses.findMany).toHaveBeenCalledWith({
        where: { owner_id: mockUserId },
        orderBy: { created_at: 'desc' },
      });
    });

    it('should return empty array if user has no businesses', async () => {
      mockPrismaService.businesses.findMany.mockResolvedValue([]);

      const result = await service.findByOwner('user-without-business');

      expect(result.total).toBe(0);
      expect(result.businesses).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update business successfully', async () => {
      const updateDto = {
        business_name: 'Updated Pizza Shop',
        description: 'Even better pizza',
      };

      mockPrismaService.businesses.findUnique.mockResolvedValue(mockBusiness);
      mockPrismaService.businesses.update.mockResolvedValue({
        ...mockBusiness,
        ...updateDto,
      });

      const result = await service.update(mockBusinessId, mockUserId, updateDto);

      expect(result.message).toBe('Business updated successfully');
      expect(result.business.business_name).toBe('Updated Pizza Shop');
    });

    it('should throw NotFoundException if business not found', async () => {
      mockPrismaService.businesses.findUnique.mockResolvedValue(null);

      await expect(
        service.update('nonexistent-id', mockUserId, { business_name: 'New Name' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      const businessOwnedByOther = {
        ...mockBusiness,
        owner_id: 'other-user-id',
      };
      mockPrismaService.businesses.findUnique.mockResolvedValue(businessOwnedByOther);

      await expect(
        service.update(mockBusinessId, mockUserId, { business_name: 'New Name' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException if new slug already exists', async () => {
      const existingBusiness = { id: 'other-business', slug: 'taken-slug' };

      mockPrismaService.businesses.findUnique
        .mockResolvedValueOnce(mockBusiness) // First call: check ownership
        .mockResolvedValueOnce(existingBusiness); // Second call: check slug

      await expect(
        service.update(mockBusinessId, mockUserId, { slug: 'taken-slug' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should allow updating to same slug', async () => {
      mockPrismaService.businesses.findUnique.mockResolvedValue(mockBusiness);
      mockPrismaService.businesses.update.mockResolvedValue(mockBusiness);

      await expect(
        service.update(mockBusinessId, mockUserId, { slug: 'test-pizza-shop' }),
      ).resolves.toBeTruthy();
    });

    describe('Category Change Restrictions', () => {
      it('should allow category change if never changed before', async () => {
        const businessWithoutCategoryChange = {
          ...mockBusiness,
          category_last_changed_at: null,
        };

        mockPrismaService.businesses.findUnique.mockResolvedValue(
          businessWithoutCategoryChange,
        );
        mockPrismaService.businesses.update.mockResolvedValue({
          ...businessWithoutCategoryChange,
          category: BusinessCategory.GROCERY,
        });

        const result = await service.update(mockBusinessId, mockUserId, {
          category: BusinessCategory.GROCERY,
        });

        expect(result.business.category).toBe(BusinessCategory.GROCERY);
        expect(mockPrismaService.businesses.update).toHaveBeenCalledWith({
          where: { id: mockBusinessId },
          data: expect.objectContaining({
            category: BusinessCategory.GROCERY,
            category_last_changed_at: expect.any(Date),
          }),
        });
      });

      it('should allow category change after 30 days', async () => {
        const thirtyOneDaysAgo = new Date();
        thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 31);

        const businessWithOldCategoryChange = {
          ...mockBusiness,
          category_last_changed_at: thirtyOneDaysAgo,
        };

        mockPrismaService.businesses.findUnique.mockResolvedValue(
          businessWithOldCategoryChange,
        );
        mockPrismaService.businesses.update.mockResolvedValue({
          ...businessWithOldCategoryChange,
          category: BusinessCategory.GROCERY,
        });

        await expect(
          service.update(mockBusinessId, mockUserId, { category: BusinessCategory.GROCERY }),
        ).resolves.toBeTruthy();
      });

      it('should throw ForbiddenException if category changed less than 30 days ago', async () => {
        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

        const businessWithRecentCategoryChange = {
          ...mockBusiness,
          category_last_changed_at: tenDaysAgo,
        };

        mockPrismaService.businesses.findUnique.mockResolvedValue(
          businessWithRecentCategoryChange,
        );

        await expect(
          service.update(mockBusinessId, mockUserId, { category: BusinessCategory.GROCERY }),
        ).rejects.toThrow(ForbiddenException);
        expect(mockPrismaService.businesses.update).not.toHaveBeenCalled();
      });

      it('should not update category_last_changed_at if category unchanged', async () => {
        mockPrismaService.businesses.findUnique.mockResolvedValue(mockBusiness);
        mockPrismaService.businesses.update.mockResolvedValue(mockBusiness);

        await service.update(mockBusinessId, mockUserId, {
          business_name: 'Updated Name',
        });

        expect(mockPrismaService.businesses.update).toHaveBeenCalledWith({
          where: { id: mockBusinessId },
          data: expect.not.objectContaining({
            category_last_changed_at: expect.anything(),
          }),
        });
      });
    });
  });

  describe('delete', () => {
    it('should delete business successfully', async () => {
      mockPrismaService.businesses.findUnique.mockResolvedValue(mockBusiness);
      mockPrismaService.businesses.delete.mockResolvedValue(mockBusiness);

      const result = await service.delete(mockBusinessId, mockUserId);

      expect(result.message).toBe('Business deleted successfully');
      expect(mockPrismaService.businesses.delete).toHaveBeenCalledWith({
        where: { id: mockBusinessId },
      });
    });

    it('should throw NotFoundException if business not found', async () => {
      mockPrismaService.businesses.findUnique.mockResolvedValue(null);

      await expect(service.delete('nonexistent-id', mockUserId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      const businessOwnedByOther = {
        ...mockBusiness,
        owner_id: 'other-user-id',
      };
      mockPrismaService.businesses.findUnique.mockResolvedValue(businessOwnedByOther);

      await expect(service.delete(mockBusinessId, mockUserId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('searchByLocation', () => {
    it('should search businesses by location without category filter', async () => {
      const nearbyBusinesses = [mockBusiness];
      mockPrismaService.$queryRaw.mockResolvedValue(nearbyBusinesses);

      const result = await service.searchByLocation(40.7128, -74.0060, 5);

      expect(result.total).toBe(1);
      expect(result.businesses).toEqual(nearbyBusinesses);
      expect(mockPrismaService.$queryRaw).toHaveBeenCalled();
    });

    it('should search businesses by location with category filter', async () => {
      const nearbyRestaurants = [mockBusiness];
      mockPrismaService.$queryRaw.mockResolvedValue(nearbyRestaurants);

      const result = await service.searchByLocation(
        40.7128,
        -74.0060,
        5,
        'restaurant',
      );

      expect(result.total).toBe(1);
      expect(result.businesses).toEqual(nearbyRestaurants);
    });

    it('should return empty array if no businesses within radius', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([]);

      const result = await service.searchByLocation(0, 0, 1);

      expect(result.total).toBe(0);
      expect(result.businesses).toEqual([]);
    });
  });

  describe('getBusinessDeals', () => {
    it('should return active deals for business', async () => {
      const now = new Date();
      const mockDeals = [
        {
          id: 'deal-1',
          business_id: mockBusinessId,
          title: 'Pizza Deal',
          status: 'active',
          starts_at: new Date(now.getTime() - 86400000), // Yesterday
          expires_at: new Date(now.getTime() + 86400000), // Tomorrow
          businesses: mockBusiness,
        },
      ];

      mockPrismaService.businesses.findUnique.mockResolvedValue(mockBusiness);
      mockPrismaService.deals.findMany.mockResolvedValue(mockDeals);

      const result = await service.getBusinessDeals(mockBusinessId);

      expect(result.deals).toHaveLength(1);
      expect(result.deals[0]).toHaveProperty('business'); // Renamed from 'businesses'
      expect(result.deals[0]).not.toHaveProperty('businesses');
    });

    it('should filter out expired deals', async () => {
      const now = new Date();
      const expiredDeal = {
        id: 'deal-2',
        business_id: mockBusinessId,
        status: 'active',
        starts_at: new Date(now.getTime() - 172800000), // 2 days ago
        expires_at: new Date(now.getTime() - 86400000), // Yesterday (expired)
        businesses: mockBusiness,
      };

      mockPrismaService.businesses.findUnique.mockResolvedValue(mockBusiness);
      mockPrismaService.deals.findMany.mockResolvedValue([expiredDeal]);

      const result = await service.getBusinessDeals(mockBusinessId);

      expect(result.deals).toHaveLength(0);
    });

    it('should filter out deals that have not started', async () => {
      const now = new Date();
      const futureDeal = {
        id: 'deal-3',
        business_id: mockBusinessId,
        status: 'active',
        starts_at: new Date(now.getTime() + 86400000), // Tomorrow (not started)
        expires_at: new Date(now.getTime() + 172800000), // 2 days from now
        businesses: mockBusiness,
      };

      mockPrismaService.businesses.findUnique.mockResolvedValue(mockBusiness);
      mockPrismaService.deals.findMany.mockResolvedValue([futureDeal]);

      const result = await service.getBusinessDeals(mockBusinessId);

      expect(result.deals).toHaveLength(0);
    });

    it('should throw NotFoundException if business not found', async () => {
      mockPrismaService.businesses.findUnique.mockResolvedValue(null);

      await expect(service.getBusinessDeals('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getBusinessStats', () => {
    it('should return business statistics', async () => {
      mockPrismaService.businesses.findUnique.mockResolvedValue(mockBusiness);
      mockPrismaService.deals.count.mockResolvedValue(5);
      mockPrismaService.user_redemptions.count.mockResolvedValue(150);

      const result = await service.getBusinessStats(mockBusinessId);

      expect(result).toEqual({
        activeDealCount: 5,
        followerCount: 100,
        totalDealsSold: 150,
      });
    });

    it('should throw NotFoundException if business not found', async () => {
      mockPrismaService.businesses.findUnique.mockResolvedValue(null);

      await expect(service.getBusinessStats('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('uploadLogo', () => {
    const mockFile = {
      buffer: Buffer.from('fake-image'),
      mimetype: 'image/jpeg',
      originalname: 'logo.jpg',
    } as Express.Multer.File;

    it('should upload logo successfully', async () => {
      const logoUrl = 'http://example.com/logo.avif';

      mockPrismaService.businesses.findUnique.mockResolvedValue(mockBusiness);
      mockUploadService.saveFile.mockResolvedValue(logoUrl);
      mockPrismaService.businesses.update.mockResolvedValue({
        ...mockBusiness,
        logo_url: logoUrl,
      });

      const result = await service.uploadLogo(mockBusinessId, mockUserId, mockFile);

      expect(result.logo_url).toBe(logoUrl);
      expect(mockUploadService.saveFile).toHaveBeenCalledWith(
        mockFile,
        'businesses/logos',
      );
    });

    it('should throw NotFoundException if business not found', async () => {
      mockPrismaService.businesses.findUnique.mockResolvedValue(null);

      await expect(
        service.uploadLogo('nonexistent-id', mockUserId, mockFile),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      const businessOwnedByOther = {
        ...mockBusiness,
        owner_id: 'other-user-id',
      };
      mockPrismaService.businesses.findUnique.mockResolvedValue(businessOwnedByOther);

      await expect(
        service.uploadLogo(mockBusinessId, mockUserId, mockFile),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('uploadCoverImage', () => {
    const mockFile = {
      buffer: Buffer.from('fake-image'),
      mimetype: 'image/jpeg',
      originalname: 'cover.jpg',
    } as Express.Multer.File;

    it('should upload cover image successfully', async () => {
      const coverUrl = 'http://example.com/cover.avif';

      mockPrismaService.businesses.findUnique.mockResolvedValue(mockBusiness);
      mockUploadService.saveFile.mockResolvedValue(coverUrl);
      mockPrismaService.businesses.update.mockResolvedValue({
        ...mockBusiness,
        cover_image_url: coverUrl,
      });

      const result = await service.uploadCoverImage(
        mockBusinessId,
        mockUserId,
        mockFile,
      );

      expect(result.cover_image_url).toBe(coverUrl);
      expect(mockUploadService.saveFile).toHaveBeenCalledWith(
        mockFile,
        'businesses/covers',
      );
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      const businessOwnedByOther = {
        ...mockBusiness,
        owner_id: 'other-user-id',
      };
      mockPrismaService.businesses.findUnique.mockResolvedValue(businessOwnedByOther);

      await expect(
        service.uploadCoverImage(mockBusinessId, mockUserId, mockFile),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateStats', () => {
    it('should update business statistics', async () => {
      const stats = {
        follower_count: 150,
        total_deals_posted: 60,
        total_redemptions: 250,
      };

      mockPrismaService.businesses.update.mockResolvedValue({
        ...mockBusiness,
        ...stats,
      });

      await service.updateStats(mockBusinessId, stats);

      expect(mockPrismaService.businesses.update).toHaveBeenCalledWith({
        where: { id: mockBusinessId },
        data: stats,
      });
    });
  });
});
