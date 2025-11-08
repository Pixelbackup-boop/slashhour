/**
 * Pagination Utility
 * Provides type-safe pagination helpers following 2025 best practices
 */

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export class PaginationUtil {
  /**
   * Calculate skip value for Prisma queries
   */
  static getSkip(params: PaginationParams): number {
    return (params.page - 1) * params.limit;
  }

  /**
   * Create pagination metadata
   */
  static createMeta(params: PaginationParams, total: number): PaginationMeta {
    const totalPages = Math.ceil(total / params.limit);
    return {
      page: params.page,
      limit: params.limit,
      total,
      totalPages,
      hasMore: params.page < totalPages,
    };
  }

  /**
   * Create paginated response with data and metadata
   */
  static createResponse<T>(
    data: T[],
    params: PaginationParams,
    total: number,
  ): PaginatedResponse<T> {
    return {
      data,
      pagination: this.createMeta(params, total),
    };
  }

  /**
   * Validate pagination parameters
   */
  static validateParams(params: PaginationParams): void {
    if (params.page < 1) {
      throw new Error('Page must be greater than 0');
    }
    if (params.limit < 1 || params.limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }
  }
}
