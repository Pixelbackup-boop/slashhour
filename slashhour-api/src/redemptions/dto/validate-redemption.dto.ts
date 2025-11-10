import { IsString, IsOptional, IsEnum } from 'class-validator';

/**
 * Redemption status enum matching database constraint
 */
export enum RedemptionStatus {
  PENDING = 'pending',
  VALIDATED = 'validated',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

/**
 * DTO for validating a redemption
 * Used by business owners to confirm customer redemptions
 */
export class ValidateRedemptionDto {
  @IsString()
  redemption_id: string;

  @IsString()
  @IsOptional()
  validated_by?: string; // Optional - can be populated from JWT if not provided

  @IsEnum(RedemptionStatus)
  @IsOptional()
  status?: RedemptionStatus; // Optional - defaults to 'validated'
}

/**
 * Response DTO for validation operation
 */
export interface ValidateRedemptionResponseDto {
  success: boolean;
  message: string;
  redemption: {
    id: string;
    status: string;
    validated_at: Date;
    validated_by: string;
  };
}
