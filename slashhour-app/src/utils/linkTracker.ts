/**
 * Link Tracker Utility
 * Tracks link clicks in broadcast messages
 */

import { apiClient } from '../services/api';

export interface LinkClickData {
  broadcastId: string;
  userId: string;
  linkUrl: string;
}

/**
 * Track a link click in a broadcast message
 */
export async function trackLinkClick(data: LinkClickData): Promise<void> {
  try {
    await apiClient.post(
      `/admin/messages/broadcasts/${data.broadcastId}/track-click`,
      {
        user_id: data.userId,
        link_url: data.linkUrl,
      },
      {
        params: { id: data.broadcastId },
      }
    );
  } catch (error) {
    // Silently fail - tracking failure shouldn't break link opening
    if (__DEV__) {
      console.error('Failed to track link click:', error);
    }
  }
}

/**
 * URL Detection Regex
 * Matches http://, https://, and www. URLs
 */
export const URL_REGEX = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;

/**
 * Check if text contains any URLs
 */
export function hasLinks(text: string): boolean {
  URL_REGEX.lastIndex = 0; // Reset regex state
  return URL_REGEX.test(text);
}

/**
 * Extract all URLs from text
 */
export function extractLinks(text: string): string[] {
  const matches = text.match(URL_REGEX);
  if (!matches) return [];

  // Normalize URLs (add https:// to www. links)
  return matches.map((url) =>
    url.startsWith('www.') ? `https://${url}` : url
  );
}
