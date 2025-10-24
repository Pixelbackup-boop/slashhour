import apiClient from './ApiClient';
import { fetch as expoFetch } from 'expo/fetch';
import { Deal } from '../../types/models';
import { API_BASE_URL } from '../../utils/constants';
import {
  buildDealFormData,
  CreateDealData,
  CreateDealFormData,
  UpdateDealData,
} from '../../utils/formDataBuilder';

export const dealService = {
  /**
   * @deprecated Use createDealWithMultipart instead for better performance
   * Create a new deal for a business (OLD METHOD - uses base64)
   */
  createDeal: async (businessId: string, data: CreateDealData): Promise<Deal> => {
    const response = await apiClient.post<{ deal: Deal }>(`/deals/business/${businessId}`, data);
    return response.deal;
  },

  /**
   * NEW 2025 METHOD: Create deal with native multipart/form-data upload
   * Uses File class + FormData for native-like performance (3-5x faster)
   */
  createDealWithMultipart: async (businessId: string, data: CreateDealFormData): Promise<Deal> => {
    const token = apiClient.getToken();

    if (!token) {
      throw new Error('No authentication token found');
    }

    // Build FormData using utility
    const formData = buildDealFormData(data);

    if (__DEV__) {
      console.log('🚀 Sending multipart request with', data.imageUris?.length || 0, 'images');
    }

    // Use expo/fetch for proper FormData + File support
    const response = await expoFetch(`${API_BASE_URL}/deals/business/${businessId}/multipart`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type - let browser set it with boundary
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to create deal' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (__DEV__) {
      console.log('✅ Deal created successfully');
    }

    return result.deal;
  },

  /**
   * Get deal by ID
   */
  getDealById: async (dealId: string): Promise<Deal> => {
    const response = await apiClient.get<{ deal: Deal }>(`/deals/${dealId}`);
    return response.deal;
  },

  /**
   * @deprecated Use updateDealWithMultipart for better image handling
   * Update a deal (OLD METHOD - JSON only, no new images)
   */
  updateDeal: async (dealId: string, data: Partial<CreateDealData>): Promise<Deal> => {
    const response = await apiClient.put<{ deal: Deal }>(`/deals/${dealId}`, data);
    return response.deal;
  },

  /**
   * NEW 2025 METHOD: Update deal with native multipart/form-data upload
   * Allows adding new images during update
   */
  updateDealWithMultipart: async (
    dealId: string,
    data: CreateDealFormData & { existingImages?: Array<{ url: string; order: number }> },
  ): Promise<Deal> => {
    const token = apiClient.getToken();

    if (!token) {
      throw new Error('No authentication token found');
    }

    // Build FormData using utility
    const formData = buildDealFormData(data);

    // Add existing images as JSON array
    if (data.existingImages && data.existingImages.length > 0) {
      formData.append('existingImages', JSON.stringify(data.existingImages));
    }

    if (__DEV__) {
      console.log('🔄 Updating deal with', data.imageUris?.length || 0, 'new images');
      console.log('📦 Keeping', data.existingImages?.length || 0, 'existing images');
    }

    // Use expo/fetch for proper FormData + File support
    const response = await expoFetch(`${API_BASE_URL}/deals/${dealId}/multipart`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type - let browser set it with boundary
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to update deal' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (__DEV__) {
      console.log('✅ Deal updated successfully');
    }

    return result.deal;
  },

  /**
   * Delete a deal
   */
  deleteDeal: async (dealId: string): Promise<void> => {
    await apiClient.delete(`/deals/${dealId}`);
  },

  /**
   * Get deals for a specific business
   */
  getBusinessDeals: async (businessId: string): Promise<Deal[]> => {
    const response = await apiClient.get<{ deals: Deal[] }>(`/businesses/${businessId}/deals`);
    return response.deals;
  },
};
