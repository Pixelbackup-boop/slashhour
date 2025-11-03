import { useState, useEffect, useCallback, useRef } from 'react';
import { conversationService } from '../services/api/conversationService';
import socketService from '../services/socket/socketService';
import { Conversation, Message } from '../types/models';
import { logError } from '../config/sentry';

interface UseConversationsReturn {
  conversations: Conversation[];
  totalUnreadCount: number;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createOrGetConversation: (businessId: string) => Promise<Conversation | null>;
}

/**
 * Utility function to calculate total unread count from conversations
 */
const calculateTotalUnread = (conversations: Conversation[]): number => {
  return conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
};

/**
 * Custom hook for managing user's conversations
 * Handles fetching, real-time updates, and conversation creation
 */
export const useConversations = (userId?: string): UseConversationsReturn => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use ref to track if socket listeners are set up
  const listenersSetupRef = useRef(false);

  const fetchConversations = useCallback(async () => {
    // Don't fetch if no userId (user not authenticated)
    if (!userId) {
      if (__DEV__) {
        console.log('⏸️ [useConversations] Skipping fetch - user not authenticated');
      }
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await conversationService.getUserConversations();

      if (response.success) {
        // Sort by lastMessageAt descending (most recent first)
        const sorted = [...response.conversations].sort((a, b) => {
          const dateA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
          const dateB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
          return dateB - dateA;
        });

        setConversations(sorted);

        // Calculate total unread count using utility function
        setTotalUnreadCount(calculateTotalUnread(sorted));

        if (__DEV__) {
          console.log(`✅ [useConversations] Fetched ${sorted.length} conversations`);
        }
      } else {
        setConversations([]);
        setTotalUnreadCount(0);
      }
    } catch (err: any) {
      console.error('Failed to fetch conversations:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load conversations';
      setError(errorMessage);
      logError(err, { context: 'useConversations.fetchConversations' });
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const refresh = useCallback(async () => {
    // Clear error before retrying
    setError(null);
    await fetchConversations();
  }, [fetchConversations]);

  const createOrGetConversation = useCallback(async (businessId: string): Promise<Conversation | null> => {
    try {
      setError(null);

      const response = await conversationService.createConversation(businessId);

      if (response.success && response.conversation) {
        // Check if conversation already exists in list
        const exists = conversations.find(c => c.id === response.conversation.id);

        if (!exists) {
          // Add new conversation to list
          setConversations(prev => [response.conversation, ...prev]);
        }

        return response.conversation;
      }

      return null;
    } catch (err: any) {
      console.error('Failed to create conversation:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create conversation';
      setError(errorMessage);
      logError(err, { context: 'useConversations.createOrGetConversation' });
      return null;
    }
  }, [conversations]);

  // Handle real-time message updates and initial fetch
  useEffect(() => {
    // Don't set up anything if no userId (user not authenticated)
    if (!userId) {
      if (__DEV__) {
        console.log('⏸️ [useConversations] Skipping setup - user not authenticated');
      }
      return;
    }

    const handleNewMessage = (message: Message) => {
      if (__DEV__) {
        console.log('📨 useConversations: New message received', message);
      }

      // Update conversation list with new message info
      setConversations(prev => {
        const updated = prev.map(conv => {
          if (conv.id === message.conversationId) {
            return {
              ...conv,
              lastMessageAt: message.createdAt,
              lastMessageText: message.messageText,
              // Increment unread if message is not from current user
              unreadCount: message.senderId !== userId ? conv.unreadCount + 1 : conv.unreadCount,
            };
          }
          return conv;
        });

        // Sort by lastMessageAt descending
        const sorted = updated.sort((a, b) => {
          const dateA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
          const dateB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
          return dateB - dateA;
        });

        // Update total unread count using utility function
        setTotalUnreadCount(calculateTotalUnread(sorted));

        return sorted;
      });
    };

    const handleMessagesRead = (data: { conversationId: string; userId: string }) => {
      if (__DEV__) {
        console.log('✅ useConversations: Messages read', data);
      }

      // Only update if the current user marked messages as read
      if (data.userId === userId) {
        setConversations(prev => {
          const updated = prev.map(conv =>
            conv.id === data.conversationId
              ? { ...conv, unreadCount: 0 }
              : conv
          );

          // Update total unread count using utility function
          setTotalUnreadCount(calculateTotalUnread(updated));

          return updated;
        });
      }
    };

    // Only set up listeners once per userId
    if (!listenersSetupRef.current) {
      listenersSetupRef.current = true;

      if (__DEV__) {
        console.log('🔌 [useConversations] Setting up socket listeners for user:', userId);
      }

      // Subscribe to socket events
      socketService.on('new_message', handleNewMessage);
      socketService.on('messages_read', handleMessagesRead);

      // Initial fetch - now with proper auth guard
      fetchConversations();
    }

    // Cleanup
    return () => {
      if (listenersSetupRef.current) {
        if (__DEV__) {
          console.log('🔌 [useConversations] Cleaning up socket listeners');
        }
        socketService.off('new_message', handleNewMessage);
        socketService.off('messages_read', handleMessagesRead);
        listenersSetupRef.current = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, fetchConversations]);

  return {
    conversations,
    totalUnreadCount,
    isLoading,
    error,
    refresh,
    createOrGetConversation,
  };
};
