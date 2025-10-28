import { Test, TestingModule } from '@nestjs/testing';
import { RedemptionsService } from './redemptions.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('RedemptionsService - Critical Paths', () => {
  let service: RedemptionsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    deals: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    users: {
      findUnique: jest.fn(),
    },
    user_redemptions: {
      create: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedemptionsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<RedemptionsService>(RedemptionsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('redeemDeal', () => {
    const userId = 'user-123';
    const dealId = 'deal-456';
    const activeDeal = {
      id: dealId,
      title: 'Test Deal',
      business_id: 'business-789',
      status: 'active',
      original_price: 100,
      discounted_price: 50,
      expires_at: new Date(Date.now() + 86400000), // Tomorrow
      starts_at: new Date(Date.now() - 86400000), // Yesterday
      quantity_available: 10,
      quantity_redeemed: 5,
      max_per_user: 2,
      category: 'restaurant',
      businesses: {
        id: 'business-789',
        business_name: 'Test Business',
      },
    };

    it('should successfully redeem a valid deal', async () => {
      const user = { id: userId };

      mockPrismaService.deals.findUnique.mockResolvedValue(activeDeal);
      mockPrismaService.users.findUnique.mockResolvedValue(user);
      mockPrismaService.user_redemptions.count.mockResolvedValue(0); // No previous redemptions
      mockPrismaService.user_redemptions.create.mockResolvedValue({
        id: 'redemption-123',
        user_id: userId,
        deal_id: dealId,
        business_id: activeDeal.business_id,
        original_price: activeDeal.original_price,
        paid_price: activeDeal.discounted_price,
        savings_amount: 50,
        deal_category: activeDeal.category,
        redeemed_at: new Date(),
      });

      const result = await service.redeemDeal(userId, dealId);

      expect(result).toHaveProperty('redemption');
      expect(result).toHaveProperty('redemptionCode');
      expect(result.redemption.savings_amount).toBe(50);
      expect(mockPrismaService.deals.update).toHaveBeenCalledWith({
        where: { id: dealId },
        data: { quantity_redeemed: activeDeal.quantity_redeemed + 1 },
      });
    });

    it('should throw error for non-existent deal', async () => {
      mockPrismaService.deals.findUnique.mockResolvedValue(null);

      await expect(service.redeemDeal(userId, dealId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.redeemDeal(userId, dealId)).rejects.toThrow(
        'Deal not found',
      );
    });

    it('should throw error for inactive deal', async () => {
      const inactiveDeal = { ...activeDeal, status: 'expired' };
      mockPrismaService.deals.findUnique.mockResolvedValue(inactiveDeal);

      await expect(service.redeemDeal(userId, dealId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.redeemDeal(userId, dealId)).rejects.toThrow(
        'Deal is not active',
      );
    });

    it('should throw error for expired deal', async () => {
      const expiredDeal = {
        ...activeDeal,
        expires_at: new Date(Date.now() - 86400000), // Yesterday
      };
      mockPrismaService.deals.findUnique.mockResolvedValue(expiredDeal);

      await expect(service.redeemDeal(userId, dealId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.redeemDeal(userId, dealId)).rejects.toThrow(
        'Deal has expired',
      );
    });

    it('should throw error for deal that has not started yet', async () => {
      const futureDeal = {
        ...activeDeal,
        starts_at: new Date(Date.now() + 86400000), // Tomorrow
      };
      mockPrismaService.deals.findUnique.mockResolvedValue(futureDeal);

      await expect(service.redeemDeal(userId, dealId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.redeemDeal(userId, dealId)).rejects.toThrow(
        'Deal has not started yet',
      );
    });

    it('should throw error when deal is sold out', async () => {
      const soldOutDeal = {
        ...activeDeal,
        quantity_available: 10,
        quantity_redeemed: 10, // All sold out
      };
      mockPrismaService.deals.findUnique.mockResolvedValue(soldOutDeal);

      await expect(service.redeemDeal(userId, dealId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.redeemDeal(userId, dealId)).rejects.toThrow(
        'Deal sold out',
      );
    });

    it('should throw error when user has reached max redemptions', async () => {
      const user = { id: userId };

      mockPrismaService.deals.findUnique.mockResolvedValue(activeDeal);
      mockPrismaService.users.findUnique.mockResolvedValue(user);
      mockPrismaService.user_redemptions.count.mockResolvedValue(2); // Already redeemed max_per_user times

      await expect(service.redeemDeal(userId, dealId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.redeemDeal(userId, dealId)).rejects.toThrow(
        'You can only redeem this deal 2 time(s)',
      );
    });

    it('should throw error for non-existent user', async () => {
      mockPrismaService.deals.findUnique.mockResolvedValue(activeDeal);
      mockPrismaService.users.findUnique.mockResolvedValue(null);

      await expect(service.redeemDeal(userId, dealId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.redeemDeal(userId, dealId)).rejects.toThrow(
        'User not found',
      );
    });

    it('should calculate savings amount correctly', async () => {
      const user = { id: userId };

      mockPrismaService.deals.findUnique.mockResolvedValue(activeDeal);
      mockPrismaService.users.findUnique.mockResolvedValue(user);
      mockPrismaService.user_redemptions.count.mockResolvedValue(0);
      mockPrismaService.user_redemptions.create.mockResolvedValue({
        id: 'redemption-123',
        savings_amount: 50, // 100 - 50
      });

      const result = await service.redeemDeal(userId, dealId);

      const createCall = mockPrismaService.user_redemptions.create.mock.calls[0][0];
      expect(createCall.data.savings_amount).toBe(50);
      expect(createCall.data.original_price).toEqual(activeDeal.original_price);
      expect(createCall.data.paid_price).toEqual(activeDeal.discounted_price);
    });
  });

  describe('getUserRedemptions', () => {
    it('should return paginated user redemptions', async () => {
      const userId = 'user-123';
      const redemptions = [
        {
          id: 'redemption-1',
          user_id: userId,
          deal_id: 'deal-1',
          business_id: 'business-1',
          original_price: 100,
          paid_price: 50,
          savings_amount: 50,
          deal_category: 'restaurant',
          redeemed_at: new Date(),
          deals: {
            id: 'deal-1',
            title: 'Deal 1',
            description: 'Test Deal',
            category: 'restaurant',
            images: [],
          },
          businesses: {
            id: 'business-1',
            business_name: 'Business 1',
            category: 'restaurant',
            address: '123 Test St',
            city: 'Test City',
            country: 'US',
          },
          users: {
            id: userId,
            username: 'testuser',
          },
        },
      ];

      mockPrismaService.user_redemptions.findMany.mockResolvedValue(redemptions);
      mockPrismaService.user_redemptions.count.mockResolvedValue(1);

      const result = await service.getUserRedemptions(userId, 1, 20);

      expect(result).toHaveProperty('redemptions');
      expect(result).toHaveProperty('pagination');
      expect(result.redemptions).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.hasMore).toBe(false);
    });

    it('should handle pagination correctly', async () => {
      const userId = 'user-123';

      mockPrismaService.user_redemptions.findMany.mockResolvedValue([]);
      mockPrismaService.user_redemptions.count.mockResolvedValue(50);

      const result = await service.getUserRedemptions(userId, 2, 20);

      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(20);
      expect(result.pagination.total).toBe(50);
      expect(result.pagination.totalPages).toBe(3);
      expect(result.pagination.hasMore).toBe(true);
    });
  });

  describe('getRedemptionDetails', () => {
    it('should return redemption details for valid redemption', async () => {
      const userId = 'user-123';
      const redemptionId = 'redemption-456';
      const redemption = {
        id: redemptionId,
        user_id: userId,
        deal_id: 'deal-1',
        business_id: 'business-1',
        original_price: 100,
        paid_price: 50,
        savings_amount: 50,
        deals: {},
        businesses: {},
        users: {},
      };

      mockPrismaService.user_redemptions.findFirst.mockResolvedValue(redemption);

      const result = await service.getRedemptionDetails(userId, redemptionId);

      expect(result).toEqual(redemption);
      expect(mockPrismaService.user_redemptions.findFirst).toHaveBeenCalledWith({
        where: { id: redemptionId, user_id: userId },
        include: expect.any(Object),
      });
    });

    it('should throw error for non-existent redemption', async () => {
      const userId = 'user-123';
      const redemptionId = 'non-existent';

      mockPrismaService.user_redemptions.findFirst.mockResolvedValue(null);

      await expect(
        service.getRedemptionDetails(userId, redemptionId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.getRedemptionDetails(userId, redemptionId),
      ).rejects.toThrow('Redemption not found');
    });

    it('should not return redemption that belongs to different user', async () => {
      const userId = 'user-123';
      const otherUserId = 'user-456';
      const redemptionId = 'redemption-789';

      mockPrismaService.user_redemptions.findFirst.mockResolvedValue(null);

      await expect(
        service.getRedemptionDetails(userId, redemptionId),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
