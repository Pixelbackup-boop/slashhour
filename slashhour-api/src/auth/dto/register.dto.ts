import { IsEmail, IsString, MinLength, IsOptional, IsPhoneNumber, IsEnum } from 'class-validator';

export enum UserType {
  CONSUMER = 'consumer',
  BUSINESS = 'business',
}

export class RegisterDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEnum(UserType)
  userType: UserType;

  @IsOptional()
  @IsString()
  username?: string;
}
