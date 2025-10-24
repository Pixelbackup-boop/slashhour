import { useState } from 'react';
import { dealService } from '../services/api/dealService';
import { logError } from '../config/sentry';
import { trackEvent, AnalyticsEvent } from '../services/analytics';
import { BusinessCategory, Deal } from '../types/models';

interface EditDealFormData {
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
  // For existing images (URLs from server)
  existingImages: { url: string; order: number }[];
  // For new images (local URIs to upload)
  newImages: { uri: string; caption?: string }[];
}

interface UseEditDealReturn {
  formData: EditDealFormData;
  isLoading: boolean;
  error: string | null;
  updateField: (field: keyof EditDealFormData, value: any) => void;
  addTag: (tag: string) => void;
  removeTag: (index: number) => void;
  addTerm: (term: string) => void;
  removeTerm: (index: number) => void;
  addNewImage: (uri: string) => void;
  removeNewImage: (index: number) => void;
  removeExistingImage: (index: number) => void;
  handleUpdate: () => Promise<boolean>;
}

export function useEditDeal(deal: Deal, businessId: string): UseEditDealReturn {
  const [formData, setFormData] = useState<EditDealFormData>({
    title: deal.title,
    description: deal.description || '',
    original_price: deal.original_price?.toString() || '',
    discounted_price: deal.discounted_price?.toString() || '',
    category: deal.category || '',
    tags: deal.tags || [],
    expires_at: deal.expires_at ? new Date(deal.expires_at) : null,
    is_flash_deal: deal.is_flash_deal || false,
    visibility_radius_km: deal.visibility_radius_km?.toString() || '5',
    quantity_available: deal.quantity_available?.toString() || '',
    max_per_user: deal.max_per_user?.toString() || '1',
    terms_conditions: deal.terms_conditions || [],
    existingImages: deal.images || [],
    newImages: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = (field: keyof EditDealFormData, value: any) => {
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

  const addNewImage = (uri: string) => {
    setFormData((prev) => ({
      ...prev,
      newImages: [...prev.newImages, { uri }],
    }));
  };

  const removeNewImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      newImages: prev.newImages.filter((_, i) => i !== index),
    }));
  };

  const removeExistingImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      existingImages: prev.existingImages.filter((_, i) => i !== index),
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

    // Validate expiry date is in the future (allow current date for editing)
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const expiryDate = new Date(formData.expires_at);
    expiryDate.setHours(0, 0, 0, 0);

    if (expiryDate < now) {
      setError('Expiry date must be today or in the future');
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

  const handleUpdate = async (): Promise<boolean> => {
    if (!validateForm()) {
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      if (__DEV__) {
        console.log('📝 Updating deal with', formData.newImages.length, 'new images');
      }

      // Extract URIs from new images
      const imageUris = formData.newImages.map((img) => img.uri);

      // Prepare update data for multipart
      const updateData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        original_price: parseFloat(formData.original_price),
        discounted_price: parseFloat(formData.discounted_price),
        category: formData.category as BusinessCategory,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        starts_at: deal.starts_at, // Keep original start date
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
        existingImages: formData.existingImages, // Keep existing images
        imageUris: imageUris.length > 0 ? imageUris : undefined, // Add new images
      };

      // Remove undefined values
      const cleanedUpdateData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined)
      ) as any;

      // Call multipart update API
      const updatedDeal = await dealService.updateDealWithMultipart(deal.id, cleanedUpdateData);

      if (__DEV__) {
        console.log('✅ Deal updated:', updatedDeal.id);
      }

      // Track analytics event
      trackEvent(AnalyticsEvent.BUSINESS_VIEWED, {
        action: 'deal_updated',
        businessId: businessId,
        dealId: deal.id,
        dealTitle: formData.title,
        category: formData.category,
      });

      return true;
    } catch (err: any) {
      console.error('❌ Error updating deal:', err);

      let errorMessage = 'Failed to update deal';
      if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      logError(err, {
        context: 'useEditDeal',
        businessId: businessId,
        dealId: deal.id,
      });
      return false;
    } finally {
      setIsLoading(false);
    }
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
    addNewImage,
    removeNewImage,
    removeExistingImage,
    handleUpdate,
  };
}
