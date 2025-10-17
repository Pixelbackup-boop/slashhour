import apiClient from './ApiClient';
import { fetch as expoFetch } from 'expo/fetch';
import { File } from 'expo-file-system';
import { API_BASE_URL } from '../../utils/constants';
import { Business, Deal } from '../../types/models';

interface BusinessStatsResponse {
  activeDealCount: number;
  followerCount: number;
  totalDealsSold: number;
}

export const businessService = {
  /**
   * Get business by ID
   */
  getBusinessById: async (businessId: string): Promise<Business> => {
    const response = await apiClient.get<Business>(`/businesses/${businessId}`);
    return response;
  },

  /**
   * Get all active deals from a business
   */
  getBusinessDeals: async (businessId: string): Promise<Deal[]> => {
    const response = await apiClient.get<{ deals: Deal[] }>(`/businesses/${businessId}/deals`);
    return response.deals;
  },

  /**
   * Get business statistics
   */
  getBusinessStats: async (businessId: string): Promise<BusinessStatsResponse> => {
    const response = await apiClient.get<BusinessStatsResponse>(`/businesses/${businessId}/stats`);
    return response;
  },

  /**
   * Get user's businesses (businesses they own)
   */
  getMyBusinesses: async (): Promise<Business[]> => {
    const response = await apiClient.get<{ businesses: Business[] }>('/businesses/my-businesses');
    return response.businesses;
  },

  /**
   * Create a new business
   */
  createBusiness: async (data: CreateBusinessData): Promise<Business> => {
    const response = await apiClient.post<{ business: Business }>('/businesses', data);
    return response.business;
  },

  /**
   * Update business profile
   */
  updateBusiness: async (businessId: string, data: Partial<Business>): Promise<Business> => {
    const response = await apiClient.put<{ business: Business }>(`/businesses/${businessId}`, data);
    return response.business;
  },

  /**
   * Upload business logo
   */
  uploadLogo: async (businessId: string, imageUri: string): Promise<{ message: string; business: Business }> => {
    const token = await apiClient.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const formData = new FormData();
    const file = new File(imageUri);
    formData.append('logo', file);

    const response = await expoFetch(`${API_BASE_URL}/businesses/${businessId}/logo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Failed to upload logo');
    }

    return await response.json();
  },

  /**
   * Upload business cover image
   */
  uploadCover: async (businessId: string, imageUri: string): Promise<{ message: string; business: Business }> => {
    const token = await apiClient.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const formData = new FormData();
    const file = new File(imageUri);
    formData.append('cover', file);

    const response = await expoFetch(`${API_BASE_URL}/businesses/${businessId}/cover`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Failed to upload cover image');
    }

    return await response.json();
  },
};

export interface CreateBusinessData {
  business_name: string;
  slug: string;
  description?: string;
  category: string;
  subcategory?: string;
  location: {
    lat: number;
    lng: number;
  };
  address: string;
  city: string;
  state_province?: string;
  country: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  hours?: Record<string, { open: string; close: string; closed?: boolean }>;
  logo_url?: string;
  cover_image_url?: string;
}
