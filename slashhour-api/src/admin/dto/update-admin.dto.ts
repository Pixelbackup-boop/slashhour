import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { admin_role_enum } from '../../../generated/prisma';

export class UpdateAdminDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(admin_role_enum)
  @IsOptional()
  role?: admin_role_enum;

  @IsString({ each: true })
  @IsOptional()
  permissions?: string[];

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
