import { Test, TestingModule } from '@nestjs/testing';
import { RedemptionsController } from './redemptions.controller';
import { RedemptionsService } from './redemptions.service';

describe('RedemptionsController', () => {
  let controller: RedemptionsController;
  let redemptionsService: RedemptionsService;

  const mockUserId = 'user-123';
  const mockDealId = 'deal-123';
  const mockRedemptionId = 'redemption-123';

  const mockRequest = {
    user: {
      id: mockUserId,
      email: 'test@example.com',
      username: 'testuser',
    },
  };

  const mockRedemption = {
    id: mockRedemptionId,
    user_id: mockUserId,
    deal_id: mockDealId,
    redeemed_at: new Date(),
    status: 'active',
    redemption_code: 'CODE123',
  };

  // Type-safe mocks (2025 best practice)
  const mockRedemptionsService: {
    redeemDeal: jest.Mock;
    getUserRedemptions: jest.Mock;
    getRedemptionDetails: jest.Mock;
  } = {
    redeemDeal: jest.fn(),
    getUserRedemptions: jest.fn(),
    getRedemptionDetails: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RedemptionsController],
      providers: [
        { provide: RedemptionsService, useValue: mockRedemptionsService },
      ],
    }).compile();

    controller = module.get<RedemptionsController>(RedemptionsController);
    redemptionsService = module.get<RedemptionsService>(RedemptionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /redemptions/:dealId', () => {
    it('should redeem a deal', async () => {
      const mockResponse = {
        message: 'Deal redeemed successfully',
        redemption: mockRedemption,
      };

      mockRedemptionsService.redeemDeal.mockResolvedValue(mockResponse);

      const result = await controller.redeemDeal(
        mockRequest as never,
        mockDealId,
      );

      expect(result).toEqual(mockResponse);
      expect(mockRedemptionsService.redeemDeal).toHaveBeenCalledWith(
        mockUserId,
        mockDealId,
      );
    });
  });

  describe('GET /redemptions', () => {
    it('should return user redemptions', async () => {
      const mockResponse = {
        redemptions: [
          {
            ...mockRedemption,
            deals: {
              id: mockDealId,
              title: '50% Off Pizza',
              businesses: {
                id: 'business-123',
                business_name: 'Test Pizza',
              },
            },
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      };

      mockRedemptionsService.getUserRedemptions.mockResolvedValue(mockResponse);

      const result = await controller.getUserRedemptions(
        mockRequest as never,
        1,
        20,
      );

      expect(result).toEqual(mockResponse);
      expect(mockRedemptionsService.getUserRedemptions).toHaveBeenCalledWith(
        mockUserId,
        1,
        20,
      );
    });

    it('should use default pagination values', async () => {
      mockRedemptionsService.getUserRedemptions.mockResolvedValue({
        redemptions: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      });

      await controller.getUserRedemptions(mockRequest as never);

      expect(mockRedemptionsService.getUserRedemptions).toHaveBeenCalledWith(
        mockUserId,
        1,
        20,
      );
    });
  });

  describe('GET /redemptions/:redemptionId', () => {
    it('should return redemption details by ID', async () => {
      const mockResponse = {
        ...mockRedemption,
        deals: {
          id: mockDealId,
          title: '50% Off Pizza',
        },
      };

      mockRedemptionsService.getRedemptionDetails.mockResolvedValue(mockResponse);

      const result = await controller.getRedemptionDetails(
        mockRequest as never,
        mockRedemptionId,
      );

      expect(result).toEqual(mockResponse);
      expect(mockRedemptionsService.getRedemptionDetails).toHaveBeenCalledWith(
        mockUserId,
        mockRedemptionId,
      );
    });
  });
});
