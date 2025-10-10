import { IsString, IsEmail, IsEnum, IsOptional, IsObject, ValidateNested, IsUrl, Length, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { BusinessCategory } from '../entities/business.entity';

class LocationDto {
  lat: number;
  lng: number;
}

class OperatingHoursDto {
  open: string;
  close: string;
  closed?: boolean;
}

export class CreateBusinessDto {
  @IsString()
  @Length(1, 200)
  business_name: string;

  @IsString()
  @Length(1, 200)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase alphanumeric with hyphens',
  })
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(BusinessCategory)
  category: BusinessCategory;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  subcategory?: string;

  @IsObject()
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @IsString()
  address: string;

  @IsString()
  @Length(1, 100)
  city: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  state_province?: string;

  @IsString()
  @Length(2, 2)
  country: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  postal_code?: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsObject()
  hours?: Record<string, OperatingHoursDto>;

  @IsOptional()
  @IsUrl()
  logo_url?: string;

  @IsOptional()
  @IsUrl()
  cover_image_url?: string;
}
