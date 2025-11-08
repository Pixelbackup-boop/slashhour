/**
 * RequireUserType Decorator
 * Restricts route access to specific user types (consumer, business)
 * Following 2025 NestJS best practices
 *
 * Usage:
 * @Post('deals')
 * @RequireUserType('business')
 * async createDeal(@CurrentUser() user: User, @Body() dto: CreateDealDto) {
 *   return this.dealsService.create(user.id, dto);
 * }
 *
 * Note: Requires a UserTypeGuard to enforce user type restrictions
 */

import { SetMetadata } from '@nestjs/common';

export const USER_TYPE_KEY = 'userType';
export const RequireUserType = (...types: string[]) => SetMetadata(USER_TYPE_KEY, types);

// Deprecated: Use RequireUserType instead
export const UserType = RequireUserType;
