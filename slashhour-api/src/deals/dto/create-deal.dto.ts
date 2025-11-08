import {
  IsString,
  IsNumber,
  IsDate,
  IsBoolean,
  IsOptional,
  IsArray,
  IsInt,
  Min,
  Max,
  Length,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDealDto {
  @IsString()
  @Length(1, 50)
  title: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  original_price: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  discounted_price: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  discount_percentage?: number;

  @IsString()
  @Length(1, 50)
  category: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsDate()
  @Type(() => Date)
  starts_at: Date;

  @IsDate()
  @Type(() => Date)
  expires_at: Date;

  @IsOptional()
  @IsBoolean()
  is_flash_deal?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  visibility_radius_km?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity_available?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  max_per_user?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  terms_conditions?: string[];

  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  images?: Array<{ url: string; caption?: string; order: number }>;
}
