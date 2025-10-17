import { useState, useEffect, useCallback, useRef } from 'react';
import { conversationService } from '../services/api/conversationService';
import socketService from '../services/socket/socketService';
import { Message } from '../types/models';
import { logError } from '../config/sentry';

interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  isSending: boolean;
  isTyping: boolean;
  hasMore: boolean;
  sendMessage: (text: string, type?: string) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  markAsRead: () => void;
  setTyping: (isTyping: boolean) => void;
}

interface UseChatOptions {
  conversationId: string;
  userId: string;
  initialPageSize?: number;
}

/**
 * Custom hook for managing a single conversation chat
 * Handles messages, real-time updates, typing indicators, and pagination
 */
export const useChat = ({
  conversationId,
  userId,
  initialPageSize = 50,
}: UseChatOptions): UseChatReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalMessages, setTotalMessages] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isJoinedRef = useRef(false);
  const listenersSetupRef = useRef(false);

  const fetchMessages = useCallback(async (page: number = 1) => {
    try {
      if (page === 1) {
        setIsLoading(true);
      }
      setError(null);

      const response = await conversationService.getMessages(
        conversationId,
        page,
        initialPageSize
      );

      if (response.success) {
        // Messages come in DESC order (newest first) - perfect for GiftedChat with inverted={true}
        const newMessages = response.messages;

        if (page === 1) {
          setMessages(newMessages);
        } else {
          // Append older messages at the end (they're older, so they go after current messages)
          setMessages(prev => [...prev, ...newMessages]);
        }

        setTotalMessages(response.total);
        setCurrentPage(page);
        setHasMore(response.messages.length === initialPageSize);
      }
    } catch (err: any) {
      console.error('Failed to fetch messages:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load messages';
      setError(errorMessage);
      logError(err, { context: 'useChat.fetchMessages' });
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, initialPageSize]);

  const loadMoreMessages = useCallback(async () => {
    if (!hasMore || isLoading) return;
    await fetchMessages(currentPage + 1);
  }, [hasMore, isLoading, currentPage, fetchMessages]);

  const sendMessage = useCallback(async (text: string, type: string = 'text') => {
    if (!text.trim() || isSending) return;

    try {
      setIsSending(true);
      setError(null);

      // Send via WebSocket for real-time delivery
      socketService.sendMessage(conversationId, userId, text.trim(), type);

      // The actual message will be added via the 'message_sent' socket event
    } catch (err: any) {
      console.error('Failed to send message:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to send message';
      setError(errorMessage);
      logError(err, { context: 'useChat.sendMessage' });
    } finally {
      setIsSending(false);
    }
  }, [conversationId, userId, isSending]);

  const markAsRead = useCallback(() => {
    try {
      // Mark via WebSocket for real-time
      socketService.markAsRead(conversationId, userId);

      // Also call REST API to ensure persistence
      conversationService.markAsRead(conversationId).catch(err => {
        console.error('Failed to mark as read via API:', err);
      });

      // Update local state
      setMessages(prev =>
        prev.map(msg =>
          msg.senderId !== userId
            ? { ...msg, isRead: true, readAt: new Date().toISOString() }
            : msg
        )
      );
    } catch (err: any) {
      console.error('Error marking messages as read:', err);
      logError(err, { context: 'useChat.markAsRead' });
    }
  }, [conversationId, userId]);

  const setTyping = useCallback((typing: boolean) => {
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    // Send typing indicator
    socketService.sendTyping(conversationId, userId, typing);

    if (typing) {
      // Auto-stop typing after 3 seconds
      typingTimeoutRef.current = setTimeout(() => {
        socketService.sendTyping(conversationId, userId, false);
      }, 3000);
    }
  }, [conversationId, userId]);

  // Join conversation and setup real-time listeners
  useEffect(() => {
    // Join conversation room (only once)
    if (!isJoinedRef.current) {
      socketService.joinConversation(conversationId, userId);
      isJoinedRef.current = true;

      if (__DEV__) {
        console.log('🚪 useChat: Joined conversation', conversationId);
      }
    }

    const handleNewMessage = (message: Message) => {
      // Only add message if it belongs to this conversation
      if (message.conversationId === conversationId) {
        if (__DEV__) {
          console.log('📨 useChat: New message received', message);
        }

        setMessages(prev => {
          // Check if message already exists (avoid duplicates)
          const exists = prev.some(m => m.id === message.id);
          if (exists) return prev;

          // Add new message at the BEGINNING (index 0) since GiftedChat expects newest first
          return [message, ...prev];
        });

        // Auto mark as read if message is from other user
        if (message.senderId !== userId) {
          setTimeout(() => {
            try {
              socketService.markAsRead(conversationId, userId);
              conversationService.markAsRead(conversationId).catch(err => {
                console.error('Failed to mark as read via API:', err);
              });
            } catch (err: any) {
              console.error('Error marking messages as read:', err);
            }
          }, 500);
        }
      }
    };

    const handleMessageSent = (message: Message) => {
      // Confirmation that our message was sent
      if (message.conversationId === conversationId) {
        if (__DEV__) {
          console.log('✅ useChat: Message sent confirmed', message);
        }

        setMessages(prev => {
          // Check if message already exists
          const exists = prev.some(m => m.id === message.id);
          if (exists) return prev;

          // Add sent message at the BEGINNING (index 0) since GiftedChat expects newest first
          return [message, ...prev];
        });
      }
    };

    const handleUserTyping = (data: { userId: string; conversationId: string; isTyping: boolean }) => {
      // Only show typing indicator if it's from another user in this conversation
      if (data.conversationId === conversationId && data.userId !== userId) {
        setIsTyping(data.isTyping);

        // Auto-hide typing indicator after 3 seconds
        if (data.isTyping) {
          setTimeout(() => setIsTyping(false), 3000);
        }
      }
    };

    const handleMessagesRead = (data: { conversationId: string; userId: string }) => {
      // Update read status for messages in this conversation
      if (data.conversationId === conversationId && data.userId !== userId) {
        setMessages(prev =>
          prev.map(msg =>
            msg.senderId === userId
              ? { ...msg, isRead: true, readAt: new Date().toISOString() }
              : msg
          )
        );
      }
    };

    // Subscribe to events (only once)
    if (!listenersSetupRef.current) {
      listenersSetupRef.current = true;

      socketService.on('new_message', handleNewMessage);
      socketService.on('message_sent', handleMessageSent);
      socketService.on('user_typing', handleUserTyping);
      socketService.on('messages_read', handleMessagesRead);
    }

    // Always fetch messages when conversation loads
    fetchMessages(1);

    // Cleanup
    return () => {
      if (listenersSetupRef.current) {
        socketService.off('new_message', handleNewMessage);
        socketService.off('message_sent', handleMessageSent);
        socketService.off('user_typing', handleUserTyping);
        socketService.off('messages_read', handleMessagesRead);

        // Clear typing timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        // Leave conversation room
        socketService.leaveConversation(conversationId);
        isJoinedRef.current = false;
        listenersSetupRef.current = false;

        if (__DEV__) {
          console.log('🚪 useChat: Left conversation', conversationId);
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, userId]);

  return {
    messages,
    isLoading,
    error,
    isSending,
    isTyping,
    hasMore,
    sendMessage,
    loadMoreMessages,
    markAsRead,
    setTyping,
  };
};
