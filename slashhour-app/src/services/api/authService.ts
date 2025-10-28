import apiClient from './ApiClient';
import { User } from '../../types/models';

interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface LoginData {
  emailOrPhone: string;
  password: string;
}

export const authService = {
  login: async (data: LoginData): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);

    // Token will be set by useAuthStore.loginSuccess()
    // No need to set it here to avoid duplication

    return response;
  },

  logout: () => {
    // Token will be cleared by useAuthStore.logout()
    // This is kept for backwards compatibility
    apiClient.clearToken();
  },
};
