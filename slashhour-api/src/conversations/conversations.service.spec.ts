import { Test, TestingModule } from '@nestjs/testing';
import { ConversationsService } from './conversations.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('ConversationsService', () => {
  let service: ConversationsService;
  let prismaService: PrismaService;

  const mockCustomerId = 'customer-123';
  const mockBusinessId = 'business-123';
  const mockOwnerId = 'owner-123';
  const mockConversationId = 'conversation-123';
  const mockMessageId = 'message-123';

  const mockBusiness = {
    id: mockBusinessId,
    owner_id: mockOwnerId,
    business_name: 'Test Pizza',
    logo_url: 'logo.avif',
    category: 'food_beverage',
  };

  const mockCustomer = {
    id: mockCustomerId,
    username: 'customer',
    name: 'Customer Name',
    avatar_url: 'avatar.jpg',
  };

  const mockConversation = {
    id: mockConversationId,
    business_id: mockBusinessId,
    customer_id: mockCustomerId,
    last_message_at: new Date(),
    last_message_text: 'Hello',
    unread_count: 1,
    created_at: new Date(),
    updated_at: new Date(),
    businesses: mockBusiness,
    users: mockCustomer,
  };

  const mockMessage = {
    id: mockMessageId,
    conversation_id: mockConversationId,
    sender_id: mockCustomerId,
    message_text: 'Hello!',
    message_type: 'text',
    is_read: false,
    read_at: null,
    created_at: new Date(),
    users: mockCustomer,
  };

  const mockPrismaService = {
    conversations: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    messages: {
      findMany: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ConversationsService>(ConversationsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findOrCreateConversation', () => {
    it('should return existing conversation if found', async () => {
      mockPrismaService.conversations.findFirst.mockResolvedValue(
        mockConversation,
      );

      const result = await service.findOrCreateConversation(
        mockCustomerId,
        mockBusinessId,
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(mockConversationId);
      expect(mockPrismaService.conversations.findFirst).toHaveBeenCalledWith({
        where: {
          customer_id: mockCustomerId,
          business_id: mockBusinessId,
        },
        include: {
          businesses: true,
          users: true,
        },
      });
      expect(mockPrismaService.conversations.create).not.toHaveBeenCalled();
    });

    it('should create new conversation if not found', async () => {
      mockPrismaService.conversations.findFirst.mockResolvedValue(null);
      mockPrismaService.conversations.create.mockResolvedValue(
        mockConversation,
      );

      const result = await service.findOrCreateConversation(
        mockCustomerId,
        mockBusinessId,
      );

      expect(result).toBeDefined();
      expect(mockPrismaService.conversations.create).toHaveBeenCalledWith({
        data: {
          customer_id: mockCustomerId,
          business_id: mockBusinessId,
          unread_count: 0,
        },
        include: {
          businesses: true,
          users: true,
        },
      });
    });

    it('should transform conversation to camelCase', async () => {
      mockPrismaService.conversations.findFirst.mockResolvedValue(
        mockConversation,
      );

      const result = await service.findOrCreateConversation(
        mockCustomerId,
        mockBusinessId,
      );

      expect(result).toHaveProperty('businessId');
      expect(result).toHaveProperty('customerId');
      expect(result).toHaveProperty('lastMessageAt');
      expect(result).toHaveProperty('lastMessageText');
      expect(result).toHaveProperty('unreadCount');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });

    it('should throw NotFoundException if conversation creation fails', async () => {
      mockPrismaService.conversations.findFirst.mockResolvedValue(null);
      mockPrismaService.conversations.create.mockResolvedValue(null);

      await expect(
        service.findOrCreateConversation(mockCustomerId, mockBusinessId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserConversations', () => {
    it('should return user conversations as customer', async () => {
      mockPrismaService.conversations.findMany.mockResolvedValue([
        mockConversation,
      ]);

      const result = await service.getUserConversations(mockCustomerId);

      expect(result).toHaveLength(1);
      expect(mockPrismaService.conversations.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { customer_id: mockCustomerId },
            { businesses: { owner_id: mockCustomerId } },
          ],
        },
        include: {
          businesses: true,
          users: true,
        },
        orderBy: [{ last_message_at: 'desc' }, { created_at: 'desc' }],
      });
    });

    it('should return user conversations as business owner', async () => {
      mockPrismaService.conversations.findMany.mockResolvedValue([
        mockConversation,
      ]);

      const result = await service.getUserConversations(mockOwnerId);

      expect(result).toHaveLength(1);
    });

    it('should return empty array if no conversations', async () => {
      mockPrismaService.conversations.findMany.mockResolvedValue([]);

      const result = await service.getUserConversations(mockCustomerId);

      expect(result).toHaveLength(0);
    });

    it('should transform conversations to camelCase', async () => {
      mockPrismaService.conversations.findMany.mockResolvedValue([
        mockConversation,
      ]);

      const result = await service.getUserConversations(mockCustomerId);

      expect(result[0]).toHaveProperty('businessId');
      expect(result[0]).toHaveProperty('customerId');
    });
  });

  describe('getConversation', () => {
    beforeEach(() => {
      mockPrismaService.conversations.findUnique.mockResolvedValue({
        ...mockConversation,
        businesses: { ...mockBusiness, users: { id: mockOwnerId } },
      });
    });

    it('should return conversation for customer', async () => {
      const result = await service.getConversation(
        mockConversationId,
        mockCustomerId,
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(mockConversationId);
    });

    it('should return conversation for business owner', async () => {
      const result = await service.getConversation(
        mockConversationId,
        mockOwnerId,
      );

      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if conversation not found', async () => {
      mockPrismaService.conversations.findUnique.mockResolvedValue(null);

      await expect(
        service.getConversation(mockConversationId, mockCustomerId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.getConversation(mockConversationId, mockCustomerId),
      ).rejects.toThrow('Conversation not found');
    });

    it('should throw ForbiddenException if user not part of conversation', async () => {
      await expect(
        service.getConversation(mockConversationId, 'other-user-123'),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.getConversation(mockConversationId, 'other-user-123'),
      ).rejects.toThrow('You do not have access to this conversation');
    });
  });

  describe('getMessages', () => {
    beforeEach(() => {
      mockPrismaService.conversations.findUnique.mockResolvedValue({
        ...mockConversation,
        businesses: { ...mockBusiness, users: { id: mockOwnerId } },
      });
      mockPrismaService.messages.findMany.mockResolvedValue([mockMessage]);
      mockPrismaService.messages.count.mockResolvedValue(10);
    });

    it('should return paginated messages', async () => {
      const result = await service.getMessages(
        mockConversationId,
        mockCustomerId,
        1,
        50,
      );

      expect(result.messages).toHaveLength(1);
      expect(result.total).toBe(10);
      expect(mockPrismaService.messages.findMany).toHaveBeenCalledWith({
        where: { conversation_id: mockConversationId },
        include: { users: true },
        orderBy: { created_at: 'desc' },
        skip: 0,
        take: 50,
      });
    });

    it('should handle pagination correctly', async () => {
      await service.getMessages(mockConversationId, mockCustomerId, 2, 20);

      expect(mockPrismaService.messages.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 20,
        }),
      );
    });

    it('should verify user access before returning messages', async () => {
      mockPrismaService.conversations.findUnique.mockResolvedValue(null);

      await expect(
        service.getMessages(mockConversationId, 'other-user'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should transform messages to camelCase', async () => {
      const result = await service.getMessages(
        mockConversationId,
        mockCustomerId,
      );

      expect(result.messages[0]).toHaveProperty('conversationId');
      expect(result.messages[0]).toHaveProperty('senderId');
      expect(result.messages[0]).toHaveProperty('messageText');
      expect(result.messages[0]).toHaveProperty('messageType');
      expect(result.messages[0]).toHaveProperty('isRead');
      expect(result.messages[0]).toHaveProperty('readAt');
    });
  });

  describe('sendMessage', () => {
    beforeEach(() => {
      mockPrismaService.conversations.findUnique.mockResolvedValue({
        ...mockConversation,
        businesses: { ...mockBusiness, users: { id: mockOwnerId } },
      });
      mockPrismaService.messages.create.mockResolvedValue(mockMessage);
      mockPrismaService.conversations.update.mockResolvedValue(
        mockConversation,
      );
    });

    it('should send a message successfully', async () => {
      const result = await service.sendMessage(
        mockConversationId,
        mockCustomerId,
        'Hello!',
      );

      expect(result).toBeDefined();
      expect(mockPrismaService.messages.create).toHaveBeenCalledWith({
        data: {
          conversation_id: mockConversationId,
          sender_id: mockCustomerId,
          message_text: 'Hello!',
          message_type: 'text',
          is_read: false,
        },
        include: { users: true },
      });
    });

    it('should use custom message type', async () => {
      await service.sendMessage(
        mockConversationId,
        mockCustomerId,
        'image.jpg',
        'image',
      );

      expect(mockPrismaService.messages.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            message_type: 'image',
          }),
        }),
      );
    });

    it('should update conversation last message', async () => {
      await service.sendMessage(
        mockConversationId,
        mockCustomerId,
        'Hello!',
      );

      expect(mockPrismaService.conversations.update).toHaveBeenCalledWith({
        where: { id: mockConversationId },
        data: {
          last_message_at: expect.any(Date),
          last_message_text: 'Hello!',
        },
      });
    });

    it('should increment unread count for business when customer sends', async () => {
      await service.sendMessage(
        mockConversationId,
        mockCustomerId,
        'Hello!',
      );

      expect(mockPrismaService.conversations.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockConversationId },
          data: expect.objectContaining({
            unread_count: { increment: 1 },
          }),
        }),
      );
    });

    it('should verify user access before sending', async () => {
      mockPrismaService.conversations.findUnique.mockResolvedValue(null);

      await expect(
        service.sendMessage(mockConversationId, 'other-user', 'Hello'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should transform message to camelCase', async () => {
      const result = await service.sendMessage(
        mockConversationId,
        mockCustomerId,
        'Hello!',
      );

      expect(result).toHaveProperty('conversationId');
      expect(result).toHaveProperty('senderId');
      expect(result).toHaveProperty('messageText');
    });
  });

  describe('markMessagesAsRead', () => {
    beforeEach(() => {
      mockPrismaService.conversations.findUnique.mockResolvedValue({
        ...mockConversation,
        businesses: { ...mockBusiness, users: { id: mockOwnerId } },
      });
      mockPrismaService.messages.updateMany.mockResolvedValue({ count: 3 });
      mockPrismaService.conversations.update.mockResolvedValue(
        mockConversation,
      );
    });

    it('should mark messages as read', async () => {
      await service.markMessagesAsRead(mockConversationId, mockCustomerId);

      expect(mockPrismaService.messages.updateMany).toHaveBeenCalledWith({
        where: {
          conversation_id: mockConversationId,
          sender_id: { not: mockCustomerId },
          is_read: false,
        },
        data: {
          is_read: true,
          read_at: expect.any(Date),
        },
      });
    });

    it('should reset unread count', async () => {
      await service.markMessagesAsRead(mockConversationId, mockCustomerId);

      expect(mockPrismaService.conversations.update).toHaveBeenCalledWith({
        where: { id: mockConversationId },
        data: {
          unread_count: 0,
        },
      });
    });

    it('should verify user access before marking as read', async () => {
      mockPrismaService.conversations.findUnique.mockResolvedValue(null);

      await expect(
        service.markMessagesAsRead(mockConversationId, 'other-user'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should only mark messages from other users as read', async () => {
      await service.markMessagesAsRead(mockConversationId, mockCustomerId);

      const updateCall = mockPrismaService.messages.updateMany.mock.calls[0][0];
      expect(updateCall.where.sender_id).toEqual({ not: mockCustomerId });
    });
  });
});
