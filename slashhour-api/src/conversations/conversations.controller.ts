import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateConversationDto } from './dto/create-conversation.dto';

/**
 * REST Controller for conversations
 * Handles HTTP requests for conversation management
 */
@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  /**
   * GET /conversations
   * Get all conversations for the authenticated user
   */
  @Get()
  async getUserConversations(@Request() req) {
    const userId = req.user.id;
    const conversations =
      await this.conversationsService.getUserConversations(userId);

    return {
      success: true,
      conversations,
    };
  }

  /**
   * POST /conversations
   * Create or get a conversation with a business
   */
  @Post()
  async createConversation(
    @Request() req,
    @Body() createConversationDto: CreateConversationDto,
  ) {
    const customerId = req.user.id;
    const { business_id } = createConversationDto;

    const conversation =
      await this.conversationsService.findOrCreateConversation(
        customerId,
        business_id,
      );

    return {
      success: true,
      conversation,
      message: 'Conversation created or retrieved successfully',
    };
  }

  /**
   * GET /conversations/:id
   * Get a specific conversation
   */
  @Get(':id')
  async getConversation(@Request() req, @Param('id') conversationId: string) {
    const userId = req.user.id;
    const conversation = await this.conversationsService.getConversation(
      conversationId,
      userId,
    );

    return {
      success: true,
      conversation,
    };
  }

  /**
   * GET /conversations/:id/messages
   * Get messages for a conversation (paginated)
   */
  @Get(':id/messages')
  async getMessages(
    @Request() req,
    @Param('id') conversationId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
  ) {
    const userId = req.user.id;
    const { messages, total } = await this.conversationsService.getMessages(
      conversationId,
      userId,
      parseInt(page, 10),
      parseInt(limit, 10),
    );

    return {
      success: true,
      messages,
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    };
  }

  /**
   * POST /conversations/:id/read
   * Mark all messages in a conversation as read
   */
  @Post(':id/read')
  async markAsRead(@Request() req, @Param('id') conversationId: string) {
    const userId = req.user.id;
    await this.conversationsService.markMessagesAsRead(conversationId, userId);

    return {
      success: true,
      message: 'Messages marked as read',
    };
  }
}
