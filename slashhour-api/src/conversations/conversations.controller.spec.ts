import { Test, TestingModule } from '@nestjs/testing';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';

describe('ConversationsController', () => {
  let controller: ConversationsController;
  let conversationsService: ConversationsService;

  const mockUserId = 'user-123';
  const mockBusinessId = 'business-123';
  const mockConversationId = 'conversation-123';

  const mockRequest = {
    user: {
      id: mockUserId,
      email: 'test@example.com',
      username: 'testuser',
    },
  };

  const mockConversation = {
    id: mockConversationId,
    businessId: mockBusinessId,
    customerId: mockUserId,
    lastMessageAt: new Date(),
    lastMessageText: 'Hello',
    unreadCount: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    business: {
      id: mockBusinessId,
      businessName: 'Test Pizza',
      logoUrl: 'logo.avif',
      category: 'food_beverage',
    },
    customer: {
      id: mockUserId,
      username: 'testuser',
      name: 'Test User',
      avatarUrl: 'avatar.jpg',
    },
  };

  const mockMessage = {
    id: 'message-123',
    conversationId: mockConversationId,
    senderId: mockUserId,
    messageText: 'Hello!',
    messageType: 'text',
    isRead: false,
    readAt: null,
    createdAt: new Date(),
    sender: {
      id: mockUserId,
      username: 'testuser',
      name: 'Test User',
      avatarUrl: 'avatar.jpg',
    },
  };

  const mockConversationsService = {
    getUserConversations: jest.fn(),
    findOrCreateConversation: jest.fn(),
    getConversation: jest.fn(),
    getMessages: jest.fn(),
    markMessagesAsRead: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConversationsController],
      providers: [
        { provide: ConversationsService, useValue: mockConversationsService },
      ],
    }).compile();

    controller = module.get<ConversationsController>(ConversationsController);
    conversationsService = module.get<ConversationsService>(
      ConversationsService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /conversations', () => {
    it('should return user conversations', async () => {
      mockConversationsService.getUserConversations.mockResolvedValue([
        mockConversation,
      ]);

      const result = await controller.getUserConversations(mockRequest as never);

      expect(result.success).toBe(true);
      expect(result.conversations).toHaveLength(1);
      expect(mockConversationsService.getUserConversations).toHaveBeenCalledWith(
        mockUserId,
      );
    });

    it('should return empty array if no conversations', async () => {
      mockConversationsService.getUserConversations.mockResolvedValue([]);

      const result = await controller.getUserConversations(mockRequest as never);

      expect(result.success).toBe(true);
      expect(result.conversations).toHaveLength(0);
    });
  });

  describe('POST /conversations', () => {
    it('should create or get conversation', async () => {
      const createDto = { business_id: mockBusinessId };

      mockConversationsService.findOrCreateConversation.mockResolvedValue(
        mockConversation,
      );

      const result = await controller.createConversation(
        mockRequest as never,
        createDto,
      );

      expect(result.success).toBe(true);
      expect(result.conversation).toEqual(mockConversation);
      expect(result.message).toBe(
        'Conversation created or retrieved successfully',
      );
      expect(
        mockConversationsService.findOrCreateConversation,
      ).toHaveBeenCalledWith(mockUserId, mockBusinessId);
    });
  });

  describe('GET /conversations/:id', () => {
    it('should return specific conversation', async () => {
      mockConversationsService.getConversation.mockResolvedValue(
        mockConversation,
      );

      const result = await controller.getConversation(
        mockRequest as never,
        mockConversationId,
      );

      expect(result.success).toBe(true);
      expect(result.conversation).toEqual(mockConversation);
      expect(mockConversationsService.getConversation).toHaveBeenCalledWith(
        mockConversationId,
        mockUserId,
      );
    });
  });

  describe('GET /conversations/:id/messages', () => {
    it('should return paginated messages', async () => {
      mockConversationsService.getMessages.mockResolvedValue({
        messages: [mockMessage],
        total: 10,
      });

      const result = await controller.getMessages(
        mockRequest as never,
        mockConversationId,
      );

      expect(result.success).toBe(true);
      expect(result.messages).toHaveLength(1);
      expect(result.total).toBe(10);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(50);
      expect(mockConversationsService.getMessages).toHaveBeenCalledWith(
        mockConversationId,
        mockUserId,
        1,
        50,
      );
    });

    it('should handle custom pagination', async () => {
      mockConversationsService.getMessages.mockResolvedValue({
        messages: [mockMessage],
        total: 100,
      });

      const result = await controller.getMessages(
        mockRequest as never,
        mockConversationId,
        '2',
        '20',
      );

      expect(result.page).toBe(2);
      expect(result.limit).toBe(20);
      expect(mockConversationsService.getMessages).toHaveBeenCalledWith(
        mockConversationId,
        mockUserId,
        2,
        20,
      );
    });

    it('should use default pagination values', async () => {
      mockConversationsService.getMessages.mockResolvedValue({
        messages: [],
        total: 0,
      });

      await controller.getMessages(mockRequest as never, mockConversationId);

      expect(mockConversationsService.getMessages).toHaveBeenCalledWith(
        mockConversationId,
        mockUserId,
        1,
        50,
      );
    });
  });

  describe('POST /conversations/:id/read', () => {
    it('should mark messages as read', async () => {
      mockConversationsService.markMessagesAsRead.mockResolvedValue(undefined);

      const result = await controller.markAsRead(
        mockRequest as never,
        mockConversationId,
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Messages marked as read');
      expect(
        mockConversationsService.markMessagesAsRead,
      ).toHaveBeenCalledWith(mockConversationId, mockUserId);
    });
  });
});
