/**
 * Deal Mapper
 * Transforms between domain Deal objects and Prisma database schema
 * Following 2025 best practices - type-safe, no 'any' types
 */

import { DealStatus } from '../../deals/entities/deal.entity';
import { CreateDealDto } from '../../deals/dto/create-deal.dto';
import { UpdateDealDto } from '../../deals/dto/update-deal.dto';
import {
  PrismaDealCreateInput,
  PrismaDealUpdateInput,
} from '../types/prisma.types';

export class DealMapper {
  /**
   * Transform CreateDealDto to Prisma create input
   */
  static toPrismaCreate(
    dto: CreateDealDto,
    businessId: string,
  ): PrismaDealCreateInput {
    // Calculate discount percentage if not provided
    const discountPercentage =
      dto.discount_percentage ??
      Math.round(
        ((dto.original_price - dto.discounted_price) / dto.original_price) *
          100,
      );

    return {
      business_id: businessId,
      title: dto.title,
      description: dto.description,
      original_price: dto.original_price,
      discounted_price: dto.discounted_price,
      discount_percentage: discountPercentage,
      category: dto.category,
      tags: dto.tags,
      starts_at: dto.starts_at,
      expires_at: dto.expires_at,
      is_flash_deal: dto.is_flash_deal ?? false,
      visibility_radius_km: dto.visibility_radius_km,
      quantity_available: dto.quantity_available,
      quantity_redeemed: 0,
      max_per_user: dto.max_per_user ?? 1,
      terms_conditions: dto.terms_conditions,
      images: dto.images,
      status: DealStatus.ACTIVE,
    };
  }

  /**
   * Transform UpdateDealDto to Prisma update input
   */
  static toPrismaUpdate(dto: UpdateDealDto): PrismaDealUpdateInput {
    const updateData: PrismaDealUpdateInput = {};

    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.description !== undefined)
      updateData.description = dto.description;
    if (dto.original_price !== undefined)
      updateData.original_price = dto.original_price;
    if (dto.discounted_price !== undefined)
      updateData.discounted_price = dto.discounted_price;
    if (dto.discount_percentage !== undefined)
      updateData.discount_percentage = dto.discount_percentage;
    if (dto.category !== undefined) updateData.category = dto.category;
    if (dto.tags !== undefined) updateData.tags = dto.tags;
    if (dto.starts_at !== undefined) updateData.starts_at = dto.starts_at;
    if (dto.expires_at !== undefined) updateData.expires_at = dto.expires_at;
    if (dto.is_flash_deal !== undefined)
      updateData.is_flash_deal = dto.is_flash_deal;
    if (dto.visibility_radius_km !== undefined)
      updateData.visibility_radius_km = dto.visibility_radius_km;
    if (dto.quantity_available !== undefined)
      updateData.quantity_available = dto.quantity_available;
    if (dto.max_per_user !== undefined)
      updateData.max_per_user = dto.max_per_user;
    if (dto.terms_conditions !== undefined)
      updateData.terms_conditions = dto.terms_conditions;
    if (dto.images !== undefined) updateData.images = dto.images;
    if (dto.status !== undefined) updateData.status = dto.status;

    return updateData;
  }

  /**
   * Create status update input
   */
  static createStatusUpdate(status: DealStatus): PrismaDealUpdateInput {
    return { status };
  }

  /**
   * Create quantity redemption update
   */
  static createRedemptionUpdate(
    currentQuantity: number,
  ): PrismaDealUpdateInput {
    return {
      quantity_redeemed: currentQuantity + 1,
    };
  }
}
