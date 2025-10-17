import apiClient from './ApiClient';
import {
  Conversation,
  Message,
  ConversationsResponse,
  MessagesResponse
} from '../../types/models';

export const conversationService = {
  /**
   * Get all conversations for the authenticated user
   */
  getUserConversations: async (): Promise<ConversationsResponse> => {
    const response = await apiClient.get<ConversationsResponse>('/conversations');
    return response;
  },

  /**
   * Create or get existing conversation with a business
   */
  createConversation: async (
    businessId: string
  ): Promise<{ success: boolean; conversation: Conversation; message: string }> => {
    const response = await apiClient.post<{
      success: boolean;
      conversation: Conversation;
      message: string;
    }>('/conversations', { business_id: businessId });
    return response;
  },

  /**
   * Get a specific conversation by ID
   */
  getConversation: async (
    conversationId: string
  ): Promise<{ success: boolean; conversation: Conversation }> => {
    const response = await apiClient.get<{
      success: boolean;
      conversation: Conversation;
    }>(`/conversations/${conversationId}`);
    return response;
  },

  /**
   * Get messages for a conversation (paginated)
   */
  getMessages: async (
    conversationId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<MessagesResponse> => {
    const response = await apiClient.get<MessagesResponse>(
      `/conversations/${conversationId}/messages?page=${page}&limit=${limit}`
    );
    return response;
  },

  /**
   * Mark all messages in a conversation as read
   */
  markAsRead: async (
    conversationId: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
    }>(`/conversations/${conversationId}/read`);
    return response;
  },
};
