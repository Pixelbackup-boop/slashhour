import {
  IsOptional,
  IsString,
  IsEmail,
  IsObject,
  IsNumber,
  IsArray,
  IsEnum,
  Min,
  Max,
  Length,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';

class LocationDto {
  lat: number;
  lng: number;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Length(1, 30)
  username?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsUrl()
  avatar_url?: string;

  @IsOptional()
  @IsObject()
  @Type(() => LocationDto)
  default_location?: LocationDto;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  default_radius_km?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferred_categories?: string[];

  @IsOptional()
  @IsEnum(['en', 'es', 'fr', 'de', 'it', 'pt'])
  language?: string;

  @IsOptional()
  @IsEnum(['USD', 'EUR', 'GBP', 'CAD', 'AUD'])
  currency?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  monthly_savings_goal?: number;
}
