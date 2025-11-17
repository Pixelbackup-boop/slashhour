import axios, { AxiosError } from "axios";
import type { PaginatedResponse, DashboardStats } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

// Debug: Log the API URL on client side
if (typeof window !== 'undefined') {
  console.log('🔧 Admin API Base URL:', API_BASE_URL);
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Admin Auth API
export const adminAuthAPI = {
  login: async (emailOrUsername: string, password: string): Promise<{
    access_token: string;
    admin: {
      id: string;
      email: string;
      username: string;
      name: string;
      role: string;
      permissions: string[];
    };
  }> => {
    const response = await apiClient.post("/admin/auth/login", {
      emailOrUsername,
      password,
    });
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get("/admin/auth/me");
    return response.data;
  },
};

// Admin Management API
export const adminManagementAPI = {
  getAdmins: async (params?: any) => {
    const response = await apiClient.get("/admin/admins", { params });
    return response.data;
  },

  createAdmin: async (data: any) => {
    const response = await apiClient.post("/admin/admins", data);
    return response.data;
  },

  updateAdmin: async (id: string, data: any) => {
    const response = await apiClient.put(`/admin/admins/${id}`, data);
    return response.data;
  },

  deleteAdmin: async (id: string) => {
    const response = await apiClient.delete(`/admin/admins/${id}`);
    return response.data;
  },

  getActivityLogs: async (params?: any) => {
    const response = await apiClient.get("/admin/admins/logs/activity", { params });
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponse<any>> => {
    const response = await apiClient.get("/admin/users", { params });
    return response.data;
  },

  getUser: async (id: string) => {
    const response = await apiClient.get(`/admin/users/${id}`);
    return response.data;
  },

  updateUserStatus: async (id: string, status: string) => {
    const response = await apiClient.put(`/admin/users/${id}/status`, { status });
    return response.data;
  },

  verifyEmail: async (id: string) => {
    const response = await apiClient.put(`/admin/users/${id}/verify-email`);
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await apiClient.delete(`/admin/users/${id}`);
    return response.data;
  },

  getUserActivity: async (id: string, params?: any) => {
    const response = await apiClient.get(`/admin/users/${id}/activity`, { params });
    return response.data;
  },
};

// Businesses API
export const businessesAPI = {
  getBusinesses: async (params?: any) => {
    const response = await apiClient.get("/admin/businesses", { params });
    return response.data;
  },

  getBusiness: async (id: string) => {
    const response = await apiClient.get(`/admin/businesses/${id}`);
    return response.data;
  },

  verifyBusiness: async (id: string) => {
    const response = await apiClient.put(`/admin/businesses/${id}/verify`);
    return response.data;
  },

  unverifyBusiness: async (id: string) => {
    const response = await apiClient.put(`/admin/businesses/${id}/unverify`);
    return response.data;
  },

  updateSubscription: async (id: string, data: any) => {
    const response = await apiClient.put(`/admin/businesses/${id}/subscription`, data);
    return response.data;
  },

  deleteBusiness: async (id: string) => {
    const response = await apiClient.delete(`/admin/businesses/${id}`);
    return response.data;
  },
};

// Deals API
export const dealsAPI = {
  getDeals: async (params?: any) => {
    const response = await apiClient.get("/admin/deals", { params });
    return response.data;
  },

  getDeal: async (id: string) => {
    const response = await apiClient.get(`/admin/deals/${id}`);
    return response.data;
  },

  updateDealStatus: async (id: string, status: string) => {
    const response = await apiClient.put(`/admin/deals/${id}/status`, { status });
    return response.data;
  },

  deleteDeal: async (id: string) => {
    const response = await apiClient.delete(`/admin/deals/${id}`);
    return response.data;
  },

  getDealStats: async () => {
    const response = await apiClient.get("/admin/deals/stats/overview");
    return response.data;
  },
};

// Analytics API
export const analyticsAPI = {
  getDashboard: async (): Promise<DashboardStats> => {
    const response = await apiClient.get("/admin/analytics/dashboard");
    return response.data;
  },

  getUserGrowth: async (params?: any) => {
    const response = await apiClient.get("/admin/analytics/users/growth", { params });
    return response.data;
  },

  getDealsPerformance: async (params?: any) => {
    const response = await apiClient.get("/admin/analytics/deals/performance", { params });
    return response.data;
  },

  getBusinessesPerformance: async (params?: any) => {
    const response = await apiClient.get("/admin/analytics/businesses/performance", { params });
    return response.data;
  },

  getRedemptionStats: async (params?: any) => {
    const response = await apiClient.get("/admin/analytics/redemptions/stats", { params });
    return response.data;
  },

  getSubscriptionRevenue: async () => {
    const response = await apiClient.get("/admin/analytics/revenue/subscriptions");
    return response.data;
  },
};

// Content Moderation API
export const contentAPI = {
  getReviews: async (params?: any) => {
    const response = await apiClient.get("/admin/content/reviews", { params });
    return response.data;
  },

  updateReviewStatus: async (id: string, status: string) => {
    const response = await apiClient.put(`/admin/content/reviews/${id}/status`, { status });
    return response.data;
  },

  deleteReview: async (id: string) => {
    const response = await apiClient.delete(`/admin/content/reviews/${id}`);
    return response.data;
  },

  getReports: async (params?: any) => {
    const response = await apiClient.get("/admin/content/reports", { params });
    return response.data;
  },

  reviewReport: async (id: string, data: any) => {
    const response = await apiClient.put(`/admin/content/reports/${id}/review`, data);
    return response.data;
  },

  broadcastNotification: async (data: any) => {
    const response = await apiClient.post("/admin/content/notifications/broadcast", data);
    return response.data;
  },
};

// Messages API (Broadcast Announcements)
export const messagesAPI = {
  getUserCounts: async (group?: string) => {
    const response = await apiClient.get("/admin/messages/broadcast/user-count", {
      params: group ? { group } : undefined,
    });
    return response.data;
  },

  broadcastMessage: async (data: {
    message: string;
    target_group: string;
    scheduled_at?: string;
  }) => {
    const response = await apiClient.post("/admin/messages/broadcast", data);
    return response.data;
  },

  getBroadcastStats: async () => {
    const response = await apiClient.get("/admin/messages/broadcast/stats");
    return response.data;
  },

  // Broadcast History & Analytics
  getBroadcasts: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => {
    const response = await apiClient.get("/admin/messages/broadcasts", { params });
    return response.data;
  },

  getBroadcast: async (id: string) => {
    const response = await apiClient.get(`/admin/messages/broadcasts/${id}`, {
      params: { id },
    });
    return response.data;
  },

  trackLinkClick: async (broadcastId: string, data: {
    user_id: string;
    link_url: string;
  }) => {
    const response = await apiClient.post(
      `/admin/messages/broadcasts/${broadcastId}/track-click`,
      data,
      { params: { id: broadcastId } }
    );
    return response.data;
  },
};
