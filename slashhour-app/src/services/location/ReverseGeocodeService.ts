import * as Location from 'expo-location';

export interface Address {
  street?: string;
  city?: string;
  region?: string; // State/Province
  country?: string;
  postalCode?: string;
  formattedAddress?: string;
}

/**
 * ReverseGeocodeService converts GPS coordinates to human-readable addresses
 * Uses Expo's built-in reverse geocoding (powered by native iOS/Android APIs)
 */
class ReverseGeocodeService {
  /**
   * Convert GPS coordinates to address
   * @param latitude - Latitude coordinate
   * @param longitude - Longitude coordinate
   * @returns Formatted address object
   */
  async getAddressFromCoordinates(
    latitude: number,
    longitude: number
  ): Promise<Address> {
    try {
      console.log('🔍 Reverse geocoding coordinates:', { latitude, longitude });

      // Use Expo's reverse geocoding (uses native platform APIs)
      const results = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (!results || results.length === 0) {
        throw new Error('No address found for these coordinates');
      }

      // Get the first (most accurate) result
      const result = results[0];

      console.log('📍 Reverse geocoding result:', result);

      // Extract address components
      const address: Address = {
        street: this.formatStreet(result),
        city: result.city || result.subregion || undefined,
        region: result.region || undefined, // State/Province
        country: this.getCountryCode(result.isoCountryCode),
        postalCode: result.postalCode || undefined,
        formattedAddress: this.formatFullAddress(result),
      };

      console.log('✅ Formatted address:', address);

      return address;
    } catch (error: any) {
      console.error('❌ Reverse geocoding error:', error);

      if (error.message?.includes('Network')) {
        throw new Error('Network error. Please check your internet connection.');
      }

      throw new Error('Failed to get address from location. Please enter manually.');
    }
  }

  /**
   * Format street address from geocoding result
   */
  private formatStreet(result: Location.LocationGeocodedAddress): string | undefined {
    const parts: string[] = [];

    if (result.streetNumber) parts.push(result.streetNumber);
    if (result.street) parts.push(result.street);

    return parts.length > 0 ? parts.join(' ') : undefined;
  }

  /**
   * Format full address as single string
   */
  private formatFullAddress(result: Location.LocationGeocodedAddress): string {
    const parts: string[] = [];

    // Street
    const street = this.formatStreet(result);
    if (street) parts.push(street);

    // City
    if (result.city) parts.push(result.city);

    // Region (State/Province)
    if (result.region) parts.push(result.region);

    // Postal Code
    if (result.postalCode) parts.push(result.postalCode);

    // Country
    if (result.country) parts.push(result.country);

    return parts.join(', ');
  }

  /**
   * Convert country ISO code to 2-letter code
   * Expo returns country codes like "US", "CA", "GB" etc.
   * @param isoCode - ISO country code (can be string, null, or undefined from Expo Location API)
   * @returns Uppercase 2-letter country code or undefined
   */
  private getCountryCode(isoCode: string | null | undefined): string | undefined {
    if (!isoCode) return undefined;

    // Expo already returns 2-letter ISO codes, but ensure it's uppercase
    return isoCode.toUpperCase();
  }

  /**
   * Validate if coordinates are within reasonable bounds
   */
  isValidCoordinates(latitude: number, longitude: number): boolean {
    return (
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    );
  }
}

export default new ReverseGeocodeService();
