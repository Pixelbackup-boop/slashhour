import { Test, TestingModule } from '@nestjs/testing';
import { DealsController } from './deals.controller';
import { DealsService } from './deals.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';

describe('DealsController', () => {
  let controller: DealsController;
  let dealsService: DealsService;

  const mockUserId = 'user-123';
  const mockBusinessId = 'business-123';
  const mockDealId = 'deal-123';

  const mockUser = {
    id: mockUserId,
    sub: mockUserId,
    email: 'test@example.com',
    username: 'testuser',
  };

  const mockRequest = {
    user: mockUser,
  };

  const mockDeal = {
    id: mockDealId,
    business_id: mockBusinessId,
    title: '50% Off Pizza',
    description: 'Get half off',
    original_price: 20.00,
    discounted_price: 10.00,
    category: 'food_beverage',
    starts_at: new Date(),
    expires_at: new Date(),
    status: 'active',
    created_at: new Date(),
  };

  // Type-safe mocks (2025 best practice)
  const mockDealsService: {
    create: jest.Mock;
    createWithMultipart: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    updateWithMultipart: jest.Mock;
    delete: jest.Mock;
    redeemDeal: jest.Mock;
    getActiveDeals: jest.Mock;
    getFlashDeals: jest.Mock;
    findByBusiness: jest.Mock;
  } = {
    create: jest.fn(),
    createWithMultipart: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    updateWithMultipart: jest.fn(),
    delete: jest.fn(),
    redeemDeal: jest.fn(),
    getActiveDeals: jest.fn(),
    getFlashDeals: jest.fn(),
    findByBusiness: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DealsController],
      providers: [
        { provide: DealsService, useValue: mockDealsService },
      ],
    }).compile();

    controller = module.get<DealsController>(DealsController);
    dealsService = module.get<DealsService>(DealsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /deals', () => {
    it('should return paginated deals', async () => {
      const mockResponse = {
        total: 1,
        page: 1,
        limit: 20,
        deals: [mockDeal],
      };

      mockDealsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(1, 20);

      expect(result).toEqual(mockResponse);
      expect(mockDealsService.findAll).toHaveBeenCalledWith(1, 20);
    });

    it('should use default pagination values', async () => {
      mockDealsService.findAll.mockResolvedValue({
        total: 0,
        page: 1,
        limit: 20,
        deals: [],
      });

      await controller.findAll();

      expect(mockDealsService.findAll).toHaveBeenCalledWith(1, 20);
    });
  });

  describe('GET /deals/active', () => {
    it('should return active deals', async () => {
      const mockResponse = {
        total: 1,
        deals: [mockDeal],
      };

      mockDealsService.getActiveDeals.mockResolvedValue(mockResponse);

      const result = await controller.getActiveDeals();

      expect(result).toEqual(mockResponse);
      expect(mockDealsService.getActiveDeals).toHaveBeenCalled();
    });
  });

  describe('GET /deals/flash', () => {
    it('should return flash deals', async () => {
      const flashDeal = { ...mockDeal, is_flash_deal: true };
      const mockResponse = {
        total: 1,
        deals: [flashDeal],
      };

      mockDealsService.getFlashDeals.mockResolvedValue(mockResponse);

      const result = await controller.getFlashDeals();

      expect(result).toEqual(mockResponse);
      expect(mockDealsService.getFlashDeals).toHaveBeenCalled();
    });
  });

  describe('GET /deals/:id', () => {
    it('should return deal with bookmark status when authenticated', async () => {
      const dealWithBookmark = {
        ...mockDeal,
        isBookmarked: true,
      };

      mockDealsService.findOne.mockResolvedValue(dealWithBookmark);

      const result = await controller.findOne(mockRequest as never, mockDealId);

      expect(result).toEqual(dealWithBookmark);
      expect(mockDealsService.findOne).toHaveBeenCalledWith(
        mockDealId,
        mockUserId,
      );
    });
  });

  describe('GET /deals/business/:businessId', () => {
    it('should return deals for specific business', async () => {
      const mockResponse = {
        total: 2,
        deals: [mockDeal, { ...mockDeal, id: 'deal-456' }],
      };

      mockDealsService.findByBusiness.mockResolvedValue(mockResponse);

      const result = await controller.findByBusiness(mockBusinessId);

      expect(result).toEqual(mockResponse);
      expect(mockDealsService.findByBusiness).toHaveBeenCalledWith(mockBusinessId);
    });
  });

  describe('POST /deals/business/:businessId', () => {
    const createDealDto: CreateDealDto = {
      title: 'New Pizza Deal',
      description: 'Great deal',
      original_price: 20.00,
      discounted_price: 10.00,
      category: 'food_beverage',
      starts_at: new Date(),
      expires_at: new Date(),
    };

    it('should create a new deal', async () => {
      const mockResponse = {
        message: 'Deal created successfully',
        deal: mockDeal,
      };

      mockDealsService.create.mockResolvedValue(mockResponse);

      const result = await controller.create(
        mockRequest as never,
        mockBusinessId,
        createDealDto,
      );

      expect(result).toEqual(mockResponse);
      expect(mockDealsService.create).toHaveBeenCalledWith(
        mockUserId,
        mockBusinessId,
        createDealDto,
      );
    });
  });

  describe('POST /deals/business/:businessId/multipart', () => {
    const mockBody = {
      title: 'New Deal',
      original_price: '20.00',
      discounted_price: '10.00',
      category: 'food_beverage',
      starts_at: '2025-01-01',
      expires_at: '2025-12-31',
    };

    const mockFiles = [
      {
        fieldname: 'images',
        originalname: 'pizza.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('fake-image'),
        size: 1024,
      },
    ] as Express.Multer.File[];

    it('should create deal with multipart upload', async () => {
      const mockResponse = {
        message: 'Deal created successfully',
        deal: { ...mockDeal, images: [{ url: 'http://example.com/pizza.avif', order: 0 }] },
      };

      mockDealsService.createWithMultipart.mockResolvedValue(mockResponse);

      const result = await controller.createWithMultipart(
        mockRequest as never,
        mockBusinessId,
        mockBody,
        mockFiles,
      );

      expect(result).toEqual(mockResponse);
      expect(mockDealsService.createWithMultipart).toHaveBeenCalledWith(
        mockUserId,
        mockBusinessId,
        mockBody,
        mockFiles,
      );
    });
  });

  describe('PATCH /deals/:id', () => {
    const updateDealDto: UpdateDealDto = {
      title: 'Updated Deal Title',
      description: 'Updated description',
    };

    it('should update a deal', async () => {
      const mockResponse = {
        message: 'Deal updated successfully',
        deal: { ...mockDeal, ...updateDealDto },
      };

      mockDealsService.update.mockResolvedValue(mockResponse);

      const result = await controller.update(
        mockRequest as never,
        mockDealId,
        updateDealDto,
      );

      expect(result).toEqual(mockResponse);
      expect(mockDealsService.update).toHaveBeenCalledWith(
        mockDealId,
        mockUserId,
        updateDealDto,
      );
    });
  });

  describe('DELETE /deals/:id', () => {
    it('should delete a deal', async () => {
      const mockResponse = {
        message: 'Deal deleted successfully',
      };

      mockDealsService.delete.mockResolvedValue(mockResponse);

      const result = await controller.delete(mockRequest as never, mockDealId);

      expect(result).toEqual(mockResponse);
      expect(mockDealsService.delete).toHaveBeenCalledWith(mockDealId, mockUserId);
    });
  });

  describe('POST /deals/:id/redeem', () => {
    it('should redeem a deal', async () => {
      const mockResponse = {
        message: 'Deal redeemed successfully',
        redemption: {
          deal_id: mockDealId,
          redeemed_at: new Date(),
        },
      };

      mockDealsService.redeemDeal.mockResolvedValue(mockResponse);

      const result = await controller.redeem(mockRequest as never, mockDealId);

      expect(result).toEqual(mockResponse);
      expect(mockDealsService.redeemDeal).toHaveBeenCalledWith(
        mockDealId,
        mockUserId,
      );
    });
  });
});
