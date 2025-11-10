import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../../utils/constants';
import apiClient from '../api/ApiClient';
import { Message } from '../../types/models';

// Extract base URL for WebSocket connection (remove /api/v1)
const getWebSocketURL = () => {
  return API_BASE_URL.replace('/api/v1', '');
};

export interface SocketEvents {
  // Message events
  // Note: The handlers receive Message directly (after extraction from backend response)
  new_message: (data: Message) => void;
  message_sent: (data: Message) => void;

  // Typing events
  user_typing: (data: { userId: string; conversationId: string; isTyping: boolean }) => void;

  // Read receipt events
  messages_read: (data: { conversationId: string; userId: string }) => void;

  // Connection events
  connect: () => void;
  disconnect: () => void;
  connect_error: (error: Error) => void;
}

class SocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;
  private isConnecting: boolean = false;
  private eventListeners: Map<string, Set<Function>> = new Map();

  /**
   * Initialize and connect to Socket.io server
   */
  async connect(userId: string): Promise<void> {
    if (this.socket?.connected && this.userId === userId) {
      if (__DEV__) {
        console.log('🔌 Socket already connected for user:', userId);
      }
      return;
    }

    if (this.isConnecting) {
      if (__DEV__) {
        console.log('🔌 Socket connection already in progress');
      }
      return;
    }

    this.isConnecting = true;
    this.userId = userId;

    try {
      const token = apiClient.getToken();

      if (!token) {
        throw new Error('No authentication token found');
      }

      // Disconnect existing socket if any
      if (this.socket) {
        this.socket.disconnect();
      }

      const wsUrl = getWebSocketURL();

      if (__DEV__) {
        console.log('🔌 Connecting to WebSocket:', wsUrl);
        console.log('🔌 User ID:', userId);
      }

      // Create socket connection with auth token
      this.socket = io(wsUrl, {
        auth: {
          token,
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      // Setup connection event handlers
      this.socket.on('connect', () => {
        if (__DEV__) {
          console.log('✅ Socket connected:', this.socket?.id);
        }

        // Join user room for receiving messages
        this.joinUserRoom(userId);

        // Emit to stored listeners
        this.emitToListeners('connect');
      });

      this.socket.on('disconnect', (reason) => {
        if (__DEV__) {
          console.log('❌ Socket disconnected:', reason);
        }
        this.emitToListeners('disconnect');
      });

      this.socket.on('connect_error', (error) => {
        // Only log if it's not a transient websocket upgrade error
        if (__DEV__ && error.message !== 'websocket error') {
          console.error('❌ Socket connection error:', error.message);
        }
        // Don't emit transient errors to listeners (socket.io will retry automatically)
        if (error.message !== 'websocket error') {
          this.emitToListeners('connect_error', error);
        }
      });

      // Setup message event handlers
      this.socket.on('new_message', (data: { conversationId: string; message: Message }) => {
        if (__DEV__) {
          console.log('📨 New message received:', data);
        }
        // Extract the message from the response
        this.emitToListeners('new_message', data.message);
      });

      this.socket.on('message_sent', (data: { success: boolean; message: Message }) => {
        if (__DEV__) {
          console.log('✅ Message sent confirmed:', data);
        }
        // Extract the message from the response
        this.emitToListeners('message_sent', data.message);
      });

      this.socket.on('user_typing', (data) => {
        this.emitToListeners('user_typing', data);
      });

      this.socket.on('messages_read', (data) => {
        if (__DEV__) {
          console.log('✅ Messages marked as read:', data);
        }
        this.emitToListeners('messages_read', data);
      });

    } catch (error) {
      if (__DEV__) {
        console.error('❌ Failed to connect socket:', error);
      }
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  /**
   * Disconnect from Socket.io server
   */
  disconnect(): void {
    if (this.socket) {
      if (__DEV__) {
        console.log('🔌 Disconnecting socket');
      }
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
      this.eventListeners.clear();
    }
  }

  /**
   * Join user room to receive all messages for this user
   */
  private joinUserRoom(userId: string): void {
    if (!this.socket) return;

    if (__DEV__) {
      console.log('🚪 Joining user room:', userId);
    }

    this.socket.emit('join_user_room', { userId });
  }

  /**
   * Join specific conversation room
   */
  joinConversation(conversationId: string, userId: string): void {
    if (!this.socket) {
      if (__DEV__) {
        console.warn('⚠️ Socket not connected, cannot join conversation');
      }
      return;
    }

    if (__DEV__) {
      console.log('🚪 Joining conversation:', conversationId);
    }

    this.socket.emit('join_conversation', { conversationId, userId });
  }

  /**
   * Leave conversation room
   */
  leaveConversation(conversationId: string): void {
    if (!this.socket) return;

    if (__DEV__) {
      console.log('🚪 Leaving conversation:', conversationId);
    }

    this.socket.emit('leave_conversation', { conversationId });
  }

  /**
   * Send a message
   */
  sendMessage(conversationId: string, userId: string, messageText: string, messageType: string = 'text'): void {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }

    if (__DEV__) {
      console.log('📤 Sending message:', { conversationId, messageText });
    }

    this.socket.emit('send_message', {
      conversationId,
      userId,
      message_text: messageText,
      message_type: messageType,
    });
  }

  /**
   * Mark messages as read
   */
  markAsRead(conversationId: string, userId: string): void {
    if (!this.socket) return;

    if (__DEV__) {
      console.log('✅ Marking messages as read:', conversationId);
    }

    this.socket.emit('mark_read', { conversationId, userId });
  }

  /**
   * Send typing indicator
   */
  sendTyping(conversationId: string, userId: string, isTyping: boolean): void {
    if (!this.socket) return;

    this.socket.emit('typing', { conversationId, userId, isTyping });
  }

  /**
   * Add event listener
   */
  on<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)?.add(callback);
  }

  /**
   * Remove event listener
   */
  off<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]): void {
    this.eventListeners.get(event)?.delete(callback);
  }

  /**
   * Emit to all registered listeners for an event
   */
  private emitToListeners(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          if (__DEV__) {
            console.error(`Error in ${event} listener:`, error);
          }
        }
      });
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Get current user ID
   */
  getUserId(): string | null {
    return this.userId;
  }
}

// Export singleton instance
export default new SocketService();
