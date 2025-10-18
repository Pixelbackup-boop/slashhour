import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useAuthStore } from '../stores/useAuthStore';
import { authService } from '../services/api/authService';
import { trackLogin } from '../services/analytics';
import { logError } from '../config/sentry';

interface UseLoginReturn {
  isLoading: boolean;
  error: string | null;
  handleLogin: (emailOrPhone: string, password: string) => Promise<void>;
}

export const useLogin = (): UseLoginReturn => {
  const { isLoading, error, loginStart, loginSuccess, loginFailure } = useAuthStore();

  const handleLogin = useCallback(async (emailOrPhone: string, password: string) => {
    // Validation
    if (!emailOrPhone || !password) {
      loginFailure('Please enter email and password');
      return;
    }

    try {
      loginStart();
      const response = await authService.login({ emailOrPhone, password });

      loginSuccess(response.user, response.accessToken, response.refreshToken);

      // Track login event
      const loginMethod = emailOrPhone.includes('@')
        ? 'email'
        : emailOrPhone.includes('+')
        ? 'phone'
        : 'username';
      trackLogin(loginMethod);

      Alert.alert('Success', 'Logged in successfully!');
    } catch (err: any) {
      // Extract error message from different possible structures
      let errorMessage = 'Login failed. Please try again.';

      if (err.response?.data?.message) {
        // NestJS standard error format
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        // Network or other errors
        errorMessage = err.message;
      }

      loginFailure(errorMessage);

      // Only log unexpected errors (not authentication failures or validation errors)
      // 401 = Unauthorized (wrong credentials)
      // 400 = Bad Request (validation errors like short password)
      if (err.response?.status !== 401 && err.response?.status !== 400) {
        logError(err, { context: 'useLogin', emailOrPhone });
      }
    }
  }, [loginStart, loginSuccess, loginFailure]);

  return {
    isLoading,
    error,
    handleLogin,
  };
};
