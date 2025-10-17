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
      Alert.alert('Error', 'Please enter email and password');
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
      console.error('Login failed:', err);
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
      loginFailure(errorMessage);
      Alert.alert('Login Failed', errorMessage);
      logError(err, { context: 'useLogin', emailOrPhone });
    }
  }, [loginStart, loginSuccess, loginFailure]);

  return {
    isLoading,
    error,
    handleLogin,
  };
};
