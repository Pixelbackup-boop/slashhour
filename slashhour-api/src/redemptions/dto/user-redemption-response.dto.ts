import { Business } from '../../businesses/entities/business.entity';
import { Deal } from '../../deals/entities/deal.entity';

export interface UserRedemptionDto {
  id: string;
  originalPrice: number;
  paidPrice: number;
  savingsAmount: number;
  dealCategory: string;
  redeemedAt: string;
  deal: {
    id: string;
    title: string;
    description?: string;
    category: string;
    images: any[];
  };
  business: {
    id: string;
    businessName: string;
    category: string;
    address: string;
    city: string;
    country: string;
  };
}

export interface UserRedemptionsResponseDto {
  redemptions: UserRedemptionDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}
