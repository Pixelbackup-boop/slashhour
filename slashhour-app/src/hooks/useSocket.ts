import { useState, useEffect, useCallback } from 'react';
import socketService from '../services/socket/socketService';
import { logError } from '../config/sentry';

interface UseSocketReturn {
  isConnected: boolean;
  error: string | null;
  connect: (userId: string) => Promise<void>;
  disconnect: () => void;
}

/**
 * Custom hook for managing WebSocket connection
 * Handles connection lifecycle and error states
 */
export const useSocket = (autoConnect: boolean = false, userId?: string): UseSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async (uid: string) => {
    try {
      setError(null);
      await socketService.connect(uid);
      setIsConnected(true);
    } catch (err: any) {
      console.error('Failed to connect socket:', err);
      const errorMessage = err.message || 'Failed to connect to messaging service';
      setError(errorMessage);
      logError(err, { context: 'useSocket.connect' });
      setIsConnected(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    try {
      socketService.disconnect();
      setIsConnected(false);
      setError(null);
    } catch (err: any) {
      console.error('Error disconnecting socket:', err);
      logError(err, { context: 'useSocket.disconnect' });
    }
  }, []);

  // Setup event listeners for connection status
  useEffect(() => {
    const handleConnect = () => {
      if (__DEV__) {
        console.log('✅ useSocket: Connected');
      }
      setIsConnected(true);
      setError(null);
    };

    const handleDisconnect = () => {
      if (__DEV__) {
        console.log('❌ useSocket: Disconnected');
      }
      setIsConnected(false);
    };

    const handleConnectError = (err: Error) => {
      if (__DEV__) {
        console.error('❌ useSocket: Connection error', err);
      }
      setError(err.message || 'Connection error');
      setIsConnected(false);
    };

    socketService.on('connect', handleConnect);
    socketService.on('disconnect', handleDisconnect);
    socketService.on('connect_error', handleConnectError);

    // Auto-connect if enabled and userId provided
    if (autoConnect && userId) {
      connect(userId);
    }

    // Cleanup listeners on unmount
    return () => {
      socketService.off('connect', handleConnect);
      socketService.off('disconnect', handleDisconnect);
      socketService.off('connect_error', handleConnectError);
    };
  }, [autoConnect, userId, connect]);

  return {
    isConnected,
    error,
    connect,
    disconnect,
  };
};
