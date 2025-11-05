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

      // Check if user has scheduled deletion (30-day grace period)
      if (response.user.status === 'pending_deletion') {
        // Calculate days remaining in grace period
        let daysRemainingText = '';
        if (response.user.scheduled_deletion_date) {
          const deletionDate = new Date(response.user.scheduled_deletion_date);
          const now = new Date();
          const daysRemaining = Math.ceil((deletionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          daysRemainingText = `\n\n⏰ Your account will be permanently deleted in ${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'}.\n`;
        }

        // Show reactivation prompt (like Facebook/Instagram)
        Alert.alert(
          'Account Scheduled for Deletion',
          'You previously scheduled your account for permanent deletion. ' +
          'Do you want to cancel the deletion and continue logging in?' +
          daysRemainingText +
          '\n⚠️ If you continue:\n' +
          '• Your deletion will be cancelled\n' +
          '• Your account will be fully restored\n' +
          '• You can use the app normally',
          [
            {
              text: 'Cancel Deletion & Login',
              onPress: async () => {
                try {
                  // Cancel the scheduled deletion via API
                  await authService.cancelDeletion();

                  // Complete login with restored account
                  loginSuccess(
                    { ...response.user, status: 'active' },
                    response.accessToken,
                    response.refreshToken
                  );

                  // Track login event
                  const loginMethod = emailOrPhone.includes('@')
                    ? 'email'
                    : emailOrPhone.includes('+')
                    ? 'phone'
                    : 'username';
                  trackLogin(loginMethod);

                  Alert.alert(
                    'Welcome Back!',
                    'Your account deletion has been cancelled. Your account is fully restored.'
                  );
                } catch (error) {
                  loginFailure('Failed to cancel deletion. Please try again.');
                  logError(error, { context: 'cancelDeletion' });
                }
              },
            },
            {
              text: 'Keep Deletion Scheduled',
              style: 'cancel',
              onPress: () => {
                // Don't complete login, keep account scheduled for deletion
                loginFailure('Account remains scheduled for deletion');
              },
            },
          ],
          { cancelable: false }
        );
        return;
      }

      // Check if user account is deactivated (temporary deactivation)
      if (response.user.status === 'inactive') {
        // Automatically reactivate on login
        loginSuccess(
          { ...response.user, status: 'active' },
          response.accessToken,
          response.refreshToken
        );

        // Track login event
        const loginMethod = emailOrPhone.includes('@')
          ? 'email'
          : emailOrPhone.includes('+')
          ? 'phone'
          : 'username';
        trackLogin(loginMethod);

        Alert.alert('Welcome Back!', 'Your account has been reactivated.');
        return;
      }

      // Normal login flow
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
