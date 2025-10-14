import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice';
import { authService } from '../services/api/authService';
import { RootState } from '../store/store';
import { trackLogin } from '../services/analytics';
import { logError } from '../config/sentry';

interface UseLoginReturn {
  isLoading: boolean;
  error: string | null;
  handleLogin: (emailOrPhone: string, password: string) => Promise<void>;
}

export const useLogin = (): UseLoginReturn => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const handleLogin = useCallback(async (emailOrPhone: string, password: string) => {
    // Validation
    if (!emailOrPhone || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    try {
      dispatch(loginStart());
      const response = await authService.login({ emailOrPhone, password });

      dispatch(
        loginSuccess({
          user: response.user,
          token: response.accessToken,
          refreshToken: response.refreshToken,
        })
      );

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
      dispatch(loginFailure(errorMessage));
      Alert.alert('Login Failed', errorMessage);
      logError(err, { context: 'useLogin', emailOrPhone });
    }
  }, [dispatch]);

  return {
    isLoading,
    error,
    handleLogin,
  };
};
