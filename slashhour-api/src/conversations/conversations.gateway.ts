import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { SendMessageDto } from './dto/send-message.dto';

/**
 * WebSocket Gateway for real-time messaging
 * Handles Socket.io connections and events
 */
@WebSocketGateway({
  cors: {
    origin: '*', // Configure based on your frontend URL in production
    credentials: true,
  },
})
export class ConversationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('ConversationsGateway');
  private userSockets: Map<string, string[]> = new Map(); // userId -> socket IDs

  constructor(private conversationsService: ConversationsService) {}

  /**
   * Handle new client connection
   */
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  /**
   * Handle client disconnection
   */
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    // Remove from user sockets map
    for (const [userId, socketIds] of this.userSockets.entries()) {
      const filtered = socketIds.filter((id) => id !== client.id);
      if (filtered.length === 0) {
        this.userSockets.delete(userId);
      } else {
        this.userSockets.set(userId, filtered);
      }
    }
  }

  /**
   * User joins their personal room (for receiving messages)
   */
  @SubscribeMessage('join_user_room')
  handleJoinUserRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ) {
    const { userId } = data;

    // Join user's personal room
    client.join(`user:${userId}`);

    // Track socket ID for this user
    const existingSockets = this.userSockets.get(userId) || [];
    this.userSockets.set(userId, [...existingSockets, client.id]);

    this.logger.log(`User ${userId} joined their room with socket ${client.id}`);

    client.emit('joined_user_room', { userId, success: true });
  }

  /**
   * Join a conversation room
   */
  @SubscribeMessage('join_conversation')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; userId: string },
  ) {
    const { conversationId, userId } = data;

    try {
      // Verify user has access to this conversation
      await this.conversationsService.getConversation(conversationId, userId);

      // Join conversation room
      client.join(`conversation:${conversationId}`);

      this.logger.log(
        `User ${userId} joined conversation ${conversationId}`,
      );

      client.emit('joined_conversation', {
        conversationId,
        success: true,
      });
    } catch (error) {
      this.logger.error(`Failed to join conversation: ${error.message}`);
      client.emit('error', {
        message: 'Failed to join conversation',
        details: error.message,
      });
    }
  }

  /**
   * Leave a conversation room
   */
  @SubscribeMessage('leave_conversation')
  handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const { conversationId } = data;
    client.leave(`conversation:${conversationId}`);

    this.logger.log(`Client ${client.id} left conversation ${conversationId}`);

    client.emit('left_conversation', { conversationId, success: true });
  }

  /**
   * Send a message
   */
  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      conversationId: string;
      userId: string;
      message_text: string;
      message_type?: string;
    },
  ) {
    const { conversationId, userId, message_text, message_type } = data;

    try {
      // Send message via service
      const message = await this.conversationsService.sendMessage(
        conversationId,
        userId,
        message_text,
        message_type || 'text',
      );

      // Get conversation to find other participant
      const conversation = await this.conversationsService.getConversation(
        conversationId,
        userId,
      );

      // Broadcast to conversation room (real-time to all participants)
      this.server.to(`conversation:${conversationId}`).emit('new_message', {
        conversationId,
        message,
      });

      // Also emit to other user's personal room (for push notifications/badges)
      const otherUserId =
        conversation.customerId === userId
          ? conversation.business.id // TODO: should be business owner ID
          : conversation.customerId;

      this.server.to(`user:${otherUserId}`).emit('conversation_updated', {
        conversationId,
        lastMessage: message,
      });

      this.logger.log(
        `Message sent in conversation ${conversationId} by user ${userId}`,
      );

      // Acknowledge to sender
      client.emit('message_sent', {
        success: true,
        message,
      });
    } catch (error) {
      this.logger.error(`Failed to send message: ${error.message}`);
      client.emit('error', {
        message: 'Failed to send message',
        details: error.message,
      });
    }
  }

  /**
   * Mark messages as read
   */
  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; userId: string },
  ) {
    const { conversationId, userId } = data;

    try {
      await this.conversationsService.markMessagesAsRead(
        conversationId,
        userId,
      );

      // Notify conversation room
      this.server
        .to(`conversation:${conversationId}`)
        .emit('messages_read', {
          conversationId,
          userId,
        });

      this.logger.log(
        `Messages marked as read in conversation ${conversationId} by user ${userId}`,
      );

      client.emit('marked_read', { success: true });
    } catch (error) {
      this.logger.error(`Failed to mark messages as read: ${error.message}`);
      client.emit('error', {
        message: 'Failed to mark messages as read',
        details: error.message,
      });
    }
  }

  /**
   * Typing indicator
   */
  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; userId: string; isTyping: boolean },
  ) {
    const { conversationId, userId, isTyping } = data;

    // Broadcast to conversation room (excluding sender)
    client.to(`conversation:${conversationId}`).emit('user_typing', {
      conversationId,
      userId,
      isTyping,
    });
  }
}
