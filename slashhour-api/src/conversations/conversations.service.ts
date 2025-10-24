import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ConversationResponseDto } from './dto/conversation-response.dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConversationsService {
  constructor(
    private prisma: PrismaService,
  ) {}

  /**
   * Find or create a conversation between a customer and business
   */
  async findOrCreateConversation(
    customerId: string,
    businessId: string,
  ): Promise<ConversationResponseDto> {
    // Try to find existing conversation
    let conversation = await this.prisma.conversations.findFirst({
      where: {
        customer_id: customerId,
        business_id: businessId,
      },
      include: {
        businesses: true,
        users: true,
      },
    });

    // Create if doesn't exist
    if (!conversation) {
      conversation = await this.prisma.conversations.create({
        data: {
          customer_id: customerId,
          business_id: businessId,
          unread_count: 0,
        },
        include: {
          businesses: true,
          users: true,
        },
      });
    }

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return this.transformConversation(conversation as any);
  }

  /**
   * Get all conversations for a user
   */
  async getUserConversations(userId: string): Promise<ConversationResponseDto[]> {
    const conversations = await this.prisma.conversations.findMany({
      where: {
        OR: [
          { customer_id: userId },
          { businesses: { owner_id: userId } },
        ],
      },
      include: {
        businesses: true,
        users: true,
      },
      orderBy: [
        { last_message_at: 'desc' },
        { created_at: 'desc' },
      ],
    });

    return conversations.map((conv) => this.transformConversation(conv as any));
  }

  /**
   * Get a single conversation by ID
   */
  async getConversation(
    conversationId: string,
    userId: string,
  ): Promise<ConversationResponseDto> {
    const conversation = await this.prisma.conversations.findUnique({
      where: { id: conversationId },
      include: {
        businesses: {
          include: {
            users: true,
          },
        },
        users: true,
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Verify user is part of this conversation
    const isCustomer = conversation.customer_id === userId;
    const isBusinessOwner = conversation.businesses?.owner_id === userId;

    if (!isCustomer && !isBusinessOwner) {
      throw new ForbiddenException('You do not have access to this conversation');
    }

    return this.transformConversation(conversation as any);
  }

  /**
   * Get messages for a conversation
   */
  async getMessages(
    conversationId: string,
    userId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<{ messages: MessageResponseDto[]; total: number }> {
    // Verify access to conversation
    await this.getConversation(conversationId, userId);

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      this.prisma.messages.findMany({
        where: { conversation_id: conversationId },
        include: { users: true },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.messages.count({
        where: { conversation_id: conversationId },
      }),
    ]);

    return {
      messages: messages.map((msg) => this.transformMessage(msg as any)),
      total,
    };
  }

  /**
   * Send a message
   */
  async sendMessage(
    conversationId: string,
    senderId: string,
    messageText: string,
    messageType: string = 'text',
  ): Promise<MessageResponseDto> {
    // Verify access to conversation
    await this.getConversation(conversationId, senderId);

    // Create message with sender relation
    const savedMessage = await this.prisma.messages.create({
      data: {
        conversation_id: conversationId,
        sender_id: senderId,
        message_text: messageText,
        message_type: messageType,
        is_read: false,
      },
      include: { users: true },
    });

    // Update conversation last message
    await this.prisma.conversations.update({
      where: { id: conversationId },
      data: {
        last_message_at: new Date(),
        last_message_text: messageText,
      },
    });

    // Increment unread count for the other user
    const conversation = await this.prisma.conversations.findUnique({
      where: { id: conversationId },
      include: { businesses: true },
    });

    if (conversation) {
      const isCustomerSender = conversation.customer_id === senderId;
      if (isCustomerSender) {
        // Customer sent, increment for business owner
        await this.prisma.conversations.update({
          where: { id: conversationId },
          data: {
            unread_count: {
              increment: 1,
            },
          },
        });
      }
    }

    return this.transformMessage(savedMessage as any);
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    // Verify access
    await this.getConversation(conversationId, userId);

    // Mark all unread messages as read (where user is NOT the sender)
    await this.prisma.messages.updateMany({
      where: {
        conversation_id: conversationId,
        sender_id: { not: userId },
        is_read: false,
      },
      data: {
        is_read: true,
        read_at: new Date(),
      },
    });

    // Reset unread count for this user
    await this.prisma.conversations.update({
      where: { id: conversationId },
      data: {
        unread_count: 0,
      },
    });
  }

  /**
   * Transform conversation entity to DTO (camelCase)
   */
  private transformConversation(conversation: any): ConversationResponseDto {
    return {
      id: conversation.id,
      businessId: conversation.business_id,
      customerId: conversation.customer_id,
      lastMessageAt: conversation.last_message_at,
      lastMessageText: conversation.last_message_text,
      unreadCount: conversation.unread_count,
      createdAt: conversation.created_at,
      updatedAt: conversation.updated_at,
      business: {
        id: conversation.businesses.id,
        businessName: conversation.businesses.business_name,
        logoUrl: conversation.businesses.logo_url,
        category: conversation.businesses.category,
      },
      customer: {
        id: conversation.users.id,
        username: conversation.users.username,
        name: conversation.users.name,
        avatarUrl: conversation.users.avatar_url,
      },
    };
  }

  /**
   * Transform message entity to DTO (camelCase)
   */
  private transformMessage(message: any): MessageResponseDto {
    return {
      id: message.id,
      conversationId: message.conversation_id,
      senderId: message.sender_id,
      messageText: message.message_text,
      messageType: message.message_type,
      isRead: message.is_read,
      readAt: message.read_at,
      createdAt: message.created_at,
      sender: {
        id: message.users.id,
        username: message.users.username,
        name: message.users.name,
        avatarUrl: message.users.avatar_url,
      },
    };
  }
}
