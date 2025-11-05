import { IsString, Length } from 'class-validator';

export class VerifyCodeDto {
  @IsString()
  @Length(6, 6, { message: 'Code must be exactly 6 digits' })
  code: string;
}
