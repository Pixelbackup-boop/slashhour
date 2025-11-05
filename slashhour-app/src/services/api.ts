/**
 * API Service
 * Centralized API client for all backend communication
 * Following TypeScript 2025 guidelines
 *
 * Uses the existing ApiClient singleton for authentication
 */

import apiClient from './api/ApiClient';

// ============================================
// Verification API
// ============================================

interface SendVerificationResponse {
  message: string;
}

interface VerifyCodeRequest {
  code: string;
}

interface VerifyCodeResponse {
  success: boolean;
  message: string;
}

export const verificationApi = {
  /**
   * Send email verification code
   */
  async sendEmailVerification(): Promise<SendVerificationResponse> {
    return apiClient.post<SendVerificationResponse>(
      '/users/profile/verify-email/send',
      {}
    );
  },

  /**
   * Verify email code
   */
  async verifyEmailCode(code: string): Promise<VerifyCodeResponse> {
    return apiClient.post<VerifyCodeResponse>(
      '/users/profile/verify-email',
      { code } as VerifyCodeRequest
    );
  },

  /**
   * Send phone verification code
   */
  async sendPhoneVerification(): Promise<SendVerificationResponse> {
    return apiClient.post<SendVerificationResponse>(
      '/users/profile/verify-phone/send',
      {}
    );
  },

  /**
   * Verify phone code
   */
  async verifyPhoneCode(code: string): Promise<VerifyCodeResponse> {
    return apiClient.post<VerifyCodeResponse>(
      '/users/profile/verify-phone',
      { code } as VerifyCodeRequest
    );
  },
};

// ============================================
// Users API
// ============================================

interface UserProfile {
  id: string;
  email: string | null;
  phone: string | null;
  username: string;
  name: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  userType: 'consumer' | 'business';
  createdAt: string;
}

interface UpdateProfileRequest {
  name?: string;
  username?: string;
  avatarUrl?: string;
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

interface ChangeEmailRequest {
  newEmail: string;
}

interface ChangePhoneRequest {
  newPhone: string;
}

export const usersApi = {
  /**
   * Get current user profile
   */
  async getProfile(): Promise<UserProfile> {
    return apiClient.get<UserProfile>('/users/profile');
  },

  /**
   * Update user profile
   */
  async updateProfile(updates: UpdateProfileRequest): Promise<UserProfile> {
    return apiClient.patch<UserProfile>('/users/profile', updates);
  },

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await apiClient.post<void>('/users/profile/password', data);
  },

  /**
   * Change email
   */
  async changeEmail(newEmail: string): Promise<UserProfile> {
    const response = await apiClient.post<{ user: UserProfile }>('/users/profile/email', {
      newEmail,
    } as ChangeEmailRequest);
    return response.user;
  },

  /**
   * Change phone
   */
  async changePhone(newPhone: string): Promise<UserProfile> {
    const response = await apiClient.post<{ user: UserProfile }>('/users/profile/phone', {
      newPhone,
    } as ChangePhoneRequest);
    return response.user;
  },

  /**
   * Deactivate account
   */
  async deactivateAccount(): Promise<void> {
    await apiClient.post<void>('/users/deactivate', {});
  },

  /**
   * Schedule account deletion
   */
  async scheduleDeletion(): Promise<void> {
    await apiClient.post<void>('/users/delete-permanently', {});
  },
};
