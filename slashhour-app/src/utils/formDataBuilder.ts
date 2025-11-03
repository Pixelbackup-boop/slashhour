import { File } from 'expo-file-system';
import { Deal, BusinessCategory } from '../types/models';

export interface CreateDealData {
  title: string;
  description?: string;
  original_price: number;
  discounted_price: number;
  category: BusinessCategory;
  tags?: string[];
  starts_at: Date | string;
  expires_at: Date | string;
  is_flash_deal?: boolean;
  visibility_radius_km?: number;
  quantity_available?: number;
  max_per_user?: number;
  terms_conditions?: string[];
  valid_days?: string;
  images?: Array<{ url: string; caption?: string; order: number }>;
}

export interface CreateDealFormData extends Omit<CreateDealData, 'images'> {
  imageUris?: string[]; // URIs from ImagePicker
}

export interface UpdateDealData extends Partial<CreateDealData> {
  imageUris?: string[];
}

/**
 * Build FormData from deal data for multipart upload
 * @param data Deal form data with imageUris
 * @returns FormData ready for upload
 */
export function buildDealFormData(data: CreateDealFormData): FormData {
  const formData = new FormData();

  // Append required text fields
  formData.append('title', data.title);
  formData.append('original_price', data.original_price.toString());
  formData.append('discounted_price', data.discounted_price.toString());
  formData.append('category', data.category);
  formData.append('starts_at', data.starts_at.toString());
  formData.append('expires_at', data.expires_at.toString());
  formData.append('is_flash_deal', data.is_flash_deal ? 'true' : 'false');

  // Append optional text fields
  if (data.description) formData.append('description', data.description);
  if (data.tags) formData.append('tags', JSON.stringify(data.tags));
  if (data.visibility_radius_km) formData.append('visibility_radius_km', data.visibility_radius_km.toString());
  if (data.quantity_available) formData.append('quantity_available', data.quantity_available.toString());
  if (data.max_per_user) formData.append('max_per_user', data.max_per_user.toString());
  if (data.terms_conditions) formData.append('terms_conditions', JSON.stringify(data.terms_conditions));
  if (data.valid_days) formData.append('valid_days', data.valid_days);

  // Append images using File class (native-like)
  if (data.imageUris && data.imageUris.length > 0) {
    if (__DEV__) {
      console.log('📸 Adding images to FormData:');
      console.log(`   - Number of images: ${data.imageUris.length}`);
      console.log(`   - Image URIs:`, data.imageUris);
    }

    data.imageUris.forEach((uri, index) => {
      if (__DEV__) {
        console.log(`   - Creating File object #${index + 1} from URI: ${uri}`);
      }
      const file = new File(uri);
      if (__DEV__) {
        console.log(`   - File object created:`, file);
        console.log(`   - File size: ${file.size}, type: ${file.type}, name: ${file.name}`);
      }
      formData.append('images', file);
      if (__DEV__) {
        console.log(`   - Appended to FormData`);
      }
    });

    // Verify FormData contents
    if (__DEV__) {
      console.log('📋 FormData entries:');
      // @ts-ignore - FormData has entries() method
      for (const [key, value] of formData.entries()) {
        console.log(`   - ${key}:`, value);
      }
    }
  }

  return formData;
}
