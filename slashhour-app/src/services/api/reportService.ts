import apiClient from './ApiClient';

export interface ReportContentRequest {
  content_type: 'deal' | 'business' | 'review' | 'message' | 'user';
  content_id: string;
  reason: string;
  description?: string;
}

export interface ReportContentResponse {
  id: string;
  reporter_id: string;
  content_type: string;
  content_id: string;
  reason: string;
  description: string | null;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  created_at: string;
}

class ReportService {
  /**
   * Report content (deal, business, review, etc.)
   */
  async reportContent(data: ReportContentRequest): Promise<ReportContentResponse> {
    console.log('🔍 [ReportService] Calling API:', {
      endpoint: '/reports',
      method: 'POST',
      data: data,
    });

    try {
      const response = await apiClient.post('/reports', data);
      console.log('✅ [ReportService] Success:', response);
      return response.data;
    } catch (error: any) {
      console.error('❌ [ReportService] Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        fullURL: error.config?.baseURL + error.config?.url,
        data: error.response?.data,
      });
      throw error;
    }
  }

  /**
   * Report a specific deal
   */
  async reportDeal(dealId: string, reason: string, description?: string): Promise<ReportContentResponse> {
    return this.reportContent({
      content_type: 'deal',
      content_id: dealId,
      reason,
      description,
    });
  }

  /**
   * Report a business
   */
  async reportBusiness(businessId: string, reason: string, description?: string): Promise<ReportContentResponse> {
    return this.reportContent({
      content_type: 'business',
      content_id: businessId,
      reason,
      description,
    });
  }

  /**
   * Report a review
   */
  async reportReview(reviewId: string, reason: string, description?: string): Promise<ReportContentResponse> {
    return this.reportContent({
      content_type: 'review',
      content_id: reviewId,
      reason,
      description,
    });
  }

  /**
   * Report a user
   */
  async reportUser(userId: string, reason: string, description?: string): Promise<ReportContentResponse> {
    return this.reportContent({
      content_type: 'user',
      content_id: userId,
      reason,
      description,
    });
  }
}

export const reportService = new ReportService();
