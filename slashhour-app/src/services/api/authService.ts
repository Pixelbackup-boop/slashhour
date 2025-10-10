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

    // Set the token in the API client for future requests
    apiClient.setToken(response.accessToken);

    return response;
  },

  logout: () => {
    apiClient.clearToken();
  },
};
