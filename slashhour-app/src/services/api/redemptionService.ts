import apiClient from './ApiClient';

interface RedemptionResponse {
  redemption: {
    id: string;
    user_id: string;
    deal_id: string;
    business_id: string;
    original_price: number;
    paid_price: number;
    savings_amount: number;
    deal_category: string;
    redeemed_at: string;
  };
  redemptionCode: string;
}

interface UserRedemption {
  id: string;
  user_id: string;
  deal_id: string;
  business_id: string;
  original_price: number;
  paid_price: number;
  savings_amount: number;
  deal_category: string;
  redeemed_at: string;
  deal?: any;
  business?: any;
}

interface RedemptionsListResponse {
  redemptions: UserRedemption[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// Business redemption types
export type RedemptionStatus = 'pending' | 'validated' | 'expired' | 'cancelled';

export interface BusinessRedemptionItem {
  id: string;
  status: RedemptionStatus;
  original_price: number;
  paid_price: number;
  savings_amount: number;
  redeemed_at: string;
  validated_at?: string;
  validated_by?: string;
  deal: {
    id: string;
    title: string;
    description?: string;
    images: any[];
  } | null;
  user: {
    id: string;
    username: string;
    email: string;
  } | null;
}

export interface BusinessRedemptionsResponse {
  redemptions: BusinessRedemptionItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  summary: {
    total_redemptions: number;
    pending_count: number;
    validated_count: number;
    expired_count: number;
    cancelled_count: number;
  };
}

export interface ValidateRedemptionResponse {
  success: boolean;
  message: string;
  redemption: {
    id: string;
    status: string;
    validated_at: string;
    validated_by: string;
  };
}

export const redemptionService = {
  redeemDeal: async (dealId: string): Promise<RedemptionResponse> => {
    const response = await apiClient.post<RedemptionResponse>(`/redemptions/${dealId}`, {});
    return response;
  },

  getUserRedemptions: async (page: number = 1, limit: number = 20): Promise<RedemptionsListResponse> => {
    const response = await apiClient.get<RedemptionsListResponse>(
      `/redemptions?page=${page}&limit=${limit}`
    );
    return response;
  },

  getRedemptionDetails: async (redemptionId: string): Promise<UserRedemption> => {
    const response = await apiClient.get<UserRedemption>(`/redemptions/${redemptionId}`);
    return response;
  },

  // Business owner methods
  getBusinessRedemptions: async (
    businessId: string,
    status?: RedemptionStatus,
    page: number = 1,
    limit: number = 20
  ): Promise<BusinessRedemptionsResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (status) {
      params.append('status', status);
    }

    const response = await apiClient.get<BusinessRedemptionsResponse>(
      `/redemptions/business/${businessId}?${params.toString()}`
    );
    return response;
  },

  validateRedemption: async (redemptionId: string): Promise<ValidateRedemptionResponse> => {
    const response = await apiClient.post<ValidateRedemptionResponse>('/redemptions/validate', {
      redemption_id: redemptionId,
    });
    return response;
  },
};
