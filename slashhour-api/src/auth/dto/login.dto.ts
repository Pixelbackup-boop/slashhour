import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  emailOrPhone: string; // Can be email or phone number

  @IsString()
  @MinLength(8)
  password: string;
}
