/**
 * Sharing Utilities
 * Functions for sharing deals and handling deep links
 * Following 2025 best practices for React Native Share API
 */

import { Share, Platform } from 'react-native';
import { Deal } from '../types/models';

/**
 * Convert a string to a URL-safe slug
 * SEO Best Practice: Use hyphens, lowercase, remove special characters
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generate an SEO-friendly web URL for a deal
 * Format: slashhour.com/deals/{discount}-{title}-{business}-{city}-{id}
 * Example: slashhour.com/deals/50-off-pizza-margherita-joes-pizzeria-new-york-abc123
 */
export function getDealWebUrl(deal: Deal): string {
  const businessName = deal.businesses?.business_name || deal.business?.business_name || 'deal';
  const city = deal.businesses?.city || deal.business?.city || '';

  // Create SEO-friendly slug components
  const discountSlug = `${deal.discount_percentage}-off`;
  const titleSlug = slugify(deal.title);
  const businessSlug = slugify(businessName);
  const citySlug = city ? slugify(city) : '';

  // Combine into SEO-friendly URL (limit length for readability)
  const slugParts = [
    discountSlug,
    titleSlug.substring(0, 30), // Limit title length
    businessSlug.substring(0, 20), // Limit business name length
    citySlug.substring(0, 15), // Limit city length
  ].filter(Boolean); // Remove empty strings

  const slug = slugParts.join('-');

  // Append full UUID at the end for uniqueness and compatibility
  // Note: In a production app with a website, you could use a shorter ID
  // and add a database lookup endpoint to resolve it to the full UUID
  return `https://slashhour.com/deals/${slug}-${deal.id}`;
}

/**
 * Generate a deep link for a deal (for app-to-app sharing)
 */
export function getDealDeepLink(dealId: string): string {
  return `slashhour://deals/${dealId}`;
}

/**
 * Share a deal using the native share dialog
 * 2025 Best Practice: Use SEO-friendly web URLs for universal compatibility
 */
export async function shareDeal(deal: Deal): Promise<void> {
  try {
    const businessName = deal.businesses?.business_name || deal.business?.business_name || 'a local business';
    const webUrl = getDealWebUrl(deal);

    // Create a compelling share message
    const message = Platform.select({
      ios: `Check out this deal: ${deal.title} - ${deal.discount_percentage}% off at ${businessName}!\n\n${webUrl}`,
      android: `🔥 ${deal.title}\n\n${deal.discount_percentage}% OFF at ${businessName}!\n💰 Save $${deal.savings_amount.toFixed(2)}\n\n${webUrl}`,
      default: `${deal.title} - ${deal.discount_percentage}% off at ${businessName}!\n\n${webUrl}`,
    });

    const result = await Share.share(
      {
        message,
        // iOS-specific: URL parameter
        ...(Platform.OS === 'ios' && { url: webUrl }),
        // Android-specific: title parameter
        ...(Platform.OS === 'android' && { title: deal.title }),
      },
      {
        // iOS-specific: subject for email sharing
        subject: `${deal.discount_percentage}% off: ${deal.title}`,
        // Android-specific: dialog title
        dialogTitle: 'Share this deal',
      }
    );

    if (result.action === Share.sharedAction) {
      // Successfully shared
      if (result.activityType) {
        console.log('Deal shared via:', result.activityType);
      } else {
        console.log('Deal shared successfully');
      }

      // TODO: Track share event in analytics
      // trackEvent('deal_shared', { dealId: deal.id, platform: Platform.OS });

      return;
    } else if (result.action === Share.dismissedAction) {
      // User dismissed the share dialog
      console.log('Share dialog dismissed');
    }
  } catch (error) {
    console.error('Error sharing deal:', error);
    throw error;
  }
}

/**
 * Generate an SEO-friendly web URL for a business
 * Format: slashhour.com/businesses/{business-name}-{city}-{id}
 */
export function getBusinessWebUrl(businessId: string, businessName: string, city?: string): string {
  const nameSlug = slugify(businessName);
  const citySlug = city ? slugify(city) : '';

  const slugParts = [nameSlug, citySlug].filter(Boolean);
  const slug = slugParts.join('-');

  // Append full UUID for compatibility
  return `https://slashhour.com/businesses/${slug}-${businessId}`;
}

/**
 * Share a business profile
 */
export async function shareBusiness(businessId: string, businessName: string, city?: string): Promise<void> {
  try {
    const webUrl = getBusinessWebUrl(businessId, businessName, city);

    const message = Platform.select({
      ios: `Check out ${businessName} on Slashhour!\n\n${webUrl}`,
      android: `📍 ${businessName}\n\nDiscover amazing deals from this business on Slashhour!\n\n${webUrl}`,
      default: `Check out ${businessName} on Slashhour!\n\n${webUrl}`,
    });

    await Share.share(
      {
        message,
        ...(Platform.OS === 'ios' && { url: webUrl }),
        ...(Platform.OS === 'android' && { title: businessName }),
      },
      {
        subject: `Check out ${businessName} on Slashhour`,
        dialogTitle: 'Share this business',
      }
    );
  } catch (error) {
    console.error('Error sharing business:', error);
    throw error;
  }
}

/**
 * Share the Slashhour app
 */
export async function shareApp(): Promise<void> {
  try {
    const message = Platform.select({
      ios: 'Discover amazing deals near you with Slashhour!\n\nhttps://slashhour.com',
      android: '🔥 Save money with Slashhour!\n\nDiscover exclusive deals from local businesses near you.\n\nhttps://slashhour.com',
      default: 'Check out Slashhour - discover amazing deals near you!\n\nhttps://slashhour.com',
    });

    await Share.share(
      {
        message,
        ...(Platform.OS === 'ios' && { url: 'https://slashhour.com' }),
        ...(Platform.OS === 'android' && { title: 'Slashhour - Save on Local Deals' }),
      },
      {
        subject: 'Try Slashhour!',
        dialogTitle: 'Share Slashhour',
      }
    );
  } catch (error) {
    console.error('Error sharing app:', error);
    throw error;
  }
}
