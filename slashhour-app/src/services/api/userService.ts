import apiClient from './ApiClient';
import { fetch as expoFetch } from 'expo/fetch';
import { File } from 'expo-file-system';
import { API_BASE_URL } from '../../utils/constants';
import { User } from '../../types/models';

export interface UpdateProfileData {
  name?: string;
}

export const userService = {
  /**
   * Update user profile (name/bio)
   */
  updateProfile: async (data: UpdateProfileData): Promise<User> => {
    const response = await apiClient.patch<User>('/users/profile', data);
    return response;
  },

  /**
   * Upload avatar image with multipart/form-data
   */
  uploadAvatar: async (imageUri: string): Promise<{ message: string; user: User }> => {
    const token = apiClient.getToken();

    if (!token) {
      throw new Error('No authentication token found');
    }

    // Create FormData
    const formData = new FormData();

    // Add image using File class (native-like)
    const file = new File(imageUri);
    formData.append('avatar', file);

    if (__DEV__) {
      console.log('📸 Uploading avatar image');
    }

    // Use expo/fetch for proper FormData + File support
    const response = await expoFetch(`${API_BASE_URL}/users/profile/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to upload avatar' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (__DEV__) {
      console.log('✅ Avatar uploaded successfully');
    }

    return result;
  },
};
