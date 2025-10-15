import { useState } from 'react';
import apiClient from '../services/api/ApiClient';
import { logError } from '../config/sentry';
import { trackEvent, AnalyticsEvent } from '../services/analytics';

export interface SignUpFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface UseSignUpReturn {
  formData: SignUpFormData;
  isLoading: boolean;
  error: string | null;
  updateField: (field: keyof SignUpFormData, value: string) => void;
  handleSignUp: () => Promise<{ success: boolean; data?: any }>;
  resetForm: () => void;
}

const initialFormData: SignUpFormData = {
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
};

export const useSignUp = (): UseSignUpReturn => {
  const [formData, setFormData] = useState<SignUpFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = (field: keyof SignUpFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError(null);
  };

  const validateForm = (): boolean => {
    // Name validation
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (formData.name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return false;
    }

    // Email validation
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Phone validation (optional but if provided, must be valid)
    if (formData.phone.trim()) {
      const phoneRegex = /^\+?[1-9]\d{1,14}$/; // E.164 format
      if (!phoneRegex.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
        setError('Please enter a valid phone number');
        return false;
      }
    }

    // Password validation
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSignUp = async (): Promise<{ success: boolean; data?: any }> => {
    if (!validateForm()) {
      return { success: false };
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('📝 Signing up user:', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      });

      // Call backend registration API
      const response = await apiClient.post<{
        user: any;
        accessToken: string;
        refreshToken: string;
      }>('/auth/register', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        password: formData.password,
        userType: 'consumer', // All new users start as consumers
        username: formData.email.split('@')[0], // Generate username from email
      });

      console.log('✅ Sign up successful:', {
        userId: response.user?.id,
        email: response.user?.email,
      });

      // Track analytics
      trackEvent(AnalyticsEvent.USER_REGISTERED, {
        userType: 'consumer',
        email: formData.email,
        hasPhone: !!formData.phone,
      });

      return { success: true, data: response };
    } catch (err: any) {
      console.error('❌ Sign up error:', err);

      let errorMessage = 'Failed to create account';

      if (err.response?.data?.message) {
        if (Array.isArray(err.response.data.message)) {
          errorMessage = err.response.data.message.join(', ');
        } else {
          errorMessage = err.response.data.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Handle specific error cases
      if (errorMessage.includes('already exists')) {
        errorMessage = 'An account with this email or phone already exists';
      }

      setError(errorMessage);
      logError(err, {
        context: 'useSignUp',
        email: formData.email,
      });

      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setError(null);
  };

  return {
    formData,
    isLoading,
    error,
    updateField,
    handleSignUp,
    resetForm,
  };
};
