import { useState } from 'react';
import { businessService } from '../services/api/businessService';
import { logError } from '../config/sentry';
import { trackEvent, AnalyticsEvent } from '../services/analytics';
import { Business } from '../types/models';

interface BusinessHours {
  [key: string]: {
    open: string;
    close: string;
    closed?: boolean;
  };
}

interface EditBusinessFormData {
  business_name: string;
  slug: string;
  description: string;
  category: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  city: string;
  state_province: string;
  country: string;
  postal_code: string;
  latitude?: number;
  longitude?: number;
  hours?: BusinessHours;
}

interface UseEditBusinessProfileReturn {
  formData: EditBusinessFormData;
  isLoading: boolean;
  error: string | null;
  updateField: (field: keyof EditBusinessFormData, value: string) => void;
  setCoordinates: (latitude: number, longitude: number) => void;
  setHours: (hours: BusinessHours) => void;
  handleSave: () => Promise<boolean>;
  resetForm: () => void;
}

export function useEditBusinessProfile(business: Business): UseEditBusinessProfileReturn {
  const [formData, setFormData] = useState<EditBusinessFormData>({
    business_name: business.business_name || '',
    slug: business.slug || '',
    description: business.description || '',
    category: business.category || '',
    phone: business.phone || '',
    email: business.email || '',
    website: business.website || '',
    address: business.address || '',
    city: business.city || '',
    state_province: business.state_province || '',
    country: business.country || '',
    postal_code: business.postal_code || '',
    latitude: business.location?.lat,
    longitude: business.location?.lng,
    hours: business.hours,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = (field: keyof EditBusinessFormData, value: string) => {
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

  const setHours = (hours: BusinessHours) => {
    setFormData((prev) => ({
      ...prev,
      hours,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.business_name.trim()) {
      setError('Business name is required');
      return false;
    }

    if (!formData.slug.trim()) {
      setError('URL slug is required');
      return false;
    }

    if (formData.slug.length < 3 || formData.slug.length > 50) {
      setError('URL slug must be between 3 and 50 characters');
      return false;
    }

    if (!formData.category) {
      setError('Category is required');
      return false;
    }

    if (!formData.address.trim()) {
      setError('Address is required');
      return false;
    }

    if (!formData.city.trim()) {
      setError('City is required');
      return false;
    }

    if (!formData.country.trim()) {
      setError('Country is required');
      return false;
    }

    // Validate email format if provided (trim whitespace first)
    const trimmedEmail = formData.email.trim();
    if (trimmedEmail) {
      // More comprehensive email validation
      // Matches standard email format with proper TLD validation
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

      if (!emailRegex.test(trimmedEmail)) {
        setError('Please enter a valid email address (e.g., name@example.com)');
        return false;
      }

      // Additional check for common typos
      const domain = trimmedEmail.split('@')[1];
      if (domain) {
        // Check for invalid TLDs like .commm, .nett, etc.
        const tld = domain.split('.').pop()?.toLowerCase();
        const commonTLDs = ['com', 'net', 'org', 'edu', 'gov', 'co', 'io', 'ai', 'app', 'dev'];
        const tldLength = tld?.length || 0;

        // TLD should be 2-4 characters for common ones, or warn if suspicious
        if (tldLength > 4 && !commonTLDs.includes(tld || '')) {
          setError('Email domain looks incorrect. Please check for typos (e.g., ".commm" should be ".com")');
          return false;
        }
      }
    }

    // Validate website format if provided (trim whitespace first)
    const trimmedWebsite = formData.website.trim();
    if (trimmedWebsite && !trimmedWebsite.match(/^https?:\/\/.+/)) {
      setError('Website must start with http:// or https://');
      return false;
    }

    return true;
  };

  const handleSave = async (): Promise<boolean> => {
    if (!validateForm()) {
      return false;
    }

    // Trim all string fields and convert empty strings to null
    // This is important because backend @IsOptional() only works with null/undefined, not empty strings
    const cleanData: any = {
      business_name: formData.business_name.trim(),
      slug: formData.slug.trim(),
      description: formData.description.trim() || null,
      category: formData.category,
      phone: formData.phone.trim() || null,
      email: formData.email.trim() || null,
      website: formData.website.trim() || null,
      address: formData.address.trim(),
      city: formData.city.trim(),
      state_province: formData.state_province.trim() || null,
      country: formData.country.trim(),
      postal_code: formData.postal_code.trim() || null,
    };

    // Add location object if both latitude and longitude are present
    if (formData.latitude !== undefined && formData.longitude !== undefined) {
      cleanData.location = {
        lat: formData.latitude,
        lng: formData.longitude,
      };
    }

    // Add hours if present
    if (formData.hours) {
      cleanData.hours = formData.hours;
    }

    // Remove null values to avoid sending them
    const trimmedData = Object.fromEntries(
      Object.entries(cleanData).filter(([_, value]) => value !== null)
    );

    try {
      setIsLoading(true);
      setError(null);

      // Call API to update business - cast trimmed data to Partial<Business>
      await businessService.updateBusiness(business.id, trimmedData as Partial<Business>);

      // Track analytics event
      trackEvent(AnalyticsEvent.BUSINESS_VIEWED, {
        action: 'profile_updated',
        businessId: business.id,
        businessName: formData.business_name,
      });

      return true;
    } catch (err: any) {
      // Handle backend validation errors
      let errorMessage = 'Failed to update business';

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

      setError(errorMessage);
      logError(err, {
        context: 'useEditBusinessProfile',
        businessId: business.id,
        sentData: trimmedData,
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      business_name: business.business_name || '',
      slug: business.slug || '',
      description: business.description || '',
      category: business.category || '',
      phone: business.phone || '',
      email: business.email || '',
      website: business.website || '',
      address: business.address || '',
      city: business.city || '',
      state_province: business.state_province || '',
      country: business.country || '',
      postal_code: business.postal_code || '',
      latitude: business.location?.lat,
      longitude: business.location?.lng,
      hours: business.hours,
    });
    setError(null);
  };

  return {
    formData,
    isLoading,
    error,
    updateField,
    setCoordinates,
    setHours,
    handleSave,
    resetForm,
  };
}
