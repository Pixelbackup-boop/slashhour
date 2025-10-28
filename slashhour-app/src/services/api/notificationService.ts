import apiClient from './ApiClient';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  is_read: boolean;
  read_at?: string;
  sent_at: string;
  image_url?: string;
  action_url?: string;
  created_at: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RegisterDeviceTokenData {
  device_token: string;
  device_type: 'ios' | 'android' | 'web';
  device_name?: string;
}

const notificationService = {
  /**
   * Register device token for push notifications
   */
  registerDeviceToken: async (data: RegisterDeviceTokenData) => {
    const response = await apiClient.post('/notifications/device-token', data);
    return response.data;
  },

  /**
   * Deactivate device token
   */
  deactivateDeviceToken: async (token: string) => {
    const response = await apiClient.delete(`/notifications/device-token/${encodeURIComponent(token)}`);
    return response.data;
  },

  /**
   * Get user notifications (paginated)
   */
  getNotifications: async (page = 1, limit = 20): Promise<NotificationsResponse> => {
    const response = await apiClient.get<NotificationsResponse>('/notifications', {
      params: { page, limit },
    });
    return response;
  },

  /**
   * Get unread notification count
   */
  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get('/notifications/unread-count');
    return response?.count || 0;
  },

  /**
   * Mark specific notifications as read
   */
  markAsRead: async (notificationIds: string[]) => {
    const response = await apiClient.post('/notifications/mark-as-read', {
      notification_ids: notificationIds,
    });
    return response.data;
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async () => {
    const response = await apiClient.post('/notifications/mark-all-as-read');
    return response.data;
  },

  /**
   * Delete a notification
   */
  deleteNotification: async (notificationId: string) => {
    const response = await apiClient.delete(`/notifications/${notificationId}`);
    return response.data;
  },
};

export default notificationService;
