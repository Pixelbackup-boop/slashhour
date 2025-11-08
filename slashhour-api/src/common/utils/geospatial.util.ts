/**
 * Geospatial Utility
 * Provides geolocation calculations following 2025 best practices
 * All distances are in kilometers
 */

export interface GeoPoint {
  lat: number;
  lng: number;
}

export class GeospatialUtil {
  private static readonly EARTH_RADIUS_KM = 6371;

  /**
   * Calculate distance between two points using Haversine formula
   * @param point1 First geographic point
   * @param point2 Second geographic point
   * @returns Distance in kilometers
   */
  static calculateDistance(point1: GeoPoint, point2: GeoPoint): number {
    const dLat = this.deg2rad(point2.lat - point1.lat);
    const dLng = this.deg2rad(point2.lng - point1.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(point1.lat)) *
        Math.cos(this.deg2rad(point2.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return this.EARTH_RADIUS_KM * c;
  }

  /**
   * Check if a point is within a given radius of a center point
   * @param center Center point
   * @param point Point to check
   * @param radiusKm Radius in kilometers
   * @returns true if point is within radius
   */
  static isWithinRadius(
    center: GeoPoint,
    point: GeoPoint,
    radiusKm: number,
  ): boolean {
    return this.calculateDistance(center, point) <= radiusKm;
  }

  /**
   * Convert degrees to radians
   */
  private static deg2rad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Convert radians to degrees
   */
  private static rad2deg(radians: number): number {
    return radians * (180 / Math.PI);
  }

  /**
   * Type guard to check if an object is a valid GeoPoint
   */
  static isValidGeoPoint(obj: unknown): obj is GeoPoint {
    if (typeof obj !== 'object' || obj === null) {
      return false;
    }

    const point = obj as Record<string, unknown>;
    return (
      typeof point.lat === 'number' &&
      typeof point.lng === 'number' &&
      point.lat >= -90 &&
      point.lat <= 90 &&
      point.lng >= -180 &&
      point.lng <= 180
    );
  }

  /**
   * Safely extract GeoPoint from unknown object
   */
  static extractGeoPoint(obj: unknown): GeoPoint | null {
    if (this.isValidGeoPoint(obj)) {
      return obj;
    }
    return null;
  }
}
