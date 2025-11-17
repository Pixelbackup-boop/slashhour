/**
 * Link Detection and Tracking Utility
 * Detects URLs in messages and prepares them for click tracking
 */

export interface DetectedLink {
  url: string;
  position: number; // Position in message text
  clicks: number;
  unique_users: string[];
}

export class LinkDetectorUtil {
  // URL regex pattern - matches http://, https://, and www. URLs
  private static readonly URL_REGEX = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;

  /**
   * Detect all links in a message
   */
  static detectLinks(message: string): DetectedLink[] {
    const links: DetectedLink[] = [];
    let match: RegExpExecArray | null;

    // Reset regex lastIndex
    this.URL_REGEX.lastIndex = 0;

    while ((match = this.URL_REGEX.exec(message)) !== null) {
      const url = match[0];
      // Normalize URL - add https:// if it's just www.
      const normalizedUrl = url.startsWith('www.') ? `https://${url}` : url;

      links.push({
        url: normalizedUrl,
        position: match.index,
        clicks: 0,
        unique_users: [],
      });
    }

    return links;
  }

  /**
   * Check if message contains any links
   */
  static hasLinks(message: string): boolean {
    this.URL_REGEX.lastIndex = 0;
    return this.URL_REGEX.test(message);
  }

  /**
   * Count total links in message
   */
  static countLinks(message: string): number {
    return this.detectLinks(message).length;
  }

  /**
   * Get unique links (remove duplicates)
   */
  static getUniqueLinks(message: string): DetectedLink[] {
    const allLinks = this.detectLinks(message);
    const uniqueUrls = new Map<string, DetectedLink>();

    for (const link of allLinks) {
      if (!uniqueUrls.has(link.url)) {
        uniqueUrls.set(link.url, link);
      }
    }

    return Array.from(uniqueUrls.values());
  }
}
