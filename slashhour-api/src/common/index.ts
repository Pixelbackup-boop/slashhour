/**
 * Common Module Main Export - 2025 Best Practice
 * Single entry point for all common utilities, constants, and helpers
 *
 * Usage:
 *   import { ErrorMessages, DateUtil, UserMapper } from '@/common';
 */

// Constants (enums and error messages)
export * from './constants';

// Decorators - import explicitly to avoid conflicts
export { CurrentUser } from './decorators/current-user.decorator';
export { Public } from './decorators/public.decorator';
export { Roles } from './decorators/roles.decorator';
export { RequireUserType, USER_TYPE_KEY } from './decorators/user-type.decorator';
export type { AuthenticatedUser } from './decorators/current-user.decorator';

// Filters
export * from './filters';

// Interceptors
export * from './interceptors';

// Mappers
export * from './mappers';

// Pipes
export * from './pipes';

// Services
export * from './services/logger.service';

// Types
export * from './types/prisma.types';

// Utilities
export * from './utils';
