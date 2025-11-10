import { IsString, IsEnum, IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { RedemptionStatus } from './validate-redemption.dto';

/**
 * Query DTO for getting business redemptions
 * Supports filtering by status and pagination
 */
export class BusinessRedemptionQueryDto {
  @IsEnum(RedemptionStatus)
  @IsOptional()
  status?: RedemptionStatus;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  limit?: number = 20;
}

/**
 * Individual redemption item for business view
 */
export interface BusinessRedemptionItemDto {
  id: string;
  status: string;
  original_price: number;
  paid_price: number;
  savings_amount: number;
  redeemed_at: Date;
  validated_at?: Date;
  validated_by?: string;
  deal: {
    id: string;
    title: string;
    description?: string;
    images: any[];
  };
  user: {
    id: string;
    username: string;
    email: string;
  };
}

/**
 * Response DTO for business redemptions list
 */
export interface BusinessRedemptionsResponseDto {
  redemptions: BusinessRedemptionItemDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  summary: {
    total_redemptions: number;
    pending_count: number;
    validated_count: number;
    expired_count: number;
    cancelled_count: number;
  };
}
