/**
 * User Mapper
 * Transforms between domain User objects and Prisma database schema
 * Following 2025 best practices - type-safe, no 'any' types
 */

import type { User } from '../../users/entities/user.entity';
import { GeoPoint, GeospatialUtil } from '../utils/geospatial.util';
import {
  PrismaUserCreateInput,
  PrismaUserUpdateInput,
} from '../types/prisma.types';

interface PrismaUser {
  id: string;
  name: string | null;
  email?: string | null;
  phone?: string | null;
  username: string;
  user_type: string;
  avatar_url?: string | null;
  default_location?: unknown;
  default_radius_km: number;
  notify_nearby_deals: boolean;
  preferred_categories: string[];
  language: string;
  currency: string;
  timezone: string;
  monthly_savings_goal?: number | null;
  inflation_rate_reference: number;
  email_verified?: boolean;
  phone_verified?: boolean;
  status?: string;
  scheduled_deletion_date?: Date | null;
  created_at: Date;
  updated_at: Date;
  last_active_at: Date;
}

export class UserMapper {
  /**
   * Transform Prisma user to domain User object
   */
  static toDomain(prismaUser: PrismaUser): User {
    // Safely extract default location
    const defaultLocation = GeospatialUtil.extractGeoPoint(
      prismaUser.default_location,
    );

    return {
      id: prismaUser.id,
      name: prismaUser.name ?? undefined,
      email: prismaUser.email ?? undefined,
      phone: prismaUser.phone ?? undefined,
      username: prismaUser.username,
      userType: prismaUser.user_type,
      avatar_url: prismaUser.avatar_url ?? undefined,
      default_location: defaultLocation ?? undefined,
      default_radius_km: prismaUser.default_radius_km,
      preferred_categories: prismaUser.preferred_categories,
      language: prismaUser.language,
      currency: prismaUser.currency,
      timezone: prismaUser.timezone,
      monthly_savings_goal: prismaUser.monthly_savings_goal ?? undefined,
      inflation_rate_reference: prismaUser.inflation_rate_reference,
      email_verified: prismaUser.email_verified ?? false,
      phone_verified: prismaUser.phone_verified ?? false,
      status: prismaUser.status ?? 'active',
      created_at: prismaUser.created_at,
      updated_at: prismaUser.updated_at,
      last_active_at: prismaUser.last_active_at,
    };
  }

  /**
   * Transform domain User to Prisma create input
   */
  static toPrismaCreate(
    user: Partial<User> & { name: string; username: string },
  ): PrismaUserCreateInput {
    return {
      name: user.name,
      email: user.email,
      phone: user.phone,
      username: user.username,
      user_type: user.userType ?? 'consumer',
      avatar_url: user.avatar_url,
      default_location: user.default_location
        ? {
            lat: user.default_location.lat,
            lng: user.default_location.lng,
          }
        : undefined,
    };
  }

  /**
   * Transform domain User to Prisma update input
   */
  static toPrismaUpdate(user: Partial<User>): PrismaUserUpdateInput {
    const updateData: PrismaUserUpdateInput = {};

    if (user.name !== undefined) updateData.name = user.name;
    if (user.email !== undefined) updateData.email = user.email;
    if (user.phone !== undefined) updateData.phone = user.phone;
    if (user.avatar_url !== undefined) updateData.avatar_url = user.avatar_url;
    if (user.email_verified !== undefined)
      updateData.email_verified = user.email_verified;
    if (user.phone_verified !== undefined)
      updateData.phone_verified = user.phone_verified;
    if (user.default_location !== undefined) {
      updateData.default_location = {
        lat: user.default_location.lat,
        lng: user.default_location.lng,
      };
    }

    return updateData;
  }
}
