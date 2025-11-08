/**
 * Roles Decorator
 * Specifies which user roles are allowed to access a route
 * Following 2025 NestJS best practices
 *
 * Usage:
 * @Get('admin/stats')
 * @Roles('admin', 'business')
 * async getStats(@CurrentUser() user: User) {
 *   return this.statsService.getStats(user);
 * }
 *
 * Note: Requires a RolesGuard to enforce role-based access control
 */

import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
