import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { RegisterDeviceTokenDto } from './dto/register-device-token.dto';
import { MarkAsReadDto } from './dto/mark-as-read.dto';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let notificationsService: NotificationsService;

  const mockUserId = 'user-123';
  const mockNotificationId = 'notification-123';
  const mockDeviceToken = 'fcm-token-12345';

  const mockUser = {
    id: mockUserId,
    sub: mockUserId,
    email: 'test@example.com',
    username: 'testuser',
  };

  const mockRequest = {
    user: mockUser,
  };

  const mockNotification = {
    id: mockNotificationId,
    user_id: mockUserId,
    type: 'new_deal',
    title: 'New Deal Available!',
    body: 'Check out this amazing deal',
    data: { deal_id: 'deal-123' },
    is_read: false,
    sent_at: new Date(),
    read_at: null,
  };

  // Type-safe mocks (2025 best practice)
  const mockNotificationsService: {
    registerDeviceToken: jest.Mock;
    deactivateDeviceToken: jest.Mock;
    getUserNotifications: jest.Mock;
    getUnreadCount: jest.Mock;
    markAsRead: jest.Mock;
    markAllAsRead: jest.Mock;
    deleteNotification: jest.Mock;
  } = {
    registerDeviceToken: jest.fn(),
    deactivateDeviceToken: jest.fn(),
    getUserNotifications: jest.fn(),
    getUnreadCount: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    deleteNotification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    notificationsService = module.get<NotificationsService>(
      NotificationsService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /notifications/device-token', () => {
    it('should register device token', async () => {
      const registerDto: RegisterDeviceTokenDto = {
        device_token: mockDeviceToken,
        device_type: 'ios',
        device_name: 'iPhone 15 Pro',
      };

      const mockResponse = {
        id: 'device-token-id',
        user_id: mockUserId,
        device_token: mockDeviceToken,
        device_type: 'ios',
        device_name: 'iPhone 15 Pro',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockNotificationsService.registerDeviceToken.mockResolvedValue(
        mockResponse,
      );

      const result = await controller.registerDeviceToken(
        mockRequest as never,
        registerDto,
      );

      expect(result).toEqual(mockResponse);
      expect(
        mockNotificationsService.registerDeviceToken,
      ).toHaveBeenCalledWith(mockUserId, registerDto);
    });
  });

  describe('DELETE /notifications/device-token/:token', () => {
    it('should deactivate device token', async () => {
      const mockResponse = { success: true };

      mockNotificationsService.deactivateDeviceToken.mockResolvedValue(
        mockResponse,
      );

      const result = await controller.deactivateDeviceToken(
        mockRequest as never,
        mockDeviceToken,
      );

      expect(result).toEqual(mockResponse);
      expect(
        mockNotificationsService.deactivateDeviceToken,
      ).toHaveBeenCalledWith(mockUserId, mockDeviceToken);
    });
  });

  describe('GET /notifications', () => {
    it('should return user notifications', async () => {
      const mockResponse = {
        notifications: [mockNotification],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      };

      mockNotificationsService.getUserNotifications.mockResolvedValue(
        mockResponse,
      );

      const result = await controller.getUserNotifications(
        mockRequest as never,
        '1',
        '20',
      );

      expect(result).toEqual(mockResponse);
      expect(
        mockNotificationsService.getUserNotifications,
      ).toHaveBeenCalledWith(mockUserId, 1, 20);
    });

    it('should use default pagination values', async () => {
      mockNotificationsService.getUserNotifications.mockResolvedValue({
        notifications: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      });

      await controller.getUserNotifications(mockRequest as never);

      expect(
        mockNotificationsService.getUserNotifications,
      ).toHaveBeenCalledWith(mockUserId, 1, 20);
    });
  });

  describe('GET /notifications/unread-count', () => {
    it('should return unread notification count', async () => {
      const unreadCount = 5;

      mockNotificationsService.getUnreadCount.mockResolvedValue(unreadCount);

      const result = await controller.getUnreadCount(mockRequest as never);

      expect(result).toEqual({ count: unreadCount });
      expect(mockNotificationsService.getUnreadCount).toHaveBeenCalledWith(
        mockUserId,
      );
    });

    it('should return zero when no unread notifications', async () => {
      mockNotificationsService.getUnreadCount.mockResolvedValue(0);

      const result = await controller.getUnreadCount(mockRequest as never);

      expect(result).toEqual({ count: 0 });
    });
  });

  describe('POST /notifications/mark-read', () => {
    it('should mark notifications as read', async () => {
      const markAsReadDto: MarkAsReadDto = {
        notification_ids: [mockNotificationId, 'notification-456'],
      };

      const mockResponse = {
        success: true,
        count: 2,
      };

      mockNotificationsService.markAsRead.mockResolvedValue(mockResponse);

      const result = await controller.markAsRead(
        mockRequest as never,
        markAsReadDto,
      );

      expect(result).toEqual(mockResponse);
      expect(mockNotificationsService.markAsRead).toHaveBeenCalledWith(
        mockUserId,
        markAsReadDto,
      );
    });
  });

  describe('POST /notifications/mark-all-read', () => {
    it('should mark all notifications as read', async () => {
      const mockResponse = {
        success: true,
        count: 10,
      };

      mockNotificationsService.markAllAsRead.mockResolvedValue(mockResponse);

      const result = await controller.markAllAsRead(mockRequest as never);

      expect(result).toEqual(mockResponse);
      expect(mockNotificationsService.markAllAsRead).toHaveBeenCalledWith(
        mockUserId,
      );
    });

    it('should return zero count when no unread notifications', async () => {
      mockNotificationsService.markAllAsRead.mockResolvedValue({
        success: true,
        count: 0,
      });

      const result = await controller.markAllAsRead(mockRequest as never);

      expect(result.count).toBe(0);
    });
  });

  describe('DELETE /notifications/:id', () => {
    it('should delete notification', async () => {
      const mockResponse = { success: true };

      mockNotificationsService.deleteNotification.mockResolvedValue(
        mockResponse,
      );

      const result = await controller.deleteNotification(
        mockRequest as never,
        mockNotificationId,
      );

      expect(result).toEqual(mockResponse);
      expect(mockNotificationsService.deleteNotification).toHaveBeenCalledWith(
        mockUserId,
        mockNotificationId,
      );
    });
  });
});
