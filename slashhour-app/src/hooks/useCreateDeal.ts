import { useState } from 'react';
import { dealService, CreateDealData, CreateDealFormData as CreateDealMultipartData } from '../services/api/dealService';
import { logError } from '../config/sentry';
import { trackEvent, AnalyticsEvent } from '../services/analytics';
import { BusinessCategory } from '../types/models';
import { convertValidDaysToBinary } from '../utils/dealUtils';

interface CreateDealFormData {
  title: string;
  description: string;
  original_price: string;
  discounted_price: string;
  category: BusinessCategory | '';
  tags: string[];
  expires_at: Date | null;
  is_flash_deal: boolean;
  visibility_radius_km: string;
  quantity_available: string;
  max_per_user: string;
  terms_conditions: string[];
  valid_days: string;
  images: { uri: string; caption?: string }[];
}

interface UseCreateDealReturn {
  formData: CreateDealFormData;
  isLoading: boolean;
  error: string | null;
  updateField: (field: keyof CreateDealFormData, value: any) => void;
  addTag: (tag: string) => void;
  removeTag: (index: number) => void;
  addTerm: (term: string) => void;
  removeTerm: (index: number) => void;
  addImage: (uri: string) => void;
  removeImage: (index: number) => void;
  handleCreate: () => Promise<boolean>;
  resetForm: () => void;
}

const initialFormData: CreateDealFormData = {
  title: '',
  description: '',
  original_price: '',
  discounted_price: '',
  category: '',
  tags: [],
  expires_at: null,
  is_flash_deal: false,
  visibility_radius_km: '5',
  quantity_available: '',
  max_per_user: '1',
  terms_conditions: [],
  valid_days: 'all',
  images: [],
};

export function useCreateDeal(businessId: string): UseCreateDealReturn {
  const [formData, setFormData] = useState<CreateDealFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = (field: keyof CreateDealFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError(null);
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag.trim()],
      }));
    }
  };

  const removeTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  const addTerm = (term: string) => {
    if (term.trim() && !formData.terms_conditions.includes(term.trim())) {
      setFormData((prev) => ({
        ...prev,
        terms_conditions: [...prev.terms_conditions, term.trim()],
      }));
    }
  };

  const removeTerm = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      terms_conditions: prev.terms_conditions.filter((_, i) => i !== index),
    }));
  };

  const addImage = (uri: string) => {
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, { uri }],
    }));
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const validateForm = (): boolean => {
    // Required: title
    if (!formData.title.trim()) {
      setError('Deal title is required');
      return false;
    }

    // Required: category
    if (!formData.category) {
      setError('Category is required');
      return false;
    }

    // Required: original_price
    const originalPrice = parseFloat(formData.original_price);
    if (!formData.original_price.trim() || isNaN(originalPrice) || originalPrice <= 0) {
      setError('Original price must be a positive number');
      return false;
    }

    // Required: discounted_price
    const discountedPrice = parseFloat(formData.discounted_price);
    if (!formData.discounted_price.trim() || isNaN(discountedPrice) || discountedPrice <= 0) {
      setError('Discounted price must be a positive number');
      return false;
    }

    // Validate discounted price is less than original price
    if (discountedPrice >= originalPrice) {
      setError('Discounted price must be less than original price');
      return false;
    }

    // Required: expires_at
    if (!formData.expires_at) {
      setError('Expiry date is required');
      return false;
    }

    // Validate expiry date is in the future
    const now = new Date();
    if (formData.expires_at <= now) {
      setError('Expiry date must be in the future');
      return false;
    }

    // Validate visibility_radius_km if provided
    if (formData.visibility_radius_km.trim()) {
      const radius = parseFloat(formData.visibility_radius_km);
      if (isNaN(radius) || radius <= 0) {
        setError('Visibility radius must be a positive number');
        return false;
      }
    }

    // Validate quantity_available if provided
    if (formData.quantity_available.trim()) {
      const quantity = parseInt(formData.quantity_available, 10);
      if (isNaN(quantity) || quantity <= 0) {
        setError('Quantity available must be a positive number');
        return false;
      }
    }

    // Validate max_per_user if provided
    if (formData.max_per_user.trim()) {
      const maxPerUser = parseInt(formData.max_per_user, 10);
      if (isNaN(maxPerUser) || maxPerUser <= 0) {
        setError('Max per user must be a positive number');
        return false;
      }
    }

    return true;
  };

  const handleCreate = async (): Promise<boolean> => {
    if (!validateForm()) {
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      if (__DEV__) {
        console.log('📸 Creating deal with', formData.images.length, 'images');
      }

      // Prepare data for NEW multipart API
      const dealData: CreateDealMultipartData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        original_price: parseFloat(formData.original_price),
        discounted_price: parseFloat(formData.discounted_price),
        category: formData.category as BusinessCategory,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        starts_at: new Date(), // Set start date to now
        expires_at: formData.expires_at!,
        is_flash_deal: formData.is_flash_deal,
        visibility_radius_km: formData.visibility_radius_km.trim()
          ? parseFloat(formData.visibility_radius_km)
          : undefined,
        quantity_available: formData.quantity_available.trim()
          ? parseInt(formData.quantity_available, 10)
          : undefined,
        max_per_user: formData.max_per_user.trim()
          ? parseInt(formData.max_per_user, 10)
          : undefined,
        terms_conditions: formData.terms_conditions.length > 0 ? formData.terms_conditions : undefined,
        valid_days: formData.valid_days ? convertValidDaysToBinary(formData.valid_days) : undefined,
        imageUris: formData.images.length > 0 ? formData.images.map(img => img.uri) : undefined,
      };

      // Remove undefined values
      const cleanedDealData = Object.fromEntries(
        Object.entries(dealData).filter(([_, value]) => value !== undefined)
      ) as CreateDealMultipartData;

      // Call multipart API for native-like performance
      const createdDeal = await dealService.createDealWithMultipart(businessId, cleanedDealData);

      if (__DEV__) {
        console.log('✅ Deal created:', createdDeal.id);
      }

      // Track analytics event
      trackEvent(AnalyticsEvent.BUSINESS_VIEWED, {
        action: 'deal_created',
        businessId: businessId,
        dealId: createdDeal.id,
        dealTitle: formData.title,
        category: formData.category,
        isFlashDeal: formData.is_flash_deal,
      });

      return true;
    } catch (err: any) {
      console.error('❌ Error creating deal:', err);

      // Handle backend validation errors
      let errorMessage = 'Failed to create deal';

      if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      logError(err, {
        context: 'useCreateDeal - multipart',
        businessId: businessId,
      });
      return false;
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
    addTag,
    removeTag,
    addTerm,
    removeTerm,
    addImage,
    removeImage,
    handleCreate,
    resetForm,
  };
}
