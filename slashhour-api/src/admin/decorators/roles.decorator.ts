import { SetMetadata } from '@nestjs/common';
import { admin_role_enum } from '../../../generated/prisma';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: admin_role_enum[]) => SetMetadata(ROLES_KEY, roles);
