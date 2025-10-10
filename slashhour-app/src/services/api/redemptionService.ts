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
};
