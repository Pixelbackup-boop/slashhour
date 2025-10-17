import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { ConversationResponseDto } from './dto/conversation-response.dto';
import { MessageResponseDto } from './dto/message-response.dto';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  /**
   * Find or create a conversation between a customer and business
   */
  async findOrCreateConversation(
    customerId: string,
    businessId: string,
  ): Promise<ConversationResponseDto> {
    // Try to find existing conversation
    let conversation = await this.conversationRepository.findOne({
      where: {
        customerId,
        businessId,
      },
      relations: ['business', 'customer'],
    });

    // Create if doesn't exist
    if (!conversation) {
      conversation = this.conversationRepository.create({
        customerId,
        businessId,
        unreadCount: 0,
      });

      conversation = await this.conversationRepository.save(conversation);

      // Reload with relations
      conversation = await this.conversationRepository.findOne({
        where: { id: conversation.id },
        relations: ['business', 'customer'],
      });
    }

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return this.transformConversation(conversation);
  }

  /**
   * Get all conversations for a user
   */
  async getUserConversations(userId: string): Promise<ConversationResponseDto[]> {
    const conversations = await this.conversationRepository.find({
      where: [
        { customerId: userId },
        { business: { owner_id: userId } },
      ],
      relations: ['business', 'customer'],
      order: { lastMessageAt: 'DESC', createdAt: 'DESC' },
    });

    return conversations.map((conv) => this.transformConversation(conv));
  }

  /**
   * Get a single conversation by ID
   */
  async getConversation(
    conversationId: string,
    userId: string,
  ): Promise<ConversationResponseDto> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['business', 'customer', 'business.owner'],
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Verify user is part of this conversation
    const isCustomer = conversation.customerId === userId;
    const isBusinessOwner = conversation.business?.owner_id === userId;

    if (!isCustomer && !isBusinessOwner) {
      throw new ForbiddenException('You do not have access to this conversation');
    }

    return this.transformConversation(conversation);
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

    const [messages, total] = await this.messageRepository.findAndCount({
      where: { conversationId },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      messages: messages.map((msg) => this.transformMessage(msg)),
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

    // Create message
    const message = this.messageRepository.create({
      conversationId,
      senderId,
      messageText,
      messageType,
      isRead: false,
    });

    const savedMessage = await this.messageRepository.save(message);

    // Update conversation last message
    await this.conversationRepository.update(conversationId, {
      lastMessageAt: new Date(),
      lastMessageText: messageText,
    });

    // Increment unread count for the other user
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['business'],
    });

    if (conversation) {
      const isCustomerSender = conversation.customerId === senderId;
      if (isCustomerSender) {
        // Customer sent, increment for business owner
        await this.conversationRepository.increment(
          { id: conversationId },
          'unreadCount',
          1,
        );
      }
    }

    // Reload with sender relation
    const messageWithSender = await this.messageRepository.findOne({
      where: { id: savedMessage.id },
      relations: ['sender'],
    });

    if (!messageWithSender) {
      throw new NotFoundException('Message not found');
    }

    return this.transformMessage(messageWithSender);
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    // Verify access
    await this.getConversation(conversationId, userId);

    // Mark all unread messages as read (where user is NOT the sender)
    await this.messageRepository
      .createQueryBuilder()
      .update(Message)
      .set({ isRead: true, readAt: () => 'CURRENT_TIMESTAMP' })
      .where('conversation_id = :conversationId', { conversationId })
      .andWhere('sender_id != :userId', { userId })
      .andWhere('is_read = :isRead', { isRead: false })
      .execute();

    // Reset unread count for this user
    await this.conversationRepository.update(conversationId, {
      unreadCount: 0,
    });
  }

  /**
   * Transform conversation entity to DTO (camelCase)
   */
  private transformConversation(conversation: Conversation): ConversationResponseDto {
    return {
      id: conversation.id,
      businessId: conversation.businessId,
      customerId: conversation.customerId,
      lastMessageAt: conversation.lastMessageAt,
      lastMessageText: conversation.lastMessageText,
      unreadCount: conversation.unreadCount,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      business: {
        id: conversation.business.id,
        businessName: conversation.business.business_name,
        logoUrl: conversation.business.logo_url,
        category: conversation.business.category,
      },
      customer: {
        id: conversation.customer.id,
        username: conversation.customer.username,
        name: conversation.customer.name,
        avatarUrl: conversation.customer.avatar_url,
      },
    };
  }

  /**
   * Transform message entity to DTO (camelCase)
   */
  private transformMessage(message: Message): MessageResponseDto {
    return {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      messageText: message.messageText,
      messageType: message.messageType,
      isRead: message.isRead,
      readAt: message.readAt,
      createdAt: message.createdAt,
      sender: {
        id: message.sender.id,
        username: message.sender.username,
        name: message.sender.name,
        avatarUrl: message.sender.avatar_url,
      },
    };
  }
}
