import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { NotificationType } from './entities/notification.entity';
import * as admin from 'firebase-admin';

// Mock Firebase Admin
jest.mock('../config/firebase.config', () => ({
  getFirebaseApp: jest.fn(),
}));

// Import after mock
import { getFirebaseApp } from '../config/firebase.config';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prismaService: PrismaService;

  const mockUserId = 'user-123';
  const mockBusinessId = 'business-123';
  const mockDealId = 'deal-123';
  const mockDeviceToken = 'mock-fcm-token-12345';

  // Type-safe mocks (2025 best practice - avoid 'any')
  const mockMessaging = {
    sendEachForMulticast: jest.fn<Promise<admin.messaging.BatchResponse>, [admin.messaging.MulticastMessage]>(),
  };

  const mockFirebaseApp = {
    messaging: jest.fn(() => mockMessaging),
  } as unknown as admin.app.App;

  const mockPrismaService: {
    device_tokens: {
      upsert: jest.Mock;
      updateMany: jest.Mock;
      findMany: jest.Mock<Promise<Array<{ user_id: string; device_token: string; device_type: string }>>, unknown[]>;
    };
    notifications: {
      create: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock<Promise<number>, unknown[]>;
      updateMany: jest.Mock;
      delete: jest.Mock;
      findFirst: jest.Mock;
    };
    deals: {
      findUnique: jest.Mock;
    };
    follows: {
      findMany: jest.Mock;
    };
    users: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
    };
  } = {
    device_tokens: {
      upsert: jest.fn(),
      updateMany: jest.fn(),
      findMany: jest.fn(),
    },
    notifications: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      findFirst: jest.fn(),
    },
    deals: {
      findUnique: jest.fn(),
    },
    follows: {
      findMany: jest.fn(),
    },
    users: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    // Mock Firebase app
    (getFirebaseApp as jest.Mock).mockReturnValue(mockFirebaseApp);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerDeviceToken', () => {
    const registerDto = {
      device_token: mockDeviceToken,
      device_type: 'ios',
      device_name: 'iPhone 14',
    };

    it('should register a new device token', async () => {
      const mockDeviceTokenRecord = {
        id: 'device-token-123',
        user_id: mockUserId,
        ...registerDto,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPrismaService.device_tokens.upsert.mockResolvedValue(mockDeviceTokenRecord);

      const result = await service.registerDeviceToken(mockUserId, registerDto);

      expect(result).toEqual(mockDeviceTokenRecord);
      expect(mockPrismaService.device_tokens.upsert).toHaveBeenCalledWith({
        where: {
          user_id_device_token: {
            user_id: mockUserId,
            device_token: registerDto.device_token,
          },
        },
        update: expect.objectContaining({
          device_type: registerDto.device_type,
          device_name: registerDto.device_name,
          is_active: true,
        }),
        create: expect.objectContaining({
          user_id: mockUserId,
          device_token: registerDto.device_token,
          device_type: registerDto.device_type,
          device_name: registerDto.device_name,
          is_active: true,
        }),
      });
    });

    it('should update existing device token', async () => {
      const updatedDeviceToken = {
        id: 'device-token-123',
        user_id: mockUserId,
        device_token: mockDeviceToken,
        device_type: 'android', // Changed from iOS
        device_name: 'Pixel 7',
        is_active: true,
        created_at: new Date('2024-01-01'),
        updated_at: new Date(),
      };

      mockPrismaService.device_tokens.upsert.mockResolvedValue(updatedDeviceToken);

      const updateDto = {
        device_token: mockDeviceToken,
        device_type: 'android',
        device_name: 'Pixel 7',
      };

      const result = await service.registerDeviceToken(mockUserId, updateDto);

      expect(result.device_type).toBe('android');
    });
  });

  describe('deactivateDeviceToken', () => {
    it('should deactivate device token', async () => {
      mockPrismaService.device_tokens.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.deactivateDeviceToken(mockUserId, mockDeviceToken);

      expect(result).toEqual({ success: true });
      expect(mockPrismaService.device_tokens.updateMany).toHaveBeenCalledWith({
        where: {
          user_id: mockUserId,
          device_token: mockDeviceToken,
        },
        data: {
          is_active: false,
          updated_at: expect.any(Date),
        },
      });
    });
  });

  describe('sendNotification', () => {
    const sendNotificationDto = {
      user_ids: [mockUserId, 'user-456'],
      type: NotificationType.NEW_DEAL,
      title: 'New Deal Available!',
      body: '50% off pizza today',
      data: { deal_id: mockDealId },
      image_url: 'http://example.com/pizza.jpg',
      action_url: `/deals/${mockDealId}`,
    };

    it('should create notification records for all users', async () => {
      const mockNotification = {
        id: 'notif-123',
        user_id: mockUserId,
        type: sendNotificationDto.type,
        title: sendNotificationDto.title,
        body: sendNotificationDto.body,
        data: sendNotificationDto.data,
        image_url: sendNotificationDto.image_url,
        action_url: sendNotificationDto.action_url,
        is_read: false,
        sent_at: new Date(),
      };

      mockPrismaService.notifications.create.mockResolvedValue(mockNotification);
      mockPrismaService.device_tokens.findMany.mockResolvedValue([]);

      const result = await service.sendNotification(sendNotificationDto);

      expect(result).toHaveLength(2); // One for each user
      expect(mockPrismaService.notifications.create).toHaveBeenCalledTimes(2);
    });

    it('should send FCM push notifications to device tokens', async () => {
      const deviceTokens = [
        {
          user_id: mockUserId,
          device_token: 'token-1',
          device_type: 'ios',
        },
        {
          user_id: 'user-456',
          device_token: 'token-2',
          device_type: 'android',
        },
      ];

      mockPrismaService.notifications.create.mockResolvedValue({} as never);
      mockPrismaService.device_tokens.findMany.mockResolvedValue(deviceTokens);
      mockMessaging.sendEachForMulticast.mockResolvedValue({
        successCount: 2,
        failureCount: 0,
        responses: [
          { success: true, messageId: 'msg-1' },
          { success: true, messageId: 'msg-2' },
        ],
      } as admin.messaging.BatchResponse);

      await service.sendNotification(sendNotificationDto);

      expect(mockMessaging.sendEachForMulticast).toHaveBeenCalledWith(
        expect.objectContaining({
          tokens: ['token-1', 'token-2'],
          notification: expect.objectContaining({
            title: sendNotificationDto.title,
            body: sendNotificationDto.body,
            imageUrl: sendNotificationDto.image_url,
          }),
          data: expect.objectContaining({
            type: sendNotificationDto.type,
            action_url: sendNotificationDto.action_url,
          }),
        }),
      );
    });

    it('should handle FCM failures gracefully', async () => {
      mockPrismaService.notifications.create.mockResolvedValue({} as never);
      mockPrismaService.device_tokens.findMany.mockResolvedValue([
        { user_id: mockUserId, device_token: 'invalid-token', device_type: 'ios' },
      ]);
      mockMessaging.sendEachForMulticast.mockResolvedValue({
        successCount: 0,
        failureCount: 1,
        responses: [
          {
            success: false,
            error: {
              code: 'messaging/invalid-registration-token',
            } as admin.messaging.MessagingError,
          },
        ],
      } as admin.messaging.BatchResponse);

      // Should not throw even if FCM fails
      await expect(
        service.sendNotification(sendNotificationDto),
      ).resolves.not.toThrow();

      // Should deactivate invalid token
      expect(mockPrismaService.device_tokens.updateMany).toHaveBeenCalledWith({
        where: {
          device_token: { in: ['invalid-token'] },
        },
        data: {
          is_active: false,
          updated_at: expect.any(Date),
        },
      });
    });

    it('should skip FCM if Firebase is not configured', async () => {
      // Mock Firebase as not configured
      (getFirebaseApp as jest.Mock).mockReturnValueOnce(null);

      // Recreate service with no Firebase
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          NotificationsService,
          { provide: PrismaService, useValue: mockPrismaService },
        ],
      }).compile();

      const serviceWithoutFirebase = module.get<NotificationsService>(NotificationsService);

      mockPrismaService.notifications.create.mockResolvedValue({} as never);

      await serviceWithoutFirebase.sendNotification(sendNotificationDto);

      // Should create database records but not send FCM
      expect(mockPrismaService.notifications.create).toHaveBeenCalled();
      expect(mockMessaging.sendEachForMulticast).not.toHaveBeenCalled();
    });
  });

  describe('sendNewDealNotification', () => {
    const mockDeal = {
      id: mockDealId,
      title: 'Pizza Special',
      discount_percentage: 50,
      is_flash_deal: false,
      visibility_radius_km: 10,
      images: [{ url: 'http://example.com/pizza.jpg' }],
      businesses: {
        id: mockBusinessId,
        business_name: 'Pizza Palace',
        owner_id: 'owner-123',
        location: { lat: 40.7128, lng: -74.0060 },
      },
    };

    it('should send notifications to followers', async () => {
      const followers = [
        { user_id: 'follower-1' },
        { user_id: 'follower-2' },
      ];

      mockPrismaService.deals.findUnique.mockResolvedValue(mockDeal as never);
      mockPrismaService.follows.findMany.mockResolvedValue(followers as never);
      mockPrismaService.users.findMany.mockResolvedValue([]);
      mockPrismaService.notifications.create.mockResolvedValue({} as never);
      mockPrismaService.device_tokens.findMany.mockResolvedValue([]);

      await service.sendNewDealNotification(mockDealId, mockBusinessId);

      // Should send to both followers
      expect(mockPrismaService.notifications.create).toHaveBeenCalledTimes(2);
    });

    it('should send notifications to nearby users', async () => {
      const nearbyUsers = [
        {
          id: 'nearby-user-1',
          default_location: { lat: 40.7200, lng: -74.0100 }, // ~1km away
          default_radius_km: 5,
        },
        {
          id: 'nearby-user-2',
          default_location: { lat: 40.7300, lng: -74.0200 }, // ~2km away
          default_radius_km: 5,
        },
      ];

      mockPrismaService.deals.findUnique.mockResolvedValue(mockDeal as never);
      mockPrismaService.follows.findMany.mockResolvedValue([]);
      mockPrismaService.users.findMany.mockResolvedValue(nearbyUsers as never);
      mockPrismaService.notifications.create.mockResolvedValue({} as never);
      mockPrismaService.device_tokens.findMany.mockResolvedValue([]);

      await service.sendNewDealNotification(mockDealId, mockBusinessId);

      // Should send to nearby users
      expect(mockPrismaService.notifications.create).toHaveBeenCalled();
    });

    it('should not send to business owner', async () => {
      const followers = [
        { user_id: 'owner-123' }, // Business owner
        { user_id: 'follower-1' },
      ];

      mockPrismaService.deals.findUnique.mockResolvedValue(mockDeal as never);
      mockPrismaService.follows.findMany.mockResolvedValue(followers as never);
      mockPrismaService.users.findMany.mockResolvedValue([]);
      mockPrismaService.notifications.create.mockResolvedValue({} as never);
      mockPrismaService.device_tokens.findMany.mockResolvedValue([]);

      await service.sendNewDealNotification(mockDealId, mockBusinessId);

      // Should only send to follower-1, not owner-123
      expect(mockPrismaService.notifications.create).toHaveBeenCalledTimes(1);
    });

    it('should use flash deal notification type for flash deals', async () => {
      const flashDeal = {
        ...mockDeal,
        is_flash_deal: true,
      };

      mockPrismaService.deals.findUnique.mockResolvedValue(flashDeal as never);
      mockPrismaService.follows.findMany.mockResolvedValue([{ user_id: 'user-1' }] as never);
      mockPrismaService.users.findMany.mockResolvedValue([]);
      mockPrismaService.notifications.create.mockResolvedValue({} as never);
      mockPrismaService.device_tokens.findMany.mockResolvedValue([]);

      await service.sendNewDealNotification(mockDealId, mockBusinessId);

      expect(mockPrismaService.notifications.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: NotificationType.FLASH_DEAL,
          title: expect.stringContaining('⚡ Flash Deal'),
        }),
      });
    });

    it('should throw NotFoundException if deal not found', async () => {
      mockPrismaService.deals.findUnique.mockResolvedValue(null);

      await expect(
        service.sendNewDealNotification(mockDealId, mockBusinessId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserNotifications', () => {
    it('should return paginated notifications', async () => {
      const mockNotifications = [
        {
          id: 'notif-1',
          user_id: mockUserId,
          type: NotificationType.NEW_DEAL,
          title: 'New Deal',
          body: 'Check it out',
          data: {},
          is_read: false,
          sent_at: new Date(),
        },
      ];

      mockPrismaService.notifications.findMany.mockResolvedValue(mockNotifications as never);
      mockPrismaService.notifications.count.mockResolvedValue(1);

      const result = await service.getUserNotifications(mockUserId, 1, 20);

      expect(result.notifications).toEqual(mockNotifications);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      });
    });
  });

  describe('getUnreadCount', () => {
    it('should return count of unread notifications', async () => {
      mockPrismaService.notifications.count.mockResolvedValue(5);

      const count = await service.getUnreadCount(mockUserId);

      expect(count).toBe(5);
      expect(mockPrismaService.notifications.count).toHaveBeenCalledWith({
        where: {
          user_id: mockUserId,
          is_read: false,
        },
      });
    });
  });

  describe('markAsRead', () => {
    it('should mark specific notifications as read', async () => {
      const notificationIds = ['notif-1', 'notif-2'];
      mockPrismaService.notifications.updateMany.mockResolvedValue({ count: 2 });

      const result = await service.markAsRead(mockUserId, { notification_ids: notificationIds });

      expect(result).toEqual({ success: true, count: 2 });
      expect(mockPrismaService.notifications.updateMany).toHaveBeenCalledWith({
        where: {
          id: { in: notificationIds },
          user_id: mockUserId,
        },
        data: {
          is_read: true,
          read_at: expect.any(Date),
        },
      });
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all unread notifications as read', async () => {
      mockPrismaService.notifications.updateMany.mockResolvedValue({ count: 10 });

      const result = await service.markAllAsRead(mockUserId);

      expect(result).toEqual({ success: true, count: 10 });
      expect(mockPrismaService.notifications.updateMany).toHaveBeenCalledWith({
        where: {
          user_id: mockUserId,
          is_read: false,
        },
        data: {
          is_read: true,
          read_at: expect.any(Date),
        },
      });
    });
  });

  describe('deleteNotification', () => {
    it('should delete notification owned by user', async () => {
      const mockNotification = {
        id: 'notif-123',
        user_id: mockUserId,
        type: NotificationType.NEW_DEAL,
        title: 'Test',
        body: 'Test',
        data: {},
        is_read: false,
        sent_at: new Date(),
      };

      mockPrismaService.notifications.findFirst.mockResolvedValue(mockNotification as never);
      mockPrismaService.notifications.delete.mockResolvedValue(mockNotification as never);

      const result = await service.deleteNotification(mockUserId, 'notif-123');

      expect(result).toEqual({ success: true });
      expect(mockPrismaService.notifications.delete).toHaveBeenCalledWith({
        where: { id: 'notif-123' },
      });
    });

    it('should throw NotFoundException if notification not found', async () => {
      mockPrismaService.notifications.findFirst.mockResolvedValue(null);

      await expect(
        service.deleteNotification(mockUserId, 'notif-999'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
