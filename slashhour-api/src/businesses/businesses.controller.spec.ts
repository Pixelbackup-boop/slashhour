import { Test, TestingModule } from '@nestjs/testing';
import { BusinessesController } from './businesses.controller';
import { BusinessesService } from './businesses.service';
import { BusinessCategory } from '../common/constants';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';

describe('BusinessesController', () => {
  let controller: BusinessesController;
  let businessesService: BusinessesService;

  const mockUserId = 'user-123';
  const mockBusinessId = 'business-123';

  const mockUser = {
    id: mockUserId,
    sub: mockUserId,
    email: 'owner@example.com',
    username: 'businessowner',
    userType: 'business',
  };

  const mockRequest = {
    user: mockUser,
  };

  const mockBusiness = {
    id: mockBusinessId,
    owner_id: mockUserId,
    business_name: 'Test Pizza',
    slug: 'test-pizza',
    category: BusinessCategory.FOOD_BEVERAGE,
    subcategory: 'pizza',
    location: { lat: 40.7128, lng: -74.0060 },
    address: '123 Main St',
    city: 'New York',
    state_province: 'NY',
    country: 'US',
    postal_code: '10001',
    phone: '+1234567890',
    email: 'info@testpizza.com',
    created_at: new Date(),
    updated_at: new Date(),
  };

  // Type-safe mocks (2025 best practice)
  const mockBusinessesService: {
    create: jest.Mock;
    findAll: jest.Mock;
    findBySlug: jest.Mock;
    findOne: jest.Mock;
    findByOwner: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    uploadLogo: jest.Mock;
    uploadCoverImage: jest.Mock;
    searchByLocation: jest.Mock;
    getBusinessDeals: jest.Mock;
    getBusinessStats: jest.Mock;
  } = {
    create: jest.fn(),
    findAll: jest.fn(),
    findBySlug: jest.fn(),
    findOne: jest.fn(),
    findByOwner: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    uploadLogo: jest.fn(),
    uploadCoverImage: jest.fn(),
    searchByLocation: jest.fn(),
    getBusinessDeals: jest.fn(),
    getBusinessStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusinessesController],
      providers: [
        { provide: BusinessesService, useValue: mockBusinessesService },
      ],
    }).compile();

    controller = module.get<BusinessesController>(BusinessesController);
    businessesService = module.get<BusinessesService>(BusinessesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /businesses', () => {
    it('should create a new business', async () => {
      const createDto: CreateBusinessDto = {
        business_name: 'New Pizza Place',
        slug: 'new-pizza-place',
        category: BusinessCategory.FOOD_BEVERAGE,
        subcategory: 'pizza',
        location: { lat: 40.7128, lng: -74.0060 },
        address: '456 Broadway',
        city: 'New York',
        state_province: 'NY',
        country: 'US',
        postal_code: '10002',
      };

      const mockResponse = {
        message: 'Business created successfully',
        business: {
          ...mockBusiness,
          business_name: createDto.business_name,
          slug: createDto.slug,
        },
      };

      mockBusinessesService.create.mockResolvedValue(mockResponse);

      const result = await controller.create(mockRequest as never, createDto);

      expect(result).toEqual(mockResponse);
      expect(mockBusinessesService.create).toHaveBeenCalledWith(
        mockUserId,
        createDto,
      );
    });
  });

  describe('GET /businesses', () => {
    it('should return paginated businesses', async () => {
      const mockResponse = {
        businesses: [mockBusiness],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      };

      mockBusinessesService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(1, 20);

      expect(result).toEqual(mockResponse);
      expect(mockBusinessesService.findAll).toHaveBeenCalledWith(1, 20);
    });

    it('should use default pagination values', async () => {
      mockBusinessesService.findAll.mockResolvedValue({
        businesses: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      });

      await controller.findAll();

      expect(mockBusinessesService.findAll).toHaveBeenCalledWith(1, 20);
    });
  });

  describe('GET /businesses/slug/:slug', () => {
    it('should return business by slug', async () => {
      mockBusinessesService.findBySlug.mockResolvedValue(mockBusiness);

      const result = await controller.findBySlug('test-pizza');

      expect(result).toEqual(mockBusiness);
      expect(mockBusinessesService.findBySlug).toHaveBeenCalledWith(
        'test-pizza',
      );
    });
  });

  describe('GET /businesses/:id', () => {
    it('should return business by ID', async () => {
      mockBusinessesService.findOne.mockResolvedValue(mockBusiness);

      const result = await controller.findOne(mockBusinessId);

      expect(result).toEqual(mockBusiness);
      expect(mockBusinessesService.findOne).toHaveBeenCalledWith(
        mockBusinessId,
      );
    });
  });

  describe('PATCH /businesses/:id', () => {
    it('should update business', async () => {
      const updateDto: UpdateBusinessDto = {
        business_name: 'Updated Pizza',
        description: 'Updated description',
      };

      const mockResponse = {
        message: 'Business updated successfully',
        business: {
          ...mockBusiness,
          business_name: updateDto.business_name,
          description: updateDto.description,
        },
      };

      mockBusinessesService.update.mockResolvedValue(mockResponse);

      const result = await controller.update(
        mockRequest as never,
        mockBusinessId,
        updateDto,
      );

      expect(result).toEqual(mockResponse);
      expect(mockBusinessesService.update).toHaveBeenCalledWith(
        mockBusinessId,
        mockUserId,
        updateDto,
      );
    });
  });

  describe('DELETE /businesses/:id', () => {
    it('should delete business', async () => {
      const mockResponse = {
        message: 'Business deleted successfully',
      };

      mockBusinessesService.delete.mockResolvedValue(mockResponse);

      const result = await controller.delete(
        mockRequest as never,
        mockBusinessId,
      );

      expect(result).toEqual(mockResponse);
      expect(mockBusinessesService.delete).toHaveBeenCalledWith(
        mockBusinessId,
        mockUserId,
      );
    });
  });

  describe('POST /businesses/:id/logo', () => {
    it('should upload business logo', async () => {
      const mockFile = {
        fieldname: 'logo',
        originalname: 'logo.png',
        encoding: '7bit',
        mimetype: 'image/png',
        buffer: Buffer.from('fake-logo'),
        size: 2048,
      } as Express.Multer.File;

      const businessWithLogo = {
        ...mockBusiness,
        logo_url: 'https://example.com/logo.avif',
      };

      mockBusinessesService.uploadLogo.mockResolvedValue(businessWithLogo);

      const result = await controller.uploadLogo(
        mockRequest as never,
        mockBusinessId,
        mockFile,
      );

      expect(result.message).toBe('Logo uploaded successfully');
      expect(result.business).toEqual(businessWithLogo);
      expect(mockBusinessesService.uploadLogo).toHaveBeenCalledWith(
        mockBusinessId,
        mockUserId,
        mockFile,
      );
    });
  });

  describe('POST /businesses/:id/cover', () => {
    it('should upload business cover image', async () => {
      const mockFile = {
        fieldname: 'cover',
        originalname: 'cover.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('fake-cover'),
        size: 4096,
      } as Express.Multer.File;

      const businessWithCover = {
        ...mockBusiness,
        cover_image_url: 'https://example.com/cover.avif',
      };

      mockBusinessesService.uploadCoverImage.mockResolvedValue(
        businessWithCover,
      );

      const result = await controller.uploadCover(
        mockRequest as never,
        mockBusinessId,
        mockFile,
      );

      expect(result.message).toBe('Cover image uploaded successfully');
      expect(result.business).toEqual(businessWithCover);
      expect(mockBusinessesService.uploadCoverImage).toHaveBeenCalledWith(
        mockBusinessId,
        mockUserId,
        mockFile,
      );
    });
  });

  describe('GET /businesses/search', () => {
    it('should search businesses by location', async () => {
      const lat = 40.7128;
      const lng = -74.0060;
      const radius = 10;
      const category = BusinessCategory.FOOD_BEVERAGE;

      const mockResponse = {
        businesses: [
          {
            ...mockBusiness,
            distance: 2.5,
          },
        ],
        total: 1,
      };

      mockBusinessesService.searchByLocation.mockResolvedValue(mockResponse);

      const result = await controller.searchByLocation(lat, lng, radius, category);

      expect(result).toEqual(mockResponse);
      expect(mockBusinessesService.searchByLocation).toHaveBeenCalledWith(
        lat,
        lng,
        radius,
        category,
      );
    });

    it('should use default radius of 5km when not provided', async () => {
      const lat = 40.7128;
      const lng = -74.0060;

      mockBusinessesService.searchByLocation.mockResolvedValue({
        businesses: [],
        total: 0,
      });

      const result = await controller.searchByLocation(lat, lng);

      expect(result).toBeDefined();
      expect(mockBusinessesService.searchByLocation).toHaveBeenCalledWith(
        lat,
        lng,
        5,
        undefined,
      );
    });
  });

  describe('GET /businesses/my-businesses', () => {
    it('should return businesses owned by the user', async () => {
      const mockResponse = {
        businesses: [mockBusiness],
      };

      mockBusinessesService.findByOwner.mockResolvedValue(mockResponse);

      const result = await controller.getMyBusinesses(mockRequest as never);

      expect(result).toEqual(mockResponse);
      expect(mockBusinessesService.findByOwner).toHaveBeenCalledWith(mockUserId);
    });
  });

  describe('GET /businesses/:id/deals', () => {
    it('should return deals for a business', async () => {
      const mockResponse = {
        deals: [
          {
            id: 'deal-123',
            title: '50% Off Pizza',
            business_id: mockBusinessId,
          },
        ],
      };

      mockBusinessesService.getBusinessDeals.mockResolvedValue(mockResponse);

      const result = await controller.getBusinessDeals(mockBusinessId);

      expect(result).toEqual(mockResponse);
      expect(mockBusinessesService.getBusinessDeals).toHaveBeenCalledWith(
        mockBusinessId,
      );
    });
  });

  describe('GET /businesses/:id/stats', () => {
    it('should return business statistics', async () => {
      const mockResponse = {
        totalDeals: 15,
        activeDeals: 8,
        totalRedemptions: 250,
        followerCount: 1500,
        averageRating: 4.5,
      };

      mockBusinessesService.getBusinessStats.mockResolvedValue(mockResponse);

      const result = await controller.getBusinessStats(mockBusinessId);

      expect(result).toEqual(mockResponse);
      expect(mockBusinessesService.getBusinessStats).toHaveBeenCalledWith(
        mockBusinessId,
      );
    });
  });
});
