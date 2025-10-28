import {
  IsString,
  IsInt,
  IsOptional,
  Min,
  Max,
  Length,
} from 'class-validator';

export class CreateReviewDto {
  @IsString()
  business_id: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  review_text?: string;
}
