import { useState } from 'react';
import { businessService, CreateBusinessData } from '../services/api/businessService';
import { logError } from '../config/sentry';
import { trackEvent, AnalyticsEvent } from '../services/analytics';
import { BusinessCategory } from '../types/models';

export interface RegisterBusinessFormData {
  business_name: string;
  category: BusinessCategory | '';
  description: string;
  address: string;
  city: string;
  state_province: string;
  country: string;
  postal_code: string;
  phone: string;
  email: string;
  website: string;
  // GPS coordinates
  latitude?: number;
  longitude?: number;
}

interface UseRegisterBusinessReturn {
  formData: RegisterBusinessFormData;
  isLoading: boolean;
  error: string | null;
  updateField: (field: keyof RegisterBusinessFormData, value: string | number) => void;
  setCoordinates: (latitude: number, longitude: number) => void;
  handleRegister: () => Promise<{ success: boolean; business?: any }>;
  resetForm: () => void;
}

const initialFormData: RegisterBusinessFormData = {
  business_name: '',
  category: '',
  description: '',
  address: '',
  city: '',
  state_province: '',
  country: 'US', // Default to US
  postal_code: '',
  phone: '',
  email: '',
  website: '',
};

export const useRegisterBusiness = (): UseRegisterBusinessReturn => {
  const [formData, setFormData] = useState<RegisterBusinessFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = (field: keyof RegisterBusinessFormData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError(null);
  };

  const setCoordinates = (latitude: number, longitude: number) => {
    setFormData((prev) => ({
      ...prev,
      latitude,
      longitude,
    }));
  };

  const generateSlug = (businessName: string): string => {
    return businessName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  };

  const validateForm = (): boolean => {
    // Required: business_name
    if (!formData.business_name.trim()) {
      setError('Business name is required');
      return false;
    }
    if (formData.business_name.trim().length < 2) {
      setError('Business name must be at least 2 characters');
      return false;
    }
    if (formData.business_name.trim().length > 200) {
      setError('Business name must be less than 200 characters');
      return false;
    }

    // Required: category
    if (!formData.category) {
      setError('Business category is required');
      return false;
    }

    // Required: address
    if (!formData.address.trim()) {
      setError('Business address is required');
      return false;
    }

    // Required: city
    if (!formData.city.trim()) {
      setError('City is required');
      return false;
    }

    // Required: country
    if (!formData.country.trim()) {
      setError('Country is required');
      return false;
    }
    if (formData.country.trim().length !== 2) {
      setError('Country must be a 2-letter code (e.g., US, CA, GB)');
      return false;
    }

    // Validate email if provided
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address');
        return false;
      }
    }

    // Validate website if provided
    if (formData.website.trim()) {
      try {
        new URL(formData.website);
      } catch {
        setError('Please enter a valid website URL (e.g., https://example.com)');
        return false;
      }
    }

    return true;
  };

  const handleRegister = async (): Promise<{ success: boolean; business?: any }> => {
    if (!validateForm()) {
      return { success: false };
    }

    try {
      setIsLoading(true);
      setError(null);

      // Generate slug from business name
      const slug = generateSlug(formData.business_name);

      if (!slug) {
        setError('Could not generate valid URL slug from business name. Please use alphanumeric characters.');
        return { success: false };
      }

      console.log('🏪 Registering business:', {
        name: formData.business_name,
        slug,
        category: formData.category,
        city: formData.city,
        coordinates: formData.latitude && formData.longitude ?
          { lat: formData.latitude, lng: formData.longitude } :
          'Using default coordinates',
      });

      // Use GPS coordinates if available, otherwise use default
      const location = formData.latitude && formData.longitude
        ? {
            lat: formData.latitude,
            lng: formData.longitude,
          }
        : {
            lat: 40.7128, // New York coordinates as fallback
            lng: -74.0060,
          };

      // Prepare data for API
      const businessData: CreateBusinessData = {
        business_name: formData.business_name.trim(),
        slug,
        category: formData.category as string,
        address: formData.address.trim(),
        city: formData.city.trim(),
        country: formData.country.trim().toUpperCase(),
        location,
        description: formData.description.trim() || undefined,
        state_province: formData.state_province.trim() || undefined,
        postal_code: formData.postal_code.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
        website: formData.website.trim() || undefined,
      };

      // Remove undefined values
      const cleanedBusinessData = Object.fromEntries(
        Object.entries(businessData).filter(([_, value]) => value !== undefined)
      ) as CreateBusinessData;

      console.log('🌐 Sending business registration to API');

      // Call API to create business
      const createdBusiness = await businessService.createBusiness(cleanedBusinessData);

      console.log('✅ Business registered successfully:', {
        businessId: createdBusiness.id,
        businessName: createdBusiness.business_name,
      });

      // Track analytics event
      trackEvent(AnalyticsEvent.BUSINESS_VIEWED, {
        action: 'business_registered',
        businessId: createdBusiness.id,
        businessName: formData.business_name,
        category: formData.category,
      });

      return { success: true, business: createdBusiness };
    } catch (err: any) {
      console.error('❌ Business registration error:', err);

      let errorMessage = 'Failed to register business';

      if (err.response?.data?.message) {
        // If it's an array of validation errors, join them
        if (Array.isArray(err.response.data.message)) {
          errorMessage = err.response.data.message.join(', ');
        } else {
          errorMessage = err.response.data.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Handle specific error cases
      if (errorMessage.includes('slug') && errorMessage.includes('already exists')) {
        errorMessage = 'A business with this name already exists. Please try a different name.';
      }

      setError(errorMessage);
      logError(err, {
        context: 'useRegisterBusiness',
        businessName: formData.business_name,
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
    setCoordinates,
    handleRegister,
    resetForm,
  };
};
