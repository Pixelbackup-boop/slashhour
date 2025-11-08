/**
 * Public Decorator
 * Marks a route as publicly accessible (no authentication required)
 * Following 2025 NestJS best practices
 *
 * Usage:
 * @Post('register')
 * @Public()
 * async register(@Body() dto: RegisterDto) {
 *   return this.authService.register(dto);
 * }
 *
 * Note: Requires a global guard to check for this metadata
 * See: auth/guards/jwt-auth.guard.ts
 */

import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
