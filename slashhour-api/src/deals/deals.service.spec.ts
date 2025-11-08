import { Test, TestingModule } from '@nestjs/testing';
import { DealsService } from './deals.service';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException
} from '@nestjs/common';
import { DealStatus } from './entities/deal.entity';

describe('DealsService', () => {
  let service: DealsService;
  let prismaService: PrismaService;
  let uploadService: UploadService;
  let notificationsService: NotificationsService;

  // Mock data
  const mockUserId = 'user-123';
  const mockBusinessId = 'business-123';
  const mockDealId = 'deal-123';

  const mockBusiness = {
    id: mockBusinessId,
    owner_id: mockUserId,
    business_name: 'Test Pizza',
    slug: 'test-pizza',
    category: 'restaurant',
    location: { lat: 40.7128, lng: -74.0060 },
  };

  const mockDeal = {
    id: mockDealId,
    business_id: mockBusinessId,
    title: '50% Off Pizza',
    description: 'Get half off any large pizza',
    original_price: 20.00,
    discounted_price: 10.00,
    discount_percentage: 50,
    category: 'food_beverage',
    tags: ['pizza', 'food'],
    starts_at: new Date('2025-01-01'),
    expires_at: new Date('2025-12-31'),
    is_flash_deal: false,
    visibility_radius_km: 5,
    quantity_available: 100,
    quantity_redeemed: 0,
    max_per_user: 1,
    terms_conditions: ['Valid in-store only'],
    images: [],
    status: 'active',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockCreateDealDto = {
    title: '50% Off Pizza',
    description: 'Get half off any large pizza',
    original_price: 20.00,
    discounted_price: 10.00,
    category: 'food_beverage',
    tags: ['pizza', 'food'],
    starts_at: new Date('2025-01-01'),
    expires_at: new Date('2025-12-31'),
    is_flash_deal: false,
    visibility_radius_km: 5,
    quantity_available: 100,
    max_per_user: 1,
    terms_conditions: ['Valid in-store only'],
  };

  // Mock services with proper typing (2025 best practice - avoid 'any')
  const mockPrismaService: {
    deals: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      count: jest.Mock;
    };
    businesses: {
      findUnique: jest.Mock;
    };
    bookmarks: {
      findUnique: jest.Mock;
    };
  } = {
    deals: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    businesses: {
      findUnique: jest.fn(),
    },
    bookmarks: {
      findUnique: jest.fn(),
    },
  };

  const mockUploadService: {
    saveFiles: jest.Mock<Promise<string[]>, [Express.Multer.File[], string?]>;
  } = {
    saveFiles: jest.fn(),
  };

  const mockNotificationsService: {
    sendNewDealNotification: jest.Mock<Promise<void>, [string, string]>;
  } = {
    sendNewDealNotification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DealsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: UploadService, useValue: mockUploadService },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<DealsService>(DealsService);
    prismaService = module.get<PrismaService>(PrismaService);
    uploadService = module.get<UploadService>(UploadService);
    notificationsService = module.get<NotificationsService>(NotificationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should successfully create a deal', async () => {
      mockPrismaService.businesses.findUnique.mockResolvedValue(mockBusiness);
      mockPrismaService.deals.create.mockResolvedValue(mockDeal);
      mockNotificationsService.sendNewDealNotification.mockResolvedValue(undefined);

      const result = await service.create(
        mockUserId,
        mockBusinessId,
        mockCreateDealDto,
      );

      expect(result).toHaveProperty('message', 'Deal created successfully');
      expect(result).toHaveProperty('deal');
      expect(result.deal.id).toBe(mockDealId);
      expect(mockPrismaService.deals.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          ...mockCreateDealDto,
          business_id: mockBusinessId,
        }),
      });
    });

    it('should throw NotFoundException if business does not exist', async () => {
      mockPrismaService.businesses.findUnique.mockResolvedValue(null);

      await expect(
        service.create(mockUserId, mockBusinessId, mockCreateDealDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not business owner', async () => {
      const unauthorizedBusiness = { ...mockBusiness, owner_id: 'other-user-id' };
      mockPrismaService.businesses.findUnique.mockResolvedValue(unauthorizedBusiness);

      await expect(
        service.create(mockUserId, mockBusinessId, mockCreateDealDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if start date is after expiration', async () => {
      mockPrismaService.businesses.findUnique.mockResolvedValue(mockBusiness);

      const invalidDealDto = {
        ...mockCreateDealDto,
        starts_at: new Date('2025-12-31'),
        expires_at: new Date('2025-01-01'),
      };

      await expect(
        service.create(mockUserId, mockBusinessId, invalidDealDto),
      ).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.deals.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if discounted price >= original price', async () => {
      mockPrismaService.businesses.findUnique.mockResolvedValue(mockBusiness);

      const invalidDealDto = {
        ...mockCreateDealDto,
        original_price: 10.00,
        discounted_price: 15.00,
      };

      await expect(
        service.create(mockUserId, mockBusinessId, invalidDealDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should send notification asynchronously after creating deal', async () => {
      mockPrismaService.businesses.findUnique.mockResolvedValue(mockBusiness);
      mockPrismaService.deals.create.mockResolvedValue(mockDeal);
      mockNotificationsService.sendNewDealNotification.mockResolvedValue(undefined);

      await service.create(mockUserId, mockBusinessId, mockCreateDealDto);

      // Notification should be called but not awaited
      expect(mockNotificationsService.sendNewDealNotification).toHaveBeenCalledWith(
        mockDealId,
        mockBusinessId,
      );
    });

    it('should not fail if notification sending fails', async () => {
      mockPrismaService.businesses.findUnique.mockResolvedValue(mockBusiness);
      mockPrismaService.deals.create.mockResolvedValue(mockDeal);
      mockNotificationsService.sendNewDealNotification.mockRejectedValue(
        new Error('Firebase error'),
      );

      // Deal creation should still succeed even if notification fails
      const result = await service.create(
        mockUserId,
        mockBusinessId,
        mockCreateDealDto,
      );

      expect(result).toHaveProperty('message', 'Deal created successfully');
    });
  });

  describe('createWithMultipart', () => {
    const mockFiles = [
      {
        fieldname: 'images',
        originalname: 'pizza.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('fake-image-data'),
        size: 1024,
      },
    ] as Express.Multer.File[];

    const mockBody = {
      title: '50% Off Pizza',
      description: 'Get half off',
      original_price: '20.00',
      discounted_price: '10.00',
      category: 'food_beverage',
      tags: JSON.stringify(['pizza']),
      starts_at: '2025-01-01',
      expires_at: '2025-12-31',
      is_flash_deal: 'false',
      visibility_radius_km: '5',
      quantity_available: '100',
      max_per_user: '1',
      terms_conditions: JSON.stringify(['Valid in-store only']),
    };

    it('should create deal with uploaded images', async () => {
      mockPrismaService.businesses.findUnique.mockResolvedValue(mockBusiness);
      mockUploadService.saveFiles.mockResolvedValue([
        'http://localhost:3000/uploads/deals/image1.avif',
      ]);
      mockPrismaService.deals.create.mockResolvedValue({
        ...mockDeal,
        images: [{ url: 'http://localhost:3000/uploads/deals/image1.avif', order: 0 }],
      });

      const result = await service.createWithMultipart(
        mockUserId,
        mockBusinessId,
        mockBody,
        mockFiles,
      );

      expect(mockUploadService.saveFiles).toHaveBeenCalledWith(mockFiles, 'deals');
      expect(result).toHaveProperty('message', 'Deal created successfully');
      expect(result.deal.images).toHaveLength(1);
    });

    it('should parse FormData fields correctly', async () => {
      mockPrismaService.businesses.findUnique.mockResolvedValue(mockBusiness);
      mockUploadService.saveFiles.mockResolvedValue([]);
      mockPrismaService.deals.create.mockResolvedValue(mockDeal);

      await service.createWithMultipart(
        mockUserId,
        mockBusinessId,
        mockBody,
        [],
      );

      expect(mockPrismaService.deals.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: '50% Off Pizza',
          original_price: 20.00,
          discounted_price: 10.00,
          is_flash_deal: false,
          visibility_radius_km: 5,
          quantity_available: 100,
        }),
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated active deals', async () => {
      const mockDeals = [mockDeal];
      mockPrismaService.deals.findMany.mockResolvedValue(mockDeals);
      mockPrismaService.deals.count.mockResolvedValue(1);

      const result = await service.findAll(1, 20);

      expect(result).toEqual({
        total: 1,
        page: 1,
        limit: 20,
        deals: mockDeals,
      });
      expect(mockPrismaService.deals.findMany).toHaveBeenCalledWith({
        where: { status: DealStatus.ACTIVE },
        skip: 0,
        take: 20,
        orderBy: { created_at: 'desc' },
        include: { businesses: true },
      });
    });

    it('should handle pagination correctly', async () => {
      mockPrismaService.deals.findMany.mockResolvedValue([]);
      mockPrismaService.deals.count.mockResolvedValue(100);

      await service.findAll(3, 20);

      expect(mockPrismaService.deals.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 40, // (3 - 1) * 20
          take: 20,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return deal with business information', async () => {
      const dealWithBusiness = {
        ...mockDeal,
        businesses: mockBusiness,
      };
      mockPrismaService.deals.findUnique.mockResolvedValue(dealWithBusiness);

      const result = await service.findOne(mockDealId);

      expect(result).toHaveProperty('business');
      expect(result.business.business_name).toBe('Test Pizza');
    });

    it('should include bookmark status if userId provided', async () => {
      const dealWithBusiness = {
        ...mockDeal,
        businesses: mockBusiness,
      };
      mockPrismaService.deals.findUnique.mockResolvedValue(dealWithBusiness);
      mockPrismaService.bookmarks.findUnique.mockResolvedValue({
        id: 'bookmark-123',
        user_id: mockUserId,
        deal_id: mockDealId,
      });

      const result = await service.findOne(mockDealId, mockUserId);

      expect(result.isBookmarked).toBe(true);
    });

    it('should throw NotFoundException if deal does not exist', async () => {
      mockPrismaService.deals.findUnique.mockResolvedValue(null);

      await expect(service.findOne(mockDealId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByBusiness', () => {
    it('should return all deals for a business', async () => {
      const mockDeals = [mockDeal, { ...mockDeal, id: 'deal-456' }];
      mockPrismaService.deals.findMany.mockResolvedValue(mockDeals);

      const result = await service.findByBusiness(mockBusinessId);

      expect(result.total).toBe(2);
      expect(result.deals).toEqual(mockDeals);
      expect(mockPrismaService.deals.findMany).toHaveBeenCalledWith({
        where: { business_id: mockBusinessId },
        orderBy: { created_at: 'desc' },
      });
    });

    it('should return empty array if business has no deals', async () => {
      mockPrismaService.deals.findMany.mockResolvedValue([]);

      const result = await service.findByBusiness(mockBusinessId);

      expect(result.total).toBe(0);
      expect(result.deals).toEqual([]);
    });
  });

  describe('update', () => {
    it('should successfully update deal', async () => {
      const dealWithBusiness = {
        ...mockDeal,
        businesses: mockBusiness,
      };
      mockPrismaService.deals.findUnique.mockResolvedValue(dealWithBusiness);
      mockPrismaService.deals.update.mockResolvedValue({
        ...mockDeal,
        title: 'Updated Title',
      });

      const updateDto = { title: 'Updated Title' };
      const result = await service.update(mockDealId, mockUserId, updateDto);

      expect(result.message).toBe('Deal updated successfully');
      expect(mockPrismaService.deals.update).toHaveBeenCalledWith({
        where: { id: mockDealId },
        data: updateDto,
      });
    });

    it('should throw NotFoundException if deal does not exist', async () => {
      mockPrismaService.deals.findUnique.mockResolvedValue(null);

      await expect(
        service.update(mockDealId, mockUserId, { title: 'New Title' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      const dealWithBusiness = {
        ...mockDeal,
        businesses: { ...mockBusiness, owner_id: 'other-user' },
      };
      mockPrismaService.deals.findUnique.mockResolvedValue(dealWithBusiness);

      await expect(
        service.update(mockDealId, mockUserId, { title: 'New Title' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should validate dates when both starts_at and expires_at are provided', async () => {
      const dealWithBusiness = {
        ...mockDeal,
        businesses: mockBusiness,
      };
      mockPrismaService.deals.findUnique.mockResolvedValue(dealWithBusiness);

      const updateDto = {
        starts_at: new Date('2025-12-31'),
        expires_at: new Date('2025-01-01'),
      };

      await expect(
        service.update(mockDealId, mockUserId, updateDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.update(mockDealId, mockUserId, updateDto),
      ).rejects.toThrow('Start date must be before expiration date');
    });

    it('should validate pricing when both prices are provided', async () => {
      const dealWithBusiness = {
        ...mockDeal,
        businesses: mockBusiness,
      };
      mockPrismaService.deals.findUnique.mockResolvedValue(dealWithBusiness);

      const updateDto = {
        original_price: 10.00,
        discounted_price: 20.00,
      };

      await expect(
        service.update(mockDealId, mockUserId, updateDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.update(mockDealId, mockUserId, updateDto),
      ).rejects.toThrow('Discounted price must be less than original price');
    });

    it('should allow partial updates without validation errors', async () => {
      const dealWithBusiness = {
        ...mockDeal,
        businesses: mockBusiness,
      };
      mockPrismaService.deals.findUnique.mockResolvedValue(dealWithBusiness);
      mockPrismaService.deals.update.mockResolvedValue({
        ...mockDeal,
        title: 'Updated Title',
      });

      // Update only title - should not trigger date/price validation
      const updateDto = { title: 'Updated Title' };
      const result = await service.update(mockDealId, mockUserId, updateDto);

      expect(result.message).toBe('Deal updated successfully');
    });
  });

  describe('updateWithMultipart', () => {
    const mockFiles = [
      {
        fieldname: 'images',
        originalname: 'new-image.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('fake-image-data'),
        size: 2048,
      },
    ] as Express.Multer.File[];

    const mockUpdateBody = {
      title: 'Updated Pizza Deal',
      original_price: '25.00',
      discounted_price: '12.50',
      existingImages: JSON.stringify([
        { url: 'http://localhost:3000/uploads/deals/existing.avif', order: 0 },
      ]),
    };

    it('should update deal with new images', async () => {
      const dealWithBusiness = {
        ...mockDeal,
        businesses: mockBusiness,
      };
      mockPrismaService.deals.findUnique.mockResolvedValue(dealWithBusiness);
      mockUploadService.saveFiles.mockResolvedValue([
        'http://localhost:3000/uploads/deals/new-image.avif',
      ]);
      mockPrismaService.deals.update.mockResolvedValue({
        ...mockDeal,
        title: 'Updated Pizza Deal',
      });

      const result = await service.updateWithMultipart(
        mockDealId,
        mockUserId,
        mockUpdateBody,
        mockFiles,
      );

      expect(result.message).toBe('Deal updated successfully');
      expect(mockUploadService.saveFiles).toHaveBeenCalledWith(mockFiles, 'deals');
      expect(mockPrismaService.deals.update).toHaveBeenCalledWith({
        where: { id: mockDealId },
        data: expect.objectContaining({
          images: expect.arrayContaining([
            { url: 'http://localhost:3000/uploads/deals/existing.avif', order: 0 },
            { url: 'http://localhost:3000/uploads/deals/new-image.avif', order: 1 },
          ]),
        }),
      });
    });

    it('should throw NotFoundException if deal does not exist', async () => {
      mockPrismaService.deals.findUnique.mockResolvedValue(null);

      await expect(
        service.updateWithMultipart(mockDealId, mockUserId, mockUpdateBody, []),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      const dealWithBusiness = {
        ...mockDeal,
        businesses: { ...mockBusiness, owner_id: 'other-user' },
      };
      mockPrismaService.deals.findUnique.mockResolvedValue(dealWithBusiness);

      await expect(
        service.updateWithMultipart(mockDealId, mockUserId, mockUpdateBody, []),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should parse all FormData fields correctly', async () => {
      const dealWithBusiness = {
        ...mockDeal,
        businesses: mockBusiness,
      };
      mockPrismaService.deals.findUnique.mockResolvedValue(dealWithBusiness);
      mockPrismaService.deals.update.mockResolvedValue(mockDeal);

      const fullBody = {
        title: 'New Title',
        description: 'New Description',
        original_price: '30.00',
        discounted_price: '15.00',
        category: 'food_beverage',
        tags: JSON.stringify(['pizza', 'italian']),
        starts_at: '2025-02-01',
        expires_at: '2025-03-01',
        is_flash_deal: 'true',
        visibility_radius_km: '10',
        quantity_available: '200',
        max_per_user: '2',
        terms_conditions: JSON.stringify(['New terms']),
      };

      await service.updateWithMultipart(mockDealId, mockUserId, fullBody, []);

      expect(mockPrismaService.deals.update).toHaveBeenCalledWith({
        where: { id: mockDealId },
        data: expect.objectContaining({
          title: 'New Title',
          description: 'New Description',
          original_price: 30.00,
          discounted_price: 15.00,
          category: 'food_beverage',
          tags: ['pizza', 'italian'],
          is_flash_deal: true,
          visibility_radius_km: 10,
          quantity_available: 200,
          max_per_user: 2,
          terms_conditions: ['New terms'],
        }),
      });
    });

    it('should validate dates with existing and updated values', async () => {
      const dealWithBusiness = {
        ...mockDeal,
        businesses: mockBusiness,
        starts_at: new Date('2025-01-01'),
        expires_at: new Date('2025-12-31'),
      };
      mockPrismaService.deals.findUnique.mockResolvedValue(dealWithBusiness);

      const invalidBody = {
        expires_at: '2024-01-01', // Before existing start date
      };

      await expect(
        service.updateWithMultipart(mockDealId, mockUserId, invalidBody, []),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.updateWithMultipart(mockDealId, mockUserId, invalidBody, []),
      ).rejects.toThrow('Start date must be before expiration date');
    });

    it('should validate pricing with existing and updated values', async () => {
      const dealWithBusiness = {
        ...mockDeal,
        businesses: mockBusiness,
        original_price: 20.00,
        discounted_price: 10.00,
      };
      mockPrismaService.deals.findUnique.mockResolvedValue(dealWithBusiness);

      const invalidBody = {
        discounted_price: '25.00', // More than existing original price
      };

      await expect(
        service.updateWithMultipart(mockDealId, mockUserId, invalidBody, []),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.updateWithMultipart(mockDealId, mockUserId, invalidBody, []),
      ).rejects.toThrow('Discounted price must be less than original price');
    });

    it('should handle update without files or existingImages', async () => {
      const dealWithBusiness = {
        ...mockDeal,
        businesses: mockBusiness,
      };
      mockPrismaService.deals.findUnique.mockResolvedValue(dealWithBusiness);
      mockPrismaService.deals.update.mockResolvedValue(mockDeal);

      const minimalBody = {
        title: 'Updated Title',
      };

      const result = await service.updateWithMultipart(
        mockDealId,
        mockUserId,
        minimalBody,
        [],
      );

      expect(result.message).toBe('Deal updated successfully');
      expect(mockUploadService.saveFiles).not.toHaveBeenCalled();
    });

    it('should combine existing images with new uploads in correct order', async () => {
      const dealWithBusiness = {
        ...mockDeal,
        businesses: mockBusiness,
      };
      const existingImages = [
        { url: 'http://localhost:3000/uploads/deals/img1.avif', order: 0 },
        { url: 'http://localhost:3000/uploads/deals/img2.avif', order: 1 },
      ];

      mockPrismaService.deals.findUnique.mockResolvedValue(dealWithBusiness);
      mockUploadService.saveFiles.mockResolvedValue([
        'http://localhost:3000/uploads/deals/img3.avif',
        'http://localhost:3000/uploads/deals/img4.avif',
      ]);
      mockPrismaService.deals.update.mockResolvedValue(mockDeal);

      const bodyWithExisting = {
        title: 'Updated',
        existingImages: JSON.stringify(existingImages),
      };

      await service.updateWithMultipart(
        mockDealId,
        mockUserId,
        bodyWithExisting,
        mockFiles,
      );

      expect(mockPrismaService.deals.update).toHaveBeenCalledWith({
        where: { id: mockDealId },
        data: expect.objectContaining({
          images: [
            ...existingImages,
            { url: 'http://localhost:3000/uploads/deals/img3.avif', order: 2 },
            { url: 'http://localhost:3000/uploads/deals/img4.avif', order: 3 },
          ],
        }),
      });
    });
  });

  describe('delete', () => {
    it('should soft delete deal by setting status to deleted', async () => {
      const dealWithBusiness = {
        ...mockDeal,
        businesses: mockBusiness,
      };
      mockPrismaService.deals.findUnique.mockResolvedValue(dealWithBusiness);
      mockPrismaService.deals.update.mockResolvedValue({
        ...mockDeal,
        status: 'deleted',
      });

      const result = await service.delete(mockDealId, mockUserId);

      expect(result.message).toBe('Deal deleted successfully');
      expect(mockPrismaService.deals.update).toHaveBeenCalledWith({
        where: { id: mockDealId },
        data: { status: 'deleted' },
      });
    });

    it('should throw NotFoundException if deal does not exist', async () => {
      mockPrismaService.deals.findUnique.mockResolvedValue(null);

      await expect(
        service.delete(mockDealId, mockUserId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.delete(mockDealId, mockUserId),
      ).rejects.toThrow('Deal not found');
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      const dealWithBusiness = {
        ...mockDeal,
        businesses: { ...mockBusiness, owner_id: 'other-user' },
      };
      mockPrismaService.deals.findUnique.mockResolvedValue(dealWithBusiness);

      await expect(
        service.delete(mockDealId, mockUserId),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.delete(mockDealId, mockUserId),
      ).rejects.toThrow('You do not have permission to delete this deal');
    });
  });

  describe('redeemDeal', () => {
    it('should successfully redeem an active deal', async () => {
      mockPrismaService.deals.findUnique.mockResolvedValue(mockDeal);
      mockPrismaService.deals.update.mockResolvedValue({
        ...mockDeal,
        quantity_redeemed: 1,
      });

      const result = await service.redeemDeal(mockDealId, mockUserId);

      expect(result.message).toBe('Deal redeemed successfully');
      expect(mockPrismaService.deals.update).toHaveBeenCalledWith({
        where: { id: mockDealId },
        data: { quantity_redeemed: 1 },
      });
    });

    it('should throw BadRequestException if deal is not active', async () => {
      mockPrismaService.deals.findUnique.mockResolvedValue({
        ...mockDeal,
        status: 'paused',
      });

      await expect(service.redeemDeal(mockDealId, mockUserId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if deal has expired', async () => {
      mockPrismaService.deals.findUnique.mockResolvedValue({
        ...mockDeal,
        expires_at: new Date('2020-01-01'),
      });

      await expect(service.redeemDeal(mockDealId, mockUserId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if deal has not started', async () => {
      mockPrismaService.deals.findUnique.mockResolvedValue({
        ...mockDeal,
        starts_at: new Date('2030-01-01'),
      });

      await expect(service.redeemDeal(mockDealId, mockUserId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if deal is sold out', async () => {
      mockPrismaService.deals.findUnique.mockResolvedValue({
        ...mockDeal,
        quantity_redeemed: 100,
        quantity_available: 100,
      });

      await expect(service.redeemDeal(mockDealId, mockUserId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should mark deal as sold_out when last item is redeemed', async () => {
      mockPrismaService.deals.findUnique.mockResolvedValue({
        ...mockDeal,
        quantity_redeemed: 99,
        quantity_available: 100,
      });
      mockPrismaService.deals.update.mockResolvedValue(mockDeal);

      await service.redeemDeal(mockDealId, mockUserId);

      // Should be called twice: once to increment, once to set sold_out
      expect(mockPrismaService.deals.update).toHaveBeenCalledTimes(2);
      expect(mockPrismaService.deals.update).toHaveBeenLastCalledWith({
        where: { id: mockDealId },
        data: { status: DealStatus.SOLD_OUT },
      });
    });
  });

  describe('getActiveDeals', () => {
    it('should return only active deals within date range', async () => {
      const activeDeals = [mockDeal];
      mockPrismaService.deals.findMany.mockResolvedValue(activeDeals);

      const result = await service.getActiveDeals();

      expect(result.total).toBe(1);
      expect(result.deals).toEqual(activeDeals);
      expect(mockPrismaService.deals.findMany).toHaveBeenCalledWith({
        where: {
          status: DealStatus.ACTIVE,
          starts_at: { lte: expect.any(Date) },
          expires_at: { gt: expect.any(Date) },
        },
        include: { businesses: true },
        orderBy: { created_at: 'desc' },
      });
    });
  });

  describe('getFlashDeals', () => {
    it('should return only flash deals', async () => {
      const flashDeal = { ...mockDeal, is_flash_deal: true };
      mockPrismaService.deals.findMany.mockResolvedValue([flashDeal]);

      const result = await service.getFlashDeals();

      expect(result.total).toBe(1);
      expect(result.deals[0].is_flash_deal).toBe(true);
      expect(mockPrismaService.deals.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            is_flash_deal: true,
          }),
        }),
      );
    });
  });
});
